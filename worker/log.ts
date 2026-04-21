/// <reference types="@cloudflare/workers-types" />
import type { Context, Next } from 'hono'
import type { RequestLogger } from 'evlog'
import { createWorkersLogger, initWorkersLogger } from 'evlog/workers'

/**
 * Schema of fields we're allowed to set on a wide event.
 * Adding a new field here is the only way to log it.
 */
export type Fields = {
  method: string
  path: string
  status: number
  ms: number
  error: { name: string; message: string } | string
  event:
    | 'health.checked'
    | 'players.listed'
    | 'matches.listed'
    | 'standings.requested'
    | 'match.created'
    | 'player.created'
    | 'validation.failed'
  count: number
  playerCount: number
  matchCount: number
  matchId: string
  playerId: string
  playerName: string
  winners: readonly string[]
  losers: readonly string[]
  reason: string
}

export type Log = RequestLogger<Fields>

initWorkersLogger({
  env: { service: 'pdl' },
})

/**
 * Per-request wide-event logger middleware:
 *   - opens one event per request
 *   - stores the logger on c.var.log
 *   - captures status + latency
 *   - emits once, even on thrown errors
 */
export const logMiddleware = async (
  c: Context<{ Variables: { log: Log } }>,
  next: Next,
): Promise<void> => {
  const log = createWorkersLogger<Fields>(c.req.raw)
  log.set({ method: c.req.method, path: new URL(c.req.url).pathname })
  c.set('log', log)

  const startedAt = Date.now()
  try {
    await next()
    log.set({ status: c.res.status, ms: Date.now() - startedAt })
  } catch (err) {
    log.set({
      status: 500,
      ms: Date.now() - startedAt,
      error: err instanceof Error ? { name: err.name, message: err.message } : String(err),
    })
    throw err
  } finally {
    log.emit()
  }
}
