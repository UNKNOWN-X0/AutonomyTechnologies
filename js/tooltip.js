/* Tooltips: any element with a data-tip attribute shows a small sign above it (below when there is no room).
   It appears after a short hover or at once on keyboard focus, and closes on leave, blur, scroll or Escape. */
(function () {
  var tip = document.createElement("div"),
    timer = null,
    current = null;
  tip.className = "tip";
  tip.id = "tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.appendChild(tip);

  function place(el) {
    var r = el.getBoundingClientRect(),
      t = tip.getBoundingClientRect(),
      x = Math.max(8, Math.min(r.left + r.width / 2 - t.width / 2, window.innerWidth - t.width - 8)),
      y = r.top - t.height - 10,
      side = "above";
    if (y < 8) {
      y = r.bottom + 10;
      side = "below";
    }
    tip.style.left = Math.round(x) + "px";
    tip.style.top = Math.round(y) + "px";
    tip.style.setProperty("--arrow", Math.round(r.left + r.width / 2 - x) + "px");
    tip.dataset.side = side;
  }
  function show(el) {
    clearTimeout(timer);
    if (current && current !== el) current.removeAttribute("aria-describedby");
    current = el;
    tip.textContent = el.dataset.tip;
    tip.classList.remove("on");
    tip.hidden = false;
    place(el);
    el.setAttribute("aria-describedby", "tip");
    requestAnimationFrame(function () {
      tip.classList.add("on");
    });
  }
  function hide() {
    clearTimeout(timer);
    if (current) current.removeAttribute("aria-describedby");
    current = null;
    tip.classList.remove("on");
    tip.hidden = true;
  }
  function target(e) {
    return e.target.closest ? e.target.closest("[data-tip]") : null;
  }

  document.addEventListener("pointerover", function (e) {
    var el = target(e);
    if (!el || e.pointerType === "touch" || el === current) return;
    clearTimeout(timer);
    // Once one tip is open, moving to the next shows it at once.
    timer = setTimeout(function () {
      show(el);
    }, current ? 0 : 350);
  });
  document.addEventListener("pointerout", function (e) {
    var el = target(e);
    if (el && !el.contains(e.relatedTarget)) {
      clearTimeout(timer);
      if (el === current) hide();
    }
  });
  document.addEventListener("focusin", function (e) {
    var el = target(e);
    if (el && el.matches(":focus-visible")) show(el);
  });
  document.addEventListener("focusout", function (e) {
    if (target(e) === current) hide();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) hide();
  });
  window.addEventListener("scroll", hide, { passive: true });
})();
