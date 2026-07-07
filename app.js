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
    ["735 NW 30th St",       "Oklahoma City","OK", 12,  2375000,  4.34, 11520],
    ["465 Chaffee Rd N",     "Jacksonville","FL", 12,   750000,  7.51, 0],
    ["2105 River Blvd",      "Jacksonville","FL", 12,  2225000,  9.17, 0],
    ["3610-3614 Del Park Ter","Louisville", "KY", 10,   980000,  9.08, 10362],
    ["1805 Dixie Hwy",       "Louisville",  "KY", 10,   982900,  9.13, 2972],
    ["8100-8106 E Jefferson Ave","Detroit", "MI", 16,  1000000, 12.00, 0],
    ["23740 Fenkell St",     "Detroit",     "MI", 25,  1350000, 12.00, 0],
    ["3205 Kendall St",      "Detroit",     "MI", 31,  2000000, 10.30, 0],
    ["9700 Chalmers St",     "Detroit",     "MI", 11,  1300000,  7.04, 0],
    ["14801 Joy Rd",         "Detroit",     "MI", 14,   850000,  4.47, 0],
    ["10235 Whittier St",    "Detroit",     "MI", 16,   725000, 10.62, 0],
    ["Detroit 48xxx (20-unit)","Detroit",   "MI", 20,  3995000,  5.45, 20000],
    ["Philadelphia 19122 (14-unit)","Philadelphia","PA", 14, 2250000, 7.00, 0],
    ["Philadelphia 19143 (37-unit)","Philadelphia","PA", 37, 3300000, 6.34, 0],
    ["Philadelphia 19141 (24-unit)","Philadelphia","PA", 24, 2400000, 8.04, 0],
    ["Philadelphia 19130 (10-unit)","Philadelphia","PA", 10, 1350000, 6.10, 0],
    ["Philadelphia 19121 (13-unit)","Philadelphia","PA", 13, 2800000, 5.26, 0],
    ["Denver 80219 (10-unit)","Denver",     "CO", 10,  3460000,  7.07, 0],
    ["Denver 80211 (23-unit)","Denver",     "CO", 23,   899000,  6.84, 0],
    ["Lakewood 80214 (24-unit)","Lakewood", "CO", 24,  7700000,  6.66, 0],
    ["Lakewood 80214 (40-unit)","Lakewood", "CO", 40,  2225000,  6.01, 0],
    ["Denver 80206 (12-unit)","Denver",     "CO", 12,  1895000,  5.72, 0],
    ["Denver 80206 (23-unit)","Denver",     "CO", 23,   875000,  6.70, 0],
    ["7300-7310 W 10th Ave", "Lakewood",    "CO", 17,  2775000,  5.95, 0],
    ["Denver 80220 (20-unit)","Denver",     "CO", 20,  2000000,  6.75, 0],
    ["Denver 80220 (18-unit)","Denver",     "CO", 18,   945000,  6.49, 0],
    ["Denver 80211 (20-unit)","Denver",     "CO", 20,  2350000,  5.66, 0],
    ["651 29th St",          "Denver",      "CO", 14,  3085000,  4.02, 0],
    ["900-1208 E Carey Ave", "North Las Vegas","NV", 34, 2200000, 7.41, 0],
    ["Donna St (26-unit)",   "North Las Vegas","NV", 26, 4900000, 6.10, 0],
    ["711 E Twain Ave",      "Las Vegas",   "NV", 41,  5150000,  7.41, 0],
    ["316-322 N 14th St",    "Las Vegas",   "NV", 10,  2120000,  5.14, 0],
    ["304 S Maryland Pky",   "Las Vegas",   "NV", 12,  1999999,  6.14, 0],
    ["1905 S Carrollton Ave","New Orleans", "LA", 20,  2795000,  8.39, 12540],
    ["2853 Dryades St",      "New Orleans", "LA", 8,    825000, 10.00, 0],
    ["100 Cicero St",        "Jefferson",   "LA", 7,    735000,  9.80, 0],
    ["1240 Oak St",          "Columbus",    "OH", 10,  2250000,  7.11, 0],
    ["Riverview Apartments", "Columbus",    "OH", 30,  4790000,  9.21, 0],
    ["786-792 Thomas Ave",   "Columbus",    "OH", 18,  1650000,  2.62, 0],
    ["3530 Utah St",         "St. Louis",   "MO", 25,  3700000,  7.97, 0],
    ["3725-3741 Morganford Rd","St. Louis", "MO", 40,  3495000,  8.26, 0],
    ["Cincinnati 45219 (24-unit)","Cincinnati","OH", 24, 2625000, 8.19, 0],
    ["2240 Norwood Ave",     "Cincinnati",  "OH", 25,  1595000, 11.82, 0],
    ["1148 S Memorial Dr",   "Tulsa",       "OK", 40,  2775000,  8.11, 29064],
    ["Tulsa 74119 (29-unit)","Tulsa",       "OK", 29,  4500000,  5.89, 0],
    ["3927 E 28th St",       "Tulsa",       "OK", 22,  1540000,  8.66, 11088],
    ["500 S 2nd St",         "Mankato",     "MN", 40,  5750000,  6.50, 0],
    ["107 Minnesota Ave E",  "Walker",      "MN", 14,  1215000,  7.00, 0],
    ["707 Nottingham Rd",    "Baltimore",   "MD", 40,  5850000,  7.03, 0],
    ["1114-1128 E 9th St",   "Russellville","AR", 40,  3400000,  7.56, 0],
    ["124 S College St",     "Mountain Home","AR", 33,  3250000,  9.10, 0],
    ["114 Virginia St",      "Richmond",    "VA", 48,  9000000,  6.28, 44800],
    ["552 N Neville St",     "Pittsburgh",  "PA", 15,  1600000, 14.04, 25249],
    ["2708 Brownsville Rd",  "Pittsburgh",  "PA", 20,  1365000,  7.02, 35000],
    ["5816 Callowhill St",   "Pittsburgh",  "PA", 22,   995000,  7.19, 7000],
    ["2711 Brownsville Rd",  "Pittsburgh",  "PA", 10,   680000,  8.00, 7954],
    ["1663 Suburban Ave",    "Pittsburgh",  "PA", 10,   350000,  8.00, 2448],
    ["910 Main St",          "Nashville",   "TN", 15, 11900000,  7.00, 42000],
    ["1012-1032 Hickory Hill Ln","Hermitage","TN", 12, 2200000, 6.01, 12600],
    ["1200 WH Davis Dr",     "Nashville",   "TN", 45,  6495000,  5.93, 52068],
    ["Dayton 45406 (15-unit)","Dayton",     "OH", 15,  3500000,  7.40, 0],
    ["Albuquerque 87106 (32-unit)","Albuquerque","NM", 32, 4200000, 5.70, 0],
    ["Albuquerque 87108 (23-unit)","Albuquerque","NM", 23, 2800000, 11.00, 0],
    ["1710 S Jefferson Ave", "Tucson",      "AZ", 14,  1695000,  7.46, 0],
    ["Tucson 85705 (20-unit)","Tucson",     "AZ", 20,  1675000,  7.29, 0],
    ["Tucson 85705 (16-unit)","Tucson",     "AZ", 16,  1300000,  7.08, 0],
    ["Tucson 85705 (14-unit)","Tucson",     "AZ", 14,  1250000,  7.00, 0],
    ["Tucson 85705 (12-unit)","Tucson",     "AZ", 12,  1500000,  7.18, 0],
    ["2411 S 6th Ave (16-unit)","Tucson",   "AZ", 16,  1200000,  7.67, 0],
    ["2411 S 6th Ave (18-unit)","Tucson",   "AZ", 18,   995000,  8.47, 0],
    ["Tucson 85706 (38-unit)","Tucson",     "AZ", 38,  2695000,  7.16, 0],
    ["1105 Alamance Church Rd","Greensboro","NC", 10,  1260000,  7.04, 0],
    ["Greensboro (19-unit)", "Greensboro",  "NC", 19,  1000000,  5.00, 0],
    ["5100-5104 W Madison St","Chicago",    "IL", 24,  1400000, 11.05, 0],
    ["1707-1709 S Racine Ave","Chicago",    "IL", 16,  3125000,  7.23, 0],
    ["8001 S Justine St",    "Chicago",     "IL", 22,  1900000,  7.02, 0],
    ["235 N Mason Ave",      "Chicago",     "IL", 26,  3250000,  9.45, 0],
    ["5150 S Calumet Ave",   "Chicago",     "IL", 8,   1450000,  7.72, 0],
    ["3 Rudolph St",         "Lackawanna",  "NY", 10,   800000,  7.36, 0],
    ["169 Merrimac St",      "Buffalo",     "NY", 42,  6000000, 11.92, 0],
    ["286 Highland Pky",     "Tonawanda",   "NY", 18,  1620000,  7.80, 0],
    ["2399 William St",      "Buffalo",     "NY", 18,  1250000,  7.13, 0],
    ["580 Starin Ave",       "Buffalo",     "NY", 16,  1760000,  7.30, 0],
    ["272 Colvin Ave",       "Buffalo",     "NY", 12,  1750000,  6.16, 0],
    ["312 Lake Ave",         "Rochester",   "NY", 25,  1900000,  9.65, 0],
    ["Toledo 43612 (24-unit)","Toledo",     "OH", 24,  1200000, 10.94, 0],
    ["Toledo (23-unit)",     "Toledo",      "OH", 23,  1605000,  8.78, 23500],
    ["55 Ionia Ave NW",      "Grand Rapids","MI", 24,  1850000,  4.89, 20350],
    ["834 Sherman St SE",    "Grand Rapids","MI", 5,    795000,  4.92, 0],
    ["2127 Indianola Ave",   "Des Moines",  "IA", 35,  2100000,  8.36, 14336],
    ["2523 Cedar Ln",        "Knoxville",   "TN", 23,  3400000,  6.32, 17400],
    ["2229 24th St",         "Sacramento",  "CA", 10,  1050000,  9.05, 0],
    ["1821 P St",            "Sacramento",  "CA", 14,  2050000,  6.02, 0],
    ["2226-2230 Sutterville Rd","Sacramento","CA", 15, 2400000,  5.63, 0],
    ["Sacramento 95816 (10-unit)","Sacramento","CA", 10, 1750000, 6.00, 0],
    ["Sacramento 95822 (40-unit)","Sacramento","CA", 40,  875000, 5.70, 0],
    ["Sacramento 95811 (29-unit)","Sacramento","CA", 29, 1450000, 6.01, 0],
    ["Fresno 93703 (13-unit)","Fresno",     "CA", 13,  1399000,  6.88, 0],
    ["Fresno 93703 (13-unit B)","Fresno",   "CA", 13,  2288888,  6.37, 11660],
    ["Fresno 93726 (17-unit)","Fresno",     "CA", 17,   925000,  6.18, 0],
    ["Fresno 93726 (17-unit B)","Fresno",   "CA", 17,  3695000,  5.47, 0],
    ["Fresno 93701 (39-unit)","Fresno",     "CA", 39,  1499900,  6.16, 0],
    ["1824 W Maxwell Ave",   "Spokane",     "WA", 11,  7500000,  5.74, 40000],
    ["5012 N Regal St",      "Spokane",     "WA", 10,  1125000,  5.75, 4898],
    ["515 S Farr Rd",        "Spokane Valley","WA", 16, 3050000,  4.29, 16000],
    ["7852 S Holden St",     "Midvale",     "UT", 12,  4799000,  6.20, 0],
    ["4372 S 900 E",         "Millcreek",   "UT", 20,  9490000,  5.33, 0],
    ["1415 S Corona Ave",    "Colorado Springs","CO", 10, 1500000, 6.63, 7920],
    ["1008 Magoffin Ave",    "El Paso",     "TX", 16,   799000, 11.89, 10986],
    ["Lexington 40509 (32-unit)","Lexington","KY", 32, 4300000,  6.96, 37967],
    ["1416 Townley Dr",      "Lexington",   "KY", 16,  1250000,  5.40, 16000],
    ["Huntsville 35805 (28-unit)","Huntsville","AL", 28, 1950000, 7.51, 0],
    ["Huntsville 35805 (19-unit)","Huntsville","AL", 19, 2700000, 7.41, 0],
    ["Shreveport 71101 (28-unit)","Shreveport","LA", 28, 1300000, 10.23, 0],
    ["Shreveport 71101 (28-unit B)","Shreveport","LA", 28, 1295000, 11.12, 0],
    ["3150 Oneal Ln",        "Baton Rouge", "LA", 30,  2000000,  7.49, 22988],
    ["670-680 Hancock Ave",  "Akron",       "OH", 24,  1450000,  8.90, 0],
    ["488-500 Zahn",         "Akron",       "OH", 16,  1250000,  7.00, 0],
    ["3115 Carroll Rd",      "Fort Wayne",  "IN", 10,  1040000,  7.11, 7224],
    ["13816 Illinois Rd",    "Fort Wayne",  "IN", 29,  4300000,  5.97, 30828],
    ["1738 12th St",         "Cayce",       "SC", 10,  1299000,  7.54, 10000],
    ["7219 Frost Ave",       "Columbia",    "SC", 21,   900000,  6.46, 21000],
    ["101 Waldorf Pky",      "Syracuse",    "NY", 15,  1900000,  7.36, 0],
    ["Savannah 31401 (40-unit)","Savannah", "GA", 40,  1100000,  6.23, 0],
    ["11010 Middleground Rd","Savannah",    "GA", 22,  2750000,  6.02, 0],
    ["1850-1852 Merchant St","Sparks",      "NV", 40,  6200000,  5.62, 0],
    ["927 Ralston St",       "Reno",        "NV", 17,  3091307,  6.45, 0],
    ["5416 S M St",          "Tacoma",      "WA", 30,  4150000,  6.21, 0],
    ["6715 146th St SW",     "Tacoma",      "WA", 10,  1995000,  6.01, 0],
    ["4019 S Puget Sound Ave","Tacoma",     "WA", 10,  2995000,  6.14, 0],
    ["2126 O St",            "Bakersfield", "CA", 24,  3245000,  6.88, 20760],
    ["330 Roberts Ln",       "Bakersfield", "CA", 18,  1975000,  6.00, 9785],
    ["Springfield 65806 (15-unit)","Springfield","MO", 15, 649950, 7.40, 0],
    ["7774 Skolout St",      "San Antonio", "TX", 16,   725000,  7.00, 0],
    ["Orlando 32805 (40-unit)","Orlando",   "FL", 40,  4150000,  7.42, 36664],
    ["8105 W Colonial Dr",   "Orlando",     "FL", 21,  3500000,  5.35, 10600],
    ["Charlotte 28215 (29-unit)","Charlotte","NC", 29, 4100000,  5.79, 0],
    ["315 S Gardner Ave",    "Charlotte",   "NC", 17,  4250000,  5.58, 17478],
    ["Portland 97202 (10-unit)","Portland", "OR", 10,   995000,  4.50, 0],
    ["2926 SW 4th Ave",      "Portland",    "OR", 10,  2750000,  5.72, 9081],
    ["Portland 97215 (10-unit)","Portland", "OR", 10,  2295000,  6.01, 0],
    ["Portland 97227 (18-unit)","Portland", "OR", 18,  5150000,  5.60, 0],
    ["Portland 97211 (21-unit)","Portland", "OR", 21,  5175000,  5.91, 0],
    ["2341 SE 152nd Ave",    "Portland",    "OR", 30,  4000000,  6.13, 28839],
    ["Norfolk 23510 (16-unit)","Norfolk",   "VA", 16,  1400000,  6.58, 0],
    ["945 N El Dorado St",   "Stockton",    "CA", 10,  1200000,  7.21, 5800],
    ["145 W Flora St",       "Stockton",    "CA", 45,  3995000,  6.80, 60434],
    ["721 Erickson Ave",     "Modesto",     "CA", 17,  1860000,  5.70, 13000],
    ["3212-3244 S Victoria St","Wichita",   "KS", 25,   735000,  7.32, 0],
    ["Mobile 36604 (32-unit)","Mobile",     "AL", 32,  4200000,  7.90, 0],
    ["316 W Columbus Dr",    "Tampa",       "FL", 12,  1099999,  7.64, 0],
    ["Tampa 33613 (12-unit)","Tampa",       "FL", 12,  1750000,  7.05, 0],
    ["Tampa 33604 (10-unit)","Tampa",       "FL", 10,  1100000,  7.55, 0],
    ["268-288 Central Ave",  "Saint Petersburg","FL", 10, 1315000, 6.32, 0],
    ["9212 W Brogan Dr",     "Boise",       "ID", 15,  1700000,  5.60, 9424],
    ["810 N D St",           "Grangeville", "ID", 16,  3300000,  6.00, 18000]
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

  /* ============ LIVE LISTINGS (Crexi / LoopNet / CityFeet / Showcase) ============ */
  const STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];

  // Top multifamily metros: [City, ST]
  const METROS = [
    ["Atlanta","GA"],["Austin","TX"],["Baltimore","MD"],["Birmingham","AL"],["Charlotte","NC"],
    ["Chicago","IL"],["Cincinnati","OH"],["Cleveland","OH"],["Columbus","OH"],["Dallas","TX"],
    ["Denver","CO"],["Detroit","MI"],["Fort Worth","TX"],["Houston","TX"],["Indianapolis","IN"],
    ["Jacksonville","FL"],["Kansas City","MO"],["Las Vegas","NV"],["Los Angeles","CA"],["Louisville","KY"],
    ["Memphis","TN"],["Miami","FL"],["Milwaukee","WI"],["Minneapolis","MN"],["Nashville","TN"],
    ["New Orleans","LA"],["Oklahoma City","OK"],["Orlando","FL"],["Philadelphia","PA"],["Phoenix","AZ"],
    ["Pittsburgh","PA"],["Portland","OR"],["Raleigh","NC"],["Sacramento","CA"],["San Antonio","TX"],
    ["Seattle","WA"],["St. Louis","MO"],["Tampa","FL"],["Tucson","AZ"],["Tulsa","OK"]
  ];

  const hy = (s) => s.toLowerCase().replace(/\./g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); // "St. Louis" -> "st-louis"
  const us = (s) => s.replace(/\./g, "").trim().replace(/\s+/g, "_");                                     // "Kansas City" -> "Kansas_City"

  function liveLinks(city, st, stateName) {
    const c = (city || "").trim();
    const stl = st.toLowerCase();
    if (c) {
      return [
        ["Crexi",       "Largest CRE exchange — heavy multifamily, active only.", `https://www.crexi.com/properties/${st}/${us(c)}/Multifamily`],
        ["LoopNet",     "The biggest CRE marketplace for apartment buildings.",   `https://www.loopnet.com/search/apartment-buildings/${hy(c)}-${stl}/for-sale/`],
        ["CityFeet",    "Yardi-network apartment listings for sale.",             `https://www.cityfeet.com/cont/${hy(c)}-${stl}/apartment-buildings-for-sale`],
        ["Showcase",    "CoStar's public marketplace — active listings.",         `https://www.showcase.com/${stl}/${hy(c)}/apartment-buildings/for-sale/`]
      ];
    }
    return [
      ["Crexi",     "Largest CRE exchange — heavy multifamily, active only.", `https://www.crexi.com/properties/${st}/Multifamily`],
      ["LoopNet",   "The biggest CRE marketplace for apartment buildings.",   `https://www.loopnet.com/search/apartment-buildings/${stl}/for-sale/`],
      ["CityFeet",  "Yardi-network apartment listings for sale.",             `https://www.cityfeet.com/cont/${hy(stateName)}/apartment-buildings-for-sale`],
      ["Showcase",  "CoStar's public marketplace — active listings.",         `https://www.showcase.com/${stl}/apartment-buildings/for-sale/`]
    ];
  }

  function renderLive() {
    const city = $("lvCity").value.trim();
    const st = $("lvState").value;
    const stateName = (STATES.find((s) => s[0] === st) || [, ""])[1];
    const units = $("lvUnits").value;
    const max = num($("lvMax").value);
    const links = liveLinks(city, st, stateName);
    $("lvSrc").innerHTML = links.map(([name, desc, url]) => `
      <a class="src" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
        <div class="src__top"><span class="src__name">${name}</span><span class="src__go">Open ↗</span></div>
        <div class="src__desc">${desc}</div>
        <div class="src__cta">Live active listings + broker contact</div>
      </a>`).join("");
    const where = city ? `${esc(city)}, ${st}` : stateName;
    const bits = [`${units === "0" ? "any size" : units + "+ units"}`];
    if (max) bits.push(`under ${money(max)}`);
    $("lvSummary").innerHTML = `Live <b>multifamily for sale</b> in <b>${where}</b> · ${bits.join(" · ")}. Opens each marketplace's current inventory.`;
    $("lvResults").hidden = false;
  }

  function renderMetros() {
    const grid = $("metroGrid"); if (!grid) return;
    grid.innerHTML = METROS.map(([city, st]) => {
      const l = liveLinks(city, st, "");
      const crexi = l[0][2], loop = l[1][2];
      return `<div class="metro">
        <div class="metro__name">${esc(city)}<span>${st}</span></div>
        <div class="metro__links">
          <a href="${esc(crexi)}" target="_blank" rel="noopener noreferrer">Crexi ↗</a>
          <a href="${esc(loop)}" target="_blank" rel="noopener noreferrer">LoopNet ↗</a>
        </div>
      </div>`;
    }).join("");
  }

  /* ---- finance ---- */
  function pmt(P, ratePct, yrs) { const r = ratePct / 100 / 12, n = yrs * 12; if (n <= 0) return 0; return r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)); }
  function remain(P, ratePct, yrs, months) { const r = ratePct / 100 / 12, n = yrs * 12, k = Math.min(months, n); if (r === 0) return Math.max(0, P - P / n * k); const m = pmt(P, ratePct, yrs); return Math.max(0, P * Math.pow(1 + r, k) - m * ((Math.pow(1 + r, k) - 1) / r)); }

  function assumptions() {
    return {
      down: num($("gDown").value), rate: num($("gRate").value),
      amort: num($("gAmort").value), closing: num($("gClosing").value), exp: num($("gExp").value)
    };
  }

  // Core underwriting: works from an explicit NOI so it serves both the
  // listed-cap board deals and real income-statement analysis.
  function computeAll(price, units, noi, a) {
    const cap = price > 0 ? (noi / price) * 100 : 0;
    const down = price * (a.down / 100);
    const loan = price - down;
    const ds = pmt(loan, a.rate, a.amort) * 12;
    const cf = noi - ds;
    const invested = down + price * (a.closing / 100);
    const coc = invested > 0 ? (cf / invested) * 100 : 0;
    const dscr = ds > 0 ? noi / ds : Infinity;
    const cfPU = units > 0 ? cf / units / 12 : 0;
    // seller-financing scenario (15% down, 0.75% below your rate, same amort, 5-yr balloon)
    const sDown = price * 0.15, sLoan = price - sDown, sRate = Math.max(0, a.rate - 0.75);
    const sDS = pmt(sLoan, sRate, a.amort) * 12, sCF = noi - sDS;
    const sInv = sDown + price * (a.closing / 100);
    const seller = { down: sDown, loan: sLoan, rate: sRate, ds: sDS, cf: sCF,
      coc: sInv > 0 ? (sCF / sInv) * 100 : 0, dscr: sDS > 0 ? noi / sDS : Infinity,
      balloon: remain(sLoan, sRate, a.amort, 60) };
    const s = score(cap, coc, dscr === Infinity ? 2 : dscr, cfPU);
    return { price, units, noi, cap, down, loan, ds, cf, coc, dscr, cfPU, invested, ppu: units > 0 ? price / units : 0, seller, ...s };
  }
  const underwrite = (d, a) => computeAll(d.price, d.units, d.price * (d.cap / 100), a);

  // Annual mortgage constant per $1 of loan (for the reverse solver)
  function mortgageConstant(a) {
    const r = a.rate / 100 / 12, n = a.amort * 12;
    if (n <= 0) return 0;
    return r === 0 ? 12 / n : 12 * (r / (1 - Math.pow(1 + r, -n)));
  }
  // Max purchase price to still hit target cash-on-cash and DSCR at a given NOI
  function maxOffer(noi, a, targetCoC, targetDSCR) {
    const K = mortgageConstant(a), ltv = 1 - a.down / 100, invFrac = a.down / 100 + a.closing / 100;
    const denomCoC = (targetCoC / 100) * invFrac + ltv * K;
    const pCoC = denomCoC > 0 ? noi / denomCoC : Infinity;
    const denomD = targetDSCR * ltv * K;
    const pD = denomD > 0 ? noi / denomD : Infinity;
    return { coc: pCoC, dscr: pD, max: Math.min(pCoC, pD) };
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
  let boardQuery = "";

  function currentRows() {
    const a = assumptions();
    const fState = $("fState").value, fUnits = num($("fUnits").value),
          fMax = num($("fMax").value), fMinScore = num($("fMinScore").value);
    let rows = DEALS.map((d) => ({ d, u: underwrite(d, a) }));
    rows = rows.filter(({ d, u }) =>
      (fState === "ALL" || d.state === fState) &&
      d.units >= fUnits &&
      (!fMax || d.price <= fMax) &&
      u.total >= fMinScore &&
      (!boardQuery || (d.addr + " " + d.city + " " + d.state).toLowerCase().includes(boardQuery)));
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

  const moneyOr = (n) => (isFinite(n) && n > 0 ? money(n) : "—");
  function maxOfferCard(noi, a, ask) {
    if (noi <= 0) return `<div class="dcard wide maxoffer"><h4>🎯 Max offer <span class="h4sub">to hit your return targets</span></h4><p class="mo-note">NOI is zero or negative at these numbers — no purchase price hits a positive return. Re-check income/expenses.</p></div>`;
    const mo = maxOffer(noi, a, 8, 1.25);
    const bind = mo.max === mo.coc ? "8% cash-on-cash" : "1.25× DSCR";
    const delta = ask > 0 ? (mo.max - ask) / ask * 100 : 0;
    const rel = !ask ? "" : mo.max >= ask
      ? ` At the ${money(ask)} ask, that's <b class="pos">${pct(Math.abs(delta), 0)} above list</b> — it already clears your targets.`
      : ` At the ${money(ask)} ask, offer <b class="neg">${pct(Math.abs(delta), 0)} below list</b> to hit them.`;
    return `
      <div class="dcard wide maxoffer">
        <h4>🎯 Max offer <span class="h4sub">to hit your return targets</span></h4>
        <div class="mo-grid">
          <div class="mo"><span class="mo-k">For 8% cash-on-cash</span><strong class="tnum">${moneyOr(mo.coc)}</strong></div>
          <div class="mo"><span class="mo-k">For 1.25× DSCR</span><strong class="tnum">${moneyOr(mo.dscr)}</strong></div>
          <div class="mo mo--hl"><span class="mo-k">Recommended max (both)</span><strong class="tnum">${moneyOr(mo.max)}</strong></div>
        </div>
        <p class="mo-note">Binding target: <b>${bind}</b>.${rel}</p>
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
        ${maxOfferCard(u.noi, a, d.price)}
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
        <button class="btn btn--ghost btn--sm" data-sheet="${d.id}">🖨 One-pager</button>
      </div>`;
  }

  /* ---- printable underwriting one-pager ---- */
  function renderSheet(name, sub, price, units, cap, u, a) {
    const g = gradeOf(u.total);
    const pi = pmt(u.loan, a.rate, a.amort), spi = pmt(u.seller.loan, u.seller.rate, a.amort);
    const mo = maxOffer(u.noi, a, 8, 1.25);
    const row = (k, v) => `<tr><td>${k}</td><td>${v}</td></tr>`;
    let dt = ""; try { dt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); } catch { dt = ""; }
    $("printSheet").innerHTML = `
      <div class="ps">
        <div class="ps-head"><div class="ps-brand">🏢 Deal<b>Scout</b></div><div class="ps-date">Underwriting summary${dt ? " · " + dt : ""}</div></div>
        <h1 class="ps-title">${esc(name)}</h1>
        <div class="ps-sub">${esc(sub)}</div>
        <div class="ps-score">Deal score <b>${u.total}/100</b> — Grade ${g.l} · ${g.t}</div>
        <div class="ps-metrics">
          <div><span>Price</span><b>${money(price)}</b></div>
          <div><span>Units</span><b>${units}</b></div>
          <div><span>Price / unit</span><b>${money(u.ppu)}</b></div>
          <div><span>Cap rate</span><b>${pct(cap)}</b></div>
          <div><span>NOI / yr</span><b>${money(u.noi)}</b></div>
          <div><span>Cash flow / yr</span><b>${money(u.cf)}</b></div>
        </div>
        <div class="ps-cols">
          <table class="ps-tbl"><caption>Conventional — ${a.down}% down, ${pct(a.rate)}, ${a.amort}-yr</caption><tbody>
            ${row("Down payment", money(u.down))}${row("Loan amount", money(u.loan))}${row("Monthly P&amp;I", money(pi))}${row("Annual debt service", money(u.ds))}${row("Cash flow / yr", money(u.cf))}${row("Cash-on-cash", pct(u.coc))}${row("DSCR", u.dscr === Infinity ? "∞" : xx(u.dscr))}${row("Cash to close", money(u.invested))}
          </tbody></table>
          <table class="ps-tbl"><caption>Seller financing — 15% down, ${pct(u.seller.rate)}, 5-yr balloon</caption><tbody>
            ${row("Down payment", money(u.seller.down))}${row("Seller note", money(u.seller.loan))}${row("Monthly P&amp;I", money(spi))}${row("Annual debt service", money(u.seller.ds))}${row("Cash flow / yr", money(u.seller.cf))}${row("Cash-on-cash", pct(u.seller.coc))}${row("DSCR", u.seller.dscr === Infinity ? "∞" : xx(u.seller.dscr))}${row("Balloon @ yr 5", money(u.seller.balloon))}
          </tbody></table>
        </div>
        <div class="ps-max">🎯 Max offer to still hit 8% cash-on-cash &amp; 1.25× DSCR: <b>${moneyOr(mo.max)}</b></div>
        <div class="ps-foot">Screening estimate only — not financial advice. Verify rent roll, T-12, taxes &amp; insurance before making an offer. Generated by DealScout.</div>
      </div>`;
    document.body.classList.add("printing");
    window.print();
  }
  function sheetForDeal(id) {
    const d = DEALS.find((x) => x.id === id); if (!d) return;
    const a = assumptions(), u = underwrite(d, a);
    renderSheet(`${d.addr}`, `${d.city}, ${d.state} · ${d.units} units`, d.price, d.units, d.cap, u, a);
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
    document.querySelectorAll("[data-sheet]").forEach((btn) => {
      btn.addEventListener("click", (e) => { e.stopPropagation(); sheetForDeal(btn.dataset.sheet); });
    });
  }

  /* ---- Markets analytics ---- */
  function barChart(title, sub, data) {
    const maxV = Math.max(1, ...data.map((d) => d.value));
    const bars = data.map((d) => `
      <div class="bar-row${d.city ? " bar-row--link" : ""}" title="${esc(d.tip || "")}"${d.city ? ` data-city="${esc(d.city)}"` : ""}>
        <span class="bar-label">${esc(d.label)}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${Math.max(1.5, d.value / maxV * 100).toFixed(1)}%"></span></span>
        <span class="bar-val tnum">${esc(d.valLabel != null ? d.valLabel : d.value)}</span>
      </div>`).join("");
    return `<div class="chart"><div class="chart__h"><h3>${title}</h3><span>${sub}</span></div><div class="bars">${bars}</div></div>`;
  }
  function gradeMixChart(gc, total) {
    const order = [["A", "Strong", "g-a"], ["B", "Good", "g-b"], ["C", "Fair", "g-c"], ["D", "Weak", "g-d"]];
    const seg = order.map(([l, , c]) => { const w = total ? gc[l] / total * 100 : 0; return w > 0 ? `<span class="gm-seg ${c}" style="width:${w}%" title="${l}: ${gc[l]} (${Math.round(w)}%)"></span>` : ""; }).join("");
    const legend = order.map(([l, t, c]) => `<span class="gm-key"><i class="${c}"></i>${l} · ${t} <b class="tnum">${gc[l]}</b></span>`).join("");
    return `<div class="chart chart--wide"><div class="chart__h"><h3>Deal grades</h3><span>How the board scores at your financing assumptions</span></div><div class="gm-bar">${seg}</div><div class="gm-legend">${legend}</div></div>`;
  }

  function renderMarkets() {
    const a = assumptions();
    const rows = DEALS.map((d) => ({ d, u: underwrite(d, a) }));
    const n = rows.length;
    const states = new Set(rows.map((r) => r.d.state)).size;
    const avgCap = rows.reduce((s, r) => s + r.d.cap, 0) / n;
    const caps = rows.map((r) => r.d.cap).sort((x, y) => x - y);
    const medCap = caps[Math.floor(caps.length / 2)];
    const ppus = rows.map((r) => r.u.ppu).sort((x, y) => x - y);
    const medPPU = ppus[Math.floor(ppus.length / 2)];
    const strong = rows.filter((r) => r.u.total >= 65).length;
    $("mktStats").innerHTML = [
      ["Listings", n, `${states} states`],
      ["Median cap", pct(medCap, 1), `avg ${pct(avgCap, 1)}`],
      ["Median $/unit", money(medPPU), "across board"],
      ["Strong (B+)", strong, `${Math.round(strong / n * 100)}% of board`]
    ].map(([k, v, s]) => `<div class="mkt-stat"><span>${k}</span><strong class="tnum">${v}</strong><small>${s}</small></div>`).join("");

    const byMkt = {};
    rows.forEach((r) => { const key = r.d.city + ", " + r.d.state; (byMkt[key] = byMkt[key] || { n: 0, cap: 0 }); byMkt[key].n++; byMkt[key].cap += r.d.cap; });
    const mkts = Object.entries(byMkt).map(([k, v]) => ({ label: k, value: v.n, cap: v.cap / v.n })).sort((x, y) => y.value - x.value).slice(0, 12);
    const buckets = [["< 5%", (c) => c < 5], ["5–6%", (c) => c >= 5 && c < 6], ["6–7%", (c) => c >= 6 && c < 7], ["7–8%", (c) => c >= 7 && c < 8], ["8–9%", (c) => c >= 8 && c < 9], ["9–10%", (c) => c >= 9 && c < 10], ["10%+", (c) => c >= 10]];
    const capDist = buckets.map(([lab, f]) => ({ label: lab, value: rows.filter((r) => f(r.d.cap)).length }));
    const gc = { A: 0, B: 0, C: 0, D: 0 };
    rows.forEach((r) => gc[gradeOf(r.u.total).l]++);

    $("charts").innerHTML =
      barChart("Inventory by market", "Top 12 metros — click a bar to open it on the board", mkts.map((m) => ({ label: m.label, value: m.value, valLabel: m.value + " · " + pct(m.cap, 1), tip: `${m.label}: ${m.value} listings, avg cap ${pct(m.cap, 1)} — click to view`, city: m.label.split(",")[0] }))) +
      barChart("Cap-rate distribution", "Listed cap rate across every deal on the board", capDist.map((b) => ({ label: b.label, value: b.value, valLabel: String(b.value), tip: `${b.label}: ${b.value} listings` }))) +
      gradeMixChart(gc, n);

    document.querySelectorAll("#charts .bar-row[data-city]").forEach((el) => el.addEventListener("click", () => {
      switchTab("deals");
      const s = $("boardSearch"); s.value = el.dataset.city; boardQuery = el.dataset.city.toLowerCase(); renderList();
    }));
  }

  function switchTab(name) {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("is-active", x.dataset.view === name));
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    $("view-" + name).classList.add("is-active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exportCSV() {
    const rows = currentRows();
    const head = ["Rank", "Address", "City", "State", "Units", "Price", "Cap%", "PricePerUnit", "NOI", "CashFlowYr", "CoC%", "DSCR", "Score", "Grade", "ListingSearchURL"];
    const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const lines = [head.join(",")];
    rows.forEach((r, i) => {
      const d = r.d, u = r.u;
      lines.push([i + 1, q(d.addr), q(d.city), d.state, d.units, Math.round(d.price), d.cap, Math.round(u.ppu), Math.round(u.noi), Math.round(u.cf), u.coc.toFixed(1), u.dscr === Infinity ? "" : u.dscr.toFixed(2), u.total, gradeOf(u.total).l, q(d.src)].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const el = document.createElement("a"); el.href = URL.createObjectURL(blob); el.download = "dealscout-deals.csv"; el.click(); URL.revokeObjectURL(el.href);
  }

  /* ---- Analyze Any Deal ---- */
  let anMode = "income", anExpMode = "pct";
  const scoreBlurb = (s) => s >= 80 ? "Strong — investable at these numbers; verify the actuals." : s >= 65 ? "Good — worth pursuing; tighten price or terms." : s >= 50 ? "Fair — negotiate the price or the financing." : "Weak — likely a pass at this price.";

  function anCompute() {
    const price = num($("anPrice").value), units = num($("anUnits").value);
    const a = { down: num($("anDown").value), rate: num($("anRate").value), amort: num($("anAmort").value), closing: num($("anClosing").value), exp: 0 };
    let noi;
    if (anMode === "cap") {
      noi = price * (num($("anCap").value) / 100);
    } else {
      const gsi = (num($("anRent").value) + num($("anOther").value)) * 12;
      const egi = gsi * (1 - num($("anVac").value) / 100);
      const ev = num($("anExpVal").value);
      const opex = anExpMode === "dollar" ? ev : egi * (ev / 100);
      noi = egi - opex;
    }
    return { price, units, a, u: computeAll(price, units, noi, a) };
  }

  function renderAnalyze() {
    const { price, a, u } = anCompute();
    const g = gradeOf(u.total);
    const conv = { down: u.down, downPct: a.down, loan: u.loan, rate: a.rate, ds: u.ds, cf: u.cf, coc: u.coc, dscr: u.dscr, invested: u.invested };
    const sell = { ...u.seller, downPct: 15 };
    const cfNeg = u.cf < 0 ? "val--neg" : "";
    $("anResults").innerHTML = `
      <div class="an-score ${g.c}">
        <div class="gauge gauge--lg" style="--p:${u.total}"><span class="tnum">${u.total}</span></div>
        <div class="an-score__meta"><div class="an-grade">${g.l} · ${g.t}</div><div class="an-blurb">${scoreBlurb(u.total)}</div></div>
      </div>
      <div class="metrics an-metrics">
        <div class="metric"><span class="metric__label">Cap rate</span><strong class="tnum">${pct(u.cap)}</strong></div>
        <div class="metric"><span class="metric__label">NOI / yr</span><strong class="tnum">${money(u.noi)}</strong></div>
        <div class="metric"><span class="metric__label">Price / unit</span><strong class="tnum">${money(u.ppu)}</strong></div>
        <div class="metric"><span class="metric__label">Cash flow / yr</span><strong class="tnum ${cfNeg}">${money(u.cf)}</strong></div>
      </div>
      <div class="detail__grid">
        ${plTable("🏦 Conventional", "your terms", conv, a.amort, "conv")}
        ${plTable("🤝 Seller financing", "15% down · 5-yr balloon", sell, a.amort, "seller")}
        ${maxOfferCard(u.noi, a, price)}
      </div>`;
  }

  function anSave() {
    const { price, units, u } = anCompute();
    const name = $("anName").value.trim() || `${units || "?"}-unit — ${money(price)}`;
    const url = $("anUrl").value.trim() || ("https://www.google.com/search?q=" + encodeURIComponent(name + " apartment for sale"));
    pipeline.unshift({ id: "d" + Date.now(), srcId: null, name, url, price, units, cap: +u.cap.toFixed(2), cf: Math.round(u.cf), score: u.total, stage: "prospect" });
    savePipe(); renderBoard(); toast(`Saved “${name}” to pipeline`);
  }

  function initAnalyze() {
    document.querySelectorAll("#anModeSeg button").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll("#anModeSeg button").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active"); anMode = b.dataset.mode;
      $("anIncomeBlock").hidden = anMode !== "income";
      $("anCapBlock").hidden = anMode !== "cap";
      renderAnalyze();
    }));
    document.querySelectorAll("#anExpSeg button").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll("#anExpSeg button").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active"); anExpMode = b.dataset.x; renderAnalyze();
    }));
    ["anPrice", "anUnits", "anRent", "anOther", "anVac", "anExpVal", "anCap", "anDown", "anRate", "anAmort", "anClosing"]
      .forEach((id) => $(id).addEventListener("input", renderAnalyze));
    $("anSave").addEventListener("click", anSave);
    $("anSheet").addEventListener("click", () => {
      const { price, units, a, u } = anCompute();
      const name = $("anName").value.trim() || `${units || "?"}-unit — ${money(price)}`;
      renderSheet(name, `${units || "?"} units · underwritten in Analyze`, price, units, u.cap, u, a);
    });
    $("anReset").addEventListener("click", () => { $("anName").value = ""; $("anUrl").value = ""; renderAnalyze(); });
    renderAnalyze();
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
    const owned = pipeline.filter((p) => p.stage === "closed");
    const val = active.reduce((s, p) => s + (p.price || 0), 0);
    const units = active.reduce((s, p) => s + (p.units || 0), 0);
    const cfYr = active.reduce((s, p) => s + (p.cf || 0), 0);
    const avg = active.length ? active.reduce((s, p) => s + (p.cap || 0), 0) / active.length : 0;
    const cfCls = cfYr < 0 ? "val--neg" : "";
    $("pipeStats").innerHTML =
      `<div class="stat"><span>Active deals</span><strong class="tnum">${active.length}</strong></div>
       <div class="stat"><span>Total units</span><strong class="tnum">${units}${owned.length ? ` · ${owned.reduce((s, p) => s + (p.units || 0), 0)} owned` : ""}</strong></div>
       <div class="stat"><span>Pipeline value</span><strong class="tnum">${money(val)}</strong></div>
       <div class="stat"><span>Projected cash flow</span><strong class="tnum ${cfCls}">${money(cfYr)}<small style="font-size:12px;color:var(--muted);font-weight:600">/yr</small></strong></div>`;
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
    // states present in data (Deal Board filter)
    const states = [...new Set(DEALS.map((d) => d.state))].sort();
    $("fState").innerHTML = `<option value="ALL">All states</option>` + states.map((s) => `<option value="${s}">${s}</option>`).join("");

    // Live Listings: all 50 states + market browser
    $("lvState").innerHTML = STATES.map(([a, n]) => `<option value="${a}">${n}</option>`).join("");
    $("lvState").value = "TX";
    $("lvGo").addEventListener("click", renderLive);
    ["lvCity", "lvMax"].forEach((id) => $(id).addEventListener("keydown", (e) => { if (e.key === "Enter") renderLive(); }));
    renderMetros();

    // restore saved financing assumptions
    try {
      const saved = JSON.parse(localStorage.getItem("dealscout2.assume") || "{}");
      Object.entries(saved).forEach(([k, v]) => { if ($(k)) $(k).value = v; });
    } catch { /* ignore */ }

    // re-score on assumption/filter change (+ persist assumptions)
    const ASSUME_IDS = ["gDown", "gRate", "gAmort", "gClosing", "gExp"];
    const saveAssume = () => localStorage.setItem("dealscout2.assume", JSON.stringify(Object.fromEntries(ASSUME_IDS.map((id) => [id, $(id).value]))));
    [...ASSUME_IDS, "fState", "fUnits", "fMax", "fMinScore"].forEach((id) => {
      const el = $(id);
      const handler = () => { renderList(); if (ASSUME_IDS.includes(id)) { saveAssume(); renderMarkets(); } };
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    });
    // board search + CSV export
    $("boardSearch").addEventListener("input", (e) => { boardQuery = e.target.value.toLowerCase().trim(); renderList(); });
    $("csvBtn").addEventListener("click", exportCSV);
    // sort
    document.querySelectorAll("#sortSeg button").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll("#sortSeg button").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active"); sortKey = b.dataset.sort; renderList();
    }));
    // tabs
    document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.view)));
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
    initAnalyze();
    loadPipe();
    renderList();
    renderMarkets();
    renderBoard();
  }

  window.addEventListener("afterprint", () => document.body.classList.remove("printing"));

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
