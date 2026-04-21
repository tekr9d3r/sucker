import { build } from 'esbuild'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

await rm(join(root, '.vercel/output'), { recursive: true, force: true })
await mkdir(join(root, '.vercel/output/static'), { recursive: true })
await mkdir(join(root, '.vercel/output/functions/index.func'), { recursive: true })

// Static assets from the client build
await cp(join(root, 'dist/client'), join(root, '.vercel/output/static'), { recursive: true })

// Bundle server + Node.js adapter into a single self-contained function file
await build({
  entryPoints: [join(root, 'scripts/vercel-entry.js')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: join(root, '.vercel/output/functions/index.func/index.js'),
  external: ['node:*'],
  logLevel: 'info',
})

// CJS package.json so Node.js doesn't treat index.js as ESM
await writeFile(
  join(root, '.vercel/output/functions/index.func/package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2),
)

await writeFile(
  join(root, '.vercel/output/functions/index.func/.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs20.x',
      handler: 'index.js',
      launcherType: 'Nodejs',
      maxDuration: 30,
    },
    null,
    2,
  ),
)

await writeFile(
  join(root, '.vercel/output/config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index' },
      ],
    },
    null,
    2,
  ),
)

console.log('\n✓ Vercel output ready at .vercel/output/')
