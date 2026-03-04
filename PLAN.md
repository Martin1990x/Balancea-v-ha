# Balancea – Váha: implementační plán

## 1) Cíl aplikace
Vytvořit jednoduchou webovou aplikaci **Balancea – Váha**, kde uživatel zadá:
- **aktiva**
- **pasiva**
- **hotovost**

a aplikace vizualizuje finanční stav na animované váze.

## 2) Funkční požadavky (MVP)

### 2.1 Vstupy
- Formulář se třemi čísly (Kč):
  - Aktiva
  - Pasiva
  - Hotovost
- Validace:
  - jen čísla
  - minimum 0
  - formátování s oddělovači tisíců

### 2.2 Přepočet na cihly a mince
- Konstanta:
  - 1 cihla = **25 000 Kč**
  - 1 mince = **5 000 Kč**
- Algoritmus pro každou částku:
  - počet cihel = `floor(hodnota / 25 000)`
  - zbytek = `hodnota % 25 000`
  - počet mincí = `floor(zbytek / 5 000)`
- Výstup:
  - textový přehled (např. „3 cihly, 2 mince“)
  - vizuální reprezentace na miskách váhy

### 2.3 Plynulý náklon váhy
- Vypočítat rozdíl zatížení mezi levou a pravou stranou.
- Převést na úhel náklonu (např. max ±15°).
- Implementovat plynulou animaci přes CSS transition nebo spring animaci.
- Při změně vstupů se váha vždy hladce přenastaví.

### 2.4 Ukládání snapshotů
- Snapshot obsahuje:
  - aktiva, pasiva, hotovost
  - timestamp
  - dopočtené cihly/mince
- Uložení lokálně v prohlížeči (LocalStorage) pro MVP.
- Funkce:
  - uložit nový snapshot
  - zobrazit historii
  - obnovit snapshot do formuláře
  - smazat snapshot

### 2.5 PWA instalace
- Přidat:
  - `manifest.webmanifest`
  - ikony (min. 192x192 a 512x512)
  - service worker (cache shellu aplikace)
- Splnit základní podmínky instalovatelnosti:
  - HTTPS (v produkci)
  - validní manifest
  - funkční service worker

## 3) Návrh UI
- Horní část: formulář vstupů.
- Střed: grafická váha s animací náklonu.
- Pod váhou: přepočet na cihly/mince.
- Spodní část: seznam snapshotů (datum + hodnoty + akce).
- Mobile-first layout, responzivní breakpoints.

## 4) Technický návrh

### 4.1 Stack
- Frontend: React + TypeScript + Vite
- Stylování: CSS modules nebo Tailwind (dle preference)
- Stav: lokální state + LocalStorage synchronizace
- PWA: vite-plugin-pwa

### 4.2 Datové modely
- `BalanceInput`
  - `assets: number`
  - `liabilities: number`
  - `cash: number`
- `UnitBreakdown`
  - `bricks: number`
  - `coins: number`
- `Snapshot`
  - `id: string`
  - `createdAt: string`
  - `input: BalanceInput`
  - `assetsUnits: UnitBreakdown`
  - `liabilitiesUnits: UnitBreakdown`
  - `cashUnits: UnitBreakdown`

### 4.3 Modulární rozdělení
- `components/BalanceForm`
- `components/Scale`
- `components/BreakdownPanel`
- `components/SnapshotList`
- `utils/conversion.ts`
- `utils/tilt.ts`
- `storage/snapshots.ts`

## 5) Implementační kroky
1. Inicializace projektu (React + TS + Vite).
2. Vytvoření formuláře a validací vstupů.
3. Implementace přepočtu na cihly/mince + unit testy.
4. Implementace komponenty váhy a plynulé animace náklonu.
5. Snapshoty (LocalStorage CRUD + UI).
6. Zapnutí PWA (manifest, SW, ikony).
7. UX doladění, responzivita, přístupnost.
8. E2E smoke test + Lighthouse kontrola.

## 6) Akceptační kritéria
- Uživatel může zadat aktiva/pasiva/hotovost bez chyb validace.
- Všechny tři částky se správně převádějí na cihly/mince.
- Váha se při změně hodnot **plynule** naklání.
- Snapshot jde uložit, načíst i smazat.
- Aplikace je instalovatelná jako PWA.

## 7) Rizika a mitigace
- **Trhaná animace** → použít transformace přes GPU (`transform`, `will-change`).
- **Nesoulad výpočtů** → unit testy pro hraniční hodnoty.
- **PWA edge-cases** → otestovat instalaci na Android + desktop Chrome.

## 8) Odhad práce
- MVP: 1–2 dny
- Vyladění UI/UX + testy: 1 den
- Celkem: cca 2–3 dny
