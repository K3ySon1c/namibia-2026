/* =============================================================================
   app.js — Namibia-Reise-PWA, Design „Foto-Magazin“
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

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoToday() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
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
  function shortDate(iso) {
    var d = isoToDate(iso);
    return WEEKDAYS[d.getDay()].slice(0, 2) + ' ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.';
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
  function day(id)    { return byId(D.days, id); }
  function stay(id)   { return byId(D.accommodations, id); }
  function place(id)  { return byId(D.places, id); }
  function act(id)    { return byId(D.activities, id); }
  function flight(id) { return byId(D.flights, id); }

  var TONE_CLASS = { success: 'chip-success', accent: 'chip-accent', warn: 'chip-warn', danger: 'chip-danger' };

  function statusChip(statusKey, text) {
    var st = D.statuses[statusKey] || D.statuses.open;
    return '<span class="chip ' + (TONE_CLASS[st.tone] || 'chip-plain') + '">' + esc(text || st.label) + '</span>';
  }

  /* Status plus die beiden wichtigsten Warnungen einer Unterkunft */
  function stayChips(s) {
    var c = statusChip(s.status);
    if (s.drinkingWater === false) c += '<span class="chip chip-danger">kein Trinkwasser</span>';
    if (s.powerAtSite === false) c += '<span class="chip chip-danger">kein Strom</span>';
    return '<div class="chips">' + c + '</div>';
  }

  function noteHtml(n) {
    var cls = { danger: 'note-danger', warn: 'note-warn', ok: 'note-ok' }[n.level] || 'note-info';
    var ico = n.level === 'danger' || n.level === 'warn' ? 'warn' : (n.level === 'ok' ? 'check' : 'info');
    return '<div class="note ' + cls + '">' + icon(ico) + '<div>' + esc(n.text) + '</div></div>';
  }
  function notesHtml(list) { return (list || []).map(noteHtml).join(''); }

  /* Geo-Links ---------------------------------------------------------- */
  function coordText(lat, lon) {
    return lat.toFixed(4) + ', ' + lon.toFixed(4);
  }
  function geoButtons(lat, lon, name, mini) {
    var c = lat.toFixed(4) + ',' + lon.toFixed(4);
    return '<div class="' + (mini ? 'minibtns' : 'btnrow') + '">' +
      '<button class="btn" type="button" data-copy="' + esc(coordText(lat, lon)) + '" data-copy-label="Koordinaten">' +
        icon('copy') + '<span>' + (mini ? esc(coordText(lat, lon)) : 'Koordinaten') + '</span></button>' +
      '<a class="btn" href="geo:' + c + '?q=' + c + '(' + encodeURIComponent(name) + ')">' + icon('pin') + '<span>Karten-App</span></a>' +
      '<a class="btn" href="https://www.google.com/maps/search/?api=1&amp;query=' + c + '" target="_blank" rel="noopener">' +
        icon('map') + '<span>' + (mini ? 'Maps' : 'Google Maps') + '</span></a>' +
    '</div>';
  }

  /* Fotos und Bildnachweis -------------------------------------------- */

  /* Hintergrundfarbe aus der Landschaftspalette, solange das Foto lädt */
  function photoBg(d) {
    var L = d && D.landscapes[d.landscape];
    return L ? L.near : '#3B2A1E';
  }
  function photoAlt(d) {
    return d.imageCredit ? d.imageCredit.caption : d.title;
  }
  /* Kurzer Nachweis auf dem Foto. CC BY und CC BY-SA verlangen die Nennung. */
  function creditShort(d) {
    var c = d && d.imageCredit;
    if (!c) return '';
    return esc(c.caption) + (c.generic ? ' (Symbolbild)' : '') + ' · Foto: ' + esc(c.artist) + ' · ' + esc(c.license);
  }
  function creditLong(d) {
    var c = d && d.imageCredit;
    if (!c) return '';
    return esc(c.caption) + (c.generic ? ' (Symbolbild)' : '') + '. Foto: ' + esc(c.artist) + ', ' +
      '<a href="' + esc(c.licenseUrl) + '" target="_blank" rel="noopener">' + esc(c.license) + '</a>, ' +
      '<a href="' + esc(c.source) + '" target="_blank" rel="noopener">Wikimedia Commons</a>';
  }

  /* Flüge, die an einem Reisetag starten oder landen */
  function flightsForDay(d) {
    return D.flights.filter(function (f) { return f.departDate === d.date || f.arriveDate === d.date; });
  }

  /* =========================================================================
     2 · Thema
     ====================================================================== */
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#0F0E0C' : '#F4EFE8');
    var uses = document.querySelectorAll('[data-toggle-theme] use');
    for (var i = 0; i < uses.length; i++) uses[i].setAttribute('href', mode === 'dark' ? '#i-sun' : '#i-moon');
  }
  var theme = load(STORE.theme, 'light');
  applyTheme(theme === 'dark' ? 'dark' : 'light');

  /* =========================================================================
     3 · Karte — selbst gezeichnete SVG-Übersicht
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
    var padding = 14;
    var vb = [-padding, -padding, MAP.w + padding * 2, MAP.h + padding * 2].map(function (n) { return n.toFixed(1); }).join(' ');

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
     4 · Bausteine des Designs
     ====================================================================== */

  function searchBtn(glass) {
    return '<button class="roundbtn' + (glass ? ' glass' : '') + '" type="button" data-open-search aria-label="Suchen">' + icon('search') + '</button>';
  }
  function themeBtn(glass) {
    return '<button class="roundbtn' + (glass ? ' glass' : '') + '" type="button" data-toggle-theme aria-label="Helles oder dunkles Thema">' +
      icon(isDark() ? 'sun' : 'moon') + '</button>';
  }

  /* Große Überschrift der Reiter mit Suche und Thema */
  function largeTitle(title, small) {
    return '<div class="largetitle"><h1>' + (small ? '<small>' + esc(small) + '</small>' : '') + esc(title) + '</h1>' +
      '<div class="btngroup">' + searchBtn(false) + themeBtn(false) + '</div></div>';
  }

  /* Fotokopf. o: { d, back, kicker, extra, title, sub, credit, withStats, parallax } */
  function hero(o) {
    var d = o.d;
    return '<div class="hero' + (o.withStats ? ' withstats' : '') + '"' + (o.parallax ? ' id="parallax"' : '') +
        ' style="background:' + esc(photoBg(d)) + '">' +
      (d && d.image ? '<img src="' + esc(d.image) + '" alt="' + esc(photoAlt(d)) + '">' : '') +
      '<div class="hero-top">' +
        (o.back ? '<button class="roundbtn glass" type="button" data-back aria-label="Zurück">' + icon('back') + '</button>' : '<span></span>') +
        '<div class="btngroup">' + searchBtn(true) + themeBtn(true) + '</div>' +
      '</div>' +
      (o.credit ? '<div class="credit">' + o.credit + '</div>' : '') +
      '<div class="hero-body">' +
        (o.kicker ? '<div class="kicker">' + o.kicker + '</div>' : '') +
        (o.extra || '') +
        (o.title ? '<h1>' + o.title + '</h1>' : '') +
        (o.sub ? '<div class="sub">' + o.sub + '</div>' : '') +
      '</div></div>';
  }

  function statsStrip(d) {
    return '<div class="stats">' +
      '<div class="stat"><small>' + icon('road') + 'Strecke</small><b>' + esc(d.distanceKm ? d.distanceKm + ' km' : '—') + '</b></div>' +
      '<div class="stat"><small>' + icon('sunrise') + 'Aufgang</small><b>' + esc(d.sunrise) + '</b></div>' +
      '<div class="stat"><small>' + icon('sunset') + 'Untergang</small><b>' + esc(d.sunset) + '</b></div>' +
    '</div>';
  }

  /* Flug als Bordkarte */
  function passHtml(f) {
    var nextDay = f.arriveDate !== f.departDate;
    return '<div class="pass">' +
      '<div class="pass-top"><span>' + icon('plane') + esc(f.label) + '</span><span>' + esc(f.flightNo) + '</span></div>' +
      '<div class="pass-route">' +
        '<div><b>' + esc(f.from.code) + '</b><span>' + esc(f.from.city) + '</span></div>' +
        '<div class="pass-line">' + icon('plane') + '</div>' +
        '<div class="r"><b>' + esc(f.to.code) + '</b><span>' + esc(f.to.city) + '</span></div>' +
      '</div>' +
      '<div class="pass-cut"></div>' +
      '<div class="pass-grid">' +
        '<div><small>Datum</small><b>' + esc(shortDate(f.departDate)) + '</b></div>' +
        '<div><small>Abflug</small><b>' + esc(f.departTime) + '</b></div>' +
        '<div><small>Ankunft</small><b>' + esc(f.arriveTime) + (nextDay ? ' <span class="muted">+1</span>' : '') + '</b></div>' +
        '<div><small>Airline</small><b>' + esc(f.airline.replace(' Airlines', '')) + '</b></div>' +
      '</div></div>';
  }

  /* Unterkunft als Zeile; verlinkt auf die Detailseite */
  function stayRow(s, note) {
    return '<a class="stayrow" href="#/stay/' + esc(s.id) + '"><span class="stayicon">' + icon('stays') + '</span>' +
      '<div class="stayrow-main"><b>' + esc(s.name) + '</b><span>' + esc(s.type) + ' · ' + esc(s.dateText) + (note ? ' · ' + esc(note) : '') + '</span>' +
      stayChips(s) + '</div>' + icon('next', 'chev') + '</a>';
  }

  /* Fotokarte eines Tages mit der Unterkunft der Nacht */
  function tcard(d) {
    var s = d.accommodationId ? stay(d.accommodationId) : null;
    var isToday = d.date === isoToday();
    var meta = [];
    if (d.distanceKm) meta.push(d.distanceKm + ' km');
    if (d.driveTime) meta.push(d.driveTime);
    meta.push(d.sunrise + ' – ' + d.sunset);

    var out = '<article class="tcard">' +
      '<a class="tcard-photo" href="#/day/' + d.id + '" style="background:' + esc(photoBg(d)) + '">' +
        (d.image ? '<img src="' + esc(d.image) + '" alt="' + esc(photoAlt(d)) + '" loading="lazy">' : '') +
        '<span class="daybadge"><b>' + d.number + '</b>' + esc(d.dateShort) + '</span>' +
        (isToday ? '<span class="chip todaybadge">Heute</span>' : '') +
        '<div class="tcard-cap"><h3>' + esc(d.title) + '</h3>' +
          '<div class="tcard-meta">' + meta.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</div></div>' +
      '</a>';
    if (s) {
      out += stayRow(s, d.accommodationNote);
    } else {
      out += '<div class="stayrow"><span class="stayicon">' + icon('plane') + '</span>' +
        '<div class="stayrow-main"><b>Heimflug</b><span>' + esc(d.accommodationNote || 'keine Übernachtung') + '</span></div></div>';
    }
    return out + '</article>';
  }

  function ringHtml(done, total) {
    var r = 38, c = 2 * Math.PI * r, pct = total ? done / total : 0;
    return '<div class="ring" aria-hidden="true"><svg viewBox="0 0 86 86"><circle class="bgc" cx="43" cy="43" r="' + r + '"/>' +
      '<circle class="fgc" cx="43" cy="43" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pct)).toFixed(1) + '"/></svg>' +
      '<b>' + Math.round(pct * 100) + '%</b></div>';
  }

  function alarmsHtml(s) {
    if (!s) return '';
    var out = '';
    if (s.drinkingWater === false) {
      out += '<div class="alarm">' + icon('drop') + '<div>Kein Trinkwasser<small>Mit vollem Tank ankommen.' +
        (s.id === 'twyfelfontein' ? ' Wasser gibt es nur für Duschen und Toiletten.' : '') + '</small></div></div>';
    }
    if (s.powerAtSite === false) {
      out += '<div class="alarm">' + icon('plug') + '<div>Kein Strom am Stellplatz<small>' + esc(s.powerNote || 'Geräte vorher laden.') + '</small></div></div>';
    }
    return out;
  }

  function section(title, body, aside, cls) {
    return '<div class="section' + (cls ? ' ' + cls : '') + '">' +
      (title ? '<div class="section-head"><h2>' + esc(title) + '</h2>' + (aside ? '<span>' + esc(aside) + '</span>' : '') + '</div>' : '') +
      body + '</div>';
  }

  /* =========================================================================
     5 · Ansichten
     ====================================================================== */

  var state = {
    route: '',
    manualDayId: load(STORE.manual, null),
    manualOpen: false,
    mapSel: D.accommodations[0].id,
    packCat: D.packing.categories[0].id,
    packFilter: 'alle'
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

  /* Vor der Reise: Countdown bis zum Hinflug auf dem Foto vom Deadvlei */
  function todayBefore() {
    var f = flight('outbound');
    var left = daysBetween(isoToday(), f.departDate);
    var h = day('d7') || D.days[0];
    var out = hero({
      d: h,
      credit: creditShort(h),
      kicker: 'Namibia 2026',
      extra: left > 0 ? '<div class="countnum">' + left + '</div>' : '',
      title: left > 0 ? (left === 1 ? 'Tag bis zum Abflug' : 'Tage bis zum Abflug') : 'Heute ist Abflug',
      sub: esc(shortDate(f.departDate)) + ' · ' + esc(f.departTime) + ' Uhr ab ' + esc(f.from.city) + ' · ' + D.meta.days + ' Tage, rund 4.000 km'
    });

    var pk = packingStats();
    out += '<div class="content">' +
      section('Euer Hinflug', passHtml(f), null, 'first') +
      section(null, '<a class="card ringcard" href="#/packing">' + ringHtml(pk.done, pk.total) +
        '<div style="flex:1 1 auto;min-width:0"><h3>Packliste</h3><p>' +
          (pk.total === 0 ? 'Noch leer' : (pk.done === pk.total ? 'Alles eingepackt' : pk.done + ' von ' + pk.total + ' eingepackt')) +
        '</p></div>' + icon('next', 'chev') + '</a>') +
      section('Die Route', '<div class="strip">' + D.days.map(function (x) {
        return '<a href="#/day/' + x.id + '" style="background:' + esc(photoBg(x)) + '">' +
          (x.image ? '<img src="' + esc(x.image) + '" alt="" loading="lazy">' : '') +
          '<div><small>Tag ' + x.number + '</small><b>' + esc(x.to) + '</b></div></a>';
      }).join('') + '</div>', D.days.length + ' Tage') +
    '</div>';
    return out;
  }

  /* Während der Reise (oder manuell gewählt): das Wichtigste des Tages */
  function todayDay(d, manual) {
    var s = d.accommodationId ? stay(d.accommodationId) : null;
    var out = hero({
      d: d,
      withStats: true,
      credit: creditShort(d),
      kicker: (manual ? 'Gewählter Tag' : 'Heute') + ' · Tag ' + d.number + ' von ' + D.days.length,
      title: esc(d.title),
      sub: esc(d.dateShort) + (d.driveTime ? ' · ' + esc(d.driveTime) + ' Fahrt' : '')
    }) + statsStrip(d);

    out += '<div class="content">';

    var alarms = alarmsHtml(s);
    if (alarms) out += section(null, alarms, null, 'first');

    var important = (d.notes || []).filter(function (n) { return n.level === 'danger' || n.level === 'warn'; });
    if (important.length) out += section('Wichtig heute', notesHtml(important), null, alarms ? '' : 'first');

    var fl = flightsForDay(d);
    if (fl.length) out += section('Flug heute', fl.map(passHtml).join(''));

    out += section('Heute Nacht', s
      ? '<div class="card">' + stayRow(s, d.accommodationNote) + '</div>'
      : '<div class="card card-body small">' + esc(d.accommodationNote || '—') + '</div>');

    out += section(null, '<a class="card row" href="#/day/' + d.id + '">' + icon('days') +
      '<div class="row-main"><b>Ganzen Tag ansehen</b><span>Programm, Ablauf, Orte und Hinweise</span></div>' + icon('next', 'chev') + '</a>');

    var next = D.days[d.number];
    if (next) out += section('Morgen', tcard(next));
    return out + '</div>';
  }

  /* Nach der Reise: Rückblick */
  function todayAfter() {
    var last = D.days[D.days.length - 1];
    var out = hero({
      d: last,
      credit: creditShort(last),
      kicker: 'Rückblick',
      title: esc(D.meta.title),
      sub: esc(D.meta.subtitle) + ' · ' + D.meta.days + ' Tage · ' + D.accommodations.length + ' Stationen'
    });
    out += '<div class="content">' +
      section(null, '<div class="card card-body small muted">Die Reise ist vorbei. Alle Tage, Unterkünfte und Orte bleiben hier vollständig erhalten.</div>', null, 'first') +
      section('Alle Tage', D.days.map(tcard).join('')) +
    '</div>';
    return out;
  }

  function manualBlock() {
    var cur = state.manualDayId ? day(state.manualDayId) : null;
    var out = '<div class="card">' +
      '<button class="row" type="button" data-toggle-manual>' + icon('clock') +
        '<div class="row-main"><b>Tag manuell wählen</b><span>' +
          (cur ? 'Aktiv: Tag ' + cur.number : 'Aus · es gilt das Systemdatum') + '</span></div>' + icon('next', 'chev') +
      '</button>';
    if (state.manualOpen) {
      out += '<div class="picker"><select class="select" data-manual-select aria-label="Tag wählen">' +
        '<option value="">Tag wählen</option>' +
        D.days.map(function (d) {
          return '<option value="' + d.id + '"' + (d.id === state.manualDayId ? ' selected' : '') + '>Tag ' + d.number + ' · ' + esc(d.dateShort) + ' · ' + esc(d.title) + '</option>';
        }).join('') +
      '</select></div>';
    }
    if (cur) {
      out += '<button class="row" type="button" data-clear-manual>' + icon('close') +
        '<div class="row-main"><b>Zurück auf heute</b><span>Systemdatum verwenden</span></div></button>';
    }
    return out + '</div>';
  }

  function viewToday() {
    var phase = tripPhase();
    var shown = state.manualDayId ? day(state.manualDayId) : null;
    var manual = !!shown;
    if (!shown && phase === 'during') shown = currentDay();

    var out;
    if (shown) out = todayDay(shown, manual);
    else if (phase === 'before') out = todayBefore();
    else if (phase === 'after') out = todayAfter();
    else out = '<div class="content top">' + largeTitle('Heute') + '<div class="card card-body">Für heute ist kein Reisetag hinterlegt.</div></div>';

    return out + '<div class="content">' + section(null, manualBlock()) + '</div>';
  }

  /* --- Unsere Reise --------------------------------------------------- */

  function viewTrip() {
    var out = '<div class="content top">' + largeTitle('Unsere Reise', '19.10. – 05.11.2026') + passHtml(flight('outbound'));
    D.regions.forEach(function (r) {
      out += '<div class="region"><b>' + esc(r.label) + '</b><span></span><small>Tag ' + r.from + (r.to !== r.from ? '–' + r.to : '') + '</small></div>';
      for (var n = r.from; n <= r.to; n++) out += tcard(D.days[n - 1]);
    });
    out += '<div class="region"><b>Heimflug</b><span></span></div>' + passHtml(flight('return'));
    out += section('Buchungsstand', '<div class="card card-body">' +
      '<p class="strong">' + esc(D.bookingOverview.summary) + '</p>' +
      '<p class="small muted">' + esc(D.bookingOverview.note) + '</p></div>');
    return out + '</div>';
  }

  /* --- Tag ------------------------------------------------------------ */

  function activityRow(a) {
    if (!a) return '';
    var meta = [];
    if (a.price) meta.push(a.price);
    if (a.dayText) meta.push('Tag ' + a.dayText);
    return '<div class="row static">' + icon(a.bookAhead ? 'ticket' : 'check') +
      '<div class="row-main"><b>' + esc(a.name) + '</b>' +
        '<span>' + esc(meta.join(' · ')) + (a.note ? (meta.length ? ' · ' : '') + esc(a.note) : '') + '</span></div>' +
      (a.bookAhead ? '<span class="chip chip-warn">vorab</span>' : '') +
    '</div>';
  }

  function viewDay(id) {
    var d = day(id);
    if (!d) return '<div class="content top">' + largeTitle('Tag') + '<p>Tag nicht gefunden.</p></div>';
    var s = d.accommodationId ? stay(d.accommodationId) : null;

    var out = hero({
      d: d,
      back: true,
      withStats: true,
      parallax: true,
      kicker: 'Tag ' + d.number + ' · ' + esc(d.dateShort) + ' · ' + esc(d.weekday),
      title: esc(d.title)
    }) + statsStrip(d) + '<p class="photocredit">' + creditLong(d) + '</p>';

    out += '<div class="content">';

    var alarms = alarmsHtml(s);
    if (alarms) out += section(null, alarms, null, 'first');

    if (d.driveTime || d.roadType) {
      out += section(null, '<div class="pills">' +
        (d.driveTime ? '<span class="pill">' + icon('car') + esc(d.driveTime) + '</span>' : '') +
        (d.roadType ? '<span class="pill">' + icon('road') + esc(d.roadType) + '</span>' : '') +
      '</div>', null, 'first');
    }

    var prose = (d.program || []).map(function (p, i) {
      return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + esc(p) + '</p>';
    }).join('');
    if (d.options && d.options.length) {
      prose += d.options.map(function (o) {
        return '<div class="card card-body"><b>' + esc(o.title) + '</b><div class="small muted" style="margin-top:3px">' + esc(o.text) + '</div></div>';
      }).join('');
    }
    if (d.programAfter) prose += d.programAfter.map(function (p) { return '<p style="margin-top:14px">' + esc(p) + '</p>'; }).join('');
    out += '<div class="section prose">' + prose + '</div>';

    var fl = flightsForDay(d);
    if (fl.length) out += section('Flug', fl.map(passHtml).join(''));

    if (d.schedule) {
      out += section('Ablauf', '<div class="card" style="padding:12px 16px 12px 8px">' +
        d.schedule.map(function (r) {
          return '<div class="sched-item"><div class="sched-time">' + esc(r.time) + '</div><div class="sched-dot"></div><div class="sched-step">' + esc(r.step) + '</div></div>';
        }).join('') + '</div>');
    }

    if (d.notes && d.notes.length) out += section('Hinweise', notesHtml(d.notes));

    out += section('Unterkunft', s
      ? '<div class="card">' + stayRow(s, d.accommodationNote) + '</div>'
      : '<div class="card card-body small">' + esc(d.accommodationNote || '—') + '</div>');

    if (d.placeIds && d.placeIds.length) {
      out += section('Orte an diesem Tag', '<div class="card">' + d.placeIds.map(function (pid) {
        var p = place(pid);
        return p ? '<a class="row" href="#/map/' + esc(p.id) + '">' + icon('pin') +
          '<div class="row-main"><b>' + esc(p.name) + '</b><span>' + esc(p.description) + '</span></div>' + icon('next', 'chev') + '</a>' : '';
      }).join('') + '</div>');
    }

    if (d.activityIds && d.activityIds.length) {
      out += section('Aktivitäten', '<div class="card">' + d.activityIds.map(function (aid) { return activityRow(act(aid)); }).join('') + '</div>');
    }

    /* Blättern mit Fotovorschau */
    var prev = D.days[d.number - 2], next = D.days[d.number];
    function pagerLink(x, label, right) {
      return '<a href="#/day/' + x.id + '" style="background:' + esc(photoBg(x)) + '">' +
        (x.image ? '<img src="' + esc(x.image) + '" alt="" loading="lazy">' : '') +
        '<div' + (right ? ' class="r"' : '') + '><small>' + label + '</small><b>' + esc(x.to) + '</b></div></a>';
    }
    out += '<div class="section"><div class="pager">' +
      (prev ? pagerLink(prev, '‹ Tag ' + prev.number, false) : '<span></span>') +
      (next ? pagerLink(next, 'Tag ' + next.number + ' ›', true) : '<span></span>') +
    '</div><p class="swipe-hint">Wischen blättert zwischen den Tagen</p></div>';

    return out + '</div>';
  }

  /* --- Unterkunft ----------------------------------------------------- */

  function viewStay(id) {
    var s = stay(id);
    if (!s) return '<div class="content top">' + largeTitle('Unterkunft') + '<p>Unterkunft nicht gefunden.</p></div>';
    var relDays = D.days.filter(function (d) { return d.accommodationId === s.id; });
    var d0 = relDays[0] || null;

    /* Als Foto dient das Bild des ersten Tages an dieser Station */
    var out = hero({
      d: d0,
      back: true,
      credit: creditShort(d0),
      kicker: esc(s.type) + ' · ' + esc(s.dateText) + ' · Tag ' + s.dayNumbers.join(' und '),
      title: esc(s.name)
    });

    out += '<div class="content">';
    out += section(null, '<div class="chips">' + statusChip(s.status, s.statusText) +
      (s.group ? '<span class="chip chip-plain">' + esc(s.group) + '</span>' : '') + '</div>', null, 'first');

    var alarms = alarmsHtml(s);
    if (alarms) out += section(null, alarms);

    if (s.intro) out += '<div class="section prose"><p class="lead">' + esc(s.intro) + '</p></div>';

    /* Kontakt und Referenz */
    var rows = '';
    if (s.phone) {
      rows += '<a class="row" href="tel:' + esc(s.phone.replace(/\s/g, '')) + '">' + icon('phone') +
        '<div class="row-main"><b>Anrufen</b><span>' + esc(s.phone) + '</span></div>' + icon('next', 'chev') + '</a>';
    }
    if (s.email) {
      rows += '<a class="row" href="mailto:' + esc(s.email) + '">' + icon('mail') +
        '<div class="row-main"><b>Mail schreiben</b><span>' + esc(s.email) + '</span></div>' + icon('next', 'chev') + '</a>';
    }
    if (s.contact) {
      rows += '<div class="row static">' + icon('info') + '<div class="row-main"><b>Ansprechpartner</b><span>' + esc(s.contact) + '</span></div></div>';
    }
    if (s.reception) {
      rows += '<div class="row static">' + icon('clock') + '<div class="row-main"><b>Rezeption</b><span>' + esc(s.reception) + '</span></div></div>';
    }
    if (s.address) {
      rows += '<div class="row static">' + icon('pin') + '<div class="row-main"><b>Adresse</b><span>' + esc(s.address) + '</span></div></div>';
    }
    if (s.reference) {
      rows += '<button class="row" type="button" data-copy="' + esc(s.reference) + '" data-copy-label="Referenz">' + icon('copy') +
        '<div class="row-main"><b>Referenznummer</b><span>' + esc(s.reference) +
        (s.ownReference ? ' · eigene Referenz: ' + esc(s.ownReference) : '') + '</span></div>' + icon('copy', 'chev') + '</button>';
    }
    if (rows) out += section('Kontakt', '<div class="card">' + rows + '</div>');

    /* Kennzahlen */
    var facts = '<div><small>' + icon('drop') + 'Trinkwasser</small><b style="color:' + (s.drinkingWater ? 'var(--success)' : 'var(--danger)') + '">' + (s.drinkingWater ? 'ja' : 'nein') + '</b></div>' +
      '<div><small>' + icon('plug') + 'Strom am Platz</small><b style="color:' + (s.powerAtSite ? 'var(--success)' : 'var(--danger)') + '">' + (s.powerAtSite ? 'ja' : 'nein') + '</b></div>';
    if (s.price) facts += '<div><small>' + icon('coins') + 'Preis</small><b>' + esc(s.price) + '</b></div>';
    if (s.rating) facts += '<div><small>' + icon('check') + 'Bewertung</small><b>' + esc(s.rating) + '</b></div>';
    out += section(null, '<div class="card factgrid">' + facts + '</div>');

    /* Koordinaten */
    out += section('Koordinaten', '<div class="card card-body">' +
      '<div class="coord">' + esc(coordText(s.lat, s.lon)) + '</div>' +
      '<div style="margin-top:12px">' + geoButtons(s.lat, s.lon, s.name, false) + '</div>' +
      '<p class="tiny muted" style="margin-top:10px">Die Koordinaten stehen offline zur Verfügung und lassen sich ins Navi tippen. Die beiden Links greifen erst, wenn wieder Netz oder eine Karten-App da ist.</p>' +
    '</div>');

    if (s.details && s.details.length) {
      out += section('Im Detail', '<div class="card card-body"><dl class="dl">' + s.details.map(function (x) {
        return '<div><dt>' + esc(x.label) + '</dt><dd>' + esc(x.text) + '</dd></div>';
      }).join('') + '</dl></div>');
    }

    if (s.notes && s.notes.length) out += section('Hinweise', notesHtml(s.notes));

    if (relDays.length) out += section(relDays.length > 1 ? 'Die Tage hier' : 'Der Tag hier', relDays.map(tcard).join(''));

    if (d0 && d0.imageCredit) out += '<p class="tiny muted">' + creditLong(d0) + '</p>';
    return out + '</div>';
  }

  /* --- Karte ---------------------------------------------------------- */

  function viewMap(sel) {
    if (sel && stay(sel)) state.mapSel = sel;
    var s = stay(state.mapSel) || D.accommodations[0];
    var idx = D.accommodations.indexOf(s) + 1;

    var out = '<div class="content top">' + largeTitle('Karte', 'Route und 14 Stationen') +
      '<div class="mapbox" id="mapbox">' + mapSvg(s.id) + '</div>' +
      '<p class="tiny muted" style="margin-top:8px">Selbst gezeichnete Übersicht, erkennbar, aber nicht geodätisch exakt. Kartenkacheln funktionieren offline nicht, deshalb diese Lösung.</p>';

    out += section('Station ' + idx + ' von 14', '<div class="card card-body">' +
      '<b style="font-size:1.1rem">' + esc(s.name) + '</b>' +
      '<div class="small muted">' + esc(s.type) + ' · ' + esc(s.dateText) + ' · Tag ' + s.dayNumbers.join(' und ') + '</div>' +
      '<div class="coord" style="margin-top:10px">' + esc(coordText(s.lat, s.lon)) + '</div>' +
      '<div style="margin-top:10px">' + geoButtons(s.lat, s.lon, s.name, false) + '</div>' +
      '<a class="btn btn-primary btn-block" style="margin-top:10px" href="#/stay/' + esc(s.id) + '">' + icon('stays') + '<span>Zur Unterkunft</span></a>' +
    '</div>');

    out += section('Alle Stationen', '<div class="card">' + D.accommodations.map(function (a, i) {
      return '<button class="row" type="button" data-mapsel="' + esc(a.id) + '">' +
        '<span class="numchip">' + (i + 1) + '</span>' +
        '<div class="row-main"><b>' + esc(a.name) + '</b><span>' + esc(coordText(a.lat, a.lon)) + ' · ' + esc(a.dateText) + '</span></div>' +
        icon('next', 'chev') + '</button>';
    }).join('') + '</div>');

    out += section('Orte und Sehenswürdigkeiten', '<div class="card">' + D.places.map(function (p) {
      return '<div class="row static" style="align-items:flex-start">' + icon('pin') +
        '<div class="row-main"><b>' + esc(p.name) + '</b><span>Tag ' + esc(p.dayText) + ' · ' + esc(p.description) + '</span>' +
          geoButtons(p.lat, p.lon, p.name, true) + '</div></div>';
    }).join('') + '</div>');

    return out + '</div>';
  }

  /* --- Infos ---------------------------------------------------------- */

  function blockHtml(b) {
    return noteHtml({ level: b.level, text: (b.label ? b.label + ': ' : '') + b.text });
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

  function acc(iconName, title, body, bodyCls) {
    return '<details class="acc"><summary>' + icon(iconName) + esc(title) + icon('next', 'caret') + '</summary>' +
      '<div class="acc-body' + (bodyCls ? ' ' + bodyCls : '') + '">' + body + '</div></details>';
  }

  function viewInfo() {
    var out = '<div class="content top">' + largeTitle('Infos');

    out += '<div class="card card-body">' +
      '<b style="font-size:1.1rem">' + esc(D.meta.title) + '</b>' +
      '<div class="small muted">' + esc(D.meta.subtitle) + ' · ' + D.meta.days + ' Tage · ' + D.meta.nights + ' Nächte</div>' +
      '<dl class="dl" style="margin-top:12px">' + D.meta.facts.map(function (f) {
        return '<div><dt>' + esc(f.label) + '</dt><dd>' + esc(f.value) + '</dd></div>';
      }).join('') + '</dl></div>';

    out += section('Flüge', D.flights.map(passHtml).join(''));

    out += section('Buchungsstand', acc('check', 'Alle Unterkünfte',
      '<p class="strong">' + esc(D.bookingOverview.summary) + '</p>' +
      '<p class="small">' + esc(D.bookingOverview.note) + '</p>' +
      '<div class="tablewrap"><table class="data"><thead><tr><th>Tag</th><th>Datum</th><th>Unterkunft</th><th>Art</th><th>Status</th></tr></thead><tbody>' +
      D.bookingOverview.rows.map(function (r) {
        var s = stay(r.accommodationId);
        return '<tr><td>' + esc(r.days) + '</td><td>' + esc(r.date) + '</td><td>' + esc(s.name) + '</td><td>' + esc(r.type) + '</td><td>' + statusChip(r.status, r.statusText) + '</td></tr>';
      }).join('') + '</tbody></table></div>'));

    out += section('Unterwegs', D.info.map(function (sec) {
      return acc(sec.icon || 'info', sec.title, infoSectionBody(sec), 'prose');
    }).join(''));

    out += section('Aktivitäten',
      acc('ticket', 'Vorab zu buchen', D.activities.filter(function (a) { return a.bookAhead; }).map(activityRow).join(''), 'flushrows') +
      acc('check', 'Vor Ort buchbar oder frei', D.activities.filter(function (a) { return !a.bookAhead; }).map(activityRow).join(''), 'flushrows'));

    out += section('Bildnachweise', acc('info', 'Fotos der 18 Tage',
      '<div class="creditlist">' + D.days.map(function (d) {
        return '<div><b>Tag ' + d.number + ':</b> ' + creditLong(d) + '</div>';
      }).join('') + '</div>', 'flushrows'));

    out += '<p class="tiny muted">Diese App enthält keine Anmeldung, kein Konto, keine Cloud und keine Analytik. ' +
      'Nach dem ersten Laden findet kein Netzwerkaufruf mehr statt. Die Reiseangaben stammen aus dem Reiseplan v3, die Fotos von Wikimedia Commons.</p>';

    return out + '</div>';
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
    return '<div class="pitem' + (p.done ? ' done' : '') + '" data-pack="' + esc(p.id) + '" role="button" tabindex="0">' +
      '<span class="pcheck">' + icon('check') + '</span>' +
      '<div class="pitem-main">' + esc(p.text) + '</div>' +
      '<div class="stepper">' +
        '<button type="button" data-packqty="' + esc(p.id) + '" data-delta="-1" aria-label="Menge verringern"' + (p.qty <= 1 ? ' aria-disabled="true"' : '') + '>' + icon('minus') + '</button>' +
        '<span aria-label="Menge">' + p.qty + '</span>' +
        '<button type="button" data-packqty="' + esc(p.id) + '" data-delta="1" aria-label="Menge erhöhen">' + icon('plus') + '</button>' +
      '</div>' +
      '<button class="pdel" type="button" data-packdel="' + esc(p.id) + '" aria-label="Eintrag löschen">' + icon('trash') + '</button>' +
    '</div>';
  }

  function viewPacking() {
    var list = packingList();
    var st = packingStats();
    var cats = packCategories();
    var out = '<div class="content top">' + largeTitle('Packliste');

    out += '<div class="card ringcard">' + ringHtml(st.done, st.total) +
      '<div style="min-width:0"><h3>' + (st.total === 0 ? 'Noch keine Einträge' : st.done + ' von ' + st.total + ' eingepackt') + '</h3>' +
      '<p>Antippen hakt ab. Plus und Minus ändern die Menge.</p></div></div>';

    /* Filter nach Kategorie; nur Kategorien mit Einträgen */
    if (list.length) {
      if (state.packFilter !== 'alle' && !list.some(function (p) { return p.category === state.packFilter; })) state.packFilter = 'alle';
      out += '<div class="section first"><div class="filter">' +
        [{ id: 'alle', label: 'Alle' }].concat(cats).map(function (c) {
          var n = c.id === 'alle' ? list.length : list.filter(function (p) { return p.category === c.id; }).length;
          if (!n) return '';
          return '<button type="button" data-packfilter="' + esc(c.id) + '" aria-pressed="' + (state.packFilter === c.id) + '">' + esc(c.label) + ' ' + n + '</button>';
        }).join('') + '</div></div>';
    }

    cats.forEach(function (c) {
      if (state.packFilter !== 'alle' && state.packFilter !== c.id) return;
      var items = list.filter(function (p) { return p.category === c.id; });
      if (!items.length) return;
      var done = items.filter(function (p) { return p.done; }).length;
      out += section(c.label, '<div class="card">' + items.map(packItemHtml).join('') + '</div>', done + '/' + items.length);
    });

    out += section('Neuer Eintrag', '<div class="card"><div class="addform">' +
      '<input class="input" id="pack-input" type="text" placeholder="Was soll mit?" autocomplete="off" aria-label="Gegenstand">' +
      '<div class="addform-row">' +
        '<input class="input input-qty" id="pack-qty" type="number" inputmode="numeric" min="1" step="1" value="1" aria-label="Menge">' +
        '<select class="select" id="pack-cat" aria-label="Kategorie">' +
          cats.map(function (c) {
            return '<option value="' + esc(c.id) + '"' + (c.id === state.packCat ? ' selected' : '') + '>' + esc(c.label) + '</option>';
          }).join('') +
        '</select>' +
        '<button class="addbtn" type="button" id="pack-add" aria-label="Hinzufügen">' + icon('plus') + '</button>' +
      '</div>' +
    '</div></div>');

    out += section('Abgleich zwischen den Handys', '<div class="card card-body">' +
      '<p class="small">Die Packliste wird auf jedem Gerät getrennt gespeichert. Zum Abgleich den Stand auf dem einen Gerät erzeugen und kopieren, auf dem anderen einfügen und importieren. Der Import ersetzt die Liste auf dem Zielgerät. Kein Konto, keine Cloud, kein Netz nötig.</p>' +
      '<textarea class="textarea" id="sync-box" spellcheck="false" aria-label="Datenaustausch als JSON"></textarea>' +
      '<div class="btnrow" style="margin-top:10px">' +
        '<button class="btn" type="button" id="sync-export">' + icon('copy') + '<span>Stand erzeugen</span></button>' +
        '<button class="btn btn-primary" type="button" id="sync-import">' + icon('check') + '<span>Importieren</span></button>' +
      '</div>' +
      '<div class="btnrow" style="margin-top:8px">' +
        '<button class="btn" type="button" id="sync-copy">' + icon('copy') + '<span>Feld kopieren</span></button>' +
      '</div>' +
    '</div>');

    return out + '</div>';
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
      case 'trip':    return 'Unsere Reise';
      case 'day':     var d = day(r.arg); return d ? 'Tag ' + d.number : 'Tag';
      case 'stay':    var s = stay(r.arg); return s ? s.name : 'Unterkunft';
      case 'packing': return 'Packliste';
      case 'map':     return 'Karte';
      case 'info':    return 'Infos';
      default:        return 'Heute';
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

    var html;
    switch (r.view) {
      case 'trip':    html = viewTrip(); break;
      case 'day':     html = viewDay(r.arg); break;
      case 'stay':    html = viewStay(r.arg); break;
      case 'packing': html = viewPacking(); break;
      case 'map':     html = viewMap(r.arg); break;
      case 'info':    html = viewInfo(); break;
      default:        html = viewToday(); break;
    }

    host.innerHTML = html;
    document.title = titleFor(r) + ' · Namibia 2026';

    var activeTab = tabFor(r);
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('data-tab') === activeTab) tabs[i].setAttribute('aria-current', 'page');
      else tabs[i].removeAttribute('aria-current');
    }

    state.route = r.view + '/' + (r.arg || '');
    scroller.scrollTop = scrollMemory[state.route] || 0;
    parallax();

    if (r.view === 'packing') wirePacking();
  }

  /* Neu zeichnen, ohne die Scrollposition zu verlieren (Haken, Menge, Filter) */
  function rerender() {
    var keep = $('#scroller').scrollTop;
    render();
    $('#scroller').scrollTop = keep;
    parallax();
  }

  window.addEventListener('hashchange', render);

  /* Das Tagesfoto läuft beim Scrollen langsamer mit */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function parallax() {
    var hero = document.getElementById('parallax');
    if (!hero || reduceMotion) return;
    var img = hero.querySelector('img');
    var y = $('#scroller').scrollTop;
    if (img && y < 700) img.style.transform = 'translateY(' + (y * 0.35).toFixed(1) + 'px)';
  }
  $('#scroller').addEventListener('scroll', parallax, { passive: true });

  /* =========================================================================
     7 · Ereignisse
     ====================================================================== */

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t.closest) return;

    var copyEl = t.closest('[data-copy]');
    if (copyEl) {
      copyText(copyEl.getAttribute('data-copy'), copyEl.getAttribute('data-copy-label') || 'Text');
      ev.preventDefault();
      return;
    }

    if (t.closest('[data-open-search]')) { openSearch(); return; }

    if (t.closest('[data-toggle-theme]')) {
      theme = isDark() ? 'light' : 'dark';
      applyTheme(theme);
      save(STORE.theme, theme);
      return;
    }

    if (t.closest('[data-back]')) {
      if (history.length > 1) history.back();
      else location.hash = '#/trip';
      return;
    }

    var sel = t.closest('[data-mapsel]');
    if (sel) {
      state.mapSel = sel.getAttribute('data-mapsel');
      render();
      $('#scroller').scrollTop = 0;
      return;
    }

    var stop = t.closest('[data-stop]');
    if (stop) {
      state.mapSel = stop.getAttribute('data-stop');
      rerender();
      return;
    }

    if (t.closest('[data-toggle-manual]')) {
      state.manualOpen = !state.manualOpen;
      rerender();
      return;
    }

    if (t.closest('[data-clear-manual]')) {
      state.manualDayId = null;
      state.manualOpen = false;
      save(STORE.manual, null);
      render();
      return;
    }

    var pf = t.closest('[data-packfilter]');
    if (pf) {
      state.packFilter = pf.getAttribute('data-packfilter');
      rerender();
      return;
    }

    /* Die Knöpfe in einem Packlisten-Eintrag werden vor dem Eintrag selbst
       geprüft, sonst würde jeder Tipp darauf auch den Haken umschalten. */
    var pqty = t.closest('[data-packqty]');
    if (pqty) {
      var delta = parseInt(pqty.getAttribute('data-delta'), 10) || 0;
      updatePackItem(pqty.getAttribute('data-packqty'), function (p) { p.qty = Math.max(1, p.qty + delta); });
      rerender();
      return;
    }

    /* Tipp auf die Mengenanzeige selbst: nichts tun */
    if (t.closest('.stepper')) return;

    var pdel = t.closest('[data-packdel]');
    if (pdel) {
      var pid = pdel.getAttribute('data-packdel');
      var item = byId(packingList(), pid);
      if (item && !window.confirm('„' + item.text + '“ von der Packliste löschen?')) return;
      save(STORE.packing, packingList().filter(function (p) { return p.id !== pid; }));
      rerender();
      return;
    }

    var pack = t.closest('[data-pack]');
    if (pack) {
      updatePackItem(pack.getAttribute('data-pack'), function (p) { p.done = !p.done; });
      rerender();
      return;
    }
  });

  document.addEventListener('change', function (ev) {
    if (ev.target && ev.target.hasAttribute && ev.target.hasAttribute('data-manual-select')) {
      state.manualDayId = ev.target.value || null;
      save(STORE.manual, state.manualDayId);
      render();
    }
  });

  /* Tastatur für die Packlisten-Einträge */
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var el = ev.target;
    if (el && el.classList && el.classList.contains('pitem')) {
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
        rerender();
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
          return '<a class="row" href="' + h.href + '" data-search-go>' +
            '<div class="row-main"><b>' + highlight(h.title, q) + '</b>' +
            '<span>' + esc(h.sub) + (snippet ? '<br>' + highlight(snippet, q) : '') + '</span></div>' +
            icon('next', 'chev') + '</a>';
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
