'use strict';
// Local headless Chromium, native keyboard input. No screenshots or model calls.
const {chromium}=require('/home/cocy/.nvm/versions/node/v24.18.0/lib/node_modules/openclaw/node_modules/playwright-core');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const root=path.resolve(__dirname,'..'),base=process.argv[2]||'http://127.0.0.1:8798';
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
const report={checks:[],widths:[],consoleErrors:[],pageErrors:[],blockedExternal:[],screenshots:[],modelRequests:0};
function check(ok,label){report.checks.push({pass:!!ok,label});assert.ok(ok,label);}
(async()=>{
 const html=fs.readFileSync(path.join(root,'public/hyperqwen-4090/index.html'),'utf8');
 check(!/\/home\/|\/mnt\/|COCY-SUPER|3080\s*Ti|Bearer\s|localhost|127\.0\.0\.1|gatewayToken/.test(html),'No private environment/credential text in article');
 check(!/<img[^>]+src=["']https?:|<script[^>]+src=/.test(html),'No hotlinked art or library');
 check(!/fetch\(|XMLHttpRequest|WebSocket|sendBeacon/.test(html),'No application network calls');
 check(html.includes('GTM-MV8KQGJF')&&html.includes('AdSense: managed via GTM auto-ads'),'Existing meta3 convention');
 const handler=fs.readFileSync(path.join(root,'functions/[[path]].ts'),'utf8');
 const js=stripTypeScriptTypes(handler,{mode:'transform'});
 const mod=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
 for(const route of ['/hyperqwen-4090','/hyperqwen-4090/','/hyperqwen-4090/icon.svg']){
  let passed=0;const env=new Proxy({},{get(){throw Error('Static route touched DB/KV');}});
  check(await mod.onRequest({request:new Request(base+route),env,next:()=>{passed++;return 'static';}})==='static'&&passed===1,'Actual reserved route bypass '+route);
 }
 for(const file of ['public/index.html','public/llms.txt','public/sitemap.xml'])check(fs.readFileSync(path.join(root,file),'utf8').includes('hyperqwen-4090/'),'Discovery '+file);
 const apiJS=stripTypeScriptTypes(fs.readFileSync(path.join(root,'functions/api/sites.ts'),'utf8'),{mode:'transform'});
 const api=await import('data:text/javascript;base64,'+Buffer.from(apiJS).toString('base64'));
 async function listing(rows){return api.onRequestGet({env:{page_db:{prepare:()=>({all:async()=>({results:rows})})}}});}
 const response=await listing([{slug:'existing',vertical:'note',title:'Existing page'},{slug:'hyperqwen-4090',title:'Stale duplicate'}]);
 const gallery=await response.json();check(gallery.sites.filter(s=>s.slug==='hyperqwen-4090').length===1,'API has one reserved static article');check(gallery.sites.some(s=>s.slug==='existing'),'API preserves existing DB sites');check(response.headers.get('access-control-allow-origin')==='*','API CORS unchanged');check((await (await listing([])).json()).sites[0].slug==='hyperqwen-4090','Static article discoverable with empty DB result');
 const browser=await chromium.launch({executablePath:'/home/cocy/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
 try{
  for(const width of [320,390,768,1280]){
   const ctx=await browser.newContext({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768,reducedMotion:'reduce'});
   await ctx.route('**/*',r=>{if(new URL(r.request().url()).origin===base)return r.continue();report.blockedExternal.push(r.request().url());return r.fulfill({status:200,contentType:'application/javascript',body:''});});
   const p=await ctx.newPage();p.on('pageerror',e=>report.pageErrors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
   await p.goto(base+'/hyperqwen-4090/',{waitUntil:'networkidle'});
   check((await p.title()).includes('381 tok/s의 조건'),'Title '+width);
   check(await p.locator('h1').count()===1,'One h1 '+width);
   check(await p.locator('html').getAttribute('lang')==='ko','Korean document '+width);
   check(await p.locator('link[rel=canonical]').getAttribute('href')==='https://page.cocy.io/hyperqwen-4090/','Canonical '+width);
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+width);
   const dead=await p.locator('a[href^="#"]').evaluateAll(es=>es.filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash));check(dead.length===0,'All article anchors resolve '+width);
   check(await p.locator('.toc a').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)),'44px navigation targets '+width);
   check(await p.locator('details summary').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)),'44px disclosure targets '+width);
   check(await p.locator('.number').count()===3,'Distinct workload cards '+width);
   check((await p.locator('body').innerText()).includes('GPU 실측 없음'),'Measurement disclosure '+width);
   const schema=JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());check(schema['@type']==='TechArticle'&&schema.inLanguage==='ko','Valid JSON-LD '+width);
   // Real Tab and Enter: skip link first, then focus main. Native disclosure activation.
   await p.reload();await p.keyboard.press('Tab');check(await p.locator('.skip').evaluate(e=>e===document.activeElement),'First Tab reaches skip link '+width);
   check(await p.locator('.skip').evaluate(e=>getComputedStyle(e).outlineStyle!=='none'),'Visible keyboard focus '+width);
   await p.keyboard.press('Enter');check(await p.locator('#content').evaluate(e=>e===document.activeElement),'Enter skips to main '+width);
   for(const id of ['theory','license']){
    const summary=p.locator('#'+id+' summary');await summary.focus();await p.keyboard.press('Enter');check(await p.locator('#'+id).evaluate(e=>e.open),'Enter opens '+id+' '+width);
    check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Open disclosure no overflow '+id+' '+width);
    await p.keyboard.press('Space');check(await p.locator('#'+id).evaluate(e=>!e.open),'Space closes '+id+' '+width);
   }
   await p.locator('.toc a[href="#pilot"]').focus();await p.keyboard.press('Enter');check(new URL(p.url()).hash==='#pilot','Native keyboard section navigation '+width);
   await p.waitForFunction(()=>{const r=document.querySelector('#pilot h2').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;});
   check(await p.locator('#pilot h2').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'Pilot heading visible after navigation '+width);
   await p.addStyleTag({content:'body{font-size:24px}'});check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Enlarged reading text no overflow '+width);
   const xml=await ctx.request.get(base+'/sitemap.xml');const xmlText=await xml.text();check(await p.evaluate(t=>{const d=new DOMParser().parseFromString(t,'application/xml');return !d.querySelector('parsererror')&&[...d.querySelectorAll('loc')].filter(e=>e.textContent==='https://page.cocy.io/hyperqwen-4090/').length===1;},xmlText),'XML parses with one URL '+width);
   report.widths.push({width,touch:width<768,nativeKeyboard:true});await ctx.close();
  }
  for(const width of [390,1280]){
   const ctx=await browser.newContext({viewport:{width,height:900}});
   await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==base)return r.fulfill({status:200,body:''});if(u.pathname==='/api/sites')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(gallery)});if(u.pathname.startsWith('/shots/'))return r.fulfill({status:200,contentType:'image/svg+xml',body:fs.readFileSync(path.join(root,'public/hyperqwen-4090/icon.svg'),'utf8')});return r.continue();});
   const p=await ctx.newPage();await p.goto(base+'/',{waitUntil:'domcontentloaded'});await p.locator('#grid .card').first().waitFor();
   check(await p.locator('#grid a[href="/hyperqwen-4090"]').count()===2,'Normal gallery card '+width);
   await p.locator('#g-search').focus();await p.keyboard.type('HyperQwen');check(await p.locator('#grid .card').count()===1,'Native gallery search '+width);
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Gallery no overflow '+width);
   await p.locator('#grid a[href="/hyperqwen-4090"]').last().focus();await p.keyboard.press('Enter');await p.waitForURL('**/hyperqwen-4090/');check((await p.title()).includes('381 tok/s'),'Keyboard gallery opens article '+width);await ctx.close();
  }
  const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});await ctx.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.fulfill({status:200,body:''}));const p=await ctx.newPage();await p.goto(base+'/hyperqwen-4090/');check((await p.locator('#pilot').innerText()).includes('30–60'),'Article readable without JS');await p.locator('#license summary').click();check(await p.locator('#license').getAttribute('open')!==null,'Native no-JS disclosure');await ctx.close();
  check(report.pageErrors.length===0&&report.consoleErrors.length===0,'Zero page/console errors');
 }finally{await browser.close();const out=process.env.HYPERQWEN_EVIDENCE_DIR||'/home/cocy/.openclaw/workspace/tmp/page-hyperqwen4090-evidence';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({passed:report.checks.length,widths:report.widths,consoleErrors:report.consoleErrors,pageErrors:report.pageErrors,screenshots:report.screenshots},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
