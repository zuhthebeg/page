/* 방카 AI 비서 v2 — 창구 콘솔 + 폰 프레임.
   두 시점을 잇는 상태는 localStorage의 설명 이행 기록 하나다.
   콘솔에서 저장 → 폰(청구)이 읽어 서버로 보냄 → 거절 조항이 기록에 있는지 대조. */

const RECORD_KEY = 'banca:sale_record';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const LEVEL_KO = { high: '위험 높음', mid: '주의', low: '낮음' };
const ODDS_KO = { high: '다툴 실익 큼', mid: '다퉈볼 만함', low: '실익 제한적' };
const ERR_MSG = {
  rate: '요청이 몰렸습니다. 잠시 후 다시 시도해 주세요. (데모라 호출 횟수를 제한해 두었습니다)',
  upstream: 'AI 응답을 받지 못했습니다. 다시 시도해 주세요.',
  too_short: '내용이 너무 짧습니다. 조금 더 입력해 주세요.',
  bad_request: '입력값을 확인해 주세요.',
};

// 마지막 분석 결과 — 후속 질문 컨텍스트로 쓴다
let lastSale = null;
let lastClaim = null;

// ─── KB 인용 칩 — 클릭하면 원문이 펼쳐진다 ───
// 서버가 응답에 첨부한 kb 엔트리(조항·결정례)를 모아두고, 칩 클릭 시 바로 아래 패널 토글
const kbStore = {};
function absorbKb(kb) { Object.assign(kbStore, kb || {}); }
function kbChips(ids, label) {
  const valid = (ids || []).filter((id) => kbStore[id]);
  if (!valid.length) return '';
  return `<div class="kbrow">${label ? `<span class="kblabel">${esc(label)}</span>` : ''}${valid
    .map((id) => `<button type="button" class="kbchip" data-kb="${esc(id)}">${esc(kbStore[id].ref || kbStore[id].no || id)} ▾</button>`)
    .join('')}</div><div class="kbx" hidden></div>`;
}
function kbPanelHtml(e) {
  if (e.no) { // 결정례
    return `<b>${esc(e.no)} — ${esc(e.title)}</b>
      <p><i>사실관계</i> ${esc(e.facts)}</p><p><i>결정</i> ${esc(e.decision)}</p>
      <p class="kbsrc">공개 분쟁조정 사례 유형 기반 재구성 (데모 KB)</p>`;
  }
  const st = e.stat;
  return `<b>${esc(e.ref)} — ${esc(e.title)}</b><p>${esc(e.text)}</p>
    ${st ? `<p class="kbstat">이 조항 관련 부지급 ${st.denials}건 · 이의제기 성공률 ${Math.round(st.success_rate * 100)}% · 판매 시 설명누락률 ${Math.round(st.missing_rate * 100)}%</p>` : ''}
    <p class="kbsrc">표준약관 구조 기반 재구성 발췌 (데모 KB)</p>`;
}
document.addEventListener('click', (ev) => {
  const chip = ev.target.closest('.kbchip');
  if (!chip) return;
  const e = kbStore[chip.dataset.kb];
  const panel = chip.closest('.kbrow')?.nextElementSibling;
  if (!e || !panel || !panel.classList.contains('kbx')) return;
  const already = !panel.hidden && panel.dataset.kbId === chip.dataset.kb;
  panel.hidden = already;
  if (!already) { panel.dataset.kbId = chip.dataset.kb; panel.innerHTML = kbPanelHtml(e); }
});

// ─── 고령층 접근성: 큰 글씨 토글 ───
const BIG_KEY = 'banca:bigtype';
function setBigType(on) {
  document.documentElement.classList.toggle('bigtype', on);
  const b = $('#bigType');
  if (b) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
  try { localStorage.setItem(BIG_KEY, on ? '1' : ''); } catch {}
}
$('#bigType')?.addEventListener('click', () => setBigType(!document.documentElement.classList.contains('bigtype')));
try { if (localStorage.getItem(BIG_KEY)) setBigType(true); } catch {}

// ─── 폰 시계 ───
(function tick() {
  const d = new Date();
  const el = $('#phClock');
  if (el) el.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  setTimeout(tick, 30000);
})();

