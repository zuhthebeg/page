/* 방카 AI 비서 — 클라이언트
   두 시점을 잇는 유일한 상태는 localStorage의 설명 이행 기록 하나다.
   판매 탭에서 저장 → 청구 탭이 읽어서 서버로 함께 보냄 → 거절 조항이 기록에 있는지 대조. */

const RECORD_KEY = 'banca:sale_record';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const LEVEL_KO = { high: '위험 높음', mid: '주의', low: '낮음' };
const ODDS_KO = { high: '다툴 실익 큼', mid: '다퉈볼 만함', low: '실익 제한적' };

// ─── 탭 ───
$$('.tabs button').forEach((b) => {
  b.addEventListener('click', () => {
    $$('.tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $$('.panel').forEach((p) => p.classList.toggle('on', p.dataset.panel === b.dataset.tab));
    if (b.dataset.tab === 'claim') renderRecordHint();
    window.scrollTo({ top: $('.tabs').offsetTop - 12, behavior: 'smooth' });
  });
});

// ─── 프리셋 ───
const SALE_PRESETS = {
  elderly: { age: 68, product: '저축성 보험 (10년 만기)', purpose: '노후 자금', source: '예금 만기 자금', health: '고혈압 투약 5년차', note: '예금이랑 비슷한 걸로 알고 계심' },
  health: { age: 54, product: '건강보험 (질병·상해 특약 포함)', purpose: '질병 대비', source: '매월 소득 중 일부', health: '3년 전 요추 추간판탈출증 진단, 물리치료 받음. 현재 통증 없음', note: '허리는 다 나았으니 안 적어도 되냐고 물어보심' },
  young: { age: 33, product: '변액연금보험', purpose: '목돈 마련', source: '매월 소득 중 일부', health: '', note: '수익률만 보고 결정하려 하심' },
};

const CLAIM_PRESETS = {
  disc: {
    denial: '피보험자의 이번 입원은 기왕증인 요추 추간판탈출증이 직접적인 원인으로 판단되어 약관상 보상하지 않는 손해에 해당하므로 부지급 처리되었음을 안내드립니다.',
    reason: '허리 통증이 심해져 12일 입원', amount: '100~500만원', joined: '3~5년',
  },
  disclose: {
    denial: '계약 전 알릴 의무 위반 사실이 확인되어 본 계약은 해지되었으며, 해당 사유와 보험금 지급사유 사이에 인과관계가 인정되므로 청구하신 보험금은 지급되지 않습니다.',
    reason: '위암 진단으로 진단비 청구', amount: '1000만원 이상', joined: '1~3년',
  },
  surrender: {
    denial: '고객님께서 요청하신 중도해지에 따른 해지환급금은 납입하신 보험료 총액에서 계약체결비용 및 계약관리비용 등을 공제한 금액으로 산출되어, 납입원금에 미치지 못합니다.',
    reason: '급하게 목돈이 필요해 5년 만에 해지', amount: '1000만원 이상', joined: '5년 이상',
  },
};

$$('.panel-sale .presets button').forEach((b) =>
  b.addEventListener('click', () => {
    const p = SALE_PRESETS[b.dataset.preset];
    $('#s-age').value = p.age;
    $('#s-product').value = p.product;
    $('#s-purpose').value = p.purpose;
    $('#s-source').value = p.source;
    $('#s-health').value = p.health;
    $('#s-note').value = p.note;
  }),
);

$$('.panel-claim .presets button').forEach((b) =>
  b.addEventListener('click', () => {
    const p = CLAIM_PRESETS[b.dataset.preset];
    $('#c-denial').value = p.denial;
    $('#c-reason').value = p.reason;
    $('#c-amount').value = p.amount;
    $('#c-joined').value = p.joined;
  }),
);

// ─── 공통 요청 ───
const ERR_MSG = {
  rate: '요청이 몰렸습니다. 잠시 후 다시 시도해 주세요. (데모라 호출 횟수를 제한해 두었습니다)',
  upstream: 'AI 응답을 받지 못했습니다. 다시 시도해 주세요.',
  too_short: '내용이 너무 짧습니다. 통보서 문구를 조금 더 붙여넣어 주세요.',
  bad_request: '입력값을 확인해 주세요.',
};

async function ask(body, errEl, btn, outEl) {
  errEl.classList.remove('on');
  btn.disabled = true;
  outEl.innerHTML = `<div class="loading"><div class="bar"><i></i></div>약관 조항을 대조하는 중…</div>`;
  try {
    const res = await fetch('/api/banca', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.result) throw new Error(data.error || 'upstream');
    return data.result;
  } catch (e) {
    outEl.innerHTML = '';
    errEl.textContent = ERR_MSG[e.message] || ERR_MSG.upstream;
    errEl.classList.add('on');
    return null;
  } finally {
    btn.disabled = false;
  }
}

// ─── 판매 시점 ───
$('#saleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    age: Number($('#s-age').value),
    product: $('#s-product').value,
    purpose: $('#s-purpose').value,
    source: $('#s-source').value,
    health: $('#s-health').value.trim(),
    note: $('#s-note').value.trim(),
  };
  const r = await ask({ mode: 'sale', payload }, $('#saleErr'), $('#saleForm .go'), $('#saleOut'));
  if (r) renderSale(r, payload);
});

