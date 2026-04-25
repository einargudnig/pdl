/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { zValidator } from '@hono/zod-validator'
import {
  CreateMatchRequestSchema,
  CreatePlayerRequestSchema,
} from '../shared/types'
import { buildStandings } from './scoring'
import { getMatches, getPlayers, insertMatch, insertPlayer } from './db'
import { logMiddleware, type Log } from './log'

type Bindings = {
  DB: D1Database
  PDL_PASSWORD?: string
}

type Variables = {
  log: Log
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use(logMiddleware)

// Gate all API routes behind basic auth when PDL_PASSWORD is set.
// Unset = open access (so local dev without .dev.vars still works).
app.use('/api/*', async (c, next) => {
  const password = c.env.PDL_PASSWORD
  if (!password) return next()
  return basicAuth({ username: 'pdl', password })(c, next)
})

const routes = app
  .get('/api/health', (c) => {
    c.get('log').set({ event: 'health.checked' })
    return c.json({ status: 'ok' as const, time: new Date().toISOString() })
  })
  .get('/api/players', async (c) => {
    const players = await getPlayers(c.env.DB)
    c.get('log').set({ event: 'players.listed', count: players.length })
    return c.json({ players })
  })
  .get('/api/matches', async (c) => {
    const matches = await getMatches(c.env.DB)
    c.get('log').set({ event: 'matches.listed', count: matches.length })
    return c.json({ matches })
  })
  .get('/api/standings', async (c) => {
    const [players, matches] = await Promise.all([getPlayers(c.env.DB), getMatches(c.env.DB)])
    const standings = buildStandings(players, matches)
    c.get('log').set({
      event: 'standings.requested',
      playerCount: players.length,
      matchCount: matches.length,
    })
    return c.json({ standings })
  })
  .post('/api/players', zValidator('json', CreatePlayerRequestSchema), async (c) => {
    const { name } = c.req.valid('json')
    const player = await insertPlayer(c.env.DB, { id: crypto.randomUUID(), name })
    c.get('log').set({ event: 'player.created', playerId: player.id, playerName: player.name })
    return c.json({ player })
  })
  .post('/api/matches', zValidator('json', CreateMatchRequestSchema), async (c) => {
    const { winners, losers } = c.req.valid('json')
    const match = await insertMatch(c.env.DB, {
      id: crypto.randomUUID(),
      winners,
      losers,
    })
    c.get('log').set({
      event: 'match.created',
      matchId: match.id,
      winners: match.winners,
      losers: match.losers,
    })
    return c.json({ match })
  })

export type AppType = typeof routes

export default app
