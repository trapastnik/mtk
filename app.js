/* Хаб МТК — рендер витрины и мягкий ПИН-гейт.
   Внимание: ПИН-гейт — «занавеска» от случайного захода, НЕ криптозащита
   (код виден в исходниках). Для реальной защиты — basic-auth на nginx. */

(function () {
  "use strict";

  var HUB = window.MTK_HUB || {};
  var PROJECTS = window.MTK_PROJECTS || [];
  var SS_KEY = "mtk_hub_ok";

  var STATUS = {
    live:  { cls: "badge-live",  label: "Открыт",   cardCls: "" },
    soon:  { cls: "badge-soon",  label: "Скоро",    cardCls: "is-soon" },
    proto: { cls: "badge-proto", label: "Прототип", cardCls: "" },
    wip:   { cls: "badge-proto", label: "В работе", cardCls: "" },
  };

  // ---------- утилиты ----------
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ---------- рендер витрины ----------
  function renderBrand() {
    var k = document.getElementById("brandKicker");
    var t = document.getElementById("brandTitle");
    var s = document.getElementById("brandSub");
    if (k) k.textContent = HUB.brandKicker || "";
    if (t) t.innerHTML = (HUB.brandTitle || "").replace(/\n/g, "<br>");
    if (s) s.textContent = HUB.brandSub || "";
  }

  // внутренняя ссылка хаба (project.html…) — открываем в той же вкладке;
  // внешний проект — в новой.
  function isInternal(url) {
    return /^project\.html/.test(url || "");
  }

  function renderCard(p) {
    var st = STATUS[p.status] || STATUS.live;
    var soon = p.status === "soon";
    var hasItems = p.items && p.items.length;

    var card = el(soon ? "div" : "a", "card " + st.cardCls);
    if (!soon) {
      card.href = p.url;
      if (!isInternal(p.url)) {
        card.target = "_blank";
        card.rel = "noopener";
      }
    }

    // медиа
    var media = el("div", "card-media");
    if (p.preview) {
      var img = el("img");
      img.loading = "lazy";
      img.alt = "МТК " + p.num + " — " + p.title;
      img.src = p.preview;
      // если превью ещё нет — прячем <img>, остаётся фактурный фон
      img.onerror = function () { img.remove(); };
      media.appendChild(img);
    }
    media.appendChild(el("div", "card-num", "МТК " + p.num));
    var badge = el("span", "badge " + st.cls, st.label);
    media.appendChild(badge);
    card.appendChild(media);

    // тело
    var body = el("div", "card-body");
    body.appendChild(el("h2", "card-title", p.title));
    if (p.years) body.appendChild(el("div", "card-years", p.years));
    if (p.summary) body.appendChild(el("p", "card-summary", p.summary));

    if (p.tags && p.tags.length) {
      var tags = el("div", "card-tags");
      p.tags.forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
      body.appendChild(tags);
    }

    var cta = el("div", "card-cta");
    var ctaText = soon
      ? "В разработке"
      : hasItems
      ? p.items.length + " " + plural(p.items.length, "материал", "материала", "материалов")
      : "Открыть проект";
    cta.appendChild(el("span", null, ctaText));
    if (!soon) cta.appendChild(el("span", "arrow", "→"));
    body.appendChild(cta);

    card.appendChild(body);
    return card;
  }

  function renderGrid() {
    var grid = document.getElementById("grid");
    if (!grid) return;
    grid.innerHTML = "";
    PROJECTS.forEach(function (p) { grid.appendChild(renderCard(p)); });

    var count = document.getElementById("footCount");
    if (count) {
      var live = PROJECTS.filter(function (p) { return p.status !== "soon"; }).length;
      var word = plural(PROJECTS.length, "проект", "проекта", "проектов");
      count.textContent = PROJECTS.length + " " + word + " · " + live + " доступно";
    }
  }

  function showHub() {
    var gate = document.getElementById("gate");
    var hub = document.getElementById("hub");
    if (gate) gate.classList.add("hide");
    if (hub) hub.hidden = false;
    renderBrand();
    renderGrid();
  }

  // ---------- ПИН-гейт ----------
  function initGate() {
    var gate = document.getElementById("gate");
    var form = document.getElementById("gateForm");
    var input = document.getElementById("gateInput");
    var err = document.getElementById("gateErr");

    // уже проходил в этой сессии — пускаем сразу
    if (sessionStorage.getItem(SS_KEY) === "1" || !HUB.pin) {
      showHub();
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      if (val === String(HUB.pin)) {
        sessionStorage.setItem(SS_KEY, "1");
        showHub();
      } else {
        err.textContent = "Неверный код";
        gate.classList.remove("shake");
        void gate.offsetWidth; // рефлоу для перезапуска анимации
        gate.classList.add("shake");
        input.value = "";
        input.focus();
      }
    });

    if (input) input.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGate);
  } else {
    initGate();
  }
})();
