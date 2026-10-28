(function () {
  // Spaced review: each distinct study day logged by a guide widens the gap.
  var GAPS = [1, 7, 30];
  var DAY = 86400000;

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }
  function today() {
    var d = new Date();
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function parseDay(s) {
    var p = s.split("-");
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  // Guide skills first, then lab experiments after a small gap. --i staggers the fill animation.
  function ticksHTML(c) {
    var html = "",
      n = 0,
      guide = c.total - c.lab;
    function bars(done, count, first) {
      for (var i = 0; i < count; i++) {
        var cls = (i < done ? "on" : "") + (first && i === 0 ? " lab-start" : "");
        html += "<i" + (cls.trim() ? ' class="' + cls.trim() + '"' : "") + (i < done ? ' style="--i:' + n++ + '"' : "") + "></i>";
      }
    }
    bars(c.guideDone, guide, false);
    if (c.lab) bars(c.labDone, c.lab, true);
    return html;
  }
  function tickTip(c) {
    return c.lab ? c.guideDone + " of " + (c.total - c.lab) + " guide skills · " + c.labDone + " of " + c.lab + " lab experiments" : c.done + " of " + c.total + " chapter skills ticked";
  }

  var chapters = Array.prototype.map.call(document.querySelectorAll("li.chapter"), function (li) {
    var key = li.dataset.key;
    var total = +li.dataset.total || 0;
    var checks = read(key + "-checks", {});
    var lab = +li.dataset.lab || 0;
    var labDone = Object.keys(checks).filter(function (k) {
      return checks[k] && k.indexOf("lab-") === 0;
    }).length;
    var guideDone = Object.keys(checks).filter(function (k) {
      return checks[k] && k.indexOf("lab-") !== 0;
    }).length;
    var done = guideDone + labDone;
    var log = read(key + "-log", { days: [] });
    var days = (log.days || []).slice().sort();
    var item = {
      li: li,
      code: li.dataset.code,
      course: li.dataset.course,
      title: li.querySelector(".title").textContent,
      links: li.querySelector(".go").innerHTML,
      done: Math.min(done, total),
      total: total,
      lab: lab,
      labDone: Math.min(labDone, lab),
      guideDone: Math.min(guideDone, total - lab),
      state: "new",
      since: null,
      gap: GAPS[0],
      weight: 0,
    };
    if (days.length) {
      item.gap = GAPS[Math.min(days.length, GAPS.length) - 1];
      item.since = Math.round((today() - parseDay(days[days.length - 1])) / DAY);
      item.weight = item.since / item.gap;
      item.state = item.weight >= 2 ? "overdue" : item.weight >= 1 ? "due" : "fresh";
    } else if (done > 0) {
      item.state = "due";
      item.weight = 1;
    }
    li.querySelector(".ticks").innerHTML = ticksHTML(item);
    li.querySelector(".ticks").dataset.tip = tickTip(item);
    li.setAttribute("aria-label", li.querySelector(".title").textContent + ": " + item.done + " of " + total + " chapter skills ticked");
    return item;
  });

  var order = { overdue: 0, due: 1, new: 2, fresh: 3 };
  chapters.sort(function (a, b) {
    return order[a.state] - order[b.state] || b.weight - a.weight;
  });

  var rows = document.getElementById("rows");
  var started = chapters.some(function (c) {
    return c.state !== "new";
  });
  if (!started) {
    rows.hidden = true;
    tips();
    return;
  }
  document.getElementById("board-empty").hidden = true;

  function ago(n) {
    return n === 0 ? "today" : n === 1 ? "yesterday" : n + " days ago";
  }
  function when(c) {
    if (c.state === "new") return { big: "—", small: "not started" };
    if (c.since === null) return { big: "now", small: "first review" };
    if (c.state === "fresh") return { big: "in " + (c.gap - c.since) + " d", small: "reviewed " + ago(c.since) };
    var late = c.since - c.gap;
    if (late > 0) return { big: late + " d", small: "overdue · reviewed " + ago(c.since) };
    return { big: "due", small: "reviewed " + ago(c.since) };
  }

  rows.innerHTML = chapters
    .map(function (c) {
      var w = when(c);
      return (
        '<li class="row ' + c.state + '">' +
        '<p class="gap"><b>' + w.big + "</b><span>" + w.small + "</span></p>" +
        '<span class="code ' + c.course + '">' + c.code + "</span>" +
        '<h3 class="ch">' + c.title + "</h3>" +
        '<p class="count"><span class="ticks" aria-hidden="true" data-tip="' + tickTip(c) + '">' + ticksHTML(c) + "</span>" +
        "<span>" + c.done + " / " + c.total + " skills</span></p>" +
        '<div class="go">' + c.links + "</div>" +
        "</li>"
      );
    })
    .join("");

  tips();

  // Tooltips (shown by js/tooltip.js). Runs whether or not any chapter has been started.
  function tips() {
    var names = {};
    document.querySelectorAll("li.subject").forEach(function (sub) {
      var code = sub.querySelector(".code"),
        name = sub.querySelector("h3"),
        module = sub.querySelector(".module");
      if (!code || !name) return;
      names[code.textContent.trim()] = name.textContent.trim();
      code.dataset.tip = name.textContent.trim() + (module ? " · " + module.textContent.split("·")[0].trim() : "");
      sub.querySelectorAll(".parts li").forEach(function (part) {
        part.dataset.tip = part.classList.contains("has") ? "Material available" : "No material yet";
      });
    });
    document.querySelectorAll("#rows .code").forEach(function (code) {
      var name = names[code.textContent.trim()];
      if (name) code.dataset.tip = name;
    });
    document.querySelectorAll(".semesters a").forEach(function (a) {
      a.dataset.tip = "Jump to " + a.textContent.replace(/\s+/g, " ").trim().replace(/^\d+\s*/, "");
    });
  }
})();
