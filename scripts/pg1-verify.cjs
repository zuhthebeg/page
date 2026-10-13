'use strict';
// Local-only verification. No real model requests, production writes or subagents.
const {chromium}=require('/home/cocy/.nvm/versions/node/v24.18.0/lib/node_modules/openclaw/node_modules/playwright-core');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'tmp/pg1-evidence');fs.mkdirSync(out,{recursive:true});
const base=process.argv[2]||'http://127.0.0.1:8796';
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+$/,'Only a local static server is allowed');
const report={base,checks:[],consoleErrors:[],pageErrors:[],externalRequests:[],matrix:[],screenshots:[]};
function check(value,label){report.checks.push({pass:!!value,label});assert.ok(value,label);}
(async()=>{
 const browser=await chromium.launch({executablePath:'/home/cocy/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   // GTM is required metadata, not simulation traffic. Stub only this known tag.
   await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
   const p=await context.newPage();
   p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});p.on('pageerror',e=>report.pageErrors.push(e.message));
   p.on('request',r=>{if(new URL(r.url()).origin!==base)report.externalRequests.push(r.url());});
   await p.goto(base+'/llm-gateway-anatomy/',{waitUntil:'networkidle'});
   check((await p.title()).includes('LLM 게이트웨이'),'Page title '+width);
   check(await p.locator('#geometry .solid').count()>40,'At least 40 solid machine parts '+width);
   const bounds=await p.locator('#geometry').evaluate(e=>{const b=e.getBBox();return {x:b.x,y:b.y,right:b.x+b.width,bottom:b.y+b.height};});
   check(bounds.x>=0&&bounds.y>=0&&bounds.right<=800&&bounds.bottom<=510,'All static geometry within frame '+width);
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow '+width);
   check(await p.locator('#packet').evaluate(e=>getComputedStyle(e).display==='none'),'No packet before injection '+width);
   for(const model of ['api','cli','local'])for(let bits=0;bits<16;bits++){
    const primaryFail=!!(bits&1),pcOff=!!(bits&2),fallbackFail=!!(bits&4),authFail=!!(bits&8);
    await p.locator('#model').selectOption(model);
    for(const [id,value] of [['primary-fail',primaryFail],['pc-off',pcOff],['fallback-fail',fallbackFail],['auth-fail',authFail]])await p.locator('#'+id).setChecked(value);
    const failed=primaryFail||(pcOff&&model!=='api');
    const status=authFail?'auth-blocked':!failed?'primary-success':pcOff||fallbackFail?'fallback-stopped':'fallback-success';
    const fallback=authFail||!failed?0:1;
    const actual=await p.locator('#machine').evaluate(e=>({status:e.dataset.status,model:e.dataset.model,fallback:Number(e.dataset.fallback)}));
    check(actual.status===status&&actual.model===model&&actual.fallback===fallback,`${width} ${model} bits=${bits}: policy model`);
    check((await p.locator('#policy').innerText()).includes(`시도 ${fallback} / 최대 1회`),`${width} ${model} bits=${bits}: bounded fallback`);
    check(await p.locator('#path-'+model).evaluate(e=>e.classList.contains('on'))===!authFail,`${width} ${model} bits=${bits}: selected rail`);
    await p.locator('#run').click();
    check(await p.locator('#packet').isVisible(),`${width} ${model} bits=${bits}: injected capsule visible`);
    check((await p.locator('#motion-caption').innerText())===(status.includes('success')?'응답 출구 도착':'차단 지점 도착'),`${width} ${model} bits=${bits}: reduced motion instant arrival`);
    check(await p.locator('#route li.active').count()===1,`${width} ${model} bits=${bits}: itinerary marker`);
    report.matrix.push({width,model,primaryFail,pcOff,fallbackFail,authFail,status,fallback});
   }
   await p.locator('#reset').click();
   check(await p.locator('#model').inputValue()==='api'&&await p.locator('input:checked').count()===0,'Reset every control '+width);
   // Real keyboard access: select, four checkboxes, submit, reset; no custom key traps.
   await p.locator('#model').focus();await p.keyboard.press('ArrowDown');
   check(await p.locator('#model').inputValue()==='cli','Keyboard model selection '+width);
   await p.keyboard.press('Tab');check(await p.locator('#primary-fail').evaluate(e=>e===document.activeElement),'Tab reaches primary failure '+width);
   await p.keyboard.press('Space');check(await p.locator('#primary-fail').isChecked(),'Space changes failure '+width);
   for(const id of ['pc-off','fallback-fail','auth-fail']){await p.keyboard.press('Tab');check(await p.locator('#'+id).evaluate(e=>e===document.activeElement),'Tab reaches '+id+' '+width);await p.keyboard.press('Space');check(await p.locator('#'+id).isChecked(),'Space changes '+id+' '+width);}
   await p.keyboard.press('Tab');await p.keyboard.press('Enter');check((await p.locator('#outcome').innerText()).includes('인증'),'Keyboard submit '+width);
   await p.keyboard.press('Tab');await p.keyboard.press('Enter');check(await p.locator('input:checked').count()===0,'Keyboard reset '+width);
   check(await p.locator('[aria-live="polite"]').count()===1,'Polite atomic readout '+width);
   const touch=await p.locator('#controls button,#controls select,#controls .switch').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height};}));
   check(touch.every(r=>r.width>=44&&r.height>=44),'Touch targets at least 44px '+width);
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow after matrix '+width);
   await p.locator('#controls').scrollIntoViewIfNeeded();
   const file=path.join(out,'page-'+width+'.png');await p.screenshot({path:file,fullPage:true});report.screenshots.push(file);
   await p.locator('#model').selectOption('cli');await p.locator('#primary-fail').check();await p.locator('#fallback-fail').check();await p.locator('#run').click();
   await p.screenshot({path:path.join(out,'stopped-'+width+'.png'),fullPage:true});
   check((await p.locator('#machine').getAttribute('data-status'))==='fallback-stopped','Final safety stop '+width);
   if(width===1280){
    await p.locator('#reset').click();
    // Use the same original geometry for a local social preview asset.
    const art=await p.locator('#machine').evaluate(e=>e.innerHTML);
    const pageStyles=await p.locator('style').innerText();
    const styles=pageStyles.slice(pageStyles.indexOf('.machine .top'),pageStyles.indexOf('.figfoot{'))+'[hidden]{display:none}';
    const cover=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><style>${styles}</style><rect width="1200" height="630" fill="#f3efe5"/><text x="58" y="68" fill="#a9431e" font-family="sans-serif" font-size="19">COCY / ANATOMY NOTES 01</text><text x="58" y="143" fill="#302c25" font-family="serif" font-size="48">LLM 게이트웨이 해부실</text><text x="58" y="185" fill="#655e51" font-family="sans-serif" font-size="20">세 갈래 경로, 한 번의 폴백.</text><svg x="375" y="155" width="800" height="455" viewBox="0 0 800 510" class="machine">${art}</svg><text x="58" y="550" fill="#302c25" font-family="sans-serif" font-size="16">page.cocy.io · 요청 하나의 여정</text></svg>`;
    fs.writeFileSync(path.join(root,'public/llm-gateway-anatomy/cover.svg'),cover);
   }
   await context.close();
  }
  // Verify ordinary motion, offscreen pause, visibility resume and live reduced-motion switch.
  const ctx=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'no-preference'});
  await ctx.route('https://www.googletagmanager.com/**',r=>r.fulfill({status:200,body:''}));
  const page=await ctx.newPage();page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
  await page.goto(base+'/llm-gateway-anatomy/');await page.locator('#primary-fail').check();await page.locator('#run').click();
  await page.waitForFunction(()=>document.querySelector('#packet').getAttribute('transform')!==null);
  const before=await page.locator('#packet').getAttribute('transform');await page.waitForTimeout(180);check(await page.locator('#packet').getAttribute('transform')!==before,'Ordinary motion moves capsule');
  await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(120);const paused=await page.locator('#packet').getAttribute('transform');await page.waitForTimeout(180);check(await page.locator('#packet').getAttribute('transform')===paused,'Offscreen motion pauses');
  await page.locator('#machine').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#motion-caption').textContent==='응답 출구 도착',{},{timeout:8000});check(true,'Offscreen motion resumes to fallback exit');
  await page.locator('#run').click();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#motion-caption').textContent==='응답 출구 도착');check(true,'Live reduced motion settles instantly');
  // Save 4x mechanism detail without loading images into chat/model context.
  await page.setViewportSize({width:1280,height:900});await page.locator('#machine').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'mechanism.png'),clip:await page.locator('#machine').boundingBox()});
  const coverPage=await ctx.newPage();await coverPage.setViewportSize({width:1200,height:630});await coverPage.goto(base+'/llm-gateway-anatomy/cover.svg');await coverPage.screenshot({path:path.join(root,'public/llm-gateway-anatomy/cover.png')});
  await ctx.close();
  const detail=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:4,reducedMotion:'reduce'});
  await detail.route('https://www.googletagmanager.com/**',r=>r.fulfill({status:200,body:''}));
  const d=await detail.newPage();await d.goto(base+'/llm-gateway-anatomy/');await d.locator('#machine').screenshot({path:path.join(out,'mechanism-4x.png')});await detail.close();
  const nojs=await browser.newContext({javaScriptEnabled:false});await nojs.route('https://www.googletagmanager.com/**',r=>r.fulfill({status:200,body:''}));const n=await nojs.newPage();await n.goto(base+'/llm-gateway-anatomy/');check(await n.locator('.noscript').isVisible(),'No-JS explanatory fallback visible');await nojs.close();
  check(report.consoleErrors.length===0&&report.pageErrors.length===0,'Console and runtime errors zero');
  check(report.externalRequests.every(u=>u.startsWith('https://www.googletagmanager.com/gtm.js?')),'No simulator external requests; required GTM stubbed');
  const source=fs.readFileSync(path.join(root,'public/llm-gateway-anatomy/index.html'),'utf8');
  check(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(source),'Simulator has no network API');
  check(source.includes('ca-pub-6634731722045607')&&source.includes('GTM-MV8KQGJF')&&source.includes('application/ld+json'),'Meta3 tags present');
  check(fs.readFileSync(path.join(root,'public/index.html'),'utf8').includes('href="/llm-gateway-anatomy/"'),'Home gallery registration');
  check(fs.readFileSync(path.join(root,'public/llms.txt'),'utf8').includes('https://page.cocy.io/llm-gateway-anatomy/'),'llms registration');
  check(fs.readFileSync(path.join(root,'public/sitemap.xml'),'utf8').includes('https://page.cocy.io/llm-gateway-anatomy/'),'Sitemap registration');
 }finally{await browser.close();fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({checks:report.checks.length,matrix:report.matrix.length,consoleErrors:report.consoleErrors,pageErrors:report.pageErrors,externalRequests:[...new Set(report.externalRequests)],screenshots:report.screenshots},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
