import assert from 'node:assert/strict'
import fs from 'node:fs'

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'))
const pages = JSON.parse(fs.readFileSync('pages.json', 'utf8'))
assert.equal(manifest.name, '拾心')
assert.equal(manifest.vueVersion, '3')
assert.ok(pages.pages.some((page) => page.path === 'pages/settings/settings'))

const iconPaths = []
const collect = (value) => {
  if (typeof value === 'string' && value.endsWith('.png')) iconPaths.push(value)
  else if (value && typeof value === 'object') Object.values(value).forEach(collect)
}
collect(manifest['app-plus'].distribute.icons)
for (const iconPath of iconPaths) assert.ok(fs.existsSync(iconPath), `Missing icon: ${iconPath}`)

for (const file of ['index.html', 'App.vue', 'main.js', 'common/store.js', 'common/github.js', 'pages/index/index.vue', 'pages/editor/editor.vue', 'pages/settings/settings.vue']) {
  assert.ok(fs.existsSync(file), `Missing project file: ${file}`)
}

console.log(`Project check passed (${iconPaths.length} configured icons)`)
