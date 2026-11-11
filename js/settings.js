(function () {
  // Site settings: theme, motion and text size. This file loads in <head>, before the page paints, so a chosen theme
  // never flashes the other one first. Choices are saved in this browser only.
  var KEY = "site-settings",
    root = document.documentElement,
    prefs = {};
  try {
    prefs = JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (e) {}
  function apply() {
    if (prefs.theme === "light" || prefs.theme === "dark") root.dataset.theme = prefs.theme;
    else delete root.dataset.theme;
    if (prefs.motion === "reduced") root.dataset.motion = "reduced";
    else delete root.dataset.motion;
    if (prefs.text === "large") root.dataset.text = "large";
    else delete root.dataset.text;
  }
  apply();
  // A folded contents rail (js/nav.js) is applied here too, before the page paints.
  try {
    if (localStorage.getItem("rail-folded") === "1") root.classList.add("rail-folded");
  } catch (e) {}
  // The HUD layer (js/hud.js) rides along with this file, so pages need no extra script tag.
  if (document.currentScript) {
    var hud = document.createElement("script");
    hud.src = document.currentScript.src.replace(/settings\.js(\?.*)?$/, "hud.js");
    document.head.appendChild(hud);
  }
  // Every script asks this instead of the media query, so the site setting and the system setting both count.
  window.siteReduceMotion = function () {
    return root.dataset.motion === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  var GROUPS = [
    ["theme", "Theme", [["system", "System"], ["light", "Light"], ["dark", "Dark"]]],
    ["motion", "Motion", [["system", "System"], ["reduced", "Reduced"]]],
    ["text", "Text size", [["default", "Default"], ["large", "Large"]]],
  ];
  function gear() {
    var NS = "http://www.w3.org/2000/svg",
      svg = document.createElementNS(NS, "svg"),
      p = document.createElementNS(NS, "path"),
      c = document.createElementNS(NS, "circle");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("aria-hidden", "true");
    // Eight identical teeth computed around the centre, so the outline is exactly symmetric.
    var d = "",
      pt = function (r, deg) {
        var a = ((deg - 90) * Math.PI) / 180;
        return (12 + r * Math.cos(a)).toFixed(2) + " " + (12 + r * Math.sin(a)).toFixed(2);
      };
    for (var t = 0; t < 8; t++) {
      var a = t * 45;
      d += (t ? "L" : "M") + pt(7.3, a - 13) + "L" + pt(10, a - 8) + "L" + pt(10, a + 8) + "L" + pt(7.3, a + 13);
    }
    p.setAttribute("d", d + "Z");
    c.setAttribute("cx", "12");
    c.setAttribute("cy", "12");
    c.setAttribute("r", "3");
    [p, c].forEach(function (el) {
      el.setAttribute("fill", "none");
      el.setAttribute("stroke", "currentColor");
      el.setAttribute("stroke-width", "1.8");
      el.setAttribute("stroke-linejoin", "miter");
      svg.appendChild(el);
    });
    return svg;
  }
  // Small drawn marks for each choice, in the site's square vocabulary (currentColor, so they follow the segment).
  var ICONS = {
    "theme-system": '<rect x="3.5" y="3.5" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 16.5 16.5 3.5V16.5Z" fill="currentColor"/>',
    "theme-light": '<rect x="3.5" y="3.5" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    "theme-dark": '<rect x="3.5" y="3.5" width="13" height="13" fill="currentColor" stroke="currentColor" stroke-width="1.6"/>',
    "motion-system": '<rect x="1.5" y="8" width="4" height="4" fill="currentColor" opacity=".3"/><rect x="7" y="8" width="4" height="4" fill="currentColor" opacity=".6"/><rect x="12.5" y="7" width="6" height="6" fill="currentColor"/>',
    "motion-reduced": '<rect x="7" y="7" width="6" height="6" fill="currentColor"/>',
    "text-default": '<text x="10" y="14.5" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" font-family="Hanken Grotesk, system-ui, sans-serif">Aa</text>',
    "text-large": '<text x="10" y="16" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor" font-family="Hanken Grotesk, system-ui, sans-serif">Aa</text>',
  };
  function icon(key) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 20 20");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = ICONS[key] || "";
    return s;
  }
  // What is in effect now, in words: "Dark (from your device) · Full motion · Default text".
  function status() {
    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches,
      theme = prefs.theme ? (prefs.theme === "dark" ? "Dark" : "Light") : (dark ? "Dark" : "Light") + " (from your device)",
      motion = window.siteReduceMotion() ? "Reduced motion" + (prefs.motion ? "" : " (from your device)") : "Full motion",
      text = prefs.text === "large" ? "Large text" : "Default text";
    return theme + " · " + motion + " · " + text;
  }
  // The control console (owner's request, 2026-11-11: upgrade the settings, in the rail's instrument style). Four
  // corner brackets frame the panel and close in as it opens; a live line under the heading says what is in effect;
  // each choice carries a small drawn mark; a reticle glides to the chosen segment; the motion row shows a signal
  // square that travels only while motion is on. Reduced motion keeps every state and drops the movement.
  function build() {
    var dlg = document.createElement("dialog"),
      form = document.createElement("form"),
      head = document.createElement("div"),
      h = document.createElement("h2"),
      x = document.createElement("button"),
      now = document.createElement("p"),
      close = document.createElement("button");
    dlg.className = "settings";
    dlg.setAttribute("aria-labelledby", "settings-h");
    form.method = "dialog";
    head.className = "settings-head";
    h.id = "settings-h";
    h.textContent = "Settings";
    // the heading takes the first focus, so opening the panel does not ring the close button
    h.tabIndex = -1;
    h.setAttribute("autofocus", "");
    x.className = "settings-x";
    x.value = "close";
    x.setAttribute("aria-label", "Close settings");
    x.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 4 16 16M16 4 4 16" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    head.appendChild(h);
    head.appendChild(x);
    form.appendChild(head);
    now.className = "settings-now";
    now.setAttribute("aria-live", "polite");
    form.appendChild(now);
    var locks = [];
    function place(seg, lock) {
      var on = seg.querySelector("input:checked");
      if (!on || !seg.offsetWidth) return;
      var lab = on.parentNode;
      lock.style.left = lab.offsetLeft - 6 + "px";
      lock.style.width = lab.offsetWidth + 12 + "px";
    }
    function refresh() {
      now.textContent = status();
      locks.forEach(function (l) { place(l[0], l[1]); });
    }
    GROUPS.forEach(function (g) {
      var fs = document.createElement("fieldset"),
        lg = document.createElement("legend"),
        seg = document.createElement("div"),
        lock = document.createElement("span");
      lg.textContent = g[1];
      seg.className = "seg";
      lock.className = "seg-lock";
      lock.setAttribute("aria-hidden", "true");
      fs.appendChild(lg);
      g[2].forEach(function (o) {
        var lab = document.createElement("label"),
          input = document.createElement("input"),
          span = document.createElement("span");
        input.type = "radio";
        input.name = g[0];
        input.value = o[0];
        input.checked = (prefs[g[0]] || g[2][0][0]) === o[0];
        input.addEventListener("change", function () {
          if (o[0] === g[2][0][0]) delete prefs[g[0]];
          else prefs[g[0]] = o[0];
          try {
            localStorage.setItem(KEY, JSON.stringify(prefs));
          } catch (e) {}
          apply();
          refresh();
          lock.classList.remove("lock-in");
          void lock.offsetWidth;
          lock.classList.add("lock-in");
        });
        span.appendChild(icon(g[0] + "-" + o[0]));
        span.appendChild(document.createTextNode(o[1]));
        lab.appendChild(input);
        lab.appendChild(span);
        seg.appendChild(lab);
      });
      seg.appendChild(lock);
      locks.push([seg, lock]);
      fs.appendChild(seg);
      if (g[0] === "motion") {
        var demo = document.createElement("div");
        demo.className = "motion-demo";
        demo.setAttribute("aria-hidden", "true");
        demo.appendChild(document.createElement("i"));
        fs.appendChild(demo);
      }
      form.appendChild(fs);
    });
    var note = document.createElement("p");
    note.className = "settings-note";
    note.textContent = "Saved in this browser. System follows your device's own setting.";
    form.appendChild(note);
    // How to use and the Version log, linked from the folder this script was loaded from.
    var base = (document.currentScript || {}).src || (document.querySelector('script[src$="settings.js"]') || {}).src;
    if (base) {
      var links = document.createElement("p");
      links.className = "settings-links";
      [["about/how-to-use.html", "How to use"], ["about/version-log.html", "Version log"]].forEach(function (l) {
        var a = document.createElement("a");
        a.className = "btn";
        a.href = new URL("../" + l[0], base).href;
        a.textContent = l[1];
        links.appendChild(a);
      });
      form.appendChild(links);
    }
    close.className = "btn primary";
    close.value = "close";
    close.textContent = "Done";
    form.appendChild(close);
    dlg.appendChild(form);
    // A click on the backdrop closes it, like Escape does.
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", refresh);
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", refresh);
    dlg.refresh = refresh;
    document.body.appendChild(dlg);
    return dlg;
  }
  function button(dlg) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "settings-btn";
    b.setAttribute("aria-label", "Settings");
    b.dataset.tip = "Theme, motion and text size";
    b.appendChild(gear());
    b.addEventListener("click", function () {
      if (dlg.showModal) dlg.showModal();
      dlg.refresh();
    });
    return b;
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.HTMLDialogElement) return;
    var dlg = build(),
      home = document.querySelector("nav.toc a.home"),
      sems = document.querySelector("header .semesters");
    if (home) {
      // Guides and labs: the button sits beside "All semesters".
      var row = document.createElement("div");
      row.className = "home-row";
      home.parentNode.insertBefore(row, home);
      row.appendChild(home);
      row.appendChild(button(dlg));
    } else if (sems) {
      var tools = document.createElement("div");
      tools.className = "field-tools";
      sems.parentNode.insertBefore(tools, sems);
      tools.appendChild(sems);
      tools.appendChild(button(dlg));
    }
  });
})();
