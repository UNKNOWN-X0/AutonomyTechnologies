/* Concept map in a guide: <div class="cmap" data-cmap> with li.cm-node[data-id][data-deps]. Without JavaScript every
   node shows its "Rests on" line. With it, the lines hide; choosing a node highlights everything it rests on
   (directly or indirectly) and shows its reason in the .cm-detail panel below. */
(function () {
  var map = document.querySelector("[data-cmap]");
  if (!map) return;
  var detail = map.parentNode.querySelector(".cm-detail"),
    nodes = {},
    buttons = [];
  map.classList.add("live");
  map.querySelectorAll(".cm-node").forEach(function (li) {
    var deps = (li.dataset.deps || "").split(" ").filter(Boolean),
      title = li.querySelector(".cm-title strong").textContent,
      b = document.createElement("button");
    b.type = "button";
    b.className = "cm-btn";
    b.setAttribute("aria-pressed", "false");
    // the title and formula become the button; the reason stays in the node for the detail panel
    b.appendChild(li.querySelector(".cm-title"));
    b.appendChild(li.querySelector(".cm-formula"));
    li.insertBefore(b, li.firstChild);
    nodes[li.dataset.id] = { li: li, deps: deps, title: title, btn: b, why: li.querySelector(".cm-why") };
    buttons.push(b);
    b.addEventListener("click", function () {
      select(li.dataset.id);
    });
  });
  function below(id, acc) {
    nodes[id].deps.forEach(function (d) {
      if (nodes[d] && !acc[d]) {
        acc[d] = true;
        below(d, acc);
      }
    });
    return acc;
  }
  // Lines: the selected node is joined to each idea it directly rests on, in the signal colours. One SVG layer over the
  // map, redrawn when the layout moves. Narrow screens stack the columns, so there the highlights alone carry the map.
  var NS = "http://www.w3.org/2000/svg",
    reduce = window.siteReduceMotion ? window.siteReduceMotion() : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    narrow = window.matchMedia("(max-width: 760px)"),
    svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "cm-links");
  svg.setAttribute("aria-hidden", "true");
  map.appendChild(svg);
  function box(li, origin) {
    var r = li.getBoundingClientRect();
    return { l: r.left - origin.left, r: r.right - origin.left, cy: r.top + r.height / 2 - origin.top };
  }
  // After a line has drawn, one small square runs along it from the idea to the selected node: the direction of "builds on".
  var pulses = [],
    loop = 0;
  function stopPulses() {
    cancelAnimationFrame(loop);
    pulses = [];
  }
  function pulse(t) {
    pulses = pulses.filter(function (p) {
      var k = (t - p.t0) / 500;
      if (k < 0) return true;
      if (k >= 1) {
        if (p.dot.parentNode) p.dot.parentNode.removeChild(p.dot);
        return false;
      }
      var e = 1 - Math.pow(1 - k, 2),
        pt = p.path.getPointAtLength(p.len * (1 - e));
      p.dot.setAttribute("x", pt.x - 3);
      p.dot.setAttribute("y", pt.y - 3);
      p.dot.setAttribute("opacity", 1);
      return true;
    });
    if (pulses.length) loop = requestAnimationFrame(pulse);
  }
  function draw(animate) {
    stopPulses();
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (!current || narrow.matches) return;
    var origin = map.getBoundingClientRect(),
      n = box(nodes[current].li, origin),
      defs = document.createElementNS(NS, "defs");
    svg.setAttribute("width", origin.width);
    svg.setAttribute("height", origin.height);
    svg.appendChild(defs);
    nodes[current].deps.forEach(function (dep, i) {
      if (!nodes[dep]) return;
      var d = box(nodes[dep].li, origin),
        x1, x2, c1, c2;
      if (d.r <= n.l + 2) {
        // the idea sits in a column to the left: leave by the node's left edge, arrive at its right edge
        x1 = n.l;
        x2 = d.r;
        c1 = x1 - Math.max(6, (x1 - x2) / 2);
        c2 = x2 + Math.max(6, (x1 - x2) / 2);
      } else if (d.l >= n.r - 2) {
        x1 = n.r;
        x2 = d.l;
        c1 = x1 + Math.max(6, (x2 - x1) / 2);
        c2 = x2 - Math.max(6, (x2 - x1) / 2);
      } else {
        // same column: a bracket through the gap on the right
        x1 = n.r;
        x2 = d.r;
        c1 = c2 = x1 + 14;
      }
      var id = "cm-g" + i,
        g = document.createElementNS(NS, "linearGradient");
      g.setAttribute("id", id);
      g.setAttribute("gradientUnits", "userSpaceOnUse");
      g.setAttribute("x1", x1);
      g.setAttribute("y1", n.cy);
      g.setAttribute("x2", x2);
      g.setAttribute("y2", d.cy);
      ["--signal-a", "--signal-b"].forEach(function (v, k) {
        var stop = document.createElementNS(NS, "stop");
        stop.setAttribute("offset", k);
        stop.setAttribute("style", "stop-color: var(" + v + ")");
        g.appendChild(stop);
      });
      defs.appendChild(g);
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", "M" + x1 + " " + n.cy + " C" + c1 + " " + n.cy + " " + c2 + " " + d.cy + " " + x2 + " " + d.cy);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "url(#" + id + ")");
      path.setAttribute("stroke-width", "3");
      svg.appendChild(path);
      if (animate && !reduce && path.animate) {
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
        var dot = document.createElementNS(NS, "rect");
        dot.setAttribute("width", 6);
        dot.setAttribute("height", 6);
        dot.setAttribute("opacity", 0);
        dot.setAttribute("style", "fill: var(--signal-b)");
        svg.appendChild(dot);
        pulses.push({ path: path, len: len, dot: dot, t0: performance.now() + 300 });
      }
    });
    if (pulses.length) loop = requestAnimationFrame(pulse);
  }
  var queued = false;
  function redraw() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      draw(false);
    });
  }
  window.addEventListener("resize", redraw);
  window.addEventListener("load", redraw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

  var current = null;
  function select(id, quiet) {
    if (current === id) id = null;
    current = id;
    var under = id ? below(id, {}) : {},
      direct = id ? nodes[id].deps : [];
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k];
      n.li.classList.toggle("on", k === id);
      n.li.classList.toggle("base", !!under[k]);
      n.li.classList.toggle("direct", direct.indexOf(k) !== -1);
      n.li.classList.toggle("dim", !!id && k !== id && !under[k]);
      n.btn.setAttribute("aria-pressed", String(k === id));
    });
    draw(!quiet);
    if (!detail) return;
    if (!id) {
      detail.hidden = true;
      return;
    }
    detail.hidden = false;
    detail.innerHTML = "";
    var head = document.createElement("strong");
    head.textContent = nodes[id].title + ". ";
    detail.appendChild(head);
    detail.appendChild(document.createTextNode(""));
    var why = nodes[id].why.cloneNode(true);
    while (why.firstChild) detail.appendChild(why.firstChild);
    var sec = nodes[id].li.dataset.sec,
      a = document.createElement("a");
    a.href = "#sec-" + sec.replace(".", "");
    a.textContent = "Read §" + sec;
    detail.appendChild(document.createTextNode(" "));
    detail.appendChild(a);
  }
  // Start on Gauss's law: it rests on most of the measured base, which shows how the map reads.
  if (nodes.gauss) select("gauss", true);
})();
