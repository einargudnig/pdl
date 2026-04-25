import type { Match, Player, Standing, Streak } from '../shared/types'

export const MIN_STREAK = 3

export const pointsPerWin = (): number => 1

/**
 * Computes a player's current streak from their most recent matches.
 * `matches` must be in reverse-chronological order (newest first).
 * Returns null when the player has no matches.
 */
export const streakFor = (playerId: string, matches: Match[]): Streak | null => {
  let type: Streak['type'] | null = null
  let count = 0
  for (const match of matches) {
    const won = match.winners.includes(playerId)
    const lost = match.losers.includes(playerId)
    if (!won && !lost) continue
    const thisType: Streak['type'] = won ? 'win' : 'loss'
    if (type === null) {
      type = thisType
      count = 1
      continue
    }
    if (type === thisType) {
      count += 1
      continue
    }
    break
  }
  return type ? { type, count } : null
}

export const buildStandings = (players: Player[], matches: Match[]): Standing[] => {
  const table = new Map<string, Standing>(
    players.map((player) => [
      player.id,
      { player, played: 0, wins: 0, losses: 0, points: 0, streak: null },
    ]),
  )

  for (const match of matches) {
    const earned = pointsPerWin()

    for (const id of match.winners) {
      const row = table.get(id)
      if (!row) continue
      row.played += 1
      row.wins += 1
      row.points += earned
    }
    for (const id of match.losers) {
      const row = table.get(id)
      if (!row) continue
      row.played += 1
      row.losses += 1
    }
  }

  for (const row of table.values()) {
    row.streak = streakFor(row.player.id, matches)
  }

  return sortStandings([...table.values()])
}

export const MIN_MATCHES_FOR_RATE = 5

export const sortStandings = (rows: Standing[]): Standing[] => {
  return [...rows].sort((a, b) => {
    const aEligible = a.played >= MIN_MATCHES_FOR_RATE
    const bEligible = b.played >= MIN_MATCHES_FOR_RATE

    if (aEligible && bEligible) {
      const aRate = a.wins / a.played
      const bRate = b.wins / b.played
      if (aRate !== bRate) return bRate - aRate
    }

    return b.points - a.points
  })
}
