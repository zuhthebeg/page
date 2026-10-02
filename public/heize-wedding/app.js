'use strict';
const statusEl=document.getElementById('status');let statusTimer;
function notice(message){clearTimeout(statusTimer);statusEl.textContent=message;statusTimer=setTimeout(()=>{statusEl.textContent=''},5000)}
async function copy(text){try{if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');await navigator.clipboard.writeText(text);notice('복사했습니다.')}catch{notice('복사를 허용하지 않는 환경입니다. 표시된 내용을 길게 눌러 직접 복사해 주세요.')}}
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>copy(b.dataset.copy)));
document.getElementById('copy-link').addEventListener('click',()=>copy(location.origin+'/heize-wedding/'));
const shareButton=document.getElementById('share');
if(typeof navigator.share!=='function'){shareButton.textContent='링크 복사';document.getElementById('share-help').textContent='이 브라우저에서는 링크를 복사해 카카오톡에 붙여 넣어 주세요.'}
document.getElementById('share').addEventListener('click',async()=>{const data={title:document.title,url:location.origin+'/heize-wedding/'};if(typeof navigator.share!=='function'){await copy(data.url);return}try{await navigator.share(data)}catch(e){if(e.name!=='AbortError')notice('공유를 열지 못했습니다. 링크 복사를 이용해 주세요.')}});
const day=document.getElementById('countdown');const event=new Date(day.dataset.date);const today=new Date();const start=new Date(today.toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'})+'T00:00:00+09:00');const eventStart=new Date(day.dataset.date.slice(0,10)+'T00:00:00+09:00');const days=Math.round((eventStart-start)/86400000);day.textContent=days>0?'두 사람의 결혼식까지 '+days+'일':days===0?'오늘, 저희 결혼합니다.':'함께해 주신 마음에 감사드립니다.';
let photos=[],current=0,trigger;const dialog=document.getElementById('lightbox'),full=document.getElementById('full-photo');
const loaded=fetch('/heize-wedding/gallery.json',{credentials:'omit'}).then(r=>{if(!r.ok)throw Error('gallery unavailable');return r.json()}).then(x=>{photos=x;return x});loaded.catch(()=>{});
function displayPhoto(){full.src=photos[current];full.alt='상우와 인영의 웨딩 사진 '+(current+1);document.getElementById('photo-count').textContent=(current+1)+' / '+photos.length;full.onerror=()=>notice('사진을 불러오지 못했습니다. 연결 상태를 확인해 주세요.')}
function step(n){if(photos.length){current=(current+n+photos.length)%photos.length;displayPhoto()}}
document.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',async()=>{try{await loaded;current=Number(b.dataset.photo);trigger=b;displayPhoto();dialog.showModal();document.body.style.overflow='hidden'}catch{notice('사진을 불러오지 못했습니다. 원본 청첩장에서 확인해 주세요.')}}));
document.getElementById('close-photo').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow='';trigger?.focus()});
document.getElementById('prev-photo').addEventListener('click',()=>step(-1));document.getElementById('next-photo').addEventListener('click',()=>step(1));dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}if(e.key==='ArrowRight'){e.preventDefault();step(1)}});
let touch;full.addEventListener('touchstart',e=>{touch=e.changedTouches[0].clientX},{passive:true});full.addEventListener('touchend',e=>{if(touch!=null){let dx=e.changedTouches[0].clientX-touch;if(Math.abs(dx)>50)step(dx<0?1:-1);touch=null}},{passive:true});
// Progressive enhancement: readable by default, gentle entrances only when supported.
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});document.querySelectorAll('.invitation .message,.family>h2,.gallery>header,.gallery-grid button,.calendar>h2,.location>header,.accounts>header,.ending>h2').forEach(el=>{el.classList.add('reveal-ready');observer.observe(el)})}

// CSS-only decoration: no timers, RAF loops or pointer interception.
function syncMotionVisibility(){document.documentElement.classList.toggle('motion-paused',document.hidden)}
document.addEventListener('visibilitychange',syncMotionVisibility);syncMotionVisibility();
