import { useCallback, useState } from 'react'
import { Tabs } from '@base-ui-components/react/tabs'
import { Toast } from '@base-ui-components/react/toast'
import * as stylex from '@stylexjs/stylex'
import { BottomNav, type TabId } from './BottomNav'
import { MatchHistory } from './MatchHistory'
import { MatchLogger } from './MatchLogger'
import { Pairings } from './Pairings'
import { PlayerAdder } from './PlayerAdder'
import { Standings } from './Standings'
import { Toasts } from './Toasts'
import { motion } from './motion.stylex'
import { colors, font, space } from './tokens.stylex'
import { runTransition, useMatches, usePlayers, useStandings } from './hooks'

export const App = () => (
  <Toast.Provider>
    <Shell />
    <Toasts />
  </Toast.Provider>
)

const Shell = () => {
  const { players, refresh: refreshPlayers } = usePlayers()
  const { standings, loaded: standingsLoaded, refresh: refreshStandings } = useStandings()
  const { matches, loaded: matchesLoaded, refresh: refreshMatches } = useMatches()
  const [tab, setTab] = useState<TabId>('scores')

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshPlayers(), refreshStandings(), refreshMatches()])
  }, [refreshPlayers, refreshStandings, refreshMatches])

  const changeTab = (next: Tabs.Tab.Value) => {
    if (next === tab) return
    runTransition(() => setTab(next as TabId))
  }

  return (
    <Tabs.Root value={tab} onValueChange={changeTab}>
      <main {...stylex.props(styles.main)}>
        <header {...stylex.props(motion.fadeUp, styles.header)}>
          <h1 {...stylex.props(styles.title)}>pdl</h1>
          <span {...stylex.props(styles.subtitle)}>weekly padel</span>
        </header>

        <Tabs.Panel value="scores" {...stylex.props(styles.panel)}>
          <div {...stylex.props(motion.fadeUp)}>
            <Standings standings={standings} loaded={standingsLoaded} />
          </div>
          <div {...stylex.props(motion.fadeUp, motion.delay1)}>
            <MatchLogger players={players} onLogged={refreshAll} />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="tools" {...stylex.props(styles.panel)}>
          <div {...stylex.props(motion.fadeUp)}>
            <Pairings players={players} />
          </div>
          <div {...stylex.props(motion.fadeUp, motion.delay1)}>
            <MatchHistory matches={matches} players={players} loaded={matchesLoaded} />
          </div>
          <div {...stylex.props(motion.fadeUp, motion.delay2)}>
            <PlayerAdder onAdded={refreshAll} />
          </div>
        </Tabs.Panel>
      </main>

      <BottomNav />
    </Tabs.Root>
  )
}

const styles = stylex.create({
  main: {
    maxWidth: '480px',
    marginInline: 'auto',
    padding: `${space.xxxl} ${space.xxl} calc(6rem + env(safe-area-inset-bottom, 0px))`,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xxxl,
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: space.lg,
  },
  title: {
    fontSize: font.lg,
    margin: 0,
    letterSpacing: '-0.05em',
  },
  subtitle: {
    color: colors.muted,
    fontSize: font.sm,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xxxl,
  },
})
