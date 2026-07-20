/* 그놈 목소리 — 성문 대조 워커: ECAPA int8 ONNX (WASM), 전화대역 정합된 16kHz PCM 입력 */
importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/ort.min.js');
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/';

let session = null, refs = null;
const SR = 16000, WIN = 3 * SR, HOP = Math.floor(1.5 * SR), RMS_TH = 0.006;

function rms(a, s, e) { let q = 0; for (let i = s; i < e; i++) q += a[i] * a[i]; return Math.sqrt(q / (e - s)); }
function l2(v) { let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1; return v.map(x => x / n); }

async function embed(pcm) {
  const t = new ort.Tensor('float32', pcm, [1, pcm.length]);
  const out = await session.run({ wav: t });
  return l2(Array.from(out.emb.data));
}

onmessage = async (ev) => {
  const m = ev.data;
  try {
    if (m.type === 'init') {
      refs = m.db.map(d => ({ id: d.id, emb: d.emb }));
      session = await ort.InferenceSession.create(m.model, { executionProviders: ['wasm'] });
      postMessage({ type: 'ready' });
    } else if (m.type === 'analyze') {
      const pcm = m.pcm;
      const embs = [];
      for (let i = 0; i + WIN <= pcm.length; i += HOP) {
        if (rms(pcm, i, i + WIN) < RMS_TH) continue;
        embs.push(await embed(pcm.slice(i, i + WIN)));
        postMessage({ type: 'progress', done: embs.length });
      }
      if (!embs.length) {
        if (rms(pcm, 0, pcm.length) < 0.003) { postMessage({ type: 'result', error: 'silent' }); return; }
        embs.push(await embed(pcm.slice(0, Math.min(pcm.length, WIN * 2))));
      }
      const d = embs[0].length, mean = new Array(d).fill(0);
      for (const e of embs) for (let i = 0; i < d; i++) mean[i] += e[i] / embs.length;
      const q = l2(mean);
      const scores = refs.map(r => {
        let c = 0; for (let i = 0; i < d; i++) c += q[i] * r.emb[i];
        return { id: r.id, cos: c };
      });
      postMessage({ type: 'result', scores, windows: embs.length });
    }
  } catch (e) {
    postMessage({ type: 'result', error: String(e && e.message || e) });
  }
};
