/* APDR Chapter 2: algorithm, Boolean decision, NAND, and signal timing experiments. */
(function () {
  var P = window.APDR2,
    canvases = [];

  function colours(stage) {
    var s = getComputedStyle(stage);
    return {
      paper: s.getPropertyValue("--paper").trim(),
      panel: s.getPropertyValue("--paper-2").trim(),
      ink: s.getPropertyValue("--ink").trim(),
      muted: s.getPropertyValue("--muted").trim(),
      line: s.getPropertyValue("--line").trim(),
      fau: s.getPropertyValue("--fau-mark").trim(),
      course: s.getPropertyValue("--course").trim(),
      act: s.getPropertyValue("--act").trim(),
      font: s.getPropertyValue("--f-display").trim(),
    };
  }

  function queue(canvas, state) {
    canvas._labState = state;
    if (canvas._paint) cancelAnimationFrame(canvas._paint);
    canvas._paint = requestAnimationFrame(function () {
      canvas._paint = 0;
      var rect = canvas.parentElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2),
        ctx = canvas.getContext("2d"),
        c = colours(canvas.parentElement);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = c.paper;
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (state.kind === "algorithm") drawAlgorithm(ctx, rect.width, rect.height, c, state);
      if (state.kind === "logic") drawLogic(ctx, rect.width, rect.height, c, state);
      if (state.kind === "nand") drawNand(ctx, rect.width, rect.height, c, state);
      if (state.kind === "timing") drawTiming(ctx, rect.width, rect.height, c, state);
      if (state.kind === "equivalent") drawEquivalent(ctx, rect.width, rect.height, c, state);
    });
  }

  function text(ctx, value, x, y, c, size, align) {
    ctx.fillStyle = c.ink;
    ctx.font = "600 " + (size || 14) + "px " + (c.font || "sans-serif");
    ctx.textAlign = align || "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(value), x, y);
  }

  function box(ctx, label, x, y, w, h, c, active, size) {
    ctx.fillStyle = active ? c.panel : c.paper;
    ctx.strokeStyle = active ? c.fau : c.line;
    ctx.lineWidth = active ? 2.5 : 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    text(ctx, label, x + w / 2, y + h / 2, c, size || 13);
  }

  function wire(ctx, x1, y1, x2, y2, c, strong) {
    ctx.strokeStyle = strong ? c.fau : c.muted;
    ctx.lineWidth = strong ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1), l = 7;
    ctx.fillStyle = strong ? c.fau : c.muted;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - l * Math.cos(a - 0.45), y2 - l * Math.sin(a - 0.45));
    ctx.lineTo(x2 - l * Math.cos(a + 0.45), y2 - l * Math.sin(a + 0.45));
    ctx.closePath();
    ctx.fill();
  }

  function drawAlgorithm(ctx, w, h, c, s) {
    var x = 18, gap = 8, y = 58, bh = 62, bw = (w - 36 - gap * 3) / 4,
      labels = ["Guess g", "Test closeness", "Stop?", "Update g"],
      active = Math.min(3, Math.floor((s.progress || 0) * 4));
    text(ctx, "Square-root iteration", w / 2, 25, c, 17);
    labels.forEach(function (label, i) {
      var bx = x + i * (bw + gap);
      box(ctx, label, bx, y, bw, bh, c, i === active && !!s.revealing, 12);
      if (i < 3) wire(ctx, bx + bw, y + bh / 2, bx + bw + gap, y + bh / 2, c, i === active && !!s.revealing);
    });
    text(ctx, "g ← (g + x/g) / 2", w / 2, y + bh + 35, c, 15);
    text(ctx, "x = " + (s.x == null ? 16 : s.x) + "     g = " + (s.g == null ? 3 : Number(s.g).toFixed(3)), w / 2, h - 55, c, 14);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 28, c, 13);
    if (s.result) text(ctx, "Result: " + s.result, w / 2, h - 28, c, 13);
  }

  function drawLogic(ctx, w, h, c, s) {
    var vals = s.bits || { car: false, forecast: false, rain: false },
      top = 46, inputX = 16, inputW = 54, inputH = 36,
      gateW = Math.min(72, w * 0.19), gateH = 38,
      gateX = w * 0.39 - gateW / 2, andX = w * 0.67 - gateW / 2,
      outputX = w - 48;
    text(ctx, "U = NOT C AND (W OR R)", w / 2, 25, c, 17);
    ["car", "forecast", "rain"].forEach(function (key, i) {
      var y = top + i * 50;
      box(ctx, ["C", "W", "R"][i] + " = " + Number(!!vals[key]), inputX, y, inputW, inputH, c, false, 12);
    });
    box(ctx, "NOT C", gateX, top, gateW, gateH, c, s.revealing && s.progress > 0.25, 12);
    box(ctx, "W OR R", gateX, top + 100, gateW, gateH, c, s.revealing && s.progress > 0.25, 11);
    box(ctx, "AND", andX, top + 50, gateW, gateH, c, s.revealing && s.progress > 0.55, 13);
    wire(ctx, inputX + inputW, top + inputH / 2, gateX, top + gateH / 2, c, false);
    wire(ctx, inputX + inputW, top + 50 + inputH / 2, gateX, top + 100 + gateH / 2 - 9, c, false);
    wire(ctx, inputX + inputW, top + 100 + inputH / 2, gateX, top + 100 + gateH / 2 + 9, c, false);
    wire(ctx, gateX + gateW, top + gateH / 2, andX, top + 50 + gateH / 2 - 9, c, s.revealing && s.progress > 0.35);
    wire(ctx, gateX + gateW, top + 100 + gateH / 2, andX, top + 50 + gateH / 2 + 9, c, s.revealing && s.progress > 0.55);
    wire(ctx, andX + gateW, top + 50 + gateH / 2, outputX, top + 50 + gateH / 2, c, s.revealing && s.progress > 0.8);
    box(ctx, "U = " + (s.result == null ? "?" : Number(s.result)), outputX, top + 50 + 1, 44, 36, c, !!s.result, 11);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 45, c, 12);
  }

  function drawNand(ctx, w, h, c, s) {
    var mode = s.fn || "and", a = !!s.a, b = !!s.b, y = 55, bw = 72, bh = 42;
    text(ctx, "Build the function from NAND gates", w / 2, 24, c, 16);
    text(ctx, "A = " + Number(a), 32, y + 21, c, 13, "left");
    if (mode !== "not") text(ctx, "B = " + Number(b), 32, y + 84, c, 13, "left");
    if (mode === "not") {
      box(ctx, "NAND", w * 0.47 - bw / 2, y + 12, bw, bh, c, s.revealing && s.progress > 0.35, 12);
      text(ctx, "A", w * 0.29, y + 25, c, 13);
      wire(ctx, 68, y + 21, w * 0.47 - bw / 2, y + 25, c, true);
      wire(ctx, 68, y + 21, w * 0.47 - bw / 2, y + 40, c, false);
      wire(ctx, w * 0.47 + bw / 2, y + 33, w - 67, y + 33, c, true);
      box(ctx, s.result == null ? "NOT A" : "= " + Number(s.result), w - 63, y + 12, 58, bh, c, !!s.result, 12);
      text(ctx, "A NAND A = NOT A", w / 2, y + 113, c, 13);
    } else if (mode === "and") {
      box(ctx, "NAND 1", w * 0.39 - bw / 2, y + 24, bw, bh, c, s.revealing && s.progress < 0.55, 11);
      box(ctx, "NAND 2", w * 0.69 - bw / 2, y + 24, bw, bh, c, s.revealing && s.progress >= 0.55, 11);
      wire(ctx, 70, y + 21, w * 0.39 - bw / 2, y + 34, c, true);
      wire(ctx, 70, y + 84, w * 0.39 - bw / 2, y + 55, c, true);
      wire(ctx, w * 0.39 + bw / 2, y + 45, w * 0.69 - bw / 2, y + 45, c, true);
      wire(ctx, w * 0.39 + bw / 2, y + 45, w * 0.69 - bw / 2, y + 60, c, false);
      wire(ctx, w * 0.69 + bw / 2, y + 45, w - 65, y + 45, c, true);
      text(ctx, "A AND B", w - 30, y + 20, c, 11);
      box(ctx, s.result == null ? "?" : "= " + Number(s.result), w - 64, y + 32, 58, bh, c, !!s.result, 12);
    } else {
      box(ctx, "NAND A", w * 0.37 - bw / 2, y + 6, bw, bh, c, s.revealing && s.progress < 0.38, 11);
      box(ctx, "NAND B", w * 0.37 - bw / 2, y + 69, bw, bh, c, s.revealing && s.progress < 0.38, 11);
      box(ctx, "NAND 3", w * 0.69 - bw / 2, y + 38, bw, bh, c, s.revealing && s.progress >= 0.38, 11);
      wire(ctx, 70, y + 21, w * 0.37 - bw / 2, y + 18, c, true);
      wire(ctx, 70, y + 21, w * 0.37 - bw / 2, y + 34, c, false);
      wire(ctx, 70, y + 84, w * 0.37 - bw / 2, y + 80, c, true);
      wire(ctx, 70, y + 84, w * 0.37 - bw / 2, y + 96, c, false);
      wire(ctx, w * 0.37 + bw / 2, y + 27, w * 0.69 - bw / 2, y + 49, c, true);
      wire(ctx, w * 0.37 + bw / 2, y + 90, w * 0.69 - bw / 2, y + 66, c, true);
      wire(ctx, w * 0.69 + bw / 2, y + 59, w - 65, y + 59, c, true);
      box(ctx, s.result == null ? "?" : "= " + Number(s.result), w - 64, y + 46, 58, bh, c, !!s.result, 12);
    }
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 22, c, 13);
  }

  function drawTiming(ctx, w, h, c, s) {
    var x0 = 52, x1 = w - 22, yInput = 76, yOutput = 168, plotW = x1 - x0,
      a = !!s.a, before = !!s.before, after = !!s.after,
      oldOut = P.boolean(s.gate || "and", a, before), newOut = P.boolean(s.gate || "and", a, after),
      t = s.time == null ? 0.5 : Number(s.time), sampleX = x0 + plotW * Math.min(1, t / 2),
      switchX = x0 + plotW * 0.12, settleX = x0 + plotW * 0.62;
    text(ctx, s.gate === "or" ? "OR gate · symbolic delay τ" : "AND gate · symbolic delay τ", w / 2, 25, c, 15);
    text(ctx, "B input", 12, yInput, c, 11, "left");
    text(ctx, "Output", 12, yOutput, c, 11, "left");
    ctx.strokeStyle = c.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, yInput + 22); ctx.lineTo(x1, yInput + 22); ctx.moveTo(x0, yOutput + 22); ctx.lineTo(x1, yOutput + 22); ctx.stroke();
    var hiB = before ? yInput : yInput + 34, loB = before ? yInput + 34 : yInput,
      hiO = oldOut ? yOutput : yOutput + 34, loO = oldOut ? yOutput + 34 : yOutput,
      endO = newOut ? yOutput : yOutput + 34;
    ctx.strokeStyle = c.fau; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, hiB); ctx.lineTo(switchX, hiB); ctx.lineTo(switchX, loB); ctx.lineTo(x1, loB); ctx.stroke();
    ctx.strokeStyle = c.course; ctx.beginPath(); ctx.moveTo(x0, hiO); ctx.lineTo(settleX, hiO); ctx.lineTo(settleX, endO); ctx.lineTo(x1, endO); ctx.stroke();
    ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(switchX, yInput - 8); ctx.lineTo(switchX, yOutput + 48); ctx.moveTo(settleX, yInput - 8); ctx.lineTo(settleX, yOutput + 48); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "0", switchX, yOutput + 63, c, 11);
    text(ctx, "τ", settleX, yOutput + 63, c, 11);
    text(ctx, "time", x1, yOutput + 63, c, 11, "right");
    ctx.strokeStyle = c.act; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sampleX, yInput - 10); ctx.lineTo(sampleX, yOutput + 45); ctx.stroke();
    text(ctx, "A=" + Number(a) + " · B: " + Number(before) + " → " + Number(after), w / 2, h - 30, c, 12);
    if (s.guess) text(ctx, "Your prediction: " + s.guess, w / 2, h - 10, c, 12);
    if (s.result != null) text(ctx, "Output at sample: " + (typeof s.result === "boolean" ? Number(s.result) : s.result), w / 2, h - 10, c, 12);
  }

  function stageFor(section, data) {
    var canvas = section.querySelector("canvas");
    data.progress = 0;
    data.revealing = false;
    canvas.setAttribute("aria-label", data.label || section.querySelector("h2").textContent);
    queue(canvas, data);
  }

  function bits(form, names) {
    var v = {};
    names.forEach(function (key) { v[key] = form.querySelector('[data-bit="' + key + '"]').value === "1"; });
    return v;
  }

  function lock(form, section, on) {
    form.querySelectorAll("input, select, button").forEach(function (el) { el.disabled = on; });
    section.querySelector(".stage").classList.toggle("locked", on);
  }

  function experimentAlgorithm() {
    var section = document.querySelector('[data-experiment="algorithm"]'),
      form = section.querySelector("form"), canvas = section.querySelector("canvas"),
      state = { kind: "algorithm", x: 16, g: 3 }, xInput = form.querySelector("[data-x]"), gInput = form.querySelector("[data-g]");
    function show() { queue(canvas, state); }
    form.querySelector('[data-act="step"]').addEventListener("click", function () {
      state.x = Number(xInput.value); state.g = Number(gInput.value);
      try { state.g = P.squareRootStep(state.x, state.g).next; gInput.value = state.g.toFixed(3); }
      catch (e) { form.querySelector('[data-out="guess"]').textContent = "check inputs"; return; }
      var residual = Math.abs(state.g * state.g - state.x);
      form.querySelector('[data-out="guess"]').textContent = state.g.toFixed(3);
      form.querySelector('[data-out="residual"]').textContent = residual.toPrecision(3);
      state.result = state.g.toFixed(3); show();
    });
    form.querySelector('[data-act="reset"]').addEventListener("click", function () { xInput.value = "16"; gInput.value = "3"; state.x = 16; state.g = 3; state.result = ""; form.querySelector('[data-out="guess"]').textContent = "3.000"; form.querySelector('[data-out="residual"]').textContent = "—"; show(); });
    Lab.experiment({
      id: "algorithm", title: "2.1 Square-root algorithm", card: section.querySelector(".challenge"),
      lock: function (on) { lock(form, section, on); },
      setup: function (challenge) { state.guess = state.result = ""; state.progress = 0; state.revealing = false; challenge.stage(); },
      sandbox: function () { state.guess = state.revealing = ""; state.x = Number(xInput.value); state.g = Number(gInput.value); show(); },
      challenges: [
        { id: "first-update", short: "the first estimate", ref: "2.1", prompt: "For x=16 and guess g=3, what is the first updated guess (to three decimals)?", options: [["4.167", "4.167"], ["3.500", "3.500"], ["5.167", "5.167"]], answer: "4.167", stage: function () { state.x=16;state.g=3;state.step=0;show(); }, preview: function (choice) { state.guess=choice;show(); }, reveal: function () { var r=P.squareRootStep(16,3); return Lab.tween(1400,function(t){state.progress=t;state.revealing=true;state.g=3+(r.next-3)*t;show();}).then(function(){state.revealing=false;state.g=r.next;state.result=r.next.toFixed(3);show();}); }, why: "The update is (3+16/3)/2=25/6≈4.167. The new guess comes from the rule, not from averaging the target with the old guess." },
        { id: "test-first", short: "whether the first estimate passes", ref: "2.1", prompt: "At g=4.167 for x=16, is |g²−x| above or below the practice tolerance 0.01?", options: [["above", "Above 0.01"], ["below", "Below 0.01"]], answer: "above", stage: function () { state.x=16;state.g=25/6;state.result="";show(); }, preview: function (choice) { state.guess=choice;show(); }, reveal: function () { state.revealing=true;return Lab.tween(1200,function(t){state.progress=t;show();}).then(function(){state.revealing=false;state.result="residual ≈ 1.36 · continue";show();}); }, why: "The residual is |(25/6)²−16|=49/36≈1.36, which is greater than 0.01. The control flow therefore repeats the update instead of stopping." },
        { id: "second-update", short: "the second estimate", ref: "2.1", prompt: "Starting from g=4.167 with x=16, what is the next estimate to three decimals?", options: [["4.003", "4.003"], ["4.167", "4.167"], ["3.840", "3.840"]], answer: "4.003", stage: function () { state.x=16;state.g=25/6;state.result="";show(); }, preview: function (choice) { state.guess=choice;show(); }, reveal: function () { var r=P.squareRootStep(16,25/6);return Lab.tween(1400,function(t){state.progress=t;state.revealing=true;state.g=25/6+(r.next-25/6)*t;show();}).then(function(){state.revealing=false;state.g=r.next;state.result=r.next.toFixed(3);show();}); }, why: "The next update is (4.167+16/4.167)/2≈4.003. The estimate moves closer to 4 because the guess was slightly too high." },
        { id: "stop-test", short: "when to stop", ref: "2.1", prompt: "At g≈4.003 for x=16, does the next update make the residual smaller than 0.01?", options: [["stop", "Yes · stop"], ["continue", "No · continue"]], answer: "stop", stage: function () { state.x=16;state.g=4.003333333333333;state.result="";show(); }, preview: function (choice) { state.guess=choice;show(); }, reveal: function () { var r=P.squareRootStep(16,4.003333333333333);return Lab.tween(1400,function(t){state.progress=t;state.revealing=true;state.g=4.003333333333333+(r.next-4.003333333333333)*t;show();}).then(function(){state.revealing=false;state.g=r.next;state.result="residual < 0.01 · stop";show();}); }, why: "The next estimate is about 4.000 and its residual is far below 0.01. The stopping test is now true, so the procedure returns an answer." },
      ],
    });
  }

  function experimentLogic() {
    var section = document.querySelector('[data-experiment="logic"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"), state = { kind: "logic" };
    function show() { queue(canvas,state); }
    form.querySelector('[data-act="evaluate"]').addEventListener("click",function(){state.bits=bits(form,["car","forecast","rain"]);state.result=P.umbrella(state.bits.car,state.bits.forecast,state.bits.rain);form.querySelector('[data-out="result"]').textContent=Number(state.result);show();});
    function challenge(id,short,car,forecast,rain,answer,prompt,why){return {id:id,short:short,ref:"2.4",prompt:prompt,options:[["0","U = 0 · no umbrella"],["1","U = 1 · take umbrella"]],answer:String(Number(answer)),stage:function(){state.bits={car:!!car,forecast:!!forecast,rain:!!rain};state.result=null;show();},preview:function(choice){state.guess="U = "+choice;show();},reveal:function(){state.result=P.umbrella(!!car,!!forecast,!!rain);state.revealing=true;return Lab.tween(1300,function(t){state.progress=t;show();}).then(function(){state.revealing=false;show();});},why:why};}
    Lab.experiment({id:"logic",title:"2.4 Boolean umbrella rule",card:section.querySelector(".challenge"),lock:function(on){lock(form,section,on);},setup:function(challenge){state.guess="";state.result=null;state.progress=0;state.revealing=false;challenge.stage();},sandbox:function(){state.guess="";state.bits=bits(form,["car","forecast","rain"]);state.result=null;show();},challenges:[
      challenge("clear-day", "clear day",0,0,0,false,"You are not taking the car (C=0), the forecast is good (W=0), and it is not raining (R=0). What is U?","C'=1, but W+R=0, so U=1·0=0. Without either weather condition, the rule says no umbrella."),
      challenge("bad-forecast", "bad forecast",0,1,0,true,"You are not taking the car (C=0), and only the forecast is bad (W=1, R=0). What is U?","C'=1 and W+R=1, so U=1. Either weather condition is enough when you are not taking the car."),
      challenge("rain", "rain",0,0,1,true,"You are not taking the car (C=0), and it is raining (R=1) with a good forecast (W=0). What is U?","C'=1 and W+R=1 because R=1, so U=1. The OR is inclusive and either condition can make it true."),
      challenge("car", "car condition",1,1,1,false,"You are taking the car (C=1), with bad weather (W=1) and rain (R=1). What is U?","C'=0, so C'·(W+R)=0 even though both weather inputs are 1. The outer AND condition still has to be true."),
    ]});
  }

  function nandValue(fn,a,b){return fn==="not"?P.nand(a,a):fn==="and"?P.nandAnd(a,b):P.nandOr(a,b);}
  function experimentNand(){
    var section=document.querySelector('[data-experiment="nand"]'),form=section.querySelector("form"),canvas=section.querySelector("canvas"),state={kind:"nand"};
    function show(){queue(canvas,state);}
    form.querySelector('[data-act="build"]').addEventListener("click",function(){state.fn=form.querySelector("[data-fn]").value;state.a=form.querySelector('[data-bit="a"]').value==="1";state.b=form.querySelector('[data-bit="b"]').value==="1";state.result=nandValue(state.fn,state.a,state.b);form.querySelector('[data-out="result"]').textContent=Number(state.result);show();});
    function challenge(id,short,fn,a,b,answer,prompt,why){return {id:id,short:short,ref:"2.7",prompt:prompt,options:[["0","Output 0"],["1","Output 1"]],answer:String(Number(answer)),stage:function(){state.fn=fn;state.a=!!a;state.b=!!b;state.result=null;show();},preview:function(choice){state.guess="Output "+choice;show();},reveal:function(){state.result=nandValue(fn,!!a,!!b);state.revealing=true;return Lab.tween(1350,function(t){state.progress=t;show();}).then(function(){state.revealing=false;show();});},why:why};}
    Lab.experiment({id:"nand",title:"2.7 Build functions with NAND",card:section.querySelector(".challenge"),lock:function(on){lock(form,section,on);},setup:function(challenge){state.guess="";state.result=null;state.progress=0;state.revealing=false;challenge.stage();},sandbox:function(){state.guess="";state.fn=form.querySelector("[data-fn]").value;state.a=form.querySelector('[data-bit="a"]').value==="1";state.b=form.querySelector('[data-bit="b"]').value==="1";state.result=null;show();},challenges:[
      challenge("nand-one", "NAND of two 1s", "and",1,1,0,"A single NAND gate receives A=1 and B=1. What is its output?","AND gives 1 for two true inputs, then NAND inverts it to 0. The output is low only for the 1,1 input pair."),
      challenge("not-tied", "NOT from tied inputs", "not",0,0,1,"Both inputs of one NAND gate are tied to A=0. What is the output?","NAND(A,A)=NOT A. With A=0, the AND is 0 and inversion gives 1."),
      challenge("and-build", "AND from NAND", "and",1,0,0,"A=1 and B=0 feed the two-NAND AND construction. What is the final output?","The first NAND gives 1 for inputs 1 and 0; the second NAND ties those outputs together and inverts 1 to 0. That reproduces A AND B."),
      challenge("or-build", "OR from NAND", "or",0,1,1,"A=0 and B=1 feed the three-NAND OR construction. What is the final output?","The tied-input NANDs form NOT A=1 and NOT B=0; NAND(1,0)=1. This is A OR B, built with NAND gates only."),
    ]});
  }

  function experimentTiming(){
    var section=document.querySelector('[data-experiment="timing"]'),form=section.querySelector("form"),canvas=section.querySelector("canvas"),state={kind:"timing",gate:"and",before:false,after:true,time:0.5};
    function show(){queue(canvas,state);}
    form.querySelector('[data-act="sample"]').addEventListener("click",function(){state.gate=form.querySelector("[data-gate]").value;state.a=form.querySelector('[data-bit="a"]').value==="1";state.after=form.querySelector('[data-bit="b"]').value==="1";state.before=false;state.time=Number(form.querySelector("[data-time]").value);state.result=P.delayedOutput(P.boolean(state.gate,state.a,state.before),P.boolean(state.gate,state.a,state.after),state.time,1);form.querySelector('[data-out="result"]').textContent=Number(state.result);show();});
    function challenge(id,short,prompt,answer,gate,a,before,after,time,why){return {id:id,short:short,ref:"2.8",prompt:prompt,options:[["old","Old output"],["new","New output"],["unknown","Cannot tell from the information"]],answer:answer,stage:function(){state.kind="timing";state.gate=gate;state.a=!!a;state.before=!!before;state.after=!!after;state.time=time;state.result=null;state.guess="";show();},preview:function(choice){state.guess=choice==="old"?"Old output":choice==="new"?"New output":"Need timing data";show();},reveal:function(){state.revealing=true;return Lab.tween(1300,function(t){state.progress=t;state.time=2*t;show();}).then(function(){state.revealing=false;state.result=answer==="old"?P.boolean(gate,!!a,!!before):answer==="new"?P.boolean(gate,!!a,!!after):null;state.time=time;show();});},why:why};}
    Lab.experiment({id:"timing",title:"2.8 Logic and circuit timing",card:section.querySelector(".challenge"),lock:function(on){lock(form,section,on);},setup:function(challenge){state.kind="timing";state.guess="";state.result=null;state.progress=0;state.revealing=false;challenge.stage();},sandbox:function(){state.kind="timing";state.guess="";state.result=null;state.gate=form.querySelector("[data-gate]").value;state.a=form.querySelector('[data-bit="a"]').value==="1";state.after=form.querySelector('[data-bit="b"]').value==="1";state.before=false;state.time=Number(form.querySelector("[data-time]").value);show();},challenges:[
      challenge("delay-start","output before propagation", "An AND gate has A=1 and B changes 0→1 at t=0. At t=0.5τ, before one gate delay has passed, which output is settled?","old","and",1,0,1,0.5,"Before the symbolic delay τ has passed, the output remains at its previous stable value, 0. After τ it settles to the Boolean result 1. The page uses τ only as a teaching symbol, not a measured duration."),
      challenge("delay-end","output after propagation", "An OR gate has A=0 and B changes 0→1 at t=0. At t=τ, after one symbolic gate delay, which output has settled?","new","or",0,0,1,1,"At t=τ the output has reached the new stable value A OR B=1. The truth table gives the destination; the timing trace shows that it is not instantaneous."),
      {id:"saturation",short:"the switching-speed limit",ref:"2.8",prompt:"If an input toggles faster than a gate can settle, what does saturation limit?",options:[["rate","Maximum switching rate"],["truth","Stable Boolean result"],["voltage","Logic voltage level"]],answer:"rate",stage:function(){state.kind="timing";state.gate="and";state.a=true;state.before=false;state.after=true;state.time=0.5;state.result=null;state.guess="";show();},preview:function(choice){state.guess=choice==="rate"?"Maximum switching rate":"Prediction: "+choice;show();},reveal:function(){state.revealing=true;return Lab.tween(1300,function(t){state.progress=t;show();}).then(function(){state.revealing=false;state.result="response speed limit";show();});},why:"Saturation limits how quickly a physical gate can respond to changing inputs. The slides identify a switching-speed limit but give no numeric response curve or measured delay."},
      {id:"timing-data",short:"what equivalence says about speed",ref:"2.8",prompt:"A direct OR gate and an equivalent three-NAND circuit produce the same stable truth table. Without delay measurements, which can you say is faster?",options:[["direct","Direct OR is definitely faster"],["nand","The NAND circuit is definitely faster"],["unknown","The truth table cannot decide timing"]],answer:"unknown",stage:function(){state.kind="equivalent";state.result=null;state.guess="";show();},preview:function(choice){state.guess=choice==="unknown"?"Truth table only":"Prediction: "+choice;show();},reveal:function(){state.kind="equivalent";state.revealing=true;return Lab.tween(1300,function(t){state.progress=t;show();}).then(function(){state.revealing=false;state.result="timing needs measurements";show();});},why:"Equivalent truth tables establish the same stable logic outputs. They do not give gate propagation delays, so the circuit timing cannot be ranked without physical timing information."},
    ]});
  }

  function drawEquivalent(ctx,w,h,c,state){
    text(ctx,"Same stable truth table · timing not specified",w/2,28,c,14);
    text(ctx,"A OR B",w*.17,h*.47,c,14);box(ctx,"OR",w*.36-36,h*.39,72,45,c,false,13);wire(ctx,w*.17+28,h*.47,w*.36-36,h*.47,c,false);wire(ctx,w*.36+36,h*.47,w*.58,h*.47,c,false);text(ctx,"versus",w*.53,h*.47,c,12);box(ctx,"NANDs",w*.66,h*.39,66,45,c,state.revealing&&state.progress>.4,12);wire(ctx,w*.58,h*.47,w*.66,h*.47,c,state.revealing&&state.progress>.4);wire(ctx,w*.66+66,h*.47,w*.88,h*.47,c,state.revealing&&state.progress>.75);text(ctx,"?",w*.91,h*.47,c,18);
    if(state.guess)text(ctx,"Your prediction: "+state.guess,w/2,h-25,c,13);if(state.result)text(ctx,state.result,w/2,h-25,c,13);
  }

  experimentAlgorithm();experimentLogic();experimentNand();experimentTiming();
  var observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(function(){canvases.forEach(function(canvas){if(canvas._labState)queue(canvas,canvas._labState);});});
  document.querySelectorAll(".experiment canvas").forEach(function(canvas){canvases.push(canvas);if(observer)observer.observe(canvas.parentElement);});
  window.addEventListener("resize",function(){canvases.forEach(function(canvas){if(canvas._labState)queue(canvas,canvas._labState);});});
})();
