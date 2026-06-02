/* Хаб МТК — страница одного проекта (project.html?id=...).
   Берёт проект из window.MTK_PROJECTS по id и рендерит его материалы (items).
   ПИН-гейт общий с витриной (тот же sessionStorage-ключ). */

(function () {
  "use strict";

  var HUB = window.MTK_HUB || {};
  var PROJECTS = window.MTK_PROJECTS || [];
  var SS_KEY = "mtk_hub_ok";

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

  function getParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function findProject() {
    var id = getParam("id");
    if (!id) return null;
    for (var i = 0; i < PROJECTS.length; i++) {
      if (PROJECTS[i].id === id) return PROJECTS[i];
    }
    return null;
  }

  // ---------- рендер карточки материала ----------
  function renderItem(it) {
    var card = el("a", "card");
    card.href = it.url;
    card.target = "_blank";
    card.rel = "noopener";

    var media = el("div", "card-media");
    if (it.preview) {
      var img = el("img");
      img.loading = "lazy";
      img.alt = it.title;
      img.src = it.preview;
      img.onerror = function () { img.remove(); };
      media.appendChild(img);
    }
    card.appendChild(media);

    var body = el("div", "card-body");
    if (it.kicker) {
      var k = el("div", "card-years", it.kicker);
      body.appendChild(k);
    }
    body.appendChild(el("h2", "card-title", it.title));
    if (it.desc) body.appendChild(el("p", "card-summary", it.desc));

    if (it.tags && it.tags.length) {
      var tags = el("div", "card-tags");
      it.tags.forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
      body.appendChild(tags);
    }

    var cta = el("div", "card-cta");
    cta.appendChild(el("span", null, "Открыть"));
    cta.appendChild(el("span", "arrow", "→"));
    body.appendChild(cta);

    card.appendChild(body);
    return card;
  }

  function renderProject(p) {
    document.title = "МТК " + p.num + " · " + p.title + " — Музей В.И. Ленина";

    var k = document.getElementById("pKicker");
    var t = document.getElementById("pTitle");
    var s = document.getElementById("pSummary");
    if (k) k.textContent = "МТК " + p.num + (p.years ? " · " + p.years : "");
    if (t) t.textContent = p.title;
    if (s) s.textContent = p.summary || "";

    var grid = document.getElementById("grid");
    var items = p.items || [];
    grid.innerHTML = "";
    items.forEach(function (it) { grid.appendChild(renderItem(it)); });

    var count = document.getElementById("footCount");
    if (count) {
      count.textContent = items.length + " " +
        plural(items.length, "материал", "материала", "материалов");
    }
  }

  function renderNotFound() {
    var t = document.getElementById("pTitle");
    var s = document.getElementById("pSummary");
    if (t) t.textContent = "Проект не найден";
    if (s) s.textContent = "Вернитесь к списку проектов.";
  }

  function showHub() {
    var gate = document.getElementById("gate");
    var hub = document.getElementById("hub");
    if (gate) gate.classList.add("hide");
    if (hub) hub.hidden = false;
    var p = findProject();
    if (p) renderProject(p); else renderNotFound();
  }

  // ---------- ПИН-гейт (общий с витриной) ----------
  function initGate() {
    var gate = document.getElementById("gate");
    var form = document.getElementById("gateForm");
    var input = document.getElementById("gateInput");
    var err = document.getElementById("gateErr");

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
        void gate.offsetWidth;
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
