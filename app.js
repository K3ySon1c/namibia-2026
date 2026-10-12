/* =============================================================================
   app.js — Namibia-Reise-PWA
   Reines JavaScript, kein Framework, kein Build, keine Netzwerkaufrufe.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.TRIP;

  /* =========================================================================
     1 · Kleine Helfer
     ====================================================================== */

  function $(sel, root) { return (root || document).querySelector(sel); }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  /* Datum ------------------------------------------------------------- */
  var WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  function isoToday() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function isoToDate(iso) {
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function daysBetween(isoA, isoB) {
    return Math.round((isoToDate(isoB) - isoToDate(isoA)) / 86400000);
  }
  function formatDate(iso) {
    var d = isoToDate(iso);
    return WEEKDAYS[d.getDay()] + ', ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  /* Speicher ----------------------------------------------------------- */
  var STORE = {
    theme:         'namibia.theme',
    packing:       'namibia.packing',
    packingSeeded: 'namibia.packingSeeded',
    manual:        'namibia.manualDay'
  };

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* privater Modus */ }
  }

  /* Meldung ------------------------------------------------------------ */
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 1800);
  }

  function copyText(text, label) {
    function done() { toast((label || 'Kopiert') + ' kopiert'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('Kopieren nicht möglich'); }
      document.body.removeChild(ta);
    }
  }

  /* Nachschlagen ------------------------------------------------------- */
  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function day(id)  { return byId(D.days, id); }
  function stay(id) { return byId(D.accommodations, id); }
  function place(id){ return byId(D.places, id); }
  function act(id)  { return byId(D.activities, id); }
  function flight(id) { return byId(D.flights, id); }

  function statusChip(statusKey, text) {
    var st = D.statuses[statusKey] || D.statuses.open;
    return '<span class="chip chip-' + st.tone + '">' + esc(text || st.label) + '</span>';
  }

  function noteHtml(n) {
    var ico = n.level === 'danger' ? 'warn' : (n.level === 'warn' ? 'warn' : 'info');
    return '<div class="note note-' + esc(n.level) + '">' + icon(ico) +
           '<div>' + esc(n.text) + '</div></div>';
  }

  function notesHtml(list) {
    if (!list || !list.length) return '';
    return list.map(noteHtml).join('');
  }

  /* Geo-Links ---------------------------------------------------------- */
  function coordText(lat, lon) {
    return lat.toFixed(4) + ', ' + lon.toFixed(4);
  }
  function geoLinks(lat, lon, name) {
    var c = lat.toFixed(4) + ',' + lon.toFixed(4);
    return '<div class="btnrow">' +
      '<button class="btn" type="button" data-copy="' + esc(coordText(lat, lon)) + '" data-copy-label="Koordinaten">' +
        icon('copy') + '<span>Koordinaten</span></button>' +
      '<a class="btn" href="geo:' + c + '?q=' + c + '(' + encodeURIComponent(name) + ')">' +
        icon('pin') + '<span>Karten-App</span></a>' +
      '<a class="btn" href="https://www.google.com/maps/search/?api=1&amp;query=' + c + '" target="_blank" rel="noopener">' +
        icon('map') + '<span>Google Maps</span></a>' +
      '</div>' +
      '<p class="tiny muted" style="margin-top:6px">Die Koordinaten stehen offline zur Verfügung und lassen sich ins Navi tippen. Die beiden Links greifen erst, wenn wieder Netz oder eine Karten-App da ist.</p>';
  }

  /* Flüge -------------------------------------------------------------- */
  function shortDate(iso) {
    var d = isoToDate(iso);
    return WEEKDAYS[d.getDay()].slice(0, 2) + ' ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.';
  }

  function flightCard(f) {
    function leg(time, place, iso, cls) {
      return '<div class="flight-leg ' + cls + '">' +
        '<div class="flight-time">' + esc(time) + '</div>' +
        '<div class="flight-code">' + esc(place.code) + '</div>' +
        '<div class="small muted">' + esc(place.city) + ' · ' + esc(shortDate(iso)) + '</div>' +
      '</div>';
    }
    return '<div class="card flightcard"><div class="card-body">' +
      '<div class="flight-head">' + icon('plane') + '<b>' + esc(f.label) + '</b>' +
        '<span class="chip chip-plain">' + esc(f.flightNo) + '</span></div>' +
      '<div class="flight-legs">' +
        leg(f.departTime, f.from, f.departDate, 'from') +
        '<div class="flight-arrow">' + icon('next') + '</div>' +
        leg(f.arriveTime, f.to, f.arriveDate, 'to') +
      '</div>' +
      '<div class="flight-foot tiny muted">' + esc(f.airline) + ' · alle Zeiten Ortszeit</div>' +
    '</div></div>';
  }

  /* Flüge, die an einem Reisetag starten oder landen */
  function flightsForDay(d) {
    return D.flights.filter(function (f) { return f.departDate === d.date || f.arriveDate === d.date; });
  }

  /* =========================================================================
     2 · Thema
     ====================================================================== */
  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    var use = $('#ic-theme').querySelector('use');
    use.setAttribute('href', mode === 'dark' ? '#i-sun' : '#i-moon');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#12181D' : '#B4451F');
  }
  var theme = load(STORE.theme, 'light');
  applyTheme(theme === 'dark' ? 'dark' : 'light');

  /* =========================================================================
     3 · Leitmotiv — generierte SVG-Horizontlinie je Tag
     ====================================================================== */

  function makeRandom(seed) {
    var s = (seed * 9301 + 49297) % 233280;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function smoothPath(pts, W, H) {
    var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2;
      var my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ' Q ' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
    }
    var last = pts[pts.length - 1];
    d += ' L ' + last[0].toFixed(1) + ' ' + last[1].toFixed(1);
    return d + ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z';
  }

  function linePath(pts, W, H) {
    var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) d += ' L ' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    return d + ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z';
  }

  /* Silhouette aus überlagerten Glockenkurven */
  function bumpLayer(base, bumps, W, step) {
    var pts = [], x, i;
    for (x = 0; x <= W + step; x += step) {
      var y = base;
      for (i = 0; i < bumps.length; i++) {
        var t = (x - bumps[i].cx) / bumps[i].w;
        y = Math.min(y, base - bumps[i].h * Math.exp(-t * t));
      }
      pts.push([Math.min(x, W), y]);
    }
    return pts;
  }

  /* Silhouette aus Tafelbergen */
  function blockLayer(base, blocks, W) {
    var pts = [[0, base]], i;
    for (i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      pts.push([b.x0, base], [b.x0 + b.slope, base - b.h], [b.x1 - b.slope, base - b.h], [b.x1, base]);
    }
    pts.push([W, base]);
    return pts;
  }

  /* Liefert { far, near, sharp } für eine Landschaftsform */
  function silhouette(form, rnd, W, H) {
    var r = rnd;
    var farBase = H * 0.74, nearBase = H * 0.93;
    var i, bumps;

    switch (form) {

      case 'dunes':
        bumps = [];
        for (i = 0; i < 3; i++) bumps.push({ cx: W * (0.12 + 0.32 * i) + r() * 40, h: H * (0.24 + r() * 0.2), w: 60 + r() * 40 });
        var nearB = [];
        for (i = 0; i < 3; i++) nearB.push({ cx: W * (0.05 + 0.36 * i) + r() * 50, h: H * (0.16 + r() * 0.16), w: 70 + r() * 50 });
        return { far: bumpLayer(farBase, bumps, W, 8), near: bumpLayer(nearBase, nearB, W, 8), sharp: false };

      case 'canyon':
        var top = farBase - H * 0.1;
        var n0 = W * (0.28 + r() * 0.1), n1 = n0 + W * (0.26 + r() * 0.1);
        var depth = H * 0.34;
        var far = [[0, top], [n0 * 0.55, top - H * 0.05], [n0, top],
                   [n0 + 12, top + depth * 0.6], [n0 + 26, top + depth],
                   [n1 - 26, top + depth], [n1 - 12, top + depth * 0.55],
                   [n1, top], [n1 + (W - n1) * 0.4, top - H * 0.04], [W, top]];
        return { far: far, near: bumpLayer(nearBase, [{ cx: W * 0.2, h: H * 0.1, w: 90 }, { cx: W * 0.8, h: H * 0.12, w: 80 }], W, 10), sharp: true };

      case 'coast':
        var wave = [];
        for (i = 0; i <= W; i += 10) wave.push([i, farBase + H * 0.02 * Math.sin(i / 26 + r() * 0.01)]);
        return {
          far: wave,
          near: bumpLayer(nearBase, [{ cx: W * 0.16, h: H * 0.1, w: 120 }, { cx: W * 0.72, h: H * 0.08, w: 140 }], W, 12),
          sharp: false
        };

      case 'granite':
        bumps = [
          { cx: W * (0.28 + r() * 0.08), h: H * 0.52, w: 34 },
          { cx: W * (0.42 + r() * 0.06), h: H * 0.3,  w: 26 },
          { cx: W * (0.68 + r() * 0.1),  h: H * 0.36, w: 40 },
          { cx: W * 0.09, h: H * 0.18, w: 34 }
        ];
        return { far: bumpLayer(farBase, bumps, W, 5), near: bumpLayer(nearBase, [{ cx: W * 0.5, h: H * 0.1, w: 160 }], W, 12), sharp: false };

      case 'mesa':
        return {
          far: blockLayer(farBase, [
            { x0: W * 0.06, x1: W * 0.36, h: H * (0.3 + r() * 0.08), slope: 16 },
            { x0: W * 0.52, x1: W * 0.94, h: H * (0.24 + r() * 0.08), slope: 20 }
          ], W),
          near: bumpLayer(nearBase, [{ cx: W * 0.3, h: H * 0.1, w: 110 }, { cx: W * 0.82, h: H * 0.08, w: 90 }], W, 12),
          sharp: true
        };

      case 'pan':
        var flat = [];
        for (i = 0; i <= W; i += 20) flat.push([i, farBase + H * 0.01 * Math.sin(i / 60)]);
        return {
          far: flat,
          near: bumpLayer(nearBase, [
            { cx: W * (0.22 + r() * 0.1), h: H * 0.09, w: 26 },
            { cx: W * (0.62 + r() * 0.12), h: H * 0.11, w: 30 },
            { cx: W * 0.88, h: H * 0.07, w: 22 }
          ], W, 8),
          sharp: false
        };

      case 'plateau':
        return {
          far: blockLayer(farBase, [{ x0: W * 0.1, x1: W * 0.88, h: H * (0.26 + r() * 0.06), slope: 26 }], W),
          near: bumpLayer(nearBase, [{ cx: W * 0.35, h: H * 0.1, w: 120 }, { cx: W * 0.85, h: H * 0.09, w: 90 }], W, 12),
          sharp: true
        };

      default: /* bush */
        bumps = [];
        for (i = 0; i < 5; i++) bumps.push({ cx: W * (0.06 + 0.22 * i) + r() * 30, h: H * (0.1 + r() * 0.1), w: 40 + r() * 30 });
        var nb = [];
        for (i = 0; i < 7; i++) nb.push({ cx: W * (0.02 + 0.15 * i) + r() * 24, h: H * (0.07 + r() * 0.07), w: 20 + r() * 16 });
        return { far: bumpLayer(farBase, bumps, W, 8), near: bumpLayer(nearBase, nb, W, 6), sharp: false };
    }
  }

  function horizonSvg(landscapeId, seed, tall) {
    var L = D.landscapes[landscapeId] || D.landscapes.kalahari;
    var W = 400, H = tall ? 150 : 132;
    var rnd = makeRandom(seed + 7);
    var sil = silhouette(L.form, rnd, W, H);
    var gid = 'sky-' + landscapeId + '-' + seed;
    var sunX = W * (0.18 + rnd() * 0.6);
    var sunY = H * 0.3;
    var pathFn = sil.sharp ? linePath : smoothPath;

    return '<svg class="horizon" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Horizontlinie ' + esc(L.label) + '">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + L.skyTop + '"/>' +
        '<stop offset="1" stop-color="' + L.skyBottom + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + gid + ')"/>' +
      '<circle cx="' + sunX.toFixed(1) + '" cy="' + sunY.toFixed(1) + '" r="' + (H * 0.135).toFixed(1) + '" fill="' + L.sun + '" opacity=".9"/>' +
      '<path d="' + pathFn(sil.far, W, H) + '" fill="' + L.far + '"/>' +
      '<path d="' + pathFn(sil.near, W, H) + '" fill="' + L.near + '"/>' +
    '</svg>';
  }

  function dayHeader(d) {
    return '<div class="bleed horizon-wrap">' +
      horizonSvg(d.landscape, d.number, true) +
      '<div class="horizon-cap">' +
        '<div class="hc-num">' + d.number + '</div>' +
        '<div class="hc-meta">' + esc(d.dateShort) + ' · ' + esc(d.weekday) + ' · ' + esc(D.landscapes[d.landscape].label) + '</div>' +
      '</div></div>';
  }

  /* =========================================================================
     4 · Karte — selbst gezeichnete SVG-Übersicht
     ====================================================================== */

  /* Grober Umriss Namibias, [Länge, Breite]. Nicht geodätisch exakt. */
  var OUTLINE = [
    [11.75, -17.25], [12.05, -17.95], [12.42, -18.60], [12.62, -19.30], [13.02, -20.20],
    [13.42, -21.40], [13.82, -22.20], [14.42, -22.70], [14.52, -23.50], [14.92, -24.60],
    [15.02, -25.50], [14.92, -26.40], [15.12, -26.62], [15.42, -27.30], [16.02, -28.10],
    [16.45, -28.60], [17.05, -28.78], [17.62, -28.50], [18.32, -28.90], [19.02, -28.90],
    [19.62, -28.50], [20.00, -28.40], [20.00, -24.80], [20.82, -22.00], [20.99, -21.00],
    [20.99, -18.30], [21.10, -18.05], [23.00, -18.12], [24.50, -17.92], [25.26, -17.96],
    [24.82, -17.45], [23.00, -17.50], [21.00, -17.40], [19.00, -17.40], [17.00, -17.40],
    [15.00, -17.25], [13.50, -17.15], [12.40, -17.20]
  ];

  var AIRPORT = { name: 'Hosea Kutako Intl. Airport', lat: -22.4799, lon: 17.4709 };

  var MAP = (function () {
    var B = D.mapBounds;
    var k = 22;
    var kx = k * Math.cos(((B.north + B.south) / 2) * Math.PI / 180);
    return {
      x: function (lon) { return (lon - B.west) * kx; },
      y: function (lat) { return (B.north - lat) * k; },
      w: (B.east - B.west) * kx,
      h: (B.north - B.south) * k
    };
  })();

  function mapSvg(selectedId) {
    var pad = 14;
    var vb = [-pad, -pad, MAP.w + pad * 2, MAP.h + pad * 2].map(function (n) { return n.toFixed(1); }).join(' ');

    var land = OUTLINE.map(function (p, i) {
      return (i ? 'L' : 'M') + MAP.x(p[0]).toFixed(1) + ' ' + MAP.y(p[1]).toFixed(1);
    }).join(' ') + ' Z';

    var stops = [AIRPORT].concat(D.accommodations).concat([AIRPORT]);
    var route = stops.map(function (s, i) {
      return (i ? 'L' : 'M') + MAP.x(s.lon).toFixed(1) + ' ' + MAP.y(s.lat).toFixed(1);
    }).join(' ');

    var dots = D.accommodations.map(function (a, i) {
      var x = MAP.x(a.lon), y = MAP.y(a.lat);
      var sel = a.id === selectedId ? ' sel' : '';
      return '<g>' +
        '<circle class="stop' + sel + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5.4"/>' +
        '<text x="' + x.toFixed(1) + '" y="' + (y + 1.7).toFixed(1) + '" text-anchor="middle" style="font-size:5px;font-weight:700;fill:#fff;stroke:none">' + (i + 1) + '</text>' +
        '<circle class="stop-hit" data-stop="' + a.id + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="11"/>' +
      '</g>';
    }).join('');

    var ax = MAP.x(AIRPORT.lon), ay = MAP.y(AIRPORT.lat);

    return '<svg class="mapsvg" viewBox="' + vb + '" role="img" aria-label="Übersichtskarte Namibia mit Route und 14 Stationen">' +
      '<path class="land" d="' + land + '"/>' +
      '<path class="route" d="' + route + '"/>' +
      '<rect class="apt" x="' + (ax - 3.4).toFixed(1) + '" y="' + (ay - 3.4).toFixed(1) + '" width="6.8" height="6.8" rx="1.4"/>' +
      '<text class="lbl lbl-apt" x="' + (ax + 6).toFixed(1) + '" y="' + (ay + 2).toFixed(1) + '">Flughafen</text>' +
      dots +
    '</svg>';
  }

  /* =========================================================================
     5 · Ansichten
     ====================================================================== */

  var state = {
    route: '',
    manualDayId: load(STORE.manual, null),
    manualOpen: false,
    mapSel: D.accommodations[0].id,
    packCat: D.packing.categories[0].id
  };

  /* --- Heute ---------------------------------------------------------- */

  function currentDay() {
    var t = isoToday();
    for (var i = 0; i < D.days.length; i++) if (D.days[i].date === t) return D.days[i];
    return null;
  }

  function tripPhase() {
    var t = isoToday();
    if (t < D.meta.startDate) return 'before';
    if (t > D.meta.endDate) return 'after';
    return 'during';
  }

  function todayCompact(d) {
    var s = d.accommodationId ? stay(d.accommodationId) : null;
    var out = '';

    out += '<div class="hero">' + dayHeaderPlain(d) +
      '<div class="hero-body">' +
        '<div class="hero-kicker">Tag ' + d.number + ' · ' + esc(d.dateShort) + '</div>' +
        '<h2 class="hero-title">' + esc(d.title) + '</h2>' +
        (d.distanceText ? '<p class="small muted">' + esc(d.distanceText) + (d.driveTime ? ' · ' + esc(d.driveTime) : '') + ' · ' + esc(d.roadType || '') + '</p>' : '') +
      '</div>' +
      '<div class="facts">' +
        '<div class="fact"><div class="fact-label">' + icon('road') + 'Strecke</div><div class="fact-value">' + (d.distanceKm ? d.distanceKm + ' km' : '—') + '</div></div>' +
        '<div class="fact"><div class="fact-label">' + icon('sunrise') + 'Aufgang</div><div class="fact-value">' + esc(d.sunrise) + '</div></div>' +
        '<div class="fact"><div class="fact-label">' + icon('sunset') + 'Untergang</div><div class="fact-value">' + esc(d.sunset) + '</div></div>' +
      '</div>' +
    '</div>';

    /* Warnungen des Tages */
    var alarms = [];
    if (s && s.drinkingWater === false) alarms.push({ t: 'Kein Trinkwasser', s: s.name + ' — mit vollem Tank ankommen' });
    if (s && s.powerAtSite === false) alarms.push({ t: 'Kein Strom am Stellplatz', s: s.powerNote || s.name });
    if (alarms.length) {
      out += '<div class="section">' + alarms.map(function (a) {
        return '<div class="alarm">' + icon('warn') + '<div>' + esc(a.t) + '<small>' + esc(a.s) + '</small></div></div>';
      }).join('') + '</div>';
    }

    var danger = (d.notes || []).filter(function (n) { return n.level === 'danger' || n.level === 'warn'; });
    if (danger.length) {
      out += '<div class="section"><div class="section-title">Wichtig heute</div>' + notesHtml(danger) + '</div>';
    }

    var fl = flightsForDay(d);
    if (fl.length) {
      out += '<div class="section"><div class="section-title">Flug heute</div>' + fl.map(flightCard).join('') + '</div>';
    }

    if (s) {
      out += '<div class="section"><div class="section-title">Heutige Unterkunft</div>' + stayCard(s, d.accommodationNote) + '</div>';
    } else {
      out += '<div class="section"><div class="section-title">Übernachtung</div><div class="card"><div class="card-body small">' + esc(d.accommodationNote || '—') + '</div></div></div>';
    }

    out += '<div class="section"><a class="btn btn-primary btn-block" href="#/day/' + d.id + '">' + icon('days') + '<span>Ganzen Tag ansehen</span></a></div>';
    return out;
  }

  function dayHeaderPlain(d) {
    return '<div class="horizon-wrap">' + horizonSvg(d.landscape, d.number, false) + '</div>';
  }

  function viewToday() {
    var phase = tripPhase();
    var out = '';
    var shown = null;

    if (state.manualDayId) {
      shown = day(state.manualDayId);
    }

    if (!shown) {
      if (phase === 'during') {
        shown = currentDay();
      }
    }

    /* Kopf je nach Reisephase */
    if (!state.manualDayId && phase === 'before') {
      /* Countdown bis zum Hinflug, nicht bis Tag 1 */
      var outbound = flight('outbound');
      var left = daysBetween(isoToday(), outbound.departDate);
      var d1 = D.days[0];
      out += '<div class="section"><div class="hero">' + dayHeaderPlain(d1) +
        '<div class="hero-body">' +
          '<div class="hero-kicker">' + esc(D.meta.title) + '</div>' +
          (left > 0
            ? '<div class="countdown"><span class="countdown-num">' + left + '</span>' +
              '<span class="countdown-lab">' + (left === 1 ? 'Tag bis zum Abflug' : 'Tage bis zum Abflug') + '</span></div>'
            : '<div class="countdown"><span class="countdown-lab">Heute ist Abflug</span></div>') +
          '<p class="small muted">Abflug am ' + esc(formatDate(outbound.departDate)) + ' um ' + esc(outbound.departTime) + ' Uhr ab ' + esc(outbound.from.city) + '. ' +
            esc(D.meta.subtitle) + ', ' + D.meta.days + ' Tage, ' + D.meta.nights + ' Nächte.</p>' +
        '</div></div></div>';

      out += '<div class="section"><div class="section-title">Hinflug</div>' + flightCard(outbound) + '</div>';

      var pk = packingStats();
      out += '<div class="section">' +
        '<a class="card" href="#/packing"><div class="card-body" style="display:flex;align-items:center;gap:12px">' +
          icon('bag') +
          '<div style="flex:1 1 auto;min-width:0"><b>Packliste</b><div class="small muted">' +
            (pk.total === 0 ? 'Noch leer' : (pk.done === pk.total ? 'Alles eingepackt' : pk.done + ' von ' + pk.total + ' eingepackt')) +
          '</div></div>' + icon('next', 'ic-chev') +
        '</div></a></div>';

      out += '<div class="section"><div class="section-title">Vorschau auf Tag 1</div>' + dayCardHtml(d1, false) + '</div>';

    } else if (!state.manualDayId && phase === 'after') {
      out += '<div class="section"><div class="hero">' + dayHeaderPlain(D.days[D.days.length - 1]) +
        '<div class="hero-body">' +
          '<div class="hero-kicker">Rückblick</div>' +
          '<h2 class="hero-title">' + esc(D.meta.title) + '</h2>' +
          '<p class="small muted">' + esc(D.meta.subtitle) + ' · ' + D.meta.days + ' Tage · ' + D.meta.nights + ' Nächte · rund 4.000 km · ' +
            D.accommodations.length + ' Stationen.</p>' +
          '<p class="small muted">Die Reise ist vorbei. Alle Tage, Unterkünfte und Orte bleiben hier vollständig erhalten.</p>' +
        '</div></div></div>';
      out += '<div class="section"><div class="section-title">Alle Tage</div>' +
        D.days.map(function (d) { return dayCardHtml(d, false); }).join('') + '</div>';

    } else if (shown) {
      if (state.manualDayId) {
        out += '<div class="section"><div class="note note-info">' + icon('info') +
          '<div>Manuell gewählter Tag. <b>Tag ' + shown.number + '</b> — ' + esc(shown.dateShort) + '.</div></div></div>';
      }
      out += '<div class="section">' + todayCompact(shown) + '</div>';
    } else {
      out += '<div class="section"><div class="card"><div class="card-body">Für heute ist kein Reisetag hinterlegt.</div></div></div>';
    }

    /* Schalter „Tag manuell wählen“ */
    out += '<div class="section"><div class="card">' +
      '<button class="linkrow" type="button" data-toggle-manual>' +
        icon('clock') +
        '<div class="linkrow-main"><b>Tag manuell wählen</b><span>' +
          (state.manualDayId ? 'Aktiv: Tag ' + day(state.manualDayId).number : 'Aus — es gilt das Systemdatum') +
        '</span></div>' + icon('next', 'ic-chev') +
      '</button>' +
      (state.manualOpen ? manualPicker() : '') +
      (state.manualDayId ? '<button class="linkrow" type="button" data-clear-manual>' + icon('close') +
        '<div class="linkrow-main"><b>Zurück auf heute</b><span>Systemdatum verwenden</span></div></button>' : '') +
    '</div></div>';

    return out;
  }

  function manualPicker() {
    return '<div style="padding:12px 14px;border-top:1px solid var(--line-soft)">' +
      '<select class="input" data-manual-select aria-label="Tag wählen">' +
        '<option value="">— Tag wählen —</option>' +
        D.days.map(function (d) {
          return '<option value="' + d.id + '"' + (d.id === state.manualDayId ? ' selected' : '') + '>Tag ' + d.number + ' · ' + esc(d.dateShort) + ' · ' + esc(d.title) + '</option>';
        }).join('') +
      '</select></div>';
  }

  /* --- Tage ----------------------------------------------------------- */

  function dayCardHtml(d, markToday) {
    var t = isoToday();
    var isToday = markToday !== false && d.date === t;
    var s = d.accommodationId ? stay(d.accommodationId) : null;
    var warn = '';
    if (s && s.drinkingWater === false) warn += '<span class="chip chip-danger">kein Wasser</span> ';
    if (s && s.powerAtSite === false) warn += '<span class="chip chip-danger">kein Strom</span> ';

    return '<a class="card daycard' + (isToday ? ' is-today' : '') + '" href="#/day/' + d.id + '">' +
      '<div class="daycard-num"><b>' + d.number + '</b><span>' + (isToday ? 'heute' : 'Tag') + '</span></div>' +
      '<div class="daycard-main">' +
        '<div class="daycard-date">' + esc(d.dateShort) + ' · ' + esc(d.weekday) + '</div>' +
        '<div class="daycard-title">' + esc(d.title) + '</div>' +
        '<div class="daycard-meta">' +
          (d.distanceKm ? '<span>' + d.distanceKm + ' km</span>' : '') +
          (d.driveTime ? '<span>' + esc(d.driveTime) + '</span>' : '') +
          '<span>' + esc(d.sunrise) + ' – ' + esc(d.sunset) + '</span>' +
        '</div>' +
        (warn ? '<div style="margin-top:6px">' + warn + '</div>' : '') +
      '</div></a>';
  }

  /* --- Unsere Reise: Zeitleiste aus Flügen, Tagen und Unterkünften ----- */

  /* Tageskarte mit der Unterkunft als zweiter Zeile. Zwei getrennte Links,
     weil ein Link nicht in einem anderen stecken darf. */
  function tripDayCard(d) {
    var isToday = d.date === isoToday();
    var s = d.accommodationId ? stay(d.accommodationId) : null;

    var out = '<div class="card tripcard' + (isToday ? ' is-today' : '') + '">' +
      '<a class="tripcard-day" href="#/day/' + d.id + '">' +
        '<div class="daycard-num"><b>' + d.number + '</b><span>' + (isToday ? 'heute' : 'Tag') + '</span></div>' +
        '<div class="daycard-main">' +
          '<div class="daycard-date">' + esc(d.dateShort) + ' · ' + esc(d.weekday) + '</div>' +
          '<div class="daycard-title">' + esc(d.title) + '</div>' +
          '<div class="daycard-meta">' +
            (d.distanceKm ? '<span>' + d.distanceKm + ' km</span>' : '') +
            (d.driveTime ? '<span>' + esc(d.driveTime) + '</span>' : '') +
            '<span>' + esc(d.sunrise) + ' – ' + esc(d.sunset) + '</span>' +
          '</div>' +
        '</div></a>';

    if (s) {
      var chips = statusChip(s.status, D.statuses[s.status].label);
      if (s.drinkingWater === false) chips += '<span class="chip chip-danger">kein Trinkwasser</span>';
      if (s.powerAtSite === false) chips += '<span class="chip chip-danger">kein Strom</span>';
      out += '<a class="linkrow" href="#/stay/' + esc(s.id) + '">' + icon('stays') +
        '<div class="linkrow-main"><b>' + esc(s.name) + '</b>' +
          '<span>' + esc(s.type) + (d.accommodationNote ? ' · ' + esc(d.accommodationNote) : '') + '</span>' +
          '<div class="chips">' + chips + '</div></div>' +
        icon('next', 'ic-chev') + '</a>';
    } else {
      out += '<div class="linkrow" style="cursor:default">' + icon('stays') +
        '<div class="linkrow-main"><span>' + esc(d.accommodationNote || 'keine Übernachtung') + '</span></div></div>';
    }
    return out + '</div>';
  }

  function viewTrip() {
    var out = '<div class="section"><div class="section-title">' + D.meta.days + ' Tage · ' + esc(D.meta.subtitle) + '</div>' +
      flightCard(flight('outbound')) +
      D.days.map(tripDayCard).join('') +
      flightCard(flight('return')) +
    '</div>';

    out += '<div class="section"><div class="section-title">Buchungsstand</div><div class="card"><div class="card-body">' +
      '<p class="strong">' + esc(D.bookingOverview.summary) + '</p>' +
      '<p class="small muted">' + esc(D.bookingOverview.note) + '</p>' +
    '</div></div></div>';
    return out;
  }

  function viewDay(id) {
    var d = day(id);
    if (!d) return '<div class="section"><p>Tag nicht gefunden.</p></div>';
    var s = d.accommodationId ? stay(d.accommodationId) : null;
    var out = dayHeader(d);

    out += '<div class="section detail-head">' +
      '<h2 class="detail-title">' + esc(d.title) + '</h2>' +
      '<div class="detail-sub">' + esc(formatDate(d.date)) + '</div>' +
    '</div>';

    var roadLine = [];
    if (d.driveTime) roadLine.push(d.driveTime);
    if (d.roadType) roadLine.push(d.roadType);

    out += '<div class="section"><div class="card"><div class="facts" style="border-top:0">' +
      '<div class="fact"><div class="fact-label">' + icon('road') + 'Strecke</div><div class="fact-value">' + esc(d.distanceText || '—') + '</div></div>' +
      '<div class="fact"><div class="fact-label">' + icon('sunrise') + 'Aufgang</div><div class="fact-value">' + esc(d.sunrise) + '</div></div>' +
      '<div class="fact"><div class="fact-label">' + icon('sunset') + 'Untergang</div><div class="fact-value">' + esc(d.sunset) + '</div></div>' +
    '</div>' +
    (roadLine.length ? '<div class="card-body small muted" style="border-top:1px solid var(--line-soft);display:flex;gap:8px;align-items:flex-start">' +
        icon('car') + '<span>' + esc(roadLine.join(' · ')) + '</span></div>' : '') +
    '</div></div>';

    /* Flug an diesem Tag (Ankunft an Tag 1, Abflug an Tag 18) */
    var fl = flightsForDay(d);
    if (fl.length) {
      out += '<div class="section"><div class="section-title">Flug</div>' + fl.map(flightCard).join('') + '</div>';
    }

    /* Programm */
    out += '<div class="section prose">' + (d.program || []).map(function (p, i) {
      return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + esc(p) + '</p>';
    }).join('');

    if (d.options && d.options.length) {
      out += '<div class="stack" style="margin-top:6px">' + d.options.map(function (o) {
        return '<div class="card"><div class="card-body"><b>' + esc(o.title) + '</b><div class="small">' + esc(o.text) + '</div></div></div>';
      }).join('') + '</div>';
    }
    if (d.programAfter) {
      out += d.programAfter.map(function (p) { return '<p style="margin-top:12px">' + esc(p) + '</p>'; }).join('');
    }
    out += '</div>';

    /* Zeitplan (Tag 18) */
    if (d.schedule) {
      out += '<div class="section"><div class="section-title">Ablauf</div><div class="card"><div class="tablewrap"><table class="data">' +
        '<thead><tr><th>Zeit</th><th>Schritt</th></tr></thead><tbody>' +
        d.schedule.map(function (r) { return '<tr><td class="strong">' + esc(r.time) + '</td><td>' + esc(r.step) + '</td></tr>'; }).join('') +
        '</tbody></table></div></div></div>';
    }

    /* Hinweise */
    if (d.notes && d.notes.length) {
      out += '<div class="section"><div class="section-title">Hinweise</div>' + notesHtml(d.notes) + '</div>';
    }

    /* Unterkunft */
    out += '<div class="section"><div class="section-title">Unterkunft</div>';
    out += s ? stayCard(s, d.accommodationNote)
             : '<div class="card"><div class="card-body small">' + esc(d.accommodationNote || '—') + '</div></div>';
    out += '</div>';

    /* Orte */
    if (d.placeIds && d.placeIds.length) {
      out += '<div class="section"><div class="section-title">Orte an diesem Tag</div><div class="card">' +
        d.placeIds.map(function (pid) {
          var p = place(pid);
          return '<a class="linkrow" href="#/map/' + esc(p.id) + '">' + icon('pin') +
            '<div class="linkrow-main"><b>' + esc(p.name) + '</b><span>' + esc(p.description) + '</span></div>' +
            icon('next', 'ic-chev') + '</a>';
        }).join('') + '</div></div>';
    }

    /* Aktivitäten */
    if (d.activityIds && d.activityIds.length) {
      out += '<div class="section"><div class="section-title">Aktivitäten</div><div class="card">' +
        d.activityIds.map(function (aid) { return activityRow(act(aid)); }).join('') + '</div></div>';
    }

    /* Blättern */
    var prev = D.days[d.number - 2], next = D.days[d.number];
    out += '<div class="section pager">' +
      (prev ? '<a class="btn" href="#/day/' + prev.id + '">' + icon('back') + '<span>Tag ' + prev.number + '</span></a>'
            : '<span class="btn" style="opacity:.35">' + icon('back') + '<span>—</span></span>') +
      (next ? '<a class="btn" href="#/day/' + next.id + '"><span>Tag ' + next.number + '</span>' + icon('next') + '</a>'
            : '<span class="btn" style="opacity:.35"><span>—</span>' + icon('next') + '</span>') +
    '</div><p class="swipe-hint">Wischen blättert zwischen den Tagen</p>';

    return out;
  }

  function activityRow(a) {
    if (!a) return '';
    var meta = [];
    if (a.price) meta.push(a.price);
    if (a.dayText) meta.push('Tag ' + a.dayText);
    return '<div class="linkrow" style="cursor:default">' + icon(a.bookAhead ? 'ticket' : 'check') +
      '<div class="linkrow-main"><b>' + esc(a.name) + '</b>' +
        '<span>' + esc(meta.join(' · ')) + (a.note ? (meta.length ? ' — ' : '') + esc(a.note) : '') + '</span></div>' +
      (a.bookAhead ? '<span class="chip chip-warn">vorab</span>' : '') +
    '</div>';
  }

  /* --- Unterkünfte ---------------------------------------------------- */

  function stayCard(s, note) {
    var warn = '';
    if (s.drinkingWater === false) warn += '<span class="chip chip-danger">kein Trinkwasser</span> ';
    if (s.powerAtSite === false) warn += '<span class="chip chip-danger">kein Strom</span> ';

    return '<a class="card" href="#/stay/' + esc(s.id) + '"><div class="card-body">' +
      '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<div style="flex:1 1 auto;min-width:0">' +
          '<b style="font-size:1.05rem">' + esc(s.name) + '</b>' +
          '<div class="small muted">' + esc(s.type) + ' · ' + esc(s.dateText) + (note ? ' · ' + esc(note) : '') + '</div>' +
        '</div>' + icon('next', 'ic-chev') +
      '</div>' +
      '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">' +
        statusChip(s.status, D.statuses[s.status].label) + warn +
      '</div>' +
    '</div></a>';
  }

  function viewStay(id) {
    var s = stay(id);
    if (!s) return '<div class="section"><p>Unterkunft nicht gefunden.</p></div>';
    var out = '';

    out += '<div class="section detail-head">' +
      '<h2 class="detail-title">' + esc(s.name) + '</h2>' +
      '<div class="detail-sub">' + esc(s.type) + ' · ' + esc(s.dateText) + ' · Tag ' + s.dayNumbers.join(' und ') + (s.group ? ' · ' + esc(s.group) : '') + '</div>' +
      '<div style="margin-top:8px">' + statusChip(s.status, s.statusText) + '</div>' +
    '</div>';

    /* Die praktisch wichtigsten Warnungen — groß und unübersehbar */
    if (s.drinkingWater === false) {
      out += '<div class="section"><div class="alarm">' + icon('drop') +
        '<div>Kein Trinkwasser<small>Mit vollem Tank ankommen.' + (s.id === 'twyfelfontein' ? ' Wasser gibt es nur für Duschen und Toiletten.' : '') + '</small></div></div></div>';
    }
    if (s.powerAtSite === false) {
      out += '<div class="section"><div class="alarm">' + icon('plug') +
        '<div>Kein Strom am Stellplatz<small>' + esc(s.powerNote || 'Geräte vorher laden.') + '</small></div></div></div>';
    }

    if (s.intro) out += '<div class="section prose"><p class="lead">' + esc(s.intro) + '</p></div>';

    /* Kontakt und Referenz */
    var rows = '';
    if (s.phone) {
      rows += '<a class="linkrow" href="tel:' + esc(s.phone.replace(/\s/g, '')) + '">' + icon('phone') +
        '<div class="linkrow-main"><b>Anrufen</b><span>' + esc(s.phone) + '</span></div>' + icon('next', 'ic-chev') + '</a>';
    }
    if (s.email) {
      rows += '<a class="linkrow" href="mailto:' + esc(s.email) + '">' + icon('mail') +
        '<div class="linkrow-main"><b>Mail schreiben</b><span>' + esc(s.email) + '</span></div>' + icon('next', 'ic-chev') + '</a>';
    }
    if (s.contact) {
      rows += '<div class="linkrow" style="cursor:default">' + icon('info') +
        '<div class="linkrow-main"><b>Ansprechpartner</b><span>' + esc(s.contact) + '</span></div></div>';
    }
    if (s.reception) {
      rows += '<div class="linkrow" style="cursor:default">' + icon('clock') +
        '<div class="linkrow-main"><b>Rezeption</b><span>' + esc(s.reception) + '</span></div></div>';
    }
    if (s.address) {
      rows += '<div class="linkrow" style="cursor:default">' + icon('pin') +
        '<div class="linkrow-main"><b>Adresse</b><span>' + esc(s.address) + '</span></div></div>';
    }
    if (s.reference) {
      rows += '<button class="linkrow" type="button" data-copy="' + esc(s.reference) + '" data-copy-label="Referenz">' + icon('copy') +
        '<div class="linkrow-main"><b>Referenznummer</b><span>' + esc(s.reference) +
        (s.ownReference ? ' · eigene Referenz: ' + esc(s.ownReference) : '') + '</span></div>' + icon('copy', 'ic-chev') + '</button>';
    }
    if (rows) out += '<div class="section"><div class="section-title">Kontakt</div><div class="card">' + rows + '</div></div>';

    /* Koordinaten */
    out += '<div class="section"><div class="section-title">Koordinaten</div><div class="card"><div class="card-body">' +
      '<div class="coord">' + esc(coordText(s.lat, s.lon)) + '</div>' +
      '<div style="margin-top:10px">' + geoLinks(s.lat, s.lon, s.name) + '</div>' +
    '</div></div></div>';

    /* Ausstattung und Details */
    if (s.details && s.details.length) {
      out += '<div class="section"><div class="section-title">Im Detail</div><div class="card"><div class="card-body">' +
        '<dl class="dl">' + s.details.map(function (x) {
          return '<div><dt>' + esc(x.label) + '</dt><dd>' + esc(x.text) + '</dd></div>';
        }).join('') + '</dl></div></div></div>';
    }

    /* Kennzahlen */
    out += '<div class="section"><div class="card"><div class="facts" style="border-top:0">' +
      '<div class="fact"><div class="fact-label">' + icon('drop') + 'Trinkwasser</div><div class="fact-value" style="color:' + (s.drinkingWater ? 'var(--success)' : 'var(--danger)') + '">' + (s.drinkingWater ? 'ja' : 'nein') + '</div></div>' +
      '<div class="fact"><div class="fact-label">' + icon('plug') + 'Strom am Platz</div><div class="fact-value" style="color:' + (s.powerAtSite ? 'var(--success)' : 'var(--danger)') + '">' + (s.powerAtSite ? 'ja' : 'nein') + '</div></div>' +
      (s.price ? '<div class="fact"><div class="fact-label">' + icon('coins') + 'Preis</div><div class="fact-value" style="font-size:.92rem">' + esc(s.price) + '</div></div>' : '') +
      (s.rating ? '<div class="fact"><div class="fact-label">' + icon('check') + 'Bewertung</div><div class="fact-value" style="font-size:.92rem">' + esc(s.rating) + '</div></div>' : '') +
    '</div></div></div>';

    if (s.notes && s.notes.length) {
      out += '<div class="section"><div class="section-title">Hinweise</div>' + notesHtml(s.notes) + '</div>';
    }

    /* Zugehörige Tage */
    var relDays = D.days.filter(function (d) { return d.accommodationId === s.id; });
    if (relDays.length) {
      out += '<div class="section"><div class="section-title">Zugehörige Tage</div>' +
        relDays.map(function (d) { return dayCardHtml(d, true); }).join('') + '</div>';
    }


    return out;
  }

  /* --- Karte ---------------------------------------------------------- */

  function viewMap(sel) {
    if (sel) {
      /* Auswahl kann eine Unterkunft oder ein Ort sein */
      if (stay(sel)) state.mapSel = sel;
    }
    var s = stay(state.mapSel) || D.accommodations[0];
    var idx = D.accommodations.indexOf(s) + 1;

    var out = '<div class="section"><div class="section-title">Route und 14 Stationen</div>' +
      '<div class="mapbox" id="mapbox">' + mapSvg(s.id) + '</div>' +
      '<p class="tiny muted" style="margin-top:8px">Selbst gezeichnete Übersicht — erkennbar, aber nicht geodätisch exakt. Kartenkacheln funktionieren offline nicht, deshalb diese Lösung.</p>' +
    '</div>';

    out += '<div class="section"><div class="section-title">Station ' + idx + ' von 14</div>' +
      '<div class="card"><div class="card-body">' +
        '<b style="font-size:1.08rem">' + esc(s.name) + '</b>' +
        '<div class="small muted">' + esc(s.type) + ' · ' + esc(s.dateText) + ' · Tag ' + s.dayNumbers.join(' und ') + '</div>' +
        '<div class="coord" style="margin-top:10px">' + esc(coordText(s.lat, s.lon)) + '</div>' +
        '<div style="margin-top:10px">' + geoLinks(s.lat, s.lon, s.name) + '</div>' +
        '<div style="margin-top:12px"><a class="btn btn-block" href="#/stay/' + esc(s.id) + '">' + icon('stays') + '<span>Zur Unterkunft</span></a></div>' +
      '</div></div></div>';

    out += '<div class="section"><div class="section-title">Alle Stationen</div><div class="card">' +
      D.accommodations.map(function (a, i) {
        return '<button class="linkrow" type="button" data-mapsel="' + esc(a.id) + '">' +
          '<span class="chip chip-plain">' + (i + 1) + '</span>' +
          '<div class="linkrow-main"><b>' + esc(a.name) + '</b><span>' + esc(coordText(a.lat, a.lon)) + ' · ' + esc(a.dateText) + '</span></div>' +
          icon('next', 'ic-chev') + '</button>';
      }).join('') + '</div></div>';

    out += '<div class="section"><div class="section-title">Orte und Sehenswürdigkeiten</div><div class="card">' +
      D.places.map(function (p) {
        var c = p.lat.toFixed(4) + ',' + p.lon.toFixed(4);
        return '<div class="linkrow" style="cursor:default;align-items:flex-start">' + icon('pin') +
          '<div class="linkrow-main">' +
            '<b>' + esc(p.name) + '</b>' +
            '<span>Tag ' + esc(p.dayText) + ' · ' + esc(p.description) + '</span>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:7px">' +
              '<button class="btn" type="button" style="min-height:44px;padding:0 12px;font-size:.85rem" data-copy="' + esc(coordText(p.lat, p.lon)) + '" data-copy-label="Koordinaten">' + icon('copy') + '<span>' + esc(coordText(p.lat, p.lon)) + '</span></button>' +
              '<a class="btn" style="min-height:44px;padding:0 12px;font-size:.85rem" href="geo:' + c + '?q=' + c + '(' + encodeURIComponent(p.name) + ')">' + icon('pin') + '<span>Karten-App</span></a>' +
              '<a class="btn" style="min-height:44px;padding:0 12px;font-size:.85rem" href="https://www.google.com/maps/search/?api=1&amp;query=' + c + '" target="_blank" rel="noopener">' + icon('map') + '<span>Maps</span></a>' +
            '</div>' +
          '</div></div>';
      }).join('') + '</div></div>';

    return out;
  }

  /* --- Infos ---------------------------------------------------------- */

  function blockHtml(b) {
    var cls = b.level === 'ok' ? 'note-ok' : (b.level === 'danger' ? 'note-danger' : (b.level === 'warn' ? 'note-warn' : 'note-info'));
    var ic = b.level === 'ok' ? 'check' : (b.level === 'info' ? 'info' : 'warn');
    return '<div class="note ' + cls + '">' + icon(ic) +
      '<div>' + (b.label ? '<b>' + esc(b.label) + ':</b> ' : '') + esc(b.text) + '</div></div>';
  }

  function tableHtml(t) {
    var em = t.emphasizeRows || [];
    return '<div class="tablewrap"><table class="data"><thead><tr>' +
      t.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      t.rows.map(function (r, i) {
        return '<tr' + (em.indexOf(i) >= 0 ? ' class="em"' : '') + '>' +
          r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
      }).join('') +
      '</tbody></table></div>';
  }

  function infoSectionBody(sec) {
    var out = '';
    if (sec.paragraphs) out += sec.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    if (sec.blocks) out += sec.blocks.map(blockHtml).join('');
    if (sec.table) out += tableHtml(sec.table);
    if (sec.paragraphsAfter) out += sec.paragraphsAfter.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    if (sec.list) {
      out += '<dl class="dl">' + sec.list.map(function (x) {
        return '<div><dt>' + esc(x.label) + '</dt><dd>' + esc(x.text) + '</dd></div>';
      }).join('') + '</dl>';
    }
    if (sec.subsections) {
      out += sec.subsections.map(function (sub) {
        var s = '<div class="acc-sub-title">' + esc(sub.title) + '</div>';
        if (sub.blocks) s += sub.blocks.map(blockHtml).join('');
        if (sub.paragraphs) s += sub.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
        return s;
      }).join('');
    }
    return out;
  }

  function viewInfo() {
    var out = '';

    /* Reiseüberblick */
    out += '<div class="section"><div class="section-title">Die Reise</div><div class="card"><div class="card-body">' +
      '<b style="font-size:1.1rem">' + esc(D.meta.title) + '</b>' +
      '<div class="small muted">' + esc(D.meta.subtitle) + ' · ' + D.meta.days + ' Tage · ' + D.meta.nights + ' Nächte</div>' +
      '<dl class="dl" style="margin-top:10px">' + D.meta.facts.map(function (f) {
        return '<div><dt>' + esc(f.label) + '</dt><dd>' + esc(f.value) + '</dd></div>';
      }).join('') + '</dl>' +
    '</div></div></div>';

    /* Flüge */
    out += '<div class="section"><div class="section-title">Flüge</div>' +
      D.flights.map(flightCard).join('') + '</div>';

    /* Buchungsstand */
    out += '<div class="section"><details class="acc"><summary>' + icon('check') + 'Buchungsstand<svg class="ic caret"><use href="#i-next"></use></svg></summary>' +
      '<div class="acc-body">' +
        '<p class="strong">' + esc(D.bookingOverview.summary) + '</p>' +
        '<p>' + esc(D.bookingOverview.note) + '</p>' +
        '<div class="tablewrap"><table class="data"><thead><tr><th>Tag</th><th>Datum</th><th>Unterkunft</th><th>Art</th><th>Status</th></tr></thead><tbody>' +
        D.bookingOverview.rows.map(function (r) {
          var s = stay(r.accommodationId);
          return '<tr><td>' + esc(r.days) + '</td><td>' + esc(r.date) + '</td><td>' + esc(s.name) + '</td><td>' + esc(r.type) + '</td><td>' + statusChip(r.status, r.statusText) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>' +
      '</div></details></div>';

    /* Die Abschnitte 7 bis 12 */
    out += '<div class="section"><div class="section-title">Unterwegs</div>' +
      D.info.map(function (sec) {
        return '<details class="acc"><summary>' + icon(sec.icon || 'info') + esc(sec.title) +
          '<svg class="ic caret"><use href="#i-next"></use></svg></summary>' +
          '<div class="acc-body prose">' + infoSectionBody(sec) + '</div></details>';
      }).join('') + '</div>';

    /* Aktivitäten */
    out += '<div class="section"><div class="section-title">Aktivitäten</div>' +
      '<details class="acc"><summary>' + icon('ticket') + 'Vorab zu buchen<svg class="ic caret"><use href="#i-next"></use></svg></summary>' +
        '<div class="acc-body" style="padding-left:0;padding-right:0">' +
        D.activities.filter(function (a) { return a.bookAhead; }).map(activityRow).join('') + '</div></details>' +
      '<details class="acc"><summary>' + icon('check') + 'Vor Ort buchbar oder frei<svg class="ic caret"><use href="#i-next"></use></svg></summary>' +
        '<div class="acc-body" style="padding-left:0;padding-right:0">' +
        D.activities.filter(function (a) { return !a.bookAhead; }).map(activityRow).join('') + '</div></details>' +
    '</div>';

    out += '<div class="section"><p class="tiny muted">Diese App enthält keine Anmeldung, kein Konto, keine Cloud und keine Analytik. ' +
      'Nach dem ersten Laden findet kein Netzwerkaufruf mehr statt. Alle Angaben stammen aus dem Reiseplan v3.</p></div>';

    return out;
  }

  /* --- Packliste ----------------------------------------------------- */

  function packCategories() { return D.packing.categories; }

  function validCategory(id) {
    return byId(packCategories(), id) ? id : 'sonstiges';
  }

  /* Bringt Einträge in die aktuelle Form. Ältere Einträge aus der früheren
     Checkliste hatten weder Menge noch Kategorie. */
  function normalizePackItem(p) {
    var qty = parseInt(p.qty, 10);
    return {
      id: String(p.id),
      category: validCategory(p.category),
      text: String(p.text || '').trim(),
      qty: qty > 0 ? qty : 1,
      done: !!p.done
    };
  }

  function packingList() {
    var raw = load(STORE.packing, []);
    if (!raw || raw.length === undefined) return [];
    return raw.filter(function (p) { return p && p.id && p.text; }).map(normalizePackItem);
  }

  /* Übernimmt neue Einträge aus data.js in die gespeicherte Liste.
     Wer schon einmal übernommen wurde, steht in packingSeeded und wird nicht
     erneut angelegt. So bleiben in der App gelöschte Einträge gelöscht. */
  function syncPackingDefaults() {
    var list = packingList();
    var seeded = load(STORE.packingSeeded, []) || [];
    var changed = false;
    D.packing.items.forEach(function (it) {
      if (seeded.indexOf(it.id) >= 0) return;
      seeded.push(it.id);
      changed = true;
      if (!byId(list, it.id)) list.push(normalizePackItem(it));
    });
    if (changed) {
      save(STORE.packing, list);
      save(STORE.packingSeeded, seeded);
    }
  }

  function packingStats() {
    var list = packingList(), done = 0;
    for (var i = 0; i < list.length; i++) if (list[i].done) done++;
    return { total: list.length, done: done };
  }

  function updatePackItem(id, fn) {
    save(STORE.packing, packingList().map(function (p) {
      if (p.id === id) fn(p);
      return p;
    }));
  }

  function packItemHtml(p) {
    return '<div class="checkitem packitem' + (p.done ? ' done' : '') + '" data-pack="' + esc(p.id) + '" role="button" tabindex="0">' +
      '<span class="checkbox">' + icon('check') + '</span>' +
      '<div class="checkitem-main"><b>' + esc(p.text) + '</b></div>' +
      '<div class="qty">' +
        '<button class="qtybtn" type="button" data-packqty="' + esc(p.id) + '" data-delta="-1" aria-label="Menge verringern"' + (p.qty <= 1 ? ' aria-disabled="true"' : '') + '>' + icon('minus') + '</button>' +
        '<span class="qty-val" aria-label="Menge">' + p.qty + '</span>' +
        '<button class="qtybtn" type="button" data-packqty="' + esc(p.id) + '" data-delta="1" aria-label="Menge erhöhen">' + icon('plus') + '</button>' +
      '</div>' +
      '<button class="del" type="button" data-packdel="' + esc(p.id) + '" aria-label="Eintrag löschen">' + icon('trash') + '</button>' +
    '</div>';
  }

  function viewPacking() {
    var list = packingList();
    var st = packingStats();
    var out = '';

    /* Fortschritt */
    var pct = st.total ? Math.round(st.done / st.total * 100) : 0;
    out += '<div class="section"><div class="card"><div class="card-body">' +
      '<b>' + (st.total === 0 ? 'Noch keine Einträge' : st.done + ' von ' + st.total + ' eingepackt') + '</b>' +
      '<div class="progress" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
    '</div></div></div>';

    /* Einträge je Kategorie, leere Kategorien werden nicht gezeigt */
    packCategories().forEach(function (c) {
      var items = list.filter(function (p) { return p.category === c.id; });
      if (!items.length) return;
      var done = items.filter(function (p) { return p.done; }).length;
      out += '<div class="section"><div class="section-title">' + esc(c.label) + ' · ' + done + '/' + items.length + '</div>' +
        '<div class="card">' + items.map(packItemHtml).join('') + '</div></div>';
    });

    /* Neuer Eintrag */
    out += '<div class="section"><div class="section-title">Neuer Eintrag</div><div class="card"><div class="packform">' +
      '<input class="input" id="pack-input" type="text" placeholder="Was soll mit?" autocomplete="off" aria-label="Gegenstand">' +
      '<div class="packform-row">' +
        '<input class="input input-qty" id="pack-qty" type="number" inputmode="numeric" min="1" step="1" value="1" aria-label="Menge">' +
        '<select class="input" id="pack-cat" aria-label="Kategorie">' +
          packCategories().map(function (c) {
            return '<option value="' + esc(c.id) + '"' + (c.id === state.packCat ? ' selected' : '') + '>' + esc(c.label) + '</option>';
          }).join('') +
        '</select>' +
        '<button class="btn btn-primary" type="button" id="pack-add" aria-label="Hinzufügen">' + icon('plus') + '</button>' +
      '</div>' +
    '</div></div></div>';

    out += '<div class="section"><div class="section-title">Abgleich zwischen den Handys</div><div class="card"><div class="card-body">' +
      '<p class="small">Die Packliste wird auf jedem Gerät getrennt gespeichert. Zum Abgleich den Stand auf dem einen Gerät erzeugen und kopieren, auf dem anderen einfügen und importieren. Der Import ersetzt die Liste auf dem Zielgerät. Kein Konto, keine Cloud, kein Netz nötig.</p>' +
      '<textarea class="textarea" id="sync-box" spellcheck="false" aria-label="Datenaustausch als JSON"></textarea>' +
      '<div class="btnrow" style="margin-top:10px">' +
        '<button class="btn" type="button" id="sync-export">' + icon('copy') + '<span>Stand erzeugen</span></button>' +
        '<button class="btn btn-primary" type="button" id="sync-import">' + icon('check') + '<span>Importieren</span></button>' +
      '</div>' +
      '<div class="btnrow" style="margin-top:8px">' +
        '<button class="btn" type="button" id="sync-copy">' + icon('copy') + '<span>Feld kopieren</span></button>' +
      '</div>' +
    '</div></div></div>';

    return out;
  }

  /* =========================================================================
     6 · Router
     ====================================================================== */

  var TABS = { today: 1, trip: 1, packing: 1, map: 1, info: 1 };

  /* Alte Adressen (Lesezeichen, Verknüpfungen) auf die neuen Reiter lenken */
  var ROUTE_ALIAS = { days: 'trip', stays: 'trip', checklists: 'packing' };
  var scrollMemory = {};

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    if (!h) return { view: 'today', arg: null };
    var parts = h.split('/');
    var view = ROUTE_ALIAS[parts[0]] || parts[0];
    return { view: view, arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function titleFor(r) {
    switch (r.view) {
      case 'today': return 'Heute';
      case 'trip':  return 'Unsere Reise';
      case 'day':   var d = day(r.arg); return d ? 'Tag ' + d.number : 'Tag';
      case 'stay':  var s = stay(r.arg); return s ? s.name : 'Unterkunft';
      case 'packing': return 'Packliste';
      case 'map':   return 'Karte';
      case 'info':  return 'Infos';
      default: return 'Namibia 2026';
    }
  }

  function tabFor(r) {
    if (r.view === 'day' || r.view === 'stay') return 'trip';
    return TABS[r.view] ? r.view : 'today';
  }

  function render() {
    var r = parseHash();
    var host = $('#view');
    var scroller = $('#scroller');

    /* Scrollposition der verlassenen Ansicht merken */
    if (state.route) scrollMemory[state.route] = scroller.scrollTop;

    var html = '', flush = false;
    switch (r.view) {
      case 'trip':       html = viewTrip(); break;
      case 'day':        html = viewDay(r.arg); flush = true; break;
      case 'stay':       html = viewStay(r.arg); break;
      case 'packing':    html = viewPacking(); break;
      case 'map':        html = viewMap(r.arg); break;
      case 'info':       html = viewInfo(); break;
      default:           html = viewToday(); break;
    }

    host.className = 'view' + (flush ? ' flush' : '');
    host.innerHTML = html;

    $('#topbar-title').textContent = titleFor(r);

    var isDetail = (r.view === 'day' || r.view === 'stay');
    $('#btn-back').hidden = !isDetail;

    var activeTab = tabFor(r);
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('data-tab') === activeTab) tabs[i].setAttribute('aria-current', 'page');
      else tabs[i].removeAttribute('aria-current');
    }

    state.route = r.view + '/' + (r.arg || '');
    scroller.scrollTop = scrollMemory[state.route] || 0;

    if (r.view === 'packing') wirePacking();
  }

  window.addEventListener('hashchange', render);

  /* =========================================================================
     7 · Ereignisse
     ====================================================================== */

  /* Kopieren, Kartenauswahl, manueller Tag, Checkboxen — per Delegation */
  document.addEventListener('click', function (ev) {
    var t = ev.target;

    var copyEl = t.closest ? t.closest('[data-copy]') : null;
    if (copyEl) {
      copyText(copyEl.getAttribute('data-copy'), copyEl.getAttribute('data-copy-label') || 'Text');
      ev.preventDefault();
      return;
    }

    var sel = t.closest ? t.closest('[data-mapsel]') : null;
    if (sel) {
      state.mapSel = sel.getAttribute('data-mapsel');
      render();
      $('#scroller').scrollTop = 0;
      return;
    }

    var stop = t.closest ? t.closest('[data-stop]') : null;
    if (stop) {
      state.mapSel = stop.getAttribute('data-stop');
      render();
      return;
    }

    if (t.closest && t.closest('[data-toggle-manual]')) {
      state.manualOpen = !state.manualOpen;
      render();
      return;
    }

    if (t.closest && t.closest('[data-clear-manual]')) {
      state.manualDayId = null;
      state.manualOpen = false;
      save(STORE.manual, null);
      render();
      return;
    }

    /* Die Knöpfe in einem Packlisten-Eintrag werden vor dem Eintrag selbst
       geprüft, sonst würde jeder Tipp darauf auch den Haken umschalten. */
    var pqty = t.closest ? t.closest('[data-packqty]') : null;
    if (pqty) {
      var delta = parseInt(pqty.getAttribute('data-delta'), 10) || 0;
      updatePackItem(pqty.getAttribute('data-packqty'), function (p) { p.qty = Math.max(1, p.qty + delta); });
      render();
      return;
    }

    /* Tipp auf die Mengenanzeige selbst: nichts tun */
    if (t.closest && t.closest('.qty')) return;

    var pdel = t.closest ? t.closest('[data-packdel]') : null;
    if (pdel) {
      var pid = pdel.getAttribute('data-packdel');
      var item = byId(packingList(), pid);
      if (item && !window.confirm('„' + item.text + '“ von der Packliste löschen?')) return;
      save(STORE.packing, packingList().filter(function (p) { return p.id !== pid; }));
      render();
      return;
    }

    var pack = t.closest ? t.closest('[data-pack]') : null;
    if (pack) {
      updatePackItem(pack.getAttribute('data-pack'), function (p) { p.done = !p.done; });
      render();
      return;
    }
  });

  document.addEventListener('change', function (ev) {
    if (ev.target && ev.target.hasAttribute && ev.target.hasAttribute('data-manual-select')) {
      var v = ev.target.value;
      state.manualDayId = v || null;
      save(STORE.manual, state.manualDayId);
      render();
    }
  });

  /* Tastatur für die Checkboxen */
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var el = ev.target;
    if (el && el.classList && el.classList.contains('checkitem')) {
      ev.preventDefault();
      el.click();
    }
  });

  function wirePacking() {
    var add = $('#pack-add'), input = $('#pack-input'), qty = $('#pack-qty'), cat = $('#pack-cat');
    if (cat) cat.addEventListener('change', function () { state.packCat = cat.value; });
    if (add) {
      add.addEventListener('click', function () {
        var text = (input.value || '').trim();
        if (!text) { toast('Bitte einen Gegenstand eingeben'); input.focus(); return; }
        var n = parseInt(qty.value, 10);
        state.packCat = validCategory(cat.value);
        var list = packingList();
        list.push(normalizePackItem({
          id: 'p' + Date.now() + Math.floor(Math.random() * 1000),
          category: state.packCat, text: text, qty: n > 0 ? n : 1, done: false
        }));
        save(STORE.packing, list);
        render();
        var again = $('#pack-input');
        if (again) again.focus();
      });
    }
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); $('#pack-add').click(); }
      });
    }

    var box = $('#sync-box');
    var exp = $('#sync-export'), imp = $('#sync-import'), cp = $('#sync-copy');
    if (exp) exp.addEventListener('click', function () {
      box.value = JSON.stringify({
        app: 'namibia-2026', version: 2,
        packing: packingList(),
        packingSeeded: load(STORE.packingSeeded, []) || []
      }, null, 2);
      toast('Stand erzeugt');
    });
    if (cp) cp.addEventListener('click', function () {
      if (!box.value) { toast('Erst „Stand erzeugen“'); return; }
      copyText(box.value, 'Stand');
    });
    if (imp) imp.addEventListener('click', function () {
      var raw = (box.value || '').trim();
      if (!raw) { toast('Feld ist leer'); return; }
      var obj;
      try { obj = JSON.parse(raw); } catch (e) { toast('Kein gültiges JSON'); return; }
      if (!obj || !obj.packing || obj.packing.length === undefined) { toast('Keine Packliste im Feld'); return; }
      save(STORE.packing, obj.packing);
      save(STORE.packing, packingList());   /* einmal normalisieren */
      /* Bereits übernommene Grundeinträge beider Geräte zusammenführen */
      var seeded = load(STORE.packingSeeded, []) || [];
      (obj.packingSeeded || []).forEach(function (id) { if (seeded.indexOf(id) < 0) seeded.push(id); });
      save(STORE.packingSeeded, seeded);
      syncPackingDefaults();
      render();
      toast('Stand übernommen');
    });
  }

  /* Zurück ------------------------------------------------------------- */
  $('#btn-back').addEventListener('click', function () {
    if (history.length > 1) history.back();
    else location.hash = '#/trip';
  });

  /* Thema -------------------------------------------------------------- */
  $('#btn-theme').addEventListener('click', function () {
    theme = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    applyTheme(theme);
    save(STORE.theme, theme);
  });

  /* Wischen zwischen den Tagen ---------------------------------------- */
  (function () {
    var x0 = null, y0 = null, t0 = 0;
    var sc = $('#scroller');
    sc.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
    }, { passive: true });
    sc.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var r = parseHash();
      if (r.view !== 'day') { x0 = null; return; }
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Date.now() - t0 > 700) return;
      if (Math.abs(dx) < 60 || Math.abs(dy) > 45) return;
      var d = day(r.arg);
      if (!d) return;
      var target = dx < 0 ? D.days[d.number] : D.days[d.number - 2];
      if (target) location.hash = '#/day/' + target.id;
    }, { passive: true });
  })();

  /* =========================================================================
     8 · Suche
     ====================================================================== */

  var searchIndex = (function () {
    var idx = [];
    D.days.forEach(function (d) {
      var body = [d.title, d.from, d.to, d.dateShort, d.weekday, d.roadType, d.distanceText]
        .concat(d.program || [])
        .concat((d.options || []).map(function (o) { return o.title + ' ' + o.text; }))
        .concat((d.notes || []).map(function (n) { return n.text; }))
        .concat((d.schedule || []).map(function (s) { return s.time + ' ' + s.step; }))
        .join(' ');
      idx.push({ kind: 'Tage', title: 'Tag ' + d.number + ' · ' + d.title, sub: d.dateShort + ' · ' + d.weekday, href: '#/day/' + d.id, text: body });
    });
    D.accommodations.forEach(function (s) {
      var body = [s.name, s.type, s.dateText, s.statusText, s.intro, s.price, s.address, s.contact, s.phone, s.email, s.reference]
        .concat((s.details || []).map(function (x) { return x.label + ' ' + x.text; }))
        .concat((s.notes || []).map(function (n) { return n.text; }))
        .join(' ');
      idx.push({ kind: 'Unterkünfte', title: s.name, sub: s.type + ' · ' + s.dateText, href: '#/stay/' + s.id, text: body });
    });
    D.places.forEach(function (p) {
      idx.push({ kind: 'Orte', title: p.name, sub: 'Tag ' + p.dayText + ' · ' + p.description, href: '#/map/' + p.id, text: p.name + ' ' + p.description });
    });
    D.flights.forEach(function (f) {
      idx.push({
        kind: 'Flüge', title: f.label + ' ' + f.flightNo,
        sub: shortDate(f.departDate) + ' ' + f.departTime + ' ' + f.from.city + ' → ' + f.to.city,
        href: '#/trip',
        text: [f.label, f.flightNo, f.airline, f.from.city, f.from.code, f.to.city, f.to.code].join(' ')
      });
    });
    D.activities.forEach(function (a) {
      idx.push({
        kind: 'Aktivitäten', title: a.name,
        sub: (a.bookAhead ? 'vorab buchen · ' : '') + 'Tag ' + a.dayText + (a.price ? ' · ' + a.price : ''),
        href: '#/day/' + 'd' + a.dayNumbers[0],
        text: [a.name, a.note, a.price, a.dayText].join(' ')
      });
    });
    return idx;
  })();

  function highlight(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  function runSearch(q) {
    var box = $('#search-results');
    q = (q || '').trim().toLowerCase();
    if (q.length < 2) {
      box.innerHTML = '<p class="small muted" style="margin-top:16px">Mindestens zwei Zeichen. Gesucht wird über Tage, Unterkünfte, Flüge, Orte und Aktivitäten.</p>';
      return;
    }
    var hits = searchIndex.filter(function (e) {
      return (e.title + ' ' + e.sub + ' ' + e.text).toLowerCase().indexOf(q) >= 0;
    });
    if (!hits.length) {
      box.innerHTML = '<p class="small muted" style="margin-top:16px">Nichts gefunden für „' + esc(q) + '“.</p>';
      return;
    }
    var groups = {}, order = [];
    hits.forEach(function (h) {
      if (!groups[h.kind]) { groups[h.kind] = []; order.push(h.kind); }
      groups[h.kind].push(h);
    });
    box.innerHTML = order.map(function (k) {
      return '<div class="res-group">' + esc(k) + ' · ' + groups[k].length + '</div><div class="card">' +
        groups[k].map(function (h) {
          var snippet = '';
          var pos = h.text.toLowerCase().indexOf(q);
          if (pos >= 0) {
            var from = Math.max(0, pos - 40);
            snippet = (from > 0 ? '… ' : '') + h.text.slice(from, pos + q.length + 70) + ' …';
          }
          return '<a class="linkrow" href="' + h.href + '" data-search-go>' +
            '<div class="linkrow-main"><b>' + highlight(h.title, q) + '</b>' +
            '<span>' + esc(h.sub) + (snippet ? '<br>' + highlight(snippet, q) : '') + '</span></div>' +
            icon('next', 'ic-chev') + '</a>';
        }).join('') + '</div>';
    }).join('');
  }

  function openSearch() {
    $('#search-overlay').hidden = false;
    var inp = $('#search-input');
    inp.value = '';
    runSearch('');
    setTimeout(function () { inp.focus(); }, 30);
  }
  function closeSearch() { $('#search-overlay').hidden = true; }

  $('#btn-search').addEventListener('click', openSearch);
  $('#search-close').addEventListener('click', closeSearch);
  $('#search-input').addEventListener('input', function (e) { runSearch(e.target.value); });
  $('#search-results').addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-search-go]')) closeSearch();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#search-overlay').hidden) closeSearch();
  });

  /* =========================================================================
     9 · Service Worker
     ====================================================================== */

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').then(function (reg) {

        function watch(worker) {
          if (!worker) return;
          worker.addEventListener('statechange', function () {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              $('#updatebar').hidden = false;
            }
          });
        }

        if (reg.waiting && navigator.serviceWorker.controller) $('#updatebar').hidden = false;
        watch(reg.installing);
        reg.addEventListener('updatefound', function () { watch(reg.installing); });

        $('#btn-reload').addEventListener('click', function () {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          setTimeout(function () { location.reload(); }, 120);
        });

        var reloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', function () {
          if (reloaded) return;
          reloaded = true;
          location.reload();
        });
      }).catch(function () { /* ohne Service Worker läuft die App weiterhin */ });
    });
  }

  /* =========================================================================
     10 · Start
     ====================================================================== */

  syncPackingDefaults();
  if (!location.hash) location.replace('#/today');
  render();

})();
