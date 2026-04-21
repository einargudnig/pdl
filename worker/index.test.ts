import { afterAll, beforeEach, beforeAll, describe, expect, it } from 'vitest'
import app from './index'
import { createTestEnv } from './test-db'

let env: { DB: D1Database }
let dispose: () => Promise<void>

const resetSeeds = async () => {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM matches'),
    env.DB.prepare('DELETE FROM players'),
    env.DB.prepare(
      "INSERT INTO players (id, name) VALUES ('a','A'),('b','B'),('c','C'),('d','D')",
    ),
  ])
}

beforeAll(async () => {
  const created = await createTestEnv()
  env = created.env
  dispose = created.dispose
})

afterAll(async () => {
  await dispose()
})

beforeEach(async () => {
  await resetSeeds()
})

describe('HTTP: GET /api/players', () => {
  it('returns seeded players', async () => {
    const res = await app.request('/api/players', {}, env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { players: Array<{ id: string }> }
    expect(body.players.map((p) => p.id).sort()).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('HTTP: POST /api/players', () => {
  it('creates a player with a generated id and lists it', async () => {
    const res = await app.request(
      '/api/players',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: '  Siggi  ' }),
      },
      env,
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { player: { id: string; name: string } }
    expect(body.player.name).toBe('Siggi')
    expect(body.player.id).toMatch(/^[0-9a-f-]{36}$/)

    const listed = (await (await app.request('/api/players', {}, env)).json()) as {
      players: Array<{ id: string }>
    }
    expect(listed.players.some((p) => p.id === body.player.id)).toBe(true)
  })

  it('rejects empty and over-long names', async () => {
    const empty = await app.request(
      '/api/players',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: '   ' }),
      },
      env,
    )
    expect(empty.status).toBe(400)

    const tooLong = await app.request(
      '/api/players',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'x'.repeat(41) }),
      },
      env,
    )
    expect(tooLong.status).toBe(400)
  })

  it('rejects missing name field', async () => {
    const res = await app.request(
      '/api/players',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      },
      env,
    )
    expect(res.status).toBe(400)
  })
})

describe('HTTP: POST /api/matches validation', () => {
  it('rejects a match with duplicate players', async () => {
    const res = await app.request(
      '/api/matches',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ winners: ['a', 'b'], losers: ['a', 'd'] }),
      },
      env,
    )
    expect(res.status).toBe(400)
  })

  it('rejects a match with wrong team size', async () => {
    const res = await app.request(
      '/api/matches',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ winners: ['a'], losers: ['c', 'd'] }),
      },
      env,
    )
    expect(res.status).toBe(400)
  })
})

describe('HTTP: POST /api/matches → GET /api/standings', () => {
  it('persists a match and updates standings', async () => {
    const post = await app.request(
      '/api/matches',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ winners: ['a', 'b'], losers: ['c', 'd'] }),
      },
      env,
    )
    expect(post.status).toBe(200)

    const res = await app.request('/api/standings', {}, env)
    const { standings } = (await res.json()) as {
      standings: Array<{ player: { id: string }; points: number; wins: number }>
    }

    const byId = Object.fromEntries(standings.map((s) => [s.player.id, s]))
    expect(byId.a.points).toBe(1)
    expect(byId.b.points).toBe(1)
    expect(byId.c.points).toBe(0)
    expect(byId.d.points).toBe(0)
  })
})
