# Namibia 2026 — Reise-PWA

Offlinefähiger Reisebegleiter für die Selbstfahrer-Rundreise vom **19.10. bis 05.11.2026**.
Reines HTML, CSS und JavaScript. Kein Framework, kein Build-Schritt, kein npm, keine externen
Abhängigkeiten. Alles, was die App braucht, liegt in diesem Repository.

---

## 1. Repository anlegen und Dateien hochladen

1. Auf GitHub ein neues Repository anlegen, zum Beispiel `namibia-2026`.
   Öffentlich oder privat spielt für die Funktion keine Rolle — GitHub Pages
   braucht bei privaten Repositories allerdings einen bezahlten Tarif.
2. Diese Dateien in das Repository legen, **direkt im Wurzelverzeichnis**, nicht in einem Unterordner:

```
index.html
app.js
data.js
styles.css
sw.js
manifest.json
.nojekyll
README.md
assets/icon.svg
assets/icon-192.png
assets/icon-512.png
assets/apple-touch-icon.png
```

Über die Weboberfläche: *Add file → Upload files*, alle Dateien hineinziehen, `Commit changes`.
Der Ordner `assets` entsteht dabei automatisch, wenn du ihn mitziehst.

Über die Kommandozeile:

```bash
git init
git add .
git commit -m "Namibia-Reise-PWA"
git branch -M main
git remote add origin https://github.com/<user>/namibia-2026.git
git push -u origin main
```

> Die leere Datei **`.nojekyll`** muss unbedingt mit hochgeladen werden. Ohne sie ignoriert
> GitHub Pages Verzeichnisse, die mit einem Unterstrich beginnen, und verarbeitet die Dateien
> durch Jekyll. Manche Upload-Wege lassen Dateien, die mit einem Punkt beginnen, weg —
> danach im Repository prüfen, ob sie da ist.

## 2. GitHub Pages aktivieren

**Settings → Pages → Build and deployment**

* Source: **Deploy from a branch**
* Branch: **`main`**
* Ordner: **`/ (root)`**
* `Save`

Der erste Aufbau dauert ein bis zwei Minuten.

## 3. Die entstehende URL

```
https://<user>.github.io/<repo>/
```

Also zum Beispiel `https://sven-schrade.github.io/namibia-2026/`.

Die App verwendet ausschließlich relative Pfade und läuft deshalb korrekt in diesem
Unterverzeichnis. Bitte den abschließenden Schrägstrich mit aufrufen.

## 4. Auf Android installieren

1. **Chrome** öffnen und die URL aufrufen.
2. Menü (drei Punkte) oben rechts.
3. **„App installieren"** beziehungsweise „Zum Startbildschirm zufügen" antippen.
4. Bestätigen. Die App liegt danach als eigenes Symbol auf dem Startbildschirm und
   startet ohne Browserleiste.

## 5. Auf iPhone installieren

1. **Safari** öffnen — **nicht Chrome**. Auf dem iPhone kann nur Safari eine Web-App
   auf den Home-Bildschirm legen.
2. Die URL aufrufen.
3. Unten das **Teilen-Symbol** antippen (Quadrat mit Pfeil nach oben).
4. In der Liste nach unten scrollen zu **„Zum Home-Bildschirm"**.
5. Namen bestätigen, **„Hinzufügen"**.

## 6. Wichtig: einmal vor dem Abflug vollständig laden

**Die App einmal bei bestehender Internetverbindung öffnen und jede Ansicht antippen** —
Heute, Tage, eine Tagesdetailseite, Unterkünfte, eine Unterkunft im Detail, Karte, Infos
und die Checklisten. Erst dadurch legt der Service Worker alles im Gerätespeicher ab.

**Diesen Schritt vor dem Abflug erledigen.** Danach ist die App vollständig ohne Netz
nutzbar — genau das braucht ihr in Namibia, wo auf weiten Strecken kein Empfang ist.
Am besten auf beiden Handys, und danach einmal den Flugmodus einschalten und
gegenprüfen, dass alles noch da ist.

Zu prüfen, wenn du sichergehen willst: Flugmodus an, App vom Home-Bildschirm starten,
durch alle fünf Bereiche gehen. Es darf nichts leer bleiben.

## 7. Inhalte ändern

Alle Reiseinhalte stecken in **einer einzigen Datei: `data.js`**.
Feldnamen englisch, Inhalte deutsch. Struktur:

| Schlüssel | Inhalt |
|---|---|
| `meta` | Eckdaten der Reise |
| `statuses` | Definition der Buchungs-Chips |
| `landscapes` | Farbpaletten der generierten Horizontgrafiken |
| `bookingOverview` | Buchungsstand-Tabelle |
| `tasks` | offene Aufgaben, Grundlage der Checkliste |
| `days` | die 18 Reisetage |
| `accommodations` | die 14 Unterkünfte |
| `places` | Orte und Sehenswürdigkeiten |
| `activities` | Aktivitäten, vorab oder vor Ort |
| `info` | Versorgung, Parkgebühren, Fahrzeug, Wetter, Kosten, Vorbehalte |
| `mapBounds` | Ausschnitt der Übersichtskarte |

