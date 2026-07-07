/* ============================================================
   DealScout — app logic
   - Live marketplace search-link builder (no fake listings)
   - Cap rate / NOI + conventional & seller financing calculators
   - 0–100 deal-strength score
   - localStorage-backed deal pipeline (Kanban)
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- U.S. states ---------------- */
  const STATES = [
    ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
    ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
    ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
    ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
    ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
    ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
    ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
    ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
    ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
    ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]
  ];

  /* ---------------- helpers ---------------- */
  const $ = (id) => document.getElementById(id);
  const slug = (s) => (s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const num = (v) => {
    const n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  };
  const fmtMoney = (n, dp = 0) =>
    (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const fmtPct = (n, dp = 2) => (isFinite(n) ? n.toFixed(dp) + "%" : "—");
  const fmtX = (n, dp = 2) => (isFinite(n) ? n.toFixed(dp) + "×" : "—");

  /* ---------------- marketplace link builders ----------------
     Every URL lands on a REAL, live search-results page on that
     marketplace. We don't invent listings; we route the user to
     current inventory that matches their buy box. */
  function buildMarkets({ city, stateAbbr, stateName, units, min, max }) {
    const citySlug = slug(city);
    const stAbbr = (stateAbbr || "").toLowerCase();
    const stName = slug(stateName);
    const loc = citySlug ? `${citySlug}-${stAbbr}` : stName;         // e.g. houston-tx  |  texas
    const realtorLoc = city ? `${slug(city).replace(/-/g, "-")}_${stateAbbr}` : stateName.replace(/ /g, "-");
    const zLoc = citySlug ? `${citySlug}-${stAbbr}` : stName;
    const priceParam = (min || max) ? `${min || 0}-${max || ""}` : "";

    const markets = [
      {
        name: "LoopNet",
        tag: "Multifamily",
        desc: "The largest CRE marketplace — apartment buildings & multifamily for sale.",
        url: `https://www.loopnet.com/search/multifamily/${loc}/for-sale/`
      },
      {
        name: "Crexi",
        tag: "Multifamily",
        desc: "Fast-growing CRE exchange with heavy multifamily inventory & auctions.",
        url: `https://www.crexi.com/properties/multifamily/${stName}`
      },
      {
        name: "CommercialCafe",
        tag: "Multi-family",
        desc: "Yardi network listings — apartment & multi-family buildings for sale.",
        url: `https://www.commercialcafe.com/commercial-real-estate/multi-family/for-sale/${stName}/`
      },
      {
        name: "Auction.com",
        tag: "Auctions",
        desc: "Bank-owned, foreclosure & value-add multifamily going to auction.",
        url: `https://www.auction.com/residential/${stAbbr}_state/`
      },
      {
        name: "Realtor.com",
        tag: "Multi-family",
        desc: "Smaller multi-family (often 2–10 units) listed on the MLS.",
        url: `https://www.realtor.com/realestateandhomes-search/${realtorLoc}/type-multi-family-home${priceParam ? "/price-" + (min || "na") + "-" + (max || "na") : ""}`
      },
      {
        name: "Zillow",
        tag: "Multi-family",
        desc: "MLS multi-family homes for sale — good for 2–20 unit buildings.",
        url: `https://www.zillow.com/${zLoc}/multi-family_type/`
      }
    ];
    return markets;
  }

  function renderMarkets(cfg) {
    const grid = $("marketGrid");
    const markets = buildMarkets(cfg);
    grid.innerHTML = markets.map((m) => `
      <div class="market">
        <div class="market__name">${m.name} <span class="market__tag">${m.tag}</span></div>
        <div class="market__desc">${m.desc}</div>
        <a class="market__link" href="${m.url}" target="_blank" rel="noopener noreferrer">Open live results ↗</a>
      </div>
    `).join("");

    const where = cfg.city ? `${cfg.city}, ${cfg.stateAbbr}` : cfg.stateName;
    const priceBit = (cfg.min || cfg.max)
      ? ` priced ${cfg.min ? fmtMoney(cfg.min) : "any"}–${cfg.max ? fmtMoney(cfg.max) : "any"}`
      : "";
    $("finderSummary").innerHTML =
      `Live searches for <b>${cfg.units}+ unit</b> multifamily in <b>${where}</b>${priceBit}. ` +
      `Opening in a new tab shows each marketplace's current inventory.`;
    $("finderResults").hidden = false;
  }

  /* ---------------- finance math ---------------- */
  // Fixed-rate amortizing monthly payment
  function monthlyPayment(principal, annualRatePct, years) {
    const r = annualRatePct / 100 / 12;
    const n = years * 12;
    if (n <= 0) return 0;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }
  // Remaining balance after k monthly payments
  function remainingBalance(principal, annualRatePct, years, monthsElapsed) {
    const r = annualRatePct / 100 / 12;
    const n = years * 12;
    const k = Math.min(monthsElapsed, n);
    if (r === 0) return Math.max(0, principal - (principal / n) * k);
    const pmt = monthlyPayment(principal, annualRatePct, years);
    const bal = principal * Math.pow(1 + r, k) - pmt * ((Math.pow(1 + r, k) - 1) / r);
    return Math.max(0, bal);
  }

  function readInputs() {
    const price = num($("aPrice").value);
    const units = num($("aUnitsCount").value);
    const rentMo = num($("aRent").value);
    const otherMo = num($("aOther").value);
    const vacancy = num($("aVacancy").value);
    const expRatio = num($("aExpenseRatio").value);

    const gsi = (rentMo + otherMo) * 12;          // gross scheduled income /yr
    const vacLoss = gsi * (vacancy / 100);
    const egi = gsi - vacLoss;                      // effective gross income
    const opex = egi * (expRatio / 100);
    const noi = egi - opex;
    const capRate = price > 0 ? (noi / price) * 100 : 0;
    const ppu = units > 0 ? price / units : 0;
    const grm = gsi > 0 ? price / gsi : 0;

    return { price, units, gsi, egi, noi, capRate, ppu, grm };
  }

  function computeScenario(price, noi, downPct, ratePct, amortYrs, extra) {
    const down = price * (downPct / 100);
    const loan = price - down;
    const pmt = monthlyPayment(loan, ratePct, amortYrs);
    const annualDS = pmt * 12;
    const cashFlow = noi - annualDS;
    const dscr = annualDS > 0 ? noi / annualDS : Infinity;
    const invested = down + (extra && extra.closingPct ? price * (extra.closingPct / 100) : 0);
    const coc = invested > 0 ? (cashFlow / invested) * 100 : 0;
    let balloonBal = null;
    if (extra && extra.balloonYrs) balloonBal = remainingBalance(loan, ratePct, amortYrs, extra.balloonYrs * 12);
    return { down, loan, pmt, annualDS, cashFlow, dscr, coc, invested, balloonBal };
  }

  /* ---------------- deal score (0–100) ---------------- */
  function scoreDeal(capRate, coc, dscr, monthlyCFperUnit) {
    // Cap rate: 0 pts at 4%, 35 pts at 9%+
    const capPts = clamp((capRate - 4) / (9 - 4), 0, 1) * 35;
    // Cash-on-cash: 0 at 0%, 25 at 12%+
    const cocPts = clamp(coc / 12, 0, 1) * 25;
    // DSCR: 0 at 1.0, 25 at 1.5+
    const dscrPts = clamp((dscr - 1.0) / (1.5 - 1.0), 0, 1) * 25;
    // Cash flow per unit per month: 0 at $0, 15 at $150+
    const cfPts = clamp(monthlyCFperUnit / 150, 0, 1) * 15;

    const total = Math.round(capPts + cocPts + dscrPts + cfPts);
    return { total, capPts, cocPts, dscrPts, cfPts };
  }
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  function grade(score) {
    if (score >= 80) return { letter: "A", label: "Strong buy", color: "var(--accent)" };
    if (score >= 65) return { letter: "B", label: "Good deal", color: "var(--blue)" };
    if (score >= 50) return { letter: "C", label: "Fair — negotiate", color: "var(--amber)" };
    return { letter: "D", label: "Weak — likely pass", color: "var(--red)" };
  }
  function scoreClass(score) {
    return score >= 80 ? "score-a" : score >= 65 ? "score-b" : score >= 50 ? "score-c" : "score-d";
  }

  /* ---------------- render analyzer ---------------- */
  let lastAnalysis = null;

  function analyze() {
    const base = readInputs();
    const { price, units, noi, capRate, ppu, grm } = base;

    // Conventional
    const conv = computeScenario(
      price, noi, num($("cDown").value), num($("cRate").value), num($("cAmort").value),
      { closingPct: num($("cClosing").value) }
    );
    // Seller financing
    const sell = computeScenario(
      price, noi, num($("sDown").value), num($("sRate").value), num($("sAmort").value),
      { balloonYrs: num($("sBalloon").value) }
    );

    // Key metrics
    setText("mCap", fmtPct(capRate));
    setText("mNoi", fmtMoney(noi));
    setText("mPpu", fmtMoney(ppu));
    setText("mGrm", grm ? fmtX(grm, 1) : "—");

    // Conventional table
    setText("cvDown", fmtMoney(conv.down));
    setText("cvLoan", fmtMoney(conv.loan));
    setText("cvPI", fmtMoney(conv.pmt));
    setText("cvDS", fmtMoney(conv.annualDS));
    setSigned("cvCF", conv.cashFlow);
    setSigned("cvCoC", conv.coc, true);
    setText("cvDSCR", fmtX(conv.dscr));
    setText("cvCash", fmtMoney(conv.invested));

    // Seller table
    setText("slDown", fmtMoney(sell.down));
    setText("slLoan", fmtMoney(sell.loan));
    setText("slPI", fmtMoney(sell.pmt));
    setText("slDS", fmtMoney(sell.annualDS));
    setSigned("slCF", sell.cashFlow);
    setSigned("slCoC", sell.coc, true);
    setText("slDSCR", fmtX(sell.dscr));
    setText("slBalloon", sell.balloonBal != null ? fmtMoney(sell.balloonBal) : "—");

    // Score (based on the conventional scenario — the standard financing path)
    const cfPerUnit = units > 0 ? conv.cashFlow / units / 12 : 0;
    const sc = scoreDeal(capRate, conv.coc, conv.dscr === Infinity ? 2 : conv.dscr, cfPerUnit);
    renderScore(sc, capRate, conv, cfPerUnit);

    lastAnalysis = { base, conv, sell, score: sc.total };
    return lastAnalysis;
  }

  function renderScore(sc, capRate, conv, cfPerUnit) {
    const g = grade(sc.total);
    const arc = $("scoreArc");
    const circ = 2 * Math.PI * 52; // 326.7
    arc.style.strokeDashoffset = String(circ * (1 - sc.total / 100));
    arc.style.stroke = g.color;
    setText("scoreValue", sc.total);
    const gradeEl = $("scoreGrade");
    gradeEl.textContent = `${g.letter} · ${g.label}`;
    gradeEl.style.color = g.color;

    setText("scoreBlurb",
      sc.total >= 65 ? "Numbers look investable — verify actuals before committing."
      : sc.total >= 50 ? "Marginal at this price; sharpen the offer or terms."
      : "Doesn't cash-flow well at these numbers. Push price down or walk.");

    const factor = (label, pts, maxPts) => {
      const ratio = pts / maxPts;
      const cls = ratio >= 0.66 ? "good" : ratio >= 0.33 ? "mid" : "bad";
      return `<li class="${cls}">${label}</li>`;
    };
    $("scoreFactors").innerHTML =
      factor(`Cap rate ${fmtPct(capRate)}`, sc.capPts, 35) +
      factor(`Cash-on-cash ${fmtPct(conv.coc)}`, sc.cocPts, 25) +
      factor(`DSCR ${conv.dscr === Infinity ? "∞" : fmtX(conv.dscr)}`, sc.dscrPts, 25) +
      factor(`Cash flow ${fmtMoney(cfPerUnit)}/unit/mo`, sc.cfPts, 15);
  }

  function setText(id, v) { const el = $(id); if (el) el.textContent = v; }
  function setSigned(id, v, isPct) {
    const el = $(id); if (!el) return;
    el.textContent = isPct ? fmtPct(v) : fmtMoney(v);
    el.classList.toggle("val--neg", v < 0);
  }

  /* ---------------- pipeline ---------------- */
  const STAGES = [
    ["prospect",   "Prospect",       "var(--muted)"],
    ["analyzing",  "Analyzing",      "var(--blue)"],
    ["offer",      "Offer Made",     "var(--amber)"],
    ["contract",   "Under Contract", "var(--accent)"],
    ["closed",     "Closed",         "var(--accent-2)"],
    ["passed",     "Passed",         "var(--red)"]
  ];
  const LS_KEY = "dealscout.pipeline.v1";
  let deals = [];

  function loadDeals() {
    try { deals = JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { deals = []; }
  }
  function saveDeals() { localStorage.setItem(LS_KEY, JSON.stringify(deals)); }

  function addDealFromAnalyzer() {
    const a = analyze();
    const name = $("aName").value.trim() ||
      `${a.base.units || "?"}-unit — ${fmtMoney(a.base.price)}`;
    const url = $("aUrl").value.trim();
    const deal = {
      id: "d" + Date.now() + Math.floor(performance.now()),
      name, url,
      price: a.base.price,
      units: a.base.units,
      cap: a.base.capRate,
      cf: a.conv.cashFlow,
      score: a.score,
      stage: "prospect"
    };
    deals.unshift(deal);
    saveDeals();
    renderBoard();
    toast(`Saved “${name}” to pipeline`);
  }

  function renderBoard() {
    const board = $("board");
    board.innerHTML = STAGES.map(([key, title, color]) => {
      const items = deals.filter((d) => d.stage === key);
      const cards = items.length
        ? items.map(dealCard).join("")
        : `<div class="col__empty">Drop deals here</div>`;
      return `
        <div class="col" data-stage="${key}">
          <div class="col__head">
            <span class="col__title"><span class="col__dot" style="background:${color}"></span>${title}</span>
            <span class="col__count">${items.length}</span>
          </div>
          <div class="col__body">${cards}</div>
        </div>`;
    }).join("");
    wireDnD();
    renderStats();
  }

  function dealCard(d) {
    const link = d.url
      ? `<a class="deal__link" href="${escapeAttr(d.url)}" target="_blank" rel="noopener noreferrer">View listing ↗</a>`
      : `<span class="deal__link" style="color:var(--muted)">No URL</span>`;
    const cf = (d.cf < 0 ? "-" : "") + "$" + Math.abs(Math.round(d.cf)).toLocaleString("en-US");
    return `
      <div class="deal" draggable="true" data-id="${d.id}">
        <div class="deal__name">${escapeHtml(d.name)}</div>
        <div class="deal__tags">
          <span class="deal__tag ${scoreClass(d.score)}">Score ${d.score}</span>
          <span class="deal__tag">${fmtPct(d.cap)} cap</span>
          <span class="deal__tag">${d.units || "?"} units</span>
          <span class="deal__tag">${cf}/yr CF</span>
        </div>
        <div class="deal__foot">
          ${link}
          <button class="deal__del" data-del="${d.id}" title="Delete">✕</button>
        </div>
      </div>`;
  }

  function renderStats() {
    const active = deals.filter((d) => d.stage !== "passed");
    const totalVal = active.reduce((s, d) => s + (d.price || 0), 0);
    const avgCap = active.length ? active.reduce((s, d) => s + (d.cap || 0), 0) / active.length : 0;
    const strong = deals.filter((d) => d.score >= 65).length;
    $("pipelineStats").innerHTML = `
      <div class="stat"><span>Active deals</span><strong>${active.length}</strong></div>
      <div class="stat"><span>Pipeline value</span><strong>${fmtMoney(totalVal)}</strong></div>
      <div class="stat"><span>Avg cap rate</span><strong>${avgCap ? fmtPct(avgCap) : "—"}</strong></div>
      <div class="stat"><span>Strong (B+ )</span><strong>${strong}</strong></div>`;
  }

  /* ---- drag & drop + delete ---- */
  let draggingId = null;
  function wireDnD() {
    document.querySelectorAll(".deal").forEach((el) => {
      el.addEventListener("dragstart", (e) => {
        draggingId = el.dataset.id;
        el.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      el.addEventListener("dragend", () => { el.classList.remove("dragging"); draggingId = null; });
    });
    document.querySelectorAll(".col").forEach((col) => {
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("drag-over"); });
      col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("drag-over");
        const d = deals.find((x) => x.id === draggingId);
        if (d) { d.stage = col.dataset.stage; saveDeals(); renderBoard(); }
      });
    });
    document.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        deals = deals.filter((d) => d.id !== btn.dataset.del);
        saveDeals(); renderBoard(); toast("Deal removed");
      });
    });
  }

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const escapeAttr = (s) => escapeHtml(s);

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg; t.hidden = false;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => (t.hidden = true), 300);
    }, 2200);
  }

  /* ---------------- init ---------------- */
  function init() {
    // state dropdown
    const sel = $("fState");
    sel.innerHTML = STATES.map(([a, n]) => `<option value="${a}">${n}</option>`).join("");
    sel.value = "TX";

    // finder
    $("finderForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const abbr = $("fState").value;
      const name = (STATES.find((s) => s[0] === abbr) || [,""])[1];
      renderMarkets({
        city: $("fCity").value.trim(),
        stateAbbr: abbr,
        stateName: name,
        units: $("fUnits").value,
        min: num($("fMin").value),
        max: num($("fMax").value)
      });
      $("finderResults").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // analyzer live recompute
    document.querySelectorAll(".analyzer__inputs input").forEach((el) => {
      if (el.id === "aName" || el.id === "aUrl") return;
      el.addEventListener("input", analyze);
    });
    $("saveDeal").addEventListener("click", addDealFromAnalyzer);
    $("resetDeal").addEventListener("click", () => {
      ["aName","aUrl"].forEach((id) => ($(id).value = ""));
      analyze();
      toast("Inputs kept — clear fields manually to change");
    });

    // pipeline tools
    $("exportBtn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(deals, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "dealscout-pipeline.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $("importFile").addEventListener("change", (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const arr = JSON.parse(reader.result);
          if (Array.isArray(arr)) { deals = arr; saveDeals(); renderBoard(); toast("Pipeline imported"); }
          else toast("Invalid file");
        } catch { toast("Could not read file"); }
      };
      reader.readAsText(file);
      e.target.value = "";
    });
    $("clearBtn").addEventListener("click", () => {
      if (deals.length && confirm("Remove all deals from your pipeline?")) {
        deals = []; saveDeals(); renderBoard(); toast("Pipeline cleared");
      }
    });

    loadDeals();
    renderBoard();
    analyze();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
