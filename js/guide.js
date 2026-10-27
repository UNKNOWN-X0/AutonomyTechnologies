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
    if (!last) text = done + " of " + boxes.length + " exam skills ticked · not reviewed yet";
    else {
      var p = last.split("-"),
        then = new Date(+p[0], +p[1] - 1, +p[2]),
        now = new Date(),
        since = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - then) / 86400000);
      text =
        done + " of " + boxes.length + " exam skills ticked · last reviewed " +
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
  var heads = Array.prototype.slice.call(document.querySelectorAll("main h2[id]"));
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
})();
