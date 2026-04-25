-- Replace the placeholder seeds (alex/jon/kari) with the actual crew.
-- Einar stays. Add Jói, Bjössi, Gísli.

DELETE FROM players WHERE id IN ('alex', 'jon', 'kari');

INSERT OR IGNORE INTO players (id, name) VALUES
  ('einar',  'Einar'),
  ('joi',    'Jói'),
  ('bjossi', 'Bjössi'),
  ('gisli',  'Gísli');
