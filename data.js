/* =============================================================================
   data.js — Namibia Selbstfahrer-Rundreise 19.10.–05.11.2026
   Einzige Datenquelle der App. Inhalte aus namibia-reiseplan-v3.md.
   Feldnamen englisch, Inhalte deutsch.
   Global verfügbar als  TRIP  (kein Build-Schritt, keine Module).
   ---------------------------------------------------------------------------
   Nach Änderungen: Cache-Version in sw.js erhöhen (const CACHE = 'namibia-vN').
   ========================================================================== */

const TRIP = {

  /* ---------------------------------------------------------------------
     META — Kopfdaten der Reise
     Quelle: Dokumentkopf
  --------------------------------------------------------------------- */
  meta: {
    title: 'Namibia Selbstfahrer-Rundreise',
    subtitle: '19. Oktober bis 5. November 2026',
    startDate: '2026-10-19',
    endDate: '2026-11-05',
    days: 18,
    nights: 17,
    facts: [
      { label: 'Reisende', value: '2 Erwachsene' },
      { label: 'Fahrzeug', value: '4x4 mit Dachzelt, Selbstverpflegung' },
      { label: 'Ankunft', value: 'Montag 19.10.2026, Hosea Kutako International Airport' },
      { label: 'Abflug', value: 'Donnerstag 05.11.2026, 19:00 Uhr' },
      { label: 'Übernachtungen', value: '12 Nächte im Dachzelt, 5 Nächte im Zimmer' },
      { label: 'Gesamtstrecke', value: 'rund 4.000 km' },
      { label: 'Zeitzone', value: 'UTC+2 durchgehend, keine Zeitumstellung' },
      { label: 'Nicht Teil der Reise', value: 'Caprivi/Zambezi-Region, Windhuk als Stadt' }
    ],
    currencyNote: 'Umrechnung etwa N$ 20 zu 1 €. Der Namibia-Dollar ist 1:1 an den südafrikanischen Rand gekoppelt.'
  },

  /* ---------------------------------------------------------------------
     STATUS-DEFINITIONEN — für die farbcodierten Chips
  --------------------------------------------------------------------- */
  statuses: {
    paid:      { label: 'bezahlt',   short: 'bezahlt',   tone: 'success' },
    booked:    { label: 'gebucht',   short: 'gebucht',   tone: 'accent'  },
    requested: { label: 'angefragt', short: 'angefragt', tone: 'warn'    },
    open:      { label: 'offen',     short: 'offen',     tone: 'danger'  }
  },

  /* ---------------------------------------------------------------------
     LANDSCAPES — Leitmotiv: generierte SVG-Horizontlinie je Tag.
     Farbverlauf wandert im Reiseverlauf durch die Palette:
     Kalahari-Rot → Canyon-Ocker → Namib-Aprikose → Küstennebel-Grau →
     Granit-Grau → Damaraland-Rost → Etosha-Blassweiß → Waterberg-Grün
  --------------------------------------------------------------------- */
  landscapes: {
    kalahari:   { label: 'Kalahari-Rot',       form: 'dunes',    skyTop: '#F2C9A0', skyBottom: '#E88F55', far: '#C25E2E', near: '#B4451F', sun: '#F6E3B0' },
    canyon:     { label: 'Canyon-Ocker',       form: 'canyon',   skyTop: '#F6DCB4', skyBottom: '#E9AE68', far: '#C98A3E', near: '#9E5C25', sun: '#FBEFC9' },
    namib:      { label: 'Namib-Aprikose',     form: 'dunes',    skyTop: '#FBE2CB', skyBottom: '#F2B183', far: '#E08A50', near: '#C2612C', sun: '#FFF2D6' },
    coast:      { label: 'Küstennebel-Grau',   form: 'coast',    skyTop: '#E3E6E7', skyBottom: '#B9C4C9', far: '#94A3AA', near: '#6E7C84', sun: '#F1F3F2' },
    granite:    { label: 'Granit-Grau',        form: 'granite',  skyTop: '#EFE6DA', skyBottom: '#C9BCAC', far: '#9C9086', near: '#6F6660', sun: '#FAF2E2' },
    damaraland: { label: 'Damaraland-Rost',    form: 'mesa',     skyTop: '#F3D9BE', skyBottom: '#DEA173', far: '#B76B45', near: '#8E4A2C', sun: '#FBEBCF' },
    etosha:     { label: 'Etosha-Blassweiß',   form: 'pan',      skyTop: '#F1F2EC', skyBottom: '#D8D3BC', far: '#B7B296', near: '#8B8C6C', sun: '#FFFDF2' },
    waterberg:  { label: 'Waterberg-Grün',     form: 'plateau',  skyTop: '#E7E8D6', skyBottom: '#C2C7A2', far: '#8B935F', near: '#6B7248', sun: '#F7F5DE' },
    bushveld:   { label: 'Bushveld-Grün',      form: 'bush',     skyTop: '#EDEAD6', skyBottom: '#CBCBA4', far: '#93976A', near: '#636B46', sun: '#F9F6E0' }
  },

  /* ---------------------------------------------------------------------
     1. BUCHUNGSSTAND — Übersicht (Abschnitt 1)
  --------------------------------------------------------------------- */
  bookingOverview: {
    summary: 'Alle 17 Nächte sind fest gebucht. Bezahlt sind alle bis auf den Restbetrag für Twyfelfontein: dort sind 20 % angezahlt, der Rest wird bei Ankunft bezahlt.',
    note: 'Bei Spitzkoppe liegt die endgültige Bestätigung vor. Referenz SPI-260807-006, eigene Referenz „Schrade". Die Bestätigung ausdrucken und offline speichern — an der Spitzkoppe gibt es keinen Empfang.',
    rows: [
      { days: '1',     date: 'Mo 19.10.',            accommodationId: 'kalahari-anib',  type: 'Zimmer',   status: 'paid',      statusText: 'gebucht und bezahlt' },
      { days: '2',     date: 'Di 20.10.',            accommodationId: 'stellies',       type: 'Zimmer',   status: 'paid',      statusText: 'gebucht und bezahlt' },
      { days: '3',     date: 'Mi 21.10.',            accommodationId: 'canyon-roadhouse', type: 'Dachzelt', status: 'paid',    statusText: 'gebucht und bezahlt' },
      { days: '4–5',   date: 'Do 22. / Fr 23.10.',   accommodationId: 'klein-aus-vista', type: 'Dachzelt', status: 'paid',    statusText: 'gebucht und bezahlt' },
      { days: '6',     date: 'Sa 24.10.',            accommodationId: 'sesriem',        type: 'Dachzelt', status: 'paid',      statusText: 'gebucht und bezahlt' },
      { days: '7',     date: 'So 25.10.',            accommodationId: 'namib-desert',   type: 'Dachzelt', status: 'paid',      statusText: 'gebucht und bezahlt' },
      { days: '8',     date: 'Mo 26.10.',            accommodationId: 'tiger-reef',     type: 'Dachzelt', status: 'paid',      statusText: 'gebucht und bezahlt' },
      { days: '9',     date: 'Di 27.10.',            accommodationId: 'spitzkoppe',     type: 'Dachzelt', status: 'paid',      statusText: 'gebucht und bezahlt, Endbestätigung liegt vor' },
      { days: '10',    date: 'Mi 28.10.',            accommodationId: 'twyfelfontein',  type: 'Dachzelt', status: 'booked',    statusText: 'fest gebucht, 20 % angezahlt, Rest vor Ort' },
      { days: '11',    date: 'Do 29.10.',            accommodationId: 'etosha-safari-camp', type: 'Dachzelt', status: 'paid',  statusText: 'gebucht und bezahlt' },
      { days: '12',    date: 'Fr 30.10.',            accommodationId: 'halali',         type: 'Dachzelt', status: 'paid',      statusText: 'gebucht und bezahlt' },
      { days: '13–14', date: 'Sa 31.10. / So 01.11.', accommodationId: 'onguma-tamboti', type: 'Dachzelt', status: 'paid',     statusText: 'gebucht und bezahlt' },
      { days: '15–16', date: 'Mo 02. / Di 03.11.',   accommodationId: 'aloegrove',      type: 'Zimmer',   status: 'paid',      statusText: 'gebucht und bezahlt' },
      { days: '17',    date: 'Mi 04.11.',            accommodationId: 'okapuka',        type: 'Zimmer',   status: 'paid',      statusText: 'gebucht und bezahlt' }
    ]
  },

  /* ---------------------------------------------------------------------
     2. OFFENE AUFGABEN — Grundlage der Checkliste (Abschnitt 2)
     Abhak-Zustand liegt in localStorage, nicht hier.
  --------------------------------------------------------------------- */
  tasks: [
    { id: 't-spitzkoppe',   title: 'Spitzkoppe Bestätigung offline sichern', details: 'Endbestätigung liegt vor, NAD 600 bezahlt. Jetzt noch ausdrucken und auf beiden Handys offline speichern — an der Spitzkoppe gibt es keinen Empfang.', urgency: 'mittel', urgencyNote: 'mittel', accommodationId: 'spitzkoppe' },
    { id: 't-twyfel-anzahlung', title: 'Twyfelfontein Restzahlung',    details: 'Fest gebucht, 20 % Anzahlung = N$ 660 bezahlt. Der Rest von N$ 2.640 ist bei Ankunft am 28.10. vor Ort fällig — Bargeld oder Karte bereithalten.', urgency: 'erledigt', urgencyNote: 'erledigt, Rest vor Ort', accommodationId: 'twyfelfontein' },
    { id: 't-abbau',        title: 'Abbau vor der Exkursion klären',   details: 'Am 29.10. vor 08:30 abbauen, damit ihr um 11:45 losfahren könnt. Check-out-Zeit erfragen.', urgency: 'mittel', urgencyNote: 'mittel', dayId: 'd11' },
    { id: 't-aloegrove-pay', title: 'Aloegrove Bezahllink',            details: 'Erledigt. Über den Link der Lodge bezahlt. Zahlungsbeleg offline speichern.', urgency: 'erledigt', urgencyNote: 'erledigt', accommodationId: 'aloegrove' },
    { id: 't-aloegrove-dinner', title: 'Aloegrove Abendessen',         details: 'Ist es im Booking-Tarif enthalten? Ihr könnt auf der Farm nicht ausweichen.', urgency: 'hoch', urgencyNote: 'hoch', accommodationId: 'aloegrove' },
    { id: 't-aloegrove-akt', title: 'Aloegrove Aktivitäten',           details: 'Pirschfahrt mit den Eigentümern und ggf. Cheetah Conservation Fund für den 03.11.', urgency: 'mittel', urgencyNote: 'mittel', accommodationId: 'aloegrove' },
    { id: 't-okapuka',      title: 'Okapuka Pirschfahrt',              details: 'Vormittag des 05.11., ca. 2 Std., rund N$ 960 p. P.', urgency: 'mittel', urgencyNote: 'mittel', accommodationId: 'okapuka' },
    { id: 't-sandwich',     title: 'Sandwich Harbour entscheiden',     details: 'Nur am Vormittag des 27.10. möglich, Touren sind oft Wochen voraus voll.', urgency: 'mittel', urgencyNote: 'mittel', dayId: 'd9' },
    { id: 't-gravuren',     title: 'Twyfelfontein-Gravuren',           details: 'Fest auf den Nachmittag des 28.10. — der 29.10. ist durch Exkursion und 355 km voll.', urgency: 'erledigt', urgencyNote: 'erledigt geplant', dayId: 'd10' },
    { id: 't-rueckgabe',    title: 'Fahrzeugrückgabe klären',          details: 'Flughafen oder Depot in Windhuk? Entscheidet den Ablauf am 05.11.', urgency: 'mittel', urgencyNote: 'mittel', dayId: 'd18' },
    { id: 't-versicherung', title: 'Zusatzversicherung',               details: 'Reifen und Scheiben sind im Standardtarif meist nicht gedeckt.', urgency: 'hoch', urgencyNote: 'hoch' },
    { id: 't-betraege',     title: 'Beträge nachtragen',               details: 'Bezahlte Summen für die Kostenübersicht.', urgency: 'niedrig', urgencyNote: 'niedrig' }
  ],

  /* ---------------------------------------------------------------------
     3. DIE ROUTE TAG FÜR TAG — 18 Tage (Abschnitt 3)
     Alle Sonnenzeiten für den jeweiligen Standort, Ortszeit UTC+2.
  --------------------------------------------------------------------- */
  days: [
    {
      id: 'd1', number: 1, date: '2026-10-19', weekday: 'Montag', dateShort: 'Mo 19.10.',
      title: 'Flughafen Windhuk → Kalahari',
      from: 'Flughafen Windhuk', to: 'Kalahari',
      distanceKm: 240, distanceText: '~240 km', driveTime: '~3 Std.', roadType: 'B1 durchgehend Teer',
      sunrise: '06:10', sunset: '18:54',
      accommodationId: 'kalahari-anib', accommodationNote: null,
      landscape: 'kalahari',
      program: [
        'Fahrzeugübernahme, dann Einkauf in Windhuk und Bargeld ziehen. Über die B1 nach Süden in die roten Dünen der Kalahari.',
        'Check-in 14:00 bis 20:00 Uhr, trotzdem vor Dunkelheit ankommen. Das Dachzelt braucht ihr heute noch nicht — nach dem Langstreckenflug ein echter Gewinn. Am Abend lohnt der Sundowner-Drive in die Dünen.'
      ],
      highlights: [
        'Das Dachzelt braucht ihr heute noch nicht — nach dem Langstreckenflug ein echter Gewinn.'
      ],
      notes: [
        { level: 'info', text: 'Check-in 14:00 bis 20:00 Uhr, trotzdem vor Dunkelheit ankommen.' },
        { level: 'info', text: 'Großeinkauf für 3–4 Tage in Windhuk, dazu Gaskartuschen, Feuerholz und Bargeld.' }
      ],
      placeIds: [],
      activityIds: ['a-sundowner-kalahari'],
      image: null
    },
    {
      id: 'd2', number: 2, date: '2026-10-20', weekday: 'Dienstag', dateShort: 'Di 20.10.',
      title: 'Kalahari → Keetmanshoop',
      from: 'Kalahari', to: 'Keetmanshoop',
      distanceKm: 230, distanceText: '~230 km', driveTime: '~2,5 Std.', roadType: 'durchgehend Teer',
      sunrise: '06:07', sunset: '18:56',
      accommodationId: 'stellies', accommodationNote: null,
      landscape: 'kalahari',
      program: [
        'Fahrt nach Keetmanshoop. Die Unterkunft liegt mitten in der Stadt, Supermärkte sind nah. Großer Einkauf in Keetmanshoop — er muss Frühstück und Mittag für Tag 3 und 4 abdecken, weil das Canyon Roadhouse keinen Lebensmittelladen hat.'
      ],
      highlights: [
        'Großer Einkauf in Keetmanshoop — er muss Tag 3 und 4 abdecken.'
      ],
      notes: [
        { level: 'warn', text: 'Großeinkauf in Keetmanshoop: Das Canyon Roadhouse hat keinen Lebensmittelladen. Frühstück und Mittag für Tag 3 und 4 mitnehmen.' }
      ],
      placeIds: [],
      activityIds: [],
      image: null
    },
    {
      id: 'd3', number: 3, date: '2026-10-21', weekday: 'Mittwoch', dateShort: 'Mi 21.10.',
      title: 'Keetmanshoop → Fish River Canyon',
      from: 'Keetmanshoop', to: 'Fish River Canyon',
      distanceKm: 300, distanceText: '~300 km', driveTime: '~4 Std.', roadType: 'B4 Teer, dann C12/C37 Schotter',
      sunrise: '06:07', sunset: '18:59',
      accommodationId: 'canyon-roadhouse', accommodationNote: null,
      landscape: 'canyon',
      program: [
        'Check-in 14:00 bis 19:00 Uhr. Danach zum Canyon ins Abendlicht: 14 km zurück zum Hobas-Tor, dort Parkgebühr N$ 620 zahlen, dann etwa 10 km weiter zum Main Viewpoint und Hell’s Bend. Für die Rückfahrt in der Dämmerung Zeit einplanen.',
        'Abendessen im Roadhouse-Restaurant. Es gibt dort keinen Laden, aber das Wildfleisch ist berühmt und die Einrichtung aus Oldtimern und altem Werkzeug ist eine Sehenswürdigkeit für sich.'
      ],
      highlights: [
        'Canyon im Abendlicht — beste Stimmung ab 17:00.'
      ],
      notes: [
        { level: 'warn', text: 'Parkgebühr N$ 620 am Hobas-Tor, gültig 24 Stunden.' },
        { level: 'info', text: 'Kein Lebensmittelladen am Canyon Roadhouse — nur Souvenirs und Bücher.' }
      ],
      placeIds: ['hobas-gate', 'fish-river-viewpoint'],
      activityIds: ['a-wanderweg-roadhouse'],
      image: null
    },
    {
      id: 'd4', number: 4, date: '2026-10-22', weekday: 'Donnerstag', dateShort: 'Do 22.10.',
      title: 'Canyon Roadhouse → Aus',
      from: 'Canyon Roadhouse', to: 'Aus',
      distanceKm: 300, distanceText: '~300 km', driveTime: '~4,5 Std.', roadType: 'Schotter und Teer',
      sunrise: '06:13', sunset: '19:05',
      accommodationId: 'klein-aus-vista', accommodationNote: '1. von 2 Nächten',
      landscape: 'canyon',
      program: [
        'Wer den Canyon im Frühlicht sehen will, fährt gegen 05:45 los. Danach zurück ins Camp, packen, Check-out bis 10:00 Uhr — und im Roadhouse volltanken, dort gibt es auch Reifenreparatur.',
        'Am Ziel: Powerbanks und Kameraakkus gleich mitnehmen und an der Rezeption laden, etwa 1,5 km entfernt. Am Stellplatz gibt es keinen Strom.'
      ],
      highlights: [
        'Canyon im Frühlicht — Abfahrt gegen 05:45.'
      ],
      notes: [
        { level: 'danger', text: 'Kein Strom am Stellplatz. Powerbanks und Kameraakkus an der Rezeption des Desert Horse Inn laden, etwa 1,5 km entfernt.' },
        { level: 'warn', text: 'Im Canyon Roadhouse volltanken — dort gibt es auch Reifenreparatur.' },
        { level: 'info', text: 'Check-out bis 10:00 Uhr.' }
      ],
      placeIds: ['fish-river-viewpoint', 'hobas-gate'],
      activityIds: ['a-wanderweg-roadhouse'],
      image: null
    },
    {
      id: 'd5', number: 5, date: '2026-10-23', weekday: 'Freitag', dateShort: 'Fr 23.10.',
      title: 'Tagesausflug Lüderitz und Kolmanskop',
      from: 'Aus', to: 'Lüderitz und zurück',
      distanceKm: 260, distanceText: '~260 km hin und zurück', driveTime: null, roadType: 'Teer',
      sunrise: '06:12', sunset: '19:06',
      accommodationId: 'klein-aus-vista', accommodationNote: '2. von 2 Nächten',
      landscape: 'coast',
      program: [
        'Morgens das Garub-Wasserloch mit den Wildpferden, versteckte Beobachtungshütte etwa 1 km von der B4. Dann Kolmanskop, Führung um 9:30, Permit am Gate. Mittags Lüderitz, Spar-Einkauf, optional Diaz Point. Achtung: dort ist es sehr windig.',
        'Abends in Aus volltanken für die D707.'
      ],
      highlights: [
        'Kolmanskop-Führung um 9:30 — morgens bestes Fotolicht.'
      ],
      notes: [
        { level: 'warn', text: 'Abends in Aus volltanken für die D707. Die Etappe morgen hat dazwischen nur Betta mit unsicherer Versorgung.' },
        { level: 'info', text: 'Diaz Point ist sehr windig.' }
      ],
      placeIds: ['garub', 'kolmanskop', 'luederitz'],
      activityIds: ['a-kolmanskop-fuehrung'],
      image: null
    },
    {
      id: 'd6', number: 6, date: '2026-10-24', weekday: 'Samstag', dateShort: 'Sa 24.10.',
      title: 'Aus → Sesriem über die D707',
      from: 'Aus', to: 'Sesriem',
      distanceKm: 360, distanceText: '~360 km', driveTime: '6 bis 7 Std.', roadType: 'überwiegend Schotter mit weichen Sandstellen',
      sunrise: '06:12', sunset: '19:07',
      accommodationId: 'sesriem', accommodationNote: null,
      landscape: 'namib',
      program: [
        'Der landschaftlich schönste Fahrtag, zwischen Tirasbergen und Namib-Dünen. Fahrt direkt nach dem Frühstück los, nicht erst um 10 Uhr — Ankunft dann gegen 15:00 bis 16:00.',
        'Danach bleibt Zeit für eines von beiden: den Sesriem Canyon, nur 4 km entfernt und in 30 bis 45 Minuten machbar, oder die Elim Dune zum Sonnenuntergang um 19:07. Beides an einem Abend wird knapp.',
        'Heute Abend alles für morgen vorbereiten — Wasser, Snacks, Stirnlampen, Kamera griffbereit obenauf.'
      ],
      highlights: [
        'Der landschaftlich schönste Fahrtag der Reise.'
      ],
      notes: [
        { level: 'warn', text: 'Direkt nach dem Frühstück losfahren, nicht erst um 10 Uhr.' },
        { level: 'warn', text: 'Heute Abend alles für morgen vorbereiten: Wasser, Snacks, Stirnlampen, Kamera griffbereit obenauf.' },
        { level: 'info', text: 'Nur eines von beiden schaffbar: Sesriem Canyon oder Elim Dune zum Sonnenuntergang.' }
      ],
      placeIds: ['sesriem-canyon', 'elim-dune'],
      activityIds: [],
      image: null
    },
    {
      id: 'd7', number: 7, date: '2026-10-25', weekday: 'Sonntag', dateShort: 'So 25.10.',
      title: 'Sossusvlei, dann weiter nach Norden',
      from: 'Sesriem', to: 'Namib Desert Campsite',
      distanceKm: 190, distanceText: '~190 km', driveTime: null, roadType: 'Teer im Park, letzte 5 km tiefer Sand, dann C19 Schotter',
      sunrise: '06:16', sunset: '19:09',
      accommodationId: 'namib-desert', accommodationNote: null,
      landscape: 'namib',
      program: [
        'Wecker 04:30. Zelt schließen und das ganze Lager abbauen, bevor ihr losfahrt — ihr kommt nicht zurück, und Check-out ist 10:00 Uhr. Das kostet im Dunkeln etwa 30 Minuten.',
        'Das Innentor öffnet etwa eine Stunde vor Sonnenaufgang, also gegen 05:20. Als Gäste innerhalb des Tores seid ihr damit vor allen Tagesbesuchern an den Dünen. Dune 45, Deadvlei und Big Daddy im Morgenlicht. Vor dem Sandabschnitt Reifendruck ablassen, danach wieder aufpumpen.',
        'Gegen 11:00 bis 12:00 zurück am Tor, dann nur noch 60 km nach Norden. Der Nachmittag ist frei: Pool an der Lodge 5 km weiter, Wanderung auf die versteinerten Ur-Dünen oder ausruhen. Abendbuffet an der Lodge etwa N$ 400 p. P., vorher anmelden.'
      ],
      highlights: [
        'Wecker 04:30 — vor allen Tagesbesuchern an den Dünen.'
      ],
      notes: [
        { level: 'danger', text: 'Wecker 04:30. Vor der Abfahrt das ganze Lager abbauen — ihr kommt nicht zurück. Im Dunkeln etwa 30 Minuten einplanen.' },
        { level: 'warn', text: 'Parkgebühr N$ 620 am Sesriem-Tor.' },
        { level: 'warn', text: 'Vor dem Sandabschnitt Reifendruck ablassen, danach wieder aufpumpen.' },
        { level: 'info', text: 'Abendbuffet an der Lodge etwa N$ 400 p. P. — vorher anmelden.' }
      ],
      placeIds: ['dune45', 'deadvlei'],
      activityIds: ['a-naturfahrt-gondwana', 'a-wanderung-urduenen'],
      image: null
    },
    {
      id: 'd8', number: 8, date: '2026-10-26', weekday: 'Montag', dateShort: 'Mo 26.10.',
      title: 'Namib Desert Campsite → Swakopmund',
      from: 'Namib Desert Campsite', to: 'Swakopmund',
      distanceKm: 295, distanceText: '~295 km', driveTime: '~4,5 Std.', roadType: 'C19/C14 Schotter, letzter Teil Teer',
      sunrise: '06:14', sunset: '19:06',
      accommodationId: 'tiger-reef', accommodationNote: null,
      landscape: 'coast',
      program: [
        'Solitaire liegt nur 30 km entfernt — Apfelkuchen, rostige Oldtimer und die letzte Tankstelle bis Walvis Bay. Volltanken. Danach Gaub- und Kuiseb-Pass, dann die Wüstenebene bis zur Küste. Von 40 °C auf 18 °C an einem Tag.',
        'Der Nachmittag ist wichtig: heute muss der große Einkauf erledigt werden. Swakopmund ist der letzte gut sortierte Supermarkt vor Etosha — Woermann Brock, Spar oder Pick n Pay in der Mall. Vorräte, viel Wasser, Eis. Außerdem alle Geräte laden, die nächsten zwei Nächte haben keinen Strom.'
      ],
      highlights: [
        'Großeinkauf in Swakopmund — der wichtigste Versorgungsstopp der Reise.'
      ],
      notes: [
        { level: 'danger', text: 'Alle Geräte in Swakopmund laden — die nächsten zwei Nächte haben keinen Strom am Stellplatz.' },
        { level: 'warn', text: 'Großeinkauf: Vorräte, viel Wasser, Eis. Letzter gut sortierter Supermarkt vor Etosha.' },
        { level: 'warn', text: 'In Solitaire volltanken — letzte Tankstelle bis Walvis Bay.' },
        { level: 'info', text: 'Temperatursturz von 40 °C auf 18 °C an einem Tag.' }
      ],
      placeIds: ['solitaire'],
      activityIds: ['a-living-desert', 'a-scenic-flight'],
      image: null
    },
    {
      id: 'd9', number: 9, date: '2026-10-27', weekday: 'Dienstag', dateShort: 'Di 27.10.',
      title: 'Swakopmund → Spitzkoppe',
      from: 'Swakopmund', to: 'Spitzkoppe',
      distanceKm: 150, distanceText: '~150 km direkt, mit Abstecher bis ~330 km', driveTime: '~2 Std.', roadType: 'Teer und Schotter',
      sunrise: '06:20', sunset: '19:11',
      accommodationId: 'spitzkoppe', accommodationNote: null,
      landscape: 'granite',
      program: [
        'Mit vollem Wassertank losfahren — an der Spitzkoppe gibt es kein Wasser und keinen Strom.',
        'Der Vormittag ist eine Entscheidung, ihr könnt nur eines davon machen:'
      ],
      options: [
        { title: 'Sandwich Harbour', text: 'geführte 4x4-Halbtagestour ab Walvis Bay, meist 08:00 bis etwa 13:00. Danach direkt weiter, 180 km und 2,5 Std., Ankunft gegen 16:00. Ihr müsst vorher auschecken und mit gepacktem Auto zur Tour.' },
        { title: 'Cape Cross Robbenkolonie', text: 'plus etwa 160 km auf der Salzstraße.' },
        { title: 'Entspannt starten', text: 'kurz zur Lagune von Walvis Bay für die Flamingos, dann früh an der Spitzkoppe sein. Die Plätze werden nicht zugewiesen — wer früh kommt, bekommt den besseren.' }
      ],
      highlights: [
        'Mit vollem Wassertank losfahren.'
      ],
      notes: [
        { level: 'danger', text: 'An der Spitzkoppe gibt es kein Trinkwasser und keinen Strom. Mit vollem Wassertank losfahren.' },
        { level: 'warn', text: 'In Swakopmund oder Usakos volltanken.' },
        { level: 'warn', text: 'Kein Empfang an der Spitzkoppe — Bestätigung vorher offline speichern oder ausdrucken.' },
        { level: 'info', text: 'Plätze werden nicht zugewiesen: wer früh kommt, bekommt den besseren.' }
      ],
      placeIds: ['walvis-lagune', 'sandwich-harbour', 'cape-cross', 'spitzkoppe-massiv'],
      activityIds: ['a-sandwich-harbour', 'a-kajak-pelican'],
      image: null
    },
    {
      id: 'd10', number: 10, date: '2026-10-28', weekday: 'Mittwoch', dateShort: 'Mi 28.10.',
      title: 'Spitzkoppe → Twyfelfontein',
      from: 'Spitzkoppe', to: 'Twyfelfontein',
      distanceKm: 240, distanceText: '~240 km', driveTime: '~3,5 bis 4 Std.', roadType: 'Schotter',
      sunrise: '06:18', sunset: '19:08',
      accommodationId: 'twyfelfontein', accommodationNote: null,
      landscape: 'damaraland',
      program: [
        'Über Uis, dort tanken und Wasser fassen. Unterwegs der Brandberg, Namibias höchster Berg, mit der geführten Wanderung zur White-Lady-Felsmalerei.',
        'Früh losfahren, dann seid ihr gegen Mittag da. Legt die Elefantenfahrt auf diesen Nachmittag — morgen wartet die längste Etappe des Reiseendes.',
        'Nachmittag: Twyfelfontein-Gravuren. Das UNESCO-Welterbe liegt 19 km südlich, Fahrt etwa 25 Minuten, Führung rund eine Stunde. Zeitfenster 13:00 bis 15:30. Das muss heute passieren — morgen ist der Tag durch Exkursion und 355 km voll.',
        'Am Abend alles für morgen vorbereiten und möglichst schon abbauen. Die Elefanten-Exkursion startet um 08:30, danach fahrt ihr direkt weiter.'
      ],
      highlights: [
        'Twyfelfontein-Gravuren am Nachmittag — Zeitfenster 13:00 bis 15:30.'
      ],
      notes: [
        { level: 'danger', text: 'Kein Trinkwasser am Camp. Wasser gibt es nur für Duschen und Toiletten. Mit vollem Tank ankommen.' },
        { level: 'danger', text: 'Solarstrom nur am Bar- und Poolbereich, dort könnt ihr Geräte laden. Nicht geeignet für die Fahrzeugkühlbox — die läuft über die Zweitbatterie, die sich beim Fahren lädt. Zwei Nächte ohne Landstrom sind damit unkritisch. Die Bar schließt um 20:00 Uhr.' },
        { level: 'warn', text: 'In Uis tanken und Wasser fassen.' },
        { level: 'warn', text: 'Am Abend alles für morgen vorbereiten und möglichst schon abbauen.' }
      ],
      placeIds: ['brandberg', 'twyfelfontein-gravuren', 'organ-pipes'],
      activityIds: [],
      image: null
    },
    {
      id: 'd11', number: 11, date: '2026-10-29', weekday: 'Donnerstag', dateShort: 'Do 29.10.',
      title: 'Twyfelfontein → Etosha Safari Camp',
      from: 'Twyfelfontein', to: 'Etosha Safari Camp',
      distanceKm: 350, distanceText: '~350 km', driveTime: '5 bis 6 Std.', roadType: 'Schotter bis Khorixas, dann Teer',
      sunrise: '06:22', sunset: '19:10',
      accommodationId: 'etosha-safari-camp', accommodationNote: null,
      landscape: 'damaraland',
      program: [
        '08:30 bis 11:30: geführte Elefanten-Exkursion, drei Stunden, Wasser inklusive. Zwei ansässige Wüstenelefanten-Herden, eine mit rund 14 Tieren.',
        'Baut vor der Exkursion ab, nicht danach — sonst wird der Tag zu lang. Abfahrt gegen 11:45.',
        'Danach 355 km über Khorixas nach Outjo und auf der C38 nach Norden. Rund 4¼ Stunden Fahrt plus etwa 45 Minuten in Outjo für Einkauf und Tanken — der letzte gut sortierte Supermarkt vor dem Park. Ankunft gegen 16:45 bis 17:30, Sonnenuntergang um 19:10.',
        'Das Camp liegt 10 km südlich des Andersson Gate. Rasenstellplätze mit Schatten und Strom, Pool, Restaurant, Shabeen Bar. Nachts kommen Zebras, Giraffen und Dikdiks bis an die Plätze. Lunchpakete für morgen vorbestellen.'
      ],
      highlights: [
        'Elefanten-Exkursion 08:30 bis 11:30 — der eigentliche Grund für Twyfelfontein.'
      ],
      notes: [
        { level: 'danger', text: 'Vor der Exkursion abbauen, nicht danach. Abfahrt gegen 11:45.' },
        { level: 'warn', text: 'In Outjo einkaufen und tanken, etwa 45 Minuten — letzter guter Supermarkt vor Etosha.' },
        { level: 'warn', text: 'Lunchpakete für den Parktag vorbestellen.' }
      ],
      placeIds: ['twyfelfontein-gravuren', 'organ-pipes'],
      activityIds: ['a-elefanten-exkursion'],
      image: null
    },
    {
      id: 'd12', number: 12, date: '2026-10-30', weekday: 'Freitag', dateShort: 'Fr 30.10.',
      title: 'Andersson Gate → Halali',
      from: 'Etosha Safari Camp', to: 'Halali',
      distanceKm: 95, distanceText: '~95 km im Park', driveTime: 'ganzer Tag im Pirschtempo', roadType: 'Park-Pisten',
      sunrise: '06:17', sunset: '19:03',
      accommodationId: 'halali', accommodationNote: null,
      landscape: 'etosha',
      program: [
        'Parkgebühr am Gate: N$ 620 für zwei plus Fahrzeug, gültig 24 Stunden. Im Park mit durchschnittlich 30 km/h rechnen, Tore schließen bei Sonnenuntergang, Nachtfahren ist verboten.',
        'Legt unbedingt einen Stopp in Okaukuejo ein. Das Camp liegt auf dem Weg, und sein Wasserloch ist das bekannteste Namibias. Übernachten tut ihr dort nicht, tagsüber besuchen könnt ihr es aber.',
        'Abends das beleuchtete Moringa-Wasserloch in Halali, zu Fuß vom Camp erreichbar und oft ruhiger als Okaukuejo.'
      ],
      highlights: [
        'Moringa-Wasserloch am Abend — beleuchtet und zu Fuß erreichbar.'
      ],
      notes: [
        { level: 'danger', text: 'Tore schließen bei Sonnenuntergang. Nachtfahren im Park ist verboten.' },
        { level: 'warn', text: 'Parkgebühr N$ 620, gültig 24 Stunden.' },
        { level: 'info', text: 'Im Park mit durchschnittlich 30 km/h rechnen.' }
      ],
      placeIds: ['okaukuejo', 'moringa'],
      activityIds: [],
      image: null
    },
    {
      id: 'd13', number: 13, date: '2026-10-31', weekday: 'Samstag', dateShort: 'Sa 31.10.',
      title: 'Halali → Onguma',
      from: 'Halali', to: 'Onguma',
      distanceKm: 86, distanceText: '~86 km im Park plus Abstecher', driveTime: 'ganzer Tag', roadType: 'Park-Pisten',
      sunrise: '06:14', sunset: '19:01',
      accommodationId: 'onguma-tamboti', accommodationNote: '1. von 2 Nächten',
      landscape: 'etosha',
      program: [
        'Über den Pfannenrand und Fischer’s Pan nach Osten, unterwegs Namutoni mit dem historischen Fort und dem besten Shop im Park. Vor Sonnenuntergang durch das Von-Lindequist-Tor hinaus.',
        'Die Stellplätze haben eigenes Bad und eigene Toilette, komplett geschlossen gebaut, dazu einen großzügigen Küchenbereich. Am Camp gibt es ein ruhiges Wasserloch.'
      ],
      highlights: [
        'Namutoni Fort und der beste Shop im Park.'
      ],
      notes: [
        { level: 'danger', text: 'Vor Sonnenuntergang durch das Von-Lindequist-Tor hinaus.' },
        { level: 'warn', text: 'Parkgebühr N$ 620 fällig.' }
      ],
      placeIds: ['namutoni'],
      activityIds: ['a-onguma-pirschfahrt'],
      image: null
    },
    {
      id: 'd14', number: 14, date: '2026-11-01', weekday: 'Sonntag', dateShort: 'So 01.11.',
      title: 'Noch ein Tag in Etosha',
      from: 'Onguma', to: 'Onguma',
      distanceKm: 120, distanceText: '~120 km im Park', driveTime: 'ganzer Tag', roadType: 'Park-Pisten',
      sunrise: '06:12', sunset: '18:59',
      accommodationId: 'onguma-tamboti', accommodationNote: '2. von 2 Nächten',
      landscape: 'etosha',
      program: [
        'Morgens wieder durch das Von-Lindequist-Tor hinein, den Tag über im Osten des Parks, abends vor Torschluss hinaus. Neue Parkgebühr fällig. Das Zelt bleibt stehen, kein Umzug.',
        'Alternativ oder ergänzend eine Pirschfahrt auf Ongumas eigenem Reservat: dort gibt es Löwen und Nashörner, und mehrere Gäste berichten, dort mehr gesehen zu haben als im Nationalpark. Vorab online buchbar.'
      ],
      highlights: [
        'Das Zelt bleibt stehen — kein Umzug.'
      ],
      notes: [
        { level: 'warn', text: 'Neue Parkgebühr N$ 620 fällig.' },
        { level: 'info', text: 'Pirschfahrt auf Ongumas eigenem Reservat ist vorab online buchbar.' }
      ],
      placeIds: ['namutoni'],
      activityIds: ['a-onguma-pirschfahrt'],
      image: null
    },
    {
      id: 'd15', number: 15, date: '2026-11-02', weekday: 'Montag', dateShort: 'Mo 02.11.',
      title: 'Onguma → Aloegrove',
      from: 'Onguma', to: 'Aloegrove',
      distanceKm: 282, distanceText: '~282 km', driveTime: '~4 Std.', roadType: 'durchgehend Teer',
      sunrise: '06:11', sunset: '19:00',
      accommodationId: 'aloegrove', accommodationNote: '1. von 2 Nächten',
      landscape: 'waterberg',
      program: [
        'Über Tsumeb, Otavi und Otjiwarongo. In Tsumeb tanken, Vorräte braucht ihr kaum noch — ab hier wird für euch gekocht.',
        'Die Lodge liegt 18 km von Otjiwarongo an der B1 Richtung Otavi, auf einem Hügel mit Blick auf das Waterberg-Massiv. Rezeption 08:00 bis 18:00 Uhr, ihr habt also reichlich Luft.'
      ],
      highlights: [
        'Ab hier wird für euch gekocht.'
      ],
      notes: [
        { level: 'warn', text: 'In Tsumeb tanken.' },
        { level: 'info', text: 'Rezeption 08:00 bis 18:00 Uhr.' }
      ],
      placeIds: ['waterberg'],
      activityIds: [],
      image: null
    },
    {
      id: 'd16', number: 16, date: '2026-11-03', weekday: 'Dienstag', dateShort: 'Di 03.11.',
      title: 'Freier Tag bei Aloegrove',
      from: 'Aloegrove', to: 'Aloegrove',
      distanceKm: 60, distanceText: '~60 km lokal', driveTime: null, roadType: 'Teer',
      sunrise: '06:09', sunset: '19:03',
      accommodationId: 'aloegrove', accommodationNote: '2. von 2 Nächten',
      landscape: 'waterberg',
      program: [
        'Zwei Optionen, beide vorab anmelden:'
      ],
      options: [
        { title: 'Pirschfahrt mit den Eigentümern', text: 'auf dem eigenen Wildgebiet. In Bewertungen werden Leopard, Löwe und Gepard genannt.' },
        { title: 'Cheetah Conservation Fund', text: 'bei Otjiwarongo, von der Lodge vermittelt.' }
      ],
      programAfter: [
        'Dazwischen Pool und Terrasse. Zelt und Ausrüstung heute trocken und sauber verpacken — die nächsten zwei Nächte sind Zimmer, danach kommt die Rückgabe.'
      ],
      highlights: [
        'Zelt und Ausrüstung heute trocken und sauber verpacken.'
      ],
      notes: [
        { level: 'warn', text: 'Beide Aktivitäten vorab anmelden.' },
        { level: 'warn', text: 'Zelt und Ausrüstung trocken und sauber verpacken — danach kommt die Rückgabe.' }
      ],
      placeIds: ['waterberg'],
      activityIds: ['a-aloegrove-pirschfahrt', 'a-ccf'],
      image: null
    },
    {
      id: 'd17', number: 17, date: '2026-11-04', weekday: 'Mittwoch', dateShort: 'Mi 04.11.',
      title: 'Aloegrove → Okapuka',
      from: 'Aloegrove', to: 'Okapuka',
      distanceKm: 299, distanceText: '~299 km', driveTime: '~4 Std.', roadType: 'Teer über Otjiwarongo und Okahandja',
      sunrise: '06:09', sunset: '19:03',
      accommodationId: 'okapuka', accommodationNote: null,
      landscape: 'bushveld',
      program: [
        'Okapuka liegt an der B1 bei Döbra, etwa eine Stunde nördlich von Windhuk, auf einem eigenen Wildreservat mit vier Nashörnern, rund 40 Giraffen, Zebras und Oryx.',
        'Ankunft am frühen Nachmittag, dann Nachmittagstee, Gepäck sortieren und ein gutes Abendessen zum Abschluss. Heute alles endgültig packen.'
      ],
      highlights: [
        'Heute alles endgültig packen.'
      ],
      notes: [
        { level: 'warn', text: 'Heute alles endgültig packen.' }
      ],
      placeIds: [],
      activityIds: [],
      image: null
    },
    {
      id: 'd18', number: 18, date: '2026-11-05', weekday: 'Donnerstag', dateShort: 'Do 05.11.',
      title: 'Okapuka → Flughafen, Abflug 19:00',
      from: 'Okapuka', to: 'Hosea Kutako International Airport',
      distanceKm: 75, distanceText: '~75 km', driveTime: '~1 Std.', roadType: 'Teer',
      sunrise: '06:05', sunset: '19:06',
      accommodationId: null, accommodationNote: 'keine Übernachtung, Heimflug',
      landscape: 'bushveld',
      program: [
        'Von der B1 südlich an Windhuk vorbei auf die Umgehung, dann die B6 nach Osten. Der Flughafen liegt 45 km östlich von Windhuk, ihr müsst nicht in die Stadt.'
      ],
      schedule: [
        { time: '06:30',       step: 'optional Morgenpirschfahrt auf dem Gelände, ca. 2 Std., rund N$ 960 p. P.' },
        { time: '09:00',       step: 'Frühstück' },
        { time: '10:00',       step: 'Check-out' },
        { time: '14:00',       step: 'Abfahrt' },
        { time: '~14:45',      step: 'Volltanken kurz vor dem Flughafen' },
        { time: '15:15–15:45', step: 'Fahrzeugrückgabe' },
        { time: '~16:00',      step: 'Check-in, 3 Std. vor Abflug' },
        { time: '19:00',       step: 'Abflug' }
      ],
      highlights: [
        'Der Flughafen liegt 45 km östlich von Windhuk — nicht in die Stadt.'
      ],
      notes: [
        { level: 'danger', text: 'Falls die Rückgabe in Windhuk statt am Flughafen ist: Hinweg, Rückweg und Shuttle kosten etwa 1,5 Stunden zusätzlich. Fahrt dann gegen 12:00 los.' },
        { level: 'warn', text: 'Volltanken kurz vor dem Flughafen, gegen 14:45.' }
      ],
      placeIds: [],
      activityIds: ['a-okapuka-pirschfahrt'],
      image: null
    }
  ],

  /* ---------------------------------------------------------------------
     4. UNTERKÜNFTE — 14 Stationen (Abschnitt 4)
     drinkingWater / powerAtSite steuern die großen Warnhinweise.
  --------------------------------------------------------------------- */
  accommodations: [
    {
      id: 'kalahari-anib', name: 'Kalahari Anib Lodge', type: 'Zimmer',
      dayNumbers: [1], dateFrom: '2026-10-19', dateTo: '2026-10-20', dateText: '19.–20.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: 'Gondwana Collection',
      lat: -24.4262, lon: 18.1017,
      phone: '+264 61 427 200', email: null, reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, Betrag nachtragen',
      rating: '4,0 / 5 bei über 1.360 Bewertungen',
      intro: 'Rund 30 km nordöstlich von Mariental in den roten Dünen des Gondwana Kalahari Parks.',
      details: [
        { label: 'Zimmer', text: 'über 50 Einheiten, 32 Standard und 19 Komfort. Klimaanlage und Heizung, eigene Veranda, En-suite-Bad mit Dusche und Föhn, Kaffee- und Teezubereitung, Safe, Schreibtisch.' },
        { label: 'Anlage', text: 'zwei Pools, Restaurant, Bar, offene Feuerstelle, Shop, WLAN in der Lobby, Wäscheservice.' },
        { label: 'Zeiten', text: 'Check-in 14:00–20:00, Check-out bis 10:00. Frühstücksbuffet 07:00–09:00.' },
        { label: 'Verpflegung', text: 'buchbar mit Frühstück oder als Halbpension — prüft eure Bestätigung, davon hängt der Einkauf in Windhuk ab.' },
        { label: 'Aktivitäten', text: 'Sundowner-Drive in die Dünen (wird durchgehend als Höhepunkt genannt), morgendliche Dünenwanderung, Pirschfahrten, Wanderwege, E-Bikes.' },
        { label: 'Bewertung', text: '4,0 / 5 bei über 1.360 Bewertungen. Vegetarische Auswahl wird als knapp beschrieben.' }
      ],
      notes: [
        { level: 'info', text: 'Die Lodge bittet um Angabe der voraussichtlichen Ankunftszeit.' }
      ],
      image: null
    },
    {
      id: 'stellies', name: 'Stellies Accommodation', type: 'Zimmer',
      dayNumbers: [2], dateFrom: '2026-10-20', dateTo: '2026-10-21', dateText: '20.–21.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: null,
      lat: -26.5766, lon: 18.1241,
      address: '12th Street 167, Westdene, Keetmanshoop',
      phone: '+264 81 222 6545', email: null, reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, N$ 900',
      rating: null,
      intro: 'Kleine Selbstversorger-Unterkunft im Stadtteil Westdene, mitten in Keetmanshoop. Gebucht ist Room 3.',
      details: [
        { label: 'Zimmer', text: 'Room 3: Apartment mit Klimaanlage, separatem Schlafzimmer, eigenem Bad und ausgestatteter Küche (laut Buchungsportalen).' },
        { label: 'Anlage', text: 'Selbstverpflegung, sicherer Parkplatz, WLAN, Braai. Trinkwasser wird laut Anbieter bereitgestellt.' },
        { label: 'Lage', text: 'nahe Museum und Stadion. Die Koordinaten zeigen auf die 12th Street, nicht genau auf das Haus.' },
        { label: 'Buchung', text: 'direkt über die Webseite des Anbieters gebucht.' },
        { label: 'Preis', text: 'bezahlt, N$ 900.' }
      ],
      notes: [
        { level: 'info', text: 'Laut Gästebewertungen gibt es Self-Check-in. Ankunftszeit trotzdem vorher mit dem Gastgeber abstimmen.' }
      ],
      image: null
    },
    {
      id: 'canyon-roadhouse', name: 'Canyon Roadhouse Campsite', type: 'Dachzelt',
      dayNumbers: [3], dateFrom: '2026-10-21', dateTo: '2026-10-22', dateText: '21.–22.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: 'Gondwana Collection',
      lat: -27.5243, lon: 17.8148,
      phone: '+264 61 427 200', email: null, reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, etwa N$ 680–700 für zwei',
      rating: '4,6 / 5 bei über 1.300 Bewertungen',
      intro: 'Am Trockenflussbett hinter dem Haupthaus, im Schatten von Dornenbäumen. Das Haupthaus ist als Autowerkstatt und Oldtimermuseum eingerichtet, mit Restauranttischen zwischen den Fahrzeugen.',
      details: [
        { label: 'Ausstattung', text: '12 Stellplätze, Strom, Licht, heißes und kaltes Wasser, Braai, Schatten. Sehr saubere Gemeinschaftssanitäranlagen. Feuerholz an der Rezeption.' },
        { label: 'Praktisch wertvoll', text: 'Tankstelle am Platz, Reifenreparatur, Geldautomat, Kartenzahlung, Wäscheservice.' },
        { label: 'Was fehlt', text: 'kein Lebensmittelladen, nur Souvenirs und Bücher. Staubig und bei Regen ungeschützt.' },
        { label: 'Lage zum Canyon', text: '14 km zum Hobas-Tor, dann etwa 10 km weiter zum Main Viewpoint — rund 25 km und 25 bis 30 Minuten pro Richtung.' },
        { label: 'Aktivitäten', text: 'markierter Wanderweg 2 bis 3 Std., Selbstfahrer-Route durch den Gondwana Canyon Park.' },
        { label: 'Bewertung', text: '4,6 / 5 bei über 1.300 Bewertungen.' },
        { label: 'Preis', text: 'bezahlt, etwa N$ 680–700 für zwei.' }
      ],
      notes: [
        { level: 'warn', text: 'Kein Lebensmittelladen — der Einkauf in Keetmanshoop muss Tag 3 und 4 abdecken.' },
        { level: 'info', text: 'Check-in 14:00 bis 19:00 Uhr.' }
      ],
      image: null
    },
    {
      id: 'klein-aus-vista', name: 'Klein-Aus Vista Desert Horse Campsite', type: 'Dachzelt',
      dayNumbers: [4, 5], dateFrom: '2026-10-22', dateTo: '2026-10-24', dateText: '22.–24.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: 'Gondwana Collection',
      lat: -26.6555, lon: 16.2343,
      phone: '+264 61 427 200', email: null, reference: null,
      drinkingWater: true, powerAtSite: false,
      powerNote: 'Laden an der Rezeption des Desert Horse Inn, etwa 1,5 km entfernt.',
      price: 'bezahlt, etwa N$ 500–520 pro Nacht für zwei',
      rating: null,
      intro: 'Riesige Kameldornbäume voller Webervogelnester, Stellplätze zwischen Granitfelsen. Basis für Lüderitz, Kolmanskop und die Wildpferde.',
      details: [
        { label: 'Ausstattung', text: '10 windgeschützte Plätze mit Tisch, Bank und Grill, gemeinsame Sanitäranlagen mit Warmwasser.' },
        { label: 'Trinkwasser', text: 'ja, Hahn am Platz.' },
        { label: 'Strom', text: 'Kein Strom am Stellplatz — laden an der Rezeption des Desert Horse Inn, etwa 1,5 km entfernt.' },
        { label: 'Preis', text: 'bezahlt, etwa N$ 500–520 pro Nacht für zwei.' }
      ],
      notes: [],
      image: null
    },
    {
      id: 'sesriem', name: 'Sesriem Campsite', type: 'Dachzelt',
      dayNumbers: [6], dateFrom: '2026-10-24', dateTo: '2026-10-25', dateText: '24.–25.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: 'Namibia Wildlife Resorts',
      lat: -24.4863, lon: 15.7991,
      phone: null, email: 'reservations@nwr.com.na', reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'N$ 670 pro Person, für zwei N$ 1.340 — bezahlt',
      rating: null,
      intro: 'Das einzige Camp innerhalb des Tores. Nur von hier kommt man etwa eine Stunde vor Sonnenaufgang durch das Innentor. 44 weit auseinanderliegende Plätze im Schatten alter Kameldornbäume.',
      details: [
        { label: 'Ausstattung', text: 'Strom, Braai, Wasserhahn, gemeinsame und eher betagte Sanitäranlagen, kleiner Pool, Bar, Restaurant, Shop, Engen-Tankstelle nebenan.' },
        { label: 'Trinkwasser', text: 'ja.' },
        { label: 'Preis', text: 'N$ 670 pro Person, für zwei N$ 1.340 — bezahlt.' }
      ],
      notes: [
        { level: 'warn', text: 'Weil es nur eine Nacht ist, muss am Morgen des 25.10. vor der Abfahrt komplett abgebaut werden.' }
      ],
      image: null
    },
    {
      id: 'namib-desert', name: 'Namib Desert Campsite', type: 'Dachzelt',
      dayNumbers: [7], dateFrom: '2026-10-25', dateTo: '2026-10-26', dateText: '25.–26.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: 'Gondwana Collection',
      lat: -24.1256, lon: 15.9550,
      phone: '+264 61 427 200', email: null, reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, etwa N$ 650 für zwei',
      rating: null,
      intro: 'Rund 60 km nördlich von Sesriem an der C19, in einer privaten Konzession vor den versteinerten Ur-Dünen der Namib.',
      details: [
        { label: 'Ausstattung', text: 'drei getrennte Campbereiche. Jeder Stellplatz mit Strom, Wasseranschluss, Lampe und eigener Grillstelle; Dusch- und WC-Häuschen wird im Bereich geteilt. Heißes und kaltes Wasser, Abwaschbereich.' },
        { label: 'Besonders gelobt', text: 'die Sanitäranlagen — kräftiges Warmwasser, penibel sauber. Dazu Stille und großartiger Sternenhimmel. Warzenschweine, Oryx und Gnus am Tag, Schakale nachts.' },
        { label: 'An der Lodge, 5 km entfernt', text: 'Restaurant, Bar, Pools, WLAN, Wäscheservice. Abendbuffet etwa N$ 400 p. P., vorher anmelden.' },
        { label: 'Zu beachten', text: 'der Platz liegt nah an der C19, Verkehr ist hörbar. Um einen Platz weiter weg von der Straße bitten, Ohrstöpsel einpacken. Frühstück nicht inklusive.' },
        { label: 'Aktivitäten', text: 'Wanderwege auf die versteinerten Dünen, geführte Naturfahrten ab etwa N$ 785 p. P.' },
        { label: 'Preis', text: 'bezahlt, etwa N$ 650 für zwei.' }
      ],
      notes: [
        { level: 'info', text: 'Frühstück nicht inklusive. Abendbuffet vorher anmelden.' }
      ],
      image: null
    },
    {
      id: 'tiger-reef', name: 'Tiger Reef Campsite', type: 'Dachzelt',
      dayNumbers: [8], dateFrom: '2026-10-26', dateTo: '2026-10-27', dateText: '26.–27.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: null,
      lat: -22.6868, lon: 14.5237,
      phone: null, email: null, reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, etwa N$ 500 für zwei',
      rating: null,
      intro: 'An der Swakop-Mündung, zu Fuß in die Stadt.',
      details: [
        { label: 'Ausstattung', text: 'Strom, Wasser, Braai, gemeinsame Sanitäranlagen, Bar und Restaurant, WLAN, Kartenzahlung, 24-Stunden-Security.' },
        { label: 'Trinkwasser', text: 'ja, Stadtwasser.' },
        { label: 'Preis', text: 'bezahlt, etwa N$ 500 für zwei.' }
      ],
      notes: [
        { level: 'warn', text: 'Nur eine Nacht — Großeinkauf und Geräte laden am Ankunftsnachmittag.' }
      ],
      image: null
    },
    {
      id: 'spitzkoppe', name: 'Spitzkoppe Community Rest Camp', type: 'Dachzelt',
      dayNumbers: [9], dateFrom: '2026-10-27', dateTo: '2026-10-28', dateText: '27.–28.10.',
      status: 'paid', statusText: 'gebucht und bezahlt, Endbestätigung liegt vor', group: null,
      lat: -21.8395, lon: 15.2016,
      phone: null, email: null, contact: 'Tamara',
      reference: 'SPI-260807-006', ownReference: 'Schrade',
      drinkingWater: false, powerAtSite: false,
      price: 'N$ 600 bezahlt',
      rating: null,
      intro: 'Das „Matterhorn Namibias". Weit verstreute Wildnis-Stellplätze zwischen Granitfelsen, bester Sternenhimmel der Reise.',
      details: [
        { label: 'Ausstattung', text: 'sehr einfach. Plumpsklo und Feuerstelle am Platz, Duschen und Toiletten nur an der Rezeption. Kein Strom. Eintritt im Preis enthalten.' },
        { label: 'Trinkwasser', text: 'nein. Mit vollem Tank ankommen.' },
        { label: 'Platzwahl', text: 'wird nicht zugewiesen, früh ankommen lohnt sich.' },
        { label: 'Preis', text: 'N$ 600 bezahlt. Das liegt über der Richtwertschätzung von N$ 440 — noch zu klären, ob damit Camping und Eintritt für beide abgedeckt sind oder vor Ort noch etwas fällig wird.' }
      ],
      notes: [
        { level: 'info', text: 'Reservierung nur per Mail. Die endgültige Bestätigung liegt vor.' },
        { level: 'danger', text: 'Bestätigung ausdrucken und offline speichern — an der Spitzkoppe gibt es keinen Empfang.' }
      ],
      image: null
    },
    {
      id: 'twyfelfontein', name: 'Twyfelfontein Elephant Drives & Campsite', type: 'Dachzelt',
      dayNumbers: [10], dateFrom: '2026-10-28', dateTo: '2026-10-29', dateText: '28.–29.10.',
      status: 'booked', statusText: 'fest gebucht, 20 % Anzahlung bezahlt, Rest bei Ankunft', group: null,
      lat: -20.4268, lon: 14.3421,
      phone: '+264 81 399 3815', email: null, contact: 'Sondela',
      reception: '08:00–18:00', reference: null,
      drinkingWater: false, powerAtSite: false,
      powerNote: 'Solarstrom nur im Bar- und Poolbereich zum Laden von Geräten, nicht für die Fahrzeugkühlbox geeignet. Die Bar schließt um 20:00 Uhr.',
      price: 'N$ 550 pro Person, für zwei N$ 1.100 pro Nacht',
      rating: '4,9 / 5 bei über 330 Bewertungen',
      intro: 'Mit 4,9 / 5 bei über 330 Bewertungen der bestbewertete Platz der Route. Neu gebaut, große private Stellplätze mit weitem Blick, sehr saubere Sanitäranlagen, Pool mit Bar, nachts ein Sicherheitsposten. Das Personal wird durchgehend gelobt.',
      details: [
        { label: 'Die Elefantenfahrt', text: 'ist der eigentliche Grund hierher zu fahren. Zwei ansässige Wüstenelefanten-Herden, eine mit rund 14 Tieren. Gäste berichten von fast zwei Stunden dicht bei den Tieren, dazu Giraffen, Springböcke, Oryx, Strauße. Offenbar wird auch Nashorn-Tracking angeboten.' },
        { label: 'Preis', text: 'N$ 550 pro Person, für zwei N$ 1.100 pro Nacht.' },
        { label: 'Trinkwasser', text: 'nein. Wasser nur für Duschen und Toiletten. Mit vollem Tank ankommen.' },
        { label: 'Strom', text: 'Solarstrom nur im Bar- und Poolbereich zum Laden von Geräten, nicht für die Fahrzeugkühlbox geeignet. Die Bar schließt um 20:00 Uhr.' },
        { label: 'Elefanten-Exkursion', text: 'geführt, zweimal täglich um 08:30 und 14:00, Dauer 3 Stunden, N$ 1.100 pro Person inklusive einer Flasche Wasser. Gebucht ist die Morgenfahrt am 29.10.' },
        { label: 'Zahlung', text: '20 % nicht rückzahlbare Anzahlung zur Reservierung, Rest bei Ankunft. Bei N$ 3.300 Gesamtsumme sind das N$ 660 — bezahlt, die Buchung ist damit fest. Der Rest von N$ 2.640 ist am 28.10. vor Ort fällig.' },
        { label: 'Lage', text: 'an der D2612, etwa 18 km nördlich des Twyfelfontein-Besucherzentrums.' }
      ],
      notes: [
        { level: 'warn', text: 'Restbetrag N$ 2.640 bei Ankunft am 28.10. vor Ort fällig. Bargeld oder Karte bereithalten.' },
        { level: 'info', text: 'Fest gebucht. Die 20 % Anzahlung von N$ 660 ist bezahlt.' }
      ],
      image: null
    },
    {
      id: 'etosha-safari-camp', name: 'Etosha Safari Camp', type: 'Dachzelt',
      dayNumbers: [11], dateFrom: '2026-10-29', dateTo: '2026-10-30', dateText: '29.–30.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: 'Gondwana Collection',
      lat: -19.4112, lon: 15.9243,
      phone: '+264 61 427 200', email: null, reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, etwa N$ 600 für zwei',
      rating: '4,5 / 5 bei über 930 Bewertungen',
      intro: '10 km südlich des Andersson Gate an der C38. Bewertung 4,5 / 5 bei über 930 Bewertungen.',
      details: [
        { label: 'Ausstattung', text: 'Rasenstellplätze mit Schatten, Strom, Braai, Abwasch- und Waschbereiche.' },
        { label: 'Anlage', text: 'Pool, Restaurant auf dem Hügel, Shabeen Bar im Township-Stil. Nachts kommen Zebras, Giraffen und Dikdiks bis an die Plätze.' },
        { label: 'Tipp', text: 'Lunchpakete für den Parktag vorbestellen, die werden ausdrücklich gelobt.' },
        { label: 'Kritik aus Bewertungen', text: 'im Notfall waren die angegebenen Telefonnummern nicht erreichbar, und der Mittagsservice im Restaurant ist langsam.' },
        { label: 'Preis', text: 'bezahlt, etwa N$ 600 für zwei.' }
      ],
      notes: [
        { level: 'warn', text: 'Im Notfall waren die angegebenen Telefonnummern laut Bewertungen nicht erreichbar.' }
      ],
      image: null
    },
    {
      id: 'halali', name: 'Halali Camp', type: 'Dachzelt',
      dayNumbers: [12], dateFrom: '2026-10-30', dateTo: '2026-10-31', dateText: '30.–31.10.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: 'Namibia Wildlife Resorts',
      lat: -19.0362, lon: 16.4697,
      phone: null, email: 'reservations@nwr.com.na', reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'N$ 460 pro Person in der Novembersaison, für zwei N$ 920 — bezahlt',
      rating: null,
      intro: 'Zentral im Etosha-Nationalpark.',
      details: [
        { label: 'Ausstattung', text: 'Strom, Braai, Wasserhahn am Platz, gemeinsame Sanitäranlagen, Restaurant, Shop, Pool, Tankstelle, Mopane-Schatten.' },
        { label: 'Der Grund hierher zu gehen', text: 'das beleuchtete Moringa-Wasserloch, zu Fuß erreichbar und abends oft ruhiger als Okaukuejo.' },
        { label: 'Trinkwasser', text: 'ja.' },
        { label: 'Preis', text: 'N$ 460 pro Person in der Novembersaison, für zwei N$ 920 — bezahlt. Für den 30.10. greift eventuell noch der Oktoberpreis von N$ 550.' }
      ],
      notes: [
        { level: 'info', text: 'Für den 30.10. greift eventuell noch der Oktoberpreis von N$ 550.' }
      ],
      image: null
    },
    {
      id: 'onguma-tamboti', name: 'Onguma Tamboti Campsite', type: 'Dachzelt',
      dayNumbers: [13, 14], dateFrom: '2026-10-31', dateTo: '2026-11-02', dateText: '31.10.–02.11.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: null,
      lat: -18.8034, lon: 17.0458,
      phone: '+264 61 237 055', email: null, reference: null,
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, etwa N$ 1.800 für zwei Nächte',
      rating: '4,8 / 5 bei 368 Bewertungen',
      intro: 'Privates Reservat direkt am Von-Lindequist-Tor an der Ostseite von Etosha. 4,8 / 5 bei 368 Bewertungen.',
      details: [
        { label: 'Ausstattung', text: 'private Stellplätze mit eigenem Bad und separater Toilette, beides vollständig geschlossen gebaut. Großzügiger Küchenbereich mit Spüle und einem zweiten Waschbecken für Wäsche, Feuerlöscher, viel Baumschatten.' },
        { label: 'Anlage', text: 'ruhiges Wasserloch am Camp, Pool, Restaurant.' },
        { label: 'Aktivitäten', text: 'vorab online buchbar, die Reservierung antwortet laut Bewertungen sehr schnell per Mail. Auf dem eigenen Reservat gibt es Löwen und Nashörner.' },
        { label: 'Einschränkungen', text: 'die Qualität der Pirschfahrten schwankt mit dem Guide. Der Warmwasserboiler ist knapp bemessen — nach zwei Duschen dauert es, bis wieder heißes Wasser für den Abwasch da ist.' },
        { label: 'Preis', text: 'bezahlt, etwa N$ 1.800 für zwei Nächte.' }
      ],
      notes: [
        { level: 'info', text: 'Warmwasserboiler knapp bemessen — nach zwei Duschen dauert es, bis wieder heißes Wasser da ist.' }
      ],
      image: null
    },
    {
      id: 'aloegrove', name: 'Aloegrove Safari Lodge', type: 'Zimmer',
      dayNumbers: [15, 16], dateFrom: '2026-11-02', dateTo: '2026-11-04', dateText: '02.–04.11.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: null,
      lat: -20.3841, lon: 16.9163,
      phone: null, email: null, reference: null,
      reception: '08:00–18:00',
      address: 'Farm Aloegrove 360, 18 km auf der B1 von Otjiwarongo Richtung Otavi',
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, Betrag nachtragen',
      rating: '4,8 / 5 bei 95 Bewertungen',
      intro: 'Familiengeführt, wenige Zimmer, auf einem Hügel mit weitem Blick auf das Waterberg-Massiv, das rund 37 km entfernt liegt. 4,8 / 5 bei 95 Bewertungen.',
      details: [
        { label: 'Zimmer', text: 'individuell, mit eigener Terrasse, geräumig, sauber, gut ausgestattet, gute Dusche. Ein Gast schreibt vom „besten Blick, den ich je aus einem Badezimmer hatte".' },
        { label: 'Aktivitäten', text: 'Pirschfahrt mit den Eigentümern auf dem eigenen Wildgebiet — genannt werden Leopard, Löwe und Gepard, dazu viel Erklärung zu Naturschutz und Farmleben. Die Gastgeber vermitteln Besuche beim Cheetah Conservation Fund in Otjiwarongo.' },
        { label: 'Verpflegung', text: 'Abendessen und Frühstück werden durchgehend gelobt. Ob Abendessen im Booking-Tarif enthalten ist, muss noch geklärt werden.' },
        { label: 'Einschränkungen', text: 'Ausstattung und Mobiliar sind laut einem Gast „nicht Spitzenqualität" — sauber und geräumig, aber kein Designhotel. Ein Gast störte sich an den Uniformen des Personals.' },
        { label: 'Zahlung', text: 'über den Link der Lodge erledigt und bezahlt. Zahlungsbeleg offline speichern und bei der Ankunft griffbereit haben.' }
      ],
      notes: [
        { level: 'info', text: 'Über den Link der Lodge bezahlt. Zahlungsbeleg offline speichern — auf der Farm ist nicht auf Netz zu zählen.' },
        { level: 'warn', text: 'Ob Abendessen im Booking-Tarif enthalten ist, muss noch geklärt werden — auf der Farm könnt ihr nicht ausweichen.' }
      ],
      image: null
    },
    {
      id: 'okapuka', name: 'Okapuka Safari Lodge', type: 'Zimmer',
      dayNumbers: [17], dateFrom: '2026-11-04', dateTo: '2026-11-05', dateText: '04.–05.11.',
      status: 'paid', statusText: 'gebucht und bezahlt', group: null,
      lat: -22.3029, lon: 17.0658,
      phone: '+264 83 370 7400', email: null, reference: null,
      address: 'B1 Döbra, etwa eine Stunde nördlich von Windhuk',
      drinkingWater: true, powerAtSite: true,
      price: 'bezahlt, Betrag nachtragen',
      rating: '4,3 / 5 bei über 840 Bewertungen',
      intro: 'Nur rund 75 km vom Flughafen — deshalb die richtige letzte Station. Eigenes Wildreservat mit vier Nashörnern, rund 40 Giraffen, Zebras, Oryx und Gnus. 4,3 / 5 bei über 840 Bewertungen.',
      details: [
        { label: 'Anlage', text: 'geräumige, gepflegte Zimmer, WLAN auf dem ganzen Gelände, kleiner Shop, kostenloser Nachmittagstee, gutes Abendessen.' },
        { label: 'Pirschfahrt', text: 'etwa 2 Stunden, rund N$ 960 p. P. Passt auf den Vormittag des Abflugtags. Am besten vorab reservieren.' }
      ],
      notes: [
        { level: 'warn', text: 'Vorab bestätigte Sonderwünsche beim Essen, etwa vegane Gerichte, waren laut einer Bewertung nicht verfügbar. Bei der Ankunft ansprechen.' }
      ],
      image: null
    }
  ],

  /* ---------------------------------------------------------------------
     5. SEHENSWÜRDIGKEITEN UND ORTE (Abschnitt 5)
  --------------------------------------------------------------------- */
  places: [
    { id: 'fish-river-viewpoint',  name: 'Fish River Canyon Main Viewpoint',  dayNumbers: [3, 4],   dayText: '3–4',     lat: -27.5892, lon: 17.6146, description: 'zweitgrößter Canyon der Welt, beste Stimmung ab 17:00' },
    { id: 'hobas-gate',            name: 'Hobas-Tor',                         dayNumbers: [3, 4],   dayText: '3–4',     lat: -27.6203, lon: 17.7150, description: 'hier wird die Parkgebühr bezahlt' },
    { id: 'garub',                 name: 'Garub Wildpferde',                  dayNumbers: [5],      dayText: '5',       lat: -26.5948, lon: 16.0757, description: 'Wasserloch mit Beobachtungshütte, ~1 km von der B4' },
    { id: 'kolmanskop',            name: 'Kolmanskop',                        dayNumbers: [5],      dayText: '5',       lat: -26.7024, lon: 15.2315, description: 'Diamanten-Geisterstadt, Führung 9:30, Permit am Gate' },
    { id: 'luederitz',             name: 'Lüderitz',                          dayNumbers: [5],      dayText: '5',       lat: -26.6477, lon: 15.1518, description: 'Küstenstadt, Austern, Spar, Diaz Point, sehr windig' },
    { id: 'sesriem-canyon',        name: 'Sesriem Canyon',                    dayNumbers: [6],      dayText: '6',       lat: -24.4863, lon: 15.7991, description: '4 km vom Camp, 30–45 Minuten' },
    { id: 'elim-dune',             name: 'Elim Dune',                         dayNumbers: [6],      dayText: '6',       lat: -24.4863, lon: 15.7991, description: '~5 km ins Tor, Sonnenuntergangsziel' },
    { id: 'dune45',                name: 'Dune 45',                           dayNumbers: [7],      dayText: '7',       lat: -24.7278, lon: 15.4726, description: '45 km ab Tor, Aufstieg ~30 Min., Sonnenaufgangsziel' },
    { id: 'deadvlei',              name: 'Deadvlei und Big Daddy',            dayNumbers: [7],      dayText: '7',       lat: -24.7593, lon: 15.2924, description: 'letzte 5 km tiefer Sand, ab 4x4-Parkplatz 15 Min. Fußweg' },
    { id: 'solitaire',             name: 'Solitaire',                         dayNumbers: [8],      dayText: '8',       lat: -23.8935, lon: 16.0054, description: 'Apfelkuchen, Oldtimer, letzte Tankstelle bis Walvis Bay' },
    { id: 'walvis-lagune',         name: 'Walvis Bay Lagune',                 dayNumbers: [9],      dayText: '9',       lat: -22.9734, lon: 14.4786, description: 'tausende Flamingos, freier Zugang an der Promenade' },
    { id: 'sandwich-harbour',      name: 'Sandwich Harbour',                  dayNumbers: [9],      dayText: '9',       lat: -23.3571, lon: 14.4987, description: 'nur als geführte Tour, Eigenfahrt vertraglich verboten' },
    { id: 'cape-cross',            name: 'Cape Cross',                        dayNumbers: [9],      dayText: '9',       lat: -21.7717, lon: 13.9524, description: 'bis zu 200.000 Robben, Geruch ist heftig' },
    { id: 'spitzkoppe-massiv',     name: 'Spitzkoppe',                        dayNumbers: [9],      dayText: '9',       lat: -21.8395, lon: 15.2016, description: 'Granitmassiv, Felsbogen, bester Sternenhimmel' },
    { id: 'brandberg',             name: 'Brandberg White Lady',              dayNumbers: [10],     dayText: '10',      lat: -21.0221, lon: 14.6830, description: 'geführte Wanderung ~3 Std. zur Felsmalerei' },
    { id: 'twyfelfontein-gravuren', name: 'Twyfelfontein Gravuren',           dayNumbers: [10, 11], dayText: '10 oder 11', lat: -20.5905, lon: 14.3720, description: 'UNESCO-Welterbe, über 2.000 Gravuren, nur mit Guide, ~1 Std., 19 km vom Camp' },
    { id: 'organ-pipes',           name: 'Organ Pipes',                       dayNumbers: [10, 11], dayText: '10 oder 11', lat: -20.6128, lon: 14.4161, description: 'Basaltsäulen im Trockenflussbett, kurzer Stopp, daneben Burnt Mountain' },
    { id: 'okaukuejo',             name: 'Okaukuejo Wasserloch',              dayNumbers: [12],     dayText: '12',      lat: -19.1815, lon: 15.9172, description: 'bekanntestes Wasserloch Namibias, Tagesbesuch möglich' },
    { id: 'moringa',               name: 'Moringa-Wasserloch Halali',         dayNumbers: [12],     dayText: '12',      lat: -19.0362, lon: 16.4697, description: 'beleuchtet, zu Fuß vom Camp, oft ruhiger' },
    { id: 'namutoni',              name: 'Namutoni Fort',                     dayNumbers: [13],     dayText: '13',      lat: -18.8055, lon: 16.9417, description: 'historisches deutsches Fort, bester Shop im Park' },
    { id: 'waterberg',             name: 'Waterberg-Massiv',                  dayNumbers: [15, 16], dayText: '15–16',   lat: -20.5164, lon: 17.2453, description: 'vom Aloegrove-Hügel aus im Blick, ~37 km entfernt' }
  ],

  /* ---------------------------------------------------------------------
     6. AKTIVITÄTEN (Abschnitt 6)
     bookAhead: true = vorab zu buchen
  --------------------------------------------------------------------- */
  activities: [
    { id: 'a-sandwich-harbour',   name: 'Sandwich Harbour 4x4-Tour',            dayNumbers: [9],      dayText: '9 · 27.10.',            bookAhead: true,  price: '~N$ 2.600–2.750 p. P.', note: 'Halbtag, ab Walvis Bay, 1–2 Monate vorher buchen. Noch nicht entschieden.' },
    { id: 'a-elefanten-exkursion', name: 'Elefanten-Exkursion Twyfelfontein',   dayNumbers: [11],     dayText: '11 · 29.10. um 08:30',  bookAhead: true,  price: 'N$ 1.100 p. P.',        note: '3 Std., Wasser inklusive. Danach direkt weiter nach Etosha, Abfahrt 11:45.' },
    { id: 'a-aloegrove-pirschfahrt', name: 'Aloegrove Pirschfahrt',             dayNumbers: [16],     dayText: '16 · 03.11.',           bookAhead: true,  price: 'vor Ort erfragen',      note: 'mit den Eigentümern, Leopard, Löwe, Gepard.' },
    { id: 'a-ccf',                name: 'Cheetah Conservation Fund',            dayNumbers: [16],     dayText: '16 · 03.11.',           bookAhead: true,  price: 'vor Ort erfragen',      note: 'über die Lodge vermittelt, braucht Vorlauf.' },
    { id: 'a-okapuka-pirschfahrt', name: 'Okapuka Pirschfahrt',                 dayNumbers: [18],     dayText: '18 · 05.11. vormittags', bookAhead: true, price: '~N$ 960 p. P.',         note: 'ca. 2 Std., passt vor den Abflug.' },

    { id: 'a-sundowner-kalahari', name: 'Sundowner-Drive Kalahari',             dayNumbers: [1],      dayText: '1',        bookAhead: false, price: null, note: 'kurz, ihr müsst nicht selbst fahren — ideal für den Ankunftsabend.' },
    { id: 'a-kolmanskop-fuehrung', name: 'Kolmanskop-Führung',                  dayNumbers: [5],      dayText: '5',        bookAhead: false, price: null, note: '9:30, morgens bestes Fotolicht.' },
    { id: 'a-wanderweg-roadhouse', name: 'Wanderweg Canyon Roadhouse',          dayNumbers: [3, 4],   dayText: '3–4',      bookAhead: false, price: null, note: 'markiert, 2 bis 3 Stunden.' },
    { id: 'a-naturfahrt-gondwana', name: 'Naturfahrt Gondwana Namib Park',      dayNumbers: [7],      dayText: '7',        bookAhead: false, price: 'ab ~N$ 785 p. P.', note: null },
    { id: 'a-wanderung-urduenen', name: 'Wanderung versteinerte Dünen',         dayNumbers: [7],      dayText: '7',        bookAhead: false, price: null, note: 'ab dem Lodge-Gelände, 5 km vom Camp.' },
    { id: 'a-living-desert',      name: 'Living Desert Tour Swakopmund',        dayNumbers: [8, 9],   dayText: '8–9',      bookAhead: false, price: null, note: '1 bis 3 Tage vorher buchen.' },
    { id: 'a-scenic-flight',      name: 'Scenic Flight Sossusvlei oder Skeleton Coast', dayNumbers: [8, 9], dayText: '8–9', bookAhead: false, price: null, note: 'ab Swakopmund, begrenzte Plätze.' },
    { id: 'a-kajak-pelican',      name: 'Kajaktour Pelican Point',              dayNumbers: [9],      dayText: '9',        bookAhead: false, price: null, note: 'ab Walvis Bay.' },
    { id: 'a-onguma-pirschfahrt', name: 'Onguma Pirschfahrt eigenes Reservat',  dayNumbers: [13, 14], dayText: '13–14',    bookAhead: false, price: null, note: 'Löwen und Nashörner, online vorbuchbar.' }
  ],

  /* ---------------------------------------------------------------------
     7.–12. QUERSCHNITTSINHALTE — Ansicht „Infos"
  --------------------------------------------------------------------- */
  info: [

    /* ---- 7. Versorgung: Einkauf ---- */
    {
      id: 'shopping', title: 'Versorgung und Einkauf', icon: 'cart',
      table: {
        head: ['Ort', 'Tag', 'Was'],
        rows: [
          ['Windhuk',        '1',     'Großeinkauf 3–4 Tage, Gaskartuschen, Feuerholz, Bargeld'],
          ['Keetmanshoop',   '2',     'Spar, Shoprite, OK. Muss Tag 3 und 4 abdecken, das Canyon Roadhouse hat keinen Laden'],
          ['Lüderitz',       '5',     'Spar für den Küstentag'],
          ['Swakopmund',     '8',     'Wichtigster Stopp. Woermann Brock, Spar, Pick n Pay. Vorrat, Wasser, Eis. Nur ein Nachmittag Zeit'],
          ['Uis / Khorixas', '10–11', 'klein, Wasser fassen'],
          ['Outjo',          '11',    'letzter guter Supermarkt vor Etosha'],
          ['Tsumeb',         '15',    'klein, ab hier wird für euch gekocht']
        ],
        emphasizeRows: [0, 1, 3, 5]
      }
    },

    /* ---- 7. Versorgung: Trinkwasser ---- */
    {
      id: 'water', title: 'Trinkwasser', icon: 'drop',
      blocks: [
        { level: 'ok',     label: 'Verlässlich', text: 'Kalahari Anib, Stellies, Canyon Roadhouse, Klein-Aus Vista, Sesriem, Namib Desert, Tiger Reef, Etosha Safari Camp, Halali, Onguma.' },
        { level: 'danger', label: 'Kein Trinkwasser', text: 'Spitzkoppe, Twyfelfontein (Wasser nur für Duschen und Toiletten).' },
        { level: 'danger', label: 'Kein Strom am Stellplatz', text: 'Spitzkoppe, Twyfelfontein (nur am Bar- und Poolbereich), Klein-Aus Vista (nur an der Rezeption).' }
      ],
      paragraphs: [
        'Vor der Spitzkoppe in Swakopmund oder Usakos volltanken. Vor dem Damaraland in Uis oder Khorixas Reserve fassen.'
      ]
    },

    /* ---- 7. Versorgung: Treibstoff ---- */
    {
      id: 'fuel', title: 'Treibstoff', icon: 'fuel',
      paragraphs: [
        'Tankstellen auf der Route: Windhuk, Mariental, Keetmanshoop, Canyon Roadhouse, Aus, Solitaire, Swakopmund, Walvis Bay, Uis, Khorixas, Kamanjab, Outjo, Okaukuejo, Halali, Namutoni, Tsumeb, Otjiwarongo, Okahandja, B6 vor dem Flughafen.'
      ],
      blocks: [
        { level: 'danger', label: 'Die kritische Etappe ist Aus → Sesriem über die D707', text: 'rund 360 km, dazwischen nur Betta mit unsicherer Versorgung. In Aus volltanken und Reservekanister mitführen.' },
        { level: 'warn',   label: 'Park-Camps', text: '2026 gab es Berichte über unzuverlässige Treibstoffversorgung an den Park-Camps. Verlasst euch nicht darauf, dass Okaukuejo, Halali oder Namutoni Sprit hat. Regel: ab halbem Tank jede Tankstelle nutzen.' }
      ]
    },

    /* ---- 7. Versorgung: Bargeld ---- */
    {
      id: 'cash', title: 'Bargeld', icon: 'cash',
      paragraphs: [
        'Viele ländliche Tankstellen nehmen keine Karte. Geldautomaten in Windhuk, Mariental, Keetmanshoop, Lüderitz, Canyon Roadhouse, Swakopmund, Walvis Bay, Outjo, Otjiwarongo, Tsumeb.',
        'Bargeldpuffer für Parkgebühren, Community-Camps, Permits und Trinkgeld — etwa N$ 5 für den Tankwart.'
      ]
    },

    /* ---- 8. Parkgebühren und Permits ---- */
    {
      id: 'parkfees', title: 'Parkgebühren und Permits', icon: 'ticket',
      paragraphs: [
        'Seit dem 1. April 2026 gilt in den Premium-Parks für ausländische Erwachsene N$ 280 pro Person und Tag, plus N$ 50 für das Fahrzeug bis 10 Sitze. Für zwei Personen also N$ 620 pro Tag, gültig 24 Stunden. Zahlung am Gate bar oder mit Karte, Pass mitführen.'
      ],
      table: {
        head: ['Park', 'Tag', 'Gebühr'],
        rows: [
          ['Fish River Canyon / Ai-Ais', '3 (ggf. 4)', 'N$ 620 — am Hobas-Tor'],
          ['Namib-Naukluft / Sesriem',   '7',          'N$ 620 — am Sesriem-Tor'],
          ['Etosha',                     '12, 13, 14', '3 × N$ 620 = N$ 1.860'],
          ['Summe',                      '',           'rund N$ 3.100, etwa 155 €']
        ],
        emphasizeRows: [3]
      },
      paragraphsAfter: [
        'Beim Fish River Canyon lohnt die Frage am Tor, ob ein Ticket den Abend des 21.10. und den Morgen des 22.10. abdeckt — die 24-Stunden-Regel könnte das hergeben.',
        'Permits: Namib-Naukluft am Gate in Sesriem, Sandwich Harbour über die geführte Tour, Kolmanskop in Lüderitz oder am Gate. Der Spitzkoppe-Eintritt ist im Campingpreis enthalten.'
      ]
    },

    /* ---- 9. Fahrzeug und Fahren ---- */
    {
      id: 'vehicle', title: 'Fahrzeug und Fahren', icon: 'car',
      subsections: [
        {
          title: 'Laut Mietvertrag verboten',
          blocks: [
            { level: 'danger', label: 'Verboten', text: 'Van Zyl’s Pass, Kaokoland-Pisten, die Kunene-Pisten D3700 und D3701, Sandwich Harbour in Eigenregie, Dünen- und Strandfahren, Fahren in Flussbetten, Nachtfahren.' }
          ],
          paragraphs: [
            'GPS-Tracker sind Standard. Verstöße kosten je nach Vermieter N$ 10.000 bis N$ 30.000 plus erloschene Versicherung und Konfiszierung des Fahrzeugs.'
          ]
        },
        {
          title: 'Versicherung',
          blocks: [
            { level: 'danger', label: 'Reifen und Scheiben', text: 'sind in der Standardversicherung meist nicht enthalten. Zusatzversicherung dringend abschließen, Selbstbeteiligung reduzieren.' }
          ]
        },
        {
          title: 'Fahren auf Schotter',
          paragraphs: [
            'Empfohlen sind maximal 80 km/h, manche Vermieter schreiben 70 vor — realistisch fahrt 60 bis 70. Der häufigste schwere Fehler ist zu schnelles Fahren mit Kontrollverlust beim Ausweichen oder in Kurven. Vorausschauend und ohne hektische Lenkbewegungen fahren.',
            'Zwei Reservereifen mitnehmen, Druck nach Fahrzeugvorgabe. In tiefem Sand — D707 und die letzten Kilometer zum Sossusvlei — Druck ablassen, Schwung halten, danach wieder aufpumpen.',
            'Nachtfahren vermeiden, auch außerhalb der Parks: Wildwechsel in der Dämmerung.'
          ]
        },
        {
          title: 'Rückgabe',
          paragraphs: [
            'Ort noch zu klären: Flughafen oder Depot in Windhuk. Rückgabe meist mit vollem Tank und innerhalb der Geschäftszeiten.'
          ]
        }
      ]
    },

    /* ---- 10. Wetter und Hitze ---- */
    {
      id: 'weather', title: 'Wetter und Hitze', icon: 'sun',
      paragraphs: [
        'Ende Oktober ist die heißeste Zeit vor der Regenzeit.'
      ],
      table: {
        head: ['Region', 'Tagsüber', 'Nachts'],
        rows: [
          ['Süden, Kalahari, Namib',              '35–40 °C, teils über 40', '15–20 °C'],
          ['Küste, Swakopmund und Walvis Bay',    '18–22 °C, Morgennebel',   'kühl und feucht'],
          ['Damaraland',                          '~35 °C, viele Fliegen',   'mild'],
          ['Etosha',                              '33–36 °C',                'mild']
        ]
      },
      paragraphsAfter: [
        'In der zweiten Oktoberhälfte können sich nachmittags Gewitterwolken aufbauen, nennenswerter Regen ist aber noch selten. Leichten Regenschutz trotzdem einpacken.',
        'Dachzelt bei Hitze: Plätze mit Baumschatten bevorzugen. Sesriem, Canyon Roadhouse, Klein-Aus, Etosha und die Kalahari haben welchen, Spitzkoppe und Twyfelfontein kaum. Zelt erst spät aufbauen, tagsüber öffnen und lüften, Kopfseite in den Wind. Früh raus, Mittagshitze im Schatten oder Pool.',
        'Wildbeobachtung: Am Ende der Trockenzeit sind die Bedingungen die besten des Jahres. Die Tiere konzentrieren sich an den wenigen Wasserlöchern, die Vegetation ist niedrig. Morgens und spätnachmittags fahren, an Wasserlöchern warten.',
        'An der Küste ist die Zeltbespannung morgens feucht — tagsüber trocknen lassen.'
      ],
      blocks: [
        { level: 'danger', label: 'Wasser', text: '4 bis 6 Liter Wasser pro Person und Tag.' }
      ]
    },

    /* ---- 11. Kostenübersicht ---- */
    {
      id: 'costs', title: 'Kostenübersicht', icon: 'coins',
      table: {
        head: ['Posten', 'Betrag'],
        rows: [
          ['Kalahari Anib Lodge, 1 Nacht Zimmer',      '✅ bezahlt, Betrag nachtragen'],
          ['Stellies Accommodation, 1 Nacht Zimmer',   '✅ bezahlt, N$ 900'],
          ['Canyon Roadhouse, 1 Zeltnacht',            '✅ bezahlt, ca. N$ 690'],
          ['Klein-Aus Vista, 2 Zeltnächte',            '✅ bezahlt, ca. N$ 1.020'],
          ['Sesriem, 1 Zeltnacht',                     '✅ bezahlt, ca. N$ 1.340'],
          ['Namib Desert Campsite, 1 Zeltnacht',       '✅ bezahlt, ca. N$ 650'],
          ['Tiger Reef, 1 Zeltnacht',                  '✅ bezahlt, ca. N$ 500'],
          ['Etosha Safari Camp, 1 Zeltnacht',          '✅ bezahlt, ca. N$ 600'],
          ['Halali, 1 Zeltnacht',                      '✅ bezahlt, ca. N$ 920'],
          ['Onguma Tamboti, 2 Zeltnächte',             '✅ bezahlt, ca. N$ 1.800'],
          ['Okapuka Safari Lodge, 1 Nacht Zimmer',     '✅ bezahlt, Betrag nachtragen'],
          ['Aloegrove Safari Lodge, 2 Nächte Zimmer',  '✅ bezahlt, Betrag nachtragen'],
          ['Spitzkoppe, 1 Zeltnacht',                  '✅ bezahlt, N$ 600'],
          ['Twyfelfontein, 1 Zeltnacht',               'N$ 1.100 (N$ 550 p. P.), im Restbetrag vor Ort enthalten'],
          ['Elefanten-Exkursion, 2 Personen',          'N$ 2.200 (N$ 1.100 p. P.), im Restbetrag vor Ort enthalten'],
          ['Twyfelfontein, Anzahlung 20 %',            '✅ N$ 660 bezahlt'],
          ['Twyfelfontein, Restzahlung vor Ort am 28.10.', 'N$ 2.640 in bar oder per Karte'],
          ['Parkgebühren',                             'rund N$ 3.100, etwa 155 €']
        ],
        emphasizeRows: [16]
      },
      paragraphsAfter: [
        'Umrechnung etwa N$ 20 zu 1 €. Der Namibia-Dollar ist 1:1 an den südafrikanischen Rand gekoppelt.'
      ]
    },

    /* ---- 12. Vorbehalte ---- */
    {
      id: 'caveats', title: 'Vorbehalte', icon: 'info',
      list: [
        { label: 'Preise', text: 'sind Richtwerte, sofern nicht als bezahlt markiert. Bei Buchung bestätigen lassen.' },
        { label: 'Der Aloegrove-Tarif', text: 'wurde über Booking gebucht und über den Link der Lodge bezahlt. Der Zahlungsbeleg gehört offline gespeichert, damit er bei der Ankunft ohne Netz vorliegt.' },
        { label: 'Die Parkgebühren-Erhöhung', text: 'ab 01.04.2026 ist bestätigt. Ob weitere Anpassungen kommen, ist offen.' },
        { label: 'Der Straßenzustand', text: 'auf den D-Pisten und besonders der D707 ändert sich mit Grader und Regen. Vor Ort und beim Vermieter nach der aktuellen Lage fragen.' },
        { label: 'Sonnenzeiten', text: 'sind berechnete Werte für den jeweiligen Standort, Abweichung wenige Minuten. Torzeiten der Parks richten sich nach Sonnenauf- und -untergang, können aber lokal abweichen — am Gate bestätigen lassen.' },
        { label: 'Öffnungszeiten und Ausstattungen', text: 'stammen aus Betreiberangaben und Gästebewertungen und können sich geändert haben.' }
      ]
    }
  ],

  /* ---------------------------------------------------------------------
     KARTE — Bounding-Box für die selbst gezeichnete SVG-Übersichtskarte.
     Namibia grob: Nord −17, Süd −29, West 11.7, Ost 25.3
  --------------------------------------------------------------------- */
  mapBounds: { north: -16.9, south: -29.0, west: 11.5, east: 25.4 }
};

/* Global verfügbar machen — kein Modulsystem, kein Build. */
window.TRIP = TRIP;
