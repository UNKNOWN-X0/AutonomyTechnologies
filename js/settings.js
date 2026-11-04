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
    p.setAttribute(
      "d",
      "M10.3 2h3.4l.5 2.6 1.8.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.8 2.6.5v3.4l-2.6.5-.8 1.8 1.5 2.2-2.4 2.4-2.2-1.5-1.8.8-.5 2.6h-3.4l-.5-2.6-1.8-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.8L2 13.7v-3.4l2.6-.5.8-1.8-1.5-2.2 2.4-2.4 2.2 1.5 1.8-.8z"
    );
    c.setAttribute("cx", "12");
    c.setAttribute("cy", "12");
    c.setAttribute("r", "3.2");
    [p, c].forEach(function (el) {
      el.setAttribute("fill", "none");
      el.setAttribute("stroke", "currentColor");
      el.setAttribute("stroke-width", "2");
      el.setAttribute("stroke-linejoin", "miter");
      svg.appendChild(el);
    });
    return svg;
  }
  function build() {
    var dlg = document.createElement("dialog"),
      form = document.createElement("form"),
      h = document.createElement("h2"),
      close = document.createElement("button");
    dlg.className = "settings";
    dlg.setAttribute("aria-labelledby", "settings-h");
    form.method = "dialog";
    h.id = "settings-h";
    h.textContent = "Settings";
    form.appendChild(h);
    GROUPS.forEach(function (g) {
      var fs = document.createElement("fieldset"),
        lg = document.createElement("legend"),
        seg = document.createElement("div");
      lg.textContent = g[1];
      seg.className = "seg";
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
        });
        span.textContent = o[1];
        lab.appendChild(input);
        lab.appendChild(span);
        seg.appendChild(lab);
      });
      fs.appendChild(seg);
      form.appendChild(fs);
    });
    var note = document.createElement("p");
    note.className = "settings-note";
    note.textContent = "Saved in this browser. System follows your device's own setting.";
    form.appendChild(note);
    close.className = "btn primary";
    close.value = "close";
    close.textContent = "Done";
    form.appendChild(close);
    dlg.appendChild(form);
    // A click on the backdrop closes it, like Escape does.
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
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