// ─── 뷰 전환 (세그먼트 + 히어로 CTA) ───
function switchView(v) {
  $$('.seg-btn').forEach((b) => {
    const on = b.dataset.view === v;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', String(on));
  });
  $$('.stage').forEach((s) => s.classList.toggle('on', s.dataset.stage === v));
  if (v === 'claim') renderRecordHint();
  if (v === 'admin') loadAdmin();
}
$$('.seg-btn').forEach((b) => b.addEventListener('click', () => switchView(b.dataset.view)));
$$('[data-goto]').forEach((a) => a.addEventListener('click', () => switchView(a.dataset.goto)));

// ─── 공통 fetch ───
async function api(body) {
  const res = await fetch('/api/banca', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.result) throw new Error(data.error || 'upstream');
  return data.result;
}

// 단계별 로딩 연출 — 실제 처리 단계와 같은 순서의 문구를 순환
function loadingHtml(msgs) {
  return `<div class="loading"><div class="spinner"></div><div class="stage-msg">${esc(msgs[0])}</div></div>`;
}
function cycleLoading(container, msgs) {
  let i = 0;
  return setInterval(() => {
    const el = container.querySelector('.stage-msg');
    if (el) { i = (i + 1) % msgs.length; el.style.opacity = 0; setTimeout(() => { el.textContent = msgs[i]; el.style.opacity = 1; }, 250); }
  }, 2200);
}

function showErr(el, e) {
  el.textContent = ERR_MSG[e.message] || ERR_MSG.upstream;
  el.classList.add('on');
  setTimeout(() => el.classList.remove('on'), 6000);
}

