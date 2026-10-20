'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const {chromium}=require('/home/cocy/.nvm/versions/node/v24.18.0/lib/node_modules/openclaw/node_modules/playwright-core');
const root=path.resolve(__dirname,'..'),slug='harness2-agent-research',base=process.argv[2]||'http://127.0.0.1:8798';
const report={checks:[],widths:[],errors:[],screenshots:0};
function check(ok,label){report.checks.push({label,pass:!!ok});assert.ok(ok,label);}
async function ts(file){const js=stripTypeScriptTypes(fs.readFileSync(path.join(root,file),'utf8'),{mode:'transform'});return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
(async()=>{
 const html=fs.readFileSync(path.join(root,'public',slug,'index.html'),'utf8');
 for(const t of ['11.5','4.5','11.8%p','72.4','77.5','80.8','미검증','partial pass rate','Apache-2.0','1cfe254e8d25','GTM-MV8KQGJF','AdSense: managed via GTM auto-ads'])check(html.includes(t),'Evidence/metadata '+t);
 check(!/Bearer\s|gatewayToken|\/home\/|\/mnt\/|localhost/.test(html),'No private paths or secrets');
 const handler=await ts('functions/[[path]].ts');
 for(const url of ['/'+slug,'/'+slug+'/','/'+slug+'/icon.svg'])check(await handler.onRequest({request:new Request(base+url),env:new Proxy({},{get(){throw Error('unexpected DB access')}}),next:()=> 'static'})==='static','Reserved static '+url);
 const api=await ts('functions/api/sites.ts');const rows=[{slug:'existing',title:'Keep'},{slug,title:'stale duplicate'},{slug:'polyhaven-free-assets-api',title:'stale'}];
 const response=await api.onRequestGet({env:{page_db:{prepare:()=>({all:async()=>({results:rows})})}}});const data=await response.json();
 check(data.sites.filter(x=>x.slug===slug).length===1,'Gallery exactly once');check(data.sites.some(x=>x.slug==='existing'),'Existing row retained');check(data.sites.filter(x=>x.slug==='polyhaven-free-assets-api').length===1,'Previous curated row retained');check(response.headers.get('access-control-allow-origin')==='*','CORS retained');
 for(const f of ['public/index.html','public/llms.txt','public/sitemap.xml'])check(fs.readFileSync(path.join(root,f),'utf8').includes(slug+'/'),'Discovery '+f);
 const browser=await chromium.launch({executablePath:'/home/cocy/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
 try{for(const width of [320,390,768,1280]){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await ctx.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.fulfill({status:200,contentType:'application/javascript',body:''}));
  const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));const response=await p.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
  check(response.status()===200,'HTTP200 '+width);check((await p.title()).includes('Harness² 검증'),'Title '+width);check(await p.locator('h1').count()===1,'Single heading '+width);check(await p.locator('html').getAttribute('lang')==='ko','Korean '+width);
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+width);
  check(await p.locator('link[rel=canonical]').getAttribute('href')==='https://page.cocy.io/'+slug+'/','Canonical '+width);
  check(await p.locator('a[href^="#"]').evaluateAll(a=>a.every(x=>document.getElementById(x.hash.slice(1)))),'Fragments '+width);
  check(JSON.parse(await p.locator('script[type="application/ld+json"]').textContent())['@type']==='TechArticle','JSONLD '+width);
  await p.keyboard.press('Tab');check(await p.locator('.skip').evaluate(e=>e===document.activeElement),'Keyboard skip '+width);await p.keyboard.press('Enter');check(await p.locator('#content').evaluate(e=>e===document.activeElement),'Skip focus '+width);
  await p.locator('summary').focus();await p.keyboard.press('Enter');check(await p.locator('details').evaluate(e=>e.open),'Native disclosure '+width);await p.keyboard.press('Space');check(await p.locator('details').evaluate(e=>!e.open),'Disclosure close '+width);
  await p.addStyleTag({content:'body{font-size:24px}'});check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Enlarged text '+width);report.widths.push(width);await ctx.close();
 }
 const ctx=await browser.newContext({javaScriptEnabled:false});await ctx.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());const p=await ctx.newPage();await p.goto(base+'/'+slug+'/');check((await p.locator('body').innerText()).includes('최종 결론'),'NoJS verdict');await ctx.close();
 }finally{await browser.close();}
 check(report.errors.length===0,'No browser errors');fs.writeFileSync('/home/cocy/.openclaw/workspace/tmp/harness2-research/'+(base.startsWith('https')?'production':'local')+'-verification.json',JSON.stringify(report,null,2));console.log('PASS',report.checks.length,'checks',JSON.stringify(report.widths));
})().catch(e=>{console.error(e);process.exitCode=1;});