function renderSale(r, payload) {
  const lv = r.risk_level;
  const html = `
    <div class="res-head">
      <h2>창구 안내</h2>
      <span class="pill ${esc(lv)}">불완전판매 ${esc(LEVEL_KO[lv] || '주의')}</span>
      <span class="gist">${esc(r.customer_gist)}</span>
    </div>
    ${r.risk_note ? `<p class="note-bad">${esc(r.risk_note)}</p>` : ''}

    <div class="sec">
      <h3><i>1</i>이 고객에게 반드시 설명할 3가지</h3>
      ${r.must_explain
        .map(
          (m) => `
        <div class="card">
          <h4>${esc(m.title)} <span class="pill ${esc(m.severity)}">${esc(LEVEL_KO[m.severity] || '')}</span></h4>
          ${m.clause_type ? `<span class="clause">${esc(m.clause_type)}</span>` : ''}
          <p class="why">${esc(m.why_this_customer)}</p>
          <div class="script">${esc(m.script)}</div>
        </div>`,
        )
        .join('')}
    </div>

    <div class="sec">
      <h3><i>2</i>이해도 확인 질문</h3>
      <p class="note-bad">체크리스트의 <s>"이해하셨죠?" → "네"</s> 는 아무것도 증명하지 않는다. 고객이 <b>자기 말로</b> 답해야 하는 질문만 남긴다.</p>
      ${r.comprehension_checks
        .map(
          (c) => `
        <div class="card qa">
          <p class="q">"${esc(c.question)}"</p>
          <div class="ans">
            <div class="g"><b>이렇게 답하면 OK</b>${esc(c.good_answer)}</div>
            <div class="r"><b>이렇게 답하면 다시 설명</b>${esc(c.red_flag)}</div>
          </div>
        </div>`,
        )
        .join('')}
    </div>

    <div class="sec">
      <h3><i>3</i>설명 이행 기록</h3>
      <p class="note-bad">체크 여부가 아니라 <b>무엇을 설명했는지</b>를 남긴다. 몇 년 뒤 이 고객의 보험금이 거절되면, 그 거절 사유가 여기 있었는지 대조된다.</p>
      <div class="saved">
        <div><b>${esc(r.record_summary || '설명 항목 ' + r.must_explain.length + '건')}</b><br>
        기록될 조항: ${r.must_explain.map((m) => esc(m.clause_type || m.title)).join(' · ')}</div>
        <button id="saveRec">이 기록 저장</button>
      </div>
    </div>`;

  $('#saleOut').innerHTML = html;

  $('#saveRec').addEventListener('click', (ev) => {
    const rec = {
      ts: Date.now(),
      customer: { age: payload.age, product: payload.product, purpose: payload.purpose, health: payload.health },
      summary: r.record_summary,
      explained: r.must_explain.map((m) => ({ title: m.title, clause_type: m.clause_type })),
    };
    localStorage.setItem(RECORD_KEY, JSON.stringify(rec));
    ev.target.textContent = '저장됨 ✓';
    ev.target.disabled = true;
    renderRecordHint();
  });
}

// ─── 청구 시점 ───
function loadRecord() {
  try {
    return JSON.parse(localStorage.getItem(RECORD_KEY) || 'null');
  } catch {
    return null;
  }
}

function renderRecordHint() {
  const el = $('#recordHint');
  const rec = loadRecord();
  if (!rec) {
    el.innerHTML = `<p class="hint-record"><b>가입 기록 없음</b> — 창구 직원 화면에서 "이 기록 저장"을 먼저 눌러보면, 여기서 거절 사유와 가입 당시 설명 내용을 대조하는 걸 볼 수 있다. 이게 이 서비스의 핵심이다.</p>`;
  } else {
    const d = new Date(rec.ts);
    el.innerHTML = `<p class="hint-record"><b>가입 기록 연동됨</b> — ${esc(rec.customer.age)}세 · ${esc(
      rec.customer.product,
    )} (${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(
      2,
      '0',
    )} 저장). 거절 사유가 이 기록에 있었는지 함께 대조한다. <a href="#" id="clearRec">기록 지우기</a></p>`;
    $('#clearRec').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(RECORD_KEY);
      renderRecordHint();
    });
  }
}
renderRecordHint();

