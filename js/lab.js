/* Lab engine: predict, rate your confidence, reveal, explain. Shared by every lab page.
   <body data-key="<prefix>"> as on the chapter's guide. Answers save as <prefix>-lab; finishing an
   experiment ticks lab-<id> in <prefix>-checks and logs a review day in <prefix>-log, so the hub counts it. */
(function () {
  var PREFIX = document.body.dataset.key || "lab",
    STORE = PREFIX + "-lab",
    CHECKS = PREFIX + "-checks",
    LOG = PREFIX + "-log",
    GUIDE = document.body.dataset.guide || "",
    reduce = window.siteReduceMotion ? window.siteReduceMotion() : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    results = read(STORE, {}),
    experiments = [],
    CONF = [
      ["sure", "Sure"],
      ["think", "Think so"],
      ["guess", "Guessing"],
    ];

  function read(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v && typeof v === "object" ? v : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }
  function stamp() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function guideLink(ref) {
    var a = h("a", "sec-link", "Guide §" + ref);
    a.href = GUIDE + "#sec-" + ref.split(/[–,]/)[0].trim().replace(".", "");
    return a;
  }

  // Ease a value from 0 to 1 over ms milliseconds; resolves when done. Instant under reduced motion.
  function tween(ms, step) {
    return new Promise(function (done) {
      if (reduce || !ms) {
        step(1);
        return done();
      }
      var t0 = performance.now();
      function frame(now) {
        var t = Math.min(1, (now - t0) / ms),
          e = 1 - Math.pow(1 - t, 3);
        step(e);
        if (t < 1) requestAnimationFrame(frame);
        else done();
      }
      requestAnimationFrame(frame);
    });
  }

  function complete(id) {
    var checks = read(CHECKS, {}),
      log = read(LOG, { days: [] });
    checks["lab-" + id] = true;
    write(CHECKS, checks);
    if (!Array.isArray(log.days)) log.days = [];
    if (log.days.indexOf(stamp()) === -1) log.days.push(stamp());
    write(LOG, log);
  }

  // Each lab's setup must call c.stage() itself, in its own order; the engine only reports when it does not.
  function runSetup(def, c) {
    var stage = c.stage,
      staged = false;
    if (typeof stage === "function")
      c.stage = function () {
        staged = true;
        return stage.apply(this, arguments);
      };
    def.setup(c);
    c.stage = stage;
    if (!staged) console.error("Lab: " + def.id + "/" + c.id + (typeof stage === "function" ? ": setup did not call c.stage()" : ": challenge has no stage()"));
  }

  function Experiment(def) {
    this.def = def;
    this.card = def.card;
    this.saved = results[def.id] || (results[def.id] = {});
    experiments.push(this);
    this.show(this.next());
  }
  Experiment.prototype.next = function () {
    var cs = this.def.challenges;
    for (var i = 0; i < cs.length; i++) if (!this.saved[cs[i].id]) return i;
    return -1;
  };
  // show(i): fixed challenge i. show(-2, gen): a generated practice challenge (from def.generate), which is never
  // saved and never changes the skill tick.
  Experiment.prototype.show = function (i, gen) {
    var self = this,
      def = this.def,
      card = this.card;
    card.innerHTML = "";
    // Only a user's step (Next, Replay) animates the new question in; page load stays still.
    card.classList.toggle("ch-enter", !!this.stepped);
    this.stepped = false;
    if (i < 0 && !gen) return this.done();
    var c = gen || def.challenges[i],
      choice = null,
      conf = null;
    def.lock(true);
    card.closest(".experiment") && card.closest(".experiment").classList.add("in-challenge");
    runSetup(def, c);

    var head = h("p", "ch-count", gen ? "Practice challenge · new numbers each time" : "Challenge " + (i + 1) + " of " + def.challenges.length);
    var prompt = h("h3", "ch-prompt", c.prompt);
    var opts = h("div", "ch-options");
    opts.setAttribute("role", "radiogroup");
    opts.setAttribute("aria-label", "Your prediction");
    c.options.forEach(function (o) {
      var b = h("button", "ch-opt", o[1]);
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.addEventListener("click", function () {
        choice = o[0];
        opts.querySelectorAll(".ch-opt").forEach(function (x) {
          x.setAttribute("aria-checked", String(x === b));
        });
        if (c.preview) c.preview(choice);
        ready();
      });
      opts.appendChild(b);
    });
    var confLabel = h("p", "ch-label", "How sure are you?");
    var act = h("div", "ch-act");
    var confs = h("div", "ch-conf seg");
    confs.setAttribute("role", "radiogroup");
    confs.setAttribute("aria-label", "How sure are you?");
    CONF.forEach(function (o) {
      var b = h("button", "ch-seg", o[1]);
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.addEventListener("click", function () {
        conf = o[0];
        confs.querySelectorAll(".ch-seg").forEach(function (x) {
          x.setAttribute("aria-checked", String(x === b));
        });
        ready();
      });
      confs.appendChild(b);
    });
    // Question block and verdict share one grid cell, so the card keeps one height from question to answer.
    var swap = h("div", "ch-swap"),
      ask = h("div", "ch-ask"),
      answer = h("div", "ch-answer");
    answer.setAttribute("aria-hidden", "true");
    // The hidden verdict is laid out with the longest wording it can take, so revealing never grows the card.
    var longest = c.options.reduce(function (a, o) {
      return o[1].length > a.length ? o[1] : a;
    }, "");
    var verdict = h("div", "ch-verdict wrong"),
      mark = h("p", "ch-mark", "Not quite"),
      said = h("p", "ch-said", "You said: " + longest + " (guessing). Answer: " + longest),
      why = h("p", "ch-why");
    why.innerHTML = c.why;
    why.appendChild(document.createTextNode(" "));
    why.appendChild(guideLink(c.ref));
    var last = !gen && i === def.challenges.length - 1,
      nxt = h("button", "btn " + (last ? "primary" : ""), gen ? "Another challenge" : last ? "Open the sandbox" : "Next challenge");
    nxt.type = "button";
    nxt.tabIndex = -1;
    nxt.addEventListener("click", function () {
      if (gen) return self.practice();
      if (last) complete(def.id);
      self.stepped = !last;
      self.show(self.next());
      if (last) refresh();
    });
    [mark, said, why, nxt].forEach(function (n) {
      verdict.appendChild(n);
    });
    answer.appendChild(verdict);
    var go = h("button", "btn primary ch-go", "Reveal");
    go.type = "button";
    go.disabled = true;
    function ready() {
      go.disabled = !(choice && conf);
    }
    go.addEventListener("click", function () {
      go.disabled = true;
      card.querySelectorAll(".ch-opt, .ch-seg").forEach(function (x) {
        x.disabled = true;
      });
      // Bring the stage into view before it moves (on narrow screens it sits below the card).
      var stg = card.closest(".experiment") && card.closest(".experiment").querySelector(".stage");
      if (stg) stg.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      var correct = choice === c.answer;
      if (!gen) {
        self.saved[c.id] = { choice: choice, conf: conf, correct: correct };
        write(STORE, results);
      }
      Promise.resolve(c.reveal(choice)).then(function () {
        var label = function (key) {
            for (var k = 0; k < c.options.length; k++) if (c.options[k][0] === key) return c.options[k][1];
          },
          confText = { sure: "sure", think: "think so", guess: "guessing" }[conf];
        // keep the card exactly as tall as it was while the question showed
        swap.style.minHeight = swap.getBoundingClientRect().height + "px";
        verdict.className = "ch-verdict " + (correct ? "right" : "wrong");
        mark.textContent = correct ? "Correct" : "Not quite";
        // the badge's line records how well the confidence matched; the labels underneath get their own lines
        mark.className = "ch-mark conf-" + conf;
        said.textContent = "";
        said.appendChild(document.createTextNode("You said: "));
        said.appendChild(h("b", correct ? "pick-ok" : "pick-miss", label(choice)));
        said.appendChild(document.createTextNode(" (" + confText + ")"));
        if (!correct) {
          said.appendChild(document.createTextNode(". Answer: "));
          said.appendChild(h("b", "pick-ans", label(c.answer)));
        }
        swap.classList.add("revealed");
        ask.setAttribute("aria-hidden", "true");
        answer.removeAttribute("aria-hidden");
        nxt.tabIndex = 0;
        nxt.focus({ preventScroll: true });
      });
    });

    act.appendChild(confs);
    act.appendChild(go);
    [opts, confLabel, act].forEach(function (n) {
      ask.appendChild(n);
    });
    swap.appendChild(ask);
    swap.appendChild(answer);
    [head, prompt, swap].forEach(function (n) {
      card.appendChild(n);
    });
    // Explore freely (owner's request, 2026-11-04): the sandbox is available at any time. The challenge waits where
    // it was; finishing all of them still ticks the skill.
    var ex = h("button", "btn ch-explore", gen ? "Back to the sandbox" : "Explore freely");
    ex.type = "button";
    ex.addEventListener("click", function () {
      if (gen) self.done();
      else self.explore(i);
    });
    card.appendChild(ex);
  };
  Experiment.prototype.explore = function (i) {
    var self = this,
      def = this.def,
      card = this.card;
    card.innerHTML = "";
    card.classList.remove("ch-enter");
    card.appendChild(h("p", "ch-count", "Exploring · challenge " + (i + 1) + " of " + def.challenges.length + " is waiting"));
    card.appendChild(h("p", "ch-open", "The sandbox is open: change the controls below, and drag on the stage where it lets you. Your place in the challenges is kept."));
    var back = h("button", "btn", "Back to challenge " + (i + 1));
    back.type = "button";
    back.addEventListener("click", function () {
      self.stepped = true;
      self.show(i);
    });
    card.appendChild(back);
    def.lock(false);
    card.closest(".experiment") && card.closest(".experiment").classList.remove("in-challenge");
    def.sandbox();
    back.focus({ preventScroll: true });
  };
  Experiment.prototype.practice = function () {
    var g = this.def.generate();
    this.card.classList.remove("finished");
    this.stepped = true;
    this.show(-2, g);
  };
  Experiment.prototype.done = function () {
    var self = this,
      def = this.def,
      score = 0;
    def.challenges.forEach(function (c) {
      if (self.saved[c.id] && self.saved[c.id].correct) score++;
    });
    this.card.innerHTML = ""; // also reached straight from a practice challenge
    this.card.classList.add("finished");
    this.card.appendChild(h("p", "ch-count", "Challenges done · " + score + " of " + def.challenges.length + " predicted correctly"));
    this.card.appendChild(h("p", "ch-open", "The sandbox is open: change the controls below, and drag on the stage where it lets you. Predict before you change anything."));
    var again = h("button", "btn", "Replay the challenges");
    again.type = "button";
    again.addEventListener("click", function () {
      results[def.id] = self.saved = {};
      write(STORE, results);
      self.card.classList.remove("finished");
      self.stepped = true;
      self.show(0);
      refresh();
    });
    this.card.appendChild(again);
    // Endless practice: experiments that can generate a fresh challenge offer one after the fixed set.
    if (typeof def.generate === "function") {
      var more = h("button", "btn primary ch-more", "New challenge");
      more.type = "button";
      more.addEventListener("click", function () {
        self.practice();
      });
      this.card.insertBefore(more, again);
    }
    def.lock(false);
    this.card.closest(".experiment") && this.card.closest(".experiment").classList.remove("in-challenge");
    def.sandbox();
  };

  // Results: score per experiment, and the "sure but wrong" answers worth revisiting first.
  var ticksMade = 0;
  function refresh() {
    var finished = experiments.filter(function (x) {
        return x.next() < 0;
      }).length,
      meta = document.getElementById("lab-meta");
    if (meta) {
      var checks = read(CHECKS, {}),
        skills = +document.body.dataset.skills || 0,
        guideDone = Object.keys(checks).filter(function (k) {
          return checks[k] && k.indexOf("lab-") !== 0;
        }).length;
      meta.textContent = (skills ? guideDone + " of " + skills + " guide skills · " : "") + finished + " of " + experiments.length + " lab experiments";
      // The header's tick bar: guide skills, then lab experiments after a gap, as on the hub.
      var bar = document.getElementById("lab-ticks");
      if (!bar) {
        bar = document.createElement("span");
        bar.id = "lab-ticks";
        bar.className = "ticks";
        bar.setAttribute("aria-hidden", "true");
        meta.parentNode.insertBefore(bar, meta.nextSibling);
      }
      // experiments register one by one, so the bar follows their count
      for (; ticksMade < skills + experiments.length; ticksMade++) bar.appendChild(h("i", skills && ticksMade === skills ? "lab-start" : null));
      Array.prototype.forEach.call(bar.children, function (seg, n) {
        seg.classList.toggle("on", n < skills ? n < guideDone : n - skills < finished);
      });
      bar.classList.toggle("mastered", bar.children.length > 0 && guideDone + finished === bar.children.length);
    }
    var box = document.getElementById("lab-results");
    if (!box) return;
    box.innerHTML = "";
    var rows = h("ul", "res-list"),
      revisit = h("ul", "res-revisit");
    experiments.forEach(function (x) {
      var def = x.def,
        answered = 0,
        right = 0;
      def.challenges.forEach(function (c) {
        var r = x.saved[c.id];
        if (!r) return;
        answered++;
        if (r.correct) right++;
        if (!r.correct && r.conf === "sure") {
          var li = h("li", null, def.title + ": " + c.short + " ");
          li.appendChild(guideLink(c.ref));
          revisit.appendChild(li);
        }
      });
      var li = h("li", answered === def.challenges.length ? "done" : "");
      li.appendChild(h("span", "res-name", def.title));
      li.appendChild(h("span", "res-score", answered ? right + " of " + def.challenges.length + " correct" : "not started"));
      rows.appendChild(li);
    });
    box.appendChild(rows);
    box.appendChild(h("h3", null, "Sure, but wrong"));
    if (revisit.children.length) {
      box.appendChild(h("p", null, "You felt sure and the simulation disagreed. These are the ideas to revisit first."));
      box.appendChild(revisit);
    } else {
      box.appendChild(h("p", null, "Nothing yet. When you are confident and wrong, the idea shows up here with a link to the guide."));
    }
  }

  // Custom dropdowns (owner's request, 2026-11-04: no native popup menus). Each lab <select> gets a button and a listbox
  // in the site's style; the native select stays in the page, hidden, as the single source of the value, so every lab
  // script keeps reading and setting select.value as before. Setting the value in code or resetting the form redraws
  // the button. Keyboard: Enter, Space or the arrows open it; the arrows move, Enter picks, Escape closes; typing a
  // letter jumps to an option.
  var uid = 0;
  function chevron() {
    var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
    svg.setAttribute("viewBox", "0 0 12 12"); svg.setAttribute("width", "12"); svg.setAttribute("height", "12"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", "cselect-chev");
    p.setAttribute("d", "M2 4l4 4 4-4"); p.setAttribute("fill", "none"); p.setAttribute("stroke", "currentColor"); p.setAttribute("stroke-width", "2");
    svg.appendChild(p);
    return svg;
  }
  function enhanceSelect(sel) {
    if (sel.dataset.enhanced) return;
    sel.dataset.enhanced = "1";
    var wrap = h("span", "cselect"), btn = h("button", "cselect-btn"), list = h("ul", "cselect-list"), label = sel.closest("label");
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    list.id = "cselect-" + ++uid;
    list.setAttribute("role", "listbox");
    list.hidden = true;
    btn.setAttribute("aria-controls", list.id);
    if (label) btn.setAttribute("aria-label", (label.firstChild && label.firstChild.textContent || "").trim() || "Choose");
    sel.parentNode.insertBefore(wrap, sel);
    // the button comes first, so a click on the label text opens the list rather than the hidden select
    wrap.appendChild(btn);
    wrap.appendChild(sel);
    wrap.appendChild(list);
    sel.classList.add("cselect-native");
    sel.tabIndex = -1;
    sel.setAttribute("aria-hidden", "true");
    function render() {
      var o = sel.options[sel.selectedIndex];
      btn.textContent = "";
      btn.appendChild(h("span", "cselect-text", o ? o.text : ""));
      btn.appendChild(chevron());
      btn.disabled = sel.disabled;
      list.innerHTML = "";
      Array.prototype.forEach.call(sel.options, function (opt, i) {
        var li = h("li", "cselect-opt", opt.text);
        li.setAttribute("role", "option");
        li.tabIndex = -1;
        li.setAttribute("aria-selected", String(i === sel.selectedIndex));
        li.addEventListener("click", function () { choose(i); });
        list.appendChild(li);
      });
    }
    function open(focusIndex) {
      if (btn.disabled) return;
      list.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      var r = btn.getBoundingClientRect();
      wrap.classList.toggle("up", window.innerHeight - r.bottom < Math.min(280, list.scrollHeight + 12) && r.top > window.innerHeight - r.bottom);
      var li = list.children[focusIndex != null ? focusIndex : Math.max(0, sel.selectedIndex)];
      if (li) li.focus({ preventScroll: true }), li.scrollIntoView({ block: "nearest" });
    }
    function close(refocus) {
      list.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (refocus) btn.focus({ preventScroll: true });
    }
    function choose(i) {
      var changed = i !== sel.selectedIndex;
      sel.selectedIndex = i;
      close(true);
      if (changed) sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    btn.addEventListener("click", function () { if (list.hidden) open(); else close(true); });
    btn.addEventListener("keydown", function (ev) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].indexOf(ev.key) >= 0) { ev.preventDefault(); open(); }
    });
    list.addEventListener("keydown", function (ev) {
      var items = Array.prototype.slice.call(list.children), at = items.indexOf(document.activeElement);
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        var n = Math.max(0, Math.min(items.length - 1, at + (ev.key === "ArrowDown" ? 1 : -1)));
        items[n].focus(); items[n].scrollIntoView({ block: "nearest" });
      } else if (ev.key === "Home" || ev.key === "End") {
        ev.preventDefault(); items[ev.key === "Home" ? 0 : items.length - 1].focus();
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault(); if (at >= 0) choose(at);
      } else if (ev.key === "Escape") {
        ev.preventDefault(); close(true);
      } else if (ev.key === "Tab") {
        close(false);
      } else if (ev.key.length === 1) {
        var k = ev.key.toLowerCase(), hit = items.findIndex(function (li, j) { return j > at && li.textContent.trim().toLowerCase().indexOf(k) === 0; });
        if (hit < 0) hit = items.findIndex(function (li) { return li.textContent.trim().toLowerCase().indexOf(k) === 0; });
        if (hit >= 0) items[hit].focus();
      }
    });
    document.addEventListener("pointerdown", function (ev) { if (!list.hidden && !wrap.contains(ev.target)) close(false); });
    // keep the button in step with code that sets the value directly, and with form resets
    ["value", "selectedIndex"].forEach(function (prop) {
      var d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, prop);
      if (d && d.set) Object.defineProperty(sel, prop, { configurable: true, get: function () { return d.get.call(sel); }, set: function (v) { d.set.call(sel, v); render(); } });
    });
    sel.addEventListener("change", render);
    if (sel.form) sel.form.addEventListener("reset", function () { setTimeout(render, 0); });
    new MutationObserver(render).observe(sel, { attributes: true, attributeFilter: ["disabled"] });
    var fs = sel.closest("fieldset");
    if (fs) new MutationObserver(function () { btn.disabled = sel.disabled || fs.disabled; }).observe(fs, { attributes: true, attributeFilter: ["disabled"] });
    render();
  }
  // Clickable bit cells under a bit-pattern field (input[data-bitcells]): one toggle per 0/1, other characters
  // (a binary point, spaces) shown as they are. A click flips the bit and fires "input", so the lab updates as if
  // typed. The row hides when the field holds something else, or when data-bitcells="task=decode" names a select
  // ([data-task]) whose value must match. Setting .value from lab code redraws the row.
  function bitCells(input) {
    var label = input.closest("label") || input.parentNode, row = document.createElement("span"), form = input.form;
    row.className = "bitcells";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "Bits of " + (label.textContent || "the pattern").trim() + ": press a bit to flip it");
    label.appendChild(row);
    if (label.classList) label.classList.add("has-bits");
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    function wanted() {
      var cond = input.getAttribute("data-bitcells"), m = cond && /^(\w+)=(.+)$/.exec(cond);
      if (m && form) { var sel = form.querySelector("[data-" + m[1] + "]"); if (sel && sel.value !== m[2]) return false; }
      return /^[01. ]+$/.test(proto.get.call(input)) && /[01]/.test(proto.get.call(input));
    }
    function render() {
      var v = proto.get.call(input);
      row.hidden = !wanted();
      row.textContent = "";
      if (row.hidden) return;
      var bitsLeft = v.replace(/[^01]/g, "").length, afterPoint = v.indexOf(".") >= 0, seen = 0, group = null;
      v.split("").forEach(function (ch, i) {
        if (ch !== "0" && ch !== "1") { var t = document.createElement("span"); t.className = "bitcells-sep"; t.textContent = ch === " " ? "" : ch; row.appendChild(t); group = null; return; }
        var b = document.createElement("button");
        b.type = "button";
        b.className = "bitcell";
        b.textContent = ch;
        b.disabled = input.disabled;
        b.setAttribute("aria-pressed", ch === "1" ? "true" : "false");
        b.setAttribute("aria-label", "bit " + (seen + 1) + " of " + bitsLeft + ", " + ch);
        // a nibble gap: from the left after a binary point, from the right otherwise
        var pos = afterPoint && i > v.indexOf(".") ? i - v.indexOf(".") - 1 : bitsLeft - seen;
        // nibbles are groups that never split, so a long pattern wraps between groups
        if (!group || pos % 4 === 0) { group = document.createElement("span"); group.className = "bitgroup"; row.appendChild(group); }
        var k = seen;
        b.addEventListener("click", function () {
          var cur = proto.get.call(input);
          proto.set.call(input, cur.slice(0, i) + (cur[i] === "1" ? "0" : "1") + cur.slice(i + 1));
          input.dispatchEvent(new Event("input", { bubbles: true })); // redraws the row and updates the lab
          var again = row.querySelectorAll(".bitcell")[k]; // keep focus on the same bit in the new row
          if (again) again.focus();
        });
        group.appendChild(b);
        seen++;
      });
    }
    Object.defineProperty(input, "value", { configurable: true, get: function () { return proto.get.call(input); }, set: function (x) { proto.set.call(input, x); render(); } });
    input.addEventListener("input", render);
    if (form) {
      form.addEventListener("change", render);
      form.addEventListener("reset", function () { setTimeout(render, 0); });
    }
    new MutationObserver(render).observe(input, { attributes: true, attributeFilter: ["disabled"] });
    var fs = input.closest("fieldset");
    if (fs) new MutationObserver(render).observe(fs, { attributes: true, attributeFilter: ["disabled"] });
    render();
  }
  function enhanceAll() {
    document.querySelectorAll(".controls select").forEach(enhanceSelect);
    document.querySelectorAll(".controls input[data-bitcells]").forEach(bitCells);
  }
  // Labs mount their experiments on DOMContentLoaded too; their own controls are in the page HTML, so order does not matter.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhanceAll);
  else if (typeof setTimeout === "function") setTimeout(enhanceAll, 0);

  window.Lab = {
    experiment: function (def) {
      var x = new Experiment(def);
      refresh();
      return x;
    },
    tween: tween,
    reduce: reduce,
    // For dropdowns a lab creates after load (the EEI charge list): gives them the same custom list.
    enhance: function (sel) { if (sel && !sel.classList.contains("cselect-native")) enhanceSelect(sel); },
  };
})();
