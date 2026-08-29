import * as Alchemy from 'alchemy'
import * as Cloudflare from 'alchemy/Cloudflare'
import * as Config from 'effect/Config'
import * as Effect from 'effect/Effect'
import * as Redacted from 'effect/Redacted'

/**
 * Only the `prod` stage touches the live `pdl` database and worker. Every
 * other stage gets Alchemy's stage-scoped names, so `alchemy dev` and preview
 * stages can never write to the crew's real scores.
 */
const isProd = Effect.map(Alchemy.Stage, (stage) => stage === 'prod')

export const Database = Cloudflare.D1.Database(
  'Database',
  Effect.map(isProd, (prod) => ({
    ...(prod ? { name: 'pdl' } : {}),
    migrations: './migrations',
  })),
)

/**
 * SPA and API on a single origin. `runWorkerFirst` keeps `/api/*` off the
 * asset handler; everything else falls through to `index.html`.
 *
 * `domain` is deliberately unset — Alchemy leaves custom domains it does not
 * manage alone, so the existing `pdl.einargudni.com` attachment survives.
 *
 * An unset PDL_PASSWORD binds an empty string, which the worker reads as
 * "no auth" — that's what keeps `alchemy dev` usable without a secret.
 */
export const Web = Cloudflare.Website.Vite(
  'Web',
  Effect.map(isProd, (prod) => ({
    ...(prod ? { name: 'pdl' } : {}),
    main: 'worker/index.ts',
    compatibility: { flags: ['nodejs_compat'] },
    env: {
      DB: Database,
      PDL_PASSWORD: Config.redacted('PDL_PASSWORD').pipe(Config.withDefault(Redacted.make(''))),
    },
    assets: {
      notFoundHandling: 'single-page-application',
      runWorkerFirst: ['/api/*'],
    },
  })),
)

/** Binding types for `worker/index.ts`. Never hand-write this. */
export type Env = Cloudflare.InferEnv<typeof Web>

export default Alchemy.Stack(
  'pdl',
  { providers: Cloudflare.providers(), state: Cloudflare.state() },
  Effect.gen(function* () {
    const web = yield* Web
    return { url: web.url }
  }),
)
