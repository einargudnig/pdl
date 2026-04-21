import { useCallback, useState } from "react";
import { BottomNav, type TabId } from "./BottomNav";
import { MatchHistory } from "./MatchHistory";
import { MatchLogger } from "./MatchLogger";
import { Pairings } from "./Pairings";
import { PlayerAdder } from "./PlayerAdder";
import { Standings } from "./Standings";
import { runTransition, useMatches, usePlayers, useStandings } from "./hooks";

export const App = () => {
  const { players, refresh: refreshPlayers } = usePlayers();
  const {
    standings,
    loaded: standingsLoaded,
    refresh: refreshStandings,
  } = useStandings();
  const {
    matches,
    loaded: matchesLoaded,
    refresh: refreshMatches,
  } = useMatches();
  const [tab, setTab] = useState<TabId>("scores");

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshPlayers(), refreshStandings(), refreshMatches()]);
  }, [refreshPlayers, refreshStandings, refreshMatches]);

  const changeTab = (next: TabId) => {
    if (next === tab) return;
    runTransition(() => setTab(next));
  };

  return (
    <>
      <main
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "2rem 1.25rem calc(6rem + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <header
          className="pdl-fade-up"
          style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}
        >
          <h1
            style={{ fontSize: "2.5rem", margin: 0, letterSpacing: "-0.05em" }}
          >
            pdl
          </h1>
          <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            weekly padel
          </span>
        </header>

        {tab === "scores" ? (
          <>
            <div className="pdl-fade-up">
              <Standings standings={standings} loaded={standingsLoaded} />
            </div>
            <div className="pdl-fade-up pdl-fade-up-delay-1">
              <MatchLogger players={players} onLogged={refreshAll} />
            </div>
          </>
        ) : (
          <>
            <div className="pdl-fade-up">
              <Pairings players={players} />
            </div>
            <div className="pdl-fade-up pdl-fade-up-delay-1">
              <MatchHistory
                matches={matches}
                players={players}
                loaded={matchesLoaded}
              />
            </div>
            <div className="pdl-fade-up pdl-fade-up-delay-2">
              <PlayerAdder onAdded={refreshAll} />
            </div>
          </>
        )}
      </main>

      <BottomNav active={tab} onChange={changeTab} />
    </>
  );
};
