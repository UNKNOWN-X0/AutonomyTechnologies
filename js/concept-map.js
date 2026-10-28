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
  var current = null;
  function select(id) {
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
  if (nodes.gauss) select("gauss");
})();
