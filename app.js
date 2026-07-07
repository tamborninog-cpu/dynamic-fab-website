/* ============================================================
   DealScout 2 — in-app ranked deal list
   Real leads gathered from public marketplaces (unverified
   snapshots). Scored & ranked in-app by a shared engine that
   reacts to the user's financing assumptions.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Real leads (address, metro, units, price, published cap %).
     Each links to a live search that finds the actual listing. ---- */
  // [address, city, state, units, price, listed cap %, building sqft (0 = unknown)]
  const RAW = [
    ["8021 Birmingham St",   "Houston",     "TX", 10,   825000,  8.48, 0],
    ["3815 Fannin St",       "Houston",     "TX", 15,   895000,  8.89, 0],
    ["4322 Roseland Ave",    "Dallas",      "TX", 10,  4999000,  4.62, 0],
    ["Dallas 75214 (23-unit)","Dallas",     "TX", 23,  3500000,  4.64, 0],
    ["Dallas 75204 (10-unit)","Dallas",     "TX", 10,  6100000,  6.00, 0],
    ["Dallas 75204 (13-unit)","Dallas",     "TX", 13,  2300000,  8.31, 19541],
    ["Dallas 75204 (10-unit B)","Dallas",   "TX", 10,  3090000,  5.83, 0],
    ["1200 Utoy Springs Rd", "Atlanta",     "GA", 34,  2999999,  7.76, 0],
    ["1132 Virginia Ave NE", "Atlanta",     "GA", 28,  6250000,  6.86, 0],
    ["Atlanta 30xxx (14-unit value-add)","Atlanta","GA", 14, 1000000, 9.85, 0],
    ["11202 Buckeye Rd",     "Cleveland",   "OH", 17,   949000, 10.79, 0],
    ["18051 Lake Shore Blvd","Cleveland",   "OH", 21,  1100000,  7.54, 0],
    ["3501 E 93rd St",       "Cleveland",   "OH", 13,   874900,  8.33, 0],
    ["261 Keel Ave",         "Memphis",     "TN", 10,   846284,  8.85, 0],
    ["1772-1776 Madison Ave","Memphis",     "TN", 16,  1900000,  6.42, 0],
    ["Memphis 38116 (20-unit)","Memphis",   "TN", 20,  1546000, 10.44, 0],
    ["207 S Barksdale St",   "Memphis",     "TN", 16,  2250000,  5.42, 0],
    ["1572 Hanauer St",      "Memphis",     "TN", 46,  2100000,  3.53, 0],
    ["2620 N 40th St",       "Phoenix",     "AZ", 43, 12247000,  5.75, 0],
    ["4128 N 10th St",       "Phoenix",     "AZ", 10,  2873000,  6.00, 0],
    ["825 E Missouri Ave",   "Phoenix",     "AZ", 10,  2709000,  6.00, 0],
    ["1623-1625 W Missouri Ave","Phoenix",  "AZ", 29,  4450000,  6.75, 0],
    ["2020 W Orangewood Ave","Phoenix",     "AZ", 27,  3895000,  5.02, 0],
    ["9730-9768 Locust St",  "Kansas City", "MO", 28,  4250000,  6.50, 0],
    ["600-638 Francis Ave",  "Clarksville", "IN", 20,  1850000,  6.97, 0],
    ["624 Riley Blvd",       "Bedford",     "IN", 26,  1850000,  7.57, 0],
    ["7778-7780 4th Ave S",  "Birmingham",  "AL", 20,  2100000,  6.63, 15250],
    ["1328 W Greenfield Ave","Milwaukee",   "WI", 10,  2200000,  6.07, 0],
    ["1816 E Kane Pl",       "Milwaukee",   "WI", 10,  2300000,  6.10, 0],
    ["Oklahoma City 73107 (40-unit)","Oklahoma City","OK", 40, 3300000, 8.33, 32720],
    ["735 NW 30th St",       "Oklahoma City","OK", 12,  2375000,  4.34, 11520]
  ];
  const DEALS = RAW.map((r, i) => ({
    id: "p" + i, addr: r[0], city: r[1], state: r[2], units: r[3], price: r[4], cap: r[5], sf: r[6],
    src: "https://www.google.com/search?q=" +
         encodeURIComponent(`${r[0]} ${r[1]} ${r[2]} apartment building for sale`)
  }));

  /* ---- helpers ---- */
  const $ = (id) => document.getElementById(id);
  const num = (v) => { const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
  const money = (n, dp = 0) => (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const pct = (n, dp = 2) => isFinite(n) ? n.toFixed(dp) + "%" : "—";
  const xx  = (n, dp = 2) => isFinite(n) ? n.toFixed(dp) + "×" : "—";
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---- finance ---- */
  function pmt(P, ratePct, yrs) { const r = ratePct / 100 / 12, n = yrs * 12; if (n <= 0) return 0; return r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)); }
  function remain(P, ratePct, yrs, months) { const r = ratePct / 100 / 12, n = yrs * 12, k = Math.min(months, n); if (r === 0) return Math.max(0, P - P / n * k); const m = pmt(P, ratePct, yrs); return Math.max(0, P * Math.pow(1 + r, k) - m * ((Math.pow(1 + r, k) - 1) / r)); }

  function assumptions() {
    return {
      down: num($("gDown").value), rate: num($("gRate").value),
      amort: num($("gAmort").value), closing: num($("gClosing").value), exp: num($("gExp").value)
    };
  }

  function underwrite(d, a) {
    const noi = d.price * (d.cap / 100);
    const down = d.price * (a.down / 100);
    const loan = d.price - down;
    const ds = pmt(loan, a.rate, a.amort) * 12;
    const cf = noi - ds;
    const invested = down + d.price * (a.closing / 100);
    const coc = invested > 0 ? cf / invested * 100 : 0;
    const dscr = ds > 0 ? noi / ds : Infinity;
    const cfPU = d.units > 0 ? cf / d.units / 12 : 0;
    // seller-financing scenario (15% down, 0.75% below your rate, same amort, 5-yr balloon)
    const sDown = d.price * 0.15, sLoan = d.price - sDown, sRate = Math.max(0, a.rate - 0.75);
    const sDS = pmt(sLoan, sRate, a.amort) * 12, sCF = noi - sDS;
    const sInv = sDown + d.price * (a.closing / 100);
    const seller = { down: sDown, loan: sLoan, rate: sRate, ds: sDS, cf: sCF,
      coc: sInv > 0 ? sCF / sInv * 100 : 0, dscr: sDS > 0 ? noi / sDS : Infinity,
      balloon: remain(sLoan, sRate, a.amort, 60) };
    const s = score(d.cap, coc, dscr === Infinity ? 2 : dscr, cfPU);
    return { noi, down, loan, ds, cf, coc, dscr, cfPU, invested, ppu: d.price / d.units, seller, ...s };
  }

  function score(cap, coc, dscr, cfPU) {
    const capPts = clamp((cap - 4) / 5, 0, 1) * 35;
    const cocPts = clamp(coc / 12, 0, 1) * 25;
    const dscrPts = clamp((dscr - 1) / 0.5, 0, 1) * 25;
    const cfPts = clamp(cfPU / 150, 0, 1) * 15;
    return { total: Math.round(capPts + cocPts + dscrPts + cfPts), capPts, cocPts, dscrPts, cfPts };
  }
  const gradeOf = (s) => s >= 80 ? { l: "A", t: "Strong", c: "g-a" } : s >= 65 ? { l: "B", t: "Good", c: "g-b" } : s >= 50 ? { l: "C", t: "Fair", c: "g-c" } : { l: "D", t: "Weak", c: "g-d" };

  /* ---- state / filters ---- */
  let sortKey = "score";

  function currentRows() {
    const a = assumptions();
    const fState = $("fState").value, fUnits = num($("fUnits").value),
          fMax = num($("fMax").value), fMinScore = num($("fMinScore").value);
    let rows = DEALS.map((d) => ({ d, u: underwrite(d, a) }));
    rows = rows.filter(({ d, u }) =>
      (fState === "ALL" || d.state === fState) &&
      d.units >= fUnits &&
      (!fMax || d.price <= fMax) &&
      u.total >= fMinScore);
    const key = {
      score: (r) => r.u.total, cap: (r) => r.d.cap,
      cf: (r) => r.u.cf, price: (r) => -r.d.price
    }[sortKey];
    rows.sort((x, y) => key(y) - key(x));
    return rows;
  }

  function renderList() {
    const rows = currentRows();
    $("count").innerHTML = `<b>${rows.length}</b> deal${rows.length === 1 ? "" : "s"} ranked`;
    $("list").innerHTML = rows.map((r, i) => propRow(r.d, r.u, i + 1)).join("") ||
      `<div class="empty" style="padding:40px 0">No deals match these filters.</div>`;
    renderKPIs(rows);
    wireRows();
  }

  function renderKPIs(rows) {
    const el = $("kpis"); if (!el) return;
    if (!rows.length) { el.innerHTML = ""; return; }
    const n = rows.length;
    const avgCap = rows.reduce((s, r) => s + r.d.cap, 0) / n;
    const avgScore = Math.round(rows.reduce((s, r) => s + r.u.total, 0) / n);
    const totVal = rows.reduce((s, r) => s + r.d.price, 0);
    const strong = rows.filter((r) => r.u.total >= 65).length;
    const kpi = (label, val, sub) => `<div class="kpi"><span class="kpi__k">${label}</span><strong class="kpi__v tnum">${val}</strong><span class="kpi__s">${sub}</span></div>`;
    el.innerHTML =
      kpi("Deals", n, `${strong} strong`) +
      kpi("Avg cap", pct(avgCap, 1), "on listed") +
      kpi("Avg score", avgScore, gradeOf(avgScore).t) +
      kpi("Total value", totVal >= 1e6 ? "$" + (totVal / 1e6).toFixed(1) + "M" : money(totVal), "combined");
  }

  function propRow(d, u, rank) {
    const g = gradeOf(u.total);
    const cfCls = u.cf < 0 ? "neg" : "pos";
    return `
      <div class="prop ${g.c}" data-id="${d.id}">
        <div class="prop__row">
          <div class="rank ${rank <= 3 ? "r" + rank : ""}">${rank}</div>
          <div class="prop__id">
            <div class="nm">${esc(d.addr)}</div>
            <div class="loc">${esc(d.city)}, ${d.state} · ${d.units} units</div>
          </div>
          <div class="cell keep"><span class="k">Price</span><span class="v tnum">${money(d.price)}</span></div>
          <div class="cell"><span class="k">Cap</span><span class="v tnum">${pct(d.cap)}</span></div>
          <div class="cell"><span class="k">$/unit</span><span class="v tnum">${money(u.ppu)}</span></div>
          <div class="cell"><span class="k">Cash flow/yr</span><span class="v tnum ${cfCls}">${money(u.cf)}</span></div>
          <div class="score">
            <div class="gauge" style="--p:${u.total}"><span class="tnum">${u.total}</span></div>
            <div class="score__meta">
              <span class="score__grade">${g.l}</span>
              <span class="score__sub">${g.t}</span>
            </div>
          </div>
          <div class="chev">›</div>
        </div>
        <div class="prop__detail">${detail(d, u)}</div>
      </div>`;
  }

  function assetClass(cap) {
    if (cap < 5) return "Premium, primary-market (Class A)";
    if (cap < 5.75) return "Stabilized Class A / B";
    if (cap < 7) return "Solid Class B";
    if (cap < 9) return "Higher-yield Class B / C";
    return "High-cap Class C / value-add";
  }
  function describe(d, u, a) {
    const rel = d.cap >= 7 ? "well above" : d.cap >= 5.75 ? "above" : d.cap >= 5 ? "roughly in line with" : "below";
    const sfBit = d.sf ? ` · ${money(d.price / d.sf)}/sf across ${d.sf.toLocaleString()} sf` : "";
    const money0 = (n) => money(Math.round(n));
    const fin = u.cf >= 0
      ? `it throws off <b>${money0(u.cf)}/yr</b> in cash flow (${pct(u.coc)} cash-on-cash) at a ${u.dscr === Infinity ? "very high" : xx(u.dscr)} DSCR`
      : `it runs <b class="neg">${money0(u.cf)}/yr</b> negative — you'd need a lower price, more down, or seller terms to make it cash-flow`;
    return `A <b>${d.units}-unit</b> multifamily property in <b>${esc(d.city)}, ${d.state}</b>, listed at <b>${money(d.price)}</b> ` +
      `(${money(u.ppu)}/unit${sfBit}). The listed <b>${pct(d.cap)}</b> cap rate sits ${rel} the ~5.5% national multifamily average — ` +
      `a profile that reads as <b>${assetClass(d.cap)}</b>. Financed at your ${a.down}% down / ${a.rate}% terms, ${fin}.`;
  }

  function plTable(title, tag, s, amort, kind) {
    const pi = pmt(s.loan, s.rate, amort);
    const cfCls = s.cf < 0 ? "neg" : "";
    const extra = kind === "seller"
      ? `<tr><td>Balloon balance @ yr 5</td><td class="tnum">${money(s.balloon)}</td></tr>`
      : `<tr><td>Cash to close</td><td class="tnum">${money(s.invested)}</td></tr>`;
    return `
      <div class="dcard">
        <h4>${title} <span class="h4sub">${tag}</span></h4>
        <table class="kv">
          <tr><td>Down payment</td><td class="tnum">${money(s.down)} (${pct(s.downPct, 0)})</td></tr>
          <tr><td>${kind === "seller" ? "Seller carry note" : "Loan amount"}</td><td class="tnum">${money(s.loan)}</td></tr>
          <tr><td>Interest rate</td><td class="tnum">${pct(s.rate)}</td></tr>
          <tr><td>Monthly P&amp;I</td><td class="tnum">${money(pi)}</td></tr>
          <tr><td>Annual debt service</td><td class="tnum">${money(s.ds)}</td></tr>
          <tr class="hl"><td>Cash flow / yr</td><td class="tnum ${cfCls}">${money(s.cf)}</td></tr>
          <tr class="hl"><td>Cash-on-cash</td><td class="tnum ${cfCls}">${pct(s.coc)}</td></tr>
          <tr><td>DSCR</td><td class="tnum">${s.dscr === Infinity ? "∞" : xx(s.dscr)}</td></tr>
          ${extra}
        </table>
      </div>`;
  }

  function detail(d, u) {
    const a = assumptions();
    const factor = (label, pts, max) => { const r = pts / max; const c = r >= 0.66 ? "good" : r >= 0.33 ? "mid" : "bad"; return `<span class="factor ${c}">${label}</span>`; };
    const attr = (k, v) => `<span class="attr"><em>${k}</em>${v}</span>`;
    const conv = { down: u.down, downPct: a.down, loan: u.loan, rate: a.rate, ds: u.ds, cf: u.cf, coc: u.coc, dscr: u.dscr, invested: u.invested };
    const sell = { ...u.seller, downPct: 15 };
    return `
      <div class="detail__grid">
        <div class="dcard wide">
          <h4>🧭 Snapshot &amp; description</h4>
          <p class="snap">${describe(d, u, a)}</p>
          <div class="attrs">
            ${attr("Market", esc(d.city) + ", " + d.state)}
            ${attr("Units", d.units)}
            ${attr("$/unit", money(u.ppu))}
            ${d.sf ? attr("$/sf", money(d.price / d.sf)) : ""}
            ${attr("Cap", pct(d.cap))}
            ${attr("NOI/yr", money(u.noi))}
            ${attr("Class", assetClass(d.cap))}
          </div>
          <div class="factors">
            ${factor("Cap " + pct(d.cap), u.capPts, 35)}
            ${factor("CoC " + pct(u.coc), u.cocPts, 25)}
            ${factor("DSCR " + (u.dscr === Infinity ? "∞" : xx(u.dscr)), u.dscrPts, 25)}
            ${factor(money(u.cfPU) + "/unit/mo", u.cfPts, 15)}
          </div>
        </div>
        ${plTable("🏦 Conventional", "your assumptions", conv, a.amort, "conv")}
        ${plTable("🤝 Seller financing", "15% down · 30-yr · 5-yr balloon", sell, a.amort, "seller")}
        <div class="dcard wide verify">
          <h4>✅ Before you offer, verify</h4>
          <ul>
            <li>Rent roll &amp; trailing-12 income (is the ${pct(d.cap)} cap real or pro-forma?)</li>
            <li>Actual property taxes &amp; insurance — often reset on sale</li>
            <li>Unit mix, occupancy &amp; any below-market/rent-controlled leases</li>
            <li>Deferred maintenance, roof/HVAC/plumbing age, deferred capex</li>
            <li>A real lender quote — rates &amp; terms drive the whole return</li>
          </ul>
        </div>
      </div>
      <div class="detail__actions">
        <button class="btn btn--brand btn--sm" data-add="${d.id}">＋ Add to pipeline</button>
        <a class="btn btn--ghost btn--sm" href="${esc(d.src)}" target="_blank" rel="noopener noreferrer">🔎 Find live listing ↗</a>
      </div>`;
  }

  function wireRows() {
    document.querySelectorAll(".prop__row").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("a,button")) return;
        row.parentElement.classList.toggle("open");
      });
    });
    document.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", (e) => { e.stopPropagation(); addToPipeline(btn.dataset.add); });
    });
  }

  /* ---- pipeline ---- */
  const STAGES = [["prospect", "Prospect", "var(--muted)"], ["analyzing", "Analyzing", "var(--info)"],
    ["offer", "Offer Made", "var(--warn)"], ["contract", "Under Contract", "var(--brand)"],
    ["closed", "Closed", "var(--good)"], ["passed", "Passed", "var(--bad)"]];
  const LS = "dealscout2.pipeline";
  let pipeline = [];
  const loadPipe = () => { try { pipeline = JSON.parse(localStorage.getItem(LS)) || []; } catch { pipeline = []; } };
  const savePipe = () => localStorage.setItem(LS, JSON.stringify(pipeline));

  function addToPipeline(id) {
    const d = DEALS.find((x) => x.id === id); if (!d) return;
    if (pipeline.some((p) => p.srcId === id)) { toast("Already in pipeline"); return; }
    const u = underwrite(d, assumptions());
    pipeline.unshift({ id: "d" + Date.now(), srcId: id, name: `${d.addr} — ${d.city}, ${d.state}`,
      url: d.src, price: d.price, units: d.units, cap: d.cap, cf: Math.round(u.cf), score: u.total, stage: "prospect" });
    savePipe(); renderBoard();
    toast(`Added ${d.addr} to pipeline`);
  }

  function renderBoard() {
    $("board").innerHTML = STAGES.map(([k, t, c]) => {
      const items = pipeline.filter((p) => p.stage === k);
      const body = items.length ? items.map(pipeCard).join("") : `<div class="empty">Drop here</div>`;
      return `<div class="col" data-stage="${k}">
        <div class="col__h"><span class="col__t"><span class="dot" style="background:${c}"></span>${t}</span><span class="col__c">${items.length}</span></div>
        <div class="col__b">${body}</div></div>`;
    }).join("");
    wireDnD(); renderPipeStats();
  }
  function pipeCard(p) {
    const g = gradeOf(p.score);
    const cf = (p.cf < 0 ? "-" : "") + "$" + Math.abs(p.cf).toLocaleString("en-US");
    return `<div class="card2" draggable="true" data-id="${p.id}">
      <div class="nm">${esc(p.name)}</div>
      <div class="tags"><span class="mini ${g.c}">${p.score} ${g.l}</span><span class="mini plain">${pct(p.cap)}</span><span class="mini plain">${p.units}u</span><span class="mini plain">${cf}/yr</span></div>
      <div class="ft"><a class="lk" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Find listing ↗</a><button class="del" data-del="${p.id}">✕</button></div>
    </div>`;
  }
  function renderPipeStats() {
    const active = pipeline.filter((p) => p.stage !== "passed");
    const val = active.reduce((s, p) => s + (p.price || 0), 0);
    const avg = active.length ? active.reduce((s, p) => s + (p.cap || 0), 0) / active.length : 0;
    const strong = pipeline.filter((p) => p.score >= 65).length;
    $("pipeStats").innerHTML =
      `<div class="stat"><span>Active deals</span><strong class="tnum">${active.length}</strong></div>
       <div class="stat"><span>Pipeline value</span><strong class="tnum">${money(val)}</strong></div>
       <div class="stat"><span>Avg cap rate</span><strong class="tnum">${avg ? pct(avg) : "—"}</strong></div>
       <div class="stat"><span>Strong (B+)</span><strong class="tnum">${strong}</strong></div>`;
  }
  let dragId = null;
  function wireDnD() {
    document.querySelectorAll(".card2").forEach((el) => {
      el.addEventListener("dragstart", () => { dragId = el.dataset.id; el.classList.add("drag"); });
      el.addEventListener("dragend", () => { el.classList.remove("drag"); dragId = null; });
    });
    document.querySelectorAll(".col").forEach((col) => {
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("over"); });
      col.addEventListener("dragleave", () => col.classList.remove("over"));
      col.addEventListener("drop", () => { col.classList.remove("over"); const p = pipeline.find((x) => x.id === dragId); if (p) { p.stage = col.dataset.stage; savePipe(); renderBoard(); } });
    });
    document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => { pipeline = pipeline.filter((p) => p.id !== b.dataset.del); savePipe(); renderBoard(); toast("Removed"); }));
  }

  /* ---- toast ---- */
  let tT;
  function toast(m) { const t = $("toast"); t.textContent = m; t.hidden = false; requestAnimationFrame(() => t.classList.add("show")); clearTimeout(tT); tT = setTimeout(() => { t.classList.remove("show"); setTimeout(() => (t.hidden = true), 250); }, 2000); }

  /* ---- theme ---- */
  function initTheme() {
    const saved = localStorage.getItem("dealscout2.theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    $("themeBtn").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      const next = dark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("dealscout2.theme", next);
    });
  }

  /* ---- init ---- */
  function init() {
    // states present in data
    const states = [...new Set(DEALS.map((d) => d.state))].sort();
    $("fState").innerHTML = `<option value="ALL">All states</option>` + states.map((s) => `<option value="${s}">${s}</option>`).join("");

    // re-score on assumption/filter change
    ["gDown", "gRate", "gAmort", "gClosing", "gExp", "fState", "fUnits", "fMax", "fMinScore"].forEach((id) => {
      const el = $(id); el.addEventListener("input", renderList); el.addEventListener("change", renderList);
    });
    // sort
    document.querySelectorAll("#sortSeg button").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll("#sortSeg button").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active"); sortKey = b.dataset.sort; renderList();
    }));
    // tabs
    document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((x) => x.classList.remove("is-active"));
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
      t.classList.add("is-active"); $("view-" + t.dataset.view).classList.add("is-active");
    }));
    // pipeline tools
    $("exportBtn").addEventListener("click", () => {
      const b = new Blob([JSON.stringify(pipeline, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "dealscout-pipeline.json"; a.click(); URL.revokeObjectURL(a.href);
    });
    $("importFile").addEventListener("change", (e) => {
      const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { try { const arr = JSON.parse(r.result); if (Array.isArray(arr)) { pipeline = arr; savePipe(); renderBoard(); toast("Imported"); } else toast("Invalid file"); } catch { toast("Could not read file"); } };
      r.readAsText(f); e.target.value = "";
    });
    $("clearBtn").addEventListener("click", () => { if (pipeline.length && confirm("Clear the entire pipeline?")) { pipeline = []; savePipe(); renderBoard(); toast("Cleared"); } });

    initTheme();
    loadPipe();
    renderList();
    renderBoard();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