$('#claimForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    denial: $('#c-denial').value.trim(),
    reason: $('#c-reason').value.trim(),
    amount: $('#c-amount').value,
    joined: $('#c-joined').value,
  };
  const r = await ask(
    { mode: 'claim', payload, sale_record: loadRecord() || undefined },
    $('#claimErr'),
    $('#claimForm .go'),
    $('#claimOut'),
  );
  if (r) renderClaim(r);
});

function renderClaim(r) {
  const cross = r.sale_crosscheck
    ? `<div class="crosscheck">
         <span class="tag">가입 당시 기록과 대조</span>
         <p>${esc(r.sale_crosscheck)}</p>
       </div>`
    : `<div class="crosscheck none">
         <span class="tag">가입 당시 기록 없음</span>
         <p>이 브라우저에 저장된 판매 기록이 없어 대조하지 못했다. 실제 서비스에서는 은행이 보관 중인 설명 이행 기록을 불러와, 거절 근거가 된 조항을 가입 때 설명받았는지 자동으로 확인한다. 설명받은 적이 없다면 그 사실 자체가 이의제기 논거가 된다.</p>
       </div>`;

  $('#claimOut').innerHTML = `
    <div class="res-head">
      <h2>청구 거절 분석</h2>
      <span class="pill ${r.odds === 'high' ? 'high' : r.odds === 'low' ? 'low' : 'mid'}">${esc(ODDS_KO[r.odds] || '')}</span>
      <span class="gist">${esc(r.denial_gist)}</span>
    </div>

    <div class="sec">
      <h3><i>1</i>이게 무슨 뜻인가요</h3>
      <div class="card"><p style="margin-top:0">${esc(r.meaning_plain)}</p></div>
    </div>

    <div class="sec">
      <h3><i>2</i>다툴 쟁점은 무엇인가요</h3>
      <div class="card">
        <h4>${esc(r.issue.headline)}</h4>
        <div class="frames" style="margin-top:12px">
          <div class="frame x"><b>이렇게 싸우면 진다</b>${esc(r.issue.wrong_frame)}</div>
          <div class="frame o"><b>여기서 싸워야 한다</b>${esc(r.issue.right_frame)}</div>
        </div>
        <p>${esc(r.issue.detail)}</p>
      </div>
    </div>

    <div class="sec">
      <h3><i>3</i>무엇을 준비해야 하나요</h3>
      ${r.evidence
        .map(
          (e) => `<div class="card">
            <h4>${esc(e.doc)}</h4>
            <p class="why">${esc(e.why)}</p>
            <p><b>발급</b> — ${esc(e.where)}</p>
          </div>`,
        )
        .join('')}
    </div>

    <div class="sec">
      <h3><i>4</i>비슷한 사례는 어떻게 되었나요</h3>
      <p class="note-bad">아래는 실제 결정례 인용이 아니라 <b>유형을 재구성한 예시</b>다. 실제 결정례는 금융감독원 분쟁조정 결정례에서 확인해야 한다. 사건번호를 지어내지 않도록 막아 두었다.</p>
      ${r.precedents
        .map(
          (p) => `<div class="card">
            <h4>${esc(p.pattern)}</h4>
            <p class="why">${esc(p.outcome)}</p>
            <p><b>내 청구에 적용하면</b> — ${esc(p.takeaway)}</p>
          </div>`,
        )
        .join('')}
    </div>

    <div class="sec">
      <h3><i>5</i>가입 당시 기록과의 대조</h3>
      ${cross}
    </div>

    <div class="sec">
      <h3><i>6</i>이의제기 문서 초안</h3>
      <div class="letter">
        <pre id="letterBody">${esc(r.objection_letter)}</pre>
        <div class="tools">
          <button id="copyLetter">복사</button>
          <button id="dlLetter">텍스트로 저장</button>
        </div>
      </div>
    </div>

    <div class="sec">
      <h3><i>7</i>절차와 접수처</h3>
      <ul class="steps">
        ${r.steps
          .map(
            (t) => `<li>
              <b>${esc(t.stage)}</b>
              <div class="meta">${esc(t.where)}${t.when ? ' · ' + esc(t.when) : ''}</div>
              <p>${esc(t.tip)}</p>
            </li>`,
          )
          .join('')}
      </ul>
      ${r.odds_note ? `<p class="note-bad">${esc(r.odds_note)}</p>` : ''}
    </div>`;

  $('#copyLetter').addEventListener('click', async (ev) => {
    try {
      await navigator.clipboard.writeText(r.objection_letter);
      ev.target.textContent = '복사됨 ✓';
      setTimeout(() => (ev.target.textContent = '복사'), 1800);
    } catch {
      ev.target.textContent = '복사 실패';
    }
  });

  $('#dlLetter').addEventListener('click', () => {
    const blob = new Blob([r.objection_letter], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '이의제기_초안.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
