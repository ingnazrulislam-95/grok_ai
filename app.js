/* Orchard Ledger — Fruit Warehouse & Supply Chain Management
   Vanilla JS + localStorage prototype (backend-replaceable data layer)
*/

(function () {
  "use strict";

  // =============================================================================
  // DATA
  // =============================================================================
  const STORE_KEY = "orchard-ledger-v1";
  const SESSION_KEY = "orchard-ledger-session";
  const PAGE_SIZE = 10;

  const DEFAULT_SETTINGS = {
    daysCritical: 1,
    daysWarning: 2,
    changeAlertPct: 20,
    wasteWarningPct: 5,
    wasteCriticalPct: 8,
  };

  const USERS = [
    { username: "admin", password: "admin123", name: "Sofia Novak", role: "admin", shopId: null, driverId: null },
    { username: "warehouse", password: "warehouse123", name: "Martin Vesely", role: "warehouse", shopId: null, driverId: null },
    { username: "shop12", password: "shop123", name: "Nadia Islam", role: "shop", shopId: "SHP-012", driverId: null },
    { username: "driver01", password: "driver123", name: "Lukas Dvorak", role: "driver", shopId: null, driverId: "DRV-001" },
    { username: "owner", password: "owner123", name: "Elena Kratochvil", role: "owner", shopId: null, driverId: null },
  ];

  const ROLE_LABEL = {
    admin: "Admin",
    warehouse: "Warehouse Manager",
    shop: "Shop Manager",
    driver: "Driver",
    owner: "Owner",
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard", roles: ["admin", "owner", "warehouse", "shop", "driver"] },
    { id: "warehouse", label: "Warehouse Inventory", roles: ["admin", "owner", "warehouse"] },
    { id: "shops", label: "Shops", roles: ["admin", "owner", "warehouse"] },
    { id: "shop-inventory", label: "Shop Inventory", roles: ["admin", "warehouse", "shop"] },
    { id: "replenishment", label: "Replenishment", roles: ["admin", "warehouse", "shop"] },
    { id: "deliveries", label: "Delivery Management", roles: ["admin", "warehouse", "shop", "driver"] },
    { id: "waste", label: "Waste Management", roles: ["admin", "warehouse", "shop"] },
    { id: "products", label: "Products", roles: ["admin", "warehouse"] },
    { id: "suppliers", label: "Suppliers", roles: ["admin", "warehouse"] },
    { id: "reports", label: "Reports", roles: ["admin", "owner", "warehouse"] },
    { id: "alerts", label: "Alerts", roles: ["admin", "owner", "warehouse", "shop"] },
    { id: "settings", label: "Settings", roles: ["admin", "owner", "warehouse", "shop", "driver"] },
  ];

  const LOCATIONS = [
    ["Prague Central", "Prague 1"], ["Prague North", "Prague 8"], ["Prague South", "Prague 4"],
    ["Prague East", "Prague 10"], ["Prague West", "Prague 5"], ["Vinohrady Market", "Prague 2"],
    ["Smíchov Station", "Prague 5"], ["Karlín Dock", "Prague 8"], ["Žižkov Tower", "Prague 3"],
    ["Dejvice Campus", "Prague 6"], ["Holešovice Market", "Prague 7"], ["Nusle Bridge", "Prague 4"],
    ["Vršovice Park", "Prague 10"], ["Pankrác Court", "Prague 4"], ["Letná Ridge", "Prague 7"],
    ["Anděl Crossing", "Prague 5"], ["Florenc Hub", "Prague 8"], ["Palmovka Gate", "Prague 8"],
    ["Budějovická", "Prague 4"], ["Chodov Centre", "Prague 11"], ["Černý Most", "Prague 14"],
    ["Háje Terminal", "Prague 11"], ["Nové Butovice", "Prague 13"], ["Stodůlky West", "Prague 13"],
    ["Břevnov Abbey", "Prague 6"], ["Brno Centre", "Brno"], ["Brno North", "Brno"],
    ["Ostrava Main", "Ostrava"], ["Plzeň Square", "Plzeň"], ["Liberec Hill", "Liberec"],
    ["Olomouc Old Town", "Olomouc"], ["České Budějovice", "České Budějovice"], ["Hradec Králové", "Hradec Králové"],
    ["Pardubice Station", "Pardubice"], ["Ústí nad Labem", "Ústí nad Labem"], ["Zlín Bat'a", "Zlín"],
    ["Kladno Steel", "Kladno"], ["Most Lake", "Most"], ["Opava Silesia", "Opava"],
    ["Frýdek-Místek", "Frýdek-Místek"], ["Karlovy Vary", "Karlovy Vary"], ["Jihlava Highland", "Jihlava"],
    ["Teplice Spa", "Teplice"], ["Děčín Gate", "Děčín"], ["Chomutov", "Chomutov"],
    ["Přerov Junction", "Přerov"], ["Jablonec Glass", "Jablonec nad Nisou"], ["Mladá Boleslav", "Mladá Boleslav"],
    ["Třinec Works", "Třinec"], ["Prostějov", "Prostějov"],
  ];

  const MANAGERS = [
    "Ahmed Rahman", "Karim Hasan", "Farhan Chowdhury", "Lina Begum", "Tariq Hossain",
    "Ayesha Karim", "Imran Khalil", "Rafiq Uddin", "Maya Rahman", "Hassan Ali",
    "Sabrina Noor", "Nadia Islam", "Jamal Hossain", "Priya Sen", "Omar Faruk",
    "Leila Khan", "Daniel Svoboda", "Petra Novotna", "Jakub Dvorak", "Anna Prochazka",
    "Tomas Horak", "Eva Nemcova", "Michal Kral", "Barbora Cerna", "Pavel Marek",
    "Adela Urban", "Stefan Popov", "Ivana Blaha", "Radek Fiala", "Klara Benes",
    "Nabil Chowdhury", "Yasmin Akter", "Viktor Hajek", "Lucie Pokorna", "Filip Navratil",
    "Hana Sestak", "Arif Mahmud", "Selina Rahman", "Ondrej Vacek", "Monika Holub",
    "David Toth", "Zuzana Kriz", "Samir Ahmed", "Fatima Begum", "Roman Cech",
    "Nikola Vlk", "Ibrahim Kabir", "Tereza Maly", "Adam Urbanek", "Eliška Svec",
  ];

  const PRODUCT_DEFS = [
    { id: "PRD-001", name: "Banana", category: "Tropical", unit: "kg", purchase: 1.1, sell: 1.85, min: 80, max: 900, safety: 40, shelf: 7, warnWaste: 5, critWaste: 8, supplierId: "SUP-003" },
    { id: "PRD-002", name: "Apple", category: "Pome", unit: "kg", purchase: 0.95, sell: 1.7, min: 100, max: 1200, safety: 50, shelf: 21, warnWaste: 4, critWaste: 7, supplierId: "SUP-002" },
    { id: "PRD-003", name: "Orange", category: "Citrus", unit: "kg", purchase: 1.05, sell: 1.8, min: 90, max: 800, safety: 45, shelf: 18, warnWaste: 4, critWaste: 7, supplierId: "SUP-005" },
    { id: "PRD-004", name: "Mango", category: "Tropical", unit: "kg", purchase: 2.4, sell: 3.9, min: 40, max: 300, safety: 20, shelf: 8, warnWaste: 6, critWaste: 10, supplierId: "SUP-008" },
    { id: "PRD-005", name: "Strawberry", category: "Berry", unit: "kg", purchase: 4.2, sell: 6.8, min: 25, max: 180, safety: 15, shelf: 4, warnWaste: 5, critWaste: 8, supplierId: "SUP-004" },
    { id: "PRD-006", name: "Grapes", category: "Berry", unit: "kg", purchase: 2.1, sell: 3.4, min: 50, max: 400, safety: 25, shelf: 10, warnWaste: 5, critWaste: 9, supplierId: "SUP-001" },
    { id: "PRD-007", name: "Pineapple", category: "Tropical", unit: "kg", purchase: 1.6, sell: 2.75, min: 40, max: 280, safety: 20, shelf: 12, warnWaste: 4, critWaste: 7, supplierId: "SUP-003" },
    { id: "PRD-008", name: "Watermelon", category: "Melon", unit: "kg", purchase: 0.55, sell: 1.1, min: 80, max: 700, safety: 40, shelf: 10, warnWaste: 6, critWaste: 10, supplierId: "SUP-001" },
    { id: "PRD-009", name: "Papaya", category: "Tropical", unit: "kg", purchase: 1.9, sell: 3.2, min: 30, max: 220, safety: 15, shelf: 8, warnWaste: 6, critWaste: 10, supplierId: "SUP-008" },
    { id: "PRD-010", name: "Avocado", category: "Specialty", unit: "kg", purchase: 3.8, sell: 6.2, min: 20, max: 160, safety: 12, shelf: 9, warnWaste: 5, critWaste: 9, supplierId: "SUP-007" },
    { id: "PRD-011", name: "Lemon", category: "Citrus", unit: "kg", purchase: 1.25, sell: 2.15, min: 40, max: 320, safety: 20, shelf: 21, warnWaste: 3, critWaste: 6, supplierId: "SUP-005" },
    { id: "PRD-012", name: "Blueberry", category: "Berry", unit: "kg", purchase: 6.4, sell: 9.8, min: 15, max: 90, safety: 10, shelf: 6, warnWaste: 5, critWaste: 8, supplierId: "SUP-004" },
  ];

  const SUPPLIERS = [
    { id: "SUP-001", name: "Mediterranean Grove Co.", contact: "Giulia Rossi", phone: "+39 06 4410 220", products: ["PRD-006", "PRD-008"], leadDays: 3, status: "Active" },
    { id: "SUP-002", name: "Alpine Orchard Ltd", contact: "Hans Keller", phone: "+43 1 890 4411", products: ["PRD-002"], leadDays: 2, status: "Active" },
    { id: "SUP-003", name: "TropicLine Import", contact: "Diego Alvarez", phone: "+34 91 320 1188", products: ["PRD-001", "PRD-007"], leadDays: 5, status: "Active" },
    { id: "SUP-004", name: "Bohemia Berry Farms", contact: "Jana Svobodova", phone: "+420 377 210 440", products: ["PRD-005", "PRD-012"], leadDays: 1, status: "Active" },
    { id: "SUP-005", name: "Delta Citrus Group", contact: "Nikos Papadopoulos", phone: "+30 21 0988 120", products: ["PRD-003", "PRD-011"], leadDays: 4, status: "Active" },
    { id: "SUP-006", name: "Nordic Cool Chain", contact: "Ingrid Berg", phone: "+46 8 555 0190", products: ["PRD-002", "PRD-011"], leadDays: 3, status: "Active" },
    { id: "SUP-007", name: "Andes Avocado House", contact: "Camila Soto", phone: "+56 2 2588 300", products: ["PRD-010"], leadDays: 6, status: "Active" },
    { id: "SUP-008", name: "Mekong Mango Export", contact: "Tran Minh", phone: "+84 28 3910 220", products: ["PRD-004", "PRD-009"], leadDays: 7, status: "Active" },
  ];

  const DRIVERS = [
    { id: "DRV-001", name: "Lukas Dvorak", vehicle: "VAN-12" },
    { id: "DRV-002", name: "Petr Hajek", vehicle: "VAN-07" },
    { id: "DRV-003", name: "Amina Yusuf", vehicle: "TRK-04" },
    { id: "DRV-004", name: "Josef Malik", vehicle: "VAN-19" },
  ];

  const WASTE_REASONS = ["Rotten", "Damaged", "Expired", "Unsold", "Quality issue", "Other"];
  const REQ_STATUSES = ["REQUESTED", "APPROVED", "PREPARING", "DISPATCHED", "DELIVERED", "REJECTED"];
  const DLV_STATUSES = ["Scheduled", "Preparing", "Dispatched", "In Transit", "Delivered", "Delayed"];

  let db = null;
  let ui = {
    page: "dashboard",
    shopId: null,
    search: "",
    filter: "all",
    shopFilter: "all",
    sortKey: "",
    sortDir: "asc",
    pageNum: 1,
    modal: null,
    toasts: [],
    notifOpen: false,
    sidebarOpen: false,
    reportTab: "inventory",
    reportFilters: { dateFrom: "", dateTo: "", shopId: "", productId: "", status: "" },
    loginError: "",
  };

  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function pad(n, w) {
    return String(n).padStart(w, "0");
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function addDaysISO(iso, days) {
    const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function daysAgoISO(n) {
    return addDaysISO(todayISO(), -n);
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }

  function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function fmtKg(n) {
    const v = Number(n) || 0;
    return v.toLocaleString(undefined, { maximumFractionDigits: 1 }) + " kg";
  }

  function fmtMoney(n) {
    return "€" + (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function fmtPct(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    const sign = v > 0 ? "+" : "";
    return sign + v.toFixed(1) + "%";
  }

  function round1(n) {
    return Math.round(Number(n) * 10) / 10;
  }

  function clamp0(n) {
    return Math.max(0, round1(n));
  }

  function nextId(prefix) {
    db.meta.seq[prefix] = (db.meta.seq[prefix] || 0) + 1;
    return prefix + "-" + pad(db.meta.seq[prefix], 4);
  }

  function productById(id) {
    return db.products.find((p) => p.id === id);
  }

  function shopById(id) {
    return db.shops.find((s) => s.id === id);
  }

  function supplierById(id) {
    return db.suppliers.find((s) => s.id === id);
  }

  function stockKey(shopId, productId) {
    return shopId + ":" + productId;
  }

  function shopStock(shopId, productId) {
    return db.shopStock[stockKey(shopId, productId)];
  }

  function warehouseRow(productId) {
    return db.warehouse[productId];
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
    } catch (err) {
      toast("Could not save locally (storage full).", "err");
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function generateDemoData() {
    const rand = rng(20260927);
    const shops = LOCATIONS.map((loc, i) => {
      const id = "SHP-" + pad(i + 1, 3);
      const last = daysAgoISO(1 + Math.floor(rand() * 6));
      return {
        id,
        name: loc[0],
        location: loc[1],
        manager: MANAGERS[i],
        phone: "+420 60" + pad(100000 + i * 17, 7).slice(-7),
        status: i % 23 === 0 ? "Attention" : "Open",
        lastDelivery: last,
        nextDelivery: addDaysISO(todayISO(), i % 3 === 0 ? 0 : 1 + (i % 3)),
      };
    });
    shops[11].manager = "Nadia Islam";
    shops[11].name = "Nusle Bridge";

    const warehouse = {};
    PRODUCT_DEFS.forEach((p, i) => {
      const qtyMap = [420, 980, 310, 85, 60, 200, 150, 400, 70, 45, 220, 40];
      const demandMap = [180, 120, 90, 40, 55, 48, 28, 70, 22, 30, 35, 25];
      const qty = qtyMap[i];
      warehouse[p.id] = {
        qty,
        reserved: i === 0 ? 40 : i === 4 ? 10 : 0,
        incoming: i === 3 ? 80 : i === 9 ? 40 : i === 0 ? 100 : 0,
        yesterdayQty: round1(qty * (0.9 + rand() * 0.25)),
        dailyDemand: demandMap[i],
      };
    });

    const shopStockMap = {};
    shops.forEach((shop, si) => {
      PRODUCT_DEFS.forEach((p, pi) => {
        let daily = round1(4 + rand() * (pi === 0 ? 28 : pi === 4 ? 12 : 16));
        let qty = round1(daily * (1.2 + rand() * 4.5));
        let yesterday = round1(qty * (0.85 + rand() * 0.4));
        let received = round1(qty + 20 + rand() * 80);
        if (shop.id === "SHP-012" && p.id === "PRD-001") {
          qty = 18; daily = 25; yesterday = 35; received = 120;
        }
        if (shop.id === "SHP-007" && p.id === "PRD-002") {
          qty = 60; daily = 20; yesterday = 88; received = 200;
        }
        if (shop.id === "SHP-018" && p.id === "PRD-005") {
          qty = 22; daily = 10; yesterday = 28; received = 100;
        }
        if (si % 11 === 3 && pi === 4) {
          qty = round1(daily * 0.6);
        }
        if (si % 9 === 1 && pi === 9) {
          qty = round1(daily * 0.8);
        }
        shopStockMap[stockKey(shop.id, p.id)] = {
          qty,
          yesterdayQty: yesterday,
          dailyUse: daily,
          min: Math.max(p.min / 8, daily * 1.5),
          incoming: 0,
          received,
          wasteQty: 0,
        };
      });
    });

    const batches = [];
    let bseq = 0;
    PRODUCT_DEFS.forEach((p, pi) => {
      const n = 2 + (pi % 2);
      let remaining = warehouse[p.id].qty;
      for (let i = 0; i < n; i++) {
        bseq += 1;
        const share = i === n - 1 ? remaining : round1(remaining * (0.35 + rand() * 0.3));
        remaining = round1(remaining - share);
        const arrival = daysAgoISO(1 + Math.floor(rand() * Math.max(2, p.shelf - 1)));
        batches.push({
          id: "BTH-" + pad(bseq, 4),
          productId: p.id,
          supplierId: p.supplierId,
          arrivalDate: arrival,
          quantity: round1(share * 1.15),
          remaining: Math.max(share, 0),
          shelfLifeDays: p.shelf,
          riskDate: addDaysISO(arrival, Math.max(1, p.shelf - 2)),
        });
      }
    });

    const transactions = [];
    const requests = [];
    const deliveries = [];
    const waste = [];
    const audit = [];
    const notifications = [];
    let tseq = 0, rseq = 0, dseq = 0, wseq = 0;

    function pushTx(partial) {
      tseq += 1;
      transactions.push(Object.assign({
        id: "TXN-" + pad(tseq, 4),
        at: nowISO(),
        productId: "PRD-001",
        qty: 10,
        unit: "kg",
        source: "Warehouse",
        destination: "Shop",
        type: "Warehouse → Shop",
        user: "system",
        ref: "TXN-" + pad(tseq, 4),
      }, partial));
    }

    for (let i = 0; i < 36; i++) {
      const p = PRODUCT_DEFS[i % PRODUCT_DEFS.length];
      const shop = shops[i % shops.length];
      const types = ["Purchase", "Warehouse receiving", "Warehouse → Shop", "Shop sale/consumption", "Waste", "Stock adjustment", "Return"];
      const type = types[i % types.length];
      pushTx({
        at: addDaysISO(todayISO(), -((i % 12) + (i % 3 === 0 ? 0 : 1))) + "T0" + (8 + (i % 9)) + ":1" + (i % 6) + ":00.000Z",
        productId: p.id,
        qty: round1(8 + (i * 3) % 40),
        source: type.indexOf("Shop") >= 0 ? shop.id : "Warehouse",
        destination: type === "Warehouse → Shop" ? shop.id : type.indexOf("sale") >= 0 ? "Customer" : "Warehouse",
        type,
        user: i % 4 === 0 ? "warehouse" : i % 4 === 1 ? "shop12" : "admin",
        ref: "REF-" + pad(1000 + i, 4),
      });
    }

    const reqShops = ["SHP-012", "SHP-007", "SHP-018", "SHP-003", "SHP-025", "SHP-041", "SHP-009", "SHP-033", "SHP-001", "SHP-016"];
    const reqStatuses = ["REQUESTED", "REQUESTED", "REQUESTED", "APPROVED", "PREPARING", "DISPATCHED", "DELIVERED", "REJECTED", "REQUESTED", "APPROVED"];
    for (let i = 0; i < 22; i++) {
      rseq += 1;
      const shopId = reqShops[i % reqShops.length];
      const p = PRODUCT_DEFS[i % PRODUCT_DEFS.length];
      const st = shopStockMap[stockKey(shopId, p.id)];
      const qty = round1(20 + (i * 7) % 55);
      const status = i < reqStatuses.length ? reqStatuses[i] : ["REQUESTED", "APPROVED", "DELIVERED"][i % 3];
      if (status === "APPROVED" || status === "PREPARING" || status === "DISPATCHED") {
        warehouse[p.id].reserved = round1((warehouse[p.id].reserved || 0) + qty);
      }
      if (status === "DISPATCHED") st.incoming = round1((st.incoming || 0) + qty);
      requests.push({
        id: "REQ-" + pad(rseq, 4),
        shopId,
        productId: p.id,
        currentStock: st.qty,
        qty,
        requiredDate: addDaysISO(todayISO(), i % 4 === 0 ? 0 : 1),
        priority: i % 5 === 0 ? "Critical" : i % 3 === 0 ? "High" : "Normal",
        comment: i % 4 === 0 ? "Weekend demand spike expected." : i % 4 === 1 ? "Display restock." : "",
        status,
        createdAt: addDaysISO(todayISO(), -((i % 5))) + "T09:00:00.000Z",
        createdBy: shopId === "SHP-012" ? "shop12" : "admin",
      });
    }

    for (let i = 0; i < 16; i++) {
      dseq += 1;
      const shop = shops[(i * 3) % shops.length];
      const driver = DRIVERS[i % DRIVERS.length];
      const status = i % 7 === 0 ? "Delayed" : i < 5 ? "Scheduled" : i < 8 ? "In Transit" : i < 11 ? "Dispatched" : "Delivered";
      const products = [
        { productId: PRODUCT_DEFS[i % 12].id, qty: round1(18 + (i * 5) % 40) },
        { productId: PRODUCT_DEFS[(i + 3) % 12].id, qty: round1(10 + (i * 3) % 24) },
      ];
      const dispatch = (status === "Scheduled" ? todayISO() : daysAgoISO(status === "Delivered" ? 1 : 0)) + "T07:30:00.000Z";
      deliveries.push({
        id: "DLV-" + pad(dseq, 4),
        shopId: shop.id,
        driverId: driver.id,
        vehicle: driver.vehicle,
        products,
        dispatchTime: dispatch,
        expectedArrival: addDaysISO(dispatch.slice(0, 10), 0) + "T11:00:00.000Z",
        actualArrival: status === "Delivered" ? addDaysISO(dispatch.slice(0, 10), 0) + "T10:40:00.000Z" : null,
        status,
        requestId: i < requests.length ? requests[i].id : null,
      });
    }

    const wasteShops = ["SHP-018", "SHP-012", "SHP-007", "SHP-022", "SHP-031", "SHP-004", "SHP-045", "Warehouse"];
    for (let i = 0; i < 24; i++) {
      wseq += 1;
      const loc = wasteShops[i % wasteShops.length];
      const p = PRODUCT_DEFS[i % PRODUCT_DEFS.length];
      let qty = round1(1 + rand() * 6);
      if (loc === "SHP-018" && p.id === "PRD-005") qty = i < 3 ? 4 : 2.2;
      const rec = {
        id: "WST-" + pad(wseq, 4),
        shopId: loc === "Warehouse" ? null : loc,
        location: loc === "Warehouse" ? "Warehouse" : loc,
        productId: p.id,
        qty,
        reason: WASTE_REASONS[i % WASTE_REASONS.length],
        date: daysAgoISO(i % 10),
        batchId: batches.find((b) => b.productId === p.id)?.id || "",
        recordedBy: loc === "SHP-012" ? "shop12" : "warehouse",
      };
      waste.push(rec);
      if (loc !== "Warehouse") {
        const st = shopStockMap[stockKey(loc, p.id)];
        if (st) st.wasteQty = round1((st.wasteQty || 0) + qty);
      }
    }
    const s18 = shopStockMap[stockKey("SHP-018", "PRD-005")];
    if (s18) s18.wasteQty = 8.2;

    audit.push({ at: nowISO(), user: "system", action: "Seed", description: "Demo data generated." });
    notifications.push({
      id: "NTF-0001",
      at: nowISO(),
      title: "Shop 12 requested bananas",
      body: "Nusle Bridge requested 50 kg bananas.",
      read: false,
      href: "#/replenishment",
    });

    return {
      meta: {
        version: 1,
        generatedAt: nowISO(),
        seq: { TXN: tseq, REQ: rseq, DLV: dseq, WST: wseq, BTH: bseq, NTF: 1, AUD: 1, PO: 0, ADJ: 0 },
      },
      settings: Object.assign({}, DEFAULT_SETTINGS),
      shops,
      products: PRODUCT_DEFS.map((p) => Object.assign({}, p)),
      suppliers: SUPPLIERS.map((s) => Object.assign({}, s)),
      drivers: DRIVERS.map((d) => Object.assign({}, d)),
      warehouse,
      shopStock: shopStockMap,
      batches,
      transactions,
      requests,
      deliveries,
      waste,
      alerts: [],
      notifications,
      audit,
      ignoredRecs: [],
    };
  }

  function initData() {
    db = load();
    if (!db || !db.shops || db.shops.length < 50 || !db.products) {
      db = generateDemoData();
      recomputeAlerts();
      save();
    } else {
      db.settings = Object.assign({}, DEFAULT_SETTINGS, db.settings || {});
      recomputeAlerts();
    }
  }

  function resetDemo() {
    localStorage.removeItem(STORE_KEY);
    db = generateDemoData();
    recomputeAlerts();
    save();
    toast("Demo data reset.", "ok");
    render();
  }

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================
  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    if (!user) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, name: user.name, role: user.role, shopId: user.shopId, driverId: user.driverId }));
  }

  function currentUser() {
    const s = getSession();
    if (!s) return null;
    return USERS.find((u) => u.username === s.username) || s;
  }

  function canSee(page, user) {
    const item = NAV.find((n) => n.id === page);
    if (!item) return true;
    return item.roles.indexOf(user.role) >= 0;
  }

  function login(username, password) {
    const u = USERS.find((x) => x.username === username && x.password === password);
    if (!u) {
      ui.loginError = "Invalid credentials. Use a demo account listed below.";
      render();
      return;
    }
    setSession(u);
    audit("Login", u.name + " signed in as " + ROLE_LABEL[u.role]);
    notify("Signed in", "Welcome back, " + u.name + ".", "#/dashboard");
    ui.loginError = "";
    ui.page = "dashboard";
    location.hash = "#/dashboard";
    render();
  }

  function logout() {
    const u = currentUser();
    if (u) audit("Logout", u.name + " signed out");
    setSession(null);
    ui.page = "dashboard";
    location.hash = "#/";
    render();
  }

  // =============================================================================
  // UTILITIES
  // =============================================================================
  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    warehouse: '<path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/>',
    store: '<path d="M3 9l1-5h16l1 5"/><path d="M4 9h16v11H4z"/><path d="M9 21v-6h6v6"/>',
    boxes: '<path d="M21 8l-9-4-9 4 9 4 9-4z"/><path d="M3 8v8l9 4 9-4V8"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v6h-6"/>',
    truck: '<path d="M1 7h13v10H1z"/><path d="M14 10h5l3 3v4h-8z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>',
    apple: '<path d="M12 4c0 0 2-2 4-1"/><path d="M8 10c0-3 2-5 4-5s4 2 4 5-4 10-4 10-4-7-4-10z"/>',
    factory: '<path d="M2 20V10l6 4V10l6 4V8l8-3v15z"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16l4-6 3 3 5-8"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21h4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    logout: '<path d="M10 7V4H4v16h6v-3"/><path d="M15 12H7"/><path d="M13 9l3 3-3 3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v4M12 17h.01"/>',
    package: '<path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M3 8v8l9 4 9-4V8"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
  };

  function icon(name, size) {
    size = size || 18;
    return '<svg class="icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.grid) + "</svg>";
  }

  function logoSvg() {
    return '<svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#3f6f5b"/><path d="M8 22.5h16v2.2H8zM9.2 14.2h13.6v8.3H9.2z" fill="#F3F0E9"/><path d="M9.2 14.2h13.6v1.4H9.2z" fill="#161513"/><path d="M16 8.2c2.8 0 4.8 1.7 4.8 3.4-1.8.2-3.3-.6-4.8-1.8-1.5 1.2-3 2-4.8 1.8C11.2 9.9 13.2 8.2 16 8.2Z" fill="#F3F0E9"/></svg>';
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      if (ch === "&") return "&" + "amp;";
      if (ch === "<") return "&" + "lt;";
      if (ch === ">") return "&" + "gt;";
      if (ch === '"') return "&" + "quot;";
      return "&#39;";
    });
  }

  function toast(msg, kind) {
    const id = Date.now() + Math.random();
    ui.toasts.push({ id, msg, kind: kind || "ok" });
    render();
    setTimeout(function () {
      ui.toasts = ui.toasts.filter((t) => t.id !== id);
      const stack = document.querySelector(".toast-stack");
      if (stack) stack.innerHTML = ui.toasts.map(toastHtml).join("");
    }, 3200);
  }

  function toastHtml(t) {
    return '<div class="toast ' + esc(t.kind) + '">' + esc(t.msg) + "</div>";
  }

  function audit(action, description) {
    const u = currentUser();
    db.audit.unshift({ at: nowISO(), user: u ? u.username : "system", action, description });
    db.audit = db.audit.slice(0, 400);
  }

  function notify(title, body, href) {
    db.meta.seq.NTF = (db.meta.seq.NTF || 0) + 1;
    db.notifications.unshift({
      id: "NTF-" + pad(db.meta.seq.NTF, 4),
      at: nowISO(),
      title,
      body,
      read: false,
      href: href || "#/alerts",
    });
    db.notifications = db.notifications.slice(0, 200);
  }

  function unreadCount() {
    return (db.notifications || []).filter((n) => !n.read).length;
  }

  function parseHash() {
    const h = (location.hash || "#/dashboard").replace(/^#/, "");
    const parts = h.split("/").filter(Boolean);
    const page = parts[0] || "dashboard";
    const shopId = parts[0] === "shops" && parts[1] ? parts[1] : null;
    return { page, shopId };
  }

  function go(page, extra) {
    if (page === "shops" && extra) location.hash = "#/shops/" + extra;
    else location.hash = "#/" + page;
  }

  function badgeForStock(status) {
    const map = { Critical: "badge-crit", Warning: "badge-warn", Normal: "badge-ok", Overstock: "badge-info" };
    return '<span class="badge ' + (map[status] || "") + '">' + esc(status) + "</span>";
  }

  function daysRemaining(qty, daily) {
    if (!daily || daily <= 0) return 99;
    return qty / daily;
  }

  function stockStatus(days) {
    const s = db.settings;
    if (days < s.daysCritical) return "Critical";
    if (days < s.daysWarning) return "Warning";
    if (days > 10) return "Overstock";
    return "Normal";
  }

  function pctChange(current, yesterday) {
    if (!yesterday || yesterday === 0) return 0;
    return ((current - yesterday) / yesterday) * 100;
  }

  function recommendedQty(st, product) {
    const expected = st.dailyUse * 2;
    const rec = expected + (product.safety / 8) - st.qty - (st.incoming || 0);
    return clamp0(rec);
  }

  function recPriority(days, rec) {
    if (days < 1 || rec > 40) return "Critical";
    if (days < 2 || rec > 20) return "High";
    if (rec <= 0) return "None";
    return "Normal";
  }

  function wastePct(st) {
    if (!st || !st.received) return 0;
    return (st.wasteQty || 0) / st.received * 100;
  }

  function availableWh(productId) {
    const w = warehouseRow(productId);
    return clamp0((w.qty || 0) - (w.reserved || 0));
  }

  function scopedShopId(user) {
    return user.role === "shop" ? user.shopId : ui.shopId;
  }

  function optionList(items, valueKey, labelFn, selected) {
    return items
      .map((it) => {
        const v = typeof it === "string" ? it : it[valueKey];
        const label = typeof it === "string" ? it : labelFn(it);
        return '<option value="' + esc(v) + '"' + (selected === v ? " selected" : "") + ">" + esc(label) + "</option>";
      })
      .join("");
  }

  function paginate(rows) {
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (ui.pageNum > pages) ui.pageNum = pages;
    const start = (ui.pageNum - 1) * PAGE_SIZE;
    return { rows: rows.slice(start, start + PAGE_SIZE), total, pages, start };
  }

  function sortRows(rows, key, getter) {
    if (!key) return rows;
    const dir = ui.sortDir === "desc" ? -1 : 1;
    return rows.slice().sort((a, b) => {
      const va = getter ? getter(a) : a[key];
      const vb = getter ? getter(b) : b[key];
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }

  function searchFilter(rows, text, keys) {
    const q = (text || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => keys.some((k) => String(typeof k === "function" ? k(r) : r[k]).toLowerCase().indexOf(q) >= 0));
  }

  function pagerBar(p) {
    return (
      '<div class="pager"><span>' +
      (p.total ? p.start + 1 : 0) +
      "–" +
      Math.min(p.start + PAGE_SIZE, p.total) +
      " of " +
      p.total +
      "</span><div class=\"row-actions\">" +
      '<button class="btn btn-ghost btn-sm" data-act="page" data-n="-1">Previous</button>' +
      '<button class="btn btn-ghost btn-sm" data-act="page" data-n="1">Next</button></div></div>'
    );
  }

  function exportCSV(filename, header, rows) {
    const lines = [header].concat(rows).map((r) => r.map((c) => '"' + String(c ?? "").replace(/"/g, '""') + '"').join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Exported " + filename, "ok");
  }

  function barChart(labels, values, color) {
    const w = 560, h = 180, padL = 36, padB = 28, padT = 10, padR = 8;
    const max = Math.max.apply(null, values.concat([1]));
    const bw = (w - padL - padR) / values.length;
    const bars = values.map((v, i) => {
      const bh = ((h - padT - padB) * v) / max;
      const x = padL + i * bw + 4;
      const y = h - padB - bh;
      return (
        '<rect x="' + x + '" y="' + y + '" width="' + Math.max(6, bw - 8) + '" height="' + Math.max(0, bh) + '" rx="3" fill="' + color + '"/>' +
        '<text x="' + (x + (bw - 8) / 2) + '" y="' + (h - 8) + '" text-anchor="middle" font-size="9" fill="#8a8478">' +
        esc(String(labels[i]).slice(0, 8)) +
        "</text>"
      );
    }).join("");
    return '<div class="chart"><svg viewBox="0 0 ' + w + " " + h + '" role="img">' + bars + "</svg></div>";
  }

  function lineChart(labels, values, color) {
    const w = 560, h = 180, padL = 36, padB = 28, padT = 12, padR = 10;
    const max = Math.max.apply(null, values.concat([1]));
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const pts = values.map((v, i) => {
      const x = padL + (values.length === 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
      const y = padT + innerH - (v / max) * innerH;
      return x + "," + y;
    });
    const circles = values.map((v, i) => {
      const x = padL + (values.length === 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
      const y = padT + innerH - (v / max) * innerH;
      return '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + color + '"/>';
    }).join("");
    const xlabels = labels.map((lb, i) => {
      const x = padL + (values.length === 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
      return '<text x="' + x + '" y="' + (h - 8) + '" text-anchor="middle" font-size="9" fill="#8a8478">' + esc(lb) + "</text>";
    }).join("");
    return (
      '<div class="chart"><svg viewBox="0 0 ' + w + " " + h + '" role="img">' +
      '<polyline fill="none" stroke="' + color + '" stroke-width="2" points="' + pts.join(" ") + '"/>' +
      circles + xlabels + "</svg></div>"
    );
  }

  function confirmModal(title, message, act, extra) {
    ui.modal = { type: "confirm", title, message, act, extra: extra || {} };
    render();
  }

  // =============================================================================
  // ALERTS
  // =============================================================================
  function recomputeAlerts() {
    const alerts = [];
    const s = db.settings;
    db.shops.forEach((shop) => {
      db.products.forEach((p) => {
        const st = shopStock(shop.id, p.id);
        if (!st) return;
        const days = daysRemaining(st.qty, st.dailyUse);
        const ch = pctChange(st.qty, st.yesterdayQty);
        const wp = wastePct(st);
        if (days < s.daysCritical) {
          alerts.push({
            level: "CRITICAL",
            kind: "stock",
            shopId: shop.id,
            productId: p.id,
            title: p.name + " — " + shop.name + " has only " + fmtKg(st.qty) + " remaining.",
            body: "Average daily consumption is " + fmtKg(st.dailyUse) + ". Days remaining: " + days.toFixed(1) + ".",
            href: "#/shops/" + shop.id,
          });
        }
        if (ch <= -s.changeAlertPct) {
          alerts.push({
            level: "ATTENTION",
            kind: "change",
            shopId: shop.id,
            productId: p.id,
            title: p.name + " inventory at " + shop.name + " decreased by " + Math.abs(ch).toFixed(1) + "%.",
            body: "Yesterday " + fmtKg(st.yesterdayQty) + " → today " + fmtKg(st.qty) + ".",
            href: "#/shops/" + shop.id,
          });
        }
        const warn = p.warnWaste || s.wasteWarningPct;
        const crit = p.critWaste || s.wasteCriticalPct;
        if (wp >= crit) {
          alerts.push({
            level: "CRITICAL",
            kind: "waste",
            shopId: shop.id,
            productId: p.id,
            title: p.name + " waste at " + shop.name + " is " + wp.toFixed(1) + "%, above " + crit + "%.",
            body: "Waste " + fmtKg(st.wasteQty) + " of " + fmtKg(st.received) + " received.",
            href: "#/waste",
          });
        } else if (wp >= warn) {
          alerts.push({
            level: "WASTE",
            kind: "waste",
            shopId: shop.id,
            productId: p.id,
            title: p.name + " waste at " + shop.name + " is " + wp.toFixed(1) + "%, above the allowed " + warn + "%.",
            body: "Investigate handling and FEFO picking.",
            href: "#/waste",
          });
        }
      });
    });

    db.products.forEach((p) => {
      const recs = db.shops.map((shop) => {
        const st = shopStock(shop.id, p.id);
        return recommendedQty(st, p);
      });
      const demand = recs.reduce((a, b) => a + b, 0);
      const avail = availableWh(p.id);
      const needy = recs.filter((x) => x > 0).length;
      if (needy >= 5 && avail < demand) {
        alerts.push({
          level: "CRITICAL",
          kind: "supply",
          shopId: null,
          productId: p.id,
          title: needy + " shops require " + p.name.toLowerCase() + " but warehouse stock may not cover total demand.",
          body: "Available " + fmtKg(avail) + " vs recommended " + fmtKg(demand) + ".",
          href: "#/warehouse",
        });
      }
      const w = warehouseRow(p.id);
      const wdays = daysRemaining(w.qty, w.dailyDemand);
      if (wdays < s.daysWarning) {
        alerts.push({
          level: wdays < s.daysCritical ? "CRITICAL" : "ATTENTION",
          kind: "warehouse",
          productId: p.id,
          title: "Warehouse " + p.name + " has " + wdays.toFixed(1) + " days of stock.",
          body: "On-hand " + fmtKg(w.qty) + ". Daily demand " + fmtKg(w.dailyDemand) + ". Incoming " + fmtKg(w.incoming) + ".",
          href: "#/warehouse",
        });
      }
    });

    const today = todayISO();
    db.batches.forEach((b) => {
      if (b.remaining <= 0) return;
      if (b.riskDate <= today) {
        const p = productById(b.productId);
        alerts.push({
          level: "ATTENTION",
          kind: "batch",
          productId: b.productId,
          title: p.name + " batch " + b.id + " is at or past its risk date.",
          body: "Remaining " + fmtKg(b.remaining) + ". Use FEFO when dispatching.",
          href: "#/warehouse",
        });
      }
    });

    db.alerts = alerts;
  }

  // =============================================================================
  // INVENTORY MUTATIONS
  // =============================================================================
  function assertQty(qty, available, label) {
    if (!Number.isFinite(qty) || qty <= 0) {
      toast("Enter a valid quantity greater than zero.", "err");
      return false;
    }
    if (available != null && qty > available + 0.0001) {
      toast("Insufficient inventory. Available: " + fmtKg(available) + (label ? " (" + label + ")" : "") + ".", "err");
      return false;
    }
    return true;
  }

  function addTx(fields) {
    const id = nextId("TXN");
    db.transactions.unshift(Object.assign({
      id, at: nowISO(), unit: "kg", user: currentUser() ? currentUser().username : "system", ref: id,
    }, fields));
  }

  function pickBatches(productId, qty) {
    const list = db.batches
      .filter((b) => b.productId === productId && b.remaining > 0)
      .sort((a, b) => a.riskDate.localeCompare(b.riskDate));
    let need = qty;
    const used = [];
    list.forEach((b) => {
      if (need <= 0) return;
      const take = Math.min(b.remaining, need);
      b.remaining = clamp0(b.remaining - take);
      need = clamp0(need - take);
      used.push({ batchId: b.id, qty: take });
    });
    return { used, short: need };
  }

  function recordConsumption(shopId, productId, qty, date) {
    const st = shopStock(shopId, productId);
    const p = productById(productId);
    if (!st || !p) return toast("Missing shop or product.", "err");
    if (!assertQty(qty, st.qty, p.name)) return;
    st.qty = clamp0(st.qty - qty);
    st.dailyUse = round1((st.dailyUse * 6 + qty) / 7);
    addTx({
      productId, qty, type: "Shop sale/consumption", source: shopId, destination: "Customer",
      ref: "CONS-" + date,
    });
    audit("Inventory adjustment", shopById(shopId).name + " recorded " + fmtKg(qty) + " " + p.name + " consumption.");
    recomputeAlerts();
    save();
    ui.modal = null;
    toast("Consumption recorded.", "ok");
    render();
  }

  function recordWaste(location, productId, qty, reason, date, batchId) {
    const p = productById(productId);
    if (!p) return toast("Missing product.", "err");
    if (location === "Warehouse") {
      const w = warehouseRow(productId);
      if (!assertQty(qty, w.qty, "warehouse " + p.name)) return;
      w.qty = clamp0(w.qty - qty);
      if (batchId) {
        const b = db.batches.find((x) => x.id === batchId);
        if (b) b.remaining = clamp0(b.remaining - qty);
      } else {
        pickBatches(productId, qty);
      }
      addTx({ productId, qty, type: "Waste", source: "Warehouse", destination: "Destroyed", ref: reason });
    } else {
      const st = shopStock(location, productId);
      if (!st) return toast("Missing shop inventory.", "err");
      if (!assertQty(qty, st.qty, p.name)) return;
      st.qty = clamp0(st.qty - qty);
      st.wasteQty = round1((st.wasteQty || 0) + qty);
      addTx({ productId, qty, type: "Waste", source: location, destination: "Destroyed", ref: reason });
    }
    const id = nextId("WST");
    db.waste.unshift({
      id, shopId: location === "Warehouse" ? null : location, location, productId, qty, reason, date, batchId: batchId || "",
      recordedBy: currentUser().username,
    });
    const wp = location === "Warehouse" ? 0 : wastePct(shopStock(location, productId));
    audit("Waste entry", "Destroyed " + fmtKg(qty) + " " + p.name + " (" + reason + ") at " + (location === "Warehouse" ? "central warehouse" : shopById(location).name) + ".");
    notify("Waste recorded", fmtKg(qty) + " " + p.name + " marked as " + reason.toLowerCase() + ".", "#/waste");
    recomputeAlerts();
    save();
    ui.modal = null;
    toast(wp >= (p.critWaste || 8) ? "Waste recorded. Critical waste alert created." : "Waste recorded.", "ok");
    render();
  }

  function createRequest(shopId, productId, qty, requiredDate, priority, comment) {
    const p = productById(productId);
    const shop = shopById(shopId);
    const st = shopStock(shopId, productId);
    if (!p || !shop || !st) return toast("Missing shop or product.", "err");
    if (!assertQty(qty, null)) return;
    const id = nextId("REQ");
    db.requests.unshift({
      id, shopId, productId, currentStock: st.qty, qty, requiredDate, priority: priority || "Normal",
      comment: comment || "", status: "REQUESTED", createdAt: nowISO(), createdBy: currentUser().username,
    });
    audit("Request creation", shop.name + " requested " + fmtKg(qty) + " " + p.name + ".");
    notify(shop.name + " requested " + p.name, fmtKg(qty) + " needed by " + requiredDate + ".", "#/replenishment");
    save();
    ui.modal = null;
    toast("Request " + id + " submitted.", "ok");
    render();
    return id;
  }

  function setRequestStatus(id, status) {
    const req = db.requests.find((r) => r.id === id);
    if (!req) return;
    const p = productById(req.productId);
    const shop = shopById(req.shopId);
    const st = shopStock(req.shopId, req.productId);
    const w = warehouseRow(req.productId);

    if (status === "APPROVED") {
      if (availableWh(req.productId) < req.qty) {
        toast("Insufficient inventory. Available: " + fmtKg(availableWh(req.productId)) + ".", "err");
        return;
      }
      w.reserved = round1((w.reserved || 0) + req.qty);
    }
    if (status === "REJECTED" && (req.status === "APPROVED" || req.status === "PREPARING")) {
      w.reserved = clamp0((w.reserved || 0) - req.qty);
    }
    if (status === "DISPATCHED") {
      if (req.status === "REQUESTED") {
        if (availableWh(req.productId) < req.qty) {
          toast("Insufficient inventory. Available: " + fmtKg(availableWh(req.productId)) + ".", "err");
          return;
        }
        w.reserved = round1((w.reserved || 0) + req.qty);
      }
      st.incoming = round1((st.incoming || 0) + req.qty);
      const driver = db.drivers[db.deliveries.length % db.drivers.length];
      const dlvId = nextId("DLV");
      db.deliveries.unshift({
        id: dlvId, shopId: req.shopId, driverId: driver.id, vehicle: driver.vehicle,
        products: [{ productId: req.productId, qty: req.qty }],
        dispatchTime: nowISO(), expectedArrival: addDaysISO(todayISO(), 0) + "T16:00:00.000Z",
        actualArrival: null, status: "Dispatched", requestId: req.id,
      });
      notify("Delivery " + dlvId + " dispatched", p.name + " to " + shop.name + ".", "#/deliveries");
    }
    if (status === "DELIVERED") {
      fulfillDeliveryForRequest(req);
    }
    req.status = status;
    audit("Request approval", req.id + " → " + status);
    notify("Request " + req.id + " " + status.toLowerCase(), shop.name + " / " + p.name + " " + fmtKg(req.qty) + ".", "#/replenishment");
    recomputeAlerts();
    save();
    toast("Request " + req.id + " marked " + status + ".", "ok");
    render();
  }

  function fulfillDeliveryForRequest(req) {
    const p = productById(req.productId);
    const st = shopStock(req.shopId, req.productId);
    const w = warehouseRow(req.productId);
    if (w.qty < req.qty) {
      toast("Insufficient inventory. Available: " + fmtKg(w.qty) + ".", "err");
      return false;
    }
    w.qty = clamp0(w.qty - req.qty);
    w.reserved = clamp0((w.reserved || 0) - req.qty);
    st.qty = round1(st.qty + req.qty);
    st.incoming = clamp0((st.incoming || 0) - req.qty);
    st.received = round1((st.received || 0) + req.qty);
    pickBatches(req.productId, req.qty);
    addTx({
      productId: req.productId, qty: req.qty, type: "Warehouse → Shop",
      source: "Warehouse", destination: req.shopId, ref: req.id,
    });
    return true;
  }

  function updateDeliveryStatus(id, status) {
    const d = db.deliveries.find((x) => x.id === id);
    if (!d) return;
    const prev = d.status;
    if (status === "Delivered" && prev !== "Delivered") {
      d.products.forEach((line) => {
        const w = warehouseRow(line.productId);
        const st = shopStock(d.shopId, line.productId);
        if (w.qty + 0.0001 < line.qty) {
          toast("Insufficient inventory. Available: " + fmtKg(w.qty) + " of " + productById(line.productId).name + ".", "err");
          status = prev;
          return;
        }
        w.qty = clamp0(w.qty - line.qty);
        w.reserved = clamp0((w.reserved || 0) - line.qty);
        st.qty = round1(st.qty + line.qty);
        st.incoming = clamp0((st.incoming || 0) - line.qty);
        st.received = round1((st.received || 0) + line.qty);
        pickBatches(line.productId, line.qty);
        addTx({
          productId: line.productId, qty: line.qty, type: "Warehouse → Shop",
          source: "Warehouse", destination: d.shopId, ref: d.id,
        });
      });
      d.actualArrival = nowISO();
      if (d.requestId) {
        const req = db.requests.find((r) => r.id === d.requestId);
        if (req) req.status = "DELIVERED";
      }
      notify("Delivery " + d.id + " has been delivered.", shopById(d.shopId).name + " received stock.", "#/deliveries");
    }
    d.status = status;
    audit("Delivery status change", d.id + " " + prev + " → " + status);
    recomputeAlerts();
    save();
    toast("Delivery " + d.id + " updated.", "ok");
    render();
  }

  function receivePurchase(productId, qty, supplierId) {
    const p = productById(productId);
    if (!assertQty(qty, null)) return;
    const w = warehouseRow(productId);
    w.qty = round1(w.qty + qty);
    w.incoming = clamp0((w.incoming || 0) - qty);
    const bId = nextId("BTH");
    db.batches.unshift({
      id: bId, productId, supplierId: supplierId || p.supplierId, arrivalDate: todayISO(),
      quantity: qty, remaining: qty, shelfLifeDays: p.shelf, riskDate: addDaysISO(todayISO(), Math.max(1, p.shelf - 2)),
    });
    addTx({
      productId, qty, type: "Warehouse receiving", source: supplierId || p.supplierId,
      destination: "Warehouse", ref: bId,
    });
    audit("Inventory adjustment", "Received " + fmtKg(qty) + " " + p.name + " into warehouse.");
    recomputeAlerts();
    save();
    ui.modal = null;
    toast("Warehouse received " + fmtKg(qty) + " " + p.name + ".", "ok");
    render();
  }

  function orderSupply(productId, qty) {
    const p = productById(productId);
    if (!assertQty(qty, null)) return;
    const w = warehouseRow(productId);
    w.incoming = round1((w.incoming || 0) + qty);
    addTx({
      productId, qty, type: "Purchase", source: p.supplierId, destination: "Warehouse",
      ref: nextId("PO"),
    });
    audit("Inventory adjustment", "Purchase order for " + fmtKg(qty) + " " + p.name + ".");
    notify("Supply ordered", fmtKg(qty) + " " + p.name + " incoming from " + (supplierById(p.supplierId) || {}).name + ".", "#/warehouse");
    save();
    ui.modal = null;
    toast("Supply order placed. Incoming stock updated.", "ok");
    render();
  }

  function adjustStock(place, productId, qty, note) {
    const p = productById(productId);
    if (!Number.isFinite(qty) || qty === 0) return toast("Enter a non-zero adjustment.", "err");
    if (place === "Warehouse") {
      const w = warehouseRow(productId);
      if (qty < 0 && !assertQty(-qty, w.qty)) return;
      w.qty = clamp0(w.qty + qty);
    } else {
      const st = shopStock(place, productId);
      if (qty < 0 && !assertQty(-qty, st.qty)) return;
      st.qty = clamp0(st.qty + qty);
    }
    addTx({
      productId, qty: Math.abs(qty), type: "Stock adjustment",
      source: place, destination: place, ref: note || "ADJ",
    });
    audit("Inventory adjustment", "Adjusted " + p.name + " at " + place + " by " + qty + " kg.");
    recomputeAlerts();
    save();
    ui.modal = null;
    toast("Stock adjusted.", "ok");
    render();
  }

  function shopSummary(shop) {
    let low = 0, crit = 0, waste = 0, pending = 0, value = 0;
    db.products.forEach((p) => {
      const st = shopStock(shop.id, p.id);
      const days = daysRemaining(st.qty, st.dailyUse);
      const status = stockStatus(days);
      if (status === "Critical") crit += 1;
      if (status === "Critical" || status === "Warning") low += 1;
      waste += st.wasteQty || 0;
      value += st.qty * p.purchase;
    });
    pending = db.requests.filter((r) => r.shopId === shop.id && (r.status === "REQUESTED" || r.status === "APPROVED" || r.status === "PREPARING")).length;
    const received = db.products.reduce((a, p) => a + (shopStock(shop.id, p.id).received || 0), 0);
    const wasteP = received ? (waste / received) * 100 : 0;
    let stockStatusLabel = "Normal";
    if (crit > 0) stockStatusLabel = "Critical";
    else if (low > 0) stockStatusLabel = "Warning";
    return { low, crit, waste, wasteP, pending, value, stockStatusLabel };
  }

  function kpis() {
    let wh = 0, sh = 0, value = 0;
    db.products.forEach((p) => {
      const w = warehouseRow(p.id);
      wh += w.qty;
      value += w.qty * p.purchase;
    });
    db.shops.forEach((shop) => {
      db.products.forEach((p) => {
        const st = shopStock(shop.id, p.id);
        sh += st.qty;
        value += st.qty * p.purchase;
      });
    });
    const crit = db.alerts.filter((a) => a.level === "CRITICAL").length;
    const pending = db.requests.filter((r) => r.status === "REQUESTED").length;
    const todayD = db.deliveries.filter((d) => (d.dispatchTime || "").slice(0, 10) === todayISO() || (d.expectedArrival || "").slice(0, 10) === todayISO()).length;
    const weekStart = daysAgoISO(7);
    const weeklyWaste = db.waste.filter((w) => w.date >= weekStart).reduce((a, w) => a + w.qty, 0);
    const shopsAction = db.shops.filter((s) => shopSummary(s).stockStatusLabel !== "Normal" || shopSummary(s).pending > 0).length;
    return { wh, sh, crit, pending, todayD, weeklyWaste, value, shopsAction };
  }

  function replenishmentRows(user) {
    const rows = [];
    const shops = user.role === "shop" ? db.shops.filter((s) => s.id === user.shopId) : db.shops;
    shops.forEach((shop) => {
      db.products.forEach((p) => {
        const st = shopStock(shop.id, p.id);
        const rec = recommendedQty(st, p);
        const days = daysRemaining(st.qty, st.dailyUse);
        const key = stockKey(shop.id, p.id);
        if ((db.ignoredRecs || []).indexOf(key) >= 0 && rec > 0) return;
        if (rec <= 0 && days >= db.settings.daysWarning) return;
        rows.push({
          shop, p, st, rec, days, priority: recPriority(days, rec), key,
        });
      });
    });
    rows.sort((a, b) => a.days - b.days);
    return rows;
  }

  // =============================================================================
  // RENDER
  // =============================================================================
  function render() {
    const root = document.getElementById("app");
    if (!root) return;
    const user = currentUser();
    const parsed = parseHash();
    ui.page = parsed.page;
    if (parsed.shopId) ui.shopId = parsed.shopId;
    if (user && !canSee(ui.page, user) && ui.page !== "shops") {
      ui.page = "dashboard";
    }
    if (!user) {
      root.innerHTML = renderLogin();
      return;
    }
    root.innerHTML = renderShell(user);
    window.__OL_READY = true;
  }

  function renderLogin() {
    return (
      '<div class="login">' +
      '<section class="login-brand">' +
      '<div class="brand-mark">' + logoSvg() + " Orchard Ledger</div>" +
      "<div><h1>Know what to send before a shop runs dry.</h1>" +
      "<p>Central warehouse, 50 fruit shops, replenishment, deliveries, and waste — one ledger.</p></div>" +
      '<div class="login-meta"><div>Demo prototype · data stays in this browser</div><div>Admin · Owner · Warehouse · Shop · Driver</div></div>' +
      "</section>" +
      '<section class="login-panel"><div class="login-card">' +
      "<h2>Sign in</h2><p class=\"lede\">Use a labelled demo account. Nothing here is a live backend.</p>" +
      (ui.loginError ? '<div class="error-banner">' + esc(ui.loginError) + "</div>" : "") +
      '<form data-form="login"><div class="field"><span>Username</span><input name="username" autocomplete="username" required></div>' +
      '<div class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" required></div>' +
      '<button class="btn btn-block" type="submit">Enter ledger</button></form>' +
      '<div class="demo-accounts"><h3>Demo credentials</h3>' +
      USERS.map((u) =>
        '<div class="cred"><div><strong>' + esc(ROLE_LABEL[u.role]) + "</strong><div class=\"subtle\">" + esc(u.name) + "</div></div>" +
        '<div><code>' + esc(u.username) + " / " + esc(u.password) + "</code> " +
        '<button class="btn btn-ghost btn-sm" type="button" data-act="quick-login" data-user="' + esc(u.username) + '" data-pass="' + esc(u.password) + '">Use</button></div></div>'
      ).join("") +
      "</div></div></section></div>"
    );
  }

  function navIcon(id) {
    const map = { dashboard: "grid", warehouse: "warehouse", shops: "store", "shop-inventory": "boxes", replenishment: "refresh", deliveries: "truck", waste: "trash", products: "apple", suppliers: "factory", reports: "chart", alerts: "bell", settings: "settings" };
    return icon(map[id] || "grid");
  }

  function renderShell(user) {
    const items = NAV.filter((n) => n.roles.indexOf(user.role) >= 0);
    const titles = {
      dashboard: "Dashboard",
      warehouse: "Warehouse Inventory",
      shops: ui.shopId ? (shopById(ui.shopId) || {}).name || "Shop" : "Shops",
      "shop-inventory": user.role === "shop" ? "My shop inventory" : "Shop Inventory",
      replenishment: user.role === "shop" ? "Stock requests" : "Replenishment",
      deliveries: "Delivery Management",
      waste: "Waste Management",
      products: "Products",
      suppliers: "Suppliers",
      reports: "Reports",
      alerts: "Alerts",
      settings: "Settings",
    };
    const unread = unreadCount();
    return (
      '<div class="shell">' +
      (ui.sidebarOpen ? '<div class="sidebar-backdrop" data-act="close-sidebar"></div>' : "") +
      '<aside class="sidebar' + (ui.sidebarOpen ? " open" : "") + '">' +
      '<div class="sidebar-head"><div class="brand-mark">' + logoSvg() + " <span>Orchard Ledger</span></div></div>" +
      '<nav class="nav">' +
      items.map((n) =>
        '<button class="nav-item' + (ui.page === n.id ? " is-active" : "") + '" data-act="nav" data-page="' + n.id + '">' +
        navIcon(n.id) + esc(n.label) + "</button>"
      ).join("") +
      "</nav>" +
      '<div class="sidebar-foot"><div class="user-chip"><div class="avatar">' + esc(user.name.split(" ").map((x) => x[0]).join("").slice(0, 2)) + "</div>" +
      "<div><strong>" + esc(user.name) + "</strong><span>" + esc(ROLE_LABEL[user.role]) + (user.shopId ? " · " + user.shopId : "") + "</span></div></div>" +
      '<button class="btn btn-ghost btn-sm" data-act="logout">' + icon("logout", 16) + " Logout</button></div></aside>" +
      '<section class="main"><header class="topbar">' +
      '<button class="icon-btn menu-btn" data-act="toggle-sidebar" aria-label="Menu">' + icon("menu") + "</button>" +
      "<h1>" + esc(titles[ui.page] || "Orchard Ledger") + "</h1>" +
      '<button class="icon-btn" data-act="toggle-notif" aria-label="Notifications">' + icon("bell") + (unread ? '<span class="dot"></span>' : "") + "</button>" +
      '</header><div class="content">' + renderPage(user) + '</div></section></div>' +
      (ui.notifOpen ? renderNotifs() : "") +
      (ui.modal ? renderModal(user) : "") +
      '<div class="toast-stack">' + ui.toasts.map(toastHtml).join("") + "</div>"
    );
  }

  function renderNotifs() {
    const list = db.notifications.slice(0, 30);
    return (
      '<div class="overlay" data-act="toggle-notif"><aside class="drawer" data-stop="1">' +
      '<div class="drawer-head"><h2>Notifications</h2><button class="icon-btn" data-act="toggle-notif">' + icon("x") + "</button></div>" +
      '<div class="drawer-body">' +
      (list.length ? list.map((n) =>
        '<button class="notif' + (n.read ? "" : " unread") + '" data-act="open-notif" data-id="' + n.id + '">' +
        "<strong>" + esc(n.title) + "</strong><div>" + esc(n.body) + "</div><time>" + esc(fmtDateTime(n.at)) + "</time></button>"
      ).join("") : '<div class="empty">No notifications.</div>') +
      '<div style="padding:12px 18px"><button class="btn btn-ghost btn-sm" data-act="read-all">Mark all read</button></div>' +
      "</div></aside></div>"
    );
  }

  function renderPage(user) {
    switch (ui.page) {
      case "dashboard": return renderDashboard(user);
      case "warehouse": return renderWarehouse(user);
      case "shops": return ui.shopId ? renderShopDetail(user, ui.shopId) : renderShops(user);
      case "shop-inventory": return renderShopInventory(user);
      case "replenishment": return renderReplenishment(user);
      case "deliveries": return renderDeliveries(user);
      case "waste": return renderWaste(user);
      case "products": return renderProducts(user);
      case "suppliers": return renderSuppliers(user);
      case "reports": return renderReports(user);
      case "alerts": return renderAlerts(user);
      case "settings": return renderSettings(user);
      default: return renderDashboard(user);
    }
  }

  function renderDashboard(user) {
    if (user.role === "shop") return renderShopDash(user);
    if (user.role === "driver") return renderDriverDash(user);
    const k = kpis();
    const recs = replenishmentRows(user).length;
    const highWaste = db.alerts.filter((a) => a.kind === "waste").length;
    const shortages = db.products.filter((p) => daysRemaining(warehouseRow(p.id).qty, warehouseRow(p.id).dailyDemand) < db.settings.daysWarning).length;
    const actions = [
      { n: k.crit, label: "Critical stock issues", page: "alerts", level: "crit" },
      { n: recs, label: "Replenishment recommendations", page: "replenishment", level: "warn" },
      { n: highWaste, label: "High waste alerts", page: "waste", level: "warn" },
      { n: k.todayD, label: "Deliveries today", page: "deliveries", level: "info" },
      { n: shortages, label: "Warehouse stock shortages", page: "warehouse", level: "crit" },
    ];
    const topAlerts = db.alerts.slice(0, 6);
    const consumeLabels = [];
    const consumeVals = [];
    for (let i = 6; i >= 0; i--) {
      const day = daysAgoISO(i);
      consumeLabels.push(day.slice(5));
      const v = db.transactions.filter((t) => t.type === "Shop sale/consumption" && (t.at || "").slice(0, 10) === day).reduce((a, t) => a + t.qty, 0);
      consumeVals.push(round1(v || 40 + (6 - i) * 8));
    }
    const wasteVals = [];
    const wasteLabels = [];
    for (let i = 6; i >= 0; i--) {
      const day = daysAgoISO(i);
      wasteLabels.push(day.slice(5));
      wasteVals.push(round1(db.waste.filter((w) => w.date === day).reduce((a, w) => a + w.qty, 0)));
    }
    const topProducts = db.products.map((p) => {
      const used = Object.keys(db.shopStock).filter((k) => k.endsWith(p.id)).reduce((a, k) => a + db.shopStock[k].dailyUse, 0);
      return { name: p.name, used: round1(used) };
    }).sort((a, b) => b.used - a.used).slice(0, 8);

    return (
      '<div class="kpi-grid">' +
      kpiCard("Warehouse stock", fmtKg(k.wh), "On hand in central warehouse") +
      kpiCard("Shop stock", fmtKg(k.sh), "Across 50 shops") +
      kpiCard("Critical alerts", String(k.crit), "Inventory and waste") +
      kpiCard("Pending requests", String(k.pending), "Waiting for approval") +
      kpiCard("Today's deliveries", String(k.todayD), "Scheduled or in motion") +
      kpiCard("Weekly waste", fmtKg(k.weeklyWaste), "Last 7 days") +
      kpiCard("Stock value", fmtMoney(k.value), "Purchase-price estimate") +
      kpiCard("Shops requiring action", String(k.shopsAction), "Low stock or open requests") +
      "</div>" +
      '<div class="grid-2"><div class="card"><div class="section-title"><h2>Today\'s actions</h2></div>' +
      '<div class="action-list">' +
      actions.map((a) =>
        '<button class="action-item" data-act="nav" data-page="' + a.page + '"><span class="pip pip-' + a.level + '"></span><div><strong>' + a.n + " " + esc(a.label) + "</strong><p>Open the working list</p></div>" +
        '<span class="badge">View</span></button>'
      ).join("") +
      "</div></div>" +
      '<div class="card"><div class="section-title"><h2>Alert panel</h2><button class="btn btn-ghost btn-sm" data-act="nav" data-page="alerts">All alerts</button></div>' +
      '<div class="alert-list">' + topAlerts.map(alertRow).join("") + (topAlerts.length ? "" : '<div class="empty">No alerts.</div>') + "</div></div></div>" +
      '<div class="grid-2"><div class="card"><h3>Daily consumption</h3>' + lineChart(consumeLabels, consumeVals, "#3f6f5b") + "</div>" +
      '<div class="card"><h3>Weekly waste</h3>' + barChart(wasteLabels, wasteVals, "#b54708") + "</div></div>" +
      '<div class="grid-2"><div class="card"><h3>Top products by shop demand</h3>' + barChart(topProducts.map((p) => p.name), topProducts.map((p) => p.used), "#3d5a73") + "</div>" +
      '<div class="card"><h3>Warehouse days of stock</h3>' +
      barChart(db.products.map((p) => p.name.slice(0, 8)), db.products.map((p) => round1(daysRemaining(warehouseRow(p.id).qty, warehouseRow(p.id).dailyDemand))), "#3f6f5b") +
      "</div></div>"
    );
  }

  function kpiCard(label, value, sub) {
    return '<article class="card"><h3>' + esc(label) + '</h3><div class="kpi-value">' + esc(value) + '</div><div class="kpi-sub">' + esc(sub) + "</div></article>";
  }

  function alertRow(a) {
    const cls = a.level === "CRITICAL" ? "crit" : a.level === "ATTENTION" || a.level === "WASTE" ? "warn" : "info";
    const act = a.kind === "stock" || a.kind === "change" ? "Create request" : a.kind === "waste" ? "View waste" : "View";
    const page = a.kind === "waste" ? "waste" : a.kind === "supply" || a.kind === "warehouse" ? "warehouse" : a.shopId ? "shops" : "alerts";
    return (
      '<div class="alert-item"><span class="pip pip-' + cls + '"></span><div><strong>' + esc(a.level) + " · " + esc(a.title) + "</strong><p>" + esc(a.body) + "</p></div>" +
      '<button class="btn btn-ghost btn-sm" data-act="alert-go" data-page="' + page + '" data-shop="' + esc(a.shopId || "") + '" data-product="' + esc(a.productId || "") + '" data-kind="' + esc(a.kind) + '">' + act + "</button></div>"
    );
  }

  function renderShopDash(user) {
    const shop = shopById(user.shopId);
    const rows = db.products.map((p) => {
      const st = shopStock(shop.id, p.id);
      const days = daysRemaining(st.qty, st.dailyUse);
      return { p, st, days, status: stockStatus(days), ch: pctChange(st.qty, st.yesterdayQty) };
    });
    const crit = rows.filter((r) => r.status === "Critical").length;
    const pending = db.requests.filter((r) => r.shopId === shop.id && r.status === "REQUESTED").length;
    return (
      '<div class="callout">You are managing <strong>' + esc(shop.name) + "</strong> (" + esc(shop.id) + "). Record sales, destroy unsellable fruit, and request replenishment. The warehouse sees every request.</div>" +
      '<div class="kpi-grid">' +
      kpiCard("Low / critical lines", String(crit), "Need replenishment") +
      kpiCard("Open requests", String(pending), "Waiting on warehouse") +
      kpiCard("Last delivery", fmtDate(shop.lastDelivery), "Next " + fmtDate(shop.nextDelivery)) +
      kpiCard("Waste (this shop)", fmtKg(rows.reduce((a, r) => a + (r.st.wasteQty || 0), 0)), "Destroy via Waste") +
      "</div>" +
      '<div class="row-actions"><button class="btn" data-act="open-consume">Record consumption</button>' +
      '<button class="btn btn-warn" data-act="open-waste">Destroy fruit</button>' +
      '<button class="btn btn-ghost" data-act="open-request">Request stock</button></div>' +
      renderInvTable(shop, rows)
    );
  }

  function renderDriverDash(user) {
    const mine = db.deliveries.filter((d) => d.driverId === user.driverId);
    return '<div class="card"><h2>Assigned deliveries</h2><p class="muted">Update status as you move.</p></div>' + deliveryTable(mine, user);
  }

  function renderInvTable(shop, rows) {
    return (
      '<div class="table-wrap"><table class="data"><thead><tr>' +
      "<th>Product</th><th class=\"num\">Current</th><th class=\"num\">Daily use</th><th class=\"num\">Days left</th><th class=\"num\">Yesterday</th><th class=\"num\">Change</th><th>Status</th>" +
      "</tr></thead><tbody>" +
      rows.map((r) =>
        "<tr><td>" + esc(r.p.name) + "</td><td class=\"num\">" + fmtKg(r.st.qty) + "</td><td class=\"num\">" + fmtKg(r.st.dailyUse) + "</td><td class=\"num\">" + r.days.toFixed(1) + "</td><td class=\"num\">" + fmtKg(r.st.yesterdayQty) + "</td><td class=\"num\">" + fmtPct(r.ch) + "</td><td>" + badgeForStock(r.status) + "</td></tr>"
      ).join("") +
      "</tbody></table></div>"
    );
  }

  function toolbarHtml(placeholder, filters) {
    return (
      '<div class="toolbar"><input class="search" data-act="search" placeholder="' + esc(placeholder) + '" value="' + esc(ui.search) + '">' +
      (filters || "") +
      "</div>"
    );
  }

  function renderShops(user) {
    let rows = db.shops.map((s) => Object.assign({ shop: s }, shopSummary(s)));
    rows = searchFilter(rows, ui.search, [(r) => r.shop.name, (r) => r.shop.id, (r) => r.shop.manager, (r) => r.shop.location]);
    if (ui.filter === "Critical" || ui.filter === "Warning" || ui.filter === "Normal") {
      rows = rows.filter((r) => r.stockStatusLabel === ui.filter);
    }
    rows = sortRows(rows, ui.sortKey, (r) => {
      if (ui.sortKey === "name") return r.shop.name;
      if (ui.sortKey === "waste") return r.wasteP;
      if (ui.sortKey === "pending") return r.pending;
      return r.shop.id;
    });
    const p = paginate(rows);
    return (
      toolbarHtml("Search shops by name, manager, location…",
        '<select class="select" data-act="filter" style="width:auto;height:40px">' +
        ["all", "Critical", "Warning", "Normal"].map((f) => '<option' + (ui.filter === f ? " selected" : "") + ">" + f + "</option>").join("") +
        "</select>"
      ) +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
      "<th data-act=\"sort\" data-key=\"id\">Shop ID</th><th data-act=\"sort\" data-key=\"name\">Shop name</th><th>Location</th><th>Manager</th><th>Stock status</th><th class=\"num\">Low stock</th><th class=\"num\" data-act=\"sort\" data-key=\"waste\">Waste %</th><th class=\"num\" data-act=\"sort\" data-key=\"pending\">Pending</th><th>Last delivery</th><th>Status</th><th></th>" +
      "</tr></thead><tbody>" +
      p.rows.map((r) =>
        '<tr class="is-click" data-act="nav" data-page="shops" data-shop="' + r.shop.id + '">' +
        "<td>" + r.shop.id + "</td><td>" + esc(r.shop.name) + "</td><td>" + esc(r.shop.location) + "</td><td>" + esc(r.shop.manager) + "</td>" +
        "<td>" + badgeForStock(r.stockStatusLabel) + "</td><td class=\"num\">" + r.low + "</td><td class=\"num\">" + r.wasteP.toFixed(1) + "%</td>" +
        "<td class=\"num\">" + r.pending + "</td><td>" + fmtDate(r.shop.lastDelivery) + "</td><td>" + esc(r.shop.status) + "</td>" +
        "<td><button class=\"btn btn-ghost btn-sm\" data-act=\"nav\" data-page=\"shops\" data-shop=\"" + r.shop.id + "\">View</button></td></tr>"
      ).join("") +
      "</tbody></table></div>" + pagerBar(p)
    );
  }

  function renderShopDetail(user, shopId) {
    const shop = shopById(shopId);
    if (!shop) return '<div class="card">Shop not found.</div>';
    const rows = db.products.map((p) => {
      const st = shopStock(shop.id, p.id);
      const days = daysRemaining(st.qty, st.dailyUse);
      return { p, st, days, status: stockStatus(days), ch: pctChange(st.qty, st.yesterdayQty) };
    });
    const pending = db.requests.filter((r) => r.shopId === shop.id);
    return (
      '<button class="btn btn-ghost btn-sm" data-act="nav" data-page="shops">Back to shops</button>' +
      '<div class="split"><div class="card"><h2>' + esc(shop.name) + "</h2>" +
      "<dl class=\"kvs\"><dt>Shop ID</dt><dd>" + shop.id + "</dd><dt>Location</dt><dd>" + esc(shop.location) + "</dd>" +
      "<dt>Manager</dt><dd>" + esc(shop.manager) + "</dd><dt>Phone</dt><dd>" + esc(shop.phone) + "</dd>" +
      "<dt>Last delivery</dt><dd>" + fmtDate(shop.lastDelivery) + "</dd><dt>Next delivery</dt><dd>" + fmtDate(shop.nextDelivery) + "</dd></dl></div>" +
      '<div class="card"><h3>Pending requests</h3>' +
      (pending.length ? pending.slice(0, 6).map((r) => "<div class=\"cred\"><span>" + esc(productById(r.productId).name) + " · " + fmtKg(r.qty) + "</span>" + badgeForStock(r.status === "REQUESTED" ? "Warning" : "Normal") + "</div>").join("") : "<p class=\"muted\">None.</p>") +
      "</div></div>" +
      '<div class="card"><div class="section-title"><h2>Current inventory</h2>' +
      (user.role !== "owner" ? '<div class="row-actions"><button class="btn btn-sm" data-act="open-request" data-shop="' + shop.id + '">Request stock</button></div>' : "") +
      "</div>" + renderInvTable(shop, rows) + "</div>"
    );
  }

  function renderShopInventory(user) {
    const shopId = user.role === "shop" ? user.shopId : ui.shopFilter !== "all" ? ui.shopFilter : "";
    const shops = user.role === "shop" ? [shopById(user.shopId)] : db.shops;
    let rows = [];
    shops.forEach((shop) => {
      if (shopId && shop.id !== shopId) return;
      db.products.forEach((p) => {
        const st = shopStock(shop.id, p.id);
        const days = daysRemaining(st.qty, st.dailyUse);
        const status = stockStatus(days);
        rows.push({ shop, p, st, days, status, ch: pctChange(st.qty, st.yesterdayQty) });
      });
    });
    if (["Critical", "Warning", "Normal", "Overstock"].indexOf(ui.filter) >= 0) rows = rows.filter((r) => r.status === ui.filter);
    rows = searchFilter(rows, ui.search, [(r) => r.p.name, (r) => r.shop.name, (r) => r.shop.id]);
    const pgs = paginate(sortRows(rows, ui.sortKey, (r) => (ui.sortKey === "days" ? r.days : r.st.qty)));
    const shopFilter = user.role === "shop" ? "" :
      '<select class="select" data-act="shop-filter" style="width:auto;height:40px"><option value="all">All shops</option>' +
      optionList(db.shops, "id", (s) => s.id + " " + s.name, ui.shopFilter) + "</select>";
    return (
      (user.role === "shop" ? '<div class="row-actions"><button class="btn" data-act="open-consume">Record consumption</button><button class="btn btn-warn" data-act="open-waste">Destroy fruit</button></div>' : "") +
      toolbarHtml("Search product or shop…", shopFilter +
        '<select class="select" data-act="filter-status" style="width:auto;height:40px"><option value="all"' + (ui.filter === "all" ? " selected" : "") + ">All statuses</option><option>Critical</option><option>Warning</option><option>Normal</option></select>") +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Shop</th><th>Product</th><th class="num">Current</th><th class="num">Min</th><th class="num">Daily</th><th class="num" data-act="sort" data-key="days">Days left</th><th>Status</th></tr></thead><tbody>' +
      pgs.rows.map((r) =>
        "<tr><td>" + esc(r.shop.name) + "</td><td>" + esc(r.p.name) + "</td><td class=\"num\">" + fmtKg(r.st.qty) + "</td><td class=\"num\">" + fmtKg(r.st.min) + "</td><td class=\"num\">" + fmtKg(r.st.dailyUse) + "</td><td class=\"num\">" + r.days.toFixed(1) + "</td><td>" + badgeForStock(r.status) + "</td></tr>"
      ).join("") +
      "</tbody></table></div>" + pagerBar(pgs)
    );
  }

  function renderWarehouse(user) {
    const rows = db.products.map((p) => {
      const w = warehouseRow(p.id);
      const days = daysRemaining(w.qty, w.dailyDemand);
      const avail = availableWh(p.id);
      return { p, w, days, avail, status: stockStatus(days) };
    });
    const filtered = searchFilter(rows, ui.search, [(r) => r.p.name, (r) => r.p.id]).filter((r) => ui.filter === "all" || r.status === ui.filter || !["Critical", "Warning", "Normal", "Overstock"].includes(ui.filter));
    const riskBatches = db.batches.filter((b) => b.remaining > 0 && b.riskDate <= addDaysISO(todayISO(), 2)).sort((a, b) => a.riskDate.localeCompare(b.riskDate));
    const canEdit = user.role === "admin" || user.role === "warehouse";
    return (
      '<div class="row-actions">' +
      (canEdit ? '<button class="btn" data-act="open-receive">Receive supply</button><button class="btn btn-ink" data-act="open-order">Order more supply</button><button class="btn btn-warn" data-act="open-waste" data-loc="Warehouse">Destroy warehouse fruit</button>' : "") +
      '<button class="btn btn-ghost" data-act="nav-hash" data-hash="#/reports">Transactions & reports</button></div>' +
      toolbarHtml("Search products…",
        '<select class="select" data-act="filter" style="width:auto;height:40px"><option value="all">All statuses</option><option>Critical</option><option>Warning</option><option>Normal</option><option>Overstock</option></select>') +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
      "<th>Product</th><th class=\"num\">On hand</th><th>Unit</th><th class=\"num\">Min</th><th class=\"num\">Max</th><th class=\"num\">Daily demand</th><th class=\"num\">Days of stock</th><th class=\"num\">Incoming</th><th class=\"num\">Reserved</th><th class=\"num\">Available</th><th>Status</th>" +
      "</tr></thead><tbody>" +
      filtered.map((r) =>
        "<tr><td>" + esc(r.p.name) + "</td><td class=\"num\">" + fmtKg(r.w.qty) + "</td><td>" + r.p.unit + "</td><td class=\"num\">" + r.p.min + "</td><td class=\"num\">" + r.p.max + "</td>" +
        "<td class=\"num\">" + fmtKg(r.w.dailyDemand) + "</td><td class=\"num\">" + r.days.toFixed(2) + "</td><td class=\"num\">" + fmtKg(r.w.incoming) + "</td>" +
        "<td class=\"num\">" + fmtKg(r.w.reserved) + "</td><td class=\"num\">" + fmtKg(r.avail) + "</td><td>" + badgeForStock(r.status) + "</td></tr>"
      ).join("") +
      "</tbody></table></div>" +
      '<div class="card"><div class="section-title"><h2>FEFO batches approaching risk date</h2></div>' +
      (riskBatches.length ? '<div class="table-wrap"><table class="data"><thead><tr><th>Batch</th><th>Product</th><th>Supplier</th><th>Arrival</th><th class="num">Remaining</th><th>Risk date</th></tr></thead><tbody>' +
        riskBatches.map((b) => {
          const p = productById(b.productId);
          const s = supplierById(b.supplierId);
          return "<tr><td>" + b.id + "</td><td>" + esc(p.name) + "</td><td>" + esc(s ? s.name : "") + "</td><td>" + fmtDate(b.arrivalDate) + "</td><td class=\"num\">" + fmtKg(b.remaining) + "</td><td>" + fmtDate(b.riskDate) + "</td></tr>";
        }).join("") + "</tbody></table></div>" : "<p class=\"muted\">No batches at risk in the next two days.</p>") +
      "</div>" +
      '<div class="card"><div class="section-title"><h2>Recent inventory transactions</h2></div>' +
      txTable(db.transactions.slice(0, 8)) + "</div>"
    );
  }

  function txTable(list) {
    return '<div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>Type</th><th>Product</th><th class="num">Qty</th><th>Source</th><th>Destination</th><th>User</th><th>Ref</th></tr></thead><tbody>' +
      list.map((t) => {
        const p = productById(t.productId);
        return "<tr><td>" + fmtDateTime(t.at) + "</td><td>" + esc(t.type) + "</td><td>" + esc(p ? p.name : t.productId) + "</td><td class=\"num\">" + fmtKg(t.qty) + "</td><td>" + esc(t.source) + "</td><td>" + esc(t.destination) + "</td><td>" + esc(t.user) + "</td><td>" + esc(t.ref) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function renderReplenishment(user) {
    const recs = replenishmentRows(user);
    const reqs = db.requests.filter((r) => user.role !== "shop" || r.shopId === user.shopId);
    const filteredReq = searchFilter(reqs, ui.search, [(r) => (shopById(r.shopId) || {}).name || "", (r) => (productById(r.productId) || {}).name || "", (r) => r.id]).filter((r) => ui.filter === "all" || r.status === ui.filter);
    const isWh = user.role === "admin" || user.role === "warehouse";
    return (
      '<div class="tabs">' +
      '<button class="tab is-active" type="button">Live recommendations</button></div>' +
      (user.role === "shop" ? '<div class="row-actions"><button class="btn" data-act="open-request">New request</button></div>' : '<p class="muted">Recommended quantity = expected demand + safety stock − current − incoming. Warehouse can approve, modify, or ignore.</p>') +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Shop</th><th>Product</th><th class="num">Current</th><th class="num">Daily</th><th class="num">Days left</th><th class="num">Incoming</th><th class="num">Safety</th><th class="num">Recommended</th><th>Priority</th><th></th></tr></thead><tbody>' +
      recs.slice(0, 40).map((r) =>
        "<tr><td>" + esc(r.shop.name) + "</td><td>" + esc(r.p.name) + "</td><td class=\"num\">" + fmtKg(r.st.qty) + "</td><td class=\"num\">" + fmtKg(r.st.dailyUse) + "</td>" +
        "<td class=\"num\">" + r.days.toFixed(1) + "</td><td class=\"num\">" + fmtKg(r.st.incoming) + "</td><td class=\"num\">" + fmtKg(r.p.safety / 8) + "</td>" +
        "<td class=\"num\"><strong>" + fmtKg(r.rec) + "</strong></td><td>" + badgeForStock(r.priority === "Critical" ? "Critical" : r.priority === "High" ? "Warning" : "Normal") + "</td><td class=\"row-actions\">" +
        (isWh
          ? '<button class="btn btn-sm" data-act="approve-rec" data-shop="' + r.shop.id + '" data-product="' + r.p.id + '" data-qty="' + r.rec + '">Approve</button>' +
            '<button class="btn btn-ghost btn-sm" data-act="modify-rec" data-shop="' + r.shop.id + '" data-product="' + r.p.id + '" data-qty="' + r.rec + '">Modify</button>' +
            '<button class="btn btn-ghost btn-sm" data-act="ignore-rec" data-key="' + r.key + '">Ignore</button>'
          : '<button class="btn btn-sm" data-act="open-request" data-shop="' + r.shop.id + '" data-product="' + r.p.id + '" data-qty="' + r.rec + '">Create request</button>') +
        "</td></tr>"
      ).join("") +
      "</tbody></table></div>" +
      '<div class="card"><div class="section-title"><h2>Shop requests</h2>' +
      toolbarHtml("Search requests…",
        '<select class="select" data-act="filter" style="width:auto;height:40px"><option value="all">All statuses</option>' +
        REQ_STATUSES.map((s) => "<option" + (ui.filter === s ? " selected" : "") + ">" + s + "</option>").join("") + "</select>") +
      "</div>" +
      '<div class="table-wrap"><table class="data"><thead><tr><th>ID</th><th>Shop</th><th>Product</th><th class="num">Current</th><th class="num">Requested</th><th>Required</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>' +
      paginate(filteredReq).rows.map((r) => {
        const shop = shopById(r.shopId);
        const p = productById(r.productId);
        const nexts = nextRequestActions(r.status, isWh);
        return "<tr><td>" + r.id + "</td><td>" + esc(shop.name) + "</td><td>" + esc(p.name) + "</td><td class=\"num\">" + fmtKg(r.currentStock) + "</td><td class=\"num\">" + fmtKg(r.qty) + "</td><td>" + fmtDate(r.requiredDate) + "</td><td>" + esc(r.priority) + "</td><td>" + esc(r.status) + "</td><td class=\"row-actions\">" +
          nexts.map((st) => '<button class="btn btn-sm ' + (st === "REJECTED" ? "btn-danger" : "") + '" data-act="req-status" data-id="' + r.id + '" data-status="' + st + '">' + st + "</button>").join("") +
          "</td></tr>";
      }).join("") +
      "</tbody></table></div>" + pagerBar(paginate(filteredReq)) + "</div>"
    );
  }

  function nextRequestActions(status, isWh) {
    if (!isWh) return [];
    if (status === "REQUESTED") return ["APPROVED", "REJECTED"];
    if (status === "APPROVED") return ["PREPARING", "REJECTED"];
    if (status === "PREPARING") return ["DISPATCHED"];
    if (status === "DISPATCHED") return ["DELIVERED"];
    return [];
  }

  function renderDeliveries(user) {
    let list = db.deliveries;
    if (user.role === "shop") list = list.filter((d) => d.shopId === user.shopId);
    if (user.role === "driver") list = list.filter((d) => d.driverId === user.driverId);
    list = searchFilter(list, ui.search, [(d) => d.id, (d) => shopById(d.shopId).name, (d) => d.vehicle]);
    if (DLV_STATUSES.indexOf(ui.filter) >= 0) list = list.filter((d) => d.status === ui.filter);
    const p = paginate(list);
    return (
      toolbarHtml("Search delivery, shop, vehicle…",
        '<select class="select" data-act="filter" style="width:auto;height:40px"><option value="all">All statuses</option>' +
        DLV_STATUSES.map((s) => "<option" + (ui.filter === s ? " selected" : "") + ">" + s + "</option>").join("") + "</select>") +
      deliveryTable(p.rows, user) + pagerBar(p)
    );
  }

  function deliveryTable(list, user) {
    const canEdit = user.role === "admin" || user.role === "warehouse" || user.role === "driver";
    return '<div class="table-wrap"><table class="data"><thead><tr><th>ID</th><th>Shop</th><th>Driver</th><th>Vehicle</th><th>Products</th><th>Dispatch</th><th>ETA</th><th>Actual</th><th>Status</th><th></th></tr></thead><tbody>' +
      list.map((d) => {
        const shop = shopById(d.shopId);
        const driver = db.drivers.find((x) => x.id === d.driverId);
        const products = d.products.map((l) => productById(l.productId).name + " " + fmtKg(l.qty)).join(", ");
        const next = d.status === "Scheduled" ? "Preparing" : d.status === "Preparing" ? "Dispatched" : d.status === "Dispatched" ? "In Transit" : d.status === "In Transit" ? "Delivered" : d.status === "Delayed" ? "In Transit" : "";
        return "<tr><td>" + d.id + "</td><td>" + esc(shop.name) + "</td><td>" + esc(driver ? driver.name : "") + "</td><td>" + esc(d.vehicle) + "</td><td>" + esc(products) + "</td><td>" + fmtDateTime(d.dispatchTime) + "</td><td>" + fmtDateTime(d.expectedArrival) + "</td><td>" + fmtDateTime(d.actualArrival) + "</td><td>" + esc(d.status) + "</td><td class=\"row-actions\">" +
          (canEdit && next ? '<button class="btn btn-sm" data-act="dlv-status" data-id="' + d.id + '" data-status="' + next + '">Mark ' + next + "</button>" : "") +
          (canEdit && d.status !== "Delivered" && d.status !== "Delayed" ? '<button class="btn btn-ghost btn-sm" data-act="dlv-status" data-id="' + d.id + '" data-status="Delayed">Delay</button>' : "") +
          "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function renderWaste(user) {
    const weekStart = daysAgoISO(7);
    const monthStart = daysAgoISO(30);
    let records = db.waste;
    if (user.role === "shop") records = records.filter((w) => w.shopId === user.shopId);
    const weekly = records.filter((w) => w.date >= weekStart).reduce((a, w) => a + w.qty, 0);
    const monthly = records.filter((w) => w.date >= monthStart).reduce((a, w) => a + w.qty, 0);
    const received = (user.role === "shop"
      ? db.products.reduce((a, p) => a + (shopStock(user.shopId, p.id).received || 0), 0)
      : db.products.reduce((a, p) => a + db.shops.reduce((b, s) => b + (shopStock(s.id, p.id).received || 0), 0), 0));
    const pct = received ? (monthly / received) * 100 : 0;
    const value = records.filter((w) => w.date >= monthStart).reduce((a, w) => a + w.qty * (productById(w.productId).purchase || 0), 0);
    const byProduct = {};
    const byShop = {};
    records.forEach((w) => {
      byProduct[w.productId] = (byProduct[w.productId] || 0) + w.qty;
      const key = w.location || w.shopId || "Warehouse";
      byShop[key] = (byShop[key] || 0) + w.qty;
    });
    const topP = Object.keys(byProduct).sort((a, b) => byProduct[b] - byProduct[a]).slice(0, 6);
    const topS = Object.keys(byShop).sort((a, b) => byShop[b] - byShop[a]).slice(0, 6);
    const list = searchFilter(records, ui.search, [(w) => (shopById(w.shopId) || {}).name || "Warehouse", (w) => productById(w.productId).name, (w) => w.reason]);
    const p = paginate(list);
    return (
      '<div class="kpi-grid">' +
      kpiCard("Weekly waste", fmtKg(weekly), "Last 7 days") +
      kpiCard("Monthly waste", fmtKg(monthly), "Last 30 days") +
      kpiCard("Waste percentage", pct.toFixed(1) + "%", "Of quantity received") +
      kpiCard("Waste value", fmtMoney(value), "At purchase price") +
      "</div>" +
      '<div class="row-actions"><button class="btn btn-warn" data-act="open-waste">Destroy fruit</button></div>' +
      '<div class="split"><div class="card"><h3>Top waste products</h3>' + barChart(topP.map((id) => productById(id).name), topP.map((id) => round1(byProduct[id])), "#b54708") + "</div>" +
      '<div class="card"><h3>Top waste shops</h3>' + barChart(topS.map((id) => (shopById(id) || { name: id }).name.slice(0, 10)), topS.map((id) => round1(byShop[id])), "#b42318") + "</div></div>" +
      toolbarHtml("Search waste records…", "") +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>Location</th><th>Product</th><th class="num">Qty</th><th>Reason</th><th>Batch</th></tr></thead><tbody>' +
      p.rows.map((w) => "<tr><td>" + fmtDate(w.date) + "</td><td>" + esc(w.location === "Warehouse" ? "Warehouse" : (shopById(w.shopId) || {}).name || w.location) + "</td><td>" + esc(productById(w.productId).name) + "</td><td class=\"num\">" + fmtKg(w.qty) + "</td><td>" + esc(w.reason) + "</td><td>" + esc(w.batchId || "—") + "</td></tr>").join("") +
      "</tbody></table></div>" + pagerBar(p)
    );
  }

  function renderProducts() {
    const rows = searchFilter(db.products, ui.search, ["name", "id", "category"]);
    return toolbarHtml("Search products…", "") +
      '<div class="table-wrap"><table class="data"><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Unit</th><th class="num">Buy</th><th class="num">Sell</th><th class="num">Min</th><th class="num">Max</th><th class="num">Safety</th><th class="num">Shelf days</th><th>Waste warn/crit</th><th>Supplier</th></tr></thead><tbody>' +
      rows.map((p) => {
        const s = supplierById(p.supplierId);
        return "<tr><td>" + p.id + "</td><td>" + esc(p.name) + "</td><td>" + esc(p.category) + "</td><td>" + p.unit + "</td><td class=\"num\">€" + p.purchase.toFixed(2) + "</td><td class=\"num\">€" + p.sell.toFixed(2) + "</td><td class=\"num\">" + p.min + "</td><td class=\"num\">" + p.max + "</td><td class=\"num\">" + p.safety + "</td><td class=\"num\">" + p.shelf + "</td><td>" + p.warnWaste + "% / " + p.critWaste + "%</td><td>" + esc(s ? s.name : "") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function renderSuppliers() {
    return '<div class="table-wrap"><table class="data"><thead><tr><th>ID</th><th>Company</th><th>Contact</th><th>Phone</th><th>Products</th><th>Lead time</th><th>Status</th></tr></thead><tbody>' +
      db.suppliers.map((s) =>
        "<tr><td>" + s.id + "</td><td>" + esc(s.name) + "</td><td>" + esc(s.contact) + "</td><td>" + esc(s.phone) + "</td><td>" + esc(s.products.map((id) => productById(id).name).join(", ")) + "</td><td>" + s.leadDays + " days</td><td>" + badgeForStock("Normal") + " " + esc(s.status) + "</td></tr>"
      ).join("") + "</tbody></table></div>";
  }

  function renderReports(user) {
    const tabs = ["inventory", "waste", "shop", "product", "delivery", "replenishment"];
    const labels = { inventory: "Inventory", waste: "Waste", shop: "Shop", product: "Product", delivery: "Delivery", replenishment: "Replenishment" };
    const f = ui.reportFilters;
    const body = renderReportBody(ui.reportTab, f);
    return (
      '<div class="tabs">' + tabs.map((t) => '<button class="tab' + (ui.reportTab === t ? " is-active" : "") + '" data-act="report-tab" data-tab="' + t + '">' + labels[t] + "</button>").join("") + "</div>" +
      '<div class="toolbar">' +
      '<input class="input" type="date" data-act="rf" data-k="dateFrom" value="' + esc(f.dateFrom) + '" style="width:auto">' +
      '<input class="input" type="date" data-act="rf" data-k="dateTo" value="' + esc(f.dateTo) + '" style="width:auto">' +
      '<select class="select" data-act="rf" data-k="shopId" style="width:auto;height:40px"><option value="">All shops</option>' + optionList(db.shops, "id", (s) => s.name, f.shopId) + "</select>" +
      '<select class="select" data-act="rf" data-k="productId" style="width:auto;height:40px"><option value="">All products</option>' + optionList(db.products, "id", (p) => p.name, f.productId) + "</select>" +
      '<button class="btn" data-act="export">Export CSV</button></div>' +
      body
    );
  }

  function renderReportBody(tab) {
    if (tab === "inventory") {
      const rows = [];
      db.products.forEach((p) => {
        const w = warehouseRow(p.id);
        rows.push(["Warehouse", p.name, w.qty, w.dailyDemand, daysRemaining(w.qty, w.dailyDemand).toFixed(2), stockStatus(daysRemaining(w.qty, w.dailyDemand))]);
      });
      db.shops.forEach((s) => db.products.forEach((p) => {
        const st = shopStock(s.id, p.id);
        rows.push([s.name, p.name, st.qty, st.dailyUse, daysRemaining(st.qty, st.dailyUse).toFixed(2), stockStatus(daysRemaining(st.qty, st.dailyUse))]);
      }));
      ui._csv = { file: "inventory-report.csv", header: ["Location", "Product", "Qty", "Daily", "Days", "Status"], rows };
      const show = paginate(rows);
      return '<div class="table-wrap"><table class="data"><thead><tr><th>Location</th><th>Product</th><th class="num">Qty kg</th><th class="num">Daily</th><th class="num">Days</th><th>Status</th></tr></thead><tbody>' +
        show.rows.map((r) => "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td class=\"num\">" + r[2] + "</td><td class=\"num\">" + r[3] + "</td><td class=\"num\">" + r[4] + "</td><td>" + r[5] + "</td></tr>").join("") +
        "</tbody></table></div>" + pagerBar(show);
    }
    if (tab === "waste") {
      let list = db.waste.slice();
      const f = ui.reportFilters;
      if (f.dateFrom) list = list.filter((w) => w.date >= f.dateFrom);
      if (f.dateTo) list = list.filter((w) => w.date <= f.dateTo);
      if (f.shopId) list = list.filter((w) => w.shopId === f.shopId);
      if (f.productId) list = list.filter((w) => w.productId === f.productId);
      ui._csv = { file: "waste-report.csv", header: ["Date", "Location", "Product", "Qty", "Reason"], rows: list.map((w) => [w.date, w.location, productById(w.productId).name, w.qty, w.reason]) };
      return '<div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>Location</th><th>Product</th><th class="num">Qty</th><th>Reason</th></tr></thead><tbody>' +
        paginate(list).rows.map((w) => "<tr><td>" + w.date + "</td><td>" + esc(w.location) + "</td><td>" + esc(productById(w.productId).name) + "</td><td class=\"num\">" + w.qty + "</td><td>" + esc(w.reason) + "</td></tr>").join("") +
        "</tbody></table></div>" + pagerBar(paginate(list));
    }
    if (tab === "shop") {
      const rows = db.shops.map((s) => {
        const sum = shopSummary(s);
        return [s.id, s.name, s.manager, sum.low, sum.wasteP.toFixed(1), sum.pending, Math.round(sum.value)];
      });
      ui._csv = { file: "shop-report.csv", header: ["ID", "Name", "Manager", "Low items", "Waste %", "Pending", "Value"], rows };
      return '<div class="table-wrap"><table class="data"><thead><tr><th>ID</th><th>Shop</th><th>Manager</th><th class="num">Low items</th><th class="num">Waste %</th><th class="num">Pending</th><th class="num">Value €</th></tr></thead><tbody>' +
        paginate(rows).rows.map((r) => "<tr><td>" + r[0] + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td class=\"num\">" + r[3] + "</td><td class=\"num\">" + r[4] + "</td><td class=\"num\">" + r[5] + "</td><td class=\"num\">" + r[6] + "</td></tr>").join("") +
        "</tbody></table></div>" + pagerBar(paginate(rows));
    }
    if (tab === "product") {
      const rows = db.products.map((p) => {
        const tx = db.transactions.filter((t) => t.productId === p.id);
        return [p.id, p.name, tx.length, round1(tx.reduce((a, t) => a + t.qty, 0)), warehouseRow(p.id).qty];
      });
      ui._csv = { file: "product-report.csv", header: ["ID", "Name", "Movements", "Qty moved", "Warehouse qty"], rows };
      return '<div class="table-wrap"><table class="data"><thead><tr><th>ID</th><th>Product</th><th class="num">Movements</th><th class="num">Qty moved</th><th class="num">Warehouse</th></tr></thead><tbody>' +
        rows.map((r) => "<tr><td>" + r[0] + "</td><td>" + esc(r[1]) + "</td><td class=\"num\">" + r[2] + "</td><td class=\"num\">" + r[3] + "</td><td class=\"num\">" + r[4] + "</td></tr>").join("") + "</tbody></table></div>";
    }
    if (tab === "delivery") {
      let list = db.deliveries.slice();
      const f = ui.reportFilters;
      if (f.shopId) list = list.filter((d) => d.shopId === f.shopId);
      if (f.status) list = list.filter((d) => d.status === f.status);
      ui._csv = { file: "delivery-report.csv", header: ["ID", "Shop", "Status", "Dispatch", "ETA"], rows: list.map((d) => [d.id, shopById(d.shopId).name, d.status, d.dispatchTime, d.expectedArrival]) };
      return deliveryTable(paginate(list).rows, currentUser()) + pagerBar(paginate(list));
    }
    const recs = replenishmentRows(currentUser());
    const reqs = db.requests;
    const rows = recs.slice(0, 80).map((r) => {
      const req = reqs.find((q) => q.shopId === r.shop.id && q.productId === r.p.id && q.status === "REQUESTED");
      return [r.shop.name, r.p.name, r.rec, req ? req.qty : 0, req ? req.status : "—"];
    });
    ui._csv = { file: "replenishment-report.csv", header: ["Shop", "Product", "Recommended", "Requested", "Status"], rows };
    return '<div class="table-wrap"><table class="data"><thead><tr><th>Shop</th><th>Product</th><th class="num">Recommended</th><th class="num">Requested</th><th>Status</th></tr></thead><tbody>' +
      paginate(rows).rows.map((r) => "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td class=\"num\">" + r[2] + "</td><td class=\"num\">" + r[3] + "</td><td>" + esc(r[4]) + "</td></tr>").join("") +
      "</tbody></table></div>" + pagerBar(paginate(rows));
  }

  function renderAlerts(user) {
    let list = db.alerts;
    if (user.role === "shop") list = list.filter((a) => a.shopId === user.shopId);
    if (ui.filter !== "all") list = list.filter((a) => a.level === ui.filter || a.kind === ui.filter);
    list = searchFilter(list, ui.search, ["title", "body", "level"]);
    return toolbarHtml("Search alerts…",
      '<select class="select" data-act="filter" style="width:auto;height:40px"><option value="all">All</option><option>CRITICAL</option><option>ATTENTION</option><option>WASTE</option></select>') +
      '<div class="alert-list">' + (list.length ? list.map(alertRow).join("") : '<div class="empty">No alerts match.</div>') + "</div>";
  }

  function renderSettings(user) {
    const s = db.settings;
    return (
      '<div class="split"><div class="card"><h2>Thresholds</h2><p class="muted">Days remaining and waste limits used by the alert engine.</p>' +
      '<form data-form="settings" class="stack">' +
      '<div class="field"><span>Critical if days remaining below</span><input name="daysCritical" type="number" min="0.1" step="0.1" value="' + s.daysCritical + '"></div>' +
      '<div class="field"><span>Warning if days remaining below</span><input name="daysWarning" type="number" min="0.1" step="0.1" value="' + s.daysWarning + '"></div>' +
      '<div class="field"><span>Attention if stock drop exceeds %</span><input name="changeAlertPct" type="number" min="1" step="1" value="' + s.changeAlertPct + '"></div>' +
      '<div class="field"><span>Default waste warning %</span><input name="wasteWarningPct" type="number" step="0.1" value="' + s.wasteWarningPct + '"></div>' +
      '<div class="field"><span>Default waste critical %</span><input name="wasteCriticalPct" type="number" step="0.1" value="' + s.wasteCriticalPct + '"></div>' +
      (user.role === "owner" || user.role === "driver" ? "" : '<button class="btn" type="submit">Save thresholds</button>') +
      "</form></div>" +
      '<div class="card"><h2>Demo data</h2><p class="muted">This prototype stores everything in browser localStorage. Reset restores the 50-shop scenario.</p>' +
      '<button class="btn btn-danger" data-act="reset">Reset demo data</button>' +
      "<h3 style=\"margin-top:24px\">Audit log</h3>" +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>User</th><th>Action</th><th>Description</th></tr></thead><tbody>' +
      db.audit.slice(0, 12).map((a) => "<tr><td>" + fmtDateTime(a.at) + "</td><td>" + esc(a.user) + "</td><td>" + esc(a.action) + "</td><td>" + esc(a.description) + "</td></tr>").join("") +
      "</tbody></table></div></div></div>"
    );
  }

  function renderModal(user) {
    const m = ui.modal;
    if (m.type === "confirm") {
      return '<div class="overlay" data-act="close-modal"><div class="modal modal-sm" data-stop="1"><h2>' + esc(m.title) + "</h2><p class=\"muted\">" + esc(m.message) + "</p>" +
        '<div class="row-actions" style="margin-top:16px"><button class="btn btn-danger" data-act="' + esc(m.act) + '">Confirm</button><button class="btn btn-ghost" data-act="close-modal">Cancel</button></div></div></div>';
    }
    if (m.type === "consume") {
      const shopId = user.role === "shop" ? user.shopId : m.shopId || db.shops[0].id;
      return formModal("Record consumption",
        '<form data-form="consume"><input type="hidden" name="shopId" value="' + shopId + '">' +
        fieldSelect("Product", "productId", db.products, (p) => p.name, m.productId) +
        fieldNum("Quantity (kg)", "qty", "") +
        fieldDate("Date", "date", todayISO()) +
        '<button class="btn" type="submit">Save consumption</button></form>');
    }
    if (m.type === "waste") {
      const locDefault = m.loc || (user.role === "shop" ? user.shopId : "Warehouse");
      const locOptions = user.role === "shop"
        ? [{ id: user.shopId, name: shopById(user.shopId).name }]
        : [{ id: "Warehouse", name: "Central warehouse" }].concat(db.shops.map((s) => ({ id: s.id, name: s.name })));
      return formModal("Destroy fruit / record waste",
        '<form data-form="waste">' +
        fieldSelect("Location", "location", locOptions, (x) => x.name, locDefault) +
        fieldSelect("Product", "productId", db.products, (p) => p.name, m.productId) +
        fieldNum("Quantity (kg)", "qty", "") +
        fieldSelect("Reason", "reason", WASTE_REASONS.map((r) => ({ id: r, name: r })), (x) => x.name) +
        fieldDate("Date", "date", todayISO()) +
        '<div class="field"><span>Batch (optional)</span><input name="batchId" placeholder="BTH-0001"></div>' +
        '<button class="btn btn-warn" type="submit">Destroy / record waste</button></form>');
    }
    if (m.type === "request") {
      const shopId = user.role === "shop" ? user.shopId : m.shopId || "SHP-012";
      const productId = m.productId || "PRD-001";
      const st = shopStock(shopId, productId);
      return formModal("Shop replenishment request",
        '<form data-form="request">' +
        (user.role === "shop" ? '<input type="hidden" name="shopId" value="' + shopId + '"><p class="muted">Shop: ' + esc(shopById(shopId).name) + "</p>" :
          fieldSelect("Shop", "shopId", db.shops, (s) => s.id + " · " + s.name, shopId)) +
        fieldSelect("Product", "productId", db.products, (p) => p.name, productId) +
        '<p class="callout">Current stock: <strong>' + fmtKg(st ? st.qty : 0) + "</strong></p>" +
        fieldNum("Requested quantity (kg)", "qty", m.qty || "") +
        fieldDate("Required date", "requiredDate", addDaysISO(todayISO(), 1)) +
        fieldSelect("Priority", "priority", ["Normal", "High", "Critical"].map((x) => ({ id: x, name: x })), (x) => x.name) +
        '<div class="field full"><span>Comment</span><textarea name="comment" class="textarea"></textarea></div>' +
        '<button class="btn" type="submit">Submit request</button></form>');
    }
    if (m.type === "modify") {
      return formModal("Modify recommended quantity",
        '<form data-form="modify-rec"><input type="hidden" name="shopId" value="' + m.shopId + '"><input type="hidden" name="productId" value="' + m.productId + '">' +
        "<p>Recommended for " + esc(shopById(m.shopId).name) + " / " + esc(productById(m.productId).name) + "</p>" +
        fieldNum("Quantity to approve (kg)", "qty", m.qty) +
        '<button class="btn" type="submit">Create approved request</button></form>');
    }
    if (m.type === "receive") {
      return formModal("Receive warehouse supply",
        '<form data-form="receive">' +
        fieldSelect("Product", "productId", db.products, (p) => p.name) +
        fieldSelect("Supplier", "supplierId", db.suppliers, (s) => s.name) +
        fieldNum("Quantity (kg)", "qty", "") +
        '<button class="btn" type="submit">Receive into warehouse</button></form>');
    }
    if (m.type === "order") {
      return formModal("Order more warehouse supply",
        '<form data-form="order">' +
        fieldSelect("Product", "productId", db.products, (p) => p.name) +
        fieldNum("Quantity (kg)", "qty", "") +
        '<p class="muted">Marks stock as incoming until you receive it.</p>' +
        '<button class="btn" type="submit">Place supply order</button></form>');
    }
    return "";
  }

  function formModal(title, inner) {
    return '<div class="overlay" data-act="close-modal"><div class="modal" data-stop="1"><div class="modal-head"><div><h2>' + esc(title) + "</h2></div>" +
      '<button class="icon-btn" data-act="close-modal" aria-label="Close">' + icon("x") + "</button></div>" + inner + "</div></div>";
  }

  function fieldSelect(label, name, items, labelfn, selected) {
    return '<div class="field"><span>' + esc(label) + "</span><select name=\"" + name + "\">" + optionList(items, "id", labelfn, selected) + "</select></div>";
  }
  function fieldNum(label, name, value) {
    return '<div class="field"><span>' + esc(label) + '</span><input name="' + name + '" type="number" min="0.1" step="0.1" value="' + esc(value) + '" required></div>';
  }
  function fieldDate(label, name, value) {
    return '<div class="field"><span>' + esc(label) + '</span><input name="' + name + '" type="date" value="' + esc(value) + '" required></div>';
  }

  // =============================================================================
  // EVENTS
  // =============================================================================
  function onClick(e) {
    const stop = e.target.closest("[data-stop]");
    const overlay = e.target.classList && e.target.classList.contains("overlay") ? e.target : null;
    const el = e.target.closest("[data-act]");
    if (!el) {
      if (overlay) {
        const act = overlay.getAttribute("data-act");
        if (act === "close-modal") { ui.modal = null; render(); }
        if (act === "toggle-notif") { ui.notifOpen = false; render(); }
      }
      return;
    }
    if (overlay && stop && overlay.contains(stop) && el.closest("[data-stop]") && el.getAttribute("data-act") !== "close-modal" && el.getAttribute("data-act") !== "toggle-notif") {
      /* keep going for buttons inside */
    }
    const act = el.getAttribute("data-act");
    const user = currentUser();
    if (act === "quick-login") {
      login(el.getAttribute("data-user"), el.getAttribute("data-pass"));
      return;
    }
    if (act === "logout") return logout();
    if (act === "nav") {
      ui.pageNum = 1; ui.search = ""; ui.filter = "all"; ui.shopId = el.getAttribute("data-shop") || null; ui.sidebarOpen = false;
      if (el.getAttribute("data-shop") && el.getAttribute("data-page") === "shops") go("shops", el.getAttribute("data-shop"));
      else go(el.getAttribute("data-page"));
      return;
    }
    if (act === "nav-hash") { location.hash = el.getAttribute("data-hash"); return; }
    if (act === "toggle-sidebar") { ui.sidebarOpen = !ui.sidebarOpen; render(); return; }
    if (act === "close-sidebar") { ui.sidebarOpen = false; render(); return; }
    if (act === "toggle-notif") { ui.notifOpen = !ui.notifOpen; render(); return; }
    if (act === "close-modal") { ui.modal = null; render(); return; }
    if (act === "page") {
      ui.pageNum = Math.max(1, ui.pageNum + Number(el.getAttribute("data-n")));
      render(); return;
    }
    if (act === "sort") {
      const k = el.getAttribute("data-key");
      ui.sortDir = ui.sortKey === k && ui.sortDir === "asc" ? "desc" : "asc";
      ui.sortKey = k;
      render(); return;
    }
    if (act === "open-consume") { ui.modal = { type: "consume" }; render(); return; }
    if (act === "open-waste") { ui.modal = { type: "waste", loc: el.getAttribute("data-loc") || "" }; render(); return; }
    if (act === "open-request") {
      ui.modal = { type: "request", shopId: el.getAttribute("data-shop") || user.shopId, productId: el.getAttribute("data-product"), qty: el.getAttribute("data-qty") };
      render(); return;
    }
    if (act === "open-receive") { ui.modal = { type: "receive" }; render(); return; }
    if (act === "open-order") { ui.modal = { type: "order" }; render(); return; }
    if (act === "reset") { confirmModal("Reset demo data", "This replaces all local records with the original 50-shop scenario.", "do-reset"); return; }
    if (act === "do-reset") { ui.modal = null; resetDemo(); return; }
    if (act === "approve-rec") {
      const shopId = el.getAttribute("data-shop");
      const productId = el.getAttribute("data-product");
      const qty = Number(el.getAttribute("data-qty"));
      const id = createRequest(shopId, productId, qty, addDaysISO(todayISO(), 1), "High", "Approved from recommendation");
      if (id) setRequestStatus(id, "APPROVED");
      return;
    }
    if (act === "modify-rec") {
      ui.modal = { type: "modify", shopId: el.getAttribute("data-shop"), productId: el.getAttribute("data-product"), qty: el.getAttribute("data-qty") };
      render(); return;
    }
    if (act === "ignore-rec") {
      db.ignoredRecs = db.ignoredRecs || [];
      db.ignoredRecs.push(el.getAttribute("data-key"));
      save(); toast("Recommendation ignored.", "ok"); render(); return;
    }
    if (act === "req-status") { setRequestStatus(el.getAttribute("data-id"), el.getAttribute("data-status")); return; }
    if (act === "dlv-status") { updateDeliveryStatus(el.getAttribute("data-id"), el.getAttribute("data-status")); return; }
    if (act === "read-all") {
      db.notifications.forEach((n) => { n.read = true; });
      save(); render(); return;
    }
    if (act === "open-notif") {
      const n = db.notifications.find((x) => x.id === el.getAttribute("data-id"));
      if (n) { n.read = true; save(); ui.notifOpen = false; location.hash = n.href || "#/alerts"; }
      return;
    }
    if (act === "report-tab") { ui.reportTab = el.getAttribute("data-tab"); ui.pageNum = 1; render(); return; }
    if (act === "export") {
      if (ui._csv) exportCSV(ui._csv.file, ui._csv.header, ui._csv.rows);
      else toast("Nothing to export on this view.", "err");
      return;
    }
    if (act === "alert-go") {
      const kind = el.getAttribute("data-kind");
      const shop = el.getAttribute("data-shop");
      const product = el.getAttribute("data-product");
      if (kind === "stock" || kind === "change") {
        ui.modal = { type: "request", shopId: shop, productId: product };
        ui.page = "replenishment";
        location.hash = "#/replenishment";
        render();
        return;
      }
      if (shop && el.getAttribute("data-page") === "shops") { go("shops", shop); return; }
      go(el.getAttribute("data-page"));
      return;
    }
  }

  function onSubmit(e) {
    const form = e.target.closest("form[data-form]");
    if (!form) return;
    e.preventDefault();
    const fd = new FormData(form);
    const get = (k) => String(fd.get(k) || "").trim();
    const num = (k) => Number(fd.get(k));
    const type = form.getAttribute("data-form");
    if (type === "login") return login(get("username"), get("password"));
    if (type === "consume") return recordConsumption(get("shopId"), get("productId"), num("qty"), get("date"));
    if (type === "waste") return recordWaste(get("location"), get("productId"), num("qty"), get("reason"), get("date"), get("batchId"));
    if (type === "request") return createRequest(get("shopId"), get("productId"), num("qty"), get("requiredDate"), get("priority"), get("comment"));
    if (type === "modify-rec") {
      const id = createRequest(get("shopId"), get("productId"), num("qty"), addDaysISO(todayISO(), 1), "High", "Modified recommendation");
      if (id) setRequestStatus(id, "APPROVED");
      return;
    }
    if (type === "receive") return receivePurchase(get("productId"), num("qty"), get("supplierId"));
    if (type === "order") return orderSupply(get("productId"), num("qty"));
    if (type === "settings") {
      db.settings.daysCritical = num("daysCritical");
      db.settings.daysWarning = num("daysWarning");
      db.settings.changeAlertPct = num("changeAlertPct");
      db.settings.wasteWarningPct = num("wasteWarningPct");
      db.settings.wasteCriticalPct = num("wasteCriticalPct");
      recomputeAlerts(); save(); toast("Thresholds saved.", "ok"); render();
    }
  }

  function onChange(e) {
    const el = e.target;
    const act = el.getAttribute("data-act");
    if (act === "filter") { ui.filter = el.value; ui.pageNum = 1; render(); }
    if (act === "shop-filter") { ui.shopFilter = el.value; ui.pageNum = 1; render(); }
    if (act === "filter-status") { ui.filter = el.value; ui.pageNum = 1; render(); }
    if (act === "rf") {
      ui.reportFilters[el.getAttribute("data-k")] = el.value;
      render();
    }
  }

  function onInput(e) {
    const el = e.target;
    if (el.getAttribute("data-act") === "search") {
      ui.search = el.value;
      ui.pageNum = 1;
      clearTimeout(onInput._t);
      onInput._t = setTimeout(render, 120);
    }
  }

  function boot() {
    const root = document.getElementById("app");
    if (!root) return;
    initData();
    if (!root.dataset.bound) {
      root.dataset.bound = "1";
      root.addEventListener("click", onClick);
      root.addEventListener("submit", onSubmit);
      root.addEventListener("change", onChange);
      root.addEventListener("input", onInput);
      window.addEventListener("hashchange", render);
    }
    render();
  }

  window.initOrchardLedger = boot;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
