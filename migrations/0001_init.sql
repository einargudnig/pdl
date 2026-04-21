-- Padel is always 2v2, so we denormalize: 4 player-id columns per match.
-- This is simpler and faster than a join table for our fixed team size.

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  played_at TEXT NOT NULL DEFAULT (datetime('now')),
  winner_1 TEXT NOT NULL REFERENCES players(id),
  winner_2 TEXT NOT NULL REFERENCES players(id),
  loser_1 TEXT NOT NULL REFERENCES players(id),
  loser_2 TEXT NOT NULL REFERENCES players(id)
);

CREATE INDEX IF NOT EXISTS matches_played_at_idx ON matches(played_at DESC);
