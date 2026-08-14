import React, { useState, useEffect, useMemo, useCallback } from "react";
import { storage } from "./storage.js";

/* ============================================================================
   WARHAMMER RENAISSANCE — ARMY LIST BUILDER
   ========================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');

html, body, #root {
  margin: 0;
  padding: 0;
  min-height: 100%;
}
body {
  background: #ECE0C4;
}

.whr-root {
  --paper: #ECE0C4;
  --paper-2: #E2D3A9;
  --paper-3: #D9C795;
  --ink: #372A1B;
  --ink-soft: #6B5A3E;
  --ink-faint: #9C8A66;
  --forest: #3E5B36;
  --forest-dark: #2A3F25;
  --forest-pale: #DDE6D2;
  --gold: #9C7526;
  --gold-bright: #C79A3A;
  --burgundy: #7B2E27;
  --burgundy-pale: #F0DCD8;
  --line: #C3AE7C;
  --line-soft: #D3C295;
  --shadow: rgba(55, 42, 27, 0.22);
  --font-display: 'IM Fell English', Georgia, serif;
  --font-display-sc: 'IM Fell English SC', Georgia, serif;
  --font-body: 'Crimson Text', Georgia, serif;

  position: relative;
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 17.5px;
  line-height: 1.4;
  isolation: isolate;
}

.whr-root * { box-sizing: border-box; }

.whr-grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  opacity: 0.5; mix-blend-mode: multiply;
}
.whr-vignette {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(55,42,27,0.10) 100%);
}

.whr-content { position: relative; z-index: 1; }

.whr-scroll::-webkit-scrollbar { width: 10px; }
.whr-scroll::-webkit-scrollbar-track { background: transparent; }
.whr-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 0; }

/* ---------- typography helpers ---------- */
.whr-h1 {
  font-family: var(--font-display); font-weight: 800;
  letter-spacing: 0.06em; color: var(--forest-dark);
  text-shadow: 0 1px 0 rgba(255,255,255,0.25);
}
.whr-eyebrow {
  font-family: var(--font-display-sc); font-weight: 400;
  letter-spacing: 0.14em; text-transform: uppercase;
  font-size: 14.5px; color: var(--gold);
}
.whr-serif-italic { font-style: italic; color: var(--ink-soft); }

/* ---------- leaf/vine divider (signature element) ---------- */
.whr-divider { display: flex; align-items: center; gap: 10px; margin: 10px 0 18px; }
.whr-divider::before, .whr-divider::after {
  content: ""; flex: 1; height: 1px;
  background: linear-gradient(to var(--dir, right), transparent, var(--line), transparent);
}
.whr-divider svg { flex-shrink: 0; opacity: 0.75; }

/* ---------- buttons ---------- */
.whr-btn {
  font-family: var(--font-display-sc); font-weight: 400; letter-spacing: 0.05em;
  text-transform: uppercase; font-size: 15.5px; cursor: pointer; text-align: left;
  border: 1px solid var(--line); background: var(--paper-2); color: var(--ink);
  padding: 10px 18px; transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
  border-radius: 2px;
}
.whr-btn:hover:not(:disabled) { background: var(--paper-3); border-color: var(--gold); }
.whr-btn:active:not(:disabled) { transform: translateY(1px); }
.whr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.whr-btn-stack { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-size: 11.5px; line-height: 1.3; padding: 6px 16px; }
.whr-btn-primary { background: var(--forest); border-color: var(--forest-dark); color: var(--paper); }
.whr-btn-primary:hover:not(:disabled) { background: var(--forest-dark); }
.whr-btn-gold { background: var(--gold); border-color: var(--gold-bright); color: var(--paper); }
.whr-btn-gold:hover:not(:disabled) { background: #86620F; }
.whr-btn-danger { background: transparent; border-color: var(--burgundy); color: var(--burgundy); }
.whr-btn-danger:hover:not(:disabled) { background: var(--burgundy-pale); }
.whr-btn-ghost { background: transparent; border-color: transparent; padding: 6px 10px; text-align: left; }
.whr-btn-ghost:hover:not(:disabled) { background: var(--paper-2); }
.whr-btn-sm { padding: 5px 10px; font-size: 12px; }
.whr-btn-block { width: 100%; text-align: center; }

/* ---------- inputs ---------- */
.whr-input, .whr-select {
  font-family: var(--font-body); font-size: 16.5px; color: var(--ink);
  background: var(--paper); border: 1px solid var(--line);
  padding: 9px 12px; width: 100%; border-radius: 2px;
}
.whr-input::placeholder { color: var(--ink-faint); font-style: italic; }
.whr-input:focus, .whr-select:focus, .whr-btn:focus-visible {
  outline: 2px solid var(--gold-bright); outline-offset: 1px;
}
.whr-label {
  font-family: var(--font-display-sc); font-size: 14.5px; font-weight: 400;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft);
  display: block; margin-bottom: 6px;
}

/* ---------- cards / panels ---------- */
.whr-panel {
  background: var(--paper); border: 1px solid var(--line);
  box-shadow: 0 2px 10px var(--shadow), inset 0 0 0 1px rgba(255,255,255,0.18);
}
.whr-card {
  background: var(--paper-2); border: 1px solid var(--line-soft);
  padding: 14px; border-radius: 2px;
}
.whr-card-selected { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); background: #E9DCB4; }

/* ---------- stat table ---------- */
.whr-stat-table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
.whr-stat-table th, .whr-stat-table td {
  border: 1px solid var(--line-soft); padding: 4px 6px; text-align: center;
}
.whr-stat-table th {
  font-family: var(--font-display-sc); font-weight: 400; font-size: 14px;
  letter-spacing: 0.03em; color: var(--forest-dark); background: var(--forest-pale);
}
.whr-stat-table td:first-child, .whr-stat-table th:first-child { text-align: left; font-weight: 600; }

/* ---------- scrollbar-safe columns ---------- */
.whr-col { min-height: 0; display: flex; flex-direction: column; }

/* ---------- pill / badge ---------- */
.whr-badge {
  display: inline-block; font-family: var(--font-display-sc); font-size: 14px;
  font-weight: 400; letter-spacing: 0.04em; padding: 2px 8px; border-radius: 10px;
  background: var(--forest-pale); color: var(--forest-dark); border: 1px solid var(--forest);
}
.whr-badge-gold { background: #F3E4BC; color: var(--gold); border-color: var(--gold); }
.whr-badge-burgundy { background: var(--burgundy-pale); color: var(--burgundy); border-color: var(--burgundy); }

/* ---------- checkbox / radio rows ---------- */
.whr-opt-row {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 7px 0; border-bottom: 1px dashed var(--line-soft); font-size: 16.5px;
  font-family: var(--font-display-sc); letter-spacing: 0.02em;
}
.whr-opt-row:last-child { border-bottom: none; }
.whr-opt-label { display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; }
.whr-opt-label input { accent-color: var(--forest); width: 15px; height: 15px; cursor: pointer; }
.whr-opt-cost { color: var(--ink-soft); font-size: 14.5px; white-space: nowrap; }
.whr-opt-disabled { opacity: 0.42; }
.whr-opt-disabled input { cursor: not-allowed; }

/* ---------- stepper ---------- */
.whr-stepper { display: flex; align-items: center; gap: 0; border: 1px solid var(--line); width: fit-content; }
.whr-stepper button {
  width: 30px; height: 30px; background: var(--paper-2); border: none; cursor: pointer;
  font-family: var(--font-display); font-weight: 700; color: var(--ink); font-size: 16.5px;
}
.whr-stepper button:hover:not(:disabled) { background: var(--paper-3); }
.whr-stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
.whr-stepper .whr-stepper-val {
  width: 42px; text-align: center; font-family: var(--font-display); font-weight: 700;
  border-left: 1px solid var(--line); border-right: 1px solid var(--line); height: 30px;
  display: flex; align-items: center; justify-content: center; background: var(--paper);
}

@media (max-width: 900px) {
  .whr-builder-grid { grid-template-columns: 1fr !important; }
  .whr-builder-col { max-height: none !important; }
}

.whr-print-roster { display: none; }
@media print {
  .whr-print-hide, .whr-grain, .whr-vignette { display: none !important; }
  .whr-print-roster {
    display: block !important; position: static; width: 100%; max-width: 800px; margin: 0 auto;
    background: #fff; color: #000; font-family: var(--font-body);
  }
  .whr-print-roster h1 { font-family: var(--font-display); font-size: 22px; margin: 0 0 2px; }
  .whr-print-roster h2 {
    font-family: var(--font-display-sc); font-weight: 400; font-size: 14px; letter-spacing: 0.1em;
    text-transform: uppercase; border-bottom: 1px solid #000; margin: 18px 0 8px; padding-bottom: 3px;
  }
  .whr-print-header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 4px; }
  .whr-print-header p { margin: 2px 0; font-size: 12.5px; }
  .whr-print-unit { break-inside: avoid; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dotted #999; }
  .whr-print-unit-header { display: flex; justify-content: space-between; align-items: baseline; font-size: 14px; }
  .whr-print-unit-name { font-weight: 700; }
  .whr-print-unit-cost { font-size: 12.5px; }
  .whr-print-stat-label { font-family: var(--font-display-sc); font-weight: 400; font-size: 10.5px; letter-spacing: 0.06em; margin: 2px 0 1px; }
  .whr-print-unit-body { display: flex; gap: 18px; margin-top: 4px; align-items: flex-start; }
  .whr-print-stats-col { flex: 0 0 auto; }
  .whr-print-roster table.whr-stat-table { font-size: 11.5px; margin: 0 0 4px; border: 1px solid #000; }
  .whr-print-roster table.whr-stat-table th, .whr-print-roster table.whr-stat-table td { border: 1px solid #999; padding: 1px 5px; text-align: center; color: #000; }
  .whr-print-tags { flex: 1 1 auto; min-width: 0; margin: 0; padding-left: 16px; font-size: 12px; }
  .whr-print-tags li { margin-bottom: 1px; }
  @page { margin: 0.6in; }
}
`;

/* ============================================================================
   SVG DECOR
   ========================================================================== */

function LeafDivider({ dir = "right" }) {
  return (
    <div className="whr-divider" style={{ "--dir": dir }}>
      <svg width="34" height="14" viewBox="0 0 34 14" fill="none">
        <path d="M17 2 C 11 2 8 6 2 7 C 8 8 11 12 17 12 C 23 12 26 8 32 7 C 26 6 23 2 17 2 Z"
          stroke="#9C7526" strokeWidth="1" fill="#DDE6D2" />
        <line x1="2" y1="7" x2="32" y2="7" stroke="#9C7526" strokeWidth="0.75" />
      </svg>
    </div>
  );
}

function ParchmentGrain() {
  return (
    <svg className="whr-grain" width="100%" height="100%">
      <filter id="whr-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.22  0 0 0 0 0.17  0 0 0 0 0.1  0 0 0 0.035 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#whr-noise)" />
    </svg>
  );
}

/* ============================================================================
   STAT DATA
   ========================================================================== */

const STATS = {
  "Wood Elf Warlord": { M: 5, WS: 7, BS: 7, S: 4, T: 4, W: 3, I: 9, A: 4, Ld: 10 },
  "Wood Elf Hero": { M: 5, WS: 6, BS: 6, S: 4, T: 4, W: 2, I: 8, A: 3, Ld: 9 },
  "War Dancer Hero": { M: 5, WS: 7, BS: 7, S: 4, T: 4, W: 2, I: 9, A: 3, Ld: 9 },
  "Wood Elf BSB": { M: 5, WS: 5, BS: 5, S: 4, T: 3, W: 2, I: 7, A: 2, Ld: 8 },
  "Mage Lord": { M: 5, WS: 4, BS: 4, S: 4, T: 4, W: 4, I: 9, A: 3, Ld: 9 },
  "Master Mage": { M: 5, WS: 4, BS: 4, S: 4, T: 4, W: 3, I: 8, A: 2, Ld: 8 },
  "Mage Champion": { M: 5, WS: 4, BS: 4, S: 4, T: 4, W: 2, I: 7, A: 1, Ld: 8 },
  "Mage": { M: 5, WS: 4, BS: 4, S: 3, T: 4, W: 1, I: 7, A: 1, Ld: 8 },
  "Shape Changer (beast form)": { M: 7, WS: 6, BS: 0, S: 6, T: 5, W: 4, I: 6, A: 4, Ld: 6 },
  "Elven Steed": { M: 9, WS: 3, BS: 0, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 5 },
  "Giant Warhawk": { M: "2*", WS: 4, BS: 0, S: 3, T: 3, W: 1, I: 5, A: 1, Ld: 5 },
  "Unicorn": { M: 9, WS: 5, BS: 0, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 9 },
  "Great Eagle": { M: "2*", WS: 7, BS: 0, S: 5, T: 4, W: 3, I: 5, A: 2, Ld: 8 },
  "Griffon": { M: 6, WS: 5, BS: 0, S: 6, T: 5, W: 5, I: 7, A: 4, Ld: 8 },
  "Green Dragon": { M: 6, WS: 6, BS: 0, S: 6, T: 6, W: 7, I: 8, A: 7, Ld: 7 },
  "Wood Elf Warriors": { M: 5, WS: 4, BS: 4, S: 3, T: 3, W: 1, I: 6, A: 1, Ld: 8 },
  "Wood Elf Scouts & Way Watchers": { M: 5, WS: 5, BS: 5, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Wood Elf War Dancers": { M: 5, WS: 5, BS: 5, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Wood Elf Lords": { M: 5, WS: 5, BS: 4, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Dryads": { M: 5, WS: 4, BS: 0, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 8 },
  "Wood Elf Beastmasters": { M: 6, WS: 4, BS: 4, S: 3, T: 4, W: 1, I: 6, A: 1, Ld: 8 },
  "Bears": { M: 4, WS: 3, BS: 0, S: 5, T: 5, W: 2, I: 3, A: 2, Ld: 6 },
  "Hunting Dogs": { M: 8, WS: 4, BS: 0, S: 3, T: 4, W: 1, I: 4, A: 2, Ld: 4 },
  "Wild Cats": { M: 8, WS: 4, BS: 0, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 4 },
  "Wild Hogs": { M: 7, WS: 4, BS: 0, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 3 },
  "Elven Champion": { M: 5, WS: 5, BS: 5, S: 4, T: 3, W: 1, I: 7, A: 2, Ld: 8 },
  "Elven Commander": { M: 5, WS: 6, BS: 5, S: 4, T: 3, W: 1, I: 7, A: 2, Ld: 9 },
  "War Dancer Champion": { M: 5, WS: 6, BS: 6, S: 4, T: 3, W: 1, I: 8, A: 2, Ld: 8 },
  "Branch Wraith": { M: 5, WS: 5, BS: 0, S: 5, T: 4, W: 1, I: 5, A: 3, Ld: 8 },
  "Heavy Chariot": { M: "-", WS: "-", BS: "-", S: 5, T: 5, W: 4, I: "-", A: "-", Ld: "-" },
  "Treeman": { M: 6, WS: 8, BS: 3, S: 6, T: 7, W: 6, I: 2, A: 4, Ld: 9 },
  "Orion, King in the Woods": { M: 8, WS: 8, BS: 7, S: 5, T: 5, W: 5, I: 9, A: 5, Ld: 11 },
  "Ariel, Mage Queen of Loren": { M: 6, WS: 4, BS: 4, S: 4, T: 4, W: 4, I: 9, A: 3, Ld: 10 },
  "Naieth the Prophetess": { M: 5, WS: 4, BS: 4, S: 3, T: 4, W: 1, I: 7, A: 1, Ld: 8 },
  "Thalandor the War Mage": { M: 5, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 9, A: 3, Ld: 10 },
  "Lothlann the Brave": { M: 5, WS: 5, BS: 5, S: 4, T: 3, W: 2, I: 7, A: 2, Ld: 8 },
  "Durthu the Treeman": { M: 6, WS: 8, BS: 3, S: 7, T: 7, W: 6, I: 3, A: 5, Ld: 9 },
  "Scarloc the Scout": { M: 5, WS: 6, BS: 6, S: 4, T: 4, W: 2, I: 8, A: 3, Ld: 9 },
  "Wychwethyl the Wardancer": { M: 5, WS: 6, BS: 6, S: 4, T: 3, W: 1, I: 8, A: 2, Ld: 8 },
  "Sceolan": { M: 5, WS: 6, BS: 6, S: 4, T: 4, W: 2, I: 8, A: 3, Ld: 9 },
  "The Dryad Drycha": { M: 5, WS: 5, BS: 0, S: 5, T: 4, W: 1, I: 5, A: 3, Ld: 8 },
  "Skaw the Falconer": { M: 5, WS: 5, BS: 5, S: 4, T: 3, W: 1, I: 7, A: 2, Ld: 8 },
  "Gruarth the Beastmaster": { M: 6, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 7, A: 2, Ld: 8 },
  "Gwandor the Black": { M: "2*", WS: 7, BS: 0, S: 5, T: 5, W: 4, I: 6, A: 2, Ld: 8 },
  "Empire Lord": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 9 },
  "Empire Hero": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Empire BSB": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 2, I: 4, A: 2, Ld: 7 },
  "Warrior Priest": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8 },
  "Wizard Lord": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 4, I: 6, A: 3, Ld: 8 },
  "Master Wizard": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 3, I: 5, A: 2, Ld: 7 },
  "Wizard Champion": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 2, I: 4, A: 1, Ld: 7 },
  "Wizard": { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 4, A: 1, Ld: 7 },
  "Warhorse": { M: 8, WS: 3, BS: 0, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 5 },
  "Pegasus": { M: 8, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 5 },
  "State Trooper": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Swordsman": { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Knight (Empire)": { M: 4, WS: 4, BS: 3, S: 4, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Empire Champion": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Empire Captain": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 8 },
  "Grand Commander": { M: 4, WS: 6, BS: 4, S: 4, T: 3, W: 2, I: 6, A: 2, Ld: 9 },
  "Normal Horse": { M: 8, WS: "-", BS: "-", S: "-", T: "-", W: "-", I: "-", A: "-", Ld: "-" },
  "Fighter": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Kislev Winged Lancer": { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Flagellant": { M: 4, WS: 2, BS: 2, S: 4, T: 4, W: 1, I: 3, A: 2, Ld: 10 },
  "Dwarf (Empire)": { M: 4, WS: 4, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 9 },
  "Halfling": { M: 4, WS: 2, BS: 4, S: 2, T: 2, W: 1, I: 5, A: 1, Ld: 8 },
  "Ogre": { M: 6, WS: 3, BS: 2, S: 4, T: 5, W: 3, I: 3, A: 2, Ld: 7 },
  "Fighter Champion": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Kislev Captain": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 8 },
  "Prophet of Doom": { M: 4, WS: 3, BS: 3, S: 5, T: 4, W: 1, I: 4, A: 3, Ld: 10 },
  "Dwarf Champion (Empire)": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 1, I: 3, A: 2, Ld: 9 },
  "Halfling Champion": { M: 4, WS: 3, BS: 5, S: 3, T: 2, W: 1, I: 6, A: 2, Ld: 8 },
  "Ogre Champion": { M: 6, WS: 4, BS: 3, S: 5, T: 5, W: 3, I: 4, A: 3, Ld: 7 },
  "Engineer": { M: 4, WS: 3, BS: 4, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "War Machine (cannon, mortar, etc.)": { M: "-", WS: "-", BS: "-", S: "-", T: 7, W: 3, I: "-", A: "-", Ld: "-" },
  "Weapon Team": { M: "-", WS: "-", BS: "-", S: "-", T: 7, W: 2, I: "-", A: "-", Ld: "-" },
  "War Wagon": { M: "-", WS: "-", BS: "-", S: 6, T: 6, W: 4, I: "-", A: "-", Ld: "-" },
  "Steam Tank": { M: "-", WS: 2, BS: 4, S: 7, T: 10, W: 5, I: "-", A: "-", Ld: "-" },
  "The Elector Counts": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 3, I: 4, A: 3, Ld: 9 },
  "Reiksmarshall Kurt Helborg": { M: 4, WS: 7, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 9 },
  "The Supreme Patriarch": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 4, I: 6, A: 3, Ld: 9 },
  "Grand Theogonist Volkmar": { M: 4, WS: 5, BS: 3, S: 4, T: 4, W: 3, I: 5, A: 3, Ld: 10 },
  "The Emperor Karl Franz": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "Magnus the Pious": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "Ludwig Schwarzhelm": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 3, I: 5, A: 3, Ld: 9 },
  "Tzarina Katarin The Ice Queen": { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 3, I: 5, A: 3, Ld: 10 },
  "Chaos Lord": { M: 4, WS: 9, BS: 9, S: 5, T: 5, W: 3, I: 9, A: 5, Ld: 10 },
  "Chaos Hero": { M: 4, WS: 8, BS: 8, S: 5, T: 5, W: 2, I: 8, A: 4, Ld: 9 },
  "Chaos BSB": { M: 4, WS: 7, BS: 7, S: 5, T: 4, W: 2, I: 7, A: 3, Ld: 8 },
  "Chaos Sorcerer Lord": { M: 4, WS: 6, BS: 6, S: 5, T: 5, W: 4, I: 9, A: 4, Ld: 9 },
  "Chaos Master Sorcerer": { M: 4, WS: 6, BS: 6, S: 5, T: 5, W: 3, I: 8, A: 3, Ld: 8 },
  "Chaos Sorcerer Champion": { M: 4, WS: 6, BS: 6, S: 5, T: 5, W: 2, I: 7, A: 2, Ld: 8 },
  "Chaos Sorcerer": { M: 4, WS: 6, BS: 6, S: 4, T: 5, W: 1, I: 7, A: 2, Ld: 8 },
  "Chaos Warhorse": { M: 8, WS: 4, BS: 0, S: 4, T: 4, W: 1, I: 4, A: 1, Ld: 5 },
  "Manticore": { M: 6, WS: 6, BS: 0, S: 7, T: 7, W: 5, I: 4, A: 4, Ld: 8 },
  "Chimera": { M: 6, WS: 4, BS: 0, S: 7, T: 6, W: 6, I: 4, A: 6, Ld: 8 },
  "Chaos Dragon (two-headed)": { M: 6, WS: 6, BS: 0, S: 7, T: 7, W: 7, I: 6, A: 8, Ld: 8 },
  "Juggernaut of Khorne": { M: 7, WS: 3, BS: 0, S: 5, T: 5, W: 3, I: 2, A: 2, Ld: 8 },
  "Disc of Tzeentch": { M: 1, WS: 3, BS: 0, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 8 },
  "Beast of Nurgle": { M: "3D6", WS: 3, BS: 0, S: 3, T: 4, W: 4, I: 3, A: "1D6", Ld: 8 },
  "Steed of Slaanesh": { M: 12, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 6, A: 1, Ld: 8 },
  "Daemonic Steed": { M: 8, WS: 4, BS: 0, S: 4, T: 3, W: 1, I: 6, A: 3, Ld: 8 },
  "Chaos Warrior": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 1, I: 6, A: 2, Ld: 8 },
  "Chaos Beastmaster": { M: 5, WS: 6, BS: 6, S: 4, T: 5, W: 1, I: 6, A: 2, Ld: 8 },
  "Gor Beastmaster": { M: 5, WS: 4, BS: 3, S: 3, T: 5, W: 2, I: 3, A: 1, Ld: 7 },
  "Chaos Marauder": { M: 4, WS: 4, BS: 3, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Chaos Hound": { M: 7, WS: 4, BS: 0, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 6 },
  "Chaos Champion": { M: 4, WS: 7, BS: 7, S: 5, T: 4, W: 1, I: 7, A: 3, Ld: 8 },
  "Chaos Spawn": { M: "2D6", WS: 3, BS: 0, S: 4, T: 5, W: 3, I: 3, A: "1D6", Ld: 10 },
  "Chaos Abomination": { M: 6, WS: 4, BS: 0, S: 5, T: 4, W: 4, I: 4, A: 3, Ld: 6 },
  "Archaon": { M: 4, WS: 9, BS: 9, S: 5, T: 5, W: 3, I: 9, A: 5, Ld: 11 },
  "Aekold Helbrass": { M: 4, WS: 8, BS: 8, S: 5, T: 5, W: 2, I: 8, A: 4, Ld: 9 },
  "Count Mordrek": { M: 4, WS: "1D6+4", BS: 9, S: "1D3+3", T: "1D3+3", W: 3, I: 9, A: "1D6+1", Ld: 11 },
  "Valnir the Reaper": { M: 4, WS: 8, BS: 8, S: 5, T: 6, W: 2, I: 8, A: 4, Ld: 9 },
  "Dechala the Denied One": { M: 8, WS: 8, BS: 7, S: 5, T: 5, W: 2, I: 10, A: 6, Ld: 9 },
  "Arbaal the Undefeated": { M: 4, WS: 9, BS: 8, S: 6, T: 5, W: 3, I: 8, A: "2D6", Ld: 10 },
  "Egrimm van Horstmann": { M: 4, WS: 6, BS: 6, S: 5, T: 5, W: 4, I: 9, A: 4, Ld: 10 },
  "Khorne's Hound": { M: 8, WS: 6, BS: 0, S: 6, T: 5, W: 3, I: 10, A: 4, Ld: 10 },
  "Beastman Lord": { M: 4, WS: 7, BS: 6, S: 4, T: 5, W: 4, I: 6, A: 4, Ld: 9 },
  "Beastman Hero": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 3, I: 5, A: 3, Ld: 8 },
  "Beastman BSB": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 3, I: 4, A: 2, Ld: 7 },
  "Beastman Shaman Lord": { M: 4, WS: 4, BS: 3, S: 4, T: 5, W: 5, I: 6, A: 3, Ld: 8 },
  "Beastman Master Shaman": { M: 4, WS: 4, BS: 3, S: 4, T: 5, W: 4, I: 5, A: 2, Ld: 7 },
  "Beastman Shaman Champion": { M: 4, WS: 4, BS: 3, S: 4, T: 5, W: 3, I: 4, A: 1, Ld: 7 },
  "Beastman Shaman": { M: 4, WS: 4, BS: 3, S: 3, T: 5, W: 2, I: 4, A: 1, Ld: 7 },
  "Minotaur Lord": { M: 6, WS: 7, BS: 6, S: 6, T: 5, W: 5, I: 6, A: 5, Ld: 10 },
  "Minotaur Hero": { M: 6, WS: 6, BS: 5, S: 6, T: 5, W: 4, I: 5, A: 4, Ld: 9 },
  "Minotaur BSB": { M: 6, WS: 5, BS: 4, S: 6, T: 4, W: 4, I: 4, A: 3, Ld: 8 },
  "Dragon Ogre Lord": { M: 7, WS: 7, BS: 5, S: 6, T: 6, W: 6, I: 5, A: 6, Ld: 9 },
  "Dragon Ogre Hero": { M: 7, WS: 6, BS: 4, S: 6, T: 6, W: 5, I: 4, A: 5, Ld: 8 },
  "Centaur Lord": { M: 8, WS: 6, BS: 7, S: 5, T: 4, W: 4, I: 6, A: 5, Ld: 9 },
  "Centaur Hero": { M: 8, WS: 5, BS: 6, S: 5, T: 4, W: 3, I: 5, A: 4, Ld: 8 },
  "Centaur BSB": { M: 8, WS: 4, BS: 5, S: 5, T: 3, W: 3, I: 4, A: 3, Ld: 7 },
  "Beastmen Ungors": { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 6 },
  "Beastmen Gors": { M: 4, WS: 4, BS: 3, S: 3, T: 4, W: 2, I: 3, A: 1, Ld: 7 },
  "Beastmen Bestigors": { M: 4, WS: 5, BS: 3, S: 4, T: 4, W: 2, I: 3, A: 1, Ld: 7 },
  "Gor Beastmasters": { M: 5, WS: 4, BS: 3, S: 3, T: 5, W: 2, I: 3, A: 1, Ld: 7 },
  "Minotaurs": { M: 6, WS: 4, BS: 3, S: 5, T: 4, W: 3, I: 3, A: 2, Ld: 8 },
  "Dragon Ogres": { M: 7, WS: 4, BS: 2, S: 5, T: 5, W: 4, I: 2, A: 3, Ld: 7 },
  "Trolls": { M: 6, WS: 3, BS: 1, S: 5, T: 4, W: 3, I: 1, A: 3, Ld: 4 },
  "Centaurs": { M: 8, WS: 3, BS: 4, S: 4, T: 3, W: 2, I: 3, A: 2, Ld: 7 },
  "Beastmen Champion": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 7 },
  "Minotaur Champion": { M: 6, WS: 5, BS: 4, S: 6, T: 4, W: 3, I: 4, A: 3, Ld: 8 },
  "Dragon Ogre Champion": { M: 7, WS: 5, BS: 3, S: 6, T: 5, W: 4, I: 3, A: 4, Ld: 7 },
  "Centaur Champion": { M: 8, WS: 4, BS: 5, S: 5, T: 3, W: 2, I: 4, A: 3, Ld: 7 },
  "Tuskgors": { M: 7, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 2, A: 1, Ld: 3 },
  "Extra Heavy Chariot": { M: "-", WS: "-", BS: "-", S: 5, T: 6, W: 4, I: "-", A: "-", Ld: "-" },
  "Giants and Cyclopes": { M: 6, WS: 3, BS: 3, S: 7, T: 6, W: 6, I: 3, A: "Spec", Ld: 6 },
  "Jabberslythe": { M: 8, WS: 4, BS: 4, S: 5, T: 5, W: 5, I: 4, A: 5, Ld: 9 },
  "Bloodthirster": { M: 8, WS: 10, BS: 10, S: 8, T: 7, W: 10, I: 8, A: 11, Ld: 10 },
  "Lord of Change": { M: 8, WS: 9, BS: 10, S: 7, T: 7, W: 7, I: 10, A: 6, Ld: 10 },
  "Great Unclean One": { M: 4, WS: 7, BS: 7, S: 7, T: 8, W: 10, I: 4, A: 7, Ld: 10 },
  "Keeper of Secrets": { M: 6, WS: 9, BS: 10, S: 7, T: 7, W: 8, I: 7, A: 6, Ld: 10 },
  "Daemon Prince": { M: 6, WS: 7, BS: 7, S: 6, T: 5, W: 4, I: 8, A: 5, Ld: 9 },
  "Gargoyles": { M: 4, WS: 3, BS: 0, S: 4, T: 3, W: 1, I: 4, A: 1, Ld: 2 },
  "Bloodletters of Khorne": { M: 4, WS: 5, BS: 5, S: 5, T: 3, W: 1, I: 6, A: 2, Ld: 8 },
  "Flesh Hounds of Khorne": { M: 10, WS: 5, BS: 0, S: 5, T: 4, W: 2, I: 6, A: 1, Ld: 8 },
  "Pink Horrors of Tzeentch": { M: 4, WS: 5, BS: 5, S: 4, T: 3, W: 1, I: 6, A: 2, Ld: 8 },
  "Blue Horrors of Tzeentch": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Flamers of Tzeentch": { M: 9, WS: 3, BS: 5, S: 5, T: 4, W: 2, I: 4, A: 2, Ld: 8 },
  "Plaguebearers of Nurgle": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 8 },
  "Nurglings": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 3, I: 4, A: 3, Ld: 8 },
  "Daemonettes of Slaanesh": { M: 5, WS: 6, BS: 6, S: 4, T: 3, W: 1, I: 6, A: 3, Ld: 8 },
  "Fiends of Slaanesh": { M: 10, WS: 4, BS: 0, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 8 },
  "Bloodletter Champion": { M: 4, WS: 6, BS: 6, S: 6, T: 3, W: 1, I: 7, A: 3, Ld: 8 },
  "Pink Horror Champion": { M: 4, WS: 6, BS: 6, S: 5, T: 3, W: 1, I: 7, A: 3, Ld: 8 },
  "Plaguebearer Champion": { M: 4, WS: 6, BS: 6, S: 5, T: 4, W: 1, I: 5, A: 3, Ld: 8 },
  "Daemonette Champion": { M: 5, WS: 7, BS: 7, S: 5, T: 3, W: 1, I: 7, A: 4, Ld: 8 },
  "Chaos Dwarf Crewman": { M: 4, WS: 4, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 9 },
  "Hellcannon Daemon": { M: "2D6", WS: 4, BS: 3, S: 5, T: 6, W: 5, I: 8, A: 5, Ld: 4 },
  "Valkia the Bloody": { M: 4, WS: 10, BS: 9, S: 5, T: 5, W: 3, I: 9, A: 5, Ld: 10 },
  "Prince Sigvald": { M: 4, WS: 9, BS: 9, S: 5, T: 5, W: 3, I: 9, A: 5, Ld: 10 },
  "Vilitch the Curseling": { M: 4, WS: 6, BS: 6, S: 5, T: 5, W: 4, I: 9, A: 4, Ld: 9 },
  "Festus the Leechlord": { M: 4, WS: 6, BS: 6, S: 5, T: 6, W: 2, I: 7, A: 2, Ld: 8 },
  "Galrauch": { M: 6, WS: 6, BS: 6, S: 7, T: 7, W: 7, I: 6, A: 8, Ld: 8 },
  "Kholek Suneater": { M: 7, WS: 7, BS: 5, S: 6, T: 6, W: 6, I: 5, A: 6, Ld: 10 },
  "Skulltaker": { M: 4, WS: 6, BS: 6, S: 6, T: 3, W: 2, I: 7, A: 3, Ld: 8 },
  "Karanak": { M: 10, WS: 6, BS: 0, S: 6, T: 4, W: 3, I: 7, A: 3, Ld: 8 },
  "Skarbrand": { M: 6, WS: 10, BS: 10, S: 8, T: 7, W: 10, I: 8, A: 11, Ld: 10 },
  "The Blue Scribes": { M: 4, WS: 6, BS: 6, S: 5, T: 3, W: 2, I: 7, A: 3, Ld: 8 },
  "The Changeling": { M: 4, WS: 3, BS: 4, S: 3, T: 3, W: 2, I: 3, A: 1, Ld: 8 },
  "Epidemius": { M: 4, WS: 6, BS: 6, S: 5, T: 4, W: 1, I: 5, A: 3, Ld: 8 },
  "Ku'Gath Plaguefather": { M: 4, WS: 7, BS: 7, S: 7, T: 8, W: 10, I: 4, A: 7, Ld: 10 },
  "The Masque of Slaanesh": { M: 5, WS: 7, BS: 7, S: 5, T: 3, W: 2, I: 7, A: 4, Ld: 8 },
  "Belakor": { M: 6, WS: 7, BS: 7, S: 6, T: 5, W: 4, I: 8, A: 5, Ld: 10 },
  "Amon 'Chakai": { M: 8, WS: 9, BS: 9, S: 7, T: 7, W: 8, I: 9, A: 6, Ld: 10 },
  "Azazel": { M: 6, WS: 7, BS: 7, S: 6, T: 5, W: 5, I: 9, A: 7, Ld: 9 },
  "Scyla Anfingrim": { M: 6, WS: 6, BS: 0, S: 6, T: 6, W: 4, I: 3, A: 6, Ld: 8 },
  "Gorthor the Beastlord": { M: 4, WS: 6, BS: 4, S: 4, T: 5, W: 4, I: 5, A: 4, Ld: 10 },
  "Khazrak the One-Eye": { M: 4, WS: 6, BS: 5, S: 5, T: 5, W: 3, I: 5, A: 3, Ld: 9 },
  "Redmaw": { M: 6, WS: 6, BS: 0, S: 6, T: 5, W: 3, I: 5, A: 3, Ld: 6 },
  "Throgg, King of Trolls": { M: 6, WS: 5, BS: 2, S: 6, T: 5, W: 4, I: 2, A: 4, Ld: 9 },
  "Dwarf Lord": { M: 4, WS: 7, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 4, Ld: 11 },
  "Dwarf Hero": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 2, I: 4, A: 3, Ld: 10 },
  "Dwarf BSB": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 2, I: 3, A: 2, Ld: 9 },
  "Daemon Slayer": { M: 4, WS: 7, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 4, Ld: 11 },
  "Dragon Slayer": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 2, I: 4, A: 3, Ld: 10 },
  "Runelord": { M: 4, WS: 8, BS: 6, S: 5, T: 6, W: 4, I: 5, A: 2, Ld: 11 },
  "Master Runesmith": { M: 4, WS: 7, BS: 5, S: 4, T: 6, W: 3, I: 4, A: 2, Ld: 10 },
  "Runesmith": { M: 4, WS: 6, BS: 4, S: 4, T: 5, W: 2, I: 3, A: 2, Ld: 9 },
  "Dwarf Soldier": { M: 4, WS: 4, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 9 },
  "Troll Slayer": { M: 4, WS: 4, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 9 },
  "Dwarf Elite Soldier": { M: 4, WS: 5, BS: 3, S: 4, T: 4, W: 1, I: 3, A: 1, Ld: 9 },
  "Dwarf Champion": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 1, I: 3, A: 2, Ld: 9 },
  "Giant Slayer": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 1, I: 3, A: 2, Ld: 9 },
  "Dwarf Commander": { M: 4, WS: 6, BS: 4, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 10 },
  "Gyrocopter": { M: 20, WS: 4, BS: 3, S: 3, T: 4, W: 4, I: 2, A: 1, Ld: 9 },
  "King Kazador of Karak Azul": { M: 4, WS: "7 (+2 from Hammer)", BS: 6, S: "5 (+1 from Hammer)", T: 5, W: 3, I: 5, A: 4, Ld: 11 },
  "Ungrim Ironfist": { M: 4, WS: 7, BS: 6, S: "4 (+1 from Axe)", T: "5 (+1 from Crown)", W: 3, I: 5, A: 4, Ld: 11 },
  "Runelord Kragg the Grim": { M: 4, WS: 8, BS: 6, S: "5 (10 w/ Hammer)", T: 6, W: 4, I: 5, A: "2 (+1 from Hammer)", Ld: 11 },
  "Gotrek Gurnisson": { M: 4, WS: 8, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 4, Ld: 11 },
  "Felix Jaeger": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 3, I: 5, A: 3, Ld: 8 },
  "High King Thorgrim Grudgebearer": { M: 4, WS: 7, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 4, Ld: 11 },
  "Josef Bugman": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 2, I: 4, A: 3, Ld: 10 },
  "Burlok Dammnison": { M: 4, WS: 6, BS: 1, S: 7, T: 5, W: 3, I: 4, A: 3, Ld: 10 },
  "Knightly Lord": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 9 },
  "Knightly Hero": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Knightly BSB": { M: 4, WS: 6, BS: 4, S: 4, T: 3, W: 2, I: 6, A: 3, Ld: 8 },
  "Hippogriff": { M: 8, WS: 5, BS: 0, S: 6, T: 5, W: 5, I: 6, A: 3, Ld: 8 },
  "Peasant": { M: 4, WS: 2, BS: 2, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 6 },
  "Man-at-Arms": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Young Knight": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Bretonnian Knight": { M: 4, WS: 4, BS: 3, S: 4, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Elite Knight": { M: 4, WS: 5, BS: 3, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 7 },
  "Commoner Champion": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Knightly Champion": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 8 },
  "The King's Champion": { M: 4, WS: 6, BS: 4, S: 4, T: 3, W: 2, I: 6, A: 3, Ld: 8 },
  "The Hermit Knight": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Louen Leoncoeur, The Lionhearted": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "The Green Knight": { M: 4, WS: 6, BS: 3, S: 5, T: 5, W: 1, I: 6, A: 1, Ld: 10 },
  "Green Knight's Warhorse": { M: 8, WS: 4, BS: 0, S: 4, T: 4, W: 1, I: 4, A: 1, Ld: 5 },
  "Baron Odo d'Outremer": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 8 },
  "Suliman le Saracen": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Tancred, Duc de Quenelles": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "The Knight of the Perilous Lance": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Reynard le Chasseur": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 8 },
  "Wolf Hounds": { M: 8, WS: 4, BS: 0, S: 4, T: 3, W: 1, I: 4, A: 1, Ld: 6 },
  "Bohemond Beastslayer, Duke of Bastonne": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 9 },
  "Roland le Marechal": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 8 },
  "Armand d'Aquitaine": { M: 4, WS: 6, BS: 4, S: 4, T: 3, W: 2, I: 6, A: 3, Ld: 8 },
  "Bertrand the Brigand": { M: 4, WS: 4, BS: 5, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 8 },
  "Hugo le Petit": { M: 4, WS: 3, BS: 4, S: 5, T: 3, W: 1, I: 3, A: 1, Ld: 8 },
  "Gui le Gros": { M: 4, WS: 3, BS: 4, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 8 },
  "Bowmen of Bergerac": { M: 4, WS: 3, BS: 4, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 8 },
  "Tristan le Troubadour": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Jules le Jongleur": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Jasperre le'Beu Dragonslayer": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Morgiana le Fay": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 3, I: 6, A: 1, Ld: 9 },
  "Repanse de Lyonesse": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 9 },
  "Black Orc Warlord": { M: 4, WS: 7, BS: 6, S: 5, T: 5, W: 3, I: 5, A: 4, Ld: 10 },
  "Orc Warlord": { M: 4, WS: 6, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 4, Ld: 9 },
  "Goblin Warlord": { M: 4, WS: 5, BS: 6, S: 4, T: 4, W: 3, I: 5, A: 4, Ld: 7 },
  "Black Orc Hero": { M: 4, WS: 6, BS: 5, S: 5, T: 5, W: 2, I: 4, A: 3, Ld: 9 },
  "Orc Hero": { M: 4, WS: 5, BS: 5, S: 4, T: 5, W: 2, I: 4, A: 3, Ld: 8 },
  "Goblin Hero": { M: 4, WS: 4, BS: 5, S: 4, T: 4, W: 2, I: 4, A: 3, Ld: 6 },
  "Black Orc BSB": { M: 4, WS: 5, BS: 4, S: 5, T: 4, W: 2, I: 3, A: 2, Ld: 8 },
  "Orc BSB": { M: 4, WS: 4, BS: 4, S: 4, T: 4, W: 2, I: 3, A: 2, Ld: 7 },
  "Goblin BSB": { M: 4, WS: 3, BS: 4, S: 4, T: 3, W: 2, I: 3, A: 2, Ld: 5 },
  "Orc Shaman Lord": { M: 4, WS: 3, BS: 3, S: 4, T: 5, W: 4, I: 5, A: 3, Ld: 8 },
  "Orc Master Shaman": { M: 4, WS: 3, BS: 3, S: 4, T: 5, W: 3, I: 4, A: 2, Ld: 7 },
  "Orc Shaman Champion": { M: 4, WS: 3, BS: 3, S: 4, T: 5, W: 2, I: 3, A: 1, Ld: 7 },
  "Orc Shaman": { M: 4, WS: 3, BS: 3, S: 3, T: 5, W: 1, I: 3, A: 1, Ld: 7 },
  "Goblin Shaman Lord": { M: 4, WS: 2, BS: 3, S: 4, T: 4, W: 4, I: 5, A: 3, Ld: 6 },
  "Goblin Master Shaman": { M: 4, WS: 2, BS: 3, S: 4, T: 4, W: 3, I: 4, A: 2, Ld: 5 },
  "Goblin Shaman Champion": { M: 4, WS: 2, BS: 3, S: 4, T: 4, W: 2, I: 3, A: 1, Ld: 5 },
  "Goblin Shaman": { M: 4, WS: 2, BS: 3, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 5 },
  "War Boar": { M: 7, WS: 4, BS: 0, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 3 },
  "Giant Wolf": { M: 9, WS: 4, BS: 0, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 3 },
  "Giant Spider": { M: 7, WS: 3, BS: 0, S: 3, T: 3, W: 1, I: 1, A: 1, Ld: 5 },
  "Monstrous Spider": { M: 7, WS: 3, BS: 0, S: 4, T: 4, W: 4, I: 1, A: 2, Ld: 5 },
  "Wyvern (Orc)": { M: 6, WS: 5, BS: 0, S: 5, T: 6, W: 4, I: 4, A: 3, Ld: 5 },
  "Common Orc": { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  "Orc Big'un": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 1, I: 3, A: 1, Ld: 7 },
  "Savage Orc": { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  "Black Orc": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 1, I: 2, A: 1, Ld: 8 },
  "Common Goblin": { M: 4, WS: 2, BS: 3, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
  "Forest Goblin": { M: 4, WS: 2, BS: 3, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
  "Night Goblin": { M: 4, WS: 2, BS: 3, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
  "Night Goblin Fanatic": { M: "2D6", WS: 2, BS: 3, S: 5, T: 3, W: 1, I: 1, A: "1D6", Ld: 5 },
  "Cave Squig": { M: "2D6", WS: 4, BS: 0, S: 5, T: 3, W: 1, I: 5, A: 2, Ld: 2 },
  "Snotling Base": { M: 4, WS: 2, BS: 2, S: 2, T: 2, W: 3, I: 3, A: 3, Ld: 4 },
  "Black Orc Champion": { M: 4, WS: 5, BS: 4, S: 5, T: 4, W: 1, I: 3, A: 2, Ld: 8 },
  "Savage Orc Champion": { M: 4, WS: 4, BS: 4, S: 4, T: 4, W: 1, I: 3, A: 2, Ld: 7 },
  "Common Orc Champion": { M: 4, WS: 4, BS: 4, S: 4, T: 4, W: 1, I: 3, A: 2, Ld: 7 },
  "Orc Big'un Champion": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 7 },
  "Common Goblin Champion": { M: 4, WS: 3, BS: 4, S: 4, T: 3, W: 1, I: 3, A: 2, Ld: 5 },
  "Forest Goblin Champion": { M: 4, WS: 3, BS: 4, S: 4, T: 3, W: 1, I: 3, A: 2, Ld: 5 },
  "Night Goblin Champion": { M: 4, WS: 3, BS: 4, S: 4, T: 3, W: 1, I: 3, A: 2, Ld: 5 },
  "Light Chariot": { M: "-", WS: "-", BS: "-", S: 4, T: 4, W: 4, I: "-", A: "-", Ld: "-" },
  "Giant (Orc)": { M: 6, WS: 3, BS: 3, S: 7, T: 6, W: 6, I: 3, A: "Spec", Ld: 6 },
  "Spider Swarm": { M: 4, WS: 2, BS: 0, S: 3, T: 2, W: 5, I: 1, A: 5, Ld: 10 },
  "Gargantuan Spider": { M: 7, WS: 4, BS: 0, S: 5, T: 5, W: 8, I: 4, A: 8, Ld: 6 },
  "Azhag the Slaughterer": { M: 4, WS: 6, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 4, Ld: 10 },
  "Gorfang Rotgut": { M: 4, WS: 5, BS: 5, S: 5, T: 5, W: 3, I: 4, A: 3, Ld: 8 },
  "Gorbad Ironclaw": { M: 4, WS: 6, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 4, Ld: 10 },
  "Grom the Paunch": { M: 4, WS: 5, BS: 6, S: 4, T: 4, W: 3, I: 5, A: 4, Ld: 9 },
  "Morglum Necksnapper": { M: 4, WS: 7, BS: 6, S: 5, T: 5, W: 3, I: 5, A: 4, Ld: 10 },
  "Oglok the 'Orrible": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 2, I: 4, A: 4, Ld: 9 },
  "Skarsnik of the Eight Peaks": { M: 4, WS: 5, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 9 },
  "Gobbla": { M: "-", WS: 6, BS: 0, S: 6, T: 4, W: 3, I: 6, A: 4, Ld: 2 },
  "Elven Prince": { M: 5, WS: 7, BS: 7, S: 4, T: 4, W: 3, I: 9, A: 4, Ld: 10 },
  "Elven Hero (High Elf)": { M: 5, WS: 6, BS: 6, S: 4, T: 4, W: 2, I: 8, A: 3, Ld: 9 },
  "Elven BSB (High Elf)": { M: 5, WS: 5, BS: 5, S: 4, T: 3, W: 2, I: 7, A: 2, Ld: 8 },
  "Dragon (High Elf)": { M: 6, WS: 6, BS: 0, S: 6, T: 6, W: 7, I: 8, A: 7, Ld: 7 },
  "Great Dragon": { M: 6, WS: 7, BS: 0, S: 7, T: 7, W: 8, I: 7, A: 8, Ld: 8 },
  "Emperor Dragon": { M: 6, WS: 8, BS: 0, S: 8, T: 8, W: 9, I: 6, A: 9, Ld: 9 },
  "Elven Warriors (High Elf)": { M: 5, WS: 4, BS: 4, S: 3, T: 3, W: 1, I: 6, A: 1, Ld: 8 },
  "White Lions": { M: 5, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 6, A: 1, Ld: 8 },
  "Sword Masters": { M: 5, WS: 6, BS: 4, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Hand Maidens": { M: 5, WS: 5, BS: 5, S: 3, T: 3, W: 1, I: 6, A: 1, Ld: 8 },
  "Elven Elite": { M: 5, WS: 5, BS: 4, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Elven Champion (High Elf)": { M: 5, WS: 5, BS: 5, S: 4, T: 3, W: 1, I: 7, A: 2, Ld: 8 },
  "Elven Commander (High Elf)": { M: 5, WS: 6, BS: 5, S: 4, T: 3, W: 1, I: 7, A: 2, Ld: 9 },
  "White Lion Steed": { M: 8, WS: 5, BS: 0, S: 5, T: 4, W: 1, I: 4, A: 2, Ld: 5 },
  "Young Dragon": { M: 6, WS: 5, BS: 0, S: 5, T: 5, W: 6, I: 9, A: 6, Ld: 6 },
  "Supreme Elven Lord": { M: 5, WS: 6, BS: 5, S: 4, T: 4, W: 3, I: 7, A: 2, Ld: 9 },
  "Korhil": { M: 5, WS: 7, BS: 6, S: 5, T: 4, W: 2, I: 8, A: 3, Ld: 9 },
  "Belannaer": { M: 5, WS: 6, BS: 4, S: 4, T: 4, W: 4, I: 9, A: 4, Ld: 10 },
  "Imrik or Tyrion": { M: 5, WS: 8, BS: 7, S: 4, T: 4, W: 3, I: 10, A: 4, Ld: 10 },
  "Eltharion or Alith Anar": { M: 5, WS: 7, BS: 7, S: 4, T: 4, W: 3, I: 9, A: 4, Ld: 10 },
  "Teclis": { M: 5, WS: 4, BS: 4, S: 4, T: 4, W: 4, I: 9, A: 3, Ld: 10 },
  "The Everqueen": { M: 5, WS: 10, BS: 10, S: 3, T: 4, W: 4, I: 10, A: 1, Ld: 10 },
  "Caradryan": { M: 5, WS: 6, BS: 5, S: 4, T: 3, W: 2, I: 7, A: 2, Ld: 9 },
  "Malhandir": { M: 10, WS: 4, BS: 0, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 7 },
  // --- Dogs of War ---
  "Human Mercenary Lord": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "Ogre Mercenary Hero": { M: 6, WS: 5, BS: 4, S: 5, T: 6, W: 4, I: 5, A: 4, Ld: 8 },
  "Norse Huscarls": { M: 4, WS: 5, BS: 3, S: 4, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Norse Champion": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Marksmen of Miragliano": { M: 4, WS: 3, BS: 4, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Maximillian": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Long Drong's Pirate": { M: 4, WS: 4, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 9 },
  "Long Drong": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 2, I: 4, A: 3, Ld: 10 },
  "Birdman of Catrazza": { M: 4, WS: 4, BS: 4, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Dadallo": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Ruglud's Orc": { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  "Ruglud": { M: 4, WS: 5, BS: 5, S: 4, T: 5, W: 2, I: 5, A: 3, Ld: 8 },
  "Mengil's Dark Elf Shade": { M: 5, WS: 4, BS: 4, S: 3, T: 3, W: 1, I: 6, A: 1, Ld: 8 },
  "Mengil Manhide": { M: 5, WS: 5, BS: 5, S: 4, T: 3, W: 1, I: 7, A: 2, Ld: 8 },
  "Braganza's Besieger": { M: 4, WS: 3, BS: 4, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Braganza": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Vespero's Duelist": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 3, A: 1, Ld: 8 },
  "Vespero": { M: 4, WS: 7, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Oglah Khan's Hobgoblin": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 6 },
  "Oglah Khan": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 4, A: 3, Ld: 7 },
  "Cursed Company Skeleton": { M: 4, WS: 2, BS: 2, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
  "Richter Kreugar": { M: 4, WS: 5, BS: 0, S: 5, T: 5, W: 2, I: 5, A: 3, Ld: 9 },
  "Leonardo da Miragliano": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 2, I: 4, A: 2, Ld: 7 },
  "Lucrezzia Belladonna": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 3, I: 5, A: 2, Ld: 7 },
  "Borgio the Besieger": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "Myrdas the Mean": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Lorenzo Lupo": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "Marco Colombo": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "Asarnil the Dragonlord": { M: 5, WS: 6, BS: 6, S: 4, T: 4, W: 2, I: 8, A: 3, Ld: 9 },
  "Asarnil's Dragon": { M: 6, WS: 6, BS: 0, S: 6, T: 6, W: 7, I: 8, A: 7, Ld: 7 },
  // --- Chaos Dwarfs ---
  "Chaos Dwarf Lord": { M: 4, WS: 7, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 4, Ld: 11 },
  "Chaos Dwarf Hero": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 2, I: 4, A: 3, Ld: 10 },
  "Chaos Dwarf BSB": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 2, I: 3, A: 2, Ld: 9 },
  "Chaos Dwarf Sorcerer Lord": { M: 4, WS: 4, BS: 3, S: 4, T: 5, W: 4, I: 5, A: 3, Ld: 10 },
  "Chaos Dwarf Master Sorcerer": { M: 4, WS: 4, BS: 3, S: 4, T: 5, W: 3, I: 4, A: 2, Ld: 9 },
  "Chaos Dwarf Sorcerer Champion": { M: 4, WS: 4, BS: 3, S: 4, T: 5, W: 2, I: 3, A: 1, Ld: 9 },
  "Chaos Dwarf Sorcerer": { M: 4, WS: 4, BS: 3, S: 3, T: 5, W: 1, I: 3, A: 1, Ld: 9 },
  "Bull Centaur Lord": { M: 8, WS: 7, BS: 6, S: 5, T: 5, W: 4, I: 6, A: 5, Ld: 11 },
  "Bull Centaur Hero": { M: 8, WS: 6, BS: 5, S: 5, T: 5, W: 3, I: 5, A: 4, Ld: 10 },
  "Bull Centaur BSB": { M: 8, WS: 5, BS: 4, S: 5, T: 4, W: 3, I: 4, A: 3, Ld: 9 },
  "Hobgoblin Hero": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 4, A: 3, Ld: 7 },
  "Hobgoblin Assassin": { M: 4, WS: 7, BS: 7, S: 4, T: 4, W: 1, I: 6, A: 2, Ld: 8 },
  "Chaos Dwarf Warriors": { M: 4, WS: 4, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 9 },
  "Chaos Dwarf Tower Guards": { M: 4, WS: 5, BS: 3, S: 4, T: 4, W: 1, I: 3, A: 1, Ld: 9 },
  "Bull Centaurs": { M: 8, WS: 4, BS: 3, S: 4, T: 4, W: 2, I: 3, A: 2, Ld: 9 },
  "Hobgoblin (CD)": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 6 },
  "Chaos Dwarf Champion": { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 1, I: 3, A: 2, Ld: 9 },
  "Commander of the Tower": { M: 4, WS: 6, BS: 4, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 10 },
  "Bull Centaur Champion": { M: 8, WS: 5, BS: 4, S: 5, T: 4, W: 2, I: 4, A: 3, Ld: 9 },
  "Hobgoblin Champion (CD)": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 3, A: 2, Ld: 6 },
  "Great Taurus": { M: 6, WS: 6, BS: 0, S: 6, T: 6, W: 5, I: 7, A: 4, Ld: 8 },
  "Lammasu": { M: 6, WS: 6, BS: 0, S: 6, T: 7, W: 5, I: 6, A: 3, Ld: 8 },
  "Zhatan The Black": { M: 4, WS: 8, BS: 6, S: 4, T: 5, W: 4, I: 6, A: 4, Ld: 11 },
  "Gorduz Backstabber": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 5, A: 4, Ld: 8 },
  "Astragoth": { M: 8, WS: 6, BS: 3, S: 5, T: 5, W: 4, I: 5, A: 3, Ld: 10 },
  "Drazhoath The Ashen": { M: 4, WS: 6, BS: 4, S: 4, T: 5, W: 4, I: 5, A: 3, Ld: 10 },
  "Bull Centaur Renders": { M: 7, WS: 4, BS: 2, S: 5, T: 5, W: 3, I: 2, A: 3, Ld: 8 },
  "Bull Centaur Render Champion": { M: 7, WS: 5, BS: 3, S: 6, T: 5, W: 3, I: 3, A: 4, Ld: 8 },
  "K'daii Fireborn": { M: 6, WS: 4, BS: 2, S: 5, T: 4, W: 2, I: 4, A: 3, Ld: 8 },
  "K'daii Manburner": { M: 6, WS: 5, BS: 3, S: 6, T: 4, W: 2, I: 5, A: 4, Ld: 8 },
  "K'daii Destroyer": { M: 6, WS: 5, BS: 3, S: 7, T: 6, W: 6, I: 5, A: 6, Ld: 9 },
  "Chaos Siege Giant": { M: 6, WS: 3, BS: 3, S: 7, T: 6, W: 6, I: 3, A: "Spec", Ld: 10 },
  "Iron Daemon": { M: 5, WS: "-", BS: "-", S: 8, T: 7, W: 7, I: "-", A: "-", Ld: "-" },
  "Chaos Dwarf Juggernaut": { M: "-", WS: "-", BS: "-", S: 6, T: 6, W: 4, I: "-", A: "-", Ld: "-" },
  "Whirlwind/Tenderizer": { M: "-", WS: "-", BS: "-", S: 4, T: 4, W: 4, I: "-", A: "-", Ld: "-" },
  // --- Dark Elves ---
  "Dark Elf Assassin": { M: 5, WS: 9, BS: 9, S: 4, T: 4, W: 1, I: 10, A: 2, Ld: 10 },
  "Cold One": { M: 8, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 1, A: 2, Ld: 3 },
  "War Hydra": { M: 6, WS: 4, BS: 0, S: 5, T: 6, W: 7, I: 3, A: 5, Ld: 8 },
  "Black Dragon": { M: 6, WS: 6, BS: 0, S: 6, T: 6, W: 7, I: 8, A: 7, Ld: 7 },
  "Dark Elf Harpies": { M: 4, WS: 4, BS: 0, S: 4, T: 4, W: 2, I: 2, A: 1, Ld: 6 },
  "Dark Elf Warhounds": { M: 6, WS: 3, BS: 0, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 6 },
  "Dark Elf Executioners": { M: 5, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 6, A: 1, Ld: 8 },
  "Spite": { M: 8, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 1, A: 2, Ld: 3 },
  "Malekith The Witch King": { M: 5, WS: 7, BS: 7, S: 5, T: 5, W: 4, I: 9, A: 4, Ld: 10 },
  "Tullaris of Har Ganeth": { M: 5, WS: 6, BS: 6, S: 5, T: 5, W: 2, I: 6, A: 3, Ld: 9 },
  "Shadowblade, Master Assassin": { M: 5, WS: 10, BS: 10, S: 4, T: 4, W: 2, I: 10, A: 3, Ld: 10 },
  // --- Skaven ---
  "Vermin Lord": { M: 8, WS: 8, BS: 8, S: 8, T: 7, W: 7, I: 10, A: 8, Ld: 10 },
  "Skaven Warlord": { M: 5, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 7, A: 4, Ld: 7 },
  "Skaven Hero": { M: 5, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 6, A: 3, Ld: 6 },
  "Skaven BSB": { M: 5, WS: 4, BS: 4, S: 4, T: 3, W: 2, I: 5, A: 2, Ld: 5 },
  "Clan Pestilens Plague Priest": { M: 5, WS: 5, BS: 5, S: 4, T: 5, W: 2, I: 6, A: 3, Ld: 6 },
  "Clan Eshin Assassin": { M: 6, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 7 },
  "Grey Seer": { M: 5, WS: 6, BS: 6, S: 4, T: 4, W: 4, I: 7, A: 4, Ld: 7 },
  "Master Warlock": { M: 5, WS: 3, BS: 3, S: 4, T: 4, W: 3, I: 6, A: 2, Ld: 7 },
  "Warlock Champion": { M: 5, WS: 3, BS: 3, S: 4, T: 4, W: 2, I: 5, A: 1, Ld: 6 },
  "Warlock": { M: 5, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 5, A: 1, Ld: 5 },
  "Clanrat Warriors": { M: 5, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 4 },
  "Skaven Weapon Team": { M: 5, WS: 3, BS: 3, S: 3, T: 3, W: 2, I: 4, A: 1, Ld: 4 },
  "Plague Monks": { M: 5, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 4, A: 1, Ld: 4 },
  "Stormvermin": { M: 5, WS: 4, BS: 3, S: 4, T: 3, W: 1, I: 5, A: 1, Ld: 6 },
  "Gutter Runners": { M: 6, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 1, Ld: 6 },
  "Night Runners": { M: 6, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 5 },
  "Skaven Packmasters": { M: 6, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 4, A: 1, Ld: 7 },
  "Rat Ogres": { M: 6, WS: 4, BS: 0, S: 5, T: 5, W: 3, I: 5, A: 2, Ld: 5 },
  "Giant Rats": { M: 6, WS: 2, BS: 0, S: 2, T: 2, W: 1, I: 3, A: 1, Ld: 2 },
  "Skaven Slaves": { M: 5, WS: 2, BS: 2, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 2 },
  "Poison Wind Globadiers": { M: 5, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Plague Censer Bearers": { M: 5, WS: 4, BS: 0, S: 4, T: 4, W: 1, I: 4, A: 1, Ld: 7 },
  "Skaven Champion": { M: 5, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 5 },
  "Plague Acolyte": { M: 5, WS: 4, BS: 4, S: 4, T: 4, W: 1, I: 5, A: 2, Ld: 5 },
  "Stormvermin Champion": { M: 5, WS: 5, BS: 4, S: 5, T: 3, W: 1, I: 6, A: 2, Ld: 7 },
  "Gutter Runner Champion": { M: 6, WS: 5, BS: 4, S: 5, T: 3, W: 1, I: 6, A: 2, Ld: 7 },
  "Night Runner Champion": { M: 6, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 6 },
  "Doomwheel": { M: "3D6", WS: "-", BS: "-", S: 6, T: 6, W: 4, I: "-", A: "-", Ld: "-" },
  "Screaming Bell": { M: "-", WS: "-", BS: "-", S: 6, T: 6, W: 4, I: "-", A: "-", Ld: "-" },

  "Rat Swarms": { M: 6, WS: 3, BS: 0, S: 3, T: 2, W: 5, I: 1, A: 5, Ld: 10 },
  "Chief Assassin Deathmaster Snikch": { M: 6, WS: 8, BS: 6, S: 4, T: 4, W: 3, I: 10, A: 4, Ld: 9 },
  "Plaguelord Lord Skrolk": { M: 5, WS: 6, BS: 4, S: 4, T: 5, W: 3, I: 7, A: 4, Ld: 7 },
  "Chief Warlock Ikit Claw": { M: 5, WS: 5, BS: 3, S: 5, T: 4, W: 4, I: 8, A: 3, Ld: 9 },
  "Throt the Unclean": { M: 5, WS: 5, BS: 3, S: 5, T: 4, W: 2, I: 6, A: 4, Ld: 8 },
  "Warlord Queek Head-Taker": { M: 5, WS: 7, BS: 6, S: 4, T: 4, W: 3, I: 7, A: 5, Ld: 8 },
  "Boneripper": { M: 6, WS: 5, BS: 0, S: 5, T: 5, W: 3, I: 6, A: 3, Ld: 5 },

  "Necromancer Lord": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 4, I: 6, A: 3, Ld: 8 },
  "Master Necromancer": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 3, I: 5, A: 2, Ld: 7 },
  "Necromancer Champion": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 2, I: 4, A: 1, Ld: 7 },
  "Necromancer": { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 4, A: 1, Ld: 7 },
  "Vampire Lord": { M: 6, WS: 8, BS: 6, S: 7, T: 6, W: 4, I: 9, A: 4, Ld: 10 },
  "Vampire Count": { M: 6, WS: 7, BS: 5, S: 7, T: 6, W: 3, I: 8, A: 3, Ld: 9 },
  "Vampire BSB": { M: 6, WS: 6, BS: 4, S: 7, T: 5, W: 3, I: 7, A: 2, Ld: 8 },
  "Wight Hero": { M: 4, WS: 5, BS: 0, S: 5, T: 5, W: 2, I: 5, A: 3, Ld: 9 },
  "Wight BSB": { M: 4, WS: 4, BS: 0, S: 5, T: 4, W: 2, I: 4, A: 2, Ld: 8 },
  "Undead Steed": { M: 8, WS: 2, BS: 0, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
  "Winged Nightmare": { M: 8, WS: 3, BS: 0, S: 5, T: 5, W: 3, I: 2, A: 3, Ld: 5 },
  "Zombie Dragon": { M: 6, WS: 4, BS: 0, S: 7, T: 7, W: 7, I: 2, A: 7, Ld: 5 },
  "Ghoul": { M: 4, WS: 2, BS: 0, S: 3, T: 4, W: 1, I: 3, A: 2, Ld: 5 },
  "Giant Bat": { M: 2, WS: 3, BS: 0, S: 3, T: 3, W: 2, I: 3, A: 2, Ld: 5 },
  "Skeleton": { M: 4, WS: 2, BS: 2, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
  "Zombie": { M: 4, WS: 1, BS: 0, S: 3, T: 4, W: 1, I: 0, A: 1, Ld: 2 },
  "Wight": { M: 4, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 3, A: 1, Ld: 8 },
  "Spirit Host": { M: 6, WS: 3, BS: 0, S: 3, T: 3, W: 4, I: 1, A: 4, Ld: 4 },
  "Vampire Thrall": { M: 6, WS: 6, BS: 4, S: 7, T: 5, W: 2, I: 7, A: 2, Ld: 8 },
  "Wight Champion": { M: 4, WS: 4, BS: 0, S: 5, T: 4, W: 1, I: 4, A: 2, Ld: 8 },
  "Wraith Champion": { M: 4, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 3, A: 2, Ld: 8 },
  "Wraith": { M: 4, WS: 3, BS: 0, S: 3, T: 4, W: 3, I: 3, A: 2, Ld: 5 },
  "Banshee": { M: 6, WS: 3, BS: 0, S: 3, T: 4, W: 2, I: 3, A: 2, Ld: 8 },
  "Black Coach": { M: "-", WS: "-", BS: "-", S: 6, T: 6, W: 4, I: "-", A: "-", Ld: "-" },
  "Bat Swarm": { M: 1, WS: 3, BS: 0, S: 3, T: 2, W: 5, I: 1, A: 5, Ld: 10 },
  "Sylvania Peasant": { M: 4, WS: 2, BS: 2, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 6 },
  "Swain": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "War Horse": { M: 8, WS: 3, BS: 0, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 5 },
  "Vampire Knight": { M: 6, WS: 5, BS: 3, S: 6, T: 5, W: 2, I: 6, A: 1, Ld: 8 },
  "Ghast": { M: 6, WS: 3, BS: 0, S: 4, T: 5, W: 3, I: 2, A: 3, Ld: 5 },
  "Vampire Lord (Strigoi)": { M: 6, WS: 8, BS: 6, S: 7, T: 6, W: 4, I: 9, A: 5, Ld: 10 },
  "Vampire Count (Strigoi)": { M: 6, WS: 7, BS: 5, S: 7, T: 6, W: 3, I: 8, A: 4, Ld: 9 },
  "Vampire Thrall (Strigoi)": { M: 6, WS: 6, BS: 4, S: 7, T: 5, W: 2, I: 7, A: 3, Ld: 8 },
  "Lich Lord": { M: 4, WS: 7, BS: 7, S: 5, T: 4, W: 4, I: 6, A: 5, Ld: 10 },
  "Nagash": { M: 6, WS: 7, BS: 7, S: 8, T: 7, W: 7, I: 6, A: 6, Ld: 10 },
  "Krell": { M: 4, WS: 6, BS: 0, S: 5, T: 5, W: 3, I: 6, A: 4, Ld: 10 },

  "Undead Priest Lord": { M: 4, WS: 2, BS: 2, S: 4, T: 4, W: 4, I: 4, A: 3, Ld: 6 },
  "Master Undead Priest": { M: 4, WS: 2, BS: 2, S: 4, T: 4, W: 3, I: 3, A: 2, Ld: 5 },
  "Undead Priest Champion": { M: 4, WS: 2, BS: 2, S: 4, T: 4, W: 2, I: 2, A: 1, Ld: 5 },
  "Undead Priest": { M: 4, WS: 2, BS: 2, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 5 },
  "Mummy King": { M: 4, WS: 6, BS: 0, S: 5, T: 6, W: 4, I: 4, A: 5, Ld: 10 },
  "Mummy Prince": { M: 4, WS: 5, BS: 0, S: 5, T: 6, W: 3, I: 3, A: 4, Ld: 9 },
  "Mummy BSB": { M: 4, WS: 4, BS: 0, S: 5, T: 5, W: 3, I: 2, A: 3, Ld: 8 },
  "Tomb Guard": { M: 4, WS: 3, BS: 3, S: 4, T: 3, W: 1, I: 3, A: 1, Ld: 5 },
  "Mummy": { M: 4, WS: 3, BS: 0, S: 4, T: 5, W: 2, I: 1, A: 2, Ld: 8 },
  "Ushabti": { M: 5, WS: 4, BS: 2, S: 6, T: 4, W: 3, I: 3, A: 3, Ld: 10 },
  "Carrion": { M: 2, WS: 3, BS: 0, S: 3, T: 3, W: 2, I: 4, A: 4, Ld: 7 },
  "Tomb Champion": { M: 4, WS: 4, BS: 4, S: 5, T: 3, W: 1, I: 4, A: 2, Ld: 5 },
  "Mummy Champion": { M: 4, WS: 4, BS: 0, S: 5, T: 5, W: 2, I: 2, A: 3, Ld: 8 },
  "Bone Giant": { M: 6, WS: 3, BS: 0, S: 6, T: 5, W: 6, I: 3, A: 5, Ld: 8 },
  "Monstrous Scorpion": { M: 7, WS: 3, BS: 0, S: 4, T: 4, W: 4, I: 1, A: 2, Ld: 5 },
  "Scorpion Swarm": { M: 4, WS: 2, BS: 0, S: 3, T: 2, W: 5, I: 1, A: 5, Ld: 10 },
  "Settra the Imperishable": { M: 4, WS: 6, BS: 0, S: 5, T: 6, W: 4, I: 4, A: 5, Ld: 10 },
  "High Queen Khalida Neferher": { M: 4, WS: 6, BS: 0, S: 5, T: 6, W: 4, I: 4, A: 5, Ld: 10 },
  "Arkhan the Black": { M: 4, WS: 7, BS: 7, S: 5, T: 4, W: 4, I: 6, A: 5, Ld: 10 },

  "Boyar": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 9 },
  "Hetman": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Kislev BSB": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 2, I: 4, A: 2, Ld: 7 },
  "Priest of Ursun": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8 },
  "Ice Witch Lady": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 4, I: 6, A: 3, Ld: 8 },
  "Ice Witch Mistress": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 3, I: 5, A: 2, Ld: 7 },
  "Ice Witch Champion": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 2, I: 4, A: 1, Ld: 7 },
  "Ice Witch": { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 4, A: 1, Ld: 7 },
  "Great Bear": { M: 6, WS: 4, BS: 0, S: 6, T: 5, W: 3, I: 3, A: 2, Ld: 7 },
  "Kislevite Warrior": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Kislevite Lancer": { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Kislevite Knight": { M: 4, WS: 4, BS: 3, S: 4, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Kislevite Beastmaster": { M: 5, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 7 },
  "Kislevite Bear": { M: 4, WS: 3, BS: 0, S: 5, T: 5, W: 2, I: 3, A: 2, Ld: 6 },
  "Kislevite Captain": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 8 },
  "Kislevite Champion": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Boris Ursus": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 9 },
  "Prince Radinov": { M: 4, WS: 6, BS: 4, S: 4, T: 4, W: 2, I: 6, A: 2, Ld: 9 },
  "Tzar Saltan": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8 },
  "Stephan Rasin": { M: 4, WS: 4, BS: 4, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8 },
  "Ilja of Murova": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 2, I: 4, A: 3, Ld: 10 },
  "Igor the Terrible": { M: 4, WS: 5, BS: 5, S: 4, T: 4, W: 3, I: 4, A: 3, Ld: 9 },
  "Miska the Slaughterer": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 2, I: 8, A: 3, Ld: 9 },
  "Tzarina Katarin": { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 3, I: 5, A: 3, Ld: 10 },
  "Baba Yaga": { M: 4, WS: 3, BS: 3, S: 4, T: 4, W: 4, I: 6, A: 3, Ld: 8 },
  "Urskin": { M: 6, WS: 4, BS: 0, S: 6, T: 5, W: 4, I: 4, A: 4, Ld: 7 },
  "Chicken Legged Hut": { M: 10, WS: "-", BS: "-", S: 6, T: 6, W: 4, I: "-", A: "-", Ld: "-" },

  "Norse King": { M: 4, WS: 7, BS: 6, S: 4, T: 4, W: 3, I: 6, A: 4, Ld: 9 },
  "Norse Jarl": { M: 4, WS: 6, BS: 5, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },
  "Norse Shape Changer (beast form)": { M: 7, WS: 6, BS: 0, S: 6, T: 5, W: 4, I: 6, A: 4, Ld: 6 },
  "Norse BSB": { M: 4, WS: 5, BS: 4, S: 4, T: 3, W: 2, I: 4, A: 2, Ld: 7 },
  "Vølve/Gode Lord": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 4, I: 6, A: 3, Ld: 8 },
  "Master Vølve/Gode": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 3, I: 5, A: 2, Ld: 7 },
  "Vølve/Gode Champion": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 2, I: 4, A: 1, Ld: 7 },
  "Vølve/Gode": { M: 4, WS: 4, BS: 3, S: 3, T: 4, W: 1, I: 4, A: 1, Ld: 7 },
  "Norse Warrior": { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Norse Berserker": { M: 4, WS: 6, BS: 3, S: 4, T: 4, W: 1, I: 4, A: 1, Ld: 7 },
  "Norse Thrall": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 6 },
  "Norse Hunter": { M: 4, WS: 4, BS: 4, S: 3, T: 3, W: 1, I: 4, A: 1, Ld: 7 },
  "Norse Beastmaster": { M: 5, WS: 4, BS: 3, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 7 },
  "Norse Bear": { M: 4, WS: 4, BS: 0, S: 5, T: 5, W: 2, I: 3, A: 2, Ld: 5 },
  "Shieldmaiden": { M: 4, WS: 6, BS: 4, S: 4, T: 3, W: 1, I: 5, A: 2, Ld: 8 },
  "Ulfhednar": { M: 4, WS: 7, BS: 0, S: 5, T: 4, W: 1, I: 5, A: 2, Ld: 7 },
  "Mammoth": { M: 6, WS: 2, BS: 0, S: 7, T: 6, W: 6, I: 2, A: 5, Ld: 6 },
  "Regnar Lodbrog": { M: 4, WS: 7, BS: 6, S: 5, T: 4, W: 3, I: 6, A: 4, Ld: 10 },
  "Palnatoke": { M: 4, WS: 6, BS: 6, S: 4, T: 4, W: 2, I: 5, A: 3, Ld: 8 },

  "Moot General": { M: 4, WS: 5, BS: 7, S: 3, T: 3, W: 3, I: 8, A: 4, Ld: 10 },
  "Halfling Hero": { M: 4, WS: 4, BS: 6, S: 3, T: 3, W: 2, I: 7, A: 3, Ld: 9 },
  "Halfling Thief": { M: 5, WS: 4, BS: 4, S: 2, T: 2, W: 1, I: 10, A: 1, Ld: 8 },
  "Halfling BSB": { M: 4, WS: 3, BS: 5, S: 3, T: 2, W: 2, I: 6, A: 2, Ld: 8 },
  "Halfling Elite": { M: 4, WS: 3, BS: 4, S: 3, T: 2, W: 1, I: 6, A: 1, Ld: 8 },
  "Halfling Field Wardens": { M: 4, WS: 2, BS: 5, S: 2, T: 2, W: 1, I: 6, A: 1, Ld: 8 },
  "Livestock Beast": { M: 7, WS: 3, BS: 0, S: 2, T: 2, W: 1, I: 3, A: 1, Ld: 5 },
  "Flying Livestock": { M: 2, WS: 3, BS: 0, S: 2, T: 2, W: 1, I: 3, A: 1, Ld: 5 },
  "Flying Livestock Beast": { M: 2, WS: 3, BS: 0, S: 2, T: 2, W: 1, I: 3, A: 1, Ld: 5 },
  "Cockatrice": { M: 6, WS: 4, BS: 0, S: 5, T: 5, W: 4, I: 4, A: 3, Ld: 6 },
  "Cart (Halfling)": { M: "-", WS: "-", BS: "-", S: 5, T: 5, W: 4, I: "-", A: "-", Ld: "-" },
  "Wagon (Halfling)": { M: "-", WS: "-", BS: "-", S: 6, T: 6, W: 4, I: "-", A: "-", Ld: "-" },
  "Ogre Tyrant": { M: 7, WS: 6, BS: 5, S: 5, T: 6, W: 5, I: 6, A: 5, Ld: 9 },
  "Ogre Big Boss": { M: 6, WS: 5, BS: 4, S: 5, T: 6, W: 4, I: 5, A: 4, Ld: 8 },
  "Ogre BSB": { M: 6, WS: 4, BS: 3, S: 5, T: 5, W: 4, I: 4, A: 3, Ld: 7 },
  "Ogre Shaman Champion": { M: 6, WS: 3, BS: 2, S: 5, T: 6, W: 4, I: 4, A: 2, Ld: 7 },
  "Ogre Shaman": { M: 6, WS: 3, BS: 2, S: 4, T: 6, W: 3, I: 4, A: 2, Ld: 7 },
  "Ogre Leadbelcher": { M: 6, WS: 3, BS: 3, S: 4, T: 5, W: 3, I: 3, A: 2, Ld: 7 },
  "Ogre Maneater": { M: 6, WS: 4, BS: 3, S: 5, T: 5, W: 3, I: 4, A: 3, Ld: 7 },
  "Ogre Beastmaster": { M: 7, WS: 3, BS: 2, S: 4, T: 5, W: 3, I: 3, A: 2, Ld: 7 },
  "Sabretooth Tiger": { M: 8, WS: 4, BS: 0, S: 4, T: 4, W: 2, I: 4, A: 3, Ld: 4 },
  "Rhino": { M: 7, WS: 3, BS: 0, S: 5, T: 5, W: 4, I: 3, A: 3, Ld: 5 },

  "Lizardman Saurus Hero": { M: 4, WS: 5, BS: 0, S: 5, T: 5, W: 2, I: 3, A: 4, Ld: 9 },
  "Lizardman Saurus BSB": { M: 4, WS: 4, BS: 0, S: 5, T: 4, W: 2, I: 2, A: 3, Ld: 8 },
  "Lizardman Skink Hero": { M: 6, WS: 4, BS: 5, S: 4, T: 3, W: 2, I: 6, A: 3, Ld: 7 },
  "Lizardman Skink Shaman": { M: 6, WS: 2, BS: 3, S: 3, T: 3, W: 1, I: 5, A: 1, Ld: 6 },
  "Slann Mage Priest Lord": { M: 4, WS: 6, BS: 5, S: 6, T: 5, W: 8, I: 6, A: 8, Ld: 10 },
  "Master Slann Mage Priest": { M: 4, WS: 5, BS: 4, S: 6, T: 5, W: 6, I: 5, A: 6, Ld: 9 },
  "Slann Mage Priest Champion": { M: 4, WS: 4, BS: 3, S: 6, T: 4, W: 4, I: 3, A: 4, Ld: 8 },
  "Slann Mage Priest": { M: 4, WS: 3, BS: 2, S: 4, T: 4, W: 3, I: 2, A: 3, Ld: 8 },
  "Horned One": { M: 8, WS: 4, BS: 0, S: 4, T: 4, W: 1, I: 1, A: 3, Ld: 3 },
  "Terradon": { M: 2, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 2, A: 1, Ld: 3 },
  "Stegadon": { M: 6, WS: 2, BS: 0, S: 7, T: 6, W: 6, I: 2, A: 5, Ld: 6 },
  "Carnosaur": { M: 7, WS: 3, BS: 0, S: 7, T: 5, W: 5, I: 2, A: 4, Ld: 5 },
  "Lizardman Saurus Warrior": { M: 4, WS: 3, BS: 0, S: 4, T: 4, W: 1, I: 1, A: 2, Ld: 8 },
  "Lizardman Saurus Temple Guard": { M: 4, WS: 4, BS: 0, S: 4, T: 4, W: 1, I: 2, A: 2, Ld: 8 },
  "Lizardman Skink Warrior": { M: 6, WS: 2, BS: 3, S: 3, T: 2, W: 1, I: 4, A: 1, Ld: 6 },
  "Lizardman Great Crested Skink Warrior": { M: 6, WS: 2, BS: 3, S: 4, T: 2, W: 1, I: 4, A: 1, Ld: 6 },
  "Lizardman Chameleon Skink": { M: 6, WS: 2, BS: 4, S: 3, T: 2, W: 1, I: 4, A: 1, Ld: 6 },
  "Lizardman Kroxigor": { M: 6, WS: 3, BS: 0, S: 5, T: 4, W: 3, I: 1, A: 3, Ld: 9 },
  "Lizardman Saurus Champion": { M: 4, WS: 4, BS: 0, S: 5, T: 4, W: 1, I: 2, A: 3, Ld: 8 },
  "Lizardman Skink Champion": { M: 6, WS: 3, BS: 4, S: 4, T: 2, W: 1, I: 5, A: 2, Ld: 6 },
  "Chameleon Skink Champion": { M: 6, WS: 3, BS: 5, S: 4, T: 2, W: 1, I: 5, A: 2, Ld: 6 },
  "Salamander": { M: 6, WS: 3, BS: 3, S: 4, T: 4, W: 3, I: 2, A: 3, Ld: 6 },
  "Jungle Swarms": { M: 4, WS: 2, BS: 0, S: 3, T: 2, W: 5, I: 1, A: 5, Ld: 10 },
  "Oxayotl": { M: 6, WS: 4, BS: 5, S: 4, T: 4, W: 3, I: 7, A: 3, Ld: 7 },
  "Emperor Mazdamundi": { M: 6, WS: 6, BS: 5, S: 7, T: 6, W: 8, I: 6, A: 8, Ld: 10 },

  "Slann Warlord": { M: 4, WS: 6, BS: 5, S: 4, T: 5, W: 3, I: 6, A: 4, Ld: 10 },
  "Slann Hero": { M: 4, WS: 5, BS: 4, S: 4, T: 5, W: 2, I: 5, A: 3, Ld: 9 },
  "Slann BSB": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8 },
  "Slann Empire Mage Priest Lord": { M: 4, WS: 3, BS: 2, S: 4, T: 5, W: 8, I: 6, A: 7, Ld: 10 },
  "Slann Empire Master Mage Priest": { M: 4, WS: 3, BS: 2, S: 4, T: 5, W: 7, I: 5, A: 6, Ld: 9 },
  "Slann Empire Mage Priest Champion": { M: 4, WS: 3, BS: 2, S: 4, T: 5, W: 6, I: 4, A: 5, Ld: 8 },
  "Slann Empire Mage Priest": { M: 4, WS: 3, BS: 2, S: 3, T: 5, W: 5, I: 4, A: 5, Ld: 8 },
  "Slann Warrior": { M: 4, WS: 3, BS: 2, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 8 },
  "Slann Beastmaster": { M: 5, WS: 3, BS: 2, S: 3, T: 5, W: 1, I: 3, A: 1, Ld: 8 },
  "Lizard Hound": { M: 6, WS: 3, BS: 0, S: 4, T: 3, W: 1, I: 3, A: 2, Ld: 6 },
  "Slann Venom Tribe": { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 8 },
  "Slann Totem Warrior": { M: 4, WS: 4, BS: 2, S: 4, T: 4, W: 1, I: 4, A: 1, Ld: 8 },
  "Lobotomised Human Slave": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Ghoulish Cannibal Tribe": { M: 4, WS: 2, BS: 3, S: 3, T: 4, W: 1, I: 3, A: 2, Ld: 5 },
  "Amazon Warrior": { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7 },
  "Slann Champion": { M: 4, WS: 4, BS: 3, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 8 },
  "Slann Spawn Master": { M: 4, WS: 5, BS: 3, S: 4, T: 4, W: 1, I: 4, A: 2, Ld: 9 },
  "Ghoul Champion (Slann)": { M: 4, WS: 3, BS: 4, S: 4, T: 4, W: 1, I: 4, A: 3, Ld: 5 },
  "Amazon Champion": { M: 4, WS: 4, BS: 4, S: 4, T: 3, W: 1, I: 4, A: 2, Ld: 7 },
  "Toad Master Drulndribl": { M: 4, WS: 7, BS: 5, S: 4, T: 5, W: 3, I: 6, A: 4, Ld: 10 },

  "Treeman Ancient": { M: 6, WS: 8, BS: 3, S: 7, T: 7, W: 6, I: 3, A: 5, Ld: 9 },
  "Tree-Kin": { M: 5, WS: 4, BS: 0, S: 5, T: 5, W: 3, I: 3, A: 3, Ld: 8 },
  "Eternal Guards": { M: 5, WS: 5, BS: 4, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Rangers": { M: 5, WS: 5, BS: 4, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Wild Riders": { M: 5, WS: 5, BS: 4, S: 4, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Sisters of the Thorn": { M: 5, WS: 5, BS: 4, S: 3, T: 3, W: 1, I: 7, A: 1, Ld: 8 },
  "Stag": { M: 9, WS: 3, BS: 0, S: 4, T: 3, W: 1, I: 4, A: 1, Ld: 5 },
  "Zoat Character": { M: 7, WS: 6, BS: 4, S: 5, T: 5, W: 3, I: 7, A: 3, Ld: 10 },
  "Zoat Warrior": { M: 7, WS: 5, BS: 3, S: 4, T: 5, W: 3, I: 6, A: 2, Ld: 8 },
};
const STAT_ROW_ORDER = ["M", "WS", "BS", "S", "T", "W", "I", "A", "Ld"];

/* ============================================================================
   MAGIC ITEMS
   ========================================================================== */

// Common Magic Items — available to any army (subject to the restrictions below), per the Common
// Magic Items rules. Merged into every faction's magicItems pool (minus arcane/familiar for
// Dwarfs, who cannot use bound spells or arcane items at all).
// subtype on weapon/armour items gates against a bearer's allowedWeaponSubtypes/allowedArmourSubtypes
// (undefined on a bearer = unrestricted, i.e. no behavior change until that bearer is audited).
// Arcane items and Familiars are wizard-only (restrictedTo tags:["wizard"], resolved dynamically
// via isWizard — see itemContext). Familiars are additionally on-foot only.
// 8 items carry a `requiresLore` field (a specific College Magic lore) — still selectable by any
// wizard (restrictedTo stays tags:["wizard"] only, so this isn't a hard block), but flagged via
// a roster warning if the bearer's chosen Lore of Magic (see resolveWizardLore) doesn't match.
const COMMON_MAGIC_ITEMS = [
  // Magic Weapons
  { id: "cm-bitingblade", name: "Biting Blade", cost: 10, cat: "weapon", subtype: "handWeapon", desc: "-2 to armour save." },
  { id: "cm-bladeleapingcopper", name: "Blade of Leaping Copper", cost: 10, cat: "weapon", subtype: "handWeapon", desc: "+1A." },
  { id: "cm-bladeslorenzo", name: "Blades of Lorenzo", cost: 10, cat: "weapon", subtype: "handWeapon", desc: "Two hand weapons, +3 WS." },
  { id: "cm-swordswiftslaying", name: "Sword of Swift Slaying", cost: 10, cat: "weapon", subtype: "handWeapon", desc: "Always strike first." },
  { id: "cm-swordofmight", name: "Sword of Might", cost: 15, cat: "weapon", subtype: "handWeapon", desc: "+1S." },
  { id: "cm-wyrmslayersword", name: "Wyrmslayer Sword", cost: 15, cat: "weapon", subtype: "handWeapon", desc: "Always wound on 4+ or better. Large targets have no armour save." },
  { id: "cm-heartseeker", name: "Heart Seeker", cost: 15, cat: "weapon", subtype: "handWeapon", desc: "May re-roll missed attacks." },
  { id: "cm-skyarrownaloer", name: "Sky Arrow of Naloer", cost: 15, cat: "weapon", subtype: "bow", desc: "The bearer must have a short bow, bow, or longbow. One use only. Must be shot at models flying high. No modifiers to hit apply. S10. 1 wound = 1D6 wounds." },
  { id: "cm-bladeseagold", name: "Blade of Sea Gold", cost: 20, cat: "weapon", subtype: "handWeapon", desc: "-3 to armour save." },
  { id: "cm-flailofskulls", name: "Flail of Skulls", cost: 20, cat: "weapon", subtype: "handWeapon", desc: "Flail. 1 wound = 2 wounds." },
  { id: "cm-blessedsword", name: "Blessed Sword", cost: 20, cat: "weapon", subtype: "handWeapon", desc: "WS 10." },
  { id: "cm-starlance", name: "Star Lance", cost: 20, cat: "weapon", subtype: "lance", desc: "Lance. S10 (only on the charge)." },
  { id: "cm-parryingblade", name: "Parrying Blade", cost: 25, cat: "weapon", subtype: "handWeapon", desc: "All enemy models in base contact have one less A. Treat Cavalry, Chariots and Ridden Monsters as just one model. It is the owner of the model losing the attack who decides which attack is forfeit. This effect stacks when combined with items and abilities of similar kind." },
  { id: "cm-venomsword", name: "Venom Sword", cost: 25, cat: "weapon", subtype: "handWeapon", desc: "1 wound = 1D6 wounds." },
  { id: "cm-bladeleapingbronze", name: "Blade of Leaping Bronze", cost: 30, cat: "weapon", subtype: "handWeapon", desc: "+2A." },
  { id: "cm-ogreblade", name: "Ogre Blade", cost: 30, cat: "weapon", subtype: "handWeapon", desc: "+2S." },
  { id: "cm-broadswordensorcelled", name: "Broadsword of Ensorcelled Iron", cost: 30, cat: "weapon", subtype: "twoHanded", desc: "Double handed weapon, +1 to hit." },
  { id: "cm-berserkersword", name: "Berserker Sword", cost: 30, cat: "weapon", subtype: "handWeapon", desc: "The bearer gains frenzy and +1S." },
  { id: "cm-swordfortitude", name: "Sword of Fortitude", cost: 35, cat: "weapon", subtype: "handWeapon", desc: "The bearer and the bearer's regiment are immune to psychology." },
  { id: "cm-gromrilblade", name: "Gromril Blade", cost: 35, cat: "weapon", subtype: "handWeapon", desc: "No armour save allowed." },
  { id: "cm-macehelsturm", name: "Mace of Helsturm", cost: 35, cat: "weapon", subtype: "handWeapon", desc: "The bearer forfeits normal attacks and makes one attack with S10 where 1 wound = 1D6 wounds." },
  { id: "cm-swordofteclis", name: "Sword of Teclis", cost: 40, cat: "weapon", subtype: "handWeapon", desc: "Wounds automatically." },
  { id: "cm-bladedartingsteel", name: "Blade of Darting Steel", cost: 40, cat: "weapon", subtype: "handWeapon", desc: "Hits automatically." },
  { id: "cm-giantblade", name: "Giant Blade", cost: 45, cat: "weapon", subtype: "handWeapon", desc: "+3S." },
  { id: "cm-dragonblade", name: "Dragon Blade", cost: 45, cat: "weapon", subtype: "handWeapon", desc: "Each hit becomes two hits. Roll to wound separately for each hit. If the attacks are directed against a single model, the model is hit twice as many times. If the attacks are directed against (identical) troops, twice as many models are hit." },
  { id: "cm-swordofheroes", name: "Sword of Heroes", cost: 50, cat: "weapon", subtype: "handWeapon", desc: "Against opponents with T5 or more: +3S, 1 wound = 1D3 wounds." },
  { id: "cm-bladeleapinggold", name: "Blade of Leaping Gold", cost: 60, cat: "weapon", subtype: "handWeapon", desc: "+3A." },
  { id: "cm-daemonslayer", name: "Daemon Slayer", cost: 85, cat: "weapon", subtype: "handWeapon", desc: "All hits inflict 1D3 wounds on Daemons with no armour save possible. Against other targets: +3S. 1 wound = 1D3 wounds." },
  { id: "cm-dragonslayer", name: "Dragon Slayer", cost: 85, cat: "weapon", subtype: "handWeapon", desc: "All hits inflict 1D3 wounds on Dragons with no armour save possible. Against other targets: +3S. 1 wound = 1D3 wounds." },
  { id: "cm-abolisherblade", name: "Abolisher Blade", cost: 100, cat: "weapon", subtype: "handWeapon", desc: "Wielder may not carry other magic items. No magic items in base contact with the wielder work." },
  { id: "cm-frostblade", name: "Frost Blade", cost: 100, cat: "weapon", subtype: "handWeapon", desc: "A wounded opponent is killed instantly." },
  { id: "cm-hydrasword", name: "Hydra Sword", cost: 125, cat: "weapon", subtype: "handWeapon", desc: "Each hit becomes 1D6 hits. Roll to wound separately for each hit. If the attacks are directed against a single model, the model is hit more times. If the attacks are directed against (identical) troops, more models are hit." },
  { id: "cm-hellfiresword", name: "Hellfire Sword", cost: 125, cat: "weapon", subtype: "handWeapon", desc: "S10. Flaming. Killed enemies burst into flames and immediately cause a panic test in the regiment the victim was a part of." },

  // Magic Armour
  { id: "cm-dragonhelm", name: "Dragonhelm", cost: 10, cat: "armour", subtype: "helmet", desc: "The bearer (but not the bearer's mount) is immune to fire-based attacks and breath weapons. The bearer is immune to terror." },
  { id: "cm-enchantedshield", name: "Enchanted Shield", cost: 10, cat: "armour", subtype: "shield", desc: "+1 armour save." },
  { id: "cm-armourendurance", name: "Armour of Endurance", cost: 10, cat: "armour", subtype: "heavyArmour", desc: "Heavy armour. 6+ ward save." },
  { id: "cm-shieldptolos", name: "Shield of Ptolos", cost: 15, cat: "armour", subtype: "shield", desc: "1+ armour save (that cannot be improved) vs. shooting only (including ranged spells)." },
  { id: "cm-armourresilience", name: "Armour of Resilience", cost: 15, cat: "armour", subtype: "heavyArmour", desc: "Heavy armour. +1 armour save." },
  { id: "cm-oakenarmour", name: "Oaken Armour", cost: 15, cat: "armour", subtype: "lightArmour", desc: "Light armour. +1W." },
  { id: "cm-charmedshield", name: "Charmed Shield", cost: 20, cat: "armour", subtype: "shield", desc: "Discount the first hit against the bearer. This means the first successful hit during the battle by a melee opponent or ranged attack or spell provided it is of the kind that would potentially wound the bearer. The hit is discounted before determining if it wounds." },
  { id: "cm-adamantarmour", name: "Adamant Armour", cost: 25, cat: "armour", subtype: "heavyArmour", desc: "Heavy armour. +1T." },
  { id: "cm-dawnarmour", name: "Dawn Armour", cost: 25, cat: "armour", subtype: "heavyArmour", desc: "Heavy armour. Bearer may re-roll failed armour saves." },
  { id: "cm-trollhidearmour", name: "Trollhide Armour", cost: 25, cat: "armour", subtype: "lightArmour", desc: "Light armour. Regeneration save 4+." },
  { id: "cm-shiningshield", name: "Shining Shield", cost: 25, cat: "armour", subtype: "shield", desc: "Enemies suffer -1 to hit against the bearer and his mount." },
  { id: "cm-emeraldarmour", name: "Emerald Armour", cost: 25, cat: "armour", subtype: "lightArmour", desc: "Light armour. Ignore first wound suffered. This means the first wound suffered during the battle is discounted before taking any saving throw (even if not permitted) and therefore before resolving any additional effect such as multiple wounds." },
  { id: "cm-armourfortune", name: "Armour of Fortune", cost: 30, cat: "armour", subtype: "heavyArmour", desc: "Heavy armour. Ward save 5+." },
  { id: "cm-armourmeteoriciron", name: "Armour of Meteoric Iron", cost: 30, cat: "armour", subtype: "lightArmour", desc: "Light armour. 2+ armour save (that cannot be improved)." },
  { id: "cm-parryingshield", name: "Parrying Shield", cost: 40, cat: "armour", subtype: "shield", desc: "All enemy models in base contact have one less A. Treat Cavalry, Chariots and Ridden Monsters as just one model. It is the owner of the model losing the attack who decides which attack is forfeit. This effect stacks when combined with items and abilities of similar kind." },
  { id: "cm-shieldmagicimmunity", name: "Shield of Magic Immunity", cost: 50, cat: "armour", subtype: "shield", desc: "The bearer (but not the bearer's mount) is immune to the effect of spells. (The bearer's regiment may still be affected by spells, i.e., if the regiment is teleported, the character remains where he is and so on.)" },
  { id: "cm-spelleatershield", name: "Spelleater Shield", cost: 50, cat: "armour", subtype: "shield", desc: "Natural dispel 4+, dispelled spells are destroyed on a further roll of 4+." },
  { id: "cm-armourunyielding", name: "Armour of Unyielding", cost: 50, cat: "armour", subtype: "heavyArmour", desc: "Heavy armour. +2T." },
  { id: "cm-armourprotection", name: "Armour of Protection", cost: 60, cat: "armour", subtype: "heavyArmour", desc: "Heavy armour. Ward save 4+." },
  { id: "cm-armourbrilliance", name: "Armour of Brilliance", cost: 70, cat: "armour", subtype: "heavyArmour", desc: "Heavy armour. Enemies suffer a -2 to hit against the bearer and the bearer's mount." },

  // Enchanted Items
  { id: "cm-potionhealing", name: "Potion of Healing", cost: 10, cat: "enchanted", desc: "The bearer recovers 1D6 lost wounds. May not be imbibed when the bearer is slain. Living models only. One use only." },
  { id: "cm-nullstonering", name: "Nullstone Ring", cost: 10, cat: "enchanted", desc: "No model in base contact with the bearer can cast spells." },
  { id: "cm-ghostring", name: "Ghost Ring", cost: 10, cat: "enchanted", desc: "The bearer and his mount can move through solid objects and any kind of terrain. The bearer may not move through enemy troops. Note that the move must take the bearer clear of impassable terrain." },
  { id: "cm-talismanravensdark", name: "Talisman of Ravensdark", cost: 10, cat: "enchanted", desc: "Flying creatures (and their riders) cannot strike against the bearer (and his mount) in melee combat. This item cannot be carried by a character that can fly or that rides a mount with the fly ability." },
  { id: "cm-orbthunder", name: "Orb of Thunder", cost: 10, cat: "enchanted", desc: "Bound spell. One use only. All creatures flying high are driven off. No flying movement is possible, use ground move instead. Remains in play." },
  { id: "cm-crimsonamulet", name: "Crimson Amulet", cost: 15, cat: "enchanted", desc: "The bearer automatically passes any characteristic test except LD tests." },
  { id: "cm-vanhorstmannspeculum", name: "Van Horstmann's Speculum", cost: 15, cat: "enchanted", desc: "In a challenge the bearer fights with his opponent's number of A, WS and S as they appear on the opponent's profile. The bearer attacks at exactly the same time as his opponent even if carrying a double handed weapon (in effect, the two models could kill each other simultaneously)." },
  { id: "cm-amuletfire", name: "Amulet of Fire", cost: 20, cat: "enchanted", desc: "Natural dispel 4+. Can only be used once each magic phase." },
  { id: "cm-potionstrength", name: "Potion of Strength", cost: 20, cat: "enchanted", desc: "+3S in one melee combat round. Must be imbibed just before attacking. One use only." },
  { id: "cm-pipesofdoom", name: "Pipes of Doom", cost: 20, cat: "enchanted", footOnly: true, desc: "When the bearer and the bearer's regiment are charged by cavalry, the charging unit must take a LD test (even if immune to psychology). If the test is failed, the cavalry regiment does not move (and the charge is failed). Models on foot only." },
  { id: "cm-drumsswiftreform", name: "Drums of Swift Reform", cost: 20, cat: "enchanted", footOnly: true, desc: "The bearer and his regiment may make a complete reform before and after taking a normal move or even a march move. Models on foot only." },
  { id: "cm-blackgemgnar", name: "Black Gem of Gnar", cost: 20, cat: "enchanted", desc: "In a challenge, the bearer and his opponent (and any mounts) do not strike blows in the first round of melee combat, as they are frozen in time." },
  { id: "cm-drumsmarching", name: "Drums of Marching", cost: 20, cat: "enchanted", footOnly: true, desc: "The bearer's regiment can march even if there is an enemy unit within 8\" at the start of the turn. Infantry only." },
  { id: "cm-talismanluck", name: "Talisman of Luck", cost: 25, cat: "enchanted", desc: "The bearer may re-roll one personal die roll. One use only." },
  { id: "cm-jadeamulet", name: "Jade Amulet", cost: 30, cat: "enchanted", desc: "+1T." },
  { id: "cm-ringvolans", name: "Ring of Volans", cost: 30, cat: "enchanted", desc: "Bound spell. Before the battle, select one spell from one of the eight College Magic lores requiring only one or two power cards to cast. This spell can be cast as a bound spell once in the game. One use only." },
  { id: "cm-clawnagash", name: "Claw of Nagash", cost: 35, cat: "enchanted", desc: "Bound spell. Can be used against a single living model within 8\". The model suffers 1D6 wounds, no armour save allowed. One use only." },
  { id: "cm-ringcorin", name: "Ring of Corin", cost: 45, cat: "enchanted", desc: "Bound spell. Destroys the magic properties of a magic item within 12\" of the bearer of the Ring of Corin if the bearer can identify the name of the opposing player's magic item (only one guess permitted). Cannot be used against magic scrolls." },
  { id: "cm-hornurgok", name: "Horn of Urgok", cost: 50, cat: "enchanted", desc: "Bound spell. Casts the Grey spell Horn of Andar. Can be used three times only." },
  { id: "cm-rubychalice", name: "Ruby Chalice", cost: 50, cat: "enchanted", desc: "Enemies suffer a -2 to hit with missiles against the bearer, the bearer's mount, and the bearer's regiment." },
  { id: "cm-crowncommand", name: "Crown of Command", cost: 50, cat: "enchanted", desc: "LD 10." },
  { id: "cm-talismanobsidian", name: "Talisman of Obsidian", cost: 75, cat: "enchanted", desc: "Neither the bearer, nor anyone within his regiment, can cast spells, and spells cast against the bearer and the bearer's regiment are dispelled automatically (except if cast with Total Power). This applies to spells cast by friends and enemies alike." },

  // Arcane Items (wizards only)
  { id: "cm-skullstaff", name: "Skull Staff", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "In each magic phase, at your request, your opponent must reveal the magic items and spells of all their models that are within 12\" of the wizard bearing the skull staff." },
  { id: "cm-enchantedmirror", name: "Enchanted Mirror", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Dispel attempts made by the bearer always succeed on 4+ (or better)." },
  { id: "cm-staffstealing", name: "Staff of Stealing", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Used when winds of magic are rolled. Your side steals one (1) magic card from your enemy. One use only." },
  { id: "cm-powerscroll", name: "Power Scroll", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Automatically powers one of the wizard's spells. One use only." },
  { id: "cm-infusionwhite", name: "Infusion of White", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Used when winds of magic are rolled. The bearer gains 1D6 extra magic cards that only he/she can use. On a roll of six the wizard ODs after the magic phase ends (passes out for the rest of the battle, is hit automatically if attacked in melee combat). One use only." },
  { id: "cm-seerstone", name: "Seerstone", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "For each extra power card spent when attempting to cast a spell, the wizard may increase the range of the spell by 12\". No effect on spells with no range, spells with a radius effect centred on the wizard, or bound spells." },
  { id: "cm-cloakhorrors", name: "Cloak of Horrors", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], requiresLore: "Amber", desc: "An arcane item exclusive to wizards using the Amber lore. Lets the wizard swap a dealt spell for Savage Beast of Horrors and amplifies its effects (6 automatic hits at S6; bearer's own T becomes 6 while active)." },
  { id: "cm-stormcrowstaff", name: "Stormcrow Staff", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], requiresLore: "Celestial", desc: "An arcane item and bound spell, Celestial lore only. Usable only against flying units, 18\" range, LoS required (flying-high units always count as in LoS). Target suffers 1D6 lightning S6 hits, no armour save." },
  { id: "cm-teclistextbook", name: "Teclis' Textbook", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "The owner may use any one of the eight lores of College Magic instead of their normal lore. Takes up a magic item slot but is not strictly a magic item, and cannot be destroyed." },
  { id: "cm-flameforgedcape", name: "Flameforged Cape", cost: 10, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], requiresLore: "Bright", desc: "An arcane item exclusive to wizards using the Bright lore. Lets the wizard swap a dealt spell for Scarlet Scimitar and amplifies it — while active, all attempts to hit the bearer (melee or ranged, even normally-automatic ones) require a natural 6." },
  { id: "cm-purplereaper", name: "Purple Reaper", cost: 20, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], requiresLore: "Amethyst", desc: "An arcane item limited to wizards using the Amethyst lore. Lets the wizard swap a dealt spell for Purple Scythe and amplifies it to 1D6 S10 hits (instead of 1D3 S5) on each enemy model in base contact. May be used even while mounted." },
  { id: "cm-dispelmagicscroll", name: "Dispel Magic Scroll", cost: 25, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Automatically dispels an enemy spell, even if cast with Total Power and including spells cast in a previous turn that remain in play. One use only. You may include two unless playing with the \"Veto One Spell\" house rule, in which case only one — offered as two separate entries below so both can be selected." },
  { id: "cm-dispelmagicscroll2", name: "Dispel Magic Scroll", cost: 25, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Second copy — see above. Only include this one if not playing with the \"Veto One Spell\" house rule." },
  { id: "cm-ringdarkness", name: "Ring of Darkness", cost: 30, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Bound spell. The wizard becomes ethereal, as described in the Undead army book. Remains in play." },
  { id: "cm-amuletsteel", name: "Amulet of Steel", cost: 30, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], requiresLore: "Gold", desc: "An arcane item and bound spell, Gold lore only. Cast on any unit within 18\" and LoS: enemies suffer -2 armour save, friendly units gain +2 (or 5+ if they had none). Lasts until the next magic phase." },
  { id: "cm-crownshadows", name: "Crown of Shadows", cost: 30, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], requiresLore: "Grey", desc: "An arcane item, Grey lore only. Lets the wizard swap a dealt spell for Crown of Taidron and extends its range to 18\" (from 3\"); costs one power, 1D6 lightning S6 hits distributed like normal shooting." },
  { id: "cm-booksecrets", name: "Book of Secrets", cost: 40, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Used just after rolling for winds of magic. Discard any number of magic cards not belonging to a particular wizard and immediately draw replacements." },
  { id: "cm-whitecloak", name: "White Cloak", cost: 40, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], requiresLore: "Light", desc: "An arcane item, Light lore only. Lets the wizard swap a dealt spell for Shimmering Cloak and extends its protection to any regiment the bearer joins." },
  { id: "cm-wandresurrection", name: "Wand of Resurrection", cost: 50, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], requiresLore: "Jade", desc: "An arcane item, Jade lore only. Whenever a Jade spell is successfully cast, revive one fallen rank-and-file cavalry model or two infantry models (own or friendly regiment within 18\" and LoS, capped at starting model count). Living creatures only — no effect on undead, Daemons, or constructs." },
  { id: "cm-bookashur", name: "Book of Ashur", cost: 50, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "+1 magic level. Does not increase the number of magic items the wizard may carry." },
  { id: "cm-orbforbiddenknowledge", name: "Orb of Forbidden Knowledge", cost: 50, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "For purposes of casting and dispelling, the bearer always counts as having two magic levels more than he actually has." },
  { id: "cm-destroymagicscroll", name: "Destroy Magic Scroll", cost: 50, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Automatically dispels an enemy spell, even if cast with Total Power and including spells cast in a previous turn that remain in play. Furthermore, roll 1D6, on a 4+ the spell is destroyed (bound spells re-roll a successful destroy). One use only." },
  { id: "cm-chalicesorcery", name: "Chalice of Sorcery", cost: 75, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Once per magic phase the wizard may drink from the chalice when casting a spell — the spell is cast for free. Afterwards roll 1D6: on a 1-2 the wizard suffers one wound (no save) and the chalice is empty." },
  { id: "cm-staffthreesisters", name: "Staff of the Three Sisters", cost: 75, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Dispel attempts made by the bearer always succeed on 3+ or better." },
  { id: "cm-doomfiring", name: "Doomfire Ring", cost: 75, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Bound spell. A firebolt of doom strikes a visible enemy unit within 24\": 2D6 flaming S4 hits, distributed like normal shooting, normal armour saves apply. Usable three times only." },
  { id: "cm-wandjet", name: "Wand of Jet", cost: 75, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Reduces the cost of casting a spell by one power card (power-one spells cast free). Usable once per magic phase; each use costs the caster 1D6 characteristic points (BS/I/LD/etc., distributed as chosen), permanently. If any characteristic is reduced to 0, the wizard dies." },
  { id: "cm-staffflamingdeath", name: "Staff of Flaming Death", cost: 75, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "Bound spell. A large fireball strikes a visible enemy unit within 12\": 1D6 flaming S5 hits, distributed like normal shooting, normal armour saves apply." },
  { id: "cm-staffmanycolouredtraitor", name: "Staff of the Many Coloured Traitor", cost: 125, cat: "arcane", restrictedTo: [{ tags: ["wizard"] }], desc: "All successful rolls to dispel spells cast by the bearer of this item must be re-rolled. Does not include bound spells." },

  // Familiars (wizards on foot only)
  { id: "cm-scrollfamiliar", name: "Scroll Familiar", cost: 10, cat: "familiar", restrictedTo: [{ tags: ["wizard"] }], footOnly: true, desc: "May carry two scrolls just as a character; usable by its master only while in base contact with it." },
  { id: "cm-warriorfamiliar", name: "Warrior Familiar", cost: 30, cat: "familiar", restrictedTo: [{ tags: ["wizard"] }], footOnly: true, desc: "If its master is attacked in melee (even in a challenge), the Familiar interposes itself and must be killed before hits can be allocated against the wizard. Always strikes first. M5 WS5 BS0 S5 T5 W1 I6 A2 Ld10." },
  { id: "cm-spellfamiliar", name: "Spell Familiar", cost: 30, cat: "familiar", restrictedTo: [{ tags: ["wizard"] }], footOnly: true, desc: "After spells are dealt, may pick a spell from its master's lore not already in its master's possession; the master may cast it while in base contact with the familiar. M5 WS3 BS3 S2 T3 W1 I4 A1 Ld8." },

  // Magic Banners
  { id: "cm-endlessbanner", name: "Endless Banner", cost: 0, cat: "banner", excludeTags: ["bsb"], regimentDiscount: { pct: 0.20, capNormal: 50, capLarge: 100, largeThreshold: 3000 }, minRegimentSize: 40,
    desc: "Free. Cannot be given to a regiment carrying missile weapons, and can't be carried by a Battle Standard Bearer. Can only be given to a regiment of at least 40 models. Makes the regiment 20% cheaper (capped at a 50pt discount, or 100pts in battles of 3000+pts a side) — but the unit can't take any other magic banner. Not magical itself; its effects can't be removed or cancelled." },
  { id: "cm-bannerofchampions", name: "Banner of Champions", cost: 0, cat: "banner", isBannerOfChampions: true,
    desc: "Free. No magical effects (cannot be negated). The regimental champion's cost counts towards Regiments instead of Characters/Monsters/War Machines/Chariots, as long as the champion carries no magic items, doesn't ride a chariot or monstrous model, has no special rule occupying a magic item slot, and can't cast spells. If given to the Battle Standard Bearer instead, this applies to every regimental champion in the army (meeting the same conditions)." },
  { id: "cm-flamingstandard", name: "Flaming Standard", cost: 10, cat: "banner", desc: "All attacks (both melee and missile) count as flaming and magical." },
  { id: "cm-impetuousstandard", name: "Impetuous Standard", cost: 10, cat: "banner", desc: "Enemy units that declare they will stand and shoot in reaction to a charge by a unit with this standard will not be able to shoot and will hold instead." },
  { id: "cm-bifrostbanner", name: "Bifrost Banner", cost: 20, cat: "banner", desc: "For movement purposes, treat difficult terrain, steep slopes, and water (including swamps and quicksand) as open terrain — no movement penalties apply. Line of sight is unaffected." },
  { id: "cm-assaultbanner", name: "Assault Banner", cost: 20, cat: "banner", desc: "+1S on the first charge made by the bearer's unit (does not apply to mounts). One use only." },
  { id: "cm-bannerlegion", name: "Banner of Legion", cost: 25, cat: "banner", desc: "May claim up to +4 in rank bonus." },
  { id: "cm-phalanxstandard", name: "Phalanx Standard", cost: 25, cat: "banner", desc: "One extra rank fights to the front in melee combat with one attack. Infantry only." },
  { id: "cm-bannerspellprotection", name: "Banner of Spell Protection", cost: 30, cat: "banner", desc: "Natural dispel 4+." },
  { id: "cm-bannerglory", name: "Banner of Glory", cost: 30, cat: "banner", desc: "+1 WS (does not apply to mounts)." },
  { id: "cm-bannermight", name: "Banner of Might", cost: 30, cat: "banner", desc: "+1 to hit on the first charge made by the bearer's unit (does not apply to mounts). One use only." },
  { id: "cm-scarecrowbanner", name: "Scarecrow Banner", cost: 30, cat: "banner", desc: "Cannot be charged by units able to fly (the unit may choose another regiment to charge instead). Immune to hunting falcons (Falconers must choose another target) and cannot be targeted by the Flock of Doom spell (caster must choose another target)." },
  { id: "cm-rendingbanner", name: "Rending Banner", cost: 40, cat: "banner", desc: "All attacks (including shooting) inflict a -1 penalty to armour save (does not apply to mounts)." },
  { id: "cm-bannerspeed", name: "Banner of Speed", cost: 40, cat: "banner", desc: "+1 movement allowance (applies to steeds if given to cavalry regiments)." },
  { id: "cm-bannerarcanewarding", name: "Banner of Arcane Warding", cost: 40, cat: "banner", desc: "4+ natural dispel that works even against Total Power. A successful dispel rebounds the spell 4D6\" from the standard bearer in a random direction, potentially hitting the first enemy unit in its path (or centring/redirecting a templated/line spell the same way). Only enemy units can be affected; several may be hit by a line spell." },
  { id: "cm-bannermissileprotection", name: "Banner of Missile Protection", cost: 50, cat: "banner", desc: "4+ ward save vs. all shooting (including ranged spells, banshee howls, and such)." },
  { id: "cm-valorousstandard", name: "Valorous Standard", cost: 50, cat: "banner", desc: "Resolute. Does not affect regiments immune to psychology." },
  { id: "cm-bannerunyielding", name: "Banner of Unyielding", cost: 50, cat: "banner", desc: "Stubborn. Does not affect regiments immune to psychology." },
  { id: "cm-standardshielding", name: "Standard of Shielding", cost: 50, cat: "banner", desc: "+1 armour save (or 6+ armour save if the unit had no armour save beforehand)." },
  { id: "cm-inspiringstandard", name: "Inspiring Standard", cost: 50, cat: "banner", desc: "May re-roll any LD test. When used as a battle standard, all units within 18\" may re-roll LD tests." },
  { id: "cm-bannergreatdeeds", name: "Banner of Great Deeds", cost: 50, cat: "banner", desc: "+1A on the first charge (does not apply to mounts). One use only. The second rank still only delivers one attack per model regardless of the models' number of attacks." },
  { id: "cm-dreadbanner", name: "Dread Banner", cost: 60, cat: "banner", desc: "The regiment causes fear." },
  { id: "cm-bannerwrath", name: "Banner of Wrath", cost: 80, cat: "banner", desc: "Bound spell. A magical missile flies from the banner and strikes a visible enemy unit within 18\": 1D6 flaming S3 hits, distributed like normal shooting, no armour save allowed. After use, roll 1D6 — on a 1 the banner is exhausted and cannot be used again." },
];

const COMMON_MAGIC_ITEMS_NO_ARCANE = COMMON_MAGIC_ITEMS.filter((i) => i.cat !== "arcane" && i.cat !== "familiar");

const WOOD_ELVES_MAGIC_ITEMS = [
  { id: "mi-hagbane", name: "Hagbane Arrows", cost: 10, cat: "weapon", desc: "Requires a bow/longbow. Magic arrows wound on 4+, 1 wound = 1D3 wounds." },
  { id: "mi-flail", name: "Flail of Claws", cost: 10, cat: "weapon", desc: "Light flail, +1S first round only. Always strikes first. Hit models lose 1 attack that round." },
  { id: "mi-bolas", name: "The Binding Bolas", cost: 20, cat: "weapon", desc: "Missile, 12\". Hit model can't move next turn." },
  { id: "mi-bowofloren", name: "Bow of Loren", cost: 20, cat: "weapon", desc: "Wood Elf Longbow. May shoot as many shots as bearer has attacks." },
  { id: "mi-haildoom", name: "Hail of Doom Arrow", cost: 25, cat: "weapon", desc: "One use. Fires 3D6 magical S4 arrows at one target." },
  { id: "mi-spiritsword", name: "The Spirit Sword", cost: 30, cat: "weapon", desc: "No armour save. Wounded enemies test LD or die instantly." },
  { id: "mi-bladesofloec", name: "Blades of Loec", cost: 30, cat: "weapon", desc: "Two hand weapons. Re-roll to hit and to wound." },
  { id: "mi-arcanebodkins", name: "Arcane Bodkins", cost: 50, cat: "weapon", desc: "Bearer & unit fire one magical volley, no armour save. One use, cannot be nullified." },
  { id: "mi-helmhunt", name: "Helm of The Hunt", cost: 30, cat: "armour", desc: "+1 armour save (or 6+ base). When charging: +1 WS, +1 A, +1 S." },
  { id: "mi-moonstone", name: "Moonstone", cost: 10, cat: "enchanted", desc: "One use. If bearer's unit is half in a wood, teleport to another wood." },
  { id: "mi-warpaint", name: "Magic War Paint", cost: 30, cat: "enchanted", desc: "5+ ward vs melee, 3+ ward vs missiles. Affects ridden monsters (not large)." },
  { id: "mi-antlertotem", name: "Antler Totem", cost: 15, cat: "arcane", desc: "Wizard using Amber or Jade may choose spells." },
  { id: "mi-springtide", name: "Banner of Springtide", cost: 10, cat: "banner", desc: "Always stand & shoot (2 ranks), even close range, overrun or rear charge." },
  { id: "mi-lynx", name: "Banner of the Lynx", cost: 10, cat: "banner", desc: "+1 to flee, pursue and overrun moves." },
  { id: "mi-midwinter", name: "Midwinter Standard", cost: 20, cat: "banner", desc: "One use. Unit auto-passes the first break test it fails." },
  { id: "mi-hawkeye", name: "Hawkeye Banner", cost: 40, cat: "banner", desc: "+1 BS." },
  { id: "mi-swiftness", name: "Banner of Surprising Swiftness", cost: 60, cat: "banner", desc: "Once/game: move 1D6\" forward in the magic phase; counts as charging." },
  { id: "sp-luminescents", name: "A Resplendence of Luminescents", cost: 10, cat: "sprite", restrictedTo: [{ tags: ["spriteEligible"] }, { characterIds: ["zoatcharacter"], tags: ["wizard"] }], desc: "All attacks by bearer & regiment count as magical." },
  { id: "sp-spites", name: "A Murder of Spites", cost: 20, cat: "sprite", restrictedTo: [{ tags: ["spriteEligible"] }, { characterIds: ["zoatcharacter"], tags: ["wizard"] }], desc: "1D6 S3 hits vs an enemy unit within 12\" in the shooting phase." },
  { id: "sp-malevolents", name: "A Muster of Malevolents", cost: 30, cat: "sprite", restrictedTo: [{ tags: ["spriteEligible"] }, { characterIds: ["zoatcharacter"], tags: ["wizard"] }], desc: "1D6 S4 hits vs a melee opponent, in addition to normal attacks." },
  { id: "sp-radiants", name: "A Cluster of Radiants", cost: 40, cat: "sprite", restrictedTo: [{ tags: ["spriteEligible"] }, { characterIds: ["zoatcharacter"], tags: ["wizard"] }], desc: "Natural dispel 3+." },
  { id: "sp-netlings", name: "An Annoyance of Netlings", cost: 50, cat: "sprite", restrictedTo: [{ tags: ["spriteEligible"] }, { characterIds: ["zoatcharacter"], tags: ["wizard"] }], desc: "In a challenge, bearer can only be hit on natural 6s." },
  { id: "sp-despairs", name: "A Lamentation of Despairs", cost: 60, cat: "sprite", restrictedTo: [{ tags: ["spriteEligible"] }, { characterIds: ["zoatcharacter"], tags: ["wizard"] }], desc: "Bound spell, one use. One model anywhere tests LD or suffers 1D6 wounds, no save, no LoS required." },
];
const MI_CATEGORY_LABEL = { weapon: "Magic Weapons", armour: "Magic Armour", enchanted: "Enchanted Items", arcane: "Arcane Items", banner: "Magic Banners", sprite: "Sprites", familiar: "Familiars", reward: "Chaos Rewards", daemonicreward: "Daemonic Rewards", chaosbanner: "Chaos Banners", engineering: "Engineering Runes", virtue: "Knightly Virtues", bloodlinepower: "Bloodline Powers", heirloom: "Heirlooms of the Old Slann" };
// A character/champion's own personal magic item slot never gets Magic Banners by default — only
// the model actually carrying the regiment's standard (the dedicated "Magic Banner"
// picker, or a Battle Standard Bearer, whose magicItemCategoryFilter already explicitly lists
// "banner") should ever be offered one. Used as the fallback whenever an entity doesn't specify
// its own magicItemCategoryFilter (which otherwise defaults to "every category, no restriction").
const NON_BANNER_CATEGORIES = Object.keys(MI_CATEGORY_LABEL).filter((c) => c !== "banner");
const NON_ARCANE_CATEGORIES = Object.keys(MI_CATEGORY_LABEL).filter((c) => c !== "arcane");
// The 8 lores taught at the Colleges of Magic in Altdorf. Factions with College Magic access
// list these plus, where applicable, one faction-specific alternate lore (e.g. Empire also gets
// Ice Magic). Factions without College access get either one fixed lore (no choice) or a small
// named choice between two non-College lores (Undead: Dark/Necromancy, Chaos: Dark/Own God's).
const COLLEGE_LORES = ["Celestial", "Grey", "Bright", "Gold", "Jade", "Light", "Amber", "Amethyst"];
// Battle Standard Bearers (tags include "bsb") are the one kind of plain character whose personal
// item slot conventionally doubles as the unit's magic banner — give them NON_BANNER_CATEGORIES
// plus "banner" back unless they already specify their own magicItemCategoryFilter.
const defaultCategoryFilter = (def) => def?.magicItemCategoryFilter || ((def?.tags || []).includes("bsb") ? [...NON_BANNER_CATEGORIES, "banner"] : NON_BANNER_CATEGORIES);
const miById = (magicItems, id) => (magicItems || []).find((m) => m.id === id);

/* ============================================================================
   WOOD ELVES DATA
   ========================================================================== */

const WOOD_ELVES = {
  key: "woodElves",
  loreOptions: [...COLLEGE_LORES, "High Magic"],
  name: "Wood Elves",
  tagline: "Guerrilla warfare from the deep groves of the Old World",
  magicItems: [...COMMON_MAGIC_ITEMS, ...WOOD_ELVES_MAGIC_ITEMS],
  themes: {
    default: "core",
    label: "Army Type",
    options: [
      { id: "core", name: "Core", desc: "The default Wood Elf army — entries from Warhammer Armies (3rd edition) and the first Wood Elf army book (4th edition). Includes Wood Elf Warriors, Beastmasters, Falconers, Wood Elf Lords, Wood Elf Chariots, and Shape Changers. May include an allied Zoat contingent." },
      { id: "savage", name: "Savage", desc: "The more savage Wood Elf army of 6th/8th edition. Loses Shape Changers, Wood Elf Warriors, Beastmasters, Falconers, Wood Elf Lords, and Wood Elf Chariots. Gains Treeman Ancient characters, Tree-Kin, Eternal Guards, Rangers, Wild Riders, Sisters of the Thorn, and Stags as a steed option. No Zoat contingent." },
    ],
  },
  contingentRules: { tag: "zoat", label: "Zoat Contingent", minRegiments: 1, minCharacters: 1, charactersCostCappedByRegiments: true, maxPercentOfArmy: 25 },
  armyWideRules: [
    "Before deployment, Wood Elves may place a small forest (6\" diameter) which must lie within or touch the Wood Elf deployment zone.",
    "Wood Elf Longbows may fire 36\" and have the armour piercing rule (-1 to armour save).",
    "All Wood Elves (including cavalry but not chariots) can move through woods without suffering movement penalties. This also applies to Treemen, Dryads and the Green Dragon.",
    "Stags for steeds (Savage army only): a Lord may take a Stag for +33pts, a Hero for +26pts, a Battle Standard Bearer for +19pts, and Mages may take one for free.",
    "Dryads in a Savage army are skirmishers, but cannot use the Aspects (Birch/Oak/Willow) described on their regiment entry. Not toggled mechanically — the regiment's cost and command setup stay the same in both themes, only this flavor/tactical distinction changes.",
    "Zoat Contingent (Core army only): Wood Elves not using the Savage option may include an allied Zoat contingent. Zoat cannot use the Wood Elf General's Leadership or benefit from the Battle Standard Bearer. The contingent must include at least one Zoat Warrior regiment and at least one Zoat Character, the total cost of Zoat Characters can't exceed the total cost of Zoat Warrior regiments, one Zoat Character must be appointed general of the whole contingent, and the contingent's total cost can't exceed 25% of the army's total points. Zoat Characters act as regimental champions and won't voluntarily leave their regiment. This builder tracks these specific numbers live (see the warning banner above the roster if any aren't met) but doesn't block adding units that would violate them.",
    "Gruarth the Beastmaster and Skaw the Falconer (special characters) reference unit types — Forest Creatures & Beastmasters, Wood Elf Falconers — that aren't available under the Savage theme. Not hard-restricted by this builder; avoid taking them in a Savage army.",
  ],
  characters: [
    {
      id: "warlord", name: "Wood Elf Warlord", cost: 124, stat: "Wood Elf Warlord", magicItemSlots: 3,
      gearNote: "May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon", "Lance"] },
      bowOption: { label: "Bow or Wood Elf Longbow", cost: 10 },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 27, stat: "Elven Steed" },
        { id: "warhawk", name: "Giant Warhawk", cost: 51, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 69, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 181, stat: "Griffon" },
        { id: "dragon", name: "Green Dragon", cost: 321, stat: "Green Dragon" },
        { id: "stag", name: "Stag", cost: 33, stat: "Stag", theme: "savage" },
      ],
    },
    {
      id: "hero", name: "Wood Elf Hero", cost: 74, stat: "Wood Elf Hero", magicItemSlots: 2,
      gearNote: "May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon", "Lance"] },
      bowOption: { label: "Bow or Wood Elf Longbow", cost: 10 },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 20, stat: "Elven Steed" },
        { id: "warhawk", name: "Giant Warhawk", cost: 44, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 52, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 174, stat: "Griffon" },
        { id: "dragon", name: "Green Dragon", cost: 314, stat: "Green Dragon" },
        { id: "stag", name: "Stag", cost: 26, stat: "Stag", theme: "savage" },
      ],
    },
    {
      id: "wardancerhero", name: "War Dancer Hero", cost: 94, stat: "War Dancer Hero", magicItemSlots: 2,
      gearNote: "Must either walk alone or join a Wood Elf War Dancers regiment. Carries an additional hand weapon.",
      meleeGroup: { label: "Weapon (free)", options: ["Additional hand weapon (default)", "Shield (ward save improves to 5+)"] },
      mounts: [],
    },
    {
      id: "bsb", name: "Wood Elf Battle Standard Bearer", cost: 88, stat: "Wood Elf BSB", magicItemSlots: 1, tags: ["bsb"],
      gearNote: "May take light armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour"] },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 13, stat: "Elven Steed" },
        { id: "stag", name: "Stag", cost: 19, stat: "Stag", theme: "savage" },
      ],
    },
    {
      id: "magelord", name: "Mage Lord (level 4)", cost: 264, stat: "Mage Lord", magicItemSlots: 4,
      gearNote: "May take College Magic or High Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "warhawk", name: "Giant Warhawk", cost: 30, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 160, stat: "Griffon" },
        { id: "dragon", name: "Green Dragon", cost: 300, stat: "Green Dragon" },
        { id: "stag", name: "Stag", cost: 0, stat: "Stag", theme: "savage" },
      ],
    },
    {
      id: "mastermage", name: "Master Mage (level 3)", cost: 186, stat: "Master Mage", magicItemSlots: 3,
      gearNote: "May take College Magic or High Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "warhawk", name: "Giant Warhawk", cost: 30, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
        { id: "stag", name: "Stag", cost: 0, stat: "Stag", theme: "savage" },
      ],
    },
    {
      id: "magechampion", name: "Mage Champion (level 2)", cost: 122, stat: "Mage Champion", magicItemSlots: 2,
      gearNote: "May take College Magic or High Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "warhawk", name: "Giant Warhawk", cost: 30, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
        { id: "stag", name: "Stag", cost: 0, stat: "Stag", theme: "savage" },
      ],
    },
    {
      id: "mage", name: "Mage (level 1)", cost: 58, stat: "Mage", magicItemSlots: 1,
      gearNote: "May take College Magic or High Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "warhawk", name: "Giant Warhawk", cost: 30, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
        { id: "stag", name: "Stag", cost: 0, stat: "Stag", theme: "savage" },
      ],
    },
    {
      id: "shapechanger", name: "Shape Changer", cost: 80, stat: "Shape Changer (beast form)", magicItemSlots: 0, theme: "core",
      gearNote: "Hides in a rank-and-file infantry regiment until unleashed. Causes fear in beast form. Can never be the general.",
      mounts: [],
    },
    {
      id: "treemanancient", name: "Treeman Ancient", cost: 250, stat: "Treeman Ancient", theme: "savage", magicItemSlots: 2, magicItemCategoryFilter: ["sprite"], tags: ["spriteEligible"],
      gearNote: "Rules as a normal Treeman, except it's a character and may take two Sprites.",
    },
    {
      id: "zoatcharacter", name: "Zoat Character", cost: 110, stat: "Zoat Character", magicItemSlots: 1, theme: "core", tags: ["zoat"], contingentTag: "zoat",
      gearNote: "Monstrous model on a 40x40 or 40x60mm base. Causes fear, 5+ armour save (scaly skin), moves through forests without penalty. Carries a double handed weapon (forfeited if it becomes a wizard — not toggled here). Cannot use the Wood Elf General's Leadership or benefit from the Battle Standard Bearer. Acts as a regimental champion — won't voluntarily leave its regiment (not hard-enforced). Only if upgraded to a wizard may its one magic item be an arcane item.",
      magicLevelOption: { label: "Become a level 1 wizard (Amber or Jade Magic)", costPerLevel: 60, max: 1, min: 0 },
    },
  ],
  regiments: [
    {
      id: "archers", name: "Wood Elf Archers", perModel: 10, minSize: 5, stat: "Wood Elf Warriors",
      command: "standard", note: "Warriors with Wood Elf Longbows.",
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "warriors", name: "Wood Elf Warriors", perModel: 7, minSize: 5, stat: "Wood Elf Warriors", theme: "core",
      command: "standard", note: "Warriors with shields.",
      options: [
        { id: "spear", group: "melee", label: "Spears", cost: 0.5, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons instead of shield", cost: 0, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons instead of shield", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "wardancers", name: "Wood Elf War Dancers", perModel: 18, minSize: 5, stat: "Wood Elf War Dancers",
      command: "special",
      note: "Shields give ward save 5+ instead of 6+. Immune to psychology, natural dispel 4+, ignore skirmish penalties, always may march. Each combat round choose a War Dance: Whirling Death (+1A), Woven Mist (enemies -1 to hit), The Shadows Coil (draw, no blows either way, needs 5+ models), or Storm of Blades (focus fire one model).",
      options: [
        { id: "ahw", group: null, label: "Swap shields for additional hand weapons", cost: 4, per: "model" },
      ],
      champion: { name: "War Dancer Champion", baseCost: 30, magicItemSlots: 1, stat: "War Dancer Champion" },
    },
    {
      id: "waywatchers", name: "Wood Elf Way Watchers", perModel: 18, minSize: 5, stat: "Wood Elf Scouts & Way Watchers",
      restriction: "0-1", command: "skirmisher",
      note: "May scout. Must skirmish. May hide in woods (enemies need 4+ to target); triggers 1D6 trap effect if a wood they occupy is entered.",
      options: [
        { id: "ahw", group: null, label: "Additional hand weapons", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "dryads", name: "Dryads", perModel: 20, minSize: 5, stat: "Dryads",
      command: "none",
      note: "Cause fear, immune to psychology, 5+ natural armour save. Cannot take a standard bearer; counts as having a musician (they sing). Each combat round choose an Aspect: Birch (+1A), Oak (+1S/+1T), or Willow (each enemy in base contact forfeits one attack). May only be joined by a Branch Wraith. In a Savage army, Dryads are skirmishers instead and cannot use Aspects (not toggled here — cost and command setup are unchanged).",
      branchWraith: { name: "Branch Wraith", cost: 70, note: "Regimental champion & level 1 wizard (Jade or Amber magic). May not take a magic item, but may take one Sprite.", spriteSlots: 1 },
    },
    {
      id: "warhawkriders", name: "Wood Elf Warhawk Riders", perModel: 32, minSize: 3, stat: "Wood Elf Warriors", mountStat: "Giant Warhawk", mountLabel: "Giant Warhawk",
      restriction: "0-1", command: "skirmisher",
      note: "Warriors riding Giant Warhawks — skirmishing monstrous cavalry.",
      options: [
        { id: "bow", group: "missile", label: "Bows", cost: 2, per: "model" },
        { id: "longbow", group: "missile", label: "Wood Elf Longbows", cost: 3, per: "model" },
        { id: "spear", group: null, label: "Spears", cost: 2, per: "model" },
        { id: "shield", group: null, label: "Shields", cost: 1.5, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 1.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "scouts", name: "Wood Elf Scouts", perModel: 14, minSize: 5, stat: "Wood Elf Scouts & Way Watchers",
      command: "standard", note: "Scouts with Wood Elf Longbows. May scout. May skirmish.",
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "lords", name: "Wood Elf Lords", perModel: 20, minSize: 5, stat: "Wood Elf Lords", mountStat: "Elven Steed", mountLabel: "Elven Steed", theme: "core",
      command: "fastCavalry", fastCavalryToggleOption: "barding",
      note: "Lords riding Elven Steeds with light armour, shields and lances. Fast cavalry.",
      options: [
        { id: "barding", group: null, label: "Barding — free (loses fast cavalry, -1M, free standard bearer, save improves 4+\u21923+)", cost: 0, per: "flat" },
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "gladeriders", name: "Wood Elf Glade Riders", perModel: 22, minSize: 5, stat: "Wood Elf Warriors", mountStat: "Elven Steed", mountLabel: "Elven Steed",
      command: "fastCavalry",
      note: "Warriors on Elven Steeds with light armour, spears & bows. Fast Cavalry, may skirmish, may Vanguard, may Fire & Flee as a charge reaction.",
      options: [
        { id: "shield", group: null, label: "Shields", cost: 2, per: "model" },
        { id: "longbow", group: null, label: "Upgrade bows to Wood Elf Longbows", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "falconers", name: "Wood Elf Falconers", perModel: 15, minSize: 5, stat: "Wood Elf Warriors", theme: "core",
      restriction: "0-1", command: "skirmisher",
      note: "Elven Warriors with Hunting Falcons (range 24\", S3 missile; -1 to hit vs Falconers in melee). May skirmish. Falcons ignore long-range/move penalties but gain no shooting-buff bonuses.",
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "forestcreatures", name: "Forest Creatures & Beastmasters", perModel: 0, minSize: 1, kind: "composite", theme: "core",
      restriction: "0-2", command: "none",
      note: "Any combination of Bears, Hunting Dogs, Wild Cats or Wild Hogs, optionally led by unarmoured Wood Elf Beastmasters. Follows the Beastmaster rules in the main rulebook. The whole entry is Core-only, since the book excludes Wood Elf Beastmasters from the Savage army and offers no replacement forest-creature unit there — a judgment call, flagged here.",
      composition: [
        { id: "bear", label: "Bears", cost: 15, stat: "Bears" },
        { id: "dog", label: "Hunting Dogs", cost: 10, stat: "Hunting Dogs" },
        { id: "cat", label: "Wild Cats", cost: 10, stat: "Wild Cats" },
        { id: "hog", label: "Wild Hogs", cost: 5, stat: "Wild Hogs" },
        { id: "beastmaster", label: "Wood Elf Beastmasters", cost: 14, stat: "Wood Elf Beastmasters" },
      ],
    },
    {
      id: "treekin", name: "Tree-Kin", perModel: 45, minSize: 3, stat: "Tree-Kin", command: "none", theme: "savage",
      note: "A monstrous regiment — flammable, causes fear, immune to psychology, 4+ natural armour save. Cannot take a musician or a standard bearer.",
    },
    {
      id: "eternalguards", name: "Wood Elf Eternal Guards", perModel: 13, minSize: 5, stat: "Eternal Guards", command: "standard", theme: "savage", restriction: "0-1",
      note: "Fight with a staff combining spear, light armour, and shield (effectively spearmen with a 5+ armour save). Immune to psychology and stubborn.",
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "rangers", name: "Wood Elf Rangers", perModel: 15, minSize: 5, stat: "Rangers", command: "standard", theme: "savage", restriction: "0-1",
      note: "Light armour and double handed weapons — ignore the always-strike-last rule for double handed weapons. Immune to psychology and stubborn.",
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "wildriders", name: "Wood Elf Wild Riders", perModel: 28, minSize: 5, stat: "Wild Riders", mountStat: "Stag", mountLabel: "Stag", command: "fastCavalry", theme: "savage", restriction: "0-1",
      note: "Spears, riding Stags. Fast cavalry. Eternal Frenzy (don't lose frenzy even if broken in melee). Cause fear. All their attacks count as magical.",
      options: [
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "sistersofthethorn", name: "Wood Elf Sisters of the Thorn", perModel: 28, minSize: 5, stat: "Sisters of the Thorn", mountStat: "Stag", mountLabel: "Stag", command: "fastCavalry", theme: "savage", restriction: "0-1",
      note: "Spears, riding Stags. Fast cavalry. Ward save 4+, natural dispel 4+, immune to psychology. Cause fear. All their attacks count as magical.",
      options: [
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "zoatwarrior", name: "Zoat Warrior", perModel: 55, minSize: 3, stat: "Zoat Warrior", command: "none", theme: "core", tags: ["zoat"], contingentTag: "zoat",
      note: "Monstrous models on 40x40 or 40x60mm bases. Cause fear, 5+ armour save (scaly skin), move through forests without penalty. Carry double handed weapons. Cannot include a standard bearer or musician. Part of the allied Zoat contingent — see army-wide rules for its composition requirements.",
    },
  ],
  chariotsMonsters: [
    {
      id: "greateagle", name: "Great Eagles", perUnit: 60, stat: "Great Eagle", kind: "quantity",
      note: "Small monster that can fly.",
    },
    {
      id: "chariot", name: "Wood Elf Chariot", perUnit: 60, stat: "Heavy Chariot", kind: "chariot", countsAsFirstRegiment: true, theme: "core", crewArmourFixed: "Light armour",
      note: "Heavy Chariot pulled by two Elven Steeds, crewed by two Wood Elf Warriors with light armour, spears, shields & Wood Elf Longbows (5+ armour save). The cheapest chariot in the army counts toward Regiments; further chariots count toward Chariots & Monsters.",
      extraCrewCost: 10, extraCrewLabel: "extra Wood Elf Warrior crew", extraSteedCost: 5, extraSteedLabel: "extra Elven Steeds",
      commanderCost: 43, commanderLabel: "One crewman is an Elven Commander", commanderMagicItemSlots: 1, scythedWheelsCost: 20,
    },
    {
      id: "treeman", name: "Treeman", perUnit: 200, stat: "Treeman", kind: "quantity", maxQty: 1,
      note: "Large terror-causing monster, immune to psychology, flammable, hates Orcs/Goblins/Hobgoblins. 3+ natural armour save. Rooted to the spot (no break test unless wounded that round).",
    },
  ],
  specialCharacters: [
    { id: "orion", name: "Orion, King in the Woods", cost: 300, stat: "Orion, King in the Woods", role: "Lord",
      note: "Large monster, causes terror, immune to psychology, 4+ natural dispel. Must be the army general. May lead a pack of Hunting Dogs (bought separately) like a Beastmaster.",
      items: "Carries: Spear of Kurnous (melee & S6 missile, no save, 1D3 wounds, returns), The Horn of the Wild Hunt (bound — 3x/game, 24\" panic test), The Cloak of Isha (4+ ward)." },
    { id: "ariel", name: "Ariel, Mage Queen of Loren", cost: 600, stat: "Ariel, Mage Queen of Loren", role: "Mage Lord",
      note: "Large monster, causes terror, can fly, immune to psychology, 4+ natural dispel & 4+ ward. Melee attacks allow no armour save.",
      items: "Carries: Wand of Wych Elm (bound spell), Acorns of the Oak of Ages (one use, plants a 12\" wood), Dart of Doom (one use, -1D6 S), Berry Wine (one use, heal 1D6 wounds)." },
    { id: "naieth", name: "Naieth the Prophetess", cost: 150, stat: "Naieth the Prophetess", role: "Mage",
      note: "Accompanied by Orthu the Owl — one Wood Elf regiment may re-roll failed to-hit rolls when shooting bows/longbows (not two phases running).",
      items: "Carries: Rod of Divination (deals the Wood Elf player an additional magic card each magic phase)." },
    { id: "thalandor", name: "Thalandor the War Mage", cost: 300, stat: "Thalandor the War Mage", role: "Master Mage",
      note: "Rides the Great Eagle Gwandor the Black (small monster, can fly).",
      items: "Carries: Spear of Daith (enemies re-roll successful hits vs bearer), Magic War Paint (5+ ward melee / 3+ ward missiles, also protects Gwandor), Dispel Magic Scroll." },
    { id: "lothlann", name: "Lothlann the Brave", cost: 120, stat: "Lothlann the Brave", role: "Battle Standard Bearer",
      note: "Elven BSB with light armour.", items: "Carries: Royal Standard of Athel Loren (enemy spells targeting units within 12\" are dispelled on 4+).",
      mountOption: { name: "Elven Steed (may take barding)", cost: 13 } },
    { id: "wychwethyl", name: "Wychwethyl the Wardancer", cost: 60, stat: "Wychwethyl the Wardancer", role: "War Dancer Champion (alternative)",
      note: "Additional hand weapon or shield — must match the regiment he joins.", items: "Carries: Drums of Orcskin (regiments on foot add +1D6\" to charge move)." },
    { id: "sceolan", name: "Sceolan", cost: 80, stat: "Sceolan", role: "Elven Hero (alternative)",
      note: "Light armour, Wood Elf Longbow.", items: "Carries: Buckler of Bronze (a natural 1 to hit rolled against Sceolan in melee auto-hits the attacker).",
      extraMagicItemSlots: 1 },
    { id: "drycha", name: "The Dryad Drycha", cost: 80, stat: "The Dryad Drycha", role: "Branch Wraith (alternative)",
      note: "Causes fear, 5+ armour save, level 1 wizard (Jade or Amber). May sing in the shooting phase (12\" range) — target tests LD or can't move & shoot next turn." },
    { id: "skaw", name: "Skaw the Falconer", cost: 70, stat: "Skaw the Falconer", role: "Elven Champion (alternative)",
      note: "Carries three Hunting Falcons — as Falconers, but only two falcons may target a hidden/mounted character." },
    { id: "scarloc", name: "Scarloc the Scout", cost: 90, stat: "Scarloc the Scout", role: "Elven Hero (alternative)",
      note: "Wood Elf Longbow. May scout.", extraMagicItemSlots: 2 },
    { id: "gruarth", name: "Gruarth the Beastmaster", cost: 30, stat: "Gruarth the Beastmaster", role: "Beastmaster (alternative)",
      note: "Must accompany a pack of Forest Creatures (bought separately).", extraMagicItemSlots: 1 },
    { id: "durthu", name: "Durthu the Treeman", cost: 260, stat: "Durthu the Treeman", role: "Treeman (alternative, is a character)", tags: ["spriteEligible"],
      note: "Hates Dwarfs & Chaos Dwarfs in addition to Orcs/Goblins/Hobgoblins. 2+ armour save.", extraSpriteSlots: 2 },
  ],
};

const EMPIRE_MAGIC_ITEMS = [
  { id: "em-runefang", name: "Runefang", cost: 20, cat: "weapon", desc: "No armour save. Undead and ethereal troops suffer double wounds. Army may include one, plus those carried by special characters." },
  { id: "em-dragonbow", name: "Dragon Bow", cost: 25, cat: "weapon", desc: "Bow. Fires three magical shots per shooting phase, range 36\", S5." },
  { id: "em-swordofjustice", name: "Sword of Justice", cost: 50, cat: "weapon", desc: "Re-roll missed to-hit rolls. No armour save allowed." },
  { id: "em-fearfrost", name: "Fearfrost", cost: 60, cat: "weapon", desc: "No armour save. 1 wound = 1D6 wounds." },
  { id: "em-hammerofsigmar", name: "Hammer of Sigmar", cost: 80, cat: "weapon", desc: "All hits wound. No armour save allowed." },
  { id: "em-helmmandred", name: "Helm of Count Mandred", cost: 10, cat: "armour", desc: "Bearer hates Skaven, and Skaven fear the bearer. +1 armour save." },
  { id: "em-armourtarnus", name: "Armour of Tarnus", cost: 25, cat: "armour", desc: "Full plate armour for wizards only — may cast while wearing it. Re-roll armour saves." },
  { id: "em-iconmagnus", name: "Icon of Magnus", cost: 10, cat: "enchanted", desc: "Bearer and bearer's regiment are immune to fear." },
  { id: "em-talismanulric", name: "Talisman of Ulric", cost: 15, cat: "enchanted", desc: "Bearer recovers one wound at the start of each player turn." },
  { id: "em-imperialcrown", name: "Imperial Crown", cost: 15, cat: "enchanted", desc: "If carried by the general, all units within 18\" may use his Ld." },
  { id: "em-laurels", name: "Laurels of Victory", cost: 25, cat: "enchanted", desc: "Each wound scored by the bearer/mount in a challenge counts double toward combat resolution." },
  { id: "em-silverseal", name: "The Silver Seal", cost: 50, cat: "enchanted", desc: "Enemies suffer -1 to hit against bearer & mount in melee and shooting. Natural dispel 4+." },
  { id: "em-acolytes", name: "Acolytes", cost: 10, cat: "arcane", desc: "A foot Light wizard may be accompanied by acolytes, letting him cast one Light spell per phase for one less power card. Not a true magic item (can't be nullified), but costs a magic item slot." },
  { id: "em-antlertotem", name: "Antler Totem", cost: 15, cat: "arcane", desc: "Wizard using Amber or Jade magic may choose spells." },
  { id: "em-panther", name: "Knights Panther Standard", cost: 0, cat: "banner", desc: "Free. Knights Panther only. Auto-dispels the first spell cast at the regiment, even Total Power. One use.", restrictedTo: [{ regimentIds: ["panther"] }] },
  { id: "em-whitewolf", name: "White Wolf Standard", cost: 0, cat: "banner", desc: "Free. Knights of the White Wolf / Teutogen Foot Knights only. First charge against the regiment forces a terror test. One use.", restrictedTo: [{ knightGroups: ["whiteWolf"] }] },
  { id: "em-reiksguard", name: "Reiksguard Standard", cost: 20, cat: "banner", desc: "Reiksguard regiments only. Auto-passes the first Ld test it fails (not break tests). One use.", restrictedTo: [{ knightGroups: ["reiksguard"] }] },
  { id: "em-carroburg", name: "Carroburg Standard", cost: 20, cat: "banner", desc: "Greatswords only. Auto-passes the first break test it fails.", restrictedTo: [{ regimentIds: ["greatswords"] }] },
  { id: "em-devotion", name: "Standard of Imperial Devotion", cost: 20, cat: "banner", desc: "The regiment is immune to panic." },
  { id: "em-defiance", name: "Banner of Defiance", cost: 80, cat: "banner", desc: "Double rank bonus (max +6). Never pursues, overruns, or flees voluntarily. Nullifies hatred/frenzy in the regiment." },
];

const EMPIRE = {
  key: "empire",
  loreOptions: [...COLLEGE_LORES, "Ice Magic"],
  name: "The Empire",
  tagline: "The disciplined might of humanity's bulwark against the dark",
  magicItems: [...COMMON_MAGIC_ITEMS, ...EMPIRE_MAGIC_ITEMS],
  compositionRules: [
    { kind: "requiresIfPresent", label: "Halfling Hot-Pot", trigger: [{ list: "chariots", id: "hotpot", name: "Halfling Hot-Pot" }], requires: [{ list: "regiments", id: "halflingbowmen", name: "Halfling Bowmen" }, { list: "regiments", id: "halflingmilitia", name: "Halfling Militia" }] },
    { kind: "requiresIfPresent", label: "Tzarina Katarin", trigger: [{ list: "specials", id: "tzarinakatarin", name: "Tzarina Katarin" }], requires: [{ list: "regiments", id: "kislevlancers", name: "Kislev Winged Lancers" }, { list: "regiments", id: "kislevkossars", name: "Kislev Kossars" }, { list: "regiments", id: "kislevhorsearchers", name: "Kislev Horse Archers" }] },
  ],
  armyWideRules: [
    "Full Plate Armour: Empire Knights wearing full plate armour get a 4+ armour save on its own.",
    "Auxiliaries: the army may include auxiliary contingents of Flagellants, Free Company, Kislev Troops, Halflings, Dwarfs, and Ogres — but only half of the army's total regiments (rounded up) may be auxiliaries.",
    "Detachments: Reiksguard Foot Knights, Teutogen Foot Knights, Halberdiers, Spearmen, Greatswords, Pikemen, and Swordsmen may each take up to two detachments (from Halberdiers, Spearmen, Greatswords, Pikemen, Swordsmen, trained Free Company, Crossbowmen, Handgunners, or Archers). Combined detachment size can't exceed the parent regiment. Detachments never take a standard bearer or musician (they may use the parent's Ld and musician within 8\"), cost at least 50pts, and are at least 5 models.",
    "Experimental weapons exist for named characters and war machine crews (Hochland Long Rifle, repeating handgun/pistol, blunderbuss, man catcher, hook halberd, ball and chain) — priced where they appear on a specific entry.",
    "Knights: normally only one regiment of each Knight type may be included, but if every other Knight type is omitted, that one type may be taken in any number. Reiksguard Foot Knights + Mounted Reiksguard Knights count as one type; Teutogen Foot Knights + Knights of the White Wolf count as one type.",
    "An Empire army may include Gotrek and Felix from the Dwarfs army book (not yet modeled in this builder).",
    "As an auxiliary option, the Empire army may include one regiment from the Dogs of War army — this may be one of the Regiments of Renown, provided it's human. Not mechanically wired up here (this builder is one faction at a time) — add it from the Dogs of War faction on paper if you use it.",
  ],
  characters: [
    {
      id: "empirelord", name: "Empire Lord", cost: 100, stat: "Empire Lord", magicItemSlots: 3,
      gearNote: "May take a shield and either light armour, heavy armour, or full plate armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour", "Shield & Full Plate Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Handgun", "Pistol", "Two pistols"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 20, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 55, stat: "Pegasus" },
        { id: "griffon", name: "Griffon", cost: 175, stat: "Griffon" },
      ],
    },
    {
      id: "empirehero", name: "Empire Hero", cost: 60, stat: "Empire Hero", magicItemSlots: 2,
      gearNote: "May take a shield and either light armour, heavy armour, or full plate armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour", "Shield & Full Plate Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Handgun", "Pistol", "Two pistols"] },
      experimentalMissileGroup: { label: "Experimental missile weapon — foot only (any one)", cost: 10, options: ["None (default)", "Hochland Long Rifle", "Repeating handgun", "Repeating pistol"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 15, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 50, stat: "Pegasus" },
        { id: "griffon", name: "Griffon", cost: 170, stat: "Griffon" },
      ],
    },
    {
      id: "empirebsb", name: "Empire Battle Standard Bearer", cost: 80, stat: "Empire BSB", magicItemSlots: 1, restriction: "0-1", tags: ["bsb"],
      gearNote: "May take either light armour, heavy armour, or full plate armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour", "Heavy Armour", "Full Plate Armour"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 10, stat: "Warhorse" },
      ],
    },
    {
      id: "wizardlord", name: "Wizard Lord (level 4)", cost: 240, stat: "Wizard Lord", magicItemSlots: 4,
      gearNote: "May take College Magic (and Ice Magic if the army includes Kislev regiments). May take as many magic items as levels (4).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "griffon", name: "Griffon", cost: 160, stat: "Griffon" },
      ],
    },
    {
      id: "masterwizard", name: "Master Wizard (level 3)", cost: 170, stat: "Master Wizard", magicItemSlots: 3,
      gearNote: "May take College Magic (and Ice Magic if the army includes Kislev regiments). May take as many magic items as levels (3).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizardchampion", name: "Wizard Champion (level 2)", cost: 110, stat: "Wizard Champion", magicItemSlots: 2,
      gearNote: "May take College Magic (and Ice Magic if the army includes Kislev regiments). May take as many magic items as levels (2).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizard", name: "Wizard (level 1)", cost: 50, stat: "Wizard", magicItemSlots: 1,
      gearNote: "May take College Magic (and Ice Magic if the army includes Kislev regiments). May take as many magic items as levels (1).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "warriorpriest", name: "Warrior Priest", cost: 65, stat: "Warrior Priest", magicItemSlots: 1,
      gearNote: "May take a shield and either light or heavy armour for free (not full plate). Any regiment of Swordsmen or State Troops he joins (including detachments within 8\") becomes immune to fear and hates all enemies — as does the Priest himself.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Double handed weapon"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 10, stat: "Warhorse" },
        { id: "chariot", name: "Large chariot (two barded Warhorses) — only if the Grand Theogonist isn't in the army; unbreakable while the Priest lives", cost: 80, stat: "War Wagon" },
      ],
    },
  ],
  regiments: [
    {
      id: "halberdiers", name: "Halberdiers", perModel: 5, minSize: 5, stat: "State Trooper", command: "standard", detachmentParent: true,
      note: "State Troops with halberds.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "shield", group: null, label: "Shields", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "spearmen", name: "Spearmen", perModel: 5, minSize: 5, stat: "State Trooper", command: "standard", detachmentParent: true,
      note: "State Troops with spears.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "shield", group: null, label: "Shields", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "pikemen", name: "Pikemen", perModel: 8, minSize: 5, stat: "State Trooper", command: "standard", detachmentParent: true,
      note: "State Troops with pikes.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "greatswords", name: "Greatswords", perModel: 6, minSize: 5, stat: "State Trooper", command: "standard", detachmentParent: true,
      note: "State Troops with double handed weapons.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "swordsmen", name: "Swordsmen", perModel: 5.5, minSize: 5, stat: "Swordsman", command: "standard", detachmentParent: true,
      note: "Swordsmen with shields.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "archers", name: "Archers", perModel: 7, minSize: 5, stat: "State Trooper", command: "standard",
      note: "State Troops with longbows. May skirmish (loses standard bearer while skirmishing).",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "crossbowmen", name: "Crossbowmen", perModel: 9, minSize: 5, stat: "State Trooper", command: "standard",
      note: "State Troops with crossbows.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "handgunners", name: "Hand gunners", perModel: 9, minSize: 5, stat: "State Trooper", command: "standard",
      note: "State Troops with handguns.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "pistoliers", name: "Pistoliers", perModel: 17, minSize: 5, stat: "State Trooper", mountStat: "Normal Horse", mountLabel: "Normal Horse", command: "fastCavalry",
      note: "State Troops in light armour with two pistols, on Normal Horses. Fast cavalry. May skirmish.",
      champion: { name: "Empire Captain", baseCost: 20, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "outriders", name: "Outriders", perModel: 17, minSize: 5, stat: "State Trooper", mountStat: "Normal Horse", mountLabel: "Normal Horse (barded)", command: "standard",
      note: "State Troops in light armour with repeating handguns, on barded Normal Horses.",
      champion: { name: "Empire Captain", baseCost: 20, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "whitewolf", name: "Knights of the White Wolf", perModel: 20, minSize: 5, stat: "Knight (Empire)", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard",
      note: "Knights with barded warhorses, full plate armour, and double handed weapons.",
      knightGroup: "whiteWolf",
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "teutogen", name: "Teutogen Foot Knights", perModel: 13, minSize: 5, stat: "Knight (Empire)", command: "standard",
      note: "Knights with full plate armour and double handed weapons.",
      knightGroup: "whiteWolf", detachmentParent: true,
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "panther", name: "Knights Panther", perModel: 25, minSize: 5, stat: "Knight (Empire)", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard",
      note: "Knights with barded warhorses, full plate armour, shields, and lances.",
      knightGroup: "panther",
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "blazingsun", name: "Knights of the Blazing Sun", perModel: 25, minSize: 5, stat: "Knight (Empire)", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard",
      note: "Knights with barded warhorses, full plate armour, shields, and lances. Can alternatively represent a lesser Knightly Order of your own design.",
      knightGroup: "blazingSun",
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "reiksguardfoot", name: "Reiksguard Foot Knights", perModel: 11, minSize: 5, stat: "Knight (Empire)", command: "standard",
      note: "Knights with full plate armour and shields.",
      knightGroup: "reiksguard", detachmentParent: true,
      options: [
        { id: "dhw", group: null, label: "Swap shields for double handed weapons", cost: 2, per: "model" },
      ],
      champion: { name: "Grand Commander", baseCost: 50, magicItemSlots: 1, stat: "Grand Commander" },
    },
    {
      id: "reiksguardmounted", name: "Mounted Reiksguard Knights", perModel: 25, minSize: 5, stat: "Knight (Empire)", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard",
      note: "Knights with barded warhorses, full plate armour, shields, and lances.",
      knightGroup: "reiksguard",
      champion: { name: "Grand Commander", baseCost: 50, magicItemSlots: 1, stat: "Grand Commander" },
    },
    {
      id: "flagellants", name: "Flagellants", perModel: 10, minSize: 5, stat: "Flagellant", command: "none", auxiliary: true,
      note: "Unbreakable and must charge the enemy if in range. No standard bearer or musician.",
      options: [
        { id: "flails", group: null, label: "Flails", cost: 2, per: "model" },
      ],
      champion: { name: "Prophet of Doom", baseCost: 20, magicItemSlots: 0, stat: "Prophet of Doom" },
    },
    {
      id: "kislevlancers", name: "Kislev Winged Lancers", perModel: 17, minSize: 5, stat: "Kislev Winged Lancer", mountStat: "Warhorse", mountLabel: "Warhorse", command: "fastCavalry", auxiliary: true,
      note: "Warhorses, light armour, shields, and lances. Fast cavalry.",
      options: [
        { id: "shrieking", group: null, label: "Shrieking back banners — causes fear on the charge turn", cost: 3, per: "model" },
      ],
      champion: { name: "Kislev Captain", baseCost: 30, magicItemSlots: 1, stat: "Kislev Captain" },
    },
    {
      id: "kislevkossars", name: "Kislev Kossars", perModel: 9, minSize: 5, stat: "Fighter", command: "standard", auxiliary: true,
      note: "Fighters with bows, double handed weapons, and light armour.",
      champion: { name: "Fighter Champion", baseCost: 20, magicItemSlots: 1, stat: "Fighter Champion" },
    },
    {
      id: "kislevhorsearchers", name: "Kislev Horse Archers", perModel: 10, minSize: 5, stat: "Fighter", mountStat: "Normal Horse", mountLabel: "Normal Horse", command: "fastCavalry", auxiliary: true,
      note: "Bows, on Normal Horses. Fast cavalry. May skirmish.",
      champion: { name: "Fighter Champion", baseCost: 20, magicItemSlots: 1, stat: "Fighter Champion" },
    },
    {
      id: "freecompany", name: "Free Company", perModel: 5.5, minSize: 5, stat: "Fighter", command: "standard", auxiliary: true,
      note: "Armed with various weapons that function as additional hand weapons.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "trained", group: null, label: "Trained as state troops — eligible as a detachment", cost: 0.5, per: "model" },
      ],
      champion: { name: "Fighter Champion", baseCost: 20, magicItemSlots: 1, stat: "Fighter Champion" },
    },
    {
      id: "halflingbowmen", name: "Halfling Bowmen", perModel: 7, minSize: 5, stat: "Halfling", command: "standard", auxiliary: true,
      note: "Bows. May skirmish. Foresters — move through woods without penalty regardless.",
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "halflingmilitia", name: "Halfling Militia", perModel: 2.5, minSize: 5, stat: "Halfling", command: "standard", auxiliary: true,
      note: "Light armour and shields. Foresters — move through woods without penalty regardless.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 0.5, per: "model" },
      ],
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "ogremercenaries", name: "Ogre Mercenaries", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous", auxiliary: true,
      note: "Light armour. Monstrous regiment. Causes fear.",
      options: [
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion" },
    },
    {
      id: "dwarfwarriors", name: "Dwarf Warriors", perModel: 8, minSize: 5, stat: "Dwarf (Empire)", command: "standard", auxiliary: true,
      note: "Light armour. Subject to standard Dwarf special rules.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "crossbows", group: "melee", label: "Crossbows instead — only if taking no other weapon/shield", cost: 4, per: "model" },
      ],
      champion: { name: "Dwarf Champion (Empire)", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion (Empire)" },
    },
  ],
  detachmentTypes: [
    { id: "halberdiers", name: "Halberdiers (detachment)", perModel: 5, stat: "State Trooper" },
    { id: "spearmen", name: "Spearmen (detachment)", perModel: 5, stat: "State Trooper" },
    { id: "pikemen", name: "Pikemen (detachment)", perModel: 8, stat: "State Trooper" },
    { id: "greatswords", name: "Greatswords (detachment)", perModel: 6, stat: "State Trooper" },
    { id: "swordsmen", name: "Swordsmen (detachment)", perModel: 5.5, stat: "Swordsman" },
    { id: "freecompany", name: "Free Company, trained (detachment)", perModel: 6, stat: "Fighter" },
    { id: "crossbowmen", name: "Crossbowmen (detachment)", perModel: 9, stat: "State Trooper" },
    { id: "handgunners", name: "Hand gunners (detachment)", perModel: 9, stat: "State Trooper" },
    { id: "archers", name: "Archers (detachment)", perModel: 7, stat: "State Trooper" },
  ],
  chariotsMonsters: [
    {
      id: "warwagon", name: "War Wagon", perUnit: 100, stat: "War Wagon", kind: "quantity", countsAsFirstRegiment: true,
      note: "A large chariot pulled by two barded Warhorses, crewed by six engineers (BS4) each with a different experimental weapon (5+ armour save). All six may fight in melee; the experimental weapons may shoot even if the Wagon moved, as long as it's unengaged. The first War Wagon counts toward Regiments; further ones count toward Chariots & Monsters.",
    },
    {
      id: "mortars", name: "Mortars", perUnit: 80, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Works like a small stone thrower. Crewed by three state troopers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra state trooper crew",
    },
    {
      id: "cannons", name: "Cannons", perUnit: 95, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Normal cannon. Crewed by three state troopers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra state trooper crew",
    },
    {
      id: "greatcannons", name: "Great Cannons", perUnit: 110, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Crewed by three state troopers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra state trooper crew",
    },
    {
      id: "helblaster", name: "Helblaster Volley Gun", perUnit: 110, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Range 24\", nine barrels, cannot be reloaded. Crewed by three state troopers. S5 armour piercing at short range, S4 armour piercing at long range; misfire rules apply.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra state trooper crew",
    },
    {
      id: "hotpot", name: "Halfling Hot-Pot", perUnit: 50, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine", restriction: "0-1",
      note: "Requires a Halfling regiment in the army (now flagged live by this builder). Shoots like a stone thrower, range 36\", S5, normal armour save allowed, no regeneration. Crewed by three halflings; cannot enter woods despite Halflings being foresters.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra halfling crew",
    },
    {
      id: "steamtank", name: "Steam Tank", perUnit: 250, stat: "Steam Tank", kind: "quantity", restriction: "0-8",
      note: "Large chariot powered by a steam engine. Causes terror, unbreakable, unique steam-point action economy (see rulebook). Default: small cannon + engineer with a repeating pistol.",
      variantOptions: [
        { id: "steamcannon", label: "Add a steam cannon", cost: 10 },
        { id: "engineerhandgun", label: "Engineer: repeating handgun instead of pistol", cost: 10 },
        { id: "engineerrifle", label: "Engineer: Hochland Long Rifle instead of pistol", cost: 10 },
        { id: "dropcannon", label: "Give up the small cannon", cost: -50 },
        { id: "fightingplatform", label: "Give up small cannon & engineer; add a War-Wagon-style fighting platform instead", cost: 50 },
      ],
    },
  ],
  specialCharacters: [
    { id: "kurthelborg", name: "Reiksmarshall Kurt Helborg", cost: 125, stat: "Reiksmarshall Kurt Helborg", role: "Lord",
      note: "Carries full plate armour, a shield, and a Runefang.", extraMagicItemSlots: 2,
      mountOption: { name: "Barded Warhorse", cost: 20 } },
    { id: "adelbrand", name: "Adelbrand Ludenhof, Elector Count of Hochland", cost: 100, stat: "The Elector Counts", role: "Lord",
      note: "Adelbrand's hawk gives all enemies in base contact -1 to hit with melee attacks against him. Rides a barded Warhorse. Carries full plate armour, a Runefang, and a hawk." },
    { id: "mariusleitdorf", name: "Marius Leitdorf, Elector Count of Averland", cost: 120, stat: "The Elector Counts", role: "Lord",
      note: "Subject to frenzy. Rides a barded Warhorse. Carries full plate armour, an additional hand weapon, and a Runefang (six attacks with the Runefang, one with the hand weapon)." },
    { id: "boristodbringer", name: "Boris Todbringer, Elector Count of Middenland", cost: 120, stat: "The Elector Counts", role: "Lord",
      note: "Rides a barded Warhorse. Carries full plate armour, a shield, a Runefang, and the Talisman of Ulric." },
    { id: "valmirvonraukov", name: "Valmir von Raukov, Elector Count of Ostland", cost: 120, stat: "The Elector Counts", role: "Lord",
      note: "Rides a barded Warhorse. Carries full plate armour, a shield, a Runefang, and the Dragon Bow." },
    { id: "supremepatriarch", name: "The Supreme Patriarch of the Colleges of Magic", cost: 300, stat: "The Supreme Patriarch", role: "Wizard Lord", tags: ["wizard"],
      note: "Uses Bright Magic. Carries the Staff of Volans — once per game may cast a spell for free as if cast with Total Power.", extraMagicItemSlots: 3,
      mountOption: { name: "Warhorse (may take Barding free)", cost: 0 } },
    { id: "grandtheogonist", name: "Grand Theogonist Volkmar", cost: 300, stat: "Grand Theogonist Volkmar", role: "Lord", tags: ["wizard"],
      note: "Rides the War Altar (a large chariot). Unbreakable. Carries the Horn of Sigismund (causes terror), The Jade Griffon (recovers all lost wounds after each phase), and the Staff of Command (becomes a level 2 wizard, any College Magic and High Magic) — all unique to him." },
    { id: "karlfranz", name: "The Emperor Karl Franz", cost: 260, stat: "The Emperor Karl Franz", role: "Lord (must be general)",
      note: "Cannot be fielded alongside Magnus the Pious. Carries full plate armour, a shield, the Imperial Crown, the Hammer of Sigmar, and the Silver Seal.", extraMagicItemSlots: 1,
      mounts: [
        { id: "warhorse", name: "Barded Warhorse", cost: 20 },
        { id: "griffon", name: "Griffon", cost: 175 },
      ] },
    { id: "magnusthepious", name: "Magnus the Pious", cost: 240, stat: "Magnus the Pious", role: "Lord (must be general)",
      note: "Cannot be fielded alongside Karl Franz. Carries full plate armour and a shield. Unbreakable, and any regiment he joins becomes unbreakable too. Confers a 4+ natural dispel. May retake failed armour saves. May forfeit normal attacks for one attempt to hit at S10, 1D6 multiple wounds.",
      mountOption: { name: "Barded Warhorse and a lance", cost: 40 } },
    { id: "ludwigschwarzhelm", name: "Ludwig Schwarzhelm", cost: 140, stat: "Ludwig Schwarzhelm", role: "Battle Standard Bearer",
      note: "Carries full plate armour and the Sword of Justice.", extraMagicItemSlots: 1,
      mountOption: { name: "Barded Warhorse", cost: 15 } },
    { id: "tzarinakatarin", name: "Tzarina Katarin, the Ice Queen of Kislev", cost: 200, stat: "Tzarina Katarin The Ice Queen", role: "Lord (Level 3 Wizard, Lore of Ice)", tags: ["wizard"],
      note: "Requires a Kislev regiment in the army to include her (now flagged live by this builder). Rides a Warhorse. Carries the magic blade Fearfrost.", extraMagicItemSlots: 2 },
  ],
};

const MARKS_WARRIOR = ["Khorne", "Tzeentch", "Nurgle", "Slaanesh", "Chaos Undivided"];
const MARKS_SORCERER = ["Tzeentch", "Nurgle", "Slaanesh", "Chaos Undivided"];
const CHAOS_ARMOUR_OPTIONS = ["Chaos Armour (default)", "No armour", "Light armour", "Heavy armour"];
const CHAOS_CHAMPION_ITEM_CATEGORIES = ["weapon", "armour", "enchanted", "arcane", "banner", "reward"];
// Chaos Banners are the reward for single-Power discipline — only ever available to a Chaos Warband's BSB (see Chaos Warband below), never to pure-faction characters.
const CHAOS_WARBAND_BSB_ITEM_CATEGORIES = [...CHAOS_CHAMPION_ITEM_CATEGORIES, "chaosbanner"];

const CHAOS_MAGIC_ITEMS = [
  { id: "cx-swordofrust", name: "Sword of Rust", cost: 10, cat: "weapon", desc: "-2 to armour save. Enemy wounded loses all mundane (non-magic) armour, including steed barding." },
  { id: "cx-axesofkhorgor", name: "Axes of Khorgor", cost: 25, cat: "weapon", desc: "Beastmen characters only. Additional hand weapon. Re-roll failed to-hit rolls.", restrictedTo: [{ tags: ["beastman"] }] },
  { id: "cx-chaosrunesword", name: "Chaos Runesword", cost: 35, cat: "weapon", desc: "+1 WS, +1 S, +1 attack." },
  { id: "cx-whipofecstasy", name: "Whip of Ecstasy", cost: 40, cat: "weapon", desc: "Mark of Slaanesh only. Additional hand weapon; one extra special attack — if it hits, that enemy model can't strike again this combat round.", restrictedTo: [{ marks: ["Slaanesh"] }] },
  { id: "cx-huntingspear", name: "Hunting Spear", cost: 40, cat: "weapon", desc: "Beastmen characters only. Missile, range 24\", S6, no armour save, 1D3 wounds, penetrates like a bolt thrower shot.", restrictedTo: [{ tags: ["beastman"] }] },
  { id: "cx-swordofchange", name: "Sword of Change", cost: 60, cat: "weapon", desc: "Mark of Chaos Undivided only. An enemy wounded but not killed by this blade turns into a Chaos Spawn under your control.", restrictedTo: [{ marks: ["Chaos Undivided"] }] },
  { id: "cx-helmmanyeyes", name: "Helm of Many Eyes", cost: 10, cat: "armour", desc: "Chaos Champions only. Always strikes first.", restrictedTo: [{ tags: ["chaosChampion"] }] },
  { id: "cx-hideoftheenemy", name: "Hide of the Enemy", cost: 20, cat: "armour", desc: "Beastmen characters only. Light armour, +2 to armour save.", restrictedTo: [{ tags: ["beastman"] }] },
  { id: "cx-crimsonarmour", name: "Crimson Armour of Dargan", cost: 30, cat: "armour", desc: "Chaos Champions only. Chaos Armour (4+ save). Enemies attacking the bearer must pass an Ld test on their own basic Ld or forfeit all attacks that round.", restrictedTo: [{ tags: ["chaosChampion"] }] },
  { id: "cx-chaosruneshield", name: "Chaos Runeshield", cost: 40, cat: "armour", desc: "All magic melee weapons used against the bearer lose their magic properties." },
  { id: "cx-redamulet", name: "Red Amulet", cost: 25, cat: "enchanted", desc: "Mark of Khorne only. Armies with no wizards/bound spells only. Dispels as a Dispel Magic Scroll, one use. Only one per army.", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "cx-spellbreakeridol", name: "Spell Breaker Idol", cost: 75, cat: "enchanted", desc: "Mark of Khorne only. Armies with no wizards/bound spells only. Casts and dispels like a level 4 wizard.", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "cx-ritualdagger", name: "Ritual Dagger", cost: 10, cat: "arcane", desc: "Beastmen Shamans only. Magic weapon, +1S. Each enemy killed by it grants one extra magic card next magic phase.", restrictedTo: [{ tags: ["shaman"] }] },
  { id: "cx-crystalskull", name: "Crystal Skull", cost: 30, cat: "arcane", desc: "Chaos Sorcerers only. Once/magic phase, cast a spell without power cards. Roll after each use — cumulative chance to turn into a Chaos Spawn.", restrictedTo: [{ tags: ["sorcerer"] }] },
  { id: "cx-staffofnurgle", name: "Staff of Nurgle", cost: 100, cat: "arcane", desc: "Chaos Sorcerer with Mark of Nurgle only. Bound spell, 12\" range, auto-slays the target (no save, no Look Out Sir). Cumulative chance to exhaust each use. Doesn't work vs. Great Unclean One, Lord Skrolk, or Nurgle-marked models.", restrictedTo: [{ tags: ["sorcerer"], marks: ["Nurgle"] }] },
  { id: "cx-herdstoneshard", name: "Herdstone Shard", cost: 100, cat: "arcane", desc: "Beastmen Shamans only. One extra magic card per magic phase.", restrictedTo: [{ tags: ["shaman"] }] },
  { id: "cx-painandpleasure", name: "Banner of Pain and Pleasure", cost: 10, cat: "banner", desc: "Mark of Slaanesh regiments only. An enemy that could charge this unit must pass an Ld test on 3D6 (2D6 if immune to psychology) or is forced to charge it." },
  { id: "cx-barelysuppressed", name: "Banner of Barely Suppressed Fury", cost: 10, cat: "banner", desc: "Mark of Khorne regiments only. Unbreakable on the turn they charge." },
  { id: "cx-pestilentstandard", name: "Pestilent Standard", cost: 25, cat: "banner", desc: "Mark of Nurgle regiments only. Casts Cloud of Flies as a bound spell (12\" range, victim can't move/shoot, remains in play)." },
  { id: "cx-iconendlesswar", name: "Icon of Endless War", cost: 50, cat: "banner", desc: "Mark of Khorne regiments only. +1D6 to charge move; frenzied models must attempt any possible charge." },
  { id: "cx-iconbloodgod", name: "Icon of the Blood God", cost: 50, cat: "banner", desc: "Mark of Khorne regiments only. Natural dispel 2+." },
  { id: "cx-fleshbanner", name: "Flesh Banner", cost: 50, cat: "banner", desc: "Mark of Tzeentch regiments only. Enemies in base contact with the standard bearer suffer 1D6 S4 hits at the start of each melee phase (counts toward combat res)." },
  { id: "cx-witheringeye", name: "Withering Eye Banner", cost: 50, cat: "banner", desc: "Mark of Tzeentch regiments only. Enemies charging this unit must pass an Ld test on 3D6 (2D6 if immune to psychology) or don't move that turn." },
  { id: "cx-bannerofbeast", name: "Banner of the Beast", cost: 60, cat: "banner", desc: "Ungor/Gor/Bestigor regiments and Beastmen characters only. +1 Strength.", restrictedTo: [{ regimentIds: ["beastmengors", "beastmenbestigors", "beastmenungors"] }, { tags: ["beastman"] }] },
  { id: "cx-soporificmusk", name: "Banner of Soporific Musk", cost: 75, cat: "banner", desc: "Mark of Slaanesh regiments only. Enemies in melee with this regiment suffer -1 to hit." },
  { id: "cx-thousandpoxes", name: "Banner of a Thousand Poxes", cost: 100, cat: "banner", desc: "Mark of Nurgle regiments only. +1 Toughness." },
  { id: "cb-rapturous", name: "Rapturous Standard", cost: 10, cat: "chaosbanner", desc: "BSB with Mark of Slaanesh only, single-Power army only. The regiment and BSB become unbreakable.", restrictedTo: [{ marks: ["Slaanesh"] }] , excludeTags: ["Mixed"] },
  { id: "cb-rage", name: "Banner of Rage", cost: 20, cat: "chaosbanner", desc: "BSB with Mark of Khorne only, single-Power army only. The regiment and BSB gain frenzy (double-attack bonus doesn't apply to mounts).", restrictedTo: [{ marks: ["Khorne"] }] , excludeTags: ["Mixed"] },
  { id: "cb-iron", name: "Iron Standard", cost: 30, cat: "chaosbanner", desc: "BSB with Mark of Chaos Undivided only, single-Power army only. The regiment and BSB may re-roll any failed save.", restrictedTo: [{ marks: ["Chaos Undivided"] }] , excludeTags: ["Mixed"] },
  { id: "cb-blasted", name: "Blasted Standard", cost: 40, cat: "chaosbanner", desc: "BSB with Mark of Tzeentch only, single-Power army only. Casts Blue Fire of Tzeentch as a bound spell once/magic phase (18\", D6 S4 hits, normal saves).", restrictedTo: [{ marks: ["Tzeentch"] }] , excludeTags: ["Mixed"] },
  { id: "cb-disease", name: "Disease Banner", cost: 50, cat: "chaosbanner", desc: "BSB with Mark of Nurgle only, single-Power army only. When the regiment/BSB suffers a melee wound, on a 5-6 the attacker also suffers a wound, no save.", restrictedTo: [{ marks: ["Nurgle"] }] , excludeTags: ["Mixed"] },
  { id: "cb-hellonearth", name: "Hell on Earth", cost: 60, cat: "chaosbanner", desc: "BSB only, single-Power army only. All friendly Daemons on the table gain +1 to Daemonic/armour save while the banner stands." , excludeTags: ["Mixed"] },
  { id: "cr-manyarms", name: "Many Arms", cost: 10, cat: "reward", desc: "Chaos Reward (all Marks). Three hand weapons for +2 attacks, OR two shields + hand weapon for +2 armour save, OR shield + two hand weapons for +1 save and +1 attack." },
  { id: "cr-scalyskin", name: "Scaly Skin", cost: 10, cat: "reward", desc: "Chaos Reward (all Marks). +1 armour save." },
  { id: "cr-macetail", name: "Mace Tail", cost: 15, cat: "reward", desc: "Chaos Reward (all Marks). +1 extra attack at S5." },
  { id: "cr-massivehorns", name: "Massive Horns", cost: 20, cat: "reward", desc: "Chaos Reward (all Marks). +1 attack on profile." },
  { id: "cr-scorpiontail", name: "Scorpion Tail", cost: 20, cat: "reward", desc: "Chaos Reward (all Marks). +1 extra attack at S4, no armour save allowed." },
  { id: "cr-hideousappearance", name: "Hideous Appearance", cost: 10, cat: "reward", desc: "Chaos Reward, Mark of Chaos Undivided only. Causes fear.", restrictedTo: [{ marks: ["Chaos Undivided"] }] },
  { id: "cr-ironhardskin", name: "Iron Hard Skin", cost: 25, cat: "reward", desc: "Chaos Reward, Mark of Chaos Undivided only. +2 armour save.", restrictedTo: [{ marks: ["Chaos Undivided"] }] },
  { id: "cr-regeneration", name: "Regeneration", cost: 40, cat: "reward", desc: "Chaos Reward, Mark of Chaos Undivided only. Regenerate on 4+.", restrictedTo: [{ marks: ["Chaos Undivided"] }] },
  { id: "cr-wings", name: "Wings", cost: 60, cat: "reward", desc: "Chaos Reward, Mark of Chaos Undivided only. Grants the fly ability.", restrictedTo: [{ marks: ["Chaos Undivided"] }] },
  { id: "cr-battlefury", name: "Battle Fury of Khorne", cost: 25, cat: "reward", desc: "Chaos Reward, Mark of Khorne only. +2 attacks on the charge.", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "cr-collarofkhorne", name: "Collar of Khorne", cost: 40, cat: "reward", desc: "Chaos Reward, Mark of Khorne only. Natural dispel 3+.", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "cr-khornechosen", name: "Khorne's Chosen", cost: 125, cat: "reward", desc: "Chaos Reward, Mark of Khorne only. Wounded enemies are slain outright.", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "cr-breathefire", name: "Breathe Fire", cost: 50, cat: "reward", desc: "Chaos Reward, Mark of Tzeentch only. Breathe fire in the shooting phase (teardrop template, S4 flaming), even while engaged in melee.", restrictedTo: [{ marks: ["Tzeentch"] }] },
  { id: "cr-destinytzeentch", name: "Destiny of Tzeentch", cost: 70, cat: "reward", desc: "Chaos Reward, Mark of Tzeentch only. When wounded, roll a D6: 1-3 negates the wound and loses this reward, 4-6 negates the wound and keeps it.", restrictedTo: [{ marks: ["Tzeentch"] }] },
  { id: "cr-nurglerot", name: "Nurgle's Rot", cost: 25, cat: "reward", desc: "Chaos Reward, Mark of Nurgle only. After striking in melee, enemies in base contact suffer a wound (no save) on a 6.", restrictedTo: [{ marks: ["Nurgle"] }] },
  { id: "cr-cloudofflies", name: "Nurgle's Cloud of Flies", cost: 40, cat: "reward", desc: "Chaos Reward, Mark of Nurgle only. Enemies in base contact suffer -1 to hit against any target.", restrictedTo: [{ marks: ["Nurgle"] }] },
  { id: "cr-foulodour", name: "Nurgle's Foul Odour", cost: 50, cat: "reward", desc: "Chaos Reward, Mark of Nurgle only. Enemies in base contact with the champion or his regiment suffer -2 WS.", restrictedTo: [{ marks: ["Nurgle"] }] },
  { id: "cr-gazeofslaanesh", name: "Gaze of Slaanesh", cost: 25, cat: "reward", desc: "Chaos Reward, Mark of Slaanesh only. Models trying to strike the champion in melee suffer -1 attack.", restrictedTo: [{ marks: ["Slaanesh"] }] },
  { id: "cr-allureofslaanesh", name: "Allure of Slaanesh (Chaos Reward)", cost: 25, cat: "reward", desc: "Chaos Reward, Mark of Slaanesh only. Enemies trying to hit the champion must pass an Ld test on 3D6 (2D6 if immune to psychology) or pick another target.", restrictedTo: [{ marks: ["Slaanesh"] }] },
  { id: "dr-small", name: "Small", cost: 0, cat: "daemonicreward", desc: "Daemonic Reward, Daemon Prince only. Infantry-size base, M reduced to 5, may join a Daemon regiment of the same Power. Can't take Wings, but may carry the battle standard." },
  { id: "dr-chaosarmour", name: "Chaos Armour (Daemonic)", cost: 10, cat: "daemonicreward", desc: "Daemonic Reward (all). Replaces Daemonic Save with a 4+ armour save (3+ if mounted)." },
  { id: "dr-battlemaster", name: "Battle Master", cost: 10, cat: "daemonicreward", desc: "Daemonic Reward (all). WS10." },
  { id: "dr-daemonicstrength", name: "Daemonic Strength", cost: 20, cat: "daemonicreward", desc: "Daemonic Reward (all). +1 Strength." },
  { id: "dr-magicresistant", name: "Magic Resistant", cost: 25, cat: "daemonicreward", desc: "Daemonic Reward (all). 4+ natural dispel." },
  { id: "dr-massivestature", name: "Massive Stature", cost: 25, cat: "daemonicreward", desc: "Daemonic Reward (all). +1 Wound." },
  { id: "dr-dispelmagic", name: "Dispel Magic", cost: 25, cat: "daemonicreward", desc: "Daemonic Reward (all), spellcasters only, pure Daemon armies only. Works as a Dispel Magic Scroll, one use, one per army." },
  { id: "dr-radiancedarkglory", name: "Radiance of Dark Glory", cost: 25, cat: "daemonicreward", desc: "Daemonic Reward (all). Living enemies within 8\" suffer -1 Ld." },
  { id: "dr-daemonicrobes", name: "Daemonic Robes", cost: 40, cat: "daemonicreward", desc: "Daemonic Reward (all). Enemy attacks against the bearer suffer -1 Strength." },
  { id: "dr-wardofchaos", name: "Ward of Chaos", cost: 40, cat: "daemonicreward", desc: "Daemonic Reward (all). 4+ ward save vs shooting." },
  { id: "dr-daemonicarrogance", name: "Daemonic Arrogance", cost: 10, cat: "daemonicreward", desc: "Daemonic Reward, Chaos Undivided only. Ld12.", restrictedTo: [{ marks: ["Chaos Undivided"] }] },
  { id: "dr-trulychosen", name: "Truly Chosen of Khorne", cost: 75, cat: "daemonicreward", desc: "Daemonic Reward, Khorne only. Bearer and nearby (3\") Khorne Daemons are unaffected by spells; remains-in-play spells touching the bearer are dispelled.", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "dr-whipandaxe", name: "Whip and Axe of Khorne", cost: 75, cat: "daemonicreward", desc: "Daemonic Reward, Khorne only. +1 attack, all wounds multiply into 1D3.", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "dr-destroyermagic", name: "Destroyer of Magic", cost: 75, cat: "daemonicreward", desc: "Daemonic Reward, Khorne only, mono-Khorne armies only. Works like a Dispel Scroll but auto-destroys the spell (or on 4+ if bound). One use, one per army.", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "dr-witheringgaze", name: "Withering Gaze", cost: 50, cat: "daemonicreward", desc: "Daemonic Reward, Tzeentch only. Shooting-phase gaze attack, 18\", S5, no save, ignores Look Out Sir. Not while engaged in melee.", restrictedTo: [{ marks: ["Tzeentch"] }] },
  { id: "dr-allseeingeye", name: "All-Seeing Eye of Tzeentch", cost: 50, cat: "daemonicreward", desc: "Daemonic Reward, Tzeentch only. At battle start, the enemy reveals all hidden objects (items, spells, rewards, etc.).", restrictedTo: [{ marks: ["Tzeentch"] }] },
  { id: "dr-flamestzeentch", name: "Flames of Tzeentch", cost: 75, cat: "daemonicreward", desc: "Daemonic Reward, Tzeentch only. Shoot 2D6 S4 flaming missiles at one target, 18\", BS to hit.", restrictedTo: [{ marks: ["Tzeentch"] }] },
  { id: "dr-streamofcorruption", name: "Stream of Corruption", cost: 50, cat: "daemonicreward", desc: "Daemonic Reward, Nurgle only. Breath weapon (teardrop template); models more than half covered test Initiative or die outright (T7+ take 1D6 wounds instead), no save.", restrictedTo: [{ marks: ["Nurgle"] }] },
  { id: "dr-cloudofflies", name: "Cloud of Flies (Daemonic)", cost: 50, cat: "daemonicreward", desc: "Daemonic Reward, Nurgle only. Enemies in base contact suffer -1 to hit in melee, even against others.", restrictedTo: [{ marks: ["Nurgle"] }] },
  { id: "dr-tormentor", name: "Tormentor", cost: 10, cat: "daemonicreward", desc: "Daemonic Reward, Slaanesh only. Killing an enemy character in a challenge forces a panic test on all enemies within 8\" (engaged or not).", restrictedTo: [{ marks: ["Slaanesh"] }] },
  { id: "dr-allureofslaanesh", name: "Allure of Slaanesh (Daemonic Reward)", cost: 25, cat: "daemonicreward", desc: "Daemonic Reward, Slaanesh only. Enemies trying to hit the bearer must pass an Ld test on 3D6 (2D6 if immune to psychology) or pick another target.", restrictedTo: [{ marks: ["Slaanesh"] }] },
  { id: "dr-razorpincers", name: "Razor Sharp Pincers", cost: 25, cat: "daemonicreward", desc: "Daemonic Reward, Slaanesh only. Magic weapon, no armour save allowed.", restrictedTo: [{ marks: ["Slaanesh"] }] },
];

const CHAOS_WARRIORS = {
  key: "chaoswarriors",
  loreOptions: ["Dark Magic", "Own God's Magic"],
  name: "Chaos Warriors",
  armyWideRules: [
    "A pure Chaos Warriors army may mix followers of different Chaos Powers freely — Marks are chosen per character/champion with no restriction.",
    "Chaos Champions (the broad term covering both regimental Champions and the Lord/Hero/BSB/Sorcerer character section) wear Chaos Armour by default (a magic item that doesn't count against the item limit, and isn't affected by rules that negate magic items or magic armour).",
    "Marks of Chaos: Khorne grants +1 WS and frenzy (no Chaos Sorcerer may take it). Tzeentch allows one re-roll per battle, alterable by +1/-1. Nurgle grants +1T, immunity to poison, and immunity to stench/insect to-hit penalties and disease effects. Slaanesh makes the bearer unbreakable (but still driven off if beaten in combat while flying/mounted on a flyer). Chaos Undivided grants +1 Ld, and — if the army general bears it — unlocks the Chaos Abomination.",
    "Chaos Gifts: an optional card-game subsystem (needs a physical 4th-edition Chaos Gift deck) usable on any model except Daemons and Chaos Spawn — not simulated here, play it at the table.",
    "Chaos Spawn: any model (friend or foe) can be transformed into a Chaos Spawn during the battle via the Eye of the God test after playing a Chaos Gift on a Marked character — not simulated here, see the rulebook.",
    "For armies under 2000pts, the general may be a regimental champion if no other character could fill the role, and — while ill-advised — may even be a Chaos Spawn General (who cannot impart Leadership to others).",
  ],
  magicItems: [...COMMON_MAGIC_ITEMS, ...CHAOS_MAGIC_ITEMS],
  characters: [
    {
      id: "chaoslord", name: "Chaos Lord", cost: 208, stat: "Chaos Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion"],
      gearNote: "Wears Chaos Armour and carries a shield by default.",
      markGroup: { options: MARKS_WARRIOR },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take barding free)", cost: 49, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding free)", cost: 59, stat: "Daemonic Steed" },
        { id: "griffon", name: "Griffon", cost: 202, stat: "Griffon" },
        { id: "manticore", name: "Manticore", cost: 242, stat: "Manticore" },
        { id: "chimera", name: "Chimera", cost: 292, stat: "Chimera" },
        { id: "dragon", name: "Two-Headed Chaos Dragon", cost: 442, stat: "Chaos Dragon (two-headed)" },
        { id: "juggernaut", name: "Juggernaut of Khorne", cost: 52, stat: "Juggernaut of Khorne", requiresMark: "Khorne" },
        { id: "disc", name: "Disc of Tzeentch", cost: 82, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 62, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 72, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaoshero", name: "Chaos Hero", cost: 135, stat: "Chaos Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion"],
      gearNote: "Wears Chaos Armour and carries a shield by default.",
      markGroup: { options: MARKS_WARRIOR },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take barding free)", cost: 35, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding free)", cost: 45, stat: "Daemonic Steed" },
        { id: "griffon", name: "Griffon", cost: 188, stat: "Griffon" },
        { id: "manticore", name: "Manticore", cost: 228, stat: "Manticore" },
        { id: "chimera", name: "Chimera", cost: 278, stat: "Chimera" },
        { id: "dragon", name: "Two-Headed Chaos Dragon", cost: 428, stat: "Chaos Dragon (two-headed)" },
        { id: "juggernaut", name: "Juggernaut of Khorne", cost: 38, stat: "Juggernaut of Khorne", requiresMark: "Khorne" },
        { id: "disc", name: "Disc of Tzeentch", cost: 68, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 48, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 58, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaosbsb", name: "Chaos Battle Standard Bearer", cost: 116, stat: "Chaos BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "bsb"],
      gearNote: "Wears Chaos Armour. The one Chaos Reward or magic item may be a magic banner.",
      markGroup: { options: MARKS_WARRIOR },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take barding free)", cost: 21, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding free)", cost: 31, stat: "Daemonic Steed" },
        { id: "juggernaut", name: "Juggernaut of Khorne", cost: 24, stat: "Juggernaut of Khorne", requiresMark: "Khorne" },
        { id: "disc", name: "Disc of Tzeentch", cost: 54, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 34, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 44, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaossorcererlord", name: "Chaos Sorcerer Lord (level 4)", cost: 388, stat: "Chaos Sorcerer Lord", magicItemSlots: 4, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "sorcerer"],
      gearNote: "Wears Chaos Armour (may give up for free). May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (4).",
      markGroup: { options: MARKS_SORCERER },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take Barding free)", cost: 0, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding)", cost: 10, stat: "Daemonic Steed" },
        { id: "disc", name: "Disc of Tzeentch", cost: 40, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 20, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "palanquin", name: "Palanquin of Nurgle (+4 Attacks, +4 Wounds; becomes a large model)", cost: 100, requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 30, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
        { id: "griffon", name: "Griffon", cost: 160, stat: "Griffon" },
        { id: "manticore", name: "Manticore", cost: 200, stat: "Manticore" },
        { id: "chimera", name: "Chimera", cost: 250, stat: "Chimera" },
        { id: "dragon", name: "Two-Headed Chaos Dragon", cost: 400, stat: "Chaos Dragon (two-headed)" },
      ],
    },
    {
      id: "chaosmastersorcerer", name: "Master Chaos Sorcerer (level 3)", cost: 272, stat: "Chaos Master Sorcerer", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "sorcerer"],
      gearNote: "Wears Chaos Armour (may give up for free). May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (3).",
      markGroup: { options: MARKS_SORCERER },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take Barding free)", cost: 0, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding)", cost: 10, stat: "Daemonic Steed" },
        { id: "disc", name: "Disc of Tzeentch", cost: 40, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 20, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "palanquin", name: "Palanquin of Nurgle (+4 Attacks, +4 Wounds; becomes a large model)", cost: 100, requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 30, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaossorcererchampion", name: "Chaos Sorcerer Champion (level 2)", cost: 184, stat: "Chaos Sorcerer Champion", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "sorcerer"],
      gearNote: "Wears Chaos Armour (may give up for free). May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (2).",
      markGroup: { options: MARKS_SORCERER },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take Barding free)", cost: 0, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding)", cost: 10, stat: "Daemonic Steed" },
        { id: "disc", name: "Disc of Tzeentch", cost: 40, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 20, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "palanquin", name: "Palanquin of Nurgle (+4 Attacks, +4 Wounds; becomes a large model)", cost: 100, requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 30, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaossorcerer", name: "Chaos Sorcerer (level 1)", cost: 96, stat: "Chaos Sorcerer", magicItemSlots: 1, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "sorcerer"],
      gearNote: "Wears Chaos Armour (may give up for free). May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (1).",
      markGroup: { options: MARKS_SORCERER },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take Barding free)", cost: 0, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding)", cost: 10, stat: "Daemonic Steed" },
        { id: "disc", name: "Disc of Tzeentch", cost: 40, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 20, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "palanquin", name: "Palanquin of Nurgle (+4 Attacks, +4 Wounds; becomes a large model)", cost: 100, requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 30, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
  ],
  regiments: [
    {
      id: "beastmasterpack", name: "Chaos Beastmasters & Hounds/Spawns", perModel: 0, minSize: 1, kind: "composite", restriction: "0-1",
      note: "Follows main-rulebook Beastmaster rules. Take either Hounds or Spawns, not both. When taking Spawns, Beastmaster count must equal Spawn count.",
      composition: [
        { id: "beastmaster", label: "Chaos Beastmasters", cost: 21, stat: "Chaos Beastmaster" },
        { id: "hound", label: "Chaos Hounds", cost: 12, stat: "Chaos Hound" },
        { id: "spawn", label: "Chaos Spawns", cost: 60, stat: "Chaos Spawn" },
      ],
    },
    {
      id: "maraduers", name: "Chaos Marauders", perModel: 11, minSize: 5, stat: "Chaos Marauder", command: "standard",
      note: "Also called Chaos Thugs. Light armour and shields by default.",
      options: [
        { id: "ahw", group: "melee", label: "Swap shield for additional hand weapon", cost: 1.5, per: "model" },
        { id: "heavy", group: "melee", label: "Swap shield for double handed weapon or flail", cost: 3, per: "model" },
        { id: "bows", group: "melee", label: "Give up armour & shield, take bows instead", cost: 0, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 60, magicItemSlots: 1, stat: "Chaos Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "marauderhorsemen", name: "Chaos Marauder Horsemen", perModel: 23, minSize: 5, stat: "Chaos Marauder", mountStat: "Chaos Warhorse", mountLabel: "Warhorse", command: "fastCavalry",
      note: "Also called Chaos Thug Horsemen. Fast cavalry. Light armour, shields, spears, on Warhorses.",
      options: [
        { id: "flails", group: null, label: "Swap spears & shields for flails", cost: 2, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 80, magicItemSlots: 1, stat: "Chaos Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "chaoswarriors", name: "Chaos Warriors", perModel: 18, minSize: 5, stat: "Chaos Warrior", command: "standard",
      note: "Chaos Armour and shields by default.",
      options: [
        { id: "halberdahw", group: "melee", label: "Swap shield for halberd or additional hand weapon", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon", cost: 4, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 60, magicItemSlots: 1, stat: "Chaos Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "chaosknights", name: "Chaos Knights", perModel: 45, minSize: 5, stat: "Chaos Warrior", mountStat: "Chaos Warhorse", mountLabel: "Chaos Warhorse (barded)", command: "standard",
      note: "Chaos Warriors on barded Chaos Warhorses, with Chaos Armour, shields, and lances.",
      champion: { name: "Chaos Champion (with Mark of Chaos, mounted)", baseCost: 80, magicItemSlots: 1, stat: "Chaos Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "ogremercenaries", name: "Ogre Mercenaries", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous",
      note: "Light armour. Causes fear. Monstrous regiment.",
      options: [
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion", magicItemCategoryFilter: ["weapon", "armour", "enchanted", "arcane"] },
    },
  ],
  chariotsMonsters: [
    {
      id: "chaoswarriorchariot", name: "Chaos Warrior Chariot", perUnit: 79, stat: "Heavy Chariot", kind: "chariot", crewArmourFixed: "Chaos Armour",
      note: "Heavy Chariot pulled by two barded Chaos Steeds, crewed by two Chaos Warriors with Halberds and Chaos Armour (3+ armour save). Daemonic teams reduce armour save to 4+, and the Daemon type must match the Mark of a rider (or the general's, in a single-Power army).",
      extraCrewCost: 20, extraCrewLabel: "extra Chaos Warrior crew", extraSteedCost: 7, extraSteedLabel: "extra Chaos Steeds",
      scythedWheelsCost: 20, commanderCost: 60, commanderLabel: "One crewman is a Chaos Champion (with Mark of Chaos)", commanderMagicItemSlots: 1,
      variantGroupLabel: "Daemonic team (replaces Chaos Warhorses, choose at most one)",
      variantOptions: [
        { id: "juggernaut", label: "One Juggernaut of Khorne", cost: 20 },
        { id: "discs", label: "Two Discs of Tzeentch (chariot can fly, not fly high)", cost: 80 },
        { id: "nurgle", label: "One Beast of Nurgle", cost: 40 },
        { id: "slaanesh", label: "Two Steeds of Slaanesh", cost: 60 },
      ],
    },
    {
      id: "chaosmarauderchariot", name: "Chaos Marauder Chariot", perUnit: 62, stat: "Heavy Chariot", kind: "chariot", crewArmourFixed: "Light armour",
      note: "Heavy Chariot pulled by two Warhorses, crewed by two Chaos Marauders with spears, light armour and shields (5+ armour save).",
      extraCrewCost: 16, extraCrewLabel: "extra Chaos Marauder crew", extraSteedCost: 2, extraSteedLabel: "extra Warhorses",
      scythedWheelsCost: 20,
    },
    {
      id: "chaosspawns", name: "Chaos Spawns", perUnit: 60, stat: "Chaos Spawn", kind: "quantity",
      note: "Small monster, causes fear, unbreakable. Random attacks and movement — see army-wide rules.",
    },
    {
      id: "chaosabomination", name: "Chaos Abomination", stat: "Chaos Abomination", kind: "abomination", restriction: "0-1", impliedMark: "Chaos Undivided",
      note: "Only for a Chaos Warrior/Beastmen army whose general bears the Mark of Chaos Undivided. Base 30pts, minimum 100pts total. Large & causes terror instead of fear once S, T, or W is upgraded at all.",
    },
  ],
  specialCharacters: [
    { id: "aekoldhelbrass", name: "Aekold Helbrass", cost: 200, stat: "Aekold Helbrass", role: "Hero", impliedMark: "Tzeentch",
      note: "Recovers a lost wound on 4+ each turn; even if slain, reincarnates on 5+. Models in base contact recover a wound on 6+. Equipped with Chaos Armour, Mark of Tzeentch, and the Windblade (magic double handed weapon — roll 1D6 at battle start: 1-2 fly, 3-4 always strikes first, 5-6 usable as a S6 missile, range 12\", 1D6 hits)." },
    { id: "dechala", name: "Dechala the Denied One", cost: 180, stat: "Dechala the Denied One", role: "Hero", impliedMark: "Slaanesh",
      note: "Hates Khorne Daemons and Khorne Champions. Each Chaos turn picks a dance: The Praise of Slaanesh (-1 to hit vs her), Dance of Destruction (+1 to hit in melee), or Daggerdance (deflect 3 attacks per 2 given up). Six attacks (additional hand weapons for her many arms), Chaos Armour, Mark of Slaanesh, and the Elixir of Damnation (living enemies she wounds can't attack/cast against her)." },
    { id: "egrimm", name: "Egrimm van Horstmann", cost: 850, stat: "Egrimm van Horstmann", role: "Chaos Sorcerer Lord", impliedMark: "Tzeentch",
      note: "Army always deploys last. Equipped with Chaos Armour, Mark of Tzeentch, and the Crystal Skull. Rides a Chaos Dragon.", extraMagicItemSlots: 3 },
    { id: "valnir", name: "Valnir the Reaper", cost: 250, stat: "Valnir the Reaper", role: "Hero", impliedMark: "Nurgle",
      note: "Nominate an enemy regiment at battle start for a random ailment (Red Plague, Brain Fever, or Black Rot). Causes fear, immune to psychology, hates all living enemies, regenerates on 4+. Equipped with Chaos Armour, Mark of Nurgle, and the Gatherer of Souls (magic flail: always +2S, may boost WS/S/A per 3 wounds inflicted)." },
    { id: "archaon", name: "Archaon, Lord of Chaos", cost: 550, stat: "Archaon", role: "Lord",
      note: "Mark of Chaos Undivided; regiments he joins become unbreakable. Requires 4 roughly-equal Chaos Warrior regiments, one per major Power, each carrying that Power's Chaos Banner, plus a BSB. May cast a free random Dark Magic/Chaos God spell each own magic phase. Equipped with a shield, the Slayer of Kings (WS10 S7 A7), Armour of Morkar (1+ unmodifiable save, -2S vs him), the Eye of Sheerian (random battle-start effect), and rides the barded warhorse W'soraych." },
    { id: "arbaal", name: "Arbaal the Undefeated", cost: 350, stat: "Arbaal the Undefeated", role: "Lord", impliedMark: "Khorne",
      note: "Must always issue challenges in Khorne's name; becomes a Chaos Spawn if he flees. Not subject to frenzy despite being a Champion of Khorne. Immune to psychology, 2D6 attacks/round. Chaos Armour. Rides the Hound of Khorne (small Daemonic monster, immune to magic weapons, dispels spells targeting it/Arbaal/his regiment; vanishes if Arbaal dies)." },
    { id: "mordrek", name: "Count Mordrek the Damned", cost: 300, stat: "Count Mordrek", role: "Lord", impliedMark: "Chaos Undivided",
      note: "Characteristics rolled randomly each battle (WS 1D6+4, S 1D3+3, T 1D3+3, A 1D6+1). Mark of Chaos Undivided. Equipped with Chaos Armour, the Chaos Runeshield, and the Sword of Change. Rides a barded Chaos Warhorse." },
    { id: "valkia", name: "Valkia the Bloody", cost: 384, stat: "Valkia the Bloody", role: "Chaos Lord — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "Mark of Khorne (in profile). If present, no BSB may be taken — instead, all units within 12\" re-roll any failed Ld test. May not take a magic/Chaos Banner. Re-rolls the initial die on any Eye of the God test.",
      items: "Carries: Daemonshield (acts as a Parrying shield), the Spear of Slaupnir (+2S charge; on a 6 to wound while charging, man-sized victims are slain outright, no save, else 1D3 wounds), the Scarlet Armour (magic Chaos Armour, -1S to attacks against her; combined with the Daemonshield gives a 3+ save)." },
    { id: "sigvald", name: "Prince Sigvald", cost: 308, stat: "Prince Sigvald", role: "Chaos Lord — not official WHR, needs opponent's agreement", impliedMark: "Slaanesh",
      note: "Mark of Slaanesh. Treats difficult terrain, steep slopes, and water as open ground for movement (can't see through it though) — extends to any unit he joins.",
      items: "Carries: The Auric Armour (1+ save combined with his Mirrored Shield, plus Regeneration 4+), Sliverslash (+2 attacks, always strikes first), the Mirrored Shield (mundane — grants Sigvald Stupidity while carried)." },
    { id: "vilitch", name: "Vilitch the Curseling", cost: 503, stat: "Vilitch the Curseling", role: "Chaos Sorcerer Lord — not official WHR, needs opponent's agreement", impliedMark: "Tzeentch", tags: ["wizard"],
      note: "Mark of Tzeentch. Chaos Armour. His Fused Twin acts as a Spell Familiar without needing an extra model. If he dispels an enemy spell (targeting him or his unit) with a Dispel card, he keeps the power used to cast it. If an enemy wizard's Dispel card fails against his spell, he takes that card into his own hand.", extraMagicItemSlots: 2 },
    { id: "festus", name: "Festus the Leechlord", cost: 359, stat: "Festus the Leechlord", role: "Chaos Sorcerer Champion — not official WHR, needs opponent's agreement", impliedMark: "Nurgle", tags: ["wizard"],
      note: "Mark of Nurgle (in profile). Chaos Armour, Regeneration 4+. He and any unit he joins only pursue 1D6\" (binding captives), but captured units are worth double victory points. Pestilent Potions: a unit he joins gains a 5+ regeneration save and poisoned attacks (including his own) while he's with them." },
    { id: "galrauch", name: "Galrauch, The Great Drake", cost: 640, stat: "Galrauch", role: "Two-Headed Chaos Dragon — not official WHR, needs opponent's agreement", impliedMark: "Tzeentch", tags: ["wizard"],
      note: "Large monster, flies, causes terror, 4+ scaly skin save. Mark of Tzeentch. A level 4 wizard (Tzeentch Magic). One head breathes fire (S4) or poison (S3, no save) each shooting phase; once per battle one head may instead breathe the Breath of Change (teardrop template, failed Toughness test on 1D6 removes the model from play) while the other head can't breathe that phase. Each turn, a failed Ld test makes the ancient Dragon spirit surface: no move/spells/breath, half his attacks turn on himself that phase (added to the enemy's combat res if already in combat)." },
  ],
};

const BEASTMEN = {
  key: "beastmen",
  loreOptions: ["Dark Magic", "Own God's Magic"],
  name: "Beastmen",
  armyWideRules: [
    "A pure Beastmen army may mix followers of different Chaos Powers freely — Marks are chosen per character/champion with no restriction.",
    "Unruly: Ungor, Gor, and Centaur (Centigor) regiments must test at the start of the turn (equivalent to Orc & Goblin animosity) unless engaged or fleeing — on a 1, roll again: 1-5 the unit is immune to psychology but can't move/shoot/cast this turn (wizards may still dispel); 6 forces a 2D6\" move toward the nearest visible enemy and a charge next turn if in range.",
    "Ambush: a pure Beastmen army (no Warriors or Daemons) may use the Ambush special rule with all Beastmen Gor regiments, up to 25% of the army.",
    "Minotaurs (character or regiment) that win a combat with an enemy casualty must gorge on the dead instead of pursuing/overrunning (unless subject to hatred or frenzy) — if charged before their next move while feasting, they become frenzied instead.",
    "Marks of Chaos are available to Beastmen characters exactly as for Chaos Warriors (see the Chaos Warriors army's rules text for what each Mark does); Dragon Ogre characters pay an additional +25pts for the Mark of Slaanesh.",
    "The Chaos Abomination is available if the army general is a Beastman/Minotaur/Dragon Ogre/Centaur Lord or Hero bearing the Mark of Chaos Undivided.",
  ],
  magicItems: [...COMMON_MAGIC_ITEMS, ...CHAOS_MAGIC_ITEMS],
  characters: [
    {
      id: "beastmanlord", name: "Beastman Lord", cost: 148, stat: "Beastman Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Beastmen are infantry. May take light armour and a shield for free, or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Heavy Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanhero", name: "Beastman Hero", cost: 89, stat: "Beastman Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Beastmen are infantry. May take light armour and a shield for free, or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Heavy Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "minotaurlord", name: "Minotaur Lord", cost: 256, stat: "Minotaur Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Monstrous model, causes fear. After a won combat with an enemy casualty, must gorge on the dead (no pursuit/overrun unless hatred/frenzy). Charged before its next move while feasting, it becomes frenzied. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "minotaurhero", name: "Minotaur Hero", cost: 168, stat: "Minotaur Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Monstrous model, causes fear. Same gorging/frenzy rule as the Minotaur Lord. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "dragonogrelord", name: "Dragon Ogre Lord", cost: 400, stat: "Dragon Ogre Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Large model, causes terror, immune to psychology, becomes frenzied if hit by enemy lightning, 5+ armour save from scaly skin. Mark of Slaanesh costs +25pts for Dragon Ogres. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "dragonogrehero", name: "Dragon Ogre Hero", cost: 300, stat: "Dragon Ogre Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Large model, causes terror, immune to psychology, becomes frenzied if hit by enemy lightning, 5+ armour save from scaly skin. Mark of Slaanesh costs +25pts for Dragon Ogres. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "centaurlord", name: "Centaur Lord", cost: 184, stat: "Centaur Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Centaurs are cavalry. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "centaurhero", name: "Centaur Hero", cost: 110, stat: "Centaur Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Centaurs are cavalry. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "beastmanshamanlord", name: "Beastman Shaman Lord (level 4)", cost: 318, stat: "Beastman Shaman Lord", magicItemSlots: 4, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman", "shaman"],
      gearNote: "May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (4).",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanmastershaman", name: "Master Beastman Shaman (level 3)", cost: 232, stat: "Beastman Master Shaman", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman", "shaman"],
      gearNote: "May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (3).",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanshamanchampion", name: "Beastman Shaman Champion (level 2)", cost: 154, stat: "Beastman Shaman Champion", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman", "shaman"],
      gearNote: "May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (2).",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanshaman", name: "Beastman Shaman (level 1)", cost: 76, stat: "Beastman Shaman", magicItemSlots: 1, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman", "shaman"],
      gearNote: "May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (1).",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanbsb", name: "Beastman Battle Standard Bearer", cost: 96, stat: "Beastman BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: [...CHAOS_CHAMPION_ITEM_CATEGORIES], tags: ["beastman", "bsb"],
      gearNote: "0-1 slot shared with the Minotaur/Centaur BSB below — pick only one. May take light armour for free, or heavy armour for free. May take a Beastman Chariot for the price of the chariot. The one item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour", "Heavy Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "minotaurbsb", name: "Minotaur Battle Standard Bearer", cost: 132, stat: "Minotaur BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: [...CHAOS_CHAMPION_ITEM_CATEGORIES], tags: ["beastman", "bsb"],
      gearNote: "0-1 slot shared with the Beastman/Centaur BSB — pick only one. Monstrous model, causes fear. The one item may be a magic banner.",
      markGroup: { options: MARKS_WARRIOR },
    },
    {
      id: "centaurbsb", name: "Centaur Battle Standard Bearer", cost: 108, stat: "Centaur BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: [...CHAOS_CHAMPION_ITEM_CATEGORIES], tags: ["beastman", "bsb"],
      gearNote: "0-1 slot shared with the Beastman/Minotaur BSB — pick only one. Centaurs are cavalry. The one item may be a magic banner.",
      markGroup: { options: MARKS_WARRIOR },
    },
  ],
  regiments: [
    {
      id: "beastmengors", name: "Beastmen Gors", perModel: 9, minSize: 5, stat: "Beastmen Gors", command: "standard",
      note: "Shields by default. Unruly.",
      options: [
        { id: "halberds", group: "melee", label: "Swap shield for halberd", cost: 2, per: "model" },
        { id: "ahw", group: "melee", label: "Swap shield for additional hand weapon", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon", cost: 4, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 30, magicItemSlots: 1, stat: "Beastmen Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "beastmenbestigors", name: "Beastmen Bestigors", perModel: 17, minSize: 5, stat: "Beastmen Bestigors", command: "standard",
      note: "Halberds and heavy armour by default. Not unruly.",
      options: [
        { id: "dhw", group: null, label: "Swap halberds for double handed weapons", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 25, magicItemSlots: 1, stat: "Beastmen Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "beastmenungors", name: "Beastmen Ungors", perModel: 5, minSize: 5, stat: "Beastmen Ungors", command: "standard",
      note: "Unruly. If this is an independent Beastmen army, may take short bows instead of any other equipment (+1pt/model; may then skirmish).",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
        { id: "shortbows", group: null, label: "Short bows instead of any other equipment, independent Beastmen army only", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 35, magicItemSlots: 1, stat: "Beastmen Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "centaursregiment", name: "Centaurs", perModel: 16, minSize: 5, stat: "Centaurs", command: "fastCavalry",
      note: "Also called Centigors. Unruly fast cavalry. If this is an independent Beastmen army, may take bows (+2pt/model) or throwing spears (+1pt/model) instead of any other equipment; either may then skirmish.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 1, per: "model" },
        { id: "bows", group: "melee", label: "Bows instead of any other equipment, independent Beastmen army only", cost: 2, per: "model" },
        { id: "throwingspears", group: "melee", label: "Throwing spears instead of any other equipment, independent Beastmen army only", cost: 1, per: "model" },
      ],
      champion: { name: "Centaur Champion (with Mark of Chaos)", baseCost: 30, magicItemSlots: 1, stat: "Centaur Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "harpies", name: "Harpies", perModel: 22, minSize: 5, stat: "Gargoyles", command: "none", restriction: "0-1",
      note: "Flying infantry (not monstrous bases — 25x25mm, and may rank up). May skirmish. Cannot be joined by characters, cannot take a standard bearer, musician, or champion.",
    },
    {
      id: "minotaursregiment", name: "Minotaurs", perModel: 26, minSize: 3, stat: "Minotaurs", command: "monstrous",
      note: "Additional hand weapons by default. Monstrous, causes fear. After a won combat with an enemy casualty, must gorge on the dead (no pursuit/overrun unless hatred/frenzy); charged before their next move while feasting, they become frenzied.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 2, per: "model" },
        { id: "dhw", group: null, label: "Swap additional hand weapons for double handed weapons", cost: 2, per: "model" },
      ],
      champion: { name: "Minotaur Champion (with Mark of Chaos)", baseCost: 50, magicItemSlots: 1, stat: "Minotaur Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "dragonogresregiment", name: "Dragon Ogres", perModel: 56, minSize: 3, stat: "Dragon Ogres", command: "monstrous",
      note: "Monstrous, causes fear. 5+ armour save from scaly skin. Becomes frenzied if struck by enemy lightning.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 8, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 12, per: "model" },
      ],
      champion: { name: "Dragon Ogre Champion (with Mark of Chaos; +25pt if Mark of Slaanesh)", baseCost: 50, magicItemSlots: 1, stat: "Dragon Ogre Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "trolls", name: "Trolls", perModel: 40, minSize: 3, stat: "Trolls", command: "none",
      note: "Must be River Trolls (free), Stone Trolls (free), or Chaos Trolls (+5pt/model). Monstrous, stupid, immune to psychology, cause fear, regenerate on 4+; may vomit instead of attacking (auto-hit, S5, no save, 1D3 wounds). Cannot take a standard bearer, musician, or champion. River: crosses water freely, enemies -1 to hit in melee (living only). Stone: 2+ natural dispel. Chaos: +1 Attack.",
      options: [
        { id: "chaostrolls", group: null, label: "Chaos Trolls, +1 Attack", cost: 5, per: "model" },
      ],
    },
    {
      id: "gorbeastmasterpack", name: "Gor Beastmasters & Chaos Hounds", perModel: 0, minSize: 1, kind: "composite", restriction: "0-1",
      note: "Follows main-rulebook Beastmaster rules. Gor Beastmasters are NOT unruly (unlike ordinary Gors).",
      composition: [
        { id: "beastmaster", label: "Gor Beastmasters", cost: 16, stat: "Gor Beastmaster" },
        { id: "hound", label: "Chaos Hounds", cost: 12, stat: "Chaos Hound" },
      ],
    },
  ],
  chariotsMonsters: [
    {
      id: "giantscyclopes", name: "Giant / Cyclops", perUnit: 200, stat: "Giants and Cyclopes", kind: "quantity",
      note: "Follows the main-rulebook Giant rules. Upgrading to a Cyclops (+50pts) lets it hurl boulders like a small stone thrower if it didn't march (max range 48\"; a misfire sends the shot 1D6x10\" in a random direction from the Cyclops).",
      variantOptions: [
        { id: "cyclops", label: "Upgrade to a Cyclops (stone-thrower boulders)", cost: 50 },
      ],
    },
    {
      id: "beastmanchariots", name: "Beastman Chariot", perUnit: 70, stat: "Extra Heavy Chariot", kind: "chariot", crewArmourFixed: "Light armour",
      note: "Extra Heavy Chariot (T6) pulled by two Tuskgors (+2S on the charge), crewed by two Gor Beastmen with spears, light armour, shields (4+ combined save from the Tuskgors' hide).",
      extraCrewCost: 7, extraCrewLabel: "extra Gor Beastmen crew", extraSteedCost: 8, extraSteedLabel: "extra Tuskgors",
      scythedWheelsCost: 20, commanderCost: 42, commanderLabel: "One crewman is a Gor Beastman Champion (with Mark of Chaos)", commanderMagicItemSlots: 1,
    },
    {
      id: "jabberslythe", name: "Jabberslythe", perUnit: 225, stat: "Jabberslythe", kind: "quantity", restriction: "0-1",
      note: "Large monster, causes terror, immune to psychology. 10\" fly move (can't fly high), 5+ armour save. Aura of Madness: enemies within 12\" that can see it test Ld each enemy turn, taking 1 wound per point failed by (no save; doesn't affect psychology-immune units). Spurting Bile-blood: each wound landed on it in melee hits the attacker with a S4 hit. Slithery Tongue: 12\" shooting attack, S4, auto-hits, swallows whole any man-sized model that takes a wound (counts as slain, no Look Out Sir).",
    },
    {
      id: "chaosabomination", name: "Chaos Abomination", stat: "Chaos Abomination", kind: "abomination", restriction: "0-1", impliedMark: "Chaos Undivided",
      note: "Only for a Chaos Warrior/Beastmen army whose general bears the Mark of Chaos Undivided. Base 30pts, minimum 100pts total. Large & causes terror instead of fear once S, T, or W is upgraded at all.",
    },
  ],
  specialCharacters: [
    { id: "kholek", name: "Kholek Suneater", cost: 485, stat: "Kholek Suneater", role: "Dragon Ogre Lord — not official WHR, needs opponent's agreement", impliedMark: "Chaos Undivided",
      note: "Large monster, causes terror, immune to psychology, 5+ scaly-skin save, frenzied if hit by enemy lightning. Mark of Chaos Undivided (in profile). In the shooting phase, targets an unengaged visible enemy unit: on 2-6 it takes 1D6 S6 lightning hits, on a 1 Kholek is hit instead. Lightning-based spells targeting a unit within 12\" of him are redirected to him instead.",
      items: "Carries: Starcrusher (magic weapon, 1 wound = D3 wounds), Armour of the Storm (heavy armour, immune to lightning attacks, becomes frenzied if struck by lightning anyway)." },
    { id: "gorthor", name: "Gorthor the Beastlord", cost: 550, stat: "Gorthor the Beastlord", role: "Master Beastman Shaman", impliedMark: "Chaos Undivided",
      note: "If Gorthor is the army general, all Gor and Ungor regiments within 12\" automatically pass their unruly tests. Rides a Beastman Chariot with scythed wheels, and pursues an extra 1D6\" while mounted. The Impaler: magic spear granting +2S on the charge (instead of the usual +1), no armour save; if all four attacks hit, the enemy model is slain outright. The Skull of Mugrar: attacks against Gorthor himself (not his chariot) suffer -1 to hit and -1 to wound. The Cloak of the Beastlord: roll 1D6 before the battle — the cloak absorbs that many wounds before Gorthor takes any himself." },
    { id: "khazrak", name: "Khazrak the One-Eye and Redmaw", cost: 120, stat: "Khazrak the One-Eye", mountStat: "Redmaw", mountLabel: "Redmaw (Chaos Hound)", role: "Hero", impliedMark: "Chaos Undivided",
      note: "Heavy armour, and the magic whip Scourge, which grants one additional attack (at -1 to armour save) against any model in the regiment Khazrak is in base contact with. Redmaw the Chaos Hound stays with Khazrak unless sent to attack an enemy unit within its charge range (it then rejoins Khazrak once that enemy is destroyed). While together they share one psychology test rather than testing separately. If either is slain, the other becomes subject to frenzy." },
    { id: "throgg", name: "Throgg, King of Trolls", cost: 200, stat: "Throgg, King of Trolls", role: "Unique Troll", impliedMark: "Chaos Undivided",
      note: "A Troll, and may join any unit of Trolls; all normal Troll rules apply to him. When vomiting, makes 1D6+1 hits instead of one. Once per game may make a breath attack, S5, no armour save. Has no Mark of Chaos of his own but is treated as Chaos Undivided for army-building purposes." },
  ],
};

const CHAOS_DAEMONS = {
  key: "daemons",
  loreOptions: ["Dark Magic", "Own God's Magic"],
  name: "Daemons",
  armyWideRules: [
    "A pure Daemons army may mix followers of different Chaos Powers freely — this is what a Daemon army normally does, and pure Daemon armies never suffer Daemon Animosity for it.",
    "All Daemons: cause fear; attacks count as magical; immune to poison and to any effect that only affects living models; immune to psychology and never flee (if forced to flee, they simply vanish into the Realm of Chaos, counted as slain); have a 4+ Daemonic Save (works like an armour save, but is negated by magical attacks, both spells and magic items).",
    "Only Daemon characters may join Daemon regiments — mainly relevant for a small (unwinged) Daemon Prince, who may only join a regiment sharing his Mark of Chaos.",
    "Daemons normally cannot take magic items at all — the Daemonic Reward list (a separate, non-magic-item category that isn't affected by rules that negate magic items) is their equivalent.",
    "Nurgle's stench, Slaanesh's musk, and similar to-hit penalties don't stack, and are ineffective against models with a matching special rule (e.g. Plaguebearers fighting other Plaguebearers).",
  ],
  magicItems: [...COMMON_MAGIC_ITEMS, ...CHAOS_MAGIC_ITEMS],
  characters: [
    {
      id: "daemonprince", name: "Daemon Prince", cost: 200, stat: "Daemon Prince", magicItemSlots: 2, magicItemCategoryFilter: ["daemonicreward", "chaosbanner"],
      gearNote: "Large, causes terror. Comes with a free Mark of Chaos. May take up to four magic levels for +60pts each (Chaos Undivided uses Dark Magic; other Marks use their own lore) — unless he bears the Mark of Khorne. May become the army's Battle Standard Bearer for free if he doesn't take Wings (not separately modeled — just don't also buy the BSB character). Takes 2 Daemonic Rewards; if he's the BSB in a single-Power army, he may take a Chaos Banner instead of losing a Daemonic Reward slot.",
      markGroup: { options: MARKS_WARRIOR },
      wingsOption: { label: "Wings (can fly)", cost: 100 },
      magicLevelOption: { label: "Magic levels", costPerLevel: 60, max: 4, forbiddenMark: "Khorne" },
    },
    {
      id: "bloodthirster", name: "Bloodthirster, Greater Daemon of Khorne", cost: 666, stat: "Bloodthirster", magicItemSlots: 0, impliedMark: "Khorne",
      gearNote: "Large, causes terror, can fly. Bears the Mark of Khorne. Wears Chaos Armour (replaces the 4+ Daemonic Save with a 4+ armour save) and The Whip and Axe of Khorne (fixed — already reflected in his profile's 11 attacks and 1D3-wound multiplier).",
    },
    {
      id: "lordofchange", name: "Lord of Change, Greater Daemon of Tzeentch", cost: 725, stat: "Lord of Change", magicItemSlots: 1, magicItemCategoryFilter: ["daemonicreward"], impliedMark: "Tzeentch", tags: ["wizard"],
      gearNote: "Large, causes terror, can fly. Bears the Mark of Tzeentch. A level 5 wizard using Tzeentch Magic (fixed). May take 1 Daemonic Reward.",
    },
    {
      id: "greatuncleanone", name: "Great Unclean One, Greater Daemon of Nurgle", cost: 375, stat: "Great Unclean One", magicItemSlots: 0, impliedMark: "Nurgle",
      gearNote: "Large, causes terror. Bears the Mark of Nurgle. Surrounded by the Cloud of Flies (-1 to hit for enemies in base contact), immune to stench/insect/disease to-hit penalties and disease effects. Can breathe a Stream of Corruption each shooting phase (teardrop template, Initiative test or die outright, T7+ take 1D6 wounds instead, no save).",
      magicLevelOption: { label: "Magic levels (Nurgle Magic)", costPerLevel: 60, max: 4 },
    },
    {
      id: "keeperofsecrets", name: "Keeper of Secrets, Greater Daemon of Slaanesh", cost: 325, stat: "Keeper of Secrets", magicItemSlots: 0, impliedMark: "Slaanesh",
      gearNote: "Large, causes terror. Bears the Mark of Slaanesh. Surrounded by the Allure of Slaanesh (enemies in melee must pass an Ld test on 3D6, 2D6 if immune to psychology, or pick another target). Has Razor Sharp Pincers (no armour save allowed).",
      magicLevelOption: { label: "Magic levels (Slaanesh Magic)", costPerLevel: 60, max: 4 },
    },
  ],
  regiments: [
    {
      id: "gargoyles", name: "Gargoyles", perModel: 18, minSize: 5, stat: "Gargoyles", command: "none", restriction: "0-1", impliedMark: "Chaos Undivided",
      note: "Also called Furies. Flying infantry, like Harpies. May skirmish. Cannot take a standard bearer or musician, or be joined by characters. Counts as Chaos Undivided.",
    },
    {
      id: "bloodlettersfoot", name: "Bloodletters of Khorne", perModel: 16, minSize: 5, stat: "Bloodletters of Khorne", command: "standard",
      note: "Daemon blades: no armour save, 1 wound = 1D3.",
      champion: { name: "Bloodletter Champion", baseCost: 36, magicItemSlots: 1, stat: "Bloodletter Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "bloodlettersjuggernaut", name: "Bloodletters riding Juggernauts of Khorne", perModel: 86, minSize: 3, stat: "Bloodletters of Khorne", mountStat: "Juggernaut of Khorne", mountLabel: "Juggernaut of Khorne", command: "monstrous",
      note: "Unique monstrous-cavalry hybrid. Daemonic Save 3+ as cavalry; the Juggernaut auto-hits/wounds with one of its two attacks. Cannot enter buildings unless dismounted (removes the Juggernaut); kill the mount to kill the whole model.",
      champion: { name: "Bloodletter Champion (mounted)", baseCost: 126, magicItemSlots: 1, stat: "Bloodletter Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "fleshhounds", name: "Flesh Hounds of Khorne", perModel: 35, minSize: 5, stat: "Flesh Hounds of Khorne", command: "none",
      note: "Move as fast cavalry. Cannot take a standard bearer or musician, or be joined by characters. Magic weapons affect them only for their mundane value; they dispel all spells cast on them.",
    },
    {
      id: "pinkhorrors", name: "Pink Horrors of Tzeentch", perModel: 19, minSize: 5, stat: "Pink Horrors of Tzeentch", command: "standard",
      note: "No Daemonic Save — when slain, place two Blue Horrors at the back instead (not simulated as separate models here; treat the unit as a single pool of points).",
      champion: { name: "Pink Horror Champion", baseCost: 39, magicItemSlots: 1, stat: "Pink Horror Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "discsoftzeentch", name: "(Unridden) Discs of Tzeentch", perModel: 30, minSize: 3, stat: "Disc of Tzeentch", command: "skirmisher", restriction: "0-1",
      note: "Also called Screamers. Flying monstrous regiment (skirmishers). May fly over unengaged enemy units in the remaining-moves phase for a S5 hit each (each target only once). May fly high (unlike ridden Discs).",
    },
    {
      id: "flamers", name: "Flamers of Tzeentch", perModel: 40, minSize: 5, stat: "Flamers of Tzeentch", command: "none",
      note: "Move as fast cavalry; cross obstacles freely but not woods. Cannot take a standard bearer or musician. Each model makes 1D6 flaming shooting attacks (range 6\", BS to hit, S3); in melee, wounds multiply into 1D3.",
    },
    {
      id: "nurglings", name: "Nurglings", perModel: 20, minSize: 3, stat: "Nurglings", command: "none",
      note: "Monstrous regiment. May skirmish. Cannot take a standard bearer or musician, or be joined by characters.",
    },
    {
      id: "plaguebearersbeasts", name: "Plaguebearers of Nurgle riding Beasts of Nurgle", perModel: 88, minSize: 3, stat: "Plaguebearers of Nurgle", mountStat: "Beast of Nurgle", mountLabel: "Beast of Nurgle", command: "monstrous",
      note: "Unique monstrous-cavalry hybrid. Daemonic Save 3+ as cavalry; wounded living models are automatically slain; the Beast's hits allow no armour save and enemies in base contact suffer -1 to hit. Cannot enter buildings unless dismounted; kill the mount to kill the whole model.",
      champion: { name: "Plaguebearer Champion (mounted)", baseCost: 128, magicItemSlots: 1, stat: "Plaguebearer Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "plaguebearersfoot", name: "Plaguebearers of Nurgle", perModel: 18, minSize: 5, stat: "Plaguebearers of Nurgle", command: "standard",
      note: "Wounded living models are automatically slain. Enemies in base contact suffer -1 to hit.",
      champion: { name: "Plaguebearer Champion", baseCost: 38, magicItemSlots: 1, stat: "Plaguebearer Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "beastsofnurgle", name: "Beasts of Nurgle", perModel: 45, minSize: 3, stat: "Beast of Nurgle", command: "none",
      note: "Monstrous regiment. Cannot take a standard bearer or musician, or be joined by characters. Hits allow no armour save; enemies in base contact suffer -1 to hit.",
    },
    {
      id: "fiendsofslaanesh", name: "Fiends of Slaanesh", perModel: 65, minSize: 3, stat: "Fiends of Slaanesh", command: "none",
      note: "Monstrous regiment. Cannot take a standard bearer or musician, or be joined by characters. Move as fast cavalry. Soporific Musk: enemies in base contact suffer -1 to hit.",
    },
    {
      id: "daemonettesfoot", name: "Daemonettes of Slaanesh", perModel: 15, minSize: 5, stat: "Daemonettes of Slaanesh", command: "standard",
      champion: { name: "Daemonette Champion", baseCost: 35, magicItemSlots: 1, stat: "Daemonette Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "daemonettessteeds", name: "Daemonettes riding Steeds of Slaanesh", perModel: 30, minSize: 5, stat: "Daemonettes of Slaanesh", mountStat: "Steed of Slaanesh", mountLabel: "Steed of Slaanesh", command: "fastCavalry",
      note: "The Steed's hits don't wound but grant the rider an automatic hit; 3+ Daemonic Save as cavalry, fast cavalry.",
      champion: { name: "Daemonette Champion (mounted)", baseCost: 60, magicItemSlots: 1, stat: "Daemonette Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
  ],
  chariotsMonsters: [
    {
      id: "chaosspawns", name: "Chaos Spawns", perUnit: 60, stat: "Chaos Spawn", kind: "quantity",
      note: "Small monster, causes fear, unbreakable. Random attacks and movement — see army-wide rules.",
    },
    {
      id: "daemonicchariotkhorne", name: "Daemonic Chariot of Khorne", perUnit: 90, stat: "Heavy Chariot", kind: "quantity",
      note: "Heavy Chariot pulled by one Juggernaut of Khorne, crewed by two Bloodletters. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariotnurgle", name: "Daemonic Chariot of Nurgle", perUnit: 110, stat: "Heavy Chariot", kind: "quantity",
      note: "Heavy Chariot pulled by one Beast of Nurgle, crewed by two Plaguebearers. 4+ Daemonic Save. Enemies suffer -1 to hit in melee against it.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariotslaanesh", name: "Daemonic Chariot of Slaanesh", perUnit: 130, stat: "Heavy Chariot", kind: "quantity",
      note: "Heavy Chariot pulled by two Steeds of Slaanesh, crewed by two Daemonettes. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariottzeentch", name: "Daemonic Chariot of Tzeentch", perUnit: 150, stat: "Heavy Chariot", kind: "quantity",
      note: "Heavy Chariot pulled by two Discs of Tzeentch, crewed by two Pink Horrors (don't split into Blue Horrors when slain in a chariot). Can fly, not fly high. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "hellcannon", name: "Hellcannon", perUnit: 120, stat: "Hellcannon Daemon", kind: "warmachine",
      note: "House rule / optional — ask your opponent's permission before including it, primarily meant for Siege Battles. A Daemon that works as a war machine, crewed by three Chaos Dwarfs in heavy armour. Shoots like a large stone thrower; any regiment losing even one model to it must take a panic test; shots count as magical. A misfire eats 1D3 crew instead of firing; if all crew die, it becomes an independent monster with random movement that charges the nearest model each turn (friend or foe), following normal Daemon rules — and still defends itself if charged.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Chaos Dwarf crew",
      crewArmourFixed: "Heavy armour",
    },
  ],
  specialCharacters: [
    { id: "skulltaker", name: "Skulltaker", cost: 107, stat: "Skulltaker", role: "Unique Bloodletter Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "The Slayer Sword: flaming attacks; on a 6 to wound, man-sized victims are slain outright (no save), else 1D3 wounds ignoring armour. The Cloak of Skulls: counts as the Chaos Armour Daemonic Reward (4+ armour save instead of Daemonic Save)." },
    { id: "karanak", name: "Karanak", cost: 125, stat: "Karanak", role: "Unique Flesh Hound Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "Must join a Flesh Hounds unit (exception to the normal rule). Magic weapons only affect him for their mundane value; dispels all spells cast on him. Nominate an enemy model as his quarry at battle start — re-rolls failed to-hit and to-wound rolls against it." },
    { id: "skarbrand", name: "Skarbrand", cost: 610, stat: "Skarbrand", role: "Bloodthirster — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "Large, causes terror, frenzy (can never lose it — while alive, ALL units on the table, friend and foe, are subject to Hatred). Chaos Armour (4+ save instead of Daemonic Save). Slaughter and Carnage: paired axes (a Daemonic Reward, not a magic weapon) granting an extra attack (in profile) and ignoring armour saves. Once/turn in the shooting phase may bellow (teardrop template, S5), even while engaged." },
    { id: "bluescribes", name: "The Blue Scribes", cost: 109, stat: "The Blue Scribes", role: "Unique Pink Horror Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Tzeentch",
      note: "Already two Blue Horrors — doesn't split further when slain. Treat rider+mount as one model; mounted on a Disc of Tzeentch, 4+ Daemonic Save, can't join a unit. In the magic phase, may cast one spell from any college — roll a D10 to see which spell is selected (no choice of the spell itself); cast as a bound spell." },
    { id: "changeling", name: "The Changeling", cost: 130, stat: "The Changeling", role: "Unique Daemonic Hero of Tzeentch — not official WHR, needs opponent's agreement", impliedMark: "Tzeentch",
      note: "A level 1 wizard (Lore of Tzeentch). At the start of each melee phase, may raise any of his WS/S/T/I/A to match an enemy model in base contact (the higher value if that model has more than one). Can't match a model fighting a challenge unless he's in that challenge too." },
    { id: "epidemius", name: "Epidemius", cost: 288, stat: "Epidemius", role: "Unique Plaguebearer Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Nurgle",
      note: "Rides a Palanquin of Nurgle. Tracks all unsaved wounds caused by Nurgle Daemons/spells (friend or foe) as the Tally of Pestilence — cumulative, army-wide bonuses for all Nurgle Daemons at 7+/14+/21+/28+ wounds (Ld, then S, then T, then re-roll failed saves). Lost if Epidemius dies." },
    { id: "kugath", name: "Ku'Gath Plaguefather", cost: 515, stat: "Ku'Gath Plaguefather", role: "Great Unclean One — not official WHR, needs opponent's agreement", impliedMark: "Nurgle",
      note: "Large, causes terror, Cloud of Flies, Stream of Corruption breath. A level 1 wizard (Nurgle Magic), hates Dwarfs. A Nurgling base within 6\" auto-regenerates D3 wounds each of his turns. Once/shooting phase, Nurglings may burst from him as a small-stone-thrower shooting attack (may move but not march while firing; a misfire does nothing)." },
    { id: "masqueofslaanesh", name: "The Masque of Slaanesh", cost: 95, stat: "The Masque of Slaanesh", role: "Unique Daemonette Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Slaanesh",
      note: "Can't join any unit. 3+ Daemonic Save (not the usual 4+). Each of her melee phases, picks one dance targeting an enemy unit within 12\" (no LoS needed): Dance of Dreaming (-1 Ld), Fleshspasm Polka (-1 S), or Waltz of Lethargy (-1 I), to a minimum of 1, until end of phase." },
    { id: "belakor", name: "Be'lakor, The Dark Master", cost: 650, stat: "Belakor", role: "Daemon Prince of Chaos Undivided — not official WHR, needs opponent's agreement", impliedMark: "Chaos Undivided",
      note: "Mark of Chaos Undivided (in profile). Large, causes terror (permanently — units never become immune to it), flies. A level 4 wizard (Dark Magic). All enemies suffer -1 Ld when rallying anywhere; living enemies within 6\" of him suffer an extra -1 Ld (cumulative). Enemy shooting at him or his army suffers -1 to hit. Each turn, a failed Ld test forces him to charge the nearest visible enemy if in range, or move toward the nearest enemy model (stopping 1\" short if it would overshoot)." },
    { id: "amonchakai", name: "Amon 'Chakai", cost: 825, stat: "Amon 'Chakai", role: "Lord of Change", impliedMark: "Tzeentch",
      note: "Causes terror, can fly. A level 5 wizard using Tzeentch spells. Hates Nurgle Daemons and Nurgle-marked Champions. At battle start, nominate one enemy model doomed to perish — that model is automatically hit in melee by all attackers for the rest of the battle. The All-Seeing Eye of Tzeentch: at battle start, the enemy must reveal all hidden objects on the battlefield (magic items, spells, Rewards, Bloodline Powers, Virtues, Assassins, Fanatics, etc.)." },
    { id: "azazel", name: "Azazel, Prince of Damnation", cost: 550, stat: "Azazel", role: "Daemon Prince of Slaanesh", impliedMark: "Slaanesh",
      note: "Causes terror, can fly. A level 2 wizard using Slaanesh spells. Wields a Daemonblade allowing no armour save, plus a seventh attack worked out at S8 (1 wound = 1D3). Dark Halo grants a 4+ ward save (replaces his Daemonic Save). A model in base contact loses 1 attack each melee round. At the start of the Chaos player's turn, one enemy character in base contact must pass an Ld test (unless immune to psychology) or now serves Slaanesh — award victory points for a turned character depending on whether it's later slain or survives the battle." },
    { id: "scylaanfingrim", name: "Scyla Anfingrim", cost: 200, stat: "Scyla Anfingrim", role: "Large Chaos Spawn — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "Unbreakable, causes fear. Unlike normal Chaos Spawn, doesn't move randomly and doesn't have a random number of attacks. 4+ armour save unmodified by Strength — a successful save against a magic weapon destroys it. 4+ natural dispel; a successful dispel destroys the enemy spell. A former Champion of Khorne, still counted as a follower of Khorne for army selection; may be the army general in small (under 2000pt) armies." },
  ],
};

const CHAOS_WARBAND = {
  key: "chaoswarband",
  loreOptions: ["Dark Magic", "Own God's Magic"],
  name: "Chaos Warband",
  armyWideRules: [
    "A Chaos Warband draws from all three Chaos army lists (Chaos Warriors, Beastmen, and Daemons) at once, but is always dedicated to a single Chaos Power — pick your Power below. At 2000pts or more you may instead choose \"Chaos Warhost,\" which keeps everything else about a Warband but allows mixing Powers freely.",
    "A Chaos Warband's general must be a Chaos Warrior character (Lord, Hero, Sorcerer, or a regimental Chaos Champion) — not enforced by this builder, track it yourself.",
    "A Chaos Warband must include a Chaos Warriors or Chaos Knights regiment.",
    "A Chaos Warband's Battle Standard Bearer, if any, must be chosen from the Chaos Warrior section — this builder only offers the Chaos Battle Standard Bearer here for that reason (Beastman/Minotaur/Centaur BSBs and the Daemon Prince's informal BSB option are Warriors/Beastmen/Daemons-only faction features).",
    "Armies loyal to a single Chaos Power gain exclusive access to Chaos Banners (only the Chaos Battle Standard Bearer may carry one) — these vanish from the item list the moment you switch to Chaos Warhost.",
    "Chaos Champions wear Chaos Armour by default; Marks of Chaos, Chaos Gifts, and Chaos Spawn transformation all work as described in the Chaos Warriors army's rules text.",
    "The Chaos Abomination requires the army general to bear the Mark of Chaos Undivided — pick Chaos Undivided as your Power (or Chaos Warhost) to unlock it.",
    "Archaon, Lord of Chaos is exempt from the single-Power lock — his own composition rule requires four roughly-equal Chaos Warrior regiments, one per major Power, so he remains selectable under any Power (though his own regiment requirement still applies and isn't enforced here).",
  ],
  themes: {
    default: "Chaos Undivided",
    label: "Chaos Power",
    options: [
      { id: "Khorne", name: "Khorne", desc: "Blood and battle. Sorcerers may not follow Khorne." },
      { id: "Tzeentch", name: "Tzeentch", desc: "Change and sorcery." },
      { id: "Nurgle", name: "Nurgle", desc: "Decay and endurance." },
      { id: "Slaanesh", name: "Slaanesh", desc: "Excess and obsession." },
      { id: "Chaos Undivided", name: "Chaos Undivided", desc: "Devotion to Chaos as a unified whole. Unlocks the Chaos Abomination." },
      { id: "Mixed", name: "Chaos Warhost (Mixed Powers)", desc: "Requires an army of at least 2000pts. Frees every character/champion to take any Mark, but loses access to Chaos Banners." },
    ],
  },
  themeGates: [
    { themeId: "Mixed", minPoints: 2000, label: "Chaos Warhost" },
  ],
  compositionRules: [
    { kind: "requiresAtLeastOne", label: "At least one Chaos Warriors or Chaos Knights regiment", refs: [
      { list: "regiments", id: "chaoswarriors", name: "Chaos Warriors" },
      { list: "regiments", id: "chaosknights", name: "Chaos Knights" },
    ] },
  ],
  magicItems: [...COMMON_MAGIC_ITEMS, ...CHAOS_MAGIC_ITEMS],
  characters: [
    {
      id: "chaoslord", name: "Chaos Lord", cost: 208, stat: "Chaos Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion"],
      gearNote: "Wears Chaos Armour and carries a shield by default.",
      markGroup: { options: MARKS_WARRIOR },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take barding free)", cost: 49, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding free)", cost: 59, stat: "Daemonic Steed" },
        { id: "griffon", name: "Griffon", cost: 202, stat: "Griffon" },
        { id: "manticore", name: "Manticore", cost: 242, stat: "Manticore" },
        { id: "chimera", name: "Chimera", cost: 292, stat: "Chimera" },
        { id: "dragon", name: "Two-Headed Chaos Dragon", cost: 442, stat: "Chaos Dragon (two-headed)" },
        { id: "juggernaut", name: "Juggernaut of Khorne", cost: 52, stat: "Juggernaut of Khorne", requiresMark: "Khorne" },
        { id: "disc", name: "Disc of Tzeentch", cost: 82, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 62, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 72, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaoshero", name: "Chaos Hero", cost: 135, stat: "Chaos Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion"],
      gearNote: "Wears Chaos Armour and carries a shield by default.",
      markGroup: { options: MARKS_WARRIOR },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take barding free)", cost: 35, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding free)", cost: 45, stat: "Daemonic Steed" },
        { id: "griffon", name: "Griffon", cost: 188, stat: "Griffon" },
        { id: "manticore", name: "Manticore", cost: 228, stat: "Manticore" },
        { id: "chimera", name: "Chimera", cost: 278, stat: "Chimera" },
        { id: "dragon", name: "Two-Headed Chaos Dragon", cost: 428, stat: "Chaos Dragon (two-headed)" },
        { id: "juggernaut", name: "Juggernaut of Khorne", cost: 38, stat: "Juggernaut of Khorne", requiresMark: "Khorne" },
        { id: "disc", name: "Disc of Tzeentch", cost: 68, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 48, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 58, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaosbsb", name: "Chaos Battle Standard Bearer", cost: 116, stat: "Chaos BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: CHAOS_WARBAND_BSB_ITEM_CATEGORIES, tags: ["chaosChampion", "bsb"],
      gearNote: "Wears Chaos Armour. The one Chaos Reward or magic item may be a magic banner.",
      markGroup: { options: MARKS_WARRIOR },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take barding free)", cost: 21, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding free)", cost: 31, stat: "Daemonic Steed" },
        { id: "juggernaut", name: "Juggernaut of Khorne", cost: 24, stat: "Juggernaut of Khorne", requiresMark: "Khorne" },
        { id: "disc", name: "Disc of Tzeentch", cost: 54, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 34, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 44, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaossorcererlord", name: "Chaos Sorcerer Lord (level 4)", cost: 388, stat: "Chaos Sorcerer Lord", magicItemSlots: 4, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "sorcerer"],
      gearNote: "Wears Chaos Armour (may give up for free). May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (4).",
      markGroup: { options: MARKS_SORCERER },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take Barding free)", cost: 0, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding)", cost: 10, stat: "Daemonic Steed" },
        { id: "disc", name: "Disc of Tzeentch", cost: 40, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 20, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "palanquin", name: "Palanquin of Nurgle (+4 Attacks, +4 Wounds; becomes a large model)", cost: 100, requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 30, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
        { id: "griffon", name: "Griffon", cost: 160, stat: "Griffon" },
        { id: "manticore", name: "Manticore", cost: 200, stat: "Manticore" },
        { id: "chimera", name: "Chimera", cost: 250, stat: "Chimera" },
        { id: "dragon", name: "Two-Headed Chaos Dragon", cost: 400, stat: "Chaos Dragon (two-headed)" },
      ],
    },
    {
      id: "chaosmastersorcerer", name: "Master Chaos Sorcerer (level 3)", cost: 272, stat: "Chaos Master Sorcerer", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "sorcerer"],
      gearNote: "Wears Chaos Armour (may give up for free). May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (3).",
      markGroup: { options: MARKS_SORCERER },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take Barding free)", cost: 0, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding)", cost: 10, stat: "Daemonic Steed" },
        { id: "disc", name: "Disc of Tzeentch", cost: 40, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 20, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "palanquin", name: "Palanquin of Nurgle (+4 Attacks, +4 Wounds; becomes a large model)", cost: 100, requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 30, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaossorcererchampion", name: "Chaos Sorcerer Champion (level 2)", cost: 184, stat: "Chaos Sorcerer Champion", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "sorcerer"],
      gearNote: "Wears Chaos Armour (may give up for free). May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (2).",
      markGroup: { options: MARKS_SORCERER },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take Barding free)", cost: 0, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding)", cost: 10, stat: "Daemonic Steed" },
        { id: "disc", name: "Disc of Tzeentch", cost: 40, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 20, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "palanquin", name: "Palanquin of Nurgle (+4 Attacks, +4 Wounds; becomes a large model)", cost: 100, requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 30, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "chaossorcerer", name: "Chaos Sorcerer (level 1)", cost: 96, stat: "Chaos Sorcerer", magicItemSlots: 1, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion", "sorcerer"],
      gearNote: "Wears Chaos Armour (may give up for free). May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (1).",
      markGroup: { options: MARKS_SORCERER },
      armourGroup: { options: CHAOS_ARMOUR_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Chaos Warhorse (may take Barding free)", cost: 0, stat: "Chaos Warhorse" },
        { id: "daemonicsteed", name: "Daemonic Steed (may take barding)", cost: 10, stat: "Daemonic Steed" },
        { id: "disc", name: "Disc of Tzeentch", cost: 40, stat: "Disc of Tzeentch", requiresMark: "Tzeentch" },
        { id: "beast", name: "Beast of Nurgle", cost: 20, stat: "Beast of Nurgle", requiresMark: "Nurgle" },
        { id: "palanquin", name: "Palanquin of Nurgle (+4 Attacks, +4 Wounds; becomes a large model)", cost: 100, requiresMark: "Nurgle" },
        { id: "steed", name: "Steed of Slaanesh", cost: 30, stat: "Steed of Slaanesh", requiresMark: "Slaanesh" },
      ],
    },
    {
      id: "beastmanlord", name: "Beastman Lord", cost: 148, stat: "Beastman Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Beastmen are infantry. May take light armour and a shield for free, or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Heavy Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanhero", name: "Beastman Hero", cost: 89, stat: "Beastman Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Beastmen are infantry. May take light armour and a shield for free, or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Heavy Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "minotaurlord", name: "Minotaur Lord", cost: 256, stat: "Minotaur Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Monstrous model, causes fear. After a won combat with an enemy casualty, must gorge on the dead (no pursuit/overrun unless hatred/frenzy). Charged before its next move while feasting, it becomes frenzied. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "minotaurhero", name: "Minotaur Hero", cost: 168, stat: "Minotaur Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Monstrous model, causes fear. Same gorging/frenzy rule as the Minotaur Lord. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "dragonogrelord", name: "Dragon Ogre Lord", cost: 400, stat: "Dragon Ogre Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Large model, causes terror, immune to psychology, becomes frenzied if hit by enemy lightning, 5+ armour save from scaly skin. Mark of Slaanesh costs +25pts for Dragon Ogres. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "dragonogrehero", name: "Dragon Ogre Hero", cost: 300, stat: "Dragon Ogre Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Large model, causes terror, immune to psychology, becomes frenzied if hit by enemy lightning, 5+ armour save from scaly skin. Mark of Slaanesh costs +25pts for Dragon Ogres. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "centaurlord", name: "Centaur Lord", cost: 184, stat: "Centaur Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Centaurs are cavalry. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "centaurhero", name: "Centaur Hero", cost: 110, stat: "Centaur Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Centaurs are cavalry. May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "beastmanshamanlord", name: "Beastman Shaman Lord (level 4)", cost: 318, stat: "Beastman Shaman Lord", magicItemSlots: 4, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman", "shaman"],
      gearNote: "May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (4).",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanmastershaman", name: "Master Beastman Shaman (level 3)", cost: 232, stat: "Beastman Master Shaman", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman", "shaman"],
      gearNote: "May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (3).",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanshamanchampion", name: "Beastman Shaman Champion (level 2)", cost: 154, stat: "Beastman Shaman Champion", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman", "shaman"],
      gearNote: "May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (2).",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanshaman", name: "Beastman Shaman (level 1)", cost: 76, stat: "Beastman Shaman", magicItemSlots: 1, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman", "shaman"],
      gearNote: "May take Dark Magic (or Tzeentch/Nurgle/Slaanesh Magic matching their Mark). May take as many Chaos Rewards or magic items as levels (1).",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "daemonprince", name: "Daemon Prince", cost: 200, stat: "Daemon Prince", magicItemSlots: 2, magicItemCategoryFilter: ["daemonicreward"],
      gearNote: "Large, causes terror. Comes with a free Mark of Chaos. May take up to four magic levels for +60pts each (Chaos Undivided uses Dark Magic; other Marks use their own lore) — unless he bears the Mark of Khorne. Takes 2 Daemonic Rewards. In a Chaos Warband, the Battle Standard Bearer must come from the Chaos Warrior section, so a Daemon Prince here cannot serve as army BSB.",
      markGroup: { options: MARKS_WARRIOR },
      wingsOption: { label: "Wings (can fly)", cost: 100 },
      magicLevelOption: { label: "Magic levels", costPerLevel: 60, max: 4, forbiddenMark: "Khorne" },
    },
    {
      id: "bloodthirster", name: "Bloodthirster, Greater Daemon of Khorne", cost: 666, stat: "Bloodthirster", magicItemSlots: 0, impliedMark: "Khorne",
      gearNote: "Large, causes terror, can fly. Bears the Mark of Khorne. Wears Chaos Armour (replaces the 4+ Daemonic Save with a 4+ armour save) and The Whip and Axe of Khorne (fixed — already reflected in his profile's 11 attacks and 1D3-wound multiplier).",
    },
    {
      id: "lordofchange", name: "Lord of Change, Greater Daemon of Tzeentch", cost: 725, stat: "Lord of Change", magicItemSlots: 1, magicItemCategoryFilter: ["daemonicreward"], impliedMark: "Tzeentch", tags: ["wizard"],
      gearNote: "Large, causes terror, can fly. Bears the Mark of Tzeentch. A level 5 wizard using Tzeentch Magic (fixed). May take 1 Daemonic Reward.",
    },
    {
      id: "greatuncleanone", name: "Great Unclean One, Greater Daemon of Nurgle", cost: 375, stat: "Great Unclean One", magicItemSlots: 0, impliedMark: "Nurgle",
      gearNote: "Large, causes terror. Bears the Mark of Nurgle. Surrounded by the Cloud of Flies (-1 to hit for enemies in base contact), immune to stench/insect/disease to-hit penalties and disease effects. Can breathe a Stream of Corruption each shooting phase (teardrop template, Initiative test or die outright, T7+ take 1D6 wounds instead, no save).",
      magicLevelOption: { label: "Magic levels (Nurgle Magic)", costPerLevel: 60, max: 4 },
    },
    {
      id: "keeperofsecrets", name: "Keeper of Secrets, Greater Daemon of Slaanesh", cost: 325, stat: "Keeper of Secrets", magicItemSlots: 0, impliedMark: "Slaanesh",
      gearNote: "Large, causes terror. Bears the Mark of Slaanesh. Surrounded by the Allure of Slaanesh (enemies in melee must pass an Ld test on 3D6, 2D6 if immune to psychology, or pick another target). Has Razor Sharp Pincers (no armour save allowed).",
      magicLevelOption: { label: "Magic levels (Slaanesh Magic)", costPerLevel: 60, max: 4 },
    },
  ],
  regiments: [
    {
      id: "beastmasterpack", name: "Chaos Beastmasters & Hounds/Spawns", perModel: 0, minSize: 1, kind: "composite", restriction: "0-1",
      note: "Follows main-rulebook Beastmaster rules. Take either Hounds or Spawns, not both. When taking Spawns, Beastmaster count must equal Spawn count.",
      composition: [
        { id: "beastmaster", label: "Chaos Beastmasters", cost: 21, stat: "Chaos Beastmaster" },
        { id: "hound", label: "Chaos Hounds", cost: 12, stat: "Chaos Hound" },
        { id: "spawn", label: "Chaos Spawns", cost: 60, stat: "Chaos Spawn" },
      ],
    },
    {
      id: "maraduers", name: "Chaos Marauders", perModel: 11, minSize: 5, stat: "Chaos Marauder", command: "standard",
      note: "Also called Chaos Thugs. Light armour and shields by default.",
      options: [
        { id: "ahw", group: "melee", label: "Swap shield for additional hand weapon", cost: 1.5, per: "model" },
        { id: "heavy", group: "melee", label: "Swap shield for double handed weapon or flail", cost: 3, per: "model" },
        { id: "bows", group: "melee", label: "Give up armour & shield, take bows instead", cost: 0, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 60, magicItemSlots: 1, stat: "Chaos Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "marauderhorsemen", name: "Chaos Marauder Horsemen", perModel: 23, minSize: 5, stat: "Chaos Marauder", mountStat: "Chaos Warhorse", mountLabel: "Warhorse", command: "fastCavalry",
      note: "Also called Chaos Thug Horsemen. Fast cavalry. Light armour, shields, spears, on Warhorses.",
      options: [
        { id: "flails", group: null, label: "Swap spears & shields for flails", cost: 2, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 80, magicItemSlots: 1, stat: "Chaos Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "chaoswarriors", name: "Chaos Warriors", perModel: 18, minSize: 5, stat: "Chaos Warrior", command: "standard",
      note: "Chaos Armour and shields by default.",
      options: [
        { id: "halberdahw", group: "melee", label: "Swap shield for halberd or additional hand weapon", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon", cost: 4, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 60, magicItemSlots: 1, stat: "Chaos Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "chaosknights", name: "Chaos Knights", perModel: 45, minSize: 5, stat: "Chaos Warrior", mountStat: "Chaos Warhorse", mountLabel: "Chaos Warhorse (barded)", command: "standard",
      note: "Chaos Warriors on barded Chaos Warhorses, with Chaos Armour, shields, and lances.",
      champion: { name: "Chaos Champion (with Mark of Chaos, mounted)", baseCost: 80, magicItemSlots: 1, stat: "Chaos Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "ogremercenaries", name: "Ogre Mercenaries", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous",
      note: "Light armour. Causes fear. Monstrous regiment.",
      options: [
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion", magicItemCategoryFilter: ["weapon", "armour", "enchanted", "arcane"] },
    },
    {
      id: "beastmengors", name: "Beastmen Gors", perModel: 9, minSize: 5, stat: "Beastmen Gors", command: "standard",
      note: "Shields by default. Unruly.",
      options: [
        { id: "halberds", group: "melee", label: "Swap shield for halberd", cost: 2, per: "model" },
        { id: "ahw", group: "melee", label: "Swap shield for additional hand weapon", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon", cost: 4, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 30, magicItemSlots: 1, stat: "Beastmen Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "beastmenbestigors", name: "Beastmen Bestigors", perModel: 17, minSize: 5, stat: "Beastmen Bestigors", command: "standard",
      note: "Halberds and heavy armour by default. Not unruly.",
      options: [
        { id: "dhw", group: null, label: "Swap halberds for double handed weapons", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 25, magicItemSlots: 1, stat: "Beastmen Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "beastmenungors", name: "Beastmen Ungors", perModel: 5, minSize: 5, stat: "Beastmen Ungors", command: "standard",
      note: "Unruly. If this is an independent Beastmen army, may take short bows instead of any other equipment (+1pt/model; may then skirmish).",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
        { id: "shortbows", group: null, label: "Short bows instead of any other equipment, independent Beastmen army only", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 35, magicItemSlots: 1, stat: "Beastmen Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "centaursregiment", name: "Centaurs", perModel: 16, minSize: 5, stat: "Centaurs", command: "fastCavalry",
      note: "Also called Centigors. Unruly fast cavalry. If this is an independent Beastmen army, may take bows (+2pt/model) or throwing spears (+1pt/model) instead of any other equipment; either may then skirmish.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 1, per: "model" },
        { id: "bows", group: "melee", label: "Bows instead of any other equipment, independent Beastmen army only", cost: 2, per: "model" },
        { id: "throwingspears", group: "melee", label: "Throwing spears instead of any other equipment, independent Beastmen army only", cost: 1, per: "model" },
      ],
      champion: { name: "Centaur Champion (with Mark of Chaos)", baseCost: 30, magicItemSlots: 1, stat: "Centaur Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "harpies", name: "Harpies", perModel: 22, minSize: 5, stat: "Gargoyles", command: "none", restriction: "0-1",
      note: "Flying infantry (not monstrous bases — 25x25mm, and may rank up). May skirmish. Cannot be joined by characters, cannot take a standard bearer, musician, or champion.",
    },
    {
      id: "minotaursregiment", name: "Minotaurs", perModel: 26, minSize: 3, stat: "Minotaurs", command: "monstrous",
      note: "Additional hand weapons by default. Monstrous, causes fear. After a won combat with an enemy casualty, must gorge on the dead (no pursuit/overrun unless hatred/frenzy); charged before their next move while feasting, they become frenzied.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 2, per: "model" },
        { id: "dhw", group: null, label: "Swap additional hand weapons for double handed weapons", cost: 2, per: "model" },
      ],
      champion: { name: "Minotaur Champion (with Mark of Chaos)", baseCost: 50, magicItemSlots: 1, stat: "Minotaur Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "dragonogresregiment", name: "Dragon Ogres", perModel: 56, minSize: 3, stat: "Dragon Ogres", command: "monstrous",
      note: "Monstrous, causes fear. 5+ armour save from scaly skin. Becomes frenzied if struck by enemy lightning.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 8, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 12, per: "model" },
      ],
      champion: { name: "Dragon Ogre Champion (with Mark of Chaos; +25pt if Mark of Slaanesh)", baseCost: 50, magicItemSlots: 1, stat: "Dragon Ogre Champion", markGroup: { options: MARKS_WARRIOR }, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "trolls", name: "Trolls", perModel: 40, minSize: 3, stat: "Trolls", command: "none",
      note: "Must be River Trolls (free), Stone Trolls (free), or Chaos Trolls (+5pt/model). Monstrous, stupid, immune to psychology, cause fear, regenerate on 4+; may vomit instead of attacking (auto-hit, S5, no save, 1D3 wounds). Cannot take a standard bearer, musician, or champion. River: crosses water freely, enemies -1 to hit in melee (living only). Stone: 2+ natural dispel. Chaos: +1 Attack.",
      options: [
        { id: "chaostrolls", group: null, label: "Chaos Trolls, +1 Attack", cost: 5, per: "model" },
      ],
    },
    {
      id: "gorbeastmasterpack", name: "Gor Beastmasters & Chaos Hounds", perModel: 0, minSize: 1, kind: "composite", restriction: "0-1",
      note: "Follows main-rulebook Beastmaster rules. Gor Beastmasters are NOT unruly (unlike ordinary Gors).",
      composition: [
        { id: "beastmaster", label: "Gor Beastmasters", cost: 16, stat: "Gor Beastmaster" },
        { id: "hound", label: "Chaos Hounds", cost: 12, stat: "Chaos Hound" },
      ],
    },
    {
      id: "gargoyles", name: "Gargoyles", perModel: 18, minSize: 5, stat: "Gargoyles", command: "none", restriction: "0-1", impliedMark: "Chaos Undivided",
      note: "Also called Furies. Flying infantry, like Harpies. May skirmish. Cannot take a standard bearer or musician, or be joined by characters. Counts as Chaos Undivided.",
    },
    {
      id: "bloodlettersfoot", name: "Bloodletters of Khorne", perModel: 16, minSize: 5, stat: "Bloodletters of Khorne", command: "standard",
      note: "Daemon blades: no armour save, 1 wound = 1D3.",
      champion: { name: "Bloodletter Champion", baseCost: 36, magicItemSlots: 1, stat: "Bloodletter Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "bloodlettersjuggernaut", name: "Bloodletters riding Juggernauts of Khorne", perModel: 86, minSize: 3, stat: "Bloodletters of Khorne", mountStat: "Juggernaut of Khorne", mountLabel: "Juggernaut of Khorne", command: "monstrous",
      note: "Unique monstrous-cavalry hybrid. Daemonic Save 3+ as cavalry; the Juggernaut auto-hits/wounds with one of its two attacks. Cannot enter buildings unless dismounted (removes the Juggernaut); kill the mount to kill the whole model.",
      champion: { name: "Bloodletter Champion (mounted)", baseCost: 126, magicItemSlots: 1, stat: "Bloodletter Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "fleshhounds", name: "Flesh Hounds of Khorne", perModel: 35, minSize: 5, stat: "Flesh Hounds of Khorne", command: "none",
      note: "Move as fast cavalry. Cannot take a standard bearer or musician, or be joined by characters. Magic weapons affect them only for their mundane value; they dispel all spells cast on them.",
    },
    {
      id: "pinkhorrors", name: "Pink Horrors of Tzeentch", perModel: 19, minSize: 5, stat: "Pink Horrors of Tzeentch", command: "standard",
      note: "No Daemonic Save — when slain, place two Blue Horrors at the back instead (not simulated as separate models here; treat the unit as a single pool of points).",
      champion: { name: "Pink Horror Champion", baseCost: 39, magicItemSlots: 1, stat: "Pink Horror Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "discsoftzeentch", name: "(Unridden) Discs of Tzeentch", perModel: 30, minSize: 3, stat: "Disc of Tzeentch", command: "skirmisher", restriction: "0-1",
      note: "Also called Screamers. Flying monstrous regiment (skirmishers). May fly over unengaged enemy units in the remaining-moves phase for a S5 hit each (each target only once). May fly high (unlike ridden Discs).",
    },
    {
      id: "flamers", name: "Flamers of Tzeentch", perModel: 40, minSize: 5, stat: "Flamers of Tzeentch", command: "none",
      note: "Move as fast cavalry; cross obstacles freely but not woods. Cannot take a standard bearer or musician. Each model makes 1D6 flaming shooting attacks (range 6\", BS to hit, S3); in melee, wounds multiply into 1D3.",
    },
    {
      id: "nurglings", name: "Nurglings", perModel: 20, minSize: 3, stat: "Nurglings", command: "none",
      note: "Monstrous regiment. May skirmish. Cannot take a standard bearer or musician, or be joined by characters.",
    },
    {
      id: "plaguebearersbeasts", name: "Plaguebearers of Nurgle riding Beasts of Nurgle", perModel: 88, minSize: 3, stat: "Plaguebearers of Nurgle", mountStat: "Beast of Nurgle", mountLabel: "Beast of Nurgle", command: "monstrous",
      note: "Unique monstrous-cavalry hybrid. Daemonic Save 3+ as cavalry; wounded living models are automatically slain; the Beast's hits allow no armour save and enemies in base contact suffer -1 to hit. Cannot enter buildings unless dismounted; kill the mount to kill the whole model.",
      champion: { name: "Plaguebearer Champion (mounted)", baseCost: 128, magicItemSlots: 1, stat: "Plaguebearer Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "plaguebearersfoot", name: "Plaguebearers of Nurgle", perModel: 18, minSize: 5, stat: "Plaguebearers of Nurgle", command: "standard",
      note: "Wounded living models are automatically slain. Enemies in base contact suffer -1 to hit.",
      champion: { name: "Plaguebearer Champion", baseCost: 38, magicItemSlots: 1, stat: "Plaguebearer Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "beastsofnurgle", name: "Beasts of Nurgle", perModel: 45, minSize: 3, stat: "Beast of Nurgle", command: "none",
      note: "Monstrous regiment. Cannot take a standard bearer or musician, or be joined by characters. Hits allow no armour save; enemies in base contact suffer -1 to hit.",
    },
    {
      id: "fiendsofslaanesh", name: "Fiends of Slaanesh", perModel: 65, minSize: 3, stat: "Fiends of Slaanesh", command: "none",
      note: "Monstrous regiment. Cannot take a standard bearer or musician, or be joined by characters. Move as fast cavalry. Soporific Musk: enemies in base contact suffer -1 to hit.",
    },
    {
      id: "daemonettesfoot", name: "Daemonettes of Slaanesh", perModel: 15, minSize: 5, stat: "Daemonettes of Slaanesh", command: "standard",
      champion: { name: "Daemonette Champion", baseCost: 35, magicItemSlots: 1, stat: "Daemonette Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "daemonettessteeds", name: "Daemonettes riding Steeds of Slaanesh", perModel: 30, minSize: 5, stat: "Daemonettes of Slaanesh", mountStat: "Steed of Slaanesh", mountLabel: "Steed of Slaanesh", command: "fastCavalry",
      note: "The Steed's hits don't wound but grant the rider an automatic hit; 3+ Daemonic Save as cavalry, fast cavalry.",
      champion: { name: "Daemonette Champion (mounted)", baseCost: 60, magicItemSlots: 1, stat: "Daemonette Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
  ],
  chariotsMonsters: [
    {
      id: "chaoswarriorchariot", name: "Chaos Warrior Chariot", perUnit: 79, stat: "Heavy Chariot", kind: "chariot", crewArmourFixed: "Chaos Armour",
      note: "Heavy Chariot pulled by two barded Chaos Steeds, crewed by two Chaos Warriors with Halberds and Chaos Armour (3+ armour save). Daemonic teams reduce armour save to 4+, and the Daemon type must match the Mark of a rider (or the general's, in a single-Power army).",
      extraCrewCost: 20, extraCrewLabel: "extra Chaos Warrior crew", extraSteedCost: 7, extraSteedLabel: "extra Chaos Steeds",
      scythedWheelsCost: 20, commanderCost: 60, commanderLabel: "One crewman is a Chaos Champion (with Mark of Chaos)", commanderMagicItemSlots: 1,
      variantGroupLabel: "Daemonic team (replaces Chaos Warhorses, choose at most one)",
      variantOptions: [
        { id: "juggernaut", label: "One Juggernaut of Khorne", cost: 20 },
        { id: "discs", label: "Two Discs of Tzeentch (chariot can fly, not fly high)", cost: 80 },
        { id: "nurgle", label: "One Beast of Nurgle", cost: 40 },
        { id: "slaanesh", label: "Two Steeds of Slaanesh", cost: 60 },
      ],
    },
    {
      id: "chaosmarauderchariot", name: "Chaos Marauder Chariot", perUnit: 62, stat: "Heavy Chariot", kind: "chariot", crewArmourFixed: "Light armour",
      note: "Heavy Chariot pulled by two Warhorses, crewed by two Chaos Marauders with spears, light armour and shields (5+ armour save).",
      extraCrewCost: 16, extraCrewLabel: "extra Chaos Marauder crew", extraSteedCost: 2, extraSteedLabel: "extra Warhorses",
      scythedWheelsCost: 20,
    },
    {
      id: "chaosspawns", name: "Chaos Spawns", perUnit: 60, stat: "Chaos Spawn", kind: "quantity",
      note: "Small monster, causes fear, unbreakable. Random attacks and movement — see army-wide rules.",
    },
    {
      id: "chaosabomination", name: "Chaos Abomination", stat: "Chaos Abomination", kind: "abomination", restriction: "0-1", impliedMark: "Chaos Undivided",
      note: "Only for a Chaos Warrior/Beastmen army whose general bears the Mark of Chaos Undivided. Base 30pts, minimum 100pts total. Large & causes terror instead of fear once S, T, or W is upgraded at all.",
    },
    {
      id: "giantscyclopes", name: "Giant / Cyclops", perUnit: 200, stat: "Giants and Cyclopes", kind: "quantity",
      note: "Follows the main-rulebook Giant rules. Upgrading to a Cyclops (+50pts) lets it hurl boulders like a small stone thrower if it didn't march (max range 48\"; a misfire sends the shot 1D6x10\" in a random direction from the Cyclops).",
      variantOptions: [
        { id: "cyclops", label: "Upgrade to a Cyclops (stone-thrower boulders)", cost: 50 },
      ],
    },
    {
      id: "beastmanchariots", name: "Beastman Chariot", perUnit: 70, stat: "Extra Heavy Chariot", kind: "chariot", crewArmourFixed: "Light armour",
      note: "Extra Heavy Chariot (T6) pulled by two Tuskgors (+2S on the charge), crewed by two Gor Beastmen with spears, light armour, shields (4+ combined save from the Tuskgors' hide).",
      extraCrewCost: 7, extraCrewLabel: "extra Gor Beastmen crew", extraSteedCost: 8, extraSteedLabel: "extra Tuskgors",
      scythedWheelsCost: 20, commanderCost: 42, commanderLabel: "One crewman is a Gor Beastman Champion (with Mark of Chaos)", commanderMagicItemSlots: 1,
    },
    {
      id: "jabberslythe", name: "Jabberslythe", perUnit: 225, stat: "Jabberslythe", kind: "quantity", restriction: "0-1",
      note: "Large monster, causes terror, immune to psychology. 10\" fly move (can't fly high), 5+ armour save. Aura of Madness: enemies within 12\" that can see it test Ld each enemy turn, taking 1 wound per point failed by (no save; doesn't affect psychology-immune units). Spurting Bile-blood: each wound landed on it in melee hits the attacker with a S4 hit. Slithery Tongue: 12\" shooting attack, S4, auto-hits, swallows whole any man-sized model that takes a wound (counts as slain, no Look Out Sir).",
    },
    {
      id: "daemonicchariotkhorne", name: "Daemonic Chariot of Khorne", perUnit: 90, stat: "Heavy Chariot", kind: "quantity",
      note: "Heavy Chariot pulled by one Juggernaut of Khorne, crewed by two Bloodletters. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariotnurgle", name: "Daemonic Chariot of Nurgle", perUnit: 110, stat: "Heavy Chariot", kind: "quantity",
      note: "Heavy Chariot pulled by one Beast of Nurgle, crewed by two Plaguebearers. 4+ Daemonic Save. Enemies suffer -1 to hit in melee against it.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariotslaanesh", name: "Daemonic Chariot of Slaanesh", perUnit: 130, stat: "Heavy Chariot", kind: "quantity",
      note: "Heavy Chariot pulled by two Steeds of Slaanesh, crewed by two Daemonettes. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariottzeentch", name: "Daemonic Chariot of Tzeentch", perUnit: 150, stat: "Heavy Chariot", kind: "quantity",
      note: "Heavy Chariot pulled by two Discs of Tzeentch, crewed by two Pink Horrors (don't split into Blue Horrors when slain in a chariot). Can fly, not fly high. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "hellcannon", name: "Hellcannon", perUnit: 120, stat: "Hellcannon Daemon", kind: "warmachine",
      note: "House rule / optional — ask your opponent's permission before including it, primarily meant for Siege Battles. A Daemon that works as a war machine, crewed by three Chaos Dwarfs in heavy armour. Shoots like a large stone thrower; any regiment losing even one model to it must take a panic test; shots count as magical. A misfire eats 1D3 crew instead of firing; if all crew die, it becomes an independent monster with random movement that charges the nearest model each turn (friend or foe), following normal Daemon rules — and still defends itself if charged.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Chaos Dwarf crew",
      crewArmourFixed: "Heavy armour",
    },
  ],
  specialCharacters: [
    { id: "aekoldhelbrass", name: "Aekold Helbrass", cost: 200, stat: "Aekold Helbrass", role: "Hero", impliedMark: "Tzeentch",
      note: "Recovers a lost wound on 4+ each turn; even if slain, reincarnates on 5+. Models in base contact recover a wound on 6+. Equipped with Chaos Armour, Mark of Tzeentch, and the Windblade (magic double handed weapon — roll 1D6 at battle start: 1-2 fly, 3-4 always strikes first, 5-6 usable as a S6 missile, range 12\", 1D6 hits)." },
    { id: "dechala", name: "Dechala the Denied One", cost: 180, stat: "Dechala the Denied One", role: "Hero", impliedMark: "Slaanesh",
      note: "Hates Khorne Daemons and Khorne Champions. Each Chaos turn picks a dance: The Praise of Slaanesh (-1 to hit vs her), Dance of Destruction (+1 to hit in melee), or Daggerdance (deflect 3 attacks per 2 given up). Six attacks (additional hand weapons for her many arms), Chaos Armour, Mark of Slaanesh, and the Elixir of Damnation (living enemies she wounds can't attack/cast against her)." },
    { id: "egrimm", name: "Egrimm van Horstmann", cost: 850, stat: "Egrimm van Horstmann", role: "Chaos Sorcerer Lord", impliedMark: "Tzeentch",
      note: "Army always deploys last. Equipped with Chaos Armour, Mark of Tzeentch, and the Crystal Skull. Rides a Chaos Dragon.", extraMagicItemSlots: 3 },
    { id: "valnir", name: "Valnir the Reaper", cost: 250, stat: "Valnir the Reaper", role: "Hero", impliedMark: "Nurgle",
      note: "Nominate an enemy regiment at battle start for a random ailment (Red Plague, Brain Fever, or Black Rot). Causes fear, immune to psychology, hates all living enemies, regenerates on 4+. Equipped with Chaos Armour, Mark of Nurgle, and the Gatherer of Souls (magic flail: always +2S, may boost WS/S/A per 3 wounds inflicted)." },
    { id: "archaon", name: "Archaon, Lord of Chaos", cost: 550, stat: "Archaon", role: "Lord",
      note: "Mark of Chaos Undivided; regiments he joins become unbreakable. Requires 4 roughly-equal Chaos Warrior regiments, one per major Power, each carrying that Power's Chaos Banner, plus a BSB. May cast a free random Dark Magic/Chaos God spell each own magic phase. Equipped with a shield, the Slayer of Kings (WS10 S7 A7), Armour of Morkar (1+ unmodifiable save, -2S vs him), the Eye of Sheerian (random battle-start effect), and rides the barded warhorse W'soraych." },
    { id: "arbaal", name: "Arbaal the Undefeated", cost: 350, stat: "Arbaal the Undefeated", role: "Lord", impliedMark: "Khorne",
      note: "Must always issue challenges in Khorne's name; becomes a Chaos Spawn if he flees. Not subject to frenzy despite being a Champion of Khorne. Immune to psychology, 2D6 attacks/round. Chaos Armour. Rides the Hound of Khorne (small Daemonic monster, immune to magic weapons, dispels spells targeting it/Arbaal/his regiment; vanishes if Arbaal dies)." },
    { id: "mordrek", name: "Count Mordrek the Damned", cost: 300, stat: "Count Mordrek", role: "Lord", impliedMark: "Chaos Undivided",
      note: "Characteristics rolled randomly each battle (WS 1D6+4, S 1D3+3, T 1D3+3, A 1D6+1). Mark of Chaos Undivided. Equipped with Chaos Armour, the Chaos Runeshield, and the Sword of Change. Rides a barded Chaos Warhorse." },
    { id: "valkia", name: "Valkia the Bloody", cost: 384, stat: "Valkia the Bloody", role: "Chaos Lord — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "Mark of Khorne (in profile). If present, no BSB may be taken — instead, all units within 12\" re-roll any failed Ld test. May not take a magic/Chaos Banner. Re-rolls the initial die on any Eye of the God test.",
      items: "Carries: Daemonshield (acts as a Parrying shield), the Spear of Slaupnir (+2S charge; on a 6 to wound while charging, man-sized victims are slain outright, no save, else 1D3 wounds), the Scarlet Armour (magic Chaos Armour, -1S to attacks against her; combined with the Daemonshield gives a 3+ save)." },
    { id: "sigvald", name: "Prince Sigvald", cost: 308, stat: "Prince Sigvald", role: "Chaos Lord — not official WHR, needs opponent's agreement", impliedMark: "Slaanesh",
      note: "Mark of Slaanesh. Treats difficult terrain, steep slopes, and water as open ground for movement (can't see through it though) — extends to any unit he joins.",
      items: "Carries: The Auric Armour (1+ save combined with his Mirrored Shield, plus Regeneration 4+), Sliverslash (+2 attacks, always strikes first), the Mirrored Shield (mundane — grants Sigvald Stupidity while carried)." },
    { id: "vilitch", name: "Vilitch the Curseling", cost: 503, stat: "Vilitch the Curseling", role: "Chaos Sorcerer Lord — not official WHR, needs opponent's agreement", impliedMark: "Tzeentch", tags: ["wizard"],
      note: "Mark of Tzeentch. Chaos Armour. His Fused Twin acts as a Spell Familiar without needing an extra model. If he dispels an enemy spell (targeting him or his unit) with a Dispel card, he keeps the power used to cast it. If an enemy wizard's Dispel card fails against his spell, he takes that card into his own hand.", extraMagicItemSlots: 2 },
    { id: "festus", name: "Festus the Leechlord", cost: 359, stat: "Festus the Leechlord", role: "Chaos Sorcerer Champion — not official WHR, needs opponent's agreement", impliedMark: "Nurgle", tags: ["wizard"],
      note: "Mark of Nurgle (in profile). Chaos Armour, Regeneration 4+. He and any unit he joins only pursue 1D6\" (binding captives), but captured units are worth double victory points. Pestilent Potions: a unit he joins gains a 5+ regeneration save and poisoned attacks (including his own) while he's with them." },
    { id: "galrauch", name: "Galrauch, The Great Drake", cost: 640, stat: "Galrauch", role: "Two-Headed Chaos Dragon — not official WHR, needs opponent's agreement", impliedMark: "Tzeentch", tags: ["wizard"],
      note: "Large monster, flies, causes terror, 4+ scaly skin save. Mark of Tzeentch. A level 4 wizard (Tzeentch Magic). One head breathes fire (S4) or poison (S3, no save) each shooting phase; once per battle one head may instead breathe the Breath of Change (teardrop template, failed Toughness test on 1D6 removes the model from play) while the other head can't breathe that phase. Each turn, a failed Ld test makes the ancient Dragon spirit surface: no move/spells/breath, half his attacks turn on himself that phase (added to the enemy's combat res if already in combat)." },
    { id: "kholek", name: "Kholek Suneater", cost: 485, stat: "Kholek Suneater", role: "Dragon Ogre Lord — not official WHR, needs opponent's agreement", impliedMark: "Chaos Undivided",
      note: "Large monster, causes terror, immune to psychology, 5+ scaly-skin save, frenzied if hit by enemy lightning. Mark of Chaos Undivided (in profile). In the shooting phase, targets an unengaged visible enemy unit: on 2-6 it takes 1D6 S6 lightning hits, on a 1 Kholek is hit instead. Lightning-based spells targeting a unit within 12\" of him are redirected to him instead.",
      items: "Carries: Starcrusher (magic weapon, 1 wound = D3 wounds), Armour of the Storm (heavy armour, immune to lightning attacks, becomes frenzied if struck by lightning anyway)." },
    { id: "gorthor", name: "Gorthor the Beastlord", cost: 550, stat: "Gorthor the Beastlord", role: "Master Beastman Shaman", impliedMark: "Chaos Undivided",
      note: "If Gorthor is the army general, all Gor and Ungor regiments within 12\" automatically pass their unruly tests. Rides a Beastman Chariot with scythed wheels, and pursues an extra 1D6\" while mounted. The Impaler: magic spear granting +2S on the charge (instead of the usual +1), no armour save; if all four attacks hit, the enemy model is slain outright. The Skull of Mugrar: attacks against Gorthor himself (not his chariot) suffer -1 to hit and -1 to wound. The Cloak of the Beastlord: roll 1D6 before the battle — the cloak absorbs that many wounds before Gorthor takes any himself." },
    { id: "khazrak", name: "Khazrak the One-Eye and Redmaw", cost: 120, stat: "Khazrak the One-Eye", mountStat: "Redmaw", mountLabel: "Redmaw (Chaos Hound)", role: "Hero", impliedMark: "Chaos Undivided",
      note: "Heavy armour, and the magic whip Scourge, which grants one additional attack (at -1 to armour save) against any model in the regiment Khazrak is in base contact with. Redmaw the Chaos Hound stays with Khazrak unless sent to attack an enemy unit within its charge range (it then rejoins Khazrak once that enemy is destroyed). While together they share one psychology test rather than testing separately. If either is slain, the other becomes subject to frenzy." },
    { id: "throgg", name: "Throgg, King of Trolls", cost: 200, stat: "Throgg, King of Trolls", role: "Unique Troll", impliedMark: "Chaos Undivided",
      note: "A Troll, and may join any unit of Trolls; all normal Troll rules apply to him. When vomiting, makes 1D6+1 hits instead of one. Once per game may make a breath attack, S5, no armour save. Has no Mark of Chaos of his own but is treated as Chaos Undivided for army-building purposes." },
    { id: "skulltaker", name: "Skulltaker", cost: 107, stat: "Skulltaker", role: "Unique Bloodletter Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "The Slayer Sword: flaming attacks; on a 6 to wound, man-sized victims are slain outright (no save), else 1D3 wounds ignoring armour. The Cloak of Skulls: counts as the Chaos Armour Daemonic Reward (4+ armour save instead of Daemonic Save)." },
    { id: "karanak", name: "Karanak", cost: 125, stat: "Karanak", role: "Unique Flesh Hound Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "Must join a Flesh Hounds unit (exception to the normal rule). Magic weapons only affect him for their mundane value; dispels all spells cast on him. Nominate an enemy model as his quarry at battle start — re-rolls failed to-hit and to-wound rolls against it." },
    { id: "skarbrand", name: "Skarbrand", cost: 610, stat: "Skarbrand", role: "Bloodthirster — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "Large, causes terror, frenzy (can never lose it — while alive, ALL units on the table, friend and foe, are subject to Hatred). Chaos Armour (4+ save instead of Daemonic Save). Slaughter and Carnage: paired axes (a Daemonic Reward, not a magic weapon) granting an extra attack (in profile) and ignoring armour saves. Once/turn in the shooting phase may bellow (teardrop template, S5), even while engaged." },
    { id: "bluescribes", name: "The Blue Scribes", cost: 109, stat: "The Blue Scribes", role: "Unique Pink Horror Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Tzeentch",
      note: "Already two Blue Horrors — doesn't split further when slain. Treat rider+mount as one model; mounted on a Disc of Tzeentch, 4+ Daemonic Save, can't join a unit. In the magic phase, may cast one spell from any college — roll a D10 to see which spell is selected (no choice of the spell itself); cast as a bound spell." },
    { id: "changeling", name: "The Changeling", cost: 130, stat: "The Changeling", role: "Unique Daemonic Hero of Tzeentch — not official WHR, needs opponent's agreement", impliedMark: "Tzeentch",
      note: "A level 1 wizard (Lore of Tzeentch). At the start of each melee phase, may raise any of his WS/S/T/I/A to match an enemy model in base contact (the higher value if that model has more than one). Can't match a model fighting a challenge unless he's in that challenge too." },
    { id: "epidemius", name: "Epidemius", cost: 288, stat: "Epidemius", role: "Unique Plaguebearer Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Nurgle",
      note: "Rides a Palanquin of Nurgle. Tracks all unsaved wounds caused by Nurgle Daemons/spells (friend or foe) as the Tally of Pestilence — cumulative, army-wide bonuses for all Nurgle Daemons at 7+/14+/21+/28+ wounds (Ld, then S, then T, then re-roll failed saves). Lost if Epidemius dies." },
    { id: "kugath", name: "Ku'Gath Plaguefather", cost: 515, stat: "Ku'Gath Plaguefather", role: "Great Unclean One — not official WHR, needs opponent's agreement", impliedMark: "Nurgle",
      note: "Large, causes terror, Cloud of Flies, Stream of Corruption breath. A level 1 wizard (Nurgle Magic), hates Dwarfs. A Nurgling base within 6\" auto-regenerates D3 wounds each of his turns. Once/shooting phase, Nurglings may burst from him as a small-stone-thrower shooting attack (may move but not march while firing; a misfire does nothing)." },
    { id: "masqueofslaanesh", name: "The Masque of Slaanesh", cost: 95, stat: "The Masque of Slaanesh", role: "Unique Daemonette Champion (0-1) — not official WHR, needs opponent's agreement", impliedMark: "Slaanesh",
      note: "Can't join any unit. 3+ Daemonic Save (not the usual 4+). Each of her melee phases, picks one dance targeting an enemy unit within 12\" (no LoS needed): Dance of Dreaming (-1 Ld), Fleshspasm Polka (-1 S), or Waltz of Lethargy (-1 I), to a minimum of 1, until end of phase." },
    { id: "belakor", name: "Be'lakor, The Dark Master", cost: 650, stat: "Belakor", role: "Daemon Prince of Chaos Undivided — not official WHR, needs opponent's agreement", impliedMark: "Chaos Undivided",
      note: "Mark of Chaos Undivided (in profile). Large, causes terror (permanently — units never become immune to it), flies. A level 4 wizard (Dark Magic). All enemies suffer -1 Ld when rallying anywhere; living enemies within 6\" of him suffer an extra -1 Ld (cumulative). Enemy shooting at him or his army suffers -1 to hit. Each turn, a failed Ld test forces him to charge the nearest visible enemy if in range, or move toward the nearest enemy model (stopping 1\" short if it would overshoot)." },
    { id: "amonchakai", name: "Amon 'Chakai", cost: 825, stat: "Amon 'Chakai", role: "Lord of Change", impliedMark: "Tzeentch",
      note: "Causes terror, can fly. A level 5 wizard using Tzeentch spells. Hates Nurgle Daemons and Nurgle-marked Champions. At battle start, nominate one enemy model doomed to perish — that model is automatically hit in melee by all attackers for the rest of the battle. The All-Seeing Eye of Tzeentch: at battle start, the enemy must reveal all hidden objects on the battlefield (magic items, spells, Rewards, Bloodline Powers, Virtues, Assassins, Fanatics, etc.)." },
    { id: "azazel", name: "Azazel, Prince of Damnation", cost: 550, stat: "Azazel", role: "Daemon Prince of Slaanesh", impliedMark: "Slaanesh",
      note: "Causes terror, can fly. A level 2 wizard using Slaanesh spells. Wields a Daemonblade allowing no armour save, plus a seventh attack worked out at S8 (1 wound = 1D3). Dark Halo grants a 4+ ward save (replaces his Daemonic Save). A model in base contact loses 1 attack each melee round. At the start of the Chaos player's turn, one enemy character in base contact must pass an Ld test (unless immune to psychology) or now serves Slaanesh — award victory points for a turned character depending on whether it's later slain or survives the battle." },
    { id: "scylaanfingrim", name: "Scyla Anfingrim", cost: 200, stat: "Scyla Anfingrim", role: "Large Chaos Spawn — not official WHR, needs opponent's agreement", impliedMark: "Khorne",
      note: "Unbreakable, causes fear. Unlike normal Chaos Spawn, doesn't move randomly and doesn't have a random number of attacks. 4+ armour save unmodified by Strength — a successful save against a magic weapon destroys it. 4+ natural dispel; a successful dispel destroys the enemy spell. A former Champion of Khorne, still counted as a follower of Khorne for army selection; may be the army general in small (under 2000pt) armies." },
  ],
};

const HIGH_ELF_MAGIC_ITEMS = [
  { id: "he-forenrond", name: "Forenrond's Sword", cost: 0, cat: "weapon", desc: "Bearer becomes general by birthright regardless of Ld. 4 attacks hitting/wounding on 2+, no save, 1 wound=1D3. But: never chooses sides, always deploys first, never takes first turn, no scout/vanguard. 2000+pt armies only." },
  { id: "he-bowoldworld", name: "Bow of the Old-World Colonies", cost: 20, cat: "weapon", desc: "Longbow. May shoot as many shots as bearer has attacks, at bearer's strength." },
  { id: "he-defierofchaos", name: "Defier of Chaos", cost: 20, cat: "weapon", desc: "No armour save. Chaos models suffer double wounds." },
  { id: "he-arrowsofisha", name: "Arrows of Isha", cost: 25, cat: "weapon", desc: "Shield Maiden of the Everqueen only. Whole regiment gets magic flaming arrows, S4. Can't be nullified, doesn't vanish if bearer dies.", restrictedTo: [{ regimentIds: ["handmaidens"] }] },
  { id: "he-fangsword", name: "Fangsword of Eltharion", cost: 40, cat: "weapon", desc: "-3 to armour save. All models in base contact with bearer suffer -1A." },
  { id: "he-moonbow", name: "Moonbow", cost: 40, cat: "weapon", desc: "Longbow. S6, no armour save, 1 wound=1D3. Penetrates like a bolt thrower shot. Dark Elf casualties force an immediate panic test." },
  { id: "he-beladebelkorhadris", name: "Blade of Bel-Korhadris", cost: 50, cat: "weapon", desc: "Mages only. Always strikes first, no armour save. Once/battle: 1D6 extra attacks.", restrictedTo: [{ tags: ["mage"] }] },
  { id: "he-helmyvresse", name: "Helm of Yvresse", cost: 10, cat: "armour", desc: "May always re-roll Ld tests." },
  { id: "he-armourcaledor", name: "Armour of Caledor", cost: 40, cat: "armour", desc: "Dragon Armour. +1 armour save, 5+ ward save. Immune to all dragon breath attacks and fire-based attacks." },
  { id: "he-goldencrown", name: "Golden Crown of Atrazar", cost: 100, cat: "armour", desc: "3+ ward save." },
  { id: "he-hornofvalour", name: "Horn of Valour", cost: 25, cat: "enchanted", desc: "General only, one use. Whole army may re-roll Ld tests until the next High Elf turn; stops if the bearer is killed." },
  { id: "he-stoneofmidnight", name: "Stone of Midnight", cost: 100, cat: "enchanted", desc: "Models on foot only. Melee attacks against the bearer must re-roll successful to-hit and to-wound rolls." },
  { id: "he-talismanhoeth", name: "Talisman of Hoeth", cost: 100, cat: "enchanted", desc: "Cannot be taken by mages. Bearer casts as a level 2 mage (any college), may wear armour/two-handed weapons and still cast, but can't take arcane items.", excludeTags: ["mage"] },
  { id: "he-cloakofstars", name: "Cloak of Stars", cost: 25, cat: "arcane", desc: "Hits against the bearer have S reduced by 2. First spell cast directly at the bearer/regiment is auto-dispelled unless Total Power." },
  { id: "he-warcrown", name: "War Crown of Saphery", cost: 50, cat: "arcane", desc: "+1 magic level. Doesn't increase the number of items the bearer can carry." },
  { id: "he-bookphoenix", name: "Book of the Phoenix", cost: 250, cat: "arcane", desc: "Once per magic phase, cast a spell without using power cards." },
  { id: "he-regalstandard", name: "Regal Standard", cost: 0, cat: "banner", desc: "Free. Troops with bows/longbows may move and shoot without the -1 moving penalty." },
  { id: "he-imperialresolve", name: "Standard of Imperial Resolve", cost: 10, cat: "banner", desc: "Unengaged spearmen get +1S when receiving a charge to the front." },
  { id: "he-bannerellyrion", name: "Banner of Ellyrion", cost: 30, cat: "banner", desc: "Elven Warriors/Archers/Spearmen/Reaver Knights/Silver Helms/BSB only. Ignores difficult ground movement penalty; may march with enemies within 8\".", restrictedTo: [{ regimentIds: ["warriors", "archers", "spearmen", "reaverknights", "silverhelms"] }, { characterIds: ["elvenbsb"] }] },
  { id: "he-whitelionstandard", name: "White Lion Standard", cost: 40, cat: "banner", desc: "White Lions only. If the general joins, they auto-pass all Ld tests including break tests (may still break from fear-causing outnumbering etc.).", restrictedTo: [{ regimentIds: ["whitelions"] }] },
  { id: "he-worlddragon", name: "Banner of the World Dragon", cost: 80, cat: "banner", desc: "Dragon Princes only. Armour saves vs shooting treated as a fixed 2+ ward-style save, even against save-cancelling sources.", restrictedTo: [{ regimentIds: ["dragonprinces"] }] },
  { id: "he-bannersorcery", name: "Banner of Sorcery", cost: 100, cat: "banner", desc: "Generates one extra magic card per magic phase, usable by any wizard in the army." },
];

const HIGH_ELVES = {
  key: "highelves",
  loreOptions: [...COLLEGE_LORES, "High Magic"],
  name: "High Elves",
  tagline: "The fading, feuding nobility of Ulthuan, holding the line against the dark",
  magicItems: [...COMMON_MAGIC_ITEMS, ...HIGH_ELF_MAGIC_ITEMS],
  armyWideRules: [
    "Elven stoicism: High Elves (excluding non-elf entities in the army) remain resolute against Dark Elves — when a resolute unit takes an Ld-based test, roll an extra 1D6 and discard the highest result.",
    "Lightweight barding: High Elf cavalry suffer no movement reduction for wearing barding.",
    "Dragon armour: when a High Elf BSB, Hero, Lord, or Dragon Prince wears non-magical heavy armour, it's always Dragon Armour, granting immunity to fire and flaming attacks.",
    "Dragon rage: High Elf Dragons roll 3D6 (not the usual 2D6) on the Monster Reaction Table.",
  ],
  characters: [
    {
      id: "elvenprince", name: "Elven Prince", cost: 124, stat: "Elven Prince", magicItemSlots: 3,
      gearNote: "May take a shield and either light armour or Dragon Armour for free (Dragon Armour grants immunity to fire/flaming attacks).",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Dragon Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      bowOption: { label: "Bow or Longbow", cost: 10 },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 27, stat: "Elven Steed" },
        { id: "pegasus", name: "Pegasus", cost: 61, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 69, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 181, stat: "Griffon" },
        { id: "dragon", name: "Red/White/Blue Dragon", cost: 321, stat: "Dragon (High Elf)" },
        { id: "greatdragon", name: "Great Red/White/Blue Dragon", cost: 446, stat: "Great Dragon" },
        { id: "emperordragon", name: "Red/White/Blue Emperor Dragon", cost: 571, stat: "Emperor Dragon" },
      ],
    },
    {
      id: "elvenhero", name: "Elven Hero", cost: 74, stat: "Elven Hero (High Elf)", magicItemSlots: 2,
      gearNote: "May take a shield and either light armour or Dragon Armour for free (Dragon Armour grants immunity to fire/flaming attacks).",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Dragon Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      bowOption: { label: "Bow or Longbow", cost: 10 },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 20, stat: "Elven Steed" },
        { id: "pegasus", name: "Pegasus", cost: 54, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 62, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 174, stat: "Griffon" },
        { id: "dragon", name: "Red/White/Blue Dragon", cost: 314, stat: "Dragon (High Elf)" },
      ],
    },
    {
      id: "elvenbsb", name: "Elven Battle Standard Bearer", cost: 88, stat: "Elven BSB (High Elf)", magicItemSlots: 1, restriction: "0-1", tags: ["bsb"],
      gearNote: "May take either light armour or Dragon Armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour", "Dragon Armour"] },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 13, stat: "Elven Steed" },
      ],
    },
    {
      id: "magelord", name: "Mage Lord (level 4)", cost: 264, stat: "Mage Lord", magicItemSlots: 4, tags: ["mage"],
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 160, stat: "Griffon" },
        { id: "dragon", name: "Red/White/Blue Dragon", cost: 300, stat: "Dragon (High Elf)" },
        { id: "greatdragon", name: "Great Red/White/Blue Dragon", cost: 425, stat: "Great Dragon" },
      ],
    },
    {
      id: "mastermage", name: "Master Mage (level 3)", cost: 186, stat: "Master Mage", magicItemSlots: 3, tags: ["mage"],
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "magechampion", name: "Mage Champion (level 2)", cost: 122, stat: "Mage Champion", magicItemSlots: 2, tags: ["mage"],
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "mage", name: "Mage (level 1)", cost: 58, stat: "Mage", magicItemSlots: 1, tags: ["mage"],
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
  ],
  regiments: [
    {
      id: "spearmen", name: "Elven Spearmen", perModel: 8, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard",
      note: "Light armour, shields and spears.",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "warriors", name: "Elven Warriors", perModel: 7, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard",
      note: "Warriors with shields.",
      options: [
        { id: "ahw", group: "melee", label: "Swap shield for additional hand weapon", cost: 0, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "archers", name: "Elven Archers", perModel: 9, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard",
      note: "Warriors with longbows.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "silverhelms", name: "Silver Helm Knights", perModel: 20, minSize: 5, stat: "Elven Elite", mountStat: "Elven Steed", mountLabel: "Elven Steed", command: "fastCavalry", fastCavalryToggleOption: "heavyarmour",
      note: "Elven Elite on Elven Steeds, light armour, shields, lances. Fast cavalry (as long as no armour upgrade is taken).",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light — loses fast cavalry, standard bearer becomes free", cost: 7, per: "model" },
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander (High Elf)" },
    },
    {
      id: "reaverknights", name: "Reaver Knights", perModel: 22, minSize: 5, stat: "Elven Warriors (High Elf)", mountStat: "Elven Steed", mountLabel: "Elven Steed", command: "fastCavalry",
      note: "Warriors on Elven Steeds, light armour, spears, and bows. Fast Cavalry. May skirmish, act as Vanguard, and Fire & Flee as a charge reaction.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 2, per: "model" },
        { id: "longbows", group: null, label: "Upgrade bows to longbows", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "swordmasters", name: "Sword Masters of Hoeth", perModel: 12, minSize: 5, stat: "Sword Masters", command: "standard", restriction: "0-1",
      note: "Light armour, double handed weapons. Ignore \"double handed weapons strike last.\" Parry: -1 to hit vs S4-or-less missiles targeting their front (if 50%+ of the shooters are in the Sword Masters' front zone).",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander (High Elf)" },
    },
    {
      id: "dragonprinces", name: "Dragon Princes of Caledor", perModel: 27, minSize: 5, stat: "Elven Elite", mountStat: "Elven Steed", mountLabel: "Elven Steed (barded)", command: "standard", restriction: "0-1",
      note: "Elven Elite on barded Elven Steeds, Dragon Armour, shields, and lances.",
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander (High Elf)" },
    },
    {
      id: "lothernseaguard", name: "Lothern Sea Guard", perModel: 10, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard",
      note: "Light armour, shields, spear, and bows.",
      options: [
        { id: "longbows", group: null, label: "Upgrade bows to longbows", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "shadowwarriors", name: "Shadow Warriors", perModel: 15, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard",
      note: "Light armour, shields, longbows. May skirmish. May scout. Hate Dark Elves.",
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "phoenixguards", name: "Phoenix Guards", perModel: 10, minSize: 5, stat: "Elven Elite", command: "standard", restriction: "0-1",
      note: "Light armour and halberds. Immune to psychology.",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander (High Elf)" },
    },
    {
      id: "handmaidens", name: "Hand Maidens of the Everqueen", perModel: 13, minSize: 5, stat: "Hand Maidens", command: "standard", restriction: "0-1",
      note: "Light armour, spears, and longbows.",
      champion: { name: "Shield Maiden of the Everqueen (Elven Commander)", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander (High Elf)" },
    },
    {
      id: "whitelions", name: "White Lions of Chrace", perModel: 14, minSize: 5, stat: "White Lions", command: "standard", restriction: "0-1",
      note: "Light armour, lion pelts, double handed weapons. Ignore woods movement penalty (even with foot characters attached). Lion cloaks: +2 armour save vs shooting. Lion Rampant: -1 to hit against them and their characters when charged. Lion Leaping: engaged enemies lose 1 attack when the Lions charge. Lion's Claw (default): 1 wound becomes D3 wounds (not for attached independent characters).",
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander (High Elf)" },
    },
  ],
  chariotsMonsters: [
    {
      id: "greateagles", name: "Great Eagles", perUnit: 60, stat: "Great Eagle", kind: "quantity",
      note: "Small monster that can fly.",
    },
    {
      id: "boltthrowers", name: "Repeating Bolt Throwers", perUnit: 74, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Crewed by two Elven Warriors.",
      extraCrewCost: 7, extraCrewMax: 3, extraCrewLabel: "extra Elven Warrior crew",
      baseCrew: 2, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }],
    },
    {
      id: "tiranocchariots", name: "Tiranoc Chariot", perUnit: 60, stat: "Heavy Chariot", kind: "chariot", countsAsFirstRegiment: true, crewArmourFixed: "Light armour",
      note: "Heavy Chariot pulled by two Elven Steeds, crewed by two Elven Warriors with light armour, spears, shields and longbows (5+ armour save; crew may swap spears/shields for halberds instead, 6+ save). The first Tiranoc Chariot counts toward Regiments; further ones count toward Chariots & Monsters.",
      extraCrewCost: 10, extraCrewLabel: "extra Elven Warrior crew", extraSteedCost: 5, extraSteedLabel: "extra Elven Steeds",
      scythedWheelsCost: 20, commanderCost: 43, commanderLabel: "One crewman is an Elven Commander", commanderMagicItemSlots: 1,
      variantGroupLabel: "Variants",
      variantOptions: [
        { id: "halberdcrew", label: "Crew use halberds instead of spears/shields (6+ save instead of 5+)", cost: 0 },
        { id: "whitelionsteeds", label: "Switch to White Lion Steeds — requires a White Lions regiment in the army", cost: 20 },
        { id: "whitelionbarding", label: "Barding for White Lion Steeds (4+ save, or 5+ with halberd crew)", cost: 5 },
      ],
    },
    {
      id: "dragonprincesdragons", name: "Dragon Princes on Dragons", perUnit: 225, stat: "Supreme Elven Lord", mountStat: "Young Dragon", mountLabel: "Young Dragon", kind: "quantity",
      note: "Supreme Elven Lords with lances, shields, Dragon Armour (4+ save total) riding Young Dragons (Red/White/Blue — see Dragon rules above). Act as normal Monstrous Cavalry. Not a character — follows ridden-monster rules; if the rider is slain, roll on the Monster Reaction Table (3D6).",
    },
  ],
  specialCharacters: [
    { id: "teclis", name: "Teclis, High Elf Mage Lord", cost: 400, stat: "Teclis", role: "Mage Lord",
      note: "May hand-pick his spells.",
      items: "Carries: The Moon Staff of Lileath (once/battle, draw 2D6 extra magic cards for personal use — but Teclis' characteristics are halved, rounding up, for the rest of the battle), War Crown of Saphery, The Sword of Teclis, Power Scroll, Dispel Magic Scroll." },
    { id: "tyrion", name: "Tyrion, High Elf Prince", cost: 400, stat: "Imrik or Tyrion", role: "Lord",
      note: "Rides the steed Malhandir.",
      items: "Carries: Sunfang (magic weapon — 1D3 wounds vs Daemons no save, else +3S and 1 wound=1D3; once/battle a flaming breath attack, 4+ to wound models more than half covered), Dragon Armour of Aenarion (magic heavy armour, unmodifiable 1+ save, immune to fire/breath attacks), The Heart of Avelorn (4+ ward, natural dispel 4+; if Tyrion dies, the Heart is destroyed but he's resurrected on 1 wound)." },
    { id: "alarielle", name: "Alarielle, Everqueen of Averlorn", cost: 400, stat: "The Everqueen", role: "Mage Lord",
      note: "Cannot inflict wounds; anything she hits doesn't strike back that turn. Chaos Daemons within 8\" suffer a wound on 4+ at the start of the High Elf shooting phase, no save. If she joins a Handmaidens regiment, it becomes unbreakable (or gains hatred if she dies); their standard bearer may then take The Banner of Avelorn for +50pts.",
      items: "Carries (unique to her): Star of Avelorn (heals a wounded character within 8\", herself only if no one else is wounded), Stave of Avelorn (holds 3 bound spells from her own lore, castable once each — may be claimed as her own at the cost of one of her original spells), The Shieldstone of Isha (4+ ward)." },
    { id: "caradryan", name: "Caradryan, Captain of the Phoenix Guard", cost: 40, stat: "Caradryan", role: "Phoenix Guard alternative champion",
      note: "Anyone who slays Caradryan must pass a Ld test on their own basic Ld or die (even if immune to psychology)." },
    { id: "korhil", name: "Korhil, Hunter Captain of the White Lions", cost: 100, stat: "Korhil", role: "Hero — cannot be the general",
      note: "Must stay with a White Lions regiment like a regimental champion; all White Lion rules apply to him. In base contact with another character, he may act as their bodyguard (enemy can't hit the protected model; neither may issue/accept challenges while he does).",
      items: "Carries: The Axe of Chayal (double handed weapon, always strikes first), The Pelt of Charandis (unmodifiable 3+ save, immune to poison)." },
    { id: "alithanar", name: "Alith Anar, The Shadow King", cost: 300, stat: "Eltharion or Alith Anar", role: "Lord",
      note: "Hates Dark Elves and all Chaos. If he's the general, Spearmen/Archers/Warriors/Shadow Warriors also hate Dark Elves and Chaos. Any infantry regiment he joins may skirmish; he may use the scout rule. Light armour and a shield.",
      items: "Carries: the Stone of Midnight, Moonbow, and the Shadow Crown (always march, and leave melee in the movement phase if there's room)." },
    { id: "imrik", name: "Imrik, Lord of Dragons", cost: 777, stat: "Imrik or Tyrion", role: "Lord",
      note: "Rides a Red/White/Blue Emperor Dragon.",
      items: "Carries: Armour of Caledor, Star Lance (S10 on the charge), and the Dragonhorn (once/battle in melee, his dragon fights with 1D6 extra attacks that turn)." },
    { id: "belannaer", name: "Belannaer, Loremaster of Hoeth", cost: 555, stat: "Belannaer", role: "Mage Lord",
      note: "Enemies charging Belannaer (or a regiment he joins) have their charge distance reduced by 1D3\".",
      items: "Carries: Cloak of Stars, Blade of Bel-Korhadris, The Book of the Phoenix.", extraMagicItemSlots: 1 },
    { id: "eltharion", name: "Eltharion the Grim, Warden of Tor Yvresse", cost: 444, stat: "Eltharion or Alith Anar", role: "Lord",
      note: "Hates goblins of all kinds; +1 to hit and +1S in a challenge against Grom the Paunch. Lance, shield, heavy armour. Rides a Griffon.",
      items: "Carries: the Fangsword of Eltharion, the Helm of Yvresse, and the Talisman of Hoeth." },
  ],
};

const DWARF_MAGIC_ITEMS = [
  { id: "dw-redaxe", name: "Red Axe of Karak Eight Peaks", cost: 10, cat: "weapon", desc: "Double handed weapon. Not truly magical — can't be destroyed/nullified. Bearer hates Orcs & Goblins and Skaven; re-rolls to-hit against them every round, not just the first." },
  { id: "dw-axequeenhelga", name: "Axe of Queen Helga", cost: 10, cat: "weapon", desc: "Double wounds against the first character hit (lasts the whole game)." },
  { id: "dw-axeofgrimnir", name: "The Axe of Grimnir", cost: 100, cat: "weapon", desc: "Always wounds on 2+. No armour save. 1 wound = 1D3 wounds (1D6 vs monstrous regiments/characters)." },
  { id: "dw-mrflight", isRune: true, isMasterRune: true, name: "Master Rune of Flight", cost: 20, cat: "weapon", desc: "Master Weapon Rune. Thrown up to 12\", auto-hits, returns to hand. May stand & shoot as a charge reaction and target characters in regiments." },
  { id: "dw-mrsnorri", isRune: true, isMasterRune: true, name: "Snorri Spangelhelm's Master Rune", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Hits automatically." },
  { id: "dw-mrskalf", isRune: true, isMasterRune: true, name: "Skalf Blackhammer's Master Rune", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Wounds automatically." },
  { id: "dw-mralaric", isRune: true, isMasterRune: true, name: "Alaric the Mad's Master Rune", cost: 30, cat: "weapon", desc: "Master Weapon Rune. No armour save." },
  { id: "dw-mrtrygg", isRune: true, isMasterRune: true, name: "Master Rune of Trygg Trollslayer", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Bearer hates Trolls; against Trolls, one wound kills (no regeneration)." },
  { id: "dw-mrangrim", isRune: true, isMasterRune: true, name: "Master Rune of Angrim Redbeard", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Against Daemons, one wound kills." },
  { id: "dw-mrhaki", isRune: true, isMasterRune: true, name: "Master Rune of Haki Skullsplitter", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Against Skaven and Beastmen (Ungors/Gors/Bestigors/Centigors/Minotaurs), one wound kills." },
  { id: "dw-mrbaldrik", isRune: true, isMasterRune: true, name: "Master Rune of Baldrik the Bad", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Against Elves and Dragons of all kinds, one wound kills." },
  { id: "dw-mreric", isRune: true, isMasterRune: true, name: "Master Rune of Eric Cleric", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Against Undead, one wound kills." },
  { id: "dw-mrdeath", isRune: true, isMasterRune: true, name: "Master Rune of Death", cost: 60, cat: "weapon", desc: "Master Weapon Rune. All wounds kill." },
  { id: "dw-runefire", isRune: true, name: "Rune of Fire", cost: 10, cat: "weapon", desc: "Weapon Rune. Flaming attacks." },
  { id: "dw-runestriking", isRune: true, repeatable: true, name: "Rune of Striking", cost: 10, cat: "weapon", desc: "Weapon Rune. +2 WS (can be taken several times)." },
  { id: "dw-runeswiftness", isRune: true, name: "Rune of Swiftness", cost: 10, cat: "weapon", desc: "Weapon Rune. Always strikes first." },
  { id: "dw-runeparrying", isRune: true, repeatable: true, maxCount: 2, name: "Rune of Parrying", cost: 10, cat: "weapon", desc: "Weapon Rune. One enemy in base contact has -1 attack (all of them if taken twice)." },
  { id: "dw-runefury", isRune: true, repeatable: true, name: "Rune of Fury", cost: 10, cat: "weapon", desc: "Weapon Rune. +1 attack (can be taken several times)." },
  { id: "dw-runecutting", isRune: true, repeatable: true, name: "Rune of Cutting", cost: 10, cat: "weapon", desc: "Weapon Rune. -1 armour save (can be taken several times)." },
  { id: "dw-runemight", isRune: true, name: "Rune of Might", cost: 15, cat: "weapon", desc: "Weapon Rune. Double strength vs enemies with equal or higher toughness than the bearer's." },
  { id: "dw-runecleaving", isRune: true, repeatable: true, name: "Rune of Cleaving", cost: 15, cat: "weapon", desc: "Weapon Rune. +1 strength (can be taken several times)." },
  { id: "dw-runesmiting", isRune: true, repeatable: true, name: "Rune of Smiting", cost: 25, cat: "weapon", desc: "Weapon Rune. 1 wound = 1D6 wounds (multiple instances: roll more dice, take the highest)." },
  { id: "dw-armourofskaldour", name: "Armour of Skaldour", cost: 80, cat: "armour", desc: "Gromril armour. 2+ save (unmodifiable). 4+ ward save. Immune to fire-based attacks." },
  { id: "dw-mradamant", isRune: true, isMasterRune: true, name: "Master Rune of Adamant", cost: 30, cat: "armour", desc: "Master Armour Rune. +2 armour save." },
  { id: "dw-mrgromril", isRune: true, isMasterRune: true, name: "Master Rune of Gromril", cost: 100, cat: "armour", desc: "Master Armour Rune. Toughness 10." },
  { id: "dw-runestone", isRune: true, repeatable: true, name: "Rune of Stone", cost: 10, cat: "armour", desc: "Armour Rune. +1 armour save (can be taken several times)." },
  { id: "dw-runefortitude", isRune: true, repeatable: true, name: "Rune of Fortitude", cost: 20, cat: "armour", desc: "Armour Rune. +1 wound (can be taken several times)." },
  { id: "dw-runeiron", isRune: true, repeatable: true, name: "Rune of Iron", cost: 30, cat: "armour", desc: "Armour Rune. +1 toughness (can be taken several times)." },
  { id: "dw-runeresistance", isRune: true, repeatable: true, maxCount: 2, name: "Rune of Resistance", cost: 30, cat: "armour", desc: "Armour Rune. 5+ ward save (4+ if taken twice; can't be taken thrice)." },
  { id: "dw-runespelleating", isRune: true, repeatable: true, name: "Rune of Spell Eating", cost: 60, cat: "armour", desc: "Armour Rune. Natural dispel 3+; dispelled spells are destroyed on 3+ (multiple instances: roll more dice, take highest)." },
  { id: "dw-bugmanstankard", name: "Bugman's Tankard", cost: 10, cat: "enchanted", desc: "The bearer or one model in his unit recovers one lost wound after a phase ends. Doesn't work on dead models. Three uses." },
  { id: "dw-dragoncrown", name: "Dragon Crown of Karaz", cost: 25, cat: "enchanted", desc: "Dwarf Lord only. Bearer and his unit are immune to psychology.", restrictedTo: [{ tags: ["dwarfLord"] }] },
  { id: "dw-fieryring", name: "Firery Ring of Thori", cost: 25, cat: "enchanted", desc: "After a normal move, creates a wall of flame around the bearer's unit (can't shoot but can be shot at; nothing can charge it). Lasts until the Dwarf player's next turn. Models entering it by accident are destroyed. One use." },
  { id: "dw-greatbookgrudges", name: "Great Book of Grudges", cost: 50, cat: "enchanted", desc: "Dwarf Lord only. Bearer and his unit hate all enemies.", restrictedTo: [{ tags: ["dwarfLord"] }] },
  { id: "dw-goldensceptre", name: "Golden Sceptre of Nogrim", cost: 50, cat: "enchanted", desc: "+1 armour save to the bearer and his unit." },
  { id: "dw-mrdismay", isRune: true, isMasterRune: true, name: "Master Rune of Dismay", cost: 25, cat: "enchanted", desc: "Talismanic Master Rune, must be on a war horn. One use. Sound it at the start of an enemy turn — all enemy units test Ld (unless immune to psychology) or can't charge that turn." },
  { id: "dw-mrdisdain", isRune: true, isMasterRune: true, name: "Master Runes of Disdain", cost: 50, cat: "enchanted", desc: "Talismanic Master Rune. Dispels and destroys a spell cast at the bearer or his unit. One use." },
  { id: "dw-mrspite", isRune: true, isMasterRune: true, name: "Master Rune of Spite", cost: 50, cat: "enchanted", desc: "Talismanic Master Rune. Ward save with a twist — rebounds wounds on 5+ (only unmodified saves apply to rebounded wounds)." },
  { id: "dw-runeluck", isRune: true, repeatable: true, name: "Rune of Luck", cost: 20, cat: "enchanted", desc: "Talismanic Rune. Re-roll one personal die roll, one use (may be taken several times)." },
  { id: "dw-runespellbreaking", isRune: true, name: "Rune of Spellbreaking", cost: 25, cat: "enchanted", desc: "Talismanic Rune, Runesmiths only. Works exactly as a Dispel Magic Scroll. Max two per army (one if using the 'Veto One Spell' house rule).", restrictedTo: [{ tags: ["dwarfRunesmith"] }] },
  { id: "dw-mrstubbornness", isRune: true, isMasterRune: true, name: "Master Rune of Sheer Damn Stubbornness", cost: 10, cat: "banner", desc: "Master Rune of Protection, BSB only. Unbreakable." },
  { id: "dw-mrchallenge", isRune: true, isMasterRune: true, name: "Master Rune of Challenge", cost: 10, cat: "banner", desc: "Master Rune of Protection, BSB only. An enemy that could charge this regiment must pass an Ld test on 3D6 (2D6 if immune to psychology) or is forced to charge it." },
  { id: "dw-mrbattle", isRune: true, isMasterRune: true, name: "Master Rune of Battle", cost: 75, cat: "banner", desc: "Master Rune of Protection, BSB only. The regiment adds 1D6 to combat resolution." },
  { id: "dw-mrstromni", isRune: true, isMasterRune: true, name: "Master Rune of Stromni Redbeard", cost: 75, cat: "banner", desc: "Master Rune of Protection, BSB only. All friendly Dwarf units within 12\" add +1 to combat resolution." },
  { id: "dw-mrgroth", isRune: true, isMasterRune: true, name: "Master Rune of Groth One-Eye", cost: 125, cat: "banner", desc: "Master Rune of Protection, BSB only. All friendly Dwarf units within 12\" take Ld/break tests without modifiers." },
  { id: "dw-mrvalaya", isRune: true, isMasterRune: true, name: "Master Rune of Valaya", cost: 150, cat: "banner", desc: "Master Rune of Protection, BSB only. Natural dispel 4+ against all spells on the battlefield (incl. allied wizards/Anvil of Doom); remains-in-play spells auto-dispel at end of magic phase." },
  { id: "dw-runecourage", isRune: true, name: "Rune of Courage", cost: 10, cat: "banner", desc: "Rune of Protection, Longbeards only. Immune to panic.", requiresRegimentIds: ["longbeards"], requiresRegimentLabel: "Longbeards" },
  { id: "dw-runeurgency", isRune: true, name: "Rune of Urgency", cost: 25, cat: "banner", desc: "Rune of Protection. The regiment may take a Vanguard move before the battle begins." },
  { id: "dw-runeslowness", isRune: true, repeatable: true, name: "Rune of Slowness", cost: 25, cat: "banner", desc: "Rune of Protection. Charging enemies have their charge move reduced by 1D6\" (multiple instances: roll more dice, take highest)." },
  { id: "dw-runewarding", isRune: true, repeatable: true, name: "Rune of Warding", cost: 25, cat: "banner", desc: "Rune of Protection. Natural dispel 4+ (multiple instances: roll more dice, take highest)." },
  { id: "dw-runepassage", isRune: true, name: "Rune of Passage", cost: 25, cat: "banner", desc: "Rune of Protection. The bearer and his unit may march even with enemies within 8\"; treats difficult terrain as open." },
  { id: "dw-runeoathkeeping", isRune: true, name: "Rune of Oath-Keeping", cost: 25, cat: "banner", desc: "Rune of Protection. The regiment never loses its rank bonus when hit to the flank/rear (step-up is still cancelled, enemy still gets their combat res bonus)." },
  { id: "dw-runeguarding", isRune: true, name: "Rune of Guarding", cost: 40, cat: "banner", desc: "Rune of Protection, Hammerers only. If the general joins, they auto-pass Ld/break tests (may still break from fear-causing outnumbering etc.).", requiresRegimentIds: ["hammerers"], requiresRegimentLabel: "Hammerers" },
  { id: "dw-runefear", isRune: true, name: "Rune of Fear", cost: 40, cat: "banner", desc: "Rune of Protection. Causes fear." },
  { id: "dw-runeburning", isRune: true, name: "Rune of Burning", cost: 10, cat: "engineering", desc: "Engineering Rune. Ammunition counts as flaming." },
  { id: "dw-runeseeking", isRune: true, name: "Rune of Seeking", cost: 10, cat: "engineering", desc: "Engineering Rune, Bolt Throwers only. May shoot at fliers flying high with no long-range/large-target penalty.", restrictedTo: [{ regimentIds: ["boltthrowers"] }] },
  { id: "dw-runeforging", isRune: true, name: "Rune of Forging", cost: 10, cat: "engineering", desc: "Engineering Rune, Flame Cannons & Cannons only (not Organ Guns). Doesn't miss a turn on its first misfire (still blows up on a second).", restrictedTo: [{ regimentIds: ["cannons", "flamecannons"] }] },
  { id: "dw-runepenetrating", isRune: true, name: "Rune of Penetrating", cost: 10, cat: "engineering", desc: "Engineering Rune. +1 strength. Cost doubles if inscribed on a Gyrocopter.", doubleCostOn: ["gyrocopters"] },
  { id: "dw-runedisguise", isRune: true, name: "Rune of Disguise", cost: 15, cat: "engineering", desc: "Engineering Rune. The machine is invisible until an enemy comes within 1\" or it shoots. Cost doubles if inscribed on a Gyrocopter.", doubleCostOn: ["gyrocopters"] },
  { id: "dw-runetargeting", isRune: true, name: "Rune of Targeting", cost: 15, cat: "engineering", desc: "Engineering Rune, Bolt Throwers/Goblin Hewer/Cannons only. Bolt Throwers & Goblin Hewer get +1 to hit; Cannons may re-roll the first artillery die.", restrictedTo: [{ regimentIds: ["boltthrowers", "goblinhewer", "cannons"] }] },
  { id: "dw-runedemolishing", isRune: true, name: "Rune of Demolishing", cost: 15, cat: "engineering", desc: "Engineering Rune, Cannons only (not Flame Cannons/Organ Guns). Deals +1 wound (D3+1 total).", restrictedTo: [{ regimentIds: ["cannons"] }] },
  { id: "dw-runeimmolation", isRune: true, name: "Rune of Immolation", cost: 15, cat: "engineering", desc: "Engineering Rune. Self-destruct at will (including when the crew dies or fails a break test) — the crew and any enemy engaged with the machine suffer 1D6 S6 hits, no save." },
  { id: "dw-runeaccuracy", isRune: true, name: "Rune of Accuracy", cost: 30, cat: "engineering", desc: "Engineering Rune, Stone Throwers only. Re-roll the artillery die and/or scatter die after measuring the guessed distance.", restrictedTo: [{ regimentIds: ["smallstonethrowers", "largestonethrowers"] }] },
];

const DWARFS = {
  key: "dwarfs",
  runeForge: true,
  name: "Dwarfs",
  tagline: "Stoic, ironclad holds standing against the dark and the endless grudge",
  magicItems: [...COMMON_MAGIC_ITEMS_NO_ARCANE, ...DWARF_MAGIC_ITEMS],
  armyWideRules: [
    "Dwarfs hate all Orcs & Goblins — Orcs, Goblins, Snotlings, and Hobgoblins (but not Ogres, Trolls, or Giants).",
    "Dwarfs suffer -1 Ld if they fight within 8\" of elven allies (High Elves or Wood Elves).",
    "Dwarfs cannot use bound spells or arcane items — no Arcane Items category is available to any Dwarf character.",
    "Some Dwarfs may wear Gromril Armour — heavy armour with a 4+ save, which combines with a shield as normal.",
    "Movement Allowance is 4 for all Dwarfs in Warhammer Renaissance (already reflected in every profile below) — this compensates for a now-removed early-edition rule that let Dwarfs wear heavy armour with no movement penalty.",
    "Runes: this builder models each individual rune as its own selectable item (in the normal Weapons/Armour/Enchanted/Banner/Engineering categories), and each rune is unique per army just like any other magic item. What ISN'T mechanized is the finer rune-combo rules: up to 3 runes may be combined onto one weapon/armour/talisman/banner/war machine, no two items may share the exact same combination, and only one Master Rune may sit on a given item (though the game-wide 'no Master Rune twice in the same army' rule already falls out naturally from normal item uniqueness). In practice this builder will let a character's item slots be filled with any mix of runes rather than strictly grouping them onto one weapon/one armour/one banner — keep the fluff-accurate grouping in mind yourself when building a list.",
    "Slayers (Troll Slayers, Giant Slayers, Daemon Slayers, Dragon Slayers) are unbreakable, never wear armour or carry shields, and always wound on 4+ regardless of the target's toughness. No Slayer character may be the army general or carry the battle standard, and they may only take magic weapons, never other item types.",
  ],
  characters: [
    {
      id: "dwarflord", name: "Dwarf Lord", cost: 136, stat: "Dwarf Lord", magicItemSlots: 3, magicItemCategoryFilter: ["weapon", "armour", "enchanted"], tags: ["dwarfLord"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour, and a shield, all for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour", "Shield & Gromril Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Handgun", "Crossbow", "Two pistols"] },
      mounts: [
        { id: "shield", name: "Carried atop a shield (general only) — +2 attacks, first wound ignored; takes the place of two infantrymen", cost: 25 },
        { id: "throne", name: "Carried atop a Throne of Power (general only) — +4 attacks, ignores first two wounds, cannot march; takes the place of six or nine infantrymen", cost: 50 },
      ],
    },
    {
      id: "dwarfhero", name: "Dwarf Hero", cost: 82, stat: "Dwarf Hero", magicItemSlots: 2, magicItemCategoryFilter: ["weapon", "armour", "enchanted"],
      gearNote: "May join a war machine (except Organ Guns) and act as an Engineer — the machine may use his BS and re-roll misfires (except bouncing cannon balls); he can't shoot his own weapons while operating it. May take light armour, heavy armour, or Gromril Armour, and a shield, all for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour", "Shield & Gromril Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Handgun", "Crossbow", "Two pistols"] },
    },
    {
      id: "dwarfbsb", name: "Dwarf Battle Standard Bearer", cost: 92, stat: "Dwarf BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: ["weapon", "armour", "enchanted", "banner"], tags: ["bsb"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour for free. The one item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour", "Heavy Armour", "Gromril Armour"] },
    },
    {
      id: "daemonslayer", name: "Daemon Slayer", cost: 100, stat: "Daemon Slayer", magicItemSlots: 1, magicItemCategoryFilter: ["weapon"],
      gearNote: "Unbreakable; never wears armour or carries a shield; always wounds on 4+ regardless of toughness. Must walk alone or join a Slayer regiment. Cannot be the general or carry the battle standard. The one item must be a magic weapon.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "dragonslayer", name: "Dragon Slayer", cost: 60, stat: "Dragon Slayer", magicItemSlots: 1, magicItemCategoryFilter: ["weapon"],
      gearNote: "Unbreakable; never wears armour or carries a shield; always wounds on 4+ regardless of toughness. Must walk alone or join a Slayer regiment. Cannot be the general or carry the battle standard. The one item must be a magic weapon.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "runelord", name: "Runelord", cost: 160, stat: "Runelord", magicItemSlots: 3, magicItemCategoryFilter: ["weapon", "armour", "enchanted"], tags: ["dwarfRunesmith"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour, and a shield, all for free. One Runesmith in the army may bring an Anvil of Doom (attended by two Anvil Guard Hammerers) — while operating it, he casts as a level 4 wizard using Bright Magic's Blast/Fireball/Piercing Bolts of Burning/The Burning Head, expending power cards as normal.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour", "Shield & Gromril Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      anvilOption: { label: "Anvil of Doom (+2 Anvil Guard Hammerers)", cost: 100 },
    },
    {
      id: "masterrunesmith", name: "Master Runesmith", cost: 120, stat: "Master Runesmith", magicItemSlots: 2, magicItemCategoryFilter: ["weapon", "armour", "enchanted"], tags: ["dwarfRunesmith"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour, and a shield, all for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour", "Shield & Gromril Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      anvilOption: { label: "Anvil of Doom (+2 Anvil Guard Hammerers)", cost: 110 },
    },
    {
      id: "runesmith", name: "Runesmith", cost: 80, stat: "Runesmith", magicItemSlots: 1, magicItemCategoryFilter: ["weapon", "armour", "enchanted"], tags: ["dwarfRunesmith"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour, and a shield, all for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour", "Shield & Gromril Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      anvilOption: { label: "Anvil of Doom (+2 Anvil Guard Hammerers)", cost: 120 },
    },
  ],
  regiments: [
    {
      id: "hammerers", name: "Hammerers", perModel: 15, minSize: 5, stat: "Dwarf Elite Soldier", command: "standard", restriction: "0-1",
      note: "Gromril Armour and double handed weapons.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Dwarf Commander", baseCost: 30, magicItemSlots: 1, stat: "Dwarf Commander" },
    },
    {
      id: "ironbreakers", name: "Iron Breakers", perModel: 15, minSize: 5, stat: "Dwarf Elite Soldier", command: "standard", restriction: "0-1",
      note: "Gromril Armour and shields — inscribed with a Rune of Stone, +1 armour save (2+ total combined with the shield).",
      champion: { name: "Dwarf Commander", baseCost: 30, magicItemSlots: 1, stat: "Dwarf Commander" },
    },
    {
      id: "longbeards", name: "Longbeards", perModel: 13, minSize: 5, stat: "Dwarf Elite Soldier", command: "standard", restriction: "0-1",
      note: "Gromril Armour and shields.",
      options: [
        { id: "dhw", group: null, label: "Double handed weapons", cost: 3, per: "model" },
      ],
      champion: { name: "Dwarf Commander", baseCost: 30, magicItemSlots: 1, stat: "Dwarf Commander" },
    },
    {
      id: "trollslayers", name: "Troll Slayers", perModel: 13, minSize: 5, stat: "Troll Slayer", command: "standard",
      note: "Additional hand weapons by default. Unbreakable, never armoured or shielded, always wound on 4+ regardless of toughness. May be joined by any number of Giant Slayers, each equipped like the rest of the regiment.",
      options: [
        { id: "dhw", group: null, label: "Swap additional hand weapons for double handed weapons", cost: 0, per: "model" },
      ],
      extraOption: { label: "Slayer-Berserkers", cost: 30, max: 3, unofficial: true },
      multiChampion: { name: "Giant Slayer", baseCost: 20, magicItemSlots: 1, stat: "Giant Slayer", magicItemCategoryFilter: ["weapon"], itemSlotLabel: "Magic Weapon (may be a rune weapon)" },
    },
    {
      id: "dwarfcrossbowmen", name: "Dwarf Crossbowmen", perModel: 11, minSize: 5, stat: "Dwarf Soldier", command: "standard",
      note: "Crossbows and light armour.",
      options: [
        { id: "heavyarmour", group: "armourshield", label: "Heavy armour instead of light", cost: 1, per: "model" },
        { id: "shields", group: "armourshield", label: "Shields", cost: 1, per: "model" },
        { id: "both", group: "armourshield", label: "Heavy armour and shields", cost: 3, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "dwarfrangers", name: "Dwarf Rangers", perModel: 16, minSize: 5, stat: "Dwarf Soldier", command: "standard", restriction: "0-1",
      note: "Crossbows, light armour, shields. May skirmish and use the scout special rules.",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light", cost: 2, per: "model" },
        { id: "dhw", group: null, label: "Double handed weapons", cost: 2, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "dwarfminers", name: "Dwarf Miners", minSize: 5, stat: "Dwarf Soldier", command: "standard", restriction: "0-1",
      note: "Double handed weapons and light armour. May Ambush (arrive from a table edge on turn 2 instead of deploying, as if pursuing out of the table).",
      tieredPricing: { baseCost: 80, baseSize: 5, extraPerModel: 11 },
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "dwarfwarriors", name: "Dwarf Warriors", perModel: 7, minSize: 5, stat: "Dwarf Soldier", command: "standard",
      note: "Light armour by default. Costs 1pt more (8pts) if fielded as allies for another army.",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "dwarfthunderers", name: "Dwarf Thunderers", perModel: 11, minSize: 5, stat: "Dwarf Soldier", command: "standard",
      note: "Hand guns and light armour.",
      options: [
        { id: "heavyarmour", group: "armourshield", label: "Heavy armour instead of light", cost: 1, per: "model" },
        { id: "shields", group: "armourshield", label: "Shields", cost: 1, per: "model" },
        { id: "both", group: "armourshield", label: "Heavy armour and shields", cost: 3, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
  ],
  chariotsMonsters: [
    {
      id: "boltthrowers", name: "Bolt Throwers", perUnit: 55, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
      baseCrew: 3, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }, { id: "heavy", label: "Heavy armour", cost: 2 }],
    },
    {
      id: "smallstonethrowers", name: "Small Stone Throwers", perUnit: 85, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
      baseCrew: 3, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }, { id: "heavy", label: "Heavy armour", cost: 2 }],
    },
    {
      id: "largestonethrowers", name: "Large Stone Throwers", perUnit: 100, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
      baseCrew: 3, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }, { id: "heavy", label: "Heavy armour", cost: 2 }],
    },
    {
      id: "cannons", name: "Cannons", perUnit: 100, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Normal cannon. Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
      baseCrew: 3, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }, { id: "heavy", label: "Heavy armour", cost: 2 }],
    },
    {
      id: "organgun", name: "Organ Gun", perUnit: 155, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine", restriction: "0-1",
      note: "Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
      baseCrew: 3, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }, { id: "heavy", label: "Heavy armour", cost: 2 }],
    },
    {
      id: "flamecannons", name: "Flame Cannons", perUnit: 90, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Guess range like a cannon (max 12\") plus the artillery die; teardrop template, S5 hit (1 wound = 1D3). Any casualty forces a panic test. Uniquely, Flame Cannons may stand & shoot (resolved before the enemy unit moves). Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
      baseCrew: 3, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }, { id: "heavy", label: "Heavy armour", cost: 2 }],
    },
    {
      id: "gyrocopters", name: "Gyrocopter", perUnit: 100, stat: "Gyrocopter", kind: "warmachine",
      note: "Works like a flying light chariot with no steeds and one Dwarf Soldier crewman. Won't charge but can be charged; if beaten or broken it scatters 2D6\" and crashes for 2D6 S4 hits on whatever it lands on (counts as slain). Fires once per turn — either a bomb (3\" template, scatters on a miss, S5, panic test on any casualty) or its steam cannon (teardrop template, S3, no save; unusable after flying high or 10\"+ that turn).",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
    },
    {
      id: "goblinhewer", name: "Goblin Hewer", perUnit: 90, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine", restriction: "0-1",
      note: "Manned by three Slayers with two hand weapons each. Rolls to hit with BS; on a hit, rolls 1D3 wounds per rank in the target (or per model in the widest rank, if hitting a flank). Range 48\", S4.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Slayer crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
    },
  ],
  specialCharacters: [
    { id: "kingkazador", name: "King Kazador of Karak Azul", cost: 300, stat: "King Kazador of Karak Azul", role: "Dwarf Lord",
      note: "Carries the Hammer of Karak Azul (+2 WS, +1S, one wound kills), a shield, the Gromril Armour of the King of Karak Azul (2+ save total, 5+ ward), and the Thunderhorn (sound once, at the start of an enemy turn — all enemy units test Ld unless immune to psychology; failures can't charge that turn)." },
    { id: "ungrim", name: "Ungrim Ironfist, The Slayer King of Karak Kadrin", cost: 300, stat: "Ungrim Ironfist", role: "Daemon Slayer",
      note: "Unlike normal Slayers, Ungrim may carry magic items, join any regiment, and be the army general.",
      items: "Carries: the Axe of Dargo (one enemy loses 1 attack, +1S, 1 wound = 1D6 wounds), the Slayer Crown (+1T, 2+ armour save), the Dragon Cloak (a ward save that rebounds wounds on 5+, unmodified saves only on rebounds; may take two re-rolls during the battle)." },
    { id: "kragg", name: "Runelord Kragg the Grim", cost: 300, stat: "Runelord Kragg the Grim", role: "Runelord",
      note: "Carries Kragg's Hammer (S10, +1A, 1 wound = 1D6 wounds), Kragg's Gromril Armour (2+ save, re-rollable), and the Runestaff (immune to fire, may auto-dispel two spells during the battle)." },
    { id: "gotrekfelix", name: "Gotrek Gurnisson and Felix Jaeger", cost: 300, stat: "Gotrek Gurnisson", role: "Daemon Slayer + companion (300pts for the pair)",
      note: "Represents both models together — Felix (stat line: Felix Jaeger) is human and doesn't hate Orcs & Goblins. They must stay together and may join any regiment. While Gotrek lives, both benefit from Gotrek's Doom (4+ ward save, 4+ natural dispel).",
      items: "Gotrek carries Gotrek's Axe (always wounds on 2+, no save, 1 wound = 1D3, 1D6 vs Dragons/Daemons). Felix carries a Blade of Leaping Bronze (+2A, a common magic item)." },
    { id: "thorgrim", name: "High King Thorgrim Grudgebearer", cost: 500, stat: "High King Thorgrim Grudgebearer", role: "Dwarf Lord — must be the army general",
      note: "Rides atop a Throne of Power.",
      items: "Carries: the Great Book of Grudges, the Armour of Skaldour, the Dragon Crown of Karaz, the Axe of Grimnir." },
    { id: "josefbugman", name: "Josef Bugman", cost: 100, stat: "Josef Bugman", role: "Dwarf Hero",
      note: "May scout alongside a regiment of Rangers. Carries a crossbow, light or heavy armour, a shield, a double handed weapon, and Bugman's Tankard.", extraMagicItemSlots: 1 },
    { id: "burlok", name: "Engineer Guildmaster Burlok Damnison", cost: 150, stat: "Burlok Dammnison", role: "Dwarf Hero",
      note: "Carries Gromril Armour.", extraMagicItemSlots: 2 },
  ],
};

const BRETONNIA_MAGIC_ITEMS = [
  { id: "br-lanceoflot", name: "Lance of Lot", cost: 20, cat: "weapon", desc: "Lance. +1 to hit and +1 strength on the turn of the charge." },
  { id: "br-caliburnus", name: "Caliburnus", cost: 75, cat: "weapon", desc: "General only. +2 WS, +2 S, +2 attacks." },
  { id: "br-shieldholiness", name: "Shield of Holiness and Virtue", cost: 30, cat: "armour", desc: "Knightly characters only. Disregard all hits against the bearer in the first combat round of a challenge.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-antlers", name: "Antlers of the Great Hunt", cost: 10, cat: "enchanted", desc: "Knightly characters only. The bearer and his unit may re-roll failed pursuit rolls.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-bonerelic", name: "Bone Relic", cost: 20, cat: "enchanted", desc: "Commoner champion only. Natural dispel 2+.", restrictedTo: [{ tags: ["commoner"] }] },
  { id: "br-tressisoulde", name: "The Tress of Isoulde", cost: 30, cat: "enchanted", desc: "One use only. Knightly characters only. The bearer wounds automatically, no armour saves apply.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-bufoshexscroll", name: "Bufo's Hex Scroll", cost: 100, cat: "arcane", desc: "One use. Any spell cast at the bearer or his regiment is dispelled, even with Total Power, and the caster is turned into a frog (counts as slain). Returns on his own table edge if Drain Magic is cast; Slann Mage Priests are unaffected." },
  { id: "br-errantry", name: "Errantry Banner", cost: 10, cat: "banner", desc: "Chevaliers Errant only. Enemies get no armour save from hits made during the charge (not against mounts).", restrictedTo: [{ regimentIds: ["chevalierserrant"] }] },
  { id: "br-questing", name: "Questing Banner", cost: 20, cat: "banner", desc: "Chevaliers en Quête only. Immune to psychology.", restrictedTo: [{ regimentIds: ["chevaliersenquete"] }] },
  { id: "br-realm", name: "Banner of the Realm", cost: 30, cat: "banner", desc: "Chevaliers Féodaux only. +1 to combat resolution.", restrictedTo: [{ regimentIds: ["chevaliersfeodaux"] }] },
  { id: "br-grail", name: "Banner of the Grail", cost: 40, cat: "banner", desc: "Chevaliers D'Honneur only. Auto-passes the first Ld test it fails, including break tests.", restrictedTo: [{ regimentIds: ["chevaliersdhonneur"] }] },
  { id: "br-bravery", name: "Virtue of Bravery", cost: 15, cat: "virtue", desc: "Knightly Virtue. The knight and his regiment are immune to fear.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-joust", name: "Virtue of the Joust", cost: 20, cat: "virtue", desc: "Knightly Virtue. When charging with a lance, the knight hits automatically.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-purity", name: "Virtue of Purity", cost: 30, cat: "virtue", desc: "Knightly Virtue. Natural dispel 4+.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-temper", name: "Virtue of Knightly Temper", cost: 30, cat: "virtue", desc: "Knightly Virtue. Double attacks (on profile) on the charge.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-trialcombat", name: "Virtue of Trial by Combat", cost: 40, cat: "virtue", desc: "Knightly Virtue. Must always issue/accept challenges if possible; re-rolls to hit and to wound in challenges; the enemy must re-roll successful (incl. unmodified) saves in challenges.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-ardour", name: "Virtue of Knightly Ardour", cost: 40, cat: "virtue", desc: "Knightly Virtue. May counter-charge to the front if the charger starts more than half its charge distance away — move 1D6\" forward, both sides count as charging, highest Initiative strikes first.", restrictedTo: [{ tags: ["knightly"] }] },
  { id: "br-impetuous", name: "Virtue of the Impetuous Knight", cost: 60, cat: "virtue", desc: "Knightly Virtue. +1D6\" on charge moves (normal failed-charge distance if the charge fails).", restrictedTo: [{ tags: ["knightly"] }] },
];

const BRETONNIA = {
  key: "bretonnia",
  loreOptions: [...COLLEGE_LORES],
  name: "The Grand Army of Bretonnia",
  tagline: "Chivalrous knights and the peasant levy that bears the realm's weight",
  magicItems: [...COMMON_MAGIC_ITEMS, ...BRETONNIA_MAGIC_ITEMS],
  compositionRules: [
    { kind: "requiresAtLeastOne", label: "At least one regiment of Chevaliers", refs: [
      { list: "regiments", id: "chevalierserrant", name: "Chevaliers Errant" },
      { list: "regiments", id: "chevaliersfeodaux", name: "Chevaliers Féodaux" },
      { list: "regiments", id: "chevaliersenquete", name: "Chevaliers en Quête" },
      { list: "regiments", id: "chevaliersdhonneur", name: "Chevaliers D'Honneur" },
      { list: "regiments", id: "chevaliersapied", name: "Chevaliers á Pied" },
      { list: "regiments", id: "chevaliersvolants", name: "Chevaliers Volants" },
    ] },
  ],
  armyWideRules: [
    "Bretonnian Warhorses are bred for war over generations and don't suffer the usual -1 movement penalty for wearing barding.",
    "A Knight's Army: the general must be a knightly character (never a wizard), and the army must include at least one regiment of knights (a Chevaliers regiment). The regiment requirement is now flagged live by this builder (see the warning banner above the roster); the general-must-be-knightly part isn't, since the app doesn't track a designated general.",
    "Knightly Disdain: knightly regiments (Chevaliers) and knightly characters ignore panic caused by anything except other knightly regiments/characters (or regiments a knightly character has joined). Knightly characters will never join a Peasant regiment.",
    "This builder models the default, darker version of Bretonnia (war machines and peasant levies). The alternate 'Heroic Army' variant (Lance Formation, no common peasants) is described in an appendix that wasn't in the provided text, so it isn't modeled here.",
    "Knightly Virtues: each knightly character may take one Virtue, and each Virtue may only appear once in the army. A Virtue counts as, and takes up a slot from, the character's normal magic item allowance rather than being separate — this builder enforces the one-per-army uniqueness automatically, but doesn't hard-cap a character to exactly one Virtue if they have multiple item slots free, so keep that limit in mind yourself.",
  ],
  characters: [
    {
      id: "knightlylord", name: "Knightly Lord", cost: 100, stat: "Knightly Lord", magicItemSlots: 3, tags: ["knightly"],
      gearNote: "May take a shield and heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 20, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 55, stat: "Pegasus" },
        { id: "hippogriff", name: "Hippogriff", cost: 155, stat: "Hippogriff" },
      ],
    },
    {
      id: "knightlyhero", name: "Knightly Hero", cost: 60, stat: "Knightly Hero", magicItemSlots: 2, tags: ["knightly"],
      gearNote: "May take a shield and heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 15, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 50, stat: "Pegasus" },
        { id: "hippogriff", name: "Hippogriff", cost: 150, stat: "Hippogriff" },
      ],
    },
    {
      id: "knightlybsb", name: "Knightly Battle Standard Bearer", cost: 100, stat: "Knightly BSB", magicItemSlots: 1, restriction: "0-1", tags: ["knightly", "bsb"],
      gearNote: "May take heavy armour for free. The one item may be a magic banner, or may instead be a knightly Virtue.",
      armourGroup: { options: ["No armour (default)", "Heavy Armour"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 10, stat: "Warhorse" },
      ],
    },
    {
      id: "wizardlord", name: "Wizard Lord (level 4)", cost: 240, stat: "Wizard Lord", magicItemSlots: 4,
      gearNote: "May take College Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "unicorn", name: "Unicorn (unmarried female wizards only)", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "hippogriff", name: "Hippogriff", cost: 140, stat: "Hippogriff" },
      ],
    },
    {
      id: "masterwizard", name: "Master Wizard (level 3)", cost: 170, stat: "Master Wizard", magicItemSlots: 3,
      gearNote: "May take College Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "unicorn", name: "Unicorn (unmarried female wizards only)", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizardchampion", name: "Wizard Champion (level 2)", cost: 110, stat: "Wizard Champion", magicItemSlots: 2,
      gearNote: "May take College Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "unicorn", name: "Unicorn (unmarried female wizards only)", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizard", name: "Wizard (level 1)", cost: 50, stat: "Wizard", magicItemSlots: 1,
      gearNote: "May take College Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "unicorn", name: "Unicorn (unmarried female wizards only)", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
  ],
  regiments: [
    {
      id: "rascals", name: "Rascals", perModel: 3, minSize: 5, stat: "Peasant", command: "standard",
      note: "Peasants.",
      options: [
        { id: "spears", group: "melee", label: "Spears", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "rapscallions", name: "Rapscallions", perModel: 5, minSize: 5, stat: "Peasant", command: "standard",
      note: "Peasants with longbows.",
      options: [
        { id: "crossbows", group: null, label: "Crossbows instead of longbows", cost: 2, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "ribalds", name: "Ribalds", perModel: 5, minSize: 5, stat: "Man-at-Arms", command: "standard",
      note: "Men-at-Arms with light armour.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 1, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds", cost: 1, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "arbalestiers", name: "Arbalestiers", perModel: 9, minSize: 5, stat: "Man-at-Arms", command: "standard",
      note: "Men-at-Arms with crossbows.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "pavise", group: null, label: "Pavise — 5+ save vs shooting only, 4+ combined with light armour", cost: 1, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "archers", name: "Archers", perModel: 7, minSize: 5, stat: "Man-at-Arms", command: "standard",
      note: "Men-at-Arms with longbows. May skirmish.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "zealots", name: "Zealots", perModel: 5, minSize: 5, stat: "Peasant", command: "standard", restriction: "0-1",
      note: "Peasants with shields. Hate all enemies. If the regiment includes at least 4 Zealots (beyond command/champion/other characters) carrying the Reliquary, it's held aloft — the regiment is immune to fear and gains Ld10.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 1, per: "model" },
        { id: "reliquary", group: null, label: "Four Zealots carry the Reliquary", cost: 20, per: "flat" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "chasseursdelamort", name: "Chasseurs de la Mort", perModel: 9, minSize: 5, stat: "Man-at-Arms", mountStat: "Normal Horse", mountLabel: "Normal Horse", command: "fastCavalry",
      note: "Men-at-Arms riding Normal Horses.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "spears", group: null, label: "Spears", cost: 1, per: "model" },
        { id: "bows", group: null, label: "Bows — may then skirmish", cost: 2, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "chevalierserrant", name: "Chevaliers Errant", perModel: 18, minSize: 5, stat: "Bretonnian Knight", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard", restriction: "0-1",
      note: "Young Knights with heavy armour, shields, and lances, on Warhorses. Unbreakable while accompanied by a living unmarried female wizard.",
      options: [
        { id: "barding", group: null, label: "Barding", cost: 3, per: "model" },
      ],
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersfeodaux", name: "Chevaliers Féodaux", perModel: 22, minSize: 5, stat: "Bretonnian Knight", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard",
      note: "Knights with heavy armour, shields, and lances, on Warhorses.",
      options: [
        { id: "barding", group: null, label: "Barding", cost: 3, per: "model" },
      ],
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersenquete", name: "Chevaliers en Quête", perModel: 17, minSize: 5, stat: "Bretonnian Knight", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard", restriction: "0-1",
      note: "Knights with heavy armour and double handed weapons, on Warhorses.",
      options: [
        { id: "barding", group: null, label: "Barding", cost: 3, per: "model" },
      ],
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersdhonneur", name: "Chevaliers D'Honneur", perModel: 35, minSize: 5, stat: "Elite Knight", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard", restriction: "0-1",
      note: "Barding, heavy armour, shields, and lances, on Warhorses.",
      champion: { name: "The King's Champion", baseCost: 30, magicItemSlots: 1, stat: "The King's Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersapied", name: "Chevaliers á Pied", perModel: 10, minSize: 5, stat: "Bretonnian Knight", command: "standard", restriction: "0-1",
      note: "Knights with heavy armour and shields (on foot).",
      options: [
        { id: "dhw", group: null, label: "Swap shields for double handed weapons", cost: 2, per: "model" },
      ],
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersvolants", name: "Chevaliers Volants", perModel: 55, minSize: 3, stat: "Bretonnian Knight", mountStat: "Pegasus", mountLabel: "Pegasus", command: "monstrous", restriction: "0-1",
      note: "Flying monstrous regiment. Knights with heavy armour, shields, and lances, on Pegasi.",
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "bertrandbowmen", name: "Bertrand the Brigand and the Bowmen of Bergerac", stat: "Bowmen of Bergerac", command: "skirmisher", restriction: "0-1",
      tieredPricing: { baseCost: 75, baseSize: 5, extraPerModel: 9 },
      note: "Counts toward Regiments, not Characters. The first five models are always: Bertrand the Brigand (longbow, the one-use Black Arrow — always hits, always wounds, no save), Hugo le Petit (shots resolve at S5), Gui le Gros (the regiment auto-passes its first Ld test), and at least two skirmishing elite-archer Bowmen of Bergerac. Further Bowmen may be added beyond the first five at the per-model rate.",
    },
  ],
  chariotsMonsters: [
    {
      id: "balliste", name: "Balliste", perUnit: 50, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Bolt thrower. Crewed by three Men-at-Arms.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Men-at-Arms crew",
    },
    {
      id: "onagremortier", name: "Onagre / Mortier", perUnit: 80, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Small stone thrower. Crewed by three Men-at-Arms.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Men-at-Arms crew",
    },
    {
      id: "trebuchet", name: "Trébuchet", perUnit: 95, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Large stone thrower. Crewed by three Men-at-Arms.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Men-at-Arms crew",
    },
    {
      id: "lordonnance", name: "L'Ordonnance", perUnit: 95, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Normal cannon. Crewed by three Men-at-Arms.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Men-at-Arms crew",
    },
    {
      id: "pistoletdorgue", name: "Pistolet D'orgue", perUnit: 150, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine", restriction: "0-1",
      note: "Organ gun. Crewed by three Men-at-Arms.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Men-at-Arms crew",
    },
  ],
  specialCharacters: [
    { id: "hermitknight", name: "The Hermit Knight", cost: 80, stat: "The Hermit Knight", role: "Knightly Hero",
      note: "Heavy armour, shield, double handed weapon. Has the Virtue of Bravery (fixed). May not join a regiment of knights, but may join commoners (Peasants/Men-at-Arms).", extraMagicItemSlots: 1 },
    { id: "louen", name: "Louen Leoncoeur, The Lionhearted", cost: 350, stat: "Louen Leoncoeur, The Lionhearted", role: "Knightly Lord — must be the general",
      note: "Virtue of the Lionheart: +1D3 Strength, rolled at the start of each melee phase. Rides a Hippogriff, carries a shield.",
      items: "Carries: The Crown of Bretonnia (cascading pre-battle characteristic boost), The Lion Lance (any model hit but not killed also suffers a S6 hit), The Tabard of Kings (a spellcaster who wounds/kills the bearer suffers 1D3 wounds), and The Armour of Brilliance (enemies suffer -2 to hit)." },
    { id: "greenknight", name: "The Green Knight", cost: 180, stat: "The Green Knight", role: "Unique — always acts alone, never joins regiments",
      note: "May deploy in the open alongside Scouts, in plain sight, as long as he stays within 4\" of water, a wood, a barrow mound, a chapel, a ruin, a statue, or a bridge (not in the enemy deployment zone or within 8\" of enemy troops). Causes fear, immune to psychology, 2+ natural dispel, regenerates on 2+. Heavy armour, shield, rides the barded Green Knight's Warhorse.",
      items: "Carries the Dolorous Blade: either one no-save attack where 1 wound becomes 1D6, or 1D6 normal attacks instead." },
    { id: "odosuliman", name: "Baron Odo d'Outremer and Suliman le Saracen", cost: 75, stat: "Baron Odo d'Outremer", role: "Knightly champion + commoner champion pair (75pts for both)",
      note: "Odo wears heavy armour and a shield, rides a barded Warhorse, and wields the Morning Star of Fracasse (a flail — any model wounded by it loses its magic weapon). Suliman (stat line: Suliman le Saracen) wears light armour, rides a normal Warhorse, wields a double handed weapon, and always strikes first when charging (even before Always Strikes First models, but after assassins). The two always fight together and may join regiments of knights." },
    { id: "tancred", name: "Tancred, Duc de Quenelles", cost: 200, stat: "Tancred, Duc de Quenelles", role: "Knightly Lord",
      note: "Heavy armour. Virtue of Purity (4+ natural dispel, fixed).",
      items: "Carries: the Blade of Couronne (Undead within 3\" take a wound each Bretonnia movement phase, no save; bearer & regiment immune to fear/terror), Blessed Draught (drink before striking/a characteristic test for +1D6 S that phase, one use), and the Grail Shield (Undead suffer -1 to hit the bearer; single-attack Undead can't hit him at all).",
      mounts: [
        { id: "warhorse", name: "Barded Warhorse", cost: 75 },
        { id: "pegasus", name: "Pegasus", cost: 150 },
        { id: "hippogriff", name: "Hippogriff", cost: 300 },
      ] },
    { id: "perilouslance", name: "The Knight of the Perilous Lance", cost: 100, stat: "The Knight of the Perilous Lance", role: "Knightly Hero",
      note: "Enemies suffer -1 to hit him on the turn he charges; he may re-roll armour saves in melee. Heavy armour, shield, barded Warhorse, lance. Virtue of the Joust (fixed — hits automatically when charging with a lance)." },
    { id: "reynard", name: "Reynard le Chasseur", cost: 60, stat: "Reynard le Chasseur", role: "Knightly Champion — may lead a Chasseurs de la Mort regiment",
      note: "Light armour, shield, Warhorse, a boar spear (wounded enemies lose 1D6 attacks in the first round of combat) and a war hawk (melee attacks at him are at -1 to hit). Always accompanied by two Wolf Hounds, Griffe and Groffe." },
    { id: "bohemond", name: "Bohemond Beastslayer, Duke of Bastonne", cost: 180, stat: "Bohemond Beastslayer, Duke of Bastonne", role: "Knightly Hero",
      note: "Heavy armour, barded Warhorse. Virtue of the Impetuous Knight (fixed — +1D6\" charge move).",
      items: "Carries: the Beast Mace of Bastonne (+2S, 1 wound = 1D3 wounds) and Bohemond's Shield (each successful magic-weapon hit against him rolls a die; on a 6 the weapon breaks and its hits fail that round)." },
    { id: "roland", name: "Roland le Marechal", cost: 75, stat: "Roland le Marechal", role: "Knightly Champion",
      note: "Heavy armour, shield, barded Warhorse, lance.",
      items: "Carries Roland's Warhorn (bound spell — all enemy flyers within 12\" are driven off)." },
    { id: "armand", name: "Armand D'Aquitaine", cost: 225, stat: "Armand d'Aquitaine", role: "Knightly Battle Standard Bearer",
      note: "Heavy armour, barded Warhorse. Virtue of Knightly Ardour (fixed).",
      items: "Carries the Banner of the Lady of the Lake (enemies in melee with this regiment can't claim rank bonus)." },
    { id: "tristanjules", name: "Tristan le Troubadour and Jules le Jongleur", cost: 125, stat: "Tristan le Troubadour", role: "Knightly Hero + companion (125pts for both)",
      note: "Tristan wears heavy armour and a shield, rides a barded Warhorse, wields a lance, and hates enemy troops with missile weapons (incl. war machine crew). At the start of any Bretonnia turn he may sing one song until the next Bretonnia turn: +1 combat resolution, 3+ natural dispel, or Ld10 for his regiment. Jules (stat line: Jules le Jongleur) always stays at Tristan's side; all attacks at Jules are at -2 to hit, and while adjacent, enemies attacking Tristan must pass an Ld test or lose one attack." },
    { id: "jasperre", name: "Jasperre le'Beu Dragonslayer", cost: 150, stat: "Jasperre le'Beu Dragonslayer", role: "Knightly Hero",
      note: "Heavy armour, shield, rides a Pegasus. Immune to psychology.",
      items: "Carries: the Dragonhelm (immune to terror, fire, and breath attacks), the Virtuous Lance (deals 1D6 wounds to large targets), and the Claw of Malgrimace (Monsters/Daemons in base contact lose half their attacks, rounding up)." },
    { id: "morgiana", name: "Morgiana le Fay, The Fay Enchantress", cost: 430, stat: "Morgiana le Fay", role: "Wizard Lord",
      note: "Unmarried — any Chevaliers Errant regiment she joins is unbreakable (subject to hatred instead if she dies). After deployment, knightly characters may ask her a favour (Champions 4+, Heroes 5+, Lords 6+) granting one of several combat bonuses; if a favoured knight breaks, she suffers an unsaved wound. Has her own unique spells (Spiteful Glance, The Mist of Chálons, The Doom of Dol, The Beguilement of Blondel). Rides a Unicorn.",
      items: "Carries: the Chalice of Potions (choose one of five one-turn effects, refreshed each Bretonnia turn unless exhausted on a 1), Morgiana's Mirror (arcane, +1 to Mental Duels), the Power Familiar (an extra magic card per phase, personal use only), and the Girdle of Gold (4+ ward save)." },
    { id: "repanse", name: "Repanse du Lyonesse", cost: 325, stat: "Repanse de Lyonesse", role: "Knightly Lord and Battle Standard Bearer — must carry the standard, may be the general",
      note: "Causes fear. Immune to the effects of spells. Rides a barded Warhorse, wears heavy armour.",
      items: "Wields the Sword of Lyonesse (cancels 'minus to hit' modifiers, allows no armour save and no unmodified save either) and carries the Fleur de Lys Banner (discard one random magic card from the opponent's hand each magic phase)." },
  ],
};

const ORC_MAGIC_ITEMS = [
  { id: "og-wollopa", name: "Wollopa's One Hit Wunda", cost: 10, cat: "weapon", desc: "Common Goblins only. In the first melee round the bearer fights, all hits resolve at S10. One use.", restrictedTo: [{ tags: ["commonGoblin"] }] },
  { id: "og-swordofbork", name: "Sword of Bork", cost: 40, cat: "weapon", desc: "Common Orcs only, only benefits Common Orc regiments. The bearer's regiment ignores animosity.", restrictedTo: [{ tags: ["commonOrc"] }] },
  { id: "og-axeofgrom", name: "Axe of Grom", cost: 50, cat: "weapon", desc: "Common Goblins only. Double handed weapon, no armour save, 1D3 wounds.", restrictedTo: [{ tags: ["commonGoblin"] }] },
  { id: "og-battleaxewaaagh", name: "Battle-Axe of the Last Waaagh!", cost: 75, cat: "weapon", desc: "Common Orcs only. +1S and +1 attack per rank of 4+ models behind the front rank (no limit), recalculated when attacks are made.", restrictedTo: [{ tags: ["commonOrc"] }] },
  { id: "og-morgor", name: "Morgor the Mangler", cost: 100, cat: "weapon", desc: "Common Orcs only. +1 WS, +1 S, +1 T, always strikes first, no armour save.", restrictedTo: [{ tags: ["commonOrc"] }] },
  { id: "og-hornedhelmet", name: "Horned Helmet", cost: 10, cat: "armour", desc: "Common Orcs only. One use. On the bearer's first melee wound, roll a D6: 4+ rebounds the wound onto the attacker, 3 or less it turns out to be an ordinary helmet.", restrictedTo: [{ tags: ["commonOrc"] }] },
  { id: "og-shinyhelm", name: "Shiny Helm of Nob", cost: 20, cat: "armour", desc: "Common Goblins only. +1 armour save, 5+ ward save.", restrictedTo: [{ tags: ["commonGoblin"] }] },
  { id: "og-trickstrinket", name: "Tricksy Trinket", cost: 10, cat: "enchanted", desc: "Common Goblins only. Enemies in base contact with the bearer must re-roll successful armour/ward/regeneration saves.", restrictedTo: [{ tags: ["commonGoblin"] }] },
  { id: "og-collarzorga", name: "The Collar of Zorga", cost: 10, cat: "enchanted", desc: "Common Orcs only. The bearer can't be hit by monsters. May not be worn while riding a monster.", restrictedTo: [{ tags: ["commonOrc"] }] },
  { id: "og-warpaint", name: "Magic War Paint", cost: 20, cat: "enchanted", desc: "Forest Goblins only. 5+ ward vs melee, 3+ ward vs any missile attack. Also protects the rider's mount.", restrictedTo: [{ tags: ["forestGoblin"] }] },
  { id: "og-stafflightning", name: "Staff of Lightning", cost: 50, cat: "arcane", desc: "Common Orc Shamans only. Bound spell — as Gaze of Mork (range 24\", S6 hit to anything in the path, normal saves). Roll after use: on a 1, the staff is exhausted for the rest of the battle.", restrictedTo: [{ tags: ["commonOrcShaman"] }] },
  { id: "og-totemtalisman", name: "Totem Talisman", cost: 100, cat: "arcane", desc: "Savage Orc Shamans only. An extra magic card each magic phase, personal use only.", restrictedTo: [{ tags: ["savageOrcShaman"] }] },
  { id: "og-skarsnikprodder", name: "Skarsnik's Prodder", cost: 100, cat: "arcane", desc: "Night Goblin Shamans only (besides Skarsnik, who carries his own for free). +1S. Also casts a bound spell each magic phase (18\" range & LoS, 1D6 S3 hits, no save).", restrictedTo: [{ tags: ["nightGoblinShaman"] }] },
  { id: "og-bannergobbo", name: "Banner of Gobbo Awesomeness", cost: 20, cat: "banner", desc: "Common Goblins only. +3 WS for the whole regiment in the first melee round of every combat.", restrictedTo: [{ tags: ["commonGoblin"] }] },
  { id: "og-spiderbanner", name: "Spider Banner", cost: 20, cat: "banner", desc: "Forest Goblins only. +1 attack for every front-rank model (riders only for cavalry) in the first melee round of every combat.", restrictedTo: [{ tags: ["forestGoblin"] }] },
  { id: "og-gorkswarbanner", name: "Gork's War Banner", cost: 20, cat: "banner", desc: "Common Goblins only. +1 to hit for every front-rank model (riders only for cavalry) in the first melee round of every combat.", restrictedTo: [{ tags: ["commonGoblin"] }] },
  { id: "og-badmoonbanner", name: "Bad Moon Banner", cost: 20, cat: "banner", desc: "Night Goblins only. Always strikes first.", restrictedTo: [{ tags: ["nightGoblin"] }] },
  { id: "og-evilsunbanner", name: "Evil Sun Banner", cost: 40, cat: "banner", desc: "Night Goblins only. May re-roll a failed animosity roll.", restrictedTo: [{ tags: ["nightGoblin"] }] },
  { id: "og-stalkerbanner", name: "Stalker Banner", cost: 40, cat: "banner", desc: "Forest Goblins only. Once/battle in the movement phase, before charges, may pivot on the spot and still take a full move/charge that turn (counts as having moved for shooting purposes).", restrictedTo: [{ tags: ["forestGoblin"] }] },
  { id: "og-morkswarbanner", name: "Mork's War Banner", cost: 100, cat: "banner", desc: "Orc infantry only, any type. Dispels all spells (even Total Power, including friendly ones) cast at the unit; any wizard touching the unit is slain instantly. No spells (even bound) may be cast from the unit.", restrictedTo: [{ regimentIds: ["orcboyz", "orcarrerboyz", "orcbiguns", "orcbigunarrerboyz", "savageorcs", "savageorcarrerboyz", "blackorcs"] }] },
];

const ORCS_GOBLINS = {
  key: "orcsgoblins",
  loreOptions: ["Waaagh! Magic"],
  name: "Orcs & Goblins",
  tagline: "An unstoppable, uncontrollable storm of green promising destruction wherever it goes",
  magicItems: [...COMMON_MAGIC_ITEMS, ...ORC_MAGIC_ITEMS],
  themes: {
    default: "core",
    label: "Army Type",
    options: [
      { id: "core", name: "Core", desc: "The default Orcs & Goblins army — Common Orcs, Black Orcs, Savage Orcs, Common Goblins, Night Goblins, and Forest Goblins all mixed together, plus hired muscle like Trolls, Giants, and Ogre Mercenaries." },
      { id: "forestgoblins", name: "Forest Goblins", desc: "A Forest Goblin-led warband from the deep woods — no Common Orcs, Black Orcs, or Savage Orcs. Common Goblins and Night Goblins are still welcome alongside the Forest Goblins, plus generic greenskin auxiliaries (Trolls, Giants, Snotlings, Ogre Mercenaries) and Goblin-crewed war machines/chariots. In an army with no Orcs at all, Forest Goblin regiments may take poisoned arrows." },
    ],
  },
  compositionRules: [
    { kind: "requiresIfPresent", label: "Common Orc characters", trigger: [{ list: "characters", tag: "commonOrc", name: "a Common Orc character" }], requires: [
      { list: "regiments", id: "orcboyz", name: "Orc Boyz" }, { list: "regiments", id: "orcarrerboyz", name: "Orc Arrer Boyz" }, { list: "regiments", id: "orcboarboyz", name: "Orc Boar Boyz" },
      { list: "regiments", id: "orcbiguns", name: "Orc Big'uns" }, { list: "regiments", id: "orcbigunarrerboyz", name: "Orc Big'un Arrer Boyz" }, { list: "regiments", id: "orcbigunboarboyz", name: "Orc Big'un Boar Boyz" },
    ] },
    { kind: "requiresIfPresent", label: "Black Orc characters", trigger: [{ list: "characters", tag: "blackOrc", name: "a Black Orc character" }], requires: [{ list: "regiments", id: "blackorcs", name: "Black Orcs" }] },
    { kind: "requiresIfPresent", label: "Savage Orc characters", trigger: [{ list: "characters", tag: "savageOrc", name: "a Savage Orc character" }], requires: [
      { list: "regiments", id: "savageorcs", name: "Savage Orcs" }, { list: "regiments", id: "savageorcarrerboyz", name: "Savage Orc Arrer Boyz" }, { list: "regiments", id: "savageorcboarboyz", name: "Savage Orc Boar Boyz" },
    ] },
    { kind: "requiresIfPresent", label: "Common Goblin characters", trigger: [{ list: "characters", tag: "commonGoblin", name: "a Common Goblin character" }], requires: [
      { list: "regiments", id: "commongoblininfantry", name: "Common Goblin Infantry" }, { list: "regiments", id: "commongoblinwolfriders", name: "Common Goblin Wolf Riders" },
    ] },
    { kind: "requiresIfPresent", label: "Forest Goblin characters", trigger: [{ list: "characters", tag: "forestGoblin", name: "a Forest Goblin character" }], requires: [
      { list: "regiments", id: "forestgoblinspiderriders", name: "Forest Goblin Spider Riders" }, { list: "regiments", id: "forestgoblininfantry", name: "Forest Goblin Infantry" },
    ] },
    { kind: "requiresIfPresent", label: "Night Goblin characters", trigger: [{ list: "characters", tag: "nightGoblin", name: "a Night Goblin character" }], requires: [
      { list: "regiments", id: "nightgoblininfantry", name: "Night Goblin Infantry" }, { list: "regiments", id: "nightgoblinsquighoppers", name: "Night Goblin Squig-Hoppers" },
      { list: "regiments", id: "nightgoblinsquighunters", name: "Night Goblin Squig-Hunters" }, { list: "regiments", id: "nightgoblinnettersclubbers", name: "Night Goblin Netters and Clubbers" },
    ] },
    { kind: "requiresIfPresent", label: "Orc-crewed war machines/chariots", trigger: [
      { list: "chariots", id: "spearchukkasorcs", name: "Spear Chukkas (Orc crew)" }, { list: "chariots", id: "smallrocklobbersorcs", name: "Small Rock Lobbers (Orc crew)" },
      { list: "chariots", id: "largerocklobbersorcs", name: "Large Rock Lobbers (Orc crew)" }, { list: "chariots", id: "orcboarchariots", name: "Orc Boar Chariot" },
    ], requires: [
      { list: "regiments", id: "orcboyz", name: "Orc Boyz" }, { list: "regiments", id: "orcarrerboyz", name: "Orc Arrer Boyz" }, { list: "regiments", id: "orcboarboyz", name: "Orc Boar Boyz" },
      { list: "regiments", id: "orcbiguns", name: "Orc Big'uns" }, { list: "regiments", id: "orcbigunarrerboyz", name: "Orc Big'un Arrer Boyz" }, { list: "regiments", id: "orcbigunboarboyz", name: "Orc Big'un Boar Boyz" },
      { list: "regiments", id: "blackorcs", name: "Black Orcs" }, { list: "regiments", id: "savageorcs", name: "Savage Orcs" }, { list: "regiments", id: "savageorcarrerboyz", name: "Savage Orc Arrer Boyz" }, { list: "regiments", id: "savageorcboarboyz", name: "Savage Orc Boar Boyz" },
    ] },
    { kind: "requiresIfPresent", label: "Goblin-crewed war machines/chariots", trigger: [
      { list: "chariots", id: "spearchukkasgoblins", name: "Spear Chukkas (Goblin crew)" }, { list: "chariots", id: "smallrocklobbersgoblins", name: "Small Rock Lobbers (Goblin crew)" },
      { list: "chariots", id: "largerocklobbersgoblins", name: "Large Rock Lobbers (Goblin crew)" }, { list: "chariots", id: "goblindoomdivers", name: "Goblin Doom Divers" }, { list: "chariots", id: "goblinwolfchariots", name: "Goblin Wolf Chariot" },
    ], requires: [
      { list: "regiments", id: "commongoblininfantry", name: "Common Goblin Infantry" }, { list: "regiments", id: "commongoblinwolfriders", name: "Common Goblin Wolf Riders" },
      { list: "regiments", id: "forestgoblinspiderriders", name: "Forest Goblin Spider Riders" }, { list: "regiments", id: "forestgoblininfantry", name: "Forest Goblin Infantry" },
      { list: "regiments", id: "nightgoblininfantry", name: "Night Goblin Infantry" }, { list: "regiments", id: "nightgoblinsquighoppers", name: "Night Goblin Squig-Hoppers" },
      { list: "regiments", id: "nightgoblinsquighunters", name: "Night Goblin Squig-Hunters" }, { list: "regiments", id: "nightgoblinnettersclubbers", name: "Night Goblin Netters and Clubbers" },
    ] },
  ],
  armyWideRules: [
    "Difficult to Master: this is arguably the most complex army to play, full of animosity tests, compulsory moves, exploding Shamans, and units that barely listen to orders. Most of that is battle-phase behavior rather than list-building, so this builder tracks points/composition faithfully but doesn't simulate dice-driven chaos like Fanatic scatter, Squig-Hopper bouncing, or Doom Diver misfires — those are called out as rules text on the relevant entries instead.",
    "Animosity: at the start of the turn, before movement, each Orc & Goblin regiment not engaged/fleeing (Trolls, Ogres, and similar excepted) tests animosity — 1 in 6 triggers a re-roll; a bad second roll (1-5) freezes the unit for the turn, a 6 forces it 2D6\" toward the nearest visible enemy and a mandatory charge next turn. War machines, chariots, and other non-regiment units never test.",
    "Fielding a type requires a regiment of that type: you can't field characters, war machine crew, or chariots of a given Orc/Goblin type unless the army already includes at least one regiment of that type (infantry or cavalry). Now flagged live by this builder for the named characters and named-crew war machines/chariots (see the warning banner above the roster) — special characters (Azhag, Grom, Skarsnik, etc.) aren't covered by this check.",
    "Common Orcs ignore panic caused by Goblins. Big'uns are just larger, fiercer Common Orcs, not a separate race.",
    "Savage Orcs are frenzied (and still ignore Goblin-caused panic even without frenzy), never wear armour beyond a shield (relying on magic tattoos instead — treated as light armour, plus a 6+ ward save that improves to 5+ if a Savage Orc Shaman joins the regiment, benefiting the Shaman too).",
    "Black Orcs are immune to animosity and quell it in any non-Black-Orc regiment a Black Orc character joins. They ignore panic from Goblins and other Orc types, and only heed the leadership of Black Orc characters or the general.",
    "War Boars grant the rider a barded-equivalent armour save with no movement penalty, but Boar Riders can never count as fast cavalry. Boars grant +2S on the charge.",
    "All Goblins (Common, Night, Forest) fear Elves unless they outnumber them two-to-one. Without any Orcs in the army, Common Goblin character Ld all increase by 1 (this includes Grom) — not enforced by the builder. Night Goblins hate Dwarfs but not Chaos Dwarfs. Forest Goblins (including Spider Riders) cross woods without movement penalty, and in an army with no Orcs at all, Forest Goblin short bows may be upgraded to poisoned arrows — offered here as a normal purchasable option without enforcing the no-Orcs condition.",
    "Night Goblin Shamans carry a magic mushroom (eat it for 1D6 extra magic cards, risking an explosive death on a failed Waaagh test) — a battle-phase mechanic, not modeled here.",
    "A Forest Goblin Shaman doesn't explode on a failed Waaagh test followed by a roll of 1-5 like other Shamans — instead he goes into a momentary trance (can't do anything that phase, including casting or dispelling) and he and his mount move 1D6\" in a random direction, leaving his regiment if he was in one. A battle-phase mechanic, not modeled here.",
    "Magic Banner Q&A: a joined character (of any type) follows the regiment's psychology and movement, so a regiment carrying the Evil Sun Banner or Stalker Banner still benefits even with, say, an Orc character attached — animosity and movement are regiment-wide effects the character shares. Other Goblin-only banners' combat/magic benefits do not extend to a joined character of a different type. Note Forest Goblins also lose their woods-movement bonus if joined by a model that doesn't have it.",
  ],
  characters: [
    {
      id: "blackorcwarlord", theme: "core", name: "Black Orc Warlord", cost: 148, stat: "Black Orc Warlord", magicItemSlots: 3, tags: ["blackOrc"],
      gearNote: "May take a shield and either light or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 33, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 167, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "blackorchero", theme: "core", name: "Black Orc Hero", cost: 89, stat: "Black Orc Hero", magicItemSlots: 2, tags: ["blackOrc"],
      gearNote: "May take a shield and either light or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 24, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 158, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "blackorcbsb", theme: "core", name: "Black Orc Battle Standard Bearer", cost: 96, stat: "Black Orc BSB", magicItemSlots: 1, restriction: "0-1", tags: ["blackOrc", "bsb"],
      gearNote: "May take light or heavy armour for free. The one item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour", "Heavy Armour"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 15, stat: "War Boar" },
      ],
    },
    {
      id: "commonorcwarlord", theme: "core", name: "Common Orc Warlord", cost: 100, stat: "Orc Warlord", magicItemSlots: 3, tags: ["commonOrc"],
      gearNote: "May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Crossbow"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 21, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
        { id: "wyvern", name: "Wyvern", cost: 155, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "commonorchero", theme: "core", name: "Common Orc Hero", cost: 60, stat: "Orc Hero", magicItemSlots: 2, tags: ["commonOrc"],
      gearNote: "May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Crossbow"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 16, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
        { id: "wyvern", name: "Wyvern", cost: 150, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "commonorcbsb", theme: "core", name: "Common Orc Battle Standard Bearer", cost: 80, stat: "Orc BSB", magicItemSlots: 1, restriction: "0-1", tags: ["commonOrc", "bsb"],
      gearNote: "May take light armour for free. The one item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 11, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "commonorcshamanlord", theme: "core", name: "Common Orc Shaman Lord (level 4)", cost: 220, stat: "Orc Shaman Lord", magicItemSlots: 4, tags: ["commonOrc", "commonOrcShaman"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "boar", name: "War Boar", cost: 0, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
        { id: "wyvern", name: "Wyvern", cost: 140, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "commonorcmastershaman", theme: "core", name: "Common Orc Master Shaman (level 3)", cost: 155, stat: "Orc Master Shaman", magicItemSlots: 3, tags: ["commonOrc", "commonOrcShaman"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "boar", name: "War Boar", cost: 0, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "commonorcshamanchampion", theme: "core", name: "Common Orc Shaman Champion (level 2)", cost: 100, stat: "Orc Shaman Champion", magicItemSlots: 2, tags: ["commonOrc", "commonOrcShaman"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "boar", name: "War Boar", cost: 0, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "commonorcshaman", theme: "core", name: "Common Orc Shaman (level 1)", cost: 45, stat: "Orc Shaman", magicItemSlots: 1, tags: ["commonOrc", "commonOrcShaman"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "boar", name: "War Boar", cost: 0, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "savageorcwarlord", theme: "core", name: "Savage Orc Warlord", cost: 130, stat: "Orc Warlord", magicItemSlots: 3, tags: ["savageOrc"],
      gearNote: "Adorned with magic tattoos (as light armour, plus a 6+/5+ ward — see army-wide rules). May take a shield for free.",
      armourGroup: { options: ["No shield (default)", "Shield"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Bow", cost: 10 },
      mounts: [
        { id: "boar", name: "War Boar", cost: 27, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 161, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "savageorchero", theme: "core", name: "Savage Orc Hero", cost: 90, stat: "Orc Hero", magicItemSlots: 2, tags: ["savageOrc"],
      gearNote: "Adorned with magic tattoos (as light armour, plus a 6+/5+ ward — see army-wide rules). May take a shield for free.",
      armourGroup: { options: ["No shield (default)", "Shield"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Bow", cost: 10 },
      mounts: [
        { id: "boar", name: "War Boar", cost: 20, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 154, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "savageorcbsb", theme: "core", name: "Savage Orc Battle Standard Bearer", cost: 90, stat: "Orc BSB", magicItemSlots: 1, restriction: "0-1", tags: ["savageOrc", "bsb"],
      gearNote: "Adorned with magic tattoos. The one item may be a magic banner.",
      mounts: [
        { id: "boar", name: "War Boar", cost: 13, stat: "War Boar" },
      ],
    },
    {
      id: "savageorcshamanlord", theme: "core", name: "Savage Orc Shaman Lord (level 4)", cost: 250, stat: "Orc Shaman Lord", magicItemSlots: 4, tags: ["savageOrc", "savageOrcShaman"],
      gearNote: "Adorned with magic tattoos. Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "boar", name: "War Boar", cost: 0, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 140, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "savageorcmastershaman", theme: "core", name: "Savage Orc Master Shaman (level 3)", cost: 185, stat: "Orc Master Shaman", magicItemSlots: 3, tags: ["savageOrc", "savageOrcShaman"],
      gearNote: "Adorned with magic tattoos. Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "boar", name: "War Boar", cost: 0, stat: "War Boar" },
      ],
    },
    {
      id: "savageorcshamanchampion", theme: "core", name: "Savage Orc Shaman Champion (level 2)", cost: 130, stat: "Orc Shaman Champion", magicItemSlots: 2, tags: ["savageOrc", "savageOrcShaman"],
      gearNote: "Adorned with magic tattoos. Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "boar", name: "War Boar", cost: 0, stat: "War Boar" },
      ],
    },
    {
      id: "savageorcshaman", theme: "core", name: "Savage Orc Shaman (level 1)", cost: 75, stat: "Orc Shaman", magicItemSlots: 1, tags: ["savageOrc", "savageOrcShaman"],
      gearNote: "Adorned with magic tattoos. Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "boar", name: "War Boar", cost: 0, stat: "War Boar" },
      ],
    },
    {
      id: "commongoblinwarlord", name: "Common Goblin Warlord", cost: 60, stat: "Goblin Warlord", magicItemSlots: 3, tags: ["commonGoblin"],
      gearNote: "May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 14, stat: "Giant Wolf" },
        { id: "chariot", name: "Wolf Chariot (for the price of the chariot)", cost: 0, stat: "Light Chariot" },
        { id: "spider", name: "Monstrous Spider", cost: 40, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinhero", name: "Common Goblin Hero", cost: 36, stat: "Goblin Hero", magicItemSlots: 2, tags: ["commonGoblin"],
      gearNote: "May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 11, stat: "Giant Wolf" },
        { id: "chariot", name: "Wolf Chariot (for the price of the chariot)", cost: 0, stat: "Light Chariot" },
        { id: "spider", name: "Monstrous Spider", cost: 37, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinbsb", name: "Common Goblin Battle Standard Bearer", cost: 60, stat: "Goblin BSB", magicItemSlots: 1, restriction: "0-1", tags: ["commonGoblin", "bsb"],
      gearNote: "May take light armour for free. The one item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour"] },
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 9, stat: "Giant Wolf" },
        { id: "chariot", name: "Wolf Chariot (for the price of the chariot)", cost: 0, stat: "Light Chariot" },
      ],
    },
    {
      id: "commongoblinshamanlord", name: "Common Goblin Shaman Lord (level 4)", cost: 170, stat: "Goblin Shaman Lord", magicItemSlots: 4, tags: ["commonGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 0, stat: "Giant Wolf" },
        { id: "chariot", name: "Wolf Chariot (for the price of the chariot)", cost: 0, stat: "Light Chariot" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinmastershaman", name: "Common Goblin Master Shaman (level 3)", cost: 120, stat: "Goblin Master Shaman", magicItemSlots: 3, tags: ["commonGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 0, stat: "Giant Wolf" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinshamanchampion", name: "Common Goblin Shaman Champion (level 2)", cost: 75, stat: "Goblin Shaman Champion", magicItemSlots: 2, tags: ["commonGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 0, stat: "Giant Wolf" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinshaman", name: "Common Goblin Shaman (level 1)", cost: 30, stat: "Goblin Shaman", magicItemSlots: 1, tags: ["commonGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 0, stat: "Giant Wolf" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinwarlord", name: "Forest Goblin Warlord", cost: 60, stat: "Goblin Warlord", magicItemSlots: 3, tags: ["forestGoblin"],
      gearNote: "May take a shield for free.",
      armourGroup: { options: ["No shield (default)", "Shield"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 13, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 40, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinhero", name: "Forest Goblin Hero", cost: 36, stat: "Goblin Hero", magicItemSlots: 2, tags: ["forestGoblin"],
      gearNote: "May take a shield for free.",
      armourGroup: { options: ["No shield (default)", "Shield"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 10, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 37, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinbsb", name: "Forest Goblin Battle Standard Bearer", cost: 60, stat: "Goblin BSB", magicItemSlots: 1, restriction: "0-1", tags: ["forestGoblin", "bsb"],
      gearNote: "The one item may be a magic banner.",
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 8, stat: "Giant Spider" },
      ],
    },
    {
      id: "forestgoblinshamanlord", name: "Forest Goblin Shaman Lord (level 4)", cost: 170, stat: "Goblin Shaman Lord", magicItemSlots: 4, tags: ["forestGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 0, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinmastershaman", name: "Forest Goblin Master Shaman (level 3)", cost: 120, stat: "Goblin Master Shaman", magicItemSlots: 3, tags: ["forestGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 0, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinshamanchampion", name: "Forest Goblin Shaman Champion (level 2)", cost: 75, stat: "Goblin Shaman Champion", magicItemSlots: 2, tags: ["forestGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 0, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinshaman", name: "Forest Goblin Shaman (level 1)", cost: 30, stat: "Goblin Shaman", magicItemSlots: 1, tags: ["forestGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 0, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinwarlord", name: "Night Goblin Warlord", cost: 60, stat: "Goblin Warlord", magicItemSlots: 3, tags: ["nightGoblin"],
      gearNote: "May take a shield for free.",
      armourGroup: { options: ["No shield (default)", "Shield"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "spider", name: "Monstrous Spider", cost: 40, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinhero", name: "Night Goblin Hero", cost: 36, stat: "Goblin Hero", magicItemSlots: 2, tags: ["nightGoblin"],
      gearNote: "May take a shield for free.",
      armourGroup: { options: ["No shield (default)", "Shield"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "spider", name: "Monstrous Spider", cost: 37, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinbsb", name: "Night Goblin Battle Standard Bearer", cost: 60, stat: "Goblin BSB", magicItemSlots: 1, restriction: "0-1", tags: ["nightGoblin", "bsb"],
      gearNote: "The one item may be a magic banner.",
    },
    {
      id: "nightgoblinshamanlord", name: "Night Goblin Shaman Lord (level 4)", cost: 180, stat: "Goblin Shaman Lord", magicItemSlots: 4, tags: ["nightGoblin", "nightGoblinShaman"],
      gearNote: "Comes with a magic mushroom (see army-wide rules). Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinmastershaman", name: "Night Goblin Master Shaman (level 3)", cost: 130, stat: "Goblin Master Shaman", magicItemSlots: 3, tags: ["nightGoblin", "nightGoblinShaman"],
      gearNote: "Comes with a magic mushroom (see army-wide rules). Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinshamanchampion", name: "Night Goblin Shaman Champion (level 2)", cost: 85, stat: "Goblin Shaman Champion", magicItemSlots: 2, tags: ["nightGoblin", "nightGoblinShaman"],
      gearNote: "Comes with a magic mushroom (see army-wide rules). Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinshaman", name: "Night Goblin Shaman (level 1)", cost: 40, stat: "Goblin Shaman", magicItemSlots: 1, tags: ["nightGoblin", "nightGoblinShaman"],
      gearNote: "Comes with a magic mushroom (see army-wide rules). Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
  ],
  regiments: [
    {
      id: "orcboyz", theme: "core", name: "Orc Boyz", perModel: 5, minSize: 5, stat: "Common Orc", command: "standard",
      note: "Light armour. Ignore panic caused by Goblins.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 1, per: "model" },
        { id: "spear", group: "melee", label: "Spears", cost: 2, per: "model" },
        { id: "halberd", group: "melee", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Common Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Common Orc Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcarrerboyz", theme: "core", name: "Orc Arrer Boyz", perModel: 7, minSize: 5, stat: "Common Orc", command: "standard",
      note: "Bows. Ignore panic caused by Goblins.",
      options: [
        { id: "crossbows", group: null, label: "Crossbows instead of bows", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Common Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Common Orc Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcboarboyz", theme: "core", name: "Orc Boar Boyz", perModel: 15, minSize: 5, stat: "Common Orc", mountStat: "War Boar", mountLabel: "War Boar", command: "standard",
      note: "Common Orcs with light armour and shields on War Boars (barded-equivalent save with no movement penalty; can't be fast cavalry; boars grant +2S on the charge). Ignore panic caused by Goblins.",
      options: [
        { id: "spear", group: null, label: "Spears", cost: 2, per: "model" },
      ],
      champion: { name: "Common Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Common Orc Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcbiguns", theme: "core", name: "Orc Big'uns", perModel: 7, minSize: 5, stat: "Orc Big'un", command: "standard",
      note: "Light armour. Ignore panic caused by Goblins.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 2, per: "model" },
        { id: "spear", group: "melee", label: "Spears", cost: 3, per: "model" },
        { id: "halberd", group: "melee", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Orc Big'un Champion", baseCost: 20, magicItemSlots: 1, stat: "Orc Big'un Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcbigunarrerboyz", theme: "core", name: "Orc Big'un Arrer Boyz", perModel: 9, minSize: 5, stat: "Orc Big'un", command: "standard",
      note: "Bows. Ignore panic caused by Goblins.",
      options: [
        { id: "crossbows", group: null, label: "Crossbows instead of bows", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Orc Big'un Champion", baseCost: 20, magicItemSlots: 1, stat: "Orc Big'un Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcbigunboarboyz", theme: "core", name: "Orc Big'un Boar Boyz", perModel: 18, minSize: 5, stat: "Orc Big'un", mountStat: "War Boar", mountLabel: "War Boar", command: "standard",
      note: "Big'uns with light armour and shields on War Boars (barded-equivalent save, no fast cavalry, +2S charge). Ignore panic caused by Goblins.",
      options: [
        { id: "spear", group: null, label: "Spears", cost: 2, per: "model" },
      ],
      champion: { name: "Orc Big'un Champion", baseCost: 20, magicItemSlots: 1, stat: "Orc Big'un Champion", tags: ["commonOrc"] },
    },
    {
      id: "savageorcs", theme: "core", name: "Savage Orcs", perModel: 8, minSize: 5, stat: "Savage Orc", command: "standard",
      note: "Magic tattoos (see army-wide rules). Frenzied; still ignore Goblin panic even without frenzy.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 1, per: "model" },
        { id: "spear", group: "melee", label: "Spears", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 4, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Savage Orc Champion", baseCost: 30, magicItemSlots: 1, stat: "Savage Orc Champion", tags: ["savageOrc"] },
    },
    {
      id: "savageorcarrerboyz", theme: "core", name: "Savage Orc Arrer Boyz", perModel: 10, minSize: 5, stat: "Savage Orc", command: "standard",
      note: "Magic tattoos and bows. Frenzied; still ignore Goblin panic even without frenzy.",
      champion: { name: "Savage Orc Champion", baseCost: 30, magicItemSlots: 1, stat: "Savage Orc Champion", tags: ["savageOrc"] },
    },
    {
      id: "savageorcboarboyz", theme: "core", name: "Savage Orc Boar Boyz", perModel: 20, minSize: 5, stat: "Savage Orc", mountStat: "War Boar", mountLabel: "War Boar", command: "standard",
      note: "Savage Orcs with magic tattoos and shields on War Boars (barded-equivalent save, no fast cavalry, +2S charge). Frenzied; still ignore Goblin panic even without frenzy.",
      options: [
        { id: "spear", group: null, label: "Spears", cost: 3, per: "model" },
        { id: "bows", group: null, label: "Bows", cost: 2, per: "model" },
      ],
      champion: { name: "Savage Orc Champion", baseCost: 30, magicItemSlots: 1, stat: "Savage Orc Champion", tags: ["savageOrc"] },
    },
    {
      id: "blackorcs", theme: "core", name: "Black Orcs", perModel: 9, minSize: 5, stat: "Black Orc", command: "standard",
      note: "Light armour. Immune to animosity; ignore panic from Goblins and other Orc types; only heed Black Orc / general leadership.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 2, per: "model" },
        { id: "spear", group: "melee", label: "Spears", cost: 2, per: "model" },
        { id: "halberd", group: "melee", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Black Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Black Orc Champion", tags: ["blackOrc"] },
    },
    {
      id: "commongoblininfantry", name: "Common Goblin Infantry", perModel: 2.5, minSize: 5, stat: "Common Goblin", command: "standard", tags: ["commonGoblin"],
      note: "Fear Elves unless outnumbering them two-to-one.",
      options: [
        { id: "spear", group: "melee", label: "Spears", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "shortbows", group: null, label: "Short bows", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
      ],
      champion: { name: "Common Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Common Goblin Champion", tags: ["commonGoblin"] },
    },
    {
      id: "commongoblinwolfriders", name: "Common Goblin Wolf Riders", perModel: 9, minSize: 5, stat: "Common Goblin", mountStat: "Giant Wolf", mountLabel: "Giant Wolf", command: "fastCavalry", tags: ["commonGoblin"],
      note: "Fear Elves unless outnumbering them two-to-one. Fast cavalry.",
      options: [
        { id: "spear", group: null, label: "Spears", cost: 1, per: "model" },
        { id: "shortbows", group: null, label: "Short bows", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Common Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Common Goblin Champion", tags: ["commonGoblin"] },
    },
    {
      id: "forestgoblinspiderriders", name: "Forest Goblin Spider Riders", perModel: 8, minSize: 5, stat: "Forest Goblin", mountStat: "Giant Spider", mountLabel: "Giant Spider", command: "fastCavalry", tags: ["forestGoblin"],
      note: "Forest Goblins on Giant Spiders (poisonous +1S attacks, cross terrain freely). Fear Elves unless outnumbering them two-to-one. Fast cavalry.",
      options: [
        { id: "spear", group: null, label: "Spears", cost: 1, per: "model" },
        { id: "shortbows", group: null, label: "Short bows", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "poisonedarrows", group: null, label: "Poisoned arrows — only for models armed with short bows, +1 strength", cost: 1, per: "model", theme: "forestgoblins" },
      ],
      champion: { name: "Forest Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Forest Goblin Champion", tags: ["forestGoblin"] },
    },
    {
      id: "forestgoblininfantry", name: "Forest Goblin Infantry", perModel: 2.5, minSize: 5, stat: "Forest Goblin", command: "standard", tags: ["forestGoblin"],
      note: "Fear Elves unless outnumbering them two-to-one. Cross woods without movement penalty.",
      options: [
        { id: "spear", group: "melee", label: "Spears", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "shortbows", group: "melee", label: "Short bows", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields, only if not armed with short bows", cost: 0.5, per: "model" },
        { id: "poisonedarrows", group: null, label: "Poisoned arrows — only for models armed with short bows, +1 strength", cost: 1, per: "model", theme: "forestgoblins" },
      ],
      champion: { name: "Forest Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Forest Goblin Champion", tags: ["forestGoblin"] },
    },
    {
      id: "nightgoblininfantry", name: "Night Goblin Infantry", perModel: 2.5, minSize: 5, stat: "Night Goblin", command: "standard", tags: ["nightGoblin"],
      note: "Fear Elves unless outnumbering them two-to-one. Hate Dwarfs (not Chaos Dwarfs). May conceal up to 3 hidden Fanatics — released and scattering wildly the moment an enemy comes within 8\" (see the full rules in the book); Fanatics don't count toward the regiment's 50pt minimum.",
      options: [
        { id: "spear", group: "melee", label: "Spears", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "shortbows", group: "melee", label: "Short bows", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields, only if not armed with short bows", cost: 0.5, per: "model" },
        { id: "madcap", group: null, label: "One concealed Fanatic gets a Mad Cap Mushroom (2D6 S5 hits instead of 1D6) — requires at least one Fanatic below", cost: 20, per: "flat" },
      ],
      extraOption: { label: "Hidden Night Goblin Fanatics", cost: 30, max: 3 },
      champion: { name: "Night Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Night Goblin Champion", tags: ["nightGoblin"] },
    },
    {
      id: "nightgoblinsquighoppers", name: "Night Goblin Squig-Hoppers", perModel: 25, minSize: 1, stat: "Cave Squig", command: "none",
      note: "Cannot take a standard bearer, musician, or champion, and no characters may join. All deploy within 2\" of each other, then each acts as an independent unit — immune to psychology, no animosity tests, bounces 2D6\" each turn, auto-hits anything it bounces onto (the rider never fights). See the full bounce/scatter rules in the book.",
    },
    {
      id: "nightgoblinsquighunters", name: "Night Goblin Squig-Hunters", perModel: 0, minSize: 4, kind: "composite", command: "none",
      note: "Cannot take a standard bearer, musician, or champion, and no characters may join. Needs at least 1 Night Goblin (with a prodder) per 3 Cave Squigs to start; if Squigs ever outnumber that ratio, the excess go wild (bounce like a Squig-Hopper, in a random direction). Moves at the Night Goblins' M4 and uses their Ld5. While in ranks, the Squigs are unbreakable; if the regiment panics/breaks, only the Night Goblins flee — the Squigs go wild instead.",
      composition: [
        { id: "goblin", label: "Night Goblins (with prodders)", cost: 6, stat: "Night Goblin" },
        { id: "squig", label: "Cave Squigs", cost: 12, stat: "Cave Squig" },
      ],
    },
    {
      id: "nightgoblinnettersclubbers", name: "Night Goblin Netters and Clubbers", perModel: 6, minSize: 5, stat: "Night Goblin", command: "standard", tags: ["nightGoblin"],
      note: "Nets and clubs — treated as double handed weapons that strike first (the net effect stacks with itself, so they strike first twice over, not just cancelling the double-handed-weapon strike-last penalty).",
      champion: { name: "Night Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Night Goblin Champion", tags: ["nightGoblin"] },
    },
    {
      id: "trolls", name: "Trolls", perModel: 40, minSize: 3, stat: "Trolls", command: "none",
      note: "Must be River Trolls (free), Stone Trolls (free), or Chaos Trolls (+5pt/model). Cannot take a standard bearer, musician, or champion. Monstrous, stupid, immune to psychology, cause fear, regenerate on 4+; may vomit instead of attacking (auto-hit S5, no save, 1D3 wounds). River: crosses water freely, enemies -1 to hit in melee (living only). Stone: 2+ natural dispel. Chaos: +1 Attack.",
      options: [
        { id: "chaostrolls", group: null, label: "Chaos Trolls, +1 Attack", cost: 5, per: "model" },
      ],
    },
    {
      id: "snotlings", name: "Snotlings", perModel: 15, minSize: 5, stat: "Snotling Base", command: "none", restriction: "0-1",
      note: "Priced per 40x40mm base. Cannot take a standard bearer, musician, or be joined by characters, but still counts as a full rank-and-file regiment (front/flank/rear, can claim/cancel rank bonus). Never causes panic if destroyed/fleeing. Mimics the nearest friendly unit within 12\" (idles if none, charges/rushes if that unit fights, flees or turns frenzied alongside it). Unbreakable in combat as long as the nearest friendly unit isn't fleeing.",
    },
    {
      id: "ogremercenaries", name: "Ogre Mercenaries", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous",
      note: "Light armour. Monstrous regiment. Causes fear.",
      options: [
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion" },
    },
  ],
  chariotsMonsters: [
    {
      id: "giants", name: "Giants", perUnit: 200, stat: "Giant (Orc)", kind: "quantity", countsAsFirstRegiment: true,
      note: "Follows the main-rulebook Giant rules. The first Giant counts toward Regiments; further ones count toward Monsters.",
    },
    {
      id: "goblinwolfchariots", name: "Goblin Wolf Chariot", perUnit: 44, stat: "Light Chariot", kind: "chariot", crewArmourFixed: "Light armour",
      note: "Light Chariot pulled by two Giant Wolves, crewed by two Common Goblins with light armour, spears, shields and short bows (5+ combined save).",
      extraCrewCost: 6, extraCrewLabel: "extra Common Goblin crew", extraSteedCost: 8, extraSteedLabel: "extra Giant Wolves",
      scythedWheelsCost: 10, commanderCost: 15, commanderLabel: "One crewman is a Common Goblin Champion", commanderMagicItemSlots: 1,
    },
    {
      id: "orcboarchariots", theme: "core", name: "Orc Boar Chariot", perUnit: 52, stat: "Heavy Chariot", kind: "chariot",
      note: "Heavy Chariot pulled by two War Boars, crewed by two Common Orcs with light armour, spears, shields and bows (4+ combined save).",
      extraCrewCost: 8, extraCrewLabel: "extra Common Orc crew", extraSteedCost: 5, extraSteedLabel: "extra War Boars",
      scythedWheelsCost: 20, commanderCost: 30, commanderLabel: "One crewman is a Common Orc Champion", commanderMagicItemSlots: 1,
    },
    {
      id: "spiderswarm", name: "Spider Swarm", perUnit: 40, stat: "Spider Swarm", kind: "quantity", restriction: "0-1",
      note: "Requires at least one Forest Goblin regiment (Infantry or Spider Riders) in the army. Follows the main-rulebook Swarm rules. Priced per base.",
    },
    {
      id: "monstrousspiders", name: "Monstrous Spiders", perUnit: 40, stat: "Monstrous Spider", kind: "quantity",
      note: "A Monstrous Spider is a small monster — follows the main-rulebook rules for Monstrous Spiders.",
    },
    {
      id: "gargantuanspider", name: "Gargantuan Spider", perUnit: 225, stat: "Gargantuan Spider", kind: "quantity", restriction: "0-1", maxQty: 1,
      note: "Only summonable if the general is a Forest Goblin and the army includes a Forest Goblin Shaman. Large monster, causes terror, 4+ armour save, immune to psychology, poisonous (+1S vs living). Too large to be a forester or scale buildings like regular spiders. Carries a howdah of 8 Forest Goblins with poisoned short bows shooting in a 360° arc with no movement penalty; damage always goes to the spider, and its death slays the whole model.",
    },
    {
      id: "spearchukkasgoblins", name: "Spear Chukkas (Goblin crew)", perUnit: 42.5, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Bolt thrower with three Common Goblin crewmen.",
      extraCrewCost: 2.5, extraCrewMax: 2, extraCrewLabel: "extra Common Goblin crew",
    },
    {
      id: "spearchukkasorcs", theme: "core", name: "Spear Chukkas (Orc crew)", perUnit: 50, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Bolt thrower with three Common Orc crewmen.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Common Orc crew",
    },
    {
      id: "smallrocklobbersgoblins", name: "Small Rock Lobbers (Goblin crew)", perUnit: 72.5, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Stone Thrower with three Common Goblin crewmen.",
      extraCrewCost: 2.5, extraCrewMax: 2, extraCrewLabel: "extra Common Goblin crew",
    },
    {
      id: "smallrocklobbersorcs", theme: "core", name: "Small Rock Lobbers (Orc crew)", perUnit: 80, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Stone Thrower with three Common Orc crewmen.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Common Orc crew",
    },
    {
      id: "largerocklobbersgoblins", name: "Large Rock Lobbers (Goblin crew)", perUnit: 87.5, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Stone Thrower with three Common Goblin crewmen.",
      extraCrewCost: 2.5, extraCrewMax: 2, extraCrewLabel: "extra Common Goblin crew",
    },
    {
      id: "largerocklobbersorcs", theme: "core", name: "Large Rock Lobbers (Orc crew)", perUnit: 95, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Stone Thrower with three Common Orc crewmen.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Common Orc crew",
    },
    {
      id: "goblindoomdivers", name: "Goblin Doom Divers", perUnit: 67.5, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "An endless supply of Common Goblins eager to fly (counts as three Goblin crew). Shoots like a large stone thrower but with a 2\" template; only the model dead-center of the template suffers a S10 hit (1D6 wounds, no save), others under the template take an ordinary S5 hit. Scatter/steering and misfire rules apply — see the book.",
    },
    {
      id: "snotlingpumpwagons", name: "Snotling Pump Wagon", perUnit: 50, stat: "Snotling Base", kind: "quantity",
      note: "A scythed light chariot crewed by Snotlings. Unbreakable, never causes panic if destroyed. Moves 3D6\" the first turn, 2D6\" afterward, self-directed each compulsory movement phase (scatters on a double/triple). Counts as charging on contact (disengages immediately if it hits a friendly unit); deals 2D6+2 S4 impact hits instead of the usual 1D6 for a light chariot.",
    },
  ],
  specialCharacters: [
    { id: "azhag", theme: "core", name: "Azhag the Slaughterer", cost: 450, stat: "Azhag the Slaughterer", role: "Common Orc Warlord", tags: ["wizard"],
      note: "Wears light armour, carries a shield, rides a Wyvern. Wears the Crown of Sorcery, making him a level 3 wizard (Dark Magic) who may wear armour and still cast; he never needs to take Waaagh tests. No Orcs & Goblins regiment within 12\" of him needs to test animosity.", extraMagicItemSlots: 2, magicItemCategoryFilter: NON_ARCANE_CATEGORIES },
    { id: "gorfang", theme: "core", name: "Gorfang Rotgut", cost: 90, stat: "Gorfang Rotgut", role: "Common Orc Hero",
      note: "Hates Dwarfs — and so does any Common Orc regiment he joins (Big'uns included). Has the same mount/weapon/armour options as a normal Common Orc Hero.", extraMagicItemSlots: 2,
      mounts: [
        { id: "boar", name: "War Boar", cost: 16 },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0 },
        { id: "wyvern", name: "Wyvern", cost: 150 },
      ] },
    { id: "skarsnik", name: "Skarsnik, Warlord of the Eight Peaks", cost: 200, stat: "Skarsnik of the Eight Peaks", role: "Night Goblin Warlord",
      note: "Always accompanied by Gobbla, a giant Cave Squig, who moves and fights alongside him (if Skarsnik dies, roll on the Monster Reaction Table for Gobbla; if acting alone Gobbla moves 2D6\"/turn). Carries Skarsnik's Prodder for free.", extraMagicItemSlots: 2 },
    { id: "oglok", theme: "core", name: "Oglok the 'Orrible", cost: 85, stat: "Oglok the 'Orrible", role: "Common Orc Hero",
      note: "Has the same mount/weapon/armour options as a normal Common Orc Hero.", extraMagicItemSlots: 2,
      mounts: [
        { id: "boar", name: "War Boar", cost: 16 },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0 },
        { id: "wyvern", name: "Wyvern", cost: 150 },
      ] },
    { id: "gorbad", theme: "core", name: "Gorbad Ironclaw", cost: 250, stat: "Gorbad Ironclaw", role: "Common Orc Warlord",
      note: "Wears light armour, carries a shield and Morgor the Mangler. Rides a War Boar.", extraMagicItemSlots: 2 },
    { id: "grom", name: "Grom the Paunch of Misty Mountain", cost: 225, stat: "Grom the Paunch", role: "Common Goblin Warlord",
      note: "Regenerates on 4+. Wears light armour, carries a shield and the Axe of Grom. Rides a heavy scythed Wolf Chariot (100x75mm base) with three wolves and two Common Goblin crew besides Grom. A Common Goblin Battle Standard Bearer (Niblit) may join as a fourth crew member, purchased separately as normal.", extraMagicItemSlots: 2 },
    { id: "morglum", theme: "core", name: "Morglum Necksnapper", cost: 175, stat: "Morglum Necksnapper", role: "Black Orc Warlord",
      note: "Immune to psychology, as is any regiment he joins. Has the same mount/weapon/armour options as a normal Black Orc Warlord.", extraMagicItemSlots: 3,
      mounts: [
        { id: "boar", name: "War Boar", cost: 33 },
        { id: "wyvern", name: "Wyvern", cost: 167 },
      ] },
  ],
};

const DOGS_OF_WAR_MAGIC_ITEMS = [
  // Human items (drawn from the Empire, Kislev, and Bretonnia army books — Kislev isn't modeled in this builder yet)
  { id: "dow-swordofjustice", name: "Sword of Justice", cost: 50, cat: "weapon", desc: "Human only. Re-roll missed to-hit rolls. No armour save allowed.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-fearfrost", name: "Fearfrost", cost: 60, cat: "weapon", desc: "Human only. No armour save. 1 wound = 1D6 wounds.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-dragonbow", name: "Dragon Bow", cost: 25, cat: "weapon", desc: "Human only. Bow. Fires three magical shots per shooting phase, range 36\", S5.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-swordoflucan", name: "Sword of Lucan", cost: 65, cat: "weapon", desc: "Human only. No saves of any kind allowed (neither armour nor ward).", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-helmmandred", name: "Helm of Count Mandred", cost: 10, cat: "armour", desc: "Human only. Bearer hates Skaven, and Skaven fear the bearer. +1 armour save.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-armourtarnus", name: "Armour of Tarnus", cost: 25, cat: "armour", desc: "Human wizards only. Full plate armour — may cast while wearing it. Re-roll armour saves.", restrictedTo: [{ tags: ["human", "wizard"] }] },
  { id: "dow-iconmagnus", name: "Icon of Magnus", cost: 10, cat: "enchanted", desc: "Human only. Bearer and bearer's regiment are immune to fear.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-talismanulric", name: "Talisman of Ulric", cost: 15, cat: "enchanted", desc: "Human only. Bearer recovers one wound at the start of each player turn.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-laurels", name: "Laurels of Victory", cost: 25, cat: "enchanted", desc: "Human only. Each wound scored by the bearer/mount in a challenge counts double toward combat resolution.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-ringofluccina", name: "Ring of Luccina", cost: 20, cat: "enchanted", desc: "Human only. The bearer and his regiment automatically succeed at any attempts to rally.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-shieldofmyrmidia", name: "Shield of Myrmidia", cost: 25, cat: "enchanted", desc: "Human only. All melee opponents attacking the bearer lose two attacks.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-acolytes", name: "Acolytes", cost: 10, cat: "arcane", desc: "Human wizards only, foot only. Casts one spell per phase for one less power card. Costs a magic item slot but can't be nullified.", restrictedTo: [{ tags: ["human", "wizard"] }] },
  { id: "dow-antlertotem", name: "Antler Totem", cost: 15, cat: "arcane", desc: "Human wizards only. Wizard using Amber or Jade magic may choose spells.", restrictedTo: [{ tags: ["human", "wizard"] }] },
  { id: "dow-devotion", name: "Standard of Devotion", cost: 20, cat: "banner", desc: "Human regiments only. The regiment is immune to panic.", restrictedTo: [{ tags: ["human"] }] },
  { id: "dow-defiance", name: "Banner of Defiance", cost: 80, cat: "banner", desc: "Human regiments only. Double rank bonus (max +6). Never pursues, overruns, or flees voluntarily. Nullifies hatred/frenzy in the regiment.", restrictedTo: [{ tags: ["human"] }] },
  // Sea Elf items (drawn from the High Elf army book)
  { id: "dow-bowoldworld", name: "Bow of the Old-World Colonies", cost: 20, cat: "weapon", desc: "Sea Elf only. Longbow. May shoot as many shots as bearer has attacks, at bearer's strength.", restrictedTo: [{ tags: ["seaelf"] }] },
  { id: "dow-moonbow", name: "Moonbow", cost: 40, cat: "weapon", desc: "Sea Elf only. Longbow. S6, no armour save, 1 wound=1D3. Penetrates like a bolt thrower shot.", restrictedTo: [{ tags: ["seaelf"] }] },
  { id: "dow-armourcaledor", name: "Armour of Caledor", cost: 40, cat: "armour", desc: "Sea Elf only. Dragon Armour. +1 armour save, 5+ ward save. Immune to fire-based attacks.", restrictedTo: [{ tags: ["seaelf"] }] },
  { id: "dow-goldencrown", name: "Golden Crown of Atrazar", cost: 100, cat: "armour", desc: "Sea Elf only. 3+ ward save.", restrictedTo: [{ tags: ["seaelf"] }] },
  { id: "dow-stoneofmidnight", name: "Stone of Midnight", cost: 100, cat: "enchanted", desc: "Sea Elf only, foot only. Melee attacks against the bearer must re-roll successful to-hit and to-wound rolls.", restrictedTo: [{ tags: ["seaelf"] }] },
  { id: "dow-cloakofstars", name: "Cloak of Stars", cost: 25, cat: "enchanted", desc: "Sea Elf only. Hits against the bearer have S reduced by 2. First spell cast directly at the bearer/regiment is auto-dispelled unless Total Power.", restrictedTo: [{ tags: ["seaelf"] }] },
  { id: "dow-regalstandard", name: "Regal Standard", cost: 0, cat: "banner", desc: "Free. Sea Elf regiments only. May move and shoot bows/longbows without the -1 moving penalty.", restrictedTo: [{ tags: ["seaelf"] }] },
  // Dwarf items (runic, drawn from the Dwarf army book)
  { id: "dow-axeofgrimnir", name: "The Axe of Grimnir", cost: 100, cat: "weapon", desc: "Dwarf only. Always wounds on 2+. No armour save. 1 wound = 1D3 wounds (1D6 vs monstrous).", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runestriking", name: "Rune of Striking", cost: 10, cat: "weapon", desc: "Dwarf only. Weapon Rune. +2 WS (may be taken more than once).", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runefury", name: "Rune of Fury", cost: 10, cat: "weapon", desc: "Dwarf only. Weapon Rune. +1 attack (may be taken more than once).", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runecleaving", name: "Rune of Cleaving", cost: 15, cat: "weapon", desc: "Dwarf only. Weapon Rune. +1 strength (may be taken more than once).", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runesmiting", name: "Rune of Smiting", cost: 25, cat: "weapon", desc: "Dwarf only. Weapon Rune. 1 wound = 1D6 wounds.", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-mradamant", name: "Master Rune of Adamant", cost: 30, cat: "armour", desc: "Dwarf only. Master Armour Rune. +2 armour save.", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runeiron", name: "Rune of Iron", cost: 30, cat: "armour", desc: "Dwarf only. Armour Rune. +1 toughness (may be taken more than once).", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runeresistance", name: "Rune of Resistance", cost: 30, cat: "armour", desc: "Dwarf only. Armour Rune. 5+ ward save (4+ if taken twice; can't be taken thrice).", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-bugmanstankard", name: "Bugman's Tankard", cost: 10, cat: "enchanted", desc: "Dwarf only. The bearer or one model in his unit recovers one lost wound after a phase ends. Three uses.", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-goldensceptre", name: "Golden Sceptre of Nogrim", cost: 50, cat: "enchanted", desc: "Dwarf only. +1 armour save to the bearer and his unit.", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runeluck", name: "Rune of Luck", cost: 20, cat: "enchanted", desc: "Dwarf only. Talismanic Rune. Re-roll one personal die roll, one use (may be taken several times).", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runewarding", name: "Rune of Warding", cost: 25, cat: "banner", desc: "Dwarf only. Rune of Protection. Natural dispel 4+ (multiple instances: roll more dice, take highest).", restrictedTo: [{ tags: ["dwarf"] }] },
  { id: "dow-runefear", name: "Rune of Fear", cost: 40, cat: "banner", desc: "Dwarf only. Rune of Protection. Causes fear.", restrictedTo: [{ tags: ["dwarf"] }] },
  // Halfling items (drawn from the Empire army book)
  { id: "dow-hallucent", name: "Icon of Magnus (Halfling)", cost: 10, cat: "enchanted", desc: "Halfling only. Bearer and bearer's regiment are immune to fear.", restrictedTo: [{ tags: ["halfling"] }] },
  { id: "dow-hallucky", name: "Talisman of Ulric (Halfling)", cost: 15, cat: "enchanted", desc: "Halfling only. Bearer recovers one wound at the start of each player turn.", restrictedTo: [{ tags: ["halfling"] }] },
];

const DOGS_OF_WAR = {
  key: "dogsofwar",
  loreOptions: [...COLLEGE_LORES],
  name: "Dogs of War",
  tagline: "A mercenary brotherhood — every sword, spear, and cannon sold to the highest bidder",
  magicItems: [...COMMON_MAGIC_ITEMS, ...DOGS_OF_WAR_MAGIC_ITEMS],
  compositionRules: [
    { kind: "requiresAtLeastOne", label: "At least one Human Old World regiment", refs: [
      { list: "regiments", id: "humanfoot", name: "Human Foot Soldiers" },
      { list: "regiments", id: "elitehumanfoot", name: "Elite Human Foot Soldiers" },
      { list: "regiments", id: "cavalryretainers", name: "Human Cavalry Retainers" },
      { list: "regiments", id: "humanknights", name: "Human Knights" },
    ] },
    { kind: "requiresIfPresent", label: "Ogre Mercenary Hero", trigger: [{ list: "characters", id: "ogremercenaryhero", name: "Ogre Mercenary Hero" }], requires: [{ list: "regiments", id: "ogremercenaries", name: "Ogre Mercenaries" }] },
    { kind: "requiresIfPresent", label: "Halfling Hot-Pot", trigger: [{ list: "chariots", id: "halflinghotpot", name: "Halfling Hot-Pot" }], requires: [{ list: "regiments", id: "halflingmilitia", name: "Halfling Militia" }, { list: "regiments", id: "halflingbowmen", name: "Halfling Bowmen" }] },
  ],
  armyWideRules: [
    "A Dogs of War army fights for a mercenary Warlord based in the Old World, typically (but not necessarily) of Tilean origin. The General and the Paymaster must both be Human Characters, and the army must include at least one Human Regiment of Old World origin (this excludes Norse — Norsca isn't considered part of the Old World). The regiment requirement is now flagged live by this builder (see the warning banner above the roster); the General-must-be-Human part isn't, since the app doesn't track a designated general.",
    "Human Old World Regiments are the mainstay: the number of such regiments caps the maximum number of any other single regiment type or war machine (e.g. two Human Old World regiments allow up to two Halfling Bowmen, up to two Cannons, and so on, each counted separately). This builder does not hard-enforce that cap — track it yourself.",
    "Paymasters, not Battle Standard Bearers: the regiment containing the Paymaster (only one may be fielded) is unbreakable while he lives, and Dogs of War units within 12\" of him get +1 Ld. Unlike a BSB he suffers no equipment restrictions, but he can never be mounted.",
    "Regimental Banners and Champion Items: a Sea Elf regiment's champion may take High Elf magic items/banners, Dwarfs may take Dwarf runic items, Halflings may take from the Empire, and Humans may take from the Empire, Kislev, and Bretonnia (items only, not Virtues). Only unit champions may take items from other army books — independent Dogs of War characters (Lord/Hero/Paymaster/Wizards) cannot, per the rules as written. The source text doesn't include a dedicated Dogs of War-only item list, so as a practical simplification this builder lets independent Human and Wizard characters draw from the same Human item pool as Human champions — adjust to taste if you're playing strictly RAW.",
    "Ogre magic items (from the Ogre army book), Norse magic items (from the Norse army book), and Kislev magic items aren't modeled in this builder yet, since those army books aren't built out here. Ogre and Norse characters/champions have their magic item slots but no dedicated pool to pick from — track any such items on paper.",
  ],
  characters: [
    {
      id: "mercenarylord", name: "Human Mercenary Lord", cost: 110, stat: "Human Mercenary Lord", magicItemSlots: 3, tags: ["human"],
      gearNote: "May take a shield and either light armour or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Hand gun", "Pistol", "Two pistols"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 20, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 55, stat: "Pegasus" },
      ],
    },
    {
      id: "mercenaryhero", name: "Human Mercenary Hero", cost: 60, stat: "Empire Hero", magicItemSlots: 2, tags: ["human"],
      gearNote: "May take a shield and either light armour or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Hand gun", "Pistol", "Two pistols"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 15, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 50, stat: "Pegasus" },
      ],
    },
    {
      id: "ogremercenaryhero", name: "Ogre Mercenary Hero", cost: 171, stat: "Ogre Mercenary Hero", magicItemSlots: 2, tags: ["ogre"],
      gearNote: "Your army must include an Ogre Mercenaries regiment to field this Hero (now flagged live by this builder). Ogres are monstrous models that cause fear. May take light armour or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Light Armour", "Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Halberd", "Flail", "Double handed weapon"] },
    },
    {
      id: "paymaster", name: "Human Mercenary Paymaster", cost: 80, stat: "Empire BSB", magicItemSlots: 1, restriction: "0-1", tags: ["human"],
      gearNote: "The Dogs of War equivalent of a Battle Standard Bearer: carries the Pay Chest. His regiment is unbreakable while he lives, and Dogs of War units within 12\" get +1 Ld. Suffers no restriction on equipment, but can never be mounted. May take a shield and either light armour or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Hand gun", "Pistol", "Two pistols"] },
    },
    {
      id: "wizardlord", name: "Human Hireling Wizard Lord (level 4)", cost: 240, stat: "Wizard Lord", magicItemSlots: 4, tags: ["human", "wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "masterwizard", name: "Human Hireling Master Wizard (level 3)", cost: 170, stat: "Master Wizard", magicItemSlots: 3, tags: ["human", "wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizardchampion", name: "Human Hireling Wizard Champion (level 2)", cost: 110, stat: "Wizard Champion", magicItemSlots: 2, tags: ["human", "wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizard", name: "Human Hireling Wizard (level 1)", cost: 50, stat: "Wizard", magicItemSlots: 1, tags: ["human", "wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take Barding free)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
  ],
  regiments: [
    {
      id: "humanfoot", name: "Human Foot Soldiers", perModel: 5, minSize: 5, stat: "State Trooper", command: "standard", tags: ["human"],
      note: "Human Mercenary Soldiers.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapon", cost: 1, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 1, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapon", cost: 2, per: "model" },
        { id: "pikes", group: "melee", label: "Pikes", cost: 3, per: "model" },
        { id: "longbows", group: "missile", label: "Longbows — light armour only, no other weapons", cost: 2, per: "model" },
        { id: "crossbows", group: "missile", label: "Crossbows — light armour only, no other weapons", cost: 4, per: "model" },
        { id: "handguns", group: "missile", label: "Hand guns — light armour only, no other weapons", cost: 4, per: "model" },
        { id: "pavise", group: null, label: "Pavise for crossbowmen — 5+ save vs shooting (4+ combined with light armour)", cost: 1, per: "model" },
      ],
      champion: { name: "Human Champion", baseCost: 20, magicItemSlots: 1, stat: "Fighter Champion", tags: ["human"] },
    },
    {
      id: "elitehumanfoot", name: "Elite Human Foot Soldiers", perModel: 7, minSize: 5, stat: "Knight (Empire)", command: "standard", tags: ["human"],
      note: "Elite Human Mercenary Soldiers with light armour.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "heavyarmour", group: null, label: "Upgrade to heavy armour", cost: 2, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "pikes", group: "melee", label: "Pikes", cost: 4, per: "model" },
      ],
      champion: { name: "Elite Human Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["human"] },
    },
    {
      id: "cavalryretainers", name: "Human Cavalry Retainers", perModel: 9, minSize: 5, stat: "State Trooper", mountStat: "Normal Horse", mountLabel: "Normal Horse", command: "fastCavalry", fastCavalryToggleOption: { group: "armour", value: "heavyarmour" }, tags: ["human"],
      note: "Human Mercenary Soldiers riding normal horses. Fast cavalry — lost if heavy armour is taken.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "armour", group: "armour", label: "Light armour", cost: 1, per: "model" },
        { id: "heavyarmour", group: "armour", label: "Heavy armour — loses fast cavalry", cost: 4, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 1, per: "model" },
        { id: "lances", group: "melee", label: "Lances", cost: 3, per: "model" },
        { id: "bows", group: "missile", label: "Bows", cost: 2, per: "model" },
        { id: "crossbows", group: "missile", label: "Crossbows", cost: 4, per: "model" },
      ],
      champion: { name: "Human Champion", baseCost: 20, magicItemSlots: 1, stat: "Fighter Champion", tags: ["human"] },
    },
    {
      id: "humanknights", name: "Human Knights", perModel: 20, minSize: 5, stat: "Knight (Empire)", mountStat: "Warhorse", mountLabel: "Warhorse", command: "standard", tags: ["human"],
      note: "Elite Human Soldiers with heavy armour, shields, and lances riding Warhorses.",
      options: [
        { id: "barding", group: null, label: "Barding", cost: 3, per: "model" },
      ],
      champion: { name: "Elite Human Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["human"] },
    },
    {
      id: "norsehuscarls", name: "Norse Huscarls", perModel: 8, minSize: 5, stat: "Norse Huscarls", command: "standard", tags: ["norse"],
      note: "Huscarls with light armour. Fighting with shields, may form a Shieldwall as a charge reaction (-1 to hit the charging enemy; forfeits fighting with double handed weapons that combat).",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
      ],
      champion: { name: "Norse Champion", baseCost: 20, magicItemSlots: 1, stat: "Norse Champion", tags: ["norse"] },
    },
    {
      id: "seaelves", name: "Sea Elf Mercenaries", perModel: 10, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard", tags: ["seaelf"],
      note: "Elven Warriors with light armour, shields, spear and bows.",
      options: [
        { id: "longbows", group: null, label: "Upgrade bows to longbows", cost: 2, per: "model" },
      ],
      champion: { name: "Sea Elf Champion", baseCost: 20, magicItemSlots: 1, stat: "Knightly Champion", tags: ["seaelf"] },
    },
    {
      id: "halflingmilitia", name: "Halfling Militia", perModel: 2.5, minSize: 5, stat: "Halfling", command: "standard", tags: ["halfling"],
      note: "Halflings with light armour and shields. Foresters — move through woods without penalty.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 0.5, per: "model" },
      ],
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion", tags: ["halfling"] },
    },
    {
      id: "halflingbowmen", name: "Halfling Bowmen", perModel: 7, minSize: 5, stat: "Halfling", command: "skirmisher", tags: ["halfling"],
      note: "Halflings with bows. May skirmish; foresters even if not skirmishing.",
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion", tags: ["halfling"] },
    },
    {
      id: "ogremercenaries", name: "Ogre Mercenaries", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous", tags: ["ogre"],
      note: "Ogres with light armour. Monstrous models that cause fear.",
      options: [
        { id: "heavyarmour", group: null, label: "Swap light for heavy armour", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion", tags: ["ogre"] },
    },
    {
      id: "dwarfmercenaries", name: "Dwarf Mercenary Warriors", perModel: 8, minSize: 5, stat: "Dwarf Soldier", command: "standard", tags: ["dwarf"],
      note: "Dwarfs with light armour.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "heavyarmour", group: null, label: "Swap light for heavy armour", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "crossbows", group: "missile", label: "Crossbows or hand guns — only if taking no other weapons/shields", cost: 4, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion", tags: ["dwarf"] },
    },
    // --- Regiments of Renown: unique regiments, one of each per army, come with their leader baked into the base cost ---
    {
      id: "marksmenmiragliano", name: "Marksmen of Miragliano", stat: "Marksmen of Miragliano", command: "standard", restriction: "0-1",
      tieredPricing: { baseCost: 130, baseSize: 9, extraPerModel: 11 },
      note: "Regiment of Renown. At least nine Marksmen with a standard bearer and musician, plus Maximillian their leader (a Human Champion, may take one magic item), all with crossbows. Base cost includes the standard/musician and Maximillian; extra models beyond the first nine are bought at the per-model rate.",
    },
    {
      id: "longdrongpirates", name: "Long Drong Slayer's Pirates", stat: "Long Drong's Pirate", command: "standard", restriction: "0-1", tags: ["dwarf"],
      tieredPricing: { baseCost: 195, baseSize: 9, extraPerModel: 15 },
      note: "Regiment of Renown. At least nine Dwarf Pirates with a standard bearer and musician, plus Long Drong their leader, all with two pistols. Follow all Dwarf rules; as Slayers they're unbreakable and wound on 4+ or better regardless of toughness (except with pistols). Long Drong may take one magic weapon, which may be a Dwarf runic item.",
    },
    {
      id: "birdmencatrazza", name: "The Birdmen of Catrazza", stat: "Birdman of Catrazza", command: "skirmisher", restriction: "0-1",
      tieredPricing: { baseCost: 95, baseSize: 2, extraPerModel: 25 },
      note: "Regiment of Renown. At least two Birdmen plus Dadallo their leader, all with crossbows. Fly and must skirmish; may shoot while flying (not on a ground move), and may shoot other units flying high while flying high themselves. Dadallo may take one magic item.",
    },
    {
      id: "rugludsarmouredorcs", name: "Ruglud's Armoured Orcs", stat: "Ruglud's Orc", command: "standard", restriction: "0-1",
      tieredPricing: { baseCost: 177, baseSize: 9, extraPerModel: 13 },
      note: "Regiment of Renown. At least nine Orcs with a standard bearer and musician, plus Ruglud their leader, all with heavy armour, halberd, and crossbow. Subject to animosity. Ruglud may take two magic items, which may be Orcs-only items from the Orcs & Goblins army book.",
    },
    {
      id: "mengilcompany", name: "Mengil Manhide's Dark Elf Company", stat: "Mengil's Dark Elf Shade", command: "skirmisher", restriction: "0-1",
      tieredPricing: { baseCost: 110, baseSize: 4, extraPerModel: 18 },
      note: "Regiment of Renown. At least four Dark Elf Shades plus Mengil Manhide their leader, all with light armour, repeating crossbow, and an additional hand weapon. Hate High Elves; may skirmish and scout. High Elves will never fight alongside Mengil's company. Mengil may take one Dark Elf-only magic item from the Dark Elves army book.",
    },
    {
      id: "braganzasbesiegers", name: "Braganza's Besiegers", stat: "Braganza's Besieger", command: "standard", restriction: "0-1",
      tieredPricing: { baseCost: 186, baseSize: 9, extraPerModel: 14 },
      note: "Regiment of Renown. At least nine Besiegers with a standard bearer and musician, plus Braganza their leader, all with crossbow, heavy armour, and a pavise (3+ save vs shooting, 5+ vs melee). Braganza may take two magic items.",
    },
    {
      id: "vesperosvendetta", name: "Vespero's Vendetta", stat: "Vespero's Duelist", command: "skirmisher", restriction: "0-1",
      tieredPricing: { baseCost: 120, baseSize: 4, extraPerModel: 15 },
      note: "Regiment of Renown. Four Duelists plus Vespero their leader, all with an additional hand weapon, throwing knives, and a cloak (as light armour). Causes fear; must skirmish. Vespero may take two magic items.",
    },
    {
      id: "oglahkhanwolfboyz", name: "Oglah Khan's Wolfboyz", stat: "Oglah Khan's Hobgoblin", mountStat: "Giant Wolf", mountLabel: "Giant Wolf", command: "standard", restriction: "0-1",
      tieredPricing: { baseCost: 145, baseSize: 4, extraPerModel: 17 },
      note: "Regiment of Renown. At least four Hobgoblins with a standard bearer and musician, plus Oglah Khan their leader, all riding Giant Wolves with spear, shield, light armour, and bow. While Oglah Khan lives, the regiment ignores animosity and quells it in nearby allied Orcs & Goblins. The regiment's banner, the Pelt of Wulfag, adds 1D6\" to overrun/pursuit moves; the regiment may skirmish but forfeits the banner if so. Oglah Khan may take two magic items, which may be from the Chaos Dwarfs army book (not modeled in this builder).",
    },
    {
      id: "cursedcompany", name: "The Cursed Company", stat: "Cursed Company Skeleton", command: "standard", restriction: "0-1", tags: ["undead"],
      tieredPricing: { baseCost: 145, baseSize: 9, extraPerModel: 7 },
      note: "Regiment of Renown. At least nine Skeletons with a standard bearer and musician, plus Richter Kreugar their leader (follows Wight rules), all with heavy armour and halberd. Ordinary troops follow Skeleton rules. May march normally; the whole regiment crumbles to dust if Kreugar is slain. Kreugar may take two magic items besides his Wight Blade, which may be Undead-only items from the Undead army book (not modeled in this builder).",
    },
  ],
  chariotsMonsters: [
    {
      id: "boltthrowers", name: "Bolt Throwers", perUnit: 50, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Crewed by three Human Mercenary Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Human Mercenary Soldier crew",
      baseCrew: 3, crewArmourOptions: [{ id: "light", label: "Light armour (default)", cost: 0 }, { id: "heavy", label: "Heavy armour", cost: 4 }],
    },
    {
      id: "smallstonethrowers", name: "Small Stone Throwers", perUnit: 80, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Crewed by three Human Mercenary Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Human Mercenary Soldier crew",
    },
    {
      id: "largestonethrowers", name: "Large Stone Throwers", perUnit: 95, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Crewed by three Human Mercenary Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Human Mercenary Soldier crew",
    },
    {
      id: "cannons", name: "Cannons", perUnit: 95, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Normal cannon crewed by three Human Mercenary Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Human Mercenary Soldier crew",
    },
    {
      id: "gallopergun", name: "Galloper Guns", perUnit: 95, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Small cannon crewed by three Human Mercenary Soldiers and a horse. Unlike normal war machines, the crew may flee with the gun and may march. The horse only raises movement to 8\".",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Human Mercenary Soldier crew",
    },
    {
      id: "halflinghotpot", name: "Halfling Hot-Pot", perUnit: 50, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine", restriction: "0-1",
      note: "Requires a Halfling regiment in the army (now flagged live by this builder). Shoots like a stone thrower, range 36\", S5, allows normal armour save but no regeneration. Cannot enter a wood (it's a war machine, unlike its foresting crew). Crewed by three Halflings.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Halfling crew",
    },
  ],
  specialCharacters: [
    { id: "leonardo", name: "Leonardo da Miragliano", cost: 100, stat: "Leonardo da Miragliano", role: "Hero",
      note: "While in the army, all war machines may re-roll misfires, and all bolt throwers may re-roll failed to-hit rolls. Rides a Warhorse.",
      items: "Carries three scientific items: the Sphere of Alchemy (thrown weapon, BS to hit, range 6\", no long-range penalty; on a hit, a 3\" template — models more than half under it suffer a S3 hit with no armour save — one use), the Prism of Power (each enemy magic phase, they lose a random magic card on a 4+), and the Compass of Meteoric Silver (at battle start, the enemy must reveal the model carrying their single most expensive magic item)." },
    { id: "borgio", name: "Borgio the Besieger", cost: 150, stat: "Borgio the Besieger", role: "Lord",
      note: "Rides a barded Warhorse, heavy armour, lance, shield. May take a 4+ ward save against losing his last wound.",
      items: "Carries the Monstrous Mask Helm (causes fear), the Mace of Might (natural 6s to hit strike at S10), and the Armour of Brazen Bronze (his armour save can never be reduced except by save-ignoring weapons — he always saves on 5+ or better)." },
    { id: "lucrezzia", name: "Lucrezzia Belladonna", cost: 250, stat: "Lucrezzia Belladonna", role: "Master Wizard",
      note: "All friendly units within 8\" auto-pass rally tests (as long as she isn't fleeing). Rides a Warhorse.",
      items: "Carries three poisonous items: the Phial of Poison (before battle, roll for each enemy character cheapest-to-most-expensive — the first to roll a 1 suffers two wounds, no save), the Poisoned Stiletto (all successful hits wound automatically), and the Potion of Pavona (usable on any friendly character before battle, or drunk by Lucrezzia — +1D6 to one characteristic for the game, but a roll of 1 also inflicts a wound with no save)." },
    { id: "myrdas", name: "Myrdas the Mean and Sheik Yadosh", cost: 200, stat: "Myrdas the Mean", role: "Paymaster (200pts for Myrdas, Sheik Yadosh, and five Bodyguards)",
      note: "Myrdas the Mean is always accompanied by Sheik Yadosh (stats as a normal Human Mercenary Soldier, 5+ armour save) and five Bodyguards with halberds and light armour (stats as Elite Human Mercenary Soldiers). Extra Bodyguards cost +8pts/model. Myrdas wears heavy armour and a shield (4+ save) and carries the pay chest. He also carries a treasure map: after deployment but before battle, roll 1D6 — 1-2: bodyguards get +1 to hit; 3-4: the pay chest's aura increases to 18\"; 5-6: all Dogs of War regiments get +1 combat resolution." },
    { id: "lorenzo", name: "Lorenzo Lupo", cost: 250, stat: "Lorenzo Lupo", role: "Lord",
      note: "Inspiring leader — any regiment he leads gets +1 combat resolution. A mighty Athlete — before battle roll 1D6: 1-2 = +1T, 3-4 = +1A, 5-6 = +1S. Comes with heavy armour and a shield.",
      items: "Carries the Sword of Lucan (no saves of any kind allowed), the Ring of Luccina (he and his regiment auto-pass rally attempts), and the Shield of Myrmidia (melee opponents attacking him lose two attacks)." },
    { id: "marco", name: "Marco Colombo", cost: 120, stat: "Marco Colombo", role: "Lord",
      note: "Rides a Warhorse; light armour, lance, shield, and a crossbow he can fire even after moving (as a normal bow). His high-power telescope spots all hidden assassins, fanatics, Wood Elf Way Watchers, and other hidden enemies, which must be revealed before battle begins.",
      items: "Carries the Gem of Lustria (re-roll one failed armour save each melee phase), the Gourd of Lustrian Wine (drink before a Strength test or to-wound roll for +1D6 S, one use), and the Scroll of Araby (4+ natural dispel, one use)." },
    { id: "asarnil", name: "Asarnil the Dragonlord", cost: 450, stat: "Asarnil the Dragonlord", role: "High Elf Hero",
      note: "Will never fight alongside Dark Elves; becomes resolute when fighting a Dark Elf army. Wears heavy Dragon Armour (immune to fire) and a shield, wields a lance. Rides a Dragon (player's choice of red/white/blue — takes Monster Reaction tests on 3D6). Enemy Dragons must pass an Ld test at the start of the engagement or won't strike any creature in it unless attacked first.",
      items: "Wears the Amulet of the Dragonheart (reduces the WS of any enemy in base contact to 1).",
      mounts: [
        { id: "dragon", name: "Dragon (red/white/blue — breathes fire/frost/lightning respectively)", cost: 0, stat: "Asarnil's Dragon" },
      ] },
  ],
};

const CD_ARMOUR_OPTIONS = ["Heavy armour (default)", "Chaos Armour"];
const CD_BULLCENTAUR_ARMOUR_OPTIONS = ["Light armour (default)", "Heavy armour", "Chaos Armour"];

const CHAOS_DWARF_MAGIC_ITEMS = [
  { id: "cd-whipobedience", name: "Whip of Obedience", cost: 10, cat: "weapon", desc: "Hobgoblin characters on foot only. Additional hand weapon, +1 Ld, may re-roll failed panic tests.", restrictedTo: [{ tags: ["hobgoblin"] }] },
  { id: "cd-darkforged", name: "Darkforged Weapon", cost: 15, cat: "weapon", desc: "Magic hand weapon. After deployment, roll 1D6 for its attribute for the game: 1 flaming attacks, 2 Hatred (all enemies), 3 1 wound=1D3, 4 wounds inflicted may restore the bearer's own lost wounds, 5 +1S, 6 no armour save allowed." },
  { id: "cd-gravensceptre", name: "Graven Sceptre", cost: 25, cat: "weapon", desc: "+1S. To Wound rolls of 4+ with this weapon are always successful, regardless of the enemy's toughness." },
  { id: "cd-daggermalice", name: "Dagger of Malice", cost: 25, cat: "weapon", desc: "Bearer gains Hatred (all enemies) and Frenzy — unlike other Frenzied models, he can never lose it." },
  { id: "cd-blackhammer", name: "Black Hammer of Hashut", cost: 25, cat: "weapon", desc: "Chaos Dwarfs and Bull Centaurs only. Double handed weapon, no armour saves allowed. Flammable targets suffering one wound from it are killed instantly.", restrictedTo: [{ tags: ["chaosDwarf"] }, { tags: ["bullCentaur"] }] },
  { id: "cd-maskfurnace", name: "Mask of the Furnace", cost: 15, cat: "armour", desc: "Causes fear. +1 armour save." },
  { id: "cd-midnight", name: "Armour of Midnight", cost: 50, cat: "armour", desc: "Heavy armour. 1+ armour save, which cannot be improved further." },
  { id: "cd-bazrakkarmour", name: "Armour of Bazrakk the Cruel", cost: 75, cat: "armour", desc: "A suit of Chaos Armour. Bearer and his regiment are immune to psychology and have natural dispel 4+." },
  { id: "cd-mantlestone", name: "Mantle of Stone", cost: 20, cat: "enchanted", desc: "+1 Toughness, strikes last (-1 to hit as well if combined with a double handed weapon)." },
  { id: "cd-chalicedarkness", name: "Chalice of Darkness", cost: 20, cat: "enchanted", desc: "Use at the start of any magic phase before rolling for power cards: roll 1D6 and remove that many cards from each side's share. Up to three uses per game." },
  { id: "cd-gauntletbazrakk", name: "Gauntlet of Bazrakk the Cruel", cost: 20, cat: "enchanted", desc: "+2 strength. On an unmodified roll of 1 to hit in melee, the blow strikes a random friendly model in base contact instead (even on automatic hits)." },
  { id: "cd-hellshard", name: "Hellshard Amulet", cost: 50, cat: "enchanted", desc: "5+ ward save. Each successful melee wound the amulet fails to stop inflicts a S2 hit back on the attacker automatically." },
  { id: "cd-flamingring", name: "Flaming Ring of Azgorh", cost: 10, cat: "arcane", desc: "Wizard only. May swap any spell received in spell selection (that wasn't already received) for the Flames of Azgorh spell. When cast by the ringbearer, use the larger ~11\" flame template instead of the usual 8\" one.", restrictedTo: [{ tags: ["wizard"] }] },
  { id: "cd-obsidianpearl", name: "Obsidian Pearl of Zhar Naggrund", cost: 100, cat: "arcane", desc: "Wizard only. One extra magic card per magic phase, for personal use only.", restrictedTo: [{ tags: ["wizard"] }] },
  { id: "cd-cowardice", name: "Banner of Feigned Cowardice", cost: 10, cat: "banner", desc: "Hobgoblins only. When about to take a break test after losing a combat, may flee voluntarily instead of rolling — and keeps the standard even though fleeing from melee. If caught, destroyed as usual; if not caught, rallies immediately.", restrictedTo: [{ tags: ["hobgoblin"] }] },
  { id: "cd-sneakiness", name: "Banner of Sneakiness", cost: 50, cat: "banner", desc: "Hobgoblins only. May re-roll missed to-hit rolls, shooting and melee alike (not for mounts).", restrictedTo: [{ tags: ["hobgoblin"] }] },
  { id: "cd-slavebanner", name: "Slave Banner", cost: 100, cat: "banner", desc: "Must be carried by the Battle Standard Bearer. All Orc, Black Orc, Goblin, and Hobgoblin regiments within 12\" become stubborn.", restrictedTo: [{ tags: ["bsb"] }] },
  { id: "cd-shroudobscurity", name: "Shroud of Obscurity", cost: 100, cat: "banner", desc: "Enemy to-hit rolls against this regiment (shooting or melee) can never beat 5+. No effect vs. automatically-hitting magic weapons, chariot impact hits, spells, or war machines." },
];

const CHAOS_DWARFS = {
  key: "chaosdwarfs",
  loreOptions: ["Chaos Dwarf Magic"],
  name: "Chaos Dwarfs",
  tagline: "High Hats from the Dark Lands — bound to Hashut, forging chains for the weak",
  magicItems: [...COMMON_MAGIC_ITEMS, ...CHAOS_DWARF_MAGIC_ITEMS, ...ORC_MAGIC_ITEMS],
  themes: {
    default: "core",
    options: [
      { id: "core", name: "Core", desc: "Base Chaos Dwarf army." },
      { id: "oldschool", name: "Old School Addendum", desc: "Blunderbusses replaced with Crossbows. Hobgoblin Archers can upgrade to Crossbows for +2 points per model. Adds Weapon Teams, Juggernaut, Whirlwind and Tenderizer War Engines." },
      { id: "modern", name: "Modern Stuff", desc: "Adds Fireglaives, Naphtha Bombs, Blood of Hashut, Bull Centaur Renders, K'daii Fireborn, Chaos Siege Giant, The Iron Daemon, Magma Cannons, and the Hellcannon." },
    ],
  },
  compositionRules: [
    { kind: "requiresAtLeastOne", label: "At least one Chaos Dwarf Warriors, Tower Guard, or Blunderbusses regiment", refs: [
      { list: "regiments", id: "cdwarriors", name: "Chaos Dwarf Warriors" },
      { list: "regiments", id: "towerguard", name: "Chaos Dwarf Tower Guard" },
      { list: "regiments", id: "cdblunderbusses", name: "Chaos Dwarf Blunderbusses" },
    ] },
    { kind: "requiresIfPresent", label: "Black Orc Hero", trigger: [{ list: "characters", id: "blackorchero", name: "Black Orc Hero" }], requires: [{ list: "regiments", tag: "blackOrc", name: "a Black Orc regiment" }] },
    { kind: "requiresIfPresent", label: "Common Orc Hero", trigger: [{ list: "characters", id: "commonorchero", name: "Common Orc Hero" }], requires: [{ list: "regiments", tag: "commonOrc", name: "a Common Orc regiment" }] },
    { kind: "requiresIfPresent", label: "Common Goblin Hero", trigger: [{ list: "characters", id: "commongoblinhero", name: "Common Goblin Hero" }], requires: [{ list: "regiments", tag: "commonGoblin", name: "a Common Goblin regiment" }] },
    { kind: "requiresIfPresent", label: "Hobgoblin Hero", trigger: [{ list: "characters", id: "hobgoblinhero", name: "Hobgoblin Hero" }], requires: [{ list: "regiments", tag: "hobgoblin", name: "a Hobgoblin regiment" }] },
    { kind: "requiresIfPresent", label: "Hobgoblin Bolt Throwers", trigger: [{ list: "chariots", id: "hobgoblinboltthrowers", name: "Hobgoblin Bolt Throwers" }], requires: [{ list: "regiments", tag: "hobgoblin", name: "a Hobgoblin regiment" }] },
    { kind: "requiresIfPresent", label: "K'daii Fireborn", trigger: [{ list: "regiments", id: "kdaiifireborn", name: "K'daii Fireborn" }], requires: [{ list: "characters", tag: "wizard", name: "a Sorcerer" }, { list: "specials", id: "astragoth", name: "Astragoth" }, { list: "specials", id: "drazhoath", name: "Drazhoath" }] },
    { kind: "requiresIfPresent", label: "K'daii Destroyer", trigger: [{ list: "chariots", id: "kdaiidestroyer", name: "K'daii Destroyer" }], requires: [{ list: "characters", tag: "wizard", name: "a Sorcerer" }, { list: "specials", id: "astragoth", name: "Astragoth" }, { list: "specials", id: "drazhoath", name: "Drazhoath" }] },
  ],
  armyWideRules: [
    "The master race: the army general must be a Chaos Dwarf character, and the army must include at least one regiment of Chaos Dwarf Warriors, Tower Guards, or Blunderbusses (this last part is now flagged live — see the warning banner above the roster). Chaos Dwarfs don't hate Orcs & Goblins, don't suffer Elf Grudge, and get no dispel bonus. They have no Gromril Armour, but Chaos Dwarf characters and elite troops may take Chaos Armour instead (4+ armour save on its own, doesn't cost a magic item slot, and may be worn by wizards while casting). Chaos Dwarfs and Bull Centaurs never take panic tests caused by greenskins of any kind.",
    "Greenskin slaves: the army may include enslaved Common Goblins, Common Orcs, and Black Orcs. Common Goblins/Orcs are subject to animosity; Black Orcs are immune to it and ignore panic from Common Orcs/Goblins; Black Orc characters joining a non-Black-Orc regiment quell its animosity. Common Goblins fear Elves they don't outnumber 2:1. Greenskin characters can't join Chaos Dwarf ranks generally — Black Orc/Common Orc/Goblin characters act alone or join their own kind's regiments (Black Orcs will only heed Black Orc or Chaos Dwarf leadership); Chaos Dwarf characters may join Black Orc/Common Orc/Goblin regiments but never Hobgoblins.",
    "Hobgoblins: function as slave-masters over the other greenskins rather than being enslaved themselves. They suffer animosity like Common Orcs/Goblins, but nearby Orcs/Goblins (within 12\" of a Hobgoblin regiment) don't test it themselves that turn. Orc/Goblin/Black Orc units don't panic when nearby Hobgoblins break, flee, or die — it's cause for celebration. No character but a Hobgoblin may join a Hobgoblin regiment, and Hobgoblin characters can't join anyone else's regiment either.",
    "Animosity: at the start of the turn (before movement), each not-fleeing, not-engaged Orc/Goblin/Hobgoblin regiment not within 12\" of a friendly Hobgoblin regiment (Orcs/Goblins only) rolls a die — on a 1, roll again: 1-5 the unit squabbles (immune to psychology, can't move/shoot/cast that turn, though wizards may still dispel), 6 the unit moves 2D6\" toward the nearest enemy and must charge it next turn if possible. This builder doesn't simulate animosity rolls turn-to-turn — it's a battle-phase mechanic, not a list-building one, same treatment as Orcs & Goblins.",
    "Army Theme: pick Core, Old School Addendum, or Modern Stuff at the top of the left-hand sidebar — the book only allows one of the two supplements per army, never both, so picking a theme swaps in that supplement's units and hides the other's. Core units (Chaos Dwarf Warriors, Tower Guard, Bull Centaurs, Hobgoblins, the greenskin slave regiments, all the standard characters, etc.) stay available under every theme. Note the book also says a Modern Stuff army can't include the Black Orc/Common Orc/Common Goblin slave options at all — this builder doesn't hide those automatically when Modern Stuff is picked, so leave them out yourself if you're playing strictly RAW. The Fireglaive/Naphtha Bomb/Blood of Hashut upgrades for Chaos Dwarf Lords/Heroes aren't wired up as toggles (no clean slot for flat per-character extras in this engine yet) — add their points (+10/+10/+20 each, Blood of Hashut stacks) by hand if you take them.",
    "Hellcannon: the Chaos army book's version — a Daemon that fights as a war machine, crewed by Chaos Dwarfs — is already available under the Modern Stuff theme, listed below as 'Hellcannon (from the Chaos army book)'.",
  ],
  characters: [
    {
      id: "chaosdwarflord", name: "Chaos Dwarf Lord", cost: 136, stat: "Chaos Dwarf Lord", magicItemSlots: 3, tags: ["chaosDwarf"],
      gearNote: "May take a shield and either heavy armour or Chaos Armour for free. May ride a Great Taurus for +224pts.",
      armourGroup: { options: CD_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Hand gun", "Crossbow", "Two pistols"] },
      mounts: [
        { id: "greattaurus", name: "Great Taurus", cost: 224, stat: "Great Taurus" },
      ],
    },
    {
      id: "chaosdwarfhero", name: "Chaos Dwarf Hero", cost: 82, stat: "Chaos Dwarf Hero", magicItemSlots: 2, tags: ["chaosDwarf"],
      gearNote: "May take a shield and either heavy armour or Chaos Armour for free. May ride a Great Taurus for +216pts.",
      armourGroup: { options: CD_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Hand gun", "Crossbow", "Two pistols"] },
      mounts: [
        { id: "greattaurus", name: "Great Taurus", cost: 216, stat: "Great Taurus" },
      ],
    },
    {
      id: "chaosdwarfbsb", name: "Chaos Dwarf Battle Standard Bearer", cost: 92, stat: "Chaos Dwarf BSB", magicItemSlots: 1, restriction: "0-1", tags: ["chaosDwarf", "bsb"],
      gearNote: "0-1 — the army's single BSB slot may be this OR the Bull Centaur BSB below, not both. May take heavy armour or Chaos Armour for free. The one item may be a magic banner.",
      armourGroup: { options: CD_ARMOUR_OPTIONS },
    },
    {
      id: "bullcentaurbsb", name: "Bull Centaur Battle Standard Bearer", cost: 120, stat: "Bull Centaur BSB", magicItemSlots: 1, restriction: "0-1", tags: ["bullCentaur", "bsb"],
      gearNote: "0-1 — the army's single BSB slot may be this OR the Chaos Dwarf BSB above, not both. May take light armour, heavy armour, or Chaos Armour for free. The one item may be a magic banner.",
      armourGroup: { options: CD_BULLCENTAUR_ARMOUR_OPTIONS },
    },
    {
      id: "sorcererlord", name: "Chaos Dwarf Sorcerer Lord (level 4)", cost: 276, stat: "Chaos Dwarf Sorcerer Lord", magicItemSlots: 4, tags: ["chaosDwarf", "wizard"],
      gearNote: "Uses Chaos Dwarf Magic. May wear Chaos Armour for +10pts. May take as many magic items as levels (4). May ride a Lammasu for +180pts.",
      chaosArmourOption: { label: "Chaos Armour", cost: 10 },
      mounts: [
        { id: "lammasu", name: "Lammasu", cost: 180, stat: "Lammasu" },
      ],
    },
    {
      id: "mastersorcerer", name: "Master Chaos Dwarf Sorcerer (level 3)", cost: 194, stat: "Chaos Dwarf Master Sorcerer", magicItemSlots: 3, tags: ["chaosDwarf", "wizard"],
      gearNote: "Uses Chaos Dwarf Magic. May wear Chaos Armour for +10pts. May take as many magic items as levels (3).",
      chaosArmourOption: { label: "Chaos Armour", cost: 10 },
    },
    {
      id: "sorcererchampion", name: "Chaos Dwarf Sorcerer Champion (level 2)", cost: 128, stat: "Chaos Dwarf Sorcerer Champion", magicItemSlots: 2, tags: ["chaosDwarf", "wizard"],
      gearNote: "Uses Chaos Dwarf Magic. May wear Chaos Armour for +10pts. May take as many magic items as levels (2).",
      chaosArmourOption: { label: "Chaos Armour", cost: 10 },
    },
    {
      id: "sorcerer", name: "Chaos Dwarf Sorcerer (level 1)", cost: 62, stat: "Chaos Dwarf Sorcerer", magicItemSlots: 1, tags: ["chaosDwarf", "wizard"],
      gearNote: "Uses Chaos Dwarf Magic. May wear Chaos Armour for +10pts. May take as many magic items as levels (1).",
      chaosArmourOption: { label: "Chaos Armour", cost: 10 },
    },
    {
      id: "bullcentaurlord", name: "Bull Centaur Lord", cost: 208, stat: "Bull Centaur Lord", magicItemSlots: 3, tags: ["bullCentaur"],
      gearNote: "May take a shield and either light armour, heavy armour, or Chaos Armour for free.",
      armourGroup: { options: CD_BULLCENTAUR_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "bullcentaurhero", name: "Bull Centaur Hero", cost: 135, stat: "Bull Centaur Hero", magicItemSlots: 2, tags: ["bullCentaur"],
      gearNote: "May take a shield and either light armour, heavy armour, or Chaos Armour for free.",
      armourGroup: { options: CD_BULLCENTAUR_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "blackorchero", name: "Black Orc Hero", cost: 89, stat: "Black Orc Hero", magicItemSlots: 2, tags: ["blackOrc"],
      gearNote: "Your army must include a Black Orc regiment to field this Hero (now flagged live by this builder). Quells animosity. May take a shield and either light armour or heavy armour for free. May take 2 magic items, which may come from the Orcs & Goblins army book.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "commonorchero", name: "Common Orc Hero", cost: 60, stat: "Orc Hero", magicItemSlots: 2, tags: ["commonOrc"],
      gearNote: "Your army must include a Common Orc regiment to field this Hero (now flagged live by this builder). May take a shield and light armour for free. May take 2 magic items, which may come from the Orcs & Goblins army book.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "commongoblinhero", name: "Common Goblin Hero", cost: 36, stat: "Goblin Hero", magicItemSlots: 2, tags: ["commonGoblin"],
      gearNote: "Your army must include a Common Goblin regiment to field this Hero (now flagged live by this builder). May take a shield and light armour for free. May take 2 magic items, which may come from the Orcs & Goblins army book.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon", cost: 10, options: ["None (default)", "Short bow"] },
    },
    {
      id: "hobgoblinhero", name: "Hobgoblin Hero", cost: 53, stat: "Hobgoblin Hero", magicItemSlots: 2, tags: ["hobgoblin"],
      gearNote: "Your army must include a Hobgoblin regiment to field this Hero (now flagged live by this builder). May take light armour and a shield for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon", cost: 10, options: ["None (default)", "Bow", "Crossbow"] },
      mounts: [
        { id: "giantwolf", name: "Giant Wolf", cost: 14, stat: "Giant Wolf" },
      ],
    },
    {
      id: "hobgoblinassassin", name: "Hobgoblin Assassin", cost: 50, stat: "Hobgoblin Assassin", magicItemSlots: 0, tags: ["hobgoblin"],
      gearNote: "The first Assassin in the army counts toward Regiments, not Characters — subsequent ones count as Characters. May not take magic items. Conceals itself as an ordinary trooper in a Hobgoblin infantry regiment (only one per regiment) and is revealed on entering melee, replacing a trooper — in the first combat round it strikes before Always Strikes First models and before challenges are declared. Fights with two poisoned hand weapons (+1S; each wound multiplies into 1D3). Fights normally (no strike-first) in later rounds, and becomes a free-roaming independent character once that combat ends. Can never be the general, and nobody may use its Ld.",
    },
  ],
  regiments: [
    {
      id: "cdwarriors", name: "Chaos Dwarf Warriors", perModel: 9, minSize: 5, stat: "Chaos Dwarf Warriors", command: "standard",
      note: "Comes with heavy armour.",
      options: [
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "fireglaives", group: null, label: "Fireglaives — range 18\" S4 armour piercing, or +1S two-handed in melee", cost: 5, per: "model", theme: "modern" },
      ],
      champion: { name: "Chaos Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Chaos Dwarf Champion", tags: ["chaosDwarf"] },
    },
    {
      id: "cdblunderbusses", name: "Chaos Dwarf Blunderbusses", perModel: 12, minSize: 5, stat: "Chaos Dwarf Warriors", command: "standard",
      note: "Comes with heavy armour and Blunderbusses (may be reflavored as crossbows instead, under Old School Addendum — same points and profile). Fires even after moving, in a 12\" x (unit width) firing zone ahead of the regiment, hitting every model whose base is more than half within it (friend and foe alike). Hits are S3, rising to S4 with two full ranks or S5 with three-plus. No long-range/skirmisher penalty; normal cover and move-and-shoot penalties apply. Joined characters count as armed with Blunderbusses for strength purposes even if they aren't. May stand & shoot against distant chargers, hitting the charging unit only (no area effect on that reaction).",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 2, per: "model" },
      ],
      champion: { name: "Chaos Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Chaos Dwarf Champion", tags: ["chaosDwarf"] },
    },
    {
      id: "towerguard", name: "Chaos Dwarf Tower Guard", perModel: 11, minSize: 5, stat: "Chaos Dwarf Tower Guards", command: "standard", restriction: "0-1",
      note: "Comes with heavy armour.",
      options: [
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "chaosarmour", group: null, label: "Upgrade heavy armour to Chaos Armour", cost: 1, per: "model" },
      ],
      champion: { name: "Commander of the Tower", baseCost: 30, magicItemSlots: 1, stat: "Commander of the Tower", tags: ["chaosDwarf"] },
    },
    {
      id: "hobgoblinwarriors", name: "Hobgoblin Warriors", perModel: 4, minSize: 5, stat: "Hobgoblin (CD)", command: "standard", tags: ["hobgoblin"],
      note: "Comes with shields.",
      options: [
        { id: "spears", group: "melee", label: "Spears", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Hobgoblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Hobgoblin Champion (CD)", tags: ["hobgoblin"] },
    },
    {
      id: "hobgoblinarchers", name: "Hobgoblin Archers", perModel: 5, minSize: 5, stat: "Hobgoblin (CD)", command: "standard", tags: ["hobgoblin"],
      note: "Comes with bows.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "crossbows", group: null, label: "Upgrade bows to crossbows", cost: 2, per: "model", theme: "oldschool" },
      ],
      champion: { name: "Hobgoblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Hobgoblin Champion (CD)", tags: ["hobgoblin"] },
    },
    {
      id: "hobgoblinwolfriders", name: "Hobgoblin Wolf Riders", perModel: 11, minSize: 5, stat: "Hobgoblin (CD)", mountStat: "Giant Wolf", mountLabel: "Giant Wolf", command: "fastCavalry", tags: ["hobgoblin"],
      note: "Rides Giant Wolves. Fast cavalry. May skirmish if armed with bows/short bows.",
      options: [
        { id: "spears", group: "melee", label: "Spears", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "shortbows", group: "missile", label: "Short bows", cost: 1, per: "model" },
        { id: "bows", group: "missile", label: "Bows", cost: 2, per: "model" },
      ],
      champion: { name: "Hobgoblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Hobgoblin Champion (CD)", tags: ["hobgoblin"] },
    },
    {
      id: "sneakygits", name: "Hobgoblin Sneaky Gits", perModel: 8, minSize: 5, stat: "Hobgoblin (CD)", command: "standard", tags: ["hobgoblin"],
      note: "Comes with two poisoned daggers and light armour. After the first round of melee, any number of models may leave the unengaged rear ranks to lap around the enemy unit's flank/rear, expanding the front rank. If five or more end up engaged to a flank/rear this way, the Sneaky Gits get the flank/rear combat resolution bonus (and the enemy loses its rank bonus) — but the Sneaky Gits also lose their own rank bonus once models leave the rear ranks.",
      champion: { name: "Hobgoblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Hobgoblin Champion (CD)", tags: ["hobgoblin"] },
    },
    {
      id: "bullcentaurs", name: "Bull Centaurs", perModel: 24, minSize: 5, stat: "Bull Centaurs", command: "fastCavalry", fastCavalryToggleOption: "heavyarmour", tags: ["bullCentaur"],
      note: "Comes with light armour. Fast cavalry (unless given heavy armour).",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 2, per: "model" },
        { id: "heavyarmour", group: null, label: "Upgrade to heavy armour, free (loses fast cavalry)", cost: 0, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
      ],
      champion: { name: "Bull Centaur Champion", baseCost: 30, magicItemSlots: 1, stat: "Bull Centaur Champion", tags: ["bullCentaur"] },
    },
    {
      id: "orcslaves", name: "Orc Slave Warriors", perModel: 5, minSize: 5, stat: "Common Orc", command: "standard", tags: ["commonOrc"],
      note: "Comes with light armour.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 1, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 2, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Common Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Common Orc Champion", tags: ["commonOrc"] },
    },
    {
      id: "blackorcslaves", name: "Black Orc Slave Warriors", perModel: 9, minSize: 5, stat: "Black Orc", command: "standard", tags: ["blackOrc"],
      note: "Comes with light armour.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears", cost: 2, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "heavyarmour", group: null, label: "Swap light for heavy armour", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Black Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Black Orc Champion", tags: ["blackOrc"] },
    },
    {
      id: "goblinslaves", name: "Common Goblin Slave Warriors", perModel: 2.5, minSize: 5, stat: "Common Goblin", command: "standard", tags: ["commonGoblin"],
      options: [
        { id: "spears", group: "melee", label: "Spears", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "shortbows", group: "missile", label: "Short bows — no shields if taken", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "shields", group: null, label: "Shields — only if not armed with short bows", cost: 0.5, per: "model" },
      ],
      champion: { name: "Common Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Common Goblin Champion", tags: ["commonGoblin"] },
    },
    // --- Modern Stuff regiments ---
    {
      id: "bullcentaurrenders", name: "Bull Centaur Renders", perModel: 54, minSize: 3, stat: "Bull Centaur Renders", command: "monstrous", theme: "modern",
      note: "Wear heavy armour. Monstrous, cause fear. Cannot take a standard bearer or musician.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 4, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons", cost: 12, per: "model" },
      ],
      champion: { name: "Bull Centaur Render Champion", baseCost: 50, magicItemSlots: 1, stat: "Bull Centaur Render Champion", tags: ["bullCentaur"] },
    },
    {
      id: "kdaiifireborn", name: "K'daii Fireborn", perModel: 41, minSize: 3, stat: "K'daii Fireborn", command: "none", theme: "modern",
      note: "Requires a Sorcerer elsewhere in the army (now flagged live by this builder). Monstrous; flaming attacks, immune to fire, regenerate 4+ (not cancelled by flaming, but is by magical attacks). At the start of every melee phase, any model in base contact (friend or foe) suffers an automatic flaming S3 hit that doesn't count toward combat resolution. Count as Daemons in all regards: cause fear, magical attacks, immune to poison/living-only effects/psychology, never flee (exorcised — counts as slain — if forced to). Cannot take a standard bearer or musician; only Daemonic characters may join.",
      champion: { name: "K'daii Manburner", baseCost: 50, magicItemSlots: 0, stat: "K'daii Manburner", note: "May take one Daemonic Reward from the Chaos army book's Daemonic Rewards (All) section (not modeled in this builder — apply on paper)." },
    },
  ],
  chariotsMonsters: [
    {
      id: "earthshaker", name: "Chaos Dwarf Earth Shaker Cannon", perUnit: 165, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Works like a Large Stone Thrower. Units hit by the template (even without a wound) can't move, shoot, or cast spells through the next magic phase and their next movement/shooting phases (compulsory/flee moves and spell-forced moves still happen). Crewed by three Chaos Dwarfs in heavy armour.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Chaos Dwarf crew",
      crewArmourFixed: "Heavy armour",
    },
    {
      id: "deathrockets", name: "Chaos Dwarf Death Rockets", perUnit: 85, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Works like a Small Stone Thrower. Crewed by two Chaos Dwarf Warriors in heavy armour.",
      extraCrewCost: 10, extraCrewMax: 3, extraCrewLabel: "extra Chaos Dwarf crew",
      crewArmourFixed: "Heavy armour",
    },
    {
      id: "hobgoblinboltthrowers", name: "Hobgoblin Bolt Throwers", perUnit: 43, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Requires a Hobgoblin regiment in the army (now flagged live by this builder). Bolt thrower crewed by two Hobgoblins.",
      extraCrewCost: 4, extraCrewMax: 3, extraCrewLabel: "extra Hobgoblin crew",
    },
    // --- Old School Addendum war machines ---
    {
      id: "flamethrowerteam", name: "Flame Thrower Team", perUnit: 60, stat: "Weapon Team", kind: "warmachine", theme: "oldschool",
      note: "Weapon Team: two Chaos Dwarf Warriors in heavy armour on one 25x50mm base, skirmisher-style (360° LoS, no facing when charged by flyers, can't move-and-fire, may stand & shoot). Guess up to 6\" plus the artillery die; on a misfire the team is destroyed. Otherwise place the teardrop template (small end at the hit point) — models more than half covered suffer a flaming S5 hit, 1 wound=1D3. Any casualty forces a panic test. If it blows up during a stand & shoot, the charge counts as failed.",
      crewArmourFixed: "Heavy armour",
    },
    {
      id: "swivelgunteam", name: "Swivel Gun Team", perUnit: 85, stat: "Weapon Team", kind: "warmachine", theme: "oldschool",
      note: "Weapon Team: two Chaos Dwarf Warriors in heavy armour on one 25x50mm base, skirmisher-style. Range 18\", 2D6 shots, S3 armour piercing (-1 save). On any double, fires in a random (scatter die) direction instead, hitting the first unit in its path within range — each shot then hits automatically.",
      crewArmourFixed: "Heavy armour",
    },
    {
      id: "cdjuggernaut", name: "Chaos Dwarf Juggernaut", perUnit: 200, stat: "Chaos Dwarf Juggernaut", kind: "chariot", restriction: "0-1", theme: "oldschool", crewArmourFixed: "Heavy armour",
      note: "Unbreakable large chariot pushed by a Bull Centaur (M8; only the crew fights in melee, not the Centaur). Can't pursue/overrun, doesn't double movement on the charge, and doesn't halve movement at one wound. Crewed by six Chaos Dwarf Warriors in heavy armour with crossbows. Front-mounted organ-gun variant: S7, 1D3 wounds, no armour save, guess range up to 36\", may fire even after moving, can't pivot to shoot, only two barrels fire per round (never needs reloading). First misfire (non-bounce): can't shoot this turn or next, can still move. Second misfire (non-bounce): gun and Juggernaut both explode.",
    },
    {
      id: "cdwhirlwind", name: "Chaos Dwarf Whirlwind", perUnit: 75, stat: "Whirlwind/Tenderizer", kind: "chariot", restriction: "0-1", theme: "oldschool",
      note: "Scythed light chariot pushed by a Bull Centaur (WS4, M8). Can't pursue/overrun, doesn't double movement on the charge, doesn't halve movement at one wound, and is immune to psychology. The Centaur operates the machine rather than fighting; each combat round it deals 1D6 automatic S4 hits to its front, in addition to any charge impact hits.",
    },
    {
      id: "cdtenderizer", name: "Chaos Dwarf Tenderizer", perUnit: 75, stat: "Whirlwind/Tenderizer", kind: "chariot", restriction: "0-1", theme: "oldschool",
      note: "Scythed light chariot pushed by a Bull Centaur (WS4, M8). Can't pursue/overrun, doesn't double movement on the charge, doesn't halve movement at one wound, and is immune to psychology. The Centaur operates the machine rather than fighting; each combat round it deals one automatic S7 hit, no armour save, causing 1D6 wounds to its front, in addition to any charge impact hits.",
    },
    // --- Modern Stuff monsters/chariots ---
    {
      id: "magmacannon", name: "Magma Cannon", perUnit: 90, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine", theme: "modern",
      note: "Follows Dwarf Flame Cannon rules: guesses range like a cannon (max 12\") plus the artillery die; teardrop template, S5 hit (1 wound = 1D3). Any casualty forces a panic test. May stand & shoot (resolved before the enemy unit moves). Crewed by three Chaos Dwarfs.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Chaos Dwarf crew",
      baseCrew: 3, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }, { id: "heavy", label: "Heavy armour", cost: 2 }],
    },
    {
      id: "cdhellcannon", name: "Hellcannon", perUnit: 120, stat: "Hellcannon Daemon", kind: "warmachine", theme: "modern",
      note: "From the Chaos army book. House rule / optional — ask your opponent's permission before including it, primarily meant for Siege Battles. A Daemon that works as a war machine, crewed by three Chaos Dwarfs in heavy armour. Shoots like a large stone thrower; any regiment losing even one model to it must take a panic test; shots count as magical. A misfire eats 1D3 crew instead of firing; if all crew die, it becomes an independent monster with random movement that charges the nearest model each turn (friend or foe), following normal Daemon rules — and still defends itself if charged.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Chaos Dwarf crew",
      crewArmourFixed: "Heavy armour",
    },
    {
      id: "kdaiidestroyer", name: "K'daii Destroyer", perUnit: 300, stat: "K'daii Destroyer", kind: "monster", theme: "modern",
      note: "Requires a Sorcerer elsewhere in the army (now flagged live by this builder). Large monster, causes Terror, flaming attacks, immune to fire, regenerates 4+ (not cancelled by flaming, is by magical attacks). At the start of every melee phase, any model in base contact (friend or foe) suffers an automatic flaming S3 hit not counting toward combat resolution. Counts as a Daemon in all regards: magical attacks, immune to poison/living-only effects/psychology, never flees (exorcised — counts as slain — if forced to).",
    },
    {
      id: "chaossiegegiant", name: "Chaos Siege Giant", perUnit: 275, stat: "Chaos Siege Giant", kind: "monster", theme: "modern",
      note: "Follows the rulebook Giant with exceptions: Siege Armour (5+ save, 3+ vs. shooting). May take Runes of Hate for +25pts flat (add by hand — not wired up as a toggle here). Has Frenzy, and re-rolls (must keep the second result) whenever rolling for a random number of attacks. Special attacks each turn (choose one): Legbreaker (opposed D6+S roll vs. a model in contact, D3 wounds no save per point of margin, and anyone else in contact must pass Initiative or take an automatic wound), Smash with Pick (target fails Initiative or suffers 2D6 wounds no save — buildings auto-fail; on a double the pick jams and the Giant skips its next combat round), Head Butt Large Target (automatic S7 hit, wounded models knocked unconscious — auto-hit until they wake at the end of the next melee phase), Yell and Bawl (no attack, but automatically wins combat resolution by 2 if the Giant survives the round), Flail and Crush on a man-sized regiment (take the fall-over test; if it stands, 1D6 S8 hits), Ripping Blades (2D6 automatic S6 hits on a unit in contact; double 6 adds the extra hits but forces a fall-over test, double 1 does nothing and costs the Giant D3 wounds no save plus a fall).",
    },
    {
      id: "irondaemon", name: "The Iron Daemon", perUnit: 350, stat: "Iron Daemon", kind: "chariot", theme: "modern",
      note: "Large chariot with a unique profile, 3+ armour save, causes terror, unbreakable, crewed by three Chaos Dwarf Warriors (only they fight in melee). Auto-passes all characteristic tests except Initiative (always fails those). Chariots that charge it suffer 1D6 S7 impact hits themselves; Night Goblin Fanatics touching it are slain. Moves like a chariot but can't free-pivot, obliterates obstacles, can't pursue/overrun/flee (unbreakable)/march, and doesn't double its charge move — instead add 1D6\" to its Movement (on a 1, it stalls for the rest of that turn). Doesn't halve movement at one wound. Front-mounted steam cannonade (organ gun): range 24\", fires 2D6 (two Artillery dice) shots, halved beyond half range, S5 AP at short range / S4 AP at long range, may fire after moving, can't pivot to shoot, two barrels per round, never reloads. First misfire: the Iron Daemon suffers a wound. Second misfire: it explodes (counts as slain). Doesn't fight in melee itself, but deals 1D6+1 S8 impact hits on the charge, may always disengage, and once per turn may grind its wheels for another 1D6+1 S8 impact hits while engaged. For +10pts flat, the cannonade may be swapped for a skullcracker (2D6+2 impact hits, armour piercing) — add by hand, not wired up as a toggle here.",
    },
  ],
  specialCharacters: [
    { id: "zhatan", name: "Zhatan the Black, Commander of the Tower of Zharr", cost: 200, stat: "Zhatan The Black", role: "Chaos Dwarf Lord",
      note: "Chaos Armour, a shield, and a double handed weapon. Hates all enemies — and so does any Chaos Dwarf regiment he joins. May take four magic items.",
      mounts: [
        { id: "greattaurus", name: "Great Taurus", cost: 200, stat: "Great Taurus" },
      ] },
    { id: "gorduz", name: "Gorduz Backstabber", cost: 100, stat: "Gorduz Backstabber", role: "Hobgoblin Lord",
      note: "Light armour; carries a shield (may swap for an additional hand weapon for free). Ward save against losing his last wound: 2+ the first time he needs it, then 3+, then 4+, and so on — if he actually makes five successful saves this way, the ability is gone for good. May wield a spear for free if mounted. May take three magic items.",
      mounts: [
        { id: "giantwolf", name: "Giant Wolf", cost: 20, stat: "Giant Wolf" },
      ] },
    { id: "astragoth", name: "Astragoth, High Priest of Hashut", cost: 300, stat: "Astragoth", role: "Chaos Dwarf Sorcerer Lord",
      note: "Partly petrified — 3+ armour save. If all three of his attacks hit, he gets three additional attacks (no further generation after that). Movement can never exceed 8\", even marching or charging. May take four magic items." },
    { id: "drazhoath", name: "Drazhoath The Ashen, Prophet of Hashut", cost: 450, stat: "Drazhoath The Ashen", role: "Chaos Dwarf Sorcerer Lord — must be the army general",
      note: "All Chaos Dwarf units (including Drazhoath) get +1 combat resolution within 12\" of him. May ride a Great Taurus for +224pts.",
      items: "Carries Chaos Armour, the Hellshard Amulet, the Graven Sceptre, and the Daemonspite Crucible (casts one spell per turn for one less power card than normal; if Drazhoath or his mount kills an enemy wizard in melee, that drops to two less power cards for the rest of the game — further slain wizards don't stack further). May take one additional magic item.",
      mounts: [
        { id: "greattaurus", name: "Great Taurus", cost: 224, stat: "Great Taurus" },
      ] },
  ],
};

const DARK_ELF_MAGIC_ITEMS = [
  { id: "de-whipofagony", name: "Whip of Agony", cost: 10, cat: "weapon", desc: "Additional hand weapon. Makes the extra attack separately — if it hits, the target must pass an Ld test (3D6, or 2D6 if immune to psychology) on its own basic Ld or it cannot strike back that phase. No roll to wound. Ridden monsters use their own Ld, not the rider's." },
  { id: "de-darksword", name: "Dark Sword", cost: 10, cat: "weapon", desc: "Wounded targets lose all attacks on their profile for the rest of the game." },
  { id: "de-chillblade", name: "Chill Blade", cost: 10, cat: "weapon", desc: "Any model wounded by this blade rolls a die at the start of each of its subsequent turns — on a 4+, it suffers an additional wound with no armour save allowed." },
  { id: "de-lifetaker", name: "Lifetaker", cost: 25, cat: "weapon", desc: "Repeating crossbow. May fire 1D6 magical shots at the same target each shooting phase, always hitting on 2+." },
  { id: "de-heartrender", name: "Heartrender", cost: 25, cat: "weapon", desc: "Lance. On the charge, a natural 6 to wound slays the target outright with no armour save (roughly man-sized models only, not on 40x40mm+ bases)." },
  { id: "de-deathsword", name: "Deathsword", cost: 80, cat: "weapon", desc: "S10." },
  { id: "de-burningsword", name: "Burning Sword of Khaine", cost: 120, cat: "weapon", desc: "Flaming attacks, +1D6 attacks, +2 strength." },
  { id: "de-helmkraken", name: "Helm of The Kraken", cost: 40, cat: "armour", desc: "4+ regeneration save. Causes terror." },
  { id: "de-armourhotek", name: "Armour of Hotek", cost: 50, cat: "armour", desc: "Heavy armour. 1+ armour save that cannot be improved further. Wounds that cause an instant kill or multiple wounds count as one wound only." },
  { id: "de-amberamulet", name: "Amber Amulet", cost: 15, cat: "enchanted", desc: "The bearer recovers one lost wound at the start of each player turn." },
  { id: "de-heartofwoe", name: "Heart of Woe", cost: 25, cat: "enchanted", desc: "If the bearer is slain in melee, the heart explodes: all models within a radius equal to the bearer's original wounds suffer one automatic hit at the bearer's Strength +1D6. Any wound inflicted multiplies into 1D6 wounds. Normal armour saves apply." },
  { id: "de-blackdragonegg", name: "Black Dragon Egg", cost: 35, cat: "enchanted", desc: "May be consumed at the start of any player turn. For the rest of that turn, the bearer has S and T 6, plus a Black Dragon's corrosive breath attack (models hit take a Toughness test and suffer wounds equal to the margin of failure, -1 armour save). One use only." },
  { id: "de-blackamulet", name: "Black Amulet", cost: 100, cat: "enchanted", desc: "Ward save 4+. Any wound saved during melee is rebounded against the attacker, no armour save allowed." },
  { id: "de-tomeoffurion", name: "Tome of Furion", cost: 20, cat: "arcane", desc: "Grants one additional spell, but not an additional magic level.", restrictedTo: [{ tags: ["wizard"] }] },
  { id: "de-sacrificialdagger", name: "Sacrificial Dagger", cost: 25, cat: "arcane", desc: "Once per magic phase, the wizard may sacrifice a member of their own unit to cast a spell for one power card less than required.", restrictedTo: [{ tags: ["wizard"] }] },
  { id: "de-gemofspite", name: "The Gem of Spite", cost: 30, cat: "arcane", desc: "Any successful dispel made by the wizard carrying this gem inflicts a S6 hit on the caster, if within 12\" and the dispel used a winds of magic card. Normal armour saves apply.", restrictedTo: [{ tags: ["wizard"] }] },
  { id: "de-nagarythe", name: "Banner of Nagarythe", cost: 10, cat: "banner", desc: "Must be carried by the Battle Standard Bearer. The bearer's regiment is unbreakable — this also applies to any High Elf Shadow Warriors within 12\" of the banner.", restrictedTo: [{ characterIds: ["elvenbsb"] }] },
  { id: "de-expertrider", name: "Expert Rider Banner", cost: 10, cat: "banner", desc: "Dark Riders only. May move and shoot without the usual -1 to hit penalty for moving.", restrictedTo: [{ regimentIds: ["darkriders"] }] },
  { id: "de-haggraef", name: "Standard of Hag Graef", cost: 40, cat: "banner", desc: "Except against a charging unit, the regiment Always Strikes First (not the mount). With double handed weapons, this simply cancels striking last — attacks resolve at normal Initiative." },
  { id: "de-bannerofmurder", name: "Banner of Murder", cost: 50, cat: "banner", desc: "+1D6 to charge move. Frenzied units carrying this banner must attempt a charge on a roll of 6 if contact with the enemy is possible; a failed charge moves as a normal failed charge." },
  { id: "de-bloodbanner", name: "Blood Banner", cost: 75, cat: "banner", desc: "Cold One Knights only. The Cold Ones become frenzied instead of stupid (the riders don't gain frenzy, but the regiment must still charge if possible).", restrictedTo: [{ regimentIds: ["coldoneriders"] }] },
];

const DARK_ELVES = {
  key: "darkelves",
  loreOptions: [...COLLEGE_LORES, "Dark Magic"],
  name: "Dark Elves",
  tagline: "The Druchii — cruel raiders and slavers of Naggaroth, sworn to Malekith and the Cult of Khaine",
  magicItems: [...COMMON_MAGIC_ITEMS, ...DARK_ELF_MAGIC_ITEMS],
  armyWideRules: [
    "All Dark Elves (i.e. not their mounts, nor Harpies or Hydras) hate all High Elves (but not Wood Elves).",
  ],
  characters: [
    {
      id: "firstamongequals", name: "First Among Equals", cost: 124, stat: "Elven Prince", magicItemSlots: 3,
      gearNote: "May take a shield and either light armour or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon", cost: 10, options: ["None (default)", "Repeating crossbow"] },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 27, stat: "Elven Steed" },
        { id: "coldone", name: "Cold One", cost: 30, stat: "Cold One" },
        { id: "spider", name: "Monstrous Spider", cost: 53, stat: "Monstrous Spider" },
        { id: "pegasus", name: "Dark Pegasus", cost: 61, stat: "Pegasus" },
        { id: "hydra", name: "War Hydra", cost: 181, stat: "War Hydra" },
        { id: "manticore", name: "Manticore", cost: 221, stat: "Manticore" },
        { id: "dragon", name: "Black Dragon", cost: 321, stat: "Black Dragon" },
      ],
    },
    {
      id: "elvenhero", name: "Elven Hero", cost: 74, stat: "Elven Hero (High Elf)", magicItemSlots: 2,
      gearNote: "May take a shield and either light armour or heavy armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon", cost: 10, options: ["None (default)", "Repeating crossbow"] },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 20, stat: "Elven Steed" },
        { id: "coldone", name: "Cold One", cost: 23, stat: "Cold One" },
        { id: "spider", name: "Monstrous Spider", cost: 46, stat: "Monstrous Spider" },
        { id: "pegasus", name: "Dark Pegasus", cost: 54, stat: "Pegasus" },
        { id: "hydra", name: "War Hydra", cost: 174, stat: "War Hydra" },
        { id: "manticore", name: "Manticore", cost: 214, stat: "Manticore" },
        { id: "dragon", name: "Black Dragon", cost: 314, stat: "Black Dragon" },
      ],
    },
    {
      id: "witchelfhero", name: "Witch Elf Hero", cost: 104, stat: "Elven Hero (High Elf)", magicItemSlots: 2,
      gearNote: "Subject to frenzy. Comes with light armour and two poisoned hand weapons by default — may forfeit all weapons and armour for free.",
      armourGroup: { options: ["Light Armour (default)", "No armour or weapons (forfeited)"] },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 20, stat: "Elven Steed" },
        { id: "coldone", name: "Cold One", cost: 23, stat: "Cold One" },
        { id: "spider", name: "Monstrous Spider", cost: 46, stat: "Monstrous Spider" },
        { id: "pegasus", name: "Dark Pegasus", cost: 54, stat: "Pegasus" },
        { id: "hydra", name: "War Hydra", cost: 174, stat: "War Hydra" },
        { id: "manticore", name: "Manticore", cost: 214, stat: "Manticore" },
        { id: "dragon", name: "Black Dragon", cost: 314, stat: "Black Dragon" },
      ],
    },
    {
      id: "elvenbsb", name: "Elven Battle Standard Bearer", cost: 88, stat: "Elven BSB (High Elf)", magicItemSlots: 1, restriction: "0-1", tags: ["bsb"],
      gearNote: "May take light armour or heavy armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour", "Heavy Armour"] },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 13, stat: "Elven Steed" },
        { id: "coldone", name: "Cold One", cost: 16, stat: "Cold One" },
      ],
    },
    {
      id: "assassin", name: "Dark Elf Assassin", cost: 60, stat: "Dark Elf Assassin", magicItemSlots: 1,
      gearNote: "The first Assassin in the army counts toward Regiments, not Characters — subsequent ones count as Characters. Conceals itself as an ordinary trooper in a Dark Elf infantry regiment (only one per regiment), revealed on entering melee, replacing a trooper — in the first combat round it strikes before Always-Strikes-First models and before challenges are declared. Fights with two poisoned hand weapons (+1S; each wound multiplies into 1D3). Fights normally (no strike-first) in later rounds, and becomes a free-roaming independent character once that combat ends. Can never be the general, and nobody may use its Ld. Dark Elf Assassins are the only type of Assassin that may take a magic item.",
    },
    {
      id: "sorcererlord", name: "Sorcerer Lord (level 4)", cost: 264, stat: "Mage Lord", magicItemSlots: 4, tags: ["wizard"],
      gearNote: "May take College Magic and Dark Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "coldone", name: "Cold One", cost: 0, stat: "Cold One" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
        { id: "pegasus", name: "Dark Pegasus", cost: 40, stat: "Pegasus" },
        { id: "hydra", name: "War Hydra", cost: 160, stat: "War Hydra" },
        { id: "manticore", name: "Manticore", cost: 200, stat: "Manticore" },
        { id: "dragon", name: "Black Dragon", cost: 300, stat: "Black Dragon" },
      ],
    },
    {
      id: "mastersorcerer", name: "Master Sorcerer (level 3)", cost: 186, stat: "Master Mage", magicItemSlots: 3, tags: ["wizard"],
      gearNote: "May take College Magic and Dark Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "coldone", name: "Cold One", cost: 0, stat: "Cold One" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
        { id: "pegasus", name: "Dark Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "sorcererchampion", name: "Sorcerer Champion (level 2)", cost: 122, stat: "Mage Champion", magicItemSlots: 2, tags: ["wizard"],
      gearNote: "May take College Magic and Dark Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "coldone", name: "Cold One", cost: 0, stat: "Cold One" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
        { id: "pegasus", name: "Dark Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "sorcerer", name: "Sorcerer (level 1)", cost: 58, stat: "Mage", magicItemSlots: 1, tags: ["wizard"],
      gearNote: "May take College Magic and Dark Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "coldone", name: "Cold One", cost: 0, stat: "Cold One" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
        { id: "pegasus", name: "Dark Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
  ],
  regiments: [
    {
      id: "harpies", name: "Harpies", perModel: 22, minSize: 5, stat: "Dark Elf Harpies", command: "none", restriction: "0-1",
      note: "Flying infantry. May skirmish. Cannot be joined by characters, and cannot take a standard bearer, musician, or regimental champion.",
    },
    {
      id: "beastmasterpack", name: "Chaos Hounds / Warhounds & Dark Elf Beastmasters", perModel: 0, minSize: 1, kind: "composite", restriction: "0-1",
      note: "Follows the main-rulebook rules for Beastmasters. Chaos Hounds and Warhounds do not mix in the same pack — pick one or the other. Warhounds stand on infantry bases but function as fast cavalry.",
      composition: [
        { id: "chaoshound", label: "Chaos Hounds", cost: 12, stat: "Chaos Hound" },
        { id: "warhound", label: "Warhounds", cost: 4, stat: "Dark Elf Warhounds" },
        { id: "beastmaster", label: "Dark Elf Beastmasters", cost: 14, stat: "Elven Warriors (High Elf)" },
      ],
    },
    {
      id: "elvenwarriors", name: "Elven Warriors", perModel: 7, minSize: 5, stat: "Wood Elf Warriors", command: "standard",
      note: "Elven Warriors with shields.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 0.5, per: "model" },
        { id: "ahw", group: "melee2", label: "Swap shield for additional hand weapon", cost: 0, per: "model" },
        { id: "dhw", group: "melee2", label: "Swap shield for double handed weapon", cost: 2, per: "model" },
        { id: "armour", group: "armour", label: "Light armour", cost: 0.5, per: "model" },
        { id: "heavyarmour", group: "armour", label: "Heavy armour", cost: 2.5, per: "model" },
        { id: "crossbows", group: null, label: "Repeating crossbows", cost: 4, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "elvencrossbowmen", name: "Elven Crossbowmen", perModel: 10, minSize: 5, stat: "Wood Elf Warriors", command: "standard",
      note: "Elven Warriors with repeating crossbows.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "executioners", name: "Executioners of Har Ganeth", perModel: 14, minSize: 5, stat: "Dark Elf Executioners", command: "standard", restriction: "0-1",
      note: "Executioners equipped with double handed weapons and heavy armour. Wounds dealt with their great axes multiply into 1D3 wounds.",
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "blackguard", name: "Black Guard of Naggaroth", perModel: 13, minSize: 5, stat: "Wood Elf Lords", command: "standard", restriction: "0-1",
      note: "Black Guard equipped with halberds and heavy armour. They hate all enemies.",
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "coldoneriders", name: "Cold One Riders", perModel: 27, minSize: 5, stat: "Wood Elf Lords", mountStat: "Cold One", mountLabel: "Cold One", command: "standard",
      note: "Elven Lords equipped with heavy armour, shields and lances, riding Cold Ones. Since Cold Ones are stupid, the whole regiment suffers from stupidity.",
      options: [
        { id: "crossbows", group: null, label: "Repeating crossbows", cost: 3, per: "model" },
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "blackarccorsairs", name: "Black Arc Corsairs", perModel: 10, minSize: 5, stat: "Wood Elf Warriors", command: "standard",
      note: "Elven Warriors with additional hand weapons and Sea Dragon Cloaks — a 5+ armour save that cannot be modified (not a ward save, and is cancelled by save-ignoring attacks).",
      options: [
        { id: "crossbows", group: null, label: "Repeating crossbows", cost: 4, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "witchelves", name: "Witch Elves", perModel: 12, minSize: 5, stat: "Wood Elf Warriors", command: "standard",
      note: "Witch Elves with light armour and two poisoned hand weapons (+1 strength). Subject to frenzy.",
      champion: { name: "Witch Elf Champion", baseCost: 30, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "darkriders", name: "Dark Riders", perModel: 24, minSize: 5, stat: "Wood Elf Warriors", mountStat: "Elven Steed", mountLabel: "Elven Steed", command: "fastCavalry",
      note: "Warriors riding Elven Steeds, equipped with light armour, spears, and repeating crossbows. Fast Cavalry. May skirmish, act as Vanguard troops, and Fire & Flee as a charge reaction (resolve a Stand & Shoot, then flee as normal — rallies automatically if not caught, unless below 25% of original size). Fire & Flee is lost if joined by characters other than the unit champion.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "shades", name: "Dark Elf Shades", perModel: 18, minSize: 5, stat: "Wood Elf Warriors", command: "standard",
      note: "Shades with light armour, additional hand weapons and repeating crossbows. May skirmish and scout.",
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
  ],
  chariotsMonsters: [
    {
      id: "boltthrowers", name: "Repeating Bolt Throwers", perUnit: 74, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Crewed by two Elven Warriors.",
      extraCrewCost: 7, extraCrewMax: 3, extraCrewLabel: "extra Elven Warrior crew",
      baseCrew: 2, crewArmourOptions: [{ id: "none", label: "No armour (default)", cost: 0 }, { id: "light", label: "Light armour", cost: 1 }],
    },
    {
      id: "monstrousspiders", name: "Monstrous Spiders / Scorpions", perUnit: 40, stat: "Monstrous Spider", kind: "quantity",
      note: "Monstrous Spiders are small monsters — follow the main-rulebook rules for Monstrous Spiders.",
    },
    {
      id: "cauldronofblood", name: "Witch Elf Cauldron of Blood", perUnit: 64, stat: "Wood Elf Warriors", kind: "warmachine", restriction: "0-1",
      note: "The cauldron itself is indestructible and causes terror (not represented by the crew's stat line above, which is shown only because the crew fights). Crewed by three Witch Elves with light armour and two poisoned hand weapons. While accompanying the cauldron, the crew doesn't have to charge or pursue despite being frenzied. If the cauldron hasn't moved and doesn't fight, the crew may perform unholy rituals — as long as maintained, all Witch Elf units within 24\" get an extra attack on top of frenzy.",
      extraCrewCost: 12, extraCrewMax: 2, extraCrewLabel: "extra Witch Elf crew",
      crewArmourFixed: "Light armour",
    },
    {
      id: "warhydra", name: "War Hydra", perUnit: 200, stat: "War Hydra", kind: "monster",
      note: "Causes terror, immune to psychology when on its own, and has a flaming breath attack with strength equal to its current wounds. Scaly skin confers a 5+ armour save that cannot be modified.",
    },
    {
      id: "coldonechariots", name: "Cold One Chariots", perUnit: 66, stat: "Heavy Chariot", kind: "chariot", crewArmourFixed: "Light armour",
      note: "Heavy Chariot pulled by two Cold Ones, crewed by two Elven Warriors with light armour, spears, shields and repeating crossbows (4+ armour save). Since Cold Ones are stupid, the chariot suffers from stupidity.",
      extraCrewCost: 9, extraCrewLabel: "extra Elven Warrior crew", extraSteedCost: 12, extraSteedLabel: "extra Cold One steeds",
      commanderCost: 43, commanderLabel: "One crewman is an Elven Commander", commanderMagicItemSlots: 1,
      scythedWheelsCost: 20,
    },
  ],
  specialCharacters: [
    { id: "malekith", name: "Malekith the Witch King", cost: 500, stat: "Malekith The Witch King", role: "Lord",
      note: "Immune to psychology. Causes fear. Casts spells as a Sorcerer Lord (magic level 4).",
      items: "Carries Circlet of Iron (arcane — grants an extra power or dispel card each magic phase), the Witch King's Armour (3+ armour save; enemies suffer -1 to hit him and his mount in both melee and shooting; may be worn along with the Spellshield and still cast spells), the Spellshield (a shield with 4+ natural dispel — a successful dispel with it inflicts a S6 hit, no save, on Malekith per power card spent), and Destroyer (a magic weapon — on a hit against a model with items or spells, roll a D6 per hit, on 4+ steal a random item or spell, usable until a new one is stolen, only one power stolen per melee phase).",
      mounts: [
        { id: "coldonechariot", name: "Cold One Chariot with Scythed Wheels", cost: 0, stat: "Heavy Chariot" },
        { id: "blackdragon", name: "Black Dragon", cost: 321, stat: "Black Dragon" },
      ] },
    { id: "tullaris", name: "Tullaris of Har Ganeth", cost: 200, stat: "Tullaris of Har Ganeth", role: "Hero",
      note: "Wears heavy armour.",
      items: "Carries the Executioner's Axe (unique to Tullaris — a double handed weapon; a natural 6 to wound slays the target outright with no armour save, roughly man-sized models only; otherwise wounds multiply into 1D3) and the Black Amulet (4+ ward save; any wound saved in melee rebounds on the attacker, no armour save allowed)." },
    { id: "rakarth", name: "The Beastlord Rakarth of Karond Kar", cost: 420, stat: "Elven Hero (High Elf)", role: "Hero",
      note: "Cannot be harmed by unridden monsters. Unique in being able to carry two pieces of magic armour.",
      items: "Carries the Whip of Agony (additional hand weapon — a separate hit forces an Ld test at 3D6/2D6 or the target can't strike back that phase, no wound roll), the Armour of Fortune (heavy armour, 5+ ward save), and the Enchanted Shield (+1 armour save, for a total of 3+).",
      mounts: [
        { id: "blackdragon", name: "Black Dragon", cost: 0, stat: "Black Dragon" },
      ] },
    { id: "morathi", name: "Morathi, The Hag Sorceress", cost: 300, stat: "Mage Lord", role: "Sorcerer Lord (level 4), using Slaanesh Magic",
      note: "May hand-pick her spells. May take four magic items.",
      mounts: [
        { id: "steed", name: "Elven Steed (may take Barding free)", cost: 0, stat: "Elven Steed" },
        { id: "pegasus", name: "Dark Pegasus", cost: 40, stat: "Pegasus" },
      ] },
    { id: "hellebron", name: "Crone Hellebron, The Hag Queen", cost: 450, stat: "Elven Prince", role: "Lord",
      note: "Frenzy. Wears light armour. Unique in carrying two magic weapons. Rides a Manticore. May take one additional magic item.",
      items: "Makes seven attacks with the Deathsword (S10), and one with her Parrying Blade (all enemy models in base contact with her lose one attack; Cavalry/Chariots/Ridden Monsters count as one model for this)." },
    { id: "kouran", name: "Kouran, Captain of the Black Guard", cost: 125, stat: "Elven Hero (High Elf)", role: "Hero",
      note: "Hates all enemies.",
      items: "Carries Blades of Ensorcelled Iron (two hand weapons, +1 to hit) and the Armour of Meteoric Iron (light armour, 2+ armour save that cannot be improved)." },
    { id: "shadowblade", name: "Shadowblade, Master of Assassins", cost: 150, stat: "Shadowblade, Master Assassin", role: "Follows the Assassin rules, with a twist",
      note: "Rather than hiding in a Dark Elf regiment, Shadowblade may instead deploy hidden in an enemy infantry regiment of Humans, Elves, Orcs, Beastmen Gors, Bestigors, Chaos Marauders, Chaos Warriors, Saurus Warriors, Zombies, Ghouls, or Hobgoblins. Reveal him at the start of any of your turns: roll 1D6 — on a 1 he was discovered before the battle (counts as slain); otherwise place him within 2D6\" of the nominated regiment, possibly directly into combat (counts as his move that turn).",
      items: "Carries two poisoned hand weapons (+1 strength, wounds multiply into 1D3), light armour, a Potion of Strength (+3 strength in one melee round, must be drunk just before attacking, one use), and the Heart of Woe (if slain in melee, all models within a radius equal to his original wounds suffer an automatic hit at his Strength +1D6, wounds multiply into 1D6, normal armour save applies)." },
    { id: "mallus", name: "Mallus Darkblade", cost: 250, stat: "Elven Prince", role: "Lord",
      note: "Wears heavy armour. At the start of any of your turns, Mallus may drink a dark elixir to lose consciousness and let the daemon Tz'arkan possess him for the rest of the battle: he gains Frenzy (never lost even if beaten in combat), +1WS/+1S/+1T/+1I, but each natural 1 he rolls to hit strikes a friendly model in base contact instead (opponent's choice).",
      items: "Carries the Warpsword of Khaine (ignores armour saves, re-roll failed rolls to wound).",
      mounts: [
        { id: "spite", name: "Spite, a Cold One that doesn't suffer from stupidity", cost: 30, stat: "Spite" },
      ] },
  ],
};

const SKAVEN_MAGIC_ITEMS = [
  { id: "sk-fellblade", name: "Fellblade", cost: 50, cat: "weapon", desc: "Wounds automatically. No armour save. 1 wound = 1D6 wounds. At the start of each Skaven turn, roll a die — on a 1, the bearer suffers a wound with no save of any kind possible (not even ward or regeneration)." },
  { id: "sk-warpstormscroll", name: "Warpstorm Scroll", cost: 10, cat: "enchanted", desc: "Bound spell, one use. All creatures flying high — friend and foe alike — suffer 1D6 wounds. Wounds on ridden monsters are randomised as per shooting." },
  { id: "sk-warpstonecharm", name: "Warpstone Charm", cost: 25, cat: "enchanted", desc: "Once per battle, the bearer may re-roll a single personal die roll and add or deduct 1 from the result." },
  { id: "sk-warpdustamulet", name: "Warpdust Amulet", cost: 50, cat: "enchanted", desc: "Enemies suffer -1 to hit and -1 to wound against the bearer." },
  { id: "sk-skavenbrew", name: "Skavenbrew", cost: 50, cat: "enchanted", desc: "Fed to the whole bearer's unit at the start of the battle. Roll 1D6: 1 no effect, 2-3 the unit hates all enemies, 4-5 the unit gains frenzy, 6 an extreme frenzy that doubles the unit's Movement and Attacks (1D3 models die from exhaustion at the end of each Skaven turn)." },
  { id: "sk-sacredstandard", name: "Sacred Standard of the Horned Rat", cost: 60, cat: "banner", desc: "Ld 8 for the regiment (before rank-bonus Ld is added). Natural dispel 4+ — if a spell is dispelled this way, the power used to cast it goes to the Skaven player's hand." },
  { id: "sk-stormbanner", name: "Storm Banner", cost: 60, cat: "banner", desc: "One use, activated at the start of any Skaven turn. For the rest of that turn: all BS-based shooting is at -2 to hit, all other shooting only succeeds on a 4+, and flying is impossible (ground move only) — all creatures flying high are driven off." },
];

const SKAVEN = {
  key: "skaven",
  loreOptions: ["Skaven Magic"],
  name: "Skaven",
  tagline: "The Under-Empire's rat-men — treacherous clans united only by the will of the Horned Rat",
  magicItems: [...COMMON_MAGIC_ITEMS, ...SKAVEN_MAGIC_ITEMS],
  armyWideRules: [
    "Strength in numbers: Skaven regiments add their rank bonus to their Ld for all tests (panic, break, fear, etc.) — use the highest Ld present (the general's, if within 12\") plus the rank bonus. Doesn't apply if the regiment can't claim a rank bonus (fleeing, skirmishing, lost to a flank attack, etc.).",
    "Lead from the back: Skaven characters may stand in the rear rank of a regiment. Even if a Skaven character refuses a challenge, the regiment may still use his Ld and other special rules, including spellcasting.",
    "Warpstone counts as magical: Assassins'/Gutter Runners' poisoned weapons, Poisoned Wind Globes, Plague Censers, pistol/handgun/Jezzail/Warpfire Thrower/Ratling Gun shots, and Lightning from Lightning Cannons/Doomwheels all count as magical attacks.",
    "Clanrat Warriors are mainstay: the number of Clanrat Warrior regiments caps the max number of any other regiment type or war machine (e.g. two Clanrat regiments allow up to two Plague Monk regiments, up to two Ratling Gun Teams, up to two Doomwheels, each counted separately). Not hard-enforced by this builder — track it yourself.",
    "Run to fight another day: all Skaven units flee an extra inch.",
    "Lesser breed: Rat Swarms, Giant Rats, and Skaven Slaves don't cause panic in other Skaven units when destroyed or broken (though they themselves still panic from each other).",
    "Warpstone tokens: a Skaven Wizard (not a Vermin Lord) carries as many Warpstone Tokens as he has levels, usable as a power card when casting. Consuming one forces a roll: on a 1, a Warlock becomes a mindless Chaos Spawn (a Grey Seer instead rolls 2D6 and only turns on double 1s). This is a battle-phase mechanic, not simulated here.",
    "Some Skaven spells are Grey Seer only (including for Vermin Lords) and are removed from the deck when Warlocks are dealt spells — a deck-building detail, not modeled in this points-based builder.",
  ],
  characters: [
    {
      id: "verminlord", name: "Vermin Lord (level 4)", cost: 600, stat: "Vermin Lord", magicItemSlots: 0, tags: ["wizard"],
      gearNote: "A large terror-causing Greater Daemon wielding a Doom Glaive (1D3 wounds). A level 4 wizard using the Skaven or Dark Magic spell decks. Daemon: immune to poison and to damage that only affects living models, attacks count as magical, immune to psychology and never flees (vanishes into the Realm of Chaos — counts as slain — if forced to). Daemonic Save 4+ (works as an armour save, but is cancelled by magical attacks, spells and items alike).",
    },
    {
      id: "skavenwarlord", name: "Skaven Warlord", cost: 88, stat: "Skaven Warlord", magicItemSlots: 3,
      gearNote: "May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon, magical bullets", cost: 10, options: ["None (default)", "Pistol", "Handgun"] },
    },
    {
      id: "skavenhero", name: "Skaven Hero", cost: 53, stat: "Skaven Hero", magicItemSlots: 2,
      gearNote: "May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon, magical bullets", cost: 10, options: ["None (default)", "Pistol", "Handgun"] },
    },
    {
      id: "skavenbsb", name: "Skaven Battle Standard Bearer", cost: 76, stat: "Skaven BSB", magicItemSlots: 1, restriction: "0-1", tags: ["bsb"],
      gearNote: "May take light armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour"] },
    },
    {
      id: "greyseer", name: "Grey Seer (level 4)", cost: 325, stat: "Grey Seer", magicItemSlots: 4, tags: ["wizard"],
      gearNote: "A level 4 wizard using the Skaven Spell Deck. Carries four Warpstone Tokens. May fire a missile weapon and still cast spells that phase.",
      missileGroup: { label: "Missile weapon, magical bullets", cost: 10, options: ["None (default)", "Pistol", "Handgun"] },
      mounts: [
        { id: "screamingbell", name: "Screaming Bell", cost: 175, stat: "Screaming Bell" },
      ],
    },
    {
      id: "masterwarlock", name: "Master Warlock (level 3)", cost: 172, stat: "Master Warlock", magicItemSlots: 3, tags: ["wizard"],
      gearNote: "Uses the Skaven Spell Deck. Carries as many Warpstone Tokens as levels (3). May fire a missile weapon and still cast spells that phase.",
      missileGroup: { label: "Missile weapon, magical bullets", cost: 10, options: ["None (default)", "Pistol", "Handgun"] },
    },
    {
      id: "warlockchampion", name: "Warlock Champion (level 2)", cost: 104, stat: "Warlock Champion", magicItemSlots: 2, tags: ["wizard"],
      gearNote: "Uses the Skaven Spell Deck. Carries as many Warpstone Tokens as levels (2). May fire a missile weapon and still cast spells that phase.",
      missileGroup: { label: "Missile weapon, magical bullets", cost: 10, options: ["None (default)", "Pistol", "Handgun"] },
    },
    {
      id: "warlock", name: "Warlock (level 1)", cost: 46, stat: "Warlock", magicItemSlots: 1, tags: ["wizard"],
      gearNote: "Uses the Skaven Spell Deck. Carries as many Warpstone Tokens as levels (1). May fire a missile weapon and still cast spells that phase.",
      missileGroup: { label: "Missile weapon, magical bullets", cost: 10, options: ["None (default)", "Pistol", "Handgun"] },
    },
    {
      id: "plaguepriest", name: "Plague Priest", cost: 73, stat: "Clan Pestilens Plague Priest", magicItemSlots: 2,
      gearNote: "Subject to frenzy. May only join regiments of Plague Monks. May take a shield and light armour for free.",
      armourGroup: { options: ["No armour (default)", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "assassin", name: "Assassin", cost: 40, stat: "Clan Eshin Assassin", magicItemSlots: 0,
      gearNote: "The first Assassin in the army counts toward Regiments, not Characters — subsequent ones count as Characters. Conceals itself as an ordinary trooper in a Skaven infantry regiment (only one per regiment), revealed on entering melee, replacing a trooper — in the first combat round it strikes before Always-Strikes-First models and before challenges are declared. Equipped with light armour and two poisoned hand weapons (+1S; each wound multiplies into 1D3). Fights normally (no strike-first) in later rounds, and becomes a free-roaming independent character once that combat ends. Can never be the general, and nobody may use its Ld.",
    },
  ],
  regiments: [
    {
      id: "clanratwarriors", name: "Clanrat Warriors", perModel: 4, minSize: 5, stat: "Clanrat Warriors", command: "standard",
      note: "Equipped with shields.",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "spears", group: null, label: "Spears", cost: 1, per: "model" },
      ],
      champion: { name: "Skaven Champion", baseCost: 10, magicItemSlots: 1, stat: "Skaven Champion" },
    },
    {
      id: "skavenslaves", name: "Skaven Slaves", perModel: 2.5, minSize: 5, stat: "Skaven Slaves", command: "standard",
      options: [
        { id: "armour", group: null, label: "Light armour", cost: 0.5, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
        { id: "spears", group: null, label: "Spears", cost: 0.5, per: "model" },
        { id: "slings", group: null, label: "Slings", cost: 0.5, per: "model" },
      ],
      champion: { name: "Skaven Champion", baseCost: 10, magicItemSlots: 1, stat: "Skaven Champion" },
    },
    {
      id: "plaguemonks", name: "Plague Monks", perModel: 8, minSize: 5, stat: "Plague Monks", command: "standard",
      note: "Frenzy. Equipped with light armour and additional hand weapons.",
      champion: { name: "Plague Acolyte", baseCost: 20, magicItemSlots: 1, stat: "Plague Acolyte" },
    },
    {
      id: "stormvermin", name: "Stormvermin", perModel: 8, minSize: 5, stat: "Stormvermin", command: "standard",
      note: "Equipped with light armour and halberds.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
      ],
      champion: { name: "Stormvermin Champion", baseCost: 20, magicItemSlots: 1, stat: "Stormvermin Champion" },
    },
    {
      id: "gutterrunners", name: "Gutter Runners", perModel: 15, minSize: 5, stat: "Gutter Runners", command: "skirmisher",
      note: "Light armour, additional hand weapons, and poisoned throwing stars (a light thrown weapon). May scout; must skirmish.",
      champion: { name: "Gutter Runner Champion", baseCost: 20, magicItemSlots: 1, stat: "Gutter Runner Champion" },
    },
    {
      id: "nightrunners", name: "Night Runners", perModel: 8, minSize: 5, stat: "Night Runners", command: "skirmisher",
      note: "Additional hand weapons. Must skirmish. May take a Vanguard move (a march move after scouts deploy, before turn 1).",
      champion: { name: "Night Runner Champion", baseCost: 10, magicItemSlots: 1, stat: "Night Runner Champion" },
    },
    {
      id: "poisonwindglobadiers", name: "Poison Wind Globadiers", perModel: 10, minSize: 5, stat: "Poison Wind Globadiers", command: "none",
      note: "Cannot take a standard bearer, musician, or regimental champion. Must skirmish. A Globadier may throw a Poison Wind Globe 6\" using BS to hit (no long-range penalty) — hits cause one automatic wound, no armour save. A natural 1 to hit shatters the globe early; the Globadier suffers a wound on a 5+ (counts as slain, only has one wound). Poison Wind Globes won't affect troops immune to poison.",
    },
    {
      id: "plaguecenserbearers", name: "Plague Censer Bearers", perModel: 20, minSize: 5, stat: "Plague Censer Bearers", command: "none",
      note: "Cannot take a standard bearer, musician, or regimental champion. Must skirmish. Enemies suffer -2 to hit them when shooting (including the skirmisher bonus). Frenzied and hate all enemies. In melee the censer works as a flail; additionally, everyone (friend and foe) in base contact with a Censer Bearer tests Toughness at the start of the melee phase or suffers a wound with no armour save (the Bearer himself only fails on a 6, having built up resistance). Fumes won't affect troops immune to poison.",
    },
    {
      id: "packmasterpack", name: "Skaven Packmasters, Giant Rats & Rat Ogres", perModel: 0, minSize: 1, kind: "composite", command: "none",
      note: "Follows the main-rulebook Beastmaster rules. Giant Rats (infantry) always pursue and fight one extra rank to the front; packs of Giant Rats move as fast cavalry (but can't cross water, being infantry). Rat Ogres (monstrous) cause fear and don't move as fast cavalry. Cannot take a standard bearer, musician, or regimental champion. Giant Rats and Rat Ogres count as two different regiment types for the Clanrat-mainstay cap — your army may include as many of each as you have Clanrat Warrior regiments.",
      composition: [
        { id: "packmaster", label: "Skaven Packmasters", cost: 11, stat: "Skaven Packmasters" },
        { id: "giantrat", label: "Giant Rats", cost: 2, stat: "Giant Rats" },
        { id: "ratogre", label: "Rat Ogres", cost: 20, stat: "Rat Ogres" },
      ],
    },
  ],
  chariotsMonsters: [
    {
      id: "ratswarm", name: "Rat Swarm", perUnit: 40, stat: "Rat Swarms", kind: "quantity", countsAsFirstRegiment: true,
      note: "The cheapest Rat Swarm base counts toward Regiments; further bases count toward Chariots, Monsters, and War Machines. Follow the main-rulebook rules for Swarms. Priced per base.",
    },
    {
      id: "doomwheel", name: "Doomwheel", perUnit: 125, stat: "Doomwheel", kind: "chariot",
      note: "A large chariot ridden by an Engineer (statistics of a Skaven Champion). Moves unpredictably: in the compulsory movement phase, face any direction and move 3D6\" straight — contact with any unit counts as a charge, delivering 1D6 S6 impact hits. While the rider lives, it may fire a lightning bolt in the shooting phase at the nearest enemy within 12\" (or everyone in base contact): 2D6 hits at a Strength set by the artillery die (a misfire wounds the Doomwheel itself once). The rider fights normally in melee, but attackers other than large targets/flyers suffer -2 to hit him, and he's immune to psychology. If the rider dies, the Doomwheel scatters randomly each turn (unless engaged) and auto-fails any Ld test.",
    },
    {
      id: "lightningcannon", name: "Lightning Cannon", perUnit: 100, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Crewed by three Skaven. Fires a lightning bolt 1D6x10\" directly away from the muzzle — everything under the line suffers one hit at a Strength set by the artillery die, no armour save, 1 wound = 1D6 wounds. First misfire: no shot, can't fire next turn. Second misfire: the cannon explodes. The beam is blocked by hills, rocky outcrops, and building walls, but not by forests, obstacles, or other difficult/impassable terrain.",
    },
    {
      id: "warpfirethrower", name: "Warpfire Thrower Team", perUnit: 50, stat: "Skaven Weapon Team", kind: "warmachine",
      note: "Weapon Team: two Skaven on one 25x50mm base, using the regular Clanrat Warrior statline but functioning as a single model with 2 Wounds, skirmisher-style (360° LoS, no facing when charged by flyers, can't move-and-fire, may stand & shoot). Guess up to 6\" plus the artillery die; a misfire destroys the team. Otherwise, the teardrop template (small end at the hit point) — models more than half covered suffer a S5 hit, 1 wound=1D3. Any casualty forces a panic test.",
    },
    {
      id: "ratlinggun", name: "Ratling Gun Team", perUnit: 75, stat: "Skaven Weapon Team", kind: "warmachine",
      note: "Weapon Team, built as above (regular Clanrat Warrior statline, single model with 2 Wounds). Range 18\", 2D6 shots, S3 armour piercing (-1 save). On any double, fires in a random (scatter die) direction instead, hitting the first unit in its path within range — each shot then hits automatically.",
    },
    {
      id: "jezzailteam", name: "Warplock Jezzail Team", perUnit: 25, stat: "Skaven Weapon Team", kind: "quantity", countsAsFirstRegiment: true, restriction: "0-5",
      note: "Up to five Warplock Jezzails team together as one unit, working just like a skirmish regiment (one choice for the Clanrat-mainstay cap). The cheapest unit counts toward Regiments; further units count toward Chariots, Monsters, and War Machines. Uses the regular Clanrat Warrior statline, but functions as a single model with 2 Wounds. A Jezzail is a potent hand gun: fires as normal using BS, range 36\", S5 armour piercing, and any wound inflicted multiplies into 1D3.",
    },
  ],
  specialCharacters: [
    { id: "thanquol", name: "Grey Seer Thanquol and Boneripper", cost: 500, stat: "Grey Seer", role: "Grey Seer (level 4)",
      note: "Thanquol must stand next to Boneripper, his bodyguard — if they're separated or Thanquol dies, Boneripper becomes subject to stupidity. Thanquol may use one Warpstone Token each magic phase and never has to test for turning into a Chaos Spawn. 4+ ward save. May take four magic items.",
      mounts: [
        { id: "boneripper", name: "Boneripper (bodyguard, always present)", cost: 0, stat: "Boneripper" },
      ] },
    { id: "snikch", name: "Deathmaster Snikch, Chief Assassin of Clan Eshin", cost: 225, stat: "Chief Assassin Deathmaster Snikch", role: "Follows the Assassin rules, with a twist — cannot be the army general",
      note: "Wields three poisoned blades as Assassins' weapons, +2 attacks for 6 total per round. Instead of infiltrating, may Scout (alone or with a Gutter Runners regiment). 4+ ward save. May take one additional magic item.",
      items: "Carries poisoned throwing stars and the Cloak of Shadows (if at least 4\" from the enemy at the start of the turn, cannot be charged, shot at, or targeted by a spell unless the opponent rolls a 6 to spot him — they may pick another target on a fail; if he's blocking a unit from being charged, simply move him aside to let the charge through) and the Bands of Power (enchanted, bound spell — if cast successfully, doubles the wielder's Strength until the next magic phase)." },
    { id: "ikitclaw", name: "Ikit Claw, Chief Warlock of Clan Skryre", cost: 450, stat: "Chief Warlock Ikit Claw", role: "Warlord and Grey Seer", tags: ["wizard"],
      note: "May use any spell deck except Waaagh Magic (as a Grey Seer, may use Grey-Seer-only spells; comes with four Warpstone Tokens). Unbreakable, but must flee along if his regiment flees. In the shooting phase, choose one: fire his pistol (magical warpstone bullets), cast Poison Wind Globes at double range (his high Strength), or fire his small Warpfire Thrower as a S4 breath weapon from his base (runs out on a preceding roll of 1-2 on a D6). May use all his gear and still cast spells. His mechanical claw's +1S is already reflected in his profile. May take three additional magic items.",
      items: "Carries the Storm Daemon, a magic halberd with a bound spell — may cast Warp Lightning (24\", 1D6 S5 hits, no armour save); after use, roll a die, on a 1 it's exhausted for the rest of the game (still counts as a magic halberd)." },
    { id: "skrolk", name: "Lord Skrolk, Plaguelord of Clan Pestilens", cost: 325, stat: "Plaguelord Lord Skrolk", role: "Lord", tags: ["wizard"],
      note: "Frenzy. Terror. Can only join regiments of Plague Monks. Enemies in base contact suffer -1 to hit him in melee. If he's the general, Plague Monks count as the mainstay regiment type instead of Clanrat Warriors. May take one more magic item, which may be an arcane item.",
      items: "Carries the Liber Bubonicus (makes him a level 2 wizard who may pick spells from Skaven's Putrefy/Plague/Pestilent Breath/Wither or Nurgle's Stream of Corruption/Miasma of Pestilence/Stench of Nurgle — when he casts Nurgle spells, Clan Pestilens models get the same immunities Nurgle followers would) and the Rod of Corruption (magic weapon — living models hit must pass a Toughness test or die instantly with no save of any kind; only tests once per melee phase; if passed, wound normally)." },
    { id: "queek", name: "Warlord Queek Head-Taker", cost: 225, stat: "Warlord Queek Head-Taker", role: "Lord",
      note: "Hates Orcs & Goblins and Dwarfs. +1 to hit and to wound in challenges. May take two additional magic items.",
      items: "Wields Dwarf-Gouger (magic weapon, no armour save, 1 wound = D3 wounds, always wounds Dwarfs on 2+) and wears the Warpstone Armour (light armour, 4+ ward save — each wound saved this way inflicts a S3 hit back on the attacker)." },
    { id: "throt", name: "Throt the Unclean", cost: 100, stat: "Throt the Unclean", role: "Cannot be the army general — may be used as a Packmaster",
      note: "May take one additional magic item.",
      items: "Wields a man catcher (against man-sized models, skip the wound roll — each model hit tests Toughness, once per melee round; on a fail, it's slain instantly with no saves of any kind) and carries a Warpstone Charm." },
  ],
};

function vcChampions(thrallCost, wightCost, wraithCost) {
  return [
    { id: "thrall", name: "Vampire Thrall", cost: thrallCost, stat: "Vampire Thrall", magicItemSlots: 1, tags: ["vampire"], itemSlotLabel: "Magic Item or Bloodline Power", note: "Equipped according to its bloodline. May take 1 magic item or bloodline power." },
    { id: "wightchamp", name: "Wight Champion", cost: wightCost, stat: "Wight Champion", magicItemSlots: 1, tags: ["wight"], itemSlotLabel: "Magic Item", note: "Equipped as you see fit within the limits of a Wight Hero. Carries a free Wight-Blade (1D3 wounds) unless another magic weapon is taken." },
    { id: "wraithchamp", name: "Wraith Champion", cost: wraithCost, stat: "Wraith Champion", magicItemSlots: 1, tags: ["wraith"], itemSlotLabel: "Magic Item", note: "Ethereal, causes terror, cannot be harmed by mundane weapons. Carries a free Wraith-Weapon (double handed, no armour save) unless another magic weapon is taken." },
  ];
}

const UNDEAD_MAGIC_ITEMS = [
  { id: "und-tombblade", name: "The Tomb Blade of Arkhan", cost: 25, cat: "weapon", desc: "If the bearer joins a regiment of Zombies, Skeletons, Tomb Guard, or Wight infantry, a new model is added to the unit each time the bearer kills a man-sized enemy with this blade. New models don't fight in the phase they're added." },
  { id: "und-swordofkings", name: "Sword of Kings", cost: 40, cat: "weapon", desc: "Wights only. 1 wound inflicted becomes 1D6 wounds. No armour save allowed.", restrictedTo: [{ tags: ["wight"] }] },
  { id: "und-ringofnight", name: "Ring of Night Creatures", cost: 10, cat: "enchanted", desc: "Vampires only. All Giant Wolves and Giant Bats on the battlefield become Stubborn, using the Leadership of the Vampire carrying this ring.", restrictedTo: [{ tags: ["vampire"] }] },
  { id: "und-mummyscurse", name: "Mummy's Curse", cost: 25, cat: "enchanted", desc: "Mummies only. A model that personally slays a Mummy wearing this amulet in melee suffers 1D3 wounds with no save of any kind.", restrictedTo: [{ tags: ["mummy"] }] },
  { id: "und-sceptrephantoms", name: "Sceptre of Phantoms", cost: 25, cat: "enchanted", desc: "Bound Spell. May target a visible, unengaged enemy unit within 24\" with a frightful image, forcing an immediate Panic test (unless immune to Panic or Fear). Usable up to three times per game." },
  { id: "und-amuletofdeath", name: "Amulet of Death", cost: 25, cat: "enchanted", desc: "Contains the Hand of Dust spell from the Necromancy deck. May be cast as a bound spell up to three times per game against an opponent in melee combat." },
  { id: "und-wristbands", name: "Wristbands of Black Gold", cost: 40, cat: "enchanted", desc: "The bearer and mount get a 3+ ward save against all ranged attacks (shooting, ranged magic, banshee howls, etc)." },
  { id: "und-blackskull", name: "Black Skull Talisman", cost: 40, cat: "enchanted", desc: "The bearer ignores the first wound suffered." },
  { id: "und-tombkingscrown", name: "Tomb King's Crown", cost: 50, cat: "enchanted", desc: "Mummies only. All models fighting in the same regiment as this character use his WS and BS.", restrictedTo: [{ tags: ["mummy"] }] },
  { id: "und-cursedbook", name: "Cursed Book", cost: 80, cat: "enchanted", desc: "Undead characters only. Living models suffer -1 to hit (shooting and melee) against the bearer and his regiment. The bearer can only join undead regiments with no living models.", restrictedTo: [{ tags: ["undeadCharacter"] }] },
  { id: "und-greenpearl", name: "The Green Pearl", cost: 0, cat: "arcane", desc: "A Vampire carrying the Green Pearl gains +1 Magic Level but does not learn an additional spell.", restrictedTo: [{ tags: ["vampire"] }] },
  { id: "und-swordunholy", name: "Sword of Unholy Power", cost: 25, cat: "arcane", desc: "Also a magic weapon. A winds of magic card is generated each time the bearer kills an enemy model with this blade — dealt to the bearer next magic phase, usable only by him." },
  { id: "und-forbiddengrimoire", name: "Forbidden Grimoire", cost: 25, cat: "arcane", desc: "Lich Lords, Necromancers, and Undead Priests only. May attempt to cast the same spell again and again in the same magic phase, until it's successfully cast.", restrictedTo: [{ tags: ["lichLord"] }, { tags: ["necromancer"] }, { tags: ["undeadPriest"] }] },
  { id: "und-evilscroll", name: "Evil Scroll", cost: 35, cat: "arcane", desc: "Undead Priests only. Usable as either a Power Scroll or a Dispel Magic Scroll (counts as neither for stacking limits).", restrictedTo: [{ tags: ["undeadPriest"] }] },
  { id: "und-staffdamnation", name: "Staff of Damnation", cost: 50, cat: "arcane", desc: "Bound Spell. May cast Vanhel's Danse Macabre for free, up to three times per game, once per magic phase." },
  { id: "und-wightkingscrown", name: "Wight King's Crown", cost: 50, cat: "arcane", desc: "Lich Lords and Necromancers only. May raise Wights instead of Skeletons when casting Raise the Dead, Summon Skeletons, or Summon Skeleton Horde. Works in combination with The Necronomicon.", restrictedTo: [{ tags: ["lichLord"] }, { tags: ["necromancer"] }] },
  { id: "und-necronomicon", name: "The Necronomicon", cost: 50, cat: "arcane", desc: "Lich Lords, Necromancers, and Undead Priests only. May replace any spell during selection with Raise the Dead, and raises an extra 1D6 Skeletons or Zombies when casting Raise the Dead/Summon Skeletons/Summon Skeleton Horde.", restrictedTo: [{ tags: ["lichLord"] }, { tags: ["necromancer"] }, { tags: ["undeadPriest"] }] },
  { id: "und-swiftshooting", name: "Banner of Swift Shooting", cost: 10, cat: "banner", desc: "Once per game, fire missile weapons twice at the same target in one Shooting phase, or Stand and Shoot without penalty." },
  { id: "und-swiftcharging", name: "Banner of Swift Charging", cost: 10, cat: "banner", desc: "On its first charge, the unit adds +2\" to its charge range. One use only." },
  { id: "und-hellishvigour", name: "Standard of Hellish Vigour", cost: 10, cat: "banner", desc: "Undead regiments only. I10.", restrictedTo: [{ tags: ["undead"] }] },
  { id: "und-ghostrider", name: "Ghost Rider Banner", cost: 10, cat: "banner", desc: "Skeleton Horsemen only. The unit may move through terrain as if ethereal.", restrictedTo: [{ tags: ["skeletonHorsemen"] }] },
  { id: "und-iconrakaph", name: "Icon of Rakaph", cost: 25, cat: "banner", desc: "Tomb Guard only. Once per battle, the unit may take a free complete reform before charges are declared.", restrictedTo: [{ tags: ["tombGuard"] }] },
  { id: "und-doomrider", name: "Doom Rider Banner", cost: 25, cat: "banner", desc: "Skeleton Horsemen only. The riders (not their steeds or accompanying characters) hit automatically on the charge.", restrictedTo: [{ tags: ["skeletonHorsemen"] }] },
  { id: "und-hiddendeath", name: "Banner of Hidden Death", cost: 25, cat: "banner", desc: "Battle Standard Bearer only. Monstrous Scorpions and Scorpion Swarms may deploy up to 12\" from the enemy, even in the open, after scouts but before vanguard.", restrictedTo: [{ tags: ["bsb"] }] },
  { id: "und-standarddesert", name: "Standard of the Desert", cost: 25, cat: "banner", desc: "Tomb Kings regiments only. May march even if not within 12\" of the general and even with enemies within 8\".", restrictedTo: [{ tags: ["tombKings"] }] },
  { id: "und-bloodkeep", name: "Banner of Blood Keep", cost: 100, cat: "banner", desc: "All Vampires in the regiment become subject to frenzy. Vampires leaving the regiment lose frenzy at the start of the next player turn." },
  { id: "und-binding", name: "Banner of Binding", cost: 100, cat: "banner", desc: "Skeletons only (not Tomb Guard). The unit does not crumble if it loses a combat and is instead Unbreakable.", restrictedTo: [{ tags: ["skeletonBanner"] }] },
];

const VC_BLOODLINE_POWERS = [
  { id: "bl-vc-wolfform", name: "Wolf Form", cost: 10, cat: "bloodlinepower", desc: "Movement Allowance 9. May join Giant Wolves (and receive a \"Look Out, Sir\" roll).", restrictedTo: [{ tags: ["voncarstein"] }] },
  { id: "bl-vc-transfix", name: "Transfix", cost: 10, cat: "bloodlinepower", desc: "Enemies in base contact must pass a LD test (own basic LD) or strike another target instead of the Vampire. No effect on models immune to psychology.", restrictedTo: [{ tags: ["voncarstein"] }] },
  { id: "bl-vc-darkmajesty", name: "Dark Majesty", cost: 50, cat: "bloodlinepower", desc: "Adds one point to combat resolution. If taken by the general, all undead units within 18\" may march.", restrictedTo: [{ tags: ["voncarstein"] }] },
  { id: "bl-vc-summonwolves", name: "Summon Wolves", cost: 50, cat: "bloodlinepower", desc: "Summons 1D6+1 Giant Wolves at the start of any Vampire Player turn (roll 1D6 for table edge); they may move but not charge. One use only.", restrictedTo: [{ tags: ["voncarstein"] }] },
  { id: "bl-vc-callstorm", name: "Call Storm", cost: 75, cat: "bloodlinepower", desc: "All shooting requiring BS is at -2 to hit, all other shooting only on a 4+, and flying is impossible for one full turn. One use only.", restrictedTo: [{ tags: ["voncarstein"] }] },
  { id: "bl-lah-mistform", name: "Mist Form", cost: 10, cat: "bloodlinepower", desc: "May fly up to 20\", except when charging into melee.", restrictedTo: [{ tags: ["lahmia"] }] },
  { id: "bl-lah-transfix", name: "Transfix", cost: 10, cat: "bloodlinepower", desc: "Enemies in base contact must pass a LD test (own basic LD) or strike another target instead of the Vampire. No effect on models immune to psychology.", restrictedTo: [{ tags: ["lahmia"] }] },
  { id: "bl-lah-beguile", name: "Beguile", cost: 25, cat: "bloodlinepower", desc: "Living enemies within 8\" of the Vampire suffer -1 to LD.", restrictedTo: [{ tags: ["lahmia"] }] },
  { id: "bl-lah-quicksilver", name: "Quicksilver Reactions", cost: 25, cat: "bloodlinepower", desc: "Ward save 5+.", restrictedTo: [{ tags: ["lahmia"] }] },
  { id: "bl-lah-palebeauty", name: "Death's Pale Beauty", cost: 25, cat: "bloodlinepower", desc: "Living enemies suffer -1 to hit in melee against the Vampire.", restrictedTo: [{ tags: ["lahmia"] }] },
  { id: "bl-lah-domination", name: "Domination", cost: 40, cat: "bloodlinepower", desc: "Enemies in base contact must pass a LD test (own basic LD) or cannot strike in melee and are hit automatically. No effect on models immune to psychology.", restrictedTo: [{ tags: ["lahmia"] }] },
  { id: "bl-nec-repulsive", name: "Utterly Repulsive", cost: 10, cat: "bloodlinepower", desc: "Cause terror.", restrictedTo: [{ tags: ["necrarch"] }] },
  { id: "bl-nec-acolyte", name: "Dark Acolyte", cost: 20, cat: "bloodlinepower", desc: "Counts as having one magic level extra without getting the extra spell. May combine with the undead-only item The Green Pearl for a combined two extra levels without extra spells.", restrictedTo: [{ tags: ["necrarch"] }] },
  { id: "bl-nec-foresight", name: "The Gift of Foresight", cost: 20, cat: "bloodlinepower", desc: "May handpick spells.", restrictedTo: [{ tags: ["necrarch"] }] },
  { id: "bl-nec-summoner", name: "Dark Summoner", cost: 50, cat: "bloodlinepower", desc: "May replace any spell during selection with Raise the Dead (if not already received). Raises an extra 1D6 Skeletons or Zombies when casting Raise the Dead, Summon Skeletons, or Summon Skeleton Horde.", restrictedTo: [{ tags: ["necrarch"] }] },
  { id: "bl-nec-blackarts", name: "Master of the Black Arts", cost: 100, cat: "bloodlinepower", desc: "May take an extra personal magic card each magic phase.", restrictedTo: [{ tags: ["necrarch"] }] },
  { id: "bl-bd-armsmaster", name: "Master of Arms", cost: 10, cat: "bloodlinepower", desc: "WS 10.", restrictedTo: [{ tags: ["blooddragon"] }] },
  { id: "bl-bd-challenger", name: "Terrifying Challenger", cost: 10, cat: "bloodlinepower", desc: "Enemy characters challenged by the Vampire must pass a LD test (own basic LD) or refuse the challenge and hide if possible. No effect on models immune to psychology.", restrictedTo: [{ tags: ["blooddragon"] }] },
  { id: "bl-bd-strength", name: "Strength of Steel", cost: 10, cat: "bloodlinepower", desc: "+1 Strength.", restrictedTo: [{ tags: ["blooddragon"] }] },
  { id: "bl-bd-redfury", name: "Red Fury", cost: 25, cat: "bloodlinepower", desc: "Frenzy.", restrictedTo: [{ tags: ["blooddragon"] }] },
  { id: "bl-bd-beastslayer", name: "Beast Slayer", cost: 25, cat: "bloodlinepower", desc: "Fighting with mundane weapons, each wound dealt multiplies into 1D3 wounds.", restrictedTo: [{ tags: ["blooddragon"] }] },
  { id: "bl-bd-martial", name: "Martial Excellence", cost: 50, cat: "bloodlinepower", desc: "+1 to hit on all melee attacks.", restrictedTo: [{ tags: ["blooddragon"] }] },
  { id: "bl-str-lordbeasts", name: "Lord of the Beasts", cost: 0, cat: "bloodlinepower", desc: "All Giant Wolves and Giant Bats on the battlefield become Stubborn, using this Vampire's Leadership.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-bloodgorger", name: "Blood Gorger", cost: 10, cat: "bloodlinepower", desc: "After breaking or wiping out a living enemy, may feed instead of pursuing/overrunning, recovering one lost wound. Not usable while subject to frenzy.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-longshanks", name: "Longshanks", cost: 10, cat: "bloodlinepower", desc: "Movement allowance 9.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-nightmares", name: "The Stuff of Nightmares", cost: 10, cat: "bloodlinepower", desc: "Cause terror.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-savageassault", name: "Savage Assault", cost: 25, cat: "bloodlinepower", desc: "+2 attacks on the charge.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-killerinstinct", name: "Killer Instinct", cost: 25, cat: "bloodlinepower", desc: "Each wound dealt by the Vampire multiplies into 1D3 wounds.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-ferocity", name: "Bestial Ferocity", cost: 25, cat: "bloodlinepower", desc: "Frenzy.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-revenant", name: "Curse of the Revenant", cost: 40, cat: "bloodlinepower", desc: "Regeneration 4+.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-envy", name: "Malignant Envy", cost: 50, cat: "bloodlinepower", desc: "May re-roll all failed attacks each combat round.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-summonghouls", name: "Summon Ghouls", cost: 50, cat: "bloodlinepower", desc: "Summons 1D6+2 Ghouls at the start of any turn (roll 1D6 for table edge); they may move but not charge. One use only.", restrictedTo: [{ tags: ["strigoi"] }] },
  { id: "bl-str-hellbeast", name: "Hell Beast", cost: 60, cat: "bloodlinepower", desc: "+1 wound, can fly, 40x40 base, may join a unit of Giant Bats (and receive a \"Look Out, Sir\" roll).", restrictedTo: [{ tags: ["strigoi"] }] },
];

const VC_ARMOUR_OPTIONS = ["No armour (default)", "Shield & Light Armour", "Heavy Armour"];
const VC_MELEE_OPTIONS = ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"];
const vcCastingGate = (unit, def) => (unit.armour || VC_ARMOUR_OPTIONS[0]) === VC_ARMOUR_OPTIONS[0] && (unit.melee || VC_MELEE_OPTIONS[0]) !== "Double handed weapon";

const VAMPIRE_COUNTS = {
  key: "vampirecounts",
  loreOptions: ["Dark Magic", "Necromancy Magic"],
  name: "Vampire Counts",
  tagline: "The night's aristocracy — decrepit castles that wake at the zenith of dark magic's power",
  magicItems: [...COMMON_MAGIC_ITEMS, ...UNDEAD_MAGIC_ITEMS, ...VC_BLOODLINE_POWERS],
  themes: {
    default: "voncarstein",
    label: "Bloodline",
    options: [
      { id: "voncarstein", name: "Von Carstein", desc: "Archetypical vampires — no innate special rules. Unlocks Peasant Levy (Sylvania Peasant Levy and Sylvania Archers)." },
      { id: "lahmia", name: "Lahmia", desc: "Deadly seductresses — never take weapons beyond a single hand weapon nor wear armour; I11, always strike first. Unlocks Swains." },
      { id: "necrarch", name: "Necrarch", desc: "Masters of magic — every Vampire (including Thralls) must take at least one magic level, up to four, and are always eligible to cast regardless of wargear. Unlocks Rat Swarms and a single unridden Zombie Dragon." },
      { id: "blooddragon", name: "Blood Dragon", desc: "Supreme warriors — cannot become spellcasters; may swap heavy armour for Full Plate Armour (4+ save) and an Undead Steed for a living Warhorse. Unlocks Vampire Knights." },
      { id: "strigoi", name: "Strigoi", desc: "Unholy monstrosities — cannot carry equipment, magic items, mounts, or the battle standard; get an extra attack and may join Ghoul regiments. Unlocks Ghasts." },
    ],
  },
  compositionRules: [
    { kind: "mutualExclusion", refs: [
      { list: "characters", id: "wightbsb", name: "Wight Battle Standard Bearer" },
      { list: "characters", id: "vampirebsb", name: "Vampire Battle Standard Bearer" },
    ] },
  ],
  armyWideRules: [
    "Undead models: immune to psychology, immune to poison, cause fear. May not march unless within 12\" of the general (undead characters excepted — they may always march, for what little good it does inside a regiment that can't). Only charge reaction is hold. An undead monster whose rider is slain crumbles to dust immediately instead of rolling on the Monster Reaction Table.",
    "Three ways to die: Unstable units (Zombies, all ethereal models) simply disappear on a failed break test. Units subject to the crumble rule (Skeletons, Wights, Vampires, Mummies, Carrion) don't take break tests — instead they suffer a wound with no saves for each point the combat was lost by (reduced by one if the Battle Standard is within range). Unbreakable troops (Ushabti, Bone Giants) never crumble or break, full stop. Casualties from crumbling are removed troops-first, then musician/standard, then characters one at a time.",
    "The general's will: if the general is slain, all undead units crumble to dust immediately. Undead characters (and mounts) are unaffected and remain. A regiment led by a character instead makes a LD test against the character's LD when the general dies — pass and it survives, fail and it crumbles entirely (the character remains); if that character is later slain or leaves, the regiment crumbles immediately. Not hard-enforced by this builder — a battle-phase trigger, not a list-building one.",
    "Ethereal models: unstable, always skirmish, can always march regardless of circumstance, move through solid objects (not other troops) and ignore terrain/obstacle penalties, but cannot end their move in impassable terrain. Immune to all non-magical harm (attacks from ethereal models themselves count as magical). No character may join an ethereal regiment except a Wraith champion.",
    "Mixing living and undead: a living character in an undead regiment that crumbles/vanishes automatically flees. An undead character in a living regiment is forced to flee with it; an undead character in an unstable regiment vanishes with it on a failed break test.",
    "Wight and Wraith weapons: every Wight carries a free Wight-Blade (1D3 wounds) and every Wraith a free Wraith-Weapon (double handed, no armour save) — regimental trooper, champion, or independent character alike. These don't use a magic item slot, but are forfeited the moment the bearer takes another magic weapon. When carrying both a magic and mundane weapon, choose which to fight with at the start of each combat.",
    "Bloodlines: pick one of the five Vampire Bloodlines above in the sidebar. All Vampires in the army (Lords, Counts, Thralls, BSBs) must share the same bloodline, and each bloodline power may only be taken once across the whole army — this builder enforces that the same way it enforces magic item uniqueness. The Lord/Count/BSB's own wargear and casting rules wire themselves up automatically once a bloodline is picked. Regimental Vampire Thrall champion options (in Zombies/Skeleton Warriors/etc.) automatically relabel to Strigoi Thrall and pick up the Strigoi profile's extra attack when the Strigoi bloodline is selected — note this only swaps name and statline, it does not restrict or unlock which regiments can take the option (Strigoi still can't carry ordinary equipment, so the item slot on those swapped Thralls should really only be spent on a bloodline power, same as the dedicated Ghast-only Strigoi Thrall option).",
    "Magic Items: the Weapons/Enchanted/Arcane/Banners pool at the end is common to all three Undead armies (Vampire Counts, Tomb Kings, Classic Undead) — restrictions are by character/regiment type (tags), not by which of the three armies you're playing.",
  ],
  characters: [
    {
      id: "vampirelord", name: "Vampire Lord", cost: 220, stat: "Vampire Lord", magicItemSlots: 2, bloodlinePowerSlots: 2, tags: ["vampire", "undeadCharacter"],
      armourGroup: { options: VC_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: VC_MELEE_OPTIONS },
      magicLevelOption: { label: "Magic levels (Necromancy or Dark Magic)", costPerLevel: 60, max: 2, min: 0, eligible: vcCastingGate, ineligibleNote: "Not eligible for magic levels while wearing armour or wielding a double handed weapon." },
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 51, stat: "Undead Steed" },
        { id: "wingednightmare", name: "Winged Nightmare", cost: 105, stat: "Winged Nightmare" },
        { id: "zombiedragon", name: "Zombie Dragon", cost: 345, stat: "Zombie Dragon" },
      ],
      bloodlineOverrides: {
        lahmia: { armourGroup: null, meleeGroup: null, magicLevelOption: { label: "Magic levels (Necromancy or Dark Magic)", costPerLevel: 60, max: 2, min: 0 }, gearNote: "Lahmia Vampires never take weapons beyond a single hand weapon and never wear armour. I11, always strikes first." },
        necrarch: { magicLevelOption: { label: "Magic levels (Necromancy or Dark Magic)", costPerLevel: 60, max: 4, min: 1 }, gearNote: "Necrarch Vampires may cast regardless of wargear, but must take at least one magic level." },
        blooddragon: { magicLevelOption: null, armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Heavy Armour", "Full Plate Armour (4+ save, no shield)"] }, mounts: [
          { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 51, stat: "Undead Steed" },
          { id: "warhorse", name: "Warhorse (living, barding free)", cost: 51, stat: "War Horse" },
          { id: "wingednightmare", name: "Winged Nightmare", cost: 105, stat: "Winged Nightmare" },
          { id: "zombiedragon", name: "Zombie Dragon", cost: 345, stat: "Zombie Dragon" },
        ], gearNote: "Blood Dragon Vampires cannot become spellcasters. May exchange heavy armour for Full Plate Armour, and an Undead Steed for a living Warhorse." },
        strigoi: { armourGroup: null, meleeGroup: null, magicLevelOption: null, mounts: [], magicItemSlots: 0, bloodlinePowerSlots: 4, stat: "Vampire Lord (Strigoi)",
          gearNote: "Strigoi Vampires cannot carry equipment, take magic items, ride a mount, or carry the battle standard. Get an extra attack (already reflected) and may join regiments of Ghouls. Strigoi Lords are allowed four bloodline powers instead of two." },
      },
    },
    {
      id: "vampirecount", name: "Vampire Count", cost: 154, stat: "Vampire Count", magicItemSlots: 2, tags: ["vampire", "undeadCharacter"],
      armourGroup: { options: VC_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: VC_MELEE_OPTIONS },
      magicLevelOption: { label: "Magic level (Necromancy or Dark Magic)", costPerLevel: 60, max: 1, min: 0, eligible: vcCastingGate, ineligibleNote: "Not eligible for a magic level while wearing armour or wielding a double handed weapon." },
      gearNote: "May take up to two magic items or bloodline powers, freely mixed (shown together below).",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 36, stat: "Undead Steed" },
        { id: "wingednightmare", name: "Winged Nightmare", cost: 90, stat: "Winged Nightmare" },
        { id: "zombiedragon", name: "Zombie Dragon", cost: 330, stat: "Zombie Dragon" },
      ],
      bloodlineOverrides: {
        lahmia: { armourGroup: null, meleeGroup: null, magicLevelOption: { label: "Magic level (Necromancy or Dark Magic)", costPerLevel: 60, max: 1, min: 0 }, gearNote: "Lahmia Vampires never take weapons beyond a single hand weapon and never wear armour. I11, always strikes first." },
        necrarch: { magicLevelOption: { label: "Magic levels (Necromancy or Dark Magic)", costPerLevel: 60, max: 4, min: 1 }, gearNote: "Necrarch Vampires may cast regardless of wargear, but must take at least one magic level." },
        blooddragon: { magicLevelOption: null, armourGroup: { options: ["No armour (default)", "Shield & Light Armour", "Heavy Armour", "Full Plate Armour (4+ save, no shield)"] }, mounts: [
          { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 36, stat: "Undead Steed" },
          { id: "warhorse", name: "Warhorse (living, barding free)", cost: 36, stat: "War Horse" },
          { id: "wingednightmare", name: "Winged Nightmare", cost: 90, stat: "Winged Nightmare" },
          { id: "zombiedragon", name: "Zombie Dragon", cost: 330, stat: "Zombie Dragon" },
        ], gearNote: "Blood Dragon Vampires cannot become spellcasters. May exchange heavy armour for Full Plate Armour, and an Undead Steed for a living Warhorse." },
        strigoi: { armourGroup: null, meleeGroup: null, magicLevelOption: null, mounts: [], magicItemSlots: 2, magicItemCategoryFilter: ["bloodlinepower"], stat: "Vampire Count (Strigoi)",
          gearNote: "Strigoi Vampires cannot carry equipment, take magic items, or ride a mount. Get an extra attack (already reflected) and may join regiments of Ghouls. May still take up to two Strigoi bloodline powers (shown below) — bloodline powers aren't equipment or magic items." },
      },
    },
    {
      id: "wighthero", name: "Wight Hero", cost: 82, stat: "Wight Hero", magicItemSlots: 2, tags: ["wight", "undeadCharacter"],
      innateWeapon: { name: "Wight-Blade", desc: "1D3 wounds" },
      armourGroup: { options: ["Shield & Light Armour (default)", "Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: VC_MELEE_OPTIONS },
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 22, stat: "Undead Steed" },
        { id: "wingednightmare", name: "Winged Nightmare", cost: 76, stat: "Winged Nightmare" },
        { id: "zombiedragon", name: "Zombie Dragon", cost: 316, stat: "Zombie Dragon" },
      ],
    },
    {
      id: "necromancerlord", name: "Necromancer Lord (level 4)", cost: 240, stat: "Necromancer Lord", magicItemSlots: 4, tags: ["wizard", "necromancer"],
      gearNote: "Living. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 0, stat: "Undead Steed" },
        { id: "manticore", name: "Manticore (living)", cost: 200, stat: "Manticore" },
      ],
    },
    {
      id: "masternecromancer", name: "Master Necromancer (level 3)", cost: 170, stat: "Master Necromancer", magicItemSlots: 3, tags: ["wizard", "necromancer"],
      gearNote: "Living. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (3).",
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 0, stat: "Undead Steed" }],
    },
    {
      id: "necromancerchampion", name: "Necromancer Champion (level 2)", cost: 110, stat: "Necromancer Champion", magicItemSlots: 2, tags: ["wizard", "necromancer"],
      gearNote: "Living. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (2).",
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 0, stat: "Undead Steed" }],
    },
    {
      id: "necromancer", name: "Necromancer (level 1)", cost: 50, stat: "Necromancer", magicItemSlots: 1, tags: ["wizard", "necromancer"],
      gearNote: "Living. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (1).",
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 0, stat: "Undead Steed" }],
    },
    {
      id: "wightbsb", name: "Wight Battle Standard Bearer", cost: 52, stat: "Wight BSB", magicItemSlots: 1, restriction: "0-1", tags: ["wight", "undeadCharacter", "bsb"],
      innateWeapon: { name: "Wight-Blade", desc: "1D3 wounds" },
      gearNote: "0-1 Battle Standard Bearer total across the army — a Wight BSB and Vampire BSB can't both be taken. The one magic item may be a magic banner.",
      armourGroup: { options: ["Light armour (default)", "Heavy Armour"] },
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 14, stat: "Undead Steed" }],
    },
    {
      id: "vampirebsb", name: "Vampire Battle Standard Bearer", cost: 80, stat: "Vampire BSB", magicItemSlots: 1, restriction: "0-1", tags: ["vampire", "undeadCharacter", "bsb"],
      gearNote: "0-1 Battle Standard Bearer total across the army — a Wight BSB and Vampire BSB can't both be taken. May take one bloodline power or one magic item, which may be a magic banner (shown together below). Strigoi Vampires cannot be Battle Standard Bearers.",
      armourGroup: { options: ["Light armour (default)", "Heavy Armour"] },
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 21, stat: "Undead Steed" }],
      bloodlineOverrides: {
        blooddragon: { armourGroup: { options: ["Light armour (default)", "Heavy Armour", "Full Plate Armour (4+ save)"] } },
      },
    },
    {
      id: "swain", name: "Swain", cost: 60, stat: "Swain", magicItemSlots: 2, theme: "lahmia", tags: ["swain"],
      gearNote: "Lahmia armies only — a human hero enthralled by his Vampire mistress. May take a shield and light or heavy armour for free. If not carrying a shield or a weapon upgrade, may carry the army's battle standard for +20pts (one of his two item slots may then be a magic banner) — not modeled as a toggle, track by hand.",
      armourGroup: { options: ["Shield & Light Armour (default)", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: VC_MELEE_OPTIONS },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow"] },
      mounts: [{ id: "warhorse", name: "Warhorse (barding free)", cost: 15, stat: "War Horse" }],
    },
  ],
  regiments: [
    {
      id: "ghouls", name: "Ghouls", perModel: 8, minSize: 5, stat: "Ghoul", command: "standard",
      note: "Living, cause fear, poisoned attacks (+1S). May skirmish; if not skirmishing, unbreakable in combat as long as the undead side outnumbers the enemy. Won't pursue or overrun after a won combat that inflicted a casualty (gorging on the fallen instead), except models with hatred/frenzy. Cannot be joined by characters (Strigoi Vampires excepted).",
    },
    {
      id: "zombies", name: "Zombies", perModel: 3, minSize: 5, stat: "Zombie", command: "standard", tags: ["undead"],
      note: "Unstable, undead, slow — always strike last, even when charging.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
        { id: "lightarmour", group: "armour", label: "Light armour", cost: 0.5, per: "model" },
        { id: "heavyarmour", group: "armour", label: "Heavy armour", cost: 1.5, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 0.5, per: "model" },
        { id: "halberds", group: "weapon", label: "Halberds", cost: 0.5, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons", cost: 2, per: "model" },
      ],
      championOptions: vcChampions(60, 25, 50),
    },
    {
      id: "skeletonwarriors", name: "Skeleton Warriors", perModel: 4.5, minSize: 5, stat: "Skeleton", command: "standard", tags: ["undead", "skeletonBanner"],
      note: "Undead, subject to the crumble rule.",
      options: [
        { id: "lightarmour", group: "armour", label: "Light armour", cost: 0, per: "model" },
        { id: "shield", group: "armour", label: "Shield", cost: 0, per: "model" },
        { id: "both", group: "armour", label: "Light armour and shield", cost: 0.5, per: "model" },
        { id: "heavyarmour", group: "armour", label: "Heavy armour", cost: 1.5, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 1, per: "model" },
        { id: "halberds", group: "weapon", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "longbows", group: "missile", label: "Longbows", cost: 1.5, per: "model" },
        { id: "crossbows", group: "missile", label: "Crossbows", cost: 2.5, per: "model" },
      ],
      missileExclusiveGroups: ["armour", "weapon"],
      championOptions: vcChampions(70, 35, 60),
    },
    {
      id: "skeletonhorsemen", name: "Skeleton Horsemen", perModel: 14, minSize: 5, stat: "Skeleton", mountStat: "Undead Steed", mountLabel: "Undead Steed", command: "fastCavalry", fastCavalryToggleOption: "heavyarmour", tags: ["undead", "skeletonHorsemen", "skeletonBanner"],
      note: "Undead, subject to the crumble rule. Skeletons with light armour and shields, riding Undead Steeds. Fast cavalry.",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light — loses fast cavalry, standard bearer becomes free", cost: 3, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 2, per: "model" },
        { id: "lances", group: "weapon", label: "Lances", cost: 4, per: "model" },
      ],
      championOptions: vcChampions(80, 50, 70),
    },
    {
      id: "wightguardsmen", name: "Wight Guardsmen", perModel: 10, minSize: 5, stat: "Wight", command: "standard", tags: ["undead"],
      note: "Undead, subject to the crumble rule. Wights with Wight-Blades and heavy armour.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "halberds", group: "weapon", label: "Non-magical halberds", cost: 1, per: "model" },
        { id: "dhw", group: "weapon", label: "Non-magical double handed weapons", cost: 3, per: "model" },
      ],
      championOptions: vcChampions(70, 35, 60),
    },
    {
      id: "wightknights", name: "Wight Knights", perModel: 22, minSize: 5, stat: "Wight", mountStat: "Undead Steed", mountLabel: "Undead Steed", command: "standard", tags: ["undead"],
      note: "Undead, subject to the crumble rule. Wights with Wight-Blades, heavy armour, shields, riding Undead Steeds.",
      options: [
        { id: "barding", group: null, label: "Barding", cost: 3, per: "model" },
        { id: "lances", group: null, label: "Non-magical lances", cost: 3, per: "model" },
      ],
      championOptions: vcChampions(80, 50, 70),
    },
    {
      id: "spirithosts", name: "Spirit Hosts", perModel: 60, minSize: 3, stat: "Spirit Host", command: "none", restriction: "0-1",
      note: "Ethereal, monstrous, always skirmish (being ethereal). No upgrades. Priced per base/model — use the size stepper to buy multiple bases.",
    },
    {
      id: "giantwolves", name: "Giant Wolves", perModel: 10, minSize: 5, stat: "Giant Wolf", command: "fastCavalry",
      note: "Living, fast cavalry. Never get standard bearer or musician upgrades. May not be joined by characters.",
    },
    {
      id: "giantbats", name: "Giant Bats", perModel: 30, minSize: 3, stat: "Giant Bat", command: "none", restriction: "0-1",
      note: "Living, flying monstrous regiment, automatically skirmishers. Priced per base/model — use the size stepper to buy multiple bases.",
    },
    {
      id: "peasantlevy", name: "Sylvania Peasant Levy", perModel: 3, minSize: 5, stat: "Sylvania Peasant", command: "standard", theme: "voncarstein",
      note: "Von Carstein armies only. Living peasant serfs.",
      options: [
        { id: "spears", group: "weapon", label: "Spears", cost: 0.5, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
      ],
      championOptions: [{ id: "thrall", name: "Von Carstein Vampire Thrall", cost: 70, stat: "Vampire Thrall", magicItemSlots: 1, tags: ["vampire"], itemSlotLabel: "Magic Item or Bloodline Power", note: "Equipped as you see fit within the limits for Von Carstein Thralls.", bloodlineSwap: { strigoi: { name: "Strigoi Thrall", stat: "Vampire Thrall (Strigoi)" } } }],
    },
    {
      id: "sylvaniaarchers", name: "Sylvania Archers", perModel: 5, minSize: 5, stat: "Sylvania Peasant", command: "standard", theme: "voncarstein",
      note: "Von Carstein armies only. Peasants with longbows.",
      options: [
        { id: "crossbows", group: null, label: "Swap longbows for crossbows", cost: 2, per: "model" },
      ],
      championOptions: [{ id: "thrall", name: "Von Carstein Vampire Thrall", cost: 70, stat: "Vampire Thrall", magicItemSlots: 1, tags: ["vampire"], itemSlotLabel: "Magic Item or Bloodline Power", note: "Equipped as you see fit within the limits for Von Carstein Thralls.", bloodlineSwap: { strigoi: { name: "Strigoi Thrall", stat: "Vampire Thrall (Strigoi)" } } }],
    },
    {
      id: "vampireknights", name: "Vampire Knights", perModel: 55, minSize: 5, stat: "Vampire Knight", mountStat: "War Horse", mountLabel: "War Horse", command: "standard", theme: "blooddragon", restriction: "0-1", tags: ["undead"],
      note: "Blood Dragon armies only, 0-1 regiment. Undead, subject to the crumble rule. Lances, Full Plate Armour, shields, living War Horses. May march even if not within 12\" of the general.",
      options: [
        { id: "barding", group: null, label: "Barding", cost: 0, per: "model" },
      ],
      championOptions: [{ id: "thrall", name: "Vampire Thrall", cost: 85, stat: "Vampire Thrall", magicItemSlots: 1, tags: ["vampire"], itemSlotLabel: "Magic Item or Bloodline Power", note: "Equipped like the rest of the regiment.", bloodlineSwap: { strigoi: { name: "Strigoi Thrall", stat: "Vampire Thrall (Strigoi)" } } }],
    },
    {
      id: "ghasts", name: "Ghasts", perModel: 35, minSize: 3, stat: "Ghast", command: "none", theme: "strigoi", restriction: "0-1",
      note: "Strigoi armies only, 0-1 regiment. Monstrous, living, poisoned attacks (+1S), cause fear. Unbreakable in combat as long as the undead side outnumbers the enemy. Won't pursue/overrun after a won combat that inflicted a casualty, except models with hatred/frenzy. No standard or musician upgrades. Cannot be joined by characters except a Strigoi Thrall.",
      championOptions: [{ id: "strigoithrall", name: "Strigoi Thrall", cost: 70, stat: "Vampire Thrall", magicItemSlots: 1, tags: ["strigoi"], itemSlotLabel: "Bloodline Power", magicItemCategoryFilter: ["bloodlinepower"], note: "May take one bloodline power (no magic items — Strigoi cannot carry equipment)." }],
    },
  ],
  chariotsMonsters: [
    {
      id: "blackcoach", name: "Black Coach", perUnit: 125, stat: "Black Coach", mountStat: "Wraith", mountLabel: "Wraith Driver",
      note: "Undead, large chariot pulled by two Undead Steeds and driven by a Wraith with a Wraith-Weapon (double handed, no armour save). The Wraith is a character — if slain, the Black Coach crumbles immediately. Causes terror, cannot be harmed by mundane weapons. Recovers one lost wound for every wound it causes in melee; once fully healed, gains scythed wheels instead for the rest of the battle.",
      commanderCost: 0, commanderLabel: "Wraith driver takes a magic item", commanderMagicItemSlots: 1,
    },
    {
      id: "batswarm", name: "Bat Swarm", kind: "quantity", perUnit: 40, stat: "Bat Swarm",
      note: "Living. Follows the main-rulebook rules for Swarms. Priced per base.",
    },
    {
      id: "ratswarm-necrarch", name: "Rat Swarm", perUnit: 40, stat: "Rat Swarms", kind: "quantity", countsAsFirstRegiment: true, theme: "necrarch",
      note: "Necrarch armies only. As described in the Skaven army book. The cheapest base counts toward Regiments; further bases count toward Chariots, Monsters, and War Machines. Priced per base.",
    },
    {
      id: "zombiedragon-unridden", name: "Unridden Zombie Dragon", kind: "quantity", perUnit: 375, stat: "Zombie Dragon", theme: "necrarch", restriction: "0-1",
      note: "Necrarch armies only, 0-1. An independent large undead monster, subject to the crumble rule.",
    },
  ],
  specialCharacters: [
    { id: "vladisabella", name: "Vlad and Isabella von Carstein", cost: 600, stat: "Vampire Lord", role: "Von Carstein — Vlad is a Vampire Lord, Isabella a Vampire Thrall", theme: "voncarstein", tags: ["wizard"],
      note: "Vlad is a level 2 wizard with the Dark Majesty bloodline power, and may take one additional magic item and one bloodline power. Isabella has the Transfix bloodline power. Vlad and Isabella always stay together and try to reunite if separated; if one is killed for good, the other gains frenzy and hatred.",
      items: "Vlad carries the Carstein Ring (one use only) — if slain, he returns to play immediately within 12\" of the killing spot, restored to one wound, having lost all equipment and magic items (spells and bloodline powers stay intact). This resurrection prevents the army from crumbling from the general's death." },
    { id: "mannfred", name: "Mannfred von Carstein", cost: 400, stat: "Vampire Count", role: "Von Carstein — Vampire Count with 4 magic levels", theme: "voncarstein",
      note: "May ride an Undead Steed for free (barding free). May take 4 magic items or bloodline powers, in any combination." },
    { id: "konrad", name: "Konrad von Carstein", cost: 180, stat: "Vampire Count", role: "Von Carstein — an insane Vampire Count", theme: "voncarstein",
      note: "Subject to frenzy, hates all enemies, cannot use magic. Carries an additional hand weapon and heavy armour. May take 2 magic items or bloodline powers." },
  ],
};

const TK_MELEE_OPTIONS = ["Hand weapon (default)", "Flail", "Spear", "Double handed weapon"];

function tkMummyChampion(cost) {
  return [{ id: "mummychamp", name: "Mummy Champion", cost, stat: "Mummy Champion", magicItemSlots: 1, tags: ["mummy"], itemSlotLabel: "Magic Item", note: "Flammable undead Mummy Champion, equipped with light armour and a double handed weapon." }];
}

const TOMB_KINGS = {
  key: "tombkings",
  loreOptions: ["Dark Magic", "Necromancy Magic"],
  name: "Tomb Kings",
  tagline: "The ancient kings of Nehekhara, called from their sleep of death to seek vengeance",
  magicItems: [...COMMON_MAGIC_ITEMS, ...UNDEAD_MAGIC_ITEMS],
  armyWideRules: [
    "Undead models: immune to psychology, immune to poison, cause fear. May not march unless within 12\" of the general (undead characters excepted). Only charge reaction is hold. An undead monster whose rider is slain crumbles to dust immediately instead of rolling on the Monster Reaction Table.",
    "A dry army: save for Scorpions, every model in the Tomb Kings army is undead. There are no Zombies and no ethereal troops — only models subject to the crumble rule (Skeletons, Tomb Guard, Mummies, Carrion) or Unbreakable (Ushabti, Bone Giants).",
    "Crumbling: units subject to the crumble rule don't take break tests — instead they suffer a wound with no saves for each point the combat was lost by (reduced by one if the Battle Standard is within range). The general's death causes all undead units to crumble immediately; undead characters are unaffected. A regiment led by a character makes a LD test against the character's LD when the general dies — pass and it survives, fail and it crumbles entirely (not hard-enforced by this builder — a battle-phase trigger, not a list-building one).",
    "Raise the Dead: no Tomb Kings caster can raise Zombies, only Skeletons. The Raise the Dead / Summon Skeletons / Summon Skeleton Horde spells can also raise extra models for a Tomb Guard regiment and extra crew for a Screaming Skull Catapult or the Casket of Souls (but not once all crew are dead), and can restore lost wounds to Skeleton Chariots, Screaming Skull Catapults, Ushabti, and Bone Giants.",
    "Asp Arrows: every bow fired by a Tomb Kings model is a magical Asp Arrow and never suffers negative shooting modifiers.",
    "Magic Items: the Weapons/Enchanted/Arcane/Banners pool at the end is common to all three Undead armies (Vampire Counts, Tomb Kings, Classic Undead) — restrictions are by character/regiment type (tags), not by which of the three armies you're playing.",
    "Mounting a character on a Skeleton Heavy Chariot: the book prices this \"for the cost of the chariot\", which varies with the chariot's own upgrades. This builder approximates it at the chariot's 60pt base cost — adjust by hand if you add chariot upgrades underneath a mounted character.",
  ],
  characters: [
    {
      id: "mummyking", name: "Mummy King", cost: 184, stat: "Mummy King", magicItemSlots: 3, tags: ["mummy", "undeadCharacter"],
      gearNote: "Flammable. May take a shield and light armour for free.",
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: TK_MELEE_OPTIONS },
      mounts: [
        { id: "undeadsteed", name: "Undead Steed", cost: 42, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "mummyprince", name: "Mummy Prince", cost: 129, stat: "Mummy Prince", magicItemSlots: 2, tags: ["mummy", "undeadCharacter"],
      gearNote: "Flammable. May take a shield and light armour for free.",
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: TK_MELEE_OPTIONS },
      mounts: [
        { id: "undeadsteed", name: "Undead Steed", cost: 30, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "mummybsb", name: "Mummy Battle Standard Bearer", cost: 90, stat: "Mummy BSB", magicItemSlots: 1, restriction: "0-1", tags: ["mummy", "undeadCharacter", "bsb"],
      gearNote: "Flammable. 0-1 per army. May take light armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["Light armour (default)"] },
      mounts: [
        { id: "undeadsteed", name: "Undead Steed", cost: 18, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "undeadpriestlord", name: "Undead Priest Lord (level 4)", cost: 240, stat: "Undead Priest Lord", magicItemSlots: 4, tags: ["wizard", "undeadPriest", "undeadCharacter"],
      gearNote: "Undead, subject to the crumble rule. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed", cost: 0, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "masterundeadpriest", name: "Master Undead Priest (level 3)", cost: 170, stat: "Master Undead Priest", magicItemSlots: 3, tags: ["wizard", "undeadPriest", "undeadCharacter"],
      gearNote: "Undead, subject to the crumble rule. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed", cost: 0, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "undeadpriestchampion", name: "Undead Priest Champion (level 2)", cost: 110, stat: "Undead Priest Champion", magicItemSlots: 2, tags: ["wizard", "undeadPriest", "undeadCharacter"],
      gearNote: "Undead, subject to the crumble rule. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed", cost: 0, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "undeadpriest", name: "Undead Priest (level 1)", cost: 50, stat: "Undead Priest", magicItemSlots: 1, tags: ["wizard", "undeadPriest", "undeadCharacter"],
      gearNote: "Undead, subject to the crumble rule. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed", cost: 0, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
      ],
    },
  ],
  regiments: [
    {
      id: "tombguards", name: "Tomb Guards", perModel: 7, minSize: 5, stat: "Tomb Guard", command: "standard", tags: ["undead", "tombKings", "tombGuard"],
      note: "Undead, subject to the crumble rule. Elite Skeletons with light armour and shields.",
      options: [
        { id: "dhw", group: null, label: "Swap shields for double handed weapons", cost: 1, per: "model" },
      ],
      championOptions: [
        { id: "mummychamp", name: "Mummy Champion", cost: 60, stat: "Mummy Champion", magicItemSlots: 1, tags: ["mummy"], itemSlotLabel: "Magic Item", note: "Flammable, equipped with light armour and a double handed weapon." },
        { id: "tombchamp", name: "Tomb Champion", cost: 30, stat: "Tomb Champion", magicItemSlots: 1, tags: ["tombGuard"], itemSlotLabel: "Magic Item", note: "A skeletal champion, equipped the same way as the regiment." },
      ],
    },
    {
      id: "carrion-tk", name: "Carrion", perModel: 50, minSize: 1, stat: "Carrion", command: "none", restriction: "0-1", tags: ["undead", "tombKings"],
      note: "Undead, subject to the crumble rule. Monstrous flyers, always skirmishers. No upgrades. Priced per base/model — use the size stepper to buy multiple bases.",
    },
    {
      id: "ushabti", name: "Ushabti", perModel: 50, minSize: 3, stat: "Ushabti", command: "none", tags: ["undead", "tombKings"],
      note: "Unbreakable monstrous undead. No standard bearer or musician upgrades.",
      options: [
        { id: "colossi", group: "ushabtiupgrade", label: "Upgrade to Colossi — all models get T5", cost: 15, per: "model" },
        { id: "giantbows", group: "ushabtiupgrade", label: "Giant bows instead — 36\", S5 Asp Arrows, each wound 1D3 wounds", cost: 15, per: "model" },
      ],
    },
    {
      id: "skeletonlightchariots", name: "Skeleton Light Chariots", perModel: 50, minSize: 3, stat: "Light Chariot", mountStat: "Skeleton", mountLabel: "Skeleton Crew", command: "monstrous", tags: ["undead", "tombKings"],
      note: "Undead, subject to the crumble rule. Each chariot pulled by two Undead Steeds, crewed by two Skeleton Warriors with light armour, spears, shields, and bows (5+ save). Moves and fights as a single monstrous-style regiment — no rank bonus, no fighting in several ranks.",
      commanderCost: 50, commanderLabel: "Replace a crewman with a Mummy Champion (light armour, double handed weapon)", commanderMagicItemSlots: 1, commanderTags: ["mummy"],
    },
    {
      id: "skeletonwarriors-tk", name: "Skeleton Warriors", perModel: 4.5, minSize: 5, stat: "Skeleton", command: "standard", tags: ["undead", "tombKings", "skeletonBanner"],
      note: "Undead, subject to the crumble rule.",
      options: [
        { id: "lightarmour", group: "armour", label: "Light armour", cost: 0, per: "model" },
        { id: "shield", group: "armour", label: "Shield", cost: 0, per: "model" },
        { id: "both", group: "armour", label: "Light armour and shield", cost: 0.5, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 1, per: "model" },
        { id: "bows", group: "missile", label: "Bows", cost: 1.5, per: "model" },
      ],
      missileExclusiveGroups: ["armour", "weapon"],
      championOptions: tkMummyChampion(60),
    },
    {
      id: "skeletonlighthorsemen", name: "Skeleton Light Horsemen", perModel: 14, minSize: 5, stat: "Skeleton", mountStat: "Undead Steed", mountLabel: "Undead Steed", command: "fastCavalry", tags: ["undead", "tombKings", "skeletonHorsemen"],
      note: "Undead, subject to the crumble rule. Skeletons armed with bows, riding Undead Steeds. Fast Cavalry.",
      championOptions: tkMummyChampion(80),
    },
    {
      id: "skeletonheavyhorsemen", name: "Skeleton Heavy Horsemen", perModel: 16, minSize: 5, stat: "Skeleton", mountStat: "Undead Steed", mountLabel: "Undead Steed", command: "fastCavalry", tags: ["undead", "tombKings", "skeletonHorsemen"],
      note: "Undead, subject to the crumble rule. Skeletons armed with spears, light armour, and shields, riding Undead Steeds. Despite the name, still act as fast cavalry.",
      championOptions: tkMummyChampion(80),
    },
    {
      id: "mummies", name: "Mummies", perModel: 18, minSize: 3, stat: "Mummy", command: "standard", tags: ["undead", "tombKings", "mummy"],
      note: "Undead, subject to the crumble rule. Flammable. Equipped with light armour.",
      options: [
        { id: "dhw", group: null, label: "Double handed weapons", cost: 6, per: "model" },
      ],
      championOptions: tkMummyChampion(60),
    },
  ],
  chariotsMonsters: [
    {
      id: "bonegiant", name: "Bone Giant", perUnit: 200, stat: "Bone Giant",
      note: "Unbreakable large undead monster. Causes terror.",
      variantOptions: [
        { id: "sphinx", label: "Upgrade to a Sphinx or similar creature (50x100mm base): +1WS, +1S, +1T, +1W, +1A", cost: 100 },
      ],
    },
    {
      id: "monstrousscorpion", name: "Monstrous Scorpion", kind: "quantity", perUnit: 40, stat: "Monstrous Scorpion",
      note: "Living small monster. Follows the main-rulebook rules for Monstrous Scorpions/Spiders.",
    },
    {
      id: "scorpionswarm", name: "Scorpion Swarm", kind: "quantity", perUnit: 40, stat: "Scorpion Swarm",
      note: "Living. Follows the main-rulebook rules for Swarms. Priced per base.",
    },
    {
      id: "casketofsouls", name: "Casket of Souls", kind: "warmachine", perUnit: 150, stat: "Tomb Guard", restriction: "0-1",
      note: "An immoveable terrain piece that blocks movement, crewed by three unbreakable Tomb Guards with double handed weapons and light armour. If all crew are slain or leave, the Casket crumbles to dust. Causes terror. Contains a bound spell: if cast while unengaged, all non-undead units within 24\" with line of sight suffer 2D6+2 minus their LD in wounds, no armour save. Hits on the Casket itself are ignored — it's indestructible.",
      extraCrewCost: 10, extraCrewLabel: "Extra Tomb Guard crew (max 2)",
      crewArmourFixed: "Light armour",
    },
    {
      id: "skeletonheavychariots", name: "Skeleton Heavy Chariot", perUnit: 60, stat: "Heavy Chariot", mountStat: "Skeleton", mountLabel: "Skeleton Crew",
      note: "Undead, subject to the crumble rule. Pulled by two Undead Steeds, crewed by two Skeleton Warriors with light armour, spears, shields, and bows (5+ save). Cannot form or join regiments — that's a special rule only for light chariots.",
      extraCrewCost: 6, extraCrewLabel: "Extra Skeleton Warrior crew (max 2, one may become the commander below instead)",
      extraSteedCost: 4, extraSteedLabel: "Extra Undead Steeds (max 2, widens the base)",
      scythedWheelsCost: 20,
      commanderCost: 60, commanderLabel: "One extra crewman is a Mummy Champion (light armour, double handed weapon) instead", commanderMagicItemSlots: 1, commanderTags: ["mummy"],
    },
    {
      id: "screamingskullcatapult", name: "Screaming Skull Catapult", kind: "warmachine", perUnit: 100, stat: "Skeleton",
      note: "Undead, subject to the crumble rule. Small Stone Thrower crewed by three Skeletons. An enemy unit that suffers at least one wound must take a Panic test. Hits count as flaming.",
      extraCrewCost: 5, extraCrewLabel: "Extra crew (max 2)",
    },
  ],
  specialCharacters: [
    { id: "settra", name: "Settra the Imperishable", cost: 350, stat: "Settra the Imperishable", role: "Mummy King",
      note: "Causes terror. Wears light armour. The Blessed Blade of Ptra ensures Settra always strikes first. The Crown of Nehekhara gives a 4+ ward save to Settra (and his chariot, if mounted). The Staff of Osiris is a bound spell — a fiery magic missile up to 24\" hitting the first unit in its path with a S6 hit causing 1D3 wounds, no armour save, penetrating as a bolt thrower. May ride a Skeleton Heavy Chariot for the price of the chariot." },
    { id: "arkhan", name: "Arkhan the Black", cost: 555, stat: "Arkhan the Black", role: "Lich Lord — undead, 4 magic levels",
      note: "Causes terror. Rides a flying, scythed Heavy Chariot with three extra crewmen, pulled by four Undead Steeds (already included in cost). May take 4 magic items." },
    { id: "khalida", name: "High Queen Khalida Neferher", cost: 250, stat: "High Queen Khalida Neferher", role: "Mummy King with light armour",
      note: "Causes terror. All of her attacks count as poisoned (+1 Strength) and deal 1D3 wounds each — this is cancelled if she takes a magic weapon instead. Has Regeneration (4+). May take three magic items. May ride a Skeleton Heavy Chariot for the price of the chariot." },
  ],
};

function cuChampions(thrallCost, wightCost, wraithCost) {
  return [
    { id: "vcthrall", name: "Von Carstein Vampire Thrall", cost: thrallCost, magicItemSlots: 1, tags: ["vampire", "voncarstein"], itemSlotLabel: "Magic Item or Bloodline Power", note: "Equipped as you see fit within the limits for Von Carstein Thralls. May take 1 magic item or Von Carstein bloodline power." },
    { id: "wightchamp", name: "Wight Champion", cost: wightCost, stat: "Wight Champion", magicItemSlots: 1, tags: ["wight"], itemSlotLabel: "Magic Item", note: "Equipped as you see fit within the limits of a Wight Hero. Carries a free Wight-Blade (1D3 wounds) unless another magic weapon is taken." },
    { id: "wraithchamp", name: "Wraith Champion", cost: wraithCost, stat: "Wraith Champion", magicItemSlots: 1, tags: ["wraith"], itemSlotLabel: "Magic Item", note: "Ethereal, causes terror, cannot be harmed by mundane weapons. Carries a free Wraith-Weapon (double handed, no armour save) unless another magic weapon is taken." },
  ];
}

const CLASSIC_UNDEAD = {
  key: "classicundead",
  loreOptions: ["Dark Magic", "Necromancy Magic"],
  name: "Classic Undead",
  tagline: "Necromancers and Liches — the original 4th-edition Undead army, mixing Vampire Counts and Tomb Kings troop choices",
  magicItems: [...COMMON_MAGIC_ITEMS, ...UNDEAD_MAGIC_ITEMS, ...VC_BLOODLINE_POWERS],
  armyWideRules: [
    "Undead models: immune to psychology, immune to poison, cause fear. May not march unless within 12\" of the general (undead characters excepted). Only charge reaction is hold. An undead monster whose rider is slain crumbles to dust immediately instead of rolling on the Monster Reaction Table.",
    "Three ways to die: Unstable units (Zombies, all ethereal models) simply disappear on a failed break test. Units subject to the crumble rule (Skeletons, Wights, the Vampire Count, Mummies, Carrion) don't take break tests — instead they suffer a wound with no saves for each point the combat was lost by (reduced by one if the Battle Standard is within range). Unbreakable troops never crumble or break. The general's death causes all undead units to crumble immediately; undead characters are unaffected. A regiment led by a character instead makes a LD test against the character's LD — pass and it survives, fail and it crumbles entirely (not hard-enforced by this builder — a battle-phase trigger, not a list-building one).",
    "Ethereal models (Wraiths): unstable, always skirmish, can always march regardless of circumstance, move through solid objects (not other troops) and ignore terrain/obstacle penalties, but cannot end their move in impassable terrain. Immune to all non-magical harm. No character may join an ethereal regiment except a Wraith champion.",
    "Wight and Wraith weapons: every Wight carries a free Wight-Blade (1D3 wounds) and every Wraith a free Wraith-Weapon (double handed, no armour save) — regimental trooper, champion, or independent character alike. These don't use a magic item slot, but are forfeited the moment the bearer takes another magic weapon.",
    "This army mixes Vampire Counts and Tomb Kings troop choices under a single Lich Lord or Necromancer-led list. The army's one Vampire option is always Von Carstein (no other Bloodline is available here) — take the Vampire Counts army instead for the other four Bloodlines.",
    "Raise the Dead: the Summon Skeletons / Raise the Dead / Summon Skeleton Horde spells can raise extra crew for a Screaming Skull Catapult (but not once all crew are dead), and can restore lost wounds to Skeleton Chariots and Screaming Skull Catapults.",
    "Magic Items: the Weapons/Enchanted/Arcane/Banners pool at the end is common to all three Undead armies (Vampire Counts, Tomb Kings, Classic Undead) — restrictions are by character/regiment type (tags), not by which of the three armies you're playing.",
    "Mounting a character on a Skeleton Heavy Chariot: the book prices this \"for the cost of the chariot\", which varies with the chariot's own upgrades. This builder approximates it at the chariot's 60pt base cost — adjust by hand if you add chariot upgrades underneath a mounted character.",
  ],
  characters: [
    {
      id: "lichlord", name: "Lich Lord", cost: 360, stat: "Lich Lord", magicItemSlots: 4, tags: ["undeadCharacter", "wizard", "lichLord"],
      gearNote: "Undead, subject to the crumble rule. A level 4 wizard. May use Dark Magic or Necromancy Spells.",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (may take Barding free)", cost: 0, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
        { id: "wingednightmare", name: "Winged Nightmare", cost: 60, stat: "Winged Nightmare" },
        { id: "zombiedragon", name: "Zombie Dragon", cost: 300, stat: "Zombie Dragon" },
      ],
    },
    {
      id: "necromancerlord", name: "Necromancer Lord (level 4)", cost: 240, stat: "Necromancer Lord", magicItemSlots: 4, tags: ["wizard", "necromancer"],
      gearNote: "Living. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 0, stat: "Undead Steed" },
        { id: "manticore", name: "Manticore (living)", cost: 200, stat: "Manticore" },
      ],
    },
    {
      id: "masternecromancer", name: "Master Necromancer (level 3)", cost: 170, stat: "Master Necromancer", magicItemSlots: 3, tags: ["wizard", "necromancer"],
      gearNote: "Living. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (3).",
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 0, stat: "Undead Steed" }],
    },
    {
      id: "necromancerchampion", name: "Necromancer Champion (level 2)", cost: 110, stat: "Necromancer Champion", magicItemSlots: 2, tags: ["wizard", "necromancer"],
      gearNote: "Living. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (2).",
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 0, stat: "Undead Steed" }],
    },
    {
      id: "necromancer", name: "Necromancer (level 1)", cost: 50, stat: "Necromancer", magicItemSlots: 1, tags: ["wizard", "necromancer"],
      gearNote: "Living. May take Necromancy or Dark Magic Spells. May take as many magic items as levels (1).",
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 0, stat: "Undead Steed" }],
    },
    {
      id: "wightbsb", name: "Wight Battle Standard Bearer", cost: 52, stat: "Wight BSB", magicItemSlots: 1, restriction: "0-1", tags: ["wight", "undeadCharacter", "bsb"],
      innateWeapon: { name: "Wight-Blade", desc: "1D3 wounds" },
      gearNote: "0-1 per army. The one magic item may be a magic banner.",
      armourGroup: { options: ["Light armour (default)", "Heavy Armour"] },
      mounts: [{ id: "undeadsteed", name: "Undead Steed (barding free)", cost: 14, stat: "Undead Steed" }],
    },
    {
      id: "wighthero", name: "Wight Hero", cost: 82, stat: "Wight Hero", magicItemSlots: 2, tags: ["wight", "undeadCharacter"],
      innateWeapon: { name: "Wight-Blade", desc: "1D3 wounds" },
      armourGroup: { options: ["Shield & Light Armour (default)", "Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: VC_MELEE_OPTIONS },
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 22, stat: "Undead Steed" },
        { id: "wingednightmare", name: "Winged Nightmare", cost: 76, stat: "Winged Nightmare" },
        { id: "zombiedragon", name: "Zombie Dragon", cost: 316, stat: "Zombie Dragon" },
      ],
    },
    {
      id: "vampirecount", name: "Von Carstein Vampire Count", cost: 154, stat: "Vampire Count", magicItemSlots: 2, tags: ["vampire", "undeadCharacter", "voncarstein"],
      armourGroup: { options: VC_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: VC_MELEE_OPTIONS },
      magicLevelOption: { label: "Magic level (Necromancy or Dark Magic)", costPerLevel: 60, max: 1, min: 0, eligible: vcCastingGate, ineligibleNote: "Not eligible for a magic level while wearing armour or wielding a double handed weapon." },
      gearNote: "This army's Vampire option is always Von Carstein. May take up to two magic items or Von Carstein bloodline powers, freely mixed (shown together below).",
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 36, stat: "Undead Steed" },
        { id: "wingednightmare", name: "Winged Nightmare", cost: 90, stat: "Winged Nightmare" },
        { id: "zombiedragon", name: "Zombie Dragon", cost: 330, stat: "Zombie Dragon" },
      ],
    },
    {
      id: "mummyprince", name: "Mummy Prince", cost: 129, stat: "Mummy Prince", magicItemSlots: 2, tags: ["mummy", "undeadCharacter"],
      gearNote: "Flammable. May take a shield and light armour for free.",
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: TK_MELEE_OPTIONS },
      mounts: [
        { id: "undeadsteed", name: "Undead Steed (barding free)", cost: 30, stat: "Undead Steed" },
        { id: "heavychariot", name: "Skeleton Heavy Chariot (approx., base cost)", cost: 60, stat: "Heavy Chariot" },
      ],
    },
  ],
  regiments: [
    {
      id: "ghouls", name: "Ghouls", perModel: 8, minSize: 5, stat: "Ghoul", command: "standard",
      note: "Living, cause fear, poisoned attacks (+1S). May skirmish; if not skirmishing, unbreakable in combat as long as the undead side outnumbers the enemy. Won't pursue or overrun after a won combat that inflicted a casualty (gorging on the fallen instead), except models with hatred/frenzy. Cannot be joined by characters.",
    },
    {
      id: "wraiths", name: "Wraiths", perModel: 35, minSize: 3, stat: "Wraith", command: "none", restriction: "0-1", tags: ["undead"],
      note: "Ethereal, terror-causing, armed with double handed Wraith-Weapons (no armour save allowed). Cannot be harmed by mundane weapons.",
      options: [
        { id: "undeadsteeds", group: null, label: "Ride Undead Steeds — both riders and steeds ethereal", cost: 35, per: "model" },
      ],
      championOptions: [{ id: "wraithchamp", name: "Wraith Champion", cost: 35, stat: "Wraith Champion", magicItemSlots: 1, tags: ["wraith"], itemSlotLabel: "Magic Item", note: "Same profile as a normal Wraith — the extra points buy the ability to issue challenges and a magic item slot." }],
    },
    {
      id: "zombies", name: "Zombies", perModel: 3, minSize: 5, stat: "Zombie", command: "standard", tags: ["undead"],
      note: "Unstable, undead, slow — always strike last, even when charging.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
        { id: "lightarmour", group: "armour", label: "Light armour", cost: 0.5, per: "model" },
        { id: "heavyarmour", group: "armour", label: "Heavy armour", cost: 1.5, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 0.5, per: "model" },
        { id: "halberds", group: "weapon", label: "Halberds", cost: 0.5, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons", cost: 2, per: "model" },
      ],
      championOptions: cuChampions(60, 25, 50),
    },
    {
      id: "skeletonwarriors", name: "Skeleton Warriors", perModel: 4.5, minSize: 5, stat: "Skeleton", command: "standard", tags: ["undead", "skeletonBanner"],
      note: "Undead, subject to the crumble rule.",
      options: [
        { id: "lightarmour", group: "armour", label: "Light armour", cost: 0, per: "model" },
        { id: "shield", group: "armour", label: "Shield", cost: 0, per: "model" },
        { id: "both", group: "armour", label: "Light armour and shield", cost: 0.5, per: "model" },
        { id: "heavyarmour", group: "armour", label: "Heavy armour", cost: 1.5, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 1, per: "model" },
        { id: "halberds", group: "weapon", label: "Halberds", cost: 1, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons", cost: 2, per: "model" },
        { id: "longbows", group: "missile", label: "Longbows", cost: 1.5, per: "model" },
        { id: "crossbows", group: "missile", label: "Crossbows", cost: 2.5, per: "model" },
      ],
      missileExclusiveGroups: ["armour", "weapon"],
      championOptions: cuChampions(70, 35, 60),
    },
    {
      id: "mummies", name: "Mummies", perModel: 18, minSize: 3, stat: "Mummy", command: "standard", tags: ["undead", "mummy"],
      note: "Undead, subject to the crumble rule. Flammable. Equipped with light armour.",
      options: [
        { id: "dhw", group: null, label: "Double handed weapons", cost: 6, per: "model" },
      ],
      championOptions: tkMummyChampion(60),
    },
    {
      id: "carrion-cu", name: "Carrion", perModel: 50, minSize: 1, stat: "Carrion", command: "none", restriction: "0-1", tags: ["undead"],
      note: "Undead, subject to the crumble rule. Flying undead birds of prey — cannot take any upgrades. As monstrous flyers they are always skirmishers. Priced per base/model — use the size stepper to buy multiple bases.",
    },
    {
      id: "skeletonhorsemen", name: "Skeleton Horsemen", perModel: 14, minSize: 5, stat: "Skeleton", mountStat: "Undead Steed", mountLabel: "Undead Steed", command: "fastCavalry", fastCavalryToggleOption: "heavyarmour", tags: ["undead", "skeletonHorsemen", "skeletonBanner"],
      note: "Undead, subject to the crumble rule. Skeletons with light armour and shields, riding Undead Steeds. Fast cavalry.",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light — loses fast cavalry, standard bearer becomes free", cost: 3, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 2, per: "model" },
        { id: "lances", group: "weapon", label: "Lances", cost: 4, per: "model" },
      ],
      championOptions: cuChampions(80, 50, 70),
    },
    {
      id: "wightguardsmen", name: "Wight Guardsmen", perModel: 10, minSize: 5, stat: "Wight", command: "standard", tags: ["undead"],
      note: "Undead, subject to the crumble rule. Wights with Wight-Blades and heavy armour.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "halberds", group: "weapon", label: "Non-magical halberds", cost: 1, per: "model" },
        { id: "dhw", group: "weapon", label: "Non-magical double handed weapons", cost: 3, per: "model" },
      ],
      championOptions: cuChampions(70, 35, 60),
    },
    {
      id: "wightknights", name: "Wight Knights", perModel: 22, minSize: 5, stat: "Wight", mountStat: "Undead Steed", mountLabel: "Undead Steed", command: "standard", tags: ["undead"],
      note: "Undead, subject to the crumble rule. Wights with Wight-Blades, heavy armour, shields, riding Undead Steeds.",
      options: [
        { id: "barding", group: null, label: "Barding", cost: 3, per: "model" },
        { id: "lances", group: null, label: "Non-magical lances", cost: 3, per: "model" },
      ],
      championOptions: cuChampions(80, 50, 70),
    },
  ],
  chariotsMonsters: [
    {
      id: "batswarm", name: "Bat Swarm", kind: "quantity", perUnit: 40, stat: "Bat Swarm",
      note: "Living. Follows the main-rulebook rules for Swarms. Priced per base.",
    },
    {
      id: "screamingskullcatapult", name: "Screaming Skull Catapult", kind: "warmachine", perUnit: 100, stat: "Skeleton",
      note: "Small Stone Thrower crewed by three Skeletons. An enemy unit that suffers at least one wound must take a Panic test. Hits count as flaming.",
      extraCrewCost: 5, extraCrewLabel: "Extra crew (max 2)",
    },
    {
      id: "skeletonheavychariots", name: "Skeleton Heavy Chariot", perUnit: 60, stat: "Heavy Chariot", mountStat: "Skeleton", mountLabel: "Skeleton Crew",
      note: "Undead, subject to the crumble rule. Pulled by two Undead Steeds, crewed by two Skeleton Warriors with light armour, spears, shields, and bows (5+ save).",
      extraCrewCost: 6, extraCrewLabel: "Extra Skeleton Warrior crew (max 2, one may become the commander below instead)",
      extraSteedCost: 4, extraSteedLabel: "Extra Undead Steeds (max 2, widens the base)",
      scythedWheelsCost: 20,
      commanderCost: 60, commanderLabel: "One extra crewman is a character or flammable Mummy Champion (light armour, double handed weapon) instead", commanderMagicItemSlots: 1, commanderTags: ["mummy"],
    },
  ],
  specialCharacters: [
    { id: "krell", name: "Krell, Lord of The Undead", cost: 250, stat: "Krell", role: "Wight Lord",
      note: "Causes terror. Carries the Armour of Fortune (a common magic item — heavy armour, 5+ ward save) and the Black Axe of Krell instead of a Wight-Blade (double handed, deals 1D6 wounds; a model wounded but not slain suffers an additional no-save wound on a roll of 1 in each subsequent magic phase). May take 1 additional magic item. May ride an Undead Steed for +30pts (barding free)." },
    { id: "dieter", name: "Dieter Helsnicht, Doom Lord of Middenheim", cost: 600, stat: "Lich Lord", role: "A particularly powerful Necromancer Lord, with characteristics similar to a Lich Lord", tags: ["wizard"],
      note: "Rides a Manticore. Carries the Amulet of Doom, granting a 4+ ward save to himself and his mount. May take 3 additional magic items." },
    { id: "heinrich", name: "Heinrich Kemmler, The Lichmaster", cost: 500, stat: "Lich Lord", role: "A particularly powerful Necromancer Lord, with characteristics similar to a Lich Lord", tags: ["wizard"],
      note: "Carries the Cloak of the Night, letting him fly and be invulnerable to mundane (non-magical) attacks. May take 3 additional magic items." },
    { id: "nagash", name: "Nagash, Supreme Lord of the Undead", cost: 700, stat: "Nagash", role: "Must always be the army general", tags: ["wizard"],
      note: "Undead, subject to the crumble rule, large, causes terror. A level 5 wizard (thanks to the Book of Nagash — already reflected in his level) who may handpick spells.",
      items: "Carries Mortis — the Great Blade of Death (+1 Strength, already reflected; each wound inflicted restores one wound Nagash lost earlier in the battle), the Black Armour of Nagash (4+ armour save, 4+ ward save, 4+ natural dispel — he may still cast spells while wearing it), the Book of Nagash (+1 magic level, already reflected), a Dispel Magic Scroll, and the Staff of Power (comes with 1D6+1 power cards taken from the winds of magic deck at the start of the battle, spendable throughout)." },
  ],
};

const KISLEV_MELEE_OPTIONS = ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon", "Lance"];
const KISLEV_PRIEST_MELEE_OPTIONS = ["Hand weapon (default)", "Additional hand weapon", "Double handed weapon"];
const KISLEV_MISSILE_OPTIONS = { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Hand Gun", "Pistol", "Two Pistols"] };

const KISLEV_MAGIC_ITEMS = [
  { id: "kis-shardblade", name: "Shard Blade", cost: 15, cat: "weapon", desc: "Any living model wounded by this blade cannot heal and continues to bleed — must be removed as a casualty at the end of the battle." },
  { id: "kis-pistolsboydinov", name: "Pistols of Prince Boydinov", cost: 15, cat: "weapon", desc: "Two normal pistols. Hit on a 2+. Magical shots." },
  { id: "kis-blackblade", name: "Black Blade", cost: 30, cat: "weapon", desc: "Monsters and Daemons in base contact lose half their attacks (rounded up)." },
  { id: "kis-bloodedge", name: "Bloodedge", cost: 40, cat: "weapon", desc: "The wielder gains +2 attacks and +2 Strength in melee. Cursed: on a to-hit roll of 1, the wielder hits a random friendly model in base-to-base contact instead (if any are present)." },
  { id: "kis-fearfrost", name: "Fearfrost", cost: 60, cat: "weapon", desc: "No armour save allowed. 1 wound inflicted becomes 1D6 wounds." },
  { id: "kis-armouralexandr", name: "Armour of Alexandr", cost: 50, cat: "armour", desc: "Includes a shield. 3+ armour save and 5+ ward save. If the ward save succeeds against a magic weapon, that weapon loses its magic properties." },
  { id: "kis-crystalhelm", name: "Crystal Helm", cost: 15, cat: "enchanted", desc: "If carried by the general, all units within 18\" may use his or her Leadership." },
  { id: "kis-birchring", name: "Birch Ring", cost: 15, cat: "enchanted", desc: "Contains the Amber spell 'Savage Beast of Horrors' as a bound spell (remains in play). The user transforms into a vicious Werebear, gaining 3 attacks at WS6/S6 and causing fear. Cannot cast spells while in beast form, but may still dispel normally." },
  { id: "kis-icearmour", name: "Ice Armour", cost: 15, cat: "arcane", desc: "A witch may wear this and still cast spells. 4+ armour save and 4+ ward save. If the armour fails to save its bearer, it shatters and can no longer be used.", restrictedTo: [{ tags: ["wizard"] }] },
  { id: "kis-bannerursus", name: "Banner of Ursus", cost: 10, cat: "banner", desc: "The unit is immune to fear." },
  { id: "kis-warbanner", name: "Warbanner", cost: 40, cat: "banner", desc: "+1 to combat resolution." },
  { id: "kis-bannermurder", name: "Banner of Murder", cost: 50, cat: "banner", desc: "+1D6\" to charge move. If the charge is failed, the unit still moves its normal failed-charge distance." },
];

const KISLEV = {
  key: "kislev",
  loreOptions: ["Ice Magic"],
  name: "Kislev",
  tagline: "North of the Empire — windswept plains and dark birch glades, a realm hardened by a thousand years of Norse raids and the ever-present threat of Chaos",
  magicItems: [...COMMON_MAGIC_ITEMS, ...KISLEV_MAGIC_ITEMS],
  compositionRules: [
    { kind: "mutualExclusion", refs: [
      { list: "specials", id: "katarin", name: "Tzarina Katarin" },
      { list: "specials", id: "borisursus", name: "Boris Ursus" },
      { list: "specials", id: "igortheterrible", name: "Igor the Terrible" },
    ] },
    { kind: "requiresIfPresent", label: "Prince Ivan Radinov", trigger: [{ list: "specials", id: "radinov", name: "Prince Ivan Radinov" }], requires: [{ list: "regiments", id: "gryphonlegion", name: "Gryphon Legion" }] },
  ],
  armyWideRules: [
    "A Great Bear is a small monster which causes fear. Urskin (Boris Ursus's mount) and the Chicken Legged Hut (Baba Yaga's mount) are also treated as monsters — Urskin small and causing fear, the Hut large and causing terror.",
    "Tzarina Katarin, Boris Ursus, and Igor the Terrible may never be fielded together in the same army — each explicitly excludes the other two. This builder now flags it live (see the warning banner above the roster) rather than just leaving it as text.",
    "Prince Ivan Radinov may only be fielded if the army also includes a regiment of Gryphon Legionnaires. Now flagged live by this builder.",
  ],
  characters: [
    {
      id: "boyar", name: "Boyar", cost: 100, stat: "Boyar", magicItemSlots: 3, role: "Lord",
      armourGroup: { options: ["Shield & Light Armour (default)", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: KISLEV_MELEE_OPTIONS },
      missileGroup: KISLEV_MISSILE_OPTIONS,
      mounts: [
        { id: "warhorse", name: "Warhorse (barding free)", cost: 20, stat: "War Horse" },
        { id: "greatbear", name: "Great Bear", cost: 45, stat: "Great Bear" },
      ],
    },
    {
      id: "bsb", name: "Battle Standard Bearer", cost: 80, stat: "Kislev BSB", magicItemSlots: 1, restriction: "0-1", tags: ["bsb"],
      gearNote: "The one magic item may be a magic banner.",
      armourGroup: { options: ["Light armour (default)", "Heavy Armour"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (barding free)", cost: 10, stat: "War Horse" },
        { id: "greatbear", name: "Great Bear", cost: 35, stat: "Great Bear" },
      ],
    },
    {
      id: "hetman", name: "Hetman", cost: 60, stat: "Hetman", magicItemSlots: 2, role: "Hero",
      armourGroup: { options: ["Shield & Light Armour (default)", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: KISLEV_MELEE_OPTIONS },
      missileGroup: KISLEV_MISSILE_OPTIONS,
      mounts: [
        { id: "warhorse", name: "Warhorse (barding free)", cost: 15, stat: "War Horse" },
        { id: "greatbear", name: "Great Bear", cost: 40, stat: "Great Bear" },
      ],
    },
    {
      id: "priestofursun", name: "Priest of Ursun", cost: 65, stat: "Priest of Ursun", magicItemSlots: 1,
      gearNote: "Any regiment led by a Priest of Ursun is immune to fear and hates all enemies.",
      armourGroup: { options: ["Shield & Light Armour (default)", "Shield & Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: KISLEV_PRIEST_MELEE_OPTIONS },
      mounts: [
        { id: "warhorse", name: "Warhorse (barding free)", cost: 50, stat: "War Horse" },
        { id: "greatbear", name: "Great Bear", cost: 75, stat: "Great Bear" },
      ],
    },
    {
      id: "icewitchlady", name: "Ice Witch Lady (level 4)", cost: 240, stat: "Ice Witch Lady", magicItemSlots: 4, tags: ["wizard"],
      gearNote: "May only take Ice Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "warhorse", name: "Warhorse (barding optional, free)", cost: 0, stat: "War Horse" },
        { id: "greatbear", name: "Great Bear", cost: 30, stat: "Great Bear" },
      ],
    },
    {
      id: "icewitchmistress", name: "Ice Witch Mistress (level 3)", cost: 170, stat: "Ice Witch Mistress", magicItemSlots: 3, tags: ["wizard"],
      gearNote: "May only take Ice Magic. May take as many magic items as levels (3).",
      mounts: [{ id: "warhorse", name: "Warhorse (barding optional, free)", cost: 0, stat: "War Horse" }],
    },
    {
      id: "icewitchchampion", name: "Ice Witch Champion (level 2)", cost: 110, stat: "Ice Witch Champion", magicItemSlots: 2, tags: ["wizard"],
      gearNote: "May only take Ice Magic. May take as many magic items as levels (2).",
      mounts: [{ id: "warhorse", name: "Warhorse (barding optional, free)", cost: 0, stat: "War Horse" }],
    },
    {
      id: "icewitch", name: "Ice Witch (level 1)", cost: 50, stat: "Ice Witch", magicItemSlots: 1, tags: ["wizard"],
      gearNote: "May only take Ice Magic. May take as many magic items as levels (1).",
      mounts: [{ id: "warhorse", name: "Warhorse (barding optional, free)", cost: 0, stat: "War Horse" }],
    },
  ],
  regiments: [
    {
      id: "gryphonlegion", name: "Gryphon Legion", perModel: 25, minSize: 5, stat: "Kislevite Knight", mountStat: "War Horse", mountLabel: "Barded Warhorse", command: "standard", restriction: "0-1",
      note: "Formed as a token of eternal friendship between Kislev and the Empire, trained and garrisoned in the Empire. Knights with full plate armour (4+ heavy armour), shields, and lances, riding barded warhorses — a combined 1+ armour save.",
      champion: { name: "Captain", baseCost: 30, magicItemSlots: 1, stat: "Kislevite Captain" },
    },
    {
      id: "brotherhoodofthebear", name: "Brotherhood of the Bear", perModel: 18, minSize: 5, stat: "Kislevite Knight", mountStat: "War Horse", mountLabel: "Warhorse", command: "fastCavalry", restriction: "0-1",
      note: "Ranger-Templars specializing in ambush and guerrilla warfare, formed by Tzarina Tiara Pavlovna. Knights riding warhorses, armed with light armour, shields, spears, and bows. Subject to hatred against Chaos (not hard-enforced). Fast cavalry.",
      champion: { name: "Captain", baseCost: 30, magicItemSlots: 1, stat: "Kislevite Captain" },
    },
    {
      id: "sonsofursa", name: "Sons of Ursa", perModel: 50, minSize: 3, stat: "Kislevite Knight", mountStat: "Great Bear", mountLabel: "Great Bear", command: "monstrous", restriction: "0-1",
      note: "A monstrous regiment from the great temple atop the sacred Ice Mountain. Knights with heavy armour, shields, and lances, riding Great Bears. Cause fear. Regimental troops and champions riding Great Bears can't be killed separately — all hits go to the Bear (which may use the rider's 4+ armour save); when the Bear dies, remove the whole model. Not hard-enforced by this builder.",
      champion: { name: "Captain", baseCost: 30, magicItemSlots: 1, stat: "Kislevite Captain" },
    },
    {
      id: "kossars", name: "Kislev Kossars", perModel: 9, minSize: 5, stat: "Kislevite Warrior", command: "standard",
      note: "A numerous people unafraid to die. Warriors with bows, double handed weapons, and light armour.",
      champion: { name: "Champion", baseCost: 20, magicItemSlots: 1, stat: "Kislevite Champion" },
    },
    {
      id: "handgunners-kis", name: "Hand Gunners", perModel: 10, minSize: 5, stat: "Kislevite Warrior", command: "standard",
      note: "Strelti, trained by the legacy of Prince Boydinov of Erengrad. Warriors with hand guns, light armour, and a bardiche (short halberd used as a gun rest).",
      champion: { name: "Captain", baseCost: 30, magicItemSlots: 1, stat: "Kislevite Captain" },
    },
    {
      id: "hunters", name: "Hunters", perModel: 11, minSize: 5, stat: "Kislevite Warrior", command: "skirmisher",
      note: "Patient trappers of the harsh Taiga. Warriors with bows. May skirmish and scout.",
      champion: { name: "Champion", baseCost: 20, magicItemSlots: 1, stat: "Kislevite Champion" },
    },
    {
      id: "guards", name: "Guards", perModel: 10, minSize: 5, stat: "Kislevite Knight", command: "standard",
      note: "Hand-picked elite of the Kislevite infantry, forming the bodyguard of the Tzars and Tzarinas. Knights with heavy armour and halberds.",
      champion: { name: "Captain", baseCost: 30, magicItemSlots: 1, stat: "Kislevite Captain" },
    },
    {
      id: "roadwardens", name: "Road Wardens", perModel: 17, minSize: 5, stat: "Kislevite Warrior", mountStat: "Normal Horse", mountLabel: "Normal Horse", command: "fastCavalry",
      note: "Rarely spoken of openly — they root out corruption of Chaos (and opposition to the Tzar). Warriors with light armour, armed with two pistols, riding normal horses. Fast cavalry, may skirmish.",
      champion: { name: "Champion", baseCost: 20, magicItemSlots: 1, stat: "Kislevite Champion" },
    },
    {
      id: "horsearchers-kis", name: "Kislev Horse Archers", perModel: 10, minSize: 5, stat: "Kislevite Warrior", mountStat: "Normal Horse", mountLabel: "Normal Horse", command: "fastCavalry",
      note: "Fierce mounted nomads from the plains of Kislev and beyond the World Edge Mountains. Warriors with bows, riding normal horses. Fast cavalry, may skirmish.",
      champion: { name: "Champion", baseCost: 20, magicItemSlots: 1, stat: "Kislevite Champion" },
    },
    {
      id: "wingedlancers", name: "Kislev Winged Lancers", perModel: 17, minSize: 5, stat: "Kislevite Lancer", mountStat: "War Horse", mountLabel: "Warhorse", command: "fastCavalry",
      note: "Young sons of Boyars, always prepared for war. Lancers with light armour, shields, lances, riding warhorses. Fast cavalry.",
      options: [
        { id: "shriekingbanners", group: null, label: "Shrieking back banners — unit causes fear on the turn it charges", cost: 3, per: "model" },
      ],
      champion: { name: "Captain", baseCost: 30, magicItemSlots: 1, stat: "Kislevite Captain" },
    },
    {
      id: "beastsandbeastmasters", name: "Beasts and Beastmasters", perModel: 0, minSize: 1, kind: "composite", command: "none", restriction: "0-1",
      note: "A regiment of Bears or Giant Wolves, led by unarmoured Beastmasters. Cannot take a standard bearer, musician, or regimental champion.",
      composition: [
        { id: "bear", label: "Bears", cost: 15, stat: "Kislevite Bear" },
        { id: "giantwolf", label: "Giant Wolves", cost: 10, stat: "Giant Wolf" },
        { id: "beastmaster", label: "Beastmasters (unarmoured)", cost: 12, stat: "Kislevite Beastmaster" },
      ],
    },
  ],
  chariotsMonsters: [
    {
      id: "mortar-kis", name: "Mortar", kind: "warmachine", perUnit: 80, stat: "War Machine (cannon, mortar, etc.)",
      note: "The artillery of Kislev cannot compare to the Empire's vast arsenal, but the army of the Tzars still fields some fine mortars. Works exactly like a small stone thrower. Crewed by three crewmen.",
      extraCrewCost: 5, extraCrewLabel: "extra crew",
    },
    {
      id: "uruganccanon", name: "Urugan Cannon", kind: "warmachine", perUnit: 80, stat: "War Machine (cannon, mortar, etc.)",
      note: "Prince Boydinov's black-powder experiments. Produces an Artillery Die + 4 number of shots, range 24\". Roll to hit for each shot using the crew's BS. Hits are S4 and armour piercing (-2 to armour save total). Cannot shoot the turn it moved. Misfires like a cannon. Crewed by three crewmen.",
      extraCrewCost: 5, extraCrewLabel: "extra crew",
    },
  ],
  specialCharacters: [
    { id: "katarin", name: "Tzarina Katarin the Ice Queen of Kislev", cost: 200, stat: "Tzarina Katarin", role: "Lord — current ruler of Kislev, level 3 wizard using the lore of Ice", tags: ["wizard"],
      note: "Rides a Warhorse. May take two additional magic items. May not be fielded alongside Boris Ursus or Igor the Terrible.",
      items: "Carries the magic blade Fearfrost." },
    { id: "borisursus", name: "Boris Ursus, The Red Tzar", cost: 160, stat: "Boris Ursus", role: "A fierce warrior and devout follower of the Bear God",
      note: "Equipped with heavy armour, a shield, and a bow, riding the Great Bear Urskin (wrapped in thick fur, giving 5+ armour; rolls 3D6 on the Monster Reaction Table if Boris is slain). May take two additional magic items. May not be fielded alongside Igor the Terrible or Tzarina Katarin.",
      items: "Carries the Shard Blade." },
    { id: "radinov", name: "Prince Ivan Radinov, Captain of the Gryphon Legion", cost: 80, stat: "Prince Radinov", role: "Younger brother of the ruling Tzarina Katarin, nominal leader of the Gryphon Legion",
      note: "Armed with a lance, full plate armour, and a shield, riding a barded warhorse (combined 1+ armour save). May take two magic items. Natural Hero: if a friendly character within 4\" of Radinov is killed, roll a D6 — on a 4+ Ivan saves them, restoring 1 wound (wounds already caused still count for combat resolution). Only one rescue attempt per battle. Your army may only field Radinov if it includes Gryphon Legionnaires (now flagged live by this builder)." },
    { id: "saltan", name: "Tzar Saltan of Praag", cost: 80, stat: "Tzar Saltan", role: "The old and bitter ruler of Praag, a city overrun by Chaos",
      note: "Armed with heavy armour, a shield, riding a barded warhorse. May take one additional magic item. Must always challenge Chaos characters and must accept challenges from Chaos enemies. Saltan, and any regiment he leads, is immune to fear and hates Chaos.",
      items: "Carries the Black Blade." },
    { id: "rasin", name: "Stephan Rasin, Clanchief of Cossacks", cost: 50, stat: "Stephan Rasin", role: "A young, rash, and remarkably lucky Clanchief of the Cossacks",
      note: "Armed with light armour, a bow, riding a warhorse. Never carries magic items. Allowed three re-rolls per battle. Any regiment he leads is immune to fear and hates Chaos. If leading Kislev Horse Archers, the regiment may fire and flee as a charge reaction (resolve shooting as Stand and Shoot, then flee as normal) and rallies automatically after that flee move." },
    { id: "iljaofmurova", name: "Ilja of Murova", cost: 90, stat: "Ilja of Murova", role: "The strongest man in the Taiga, undefeated in twenty years of contests",
      note: "Carries a bow and may scout. Cannot be the army general. May take one additional magic item.",
      items: "Armed with the Wyrmslayer Sword (a common magic item — always wounds on a 4+ or better; large targets get no armour save)." },
    { id: "igortheterrible", name: "Igor the Terrible", cost: 120, stat: "Igor the Terrible", role: "A dark legend among the Kislevites — the most feared Tzar of all time",
      note: "Hates human enemies. Armed with heavy armour and a shield. May take two additional magic items. May not be fielded alongside Boris Ursus or Tzarina Katarin.",
      items: "Carries the magic sword Bloodedge.",
      mounts: [
        { id: "bardedwarhorse", name: "Barded Warhorse", cost: 0, stat: "War Horse" },
        { id: "greatbear", name: "Great Bear", cost: 45, stat: "Great Bear" },
        { id: "monstrousspider", name: "Monstrous Spider", cost: 55, stat: "Monstrous Spider" },
        { id: "wyvern", name: "Wyvern", cost: 155, stat: "Wyvern (Orc)" },
        { id: "griffon", name: "Griffon", cost: 175, stat: "Griffon" },
        { id: "manticore", name: "Manticore", cost: 215, stat: "Manticore" },
        { id: "chimera", name: "Chimera", cost: 265, stat: "Chimera" },
      ] },
    { id: "miska", name: "Miska the Slaughterer", cost: 250, stat: "Miska the Slaughterer", role: "Most famous of the Khan-Queens, daughter of Boris Ursus", tags: ["wizard"],
      note: "Armed with a poisoned hand weapon, heavy armour, and a shield. Subject to frenzy. May take one additional magic item.",
      items: "Carries the Crown of Icicles — Miska becomes a level 3 wizard using Ice Magic and may cast spells while wearing armour.",
      mounts: [
        { id: "bardedwarhorse", name: "Barded Warhorse", cost: 0, stat: "War Horse" },
        { id: "greatbear", name: "Great Bear", cost: 30, stat: "Great Bear" },
      ] },
    { id: "babayaga", name: "Baba Yaga", cost: 350, stat: "Baba Yaga", role: "A solitary, ancient power tied to the land — most Kislevites believe her merely a legend",
      note: "A level 4 witch — may use Ice Magic or Dark Magic. May take four magic items. Her Chicken Legged Hut works like a large chariot but also like a monster: it causes terror and rolls on the Monster Reaction Table if Baba Yaga dies.",
      mounts: [{ id: "hut", name: "Chicken Legged Hut", cost: 0, stat: "Chicken Legged Hut" }] },
  ],
};

const NORSE = {
  key: "norse",
  loreOptions: [...COLLEGE_LORES, "Ice Magic"],
  name: "Norse",
  tagline: "Hardy barbarians of the Hird — sailors, traders, and raiders who plundered the Old World, Ulthuan, and Lustria alike",
  magicItems: [
    ...COMMON_MAGIC_ITEMS,
    { id: "nrs-dainsleif", name: "Dainsleif", cost: 10, cat: "weapon", desc: "Forged by the Dwarf Runesmith Dain. Any living model wounded by this blade cannot heal and continues to bleed — must be removed as a casualty at the end of the battle." },
    { id: "nrs-gram", name: "Gram", cost: 10, cat: "weapon", desc: "Made by the Dwarf Runesmith Regin for Dragon Slaying. Automatically wounds (no armour save) any Dragon, Wyvern, Hydra, Cold One, Horned One, Terradon, Salamander, Carnosaur, or Stegadon." },
    { id: "nrs-tyrfing", name: "Tyrfing", cost: 40, cat: "weapon", desc: "Forged by Dwarf Runesmiths Durin and Dvalin. The wielder gains +2 attacks and +2 Strength in melee. Cursed: on a to-hit roll of 1, the wielder hits a random friendly model in base-to-base contact instead (if any are present)." },
    { id: "nrs-skraep", name: "Skræp", cost: 40, cat: "weapon", desc: "Once wielded by King Vermund and his son Uffe. Always wounds on a 4+ or better and allows no save of any kind." },
    { id: "nrs-mjolner", name: "Mjølner", cost: 40, cat: "weapon", desc: "Thrown weapon (use BS), range 18\", Strength 10, Multiple Wounds 1D3. Forged by Brok and Sindre; always returns to the wielder. Cannot be wielded in melee. Cannot target characters inside regiments." },
    { id: "nrs-gridarvol", name: "Gridarvol", cost: 50, cat: "weapon", desc: "A double handed weapon once belonging to the Jotun-Giant Grid. Hits with Strength 10." },
    { id: "nrs-gungner", name: "Gungner", cost: 50, cat: "weapon", desc: "Before the battle, the wielder may publicly dedicate this spear to an enemy — if that enemy is hit in melee by Gungner, it dies instantly. Forged by Brok and Sindre. Cannot be thrown." },
    { id: "nrs-mimingsword", name: "Miming's Sword", cost: 80, cat: "weapon", desc: "Once belonged to the Forest Troll Miming. Always wounds, allows no armour save." },
    { id: "nrs-svalin", name: "Svalin, The Sun Shield", cost: 15, cat: "armour", desc: "+1 bonus to armour save. The bearer is immune to all negative modifiers to hit." },
    { id: "nrs-wolfpelt", name: "Enchanted Wolf Pelt", cost: 20, cat: "armour", desc: "Light armour, models on foot only. Takes all armour saves without modifiers. May be combined with a shield and The Standard of Shielding." },
    { id: "nrs-beltgiantstrength", name: "Belt of Giant Strength", cost: 20, cat: "enchanted", desc: "+2 Strength. Cumulative with Gloves of Giant Strength." },
    { id: "nrs-glovesgiantstrength", name: "Gloves of Giant Strength", cost: 20, cat: "enchanted", desc: "+2 Strength. Cumulative with Belt of Giant Strength." },
    { id: "nrs-gjallahorn", name: "Gjallahorn", cost: 50, cat: "enchanted", desc: "Sounded once per battle at the start of the Norse player's turn — all regiments in the army may add 1D6 to their charge range that turn (rolled per regiment after charges/reactions are declared; failed charges move at normal rate)." },
    { id: "nrs-andvaresgift", name: "Andvare's Gift", cost: 80, cat: "enchanted", desc: "Must be carried by a Norse King or Jarl on foot. After finishing his movement (alone, not part of a regiment, no charge, not in melee), the bearer may don the ring and instantly, irreversibly transform into a Wyvern — wounds carry over, all other equipment is lost, and the Wyvern can't move the turn it transforms.", restrictedTo: [{ tags: ["norseKing"] }, { tags: ["norseJarl"] }] },
    { id: "nrs-gandstaff", name: "Gandstaff", cost: 10, cat: "arcane", desc: "The bearer counts as being one level higher for casting and dispelling.", restrictedTo: [{ tags: ["wizard"] }] },
    { id: "nrs-ravenbanner", name: "Raven Banner", cost: 30, cat: "banner", desc: "The regiment is immune to psychology." },
    { id: "nrs-bannerodin", name: "The Banner of Odin", cost: 40, cat: "banner", desc: "Provides a 3+ natural dispel." },
  ],
  compositionRules: [
    { kind: "mutualExclusion", refs: [
      { list: "regiments", id: "stonetrolls-norse", name: "Stone Trolls" },
      { list: "regiments", id: "trollslayers-norse", name: "Norse Dwarf Troll Slayers" },
    ] },
    { kind: "ratio", label: "Mounted Norse Warriors", numerator: [{ list: "regiments", id: "mountednorsewarriors", name: "Mounted Norse Warriors" }], denominator: [{ list: "regiments", id: "norsewarriors", name: "Norse Warriors" }], maxRatio: 1 },
  ],
  armyWideRules: [
    "The Norse are primarily an infantry army with limited cavalry. A Norse army is called a Hird; all its members are Hirdmen, and it is mandatory for all free and able Norsemen to serve — Hirdmen supply their own weapons and armour.",
    "Sea Raiders or Land Raiders: the army may use the Ambush special rule with one regiment of Norse Warriors, OR include Mammoths (carrying a howdah), but never both. Not hard-enforced by this builder.",
    "Shieldwall Formation: Huscarls, Norse Warriors on foot, and Norse Dwarfs fighting with shields may form a Shieldwall as a charge reaction. Enemies suffer -1 to hit on the charge if the Shieldwall isn't already in melee, is charged to the front, and the enemy started more than half its maximum charge distance away. Forming a Shieldwall this way prevents ordinary troopers (not characters) in the regiment from fighting with double handed weapons in the resulting combat. A battle-phase rule, not modeled here.",
    "Heroic Individuals — Shape Changers, Ulfhednar, and Shieldmaidens: the book allows a regiment to be joined by ANY NUMBER of these champions at once (Norse Champion, Shieldmaiden, and/or Ulfhednar, subject to each regiment's own restrictions). This builder's regimental champion picker only tracks one champion at a time per regiment — if you want to add more, tally their points by hand.",
    "Shape Changers transform into a Monstrous Wolf, Bear, or similar beast, and must be assigned to a specific Norse Warriors, Huscarls, or Berserker regiment at list-building time (only one per regiment). During the battle, one ordinary front-rank trooper from that regiment is swapped for the Shape Changer in beast form (which takes the space of four infantrymen — needs at least two troopers in the front rank to release). Cannot revert to human form once transformed, and can never be the general. A battle-phase mechanic, not modeled here beyond the character's own points cost.",
    "The army cannot include both Stone Trolls and Dwarf Troll Slayers, and the number of Mounted Norse Warriors regiments may not exceed the number of Norse Warriors-on-foot regiments — both now flagged live by this builder (see the warning banner above the roster). Giants vs Giant Slayers (a champion option within Troll Slayers) is still just documented text, not checked live.",
  ],
  characters: [
    {
      id: "norseking", name: "Norse King", cost: 112, stat: "Norse King", magicItemSlots: 3, role: "Lord", tags: ["norseKing"],
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      missileGroup: { label: "Bow or thrown weapon", cost: 10, options: ["None (default)", "Bow", "Thrown Weapon"] },
      mounts: [{ id: "warhorse", name: "Warhorse", cost: 23, stat: "War Horse" }],
    },
    {
      id: "norsejarl", name: "Norse Jarl", cost: 67, stat: "Norse Jarl", magicItemSlots: 2, role: "Hero", tags: ["norseJarl"],
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      missileGroup: { label: "Bow or thrown weapon", cost: 10, options: ["None (default)", "Bow", "Thrown Weapon"] },
      mounts: [{ id: "warhorse", name: "Warhorse", cost: 17, stat: "War Horse" }],
    },
    {
      id: "norsebsb", name: "Norse Battle Standard Bearer", cost: 84, stat: "Norse BSB", magicItemSlots: 1, restriction: "0-1", tags: ["bsb"],
      gearNote: "May take light armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour"] },
      mounts: [{ id: "warhorse", name: "Warhorse", cost: 11, stat: "War Horse" }],
    },
    {
      id: "shapechanger", name: "Shape Changer", cost: 80, stat: "Norse Shape Changer (beast form)",
      gearNote: "Must be assigned to a specific Norse Warriors, Huscarls, or Berserker regiment (only one per regiment) — track this by hand. Can never be the army general. No mount, no magic items.",
    },
    {
      id: "volvegodelord", name: "Vølve/Gode Lord (level 4)", cost: 252, stat: "Vølve/Gode Lord", magicItemSlots: 4, tags: ["wizard"],
      gearNote: "May take College Magic and Ice Magic. May take as many magic items as levels (4).",
      mounts: [{ id: "warhorse", name: "Warhorse", cost: 0, stat: "War Horse" }],
    },
    {
      id: "mastervolvegode", name: "Master Vølve/Gode (level 3)", cost: 178, stat: "Master Vølve/Gode", magicItemSlots: 3, tags: ["wizard"],
      gearNote: "May take College Magic and Ice Magic. May take as many magic items as levels (3).",
      mounts: [{ id: "warhorse", name: "Warhorse", cost: 0, stat: "War Horse" }],
    },
    {
      id: "volvegodechampion", name: "Vølve/Gode Champion (level 2)", cost: 116, stat: "Vølve/Gode Champion", magicItemSlots: 2, tags: ["wizard"],
      gearNote: "May take College Magic and Ice Magic. May take as many magic items as levels (2).",
      mounts: [{ id: "warhorse", name: "Warhorse", cost: 0, stat: "War Horse" }],
    },
    {
      id: "volvegode", name: "Vølve/Gode (level 1)", cost: 54, stat: "Vølve/Gode", magicItemSlots: 1, tags: ["wizard"],
      gearNote: "May take College Magic and Ice Magic. May take as many magic items as levels (1).",
      mounts: [{ id: "warhorse", name: "Warhorse", cost: 0, stat: "War Horse" }],
    },
  ],
  regiments: [
    {
      id: "norsehuscarls-main", name: "Norse Huscarls", perModel: 8, minSize: 5, stat: "Norse Huscarls", command: "standard",
      note: "Huscarls with light armour.",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "dhw", group: null, label: "Double handed weapons", cost: 3, per: "model" },
      ],
      championOptions: [
        { id: "champion", name: "Norse Champion", cost: 20, magicItemSlots: 1, stat: "Norse Champion", note: "Equipped like the regiment." },
        { id: "shieldmaiden", name: "Shieldmaiden", cost: 30, magicItemSlots: 1, stat: "Shieldmaiden", note: "Equipped like the regiment. Immune to fear and panic — so is the whole regiment while she's alive." },
        { id: "ulfhednar", name: "Ulfhednar", cost: 40, stat: "Ulfhednar", note: "Equipped only with an additional hand weapon. Subject to frenzy, 4+ regeneration save. May NOT take magic items." },
      ],
    },
    {
      id: "berserkers", name: "Berserkers", perModel: 11, minSize: 5, stat: "Norse Berserker", command: "standard", restriction: "0-1",
      note: "Subject to frenzy (and sometimes naked). Will not be joined by Shieldmaidens.",
      options: [
        { id: "ahw", group: "weapon", label: "Additional hand weapon", cost: 3, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons", cost: 4, per: "model" },
      ],
      championOptions: [
        { id: "champion", name: "Norse Champion", cost: 20, magicItemSlots: 1, stat: "Norse Champion", note: "Equipped like the regiment." },
        { id: "ulfhednar", name: "Ulfhednar", cost: 40, stat: "Ulfhednar", note: "Equipped only with an additional hand weapon. Subject to frenzy, 4+ regeneration save. May NOT take magic items." },
      ],
    },
    {
      id: "norsewarriors", name: "Norse Warriors", perModel: 6, minSize: 5, stat: "Norse Warrior", command: "standard",
      note: "Light armour by default. If the army has no Mammoth, one Norse Warriors regiment may use the Ambush special rule (not hard-enforced).",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
        { id: "throwingspears", group: null, label: "Throwing Spears — heavy thrown weapon", cost: 1, per: "model" },
        { id: "thrustingspears", group: null, label: "Thrusting Spears — normal spear", cost: 1, per: "model" },
        { id: "dhw", group: null, label: "Double handed weapons", cost: 3, per: "model" },
        { id: "bows", group: null, label: "Bows", cost: 2, per: "model" },
      ],
      championOptions: [
        { id: "champion", name: "Norse Champion", cost: 20, magicItemSlots: 1, stat: "Norse Champion", note: "Equipped like the regiment." },
        { id: "shieldmaiden", name: "Shieldmaiden", cost: 30, magicItemSlots: 1, stat: "Shieldmaiden", note: "Equipped like the regiment. Immune to fear and panic — so is the whole regiment while she's alive." },
        { id: "ulfhednar", name: "Ulfhednar", cost: 40, stat: "Ulfhednar", note: "Equipped only with an additional hand weapon. Subject to frenzy, 4+ regeneration save. May NOT take magic items." },
      ],
    },
    {
      id: "norsethralls", name: "Norse Thralls", perModel: 4, minSize: 5, stat: "Norse Thrall", command: "skirmisher",
      note: "May skirmish.",
      options: [
        { id: "shieldsthrowingspears", group: "gear", label: "Shields and Throwing Spears — heavy thrown weapon", cost: 1, per: "model" },
        { id: "bows", group: "gear", label: "Bows", cost: 1, per: "model" },
      ],
      champion: { name: "Norse Champion", baseCost: 20, magicItemSlots: 1, stat: "Norse Champion" },
    },
    {
      id: "norsehunters", name: "Norse Hunters", perModel: 14, minSize: 5, stat: "Norse Hunter", command: "skirmisher",
      note: "Hunters with bows. May skirmish and scout.",
      options: [
        { id: "armourahw", group: null, label: "Light armour AND additional hand weapons", cost: 2, per: "model" },
      ],
      champion: { name: "Norse Champion", baseCost: 20, magicItemSlots: 1, stat: "Norse Champion" },
    },
    {
      id: "mountednorsewarriors", name: "Mounted Norse Warriors", perModel: 11, minSize: 5, stat: "Norse Warrior", mountStat: "Normal Horse", mountLabel: "Normal Horse", command: "standard",
      note: "Norse Warriors riding normal horses. Mounted Warriors with bows may skirmish. The number of Mounted Norse Warriors regiments may not exceed the number of Norse Warriors-on-foot regiments (not hard-enforced).",
      options: [
        { id: "warhorse", group: null, label: "Swap normal horses for warhorses", cost: 3, per: "model" },
        { id: "lightarmour", group: null, label: "Light armour", cost: 1.5, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1.5, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 1.5, per: "model" },
        { id: "lances", group: "weapon", label: "Lances", cost: 3, per: "model" },
        { id: "bows", group: null, label: "Bows, if not employing lances", cost: 2, per: "model" },
      ],
      champion: { name: "Norse Champion", baseCost: 20, magicItemSlots: 1, stat: "Norse Champion" },
    },
    {
      id: "trollslayers-norse", name: "Norse Dwarf Troll Slayers", perModel: 13, minSize: 5, stat: "Troll Slayer", command: "none",
      note: "Subject to the special rules explained in the Dwarfs army book. May carry a runic standard per the Dwarfs army book guidelines. Troll Slayers with additional hand weapons.",
      options: [
        { id: "dhw", group: null, label: "Swap additional hand weapon for double handed weapon", cost: 0, per: "model" },
      ],
      multiChampion: { name: "Giant Slayer", baseCost: 20, magicItemSlots: 1, stat: "Giant Slayer", magicItemCategoryFilter: ["weapon"], itemSlotLabel: "Magic Weapon (may be a rune weapon)" },
    },
    {
      id: "dwarfwarriors-norse", name: "Norse Dwarf Warriors", perModel: 8, minSize: 5, stat: "Dwarf Soldier", command: "standard",
      note: "Subject to the special rules explained in the Dwarfs army book. May carry a runic standard per the Dwarfs army book guidelines. Dwarfs with light armour. If taking no other weapon/armour upgrades, may take bows and use skis, becoming skirmishers who can never be march-blocked (not hard-enforced).",
      options: [
        { id: "shields", group: null, label: "Shields", cost: 0.5, per: "model" },
        { id: "spears", group: "weapon", label: "Spears", cost: 1.5, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons", cost: 3, per: "model" },
        { id: "bows", group: "weapon", label: "Bows on skis — skirmishers, never march-blocked", cost: 2, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "beastsandbeastmasters-norse", name: "Norse Beasts and Beastmasters", perModel: 0, minSize: 1, kind: "composite", command: "none", restriction: "0-1",
      note: "A regiment of Bears or Giant Wolves, led by unarmoured Norse Beastmasters. Cannot take a standard bearer, musician, or regimental champion.",
      composition: [
        { id: "bear", label: "Bears", cost: 15, stat: "Norse Bear" },
        { id: "giantwolf", label: "Giant Wolves", cost: 10, stat: "Giant Wolf" },
        { id: "beastmaster", label: "Norse Beastmasters (unarmoured)", cost: 13, stat: "Norse Beastmaster" },
      ],
    },
    {
      id: "stonetrolls-norse", name: "Stone Trolls", perModel: 40, minSize: 3, stat: "Trolls", command: "none",
      note: "Subject to the special rules found in the Orcs & Goblins army book. The army cannot include Stone Trolls if it also includes Dwarf Troll Slayers (not hard-enforced). Cannot take a standard bearer, musician, or regimental champion.",
    },
  ],
  chariotsMonsters: [
    {
      id: "giants-norse", name: "Giants", perUnit: 200, stat: "Giant (Orc)",
      note: "The army cannot include Giants if it also includes (Troll and) Giant Slayers (not hard-enforced).",
    },
    {
      id: "greateagles-norse", name: "Great Eagles", perUnit: 60, stat: "Great Eagle", kind: "quantity",
      note: "Small monsters that can fly.",
    },
    {
      id: "mammoths", name: "Mammoths", perUnit: 200, stat: "Mammoth", kind: "quantity", countsAsFirstRegiment: true,
      note: "The first Mammoth in the army counts as a regiment; additional Mammoths count as monsters. Including any Mammoth prevents the use of the Ambush special rule (not hard-enforced). Carries a howdah with four Norse Hunters armed with bows and heavy throwing spears (already included in cost). Causes terror, makes 1D6 Strength 7 impact hits, 4+ armour save from its thick hide.",
    },
  ],
  specialCharacters: [
    { id: "regnarlodbrog", name: "Regnar Lodbrog", cost: 150, stat: "Regnar Lodbrog", role: "Lord — one of the greatest Norse conquerors of all time",
      note: "May take one additional magic item. His magic shirt (a suit of light armour) renders him immune to poison, breath attacks, and the effects of multiple wounds.",
      items: "Wields a spear that negates armour saves and carries a shield." },
    { id: "palnatoke", name: "Palnatoke", cost: 80, stat: "Palnatoke", role: "Hero — exiled Jarl who formed the Jomsvikings, the most feared and reviled Norse pirates of their time",
      note: "Palnatoke and any regiment he leads hate all enemies (lost if he's killed). Wears light armour, carries a shield, and wields either an additional hand weapon or a double handed weapon. Carries a bow (range 36\", Strength 5). May take two magic items." },
  ],
};

const HALFLING_MAGIC_ITEMS = [
  { id: "hfl-ratcatcher", name: "Liberated Ratcatcher's Blade", cost: 10, cat: "weapon", desc: "A hand weapon 'acquired' from somewhere south of the Moot. Always wounds a Skaven or rat-kin model on a 2+." },
  { id: "hfl-poacherbow", name: "Poacher's Longbow", cost: 15, cat: "weapon", desc: "A bow that never suffers the long-range to-hit penalty." },
  { id: "hfl-cookssword", name: "Cook's Cleaver", cost: 15, cat: "weapon", desc: "A hand weapon. +1 Strength when fighting in the first round of a combat the wielder charged into." },
  { id: "hfl-travelmail", name: "Traveller's Light Mail", cost: 15, cat: "armour", desc: "Liberated light armour, oddly well-made. Grants a 5+ armour save." },
  { id: "hfl-borrowedcloak", name: "Borrowed Cloak of Shadows", cost: 20, cat: "armour", desc: "Light armour. The wearer counts as having the Scout special rule if not already possessing it." },
  { id: "hfl-luckcharm", name: "Borrowed Luck Charm", cost: 15, cat: "enchanted", desc: "The bearer may re-roll one failed armour save per game." },
  { id: "hfl-signetring", name: "Purloined Signet Ring", cost: 20, cat: "enchanted", desc: "If carried by the general, all units within 12\" may use his or her Leadership." },
  { id: "hfl-giftedspoon", name: "The Gifted Spoon", cost: 10, cat: "enchanted", desc: "Purely ceremonial, but no Halfling would go to war without a good spoon. No effect on the game — carried for luck." },
  { id: "hfl-runeweapon", name: "A Single Dwarf Rune Item", cost: 35, cat: "enchanted", desc: "Halflings may commission exactly one Dwarf rune-inscribed weapon for their army, crafted per the Dwarfs army book's rune rules. This entry stands in for that one-time exception — treat as a generic magic weapon of dwarven make." },
];

const HALFLINGS = {
  key: "halflings",
  auxiliaryFactions: [
    { key: "empire", label: "Empire Auxiliaries", sourceKey: "empire", filter: (r) => !r.auxiliary },
    { key: "woodElves", label: "Wood Elf Auxiliaries", sourceKey: "woodElves", filter: (r) => ["archers", "warriors", "gladeriders", "lords"].includes(r.id) },
  ],
  loreOptions: [...COLLEGE_LORES],
  name: "Halflings of the Moot",
  tagline: "Rural, earthy, and expressive to a fault — good food, strong drink, and a casual relationship with other people's property",
  magicItems: [...COMMON_MAGIC_ITEMS, ...HALFLING_MAGIC_ITEMS],
  armyWideRules: [
    "Foresters: all Halfling regiments and characters (and Treemen) move through woods without any penalty to movement.",
    "Liberated Magic Items: beyond the small curated pool above, Halfling armies may in principle choose magic items from ANY army book, restricted to hand weapons, bows, light armour, and enchanted items only, at a rate of one item from another book per 800 points (or part thereof) of models in the force, ignoring that item's normal restrictions (a Halfling can carry a Chaos-Power-specific item or a Bretonnian-Commoner-only item freely, since Halflings are immune to the effects of Chaos). They may also commission exactly one Dwarf Rune Item. This builder's own item pool above is a representative curated subset, not the full any-book selection — the 800pt ratio and true any-book access are not mechanically enforced.",
    "Halfling Thief: hides as an ordinary trooper inside a Halfling rank-and-file regiment (only one thief per regiment, noted by hand on the roster) and is revealed only when that regiment engages in melee, replacing an ordinary trooper. In the first round of combat it strikes before even strike-first models and before challenges are declared; on a hit, it randomly steals a magic item (not a banner) from an enemy in base contact, usable if the thief could otherwise use its mundane counterpart and it isn't arcane. Fights as a normal character (no longer striking first) in subsequent rounds, and moves as an independent character once the combat ends. A battle-phase mechanic, not simulated beyond the character's own points cost.",
    "Empire or Elven allies: for every two Halfling regiments, the army may include one regiment of Imperial Troops from the Empire (Auxiliary Troops not allowed, Empire Champions permitted, may take Empire-only banners/items) — or, if no Empire Troops are taken, one regiment of Wood Elf Archers, Wood Elf Warriors, Glade Riders, or Elven Lords per two Halfling regiments instead (with access to Wood Elf-only banners/items). For each Empire regiment included, the army may also add one Empire mortar or cannon. Not mechanically importable in this builder — track allied regiments and their points by hand using the Empire or Wood Elves faction as reference.",
    "The Cockatrice is unique — the army may only ever include a single one, whether ridden by a Moot General or taken as an independent monster (not hard-enforced as a cross-slot restriction by this builder).",
  ],
  characters: [
    {
      id: "mootgeneral", name: "Moot General", cost: 60, stat: "Moot General", magicItemSlots: 3, role: "Lord",
      gearNote: "May take a shield for free, and light armour for free (either or both).",
      armourGroup: { options: ["Neither (default)", "Shield only", "Light Armour only", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear"] },
      missileGroup: { label: "Bow or sling", cost: 5, options: ["None (default)", "Bow", "Sling"] },
      mounts: [
        { id: "livestockbeast", name: "Livestock Beast", cost: 10, stat: "Livestock Beast" },
        { id: "greateagle", name: "Great Eagle", cost: 66, stat: "Great Eagle" },
        { id: "cockatrice", name: "The Cockatrice (only one Moot General army-wide)", cost: 166, stat: "Cockatrice" },
      ],
    },
    {
      id: "moothero", name: "Moot Hero", cost: 36, stat: "Halfling Hero", magicItemSlots: 2, role: "Hero",
      gearNote: "May take a shield for free, and light armour for free (either or both).",
      armourGroup: { options: ["Neither (default)", "Shield only", "Light Armour only", "Shield & Light Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear"] },
      missileGroup: { label: "Bow or sling", cost: 5, options: ["None (default)", "Bow", "Sling"] },
      mounts: [
        { id: "livestockbeast", name: "Livestock Beast", cost: 8, stat: "Livestock Beast" },
        { id: "greateagle", name: "Great Eagle", cost: 64, stat: "Great Eagle" },
      ],
    },
    {
      id: "halflingbsb", name: "Halfling Battle Standard Bearer", cost: 60, stat: "Halfling BSB", magicItemSlots: 1, restriction: "0-1", tags: ["bsb"],
      gearNote: "May take light armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour"] },
      mounts: [{ id: "livestockbeast", name: "Livestock Beast", cost: 4, stat: "Livestock Beast" }],
    },
    {
      id: "halflingthief", name: "Halfling Thief", cost: 20, stat: "Halfling Thief",
      gearNote: "Carries no weapon but a hand weapon, no armour, and starts with no magic items. Hides inside a Halfling rank-and-file regiment until revealed in melee (see army-wide rules). Only one thief may hide per regiment.",
    },
    {
      id: "travellingwizardlord", name: "Human Travelling Wizard Lord (level 4)", cost: 240, stat: "Wizard Lord", magicItemSlots: 4, tags: ["wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (4).",
      mounts: [{ id: "normalhorse", name: "Normal Horse", cost: 0, stat: "Normal Horse" }],
    },
    {
      id: "travellingmasterwizard", name: "Human Travelling Master Wizard (level 3)", cost: 170, stat: "Master Wizard", magicItemSlots: 3, tags: ["wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (3).",
      mounts: [{ id: "normalhorse", name: "Normal Horse", cost: 0, stat: "Normal Horse" }],
    },
    {
      id: "travellingwizardchampion", name: "Human Travelling Wizard Champion (level 2)", cost: 110, stat: "Wizard Champion", magicItemSlots: 2, tags: ["wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (2).",
      mounts: [{ id: "normalhorse", name: "Normal Horse", cost: 0, stat: "Normal Horse" }],
    },
    {
      id: "travellingwizard", name: "Human Travelling Wizard (level 1)", cost: 50, stat: "Wizard", magicItemSlots: 1, tags: ["wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (1).",
      mounts: [{ id: "normalhorse", name: "Normal Horse", cost: 0, stat: "Normal Horse" }],
    },
  ],
  regiments: [
    {
      id: "halflingbowmen-main", name: "Halfling Bowmen", perModel: 7, minSize: 5, stat: "Halfling", command: "skirmisher",
      note: "Halflings with bows. May skirmish.",
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "halflingslingers", name: "Halfling Slingers", perModel: 6, minSize: 5, stat: "Halfling", command: "skirmisher",
      note: "Halflings with slings. May skirmish.",
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "halflingmilitia-main", name: "Halfling Militia", perModel: 2.5, minSize: 5, stat: "Halfling", command: "standard",
      note: "Halflings with light armour and shields.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 0.5, per: "model" },
      ],
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "pantryguard", name: "Pantry Guard", perModel: 3, minSize: 5, stat: "Halfling Elite", command: "standard",
      note: "Halfling Elite with light armour and shields. If equipped with bows instead of a weapon upgrade, the regiment may skirmish (not hard-enforced).",
      options: [
        { id: "spears", group: "weapon", label: "Spears", cost: 1, per: "model" },
        { id: "bows", group: "weapon", label: "Bows instead, if no other weapon upgrade taken", cost: 7, per: "model" },
      ],
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "halflingriders", name: "Halfling Riders", perModel: 12, minSize: 5, stat: "Halfling Elite", mountStat: "Livestock Beast", mountLabel: "Livestock Beast", command: "fastCavalry",
      note: "Halfling Elite with light armour and shields, mounted on Livestock Beasts. Fast cavalry.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 1, per: "model" },
      ],
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "halflingridersflying", name: "Halfling Riders (Flying Livestock)", perModel: 24, minSize: 3, stat: "Halfling Elite", mountStat: "Flying Livestock", mountLabel: "Flying Livestock", command: "skirmisher", restriction: "0-1",
      note: "Halfling Elite with light armour and shields, riding Flying Livestock instead of ordinary Livestock Beasts — monstrous, can fly, and skirmish (so no standard bearer/banner). Only one Halfling Riders regiment army-wide may take this option (RAW models it as an upgrade to a Halfling Riders regiment; built here as its own 0-1 entry so the 3-model monstrous minimum and flying statline apply correctly).",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 1, per: "model" },
      ],
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "fieldwardens", name: "Halfling Field Wardens", perModel: 12, minSize: 5, stat: "Halfling Field Wardens", command: "skirmisher",
      note: "Field Wardens with bows. May skirmish and scout.",
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
  ],
  chariotsMonsters: [
    {
      id: "treemen-halfling", name: "Treemen", perUnit: 200, stat: "Treeman", kind: "quantity", countsAsFirstRegiment: true, maxQty: 1,
      note: "Only if the army also includes Wood Elf Auxiliaries. The first Treeman counts toward Regiments, further ones toward Monsters. Large, terror-causing, immune to psychology, flammable, hate Orcs/Goblins/Hobgoblins. 3+ natural armour save. Rooted to the spot — don't take break tests unless wounded that combat round. May forfeit normal attacks to deal 1D6 automatic wounds to a structure in base contact instead. Falls over like a Giant when killed (Felled Treeman Template, Initiative test to avoid, no armour saves). Battle-phase specifics not simulated beyond points cost.",
    },
    {
      id: "halflingcart", name: "Halfling Cart", perUnit: 40, stat: "Cart (Halfling)", mountStat: "Livestock Beast", mountLabel: "Livestock Beast (puller)",
      note: "A Heavy Chariot ridden by one unequipped Halfling, pulled by one Livestock Beast.",
    },
    {
      id: "halflingwagon", name: "Halfling Wagon", perUnit: 80, stat: "Wagon (Halfling)", mountStat: "Halfling", mountLabel: "Halfling Crew (6 with bows)",
      note: "A Large Chariot ridden by seven Halflings (six equipped with bows), pulled by two Livestock Beasts.",
    },
    {
      id: "halflinghotpot-main", name: "Halfling Hot-Pot", perUnit: 50, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine", restriction: "0-1",
      note: "The army may only include one — a truly unique phenomenon. Halflings are foresters, but the Hot-Pot itself cannot enter a wood. Shoots like a stone thrower, range 36\", Strength 5, allows a normal armour save but no regeneration save. Crewed by three Halflings.",
      extraCrewCost: 5, extraCrewLabel: "extra Halfling crew",
    },
    {
      id: "cockatrice-main", name: "The Cockatrice", perUnit: 200, stat: "Cockatrice", restriction: "0-1",
      note: "Only available if the general isn't already riding it as a Moot General mount (see army-wide rules — the army only ever has one Cockatrice, ridden or independent). Large, causes terror, can fly. Petrify: in the shooting phase, may target any one visible model within 8\" (no \"Look Out, Sir\" roll) — the target rolls 1D6 and must roll under its own Initiative to avoid being turned to stone and slain; a roll of 6 always affects the target regardless of Initiative.",
    },
  ],
  specialCharacters: [],
};

const OGRE_MAGIC_ITEMS = [
  { id: "ogr-ironboot", name: "Iron Boot", cost: 10, cat: "weapon", desc: "The bearer may forfeit all other melee attacks to make one kick against a single man-sized model (20x20mm or 25x25mm base). Roll to hit as normal; if hit but not killed, the target is kicked 2D6\" directly away — landing in water, a wood, on a cliff, in a building, on a heavy obstacle, impassable terrain, or an enemy unit kills it." },
  { id: "ogr-ironfist", name: "Iron Fist", cost: 35, cat: "weapon", desc: "+2 Strength. 1 wound inflicted becomes 1D3 wounds." },
  { id: "ogr-smucklebuckle", name: "Smuckle Buckle", cost: 35, cat: "armour", desc: "+1 armour save. The bearer makes 1D3 Strength 5 impact hits when charging." },
  { id: "ogr-rockeye", name: "Rock Eye", cost: 10, cat: "enchanted", desc: "At the start of each shooting phase, the owner may focus on a single enemy unit within line of sight — that unit must reveal all hidden information within it (magic items, Chaos Gifts, Assassins, Fanatics, spells, etc.), though not which model carries what." },
  { id: "ogr-thiefstone", name: "Thiefstone", cost: 35, cat: "enchanted", desc: "After deployment, before the first turn, name one magic item (not a Dispel Magic Scroll or Magic Banner) — if the enemy has it, it disappears and can't be used this game." },
  { id: "ogr-grutssickle", name: "Grut's Sickle", cost: 10, cat: "arcane", desc: "The Shaman may inflict a wound on the unit he's joined (no saves) at the start of the Magic phase to immediately gain one additional winds of magic card. At the end of any round where he did this, roll 2D6 — on a 2 or 3, the unit decides it's had enough and kills and eats the Shaman.", restrictedTo: [{ tags: ["wizard"] }] },
  { id: "ogr-jollyroger", name: "Jolly Roger", cost: 10, cat: "banner", desc: "All models in the regiment get +1 attack in the first combat round of each engagement. The regiment also suffers from stupidity (due to drunkenness)." },
];

const OGRES = {
  key: "ogres",
  loreOptions: [...COLLEGE_LORES],
  name: "Ogre Mercenaries",
  tagline: "Nomads from the eastern steppes — adaptable, pragmatic, and famously willing to fight on both sides of the same war",
  magicItems: [...COMMON_MAGIC_ITEMS, ...OGRE_MAGIC_ITEMS],
  compositionRules: [
    { kind: "requiresAtLeastOne", label: "At least one Ogre regiment", refs: [
      { list: "regiments", id: "ogres-main", name: "Ogres" },
      { list: "regiments", id: "ogreleadbelchers", name: "Ogre Leadbelchers" },
      { list: "regiments", id: "ogremaneaters", name: "Ogre Maneaters" },
    ] },
  ],
  armyWideRules: [
    "Ogres are monstrous models that cause fear. Sabretooth Tigers are also monstrous and cause fear.",
    "At least one regiment of Ogres (Ogres, Leadbelchers, or Maneaters) must be included, and both the General and Battle Standard Bearer must be Ogre characters. The regiment requirement is now flagged live by this builder (see the warning banner above the roster) — the General/BSB-must-be-Ogre part still isn't, since the app doesn't track a designated general.",
    "Ogres and Allied Tribes: as an independent force, Ogres may ally with Common Goblins, Forest Goblins, Night Goblins, Hobgoblins, or Halflings, but the Ogres remain central to the army. Common Goblin auxiliaries (from Orcs & Goblins) don't gain the higher-Leadership rule that requires Orcs, and include characters, regiments, and one war machine/chariot per full 1,000pts of Ogre models. Night/Forest Goblin auxiliaries (also from Orcs & Goblins) include characters and regiments only — no Gargantuan Spider, no poisoned arrows option. Hobgoblins (from Chaos Dwarfs) include characters, regiments, and one bolt thrower per full 1,000pts. Halflings (from Halflings of the Moot) include characters (not Wizards) and regiments (not Empire or Wood Elf allied troops) plus one war machine/chariot per full 1,000pts — the Liberated Magic Items rule doesn't apply when Halflings are allies. Allied characters use magic items from their own army book only, never the Ogre pool. None of this is mechanically importable in this builder — track allied regiments and their points by hand using the relevant faction as reference.",
    "Giant Blunderbuss (Leadbelchers): fires even if the regiment moved, range 12\", hits every model (friend or foe) more than half within a 12\"-deep firing zone as wide as the regiment. Roll to hit with the unit's average BS (champion's BS doesn't matter) — no long-range or skirmisher/single-model penalty, but cover and move-and-shoot penalties apply as normal. All hits are Strength 4, rising to S5 with two full ranks or S6 with three or more (a last rank of fewer than 4 models doesn't count). Joined characters count as armed with a Blunderbuss for this purpose. Against a lone large target, the unit may instead concentrate fire (one roll per model in the first three ranks, no area effect). May stand-and-shoot with no to-hit penalty. A battle-phase mechanic, not simulated beyond the regiment's own points cost.",
    "Sabretooth Tigers don't act as fast cavalry, but may perform manoeuvres as if they had a musician.",
  ],
  characters: [
    {
      id: "ogretyrant", name: "Ogre Lord", cost: 244, stat: "Ogre Tyrant", magicItemSlots: 3, role: "Lord", tags: ["ogre"],
      armourGroup: { options: ["Light armour (default)", "Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Halberd", "Flail", "Double handed weapon"] },
    },
    {
      id: "ogrebigboss", name: "Ogre Hero", cost: 171, stat: "Ogre Big Boss", magicItemSlots: 2, role: "Hero", tags: ["ogre"],
      armourGroup: { options: ["Light armour (default)", "Heavy Armour"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Halberd", "Flail", "Double handed weapon"] },
    },
    {
      id: "ogrebsb", name: "Ogre Battle Standard Bearer", cost: 128, stat: "Ogre BSB", magicItemSlots: 1, restriction: "0-1", tags: ["ogre", "bsb"],
      gearNote: "The one magic item may be a magic banner.",
      armourGroup: { options: ["Light armour (default)", "Heavy Armour"] },
    },
    {
      id: "ogreshaman", name: "Ogre Shaman", cost: 98, stat: "Ogre Shaman", magicItemSlots: 1, tags: ["wizard", "ogre"],
      gearNote: "Has one magic level, may take any College Magic lore. May take one magic item (Ogres cannot have a familiar).",
    },
    {
      id: "ogreshamanchampion", name: "Ogre Shaman Champion", cost: 182, stat: "Ogre Shaman Champion", magicItemSlots: 2, tags: ["wizard", "ogre"],
      gearNote: "Has two magic levels, may take any College Magic lore. May take two magic items (Ogres cannot have a familiar).",
    },
  ],
  regiments: [
    {
      id: "ogres-main", name: "Ogres", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous",
      note: "Ogres with light armour.",
      options: [
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light", cost: 4, per: "model" },
        { id: "ahw", group: "weapon", label: "Additional hand weapons", cost: 6, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons", cost: 8, per: "model" },
        { id: "flails", group: "weapon", label: "Flails", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion" },
    },
    {
      id: "ogremaneaters", name: "Ogre Maneaters", perModel: 36, minSize: 3, stat: "Ogre Maneater", command: "monstrous", restriction: "0-1",
      note: "Immune to psychology. Ogre Maneaters with light armour.",
      options: [
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light", cost: 4, per: "model" },
        { id: "ahw", group: "weapon", label: "Additional hand weapons", cost: 6, per: "model" },
        { id: "dhw", group: "weapon", label: "Double handed weapons or flails", cost: 8, per: "model" },
        { id: "allthree", group: "weapon", label: "All three weapons — hand weapon, DHW/flail, and additional hand weapon", cost: 10, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 30, magicItemSlots: 1, stat: "Ogre Champion" },
    },
    {
      id: "ogreleadbelchers", name: "Ogre Leadbelchers", perModel: 36, minSize: 3, stat: "Ogre Leadbelcher", command: "monstrous", restriction: "0-1",
      note: "Ogres armed with giant blunderbusses (see army-wide rules for the shooting mechanic).",
      options: [
        { id: "lightarmour", group: "armour", label: "Light armour", cost: 2, per: "model" },
        { id: "heavyarmour", group: "armour", label: "Heavy armour", cost: 6, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion" },
    },
    {
      id: "beastmasterspack", name: "Ogre Beastmasters and Sabretooth Tigers", perModel: 0, minSize: 1, kind: "composite", command: "none", restriction: "0-1",
      note: "Sabretooth Tigers are fear-causing monstrous models on 40x40mm bases like Ogres — they don't act as fast cavalry but may perform manoeuvres as if they had a musician. No standard bearer, musician, or regimental champion.",
      composition: [
        { id: "beastmaster", label: "Ogre Beastmasters", cost: 30, stat: "Ogre Beastmaster" },
        { id: "sabretooth", label: "Sabretooth Tigers", cost: 20, stat: "Sabretooth Tiger" },
      ],
    },
  ],
  chariotsMonsters: [
    {
      id: "giants-ogre", name: "Giants", perUnit: 200, stat: "Giant (Orc)",
      note: "Causes terror.",
      variantOptions: [
        { id: "cyclops", label: "Upgrade to a Cyclops — may hurl boulders like a small stone thrower if it didn't march that turn (guess range, roll the artillery die; on a misfire the shot scatters 1D6x10\" in a random direction from the Cyclops)", cost: 50 },
      ],
    },
    {
      id: "rhinoriders", name: "Rhino Riders", perUnit: 80, stat: "Ogre", mountStat: "Rhino", mountLabel: "Rhino", command: "none",
      note: "An Ogre with light armour riding a Rhino. Works like a heavy chariot (T5, W4, 5+ armour save) except: doesn't reduce its movement rate by half when down to one wound, and the Rhino may strike to all sides in melee. Causes fear (the Rhino).",
      variantOptions: [
        { id: "tusks", label: "Additional tusks and horns — impact hits become 1D6+2 instead of the usual 1D6", cost: 20 },
      ],
    },
  ],
  specialCharacters: [],
};

const LIZARDMEN_MAGIC_ITEMS = [
  { id: "liz-piranhablade", name: "Piranha Blade", cost: 10, cat: "weapon", desc: "1 wound inflicted becomes 1D3 wounds." },
  { id: "liz-malachitemace", name: "Ceremonial Mace of Malachite", cost: 25, cat: "weapon", desc: "The bearer cannot be hit by magic weapons — enemies must use a mundane weapon against him." },
  { id: "liz-daggerofsotek", name: "Dagger of Sotek", cost: 50, cat: "weapon", desc: "Skinks only. +1 Strength, no armour save allowed, 1 wound becomes 1D3 wounds. Skaven in base contact with the bearer can't claim rank bonus for LD tests.", restrictedTo: [{ tags: ["skink"] }] },
  { id: "liz-eggofquango", name: "The Egg of Quango", cost: 10, cat: "enchanted", desc: "One use only. If cracked, the bearer gains 1D3 extra attacks in one melee phase." },
  { id: "liz-glyphofpotec", name: "Glyph of Potec", cost: 10, cat: "enchanted", desc: "Undead models suffer double wounds when wounded by the bearer (doesn't stack with other double-wound sources)." },
  { id: "liz-cloakoffeathers", name: "Cloak of Feathers", cost: 20, cat: "enchanted", desc: "Skinks on foot only. The bearer can fly.", restrictedTo: [{ tags: ["skink"] }] },
  { id: "liz-shieldoldones", name: "Shield of the Old Ones", cost: 30, cat: "arcane", desc: "A 5+ ward save. Slann only.", restrictedTo: [{ tags: ["slann"] }] },
  { id: "liz-amuletitza", name: "Amulet of Itza", cost: 40, cat: "arcane", desc: "Natural dispel 4+. A successful dispel deals a magical S4 hit to the unfortunate caster (or bearer of the relevant bound item)." },
  { id: "liz-itxigrubs", name: "The Itxi Grubs", cost: 40, cat: "arcane", desc: "If eaten when magic cards are dealt, the bearer gains 1D6+1 magic cards only he can use. One use only." },
  { id: "liz-plaquetepec", name: "The Plaque of Tepec", cost: 50, cat: "arcane", desc: "Works as a Dispel Magic Scroll. After use, both players roll 1D6 — if the owner rolls higher, the spell is also destroyed. One use only." },
  { id: "liz-plaquexoloc", name: "The Plaque of Xoloc", cost: 50, cat: "arcane", desc: "Slann only. The Mage Priest (or another friendly Slann) may cast one spell for free as if cast with Total Power. All wizards on the battlefield then suffer a wound on a roll of 1 on 1D6. One use only.", restrictedTo: [{ tags: ["slann"] }] },
  { id: "liz-plaqueknowledge", name: "Plaque of Knowledge", cost: 75, cat: "arcane", desc: "The wizard may freely mix spells from any of the eight Colleges of Magic (can't pick spells another wizard already has), but loses the bonuses of following a single lore exclusively and can't use lore-exclusive items." },
  { id: "liz-jaguarstandard", name: "Jaguar Standard", cost: 10, cat: "banner", desc: "The regiment pursues and overruns an extra 1D6\"." },
  { id: "liz-totemsotek", name: "Totem of Sotek", cost: 20, cat: "banner", desc: "Jungle Swarms may deploy within 12\" of this banner (but at least 8\" from enemy units), after vanguard troops move." },
  { id: "liz-skavenpelt", name: "Skavenpelt Banner", cost: 20, cat: "banner", desc: "Skink regiments only. Causes fear in Skaven.", restrictedTo: [{ tags: ["skink"] }] },
  { id: "liz-sunbursthexoatl", name: "The Sunburst Standard of Hexoatl", cost: 20, cat: "banner", desc: "The regiment can't be charged by flyers using their fly move — flyers must use their ground move to charge it." },
  { id: "liz-sacredserpent", name: "Standard of the Sacred Serpent", cost: 40, cat: "banner", desc: "If unengaged, spits 1D6 venomous missiles in the shooting phase that hit automatically — range 12\", Strength 4, poisonous (no effect on poison-immune creatures)." },
];

const LIZARDMEN = {
  key: "lizardmen",
  loreOptions: [...COLLEGE_LORES, "High Magic"],
  name: "Lizardmen",
  tagline: "From the steaming jungles of Lustria — an ancient, reptilian civilization guided by the Slann Mage Priests toward the unfathomable plans of the Old Ones",
  magicItems: [...COMMON_MAGIC_ITEMS, ...LIZARDMEN_MAGIC_ITEMS],
  armyWideRules: [
    "Blowpipes: no long-range penalty. Darts may be poisoned (+1 Strength). Range 12\", Strength 3, may shoot twice at -1 to hit.",
    "Aquatic: Skinks move through water without penalty. Regiments that include Cold Ones lose this rule (see Cold One special rules below).",
    "Scaly Skin: every Lizardman has a natural armour save that can't be modified below 6+ (unless no save is allowed at all) — Skinks 6+, Saurus 5+, and the larger Lizardmen (Kroxigors, Carnosaurs, Salamanders, Stegadons) 4+.",
    "Cold Blooded: every model in the army is resolute — Leadership tests are taken rolling an extra 1D6 and discarding the highest die. A battle-phase mechanic, not simulated by this builder.",
    "Cold Ones (and the slightly larger Horned Ones) cause fear, are subject to stupidity, and can't be used as fast cavalry. They improve their rider's armour save by an additional +1, as if barded. A regiment including Cold Ones becomes subject to stupidity and loses the Aquatic rule. The book's Character-table and Regiment-table stat rows for the Horned One disagree on its Leadership (7 vs 3) — this builder uses Ld3 consistently, matching the Cold One's own Ld3 and the \"too unruly\" flavor text.",
    "Carnosaurs are large, cause terror, are subject to frenzy, and have a 4+ scaly-skin save (floor 6+). Each wound they inflict multiplies into 1D3 wounds.",
    "If more than one Slann Mage Priest is on the battlefield, they may use each other's spells via telepathy, even across different lores. Not hard-enforced by this builder.",
  ],
  characters: [
    {
      id: "saurusbsb", name: "Lizardman Saurus Battle Standard Bearer", cost: 112, stat: "Lizardman Saurus BSB", magicItemSlots: 1, restriction: "0-1", tags: ["saurus", "bsb"],
      gearNote: "You can't take this option if a Slann Mage Priest is instead carrying the battle standard. May take light armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["No armour (default)", "Light Armour"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 23, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 33, stat: "Horned One" },
      ],
    },
    {
      id: "saurushero", name: "Lizardman Saurus Hero", cost: 118, stat: "Lizardman Saurus Hero", magicItemSlots: 2, role: "Hero", tags: ["saurus"],
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Spear", "Additional hand weapon", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 37, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 47, stat: "Horned One" },
        { id: "carnosaur", name: "Carnosaur", cost: 188, stat: "Carnosaur" },
      ],
    },
    {
      id: "skinkhero", name: "Lizardman Skink Hero", cost: 53, stat: "Lizardman Skink Hero", magicItemSlots: 2, role: "Hero", tags: ["skink"],
      gearNote: "One Skink Hero may join a Stegadon's howdah crew, as long as the total crew doesn't exceed the maximum (not hard-enforced).",
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Spear", "Additional hand weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Poisoned Javelins", "Short Bow (poisoned arrows)", "Blowpipe (poisoned darts)"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 15, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 25, stat: "Horned One" },
        { id: "terradon", name: "Terradon", cost: 38, stat: "Terradon" },
      ],
    },
    {
      id: "skinkshaman", name: "Lizardman Skink Shaman", cost: 46, stat: "Lizardman Skink Shaman", magicItemSlots: 2, tags: ["wizard", "skink"],
      gearNote: "Has one magic level. May use any College Magic lore. One Skink Shaman may join a Stegadon's howdah crew, as long as the total crew doesn't exceed the maximum (not hard-enforced).",
      mounts: [
        { id: "coldone", name: "Cold One", cost: 0, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 10, stat: "Horned One" },
        { id: "terradon", name: "Terradon", cost: 30, stat: "Terradon" },
      ],
    },
    {
      id: "slannlord", name: "Slann Mage Priest Lord (level 4)", cost: 400, stat: "Slann Mage Priest Lord", magicItemSlots: 5, role: "Lord", tags: ["wizard", "slann"],
      gearNote: "Carried atop a Palanquin, which makes him a large monster — normally moves and fights as a single model, but may instead be placed in the middle of a regiment's front rank (targetable separately by missile fire; rank bonus counts the space as regular troops). May use High Magic and College Magic. May carry the battle standard for +75pts (one item may then be a magic banner) — not toggled here, add the cost by hand. Gets one magic item more than his levels (already reflected: 5 slots for level 4).",
    },
    {
      id: "mastermageslann", name: "Master Slann Mage Priest (level 3)", cost: 250, stat: "Master Slann Mage Priest", magicItemSlots: 4, tags: ["wizard", "slann"],
      gearNote: "Carried atop a Palanquin (large monster; may be placed in a regiment's front rank instead — see Lord's note). May use High Magic and College Magic. May carry the battle standard for +75pts (not toggled here). Gets one magic item more than his levels (already reflected).",
    },
    {
      id: "slannchampion", name: "Slann Mage Priest Champion (level 2)", cost: 150, stat: "Slann Mage Priest Champion", magicItemSlots: 3, tags: ["wizard", "slann"],
      gearNote: "Carried atop a Palanquin (large monster; may be placed in a regiment's front rank instead). May use High Magic and College Magic. May carry the battle standard for +75pts (not toggled here). Gets one magic item more than his levels (already reflected).",
    },
    {
      id: "slannmagepriest", name: "Slann Mage Priest (level 1)", cost: 75, stat: "Slann Mage Priest", magicItemSlots: 2, tags: ["wizard", "slann"],
      gearNote: "Carried atop a Palanquin (large monster; may be placed in a regiment's front rank instead). May use High Magic and College Magic. May carry the battle standard for +75pts (not toggled here). Gets one magic item more than his levels (already reflected).",
    },
    {
      id: "mummifiedslann", name: "Mummified Slann Mage Priest Lord (level 5)", cost: 250, stat: "Slann Mage Priest Lord", magicItemSlots: 6, magicItemCategoryFilter: ["enchanted", "arcane", "banner"], tags: ["wizard", "slann"],
      gearNote: "A long-dead Slann on his ancient Palanquin. Cannot cast his own spells (not even bound spells) and cannot be the army general, but knows 5 spells which he can lend telepathically to other friendly Slann anywhere on the battlefield, and can still attempt to dispel enemy spells. Fights in melee as if alive. Cannot wield a magic weapon or wear magic armour (already reflected — only enchanted/arcane/banner items shown below). If accompanied by a regiment of Saurus Temple Guard, that regiment is unbreakable as long as he lives (not hard-enforced).",
    },
  ],
  regiments: [
    {
      id: "skinkwarriors", name: "Skink Warriors", perModel: 4, minSize: 5, stat: "Lizardman Skink Warrior", command: "standard", tags: ["skink"],
      note: "Armed with short bows. May skirmish (mandatory if missiles are poisoned — not hard-enforced).",
      options: [
        { id: "javelins", group: "weapon", label: "Swap short bows for javelins and shields", cost: 0, per: "model" },
        { id: "blowpipes", group: "weapon", label: "Swap short bows for blowpipes", cost: 1, per: "model" },
        { id: "poison", group: null, label: "Poison missile weapons — forces skirmish formation (not enforced)", cost: 2, per: "model" },
      ],
      extraOption: { label: "Embedded Kroxigors (one per 8 Skinks — forces rank-and-file formation, not enforced)", cost: 50, max: 5 },
      champion: { name: "Skink Champion", baseCost: 10, magicItemSlots: 1, stat: "Lizardman Skink Champion" },
    },
    {
      id: "saurustempleguard", name: "Saurus Temple Guard", perModel: 18, minSize: 5, stat: "Lizardman Saurus Temple Guard", command: "standard", tags: ["saurus"],
      note: "Armed with halberds.",
      options: [
        { id: "lightarmour", group: null, label: "Light armour", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Saurus Champion", baseCost: 20, magicItemSlots: 1, stat: "Lizardman Saurus Champion" },
    },
    {
      id: "saruswarriors", name: "Saurus Warriors", perModel: 15, minSize: 5, stat: "Lizardman Saurus Warrior", command: "standard", tags: ["saurus"],
      note: "Armed with hand weapons and shields.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 3, per: "model" },
      ],
      champion: { name: "Saurus Champion", baseCost: 20, magicItemSlots: 1, stat: "Lizardman Saurus Champion" },
    },
    {
      id: "sauruscoldoneriders", name: "Saurus Cold One Riders", perModel: 36, minSize: 5, stat: "Lizardman Saurus Warrior", mountStat: "Cold One", mountLabel: "Cold One", command: "standard", tags: ["saurus"],
      note: "Armed with spears and shields, riding Cold Ones. Not classified as fast cavalry.",
      champion: { name: "Saurus Champion", baseCost: 20, magicItemSlots: 1, stat: "Lizardman Saurus Champion", note: "May exchange his Cold One for a Horned One for +10pts (not toggled here — add by hand)." },
    },
    {
      id: "greatcrestedcoldoneriders", name: "Great Crested Skink Cold One Riders", perModel: 18, minSize: 5, stat: "Lizardman Great Crested Skink Warrior", mountStat: "Cold One", mountLabel: "Cold One", command: "standard", tags: ["skink"],
      note: "Great Crested Skink Warriors armed with spears and shields, riding Cold Ones. Not classified as fast cavalry.",
      champion: { name: "Skink Champion", baseCost: 10, magicItemSlots: 1, stat: "Lizardman Skink Champion", note: "May exchange his Cold One for a Horned One for +10pts (not toggled here — add by hand)." },
    },
    {
      id: "kroxigors", name: "Kroxigors", perModel: 50, minSize: 3, stat: "Lizardman Kroxigor", command: "none",
      note: "Monstrous models that cause fear, armed with double handed weapons. 4+ armour save (floor 6+). May instead be embedded in the second/third rank of a Skink Warrior regiment (see that regiment's options) rather than fielded as their own regiment. Cannot take a standard bearer, musician, or regimental champion.",
    },
    {
      id: "chameleonskinks", name: "Chameleon Skinks", perModel: 17, minSize: 5, stat: "Lizardman Chameleon Skink", command: "skirmisher", restriction: "0-1", tags: ["skink"],
      note: "Armed with blowpipes shooting poisonous darts. Must skirmish, may scout. Enemies shooting at them with BS suffer an extra -1 to hit (on top of the usual skirmisher penalty).",
      champion: { name: "Chameleon Skink Champion", baseCost: 20, magicItemSlots: 1, stat: "Chameleon Skink Champion" },
    },
    {
      id: "terradonriders", name: "Terradon Riders", perModel: 42, minSize: 3, stat: "Lizardman Skink Warrior", mountStat: "Terradon", mountLabel: "Terradon", command: "skirmisher", restriction: "0-1", tags: ["skink"],
      note: "Flying steeds, fight in skirmish formation — two Skink Warriors ride each Terradon (both must be killed before the model is removed). Each Terradon drops a rock when charging (one S6 impact hit per Terradon in the regiment; jettisoned harmlessly if charged or hit by a glancing blow first). Priced per Terradon (i.e. per pair of riders).",
      options: [
        { id: "spears", group: "melee", label: "Spears, for both riders", cost: 3, per: "model" },
        { id: "shields", group: null, label: "Shields, for both riders", cost: 3, per: "model" },
        { id: "javelins", group: "missile", label: "Javelins, for both riders", cost: 2, per: "model" },
        { id: "shortbows", group: "missile", label: "Short bows, for both riders", cost: 2, per: "model" },
        { id: "poison", group: null, label: "Poison missile weapons, for both riders", cost: 4, per: "model" },
      ],
      champion: { name: "Skink Champion", baseCost: 10, magicItemSlots: 1, stat: "Lizardman Skink Champion" },
    },
  ],
  chariotsMonsters: [
    {
      id: "monstrousspiderscorpion-liz", name: "Monstrous Spider/Scorpion", kind: "quantity", perUnit: 40, stat: "Monstrous Spider",
      note: "A small monster. Follows the main-rulebook rules for Monstrous Spiders/Scorpions.",
    },
    {
      id: "jungleswarms", name: "Jungle Swarm", kind: "quantity", perUnit: 40, stat: "Jungle Swarms", countsAsFirstRegiment: true,
      note: "The smallest base counts toward Regiments; further bases count toward Monsters. Follows the main-rulebook rules for Swarms. Priced per base.",
    },
    {
      id: "stegadons", name: "Stegadon", perUnit: 200, stat: "Stegadon", mountStat: "Lizardman Skink Warrior", mountLabel: "Skink Crew (howdah)",
      note: "A large monster ridden by four Skink Warriors with short bows or poisoned-dart blowpipes, huddled in a howdah. Causes terror, 4+ scaly-skin save (floor 6+), immune to psychology. Inflicts 1D6 Strength 7 impact hits on a charge (or fleeing through friendly regiments). All hits go against the monster; if it dies, the crew dies too. Max 5 crew in the howdah, leaving room for one joined character (not hard-enforced).",
      variantOptions: [
        { id: "boltthrower", label: "Small bolt thrower mounted in the howdah — range 24\", Strength 5, fires in a 360° arc even after marching; if used, the crew can't also fire their other missile weapons", cost: 25 },
        { id: "secondtier", label: "Second howdah tier — 5 more crewmen who can shoot while the lower crew operate the bolt thrower, if taken", cost: 25 },
      ],
    },
    {
      id: "salamanders-liz", name: "Salamander", perUnit: 80, stat: "Salamander", mountStat: "Lizardman Skink Warrior", mountLabel: "Skink Handlers (4, with prodders)",
      note: "A four-legged reptile that shoots fireballs, accompanied by four Skink handlers. 4+ scaly-skin save (floor 6+). Moves as skirmishers, but enemies get no shooting penalty for it (too large to benefit) — if shot at, roll 1D6: 1-4 hits the Salamander, 5-6 hits a handler. If it hasn't marched, may shoot an artillery-die number of S4 no-armour-save flaming fireballs (range 24\"); a misfire means it eats 1D3 handlers instead. May stand-and-shoot as a charge reaction. Rolls on the Monster Reaction Table if all handlers are slain. Not aquatic, but may cross water at half speed. Battle-phase specifics documented, not simulated beyond points cost.",
    },
  ],
  specialCharacters: [
    { id: "kroq", name: "Kroq", cost: 180, stat: "Lizardman Saurus Hero", role: "Saurus Hero",
      note: "His attacks allow no armour save and inflicted wounds multiply into 1D3 wounds. May re-roll his armour saves. Carries a shield." },
    { id: "oxayotl", name: "Oxayotl", cost: 100, stat: "Oxayotl", role: "Skink Hero",
      note: "5+ scaly-skin save. Shooting attacks against him suffer -2 to hit. May be deployed as a scout, or in the open no closer than 8\" from the enemy (chameleon heritage). Carries a blowpipe that may fire three poisonous Strength 5 hits." },
    { id: "lordkroak", name: "Venerable Lord Kroak", cost: 375, stat: "Slann Mage Priest Lord", role: "Mummified Slann Mage Priest Lord, 5 magic levels",
      note: "May take five additional magic items.",
      items: "Carries The Gold Death Mask — enemies can't hit Kroak in melee unless they roll a natural 6 to hit (or 5+ with an always-hits weapon)." },
    { id: "lotlbotl", name: "Lotl Botl", cost: 150, stat: "Lizardman Saurus Hero", role: "Saurus Hero",
      note: "Causes fear. His presence in a regiment adds +1 to combat resolution. Light armour and a shield." },
    { id: "tenehuini", name: "Tenehuini, Prophet of Sotek", cost: 100, stat: "Lizardman Skink Shaman", role: "Skink Shaman and Battle Standard Bearer",
      note: "4+ ward save.",
      items: "Carries the Dagger of Sotek and the Totem of Sotek." },
    { id: "inxihuinzi", name: "Inxi-Huinzi", cost: 90, stat: "Lizardman Skink Hero", role: "Skink Hero",
      note: "When charging or being charged, throws one poisoned dart per full 4\" of the charge (roll to hit with BS; each wounds on 4+ unless the target is poison-immune, no armour save, counts toward combat resolution). Carries a spear, poisoned darts, light armour, and a shield.",
      mounts: [{ id: "hornedone", name: "Horned One", cost: 0, stat: "Horned One" }] },
    { id: "itzibitzi", name: "Itzi-Bitzi", cost: 80, stat: "Lizardman Skink Hero", role: "Skink Hero",
      note: "Once per battle, in the Lizardmen movement phase, may force all non-deaf enemies within 8\" (Dwarf Longbeards excepted) to take a panic test on three dice choosing the two highest (resolute troops take a normal panic test) — applies even to units in melee. Carries light armour, a shield, and the Piranha Blade." },
    { id: "mazdamundi", name: "Emperor Mazdamundi", cost: 600, stat: "Emperor Mazdamundi", role: "Slann Mage Priest Lord riding a Stegadon (already incorporated into his profile)",
      note: "Causes terror and delivers 1D6 impact hits like a chariot. Always knows four fixed spells: Move the Mountains (Power 2, freezes a hill's units), The Ruination of Cities (Power 3, destroys a building/bridge and everything on it), Earth Line (Power 2, S10 hit along a line to a table corner), and Part the Waters (Power 1, removes a water feature). Carries the battle standard. May take four additional magic items, one of which may be a magic banner.",
      items: "Carries the Cobra Mace of Mazdamundi — enemies attacking him with a magic weapon must roll 1D6 each round first; on a 6 the weapon is destroyed and no attack is made." },
  ],
};

const SLANN_MAGIC_ITEMS = [
  { id: "sla-amuletitza", name: "Amulet of Itza", cost: 40, cat: "arcane", desc: "Natural dispel 4+. A successful dispel deals a magical S4 hit to the unfortunate caster (or bearer of the relevant bound item)." },
  { id: "sla-itxigrubs", name: "The Itxi Grubs", cost: 40, cat: "arcane", desc: "If eaten when magic cards are dealt, the bearer gains 1D6+1 magic cards only he can use. One use only." },
  { id: "sla-plaquetepec", name: "The Plaque of Tepec", cost: 50, cat: "arcane", desc: "Works as a Dispel Magic Scroll. After use, both players roll 1D6 — if the owner rolls higher, the spell is also destroyed. One use only." },
  { id: "sla-plaquexoloc", name: "The Plaque of Xoloc", cost: 50, cat: "arcane", desc: "The Mage Priest (or another friendly Slann Mage Priest) may cast one spell for free as if cast with Total Power. All wizards on the battlefield then suffer a wound on a roll of 1 on 1D6. One use only.", restrictedTo: [{ tags: ["slann"] }] },
  { id: "sla-plaqueknowledge", name: "Plaque of Knowledge", cost: 75, cat: "arcane", desc: "The wizard may freely mix spells from any of the eight Colleges of Magic (can't pick spells another wizard already has), but loses the bonuses of following a single lore exclusively and can't use lore-exclusive items.", restrictedTo: [{ tags: ["wizard"] }] },
  { id: "sla-jaguarstandard", name: "Jaguar Standard", cost: 20, cat: "banner", desc: "The regiment pursues and overruns an extra 1D6\"." },
  { id: "sla-sunbursthexoatl", name: "The Sunburst Standard of Hexoatl", cost: 20, cat: "banner", desc: "The regiment can't be charged by flyers using their fly move — flyers must use their ground move to charge it." },
  { id: "sla-totemquetzalcoatl", name: "Totem of Quetzalcoatl", cost: 30, cat: "banner", desc: "The regiment becomes immune to psychology." },
  { id: "sla-shacklestandard", name: "Shackle Standard", cost: 60, cat: "banner", desc: "Lobotomised Slaves only. The regiment becomes unbreakable.", restrictedTo: [{ tags: ["lobotomised"] }] },
  { id: "sla-antiteleport", name: "Anti-Teleport Field", cost: 10, cat: "heirloom", desc: "Teleporting is impossible within an 18\" radius of this techno device.", restrictedTo: [{ tags: ["slann"] }] },
  { id: "sla-blaster", name: "Blaster", cost: 20, cat: "heirloom", desc: "Range 18\", wounds on 3+, no armour save allowed. Roll to hit with BS as normal. Any Slann character may take this even without a mundane counterpart or normal access to missile weapons — a Slann Mage Priest can't cast spells the turn he fires it.", restrictedTo: [{ tags: ["slann"] }] },
  { id: "sla-protectivefield", name: "Protective Field", cost: 30, cat: "heirloom", desc: "A 5+ ward save.", restrictedTo: [{ tags: ["slann"] }] },
  { id: "sla-antimagicfield", name: "Anti-Magic Field", cost: 40, cat: "heirloom", desc: "A 3+ natural dispel.", restrictedTo: [{ tags: ["slann"] }] },
  { id: "sla-powerweapon", name: "Power Weapon", cost: 40, cat: "heirloom", desc: "+3 Strength, no armour save allowed.", restrictedTo: [{ tags: ["slann"] }] },
];

const SLANN_EMPIRE = {
  key: "slann",
  loreOptions: [...COLLEGE_LORES, "High Magic"],
  name: "The Slann Empire",
  tagline: "The original Slann army of 2nd/3rd edition, restored — Stone Age heirs to a starfaring civilization, ruling Lustria through the Mage Priests and their Lizardmen servitors",
  magicItems: [...COMMON_MAGIC_ITEMS, ...SLANN_MAGIC_ITEMS],
  compositionRules: [
    { kind: "ratio", label: "Auxiliary (Lizardmen/Lobotomised/Native Tribe)", numerator: [
      { list: "regiments", id: "lobotomisedslaves", name: "Lobotomised Human Slaves" },
      { list: "regiments", id: "kroxigors-slann", name: "Kroxigors" },
      { list: "regiments", id: "saurustempleguard-slann", name: "Saurus Temple Guard" },
      { list: "regiments", id: "sauruswarriors-slann", name: "Saurus Warriors" },
      { list: "regiments", id: "terradonriders-slann", name: "Terradon Riders" },
      { list: "regiments", id: "nativehalflings", name: "Native Halflings" },
      { list: "regiments", id: "ghoulishcannibaltribes", name: "Ghoulish Cannibal Tribes" },
      { list: "regiments", id: "amazonwarriors", name: "Amazon Warriors" },
      { list: "regiments", id: "chameleonskinks-slann", name: "Chameleon Skinks" },
    ], denominator: [{ list: "regiments", tag: "slann", name: "Slann" }], maxRatio: 1 },
  ],
  armyWideRules: [
    "Army Composition: the general must be a Slann character, and there must be at least as many Slann regiments as Auxiliary regiments (Lizardmen, Lobotomised Slaves, and Native Tribes combined can't outnumber Slann regiments). The ratio is now flagged live by this builder (see the warning banner above the roster); the general-must-be-Slann part isn't, since the app doesn't track a designated general.",
    "Blowpipes: no long-range penalty. Darts may be poisoned (+1 Strength). Range 12\", Strength 3, may shoot twice at -1 to hit.",
    "Aquatic: both Slann and Lizardmen Skinks move through water without penalty. A regiment that includes Cold Ones loses this rule.",
    "Lizardmen Scaly Skin: every Lizardman in the army has a natural armour save that can't be modified below 6+ (unless no save is allowed at all) — Skinks 6+, Saurus 5+, and the larger Lizardmen (Kroxigors, Carnosaurs, Salamanders, Stegadons) 4+.",
    "Cold Blooded: every Lizardman in the army is resolute (Leadership tests use an extra 1D6, discarding the highest die) — this holds even in a regiment joined by Slann characters. Per the normal rule for resolute troops, a resolute character joining a non-resolute regiment doesn't make that regiment resolute; in fact such a character loses the benefit entirely while he remains with it. A battle-phase mechanic, not simulated by this builder.",
    "Cold Ones (and the slightly larger Horned Ones) cause fear, are subject to stupidity, and can't be used as fast cavalry. They improve their rider's armour save by an additional +1, as if barded. A regiment including Cold Ones becomes subject to stupidity and loses the Aquatic rule. As with the Lizardmen army, this book's Character-table and Regiment-table stat rows for the Horned One disagree on its Leadership (7 vs 3) — this builder uses Ld3 consistently, matching the Cold One's own Ld3.",
    "Carnosaurs are large, cause terror, are subject to frenzy, and have a 4+ scaly-skin save (floor 6+). Each wound they inflict multiplies into 1D3 wounds.",
    "Native Tribes: the army may include a single regiment (no more) of ONE of Native Halflings, Ghoulish Cannibal Tribes, Amazon Warriors, or Chameleon Skinks — all four are individually capped at 0-1 by this builder, but nothing stops adding one of each; treat the four as a single shared 0-1 slot and only take one type. All Native Tribes may scout and must always deploy in skirmish formation, and all fire poisonous projectiles.",
    "Heirlooms of the Old Slann are technological artefacts, not magic — they count toward a character's normal item-slot limit but aren't nullified by anti-magic-item effects, and (unlike ordinary magic items) the army may include more than one of the same Heirloom overall, so long as no single character carries two of the same one. This builder's magic-item picker normally prevents taking the same item twice anywhere in the roster — for a second copy of a Heirloom on a different character, track it by hand.",
    "If more than one Slann Mage Priest is on the battlefield, they may use each other's spells via telepathy, even across different lores. Not hard-enforced by this builder.",
  ],
  characters: [
    {
      id: "slannwarlord", name: "Slann Warlord", cost: 124, stat: "Slann Warlord", magicItemSlots: 3, role: "Lord", tags: ["slann"],
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Spear", "Additional hand weapon", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 30, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 40, stat: "Horned One" },
        { id: "terradon", name: "Terradon", cost: 51, stat: "Terradon" },
      ],
    },
    {
      id: "slannhero", name: "Slann Hero", cost: 74, stat: "Slann Hero", magicItemSlots: 2, role: "Hero", tags: ["slann"],
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Spear", "Additional hand weapon", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 23, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 33, stat: "Horned One" },
        { id: "terradon", name: "Terradon", cost: 44, stat: "Terradon" },
      ],
    },
    {
      id: "slannwarriorpriest", name: "Slann Warrior Priest", cost: 94, stat: "Slann Hero", magicItemSlots: 2, tags: ["slann"],
      gearNote: "Worships legendary creatures such as Quetzalcoatl. Subject to frenzy and hatred — immune to psychology and takes break tests without modifiers when alone, but must still flee along with any regiment he's joined if it flees.",
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Spear", "Additional hand weapon", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 23, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 33, stat: "Horned One" },
        { id: "terradon", name: "Terradon", cost: 44, stat: "Terradon" },
      ],
    },
    {
      id: "slannbsb", name: "Slann Battle Standard Bearer", cost: 88, stat: "Slann BSB", magicItemSlots: 1, restriction: "0-1", tags: ["slann", "bsb"],
      gearNote: "May take light armour for free. The one magic item may be a magic banner.",
      armourGroup: { options: ["Light armour (default)"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 16, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 26, stat: "Horned One" },
      ],
    },
    {
      id: "saurushero-slann", name: "Lizardman Saurus Hero", cost: 118, stat: "Lizardman Saurus Hero", magicItemSlots: 2, role: "Hero", tags: ["saurus"],
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Spear", "Additional hand weapon", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 37, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 47, stat: "Horned One" },
        { id: "carnosaur", name: "Carnosaur", cost: 188, stat: "Carnosaur" },
      ],
    },
    {
      id: "skinkhero-slann", name: "Lizardman Skink Hero", cost: 53, stat: "Lizardman Skink Hero", magicItemSlots: 2, role: "Hero", tags: ["skink"],
      gearNote: "One Skink Hero may join a Stegadon's howdah crew, as long as the total crew doesn't exceed 10 models.",
      armourGroup: { options: ["Shield & Light Armour (default)"] },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Spear", "Additional hand weapon"] },
      missileGroup: { label: "Missile weapon (any one)", cost: 10, options: ["None (default)", "Poisoned Javelins", "Short Bow (poisoned arrows)", "Blowpipe (poisoned darts)"] },
      mounts: [
        { id: "coldone", name: "Cold One", cost: 15, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 25, stat: "Horned One" },
        { id: "terradon", name: "Terradon", cost: 38, stat: "Terradon" },
      ],
    },
    {
      id: "skinkshaman-slann", name: "Lizardman Skink Shaman", cost: 46, stat: "Lizardman Skink Shaman", magicItemSlots: 2, tags: ["wizard", "skink"],
      gearNote: "Has one magic level. May use any College Magic lore. One Skink Shaman may join a Stegadon's howdah crew, as long as the total crew doesn't exceed 10 models.",
      mounts: [
        { id: "coldone", name: "Cold One", cost: 0, stat: "Cold One" },
        { id: "hornedone", name: "Horned One", cost: 10, stat: "Horned One" },
        { id: "terradon", name: "Terradon", cost: 30, stat: "Terradon" },
      ],
    },
    {
      id: "slannmagelord", name: "Slann Mage Priest Lord (level 4)", cost: 314, stat: "Slann Empire Mage Priest Lord", magicItemSlots: 5, role: "Lord", tags: ["wizard", "slann"],
      gearNote: "Carried atop a Palanquin, which gives him +4 Wounds and +4 Attacks (already reflected) and makes him a large monster — normally moves and fights as a single model, but may instead be placed in the middle of a regiment's front rank (targetable separately by missile fire; rank bonus counts the space as regular troops). May use High Magic and College Magic. Gets one magic item more than his levels (already reflected: 5 slots for level 4).",
    },
    {
      id: "slannmagemaster", name: "Master Slann Mage Priest (level 3)", cost: 236, stat: "Slann Empire Master Mage Priest", magicItemSlots: 4, tags: ["wizard", "slann"],
      gearNote: "Carried atop a Palanquin (+4W/+4A already reflected, makes him a large monster; may be placed in a regiment's front rank instead — see Lord's note). May use High Magic and College Magic. Gets one magic item more than his levels (already reflected).",
    },
    {
      id: "slannmagechampion", name: "Slann Mage Priest Champion (level 2)", cost: 172, stat: "Slann Empire Mage Priest Champion", magicItemSlots: 3, tags: ["wizard", "slann"],
      gearNote: "Carried atop a Palanquin (+4W/+4A already reflected, large monster; may be placed in a regiment's front rank instead). May use High Magic and College Magic. Gets one magic item more than his levels (already reflected).",
    },
    {
      id: "slannmagepriestbase", name: "Slann Mage Priest (level 1)", cost: 108, stat: "Slann Empire Mage Priest", magicItemSlots: 2, tags: ["wizard", "slann"],
      gearNote: "Carried atop a Palanquin (+4W/+4A already reflected, large monster; may be placed in a regiment's front rank instead). May use High Magic and College Magic. Gets one magic item more than his levels (already reflected).",
    },
    {
      id: "waraltar", name: "War Altar", cost: 134, stat: "Slann Empire Mage Priest Lord", magicItemSlots: 6, magicItemCategoryFilter: ["enchanted", "arcane", "banner", "heirloom"], tags: ["wizard", "slann"],
      gearNote: "A long-dead, mummified Slann Mage Priest, still seated on his ancient Palanquin (+4W/+4A already reflected, large monster). Cannot cast his own spells (not even bound spells) and cannot be the army general, but knows five spells — drawn from High Magic or a College Magic deck — which he can lend telepathically to other friendly Slann Mage Priests anywhere on the battlefield, and can still attempt to dispel enemy magic. Fights in melee as if alive. Cannot wield a magic weapon or wear magic armour (already reflected — only enchanted/arcane/banner/heirloom items shown below).",
    },
  ],
  regiments: [
    {
      id: "lobotomisedslaves", name: "Lobotomised Human Slaves", perModel: 4, minSize: 5, stat: "Lobotomised Human Slave", command: "standard", tags: ["lobotomised"],
      note: "Equipped with shields. Immune to psychology, subject to stupidity.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 1, per: "model" },
      ],
      champion: { name: "Slann Champion", baseCost: 20, magicItemSlots: 1, stat: "Slann Champion" },
    },
    {
      id: "slannwarriors", name: "Slann Warriors", perModel: 8, minSize: 5, stat: "Slann Warrior", command: "standard", tags: ["slann"],
      note: "Light armour and shields.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 2, per: "model" },
      ],
      champion: { name: "Slann Champion", baseCost: 20, magicItemSlots: 1, stat: "Slann Champion" },
    },
    {
      id: "slannanimalhandlers", name: "Slann Animal Handlers", perModel: 0, minSize: 1, kind: "composite", command: "none", restriction: "0-1", tags: ["slann"],
      note: "Lizard Hounds have a 5+ armour save (floor 6+ unless no save is allowed at all) due to scaly skin. Cannot take a standard bearer or musician, and cannot be joined by characters.",
      composition: [
        { id: "beastmaster", label: "Slann Beastmasters", cost: 14, stat: "Slann Beastmaster" },
        { id: "hound", label: "Lizard Hounds", cost: 8, stat: "Lizard Hound" },
      ],
    },
    {
      id: "slannvenomtribes", name: "Slann Venom Tribes", perModel: 8, minSize: 5, stat: "Slann Venom Tribe", command: "skirmisher", tags: ["slann"],
      note: "Armed with blowpipes shooting poisoned darts. May skirmish.",
      champion: { name: "Slann Champion", baseCost: 20, magicItemSlots: 1, stat: "Slann Champion" },
    },
    {
      id: "slanntotemwarriors", name: "Slann Totem Warriors", perModel: 10, minSize: 5, stat: "Slann Totem Warrior", command: "standard", tags: ["slann"],
      note: "Light armour and shields.",
      champion: { name: "Slann Spawn Master", baseCost: 30, magicItemSlots: 1, stat: "Slann Spawn Master" },
    },
    {
      id: "slanntotemcoldoneriders", name: "Slann Totem Warrior Cold One Riders", perModel: 25, minSize: 5, stat: "Slann Totem Warrior", mountStat: "Cold One", mountLabel: "Cold One", command: "standard", tags: ["slann"],
      note: "Light armour, spears, and shields, riding Cold Ones.",
      champion: { name: "Slann Spawn Master", baseCost: 30, magicItemSlots: 1, stat: "Slann Spawn Master", note: "May exchange his Cold One for a Horned One for +10pts (not toggled here — add by hand)." },
    },
    {
      id: "kroxigors-slann", name: "Kroxigors", perModel: 50, minSize: 3, stat: "Lizardman Kroxigor", command: "none",
      note: "Monstrous models that cause fear, armed with double handed weapons. 4+ armour save (floor 6+). Cannot take a standard bearer, musician, or regimental champion.",
    },
    {
      id: "saurustempleguard-slann", name: "Saurus Temple Guard", perModel: 18, minSize: 5, stat: "Lizardman Saurus Temple Guard", command: "standard", tags: ["saurus"],
      note: "Armed with halberds.",
      options: [
        { id: "lightarmour", group: null, label: "Light armour", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields", cost: 1, per: "model" },
      ],
      champion: { name: "Saurus Champion", baseCost: 20, magicItemSlots: 1, stat: "Lizardman Saurus Champion" },
    },
    {
      id: "sauruswarriors-slann", name: "Saurus Warriors", perModel: 15, minSize: 5, stat: "Lizardman Saurus Warrior", command: "standard", tags: ["saurus"],
      note: "Armed with hand weapons and shields.",
      options: [
        { id: "spears", group: null, label: "Spears", cost: 3, per: "model" },
      ],
      champion: { name: "Saurus Champion", baseCost: 20, magicItemSlots: 1, stat: "Lizardman Saurus Champion" },
    },
    {
      id: "terradonriders-slann", name: "Terradon Riders", perModel: 42, minSize: 3, stat: "Lizardman Skink Warrior", mountStat: "Terradon", mountLabel: "Terradon", command: "skirmisher", restriction: "0-1", tags: ["skink"],
      note: "Flying steeds, fight in skirmish formation — two Skink Warriors ride each Terradon (both must be killed before the model is removed). Each Terradon drops a rock when charging (one S6 impact hit per Terradon in the regiment; jettisoned harmlessly if charged or hit by a glancing blow first). Priced per Terradon (i.e. per pair of riders).",
      options: [
        { id: "spears", group: "melee", label: "Spears, for both riders", cost: 3, per: "model" },
        { id: "shields", group: null, label: "Shields, for both riders", cost: 3, per: "model" },
        { id: "javelins", group: "missile", label: "Javelins, for both riders", cost: 2, per: "model" },
        { id: "shortbows", group: "missile", label: "Short bows, for both riders", cost: 2, per: "model" },
        { id: "poison", group: null, label: "Poison missile weapons, for both riders", cost: 4, per: "model" },
      ],
      champion: { name: "Skink Champion", baseCost: 10, magicItemSlots: 1, stat: "Lizardman Skink Champion" },
    },
    {
      id: "nativehalflings", name: "Native Halflings", perModel: 11, minSize: 5, stat: "Halfling", command: "skirmisher", restriction: "0-1", tags: ["nativetribe"],
      note: "Halflings with blowpipes. Foresters (no practical effect here, since they always skirmish). One of four mutually-exclusive Native Tribe options — see army-wide rules.",
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "ghoulishcannibaltribes", name: "Ghoulish Cannibal Tribes", perModel: 13, minSize: 5, stat: "Ghoulish Cannibal Tribe", command: "skirmisher", restriction: "0-1", tags: ["nativetribe"],
      note: "Ghouls with blowpipes. Cause fear, poisoned melee attacks (+1S). May skirmish; if not, unbreakable in combat as long as the undead side outnumbers the enemy. Won't pursue or overrun after a won combat that inflicted a casualty (except models with hatred/frenzy). One of four mutually-exclusive Native Tribe options — see army-wide rules.",
      champion: { name: "Ghoul Champion", baseCost: 20, magicItemSlots: 1, stat: "Ghoul Champion (Slann)" },
    },
    {
      id: "amazonwarriors", name: "Amazon Warriors", perModel: 15, minSize: 5, stat: "Amazon Warrior", command: "skirmisher", restriction: "0-1", tags: ["nativetribe"],
      note: "A tribe of female human warriors with a bad temper, armed with additional hand weapons and bows. Re-roll panic tests, hate all enemies. One of four mutually-exclusive Native Tribe options — see army-wide rules.",
      champion: { name: "Amazon Champion", baseCost: 20, magicItemSlots: 1, stat: "Amazon Champion" },
    },
    {
      id: "chameleonskinks-slann", name: "Chameleon Skinks", perModel: 17, minSize: 5, stat: "Lizardman Chameleon Skink", command: "skirmisher", restriction: "0-1", tags: ["nativetribe", "skink"],
      note: "Armed with blowpipes. May scout, must skirmish. Enemies shooting at them with BS suffer an extra -1 to hit (on top of the usual skirmisher penalty). One of four mutually-exclusive Native Tribe options — see army-wide rules.",
      champion: { name: "Chameleon Skink Champion", baseCost: 20, magicItemSlots: 1, stat: "Chameleon Skink Champion" },
    },
  ],
  chariotsMonsters: [
    {
      id: "monstrousspiderscorpion-slann", name: "Monstrous Spider/Scorpion", kind: "quantity", perUnit: 40, stat: "Monstrous Spider",
      note: "A small monster. Follows the main-rulebook rules for Monstrous Spiders/Scorpions.",
    },
    {
      id: "jungleswarms-slann", name: "Jungle Swarm", kind: "quantity", perUnit: 40, stat: "Jungle Swarms", countsAsFirstRegiment: true,
      note: "The smallest base counts toward Regiments; further bases count toward Monsters. Follows the main-rulebook rules for Swarms. Priced per base.",
    },
    {
      id: "stegadons-slann", name: "Stegadon", perUnit: 200, stat: "Stegadon", mountStat: "Lizardman Skink Warrior", mountLabel: "Skink Crew (howdah)",
      note: "A large monster ridden by four Skink Warriors with short bows or poisoned-dart blowpipes, huddled in a howdah. Causes terror, 4+ scaly-skin save (floor 6+), immune to psychology. Inflicts 1D6 Strength 7 impact hits on a charge (or fleeing through friendly regiments). All hits go against the monster; if it dies, the crew dies too. Max 5 crew in the howdah, leaving room for one joined character (not hard-enforced).",
      variantOptions: [
        { id: "boltthrower", label: "Small bolt thrower mounted in the howdah — range 24\", Strength 5, fires in a 360° arc even after marching; if used, the crew can't also fire their other missile weapons", cost: 25 },
        { id: "secondtier", label: "Second howdah tier — 5 more crewmen who can shoot while the lower crew operate the bolt thrower, if taken", cost: 25 },
      ],
    },
    {
      id: "salamanders-slann", name: "Salamander", perUnit: 80, stat: "Salamander", mountStat: "Lizardman Skink Warrior", mountLabel: "Skink Handlers (4, with prodders)",
      note: "A four-legged reptile that shoots fireballs, accompanied by four Skink handlers. 4+ scaly-skin save (floor 6+). Moves as skirmishers, but enemies get no shooting penalty for it (too large to benefit) — if shot at, roll 1D6: 1-4 hits the Salamander, 5-6 hits a handler. If it hasn't marched, may shoot an artillery-die number of S4 no-armour-save flaming fireballs (range 24\"); a misfire means it eats 1D3 handlers instead. May stand-and-shoot as a charge reaction. Rolls on the Monster Reaction Table if all handlers are slain. Not aquatic, but may cross water at half speed. Battle-phase specifics documented, not simulated beyond points cost.",
    },
  ],
  specialCharacters: [
    { id: "drulndribl", name: "Toad Master Drulndribl", cost: 250, stat: "Toad Master Drulndribl", role: "The Emperor's most favoured Slann Warlord",
      note: "Carries light armour and a shield. May take two additional magic items.",
      items: "Carries the Blade of Realities — every hit wounds automatically, no armour save, 1 wound becomes 1D3 wounds.",
      mounts: [{ id: "hornedone", name: "Horned One", cost: 40, stat: "Horned One" }] },
    { id: "lordkroak-slann", name: "Venerable Lord Kroak", cost: 375, stat: "Slann Mage Priest Lord", role: "Mummified Slann Mage Priest Lord, 5 magic levels",
      note: "May take five additional magic items.",
      items: "Carries The Gold Death Mask — enemies can't hit Kroak in melee unless they roll a natural 6 to hit (or 5+ with an always-hits weapon)." },
    { id: "mazdamundi-slann", name: "Emperor Mazdamundi", cost: 600, stat: "Emperor Mazdamundi", role: "Slann Mage Priest Lord riding a Stegadon (already incorporated into his profile)",
      note: "Causes terror and delivers 1D6 impact hits like a chariot. Always knows four fixed spells: Move the Mountains (Power 2, freezes a hill's units), The Ruination of Cities (Power 3, destroys a building/bridge and everything on it), Earth Line (Power 2, S10 hit along a line to a table corner), and Part the Waters (Power 1, removes a water feature). Carries the battle standard. May take four additional magic items, one of which may be a magic banner.",
      items: "Carries the Cobra Mace of Mazdamundi — enemies attacking him with a magic weapon must roll 1D6 each round first; on a 6 the weapon is destroyed and no attack is made." },
  ],
};

const FACTION_LIST = [
  { key: "empire", name: "The Empire", data: EMPIRE },
  { key: "highelves", name: "High Elves", data: HIGH_ELVES },
  { key: "orcsgoblins", name: "Orcs & Goblins", data: ORCS_GOBLINS },
  { key: "dwarfs", name: "Dwarfs", data: DWARFS },
  { key: "skaven", name: "Skaven", data: SKAVEN },
  { key: "vampirecounts", name: "Vampire Counts", data: VAMPIRE_COUNTS },
  { key: "tombkings", name: "Tomb Kings", data: TOMB_KINGS },
  { key: "classicundead", name: "Classic Undead", data: CLASSIC_UNDEAD },
  { key: "kislev", name: "Kislev", data: KISLEV },
  { key: "woodElves", name: "Wood Elves", data: WOOD_ELVES },
  { key: "chaoswarriors", name: "Chaos Warriors", data: CHAOS_WARRIORS },
  { key: "beastmen", name: "Beastmen", data: BEASTMEN },
  { key: "daemons", name: "Daemons", data: CHAOS_DAEMONS },
  { key: "chaoswarband", name: "Chaos Warband", data: CHAOS_WARBAND },
  { key: "chaosdwarfs", name: "Chaos Dwarfs", data: CHAOS_DWARFS },
  { key: "darkelves", name: "Dark Elves", data: DARK_ELVES },
  { key: "bretonnia", name: "The Grand Army of Bretonnia", data: BRETONNIA },
  { key: "lizardmen", name: "Lizardmen", data: LIZARDMEN },
  { key: "dogsofwar", name: "Dogs of War", data: DOGS_OF_WAR },
  { key: "halflings", name: "Halflings of the Moot", data: HALFLINGS },
  { key: "ogres", name: "Ogre Mercenaries", data: OGRES },
  { key: "norse", name: "Norse", data: NORSE },
  { key: "slann", name: "The Slann Empire", data: SLANN_EMPIRE },
];

const FACTIONS = { woodElves: WOOD_ELVES, empire: EMPIRE, chaoswarriors: CHAOS_WARRIORS, beastmen: BEASTMEN, daemons: CHAOS_DAEMONS, chaoswarband: CHAOS_WARBAND, highelves: HIGH_ELVES, dwarfs: DWARFS, bretonnia: BRETONNIA, orcsgoblins: ORCS_GOBLINS, dogsofwar: DOGS_OF_WAR, chaosdwarfs: CHAOS_DWARFS, darkelves: DARK_ELVES, skaven: SKAVEN, vampirecounts: VAMPIRE_COUNTS, tombkings: TOMB_KINGS, classicundead: CLASSIC_UNDEAD, kislev: KISLEV, norse: NORSE, halflings: HALFLINGS, ogres: OGRES, lizardmen: LIZARDMEN, slann: SLANN_EMPIRE };

// A handful of factions (currently just Halflings) can field a small number of allied "auxiliary"
// regiments pulled wholesale from another faction's own army list (Empire Troops / Elven Troops).
// These two helpers resolve the *correct* source faction's armyData/def for a given roster unit —
// unit.sourceFaction is only ever set on these cross-faction units, so both are a no-op otherwise.
function armyDataFor(u, armyData) {
  return u.sourceFaction ? FACTIONS[u.sourceFaction] : armyData;
}
function regDefFor(u, armyData) {
  return armyDataFor(u, armyData).regiments.find((r) => r.id === u.defId);
}
function getArmyData(factionKey) {
  return FACTIONS[factionKey] || WOOD_ELVES;
}

/* ============================================================================
   COST ENGINE
   ========================================================================== */

let uidCounter = 1;
const uid = (prefix) => `${prefix}-${uidCounter++}-${Date.now().toString(36)}`;

function applyBloodline(def, bloodlineId) {
  if (!def?.bloodlineOverrides || !bloodlineId) return def;
  const ov = def.bloodlineOverrides[bloodlineId];
  return ov ? { ...def, ...ov } : def;
}

function magicLevelEligible(def, inst) {
  if (!def.magicLevelOption) return false;
  if (def.magicLevelOption.forbiddenMark && inst.mark === def.magicLevelOption.forbiddenMark) return false;
  if (def.magicLevelOption.eligible && !def.magicLevelOption.eligible(inst, def)) return false;
  return true;
}

function characterCost(inst, def, armyData) {
  let total = def.cost;
  const mount = def.mounts?.find((m) => m.id === inst.mountId);
  if (mount) total += mount.cost;
  if (inst.bow && def.bowOption) total += def.bowOption.cost;
  if (def.missileGroup && inst.missile && inst.missile !== def.missileGroup.options[0]) total += def.missileGroup.cost;
  if (def.experimentalMissileGroup && inst.experimentalMissile && inst.experimentalMissile !== def.experimentalMissileGroup.options[0] && !mount) total += def.experimentalMissileGroup.cost;
  if (def.magicLevelOption && magicLevelEligible(def, inst)) {
    total += (inst.magicLevel || def.magicLevelOption.min || 0) * def.magicLevelOption.costPerLevel;
  }
  if (def.wingsOption && inst.wings) total += def.wingsOption.cost;
  if (def.anvilOption && inst.anvil) total += def.anvilOption.cost;
  if (def.chaosArmourOption && inst.chaosArmour) total += def.chaosArmourOption.cost;
  (inst.magicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  Object.values(inst.runeItems || {}).forEach((ids) => (ids || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; }));
  if (def.bloodlinePowerSlots) (inst.bloodlinePowerIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  return total;
}

function regimentTrooperUnitCost(def, gearSelections) {
  let perModel = def.perModel ?? def.tieredPricing?.extraPerModel ?? 0;
  (def.options || []).forEach((opt) => {
    if (opt.per !== "model") return;
    const selected = opt.group ? gearSelections[opt.group] === opt.id : !!gearSelections[opt.id];
    if (selected) perModel += opt.cost;
  });
  return perModel;
}

function detachmentCost(d, armyData) {
  const dtype = (armyData.detachmentTypes || []).find((t) => t.id === d.defId);
  if (!dtype) return 0;
  return dtype.perModel * d.size;
}

// Extracts just the champion's own point contribution to a regiment (baseCost/option cost plus
// any magic items on the champion). Used both by regimentCost (champion is always added to the
// regiment's total) and by the Banner of Champions bucket-accounting logic, which needs to know
// how much of a regiment's cost came from its champion.
function regimentChampionCost(inst, def, armyData) {
  let total = 0;
  if (inst.championIncluded && def.champion) {
    total += def.champion.baseCost;
    (inst.championMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
    Object.values(inst.championRuneItems || {}).forEach((ids) => (ids || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; }));
  }
  if (inst.championOptionId && def.championOptions) {
    const opt = def.championOptions.find((o) => o.id === inst.championOptionId);
    if (opt) {
      total += opt.cost;
      (inst.championMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
      Object.values(inst.championRuneItems || {}).forEach((ids) => (ids || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; }));
    }
  }
  if (def.multiChampion) {
    const count = inst.multiChampionCount || 0;
    const trooperCost = regimentTrooperUnitCost(def, inst.gearSelections || {});
    for (let i = 0; i < count; i++) {
      total += def.multiChampion.baseCost + trooperCost;
      ((inst.multiChampionItems || [])[i] || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
      Object.values((inst.multiChampionRuneItems || [])[i] || {}).forEach((ids) => (ids || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; }));
    }
  }
  return total;
}

// A regiment's champion is eligible for the Banner of Champions' bucket swap only if he carries no
// magic items, isn't mounted on a chariot/monstrous model, and doesn't cast spells (i.e. isn't a
// wizard) — mirrors the item's own wording. Chariot/monstrous-mount champions and championOptions
// that grant a genuinely different creature (Vampire Thrall, Wight Champion, etc., which already
// aren't modeled as "baseCost adds a rider" but as a flat creature swap) are treated as eligible
// unless they explicitly have a mount or are wizards, since the app has no notion of "champion rides
// a chariot" beyond the regiment's own mount/kind.
function championEligibleForBannerOfChampions(inst, def, armyData) {
  if (inst.championIncluded && def.champion) {
    if ((inst.championMagicItemIds || []).length > 0) return false;
    if (isWizard(def.champion, inst)) return false;
    return true;
  }
  if (inst.championOptionId && def.championOptions) {
    const opt = def.championOptions.find((o) => o.id === inst.championOptionId);
    if (!opt) return false;
    if ((inst.championMagicItemIds || []).length > 0) return false;
    if (isWizard(opt, inst)) return false;
    return true;
  }
  return false;
}

function fastCavalryStandardFree(def, gearSelections) {
  const t = def.fastCavalryToggleOption;
  if (!t) return false;
  if (typeof t === "string") return !!gearSelections?.[t];
  return t.group ? gearSelections?.[t.group] === t.value : false;
}

function regimentCost(inst, def, armyData, roster) {
  if (def.kind === "composite") {
    let total = 0;
    (def.composition || []).forEach((c) => { total += (inst.composition?.[c.id] || 0) * c.cost; });
    return total;
  }
  const size = inst.size || def.minSize;
  let total;
  if (def.tieredPricing) {
    const tp = def.tieredPricing;
    total = tp.baseCost + Math.max(0, size - tp.baseSize) * tp.extraPerModel;
  } else {
    total = regimentTrooperUnitCost(def, inst.gearSelections || {}) * size;
  }
  (def.options || []).forEach((opt) => {
    if (opt.per === "model") return;
    const selected = opt.group ? inst.gearSelections?.[opt.group] === opt.id : !!inst.gearSelections?.[opt.id];
    if (selected) total += opt.cost;
  });
  if (def.extraOption && inst.extraOptionCount) total += inst.extraOptionCount * def.extraOption.cost;
  const toggleFreeStandard = fastCavalryStandardFree(def, inst.gearSelections);
  if (inst.standard && !toggleFreeStandard) {
    total += (def.command === "fastCavalry" || def.command === "monstrous") ? 10 : 0;
  }
  if (inst.standard && inst.magicBannerId) {
    const mi = miById(armyData.magicItems, inst.magicBannerId);
    if (mi) {
      if (mi.regimentDiscount) {
        const largeBattle = (roster?.pointLimit || 0) >= (mi.regimentDiscount.largeThreshold || Infinity);
        const cap = largeBattle ? mi.regimentDiscount.capLarge : mi.regimentDiscount.capNormal;
        total -= Math.min(total * mi.regimentDiscount.pct, cap);
      }
      total += mi.cost;
    }
  }
  if (inst.standard) {
    (inst.runeItems?.banner || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  }
  total += regimentChampionCost(inst, def, armyData);
  if (def.branchWraith && inst.branchWraithIncluded) {
    total += def.branchWraith.cost;
    (inst.branchWraithSpriteIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  }
  if (def.detachmentParent) {
    (inst.detachments || []).forEach((d) => { total += detachmentCost(d, armyData); });
  }
  return total;
}

function crewArmourCost(inst, def) {
  if (!def.crewArmourOptions || !def.baseCrew) return 0;
  const selected = def.crewArmourOptions.find((o) => o.id === inst.crewArmourId) || def.crewArmourOptions[0];
  const crewCount = def.baseCrew + (inst.extraCrew || 0);
  return (selected.cost || 0) * crewCount;
}

function chariotCost(inst, def, armyData) {
  if (def.kind === "abomination") return abominationCost(inst, def);
  if (def.kind === "quantity") {
    let variantPerUnit = 0;
    (def.variantOptions || []).forEach((o) => { if (inst.variantSelections?.[o.id]) variantPerUnit += o.cost; });
    return (inst.qty || 1) * (def.perUnit + variantPerUnit);
  }
  if (def.kind === "warmachine") {
    let total = def.perUnit;
    total += (inst.extraCrew || 0) * (def.extraCrewCost || 0);
    total += crewArmourCost(inst, def);
    (inst.extraMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
    Object.values(inst.runeItems || {}).forEach((ids) => (ids || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += runeCostFor(mi, def.id); }));
    return total;
  }
  // full chariot
  let total = def.perUnit;
  total += (inst.extraCrew || 0) * (def.extraCrewCost || 0);
  total += crewArmourCost(inst, def);
  total += (inst.extraSteeds || 0) * (def.extraSteedCost || 0);
  if (inst.commander && def.commanderCost != null) {
    total += def.commanderCost;
    (inst.commanderMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  }
  if (inst.scythedWheels && def.scythedWheelsCost != null) total += def.scythedWheelsCost;
  (def.variantOptions || []).forEach((o) => { if (inst.variantSelections?.[o.id]) total += o.cost; });
  return total;
}

const ABOM_CHAR_UPGRADES = [
  { id: "m", label: "+1 Movement", cost: 5 },
  { id: "ws", label: "+1 Weapon Skill", cost: 5 },
  { id: "s", label: "+1 Strength", cost: 10 },
  { id: "t", label: "+1 Toughness", cost: 15 },
  { id: "w", label: "+1 Wound", cost: 10 },
  { id: "i", label: "+3 Initiative", cost: 5 },
  { id: "a", label: "+1 Attack", cost: 15 },
  { id: "ld", label: "+1 Leadership", cost: 5 },
];
const ABOM_SPECIAL_RULES = [
  { id: "acid", label: "Acid Attacks (no armour save allowed)", cost: 20 },
  { id: "wings", label: "Wings (can fly; total cost must be ≥160pts)", cost: 60 },
  { id: "fire", label: "Breathe Fire (S4 teardrop template)", cost: 30 },
  { id: "legs", label: "Insect Legs (ignores obstacles/difficult terrain)", cost: 5 },
  { id: "itp", label: "Immune to Psychology (when unridden)", cost: 20 },
  { id: "hardskin", label: "Hard Skin (4+ armour save)", cost: 20 },
  { id: "stupidity", label: "Stupidity (discount)", cost: -35 },
  { id: "random", label: "Random Attacks (1D6+2 per round, regardless of profile)", cost: 35 },
];
function abominationCost(inst) {
  const cu = inst.charUpgrades || {};
  const sr = inst.specialRules || {};
  let base = 30;
  ABOM_CHAR_UPGRADES.forEach((u) => { base += (cu[u.id] || 0) * u.cost; });
  ABOM_SPECIAL_RULES.forEach((r) => { if (sr[r.id]) base += r.cost; });
  let total = base;
  if (inst.rider === "hero") total = base + 28;
  else if (inst.rider === "lord") total = base + 42;
  else if (inst.rider === "unridden") total = Math.round(base * 1.25);
  if (sr.wings) total = Math.max(total, 160);
  total = Math.max(total, 100);
  return total;
}

function specialCost(inst, def, armyData) {
  let total = def.cost;
  if (def.mountOption && inst.mounted) total += def.mountOption.cost;
  (inst.extraMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  return total;
}

function unitCost(unit, armyData, roster) {
  if (unit.sourceFaction) armyData = FACTIONS[unit.sourceFaction];
  const bloodline = roster?.armyTheme;
  if (unit.kind === "character") {
    const def = applyBloodline(armyData.characters.find((c) => c.id === unit.defId), bloodline);
    return characterCost(unit, def, armyData);
  }
  if (unit.kind === "regiment") {
    const def = armyData.regiments.find((r) => r.id === unit.defId);
    return regimentCost(unit, def, armyData, roster);
  }
  if (unit.kind === "chariot") {
    const def = armyData.chariotsMonsters.find((c) => c.id === unit.defId);
    return chariotCost(unit, def, armyData);
  }
  if (unit.kind === "special") {
    const def = armyData.specialCharacters.find((s) => s.id === unit.defId);
    return specialCost(unit, def, armyData);
  }
  return 0;
}


function allUsedMagicItemIds(roster, excludeUnitId) {
  const used = new Set();
  const collect = (arr) => arr.forEach((u) => {
    if (u.instanceId === excludeUnitId) return;
    (u.magicItemIds || []).forEach((id) => used.add(id));
    (u.championMagicItemIds || []).forEach((id) => used.add(id));
    (u.branchWraithSpriteIds || []).forEach((id) => used.add(id));
    (u.commanderMagicItemIds || []).forEach((id) => used.add(id));
    (u.extraMagicItemIds || []).forEach((id) => used.add(id));
    (u.multiChampionItems || []).forEach((arr) => (arr || []).forEach((id) => used.add(id)));
    if (u.magicBannerId) used.add(u.magicBannerId);
  });
  collect(roster.characters);
  collect(roster.regiments);
  collect(roster.chariots);
  collect(roster.specials);
  return used;
}

// Shared add/remove-from-array-field toggle used by every MagicItemPicker onToggle handler
// (magicItemIds, championMagicItemIds, branchWraithSpriteIds, extraMagicItemIds, etc.) — adds id
// to unit[field] if not already present, removes it otherwise, then writes the updated unit back.
function toggleArrayField(unit, field, id, updateUnit) {
  const cur = unit[field] || [];
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  updateUnit({ ...unit, [field]: next });
}

function restrictionLimit(restriction) {
  if (!restriction) return Infinity;
  const n = restriction.split("-")[1];
  return parseInt(n, 10);
}

function countOfDef(roster, kind, defId) {
  const arr = kind === "regiment" ? roster.regiments : kind === "special" ? roster.specials : kind === "character" ? roster.characters : [];
  return arr.filter((u) => u.defId === defId).length;
}

/* ============================================================================
   REUSABLE SUBCOMPONENTS
   ========================================================================== */

function StatBlock({ statKey, statNote }) {
  if (statNote) {
    return <p style={{ fontSize: 14.5, color: "var(--ink-soft)", fontStyle: "italic", margin: "6px 0" }}>{statNote}</p>;
  }
  const s = STATS[statKey];
  if (!s) return null;
  return (
    <table className="whr-stat-table">
      <thead><tr>{STAT_ROW_ORDER.map((k) => <th key={k}>{k}</th>)}</tr></thead>
      <tbody><tr>{STAT_ROW_ORDER.map((k) => <td key={k}>{s[k]}</td>)}</tr></tbody>
    </table>
  );
}

function matchesRestrictionCondition(cond, context) {
  if (cond.regimentIds && (!context.regimentId || !cond.regimentIds.includes(context.regimentId))) return false;
  if (cond.knightGroups && (!context.knightGroup || !cond.knightGroups.includes(context.knightGroup))) return false;
  if (cond.characterIds && (!context.characterId || !cond.characterIds.includes(context.characterId))) return false;
  if (cond.marks && (!context.mark || !cond.marks.includes(context.mark))) return false;
  if (cond.tags && (!context.tags || !cond.tags.some((t) => context.tags.includes(t)))) return false;
  return true;
}
// A character/champion/special counts as a Wizard if: its name carries a "(Level N)" tag (the
// overwhelming majority of casters), it buys levels dynamically via magicLevelOption (checked
// against the live unit state), or it's been manually tagged "wizard" (used for the handful of
// special characters whose caster status is prose-only, e.g. "a level 4 wizard (Dark Magic)" in
// their note text, with no (Level N) in their name and no magicLevelOption to check against).
function isWizard(entityDef, unit) {
  if (!entityDef) return false;
  if ((entityDef.tags || []).includes("wizard")) return true;
  if (/\(level\s*\d/i.test(entityDef.name || "")) return true;
  if (entityDef.magicLevelOption && unit && (unit.magicLevel ?? entityDef.magicLevelOption.min ?? 0) > 0) return true;
  return false;
}

// A faction's loreOptions has either one entry (no real choice — that lore is simply always in
// effect, nothing to store on the unit) or several (Undead's 2-way Dark/Necromancy choice, or a
// full College Magic dropdown) — in which case the player's pick lives on unit.lore.
function resolveWizardLore(armyData, unit) {
  const opts = armyData?.loreOptions;
  if (!opts || opts.length === 0) return null;
  if (opts.length === 1) return opts[0];
  return unit?.lore || null;
}

// Builds the context object passed to MagicItemPicker / isItemAllowed for a given bearer.
// entityDef: the character/champion/championOption/special def granting the item slots.
// unit: the roster instance (for magicLevel / mountId / mounted lookups) — may be null for
// contexts where mounted-state doesn't apply (e.g. war machine crew).
// extra: any additional context fields specific to the call site (characterId, mark, knightGroup...).
function itemContext(entityDef, unit, extra = {}) {
  const wizard = isWizard(entityDef, unit);
  const baseTags = extra.tags || entityDef?.tags || [];
  const tags = wizard && !baseTags.includes("wizard") ? [...baseTags, "wizard"] : baseTags;
  return {
    ...extra,
    tags,
    mounted: !!(unit?.mountId || unit?.mounted),
    allowedWeaponSubtypes: entityDef?.allowedWeaponSubtypes,
    allowedArmourSubtypes: entityDef?.allowedArmourSubtypes,
  };
}

function isItemAllowed(item, context) {
  if (item.excludeTags && context?.tags && item.excludeTags.some((t) => context.tags.includes(t))) return false;
  if (item.footOnly && context?.mounted) return false;
  if (item.subtype === "shield" || item.subtype === "helmet" || item.subtype === "lightArmour" || item.subtype === "heavyArmour") {
    if (context?.allowedArmourSubtypes && !context.allowedArmourSubtypes.includes(item.subtype)) return false;
  }
  if (item.subtype === "handWeapon" || item.subtype === "twoHanded" || item.subtype === "lance" || item.subtype === "bow") {
    if (context?.allowedWeaponSubtypes && !context.allowedWeaponSubtypes.includes(item.subtype)) return false;
  }
  if (item.requiresRegimentIds && context?.regimentId && !item.requiresRegimentIds.includes(context.regimentId)) return false;
  if (!item.restrictedTo) return true;
  if (!context) return false;
  return item.restrictedTo.some((cond) => matchesRestrictionCondition(cond, context));
}

function MagicItemPicker({ items, selectedIds, onToggle, maxSlots, usedElsewhere, categoryFilter, context, label = "Magic Items" }) {
  const grouped = useMemo(() => {
    const g = {};
    items.filter((m) => !m.isRune && (!categoryFilter || categoryFilter.includes(m.cat)) && isItemAllowed(m, context)).forEach((m) => {
      g[m.cat] = g[m.cat] || [];
      g[m.cat].push(m);
    });
    Object.values(g).forEach((arr) => arr.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name)));
    return g;
  }, [items, categoryFilter, context]);
  const atLimit = selectedIds.length >= maxSlots;
  // Category open/closed state is tracked explicitly once a user touches it; before that, a
  // category defaults open if it already has a selection in it (so nothing selected gets hidden),
  // otherwise closed (so long lists don't dump every category open on first render).
  const [openCats, setOpenCats] = useState({});
  const isCatOpen = (cat, arr) => {
    if (openCats[cat] !== undefined) return openCats[cat];
    return arr.some((mi) => selectedIds.includes(mi.id));
  };
  const toggleCat = (cat, arr) => setOpenCats((prev) => ({ ...prev, [cat]: !isCatOpen(cat, arr) }));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span className="whr-label" style={{ marginBottom: 0 }}>{label}</span>
        <span className="whr-opt-cost">{selectedIds.length} / {maxSlots} slots</span>
      </div>
      {Object.entries(grouped).map(([cat, arr]) => {
        const open = isCatOpen(cat, arr);
        const selCount = arr.filter((mi) => selectedIds.includes(mi.id)).length;
        return (
          <div key={cat} style={{ marginBottom: 6, border: "1px solid var(--line-soft)", borderRadius: 3, overflow: "hidden" }}>
            <button type="button" onClick={() => toggleCat(cat, arr)} aria-expanded={open}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper-2)", border: "none", padding: "7px 9px", cursor: "pointer", textAlign: "left" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span aria-hidden="true" style={{ display: "inline-block", fontSize: 11, color: "var(--ink-soft)", transition: "transform 0.15s", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 14.5, letterSpacing: "0.04em", color: "var(--gold)" }}>{MI_CATEGORY_LABEL[cat]}</span>
                <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>({arr.length})</span>
              </span>
              {selCount > 0 && (
                <span style={{ fontSize: 11.5, color: "#F3E4BC", background: "var(--burgundy)", padding: "2px 7px", borderRadius: 8 }}>{selCount} selected</span>
              )}
            </button>
            {open && (
              <div style={{ background: "var(--paper)", padding: "2px 2px" }}>
                {arr.map((mi) => {
                  const checked = selectedIds.includes(mi.id);
                  const disabled = !checked && (atLimit || usedElsewhere.has(mi.id));
                  return (
                    <label key={mi.id} className={`whr-opt-row whr-opt-label ${disabled ? "whr-opt-disabled" : ""}`} title={mi.desc}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggle(mi.id)} />
                        <span>{mi.name}{usedElsewhere.has(mi.id) && !checked ? " (taken)" : ""}</span>
                      </span>
                      <span className="whr-opt-cost">{mi.cost}pts</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Same slot budget (selectedIds/maxSlots/onToggle) as MagicItemPicker, but when the resolved
// category set includes "banner" it splits into two labeled pickers instead of one — banners
// stay under their own "Magic Banner" heading (matching the regiment's own dedicated banner
// picker) rather than getting buried as just another collapsible row inside "Magic Items".
// Both halves draw from and write back to the same shared selection array, so the slot count
// (e.g. "0 / 1 slots") still reflects a combined budget across both.
function MagicItemPickerWithBanner({ items, selectedIds, onToggle, maxSlots, usedElsewhere, categoryFilter, context, label = "Magic Items" }) {
  if (!categoryFilter || !categoryFilter.includes("banner")) {
    return <MagicItemPicker items={items} selectedIds={selectedIds} onToggle={onToggle} maxSlots={maxSlots} usedElsewhere={usedElsewhere} categoryFilter={categoryFilter} context={context} label={label} />;
  }
  const nonBannerFilter = categoryFilter.filter((c) => c !== "banner");
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <MagicItemPicker items={items} selectedIds={selectedIds} onToggle={onToggle} maxSlots={maxSlots} usedElsewhere={usedElsewhere} categoryFilter={["banner"]} context={context} label="Magic Banner" />
      </div>
      {nonBannerFilter.length > 0 && (
        <MagicItemPicker items={items} selectedIds={selectedIds} onToggle={onToggle} maxSlots={maxSlots} usedElsewhere={usedElsewhere} categoryFilter={nonBannerFilter} context={context} label={label} />
      )}
    </>
  );
}

function Stepper({ value, min = 0, max = 99, onChange }) {
  return (
    <div className="whr-stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
      <div className="whr-stepper-val">{value}</div>
      <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

function fmtPts(n) {
  const r = Math.round(n * 2) / 2;
  return r % 1 === 0 ? `${r}` : `${r}`;
}

/* ============================================================================
   SETUP / BARRACKS SCREEN
   ========================================================================== */

function SetupScreen({ onMuster, savedList, onLoad, onDelete, storageError }) {
  const [listName, setListName] = useState("");
  const [pointLimit, setPointLimit] = useState(2000);
  const [faction, setFaction] = useState(null);

  return (
    <div className="whr-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 className="whr-h1" style={{ fontSize: 50.5, margin: 0 }}>WARHAMMER RENAISSANCE</h1>
        <LeafDivider />
        <p className="whr-eyebrow" style={{ margin: 0 }}>Army List Builder</p>
        <div style={{
          marginTop: 18, padding: "10px 16px", background: "var(--burgundy)", color: "#F3E4BC",
          fontFamily: "var(--font-display-sc)", letterSpacing: "0.03em", fontSize: 16,
          borderRadius: 2, display: "inline-block",
        }}>
          This builder is still a WIP. While mostly functional, maintain some level of skepticism and spot check against the WHR Armies book.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28 }} className="whr-builder-grid">
        <section className="whr-panel" style={{ padding: 28 }}>
          <h2 className="whr-h1" style={{ fontSize: 24, margin: 0 }}>Muster Forces</h2>
          <p className="whr-serif-italic" style={{ marginTop: 2 }}>Create a new roster</p>
          <div style={{ height: 1, background: "var(--line)", margin: "14px 0 20px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label className="whr-label">List Name</label>
              <input className="whr-input" placeholder="e.g. Orion's Wild Hunt" value={listName} onChange={(e) => setListName(e.target.value)} />
            </div>
            <div>
              <label className="whr-label">Point Limit</label>
              <input className="whr-input" type="number" min={1} value={pointLimit} onChange={(e) => setPointLimit(Number(e.target.value) || 0)} />
            </div>
          </div>

          <label className="whr-label">Choose Faction</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
            {FACTION_LIST.map((f) => {
              const active = faction === f.key;
              const available = !!f.data;
              return (
                <button
                  key={f.key}
                  className="whr-card"
                  onClick={() => available && setFaction(f.key)}
                  style={{
                    textAlign: "left", cursor: available ? "pointer" : "default",
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
                    opacity: available ? 1 : 0.42,
                    borderColor: active ? "var(--gold)" : "var(--line-soft)",
                    background: active ? "#E9DCB4" : "var(--paper-2)",
                    boxShadow: active ? "0 0 0 1px var(--gold)" : "none",
                  }}
                >
                  {f.name}
                  {!available && <div style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontStyle: "italic", fontSize: 12.5, color: "var(--gold)", marginTop: 2 }}>Coming soon</div>}
                </button>
              );
            })}
          </div>

          <button
            className="whr-btn whr-btn-primary whr-btn-block"
            disabled={!faction || !FACTION_LIST.find((f) => f.key === faction)?.data}
            onClick={() => onMuster({ name: listName.trim() || `New ${(FACTION_LIST.find((f) => f.key === faction)?.name || "").replace(/^The\s+/, "")} Army`, pointLimit, factionKey: faction })}
          >
            Muster Army
          </button>
        </section>

        <section className="whr-panel" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 className="whr-h1" style={{ fontSize: 24, margin: 0 }}>The Barracks</h2>
              <p className="whr-serif-italic" style={{ marginTop: 2 }}>Load an existing roster</p>
            </div>
            <span className="whr-badge">{savedList.length} Saved</span>
          </div>
          <div style={{ height: 1, background: "var(--line)", margin: "14px 0 20px" }} />

          {storageError && (
            <p className="whr-serif-italic" style={{ color: "var(--burgundy)" }}>Couldn't reach storage — saved rosters may be unavailable right now.</p>
          )}

          {savedList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 10px", color: "var(--ink-faint)" }}>
              <svg width="46" height="46" viewBox="0 0 46 46" fill="none" style={{ marginBottom: 10 }}>
                <path d="M10 18 L23 10 L36 18 V36 H10 Z" stroke="#9C8A66" strokeWidth="1.5" fill="none" />
                <line x1="10" y1="18" x2="36" y2="18" stroke="#9C8A66" strokeWidth="1.5" />
              </svg>
              <p className="whr-eyebrow" style={{ color: "var(--ink-faint)" }}>No armies mustered yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedList.map((r) => (
                <div key={r.id} className="whr-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{r.name}</div>
                    <div className="whr-serif-italic" style={{ fontSize: 14.5 }}>{r.pointLimit} pts · {FACTION_LIST.find((f) => f.key === r.factionKey)?.name} · {r.totalPoints} pts used</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="whr-btn whr-btn-sm" onClick={() => onLoad(r.id)}>Load</button>
                    <button className="whr-btn whr-btn-sm whr-btn-danger" onClick={() => onDelete(r.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <p className="whr-serif-italic" style={{ fontSize: 14.5, color: "var(--ink-faint)" }}>Maintained by Turhan</p>
      </div>
    </div>
  );
}

/* ============================================================================
   BUILDER SCREEN
   ========================================================================== */

function Sidebar({ armyData, roster, onAdd, onSetTheme }) {
  const hasThemes = !!armyData.themes;
  const [openSection, setOpenSection] = useState(hasThemes ? "armytheme" : "characters");
  const [rulesOpen, setRulesOpen] = useState(false);
  const currentTheme = roster.armyTheme || armyData.themes?.default || null;
  const powerVisible = (item) => {
    if (!hasThemes || !currentTheme || currentTheme === "Mixed") return true;
    if (item.markGroup) return item.markGroup.options.includes(currentTheme);
    if (item.impliedMark) return item.impliedMark === currentTheme;
    return true;
  };
  const themeVisible = (item) => (!hasThemes || !item.theme || item.theme === currentTheme) && powerVisible(item);

  const Section = ({ id, title, children }) => (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="whr-btn-ghost"
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper-2)", border: "1px solid var(--line-soft)", padding: "10px 12px", cursor: "pointer" }}
      >
        <span className="whr-eyebrow" style={{ color: "var(--forest-dark)" }}>{title}</span>
        <span style={{ fontFamily: "var(--font-display)", color: "var(--ink-soft)" }}>{openSection === id ? "−" : "+"}</span>
      </button>
      {openSection === id && <div style={{ padding: "8px 2px 14px" }}>{children}</div>}
    </div>
  );

  const AddRow = ({ label, sub, disabled, onClick, disabledReason }) => (
    <div className="whr-opt-row" style={{ opacity: disabled ? 0.42 : 1 }}>
      <div>
        <div style={{ fontFamily: "var(--font-display-sc)", fontSize: 17.5, letterSpacing: "0.02em" }}>{label}</div>
        {sub && <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>{sub}</div>}
      </div>
      <button className="whr-btn whr-btn-sm" disabled={disabled} onClick={onClick} title={disabled ? disabledReason : ""}>Add</button>
    </div>
  );

  return (
    <div className="whr-col whr-builder-col" style={{ height: "100%" }}>
      <button className="whr-btn-ghost" style={{ textAlign: "left", padding: "10px 2px", cursor: "pointer" }} onClick={() => setRulesOpen(!rulesOpen)}>
        <span className="whr-eyebrow">{rulesOpen ? "− " : "+ "}Army-wide rules</span>
      </button>
      {rulesOpen && (
        <div className="whr-card" style={{ marginBottom: 10 }}>
          {armyData.armyWideRules.map((r, i) => <p key={i} style={{ fontSize: 14.5, margin: "0 0 8px" }}>{r}</p>)}
        </div>
      )}

      <div className="whr-scroll" style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
        {hasThemes && (
          <Section id="armytheme" title={armyData.themes.label || "Army Theme"}>
            {armyData.themes.options.map((t) => (
              <label key={t.id} className="whr-opt-row" style={{ alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input type="radio" name="army-theme" checked={currentTheme === t.id} onChange={() => onSetTheme(t.id)} style={{ marginTop: 4 }} />
                <span style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display-sc)", fontSize: 17, letterSpacing: "0.02em" }}>{t.name}</div>
                  {t.desc && <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2, lineHeight: 1.35 }}>{t.desc}</div>}
                </span>
              </label>
            ))}
          </Section>
        )}
        <Section id="characters" title="Characters">
          {armyData.characters.filter(themeVisible).map((c) => {
            const limit = restrictionLimit(c.restriction);
            const count = countOfDef(roster, "character", c.id);
            const atLimit = count >= limit;
            return (
              <AddRow
                key={c.id}
                label={c.name + (c.restriction ? ` (${c.restriction})` : "")}
                sub={`${c.cost}pts`}
                disabled={atLimit}
                disabledReason={`Limit reached (${c.restriction})`}
                onClick={() => onAdd("character", c.id)}
              />
            );
          })}
        </Section>
        <Section id="regiments" title="Regiments">
          {armyData.regiments.filter(themeVisible).map((r) => {
            const limit = restrictionLimit(r.restriction);
            const count = countOfDef(roster, "regiment", r.id);
            const atLimit = count >= limit;
            return (
              <AddRow
                key={r.id}
                label={r.name + (r.restriction ? ` (${r.restriction})` : "")}
                sub={r.kind === "composite" ? "mixed unit, priced per model" : r.tieredPricing ? `${fmtPts(r.tieredPricing.baseCost)}pts, minimum ${r.minSize}` : `${fmtPts(r.perModel * r.minSize)}pts, minimum ${r.minSize}`}
                disabled={atLimit}
                disabledReason={`Limit reached (${r.restriction})`}
                onClick={() => onAdd("regiment", r.id)}
              />
            );
          })}
        </Section>
        <Section id="chariots" title="Chariots & Monsters">
          {armyData.chariotsMonsters.filter(themeVisible).map((c) => {
            const limit = restrictionLimit(c.restriction);
            const count = roster.chariots.filter((u) => u.defId === c.id).length;
            const atLimit = count >= limit;
            return (
              <AddRow key={c.id} label={c.name + (c.restriction ? ` (${c.restriction})` : "")} sub={`${c.perUnit}pts each`}
                disabled={atLimit} disabledReason={`Limit reached (${c.restriction})`} onClick={() => onAdd("chariot", c.id)} />
            );
          })}
        </Section>
        <Section id="specials" title="Special Characters">
          {armyData.specialCharacters.filter(themeVisible).map((s) => {
            const count = countOfDef(roster, "special", s.id);
            return (
              <AddRow
                key={s.id}
                label={s.name}
                sub={`${s.cost}pts · ${s.role}`}
                disabled={count >= 1}
                disabledReason="Unique — already in roster"
                onClick={() => onAdd("special", s.id)}
              />
            );
          })}
        </Section>
        {(armyData.auxiliaryFactions || []).map((af) => {
          const src = FACTIONS[af.sourceKey];
          const eligible = src.regiments.filter(af.filter);
          const halflingCount = roster.regiments.filter((u) => !u.sourceFaction).length;
          const maxAux = Math.floor(halflingCount / 2);
          return (
            <Section key={af.key} id={`aux-${af.key}`} title={af.label}>
              <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 6 }}>1 per 2 Halfling regiments (currently {maxAux} allowed)</p>
              {eligible.map((r) => (
                <AddRow key={r.id} label={r.name} sub={r.kind === "composite" ? "mixed unit, priced per model" : `${fmtPts(r.perModel * r.minSize)}pts, minimum ${r.minSize}`}
                  onClick={() => onAdd("regiment", r.id, af.sourceKey)} />
              ))}
            </Section>
          );
        })}
      </div>
    </div>
  );
}

function championOptionEffective(opt, bloodlineId) {
  if (!opt) return opt;
  const swap = opt.bloodlineSwap?.[bloodlineId];
  return swap ? { ...opt, ...swap } : opt;
}
function resolveUnitStat(kind, unit, def, bloodlineId) {
  if (kind === "character") {
    const mount = def.mounts?.find((m) => m.id === unit.mountId);
    if (mount) return { statKey: def.stat, statNote: null, mountStatKey: mount.stat, charLabel: def.name, mountLabel: mount.name.replace(/\s*\([^)]*\)\s*$/, "") };
    return { statKey: def.stat, statNote: null, mountStatKey: null };
  }
  if (kind === "regiment") {
    if (def.kind === "composite") return { statKey: null, statNote: null };
    const base = { statKey: def.statNote ? null : def.stat, statNote: def.statNote || null };
    let championStatKey = null, championLabel = null;
    if (unit.championIncluded && def.champion?.stat) {
      championStatKey = def.champion.stat;
      championLabel = def.champion.name;
    } else if (unit.championOptionId && def.championOptions) {
      const opt = championOptionEffective(def.championOptions.find((o) => o.id === unit.championOptionId), bloodlineId);
      if (opt?.stat) { championStatKey = opt.stat; championLabel = opt.name; }
    } else if (def.multiChampion?.stat && (unit.multiChampionCount || 0) > 0) {
      championStatKey = def.multiChampion.stat;
      championLabel = unit.multiChampionCount > 1 ? `${def.multiChampion.name} ×${unit.multiChampionCount}` : def.multiChampion.name;
    }
    const hasExtra = !!(championStatKey || def.mountStat);
    const withChampion = { ...base, championStatKey, championLabel, charLabel: hasExtra ? (def.riderLabel || def.name) : null };
    if (def.mountStat) return { ...withChampion, mountStatKey: def.mountStat, mountLabel: def.mountLabel || def.mountStat };
    return withChampion;
  }
  if (kind === "chariot") {
    const base = { statKey: def.statNote ? null : def.stat, statNote: def.statNote || null };
    if (def.mountStat) return { ...base, mountStatKey: def.mountStat, charLabel: def.riderLabel || def.name, mountLabel: def.mountLabel || def.mountStat };
    return base;
  }
  if (kind === "special") {
    const mount = def.mounts?.find((m) => m.id === unit.mountId);
    if (mount) return { statKey: def.stat, statNote: null, mountStatKey: mount.stat, charLabel: def.name, mountLabel: mount.name.replace(/\s*\([^)]*\)\s*$/, "") };
    return { statKey: def.stat, statNote: null, mountStatKey: null };
  }
  return { statKey: null, statNote: null };
}

function optionLabelById(options, id) {
  const o = (options || []).find((x) => x.id === id);
  return o ? o.label.replace(/\s*\([^)]*\)\s*$/, "").replace(/\s*[+][\d.]+.*$/, "").trim() : null;
}

function resolveUnitTags(kind, unit, def, armyData, bloodlineId) {
  const tags = [];
  if (kind === "character") {
    if (def.markGroup && unit.mark) tags.push(`Mark of ${unit.mark}`);
    if (def.armourGroup && unit.armour && !unit.armour.includes("(default)")) tags.push(unit.armour);
    const mount = def.mounts?.find((m) => m.id === unit.mountId);
    if (mount) tags.push(mount.name.replace(/\s*\([^)]*\)\s*$/, ""));
    if (unit.melee && !unit.melee.includes("(default)")) tags.push(unit.melee);
    if (unit.bow && def.bowOption) tags.push(def.bowOption.label);
    if (unit.missile && unit.missile !== "None (default)" && def.missileGroup) tags.push(unit.missile);
    if (unit.experimentalMissile && unit.experimentalMissile !== "None (default)" && def.experimentalMissileGroup) tags.push(unit.experimentalMissile);
    if (def.wingsOption && unit.wings) tags.push("Wings");
    if (def.chaosArmourOption && unit.chaosArmour) tags.push(def.chaosArmourOption.label);
    if (def.magicLevelOption && (unit.magicLevel ?? def.magicLevelOption.min ?? 0) > 0) tags.push(`+${unit.magicLevel ?? def.magicLevelOption.min} magic levels`);
    if (isWizard(def, unit) && armyData.loreOptions) {
      const lore = resolveWizardLore(armyData, unit);
      if (lore) tags.push(`Lore: ${lore}`);
    }
    (unit.magicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
    Object.values(unit.runeItems || {}).forEach((ids) => {
      const names = (ids || []).map((id) => miById(armyData.magicItems, id)?.name).filter(Boolean);
      if (names.length > 0) tags.push(names.join(" + "));
    });
    (unit.bloodlinePowerIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
  } else if (kind === "regiment") {
    if (def.kind === "composite") {
      (def.composition || []).forEach((c) => { const n = unit.composition?.[c.id] || 0; if (n > 0) tags.push(`${n} ${c.label}`); });
      return tags;
    }
    const gearSelections = unit.gearSelections || {};
    const groups = new Set();
    (def.options || []).forEach((o) => { if (o.group) groups.add(o.group); });
    groups.forEach((g) => { const label = optionLabelById(def.options, gearSelections[g]); if (label) tags.push(label); });
    (def.options || []).forEach((o) => { if (!o.group && gearSelections[o.id]) tags.push(o.label.replace(/\s*[+(][^)]*$/, "").trim()); });
    const autoStandard = def.command === "standard" || def.command === "special";
    if (autoStandard) { tags.push("Musician"); tags.push("Standard Bearer"); }
    else if (unit.standard) tags.push("Standard Bearer");
    if (unit.magicBannerId) { const mi = miById(armyData.magicItems, unit.magicBannerId); if (mi) tags.push(mi.name); }
    if ((unit.runeItems?.banner || []).length > 0) {
      const names = unit.runeItems.banner.map((id) => miById(armyData.magicItems, id)?.name).filter(Boolean);
      if (names.length > 0) tags.push(names.join(" + "));
    }
    if (unit.championIncluded && def.champion) {
      tags.push(def.champion.name);
      if (def.champion.markGroup) tags.push(`Mark of ${unit.championMark || def.champion.markGroup.options[0]}`);
      (unit.championMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
      Object.values(unit.championRuneItems || {}).forEach((ids) => {
        const names = (ids || []).map((id) => miById(armyData.magicItems, id)?.name).filter(Boolean);
        if (names.length > 0) tags.push(names.join(" + "));
      });
    }
    if (unit.championOptionId && def.championOptions) {
      const opt = championOptionEffective(def.championOptions.find((o) => o.id === unit.championOptionId), bloodlineId);
      if (opt) {
        tags.push(opt.name);
        (unit.championMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
        Object.values(unit.championRuneItems || {}).forEach((ids) => {
          const names = (ids || []).map((id) => miById(armyData.magicItems, id)?.name).filter(Boolean);
          if (names.length > 0) tags.push(names.join(" + "));
        });
      }
    }
    if (unit.branchWraithIncluded && def.branchWraith) {
      tags.push(def.branchWraith.name);
      (unit.branchWraithSpriteIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
    }
    if (def.multiChampion && unit.multiChampionCount) tags.push(`${unit.multiChampionCount} ${def.multiChampion.name}${unit.multiChampionCount > 1 ? "s" : ""}`);
    if (def.extraOption && unit.extraOptionCount) tags.push(`${unit.extraOptionCount} ${def.extraOption.label}`);
    if (def.detachmentParent) {
      (unit.detachments || []).forEach((d) => {
        const dtype = (armyData.detachmentTypes || []).find((t) => t.id === d.defId);
        if (dtype) tags.push(`${d.size} ${dtype.name}`);
      });
    }
  } else if (kind === "chariot") {
    if (def.kind === "chariot") {
      if (unit.extraCrew) tags.push(`+${unit.extraCrew} ${def.extraCrewLabel || "crew"}`);
      if (unit.extraSteeds) tags.push(`+${unit.extraSteeds} ${def.extraSteedLabel || "steeds"}`);
      if (unit.scythedWheels) tags.push("Scythed wheels");
      if (unit.commander) {
        tags.push(def.commanderLabel || "Commander");
        (unit.commanderMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
      }
      (def.variantOptions || []).forEach((o) => { if (unit.variantSelections?.[o.id]) tags.push(o.label); });
      if (def.crewArmourFixed) tags.push(`Crew: ${def.crewArmourFixed}`);
      else if (def.crewArmourOptions) {
        const selectedId = unit.crewArmourId || def.crewArmourOptions[0].id;
        if (selectedId !== def.crewArmourOptions[0].id) {
          const o = def.crewArmourOptions.find((x) => x.id === selectedId);
          if (o) tags.push(`Crew: ${o.label}`);
        }
      }
    } else if (def.kind === "warmachine") {
      if (unit.extraCrew) tags.push(`+${unit.extraCrew} ${def.extraCrewLabel || "crew"}`);
      (unit.extraMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
      Object.values(unit.runeItems || {}).forEach((ids) => {
        const names = (ids || []).map((id) => miById(armyData.magicItems, id)?.name).filter(Boolean);
        if (names.length > 0) tags.push(names.join(" + "));
      });
      if (def.crewArmourFixed) tags.push(`Crew: ${def.crewArmourFixed}`);
      else if (def.crewArmourOptions) {
        const selectedId = unit.crewArmourId || def.crewArmourOptions[0].id;
        if (selectedId !== def.crewArmourOptions[0].id) {
          const o = def.crewArmourOptions.find((x) => x.id === selectedId);
          if (o) tags.push(`Crew: ${o.label}`);
        }
      }
    } else if (def.kind === "quantity" && def.variantOptions) {
      (def.variantOptions || []).forEach((o) => { if (unit.variantSelections?.[o.id]) tags.push(o.label); });
    } else if (def.kind === "abomination") {
      ABOM_CHAR_UPGRADES.forEach((u) => { const n = unit.charUpgrades?.[u.id] || 0; if (n > 0) tags.push(`${u.label} x${n}`); });
      ABOM_SPECIAL_RULES.forEach((r) => { if (unit.specialRules?.[r.id]) tags.push(r.label.split(" (")[0]); });
      const riderLabel = { hero: "Ridden by Chaos Hero", lord: "Ridden by Chaos Lord", unridden: "Unridden" }[unit.rider];
      if (riderLabel) tags.push(riderLabel);
    }
  } else if (kind === "special") {
    const mount = def.mounts?.find((m) => m.id === unit.mountId);
    if (mount) tags.push(mount.name.replace(/\s*\([^)]*\)\s*$/, ""));
    else if (unit.mounted && def.mountOption) tags.push(def.mountOption.name.replace(/\s*\([^)]*\)\s*$/, ""));
    (unit.extraMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
  }
  return tags;
}

function RosterUnitCard({ kind, unit, def, cost, selected, onSelect, onRemove, models, armyData, bloodlineId }) {
  const { statKey, statNote, championStatKey, championLabel, mountStatKey, charLabel, mountLabel } = resolveUnitStat(kind, unit, def, bloodlineId);
  const tags = resolveUnitTags(kind, unit, def, armyData, bloodlineId);
  return (
    <div className={`whr-card ${selected ? "whr-card-selected" : ""}`} style={{ marginBottom: 10, cursor: "pointer" }} onClick={onSelect}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>{unit.customName || def.name}</div>
          {unit.customName && <div className="whr-serif-italic" style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: -2 }}>{def.name}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="whr-badge-gold whr-badge">{fmtPts(cost)} pts</span>
          <button className="whr-btn-ghost" style={{ cursor: "pointer", color: "var(--burgundy)", fontFamily: "var(--font-display)" }}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}>✕</button>
        </div>
      </div>
      {models != null && <div style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 6 }}>{models} Models</div>}
      {(statKey || statNote) && (
        <div style={{ marginTop: 6, marginBottom: tags.length ? 8 : 0 }}>
          {charLabel && (
            <div className="whr-eyebrow" style={{ fontSize: 12.5, marginBottom: 2 }}>{charLabel}</div>
          )}
          <StatBlock statKey={statKey} statNote={statNote} />
          {championStatKey && (
            <>
              <div className="whr-eyebrow" style={{ fontSize: 12.5, margin: "6px 0 2px" }}>{championLabel}</div>
              <StatBlock statKey={championStatKey} statNote={null} />
            </>
          )}
          {mountStatKey && (
            <>
              <div className="whr-eyebrow" style={{ fontSize: 12.5, margin: "6px 0 2px" }}>{mountLabel}</div>
              <StatBlock statKey={mountStatKey} statNote={null} />
            </>
          )}
        </div>
      )}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
          {tags.map((t, i) => (
            <span key={i} style={{ fontSize: 13, color: "var(--ink-soft)", background: "var(--paper-3)", border: "1px solid var(--line-soft)", borderRadius: 3, padding: "1px 7px" }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function RosterPanel({ armyData, roster, totalPoints, pointLimit, regimentPoints, auxiliaryInfo, contingentInfo, compositionInfo, themeGateWarning, endlessBannerWarnings, loreWarnings, runeWarnings, houseRuleWarnings, knightWarnings, wargearWarnings, auxiliaryWarnings, selectedId, onSelect, onRemove }) {
  const regimentPct = totalPoints > 0 ? (regimentPoints / totalPoints) * 100 : 0;
  const overLimit = totalPoints > pointLimit;
  const underHalf = totalPoints > 0 && regimentPct < 50 - 0.001;
  const overAuxLimit = auxiliaryInfo?.hasAuxiliaryOption && auxiliaryInfo.auxCount > auxiliaryInfo.allowed;

  return (
    <div className="whr-col whr-builder-col" style={{ height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <h2 className="whr-h1" style={{ fontSize: 24, margin: 0 }}>{roster.name}</h2>
          <p className="whr-serif-italic" style={{ margin: "2px 0 0", fontSize: 15 }}>{roster.pointLimit} POINTS · {armyData.name.toUpperCase()}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: overLimit ? "var(--burgundy)" : "var(--forest-dark)" }}>
            {fmtPts(totalPoints)} / {roster.pointLimit}
          </div>
          <div style={{ fontSize: 13, color: underHalf ? "var(--burgundy)" : "var(--ink-soft)" }}>
            {fmtPts(regimentPoints)} in regiments ({regimentPct.toFixed(0)}%, min 50%)
          </div>
          {auxiliaryInfo?.hasAuxiliaryOption && auxiliaryInfo.totalRegiments > 0 && (
            <div style={{ fontSize: 13, color: overAuxLimit ? "var(--burgundy)" : "var(--ink-soft)" }}>
              {auxiliaryInfo.auxCount} / {auxiliaryInfo.allowed} regiments as auxiliaries
            </div>
          )}
        </div>
      </div>
      {contingentInfo?.active && contingentInfo.problems.length > 0 && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>{contingentInfo.label} isn't legal yet:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {contingentInfo.problems.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      {themeGateWarning && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)" }}>{themeGateWarning}</div>
        </div>
      )}
      {endlessBannerWarnings && endlessBannerWarnings.length > 0 && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>Magic Banner:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {endlessBannerWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      {loreWarnings && loreWarnings.length > 0 && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>Lore of Magic:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {loreWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      {runeWarnings && runeWarnings.length > 0 && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>Dwarf runes:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {runeWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      {houseRuleWarnings && houseRuleWarnings.length > 0 && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>House rules:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {houseRuleWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      {knightWarnings && knightWarnings.length > 0 && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>Knightly Orders:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {knightWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      {wargearWarnings && wargearWarnings.length > 0 && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>Wargear:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {wargearWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      {auxiliaryWarnings && auxiliaryWarnings.length > 0 && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>Auxiliaries:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {auxiliaryWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      {compositionInfo && (
        <div style={{ background: "var(--burgundy-pale)", border: "1px solid var(--burgundy)", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--burgundy)", marginBottom: 3 }}>Army composition:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--burgundy)" }}>
            {compositionInfo.problems.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      <div style={{ height: 1, background: "var(--line)", margin: "10px 0 16px" }} />

      <div className="whr-scroll" style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
        {roster.characters.length === 0 && roster.regiments.length === 0 && roster.chariots.length === 0 && roster.specials.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 10px", color: "var(--ink-faint)" }}>
            <p className="whr-eyebrow" style={{ color: "var(--ink-faint)" }}>The roster stands empty</p>
            <p className="whr-serif-italic">Add characters and regiments from the left to begin.</p>
          </div>
        )}

        {roster.characters.length > 0 && (
          <>
            <div className="whr-eyebrow" style={{ marginBottom: 8 }}>Characters</div>
            {roster.characters.map((u) => {
              const def = applyBloodline(armyData.characters.find((c) => c.id === u.defId), roster.armyTheme);
              return <RosterUnitCard key={u.instanceId} kind="character" unit={u} def={def} cost={unitCost(u, armyData, roster)} selected={selectedId === u.instanceId}
                onSelect={() => onSelect(u.instanceId)} onRemove={() => onRemove(u.instanceId)} armyData={armyData} bloodlineId={roster.armyTheme} />;
            })}
          </>
        )}

        {roster.regiments.length > 0 && (
          <>
            <div className="whr-eyebrow" style={{ margin: "16px 0 8px" }}>Regiments</div>
            {roster.regiments.map((u) => {
              const def = regDefFor(u, armyData);
              const srcArmyData = armyDataFor(u, armyData);
              const models = def.kind === "composite"
                ? Object.values(u.composition || {}).reduce((a, b) => a + b, 0)
                : u.size;
              return <RosterUnitCard key={u.instanceId} kind="regiment" unit={u} def={def} cost={unitCost(u, armyData, roster)} selected={selectedId === u.instanceId}
                onSelect={() => onSelect(u.instanceId)} onRemove={() => onRemove(u.instanceId)} models={models} armyData={srcArmyData} bloodlineId={roster.armyTheme} />;
            })}
          </>
        )}

        {roster.chariots.length > 0 && (
          <>
            <div className="whr-eyebrow" style={{ margin: "16px 0 8px" }}>Chariots & Monsters</div>
            {roster.chariots.map((u) => {
              const def = armyData.chariotsMonsters.find((c) => c.id === u.defId);
              return <RosterUnitCard key={u.instanceId} kind="chariot" unit={u} def={def} cost={unitCost(u, armyData, roster)} selected={selectedId === u.instanceId}
                onSelect={() => onSelect(u.instanceId)} onRemove={() => onRemove(u.instanceId)} models={def.kind === "quantity" ? u.qty : null} armyData={armyData} bloodlineId={roster.armyTheme} />;
            })}
          </>
        )}

        {roster.specials.length > 0 && (
          <>
            <div className="whr-eyebrow" style={{ margin: "16px 0 8px" }}>Special Characters</div>
            {roster.specials.map((u) => {
              const def = armyData.specialCharacters.find((s) => s.id === u.defId);
              return <RosterUnitCard key={u.instanceId} kind="special" unit={u} def={def} cost={unitCost(u, armyData, roster)} selected={selectedId === u.instanceId}
                onSelect={() => onSelect(u.instanceId)} onRemove={() => onRemove(u.instanceId)} armyData={armyData} bloodlineId={roster.armyTheme} />;
            })}
          </>
        )}
      </div>
    </div>
  );
}

// Print-only rendering, hidden on screen and revealed via the @media print CSS rule when the
// user clicks Export List. Mirrors RosterPanel's exact category grouping/iteration so the printed
// sheet always matches what's actually in the roster, but renders full stat blocks (via the same
// resolveUnitStat/resolveUnitTags/StatBlock helpers RosterUnitCard uses) in a plain black-on-white
// document layout instead of the app's interactive cards.
function PrintableUnitEntry({ kind, unit, def, cost, models, armyData, bloodlineId }) {
  const { statKey, statNote, championStatKey, championLabel, mountStatKey, charLabel, mountLabel } = resolveUnitStat(kind, unit, def, bloodlineId);
  const tags = resolveUnitTags(kind, unit, def, armyData, bloodlineId);
  const hasStats = !!(statKey || statNote);
  return (
    <div className="whr-print-unit">
      <div className="whr-print-unit-header">
        <span className="whr-print-unit-name">{unit.customName ? `${unit.customName} (${def.name})` : def.name}{models != null ? ` (${models})` : ""}</span>
        <span className="whr-print-unit-cost">{fmtPts(cost)} pts</span>
      </div>
      {(hasStats || tags.length > 0) && (
        <div className="whr-print-unit-body">
          {hasStats && (
            <div className="whr-print-stats-col">
              {charLabel && <div className="whr-print-stat-label">{charLabel}</div>}
              <StatBlock statKey={statKey} statNote={statNote} />
              {championStatKey && (
                <>
                  <div className="whr-print-stat-label">{championLabel}</div>
                  <StatBlock statKey={championStatKey} statNote={null} />
                </>
              )}
              {mountStatKey && (
                <>
                  <div className="whr-print-stat-label">{mountLabel}</div>
                  <StatBlock statKey={mountStatKey} statNote={null} />
                </>
              )}
            </div>
          )}
          {tags.length > 0 && (
            <ul className="whr-print-tags">
              {tags.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function PrintableRoster({ armyData, roster, totalPoints, regimentPoints }) {
  const regimentPct = totalPoints > 0 ? (regimentPoints / totalPoints) * 100 : 0;
  const themeLabel = armyData.themes?.options?.find((o) => o.id === roster.armyTheme)?.name;
  return (
    <div className="whr-print-roster">
      <div className="whr-print-header">
        <h1>{roster.name}</h1>
        <p>{armyData.name}{themeLabel ? ` — ${themeLabel}` : ""}</p>
        <p>{fmtPts(totalPoints)} / {roster.pointLimit} points · {fmtPts(regimentPoints)} in regiments ({regimentPct.toFixed(0)}%)</p>
      </div>

      {roster.characters.length > 0 && (
        <div>
          <h2>Characters</h2>
          {roster.characters.map((u) => {
            const def = applyBloodline(armyData.characters.find((c) => c.id === u.defId), roster.armyTheme);
            return <PrintableUnitEntry key={u.instanceId} kind="character" unit={u} def={def} cost={unitCost(u, armyData, roster)} armyData={armyData} bloodlineId={roster.armyTheme} />;
          })}
        </div>
      )}

      {roster.regiments.length > 0 && (
        <div>
          <h2>Regiments</h2>
          {roster.regiments.map((u) => {
            const def = regDefFor(u, armyData);
            const models = def.kind === "composite" ? Object.values(u.composition || {}).reduce((a, b) => a + b, 0) : u.size;
            return <PrintableUnitEntry key={u.instanceId} kind="regiment" unit={u} def={def} cost={unitCost(u, armyData, roster)} models={models} armyData={armyDataFor(u, armyData)} bloodlineId={roster.armyTheme} />;
          })}
        </div>
      )}

      {roster.chariots.length > 0 && (
        <div>
          <h2>Chariots & Monsters</h2>
          {roster.chariots.map((u) => {
            const def = armyData.chariotsMonsters.find((c) => c.id === u.defId);
            return <PrintableUnitEntry key={u.instanceId} kind="chariot" unit={u} def={def} cost={unitCost(u, armyData, roster)} models={def.kind === "quantity" ? u.qty : null} armyData={armyData} bloodlineId={roster.armyTheme} />;
          })}
        </div>
      )}

      {roster.specials.length > 0 && (
        <div>
          <h2>Special Characters</h2>
          {roster.specials.map((u) => {
            const def = armyData.specialCharacters.find((s) => s.id === u.defId);
            return <PrintableUnitEntry key={u.instanceId} kind="special" unit={u} def={def} cost={unitCost(u, armyData, roster)} armyData={armyData} bloodlineId={roster.armyTheme} />;
          })}
        </div>
      )}
    </div>
  );
}

/* ---- Detail panel per unit kind ---- */

// Lets a Dwarf character build one item (weapon/armour/enchanted/banner) out of up to 3
// individual runes instead of picking a single fixed named item. Combined item = one slot,
// cost = sum of the chosen runes. At most one Master Rune per item, enforced here in the UI.
// A couple of Engineering Runes (Penetrating, Disguise) cost double specifically on a Gyrocopter —
// everywhere else a rune's cost is a flat constant, so this is a targeted exception rather than a
// general mechanism. defId is the bearing unit's own def id (e.g. "gyrocopters").
function runeCostFor(mi, defId) {
  if (mi?.doubleCostOn && defId && mi.doubleCostOn.includes(defId)) return mi.cost * 2;
  return mi?.cost || 0;
}

function RunesSection({ children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <span className="whr-label">Runes</span>
      {children}
    </div>
  );
}

function RuneForge({ items, cat, label, context, comboIds, onChange, disabled: forgeDisabled, defId }) {
  const pool = items.filter((m) => m.isRune && m.cat === cat && isItemAllowed(m, context));
  if (pool.length === 0) return null;
  const selected = comboIds || [];
  const [open, setOpen] = useState(selected.length > 0);
  const hasMaster = selected.some((id) => pool.find((m) => m.id === id)?.isMasterRune);
  const total = selected.reduce((sum, id) => sum + runeCostFor(pool.find((m) => m.id === id), defId), 0);
  const countOf = (id) => selected.filter((x) => x === id).length;
  const toggle = (m) => {
    if (selected.includes(m.id)) { onChange(selected.filter((x) => x !== m.id)); return; }
    if (selected.length >= 3) return;
    if (m.isMasterRune && hasMaster) return;
    onChange([...selected, m.id]);
  };
  const setCount = (m, newCount) => {
    const current = countOf(m.id);
    const cap = Math.min(m.maxCount || 3, 3 - selected.length + current);
    const clamped = Math.max(0, Math.min(newCount, cap));
    onChange([...selected.filter((x) => x !== m.id), ...Array(clamped).fill(m.id)]);
  };
  const nameCounts = {};
  selected.forEach((id) => { const nm = pool.find((m) => m.id === id)?.name; if (nm) nameCounts[nm] = (nameCounts[nm] || 0) + 1; });
  const comboNames = Object.entries(nameCounts).map(([nm, n]) => (n > 1 ? `${nm} ×${n}` : nm)).join(" + ");
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ border: "1px solid var(--line-soft)", borderRadius: 3, overflow: "hidden" }}>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper-2)", border: "none", padding: "7px 9px", cursor: "pointer", textAlign: "left" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span aria-hidden="true" style={{ display: "inline-block", fontSize: 11, color: "var(--ink-soft)", transition: "transform 0.15s", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14.5, letterSpacing: "0.04em", color: "var(--gold)" }}>{label}</span>
            <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>({pool.length})</span>
          </span>
          {selected.length > 0 && (
            <span style={{ fontSize: 11.5, color: "#F3E4BC", background: "var(--burgundy)", padding: "2px 7px", borderRadius: 8 }}>{selected.length} selected</span>
          )}
        </button>
        {open && (
          <div style={{ background: "var(--paper)", padding: "2px 8px" }}>
            {pool.map((m) => {
        if (m.repeatable) {
          const count = countOf(m.id);
          const atCap = forgeDisabled || (selected.length >= 3 && count === 0);
          const capLabel = m.maxCount && m.maxCount < 3 ? `max ${m.maxCount}` : null;
          return (
            <div key={m.id} className={`whr-opt-row ${atCap ? "whr-opt-disabled" : ""}`} title={m.desc}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {m.name}
                {capLabel && <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>({capLabel})</span>}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="whr-stepper">
                  <button onClick={() => setCount(m, count - 1)} disabled={forgeDisabled || count === 0}>−</button>
                  <div className="whr-stepper-val">{count}</div>
                  <button onClick={() => setCount(m, count + 1)} disabled={forgeDisabled || count >= (m.maxCount || 3) || selected.length >= 3}>+</button>
                </div>
                <span className="whr-opt-cost" style={{ minWidth: 56, textAlign: "right" }}>{count > 0 ? `+${runeCostFor(m, defId)}pts` : `${runeCostFor(m, defId)}pts ea`}</span>
              </span>
            </div>
          );
        }
        const checked = selected.includes(m.id);
        const disabled = forgeDisabled || (!checked && (selected.length >= 3 || (m.isMasterRune && hasMaster)));
        return (
          <label key={m.id} className={`whr-opt-row whr-opt-label ${disabled ? "whr-opt-disabled" : ""}`} title={m.desc}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(m)} />
              {m.name}
              {m.isMasterRune && <span style={{ fontFamily: "var(--font-display-sc)", fontSize: 10, letterSpacing: "0.04em", background: "var(--gold)", color: "var(--paper)", padding: "1px 6px", borderRadius: 2, marginLeft: 6 }}>Master</span>}
            </span>
            <span className="whr-opt-cost">+{runeCostFor(m, defId)}pts</span>
          </label>
        );
            })}
            {selected.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line-soft)", fontSize: 14.5, padding: "8px 2px" }}>
                <span>{comboNames} <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>({selected.length}/3 runes)</span></span>
                <strong>{fmtPts(total)}pts</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NicknameField({ unit, updateUnit }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="whr-label" style={{ display: "block" }}>Nickname (optional)</label>
      <input className="whr-input" maxLength={50} placeholder="e.g. Manann's Blades" value={unit.customName || ""}
        onChange={(e) => updateUnit({ ...unit, customName: e.target.value })} style={{ width: "100%", maxWidth: 320 }} />
    </div>
  );
}

function CharacterDetail({ def: rawDef, unit, roster, updateUnit, armyData }) {
  const def = applyBloodline(rawDef, roster.armyTheme);
  const usedElsewhere = allUsedMagicItemIds(roster, unit.instanceId);
  const mounted = !!unit.mountId;
  const visibleMounts = (def.mounts || []).filter((m) => !m.requiresMark || m.requiresMark === (unit.mark || def.markGroup?.options?.[0])).filter((m) => !m.theme || m.theme === roster.armyTheme);
  return (
    <div>
      <h3 className="whr-h1" style={{ fontSize: 21, margin: "0 0 2px" }}>{def.name}</h3>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <span className="whr-badge-gold whr-badge">{fmtPts(characterCost(unit, def, armyData))} pts</span>
      </div>
      <NicknameField unit={unit} updateUnit={updateUnit} />
      {def.gearNote && <p style={{ fontSize: 15, marginTop: 10, color: "var(--ink-soft)" }}>{def.gearNote}</p>}
      {def.innateWeapon && <p style={{ fontSize: 14, marginTop: 4, color: "var(--ink-faint)" }}>Carries a {def.innateWeapon.name} ({def.innateWeapon.desc}) — free, doesn't use a magic item slot. Forfeited automatically if another magic weapon is taken.</p>}

      {def.markGroup && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Mark of Chaos</span>
          {(roster.armyTheme && roster.armyTheme !== "Mixed" && def.markGroup.options.includes(roster.armyTheme) ? [roster.armyTheme] : def.markGroup.options).map((opt) => (
            <label key={opt} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`mark-${unit.instanceId}`} checked={(unit.mark || def.markGroup.options[0]) === opt}
                  onChange={() => {
                    const context = itemContext(def, unit, { characterId: def.id, mark: opt, tags: [...(def.tags || []), ...(roster.armyTheme ? [roster.armyTheme] : [])] });
                    const filteredItems = (unit.magicItemIds || []).filter((id) => {
                      const mi = miById(armyData.magicItems, id);
                      return mi ? isItemAllowed(mi, context) : true;
                    });
                    updateUnit({ ...unit, mark: opt, mountId: null, magicItemIds: filteredItems });
                  }} />
                {opt}
              </span>
            </label>
          ))}
        </div>
      )}

      {def.armourGroup && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Armour (free)</span>
          {def.armourGroup.options.map((opt) => (
            <label key={opt} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`armour-${unit.instanceId}`} checked={(unit.armour || def.armourGroup.options[0]) === opt}
                  onChange={() => updateUnit({ ...unit, armour: opt })} />
                {opt}
              </span>
            </label>
          ))}
        </div>
      )}

      {def.meleeGroup && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">{def.meleeGroup.label}</span>
          {def.meleeGroup.options.map((opt) => (
            <label key={opt} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`melee-${unit.instanceId}`} checked={(unit.melee || def.meleeGroup.options[0]) === opt}
                  onChange={() => updateUnit({ ...unit, melee: opt })} />
                {opt}
              </span>
            </label>
          ))}
        </div>
      )}

      {def.bowOption && (
        <div style={{ marginTop: 8 }}>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!unit.bow} onChange={(e) => updateUnit({ ...unit, bow: e.target.checked })} />
              {def.bowOption.label}
            </span>
            <span className="whr-opt-cost">+{def.bowOption.cost}pts</span>
          </label>
        </div>
      )}

      {def.missileGroup && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">{def.missileGroup.label}</span>
          {def.missileGroup.options.map((opt) => (
            <label key={opt} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`missile-${unit.instanceId}`} checked={(unit.missile || def.missileGroup.options[0]) === opt}
                  onChange={() => updateUnit({ ...unit, missile: opt })} />
                {opt}
              </span>
              {opt !== def.missileGroup.options[0] && <span className="whr-opt-cost">+{def.missileGroup.cost}pts</span>}
            </label>
          ))}
        </div>
      )}

      {def.experimentalMissileGroup && !mounted && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">{def.experimentalMissileGroup.label}</span>
          {def.experimentalMissileGroup.options.map((opt) => (
            <label key={opt} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`expmissile-${unit.instanceId}`} checked={(unit.experimentalMissile || def.experimentalMissileGroup.options[0]) === opt}
                  onChange={() => updateUnit({ ...unit, experimentalMissile: opt })} />
                {opt}
              </span>
              {opt !== def.experimentalMissileGroup.options[0] && <span className="whr-opt-cost">+{def.experimentalMissileGroup.cost}pts</span>}
            </label>
          ))}
        </div>
      )}

      {def.wingsOption && (
        <div style={{ marginTop: 8 }}>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!unit.wings} onChange={(e) => updateUnit({ ...unit, wings: e.target.checked })} />
              {def.wingsOption.label}
            </span>
            <span className="whr-opt-cost">+{def.wingsOption.cost}pts</span>
          </label>
        </div>
      )}

      {def.anvilOption && (
        <div style={{ marginTop: 8 }}>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!unit.anvil} onChange={(e) => updateUnit({ ...unit, anvil: e.target.checked })} />
              {def.anvilOption.label}
            </span>
            <span className="whr-opt-cost">+{def.anvilOption.cost}pts</span>
          </label>
        </div>
      )}

      {def.chaosArmourOption && (
        <div style={{ marginTop: 8 }}>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!unit.chaosArmour} onChange={(e) => updateUnit({ ...unit, chaosArmour: e.target.checked })} />
              {def.chaosArmourOption.label}
            </span>
            <span className="whr-opt-cost">+{def.chaosArmourOption.cost}pts</span>
          </label>
        </div>
      )}

      {def.magicLevelOption && (() => {
        const forbidden = def.magicLevelOption.forbiddenMark && (unit.mark || def.markGroup?.options?.[0]) === def.magicLevelOption.forbiddenMark;
        if (forbidden) return <p style={{ fontSize: 14, color: "var(--ink-faint)", marginTop: 8 }}>No magic levels — forbidden with the {def.magicLevelOption.forbiddenMark} Mark.</p>;
        const ineligible = def.magicLevelOption.eligible && !def.magicLevelOption.eligible(unit, def);
        if (ineligible) return <p style={{ fontSize: 14, color: "var(--ink-faint)", marginTop: 8 }}>{def.magicLevelOption.ineligibleNote || "Not eligible for magic levels with current wargear."}</p>;
        const min = def.magicLevelOption.min || 0;
        return (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="whr-label" style={{ marginBottom: 0 }}>{def.magicLevelOption.label}</span>
              <span className="whr-opt-cost">+{def.magicLevelOption.costPerLevel}pts/level</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <Stepper value={unit.magicLevel ?? min} min={min} max={def.magicLevelOption.max} onChange={(v) => updateUnit({ ...unit, magicLevel: v })} />
            </div>
            {min > 0 && <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 4 }}>Minimum {min} level{min > 1 ? "s" : ""} required.</p>}
          </div>
        );
      })()}

      {isWizard(def, unit) && armyData.loreOptions && armyData.loreOptions.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Lore of Magic</span>
          {armyData.loreOptions.length === 1 ? (
            <div className="whr-opt-row" style={{ opacity: 0.7 }}>
              <span>{armyData.loreOptions[0]}</span>
            </div>
          ) : (
            <select className="whr-select" value={unit.lore || ""} onChange={(e) => updateUnit({ ...unit, lore: e.target.value || null })}>
              <option value="">Choose one</option>
              {armyData.loreOptions.map((lore) => (
                <option key={lore} value={lore}>{lore}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {def.mounts && def.mounts.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Mount{def.markGroup ? " (filtered by Mark)" : ""}</span>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name={`mount-${unit.instanceId}`} checked={!unit.mountId} onChange={() => updateUnit({ ...unit, mountId: null })} />
              On foot
            </span>
          </label>
          {visibleMounts.map((m) => (
            <label key={m.id} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`mount-${unit.instanceId}`} checked={unit.mountId === m.id} onChange={() => updateUnit({ ...unit, mountId: m.id })} />
                {m.name}
              </span>
              <span className="whr-opt-cost">{m.cost > 0 ? `+${m.cost}pts` : "free"}</span>
            </label>
          ))}
        </div>
      )}

      {def.magicItemSlots > 0 && (() => {
        const runeItems = unit.runeItems || {};
        const runeSlotsUsed = Object.values(runeItems).filter((arr) => arr && arr.length > 0).length;
        const effFilter = defaultCategoryFilter(def);
        const itemCtx = itemContext(def, unit, { characterId: def.id, mark: unit.mark || def.markGroup?.options?.[0] || def.impliedMark, tags: [...(def.tags || []), ...(roster.armyTheme ? [roster.armyTheme] : [])] });
        const namedCatOf = (id) => miById(armyData.magicItems, id)?.cat;
        const hasNamedOfCat = (cat) => (unit.magicItemIds || []).some((id) => namedCatOf(id) === cat);
        return (
          <div style={{ marginTop: 14 }}>
            <MagicItemPickerWithBanner items={armyData.magicItems} selectedIds={unit.magicItemIds || []} maxSlots={Math.max(0, def.magicItemSlots - runeSlotsUsed)} usedElsewhere={usedElsewhere}
              categoryFilter={effFilter}
              context={itemCtx}
              onToggle={(id) => {
                const mi = miById(armyData.magicItems, id);
                const already = (unit.magicItemIds || []).includes(id);
                const newIds = already ? (unit.magicItemIds || []).filter((x) => x !== id) : [...(unit.magicItemIds || []), id];
                const newRuneItems = (!already && mi) ? { ...runeItems, [mi.cat]: [] } : runeItems;
                updateUnit({ ...unit, magicItemIds: newIds, runeItems: newRuneItems });
              }} />
            {armyData.runeForge && ["weapon", "armour", "enchanted", "banner"].filter((c) => effFilter.includes(c)).length > 0 && (
              <RunesSection>
                {["weapon", "armour", "enchanted", "banner"].filter((c) => effFilter.includes(c)).map((cat) => (
                  <RuneForge key={cat} items={armyData.magicItems} cat={cat} label={{ weapon: "Forge a Weapon Rune", armour: "Forge an Armour Rune", enchanted: "Forge a Talisman Rune", banner: "Forge a Banner Rune" }[cat]}
                    context={itemCtx} comboIds={runeItems[cat]} disabled={hasNamedOfCat(cat)}
                    onChange={(ids) => updateUnit({ ...unit, runeItems: { ...runeItems, [cat]: ids }, magicItemIds: ids.length > 0 ? (unit.magicItemIds || []).filter((id) => namedCatOf(id) !== cat) : unit.magicItemIds })} />
                ))}
              </RunesSection>
            )}
          </div>
        );
      })()}

      {def.bloodlinePowerSlots > 0 && (
        <div style={{ marginTop: 14 }}>
          <MagicItemPicker items={armyData.magicItems} selectedIds={unit.bloodlinePowerIds || []} maxSlots={def.bloodlinePowerSlots} usedElsewhere={usedElsewhere}
            categoryFilter={["bloodlinepower"]}
            context={itemContext(def, unit, { characterId: def.id, tags: [...(def.tags || []), ...(roster.armyTheme ? [roster.armyTheme] : [])] })}
            onToggle={(id) => toggleArrayField(unit, "bloodlinePowerIds", id, updateUnit)} />
        </div>
      )}
    </div>
  );
}

function RegimentDetail({ def, unit, roster, updateUnit, armyData }) {
  const usedElsewhere = allUsedMagicItemIds(roster, unit.instanceId);
  const currentTheme = roster.armyTheme || armyData.themes?.default || null;
  const themeOptionVisible = (o) => !armyData.themes || !o.theme || o.theme === currentTheme;

  if (def.kind === "composite") {
    const comp = unit.composition || {};
    const total = def.composition.reduce((sum, c) => sum + (comp[c.id] || 0) * c.cost, 0);
    return (
      <div>
        <h3 className="whr-h1" style={{ fontSize: 21, margin: "0 0 2px" }}>{def.name}</h3>
        <span className="whr-badge-gold whr-badge">{fmtPts(total)} pts</span>
        <NicknameField unit={unit} updateUnit={updateUnit} />
        <p style={{ fontSize: 15, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
        {def.composition.map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed var(--line-soft)" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display-sc)", fontSize: 17.5, letterSpacing: "0.02em" }}>{c.label}</div>
              <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>{c.cost}pts each</div>
            </div>
            <Stepper value={comp[c.id] || 0} onChange={(v) => updateUnit({ ...unit, composition: { ...comp, [c.id]: v } })} />
          </div>
        ))}
        {def.composition.filter((c) => (comp[c.id] || 0) > 0).map((c) => (
          <div key={c.id} style={{ marginTop: 10 }}>
            <div className="whr-label" style={{ marginBottom: 4 }}>{c.label}</div>
            <StatBlock statKey={c.stat} />
          </div>
        ))}
      </div>
    );
  }

  const size = unit.size ?? def.minSize;
  const gearSelections = unit.gearSelections || {};
  const toggleFreeStandard = fastCavalryStandardFree(def, gearSelections);
  const autoStandard = def.command === "standard" || def.command === "special";
  const paidStandardCommand = def.command === "fastCavalry" || def.command === "monstrous";
  const standardAllowed = autoStandard || paidStandardCommand;
  const standardFree = autoStandard || toggleFreeStandard;
  const standardCost = paidStandardCommand && !toggleFreeStandard ? 10 : 0;

  const detachments = unit.detachments || [];
  const detachmentSizeUsed = detachments.reduce((s, d) => s + d.size, 0);

  return (
    <div>
      <h3 className="whr-h1" style={{ fontSize: 21, margin: "0 0 2px" }}>{def.name}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span className="whr-badge-gold whr-badge">{fmtPts(regimentCost(unit, def, armyData))} pts</span>
        <span style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>{size} Models{unit.championIncluded ? " (incl. champion)" : ""}</span>
      </div>
      <NicknameField unit={unit} updateUnit={updateUnit} />
      {def.note && <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>{def.note}</p>}

      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="whr-label" style={{ marginBottom: 0 }}>Regiment Size (min {def.minSize})</span>
          <span className="whr-opt-cost">+{fmtPts(regimentTrooperUnitCost(def, gearSelections))}pts / model</span>
        </div>
        <div style={{ marginTop: 6 }}>
          <Stepper value={size} min={def.minSize} onChange={(v) => updateUnit({ ...unit, size: v })} />
        </div>
      </div>

      {(() => {
        const visibleOptions = (def.options || []).filter(themeOptionVisible);
        if (visibleOptions.length === 0) return null;
        return (
          <div style={{ marginTop: 14 }}>
            <span className="whr-label">Wargear</span>
            {(() => {
              const groups = {};
              const singles = [];
              visibleOptions.forEach((o) => { if (o.group) { groups[o.group] = groups[o.group] || []; groups[o.group].push(o); } else singles.push(o); });
              return (
                <>
                  {Object.entries(groups).map(([g, opts]) => (
                    <div key={g} style={{ marginBottom: 6 }}>
                      {opts.map((o) => (
                        <label key={o.id} className="whr-opt-row whr-opt-label">
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input type="radio" name={`${g}-${unit.instanceId}`} checked={(gearSelections[g] || "") === o.id}
                              onChange={() => updateUnit({ ...unit, gearSelections: { ...gearSelections, [g]: o.id } })} />
                            {o.label}
                          </span>
                          <span className="whr-opt-cost">{o.cost ? `+${o.cost}/model` : "free"}</span>
                        </label>
                      ))}
                      <label className="whr-opt-row whr-opt-label" style={{ fontSize: 14.5, color: "var(--ink-faint)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="radio" name={`${g}-${unit.instanceId}`} checked={!gearSelections[g]} onChange={() => { const n = { ...gearSelections }; delete n[g]; updateUnit({ ...unit, gearSelections: n }); }} />
                          None of the above (default)
                        </span>
                      </label>
                    </div>
                  ))}
                  {singles.map((o) => (
                    <label key={o.id} className="whr-opt-row whr-opt-label">
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" checked={!!gearSelections[o.id]} onChange={(e) => updateUnit({ ...unit, gearSelections: { ...gearSelections, [o.id]: e.target.checked } })} />
                        {o.label}
                      </span>
                      <span className="whr-opt-cost">{o.cost ? `+${o.cost}${o.per === "model" ? "/model" : ""}` : "free"}</span>
                    </label>
                  ))}
                </>
              );
            })()}
          </div>
        );
      })()}

      {def.command !== "none" && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Command Group</span>
          <div className="whr-opt-row"><span>Musician</span><span className="whr-badge">included</span></div>
          {autoStandard && (
            <div className="whr-opt-row"><span>Standard Bearer</span><span className="whr-badge">included</span></div>
          )}
          {!autoStandard && standardAllowed && (
            <label className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!unit.standard} onChange={(e) => updateUnit({ ...unit, standard: e.target.checked, magicBannerId: e.target.checked ? unit.magicBannerId : null, runeItems: e.target.checked ? unit.runeItems : { ...(unit.runeItems || {}), banner: [] } })} />
                Standard Bearer
              </span>
              <span className="whr-opt-cost">{standardFree ? "free" : `+${standardCost}pts`}</span>
            </label>
          )}
          {def.champion && (
            <label className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!unit.championIncluded} onChange={(e) => {
                  const checked = e.target.checked;
                  updateUnit({ ...unit, championIncluded: checked, championMagicItemIds: checked ? unit.championMagicItemIds : [] });
                }} />
                {def.champion.name}
              </span>
              <span className="whr-opt-cost">+{fmtPts(def.champion.baseCost)}pts</span>
            </label>
          )}
          {def.command === "skirmisher" && <p style={{ fontSize: 14, color: "var(--ink-faint)" }}>Skirmishers cannot take a standard bearer.</p>}
        </div>
      )}

      {def.multiChampion && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="whr-label" style={{ marginBottom: 0 }}>{def.multiChampion.name}s</span>
            <span className="whr-opt-cost">+{fmtPts(def.multiChampion.baseCost + regimentTrooperUnitCost(def, unit.gearSelections || {}))}pts each</span>
          </div>
          <Stepper value={unit.multiChampionCount || 0} min={0} max={20}
            onChange={(v) => {
              const items = [...(unit.multiChampionItems || [])];
              const runes = [...(unit.multiChampionRuneItems || [])];
              while (items.length < v) items.push([]);
              while (runes.length < v) runes.push({});
              items.length = v; runes.length = v;
              updateUnit({ ...unit, multiChampionCount: v, multiChampionItems: items, multiChampionRuneItems: runes });
            }} />
          {Array.from({ length: unit.multiChampionCount || 0 }).map((_, i) => {
            const mc = def.multiChampion;
            const instItems = (unit.multiChampionItems || [])[i] || [];
            const instRunes = (unit.multiChampionRuneItems || [])[i] || {};
            const runeUsed = (instRunes.weapon || []).length > 0 ? 1 : 0;
            const itemCtx = itemContext(mc, unit, { regimentId: def.id, tags: mc.tags || [] });
            const setInstItems = (ids) => {
              const items = [...(unit.multiChampionItems || [])];
              items[i] = ids;
              updateUnit({ ...unit, multiChampionItems: items });
            };
            const setInstRunes = (ids) => {
              const runes = [...(unit.multiChampionRuneItems || [])];
              runes[i] = { ...(runes[i] || {}), weapon: ids };
              updateUnit({ ...unit, multiChampionRuneItems: runes });
            };
            return (
              <div key={i} style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line-soft)" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{mc.name} #{i + 1}</span>
                {mc.magicItemSlots > 0 && (
                  <MagicItemPicker items={armyData.magicItems} selectedIds={instItems} maxSlots={Math.max(0, mc.magicItemSlots - runeUsed)}
                    usedElsewhere={usedElsewhere} categoryFilter={mc.magicItemCategoryFilter}
                    label={mc.itemSlotLabel || "Magic Item"}
                    context={itemCtx}
                    onToggle={(id) => setInstItems(instItems.includes(id) ? instItems.filter((x) => x !== id) : [...instItems, id])} />
                )}
                {armyData.runeForge && (mc.magicItemCategoryFilter || []).includes("weapon") && (
                  <RunesSection>
                    <RuneForge items={armyData.magicItems} cat="weapon" label="Forge a Weapon Rune" context={itemCtx}
                      comboIds={instRunes.weapon} onChange={setInstRunes} />
                  </RunesSection>
                )}
              </div>
            );
          })}
        </div>
      )}

      {def.extraOption && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="whr-label" style={{ marginBottom: 0 }}>{def.extraOption.label}</span>
            <span className="whr-opt-cost">+{def.extraOption.cost}pts each</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <Stepper value={unit.extraOptionCount || 0} min={0} max={def.extraOption.max} onChange={(v) => updateUnit({ ...unit, extraOptionCount: v })} />
          </div>
          {def.extraOption.note && <p style={{ fontSize: 14, color: "var(--burgundy)", marginTop: 4 }}>{def.extraOption.note}</p>}
        </div>
      )}

      {def.command === "none" && def.note?.includes("counts as having a musician") && (
        <div className="whr-opt-row" style={{ marginTop: 10 }}><span>Musician (sung, not carried)</span><span className="whr-badge">included</span></div>
      )}
      {def.command === "none" && def.note?.includes("No standard bearer or musician") && (
        <div className="whr-opt-row" style={{ marginTop: 10 }}><span>Standard bearer / musician</span><span className="whr-badge-burgundy whr-badge">not allowed</span></div>
      )}
      {def.command === "none" && def.champion && (
        <div style={{ marginTop: 10 }}>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!unit.championIncluded} onChange={(e) => {
                const checked = e.target.checked;
                updateUnit({ ...unit, championIncluded: checked, championMagicItemIds: checked ? unit.championMagicItemIds : [] });
              }} />
              {def.champion.name}
            </span>
            <span className="whr-opt-cost">+{fmtPts(def.champion.baseCost)}pts</span>
          </label>
        </div>
      )}

      {(autoStandard || unit.standard) && (() => {
        const runeBanner = unit.runeItems?.banner || [];
        const itemCtx = itemContext(def, unit, { regimentId: def.id, knightGroup: def.knightGroup, tags: def.tags || [] });
        return (
          <div style={{ marginTop: 10 }}>
            <MagicItemPicker items={armyData.magicItems} selectedIds={unit.magicBannerId ? [unit.magicBannerId] : []} maxSlots={runeBanner.length > 0 ? 0 : 1} usedElsewhere={usedElsewhere}
              categoryFilter={["banner"]} label="Magic Banner"
              context={itemCtx}
              onToggle={(id) => updateUnit({ ...unit, magicBannerId: unit.magicBannerId === id ? null : id, runeItems: unit.magicBannerId === id ? unit.runeItems : { ...(unit.runeItems || {}), banner: [] } })} />
            {armyData.runeForge && (
              <RunesSection>
                <RuneForge items={armyData.magicItems} cat="banner" label="Forge a Banner Rune" context={itemCtx}
                  comboIds={runeBanner} disabled={!!unit.magicBannerId}
                  onChange={(ids) => updateUnit({ ...unit, magicBannerId: ids.length > 0 ? null : unit.magicBannerId, runeItems: { ...(unit.runeItems || {}), banner: ids } })} />
              </RunesSection>
            )}
          </div>
        );
      })()}

      {def.champion && unit.championIncluded && (def.champion.markGroup || def.champion.magicItemSlots > 0) && (
        <div style={{ marginTop: 14 }}>
          {def.champion.markGroup && (
            <div>
              <span className="whr-label">Champion's Mark of Chaos</span>
              {(roster.armyTheme && roster.armyTheme !== "Mixed" && def.champion.markGroup.options.includes(roster.armyTheme) ? [roster.armyTheme] : def.champion.markGroup.options).map((opt) => (
                <label key={opt} className="whr-opt-row whr-opt-label">
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="radio" name={`championmark-${unit.instanceId}`} checked={(unit.championMark || def.champion.markGroup.options[0]) === opt}
                      onChange={() => {
                        const context = itemContext(def.champion, unit, { regimentId: def.id, mark: opt, tags: [...(def.champion.tags || []), ...(roster.armyTheme ? [roster.armyTheme] : [])] });
                        const filteredItems = (unit.championMagicItemIds || []).filter((id) => {
                          const mi = miById(armyData.magicItems, id);
                          return mi ? isItemAllowed(mi, context) : true;
                        });
                        updateUnit({ ...unit, championMark: opt, championMagicItemIds: filteredItems });
                      }} />
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          )}
          {def.champion.magicItemSlots > 0 && (() => {
            const championRuneItems = unit.championRuneItems || {};
            const runeSlotsUsed = Object.values(championRuneItems).filter((arr) => arr && arr.length > 0).length;
            const effFilter = def.champion.magicItemCategoryFilter || NON_BANNER_CATEGORIES;
            const itemCtx = itemContext(def.champion, unit, { regimentId: def.id, knightGroup: def.knightGroup, mark: unit.championMark || def.champion.markGroup?.options?.[0], tags: [...(def.champion.tags || []), ...(roster.armyTheme ? [roster.armyTheme] : [])] });
            const namedCatOf = (id) => miById(armyData.magicItems, id)?.cat;
            const hasNamedOfCat = (c) => (unit.championMagicItemIds || []).some((id) => namedCatOf(id) === c);
            return (
              <>
                <MagicItemPickerWithBanner items={armyData.magicItems} selectedIds={unit.championMagicItemIds || []} maxSlots={Math.max(0, def.champion.magicItemSlots - runeSlotsUsed)} usedElsewhere={usedElsewhere}
                  categoryFilter={effFilter}
                  context={itemCtx}
                  onToggle={(id) => {
                    const mi = miById(armyData.magicItems, id);
                    const already = (unit.championMagicItemIds || []).includes(id);
                    const newIds = already ? (unit.championMagicItemIds || []).filter((x) => x !== id) : [...(unit.championMagicItemIds || []), id];
                    const newRuneItems = (!already && mi) ? { ...championRuneItems, [mi.cat]: [] } : championRuneItems;
                    updateUnit({ ...unit, championMagicItemIds: newIds, championRuneItems: newRuneItems });
                  }} />
                {armyData.runeForge && ["weapon", "armour", "enchanted"].filter((c) => effFilter.includes(c)).length > 0 && (
                  <RunesSection>
                    {["weapon", "armour", "enchanted"].filter((c) => effFilter.includes(c)).map((c) => (
                      <RuneForge key={c} items={armyData.magicItems} cat={c} label={{ weapon: "Forge a Weapon Rune", armour: "Forge an Armour Rune", enchanted: "Forge a Talisman Rune" }[c]}
                        context={itemCtx} comboIds={championRuneItems[c]} disabled={hasNamedOfCat(c)}
                        onChange={(ids) => updateUnit({ ...unit, championRuneItems: { ...championRuneItems, [c]: ids }, championMagicItemIds: ids.length > 0 ? (unit.championMagicItemIds || []).filter((id) => namedCatOf(id) !== c) : unit.championMagicItemIds })} />
                    ))}
                  </RunesSection>
                )}
              </>
            );
          })()}
        </div>
      )}

      {def.championOptions && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Regimental Champion (optional)</span>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name={`championopt-${unit.instanceId}`} checked={!unit.championOptionId} onChange={() => updateUnit({ ...unit, championOptionId: null, championMagicItemIds: [] })} />
              None
            </span>
          </label>
          {def.championOptions.map((opt) => (
            <label key={opt.id} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`championopt-${unit.instanceId}`} checked={unit.championOptionId === opt.id}
                  onChange={() => updateUnit({ ...unit, championOptionId: opt.id, championMagicItemIds: [] })} />
                {championOptionEffective(opt, roster.armyTheme).name}
              </span>
              <span className="whr-opt-cost">+{fmtPts(opt.cost)}pts</span>
            </label>
          ))}
          {def.championOptions.find((o) => o.id === unit.championOptionId)?.note && (
            <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 2 }}>{def.championOptions.find((o) => o.id === unit.championOptionId).note}</p>
          )}
          {def.championOptions.find((o) => o.id === unit.championOptionId) && (() => {
            const opt = def.championOptions.find((o) => o.id === unit.championOptionId);
            if (!opt.magicItemSlots) return null;
            const championRuneItems = unit.championRuneItems || {};
            const runeSlotsUsed = Object.values(championRuneItems).filter((arr) => arr && arr.length > 0).length;
            const effFilter = opt.magicItemCategoryFilter || NON_BANNER_CATEGORIES;
            const itemCtx = itemContext(opt, unit, { regimentId: def.id, tags: [...(opt.tags || []), ...(roster.armyTheme ? [roster.armyTheme] : [])] });
            const namedCatOf = (id) => miById(armyData.magicItems, id)?.cat;
            const hasNamedOfCat = (c) => (unit.championMagicItemIds || []).some((id) => namedCatOf(id) === c);
            return (
              <>
                <MagicItemPickerWithBanner items={armyData.magicItems} selectedIds={unit.championMagicItemIds || []} maxSlots={Math.max(0, opt.magicItemSlots - runeSlotsUsed)} usedElsewhere={usedElsewhere}
                  categoryFilter={effFilter}
                  label={opt.itemSlotLabel || "Magic Item"}
                  context={itemCtx}
                  onToggle={(id) => {
                    const mi = miById(armyData.magicItems, id);
                    const already = (unit.championMagicItemIds || []).includes(id);
                    const newIds = already ? (unit.championMagicItemIds || []).filter((x) => x !== id) : [...(unit.championMagicItemIds || []), id];
                    const newRuneItems = (!already && mi) ? { ...championRuneItems, [mi.cat]: [] } : championRuneItems;
                    updateUnit({ ...unit, championMagicItemIds: newIds, championRuneItems: newRuneItems });
                  }} />
                {armyData.runeForge && ["weapon", "armour", "enchanted"].filter((c) => effFilter.includes(c)).length > 0 && (
                  <RunesSection>
                    {["weapon", "armour", "enchanted"].filter((c) => effFilter.includes(c)).map((c) => (
                      <RuneForge key={c} items={armyData.magicItems} cat={c} label={{ weapon: "Forge a Weapon Rune", armour: "Forge an Armour Rune", enchanted: "Forge a Talisman Rune" }[c]}
                        context={itemCtx} comboIds={championRuneItems[c]} disabled={hasNamedOfCat(c)}
                        onChange={(ids) => updateUnit({ ...unit, championRuneItems: { ...championRuneItems, [c]: ids }, championMagicItemIds: ids.length > 0 ? (unit.championMagicItemIds || []).filter((id) => namedCatOf(id) !== c) : unit.championMagicItemIds })} />
                    ))}
                  </RunesSection>
                )}
              </>
            );
          })()}
        </div>
      )}

      {def.branchWraith && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Join a Branch Wraith</span>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!unit.branchWraithIncluded} onChange={(e) => updateUnit({ ...unit, branchWraithIncluded: e.target.checked, branchWraithSpriteIds: e.target.checked ? unit.branchWraithSpriteIds : [] })} />
              {def.branchWraith.name}
            </span>
            <span className="whr-opt-cost">+{def.branchWraith.cost}pts</span>
          </label>
          <p style={{ fontSize: 14, color: "var(--ink-faint)" }}>{def.branchWraith.note}</p>
          {unit.branchWraithIncluded && (
            <MagicItemPicker items={armyData.magicItems} selectedIds={unit.branchWraithSpriteIds || []} maxSlots={def.branchWraith.spriteSlots} usedElsewhere={usedElsewhere}
              categoryFilter={["sprite"]}
              context={{ regimentId: def.id, tags: ["spriteEligible"] }}
              onToggle={(id) => toggleArrayField(unit, "branchWraithSpriteIds", id, updateUnit)} />
          )}
        </div>
      )}

      {def.detachmentParent && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Detachments (max 2, combined ≤ {size} models)</span>
          {detachments.map((d, i) => {
            const dtype = (armyData.detachmentTypes || []).find((t) => t.id === d.defId);
            const cost = dtype ? dtype.perModel * d.size : 0;
            const under50 = cost < 50;
            const maxForThis = size - (detachmentSizeUsed - d.size);
            return (
              <div key={i} className="whr-card" style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-display-sc)", fontSize: 16.5 }}>{dtype ? dtype.name : "Unknown"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="whr-badge-gold whr-badge">{fmtPts(cost)} pts</span>
                    <button className="whr-btn-ghost" style={{ cursor: "pointer", color: "var(--burgundy)", fontFamily: "var(--font-display)" }}
                      onClick={() => updateUnit({ ...unit, detachments: detachments.filter((_, idx) => idx !== i) })}>✕</button>
                  </div>
                </div>
                <div style={{ marginTop: 6 }}>
                  <Stepper value={d.size} min={5} max={Math.max(5, maxForThis)} onChange={(v) => {
                    const next = detachments.map((dd, idx) => (idx === i ? { ...dd, size: v } : dd));
                    updateUnit({ ...unit, detachments: next });
                  }} />
                </div>
                {under50 && <div style={{ fontSize: 13, color: "var(--burgundy)", marginTop: 6 }}>Below the 50pt regiment minimum</div>}
              </div>
            );
          })}
          {detachments.length < 2 && detachmentSizeUsed < size && (
            <select className="whr-select" defaultValue="" onChange={(e) => {
              if (!e.target.value) return;
              const next = [...detachments, { defId: e.target.value, size: Math.min(5, size - detachmentSizeUsed) }];
              updateUnit({ ...unit, detachments: next });
              e.target.value = "";
            }}>
              <option value="">Add a detachment…</option>
              {(armyData.detachmentTypes || []).map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.perModel}pts/model)</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

function CrewArmourGroup({ def, unit, updateUnit }) {
  if (def.crewArmourFixed) {
    return (
      <div style={{ marginTop: 14 }}>
        <span className="whr-label">Crew Armour</span>
        <div className="whr-opt-row" style={{ opacity: 0.7 }}>
          <span>{def.crewArmourFixed}</span>
        </div>
      </div>
    );
  }
  if (def.crewArmourOptions && def.crewArmourOptions.length > 0) {
    const selectedId = unit.crewArmourId || def.crewArmourOptions[0].id;
    return (
      <div style={{ marginTop: 14 }}>
        <span className="whr-label">Crew Armour</span>
        {def.crewArmourOptions.map((o) => (
          <label key={o.id} className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name={`crewarmour-${unit.instanceId}`} checked={selectedId === o.id}
                onChange={() => updateUnit({ ...unit, crewArmourId: o.id })} />
              {o.label}
            </span>
            <span className="whr-opt-cost">{o.cost ? `+${o.cost}pts/model` : "free"}</span>
          </label>
        ))}
      </div>
    );
  }
  return null;
}

function ChariotDetail({ def, unit, roster, updateUnit, armyData }) {
  const usedElsewhere = allUsedMagicItemIds(roster, unit.instanceId);

  if (def.kind === "abomination") {
    const cu = unit.charUpgrades || {};
    const sr = unit.specialRules || {};
    const srCount = ABOM_SPECIAL_RULES.filter((r) => sr[r.id]).length;
    return (
      <div>
        <h3 className="whr-h1" style={{ fontSize: 21, margin: "0 0 2px" }}>{def.name}</h3>
        <span className="whr-badge-gold whr-badge">{fmtPts(chariotCost(unit, def, armyData))} pts</span>
        <NicknameField unit={unit} updateUnit={updateUnit} />
        <p style={{ fontSize: 15, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Characteristic upgrades (max 2 of each)</span>
          {ABOM_CHAR_UPGRADES.map((u) => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px dashed var(--line-soft)" }}>
              <span style={{ fontSize: 16 }}>{u.label} <span className="whr-opt-cost">({u.cost}pts each)</span></span>
              <Stepper value={cu[u.id] || 0} min={0} max={2} onChange={(v) => updateUnit({ ...unit, charUpgrades: { ...cu, [u.id]: v } })} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="whr-label" style={{ marginBottom: 0 }}>Special rules (max 3)</span>
            <span className="whr-opt-cost">{srCount} / 3</span>
          </div>
          {ABOM_SPECIAL_RULES.map((r) => {
            const checked = !!sr[r.id];
            const disabled = !checked && srCount >= 3;
            return (
              <label key={r.id} className={`whr-opt-row whr-opt-label ${disabled ? "whr-opt-disabled" : ""}`}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={checked} disabled={disabled}
                    onChange={(e) => updateUnit({ ...unit, specialRules: { ...sr, [r.id]: e.target.checked } })} />
                  {r.label}
                </span>
                <span className="whr-opt-cost">{r.cost >= 0 ? `+${r.cost}pts` : `${r.cost}pts`}</span>
              </label>
            );
          })}
        </div>
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Rider</span>
          {[["sorcererLord", "Ridden by a Sorcerer Lord (baseline)"], ["hero", "Ridden by a Chaos Hero (+28pts)"], ["lord", "Ridden by a Chaos Lord (+42pts)"], ["unridden", "Unridden (+25% of total)"]].map(([id, label]) => (
            <label key={id} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`rider-${unit.instanceId}`} checked={(unit.rider || "sorcererLord") === id} onChange={() => updateUnit({ ...unit, rider: id })} />
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (def.kind === "quantity") {
    return (
      <div>
        <h3 className="whr-h1" style={{ fontSize: 21, margin: "0 0 2px" }}>{def.name}</h3>
        <span className="whr-badge-gold whr-badge">{fmtPts(chariotCost(unit, def, armyData))} pts</span>
        <NicknameField unit={unit} updateUnit={updateUnit} />
        <p style={{ fontSize: 15, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
        {def.maxQty !== 1 && (
          <div style={{ marginTop: 14 }}>
            <span className="whr-label">Quantity ({def.perUnit}pts each)</span>
            <Stepper value={unit.qty || 1} min={1} onChange={(v) => updateUnit({ ...unit, qty: v })} />
          </div>
        )}
        {(def.variantOptions || []).length > 0 && (
          <div style={{ marginTop: 14 }}>
            <span className="whr-label">Variants</span>
            {def.variantOptions.map((o) => (
              <label key={o.id} className="whr-opt-row whr-opt-label">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={!!unit.variantSelections?.[o.id]}
                    onChange={(e) => updateUnit({ ...unit, variantSelections: { ...(unit.variantSelections || {}), [o.id]: e.target.checked } })} />
                  {o.label}
                </span>
                <span className="whr-opt-cost">{o.cost >= 0 ? `+${o.cost}pts` : `${o.cost}pts`}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (def.kind === "warmachine") {
    return (
      <div>
        <h3 className="whr-h1" style={{ fontSize: 21, margin: "0 0 2px" }}>{def.name}</h3>
        <span className="whr-badge-gold whr-badge">{fmtPts(chariotCost(unit, def, armyData))} pts</span>
        <NicknameField unit={unit} updateUnit={updateUnit} />
        <p style={{ fontSize: 15, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
        {def.extraCrewCost != null && (
          <div style={{ marginTop: 14 }}>
            <span className="whr-label">{def.extraCrewLabel || "Extra crew"} (max {def.extraCrewMax || 2}, +{def.extraCrewCost}pts/model)</span>
            <Stepper value={unit.extraCrew || 0} min={0} max={def.extraCrewMax || 2} onChange={(v) => updateUnit({ ...unit, extraCrew: v })} />
          </div>
        )}
        <CrewArmourGroup def={def} unit={unit} updateUnit={updateUnit} />
        {def.magicItemSlots > 0 && (() => {
          const runeItems = unit.runeItems || {};
          const runeSlotsUsed = Object.values(runeItems).filter((arr) => arr && arr.length > 0).length;
          const effFilter = def.magicItemCategoryFilter || NON_BANNER_CATEGORIES;
          const itemCtx = itemContext(def, unit, { regimentId: def.id });
          const namedCatOf = (id) => miById(armyData.magicItems, id)?.cat;
          const hasNamedOfCat = (cat) => (unit.extraMagicItemIds || []).some((id) => namedCatOf(id) === cat);
          return (
            <div style={{ marginTop: 14 }}>
              <MagicItemPickerWithBanner items={armyData.magicItems} selectedIds={unit.extraMagicItemIds || []} maxSlots={Math.max(0, def.magicItemSlots - runeSlotsUsed)} usedElsewhere={usedElsewhere}
                categoryFilter={effFilter}
                context={itemCtx}
                onToggle={(id) => {
                  const mi = miById(armyData.magicItems, id);
                  const already = (unit.extraMagicItemIds || []).includes(id);
                  const newIds = already ? (unit.extraMagicItemIds || []).filter((x) => x !== id) : [...(unit.extraMagicItemIds || []), id];
                  const newRuneItems = (!already && mi) ? { ...runeItems, [mi.cat]: [] } : runeItems;
                  updateUnit({ ...unit, extraMagicItemIds: newIds, runeItems: newRuneItems });
                }} />
              {armyData.runeForge && effFilter.includes("engineering") && (
                <RunesSection>
                  <RuneForge items={armyData.magicItems} cat="engineering" label="Forge an Engineering Rune" defId={def.id}
                    context={itemCtx} comboIds={runeItems.engineering} disabled={hasNamedOfCat("engineering")}
                    onChange={(ids) => updateUnit({ ...unit, runeItems: { ...runeItems, engineering: ids }, extraMagicItemIds: ids.length > 0 ? (unit.extraMagicItemIds || []).filter((id) => namedCatOf(id) !== "engineering") : unit.extraMagicItemIds })} />
                </RunesSection>
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div>
      <h3 className="whr-h1" style={{ fontSize: 21, margin: "0 0 2px" }}>{def.name}</h3>
      <span className="whr-badge-gold whr-badge">{fmtPts(chariotCost(unit, def, armyData))} pts</span>
      <NicknameField unit={unit} updateUnit={updateUnit} />
      <p style={{ fontSize: 15, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
      {def.extraCrewCost != null && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">{def.extraCrewLabel || "Extra crew"} (max 2, +{def.extraCrewCost}pts/model)</span>
          <Stepper value={unit.extraCrew || 0} min={0} max={2} onChange={(v) => updateUnit({ ...unit, extraCrew: v })} />
        </div>
      )}
      <CrewArmourGroup def={def} unit={unit} updateUnit={updateUnit} />
      {def.extraSteedCost != null && (
        <div style={{ marginTop: 10 }}>
          <span className="whr-label">{def.extraSteedLabel || "Extra steeds"} (max 2, +{def.extraSteedCost}pts/model, widens base)</span>
          <Stepper value={unit.extraSteeds || 0} min={0} max={2} onChange={(v) => updateUnit({ ...unit, extraSteeds: v })} />
        </div>
      )}
      {def.scythedWheelsCost != null && (
        <label className="whr-opt-row whr-opt-label" style={{ marginTop: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={!!unit.scythedWheels} onChange={(e) => updateUnit({ ...unit, scythedWheels: e.target.checked })} />
            Scythed wheels
          </span>
          <span className="whr-opt-cost">+{def.scythedWheelsCost}pts</span>
        </label>
      )}
      {(def.variantOptions || []).length > 0 && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">{def.variantGroupLabel || "Variants (choose at most one)"}</span>
          {def.variantOptions.map((o) => (
            <label key={o.id} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!unit.variantSelections?.[o.id]}
                  onChange={(e) => updateUnit({ ...unit, variantSelections: { ...(unit.variantSelections || {}), [o.id]: e.target.checked } })} />
                {o.label}
              </span>
              <span className="whr-opt-cost">+{o.cost}pts</span>
            </label>
          ))}
        </div>
      )}
      {def.commanderCost != null && (
        <label className="whr-opt-row whr-opt-label">
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={!!unit.commander} onChange={(e) => updateUnit({ ...unit, commander: e.target.checked, commanderMagicItemIds: e.target.checked ? unit.commanderMagicItemIds : [] })} />
            {def.commanderLabel || "One crewman is a Commander"}
          </span>
          <span className="whr-opt-cost">+{def.commanderCost}pts</span>
        </label>
      )}
      {unit.commander && def.commanderCost != null && (
        <MagicItemPicker items={armyData.magicItems} selectedIds={unit.commanderMagicItemIds || []} maxSlots={def.commanderMagicItemSlots} usedElsewhere={usedElsewhere}
          context={itemContext(def, unit, { regimentId: def.id, tags: def.commanderTags || [] })}
          onToggle={(id) => toggleArrayField(unit, "commanderMagicItemIds", id, updateUnit)} />
      )}
    </div>
  );
}

function SpecialDetail({ def, unit, roster, updateUnit, armyData }) {
  const usedElsewhere = allUsedMagicItemIds(roster, unit.instanceId);
  return (
    <div>
      <h3 className="whr-h1" style={{ fontSize: 21, margin: "0 0 2px" }}>{def.name}</h3>
      <div className="whr-badge" style={{ marginBottom: 6 }}>{def.role}</div>
      <div><span className="whr-badge-gold whr-badge">{fmtPts(specialCost(unit, def, armyData))} pts</span></div>
      {def.note && <p style={{ fontSize: 15, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>}
      {def.items && <p style={{ fontSize: 14.5, marginTop: 8, fontStyle: "italic", color: "var(--ink-soft)" }}>{def.items}</p>}

      {def.mounts && def.mounts.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Mount</span>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name={`mount-${unit.instanceId}`} checked={!unit.mountId} onChange={() => updateUnit({ ...unit, mountId: null })} />
              On foot / as described
            </span>
          </label>
          {def.mounts.map((m) => (
            <label key={m.id} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`mount-${unit.instanceId}`} checked={unit.mountId === m.id} onChange={() => updateUnit({ ...unit, mountId: m.id })} />
                {m.name}
              </span>
              <span className="whr-opt-cost">{m.cost > 0 ? `+${m.cost}pts` : "free"}</span>
            </label>
          ))}
        </div>
      )}

      {!def.mounts && def.mountOption && (
        <label className="whr-opt-row whr-opt-label" style={{ marginTop: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={!!unit.mounted} onChange={(e) => updateUnit({ ...unit, mounted: e.target.checked })} />
            {def.mountOption.name}
          </span>
          <span className="whr-opt-cost">{def.mountOption.cost > 0 ? `+${def.mountOption.cost}pts` : "free"}</span>
        </label>
      )}

      {def.extraMagicItemSlots > 0 && (
        <div style={{ marginTop: 14 }}>
          <MagicItemPicker items={armyData.magicItems} selectedIds={unit.extraMagicItemIds || []} maxSlots={def.extraMagicItemSlots} usedElsewhere={usedElsewhere}
            categoryFilter={def.magicItemCategoryFilter}
            context={itemContext(def, unit, { characterId: def.id, tags: def.tags || [] })}
            onToggle={(id) => toggleArrayField(unit, "extraMagicItemIds", id, updateUnit)} />
        </div>
      )}

      {def.extraSpriteSlots > 0 && (
        <div style={{ marginTop: 14 }}>
          <MagicItemPicker items={armyData.magicItems} selectedIds={unit.extraMagicItemIds || []} maxSlots={def.extraSpriteSlots} usedElsewhere={usedElsewhere}
            categoryFilter={["sprite"]}
            context={itemContext(def, unit, { characterId: def.id, tags: def.tags || [] })}
            onToggle={(id) => toggleArrayField(unit, "extraMagicItemIds", id, updateUnit)} />
        </div>
      )}
    </div>
  );
}

function DetailPanel({ armyData, roster, selectedId, updateUnit }) {
  const found = useMemo(() => {
    for (const u of roster.characters) if (u.instanceId === selectedId) return { u, kind: "character" };
    for (const u of roster.regiments) if (u.instanceId === selectedId) return { u, kind: "regiment" };
    for (const u of roster.chariots) if (u.instanceId === selectedId) return { u, kind: "chariot" };
    for (const u of roster.specials) if (u.instanceId === selectedId) return { u, kind: "special" };
    return null;
  }, [roster, selectedId]);

  if (!found) {
    return (
      <div className="whr-col" style={{ height: "100%", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--ink-faint)" }}>
        <p className="whr-eyebrow" style={{ color: "var(--ink-faint)" }}>Select a unit</p>
        <p className="whr-serif-italic">Its wargear, mounts and magic items will appear here.</p>
      </div>
    );
  }

  const { u, kind } = found;
  const update = (next) => updateUnit(kind, next);

  return (
    <div className="whr-scroll" style={{ height: "100%", overflowY: "auto", paddingRight: 4 }}>
      {kind === "character" && <CharacterDetail def={armyData.characters.find((c) => c.id === u.defId)} unit={u} roster={roster} updateUnit={update} armyData={armyData} />}
      {kind === "regiment" && <RegimentDetail def={regDefFor(u, armyData)} unit={u} roster={roster} updateUnit={update} armyData={armyDataFor(u, armyData)} />}
      {kind === "chariot" && <ChariotDetail def={armyData.chariotsMonsters.find((c) => c.id === u.defId)} unit={u} roster={roster} updateUnit={update} armyData={armyData} />}
      {kind === "special" && <SpecialDetail def={armyData.specialCharacters.find((s) => s.id === u.defId)} unit={u} roster={roster} updateUnit={update} armyData={armyData} />}
    </div>
  );
}

/* ============================================================================
   BUILDER SCREEN ROOT
   ========================================================================== */

function BuilderScreen({ roster, setRoster, onBack, onSave, saveState }) {
  const armyData = getArmyData(roster.factionKey);
  const [selectedId, setSelectedId] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(roster.name);

  function startRename() {
    setRenameValue(roster.name);
    setRenaming(true);
  }
  function confirmRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== roster.name) setRoster((r) => ({ ...r, name: trimmed }));
    setRenaming(false);
  }
  function cancelRename() {
    setRenameValue(roster.name);
    setRenaming(false);
  }

  const totalPoints = useMemo(() => {
    let t = 0;
    roster.characters.forEach((u) => (t += unitCost(u, armyData, roster)));
    roster.regiments.forEach((u) => (t += unitCost(u, armyData, roster)));
    roster.chariots.forEach((u) => (t += unitCost(u, armyData, roster)));
    roster.specials.forEach((u) => (t += unitCost(u, armyData, roster)));
    return t;
  }, [roster, armyData]);

  const regimentPoints = useMemo(() => {
    const bsbUnit = roster.characters.find((u) => {
      const d = armyData.characters.find((c) => c.id === u.defId);
      return d && (d.tags || []).includes("bsb");
    });
    const armyWideBannerOfChampions = !!bsbUnit && (bsbUnit.magicItemIds || []).includes("cm-bannerofchampions");
    let t = 0;
    roster.regiments.forEach((u) => {
      const d = armyData.regiments.find((r) => r.id === u.defId);
      let cost = unitCost(u, armyData, roster);
      if (d) {
        const champCost = regimentChampionCost(u, d, armyData);
        if (champCost > 0) {
          const eligible = championEligibleForBannerOfChampions(u, d, armyData);
          const bannerApplies = eligible && (u.magicBannerId === "cm-bannerofchampions" || armyWideBannerOfChampions);
          // Per the Banner of Champions rule, a champion's cost counts towards Characters/Monsters/
          // War Machines/Chariots by default — it only counts towards Regiments (as this app's own
          // regimentCost() always bakes it in) when that specific banner is in play for him.
          if (!bannerApplies) cost -= champCost;
        }
      }
      t += cost;
    });
    // the cheapest unit flagged countsAsFirstRegiment counts toward Regiments
    if (roster.chariots.length > 0) {
      const flaggedUnits = roster.chariots.filter((u) => {
        const d = armyData.chariotsMonsters.find((c) => c.id === u.defId);
        return d && d.countsAsFirstRegiment;
      });
      if (flaggedUnits.length > 0) {
        const costs = flaggedUnits.map((u) => unitCost(u, armyData, roster));
        t += Math.min(...costs);
      }
    }
    return t;
  }, [roster, armyData]);

  const loreWarnings = useMemo(() => {
    const warnings = [];
    if (!armyData.loreOptions || armyData.loreOptions.length === 0) return warnings;
    roster.characters.forEach((u) => {
      const d = armyData.characters.find((c) => c.id === u.defId);
      if (!d || !isWizard(d, u)) return;
      const lore = resolveWizardLore(armyData, u);
      if (armyData.loreOptions.length > 1 && !lore) {
        warnings.push(`${d.name}: Lore must be chosen for your Wizard.`);
        return;
      }
      (u.magicItemIds || []).forEach((id) => {
        const mi = miById(armyData.magicItems, id);
        if (mi && mi.requiresLore && mi.requiresLore !== lore) {
          warnings.push(`${d.name}: ${mi.name} requires ${mi.requiresLore} lore — bearer's lore is ${lore || "unset"}.`);
        }
      });
    });
    return warnings;
  }, [roster, armyData]);

  const auxiliaryWarnings = useMemo(() => {
    const warnings = [];
    if (!armyData.auxiliaryFactions) return warnings;
    const bySource = {};
    roster.regiments.forEach((u) => { if (u.sourceFaction) bySource[u.sourceFaction] = (bySource[u.sourceFaction] || 0) + 1; });
    const halflingCount = roster.regiments.filter((u) => !u.sourceFaction).length;
    const totalAux = Object.values(bySource).reduce((a, b) => a + b, 0);
    if ((bySource.empire || 0) > 0 && (bySource.woodElves || 0) > 0) {
      warnings.push("Wood Elf Auxiliaries cannot be taken with Empire troops.");
    }
    if (totalAux > Math.floor(halflingCount / 2)) {
      warnings.push("Only one Auxiliary unit can be taken per two regiments of Halflings.");
    }
    if (roster.regiments.some((u) => u.defId === "treemen-halfling") && !(bySource.woodElves > 0)) {
      warnings.push("Halfling Treemen require Wood Elf Auxiliaries in the army.");
    }
    return warnings;
  }, [roster, armyData]);

  const wargearWarnings = useMemo(() => {
    const warnings = [];
    roster.regiments.forEach((u) => {
      const d = armyData.regiments.find((r) => r.id === u.defId);
      const mx = d?.missileExclusiveGroups;
      if (!mx) return;
      const gearSelections = u.gearSelections || {};
      const hasMissile = !!gearSelections.missile;
      const hasOther = mx.some((g) => !!gearSelections[g]);
      if (hasMissile && hasOther) {
        warnings.push(`${u.customName ? `${u.customName} (${d.name})` : d.name} cannot take ranged weapons with other equipment.`);
      }
    });
    return warnings;
  }, [roster, armyData]);

  const knightWarnings = useMemo(() => {
    const warnings = [];
    const groups = {};
    roster.regiments.forEach((u) => {
      const d = armyData.regiments.find((x) => x.id === u.defId);
      if (d?.knightGroup) { groups[d.knightGroup] = groups[d.knightGroup] || []; groups[d.knightGroup].push(d); }
    });
    if (Object.keys(groups).length > 1) {
      Object.values(groups).forEach((defs) => {
        if (defs.length > 1) {
          const uniqueNames = [...new Set(defs.map((d) => d.name))];
          const desc = uniqueNames.length > 1 ? uniqueNames.join(" and ") : `two ${uniqueNames[0]}`;
          warnings.push(`Cannot take ${desc} unless they are the only Knightly Order taken.`);
        }
      });
    }
    return warnings;
  }, [roster, armyData]);

  const houseRuleWarnings = useMemo(() => {
    const warnings = [];
    roster.regiments.forEach((u) => {
      const d = armyData.regiments.find((r) => r.id === u.defId);
      if (d?.extraOption?.unofficial && u.extraOptionCount) {
        warnings.push(`${d.name}: ${d.extraOption.label} are unofficial — needs your opponent's consent to field.`);
      }
    });
    return warnings;
  }, [roster, armyData]);

  const runeWarnings = useMemo(() => {
    const warnings = [];
    if (!armyData.runeForge) return warnings;
    const combos = [];
    const collect = (u, label, regimentDefId) => {
      Object.values(u.runeItems || {}).forEach((ids) => {
        if (ids && ids.length > 0) combos.push({ label, ids: [...ids].sort(), regimentDefId });
      });
    };
    const collectChampion = (u, label) => {
      Object.values(u.championRuneItems || {}).forEach((ids) => {
        if (ids && ids.length > 0) combos.push({ label, ids: [...ids].sort() });
      });
    };
    roster.characters.forEach((u) => { const d = armyData.characters.find((c) => c.id === u.defId); if (d) collect(u, d.name); });
    roster.regiments.forEach((u) => {
      const d = armyData.regiments.find((r) => r.id === u.defId);
      if (!d) return;
      collect(u, d.name, u.defId);
      if (u.championIncluded && d.champion) collectChampion(u, `${d.name} (${d.champion.name})`);
      if (u.championOptionId && d.championOptions) {
        const opt = d.championOptions.find((o) => o.id === u.championOptionId);
        if (opt) collectChampion(u, `${d.name} (${opt.name})`);
      }
    });
    roster.chariots.forEach((u) => { const d = armyData.chariotsMonsters.find((c) => c.id === u.defId); if (d) collect(u, d.name); });
    for (let i = 0; i < combos.length; i++) {
      for (let j = i + 1; j < combos.length; j++) {
        if (combos[i].ids.join(",") === combos[j].ids.join(",")) {
          warnings.push(`${combos[i].label} and ${combos[j].label} carry the exact same rune combination.`);
        }
      }
    }
    const masterUseCount = {};
    combos.forEach((c) => c.ids.forEach((id) => {
      const mi = miById(armyData.magicItems, id);
      if (mi && mi.isMasterRune) { masterUseCount[id] = masterUseCount[id] || []; masterUseCount[id].push(c.label); }
    }));
    Object.entries(masterUseCount).forEach(([id, labels]) => {
      if (labels.length > 1) {
        const mi = miById(armyData.magicItems, id);
        warnings.push(`${mi.name} is carried by more than one item (${labels.join(", ")}) — a Master Rune may only be used once in the whole army.`);
      }
    });
    const regimentDefIds = new Set(roster.regiments.map((u) => u.defId));
    combos.forEach((c) => c.ids.forEach((id) => {
      const mi = miById(armyData.magicItems, id);
      if (!mi || !mi.requiresRegimentIds) return;
      // If we know exactly which regiment carries this (a regiment's own standard bearer), check
      // that regiment's own type directly. Otherwise (a character/BSB — we don't track which
      // regiment they've joined) fall back to an approximate "does the army have one anywhere" check.
      const eligible = c.regimentDefId
        ? mi.requiresRegimentIds.includes(c.regimentDefId)
        : mi.requiresRegimentIds.some((rid) => regimentDefIds.has(rid));
      if (!eligible) {
        warnings.push(`${c.label} carries ${mi.name}, but your army has no regiment of ${mi.requiresRegimentLabel || "the required type"}.`);
      }
    }));
    return warnings;
  }, [roster, armyData]);

  const endlessBannerWarnings = useMemo(() => {
    const warnings = [];
    roster.regiments.forEach((u) => {
      const mi = miById(armyData.magicItems, u.magicBannerId);
      if (!mi || !mi.regimentDiscount) return;
      const d = armyData.regiments.find((r) => r.id === u.defId);
      if (!d) return;
      const size = u.size || d.minSize;
      const minSize = mi.minRegimentSize || 0;
      if (minSize && size < minSize) {
        warnings.push(`${d.name}: ${mi.name} requires a regiment of at least ${minSize} models (currently ${size}) and can't be given to a regiment carrying missile weapons — please verify.`);
      }
    });
    return warnings;
  }, [roster, armyData]);

  const auxiliaryInfo = useMemo(() => {
    const totalRegiments = roster.regiments.length;
    const auxCount = roster.regiments.filter((u) => {
      const d = armyData.regiments.find((r) => r.id === u.defId);
      return d && d.auxiliary;
    }).length;
    const hasAuxiliaryOption = armyData.regiments.some((r) => r.auxiliary);
    return { totalRegiments, auxCount, allowed: Math.ceil(totalRegiments / 2), hasAuxiliaryOption };
  }, [roster, armyData]);

  const contingentInfo = useMemo(() => {
    const rules = armyData.contingentRules;
    if (!rules) return null;
    const charUnits = roster.characters.filter((u) => {
      const d = armyData.characters.find((c) => c.id === u.defId);
      return d && d.contingentTag === rules.tag;
    });
    const regUnits = roster.regiments.filter((u) => {
      const d = armyData.regiments.find((r) => r.id === u.defId);
      return d && d.contingentTag === rules.tag;
    });
    if (charUnits.length === 0 && regUnits.length === 0) return { active: false };
    const charCost = charUnits.reduce((s, u) => s + unitCost(u, armyData, roster), 0);
    const regCost = regUnits.reduce((s, u) => s + unitCost(u, armyData, roster), 0);
    const contingentCost = charCost + regCost;
    const pctOfArmy = totalPoints > 0 ? (contingentCost / totalPoints) * 100 : 0;
    const problems = [];
    if (rules.minRegiments && regUnits.length < rules.minRegiments) problems.push(`needs at least ${rules.minRegiments} ${rules.label} regiment${rules.minRegiments > 1 ? "s" : ""} (has ${regUnits.length})`);
    if (rules.minCharacters && charUnits.length < rules.minCharacters) problems.push(`needs at least ${rules.minCharacters} ${rules.label} character${rules.minCharacters > 1 ? "s" : ""} (has ${charUnits.length})`);
    if (rules.charactersCostCappedByRegiments && charCost > regCost) problems.push(`character cost (${fmtPts(charCost)}pts) exceeds regiment cost (${fmtPts(regCost)}pts)`);
    if (rules.maxPercentOfArmy && pctOfArmy > rules.maxPercentOfArmy) problems.push(`${fmtPts(contingentCost)}pts is ${pctOfArmy.toFixed(0)}% of the army, over the ${rules.maxPercentOfArmy}% cap`);
    return { active: true, label: rules.label, regimentCount: regUnits.length, characterCount: charUnits.length, charCost, regCost, contingentCost, pctOfArmy, problems };
  }, [roster, armyData, totalPoints]);

  const themeGateWarning = useMemo(() => {
    const gate = armyData.themeGates?.find((g) => g.themeId === (roster.armyTheme || armyData.themes?.default));
    if (!gate) return null;
    if (gate.minPoints && roster.pointLimit < gate.minPoints) return `${gate.label} requires an army of at least ${gate.minPoints}pts (this roster is set to ${roster.pointLimit}pts).`;
    return null;
  }, [armyData, roster.armyTheme, roster.pointLimit]);

  const compositionInfo = useMemo(() => {
    const rules = armyData.compositionRules;
    if (!rules || rules.length === 0) return null;
    const DEF_LIST = { characters: "characters", regiments: "regiments", chariots: "chariotsMonsters", specials: "specialCharacters" };
    const matchesRef = (u, ref) => {
      if (ref.id) return u.defId === ref.id;
      if (ref.tag) {
        const d = (armyData[DEF_LIST[ref.list]] || []).find((x) => x.id === u.defId);
        return !!(d && (d.tags || []).includes(ref.tag));
      }
      return false;
    };
    const countRefs = (refs) => refs.reduce((n, ref) => n + (roster[ref.list] || []).filter((u) => matchesRef(u, ref)).length, 0);
    const rosterEmpty = roster.characters.length === 0 && roster.regiments.length === 0 && roster.chariots.length === 0 && roster.specials.length === 0;
    const problems = [];
    rules.forEach((rule) => {
      if (rule.kind === "mutualExclusion") {
        const present = rule.refs.filter((ref) => countRefs([ref]) > 0);
        if (present.length > 1) problems.push(`${present.map((p) => p.name).join(", ")} can't be fielded together.`);
      } else if (rule.kind === "ratio") {
        const numCount = countRefs(rule.numerator);
        const denCount = countRefs(rule.denominator);
        const allowed = Math.floor(denCount * rule.maxRatio);
        if (numCount > allowed) problems.push(`${numCount} ${rule.label} regiments, but only ${allowed} allowed (max ${rule.maxRatio}x the ${denCount} ${rule.denominator.map((d) => d.name).join("/")}).`);
      } else if (rule.kind === "requiresAtLeastOne" && !rosterEmpty) {
        if (countRefs(rule.refs) === 0) problems.push(`${rule.label}: needs at least one of ${rule.refs.map((r) => r.name).join(", ")}.`);
      } else if (rule.kind === "requiresIfPresent") {
        if (countRefs(rule.trigger) > 0 && countRefs(rule.requires) === 0) problems.push(`${rule.label} requires ${rule.requires.map((r) => r.name).join(" or ")} in the army.`);
      }
    });
    return problems.length > 0 ? { problems } : null;
  }, [roster, armyData]);

  function addUnit(kind, defId, sourceFaction) {
    let inst;
    if (kind === "character") {
      inst = { instanceId: uid("char"), kind: "character", defId, mountId: null, bow: false, missile: null, experimentalMissile: null, magicItemIds: [] };
      setRoster((r) => ({ ...r, characters: [...r.characters, inst] }));
    } else if (kind === "regiment") {
      const srcArmyData = sourceFaction ? FACTIONS[sourceFaction] : armyData;
      const def = srcArmyData.regiments.find((x) => x.id === defId);
      if (def.kind === "composite") {
        inst = { instanceId: uid("reg"), kind: "regiment", defId, composition: {}, sourceFaction: sourceFaction || undefined };
      } else {
        inst = { instanceId: uid("reg"), kind: "regiment", defId, size: def.minSize, gearSelections: {}, standard: def.command === "standard" || def.command === "special", magicBannerId: null, championIncluded: false, championMagicItemIds: [], branchWraithIncluded: false, branchWraithSpriteIds: [], detachments: [], sourceFaction: sourceFaction || undefined };
      }
      setRoster((r) => ({ ...r, regiments: [...r.regiments, inst] }));
    } else if (kind === "chariot") {
      const def = armyData.chariotsMonsters.find((x) => x.id === defId);
      if (def.kind === "quantity") inst = { instanceId: uid("cm"), kind: "chariot", defId, qty: 1, variantSelections: {} };
      else if (def.kind === "warmachine") inst = { instanceId: uid("cm"), kind: "chariot", defId, extraCrew: 0, extraMagicItemIds: [] };
      else if (def.kind === "abomination") inst = { instanceId: uid("cm"), kind: "chariot", defId, charUpgrades: {}, specialRules: {}, rider: "sorcererLord" };
      else inst = { instanceId: uid("cm"), kind: "chariot", defId, extraCrew: 0, extraSteeds: 0, commander: false, commanderMagicItemIds: [], scythedWheels: false, variantSelections: {} };
      setRoster((r) => ({ ...r, chariots: [...r.chariots, inst] }));
    } else if (kind === "special") {
      inst = { instanceId: uid("sp"), kind: "special", defId, mounted: false, mountId: null, extraMagicItemIds: [] };
      setRoster((r) => ({ ...r, specials: [...r.specials, inst] }));
    }
    setSelectedId(inst.instanceId);
  }

  function setArmyTheme(themeId) {
    const powerMismatch = (def) => {
      if (!def || !themeId || themeId === "Mixed") return false;
      if (def.markGroup) return !def.markGroup.options.includes(themeId);
      if (def.impliedMark) return def.impliedMark !== themeId;
      return false;
    };
    const keep = (list, defs) => list.filter((u) => {
      const def = defs.find((d) => d.id === u.defId);
      if (!def) return true;
      if (def.theme && def.theme !== themeId) return false;
      if (powerMismatch(def)) return false;
      return true;
    });
    const stripThemedGear = (list, defs) => list.map((u) => {
      const def = defs.find((d) => d.id === u.defId);
      const themedOptions = (def?.options || []).filter((o) => o.theme && o.theme !== themeId);
      if (themedOptions.length === 0 || !u.gearSelections) return u;
      const gearSelections = { ...u.gearSelections };
      themedOptions.forEach((o) => {
        if (o.group) { if (gearSelections[o.group] === o.id) delete gearSelections[o.group]; }
        else delete gearSelections[o.id];
      });
      return { ...u, gearSelections };
    });
    const clampRegimentChampionMarks = (list, defs) => list.map((u) => {
      const def = defs.find((d) => d.id === u.defId);
      const champ = def?.champion;
      if (!champ?.markGroup || !themeId || themeId === "Mixed" || !champ.markGroup.options.includes(themeId)) return u;
      if (u.championMark === themeId) return u;
      const context = itemContext(champ, u, { regimentId: def.id, mark: themeId, tags: [...(champ.tags || []), themeId] });
      const filteredItems = (u.championMagicItemIds || []).filter((id) => {
        const mi = miById(armyData.magicItems, id);
        return mi ? isItemAllowed(mi, context) : true;
      });
      return { ...u, championMark: themeId, championMagicItemIds: filteredItems };
    });
    const clampCharacters = (list, defs) => list.map((u) => {
      const rawDef = defs.find((d) => d.id === u.defId);
      if (!rawDef) return u;
      let next = u;
      if (next.mountId) {
        const mountDef = (rawDef.mounts || []).find((m) => m.id === next.mountId);
        if (mountDef?.theme && mountDef.theme !== themeId) next = { ...next, mountId: null };
      }
      if (rawDef.markGroup && themeId && themeId !== "Mixed" && rawDef.markGroup.options.includes(themeId) && next.mark !== themeId) {
        next = { ...next, mark: themeId };
        const lockedMountDef = (rawDef.mounts || []).find((m) => m.id === next.mountId);
        if (lockedMountDef?.requiresMark && lockedMountDef.requiresMark !== themeId) next = { ...next, mountId: null };
        const lockContext = itemContext(rawDef, next, { characterId: rawDef.id, mark: themeId, tags: [...(rawDef.tags || []), themeId] });
        const lockFiltered = (next.magicItemIds || []).filter((id) => {
          const mi = miById(armyData.magicItems, id);
          return mi ? isItemAllowed(mi, lockContext) : true;
        });
        if (lockFiltered.length !== (next.magicItemIds || []).length) next = { ...next, magicItemIds: lockFiltered };
      }
      if (!rawDef.bloodlineOverrides) return next;
      const def = applyBloodline(rawDef, themeId);
      if (def.magicLevelOption) {
        const min = def.magicLevelOption.min || 0;
        const max = def.magicLevelOption.max;
        const clamped = Math.max(min, Math.min(max, next.magicLevel ?? min));
        if (clamped !== next.magicLevel) next = { ...next, magicLevel: clamped };
      }
      const context = itemContext(def, next, { characterId: def.id, tags: [...(def.tags || []), themeId] });
      const filteredItems = (next.magicItemIds || []).filter((id) => {
        const mi = miById(armyData.magicItems, id);
        return mi ? isItemAllowed(mi, context) : true;
      });
      if (filteredItems.length !== (next.magicItemIds || []).length) next = { ...next, magicItemIds: filteredItems };
      if (!def.bloodlinePowerSlots) {
        if (next.bloodlinePowerIds?.length) next = { ...next, bloodlinePowerIds: [] };
      } else {
        const filteredPowers = (next.bloodlinePowerIds || []).filter((id) => {
          const mi = miById(armyData.magicItems, id);
          return mi ? isItemAllowed(mi, context) : true;
        });
        if (filteredPowers.length !== (next.bloodlinePowerIds || []).length) next = { ...next, bloodlinePowerIds: filteredPowers };
      }
      return next;
    });
    const isRemoved = (list, defs) => {
      const u = list.find((x) => x.instanceId === selectedId);
      if (!u) return false;
      const def = defs.find((d) => d.id === u.defId);
      return !!(def && ((def.theme && def.theme !== themeId) || powerMismatch(def)));
    };
    if (selectedId && (
      isRemoved(roster.characters, armyData.characters) ||
      isRemoved(roster.regiments, armyData.regiments) ||
      isRemoved(roster.chariots, armyData.chariotsMonsters) ||
      isRemoved(roster.specials, armyData.specialCharacters)
    )) {
      setSelectedId(null);
    }
    setRoster((r) => ({
      ...r,
      armyTheme: themeId,
      characters: clampCharacters(keep(r.characters, armyData.characters), armyData.characters),
      regiments: clampRegimentChampionMarks(stripThemedGear(keep(r.regiments, armyData.regiments), armyData.regiments), armyData.regiments),
      chariots: keep(r.chariots, armyData.chariotsMonsters),
      specials: keep(r.specials, armyData.specialCharacters),
    }));
  }

  function removeUnit(instanceId) {
    setRoster((r) => ({
      ...r,
      characters: r.characters.filter((u) => u.instanceId !== instanceId),
      regiments: r.regiments.filter((u) => u.instanceId !== instanceId),
      chariots: r.chariots.filter((u) => u.instanceId !== instanceId),
      specials: r.specials.filter((u) => u.instanceId !== instanceId),
    }));
    if (selectedId === instanceId) setSelectedId(null);
  }

  function updateUnit(kind, next) {
    const key = kind === "character" ? "characters" : kind === "regiment" ? "regiments" : kind === "chariot" ? "chariots" : "specials";
    setRoster((r) => ({ ...r, [key]: r[key].map((u) => (u.instanceId === next.instanceId ? next : u)) }));
  }

  return (
    <>
    <div className="whr-content whr-print-hide" style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="whr-btn whr-btn-sm" onClick={onBack}>← Barracks</button>
          <div>
            <h1 className="whr-h1" style={{ fontSize: 24, margin: 0 }}>{roster.name}</h1>
            <p className="whr-serif-italic" style={{ margin: 0, fontSize: 14 }}>{roster.pointLimit} points · {armyData.name}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>{saveState}</span>
          <button className="whr-btn whr-btn-stack" onClick={() => window.open("https://forms.gle/zrKUfgxMCgqeiMiA8", "_blank", "noopener,noreferrer")}>
            <span>Bug report</span>
            <span>/ feedback</span>
          </button>
          {renaming ? (
            <input className="whr-input" autoFocus value={renameValue} style={{ width: 180 }}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") cancelRename(); }}
              onBlur={confirmRename} />
          ) : (
            <button className="whr-btn" onClick={startRename}>Rename</button>
          )}
          <button className="whr-btn" onClick={() => window.print()}>Export List</button>
          <button className="whr-btn whr-btn-gold" onClick={onSave}>Save Roster</button>
        </div>
      </div>

      <div className="whr-builder-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr 340px", gap: 18, flex: 1, minHeight: 0 }}>
        <div className="whr-panel whr-builder-col" style={{ padding: 14, minHeight: 0 }}>
          <Sidebar armyData={armyData} roster={roster} onAdd={addUnit} onSetTheme={setArmyTheme} />
        </div>
        <div className="whr-panel whr-builder-col" style={{ padding: 18, minHeight: 0 }}>
          <RosterPanel armyData={armyData} roster={roster} totalPoints={totalPoints} pointLimit={roster.pointLimit}
            regimentPoints={regimentPoints} auxiliaryInfo={auxiliaryInfo} contingentInfo={contingentInfo} compositionInfo={compositionInfo} themeGateWarning={themeGateWarning} endlessBannerWarnings={endlessBannerWarnings} loreWarnings={loreWarnings} runeWarnings={runeWarnings} houseRuleWarnings={houseRuleWarnings} knightWarnings={knightWarnings} wargearWarnings={wargearWarnings} auxiliaryWarnings={auxiliaryWarnings} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeUnit} />
        </div>
        <div className="whr-panel whr-builder-col" style={{ padding: 18, minHeight: 0 }}>
          <DetailPanel armyData={armyData} roster={roster} selectedId={selectedId} updateUnit={updateUnit} />
        </div>
      </div>
    </div>
    <PrintableRoster armyData={armyData} roster={roster} totalPoints={totalPoints} regimentPoints={regimentPoints} />
    </>
  );
}

/* ============================================================================
   APP ROOT
   ========================================================================== */

const INDEX_KEY = "roster-index";

function emptyRosterUnits() {
  return { characters: [], regiments: [], chariots: [], specials: [] };
}

export default function App() {
  const [view, setView] = useState("setup"); // setup | builder
  const [roster, setRoster] = useState(null);
  const [savedList, setSavedList] = useState([]);
  const [storageError, setStorageError] = useState(false);
  const [saveState, setSaveState] = useState("");

  const refreshIndex = useCallback(async () => {
    try {
      const res = await storage.get(INDEX_KEY);
      const list = res ? JSON.parse(res.value) : [];
      setSavedList(list);
      setStorageError(false);
    } catch (e) {
      setSavedList([]);
    }
  }, []);

  useEffect(() => { refreshIndex(); }, [refreshIndex]);

  function handleMuster({ name, pointLimit, factionKey }) {
    const armyTheme = getArmyData(factionKey)?.themes?.default || null;
    const newRoster = { id: uid("roster"), name, pointLimit, factionKey, armyTheme, ...emptyRosterUnits() };
    setRoster(newRoster);
    setView("builder");
  }

  async function handleLoad(id) {
    try {
      const res = await storage.get(`roster:${id}`);
      if (res) {
        setRoster(JSON.parse(res.value));
        setView("builder");
      }
    } catch (e) {
      setStorageError(true);
    }
  }

  async function handleDelete(id) {
    try {
      await storage.delete(`roster:${id}`);
      const next = savedList.filter((r) => r.id !== id);
      setSavedList(next);
      await storage.set(INDEX_KEY, JSON.stringify(next));
    } catch (e) {
      setStorageError(true);
    }
  }

  async function handleSave() {
    if (!roster) return;
    setSaveState("Saving…");
    try {
      const armyData = getArmyData(roster.factionKey);
      let totalPoints = 0;
      roster.characters.forEach((u) => (totalPoints += unitCost(u, armyData, roster)));
      roster.regiments.forEach((u) => (totalPoints += unitCost(u, armyData, roster)));
      roster.chariots.forEach((u) => (totalPoints += unitCost(u, armyData, roster)));
      roster.specials.forEach((u) => (totalPoints += unitCost(u, armyData, roster)));

      await storage.set(`roster:${roster.id}`, JSON.stringify(roster));
      const summary = { id: roster.id, name: roster.name, pointLimit: roster.pointLimit, factionKey: roster.factionKey, totalPoints: fmtPts(totalPoints) };
      const nextIndex = [summary, ...savedList.filter((r) => r.id !== roster.id)];
      await storage.set(INDEX_KEY, JSON.stringify(nextIndex));
      setSavedList(nextIndex);
      setSaveState("Saved just now");
      setTimeout(() => setSaveState(""), 2500);
    } catch (e) {
      setSaveState("Couldn't save — try again");
    }
  }

  return (
    <div className="whr-root">
      <style>{CSS}</style>
      <ParchmentGrain />
      <div className="whr-vignette" />
      {view === "setup" && (
        <SetupScreen onMuster={handleMuster} savedList={savedList} onLoad={handleLoad} onDelete={handleDelete} storageError={storageError} />
      )}
      {view === "builder" && roster && (
        <BuilderScreen roster={roster} setRoster={setRoster} onBack={() => setView("setup")} onSave={handleSave} saveState={saveState} />
      )}
    </div>
  );
}
