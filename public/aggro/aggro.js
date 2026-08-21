/* AggroMeter client — window.AGGRO = { ui, str, tech, cards } 는 각 로케일 HTML이 인라인 주입 */
(function () {
  var A = window.AGGRO;
  var $ = function (s) { return document.querySelector(s); };

  // ── tabs ──
  var mode = "text";
  document.querySelectorAll(".tabs button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      mode = btn.dataset.mode;
      document.querySelectorAll(".tabs button").forEach(function (b) { b.classList.toggle("on", b === btn); });
      document.querySelectorAll(".pane").forEach(function (p) { p.classList.toggle("on", p.dataset.mode === mode); });
      hideErr();
    });
  });

  // ── image handling: pick/drop/paste → canvas compress ──
  var imgData = null;
  var drop = $("#drop"), fileIn = $("#file");
  function setImage(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      var MAX = 1280;
      var w = img.width, h = img.height;
      if (Math.max(w, h) > MAX) { var r = MAX / Math.max(w, h); w = Math.round(w * r); h = Math.round(h * r); }
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      imgData = c.toDataURL("image/jpeg", 0.82);
      URL.revokeObjectURL(url);
      drop.classList.add("has");
      drop.innerHTML = "";
      var pv = new Image();
      pv.src = imgData;
      drop.appendChild(pv);
    };
    img.src = url;
  }
  if (drop) {
    drop.addEventListener("click", function () { fileIn.click(); });
    fileIn.addEventListener("change", function () { setImage(fileIn.files[0]); });
    ["dragover", "dragenter"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); });
    });
    drop.addEventListener("drop", function (e) { setImage(e.dataTransfer.files[0]); });
    document.addEventListener("paste", function (e) {
      var items = (e.clipboardData || {}).items || [];
      for (var i = 0; i < items.length; i++) {
        if (/^image\//.test(items[i].type)) { setImage(items[i].getAsFile()); switchTo("image"); break; }
      }
    });
  }
  function switchTo(m) {
    var btn = document.querySelector('.tabs button[data-mode="' + m + '"]');
    if (btn) btn.click();
  }

  // ── error ──
  function showErr(key) {
    var el = $("#err");
    el.textContent = A.str.errors[key] || A.str.errors.upstream;
    el.style.display = "block";
  }
  function hideErr() { $("#err").style.display = "none"; }

  // ── scanning card rotation ──
  var cardTimer = null;
  function startScan() {
    $("#scan").style.display = "block";
    $("#result").style.display = "none";
    $("#go").disabled = true;
    var i = Math.floor(Math.random() * A.cards.length);
    function show() {
      var c = A.cards[i % A.cards.length];
      $("#scan .card .t").textContent = c.t;
      $("#scan .card .b").textContent = c.b;
      i++;
    }
    show();
    cardTimer = setInterval(show, 3400);
    $("#scan").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function stopScan() {
    clearInterval(cardTimer);
    $("#scan").style.display = "none";
    $("#go").disabled = false;
  }

  // ── gauge ──
  function levelColor(level) {
    return { clean: "#3ef08c", low: "#a8e063", mid: "#ffb224", high: "#ff7a45", extreme: "#ff4d5e" }[level] || "#ffb224";
  }
  function renderGauge(score, color) {
    // 반원 게이지: -90°(0점) → +90°(100점)
    var ang = (score / 100) * 180 - 90;
    var needle = $("#needle");
    needle.style.transition = "transform 1.1s cubic-bezier(.2,.8,.3,1)";
    needle.setAttribute("style", "transform-origin:150px 140px; transition: transform 1.1s cubic-bezier(.2,.8,.3,1); transform: rotate(" + ang + "deg)");
    $("#arcval").setAttribute("stroke", color);
    var len = 402; // arc path length ≈ π*128
    var off = len - (score / 100) * len;
    var arc = $("#arcval");
    arc.setAttribute("stroke-dasharray", len);
    arc.setAttribute("stroke-dashoffset", len);
    requestAnimationFrame(function () {
      arc.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.3,1)";
      arc.setAttribute("stroke-dashoffset", off);
    });
    // count-up
    var numEl = $("#scorenum");
    numEl.style.color = color;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1100);
      p = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.round(score * p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── result render ──
  var lastResult = null;
  var lastShare = null;
  function render(r) {
    lastResult = r;
    var color = levelColor(r.level);
    $("#result").style.display = "block";
    renderGauge(r.score, color);
    var verdict = (A.str.verdicts || {})[r.level];
    var stamp = $("#stamp");
    if (stamp && verdict) {
      stamp.textContent = verdict.stamp;
      stamp.style.color = color;
      stamp.style.borderColor = color;
      $("#stampsub").textContent = verdict.sub;
    }
    var tag = $("#leveltag");
    tag.textContent = A.str.levels[r.level] || r.level;
    tag.style.color = color;
    tag.style.borderColor = color;
    $("#headline").textContent = r.headline;
    $("#summary").textContent = r.summary;
    $("#conf").textContent = A.str.confidence.replace("{c}", A.str.confLevels[r.confidence] || r.confidence);

    var techs = $("#techs");
    techs.innerHTML = "";
    var noTech = $("#notech");
    if (!r.techniques.length) {
      noTech.style.display = "block";
    } else {
      noTech.style.display = "none";
      r.techniques.forEach(function (t) {
        var meta = A.tech[t.id] || { name: t.id, icon: "⚠️" };
        var div = document.createElement("div");
        div.className = "tech";
        var name = document.createElement("div");
        name.className = "name";
        name.innerHTML = '<span class="ic"></span><span></span>';
        name.querySelector(".ic").textContent = meta.icon;
        name.querySelector("span:last-child").textContent = meta.name;
        div.appendChild(name);
        if (t.quote) {
          var q = document.createElement("div");
          q.className = "quote";
          q.textContent = "“" + t.quote + "”";
          div.appendChild(q);
        }
        var why = document.createElement("div");
        why.className = "why";
        why.textContent = t.why;
        div.appendChild(why);
        techs.appendChild(div);
      });
    }
    $("#advicebody").textContent = r.advice;
    $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── analyze ──
  $("#go").addEventListener("click", function () {
    hideErr();
    var content = "";
    if (mode === "text") content = $("#txt").value.trim();
    else if (mode === "link") content = $("#url").value.trim();
    else if (mode === "image") content = imgData || "";
    if (!content) { showErr("empty"); return; }
    if (mode === "text" && content.length < 5) { showErr("too_short"); return; }
    startScan();
    fetch("/api/aggro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: mode, content: content, ui: A.ui }),
    })
      .then(function (res) {
        return res.json().then(function (j) { return { ok: res.ok, j: j }; });
      })
      .then(function (o) {
        stopScan();
        if (!o.ok || !o.j.result) { showErr(o.j && o.j.error ? o.j.error : "upstream"); return; }
        lastShare = o.j.share || null;
        render(o.j.result);
        if (window.dataLayer) window.dataLayer.push({ event: "aggro_analyze", aggro_mode: mode, aggro_score: o.j.result.score });
      })
      .catch(function () { stopScan(); showErr("upstream"); });
  });

  // ── share / again ──
  $("#share").addEventListener("click", function () {
    if (!lastResult) return;
    var verdict = (A.str.verdicts || {})[lastResult.level];
    var text = A.str.shareText
      .replace("{score}", lastResult.score)
      .replace("{level}", verdict ? verdict.stamp : (A.str.levels[lastResult.level] || lastResult.level));
    var url = lastShare ? location.origin + lastShare : A.str.shareUrl;
    if (window.dataLayer) window.dataLayer.push({ event: "aggro_share", aggro_score: lastResult.score });
    if (navigator.share) {
      navigator.share({ title: A.str.shareTitle, text: text, url: url }).catch(function () {});
    } else {
      navigator.clipboard.writeText(text + " " + url).then(function () {
        var b = $("#share");
        var orig = b.textContent;
        b.textContent = A.str.copied;
        setTimeout(function () { b.textContent = orig; }, 1600);
      });
    }
  });
  $("#again").addEventListener("click", function () {
    $("#result").style.display = "none";
    lastResult = null;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