// ═══════════════ 관리자: 약관 리스크 보드 ═══════════════
// 과거 부지급 사유(자유 텍스트→조항 ID 구조화가 끝난 집계)를 조항별로 보여주는 피드백 루프 화면.
let adminLoaded = false;
async function loadAdmin() {
  if (adminLoaded) return;
  const out = $('#adminOut');
  try {
    const r = await api({ mode: 'admin' });
    adminLoaded = true;
    const max = Math.max(...r.stats.map((x) => x.risk_score));
    out.innerHTML = `
      <div class="admin-head">
        <div class="admin-kpis">
          <div class="kpi"><b>${r.total_denials.toLocaleString()}</b><span>누적 부지급 건 (구조화 완료)</span></div>
          <div class="kpi"><b>${r.stats.length}</b><span>부지급 근거 조항</span></div>
          <div class="kpi"><b>${r.stats.filter((x) => x.promoted).length}</b><span>판매 필수 설명 승격</span></div>
        </div>
        <p class="admin-flow">부지급 사유(자유 텍스트) → <b>조항 ID 추출·구조화</b> → 조항별 거절 건수·설명누락률 집계 → <b>위험점수 = 건수 × (1+누락률)</b> → 상위 조항을 창구 콘솔의 판매 필수 설명으로 자동 승격</p>
      </div>
      <table class="admin-table">
        <thead><tr><th>조항</th><th>부지급</th><th>설명누락률</th><th>이의제기 성공률</th><th>위험점수</th><th></th></tr></thead>
        <tbody>
        ${r.stats.map((x) => `
          <tr class="${x.promoted ? 'promoted' : ''}">
            <td><b>${esc(x.ref)}</b><span class="sub2">${esc(x.title)} · ${esc(x.product)}</span></td>
            <td class="num">${x.denials}</td>
            <td class="num">${Math.round(x.missing_rate * 100)}%</td>
            <td class="num">${Math.round(x.success_rate * 100)}%</td>
            <td class="risk"><div class="riskbar"><i style="width:${Math.round((x.risk_score / max) * 100)}%"></i></div><em>${x.risk_score}</em></td>
            <td>${x.promoted ? '<span class="pro-badge">📈 필수 설명 승격</span>' : ''}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <p class="admin-note">설명누락률이 높은 조항일수록 "설명 없이 팔리고 나중에 터지는" 조항입니다. 승격된 조항은 🏦 창구 콘솔 분석에서 해당 상품군일 때 반드시 설명 항목에 포함됩니다. (집계 데이터는 데모용 합성 이력)</p>`;
  } catch (e) {
    out.innerHTML = `<div class="con-empty"><div class="con-empty-ico">📊</div><b>불러오지 못했습니다</b><p>잠시 후 다시 시도해 주세요.</p></div>`;
  }
}

// ═══════════════ 판매: 창구 콘솔 ═══════════════

const SALE_PRESETS = {
  elderly: { age: 68, product: '저축성 보험 (10년 만기)', purpose: '노후 자금', source: '예금 만기 자금', health: '고혈압 투약 5년차', note: '예금이랑 비슷한 걸로 알고 계심' },
  health: { age: 54, product: '건강보험 (질병·상해 특약 포함)', purpose: '질병 대비', source: '매월 소득 중 일부', health: '3년 전 요추 추간판탈출증 진단, 물리치료 받음. 현재 통증 없음', note: '허리는 다 나았으니 안 적어도 되냐고 물어보심' },
  young: { age: 33, product: '변액연금보험', purpose: '목돈 마련', source: '매월 소득 중 일부', health: '', note: '수익률만 보고 결정하려 하심' },
};
$$('.stage-sale .presets button').forEach((b) =>
  b.addEventListener('click', () => {
    const p = SALE_PRESETS[b.dataset.preset];
    $('#s-age').value = p.age; $('#s-product').value = p.product; $('#s-purpose').value = p.purpose;
    $('#s-source').value = p.source; $('#s-health').value = p.health; $('#s-note').value = p.note;
  }),
);

$('#saleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    age: Number($('#s-age').value), product: $('#s-product').value, purpose: $('#s-purpose').value,
    source: $('#s-source').value, health: $('#s-health').value.trim(), note: $('#s-note').value.trim(),
  };
  const btn = $('#saleForm .go'), out = $('#saleOut');
  btn.disabled = true;
  $('#saleErr').classList.remove('on');
  out.innerHTML = loadingHtml(['고객 조건을 약관 조항과 대조하는 중…']);
  const t = cycleLoading(out, ['고객 조건을 약관 조항과 대조하는 중…', '위험 조항 우선순위를 매기는 중…', '창구용 설명 스크립트를 작성하는 중…', '이해도 확인 질문을 만드는 중…']);
  try {
    const r = await api({ mode: 'sale', payload });
    lastSale = { customer_gist: r.customer_gist, risk_level: r.risk_level, explained: r.must_explain.map((m) => ({ title: m.title, clause_type: m.clause_type })) };
    renderSale(r, payload);
  } catch (err) {
    out.innerHTML = '<div class="con-empty"><div class="con-empty-ico">⌘</div><b>분석에 실패했습니다</b><p>다시 시도해 주세요.</p></div>';
    showErr($('#saleErr'), err);
  } finally { clearInterval(t); btn.disabled = false; }
});

function renderSale(r, payload) {
  absorbKb(r.kb);
  const out = $('#saleOut');
  out.innerHTML = `
    <div class="res-head">
      <h4>상담 분석 결과</h4>
      <span class="pill ${esc(r.risk_level)}">불완전판매 ${esc(LEVEL_KO[r.risk_level] || '주의')}</span>
      <span class="gist">${esc(r.customer_gist)}</span>
    </div>
    ${r.risk_note ? `<p class="note">${esc(r.risk_note)}</p>` : ''}

    <div class="blk">
      <h5>① 이 고객에게 반드시 설명할 3가지</h5>
      ${r.must_explain.map((m) => `
        <div class="xcard">
          <h6>${esc(m.title)} <span class="pill ${esc(m.severity)}">${esc(LEVEL_KO[m.severity] || '')}</span> <span class="clause">${esc(m.clause_type)}</span>${m.promoted ? ' <span class="pro-badge">📈 부지급 다발 — 필수 설명 승격</span>' : ''}</h6>
          <p>${esc(m.why_this_customer)}</p>
          <div class="script">${esc(m.script)}</div>
          ${m.ref ? kbChips([m.ref], '근거 조항') : ''}
        </div>`).join('')}
    </div>

    <div class="blk">
      <h5>② 이해도 확인 — 고객이 자기 말로 답해야 합니다</h5>
      <p class="note"><s>"이해하셨죠?" → "네"</s> 는 아무것도 증명하지 않습니다.</p>
      ${r.comprehension_checks.map((c) => `
        <div class="xcard qa">
          <p class="q">"${esc(c.question)}"</p>
          <div class="ans">
            <div class="g"><b>이렇게 답하면 OK</b>${esc(c.good_answer)}</div>
            <div class="r"><b>이렇게 답하면 다시 설명</b>${esc(c.red_flag)}</div>
          </div>
        </div>`).join('')}
    </div>

    <div class="blk">
      <h5>③ 설명 이행 기록</h5>
      <div class="saved">
        <div><b>${esc(r.record_summary || '설명 항목 ' + r.must_explain.length + '건')}</b><br>
        조항: ${r.must_explain.map((m) => esc(m.clause_type || m.title)).join(' · ')}</div>
        <button id="saveRec">기록 저장</button>
      </div>
      <p class="note" style="margin-top:8px">저장하면 몇 년 뒤 이 고객의 청구가 거절됐을 때, 거절 사유가 여기 있었는지 <b>고객 앱이 자동 대조</b>합니다. 📱 모바일 앱 탭에서 확인해 보세요.</p>
    </div>

    <div class="con-chat">
      <h5 style="font-size:12px;font-weight:800;letter-spacing:.06em;color:var(--ink-3);margin:0 0 10px">후속 질문 — 상담 중 바로 물어보기</h5>
      <div class="chat-msgs" id="saleChat"></div>
      <div class="chat-input">
        <input type="text" id="saleQ" maxlength="300" placeholder="예: 고객이 중도인출 되냐고 물으면 뭐라고 답하죠?">
        <button id="saleQGo">➤</button>
      </div>
    </div>`;

  $('#saveRec').addEventListener('click', (ev) => {
    localStorage.setItem(RECORD_KEY, JSON.stringify({
      ts: Date.now(),
      customer: { age: payload.age, product: payload.product, purpose: payload.purpose, health: payload.health },
      summary: r.record_summary,
      explained: r.must_explain.map((m) => ({ title: m.title, clause_type: m.clause_type })),
    }));
    ev.target.textContent = '저장됨 ✓'; ev.target.disabled = true;
    renderRecordHint();
  });

  wireChat('#saleQ', '#saleQGo', '#saleChat', 'sale', () => lastSale);
}

// ═══════════════ 청구: 폰 ═══════════════

const CLAIM_PRESETS = {
  disc: {
    title: '질병입원의료비', date: '2026.08.10', amt: '1,840,000원',
    denial: '피보험자의 이번 입원은 기왕증인 요추 추간판탈출증이 직접적인 원인으로 판단되어 약관상 보상하지 않는 손해에 해당하므로 부지급 처리되었음을 안내드립니다.',
    reason: '허리 통증이 심해져 12일 입원', amount: '100~500만원', joined: '3~5년',
  },
  disclose: {
    title: '암진단비', date: '2026.07.28', amt: '20,000,000원',
    denial: '계약 전 알릴 의무 위반 사실이 확인되어 본 계약은 해지되었으며, 해당 사유와 보험금 지급사유 사이에 인과관계가 인정되므로 청구하신 보험금은 지급되지 않습니다.',
    reason: '위암 진단으로 진단비 청구', amount: '1000만원 이상', joined: '1~3년',
  },
  surrender: {
    title: '중도해지 환급금', date: '2026.08.02', amt: '문의',
    denial: '고객님께서 요청하신 중도해지에 따른 해지환급금은 납입하신 보험료 총액에서 계약체결비용 및 계약관리비용 등을 공제한 금액으로 산출되어, 납입원금에 미치지 못합니다.',
    reason: '급하게 목돈이 필요해 5년 만에 해지', amount: '1000만원 이상', joined: '5년 이상',
  },
  custom: { title: '보험금 청구', date: '', amt: '', denial: '', reason: '', amount: '100~500만원', joined: '3~5년' },
};
let scen = 'disc';

$$('.scen').forEach((b) =>
  b.addEventListener('click', () => {
    $$('.scen').forEach((x) => x.classList.toggle('on', x === b));
    scen = b.dataset.scen;
    renderPhoneIdle();
  }),
);

function loadRecord() {
  try { return JSON.parse(localStorage.getItem(RECORD_KEY) || 'null'); } catch { return null; }
}

function renderRecordHint() {
  const el = $('#recordHint');
  if (!el) return;
  const rec = loadRecord();
  if (!rec) {
    el.innerHTML = `<p class="hint-record"><b>💡 판매 기록 없음</b> — 창구 콘솔에서 분석 후 "기록 저장"을 누르면, 여기 청구 분석이 그 기록과 거절 사유를 자동 대조합니다. 이게 이 서비스의 핵심 연결입니다.</p>`;
  } else {
    const d = new Date(rec.ts);
    el.innerHTML = `<p class="hint-record"><b>🔗 판매 기록 연동됨</b> — ${esc(rec.customer.age)}세 · ${esc(rec.customer.product)} (${d.getMonth() + 1}/${d.getDate()} 저장). 분석 시 함께 대조합니다. <a href="#" id="clearRec">기록 지우기</a></p>`;
    $('#clearRec').addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem(RECORD_KEY); renderRecordHint(); });
  }
}

function renderPhoneIdle() {
  const p = CLAIM_PRESETS[scen];
  const custom = scen === 'custom';
  $('#phContent').innerHTML = `
    <div class="pcard">
      <div class="claim-item">
        <div class="claim-ico">🛡️</div>
        <div><b>${esc(p.title)}</b><span class="sub">${custom ? '통보서 직접 입력' : esc(p.date) + ' 청구 · ' + esc(p.amt)}</span></div>
        <span class="claim-badge">부지급</span>
      </div>
      <div class="timeline">
        <div class="tl-step done">접수</div><div class="tl-line done"></div>
        <div class="tl-step done">심사</div><div class="tl-line done"></div>
        <div class="tl-step bad">부지급</div>
      </div>
      ${custom
        ? `<div class="denial-edit"><textarea id="c-denial" rows="4" placeholder="받으신 부지급 통보서 문구를 그대로 붙여넣어 주세요"></textarea>
           <input type="text" id="c-reason" placeholder="무슨 일로 청구하셨나요? (예: 허리 통증으로 12일 입원)" style="margin-top:8px;font-size:13px">
          </div>`
        : `<div class="denial-box"><span class="denial-label">부지급 사유 안내</span>${esc(p.denial)}</div>`}
      <div class="claim-meta">
        <select id="c-amount">
          ${['100만원 미만', '100~500만원', '500~1000만원', '1000만원 이상'].map((v) => `<option${v === p.amount ? ' selected' : ''}>${v}</option>`).join('')}
        </select>
        <select id="c-joined">
          ${['1년 미만', '1~3년', '3~5년', '5년 이상'].map((v) => `<option${v === p.joined ? ' selected' : ''}>${v}</option>`).join('')}
        </select>
        <input type="number" id="c-age" min="19" max="99" placeholder="나이(선택)" title="65세 이상이면 더 쉬운 말로 설명해 드립니다">
      </div>
    </div>
    <button class="ai-cta" id="claimGo"><span class="spark">✦</span> AI 비서가 뜯어봐 드릴게요</button>
    <p style="font-size:11px;color:var(--ink-3);text-align:center;margin:10px 4px 0">거절이 정당한지가 아니라, 어떻게 하면 받을 수 있는지 알려드립니다</p>`;

  $('#claimGo').addEventListener('click', runClaim);
}

async function runClaim() {
  const p = CLAIM_PRESETS[scen];
  const custom = scen === 'custom';
  const age = Number($('#c-age')?.value) || undefined;
  const payload = {
    denial: custom ? ($('#c-denial')?.value || '').trim() : p.denial,
    reason: custom ? ($('#c-reason')?.value || '').trim() : p.reason,
    amount: $('#c-amount')?.value || p.amount,
    joined: $('#c-joined')?.value || p.joined,
    age,
  };
  if (payload.denial.length < 10) { showErr($('#claimErr'), new Error('too_short')); return; }
  if (age >= 65) setBigType(true); // 고령 입력 시 큰 글씨 자동 적용 (토글로 다시 끌 수 있음)

  const btn = $('#claimGo'); btn.disabled = true;
  const ph = $('#phContent');
  const hold = ph.innerHTML;
  ph.innerHTML = loadingHtml(['부지급 통보서를 읽는 중…']);
  const t = cycleLoading(ph, ['부지급 통보서를 읽는 중…', '약관 조항 유형과 대조하는 중…', '다툴 쟁점을 찾는 중…', '가입 기록과 대조하는 중…', '이의제기 초안을 쓰는 중…']);
  try {
    const r = await api({ mode: 'claim', payload, sale_record: loadRecord() || undefined });
    lastClaim = { denial_gist: r.denial_gist, issue: r.issue, odds: r.odds, had_record: r.had_record, sale_crosscheck: r.sale_crosscheck };
    renderClaim(r, payload);
  } catch (err) {
    ph.innerHTML = hold;
    $('#claimGo')?.addEventListener('click', runClaim);
    showErr($('#claimErr'), err);
  } finally { clearInterval(t); }
}

function renderClaim(r, payload) {
  absorbKb(r.kb);
  // 매칭 조항의 과거 청구 통계 — 조항별 거절 건수·설명누락률·이의제기 성공률
  const statsCard = (r.stats && r.stats.length)
    ? `<div class="psec-label"><i>📊</i>기존 청구 사례 데이터</div>
       <div class="pcard">
         ${r.stats.map((st2) => `
           <div class="stat-row">
             <div class="stat-top"><b>${esc(st2.ref)}</b><span>${esc(st2.title)}</span></div>
             <div class="stat-bar"><i style="width:${Math.round(st2.success_rate * 100)}%"></i></div>
             <div class="stat-meta">같은 조항으로 부지급된 ${st2.denials}건 중 <b>${Math.round(st2.success_rate * 100)}%</b>가 이의제기·분쟁조정으로 일부지급 이상을 받아냈습니다 · 판매 시 설명누락률 ${Math.round(st2.missing_rate * 100)}%</div>
           </div>`).join('')}
         <p class="stat-note">과거 청구 이력 집계(데모용 합성 데이터) — 결과를 보장하지 않습니다</p>
       </div>`
    : '';
  const cross = r.sale_crosscheck
    ? `<div class="pcard crosscheck"><span class="cc-tag">🔗 가입 당시 기록과 대조</span><p>${esc(r.sale_crosscheck)}</p></div>`
    : `<div class="pcard crosscheck none"><span class="cc-tag">가입 기록 없음</span><p>이 브라우저에 저장된 판매 기록이 없어 대조하지 못했습니다. 실제 서비스에서는 은행이 보관한 설명 이행 기록을 자동으로 불러와, 거절 근거 조항을 설명받았는지 확인합니다.</p></div>`;

  $('#phContent').innerHTML = `
    <div class="pcard">
      <div class="claim-item">
        <div class="claim-ico">✦</div>
        <div><b>AI 분석 완료</b><span class="sub">${esc(r.denial_gist)}</span></div>
        <span class="claim-badge" style="background:${r.odds === 'high' ? '#fdecea;color:#c22f27' : r.odds === 'low' ? '#e9f4ee;color:#157a4c' : '#fdf3e2;color:#8a5a06'}">${esc(ODDS_KO[r.odds] || '')}</span>
      </div>
    </div>

    <div class="psec-label"><i>1</i>이게 무슨 뜻인가요</div>
    <div class="pcard"><p>${esc(r.meaning_plain)}</p>${kbChips(r.matched_clauses, '거절 근거 조항')}</div>

    <div class="psec-label"><i>2</i>다툴 쟁점</div>
    <div class="pcard">
      <h6>${esc(r.issue.headline)}</h6>
      <div class="frames">
        <div class="frame x"><b>이렇게 싸우면 집니다</b>${esc(r.issue.wrong_frame)}</div>
        <div class="frame o"><b>여기서 싸워야 합니다</b>${esc(r.issue.right_frame)}</div>
      </div>
      <p style="margin-top:9px">${esc(r.issue.detail)}</p>
      ${kbChips(r.issue.refs, '근거 조항')}
    </div>

    ${statsCard}

    <div class="psec-label"><i>3</i>준비할 서류</div>
    <div class="pcard">
      ${r.evidence.map((e) => `
        <div class="ev-item">
          <div class="ev-ico">📄</div>
          <div><b>${esc(e.doc)}</b><p>${esc(e.why)}</p><p style="color:var(--ink-3)">${esc(e.where)}</p></div>
        </div>`).join('')}
    </div>

    <div class="psec-label"><i>4</i>비슷한 분쟁조정 결정례</div>
    <p class="note" style="font-size:11.5px;margin:0 4px 8px">데모 KB 인용 — 공개 분쟁조정 사례 유형 기반 재구성입니다. 실제 결정례 원문은 금융감독원에서 확인하세요.</p>
    ${r.precedents.map((p2) => `
      <div class="pcard"><h6><span class="prec-no">${esc(p2.no)}</span> ${esc(p2.title)}</h6>
        <p style="color:var(--ink-3)">→ ${esc(p2.takeaway)}</p>
        ${kbChips([p2.kb_id], '결정례 원문')}
      </div>`).join('')}

    <div class="psec-label"><i>5</i>가입 기록 대조</div>
    ${cross}

    <div class="psec-label"><i>6</i>이의제기 초안</div>
    <div class="pcard letter">
      <pre id="letterBody">${esc(r.objection_letter)}</pre>
      <div class="tools"><button id="copyLetter">복사</button><button id="dlLetter">파일로 저장</button></div>
    </div>

    <div class="psec-label"><i>7</i>절차 안내</div>
    <div class="pcard">
      <ul class="steps">
        ${r.steps.map((t) => `<li><b>${esc(t.stage)}</b><div class="meta">${esc(t.where)}${t.when ? ' · ' + esc(t.when) : ''}</div><p>${esc(t.tip)}</p></li>`).join('')}
      </ul>
      ${r.odds_note ? `<div class="odds-note">${esc(r.odds_note)}</div>` : ''}
    </div>

    <div class="chat-zone">
      <div class="psec-label"><i>✦</i>이어서 물어보기</div>
      <div class="chat-msgs" id="claimChat"></div>
      <div class="chat-input">
        <input type="text" id="claimQ" maxlength="300" placeholder="예: 그래서 얼마나 받을 수 있는 건가요?">
        <button id="claimQGo">➤</button>
      </div>
    </div>

    <button class="ai-cta" style="margin-top:16px;background:#fff;color:var(--ink-2);box-shadow:none;border:1px solid var(--line)" id="claimReset">← 청구 내역으로</button>`;

  $('#copyLetter').addEventListener('click', async (ev) => {
    try { await navigator.clipboard.writeText(r.objection_letter); ev.target.textContent = '복사됨 ✓'; setTimeout(() => (ev.target.textContent = '복사'), 1800); }
    catch { ev.target.textContent = '복사 실패'; }
  });
  $('#dlLetter').addEventListener('click', () => {
    const blob = new Blob([r.objection_letter], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = '이의제기_초안.txt'; a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#claimReset').addEventListener('click', renderPhoneIdle);
  wireChat('#claimQ', '#claimQGo', '#claimChat', 'claim', () => lastClaim);
}

// ─── 후속 질문 채팅 (공용) ───
function wireChat(inputSel, btnSel, msgsSel, thread, getCtx) {
  const input = $(inputSel), btn = $(btnSel), msgs = $(msgsSel);
  const send = async () => {
    const q = input.value.trim();
    if (q.length < 2 || btn.disabled) return;
    input.value = '';
    msgs.insertAdjacentHTML('beforeend', `<div class="bub me">${esc(q)}</div>`);
    msgs.insertAdjacentHTML('beforeend', `<div class="bub ai typing">답변 작성 중…</div>`);
    msgs.lastElementChild.scrollIntoView({ block: 'nearest' });
    btn.disabled = true;
    try {
      const r = await api({ mode: 'chat', payload: { question: q, thread }, context: getCtx() || {} });
      msgs.lastElementChild.outerHTML = `<div class="bub ai">${esc(r.answer)}</div>`;
    } catch (e) {
      msgs.lastElementChild.outerHTML = `<div class="bub ai">${esc(ERR_MSG[e.message] || ERR_MSG.upstream)}</div>`;
    } finally {
      btn.disabled = false;
      msgs.lastElementChild.scrollIntoView({ block: 'nearest' });
    }
  };
  btn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
}

// ─── 초기 렌더 ───
renderPhoneIdle();
renderRecordHint();
