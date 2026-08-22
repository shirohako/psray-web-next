#!/usr/bin/env node
/**
 * Message-catalog guard. Run with `pnpm check:locales` (or in CI).
 *
 * Two checks:
 *
 * 1. **Key parity** — every locale must carry exactly the keys `ja.json` has.
 *    `ja` is the default locale and the source every other file is translated
 *    from, so a key present there and missing elsewhere silently falls back to
 *    Japanese, and a key only present elsewhere is dead weight. Once this
 *    passes reliably, `i18n/i18n.config.ts` can drop `fallbackLocale` and halve
 *    what each visitor downloads.
 *
 * 2. **Usage** — every literal key referenced from `app/` or the shared
 *    Markdown editor package must exist in the merged `ja` catalog. Catches
 *    typos and keys renamed on only one side.
 *
 * Dynamic keys (built at runtime, e.g. `errors.api.${code}`) can't be checked
 * statically; they're resolved through `te()` at the call site, which falls
 * back to the server's own message when we have no copy for a code.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const localesDir = join(root, 'i18n/locales')
const appDir = join(root, 'app')
const markdownEditorDir = join(root, 'packages/markdown-editor/src/runtime/app')
const markdownEditorLocalesDir = join(root, 'packages/markdown-editor/src/runtime/locales')

const SOURCE_LOCALE = 'ja'

/** Flatten a nested catalog into dotted keys. */
function flatten(node, prefix = '', out = new Set()) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') flatten(value, path, out)
    else out.add(path)
  }
  return out
}

const catalogs = new Map()
for (const file of readdirSync(localesDir).filter(f => f.endsWith('.json'))) {
  const locale = file.replace(/\.json$/, '')
  const appMessages = JSON.parse(readFileSync(join(localesDir, file), 'utf8'))
  const packageFile = join(markdownEditorLocalesDir, file)
  const packageMessages = JSON.parse(readFileSync(packageFile, 'utf8'))
  catalogs.set(locale, new Set([
    ...flatten(appMessages),
    ...flatten(packageMessages),
  ]))
}

const source = catalogs.get(SOURCE_LOCALE)
if (!source) {
  console.error(`✗ missing source catalog ${SOURCE_LOCALE}.json`)
  process.exit(1)
}

const problems = []

// 1. Key parity across locales.
for (const [locale, keys] of catalogs) {
  if (locale === SOURCE_LOCALE) continue
  const missing = [...source].filter(k => !keys.has(k)).sort()
  const extra = [...keys].filter(k => !source.has(k)).sort()
  for (const key of missing) problems.push(`${locale}.json is missing  ${key}`)
  for (const key of extra) problems.push(`${locale}.json has unknown  ${key}`)
}

// 2. Keys referenced from the app must exist.
//    Matches `$t('a.b')` / `t('a.b')`, `keypath="a.b"`, and the `…Key: 'a.b'`
//    convention used for labels held in plain data (nav items, board registry…).
const PATTERNS = [
  /(?:^|[^\w$])\$?t\(\s*['"]([a-z][\w]*(?:\.[\w]+)+)['"]/g,
  /keypath="([a-z][\w]*(?:\.[\w]+)+)"/g,
  /\b\w*[Kk]ey:\s*['"]([a-z][\w]*(?:\.[\w]+)+)['"]/g,
]

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (/\.(vue|ts)$/.test(full)) yield full
  }
}

const used = new Map()
for (const file of [...walk(appDir), ...walk(markdownEditorDir)]) {
  const text = readFileSync(file, 'utf8')
  for (const pattern of PATTERNS) {
    for (const [, key] of text.matchAll(pattern)) {
      if (!used.has(key)) used.set(key, relative(root, file))
    }
  }
}

for (const [key, file] of [...used].sort()) {
  if (!source.has(key)) problems.push(`${file} uses undefined key  ${key}`)
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

console.log(
  `✓ ${catalogs.size} locales × ${source.size} keys in sync; `
  + `${used.size} keys referenced from app/ all defined`,
)
