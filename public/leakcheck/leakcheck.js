(function () {
  "use strict";

  var emailEl = document.getElementById("f-email");
  var nameEl = document.getElementById("f-name");
  var servicesEl = document.getElementById("f-services");
  var genBtn = document.getElementById("f-gen");
  var copyBtn = document.getElementById("f-copy");
  var resultEl = document.getElementById("result");
  var outputEl = document.getElementById("f-output");
  var quickEmailEl = document.getElementById("q-email");
  var googleBtn = document.getElementById("q-google");
  var hibpBtn = document.getElementById("q-hibp");

  // 1번 검색창에 넣은 이메일은 2번 프롬프트 폼에도 그대로 반영(다시 입력할 필요 없게)
  if (quickEmailEl) {
    quickEmailEl.addEventListener("input", function () {
      emailEl.value = quickEmailEl.value;
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      var email = (quickEmailEl.value || "").trim();
      if (!email) {
        quickEmailEl.focus();
        return;
      }
      var url = "https://www.google.com/search?q=" + encodeURIComponent('"' + email + '"');
      window.open(url, "_blank", "noopener");
    });
  }

  if (hibpBtn) {
    hibpBtn.addEventListener("click", function () {
      window.open("https://haveibeenpwned.com/", "_blank", "noopener");
    });
  }

  function buildPrompt() {
    var email = (emailEl.value || "").trim();
    var name = (nameEl.value || "").trim();
    var services = (servicesEl.value || "").trim();

    var lines = [];
    lines.push("나는 내 개인정보가 어디에 유출·노출돼 있는지 확인하고, 필요하면 삭제를 요청하고 싶어. 아래 정보를 참고해서 도와줘.");
    lines.push("");
    lines.push("[내 정보]");
    lines.push("- 확인하고 싶은 이메일: " + (email || "(직접 입력 예정)"));
    if (name) lines.push("- 이름: " + name);
    if (services) {
      lines.push("- 이미 확인된 유출/가입 서비스: " + services);
    } else {
      lines.push("- 이미 확인된 유출/가입 서비스: (아직 없음, 검색부터 도와줘)");
    }
    lines.push("");
    lines.push("[해줬으면 하는 것]");
    lines.push("1. 웹 검색이 가능하면 haveibeenpwned.com, 최근 국내 개인정보 유출 사고 뉴스(예: 티빙, 인터파크 등)에서 위 이메일/이름과 관련된 유출 이력이 있는지 찾아봐줘.");
    lines.push("2. 검색이 불가능하면, 대신 내가 직접 확인해야 할 사이트와 확인 방법을 순서대로 정리해줘 (예: e프라이버시 클린서비스(eprivacy.go.kr), haveibeenpwned.com).");
    lines.push("3. 위에서 확인된(또는 내가 알려준) 유출/가입 서비스 각각에 대해, 한국 개인정보보호법 제36조(개인정보의 정정·삭제)와 제37조(처리정지 등)를 근거로 한 '개인정보 삭제(파기) 요청' 이메일 초안을 하나씩 만들어줘.");
    lines.push("   - 어투는 정중하고 간결하게, 받는 사람이 회사 고객센터라고 가정하고 써줘.");
    lines.push("   - 이메일 제목, 본문, 요청 항목(삭제/파기 대상, 근거 조항, 처리 기한 요청)을 포함해줘.");
    lines.push("4. 마지막으로, 이 회사가 응답을 거부하거나 무시할 경우 내가 취할 수 있는 다음 단계(개인정보보호위원회 신고, 118 신고센터 등)를 한 줄로 알려줘.");
    lines.push("");
    lines.push("주의: 확인 안 된 사실을 지어내지 말고, 모르면 모른다고 해줘.");

    return lines.join("\n");
  }

  genBtn.addEventListener("click", function () {
    outputEl.value = buildPrompt();
    resultEl.hidden = false;
    copyBtn.classList.remove("copied");
    copyBtn.textContent = "복사하기";
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  copyBtn.addEventListener("click", function () {
    var text = outputEl.value;
    function markCopied() {
      copyBtn.classList.add("copied");
      copyBtn.textContent = "복사됨 ✓";
      setTimeout(function () {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = "복사하기";
      }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(markCopied).catch(function () {
        outputEl.select();
        document.execCommand("copy");
        markCopied();
      });
    } else {
      outputEl.select();
      document.execCommand("copy");
      markCopied();
    }
  });
})();
