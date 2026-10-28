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
  function ticksHTML(done, total) {
    var html = "";
    // --i staggers the fill animation of ticked bars (css/system.css).
    for (var i = 0; i < total; i++) html += i < done ? '<i class="on" style="--i:' + i + '"></i>' : "<i></i>";
    return html;
  }

  var chapters = Array.prototype.map.call(document.querySelectorAll("li.chapter"), function (li) {
    var key = li.dataset.key;
    var total = +li.dataset.total || 0;
    var checks = read(key + "-checks", {});
    var done = Object.keys(checks).filter(function (k) {
      return checks[k];
    }).length;
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
    li.querySelector(".ticks").innerHTML = ticksHTML(item.done, total);
    li.querySelector(".ticks").dataset.tip = item.done + " of " + total + " chapter skills ticked";
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
        '<p class="count"><span class="ticks" aria-hidden="true" data-tip="' + c.done + " of " + c.total + ' chapter skills ticked">' + ticksHTML(c.done, c.total) + "</span>" +
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
