import { describe, expect, it } from 'bun:test'
import type { Match, Player, Standing } from '../shared/types'
import { MIN_MATCHES_FOR_RATE, buildStandings, sortStandings, streakFor } from './scoring'

const players: Player[] = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
  { id: 'd', name: 'D' },
]

const match = (
  winners: [string, string],
  losers: [string, string],
  id = crypto.randomUUID(),
): Match => ({
  id,
  playedAt: new Date().toISOString(),
  winners,
  losers,
})

const row = (overrides: Partial<Standing> & { id: string }): Standing => ({
  player: { id: overrides.id, name: overrides.id.toUpperCase() },
  played: 0,
  wins: 0,
  losses: 0,
  points: 0,
  streak: null,
  ...overrides,
})

describe('buildStandings', () => {
  it('starts every player at zero', () => {
    const standings = buildStandings(players, [])
    expect(standings).toHaveLength(4)
    expect(standings.every((s) => s.played === 0 && s.points === 0)).toBe(true)
  })

  it('awards one point per win and counts played/wins/losses', () => {
    const standings = buildStandings(players, [match(['a', 'b'], ['c', 'd'])])
    const byId = Object.fromEntries(standings.map((s) => [s.player.id, s]))
    expect(byId.a).toMatchObject({ played: 1, wins: 1, losses: 0, points: 1 })
    expect(byId.b).toMatchObject({ played: 1, wins: 1, losses: 0, points: 1 })
    expect(byId.c).toMatchObject({ played: 1, wins: 0, losses: 1, points: 0 })
    expect(byId.d).toMatchObject({ played: 1, wins: 0, losses: 1, points: 0 })
  })

  it('ignores unknown player ids in a match (safe on stale data)', () => {
    const standings = buildStandings(players, [match(['a', 'ghost'], ['c', 'd'])])
    const byId = Object.fromEntries(standings.map((s) => [s.player.id, s]))
    expect(byId.a!.played).toBe(1)
    expect(byId.a!.wins).toBe(1)
    expect(standings.some((s) => s.player.id === 'ghost')).toBe(false)
  })

  it('sorts results by points descending', () => {
    const matches = [match(['a', 'b'], ['c', 'd']), match(['a', 'c'], ['b', 'd'])]
    const standings = buildStandings(players, matches)
    expect(standings[0]!.player.id).toBe('a')
    expect(standings[0]!.points).toBe(2)
  })
})

describe('streakFor', () => {
  it('returns null when the player has no matches', () => {
    expect(streakFor('a', [])).toBeNull()
    expect(streakFor('a', [match(['b', 'c'], ['d', 'e'])])).toBeNull()
  })

  it('counts consecutive wins from the newest match backwards', () => {
    // Matches are passed newest-first (matches DB ORDER BY played_at DESC)
    const ms = [
      match(['a', 'b'], ['c', 'd']), // newest, a won
      match(['a', 'c'], ['b', 'd']), // a won
      match(['a', 'd'], ['b', 'c']), // a won
      match(['b', 'c'], ['a', 'd']), // a lost — breaks the streak
    ]
    expect(streakFor('a', ms)).toEqual({ type: 'win', count: 3 })
  })

  it('counts loss streaks', () => {
    const ms = [
      match(['b', 'c'], ['a', 'd']),
      match(['b', 'd'], ['a', 'c']),
      match(['c', 'd'], ['a', 'b']),
      match(['a', 'b'], ['c', 'd']),
    ]
    expect(streakFor('a', ms)).toEqual({ type: 'loss', count: 3 })
  })

  it('ignores matches the player was not in', () => {
    const ms = [
      match(['a', 'b'], ['c', 'd']),
      match(['c', 'd'], ['b', 'z']), // a not in this one — skip, not a break
      match(['a', 'b'], ['c', 'd']),
    ]
    expect(streakFor('a', ms)).toEqual({ type: 'win', count: 2 })
  })
})

describe('sortStandings', () => {
  it('falls back to points when neither has enough matches', () => {
    const rows = [
      row({ id: 'a', played: 2, wins: 1, points: 1 }),
      row({ id: 'b', played: 2, wins: 2, points: 2 }),
    ]
    const [first] = sortStandings(rows)
    if (!first) throw new Error('expected a first row')
    expect(first.player.id).toBe('b')
  })

  it('uses points (not rate) when only one player has crossed the threshold', () => {
    const rows = [
      row({ id: 'rookie', played: 1, wins: 1, points: 1 }),
      row({ id: 'veteran', played: MIN_MATCHES_FOR_RATE, wins: 3, points: 3 }),
    ]
    const [first] = sortStandings(rows)
    if (!first) throw new Error('expected a first row')
    expect(first.player.id).toBe('veteran')
  })

  it('uses win rate when both have crossed the threshold', () => {
    const rows = [
      row({ id: 'steady', played: 10, wins: 8, points: 8 }),
      row({ id: 'grinder', played: 20, wins: 10, points: 10 }),
    ]
    const [first] = sortStandings(rows)
    if (!first) throw new Error('expected a first row')
    expect(first.player.id).toBe('steady')
    expect(first.wins / first.played).toBe(0.8)
  })

  it('breaks win-rate ties with raw points', () => {
    const rows = [
      row({ id: 'few', played: 5, wins: 4, points: 4 }),
      row({ id: 'many', played: 10, wins: 8, points: 8 }),
    ]
    const [first] = sortStandings(rows)
    if (!first) throw new Error('expected a first row')
    expect(first.player.id).toBe('many')
  })

  it('does not mutate the input', () => {
    const rows = [row({ id: 'a', points: 1 }), row({ id: 'b', points: 2 })]
    const before = rows.map((r) => r.player.id)
    sortStandings(rows)
    expect(rows.map((r) => r.player.id)).toEqual(before)
  })
})
