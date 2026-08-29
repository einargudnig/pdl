# pdl — agent guide

Mobile-first PWA for tracking the weekly padel crew. One Cloudflare Worker serves
both the React SPA and the `/api/*` routes; data lives in D1.

## Commands

|                   |                                                             |
| ----------------- | ----------------------------------------------------------- |
| `bun install`     | install (bun 1.4, `trustedDependencies` covers `@swc/core`) |
| `bun run dev`     | `alchemy dev` — real workerd + local D1 on :1337            |
| `bun run dev:web` | plain `vite` — UI only, no API. Prefer `dev`.               |
| `bun run check`   | **the gate**: format → lint → typecheck → test → build      |
| `bun test`        | worker + scoring tests (bun's runner, real Miniflare D1)    |
| `bun run plan`    | preview prod infra changes without applying                 |
| `bun run deploy`  | build and deploy to the `prod` stage                        |

`bun run check` is the whole truth. If it is green, the change is good; if it is
red, fix it rather than working around it. Never add a lint disable without a
one-line reason on the preceding line.

## Layout

```
alchemy.run.ts        infra as TypeScript (D1 + the Worker). Exports `Env`.
worker/index.ts       Hono app; the `routes` chain's type is exported as AppType
worker/db.ts          the only place SQL is written
worker/scoring.ts     standings, streaks, sort order — pure, fully tested
shared/types.ts       Zod schemas; both sides import these
src/client.ts         hc<AppType>() — the typed RPC client
src/hooks.ts          data fetching + mutations, the only place src/ talks to the API
src/tokens.stylex.ts  every colour, space, radius and font size
src/motion.stylex.ts  keyframes and the shared button reset
```

Request path: `src/hooks.ts` → `hc<AppType>` → `worker/index.ts` → `worker/db.ts` → D1.

## Invariants

**Never hand-write a binding type.** `Env` comes from
`Cloudflare.InferEnv<typeof Web>` in `alchemy.run.ts`. Add a binding by adding it
to `env: {}` there; the worker's types follow automatically. There is no
`wrangler.toml`.

**Add an endpoint by extending the `routes` chain** in `worker/index.ts`. The
chain's type _is_ `AppType`, which _is_ the client's type — breaking the chain
into separate `app.get(...)` statements silently drops routes from the client.
Validate input with `zValidator('json', SomeSchema)` and a schema from
`shared/types.ts`.

**Never write a colour, spacing value or radius as a literal.** Import from
`src/tokens.stylex.ts`. A typo there is a compile error; a typo in a string is a
silently broken style.

**Styling is StyleX only.** `stylex.create` at the bottom of the file,
`{...stylex.props(styles.x)}` on the element. Conditional styles are extra
arguments (`stylex.props(styles.base, isOn && styles.on)`) — not string
concatenation. StyleX compiles static values only: anything interpolated at
runtime (`viewTransitionName` per row) stays an inline `style`. `src/index.css`
holds only the reset, document chrome and `::view-transition-*` rules; the
`@stylex;` marker is where compiled output lands.

**Errors surface as toasts.** `Toast.useToastManager().add({ title, description,
type: 'error' })`. Don't add per-component error paragraphs.

**Components come from Base UI** (`@base-ui-components/react/*`) when a
primitive exists — Tabs, Field, Toast are already wired. Style them with StyleX
and target their state via data attributes, e.g. `':is([data-active])'`.

## Gotchas

- `noUncheckedIndexedAccess` is on in every tsconfig. Indexing an array or record
  yields `T | undefined` — narrow it, don't cast it away.
- The SPA and the API share an origin, with the default asset-first routing:
  `/api/*` matches no static asset so it falls through to the worker. **Do not add
  `assets.runWorkerFirst`** — scoping it to `['/api/*']` routes everything else,
  including Vite's `/__vite_module_runner/init` upgrade, through the asset
  handler, and `alchemy dev` then dies with `Expected 101 status code`. The
  service worker's `navigateFallbackDenylist` is what keeps `/api/*` off the
  offline fallback.
- Deleting `.alchemy/` wipes the local D1 file but not the state store's record
  of it, so the next `alchemy dev` reports `[Database] noop (local)` and leaves
  you with an empty database (`no such table: players`). Recover with
  `bunx alchemy dev --force`.
- StyleX's `useCssPlaceholder` only fills the `@stylex;` marker in
  `src/index.css` at build time — `vite.config.ts` enables it for `command ===
'build'` only. Turning it on for dev renders the whole app unstyled.
- **Stages matter.** `prod` is the only stage that uses the live `pdl` database
  and worker; every other stage gets its own stage-scoped copies, so `alchemy dev`
  cannot write to the crew's real scores. `bun run plan` / `bun run deploy` target
  `prod` explicitly — always read the plan diff before deploying.
- `PDL_PASSWORD` is **required** for the prod stage — `bun run plan` / `deploy`
  fail with `ConfigError ... at ["PDL_PASSWORD"]` without it. Put it in `.env`
  (gitignored). Other stages default it to empty, which the worker reads as
  "no auth". This is deliberate: a missing secret must never silently ship the
  crew's app wide open.
- The first prod deploy after the wrangler → Alchemy migration needs
  `bunx alchemy deploy --stage prod --adopt` to take over the pre-existing `pdl`
  worker into Alchemy's state store. Plain `bun run deploy` after that.
- Migrations in `migrations/` are applied by Alchemy on deploy, and replayed from
  disk by `worker/test-db.ts` in tests — so tests always match the real schema.
- Pre-release dependencies: `alchemy` (2.x beta), `effect` (4.x rc),
  `@base-ui-components/react` (1.0 rc). Expect breaking changes on upgrade.
