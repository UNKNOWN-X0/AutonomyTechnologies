/* Lab engine: predict, rate your confidence, reveal, explain. Shared by every lab page.
   <body data-key="<prefix>"> as on the chapter's guide. Answers save as <prefix>-lab; finishing an
   experiment ticks lab-<id> in <prefix>-checks and logs a review day in <prefix>-log, so the hub counts it. */
(function () {
  var PREFIX = document.body.dataset.key || "lab",
    STORE = PREFIX + "-lab",
    CHECKS = PREFIX + "-checks",
    LOG = PREFIX + "-log",
    GUIDE = document.body.dataset.guide || "",
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches,
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
  Experiment.prototype.show = function (i) {
    var self = this,
      def = this.def,
      card = this.card;
    card.innerHTML = "";
    if (i < 0) return this.done();
    var c = def.challenges[i],
      choice = null,
      conf = null;
    def.lock(true);
    def.setup(c);

    var head = h("p", "ch-count", "Challenge " + (i + 1) + " of " + def.challenges.length);
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
    var confs = h("div", "ch-conf");
    confs.setAttribute("role", "radiogroup");
    confs.setAttribute("aria-label", "How sure are you?");
    CONF.forEach(function (o) {
      var b = h("button", "ch-opt small", o[1]);
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.addEventListener("click", function () {
        conf = o[0];
        confs.querySelectorAll(".ch-opt").forEach(function (x) {
          x.setAttribute("aria-checked", String(x === b));
        });
        ready();
      });
      confs.appendChild(b);
    });
    var go = h("button", "btn primary ch-go", "Reveal");
    go.type = "button";
    go.disabled = true;
    function ready() {
      go.disabled = !(choice && conf);
    }
    go.addEventListener("click", function () {
      go.disabled = true;
      card.querySelectorAll(".ch-opt").forEach(function (x) {
        x.disabled = true;
      });
      var correct = choice === c.answer;
      self.saved[c.id] = { choice: choice, conf: conf, correct: correct };
      write(STORE, results);
      Promise.resolve(c.reveal(choice)).then(function () {
        var verdict = h("div", "ch-verdict " + (correct ? "right" : "wrong"));
        verdict.appendChild(h("p", "ch-mark", correct ? "Correct" : "Not quite"));
        var why = h("p", "ch-why");
        why.innerHTML = c.why;
        why.appendChild(document.createTextNode(" "));
        why.appendChild(guideLink(c.ref));
        verdict.appendChild(why);
        var last = i === def.challenges.length - 1,
          nxt = h("button", "btn " + (last ? "primary" : ""), last ? "Open the sandbox" : "Next challenge");
        nxt.type = "button";
        nxt.addEventListener("click", function () {
          if (last) complete(def.id);
          self.show(self.next());
          if (last) refresh();
        });
        verdict.appendChild(nxt);
        card.appendChild(verdict);
        nxt.focus({ preventScroll: true });
      });
    });

    [head, prompt, opts, confLabel, confs, go].forEach(function (n) {
      card.appendChild(n);
    });
  };
  Experiment.prototype.done = function () {
    var self = this,
      def = this.def,
      score = 0;
    def.challenges.forEach(function (c) {
      if (self.saved[c.id] && self.saved[c.id].correct) score++;
    });
    this.card.classList.add("finished");
    this.card.appendChild(h("p", "ch-count", "Challenges done · " + score + " of " + def.challenges.length + " predicted correctly"));
    this.card.appendChild(h("p", "ch-open", "The sandbox is open: drag, change and explore. Predict before you move something."));
    var again = h("button", "btn", "Replay the challenges");
    again.type = "button";
    again.addEventListener("click", function () {
      results[def.id] = self.saved = {};
      write(STORE, results);
      self.card.classList.remove("finished");
      self.show(0);
      refresh();
    });
    this.card.appendChild(again);
    def.lock(false);
    def.sandbox();
  };

  // Results: score per experiment, and the "sure but wrong" answers worth revisiting first.
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

  window.Lab = {
    experiment: function (def) {
      var x = new Experiment(def);
      refresh();
      return x;
    },
    tween: tween,
    reduce: reduce,
  };
})();
