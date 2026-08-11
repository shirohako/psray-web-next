import { createRequire } from 'node:module'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const regionsSource = await readFile(join(root, 'app/utils/regions.ts'), 'utf8')
const countryCodes = [...regionsSource.matchAll(/code: '([A-Z]{2})'/g)]
  .map(match => match[1].toLowerCase())

const require = createRequire(import.meta.url)
const iconSetPath = require.resolve('@iconify-json/flag/icons.json')
const iconSet = JSON.parse(await readFile(iconSetPath, 'utf8'))
const outputDir = join(root, 'public/flags/4x3')
const expectedFiles = new Set(countryCodes.map(code => `${code}.svg`))

await mkdir(outputDir, { recursive: true })

// Remove flags no longer present in the canonical PSN region catalogue.
for (const file of await readdir(outputDir)) {
  if (file.endsWith('.svg') && !expectedFiles.has(file)) {
    await rm(join(outputDir, file))
  }
}

for (const code of countryCodes) {
  const icon = iconSet.icons[`${code}-4x3`]
  if (!icon) throw new Error(`Missing flag:${code}-4x3 in @iconify-json/flag`)

  const width = icon.width ?? iconSet.width ?? 4
  const height = icon.height ?? iconSet.height ?? 3
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img">${icon.body}</svg>\n`
  await writeFile(join(outputDir, `${code}.svg`), svg)
}

console.log(`Generated ${countryCodes.length} PSN flags in public/flags/4x3`)
