import { useCallback, useEffect, useState } from 'react'
import type { Match, Player, Standing } from '@shared/types'
import { api } from './client'

const runTransition = (apply: () => void) => {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    document.startViewTransition(apply)
    return
  }
  apply()
}

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [loaded, setLoaded] = useState(false)
  const refresh = useCallback(async () => {
    const res = await api.api.players.$get()
    const data = await res.json()
    setPlayers(data.players)
    setLoaded(true)
  }, [])
  useEffect(() => {
    // setState runs after an await, so no synchronous cascading render.
    // oxlint-disable-next-line react/set-state-in-effect
    refresh()
  }, [refresh])
  return { players, loaded, refresh }
}

export const useStandings = () => {
  const [standings, setStandings] = useState<Standing[]>([])
  const [loaded, setLoaded] = useState(false)
  const refresh = useCallback(async () => {
    const res = await api.api.standings.$get()
    const data = await res.json()
    runTransition(() => {
      setStandings(data.standings)
      setLoaded(true)
    })
  }, [])
  useEffect(() => {
    refresh()
  }, [refresh])
  return { standings, loaded, refresh }
}

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([])
  const [loaded, setLoaded] = useState(false)
  const refresh = useCallback(async () => {
    const res = await api.api.matches.$get()
    const data = await res.json()
    setMatches(data.matches)
    setLoaded(true)
  }, [])
  useEffect(() => {
    // setState runs after an await, so no synchronous cascading render.
    // oxlint-disable-next-line react/set-state-in-effect
    refresh()
  }, [refresh])
  return { matches, loaded, refresh }
}

type ZodError = {
  error?: { issues?: Array<{ message: string }> }
  message?: string
}

const errorMessageFrom = (body: unknown, fallback: string): string => {
  const b = body as ZodError
  return b?.error?.issues?.[0]?.message ?? b?.message ?? fallback
}

export const addPlayer = async (name: string): Promise<Player | { error: string }> => {
  try {
    const res = await api.api.players.$post({ json: { name } })
    const text = await res.text()
    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      return { error: `Unexpected response (${res.status}). Try reloading.` }
    }
    if (!res.ok)
      return {
        error: errorMessageFrom(body, `Request failed (${res.status})`),
      }
    return (body as { player: Player }).player
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error.' }
  }
}

export const recordMatch = async (
  winners: [string, string],
  losers: [string, string],
): Promise<{ ok: true } | { ok: false; error: string }> => {
  try {
    const res = await api.api.matches.$post({ json: { winners, losers } })
    if (!res.ok) {
      const text = await res.text()
      let body: unknown = null
      try {
        body = JSON.parse(text)
      } catch {
        /* non-json */
      }
      return {
        ok: false,
        error: errorMessageFrom(body, `Request failed (${res.status})`),
      }
    }
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
    }
  }
}

export { runTransition }
