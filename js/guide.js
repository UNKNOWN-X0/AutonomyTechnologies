/* Study guide behaviour. Set <body data-key="<prefix>">; ticks save as <prefix>-checks, review days as <prefix>-log. */
(function () {
  var PREFIX = document.body.dataset.key || "guide",
    KEY = PREFIX + "-checks",
    LOG = PREFIX + "-log",
    saved = {},
    log = { days: [] };
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    log = JSON.parse(localStorage.getItem(LOG) || '{"days":[]}');
  } catch (e) {}
  if (!Array.isArray(log.days)) log.days = [];

  function stamp() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function logToday() {
    var t = stamp();
    if (log.days.indexOf(t) === -1) log.days.push(t);
    try {
      localStorage.setItem(LOG, JSON.stringify(log));
    } catch (e) {}
    render();
  }

  var boxes = document.querySelectorAll("li.check input");
  boxes.forEach(function (cb) {
    cb.checked = !!saved[cb.dataset.k];
    cb.addEventListener("change", function () {
      saved[cb.dataset.k] = cb.checked;
      try {
        localStorage.setItem(KEY, JSON.stringify(saved));
      } catch (e) {}
      logToday();
      [meta, status].forEach(function (el) {
        if (!el) return;
        el.classList.remove("lit");
        void el.offsetWidth; // restart the animation on repeated ticks
        el.classList.add("lit");
      });
    });
  });

  // Review log: shown in the sign header and under the checklist.
  var meta = document.getElementById("review-meta");
  var list = boxes.length ? boxes[boxes.length - 1].closest("ul") : null;
  var panel, status, button;
  if (list) {
    panel = document.createElement("div");
    panel.className = "review";
    status = document.createElement("p");
    button = document.createElement("button");
    button.type = "button";
    button.className = "btn primary";
    button.textContent = "Log today's review";
    button.addEventListener("click", logToday);
    panel.appendChild(status);
    panel.appendChild(button);
    list.parentNode.insertBefore(panel, list.nextSibling);
  }

  function render() {
    var done = 0;
    boxes.forEach(function (cb) {
      if (cb.checked) done++;
    });
    var days = log.days.slice().sort(),
      last = days[days.length - 1],
      text;
    if (!last) text = done + " of " + boxes.length + " chapter skills ticked · not reviewed yet";
    else {
      var p = last.split("-"),
        then = new Date(+p[0], +p[1] - 1, +p[2]),
        now = new Date(),
        since = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - then) / 86400000);
      text =
        done + " of " + boxes.length + " chapter skills ticked · last reviewed " +
        (since === 0 ? "today" : since === 1 ? "yesterday" : since + " days ago") +
        " · " + days.length + (days.length === 1 ? " review" : " reviews");
    }
    if (meta) meta.textContent = text;
    if (status) status.textContent = text;
    if (button) button.disabled = last === stamp();
    if (button && button.disabled) button.textContent = "Reviewed today";
  }
  render();

  // Contents: mark the last section whose heading has passed the top third.
  var links = Array.prototype.slice.call(document.querySelectorAll("nav.toc ol a"));
  var heads = links
    .map(function (a) {
      return document.getElementById(decodeURIComponent(a.hash.slice(1)));
    })
    .filter(function (el, i, all) {
      return el && all.indexOf(el) === i;
    });
  var current = null,
    queued = false;
  function spy() {
    queued = false;
    var line = window.innerHeight / 3,
      id = heads.length ? heads[0].id : null;
    heads.forEach(function (h) {
      if (h.getBoundingClientRect().top < line) id = h.id;
    });
    if (id === current) return;
    current = id;
    links.forEach(function (a) {
      if (decodeURIComponent(a.hash.slice(1)) === id) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  if (links.length && heads.length) {
    window.addEventListener(
      "scroll",
      function () {
        if (!queued) {
          queued = true;
          requestAnimationFrame(spy);
        }
      },
      { passive: true }
    );
    spy();
  }

  // Tooltips (shown by js/tooltip.js). Full section titles behind the short contents entries.
  var titles = {};
  document.querySelectorAll("main section[id]").forEach(function (sec) {
    var h = sec.querySelector("h2");
    if (h) titles[sec.id] = h.textContent.trim();
  });
  links.forEach(function (a) {
    var full = titles[decodeURIComponent(a.hash.slice(1))];
    if (full && full !== a.textContent.trim()) a.dataset.tip = full;
  });

  // Section references in answers ("§1.12, 1.14") become links to those sections.
  document.querySelectorAll(".sec-ref").forEach(function (ref) {
    ref.innerHTML = ref.textContent.replace(/\d+\.\d+/g, function (n) {
      var id = "sec-" + n.replace(".", "");
      if (!titles[id]) return n;
      return '<a href="#' + id + '" data-tip="Revisit ' + titles[id].replace(/"/g, "&quot;") + '">' + n + "</a>";
    });
  });

  // Subject code: name the course.
  var code = document.querySelector(".sign .code"),
    course = document.querySelector(".sign .course");
  if (code && course) code.dataset.tip = course.textContent.trim();
})();
