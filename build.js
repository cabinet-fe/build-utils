import { $ } from 'bun'
import { updateVersion } from './src'
import { resolve } from 'path'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'bun',
  format: 'esm',
  external: ['bun']
})

try {
  await $`tsc  --emitDeclarationOnly --declaration`
  await updateVersion(resolve('./package.json'))
  await $`npm publish --registry http://192.168.31.250:6005`
} catch (error) {
  console.error(error.stdout?.toString())
}
