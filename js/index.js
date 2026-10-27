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
    for (var i = 0; i < total; i++) html += '<i class="' + (i < done ? "on" : "") + '"></i>';
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
    li.setAttribute("aria-label", li.querySelector(".title").textContent + ": " + item.done + " of " + total + " exam skills ticked");
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
        '<p class="count"><span class="ticks" aria-hidden="true">' + ticksHTML(c.done, c.total) + "</span>" +
        "<span>" + c.done + " / " + c.total + " skills</span></p>" +
        '<div class="go">' + c.links + "</div>" +
        "</li>"
      );
    })
    .join("");
})();
