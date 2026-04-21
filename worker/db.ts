/// <reference types="@cloudflare/workers-types" />
import type { Match, Player } from '@shared/types'

type MatchRow = {
  id: string
  played_at: string
  winner_1: string
  winner_2: string
  loser_1: string
  loser_2: string
}

const toMatch = (row: MatchRow): Match => ({
  id: row.id,
  playedAt: row.played_at,
  winners: [row.winner_1, row.winner_2],
  losers: [row.loser_1, row.loser_2],
})

export const getPlayers = async (db: D1Database): Promise<Player[]> => {
  const { results } = await db.prepare('SELECT id, name FROM players ORDER BY name').all<Player>()
  return results
}

export const getMatches = async (db: D1Database): Promise<Match[]> => {
  const { results } = await db
    .prepare('SELECT id, played_at, winner_1, winner_2, loser_1, loser_2 FROM matches ORDER BY played_at DESC')
    .all<MatchRow>()
  return results.map(toMatch)
}

export const insertPlayer = async (
  db: D1Database,
  input: { id: string; name: string },
): Promise<Player> => {
  await db.prepare('INSERT INTO players (id, name) VALUES (?, ?)').bind(input.id, input.name).run()
  return { id: input.id, name: input.name }
}

export const insertMatch = async (
  db: D1Database,
  input: { id: string; winners: [string, string]; losers: [string, string] },
): Promise<Match> => {
  const playedAt = new Date().toISOString()
  await db
    .prepare(
      'INSERT INTO matches (id, played_at, winner_1, winner_2, loser_1, loser_2) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(input.id, playedAt, input.winners[0], input.winners[1], input.losers[0], input.losers[1])
    .run()

  return {
    id: input.id,
    playedAt,
    winners: input.winners,
    losers: input.losers,
  }
}
