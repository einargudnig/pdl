import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { Miniflare } from 'miniflare'

/**
 * In-memory D1 for tests. Reads the real migration files so tests stay in sync
 * with the schema automatically. Each call produces an isolated Miniflare
 * instance — no shared state with dev or other tests.
 */
export const createTestEnv = async (): Promise<{
  env: { DB: D1Database }
  dispose: () => Promise<void>
}> => {
  const mf = new Miniflare({
    modules: true,
    script: 'export default { fetch: () => new Response("") }',
    d1Databases: { DB: 'test' },
  })

  const env = (await mf.getBindings()) as { DB: D1Database }

  const migrationsDir = path.resolve(process.cwd(), 'migrations')
  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort()
  // Migrations are order-dependent — sequential await is the point, not a smell.
  // oxlint-disable no-await-in-loop
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop -- migrations must apply in filename order, not in parallel
    const sql = await readFile(path.join(migrationsDir, file), 'utf8')
    const stripComments = (chunk: string) =>
      chunk
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim()

    const statements = sql
      .split(/;\s*$/m)
      .map(stripComments)
      .filter((s) => s.length > 0)
    for (const stmt of statements) {
      // eslint-disable-next-line no-await-in-loop -- statements within a migration must run in order
      await env.DB.prepare(stmt).run()
    }
  }

  return { env, dispose: () => mf.dispose() }
}
