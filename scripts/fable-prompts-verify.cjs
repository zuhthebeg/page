'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const root = path.resolve(__dirname, '..');
const slug = 'fable-52-prompts-check';
const html = fs.readFileSync(path.join(root, 'public', slug, 'index.html'), 'utf8');
let count = 0;
function check(value, label) { assert.ok(value, label); count++; }
async function load(file) {
  const code = stripTypeScriptTypes(fs.readFileSync(path.join(root, file), 'utf8'), { mode: 'transform' });
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
async function main() {
  check(html.includes('<html lang="ko">'), 'Korean document');
  check((html.match(/<h1[ >]/g) || []).length === 1, 'Single main heading');
  check((html.match(/<article class="prompt"/g) || []).length === 6, 'Six reviewed prompts');
  check((html.match(/class="copy-text"/g) || []).length === 6, 'Six safer variants');
  check(html.includes('모델 실행·프롬프트 A/B 실험·실제 저장소 CI 150회 분석은 하지 않았다'), 'Research limitations');
  check(!/Bearer\s|localhost|\/home\/|api[_-]?key\s*=/i.test(html), 'No private data');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
  check(new Set(ids).size === ids.length, 'Unique IDs');
  for (const m of html.matchAll(/href="#([^"]+)"/g)) check(ids.includes(m[1]), 'Fragment ' + m[1]);
  const metadata = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  check(metadata['@type'] === 'TechArticle', 'Structured article');
  check(metadata.url === 'https://page.cocy.io/' + slug + '/', 'Canonical article URL');
  for (const file of ['public/llms.txt', 'public/sitemap.xml']) {
    check(fs.readFileSync(path.join(root, file), 'utf8').includes(slug + '/'), 'Discovery ' + file);
  }
  const handler = await load('functions/[[path]].ts');
  for (const suffix of ['', '/', '/index.html', '/icon.svg']) {
    const result = await handler.onRequest({
      request: new Request('https://page.cocy.io/' + slug + suffix),
      env: new Proxy({}, { get() { throw new Error('Unexpected data-store access'); } }),
      next: () => 'static',
    });
    check(result === 'static', 'Static bypass ' + suffix);
  }
  const api = await load('functions/api/sites.ts');
  const response = await api.onRequestGet({ env: { page_db: { prepare: () => ({ all: async () => ({ results: [
    { slug, title: 'stale duplicate' }, { slug: 'unchanged-page', title: 'keep' },
  ] }) }) } } });
  const { sites } = await response.json();
  check(sites.filter(s => s.slug === slug).length === 1, 'Exactly one gallery entry');
  check(sites.some(s => s.slug === 'unchanged-page'), 'Existing gallery retained');
  check(response.headers.get('access-control-allow-origin') === '*', 'CORS retained');
  const code = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
  new vm.Script(code);
  check(true, 'Inline JavaScript parses');
  function harness({ secure = true, clipboard = true, reject = false } = {}) {
    let copied;
    const status = { textContent: '', scrollIntoView() {} };
    const share = { hidden: true, textContent: '공유 주소 복사', addEventListener(_, fn) { this.click = fn; } };
    const buttons = Array.from({ length: 6 }, (_, i) => ({
      hidden: true, textContent: '문구 복사',
      parentElement: { querySelector: () => ({ textContent: 'prompt ' + i }) },
      addEventListener(_, fn) { this.click = fn; },
    }));
    vm.runInNewContext(code, {
      document: {
        getElementById: id => id === 'share' ? share : status,
        querySelector: () => ({ href: metadata.url }), querySelectorAll: () => buttons,
      },
      navigator: { clipboard: clipboard ? { writeText: async value => {
        if (reject) throw new Error('Denied'); copied = value;
      } } : undefined },
      window: { isSecureContext: secure }, setTimeout: fn => fn(),
    });
    return { status, share, buttons, copied: () => copied };
  }
  const success = harness();
  check(!success.share.hidden && success.buttons.every(b => !b.hidden), 'Clipboard controls enabled');
  await success.share.click();
  check(success.copied() === metadata.url, 'Share copies stable canonical URL');
  for (const [i, button] of success.buttons.entries()) {
    await button.click(); check(success.copied() === 'prompt ' + i, 'Copy only matching prompt ' + i);
  }
  const denied = harness({ reject: true });
  await denied.share.click();
  check(denied.status.textContent.includes('복사 권한이 없습니다'), 'Permission denial fallback');
  for (const options of [{ clipboard: false }, { secure: false }]) {
    const disabled = harness(options);
    check(disabled.share.hidden && disabled.buttons.every(b => b.hidden), 'Unsupported clipboard stays hidden');
  }
  console.log('PASS: ' + count + ' content, routing, gallery, and clipboard unit checks');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
