/* The orb: this site's own code graph (assets/graph-orb.json, from tools/graph-orb.py) as a slowly turning
   ball of dots at the bottom of the home page. Each dot is one part of the code or docs, coloured by subject;
   lines are the connections Graphify found. Drag (or use the arrow keys) to turn it. Loads only when scrolled
   near, pauses off screen, and stays still when motion is reduced. */
(function () {
  var fig = document.querySelector(".orb");
  if (!fig || !window.HTMLCanvasElement) return;
  var canvas = fig.querySelector("canvas"), cap = fig.querySelector("[data-orb-caption]");
  var data = null, pts = null, colours = null, yaw = 0.6, pitch = -0.35, spin = 0, visible = false, raf = 0,
    drag = null, last = 0;

  function reduced() { return window.siteReduceMotion ? window.siteReduceMotion() : false; }
  function token(name, fallback) { return getComputedStyle(fig).getPropertyValue(name).trim() || fallback; }
  function readColours() {
    colours = { a: token("--apdr-2", "#a497ea"), m: token("--mei-2", "#a4cd79"), e: token("--eei-2", "#cc9c42"),
      s: token("--muted", "#45556d"), line: token("--line", "#d3dbe6") };
  }

  function draw() {
    raf = 0;
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!r.width) return;
    if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
    var ctx = canvas.getContext("2d"), w = r.width, h = r.height, s = Math.min(w, h) * 0.34; // with the 3.5 perspective below, the nearest dots stay inside the canvas
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), n = data.nodes, i;
    // rotate (yaw about the vertical axis, then pitch) and project with a gentle perspective
    for (i = 0; i < n; i++) {
      var x = data.xyz[3 * i] / 1000, y = data.xyz[3 * i + 1] / 1000, z = data.xyz[3 * i + 2] / 1000;
      var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      var y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp, k = 3.5 / (3.5 + z2);
      pts[4 * i] = w / 2 + x1 * s * k; pts[4 * i + 1] = h / 2 + y2 * s * k; pts[4 * i + 2] = z2; pts[4 * i + 3] = k;
    }
    ctx.strokeStyle = colours.line; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (i = 0; i < data.edges.length; i += 2) {
      var a = data.edges[i], b = data.edges[i + 1];
      ctx.moveTo(pts[4 * a], pts[4 * a + 1]); ctx.lineTo(pts[4 * b], pts[4 * b + 1]);
    }
    ctx.stroke();
    // back to front, so near dots sit on top; far dots are smaller and fainter
    var order = data.order;
    order.sort(function (p, q) { return pts[4 * q + 2] - pts[4 * p + 2]; });
    for (var j = 0; j < n; j++) {
      i = order[j];
      var depth = (1 - pts[4 * i + 2]) / 2;
      ctx.globalAlpha = 0.35 + 0.65 * depth;
      ctx.fillStyle = colours[data.subject[i]];
      ctx.beginPath(); ctx.arc(pts[4 * i], pts[4 * i + 1], (1.1 + 1.6 * depth) * pts[4 * i + 3], 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function frame(t) {
    if (last && !drag && !reduced()) yaw += Math.min(t - last, 50) * 0.00012;
    last = t;
    draw();
    if (visible && !reduced()) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  function kick() {
    if (!data) return;
    if (visible && !reduced()) { if (!raf) raf = requestAnimationFrame(frame); }
    else if (!raf) raf = requestAnimationFrame(draw);
  }

  function load() {
    fetch(canvas.dataset.src).then(function (r) { return r.json(); }).then(function (d) {
      data = d;
      pts = new Float32Array(d.nodes * 4);
      d.order = Array.from({ length: d.nodes }, function (_, i) { return i; });
      readColours();
      if (cap) cap.textContent = "This site, drawn from its own code: " + d.nodes + " parts in " + d.groups +
        " groups, joined by " + d.edges.length / 2 + " links. Violet is APDR, green MEI, amber EEI, grey shared. Drag to turn it.";
      canvas.setAttribute("aria-label", "A turning ball of " + d.nodes + " dots: this site's code, coloured by subject");
      fig.classList.add("ready");
      kick();
    }).catch(function () { fig.hidden = true; });
  }

  new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    if (visible && !data && !fig.dataset.loading) { fig.dataset.loading = "1"; load(); }
    kick();
  }, { rootMargin: "300px" }).observe(fig);

  canvas.addEventListener("pointerdown", function (e) {
    drag = { x: e.clientX, y: e.clientY, yaw: yaw, pitch: pitch };
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008));
    if (!raf) raf = requestAnimationFrame(draw);
  });
  ["pointerup", "pointercancel"].forEach(function (t) { canvas.addEventListener(t, function () { drag = null; kick(); }); });
  canvas.addEventListener("keydown", function (e) {
    var d = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
    if (!d) return;
    e.preventDefault(); yaw += d[0]; pitch = Math.max(-1.4, Math.min(1.4, pitch + d[1]));
    if (!raf) raf = requestAnimationFrame(draw);
  });
  // theme or motion changed in Settings, or the window resized
  new MutationObserver(function () { if (data) { readColours(); kick(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-motion", "class"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { if (data) { readColours(); kick(); } });
  window.addEventListener("resize", function () { if (data && !raf) raf = requestAnimationFrame(draw); });
})();
