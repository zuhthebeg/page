// Regression proof: no screenshots, private content logs, actual outbound navigation or app launches.
'use strict';
const {chromium}=require('/home/cocy/.nvm/versions/node/v24.18.0/lib/node_modules/openclaw/node_modules/playwright-core');
const fs=require('fs'),assert=require('node:assert/strict');
const base=process.argv[2]||'http://127.0.0.1:8793/heize-wedding/';
const report={base,screenshots:0,geometry:[],checks:[],failures:[],navigation:[]};
function check(ok,label){report.checks.push({label,pass:!!ok});if(!ok)report.failures.push(label)}
const name='파밀리아채플',lat='37.5639695',lon='126.9862543';
const route='https://map.kakao.com/link/to/'+encodeURIComponent(name)+','+lat+','+lon;
(async()=>{
 const browser=await chromium.launch({executablePath:'/home/cocy/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({reducedMotion:'reduce'}),p=await context.newPage();
  let errors=0,thirdParty=0; p.on('pageerror',()=>errors++);p.on('console',m=>{if(m.type()==='error')errors++});
  p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)thirdParty++});
  await p.goto(base,{waitUntil:'networkidle'});
  check(await p.locator('a[href*="mcard.barunsoncard.com"]').count()===0,'No original invitation fallback');
  check(await p.locator('[data-navigation]').count()===1,'Exactly one remaining navigation destination');
  check(await p.locator('[data-navigation="tmap"],#navigation-help,.privacy').count()===0,'Removed TMAP, navigation explanation and privacy UI');
  check(!/티맵|TMAP|검색에 등록|전달받은 링크와 개인정보/.test(await p.locator('body').innerText()),'Removed visible cleanup wording');
  for(const width of [325,375,430]){
   await p.setViewportSize({width,height:812});
   await p.locator('.gallery-grid').evaluate(async e=>{for(const img of e.querySelectorAll('img')){img.loading='eager';await img.decode()}});
   const result=await p.locator('.gallery-grid').evaluate(e=>({gap:parseFloat(getComputedStyle(e).gap),rects:[...e.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect(),i=b.querySelector('img');return {top:r.top,left:r.left,width:r.width,height:r.height,imageFit:getComputedStyle(i).objectFit,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,margin:getComputedStyle(b).margin}})}));
   report.geometry.push({width,...result});
   for(let i=0;i<12;i+=2){const a=result.rects[i],b=result.rects[i+1];check(Math.abs(a.top-b.top)<.6&&Math.abs(a.width-b.width)<.6&&Math.abs(a.height-b.height)<.6&&Math.abs(b.left-a.left-a.width-result.gap)<.6,`${width}px pair ${i/2+1}: equal top/width/height/gap`)}
   check(result.rects.every(r=>r.imageFit==='cover'&&r.naturalWidth>0&&r.margin==='0px'),'Uniform cover thumbnails; decoded originals');
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px no overflow`);
  }
  await context.close();
  // One clearly labelled web destination; never claim native app support.
  for(const platform of [{name:'desktop',userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36'},{name:'android',userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/145.0.0.0 Mobile Safari/537.36'},{name:'ios',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'}]){
   const c=await browser.newContext({userAgent:platform.userAgent,reducedMotion:'reduce'}),page=await c.newPage();
   await c.addInitScript(()=>document.addEventListener('click',e=>{const a=e.target.closest('a[data-navigation]');if(a){window.navAttempt={href:a.href,gesture:e.isTrusted,label:a.textContent.trim()};e.preventDefault()}},true));
   page.on('pageerror',()=>errors++);page.on('console',m=>{if(m.type()==='error')errors++});
   let external=0;c.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external++});
   await page.goto(base,{waitUntil:'networkidle'});
   check(await page.evaluate(()=>window.navAttempt===undefined),platform.name+': no automatic navigation');
   for(const service of ['kakao']){
    const a=page.locator(`[data-navigation="${service}"]`);
    check(await a.count()===1,platform.name+': separate '+service+' destination button');
    if(await a.count()!==1)continue;
    check(await a.getAttribute('href')===route,platform.name+': official encoded venue URL '+service);
    check(await a.innerText()==='카카오맵 길찾기',platform.name+': exact web-map label '+service);
    await a.click();const attempted=await page.evaluate(()=>window.navAttempt);
    check(attempted.gesture&&attempted.href===route,platform.name+': trusted user-gesture route '+service);
    report.navigation.push({platform:platform.name,service,...attempted});
   }
   check(external===0,platform.name+': no SDK/ads/store/actual external navigation');await c.close();
  }
  check(errors===0&&thirdParty===0,'Runtime errors zero; no third-party requests');
 }finally{await browser.close()}
 fs.writeFileSync('/home/cocy/.openclaw/workspace/tmp/heize-source/nav-gallery-'+(base.startsWith('https:')?'production':'local')+'.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({base,checks:report.checks.length,failures:report.failures,geometryWidths:report.geometry.map(x=>x.width),navigationAttempts:report.navigation.length,screenshots:0},null,2));
 assert.equal(report.failures.length,0,'Navigation/gallery regression checks');
})().catch(e=>{console.error(e.message.split('\n')[0]);process.exit(1)});