Verknüpft wird über IDs: ein Tag zeigt über `accommodationId`, `placeIds` und `activityIds`
auf die anderen Einträge. Wenn du eine neue Unterkunft ergänzt, gib ihr eine eindeutige `id`
und trage diese beim passenden Tag ein.

**Nach jeder Änderung an `data.js` (oder an einer anderen Datei) die Cache-Version in `sw.js`
erhöhen:**

```js
const CACHE = 'namibia-v3';   //  ->  'namibia-v4'
```

Ohne diesen Schritt behalten die Handys den alten Stand, weil der Service Worker konsequent
zuerst aus dem Cache liefert. Nach dem Hochladen die App einmal online öffnen: unten
erscheint der Hinweis **„Neue Version verfügbar"**, ein Tipp auf „Neu laden" übernimmt sie.
Das auf beiden Handys machen.

### Eigene Fotos ergänzen

Jeder Tag und jede Unterkunft hat ein leeres Feld `image: null`. Dort kann später ein
relativer Pfad auf ein eigenes Foto stehen (`'./assets/fotos/tag07.jpg'`). Fremde Fotos sind
bewusst nicht enthalten; die Kopfgrafiken sind generierte SVG-Horizontlinien, die je nach
Region des Tages die Landschaft andeuten und offline nichts kosten.

---

## Was die App kann

* **Heute** — vor der Reise Countdown und Vorschau auf Tag 1, während der Reise automatisch
  der aktuelle Tag nach Systemdatum, danach eine Rückblick-Ansicht. Über „Tag manuell wählen"
  lässt sich jederzeit ein anderer Tag festhalten.
* **Tage** — alle 18 Etappen, Detailansicht mit vollständigem Programmtext, Sonnenzeiten,
  Unterkunft, Orten und Aktivitäten. Zwischen den Tagen kann man wischen.
* **Unterkünfte** — chronologisch mit Statusanzeige. In der Detailansicht sind Telefonnummern
  `tel:`-Links, Mailadressen `mailto:`-Links, Referenznummern lassen sich kopieren.
  **„Kein Trinkwasser" und „Kein Strom am Stellplatz" stehen groß und rot ganz oben** — das ist
  unterwegs die praktisch wichtigste Information.
* **Karte** — eine selbst gezeichnete SVG-Übersicht Namibias mit Route und den 14 Stationen als
  antippbare Punkte. Zu jeder Station und jedem Ort gibt es die Koordinaten zum Kopieren, einen
  `geo:`-Link für die native Karten-App und einen Google-Maps-Link. Echte Kartenkacheln
  funktionieren offline nicht, deshalb dieser Weg: **die Koordinaten lassen sich auch ohne Netz
  ablesen und ins Navi tippen.**
* **Infos** — aufklappbare Abschnitte zu Versorgung, Trinkwasser, Treibstoff, Bargeld,
  Parkgebühren, Fahrzeugregeln, Wetter, Kosten und Vorbehalten.
* **Checklisten** — die offenen Aufgaben aus dem Reiseplan zum Abhaken plus eine leere,
  selbst befüllbare Packliste. Der Stand liegt in `localStorage`, **pro Gerät**.
  Zum Abgleich zwischen den beiden Handys gibt es Export und Import als JSON-Textfeld:
  auf dem einen Gerät „Stand erzeugen" und kopieren, auf dem anderen einfügen und
  „Importieren". Keine Cloud, kein Konto, keine Anmeldung.
* **Suche** über Tage, Unterkünfte, Orte und Aktivitäten.
* **Helles Thema als Standard**, weil es in der Mittagssonne besser lesbar ist. Umschalten
  über das Mond-/Sonnensymbol oben rechts, die Einstellung wird gespeichert.

## Technische Eckpunkte

* Keine externen Ressourcen: System-Schriften über einen Font-Stack, Icons als
  Inline-SVG-Sprite im HTML, App-Icons im Repository.
* Ausschließlich relative Pfade, `start_url` und `scope` sind `./`.
* Service Worker: legt beim `install` **alle** Dateien in den versionierten Cache
  `namibia-v3` und liefert danach **cache-first**. Alte Caches werden beim `activate` gelöscht.
  Nach dem ersten Laden findet kein Netzwerkaufruf mehr statt.
* iOS: `apple-mobile-web-app-capable`, `black-translucent`-Statusleiste,
  `apple-touch-icon` in 180×180, `viewport-fit=cover` und `env(safe-area-inset-*)` in den
  Paddings, damit die untere Navigation nicht unter der Home-Indicator-Leiste liegt.
  Overscroll-Bouncing ist unterbunden.
* Kein Tracking, keine Analytik, kein Konto, keine Cloud.

## Wenn etwas nicht funktioniert

| Symptom | Ursache und Abhilfe |
|---|---|
| Seite bleibt weiß, Pfade laufen ins Leere | `.nojekyll` fehlt im Repository |
| Änderungen erscheinen nicht auf dem Handy | Cache-Version in `sw.js` nicht erhöht |
| „App installieren" fehlt in Chrome | Die Seite muss über `https://…github.io/…` geladen sein, nicht lokal über `file://` |
| Auf dem iPhone erscheint „Zum Home-Bildschirm" nicht | Es wurde nicht Safari verwendet |
| Offline fehlen einzelne Ansichten | Die App wurde beim ersten Laden nicht vollständig durchgeklickt — Schritt 6 wiederholen |
