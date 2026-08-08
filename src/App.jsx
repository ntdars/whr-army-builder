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
  font-size: 16px;
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
  font-size: 13px; color: var(--gold);
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
  text-transform: uppercase; font-size: 14px; cursor: pointer;
  border: 1px solid var(--line); background: var(--paper-2); color: var(--ink);
  padding: 10px 18px; transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
  border-radius: 2px;
}
.whr-btn:hover:not(:disabled) { background: var(--paper-3); border-color: var(--gold); }
.whr-btn:active:not(:disabled) { transform: translateY(1px); }
.whr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.whr-btn-primary { background: var(--forest); border-color: var(--forest-dark); color: var(--paper); }
.whr-btn-primary:hover:not(:disabled) { background: var(--forest-dark); }
.whr-btn-gold { background: var(--gold); border-color: var(--gold-bright); color: var(--paper); }
.whr-btn-gold:hover:not(:disabled) { background: #86620F; }
.whr-btn-danger { background: transparent; border-color: var(--burgundy); color: var(--burgundy); }
.whr-btn-danger:hover:not(:disabled) { background: var(--burgundy-pale); }
.whr-btn-ghost { background: transparent; border-color: transparent; padding: 6px 10px; }
.whr-btn-ghost:hover:not(:disabled) { background: var(--paper-2); }
.whr-btn-sm { padding: 5px 10px; font-size: 11px; }
.whr-btn-block { width: 100%; text-align: center; }

/* ---------- inputs ---------- */
.whr-input, .whr-select {
  font-family: var(--font-body); font-size: 15px; color: var(--ink);
  background: var(--paper); border: 1px solid var(--line);
  padding: 9px 12px; width: 100%; border-radius: 2px;
}
.whr-input::placeholder { color: var(--ink-faint); font-style: italic; }
.whr-input:focus, .whr-select:focus, .whr-btn:focus-visible {
  outline: 2px solid var(--gold-bright); outline-offset: 1px;
}
.whr-label {
  font-family: var(--font-display-sc); font-size: 13px; font-weight: 400;
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
.whr-stat-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.whr-stat-table th, .whr-stat-table td {
  border: 1px solid var(--line-soft); padding: 4px 6px; text-align: center;
}
.whr-stat-table th {
  font-family: var(--font-display-sc); font-weight: 400; font-size: 12.5px;
  letter-spacing: 0.03em; color: var(--forest-dark); background: var(--forest-pale);
}
.whr-stat-table td:first-child, .whr-stat-table th:first-child { text-align: left; font-weight: 600; }

/* ---------- scrollbar-safe columns ---------- */
.whr-col { min-height: 0; display: flex; flex-direction: column; }

/* ---------- pill / badge ---------- */
.whr-badge {
  display: inline-block; font-family: var(--font-display-sc); font-size: 12.5px;
  font-weight: 400; letter-spacing: 0.04em; padding: 2px 8px; border-radius: 10px;
  background: var(--forest-pale); color: var(--forest-dark); border: 1px solid var(--forest);
}
.whr-badge-gold { background: #F3E4BC; color: var(--gold); border-color: var(--gold); }
.whr-badge-burgundy { background: var(--burgundy-pale); color: var(--burgundy); border-color: var(--burgundy); }

/* ---------- checkbox / radio rows ---------- */
.whr-opt-row {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 7px 0; border-bottom: 1px dashed var(--line-soft); font-size: 15px;
  font-family: var(--font-display-sc); letter-spacing: 0.02em;
}
.whr-opt-row:last-child { border-bottom: none; }
.whr-opt-label { display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; }
.whr-opt-label input { accent-color: var(--forest); width: 15px; height: 15px; cursor: pointer; }
.whr-opt-cost { color: var(--ink-soft); font-size: 13px; white-space: nowrap; }
.whr-opt-disabled { opacity: 0.42; }
.whr-opt-disabled input { cursor: not-allowed; }

/* ---------- stepper ---------- */
.whr-stepper { display: flex; align-items: center; gap: 0; border: 1px solid var(--line); width: fit-content; }
.whr-stepper button {
  width: 30px; height: 30px; background: var(--paper-2); border: none; cursor: pointer;
  font-family: var(--font-display); font-weight: 700; color: var(--ink); font-size: 15px;
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
};
const STAT_ROW_ORDER = ["M", "WS", "BS", "S", "T", "W", "I", "A", "Ld"];

/* ============================================================================
   MAGIC ITEMS
   ========================================================================== */

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
  { id: "sp-luminescents", name: "A Resplendence of Luminescents", cost: 10, cat: "sprite", desc: "All attacks by bearer & regiment count as magical." },
  { id: "sp-spites", name: "A Murder of Spites", cost: 20, cat: "sprite", desc: "1D6 S3 hits vs an enemy unit within 12\" in the shooting phase." },
  { id: "sp-malevolents", name: "A Muster of Malevolents", cost: 30, cat: "sprite", desc: "1D6 S4 hits vs a melee opponent, in addition to normal attacks." },
  { id: "sp-radiants", name: "A Cluster of Radiants", cost: 40, cat: "sprite", desc: "Natural dispel 3+." },
  { id: "sp-netlings", name: "An Annoyance of Netlings", cost: 50, cat: "sprite", desc: "In a challenge, bearer can only be hit on natural 6s." },
  { id: "sp-despairs", name: "A Lamentation of Despairs", cost: 60, cat: "sprite", desc: "Bound spell, one use. One model anywhere tests LD or suffers 1D6 wounds, no save, no LoS required." },
];
const MI_CATEGORY_LABEL = { weapon: "Magic Weapons", armour: "Magic Armour", enchanted: "Enchanted Items", arcane: "Arcane Items", banner: "Magic Banners", sprite: "Sprites", familiar: "Familiars", reward: "Chaos Rewards", daemonicreward: "Daemonic Rewards", chaosbanner: "Chaos Banners", engineering: "Engineering Runes", virtue: "Knightly Virtues" };
const miById = (magicItems, id) => (magicItems || []).find((m) => m.id === id);

/* ============================================================================
   WOOD ELVES DATA
   ========================================================================== */

const WOOD_ELVES = {
  key: "woodElves",
  name: "Wood Elves",
  tagline: "Guerrilla warfare from the deep groves of the Old World",
  magicItems: WOOD_ELVES_MAGIC_ITEMS,
  armyWideRules: [
    "Before deployment, Wood Elves may place a small forest (6\" diameter) which must lie within or touch the Wood Elf deployment zone.",
    "Wood Elf Longbows may fire 36\" and have the armour piercing rule (-1 to armour save).",
    "All Wood Elves (including cavalry but not chariots) can move through woods without suffering movement penalties. This also applies to Treemen, Dryads and the Green Dragon.",
  ],
  characters: [
    {
      id: "warlord", name: "Wood Elf Warlord", cost: 124, stat: "Wood Elf Warlord", magicItemSlots: 3,
      gearNote: "May take a shield and light armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon", "Lance"] },
      bowOption: { label: "Bow or Wood Elf Longbow", cost: 10 },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 27, stat: "Elven Steed" },
        { id: "warhawk", name: "Giant Warhawk", cost: 51, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 69, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 181, stat: "Griffon" },
        { id: "dragon", name: "Green Dragon", cost: 321, stat: "Green Dragon" },
      ],
    },
    {
      id: "hero", name: "Wood Elf Hero", cost: 74, stat: "Wood Elf Hero", magicItemSlots: 2,
      gearNote: "May take a shield and light armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon", "Lance"] },
      bowOption: { label: "Bow or Wood Elf Longbow", cost: 10 },
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 20, stat: "Elven Steed" },
        { id: "warhawk", name: "Giant Warhawk", cost: 44, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 52, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 174, stat: "Griffon" },
        { id: "dragon", name: "Green Dragon", cost: 314, stat: "Green Dragon" },
      ],
    },
    {
      id: "wardancerhero", name: "War Dancer Hero", cost: 94, stat: "War Dancer Hero", magicItemSlots: 2,
      gearNote: "Must either walk alone or join a Wood Elf War Dancers regiment. Carries an additional hand weapon.",
      meleeGroup: { label: "Weapon (free)", options: ["Additional hand weapon (default)", "Shield (ward save improves to 5+)"] },
      mounts: [],
    },
    {
      id: "bsb", name: "Wood Elf Battle Standard Bearer", cost: 88, stat: "Wood Elf BSB", magicItemSlots: 1,
      gearNote: "May take light armour for free. The one magic item may be a magic banner.",
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 13, stat: "Elven Steed" },
      ],
    },
    {
      id: "magelord", name: "Mage Lord (level 4)", cost: 264, stat: "Mage Lord", magicItemSlots: 4,
      gearNote: "May take College Magic or High Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "warhawk", name: "Giant Warhawk", cost: 30, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
        { id: "griffon", name: "Griffon", cost: 160, stat: "Griffon" },
        { id: "dragon", name: "Green Dragon", cost: 300, stat: "Green Dragon" },
      ],
    },
    {
      id: "mastermage", name: "Master Mage (level 3)", cost: 186, stat: "Master Mage", magicItemSlots: 3,
      gearNote: "May take College Magic or High Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "warhawk", name: "Giant Warhawk", cost: 30, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "magechampion", name: "Mage Champion (level 2)", cost: 122, stat: "Mage Champion", magicItemSlots: 2,
      gearNote: "May take College Magic or High Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "warhawk", name: "Giant Warhawk", cost: 30, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "mage", name: "Mage (level 1)", cost: 58, stat: "Mage", magicItemSlots: 1,
      gearNote: "May take College Magic or High Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "warhawk", name: "Giant Warhawk", cost: 30, stat: "Giant Warhawk" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "shapechanger", name: "Shape Changer", cost: 80, stat: "Shape Changer (beast form)", magicItemSlots: 0,
      gearNote: "Hides in a rank-and-file infantry regiment until unleashed. Causes fear in beast form. Can never be the general.",
      mounts: [],
    },
  ],
  regiments: [
    {
      id: "archers", name: "Wood Elf Archers", perModel: 10, minSize: 5, stat: "Wood Elf Warriors",
      command: "standard", note: "Warriors with Wood Elf Longbows.",
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "warriors", name: "Wood Elf Warriors", perModel: 7, minSize: 5, stat: "Wood Elf Warriors",
      command: "standard", note: "Warriors with shields.",
      options: [
        { id: "spear", group: "melee", label: "Spears (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons instead of shield (free)", cost: 0, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons instead of shield (+2pt/model)", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "wardancers", name: "Wood Elf War Dancers", perModel: 18, minSize: 5, stat: "Wood Elf War Dancers",
      command: "special",
      note: "Shields give ward save 5+ instead of 6+. Immune to psychology, natural dispel 4+, ignore skirmish penalties, always may march. Each combat round choose a War Dance: Whirling Death (+1A), Woven Mist (enemies -1 to hit), The Shadows Coil (draw, no blows either way, needs 5+ models), or Storm of Blades (focus fire one model).",
      options: [
        { id: "ahw", group: null, label: "Swap shields for additional hand weapons (+4pt/model)", cost: 4, per: "model" },
      ],
      champion: { name: "War Dancer Champion", baseCost: 30, magicItemSlots: 1, stat: "War Dancer Champion" },
    },
    {
      id: "waywatchers", name: "Wood Elf Way Watchers", perModel: 18, minSize: 5, stat: "Wood Elf Scouts & Way Watchers",
      restriction: "0-1", command: "skirmisher",
      note: "May scout. Must skirmish. May hide in woods (enemies need 4+ to target); triggers 1D6 trap effect if a wood they occupy is entered.",
      options: [
        { id: "ahw", group: null, label: "Additional hand weapons (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "dryads", name: "Dryads", perModel: 20, minSize: 5, stat: "Dryads",
      command: "none",
      note: "Cause fear, immune to psychology, 5+ natural armour save. Cannot take a standard bearer; counts as having a musician (they sing). Each combat round choose an Aspect: Birch (+1A), Oak (+1S/+1T), or Willow (each enemy in base contact forfeits one attack). May only be joined by a Branch Wraith.",
      branchWraith: { name: "Branch Wraith", cost: 70, note: "Regimental champion & level 1 wizard (Jade or Amber magic). May not take a magic item, but may take one Sprite.", spriteSlots: 1 },
    },
    {
      id: "warhawkriders", name: "Wood Elf Warhawk Riders", perModel: 32, minSize: 5, stat: "Wood Elf Warriors", mountStat: "Giant Warhawk", mountLabel: "Giant Warhawk",
      restriction: "0-1", command: "skirmisher",
      note: "Warriors riding Giant Warhawks — skirmishing monstrous cavalry.",
      options: [
        { id: "bow", group: "missile", label: "Bows (+2pt/model)", cost: 2, per: "model" },
        { id: "longbow", group: "missile", label: "Wood Elf Longbows (+3pt/model)", cost: 3, per: "model" },
        { id: "spear", group: null, label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "shield", group: null, label: "Shields (+1.5pt/model)", cost: 1.5, per: "model" },
        { id: "armour", group: null, label: "Light armour (+1.5pt/model)", cost: 1.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "scouts", name: "Wood Elf Scouts", perModel: 14, minSize: 5, stat: "Wood Elf Scouts & Way Watchers",
      command: "standard", note: "Scouts with Wood Elf Longbows. May scout. May skirmish.",
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "lords", name: "Wood Elf Lords", perModel: 20, minSize: 5, stat: "Wood Elf Lords", mountStat: "Elven Steed", mountLabel: "Elven Steed",
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
        { id: "shield", group: null, label: "Shields (+2pt/model)", cost: 2, per: "model" },
        { id: "longbow", group: null, label: "Upgrade bows to Wood Elf Longbows (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "falconers", name: "Wood Elf Falconers", perModel: 15, minSize: 5, stat: "Wood Elf Warriors",
      restriction: "0-1", command: "skirmisher",
      note: "Elven Warriors with Hunting Falcons (range 24\", S3 missile; -1 to hit vs Falconers in melee). May skirmish. Falcons ignore long-range/move penalties but gain no shooting-buff bonuses.",
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "forestcreatures", name: "Forest Creatures & Beastmasters", perModel: 0, minSize: 1, kind: "composite",
      restriction: "0-2", command: "none",
      note: "Any combination of Bears, Hunting Dogs, Wild Cats or Wild Hogs, optionally led by unarmoured Wood Elf Beastmasters. Follows the Beastmaster rules in the main rulebook.",
      composition: [
        { id: "bear", label: "Bears", cost: 15, stat: "Bears" },
        { id: "dog", label: "Hunting Dogs", cost: 10, stat: "Hunting Dogs" },
        { id: "cat", label: "Wild Cats", cost: 10, stat: "Wild Cats" },
        { id: "hog", label: "Wild Hogs", cost: 5, stat: "Wild Hogs" },
        { id: "beastmaster", label: "Wood Elf Beastmasters", cost: 14, stat: "Wood Elf Beastmasters" },
      ],
    },
  ],
  chariotsMonsters: [
    {
      id: "greateagle", name: "Great Eagles", perUnit: 60, stat: "Great Eagle", kind: "quantity",
      note: "Small monster that can fly.",
    },
    {
      id: "chariot", name: "Wood Elf Chariot", perUnit: 60, stat: "Heavy Chariot", kind: "chariot", countsAsFirstRegiment: true,
      note: "Heavy Chariot pulled by two Elven Steeds, crewed by two Wood Elf Warriors with light armour, spears, shields & Wood Elf Longbows (5+ armour save). The cheapest chariot in the army counts toward Regiments; further chariots count toward Chariots & Monsters.",
      extraCrewCost: 10, extraCrewLabel: "extra Wood Elf Warrior crew", extraSteedCost: 5, extraSteedLabel: "extra Elven Steeds",
      commanderCost: 43, commanderLabel: "One crewman is an Elven Commander", commanderMagicItemSlots: 1, scythedWheelsCost: 20,
    },
    {
      id: "treeman", name: "Treeman", perUnit: 200, stat: "Treeman", kind: "quantity",
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
    { id: "durthu", name: "Durthu the Treeman", cost: 260, stat: "Durthu the Treeman", role: "Treeman (alternative, is a character)",
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
  name: "The Empire",
  tagline: "The disciplined might of humanity's bulwark against the dark",
  magicItems: EMPIRE_MAGIC_ITEMS,
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
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Handgun", "Pistol", "Two pistols"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 20, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 55, stat: "Pegasus" },
        { id: "griffon", name: "Griffon", cost: 175, stat: "Griffon" },
      ],
    },
    {
      id: "empirehero", name: "Empire Hero", cost: 60, stat: "Empire Hero", magicItemSlots: 2,
      gearNote: "May take a shield and either light armour, heavy armour, or full plate armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Handgun", "Pistol", "Two pistols"] },
      experimentalMissileGroup: { label: "Experimental missile weapon — foot only (any one, +10pts)", cost: 10, options: ["None (default)", "Hochland Long Rifle", "Repeating handgun", "Repeating pistol"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 15, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 50, stat: "Pegasus" },
        { id: "griffon", name: "Griffon", cost: 170, stat: "Griffon" },
      ],
    },
    {
      id: "empirebsb", name: "Empire Battle Standard Bearer", cost: 80, stat: "Empire BSB", magicItemSlots: 1, restriction: "0-1",
      gearNote: "May take either light armour, heavy armour, or full plate armour for free. The one magic item may be a magic banner.",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 10, stat: "Warhorse" },
      ],
    },
    {
      id: "wizardlord", name: "Wizard Lord (level 4)", cost: 240, stat: "Wizard Lord", magicItemSlots: 4,
      gearNote: "May take College Magic (and Ice Magic if the army includes Kislev regiments). May take as many magic items as levels (4).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "griffon", name: "Griffon", cost: 160, stat: "Griffon" },
      ],
    },
    {
      id: "masterwizard", name: "Master Wizard (level 3)", cost: 170, stat: "Master Wizard", magicItemSlots: 3,
      gearNote: "May take College Magic (and Ice Magic if the army includes Kislev regiments). May take as many magic items as levels (3).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizardchampion", name: "Wizard Champion (level 2)", cost: 110, stat: "Wizard Champion", magicItemSlots: 2,
      gearNote: "May take College Magic (and Ice Magic if the army includes Kislev regiments). May take as many magic items as levels (2).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizard", name: "Wizard (level 1)", cost: 50, stat: "Wizard", magicItemSlots: 1,
      gearNote: "May take College Magic (and Ice Magic if the army includes Kislev regiments). May take as many magic items as levels (1).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "warriorpriest", name: "Warrior Priest", cost: 65, stat: "Warrior Priest", magicItemSlots: 1,
      gearNote: "May take a shield and either light or heavy armour for free (not full plate). Any regiment of Swordsmen or State Troops he joins (including detachments within 8\") becomes immune to fear and hates all enemies — as does the Priest himself.",
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
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "shield", group: null, label: "Shields (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "spearmen", name: "Spearmen", perModel: 5, minSize: 5, stat: "State Trooper", command: "standard", detachmentParent: true,
      note: "State Troops with spears.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "shield", group: null, label: "Shields (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "pikemen", name: "Pikemen", perModel: 8, minSize: 5, stat: "State Trooper", command: "standard", detachmentParent: true,
      note: "State Troops with pikes.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "greatswords", name: "Greatswords", perModel: 6, minSize: 5, stat: "State Trooper", command: "standard", detachmentParent: true,
      note: "State Troops with double handed weapons.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "swordsmen", name: "Swordsmen", perModel: 5.5, minSize: 5, stat: "Swordsman", command: "standard", detachmentParent: true,
      note: "Swordsmen with shields.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "archers", name: "Archers", perModel: 7, minSize: 5, stat: "State Trooper", command: "standard",
      note: "State Troops with longbows. May skirmish (loses standard bearer while skirmishing).",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "crossbowmen", name: "Crossbowmen", perModel: 9, minSize: 5, stat: "State Trooper", command: "standard",
      note: "State Troops with crossbows.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Empire Champion", baseCost: 20, magicItemSlots: 1, stat: "Empire Champion" },
    },
    {
      id: "handgunners", name: "Hand gunners", perModel: 9, minSize: 5, stat: "State Trooper", command: "standard",
      note: "State Troops with handguns.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
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
        { id: "dhw", group: null, label: "Swap shields for double handed weapons (+2pt/model)", cost: 2, per: "model" },
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
        { id: "flails", group: null, label: "Flails (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Prophet of Doom", baseCost: 20, magicItemSlots: 0, stat: "Prophet of Doom" },
    },
    {
      id: "kislevlancers", name: "Kislev Winged Lancers", perModel: 17, minSize: 5, stat: "Kislev Winged Lancer", mountStat: "Warhorse", mountLabel: "Warhorse", command: "fastCavalry", auxiliary: true,
      note: "Warhorses, light armour, shields, and lances. Fast cavalry.",
      options: [
        { id: "shrieking", group: null, label: "Shrieking back banners — causes fear on the charge turn (+3pt/model)", cost: 3, per: "model" },
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
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "trained", group: null, label: "Trained as state troops — eligible as a detachment (+0.5pt/model)", cost: 0.5, per: "model" },
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
        { id: "spears", group: null, label: "Spears (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Halfling Champion", baseCost: 10, magicItemSlots: 1, stat: "Halfling Champion" },
    },
    {
      id: "ogremercenaries", name: "Ogre Mercenaries", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous", auxiliary: true,
      note: "Light armour. Monstrous regiment. Causes fear.",
      options: [
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light (+4pt/model)", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons (+6pt/model)", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails (+8pt/model)", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion" },
    },
    {
      id: "dwarfwarriors", name: "Dwarf Warriors", perModel: 8, minSize: 5, stat: "Dwarf (Empire)", command: "standard", auxiliary: true,
      note: "Light armour. Subject to standard Dwarf special rules.",
      options: [
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+2pt/model)", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
        { id: "crossbows", group: "melee", label: "Crossbows instead — only if taking no other weapon/shield (+4pt/model)", cost: 4, per: "model" },
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
      note: "Requires a Halfling regiment in the army. Shoots like a stone thrower, range 36\", S5, normal armour save allowed, no regeneration. Crewed by three halflings; cannot enter woods despite Halflings being foresters.",
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
    { id: "supremepatriarch", name: "The Supreme Patriarch of the Colleges of Magic", cost: 300, stat: "The Supreme Patriarch", role: "Wizard Lord",
      note: "Uses Bright Magic. Carries the Staff of Volans — once per game may cast a spell for free as if cast with Total Power.", extraMagicItemSlots: 3,
      mountOption: { name: "Warhorse (may be barded, free)", cost: 0 } },
    { id: "grandtheogonist", name: "Grand Theogonist Volkmar", cost: 300, stat: "Grand Theogonist Volkmar", role: "Lord",
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
    { id: "tzarinakatarin", name: "Tzarina Katarin, the Ice Queen of Kislev", cost: 200, stat: "Tzarina Katarin The Ice Queen", role: "Lord (Level 3 Wizard, Lore of Ice)",
      note: "Requires a Kislev regiment in the army to include her. Rides a Warhorse. Carries the magic blade Fearfrost.", extraMagicItemSlots: 2 },
  ],
};

const MARKS_WARRIOR = ["Khorne", "Tzeentch", "Nurgle", "Slaanesh", "Chaos Undivided"];
const MARKS_SORCERER = ["Tzeentch", "Nurgle", "Slaanesh", "Chaos Undivided"];
const CHAOS_ARMOUR_OPTIONS = ["Chaos Armour (default)", "No armour", "Light armour", "Heavy armour"];
const CHAOS_CHAMPION_ITEM_CATEGORIES = ["weapon", "armour", "enchanted", "arcane", "banner", "chaosbanner", "reward"];

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
  { id: "cb-rapturous", name: "Rapturous Standard", cost: 10, cat: "chaosbanner", desc: "BSB with Mark of Slaanesh only, single-Power army only. The regiment and BSB become unbreakable.", restrictedTo: [{ marks: ["Slaanesh"] }] },
  { id: "cb-rage", name: "Banner of Rage", cost: 20, cat: "chaosbanner", desc: "BSB with Mark of Khorne only, single-Power army only. The regiment and BSB gain frenzy (double-attack bonus doesn't apply to mounts).", restrictedTo: [{ marks: ["Khorne"] }] },
  { id: "cb-iron", name: "Iron Standard", cost: 30, cat: "chaosbanner", desc: "BSB with Mark of Chaos Undivided only, single-Power army only. The regiment and BSB may re-roll any failed save.", restrictedTo: [{ marks: ["Chaos Undivided"] }] },
  { id: "cb-blasted", name: "Blasted Standard", cost: 40, cat: "chaosbanner", desc: "BSB with Mark of Tzeentch only, single-Power army only. Casts Blue Fire of Tzeentch as a bound spell once/magic phase (18\", D6 S4 hits, normal saves).", restrictedTo: [{ marks: ["Tzeentch"] }] },
  { id: "cb-disease", name: "Disease Banner", cost: 50, cat: "chaosbanner", desc: "BSB with Mark of Nurgle only, single-Power army only. When the regiment/BSB suffers a melee wound, on a 5-6 the attacker also suffers a wound, no save.", restrictedTo: [{ marks: ["Nurgle"] }] },
  { id: "cb-hellonearth", name: "Hell on Earth", cost: 60, cat: "chaosbanner", desc: "BSB only, single-Power army only. All friendly Daemons on the table gain +1 to Daemonic/armour save while the banner stands." },
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

const CHAOS = {
  key: "chaos",
  name: "Chaos",
  tagline: "Warriors, sorcerers, beastmen, and daemon-touched hosts of the Dark Powers",
  magicItems: CHAOS_MAGIC_ITEMS,
  armyWideRules: [
    "A Chaos army is either a specific faction — Chaos Warriors, Beastmen, or Daemons — or a Chaos Warband (mixes all three, general must be a Chaos Warrior character, and the army must include a Chaos Warrior or Chaos Knight regiment; a Warband BSB must come from the Chaos Warrior section). Warbands and single-faction armies are dedicated to one Chaos Power, except single-faction armies may mix Powers. At 2000+ points, a Chaos Warhost mixes Powers like a Warband. This builder's catalog includes all three factions together (a Warband/Warhost build) — for a pure single-faction army, just stick to the relevant subsection.",
    "Marks of Chaos: characters with opposing Marks never join the same regiment, nor a regiment carrying a banner dedicated to a different Power. Khorne grants +1 WS and frenzy (no sorcerer may take it); Tzeentch lets the bearer re-roll one personal die roll (±1 after); Nurgle grants +1T and immunity to poison/disease effects; Slaanesh makes the bearer unbreakable (but still driven off if flying and beaten); Chaos Undivided grants +1 Ld, and if the general bears it, the army may include a Chaos Abomination.",
    "Chaos Armour: Chaos Champions (Chaos Warrior character-section characters and regimental Chaos Champions) are automatically equipped with Chaos Armour (+1 armour save) for free; it doesn't use a magic item slot and can be freely exchanged for no armour, light, or heavy armour.",
    "Chaos Rewards (Chaos Champions only) and Daemonic Rewards (Daemons only) share the same magic-item-slot pool as ordinary magic items, but are otherwise unique per army like any magic item. Chaos Banners can only be taken by a Battle Standard Bearer, and only if the whole army worships a single Chaos Power — even a Daemon BSB may then take one.",
    "Beastmen: Ungor, Gor, and Centaur (Centigor) regiments are Unruly (animosity-equivalent) — before the movement phase, an unengaged/non-fleeing regiment of these types rolls a die; on a 1, roll again, and on that second roll a 1-5 freezes the unit for the turn (immune to psychology, can't move/shoot/cast, though wizards may still dispel) while a 6 forces a 2D6\" move toward the nearest visible enemy and a mandatory charge next turn. Pure Beastmen armies (no Warriors/Daemons) may Ambush with Gor regiments, up to 25% of the army.",
    "Daemons: cause fear, count as magical attacks, immune to poison and to living-only effects, immune to psychology and never flee (vanish instead of fleeing), and have a 4+ Daemonic Save that's negated by magical attacks. Only a (small) Daemon Prince can join a Daemon regiment, and only one of the same Chaos Power. In a Warband/Warhost, Daemons of different Powers within 12\" of each other test Daemonic Animosity each turn (on a 1, they're moved into combat with the nearest rival Daemon unit). Musk/stench -1-to-hit effects (Nurgle, Slaanesh) don't stack and don't affect models with the same kind of effect.",
    "Chaos Gifts are an optional physical-card mini-game (draw 2 cards/turn, 1 below 2000pts) layered on top of the rules — not simulated in this builder, since it's a play-time mechanic rather than a list-building one.",
    "Chaos Spawn: models turned into Chaos Spawn during a battle lose all gear/rules; this is a battle-phase mechanic and isn't simulated here either.",
    "In armies under 2000pts, the general may be a regimental champion (or even a Chaos Spawn, though that's ill-advised) if no other character could fill the role.",
    "The Hellcannon is a house-rule/optional unit (primarily for siege battles) requiring the opponent's permission before including it — flagged in its own entry below.",
    "A block of special characters (Valkia, Sigvald, Vilitch, Festus, Galrauch, Kholek, and all the Daemon named characters) come from later game editions and aren't official Warhammer Renaissance — both players need to agree to their use.",
  ],
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
      id: "chaosbsb", name: "Chaos Battle Standard Bearer", cost: 116, stat: "Chaos BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["chaosChampion"],
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
        { id: "warhorse", name: "Chaos Warhorse (free, may take barding)", cost: 0, stat: "Chaos Warhorse" },
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
        { id: "warhorse", name: "Chaos Warhorse (free, may take barding)", cost: 0, stat: "Chaos Warhorse" },
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
        { id: "warhorse", name: "Chaos Warhorse (free, may take barding)", cost: 0, stat: "Chaos Warhorse" },
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
        { id: "warhorse", name: "Chaos Warhorse (free, may take barding)", cost: 0, stat: "Chaos Warhorse" },
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
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "beastmanhero", name: "Beastman Hero", cost: 89, stat: "Beastman Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Beastmen are infantry. May take light armour and a shield for free, or heavy armour for free.",
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "minotaurlord", name: "Minotaur Lord", cost: 256, stat: "Minotaur Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Monstrous model, causes fear. After a won combat with an enemy casualty, must gorge on the dead (no pursuit/overrun unless hatred/frenzy). Charged before its next move while feasting, it becomes frenzied. May take light armour and a shield for free.",
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "minotaurhero", name: "Minotaur Hero", cost: 168, stat: "Minotaur Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Monstrous model, causes fear. Same gorging/frenzy rule as the Minotaur Lord. May take light armour and a shield for free.",
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "dragonogrelord", name: "Dragon Ogre Lord", cost: 400, stat: "Dragon Ogre Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Large model, causes terror, immune to psychology, becomes frenzied if hit by enemy lightning, 5+ armour save from scaly skin. Mark of Slaanesh costs +25pts for Dragon Ogres. May take light armour and a shield for free.",
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "dragonogrehero", name: "Dragon Ogre Hero", cost: 300, stat: "Dragon Ogre Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Large model, causes terror, immune to psychology, becomes frenzied if hit by enemy lightning, 5+ armour save from scaly skin. Mark of Slaanesh costs +25pts for Dragon Ogres. May take light armour and a shield for free.",
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "centaurlord", name: "Centaur Lord", cost: 184, stat: "Centaur Lord", magicItemSlots: 3, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Centaurs are cavalry. May take light armour and a shield for free.",
      markGroup: { options: MARKS_WARRIOR },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Double handed weapon"] },
    },
    {
      id: "centaurhero", name: "Centaur Hero", cost: 110, stat: "Centaur Hero", magicItemSlots: 2, magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES, tags: ["beastman"],
      gearNote: "Centaurs are cavalry. May take light armour and a shield for free.",
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
      id: "beastmanbsb", name: "Beastman Battle Standard Bearer", cost: 96, stat: "Beastman BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: [...CHAOS_CHAMPION_ITEM_CATEGORIES], tags: ["beastman"],
      gearNote: "0-1 slot shared with the Minotaur/Centaur BSB below — pick only one. May take light armour for free, or heavy armour for free. May take a Beastman Chariot for the price of the chariot. The one item may be a magic banner.",
      markGroup: { options: MARKS_WARRIOR },
      mounts: [
        { id: "chariot", name: "Beastman Chariot (for the price of the chariot)", cost: 0, stat: "Extra Heavy Chariot" },
      ],
    },
    {
      id: "minotaurbsb", name: "Minotaur Battle Standard Bearer", cost: 132, stat: "Minotaur BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: [...CHAOS_CHAMPION_ITEM_CATEGORIES], tags: ["beastman"],
      gearNote: "0-1 slot shared with the Beastman/Centaur BSB — pick only one. Monstrous model, causes fear. The one item may be a magic banner.",
      markGroup: { options: MARKS_WARRIOR },
    },
    {
      id: "centaurbsb", name: "Centaur Battle Standard Bearer", cost: 108, stat: "Centaur BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: [...CHAOS_CHAMPION_ITEM_CATEGORIES], tags: ["beastman"],
      gearNote: "0-1 slot shared with the Beastman/Minotaur BSB — pick only one. Centaurs are cavalry. The one item may be a magic banner.",
      markGroup: { options: MARKS_WARRIOR },
    },
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
      id: "lordofchange", name: "Lord of Change, Greater Daemon of Tzeentch", cost: 725, stat: "Lord of Change", magicItemSlots: 1, magicItemCategoryFilter: ["daemonicreward"], impliedMark: "Tzeentch",
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
        { id: "ahw", group: "melee", label: "Swap shield for additional hand weapon (+1.5pt/model)", cost: 1.5, per: "model" },
        { id: "heavy", group: "melee", label: "Swap shield for double handed weapon or flail (+3pt/model)", cost: 3, per: "model" },
        { id: "bows", group: "melee", label: "Give up armour & shield, take bows instead (free)", cost: 0, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 60, magicItemSlots: 1, stat: "Chaos Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "marauderhorsemen", name: "Chaos Marauder Horsemen", perModel: 23, minSize: 5, stat: "Chaos Marauder", mountStat: "Chaos Warhorse", mountLabel: "Warhorse", command: "fastCavalry",
      note: "Also called Chaos Thug Horsemen. Fast cavalry. Light armour, shields, spears, on Warhorses.",
      options: [
        { id: "flails", group: null, label: "Swap spears & shields for flails (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 80, magicItemSlots: 1, stat: "Chaos Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "chaoswarriors", name: "Chaos Warriors", perModel: 18, minSize: 5, stat: "Chaos Warrior", command: "standard",
      note: "Chaos Armour and shields by default.",
      options: [
        { id: "halberdahw", group: "melee", label: "Swap shield for halberd or additional hand weapon (+2pt/model)", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon (+4pt/model)", cost: 4, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 60, magicItemSlots: 1, stat: "Chaos Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "chaosknights", name: "Chaos Knights", perModel: 45, minSize: 5, stat: "Chaos Warrior", mountStat: "Chaos Warhorse", mountLabel: "Chaos Warhorse (barded)", command: "standard",
      note: "Chaos Warriors on barded Chaos Warhorses, with Chaos Armour, shields, and lances.",
      champion: { name: "Chaos Champion (with Mark of Chaos, mounted)", baseCost: 80, magicItemSlots: 1, stat: "Chaos Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "ogremercenaries", name: "Ogre Mercenaries", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous",
      note: "Light armour. Causes fear. Monstrous regiment.",
      options: [
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light (+4pt/model)", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons (+6pt/model)", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails (+8pt/model)", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion", magicItemCategoryFilter: ["weapon", "armour", "enchanted", "arcane"] },
    },
    {
      id: "beastmengors", name: "Beastmen Gors", perModel: 9, minSize: 5, stat: "Beastmen Gors", command: "standard",
      note: "Shields by default. Unruly.",
      options: [
        { id: "halberds", group: "melee", label: "Swap shield for halberd (+2pt/model)", cost: 2, per: "model" },
        { id: "ahw", group: "melee", label: "Swap shield for additional hand weapon (+2pt/model)", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon (+4pt/model)", cost: 4, per: "model" },
        { id: "armour", group: null, label: "Light armour (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 30, magicItemSlots: 1, stat: "Beastmen Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "beastmenbestigors", name: "Beastmen Bestigors", perModel: 17, minSize: 5, stat: "Beastmen Bestigors", command: "standard",
      note: "Halberds and heavy armour by default. Not unruly.",
      options: [
        { id: "dhw", group: null, label: "Swap halberds for double handed weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 25, magicItemSlots: 1, stat: "Beastmen Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "beastmenungors", name: "Beastmen Ungors", perModel: 5, minSize: 5, stat: "Beastmen Ungors", command: "standard",
      note: "Unruly. If this is an independent Beastmen army, may take short bows instead of any other equipment (+1pt/model; may then skirmish).",
      options: [
        { id: "spears", group: null, label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "shields", group: null, label: "Shields (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "shortbows", group: null, label: "Short bows instead of any other equipment, independent Beastmen army only (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Beastman Champion (with Mark of Chaos)", baseCost: 35, magicItemSlots: 1, stat: "Beastmen Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "centaursregiment", name: "Centaurs", perModel: 16, minSize: 5, stat: "Centaurs", command: "fastCavalry",
      note: "Also called Centigors. Unruly fast cavalry. If this is an independent Beastmen army, may take bows (+2pt/model) or throwing spears (+1pt/model) instead of any other equipment; either may then skirmish.",
      options: [
        { id: "armour", group: null, label: "Light armour (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "bows", group: "melee", label: "Bows instead of any other equipment, independent Beastmen army only (+2pt/model)", cost: 2, per: "model" },
        { id: "throwingspears", group: "melee", label: "Throwing spears instead of any other equipment, independent Beastmen army only (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Centaur Champion (with Mark of Chaos)", baseCost: 30, magicItemSlots: 1, stat: "Centaur Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "harpies", name: "Harpies", perModel: 22, minSize: 5, stat: "Gargoyles", command: "none", restriction: "0-1",
      note: "Flying infantry (not monstrous bases — 25x25mm, and may rank up). May skirmish. Cannot be joined by characters, cannot take a standard bearer, musician, or champion.",
    },
    {
      id: "minotaursregiment", name: "Minotaurs", perModel: 26, minSize: 3, stat: "Minotaurs", command: "monstrous",
      note: "Additional hand weapons by default. Monstrous, causes fear. After a won combat with an enemy casualty, must gorge on the dead (no pursuit/overrun unless hatred/frenzy); charged before their next move while feasting, they become frenzied.",
      options: [
        { id: "armour", group: null, label: "Light armour (+2pt/model)", cost: 2, per: "model" },
        { id: "dhw", group: null, label: "Swap additional hand weapons for double handed weapons (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Minotaur Champion (with Mark of Chaos)", baseCost: 50, magicItemSlots: 1, stat: "Minotaur Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "dragonogresregiment", name: "Dragon Ogres", perModel: 56, minSize: 3, stat: "Dragon Ogres", command: "monstrous",
      note: "Monstrous, causes fear. 5+ armour save from scaly skin. Becomes frenzied if struck by enemy lightning.",
      options: [
        { id: "armour", group: null, label: "Light armour (+4pt/model)", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons (+8pt/model)", cost: 8, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+12pt/model)", cost: 12, per: "model" },
      ],
      champion: { name: "Dragon Ogre Champion (with Mark of Chaos; +25pt if Mark of Slaanesh)", baseCost: 50, magicItemSlots: 1, stat: "Dragon Ogre Champion", magicItemCategoryFilter: CHAOS_CHAMPION_ITEM_CATEGORIES },
    },
    {
      id: "trolls", name: "Trolls", perModel: 40, minSize: 3, stat: "Trolls", command: "none",
      note: "Must be River Trolls (free), Stone Trolls (free), or Chaos Trolls (+5pt/model). Monstrous, stupid, immune to psychology, cause fear, regenerate on 4+; may vomit instead of attacking (auto-hit, S5, no save, 1D3 wounds). Cannot take a standard bearer, musician, or champion. River: crosses water freely, enemies -1 to hit in melee (living only). Stone: 2+ natural dispel. Chaos: +1 Attack.",
      options: [
        { id: "chaostrolls", group: null, label: "Chaos Trolls, +1 Attack (+5pt/model)", cost: 5, per: "model" },
      ],
    },
    {
      id: "gargoyles", name: "Gargoyles", perModel: 18, minSize: 5, stat: "Gargoyles", command: "none", restriction: "0-1",
      note: "Also called Furies. Flying infantry, like Harpies. May skirmish. Cannot take a standard bearer or musician, or be joined by characters. Counts as Chaos Undivided.",
    },
    {
      id: "bloodlettersfoot", name: "Bloodletters of Khorne", perModel: 16, minSize: 5, stat: "Bloodletters of Khorne", command: "standard",
      note: "Daemon blades: no armour save, 1 wound = 1D3.",
      champion: { name: "Bloodletter Champion", baseCost: 36, magicItemSlots: 1, stat: "Bloodletter Champion", magicItemCategoryFilter: ["daemonicreward"] },
    },
    {
      id: "bloodlettersjuggernaut", name: "Bloodletters riding Juggernauts of Khorne", perModel: 86, minSize: 5, stat: "Bloodletters of Khorne", mountStat: "Juggernaut of Khorne", mountLabel: "Juggernaut of Khorne", command: "monstrous",
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
      id: "discsoftzeentch", name: "(Unridden) Discs of Tzeentch", perModel: 30, minSize: 5, stat: "Disc of Tzeentch", command: "skirmisher", restriction: "0-1",
      note: "Also called Screamers. Flying monstrous regiment (skirmishers). May fly over unengaged enemy units in the remaining-moves phase for a S5 hit each (each target only once). May fly high (unlike ridden Discs).",
    },
    {
      id: "flamers", name: "Flamers of Tzeentch", perModel: 40, minSize: 5, stat: "Flamers of Tzeentch", command: "none",
      note: "Move as fast cavalry; cross obstacles freely but not woods. Cannot take a standard bearer or musician. Each model makes 1D6 flaming shooting attacks (range 6\", BS to hit, S3); in melee, wounds multiply into 1D3.",
    },
    {
      id: "nurglings", name: "Nurglings", perModel: 20, minSize: 5, stat: "Nurglings", command: "none",
      note: "Monstrous regiment. May skirmish. Cannot take a standard bearer or musician, or be joined by characters.",
    },
    {
      id: "plaguebearersbeasts", name: "Plaguebearers of Nurgle riding Beasts of Nurgle", perModel: 88, minSize: 5, stat: "Plaguebearers of Nurgle", mountStat: "Beast of Nurgle", mountLabel: "Beast of Nurgle", command: "monstrous",
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
      id: "chaoswarriorchariot", name: "Chaos Warrior Chariot", perUnit: 79, stat: "Heavy Chariot", kind: "chariot",
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
      id: "chaosmarauderchariot", name: "Chaos Marauder Chariot", perUnit: 62, stat: "Heavy Chariot", kind: "chariot",
      note: "Heavy Chariot pulled by two Warhorses, crewed by two Chaos Marauders with spears, light armour and shields (5+ armour save).",
      extraCrewCost: 16, extraCrewLabel: "extra Chaos Marauder crew", extraSteedCost: 2, extraSteedLabel: "extra Warhorses",
      scythedWheelsCost: 20,
    },
    {
      id: "chaosspawns", name: "Chaos Spawns", perUnit: 60, stat: "Chaos Spawn", kind: "quantity",
      note: "Small monster, causes fear, unbreakable. Random attacks and movement — see army-wide rules.",
    },
    {
      id: "chaosabomination", name: "Chaos Abomination", stat: "Chaos Abomination", kind: "abomination", restriction: "0-1",
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
      id: "beastmanchariots", name: "Beastman Chariot", perUnit: 70, stat: "Extra Heavy Chariot", kind: "chariot",
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
      statNote: "Heavy Chariot pulled by one Juggernaut of Khorne, crewed by two Bloodletters. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariotnurgle", name: "Daemonic Chariot of Nurgle", perUnit: 110, stat: "Heavy Chariot", kind: "quantity",
      statNote: "Heavy Chariot pulled by one Beast of Nurgle, crewed by two Plaguebearers. 4+ Daemonic Save. Enemies suffer -1 to hit in melee against it.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariotslaanesh", name: "Daemonic Chariot of Slaanesh", perUnit: 130, stat: "Heavy Chariot", kind: "quantity",
      statNote: "Heavy Chariot pulled by two Steeds of Slaanesh, crewed by two Daemonettes. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "daemonicchariottzeentch", name: "Daemonic Chariot of Tzeentch", perUnit: 150, stat: "Heavy Chariot", kind: "quantity",
      statNote: "Heavy Chariot pulled by two Discs of Tzeentch, crewed by two Pink Horrors (don't split into Blue Horrors when slain in a chariot). Can fly, not fly high. 4+ Daemonic Save.",
      variantOptions: [{ id: "scythedwheels", label: "Scythed wheels", cost: 20 }],
    },
    {
      id: "hellcannon", name: "Hellcannon", perUnit: 120, stat: "Hellcannon Daemon", kind: "warmachine",
      note: "House rule / optional — ask your opponent's permission before including it, primarily meant for Siege Battles. A Daemon that works as a war machine, crewed by three Chaos Dwarfs in heavy armour. Shoots like a large stone thrower; any regiment losing even one model to it must take a panic test; shots count as magical. A misfire eats 1D3 crew instead of firing; if all crew die, it becomes an independent monster with random movement that charges the nearest model each turn (friend or foe), following normal Daemon rules — and still defends itself if charged.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Chaos Dwarf crew",
    },
  ],
  specialCharacters: [
    { id: "aekoldhelbrass", name: "Aekold Helbrass", cost: 200, stat: "Aekold Helbrass", role: "Hero",
      note: "Recovers a lost wound on 4+ each turn; even if slain, reincarnates on 5+. Models in base contact recover a wound on 6+. Equipped with Chaos Armour, Mark of Tzeentch, and the Windblade (magic double handed weapon — roll 1D6 at battle start: 1-2 fly, 3-4 always strikes first, 5-6 usable as a S6 missile, range 12\", 1D6 hits)." },
    { id: "dechala", name: "Dechala the Denied One", cost: 180, stat: "Dechala the Denied One", role: "Hero",
      note: "Hates Khorne Daemons and Khorne Champions. Each Chaos turn picks a dance: The Praise of Slaanesh (-1 to hit vs her), Dance of Destruction (+1 to hit in melee), or Daggerdance (deflect 3 attacks per 2 given up). Six attacks (additional hand weapons for her many arms), Chaos Armour, Mark of Slaanesh, and the Elixir of Damnation (living enemies she wounds can't attack/cast against her)." },
    { id: "egrimm", name: "Egrimm van Horstmann", cost: 850, stat: "Egrimm van Horstmann", role: "Chaos Sorcerer Lord",
      note: "Army always deploys last. Equipped with Chaos Armour, Mark of Tzeentch, and the Crystal Skull. Rides a Chaos Dragon.", extraMagicItemSlots: 3 },
    { id: "valnir", name: "Valnir the Reaper", cost: 250, stat: "Valnir the Reaper", role: "Hero",
      note: "Nominate an enemy regiment at battle start for a random ailment (Red Plague, Brain Fever, or Black Rot). Causes fear, immune to psychology, hates all living enemies, regenerates on 4+. Equipped with Chaos Armour, Mark of Nurgle, and the Gatherer of Souls (magic flail: always +2S, may boost WS/S/A per 3 wounds inflicted)." },
    { id: "archaon", name: "Archaon, Lord of Chaos", cost: 550, stat: "Archaon", role: "Lord",
      note: "Mark of Chaos Undivided; regiments he joins become unbreakable. Requires 4 roughly-equal Chaos Warrior regiments, one per major Power, each carrying that Power's Chaos Banner, plus a BSB. May cast a free random Dark Magic/Chaos God spell each own magic phase. Equipped with a shield, the Slayer of Kings (WS10 S7 A7), Armour of Morkar (1+ unmodifiable save, -2S vs him), the Eye of Sheerian (random battle-start effect), and rides the barded warhorse W'soraych." },
    { id: "arbaal", name: "Arbaal the Undefeated", cost: 350, stat: "Arbaal the Undefeated", role: "Lord",
      note: "Must always issue challenges in Khorne's name; becomes a Chaos Spawn if he flees. Not subject to frenzy despite being a Champion of Khorne. Immune to psychology, 2D6 attacks/round. Chaos Armour. Rides the Hound of Khorne (small Daemonic monster, immune to magic weapons, dispels spells targeting it/Arbaal/his regiment; vanishes if Arbaal dies)." },
    { id: "mordrek", name: "Count Mordrek the Damned", cost: 300, stat: "Count Mordrek", role: "Lord",
      note: "Characteristics rolled randomly each battle (WS 1D6+4, S 1D3+3, T 1D3+3, A 1D6+1). Mark of Chaos Undivided. Equipped with Chaos Armour, the Chaos Runeshield, and the Sword of Change. Rides a barded Chaos Warhorse." },
    { id: "valkia", name: "Valkia the Bloody", cost: 384, stat: "Valkia the Bloody", role: "Chaos Lord — not official WHR, needs opponent's agreement",
      note: "Mark of Khorne (in profile). If present, no BSB may be taken — instead, all units within 12\" re-roll any failed Ld test. May not take a magic/Chaos Banner. Re-rolls the initial die on any Eye of the God test.",
      items: "Carries: Daemonshield (acts as a Parrying shield), the Spear of Slaupnir (+2S charge; on a 6 to wound while charging, man-sized victims are slain outright, no save, else 1D3 wounds), the Scarlet Armour (magic Chaos Armour, -1S to attacks against her; combined with the Daemonshield gives a 3+ save)." },
    { id: "sigvald", name: "Prince Sigvald", cost: 308, stat: "Prince Sigvald", role: "Chaos Lord — not official WHR, needs opponent's agreement",
      note: "Mark of Slaanesh. Treats difficult terrain, steep slopes, and water as open ground for movement (can't see through it though) — extends to any unit he joins.",
      items: "Carries: The Auric Armour (1+ save combined with his Mirrored Shield, plus Regeneration 4+), Sliverslash (+2 attacks, always strikes first), the Mirrored Shield (mundane — grants Sigvald Stupidity while carried)." },
    { id: "vilitch", name: "Vilitch the Curseling", cost: 503, stat: "Vilitch the Curseling", role: "Chaos Sorcerer Lord — not official WHR, needs opponent's agreement",
      note: "Mark of Tzeentch. Chaos Armour. His Fused Twin acts as a Spell Familiar without needing an extra model. If he dispels an enemy spell (targeting him or his unit) with a Dispel card, he keeps the power used to cast it. If an enemy wizard's Dispel card fails against his spell, he takes that card into his own hand.", extraMagicItemSlots: 2 },
    { id: "festus", name: "Festus the Leechlord", cost: 359, stat: "Festus the Leechlord", role: "Chaos Sorcerer Champion — not official WHR, needs opponent's agreement",
      note: "Mark of Nurgle (in profile). Chaos Armour, Regeneration 4+. He and any unit he joins only pursue 1D6\" (binding captives), but captured units are worth double victory points. Pestilent Potions: a unit he joins gains a 5+ regeneration save and poisoned attacks (including his own) while he's with them." },
    { id: "galrauch", name: "Galrauch, The Great Drake", cost: 640, stat: "Galrauch", role: "Two-Headed Chaos Dragon — not official WHR, needs opponent's agreement",
      note: "Large monster, flies, causes terror, 4+ scaly skin save. Mark of Tzeentch. A level 4 wizard (Tzeentch Magic). One head breathes fire (S4) or poison (S3, no save) each shooting phase; once per battle one head may instead breathe the Breath of Change (teardrop template, failed Toughness test on 1D6 removes the model from play) while the other head can't breathe that phase. Each turn, a failed Ld test makes the ancient Dragon spirit surface: no move/spells/breath, half his attacks turn on himself that phase (added to the enemy's combat res if already in combat)." },
    { id: "kholek", name: "Kholek Suneater", cost: 485, stat: "Kholek Suneater", role: "Dragon Ogre Lord — not official WHR, needs opponent's agreement",
      note: "Large monster, causes terror, immune to psychology, 5+ scaly-skin save, frenzied if hit by enemy lightning. Mark of Chaos Undivided (in profile). In the shooting phase, targets an unengaged visible enemy unit: on 2-6 it takes 1D6 S6 lightning hits, on a 1 Kholek is hit instead. Lightning-based spells targeting a unit within 12\" of him are redirected to him instead.",
      items: "Carries: Starcrusher (magic weapon, 1 wound = D3 wounds), Armour of the Storm (heavy armour, immune to lightning attacks, becomes frenzied if struck by lightning anyway)." },
    { id: "skulltaker", name: "Skulltaker", cost: 107, stat: "Skulltaker", role: "Unique Bloodletter Champion (0-1) — not official WHR, needs opponent's agreement",
      note: "The Slayer Sword: flaming attacks; on a 6 to wound, man-sized victims are slain outright (no save), else 1D3 wounds ignoring armour. The Cloak of Skulls: counts as the Chaos Armour Daemonic Reward (4+ armour save instead of Daemonic Save)." },
    { id: "karanak", name: "Karanak", cost: 125, stat: "Karanak", role: "Unique Flesh Hound Champion (0-1) — not official WHR, needs opponent's agreement",
      note: "Must join a Flesh Hounds unit (exception to the normal rule). Magic weapons only affect him for their mundane value; dispels all spells cast on him. Nominate an enemy model as his quarry at battle start — re-rolls failed to-hit and to-wound rolls against it." },
    { id: "skarbrand", name: "Skarbrand", cost: 610, stat: "Skarbrand", role: "Bloodthirster — not official WHR, needs opponent's agreement",
      note: "Large, causes terror, frenzy (can never lose it — while alive, ALL units on the table, friend and foe, are subject to Hatred). Chaos Armour (4+ save instead of Daemonic Save). Slaughter and Carnage: paired axes (a Daemonic Reward, not a magic weapon) granting an extra attack (in profile) and ignoring armour saves. Once/turn in the shooting phase may bellow (teardrop template, S5), even while engaged." },
    { id: "bluescribes", name: "The Blue Scribes", cost: 109, stat: "The Blue Scribes", role: "Unique Pink Horror Champion (0-1) — not official WHR, needs opponent's agreement",
      note: "Already two Blue Horrors — doesn't split further when slain. Treat rider+mount as one model; mounted on a Disc of Tzeentch, 4+ Daemonic Save, can't join a unit. In the magic phase, may cast one spell from any college — roll a D10 to see which spell is selected (no choice of the spell itself); cast as a bound spell." },
    { id: "changeling", name: "The Changeling", cost: 130, stat: "The Changeling", role: "Unique Daemonic Hero of Tzeentch — not official WHR, needs opponent's agreement",
      note: "A level 1 wizard (Lore of Tzeentch). At the start of each melee phase, may raise any of his WS/S/T/I/A to match an enemy model in base contact (the higher value if that model has more than one). Can't match a model fighting a challenge unless he's in that challenge too." },
    { id: "epidemius", name: "Epidemius", cost: 288, stat: "Epidemius", role: "Unique Plaguebearer Champion (0-1) — not official WHR, needs opponent's agreement",
      note: "Rides a Palanquin of Nurgle. Tracks all unsaved wounds caused by Nurgle Daemons/spells (friend or foe) as the Tally of Pestilence — cumulative, army-wide bonuses for all Nurgle Daemons at 7+/14+/21+/28+ wounds (Ld, then S, then T, then re-roll failed saves). Lost if Epidemius dies." },
    { id: "kugath", name: "Ku'Gath Plaguefather", cost: 515, stat: "Ku'Gath Plaguefather", role: "Great Unclean One — not official WHR, needs opponent's agreement",
      note: "Large, causes terror, Cloud of Flies, Stream of Corruption breath. A level 1 wizard (Nurgle Magic), hates Dwarfs. A Nurgling base within 6\" auto-regenerates D3 wounds each of his turns. Once/shooting phase, Nurglings may burst from him as a small-stone-thrower shooting attack (may move but not march while firing; a misfire does nothing)." },
    { id: "masqueofslaanesh", name: "The Masque of Slaanesh", cost: 95, stat: "The Masque of Slaanesh", role: "Unique Daemonette Champion (0-1) — not official WHR, needs opponent's agreement",
      note: "Can't join any unit. 3+ Daemonic Save (not the usual 4+). Each of her melee phases, picks one dance targeting an enemy unit within 12\" (no LoS needed): Dance of Dreaming (-1 Ld), Fleshspasm Polka (-1 S), or Waltz of Lethargy (-1 I), to a minimum of 1, until end of phase." },
    { id: "belakor", name: "Be'lakor, The Dark Master", cost: 650, stat: "Belakor", role: "Daemon Prince of Chaos Undivided — not official WHR, needs opponent's agreement",
      note: "Mark of Chaos Undivided (in profile). Large, causes terror (permanently — units never become immune to it), flies. A level 4 wizard (Dark Magic). All enemies suffer -1 Ld when rallying anywhere; living enemies within 6\" of him suffer an extra -1 Ld (cumulative). Enemy shooting at him or his army suffers -1 to hit. Each turn, a failed Ld test forces him to charge the nearest visible enemy if in range, or move toward the nearest enemy model (stopping 1\" short if it would overshoot)." },
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
  name: "High Elves",
  tagline: "The fading, feuding nobility of Ulthuan, holding the line against the dark",
  magicItems: HIGH_ELF_MAGIC_ITEMS,
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
      id: "elvenbsb", name: "Elven Battle Standard Bearer", cost: 88, stat: "Elven BSB (High Elf)", magicItemSlots: 1, restriction: "0-1",
      gearNote: "May take either light armour or Dragon Armour for free. The one magic item may be a magic banner.",
      mounts: [
        { id: "steed", name: "Elven Steed (may take barding free)", cost: 13, stat: "Elven Steed" },
      ],
    },
    {
      id: "magelord", name: "Mage Lord (level 4)", cost: 264, stat: "Mage Lord", magicItemSlots: 4, tags: ["mage"],
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
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
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "magechampion", name: "Mage Champion (level 2)", cost: 122, stat: "Mage Champion", magicItemSlots: 2, tags: ["mage"],
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "mage", name: "Mage (level 1)", cost: 58, stat: "Mage", magicItemSlots: 1, tags: ["mage"],
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
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
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "warriors", name: "Elven Warriors", perModel: 7, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard",
      note: "Warriors with shields.",
      options: [
        { id: "ahw", group: "melee", label: "Swap shield for additional hand weapon (free)", cost: 0, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon (+2pt/model)", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "archers", name: "Elven Archers", perModel: 9, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard",
      note: "Warriors with longbows.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "silverhelms", name: "Silver Helm Knights", perModel: 20, minSize: 5, stat: "Elven Elite", mountStat: "Elven Steed", mountLabel: "Elven Steed", command: "fastCavalry", fastCavalryToggleOption: "heavyarmour",
      note: "Elven Elite on Elven Steeds, light armour, shields, lances. Fast cavalry (as long as no armour upgrade is taken).",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+7pt/model) — loses fast cavalry, standard bearer becomes free", cost: 7, per: "model" },
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander (High Elf)" },
    },
    {
      id: "reaverknights", name: "Reaver Knights", perModel: 22, minSize: 5, stat: "Elven Warriors (High Elf)", mountStat: "Elven Steed", mountLabel: "Elven Steed", command: "fastCavalry",
      note: "Warriors on Elven Steeds, light armour, spears, and bows. Fast Cavalry. May skirmish, act as Vanguard, and Fire & Flee as a charge reaction.",
      options: [
        { id: "shields", group: null, label: "Shields (+2pt/model)", cost: 2, per: "model" },
        { id: "longbows", group: null, label: "Upgrade bows to longbows (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion (High Elf)" },
    },
    {
      id: "swordmasters", name: "Sword Masters of Hoeth", perModel: 12, minSize: 5, stat: "Sword Masters", command: "standard", restriction: "0-1",
      note: "Light armour, double handed weapons. Ignore \"double handed weapons strike last.\" Parry: -1 to hit vs S4-or-less missiles targeting their front (if 50%+ of the shooters are in the Sword Masters' front zone).",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+2pt/model)", cost: 2, per: "model" },
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
        { id: "longbows", group: null, label: "Upgrade bows to longbows (+2pt/model)", cost: 2, per: "model" },
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
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+2pt/model)", cost: 2, per: "model" },
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
      note: "Crewed by two Elven Warriors. Crew may take light armour for +1pt each (not modeled individually here — folded into the flat crew cost).",
      extraCrewCost: 7, extraCrewMax: 3, extraCrewLabel: "extra Elven Warrior crew",
    },
    {
      id: "tiranocchariots", name: "Tiranoc Chariot", perUnit: 60, stat: "Heavy Chariot", kind: "chariot", countsAsFirstRegiment: true,
      note: "Heavy Chariot pulled by two Elven Steeds, crewed by two Elven Warriors with light armour, spears, shields and longbows (5+ armour save; crew may swap spears/shields for halberds instead, 6+ save). The first Tiranoc Chariot counts toward Regiments; further ones count toward Chariots & Monsters.",
      extraCrewCost: 10, extraCrewLabel: "extra Elven Warrior crew", extraSteedCost: 5, extraSteedLabel: "extra Elven Steeds",
      scythedWheelsCost: 20, commanderCost: 43, commanderLabel: "One crewman is an Elven Commander", commanderMagicItemSlots: 1,
      variantGroupLabel: "Variants",
      variantOptions: [
        { id: "halberdcrew", label: "Crew use halberds instead of spears/shields (6+ save instead of 5+)", cost: 0 },
        { id: "whitelionsteeds", label: "Switch to White Lion Steeds — requires a White Lions regiment in the army (total +20pts)", cost: 20 },
        { id: "whitelionbarding", label: "Barding for White Lion Steeds (+5pts; 4+ save, or 5+ with halberd crew)", cost: 5 },
      ],
    },
    {
      id: "dragonprincesdragons", name: "Dragon Princes on Dragons", perUnit: 225, stat: "Young Dragon", kind: "quantity",
      statNote: "Rider: Supreme Elven Lord (lance, shield, Dragon Armour, 4+ save). Mount: Young Dragon (Red/White/Blue — see Dragon rules above). Not a character — follows ridden-monster rules; if the rider is slain, roll on the Monster Reaction Table (3D6).",
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
  { id: "dw-mrflight", name: "Master Rune of Flight", cost: 20, cat: "weapon", desc: "Master Weapon Rune. Thrown up to 12\", auto-hits, returns to hand. May stand & shoot as a charge reaction and target characters in regiments." },
  { id: "dw-mrsnorri", name: "Snorri Spangelhelm's Master Rune", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Hits automatically." },
  { id: "dw-mrskalf", name: "Skalf Blackhammer's Master Rune", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Wounds automatically." },
  { id: "dw-mralaric", name: "Alaric the Mad's Master Rune", cost: 30, cat: "weapon", desc: "Master Weapon Rune. No armour save." },
  { id: "dw-mrtrygg", name: "Master Rune of Trygg Trollslayer", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Bearer hates Trolls; against Trolls, one wound kills (no regeneration)." },
  { id: "dw-mrangrim", name: "Master Rune of Angrim Redbeard", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Against Daemons, one wound kills." },
  { id: "dw-mrhaki", name: "Master Rune of Haki Skullsplitter", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Against Skaven and Beastmen (Ungors/Gors/Bestigors/Centigors/Minotaurs), one wound kills." },
  { id: "dw-mrbaldrik", name: "Master Rune of Baldrik the Bad", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Against Elves and Dragons of all kinds, one wound kills." },
  { id: "dw-mreric", name: "Master Rune of Eric Cleric", cost: 30, cat: "weapon", desc: "Master Weapon Rune. Against Undead, one wound kills." },
  { id: "dw-mrdeath", name: "Master Rune of Death", cost: 60, cat: "weapon", desc: "Master Weapon Rune. All wounds kill." },
  { id: "dw-runefire", name: "Rune of Fire", cost: 10, cat: "weapon", desc: "Weapon Rune. Flaming attacks." },
  { id: "dw-runestriking", name: "Rune of Striking", cost: 10, cat: "weapon", desc: "Weapon Rune. +2 WS (can be taken several times)." },
  { id: "dw-runeswiftness", name: "Rune of Swiftness", cost: 10, cat: "weapon", desc: "Weapon Rune. Always strikes first." },
  { id: "dw-runeparrying", name: "Rune of Parrying", cost: 10, cat: "weapon", desc: "Weapon Rune. One enemy in base contact has -1 attack (all of them if taken twice)." },
  { id: "dw-runefury", name: "Rune of Fury", cost: 10, cat: "weapon", desc: "Weapon Rune. +1 attack (can be taken several times)." },
  { id: "dw-runecutting", name: "Rune of Cutting", cost: 10, cat: "weapon", desc: "Weapon Rune. -1 armour save (can be taken several times)." },
  { id: "dw-runemight", name: "Rune of Might", cost: 15, cat: "weapon", desc: "Weapon Rune. Double strength vs enemies with equal or higher toughness than the bearer's." },
  { id: "dw-runecleaving", name: "Rune of Cleaving", cost: 15, cat: "weapon", desc: "Weapon Rune. +1 strength (can be taken several times)." },
  { id: "dw-runesmiting", name: "Rune of Smiting", cost: 25, cat: "weapon", desc: "Weapon Rune. 1 wound = 1D6 wounds (multiple instances: roll more dice, take the highest)." },
  { id: "dw-armourofskaldour", name: "Armour of Skaldour", cost: 80, cat: "armour", desc: "Gromril armour. 2+ save (unmodifiable). 4+ ward save. Immune to fire-based attacks." },
  { id: "dw-mradamant", name: "Master Rune of Adamant", cost: 30, cat: "armour", desc: "Master Armour Rune. +2 armour save." },
  { id: "dw-mrgromril", name: "Master Rune of Gromril", cost: 100, cat: "armour", desc: "Master Armour Rune. Toughness 10." },
  { id: "dw-runestone", name: "Rune of Stone", cost: 10, cat: "armour", desc: "Armour Rune. +1 armour save (can be taken several times)." },
  { id: "dw-runefortitude", name: "Rune of Fortitude", cost: 20, cat: "armour", desc: "Armour Rune. +1 wound (can be taken several times)." },
  { id: "dw-runeiron", name: "Rune of Iron", cost: 30, cat: "armour", desc: "Armour Rune. +1 toughness (can be taken several times)." },
  { id: "dw-runeresistance", name: "Rune of Resistance", cost: 30, cat: "armour", desc: "Armour Rune. 5+ ward save (4+ if taken twice; can't be taken thrice)." },
  { id: "dw-runespelleating", name: "Rune of Spell Eating", cost: 60, cat: "armour", desc: "Armour Rune. Natural dispel 3+; dispelled spells are destroyed on 3+ (multiple instances: roll more dice, take highest)." },
  { id: "dw-bugmanstankard", name: "Bugman's Tankard", cost: 10, cat: "enchanted", desc: "The bearer or one model in his unit recovers one lost wound after a phase ends. Doesn't work on dead models. Three uses." },
  { id: "dw-dragoncrown", name: "Dragon Crown of Karaz", cost: 25, cat: "enchanted", desc: "Dwarf Lord only. Bearer and his unit are immune to psychology.", restrictedTo: [{ tags: ["dwarfLord"] }] },
  { id: "dw-fieryring", name: "Firery Ring of Thori", cost: 25, cat: "enchanted", desc: "After a normal move, creates a wall of flame around the bearer's unit (can't shoot but can be shot at; nothing can charge it). Lasts until the Dwarf player's next turn. Models entering it by accident are destroyed. One use." },
  { id: "dw-greatbookgrudges", name: "Great Book of Grudges", cost: 50, cat: "enchanted", desc: "Dwarf Lord only. Bearer and his unit hate all enemies.", restrictedTo: [{ tags: ["dwarfLord"] }] },
  { id: "dw-goldensceptre", name: "Golden Sceptre of Nogrim", cost: 50, cat: "enchanted", desc: "+1 armour save to the bearer and his unit." },
  { id: "dw-mrdismay", name: "Master Rune of Dismay", cost: 25, cat: "enchanted", desc: "Talismanic Master Rune, must be on a war horn. One use. Sound it at the start of an enemy turn — all enemy units test Ld (unless immune to psychology) or can't charge that turn." },
  { id: "dw-mrdisdain", name: "Master Runes of Disdain", cost: 50, cat: "enchanted", desc: "Talismanic Master Rune. Dispels and destroys a spell cast at the bearer or his unit. One use." },
  { id: "dw-mrspite", name: "Master Rune of Spite", cost: 50, cat: "enchanted", desc: "Talismanic Master Rune. Ward save with a twist — rebounds wounds on 5+ (only unmodified saves apply to rebounded wounds)." },
  { id: "dw-runeluck", name: "Rune of Luck", cost: 20, cat: "enchanted", desc: "Talismanic Rune. Re-roll one personal die roll, one use (may be taken several times)." },
  { id: "dw-runespellbreaking", name: "Rune of Spellbreaking", cost: 25, cat: "enchanted", desc: "Talismanic Rune, Runesmiths only. Works exactly as a Dispel Magic Scroll. Max two per army (one if using the 'Veto One Spell' house rule).", restrictedTo: [{ tags: ["dwarfRunesmith"] }] },
  { id: "dw-mrstubbornness", name: "Master Rune of Sheer Damn Stubbornness", cost: 10, cat: "banner", desc: "Master Rune of Protection, BSB only. Unbreakable." },
  { id: "dw-mrchallenge", name: "Master Rune of Challenge", cost: 10, cat: "banner", desc: "Master Rune of Protection, BSB only. An enemy that could charge this regiment must pass an Ld test on 3D6 (2D6 if immune to psychology) or is forced to charge it." },
  { id: "dw-mrbattle", name: "Master Rune of Battle", cost: 75, cat: "banner", desc: "Master Rune of Protection, BSB only. The regiment adds 1D6 to combat resolution." },
  { id: "dw-mrstromni", name: "Master Rune of Stromni Redbeard", cost: 75, cat: "banner", desc: "Master Rune of Protection, BSB only. All friendly Dwarf units within 12\" add +1 to combat resolution." },
  { id: "dw-mrgroth", name: "Master Rune of Groth One-Eye", cost: 125, cat: "banner", desc: "Master Rune of Protection, BSB only. All friendly Dwarf units within 12\" take Ld/break tests without modifiers." },
  { id: "dw-mrvalaya", name: "Master Rune of Valaya", cost: 150, cat: "banner", desc: "Master Rune of Protection, BSB only. Natural dispel 4+ against all spells on the battlefield (incl. allied wizards/Anvil of Doom); remains-in-play spells auto-dispel at end of magic phase." },
  { id: "dw-runecourage", name: "Rune of Courage", cost: 10, cat: "banner", desc: "Rune of Protection, Longbeards only. Immune to panic.", restrictedTo: [{ regimentIds: ["longbeards"] }] },
  { id: "dw-runeurgency", name: "Rune of Urgency", cost: 25, cat: "banner", desc: "Rune of Protection. The regiment may take a Vanguard move before the battle begins." },
  { id: "dw-runeslowness", name: "Rune of Slowness", cost: 25, cat: "banner", desc: "Rune of Protection. Charging enemies have their charge move reduced by 1D6\" (multiple instances: roll more dice, take highest)." },
  { id: "dw-runewarding", name: "Rune of Warding", cost: 25, cat: "banner", desc: "Rune of Protection. Natural dispel 4+ (multiple instances: roll more dice, take highest)." },
  { id: "dw-runepassage", name: "Rune of Passage", cost: 25, cat: "banner", desc: "Rune of Protection. The bearer and his unit may march even with enemies within 8\"; treats difficult terrain as open." },
  { id: "dw-runeoathkeeping", name: "Rune of Oath-Keeping", cost: 25, cat: "banner", desc: "Rune of Protection. The regiment never loses its rank bonus when hit to the flank/rear (step-up is still cancelled, enemy still gets their combat res bonus)." },
  { id: "dw-runeguarding", name: "Rune of Guarding", cost: 40, cat: "banner", desc: "Rune of Protection, Hammerers only. If the general joins, they auto-pass Ld/break tests (may still break from fear-causing outnumbering etc.).", restrictedTo: [{ regimentIds: ["hammerers"] }] },
  { id: "dw-runefear", name: "Rune of Fear", cost: 40, cat: "banner", desc: "Rune of Protection. Causes fear." },
  { id: "dw-runeburning", name: "Rune of Burning", cost: 10, cat: "engineering", desc: "Engineering Rune. Ammunition counts as flaming." },
  { id: "dw-runeseeking", name: "Rune of Seeking", cost: 10, cat: "engineering", desc: "Engineering Rune, Bolt Throwers only. May shoot at fliers flying high with no long-range/large-target penalty.", restrictedTo: [{ regimentIds: ["boltthrowers"] }] },
  { id: "dw-runeforging", name: "Rune of Forging", cost: 10, cat: "engineering", desc: "Engineering Rune, Flame Cannons & Cannons only (not Organ Guns). Doesn't miss a turn on its first misfire (still blows up on a second).", restrictedTo: [{ regimentIds: ["cannons", "flamecannons"] }] },
  { id: "dw-runepenetrating", name: "Rune of Penetrating", cost: 10, cat: "engineering", desc: "Engineering Rune. +1 strength. Cost doubles if inscribed on a Gyrocopter (not modeled — apply manually)." },
  { id: "dw-runedisguise", name: "Rune of Disguise", cost: 15, cat: "engineering", desc: "Engineering Rune. The machine is invisible until an enemy comes within 1\" or it shoots. Cost doubles if inscribed on a Gyrocopter (not modeled — apply manually)." },
  { id: "dw-runetargeting", name: "Rune of Targeting", cost: 15, cat: "engineering", desc: "Engineering Rune, Bolt Throwers/Goblin Hewer/Cannons only. Bolt Throwers & Goblin Hewer get +1 to hit; Cannons may re-roll the first artillery die.", restrictedTo: [{ regimentIds: ["boltthrowers", "goblinhewer", "cannons"] }] },
  { id: "dw-runedemolishing", name: "Rune of Demolishing", cost: 15, cat: "engineering", desc: "Engineering Rune, Cannons only (not Flame Cannons/Organ Guns). Deals +1 wound (D3+1 total).", restrictedTo: [{ regimentIds: ["cannons"] }] },
  { id: "dw-runeimmolation", name: "Rune of Immolation", cost: 15, cat: "engineering", desc: "Engineering Rune. Self-destruct at will (including when the crew dies or fails a break test) — the crew and any enemy engaged with the machine suffer 1D6 S6 hits, no save." },
  { id: "dw-runeaccuracy", name: "Rune of Accuracy", cost: 30, cat: "engineering", desc: "Engineering Rune, Stone Throwers only. Re-roll the artillery die and/or scatter die after measuring the guessed distance.", restrictedTo: [{ regimentIds: ["smallstonethrowers", "largestonethrowers"] }] },
];

const DWARFS = {
  key: "dwarfs",
  name: "Dwarfs",
  tagline: "Stoic, ironclad holds standing against the dark and the endless grudge",
  magicItems: DWARF_MAGIC_ITEMS,
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
      id: "dwarflord", name: "Dwarf Lord", cost: 136, stat: "Dwarf Lord", magicItemSlots: 3, magicItemCategoryFilter: ["weapon", "armour", "enchanted", "banner"], tags: ["dwarfLord"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour, and a shield, all for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Handgun", "Crossbow", "Two pistols"] },
      mounts: [
        { id: "shield", name: "Carried atop a shield (general only) — +2 attacks, first wound ignored; takes the place of two infantrymen", cost: 25 },
        { id: "throne", name: "Carried atop a Throne of Power (general only) — +4 attacks, ignores first two wounds, cannot march; takes the place of six or nine infantrymen", cost: 50 },
      ],
    },
    {
      id: "dwarfhero", name: "Dwarf Hero", cost: 82, stat: "Dwarf Hero", magicItemSlots: 2, magicItemCategoryFilter: ["weapon", "armour", "enchanted", "banner"],
      gearNote: "May join a war machine (except Organ Guns) and act as an Engineer — the machine may use his BS and re-roll misfires (except bouncing cannon balls); he can't shoot his own weapons while operating it. May take light armour, heavy armour, or Gromril Armour, and a shield, all for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Handgun", "Crossbow", "Two pistols"] },
    },
    {
      id: "dwarfbsb", name: "Dwarf Battle Standard Bearer", cost: 92, stat: "Dwarf BSB", magicItemSlots: 1, restriction: "0-1", magicItemCategoryFilter: ["weapon", "armour", "enchanted", "banner"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour for free. The one item may be a magic banner.",
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
      id: "runelord", name: "Runelord", cost: 160, stat: "Runelord", magicItemSlots: 3, magicItemCategoryFilter: ["weapon", "armour", "enchanted", "banner"], tags: ["dwarfRunesmith"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour, and a shield, all for free. One Runesmith in the army may bring an Anvil of Doom (attended by two Anvil Guard Hammerers) — while operating it, he casts as a level 4 wizard using Bright Magic's Blast/Fireball/Piercing Bolts of Burning/The Burning Head, expending power cards as normal.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      anvilOption: { label: "Anvil of Doom (+2 Anvil Guard Hammerers)", cost: 100 },
    },
    {
      id: "masterrunesmith", name: "Master Runesmith", cost: 120, stat: "Master Runesmith", magicItemSlots: 2, magicItemCategoryFilter: ["weapon", "armour", "enchanted", "banner"], tags: ["dwarfRunesmith"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour, and a shield, all for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      anvilOption: { label: "Anvil of Doom (+2 Anvil Guard Hammerers)", cost: 110 },
    },
    {
      id: "runesmith", name: "Runesmith", cost: 80, stat: "Runesmith", magicItemSlots: 1, magicItemCategoryFilter: ["weapon", "armour", "enchanted", "banner"], tags: ["dwarfRunesmith"],
      gearNote: "May take light armour, heavy armour, or Gromril Armour, and a shield, all for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      anvilOption: { label: "Anvil of Doom (+2 Anvil Guard Hammerers)", cost: 120 },
    },
  ],
  regiments: [
    {
      id: "hammerers", name: "Hammerers", perModel: 15, minSize: 5, stat: "Dwarf Elite Soldier", command: "standard", restriction: "0-1",
      note: "Gromril Armour and double handed weapons.",
      options: [
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
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
        { id: "dhw", group: null, label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Dwarf Commander", baseCost: 30, magicItemSlots: 1, stat: "Dwarf Commander" },
    },
    {
      id: "trollslayers", name: "Troll Slayers", perModel: 13, minSize: 5, stat: "Troll Slayer", command: "standard",
      note: "Additional hand weapons by default. Unbreakable, never armoured or shielded, always wound on 4+ regardless of toughness.",
      options: [
        { id: "dhw", group: null, label: "Swap additional hand weapons for double handed weapons (free)", cost: 0, per: "model" },
      ],
      extraOption: { label: "Slayer-Berserkers (work like Night Goblin Fanatics)", cost: 30, max: 3, note: "Unofficial — needs your opponent's consent to field." },
      champion: { name: "Giant Slayer", baseCost: 20, magicItemSlots: 1, stat: "Giant Slayer", magicItemCategoryFilter: ["weapon"] },
    },
    {
      id: "dwarfcrossbowmen", name: "Dwarf Crossbowmen", perModel: 11, minSize: 5, stat: "Dwarf Soldier", command: "standard",
      note: "Crossbows and light armour.",
      options: [
        { id: "heavyarmour", group: "armourshield", label: "Heavy armour instead of light (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: "armourshield", label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "both", group: "armourshield", label: "Heavy armour and shields (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "dwarfrangers", name: "Dwarf Rangers", perModel: 16, minSize: 5, stat: "Dwarf Soldier", command: "standard", restriction: "0-1",
      note: "Crossbows, light armour, shields. May skirmish and use the scout special rules.",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+2pt/model)", cost: 2, per: "model" },
        { id: "dhw", group: null, label: "Double handed weapons (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "dwarfminers", name: "Dwarf Miners", minSize: 5, stat: "Dwarf Soldier", command: "standard", restriction: "0-1",
      note: "Double handed weapons and light armour. May Ambush (arrive from a table edge on turn 2 instead of deploying, as if pursuing out of the table).",
      tieredPricing: { baseCost: 80, baseSize: 5, extraPerModel: 11 },
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "dwarfwarriors", name: "Dwarf Warriors", perModel: 7, minSize: 5, stat: "Dwarf Soldier", command: "standard",
      note: "Light armour by default. Costs 1pt more (8pts) if fielded as allies for another army.",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
    {
      id: "dwarfthunderers", name: "Dwarf Thunderers", perModel: 11, minSize: 5, stat: "Dwarf Soldier", command: "standard",
      note: "Hand guns and light armour.",
      options: [
        { id: "heavyarmour", group: "armourshield", label: "Heavy armour instead of light (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: "armourshield", label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "both", group: "armourshield", label: "Heavy armour and shields (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Dwarf Champion" },
    },
  ],
  chariotsMonsters: [
    {
      id: "boltthrowers", name: "Bolt Throwers", perUnit: 55, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Manned by three Dwarf Soldiers. Crew may take light or heavy armour (not modeled individually — folded into the flat cost).",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
    },
    {
      id: "smallstonethrowers", name: "Small Stone Throwers", perUnit: 85, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
    },
    {
      id: "largestonethrowers", name: "Large Stone Throwers", perUnit: 100, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
    },
    {
      id: "cannons", name: "Cannons", perUnit: 100, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Normal cannon. Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
    },
    {
      id: "organgun", name: "Organ Gun", perUnit: 155, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine", restriction: "0-1",
      note: "Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
    },
    {
      id: "flamecannons", name: "Flame Cannons", perUnit: 90, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Guess range like a cannon (max 12\") plus the artillery die; teardrop template, S5 hit (1 wound = 1D3). Any casualty forces a panic test. Uniquely, Flame Cannons may stand & shoot (resolved before the enemy unit moves). Manned by three Dwarf Soldiers.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Dwarf Soldier crew",
      magicItemSlots: 3, magicItemCategoryFilter: ["engineering"],
    },
    {
      id: "gyrocopters", name: "Gyrocopter", perUnit: 100, stat: "Gyrocopter", kind: "quantity",
      note: "Works like a flying light chariot with no steeds and one Dwarf Soldier crewman. Won't charge but can be charged; if beaten or broken it scatters 2D6\" and crashes for 2D6 S4 hits on whatever it lands on (counts as slain). Fires once per turn — either a bomb (3\" template, scatters on a miss, S5, panic test on any casualty) or its steam cannon (teardrop template, S3, no save; unusable after flying high or 10\"+ that turn).",
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
  name: "The Grand Army of Bretonnia",
  tagline: "Chivalrous knights and the peasant levy that bears the realm's weight",
  magicItems: BRETONNIA_MAGIC_ITEMS,
  armyWideRules: [
    "Bretonnian Warhorses are bred for war over generations and don't suffer the usual -1 movement penalty for wearing barding.",
    "A Knight's Army: the general must be a knightly character (never a wizard), and the army must include at least one regiment of knights (a Chevaliers regiment).",
    "Knightly Disdain: knightly regiments (Chevaliers) and knightly characters ignore panic caused by anything except other knightly regiments/characters (or regiments a knightly character has joined). Knightly characters will never join a Peasant regiment.",
    "This builder models the default, darker version of Bretonnia (war machines and peasant levies). The alternate 'Heroic Army' variant (Lance Formation, no common peasants) is described in an appendix that wasn't in the provided text, so it isn't modeled here.",
    "Knightly Virtues: each knightly character may take one Virtue, and each Virtue may only appear once in the army. A Virtue counts as, and takes up a slot from, the character's normal magic item allowance rather than being separate — this builder enforces the one-per-army uniqueness automatically, but doesn't hard-cap a character to exactly one Virtue if they have multiple item slots free, so keep that limit in mind yourself.",
  ],
  characters: [
    {
      id: "knightlylord", name: "Knightly Lord", cost: 100, stat: "Knightly Lord", magicItemSlots: 3, tags: ["knightly"],
      gearNote: "May take a shield and heavy armour for free.",
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
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 15, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 50, stat: "Pegasus" },
        { id: "hippogriff", name: "Hippogriff", cost: 150, stat: "Hippogriff" },
      ],
    },
    {
      id: "knightlybsb", name: "Knightly Battle Standard Bearer", cost: 100, stat: "Knightly BSB", magicItemSlots: 1, restriction: "0-1", tags: ["knightly"],
      gearNote: "May take heavy armour for free. The one item may be a magic banner, or may instead be a knightly Virtue.",
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 10, stat: "Warhorse" },
      ],
    },
    {
      id: "wizardlord", name: "Wizard Lord (level 4)", cost: 240, stat: "Wizard Lord", magicItemSlots: 4,
      gearNote: "May take College Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "unicorn", name: "Unicorn (unmarried female wizards only)", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "hippogriff", name: "Hippogriff", cost: 140, stat: "Hippogriff" },
      ],
    },
    {
      id: "masterwizard", name: "Master Wizard (level 3)", cost: 170, stat: "Master Wizard", magicItemSlots: 3,
      gearNote: "May take College Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "unicorn", name: "Unicorn (unmarried female wizards only)", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizardchampion", name: "Wizard Champion (level 2)", cost: 110, stat: "Wizard Champion", magicItemSlots: 2,
      gearNote: "May take College Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "unicorn", name: "Unicorn (unmarried female wizards only)", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizard", name: "Wizard (level 1)", cost: 50, stat: "Wizard", magicItemSlots: 1,
      gearNote: "May take College Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
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
        { id: "spears", group: "melee", label: "Spears (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "rapscallions", name: "Rapscallions", perModel: 5, minSize: 5, stat: "Peasant", command: "standard",
      note: "Peasants with longbows.",
      options: [
        { id: "crossbows", group: null, label: "Crossbows instead of longbows (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "ribalds", name: "Ribalds", perModel: 5, minSize: 5, stat: "Man-at-Arms", command: "standard",
      note: "Men-at-Arms with light armour.",
      options: [
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "arbalestiers", name: "Arbalestiers", perModel: 9, minSize: 5, stat: "Man-at-Arms", command: "standard",
      note: "Men-at-Arms with crossbows.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "pavise", group: null, label: "Pavise — 5+ save vs shooting only, 4+ combined with light armour (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "archers", name: "Archers", perModel: 7, minSize: 5, stat: "Man-at-Arms", command: "standard",
      note: "Men-at-Arms with longbows. May skirmish.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "zealots", name: "Zealots", perModel: 5, minSize: 5, stat: "Peasant", command: "standard", restriction: "0-1",
      note: "Peasants with shields. Hate all enemies. If the regiment includes at least 4 Zealots (beyond command/champion/other characters) carrying the Reliquary, it's held aloft — the regiment is immune to fear and gains Ld10.",
      options: [
        { id: "armour", group: null, label: "Light armour (+1pt/model)", cost: 1, per: "model" },
        { id: "reliquary", group: null, label: "Four Zealots carry the Reliquary (+20pts flat)", cost: 20, per: "flat" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "chasseursdelamort", name: "Chasseurs de la Mort", perModel: 9, minSize: 5, stat: "Man-at-Arms", mountStat: "Normal Horse", mountLabel: "Normal Horse", command: "fastCavalry",
      note: "Men-at-Arms riding Normal Horses.",
      options: [
        { id: "armour", group: null, label: "Light armour (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "spears", group: null, label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "bows", group: null, label: "Bows — may then skirmish (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Commoner Champion", baseCost: 20, magicItemSlots: 1, stat: "Commoner Champion", tags: ["commoner"] },
    },
    {
      id: "chevalierserrant", name: "Chevaliers Errant", perModel: 18, minSize: 5, stat: "Bretonnian Knight", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard", restriction: "0-1",
      note: "Young Knights with heavy armour, shields, and lances, on Warhorses. Unbreakable while accompanied by a living unmarried female wizard.",
      options: [
        { id: "barding", group: null, label: "Barding (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersfeodaux", name: "Chevaliers Féodaux", perModel: 22, minSize: 5, stat: "Bretonnian Knight", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard",
      note: "Knights with heavy armour, shields, and lances, on Warhorses.",
      options: [
        { id: "barding", group: null, label: "Barding (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersenquete", name: "Chevaliers en Quête", perModel: 17, minSize: 5, stat: "Bretonnian Knight", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard", restriction: "0-1",
      note: "Knights with heavy armour and double handed weapons, on Warhorses.",
      options: [
        { id: "barding", group: null, label: "Barding (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersdhonneur", name: "Chevaliers D'Honneur", perModel: 35, minSize: 5, stat: "Elite Knight", mountStat: "Warhorse", mountLabel: "Warhorse (barded)", command: "standard", restriction: "0-1",
      note: "Barding, heavy armour, shields, and lances, on Warhorses.",
      champion: { name: "The King's Champion", baseCost: 30, magicItemSlots: 1, stat: "The King's Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersapied", name: "Chevaliers á Pied", perModel: 10, minSize: 5, statNote: "Knights with heavy armour and shields (on foot).", command: "standard", restriction: "0-1",
      options: [
        { id: "dhw", group: null, label: "Swap shields for double handed weapons (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Knightly Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["knightly"] },
    },
    {
      id: "chevaliersvolants", name: "Chevaliers Volants", perModel: 55, minSize: 3, statNote: "Flying monstrous regiment. Knights with heavy armour, shields, and lances, on Pegasi.", command: "monstrous", restriction: "0-1",
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
  name: "Orcs & Goblins",
  tagline: "An unstoppable, uncontrollable storm of green promising destruction wherever it goes",
  magicItems: ORC_MAGIC_ITEMS,
  armyWideRules: [
    "Difficult to Master: this is arguably the most complex army to play, full of animosity tests, compulsory moves, exploding Shamans, and units that barely listen to orders. Most of that is battle-phase behavior rather than list-building, so this builder tracks points/composition faithfully but doesn't simulate dice-driven chaos like Fanatic scatter, Squig-Hopper bouncing, or Doom Diver misfires — those are called out as rules text on the relevant entries instead.",
    "Animosity: at the start of the turn, before movement, each Orc & Goblin regiment not engaged/fleeing (Trolls, Ogres, and similar excepted) tests animosity — 1 in 6 triggers a re-roll; a bad second roll (1-5) freezes the unit for the turn, a 6 forces it 2D6\" toward the nearest visible enemy and a mandatory charge next turn. War machines, chariots, and other non-regiment units never test.",
    "Fielding a type requires a regiment of that type: you can't field characters, war machine crew, or chariots of a given Orc/Goblin type unless the army already includes at least one regiment of that type (infantry or cavalry). This isn't hard-enforced by the builder — keep it in mind when building your list.",
    "Common Orcs ignore panic caused by Goblins. Big'uns are just larger, fiercer Common Orcs, not a separate race.",
    "Savage Orcs are frenzied (and still ignore Goblin-caused panic even without frenzy), never wear armour beyond a shield (relying on magic tattoos instead — treated as light armour, plus a 6+ ward save that improves to 5+ if a Savage Orc Shaman joins the regiment, benefiting the Shaman too).",
    "Black Orcs are immune to animosity and quell it in any non-Black-Orc regiment a Black Orc character joins. They ignore panic from Goblins and other Orc types, and only heed the leadership of Black Orc characters or the general.",
    "War Boars grant the rider a barded-equivalent armour save with no movement penalty, but Boar Riders can never count as fast cavalry. Boars grant +2S on the charge.",
    "All Goblins (Common, Night, Forest) fear Elves unless they outnumber them two-to-one. Without any Orcs in the army, Common Goblin character Ld all increase by 1 (this includes Grom) — not enforced by the builder. Night Goblins hate Dwarfs but not Chaos Dwarfs. Forest Goblins (including Spider Riders) cross woods without movement penalty, and in an army with no Orcs at all, Forest Goblin short bows may be upgraded to poisoned arrows — offered here as a normal purchasable option without enforcing the no-Orcs condition.",
    "Night Goblin Shamans carry a magic mushroom (eat it for 1D6 extra magic cards, risking an explosive death on a failed Waaagh test) — a battle-phase mechanic, not modeled here.",
  ],
  characters: [
    {
      id: "blackorcwarlord", name: "Black Orc Warlord", cost: 148, stat: "Black Orc Warlord", magicItemSlots: 3, tags: ["blackOrc"],
      gearNote: "May take a shield and either light or heavy armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 33, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 167, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "blackorchero", name: "Black Orc Hero", cost: 89, stat: "Black Orc Hero", magicItemSlots: 2, tags: ["blackOrc"],
      gearNote: "May take a shield and either light or heavy armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 24, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 158, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "blackorcbsb", name: "Black Orc Battle Standard Bearer", cost: 96, stat: "Black Orc BSB", magicItemSlots: 1, restriction: "0-1", tags: ["blackOrc"],
      gearNote: "May take light or heavy armour for free. The one item may be a magic banner.",
      mounts: [
        { id: "boar", name: "War Boar", cost: 15, stat: "War Boar" },
      ],
    },
    {
      id: "commonorcwarlord", name: "Common Orc Warlord", cost: 100, stat: "Orc Warlord", magicItemSlots: 3, tags: ["commonOrc"],
      gearNote: "May take a shield and light armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Bow", "Crossbow"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 21, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
        { id: "wyvern", name: "Wyvern", cost: 155, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "commonorchero", name: "Common Orc Hero", cost: 60, stat: "Orc Hero", magicItemSlots: 2, tags: ["commonOrc"],
      gearNote: "May take a shield and light armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Bow", "Crossbow"] },
      mounts: [
        { id: "boar", name: "War Boar", cost: 16, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
        { id: "wyvern", name: "Wyvern", cost: 150, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "commonorcbsb", name: "Common Orc Battle Standard Bearer", cost: 80, stat: "Orc BSB", magicItemSlots: 1, restriction: "0-1", tags: ["commonOrc"],
      gearNote: "May take light armour for free. The one item may be a magic banner.",
      mounts: [
        { id: "boar", name: "War Boar", cost: 11, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "commonorcshamanlord", name: "Common Orc Shaman Lord (level 4)", cost: 220, stat: "Orc Shaman Lord", magicItemSlots: 4, tags: ["commonOrc", "commonOrcShaman"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "boar", name: "War Boar (free)", cost: 0, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
        { id: "wyvern", name: "Wyvern", cost: 140, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "commonorcmastershaman", name: "Common Orc Master Shaman (level 3)", cost: 155, stat: "Orc Master Shaman", magicItemSlots: 3, tags: ["commonOrc", "commonOrcShaman"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "boar", name: "War Boar (free)", cost: 0, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "commonorcshamanchampion", name: "Common Orc Shaman Champion (level 2)", cost: 100, stat: "Orc Shaman Champion", magicItemSlots: 2, tags: ["commonOrc", "commonOrcShaman"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "boar", name: "War Boar (free)", cost: 0, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "commonorcshaman", name: "Common Orc Shaman (level 1)", cost: 45, stat: "Orc Shaman", magicItemSlots: 1, tags: ["commonOrc", "commonOrcShaman"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "boar", name: "War Boar (free)", cost: 0, stat: "War Boar" },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0, stat: "Heavy Chariot" },
      ],
    },
    {
      id: "savageorcwarlord", name: "Savage Orc Warlord", cost: 130, stat: "Orc Warlord", magicItemSlots: 3, tags: ["savageOrc"],
      gearNote: "Adorned with magic tattoos (as light armour, plus a 6+/5+ ward — see army-wide rules). May take a shield for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Bow", cost: 10 },
      mounts: [
        { id: "boar", name: "War Boar", cost: 27, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 161, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "savageorchero", name: "Savage Orc Hero", cost: 90, stat: "Orc Hero", magicItemSlots: 2, tags: ["savageOrc"],
      gearNote: "Adorned with magic tattoos (as light armour, plus a 6+/5+ ward — see army-wide rules). May take a shield for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Bow", cost: 10 },
      mounts: [
        { id: "boar", name: "War Boar", cost: 20, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 154, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "savageorcbsb", name: "Savage Orc Battle Standard Bearer", cost: 90, stat: "Orc BSB", magicItemSlots: 1, restriction: "0-1", tags: ["savageOrc"],
      gearNote: "Adorned with magic tattoos. The one item may be a magic banner.",
      mounts: [
        { id: "boar", name: "War Boar", cost: 13, stat: "War Boar" },
      ],
    },
    {
      id: "savageorcshamanlord", name: "Savage Orc Shaman Lord (level 4)", cost: 250, stat: "Orc Shaman Lord", magicItemSlots: 4, tags: ["savageOrc", "savageOrcShaman"],
      gearNote: "Adorned with magic tattoos. Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "boar", name: "War Boar (free)", cost: 0, stat: "War Boar" },
        { id: "wyvern", name: "Wyvern", cost: 140, stat: "Wyvern (Orc)" },
      ],
    },
    {
      id: "savageorcmastershaman", name: "Savage Orc Master Shaman (level 3)", cost: 185, stat: "Orc Master Shaman", magicItemSlots: 3, tags: ["savageOrc", "savageOrcShaman"],
      gearNote: "Adorned with magic tattoos. Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "boar", name: "War Boar (free)", cost: 0, stat: "War Boar" },
      ],
    },
    {
      id: "savageorcshamanchampion", name: "Savage Orc Shaman Champion (level 2)", cost: 130, stat: "Orc Shaman Champion", magicItemSlots: 2, tags: ["savageOrc", "savageOrcShaman"],
      gearNote: "Adorned with magic tattoos. Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "boar", name: "War Boar (free)", cost: 0, stat: "War Boar" },
      ],
    },
    {
      id: "savageorcshaman", name: "Savage Orc Shaman (level 1)", cost: 75, stat: "Orc Shaman", magicItemSlots: 1, tags: ["savageOrc", "savageOrcShaman"],
      gearNote: "Adorned with magic tattoos. Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "boar", name: "War Boar (free)", cost: 0, stat: "War Boar" },
      ],
    },
    {
      id: "commongoblinwarlord", name: "Common Goblin Warlord", cost: 60, stat: "Goblin Warlord", magicItemSlots: 3, tags: ["commonGoblin"],
      gearNote: "May take a shield and light armour for free.",
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
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 11, stat: "Giant Wolf" },
        { id: "chariot", name: "Wolf Chariot (for the price of the chariot)", cost: 0, stat: "Light Chariot" },
        { id: "spider", name: "Monstrous Spider", cost: 37, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinbsb", name: "Common Goblin Battle Standard Bearer", cost: 60, stat: "Goblin BSB", magicItemSlots: 1, restriction: "0-1", tags: ["commonGoblin"],
      gearNote: "May take light armour for free. The one item may be a magic banner.",
      mounts: [
        { id: "wolf", name: "Giant Wolf", cost: 9, stat: "Giant Wolf" },
        { id: "chariot", name: "Wolf Chariot (for the price of the chariot)", cost: 0, stat: "Light Chariot" },
      ],
    },
    {
      id: "commongoblinshamanlord", name: "Common Goblin Shaman Lord (level 4)", cost: 170, stat: "Goblin Shaman Lord", magicItemSlots: 4, tags: ["commonGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "wolf", name: "Giant Wolf (free)", cost: 0, stat: "Giant Wolf" },
        { id: "chariot", name: "Wolf Chariot (for the price of the chariot)", cost: 0, stat: "Light Chariot" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinmastershaman", name: "Common Goblin Master Shaman (level 3)", cost: 120, stat: "Goblin Master Shaman", magicItemSlots: 3, tags: ["commonGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "wolf", name: "Giant Wolf (free)", cost: 0, stat: "Giant Wolf" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinshamanchampion", name: "Common Goblin Shaman Champion (level 2)", cost: 75, stat: "Goblin Shaman Champion", magicItemSlots: 2, tags: ["commonGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "wolf", name: "Giant Wolf (free)", cost: 0, stat: "Giant Wolf" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "commongoblinshaman", name: "Common Goblin Shaman (level 1)", cost: 30, stat: "Goblin Shaman", magicItemSlots: 1, tags: ["commonGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "wolf", name: "Giant Wolf (free)", cost: 0, stat: "Giant Wolf" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinwarlord", name: "Forest Goblin Warlord", cost: 60, stat: "Goblin Warlord", magicItemSlots: 3, tags: ["forestGoblin"],
      gearNote: "May take a shield for free.",
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
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 10, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 37, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinbsb", name: "Forest Goblin Battle Standard Bearer", cost: 60, stat: "Goblin BSB", magicItemSlots: 1, restriction: "0-1", tags: ["forestGoblin"],
      gearNote: "The one item may be a magic banner.",
      mounts: [
        { id: "spidersteed", name: "Giant Spider", cost: 8, stat: "Giant Spider" },
      ],
    },
    {
      id: "forestgoblinshamanlord", name: "Forest Goblin Shaman Lord (level 4)", cost: 170, stat: "Goblin Shaman Lord", magicItemSlots: 4, tags: ["forestGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (4).",
      mounts: [
        { id: "spidersteed", name: "Giant Spider (free)", cost: 0, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinmastershaman", name: "Forest Goblin Master Shaman (level 3)", cost: 120, stat: "Goblin Master Shaman", magicItemSlots: 3, tags: ["forestGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (3).",
      mounts: [
        { id: "spidersteed", name: "Giant Spider (free)", cost: 0, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinshamanchampion", name: "Forest Goblin Shaman Champion (level 2)", cost: 75, stat: "Goblin Shaman Champion", magicItemSlots: 2, tags: ["forestGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (2).",
      mounts: [
        { id: "spidersteed", name: "Giant Spider (free)", cost: 0, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "forestgoblinshaman", name: "Forest Goblin Shaman (level 1)", cost: 30, stat: "Goblin Shaman", magicItemSlots: 1, tags: ["forestGoblin"],
      gearNote: "Takes Waaagh! Spells. May take as many magic items as levels (1).",
      mounts: [
        { id: "spidersteed", name: "Giant Spider (free)", cost: 0, stat: "Giant Spider" },
        { id: "spider", name: "Monstrous Spider", cost: 32, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinwarlord", name: "Night Goblin Warlord", cost: 60, stat: "Goblin Warlord", magicItemSlots: 3, tags: ["nightGoblin"],
      gearNote: "May take a shield for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "spider", name: "Monstrous Spider", cost: 40, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinhero", name: "Night Goblin Hero", cost: 36, stat: "Goblin Hero", magicItemSlots: 2, tags: ["nightGoblin"],
      gearNote: "May take a shield for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      bowOption: { label: "Short bow", cost: 10 },
      mounts: [
        { id: "spider", name: "Monstrous Spider", cost: 37, stat: "Monstrous Spider" },
      ],
    },
    {
      id: "nightgoblinbsb", name: "Night Goblin Battle Standard Bearer", cost: 60, stat: "Goblin BSB", magicItemSlots: 1, restriction: "0-1", tags: ["nightGoblin"],
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
      id: "orcboyz", name: "Orc Boyz", perModel: 5, minSize: 5, stat: "Common Orc", command: "standard",
      note: "Light armour. Ignore panic caused by Goblins.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons (+1pt/model)", cost: 1, per: "model" },
        { id: "spear", group: "melee", label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "halberd", group: "melee", label: "Halberds (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Common Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Common Orc Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcarrerboyz", name: "Orc Arrer Boyz", perModel: 7, minSize: 5, stat: "Common Orc", command: "standard",
      note: "Bows. Ignore panic caused by Goblins.",
      options: [
        { id: "crossbows", group: null, label: "Crossbows instead of bows (+2pt/model)", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Common Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Common Orc Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcboarboyz", name: "Orc Boar Boyz", perModel: 15, minSize: 5, statNote: "Common Orcs with light armour and shields on War Boars (barded-equivalent save with no movement penalty; can't be fast cavalry; boars grant +2S on the charge).", command: "standard",
      note: "Ignore panic caused by Goblins.",
      options: [
        { id: "spear", group: null, label: "Spears (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Common Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Common Orc Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcbiguns", name: "Orc Big'uns", perModel: 7, minSize: 5, stat: "Orc Big'un", command: "standard",
      note: "Light armour. Ignore panic caused by Goblins.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "spear", group: "melee", label: "Spears (+3pt/model)", cost: 3, per: "model" },
        { id: "halberd", group: "melee", label: "Halberds (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Orc Big'un Champion", baseCost: 20, magicItemSlots: 1, stat: "Orc Big'un Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcbigunarrerboyz", name: "Orc Big'un Arrer Boyz", perModel: 9, minSize: 5, stat: "Orc Big'un", command: "standard",
      note: "Bows. Ignore panic caused by Goblins.",
      options: [
        { id: "crossbows", group: null, label: "Crossbows instead of bows (+2pt/model)", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Orc Big'un Champion", baseCost: 20, magicItemSlots: 1, stat: "Orc Big'un Champion", tags: ["commonOrc"] },
    },
    {
      id: "orcbigunboarboyz", name: "Orc Big'un Boar Boyz", perModel: 18, minSize: 5, statNote: "Big'uns with light armour and shields on War Boars (barded-equivalent save, no fast cavalry, +2S charge).", command: "standard",
      note: "Ignore panic caused by Goblins.",
      options: [
        { id: "spear", group: null, label: "Spears (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Orc Big'un Champion", baseCost: 20, magicItemSlots: 1, stat: "Orc Big'un Champion", tags: ["commonOrc"] },
    },
    {
      id: "savageorcs", name: "Savage Orcs", perModel: 8, minSize: 5, stat: "Savage Orc", command: "standard",
      note: "Magic tattoos (see army-wide rules). Frenzied; still ignore Goblin panic even without frenzy.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons (+1pt/model)", cost: 1, per: "model" },
        { id: "spear", group: "melee", label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+4pt/model)", cost: 4, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Savage Orc Champion", baseCost: 30, magicItemSlots: 1, stat: "Savage Orc Champion", tags: ["savageOrc"] },
    },
    {
      id: "savageorcarrerboyz", name: "Savage Orc Arrer Boyz", perModel: 10, minSize: 5, stat: "Savage Orc", command: "standard",
      note: "Magic tattoos and bows. Frenzied; still ignore Goblin panic even without frenzy.",
      champion: { name: "Savage Orc Champion", baseCost: 30, magicItemSlots: 1, stat: "Savage Orc Champion", tags: ["savageOrc"] },
    },
    {
      id: "savageorcboarboyz", name: "Savage Orc Boar Boyz", perModel: 20, minSize: 5, statNote: "Savage Orcs with magic tattoos and shields on War Boars (barded-equivalent save, no fast cavalry, +2S charge).", command: "standard",
      note: "Frenzied; still ignore Goblin panic even without frenzy.",
      options: [
        { id: "spear", group: null, label: "Spears (+3pt/model)", cost: 3, per: "model" },
        { id: "bows", group: null, label: "Bows (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Savage Orc Champion", baseCost: 30, magicItemSlots: 1, stat: "Savage Orc Champion", tags: ["savageOrc"] },
    },
    {
      id: "blackorcs", name: "Black Orcs", perModel: 9, minSize: 5, stat: "Black Orc", command: "standard",
      note: "Light armour. Immune to animosity; ignore panic from Goblins and other Orc types; only heed Black Orc / general leadership.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "spear", group: "melee", label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "halberd", group: "melee", label: "Halberds (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+2pt/model)", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Black Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Black Orc Champion", tags: ["blackOrc"] },
    },
    {
      id: "commongoblininfantry", name: "Common Goblin Infantry", perModel: 2.5, minSize: 5, stat: "Common Goblin", command: "standard",
      note: "Fear Elves unless outnumbering them two-to-one.",
      options: [
        { id: "spear", group: "melee", label: "Spears (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "shortbows", group: null, label: "Short bows (+1pt/model)", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "shields", group: null, label: "Shields (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Common Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Common Goblin Champion", tags: ["commonGoblin"] },
    },
    {
      id: "commongoblinwolfriders", name: "Common Goblin Wolf Riders", perModel: 9, minSize: 5, statNote: "Common Goblins on Giant Wolves.", command: "fastCavalry",
      note: "Fear Elves unless outnumbering them two-to-one. Fast cavalry.",
      options: [
        { id: "spear", group: null, label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "shortbows", group: null, label: "Short bows (+1pt/model)", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Common Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Common Goblin Champion", tags: ["commonGoblin"] },
    },
    {
      id: "forestgoblinspiderriders", name: "Forest Goblin Spider Riders", perModel: 8, minSize: 5, statNote: "Forest Goblins on Giant Spiders (poisonous +1S attacks, cross terrain freely).", command: "fastCavalry",
      note: "Fear Elves unless outnumbering them two-to-one. Fast cavalry.",
      options: [
        { id: "spear", group: null, label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "shortbows", group: null, label: "Short bows (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Forest Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Forest Goblin Champion", tags: ["forestGoblin"] },
    },
    {
      id: "forestgoblininfantry", name: "Forest Goblin Infantry", perModel: 2.5, minSize: 5, stat: "Forest Goblin", command: "standard",
      note: "Fear Elves unless outnumbering them two-to-one. Cross woods without movement penalty.",
      options: [
        { id: "spear", group: "melee", label: "Spears (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "shortbows", group: "melee", label: "Short bows (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields, only if not armed with short bows (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Forest Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Forest Goblin Champion", tags: ["forestGoblin"] },
    },
    {
      id: "nightgoblininfantry", name: "Night Goblin Infantry", perModel: 2.5, minSize: 5, stat: "Night Goblin", command: "standard",
      note: "Fear Elves unless outnumbering them two-to-one. Hate Dwarfs (not Chaos Dwarfs). May conceal up to 3 hidden Fanatics — released and scattering wildly the moment an enemy comes within 8\" (see the full rules in the book); Fanatics don't count toward the regiment's 50pt minimum.",
      options: [
        { id: "spear", group: "melee", label: "Spears (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "shortbows", group: "melee", label: "Short bows (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields, only if not armed with short bows (+0.5pt/model)", cost: 0.5, per: "model" },
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
      id: "nightgoblinnettersclubbers", name: "Night Goblin Netters and Clubbers", perModel: 6, minSize: 5, stat: "Night Goblin", command: "standard",
      note: "Nets and clubs — treated as double handed weapons that strike first (the net effect stacks with itself, so they strike first twice over, not just cancelling the double-handed-weapon strike-last penalty).",
      champion: { name: "Night Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Night Goblin Champion", tags: ["nightGoblin"] },
    },
    {
      id: "trolls", name: "Trolls", perModel: 40, minSize: 3, stat: "Trolls", command: "none",
      note: "Must be River Trolls (free), Stone Trolls (free), or Chaos Trolls (+5pt/model). Cannot take a standard bearer, musician, or champion. Monstrous, stupid, immune to psychology, cause fear, regenerate on 4+; may vomit instead of attacking (auto-hit S5, no save, 1D3 wounds). River: crosses water freely, enemies -1 to hit in melee (living only). Stone: 2+ natural dispel. Chaos: +1 Attack.",
      options: [
        { id: "chaostrolls", group: null, label: "Chaos Trolls, +1 Attack (+5pt/model)", cost: 5, per: "model" },
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
        { id: "heavyarmour", group: "armour", label: "Heavy armour instead of light (+4pt/model)", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons (+6pt/model)", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails (+8pt/model)", cost: 8, per: "model" },
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
      id: "goblinwolfchariots", name: "Goblin Wolf Chariot", perUnit: 44, stat: "Light Chariot", kind: "chariot",
      note: "Light Chariot pulled by two Giant Wolves, crewed by two Common Goblins with light armour, spears, shields and short bows (5+ combined save).",
      extraCrewCost: 6, extraCrewLabel: "extra Common Goblin crew", extraSteedCost: 8, extraSteedLabel: "extra Giant Wolves",
      scythedWheelsCost: 10, commanderCost: 15, commanderLabel: "One crewman is a Common Goblin Champion", commanderMagicItemSlots: 1,
    },
    {
      id: "orcboarchariots", name: "Orc Boar Chariot", perUnit: 52, stat: "Heavy Chariot", kind: "chariot",
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
      id: "gargantuanspider", name: "Gargantuan Spider", perUnit: 225, stat: "Gargantuan Spider", kind: "quantity", restriction: "0-1",
      note: "Only summonable if the general is a Forest Goblin and the army includes a Forest Goblin Shaman. Large monster, causes terror, 4+ armour save, immune to psychology, poisonous (+1S vs living). Too large to be a forester or scale buildings like regular spiders. Carries a howdah of 8 Forest Goblins with poisoned short bows shooting in a 360° arc with no movement penalty; damage always goes to the spider, and its death slays the whole model.",
    },
    {
      id: "spearchukkasgoblins", name: "Spear Chukkas (Goblin crew)", perUnit: 42.5, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Bolt thrower with three Common Goblin crewmen.",
      extraCrewCost: 2.5, extraCrewMax: 2, extraCrewLabel: "extra Common Goblin crew",
    },
    {
      id: "spearchukkasorcs", name: "Spear Chukkas (Orc crew)", perUnit: 50, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Bolt thrower with three Common Orc crewmen.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Common Orc crew",
    },
    {
      id: "smallrocklobbersgoblins", name: "Small Rock Lobbers (Goblin crew)", perUnit: 72.5, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Stone Thrower with three Common Goblin crewmen.",
      extraCrewCost: 2.5, extraCrewMax: 2, extraCrewLabel: "extra Common Goblin crew",
    },
    {
      id: "smallrocklobbersorcs", name: "Small Rock Lobbers (Orc crew)", perUnit: 80, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Stone Thrower with three Common Orc crewmen.",
      extraCrewCost: 5, extraCrewMax: 2, extraCrewLabel: "extra Common Orc crew",
    },
    {
      id: "largerocklobbersgoblins", name: "Large Rock Lobbers (Goblin crew)", perUnit: 87.5, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Stone Thrower with three Common Goblin crewmen.",
      extraCrewCost: 2.5, extraCrewMax: 2, extraCrewLabel: "extra Common Goblin crew",
    },
    {
      id: "largerocklobbersorcs", name: "Large Rock Lobbers (Orc crew)", perUnit: 95, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
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
    { id: "azhag", name: "Azhag the Slaughterer", cost: 450, stat: "Azhag the Slaughterer", role: "Common Orc Warlord",
      note: "Wears light armour, carries a shield, rides a Wyvern. Wears the Crown of Sorcery, making him a level 3 wizard (Dark Magic) who may wear armour and still cast; he never needs to take Waaagh tests. No Orcs & Goblins regiment within 12\" of him needs to test animosity.", extraMagicItemSlots: 2 },
    { id: "gorfang", name: "Gorfang Rotgut", cost: 90, stat: "Gorfang Rotgut", role: "Common Orc Hero",
      note: "Hates Dwarfs — and so does any Common Orc regiment he joins (Big'uns included). Has the same mount/weapon/armour options as a normal Common Orc Hero.", extraMagicItemSlots: 2,
      mounts: [
        { id: "boar", name: "War Boar", cost: 16 },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0 },
        { id: "wyvern", name: "Wyvern", cost: 150 },
      ] },
    { id: "skarsnik", name: "Skarsnik, Warlord of the Eight Peaks", cost: 200, stat: "Skarsnik of the Eight Peaks", role: "Night Goblin Warlord",
      note: "Always accompanied by Gobbla, a giant Cave Squig, who moves and fights alongside him (if Skarsnik dies, roll on the Monster Reaction Table for Gobbla; if acting alone Gobbla moves 2D6\"/turn). Carries Skarsnik's Prodder for free.", extraMagicItemSlots: 2 },
    { id: "oglok", name: "Oglok the 'Orrible", cost: 85, stat: "Oglok the 'Orrible", role: "Common Orc Hero",
      note: "Has the same mount/weapon/armour options as a normal Common Orc Hero.", extraMagicItemSlots: 2,
      mounts: [
        { id: "boar", name: "War Boar", cost: 16 },
        { id: "chariot", name: "Boar Chariot (for the price of the chariot)", cost: 0 },
        { id: "wyvern", name: "Wyvern", cost: 150 },
      ] },
    { id: "gorbad", name: "Gorbad Ironclaw", cost: 250, stat: "Gorbad Ironclaw", role: "Common Orc Warlord",
      note: "Wears light armour, carries a shield and Morgor the Mangler. Rides a War Boar.", extraMagicItemSlots: 2 },
    { id: "grom", name: "Grom the Paunch of Misty Mountain", cost: 225, stat: "Grom the Paunch", role: "Common Goblin Warlord",
      note: "Regenerates on 4+. Wears light armour, carries a shield and the Axe of Grom. Rides a heavy scythed Wolf Chariot (100x75mm base) with three wolves and two Common Goblin crew besides Grom. A Common Goblin Battle Standard Bearer (Niblit) may join as a fourth crew member, purchased separately as normal.", extraMagicItemSlots: 2 },
    { id: "morglum", name: "Morglum Necksnapper", cost: 175, stat: "Morglum Necksnapper", role: "Black Orc Warlord",
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
  name: "Dogs of War",
  tagline: "A mercenary brotherhood — every sword, spear, and cannon sold to the highest bidder",
  magicItems: DOGS_OF_WAR_MAGIC_ITEMS,
  armyWideRules: [
    "A Dogs of War army fights for a mercenary Warlord based in the Old World, typically (but not necessarily) of Tilean origin. The General and the Paymaster must both be Human Characters, and the army must include at least one Human Regiment of Old World origin (this excludes Norse — Norsca isn't considered part of the Old World).",
    "Human Old World Regiments are the mainstay: the number of such regiments caps the maximum number of any other single regiment type or war machine (e.g. two Human Old World regiments allow up to two Halfling Bowmen, up to two Cannons, and so on, each counted separately). This builder does not hard-enforce that cap — track it yourself.",
    "Paymasters, not Battle Standard Bearers: the regiment containing the Paymaster (only one may be fielded) is unbreakable while he lives, and Dogs of War units within 12\" of him get +1 Ld. Unlike a BSB he suffers no equipment restrictions, but he can never be mounted.",
    "Regimental Banners and Champion Items: a Sea Elf regiment's champion may take High Elf magic items/banners, Dwarfs may take Dwarf runic items, Halflings may take from the Empire, and Humans may take from the Empire, Kislev, and Bretonnia (items only, not Virtues). Only unit champions may take items from other army books — independent Dogs of War characters (Lord/Hero/Paymaster/Wizards) cannot, per the rules as written. The source text doesn't include a dedicated Dogs of War-only item list, so as a practical simplification this builder lets independent Human and Wizard characters draw from the same Human item pool as Human champions — adjust to taste if you're playing strictly RAW.",
    "Ogre magic items (from the Ogre army book), Norse magic items (from the Norse army book), and Kislev magic items aren't modeled in this builder yet, since those army books aren't built out here. Ogre and Norse characters/champions have their magic item slots but no dedicated pool to pick from — track any such items on paper.",
  ],
  characters: [
    {
      id: "mercenarylord", name: "Human Mercenary Lord", cost: 110, stat: "Human Mercenary Lord", magicItemSlots: 3, tags: ["human"],
      gearNote: "May take a shield and either light armour or heavy armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Hand gun", "Pistol", "Two pistols"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 20, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 55, stat: "Pegasus" },
      ],
    },
    {
      id: "mercenaryhero", name: "Human Mercenary Hero", cost: 60, stat: "Empire Hero", magicItemSlots: 2, tags: ["human"],
      gearNote: "May take a shield and either light armour or heavy armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon", "Lance"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Hand gun", "Pistol", "Two pistols"] },
      mounts: [
        { id: "warhorse", name: "Warhorse (may take barding free)", cost: 15, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 50, stat: "Pegasus" },
      ],
    },
    {
      id: "ogremercenaryhero", name: "Ogre Mercenary Hero", cost: 171, stat: "Ogre Mercenary Hero", magicItemSlots: 2, tags: ["ogre"],
      gearNote: "Your army must include an Ogre Mercenaries regiment to field this Hero (not hard-enforced by this builder — track it yourself). Ogres are monstrous models that cause fear. May take light armour or heavy armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Halberd", "Flail", "Double handed weapon"] },
    },
    {
      id: "paymaster", name: "Human Mercenary Paymaster", cost: 80, stat: "Empire BSB", magicItemSlots: 1, restriction: "0-1", tags: ["human"],
      gearNote: "The Dogs of War equivalent of a Battle Standard Bearer: carries the Pay Chest. His regiment is unbreakable while he lives, and Dogs of War units within 12\" get +1 Ld. Suffers no restriction on equipment, but can never be mounted. May take a shield and either light armour or heavy armour for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Bow", "Longbow", "Crossbow", "Hand gun", "Pistol", "Two pistols"] },
    },
    {
      id: "wizardlord", name: "Human Hireling Wizard Lord (level 4)", cost: 240, stat: "Wizard Lord", magicItemSlots: 4, tags: ["human", "wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (4).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "masterwizard", name: "Human Hireling Master Wizard (level 3)", cost: 170, stat: "Master Wizard", magicItemSlots: 3, tags: ["human", "wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizardchampion", name: "Human Hireling Wizard Champion (level 2)", cost: 110, stat: "Wizard Champion", magicItemSlots: 2, tags: ["human", "wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
    {
      id: "wizard", name: "Human Hireling Wizard (level 1)", cost: 50, stat: "Wizard", magicItemSlots: 1, tags: ["human", "wizard"],
      gearNote: "May take College Magic. May take as many magic items as levels (1).",
      mounts: [
        { id: "warhorse", name: "Warhorse (free, may take barding)", cost: 0, stat: "Warhorse" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
      ],
    },
  ],
  regiments: [
    {
      id: "humanfoot", name: "Human Foot Soldiers", perModel: 5, minSize: 5, stat: "State Trooper", command: "standard",
      note: "Human Mercenary Soldiers.",
      options: [
        { id: "shields", group: null, label: "Shields (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapon (+1pt/model)", cost: 1, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapon (+2pt/model)", cost: 2, per: "model" },
        { id: "pikes", group: "melee", label: "Pikes (+3pt/model)", cost: 3, per: "model" },
        { id: "longbows", group: "missile", label: "Longbows — light armour only, no other weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "crossbows", group: "missile", label: "Crossbows — light armour only, no other weapons (+4pt/model)", cost: 4, per: "model" },
        { id: "handguns", group: "missile", label: "Hand guns — light armour only, no other weapons (+4pt/model)", cost: 4, per: "model" },
        { id: "pavise", group: null, label: "Pavise for crossbowmen — 5+ save vs shooting (4+ combined with light armour) (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Human Champion", baseCost: 20, magicItemSlots: 1, stat: "Fighter Champion", tags: ["human"] },
    },
    {
      id: "elitehumanfoot", name: "Elite Human Foot Soldiers", perModel: 7, minSize: 5, stat: "Knight (Empire)", command: "standard",
      note: "Elite Human Mercenary Soldiers with light armour.",
      options: [
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "heavyarmour", group: null, label: "Upgrade to heavy armour (+2pt/model)", cost: 2, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
        { id: "pikes", group: "melee", label: "Pikes (+4pt/model)", cost: 4, per: "model" },
      ],
      champion: { name: "Elite Human Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["human"] },
    },
    {
      id: "cavalryretainers", name: "Human Cavalry Retainers", perModel: 9, minSize: 5, stat: "State Trooper", command: "fastCavalry",
      note: "Human Mercenary Soldiers riding normal horses. Fast cavalry — lost if heavy armour is taken.",
      options: [
        { id: "standard", group: null, label: "Standard bearer, one model (+10pts flat, free if heavy armour taken)", cost: 10, per: "flat" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "armour", group: "armour", label: "Light armour (+1pt/model)", cost: 1, per: "model" },
        { id: "heavyarmour", group: "armour", label: "Heavy armour — loses fast cavalry (+4pt/model)", cost: 4, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "lances", group: "melee", label: "Lances (+3pt/model)", cost: 3, per: "model" },
        { id: "bows", group: "missile", label: "Bows (+2pt/model)", cost: 2, per: "model" },
        { id: "crossbows", group: "missile", label: "Crossbows (+4pt/model)", cost: 4, per: "model" },
      ],
      champion: { name: "Human Champion", baseCost: 20, magicItemSlots: 1, stat: "Fighter Champion", tags: ["human"] },
    },
    {
      id: "humanknights", name: "Human Knights", perModel: 20, minSize: 5, statNote: "Elite Human Soldiers with heavy armour, shields, and lances riding Warhorses.", command: "standard",
      options: [
        { id: "barding", group: null, label: "Barding (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Elite Human Champion", baseCost: 30, magicItemSlots: 1, stat: "Knightly Champion", tags: ["human"] },
    },
    {
      id: "norsehuscarls", name: "Norse Huscarls", perModel: 8, minSize: 5, stat: "Norse Huscarls", command: "standard", tags: ["norse"],
      note: "Huscarls with light armour. Fighting with shields, may form a Shieldwall as a charge reaction (-1 to hit the charging enemy; forfeits fighting with double handed weapons that combat).",
      options: [
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Norse Champion", baseCost: 20, magicItemSlots: 1, stat: "Norse Champion", tags: ["norse"] },
    },
    {
      id: "seaelves", name: "Sea Elf Mercenaries", perModel: 10, minSize: 5, stat: "Elven Warriors (High Elf)", command: "standard", tags: ["seaelf"],
      note: "Elven Warriors with light armour, shields, spear and bows.",
      options: [
        { id: "longbows", group: null, label: "Upgrade bows to longbows (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Sea Elf Champion", baseCost: 20, magicItemSlots: 1, stat: "Knightly Champion", tags: ["seaelf"] },
    },
    {
      id: "halflingmilitia", name: "Halfling Militia", perModel: 2.5, minSize: 5, stat: "Halfling", command: "standard", tags: ["halfling"],
      note: "Halflings with light armour and shields. Foresters — move through woods without penalty.",
      options: [
        { id: "spears", group: null, label: "Spears (+0.5pt/model)", cost: 0.5, per: "model" },
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
        { id: "standard", group: null, label: "Standard bearer, one model (+10pts flat)", cost: 10, per: "flat" },
        { id: "heavyarmour", group: null, label: "Swap light for heavy armour (+4pt/model)", cost: 4, per: "model" },
        { id: "ahw", group: "melee", label: "Additional hand weapons (+6pt/model)", cost: 6, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons or flails (+8pt/model)", cost: 8, per: "model" },
      ],
      champion: { name: "Ogre Champion", baseCost: 50, magicItemSlots: 1, stat: "Ogre Champion", tags: ["ogre"] },
    },
    {
      id: "dwarfmercenaries", name: "Dwarf Mercenary Warriors", perModel: 8, minSize: 5, stat: "Dwarf Soldier", command: "standard", tags: ["dwarf"],
      note: "Dwarfs with light armour.",
      options: [
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "heavyarmour", group: null, label: "Swap light for heavy armour (+2pt/model)", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
        { id: "crossbows", group: "missile", label: "Crossbows or hand guns — only if taking no other weapons/shields (+4pt/model)", cost: 4, per: "model" },
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
      id: "oglahkhanwolfboyz", name: "Oglah Khan's Wolfboyz", stat: "Oglah Khan's Hobgoblin", command: "standard", restriction: "0-1",
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
      note: "Requires a Halfling regiment in the army. Shoots like a stone thrower, range 36\", S5, allows normal armour save but no regeneration. Cannot enter a wood (it's a war machine, unlike its foresting crew). Crewed by three Halflings.",
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
  name: "Chaos Dwarfs",
  tagline: "High Hats from the Dark Lands — bound to Hashut, forging chains for the weak",
  magicItems: [...CHAOS_DWARF_MAGIC_ITEMS, ...ORC_MAGIC_ITEMS],
  themes: {
    default: "core",
    options: [
      { id: "core", name: "Core", desc: "Base Chaos Dwarf army." },
      { id: "oldschool", name: "Old School Addendum", desc: "Blunderbusses replaced with Crossbows. Hobgoblin Archers can upgrade to Crossbows for +2 points per model. Adds Weapon Teams, Juggernaut, Whirlwind and Tenderizer War Engines." },
      { id: "modern", name: "Modern Stuff", desc: "Adds Fireglaives, Naphtha Bombs, Blood of Hashut, Bull Centaur Renders, K'daii Fireborn, Chaos Siege Giant, The Iron Daemon, Magma Cannons, and the Hellcannon." },
    ],
  },
  armyWideRules: [
    "The master race: the army general must be a Chaos Dwarf character, and the army must include at least one regiment of Chaos Dwarf Warriors, Tower Guards, or Blunderbusses. Chaos Dwarfs don't hate Orcs & Goblins, don't suffer Elf Grudge, and get no dispel bonus. They have no Gromril Armour, but Chaos Dwarf characters and elite troops may take Chaos Armour instead (4+ armour save on its own, doesn't cost a magic item slot, and may be worn by wizards while casting). Chaos Dwarfs and Bull Centaurs never take panic tests caused by greenskins of any kind.",
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
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Hand gun", "Crossbow", "Two pistols"] },
      mounts: [
        { id: "greattaurus", name: "Great Taurus", cost: 224, stat: "Great Taurus" },
      ],
    },
    {
      id: "chaosdwarfhero", name: "Chaos Dwarf Hero", cost: 82, stat: "Chaos Dwarf Hero", magicItemSlots: 2, tags: ["chaosDwarf"],
      gearNote: "May take a shield and either heavy armour or Chaos Armour for free. May ride a Great Taurus for +216pts.",
      armourGroup: { options: CD_ARMOUR_OPTIONS },
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (any one, +10pts)", cost: 10, options: ["None (default)", "Hand gun", "Crossbow", "Two pistols"] },
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
      mounts: [
        { id: "lammasu", name: "Lammasu", cost: 180, stat: "Lammasu" },
      ],
    },
    {
      id: "mastersorcerer", name: "Master Chaos Dwarf Sorcerer (level 3)", cost: 194, stat: "Chaos Dwarf Master Sorcerer", magicItemSlots: 3, tags: ["chaosDwarf", "wizard"],
      gearNote: "Uses Chaos Dwarf Magic. May wear Chaos Armour for +10pts. May take as many magic items as levels (3).",
    },
    {
      id: "sorcererchampion", name: "Chaos Dwarf Sorcerer Champion (level 2)", cost: 128, stat: "Chaos Dwarf Sorcerer Champion", magicItemSlots: 2, tags: ["chaosDwarf", "wizard"],
      gearNote: "Uses Chaos Dwarf Magic. May wear Chaos Armour for +10pts. May take as many magic items as levels (2).",
    },
    {
      id: "sorcerer", name: "Chaos Dwarf Sorcerer (level 1)", cost: 62, stat: "Chaos Dwarf Sorcerer", magicItemSlots: 1, tags: ["chaosDwarf", "wizard"],
      gearNote: "Uses Chaos Dwarf Magic. May wear Chaos Armour for +10pts. May take as many magic items as levels (1).",
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
      gearNote: "Your army must include a Black Orc regiment to field this Hero (not hard-enforced — track it yourself). Quells animosity. May take a shield and either light armour or heavy armour for free. May take 2 magic items, which may come from the Orcs & Goblins army book.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "commonorchero", name: "Common Orc Hero", cost: 60, stat: "Orc Hero", magicItemSlots: 2, tags: ["commonOrc"],
      gearNote: "Your army must include a Common Orc regiment to field this Hero (not hard-enforced — track it yourself). May take a shield and light armour for free. May take 2 magic items, which may come from the Orcs & Goblins army book.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
    },
    {
      id: "commongoblinhero", name: "Common Goblin Hero", cost: 36, stat: "Goblin Hero", magicItemSlots: 2, tags: ["commonGoblin"],
      gearNote: "Your army must include a Common Goblin regiment to field this Hero (not hard-enforced — track it yourself). May take a shield and light armour for free. May take 2 magic items, which may come from the Orcs & Goblins army book.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Additional hand weapon", "Spear", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (+10pts)", cost: 10, options: ["None (default)", "Short bow"] },
    },
    {
      id: "hobgoblinhero", name: "Hobgoblin Hero", cost: 53, stat: "Hobgoblin Hero", magicItemSlots: 2, tags: ["hobgoblin"],
      gearNote: "Your army must include a Hobgoblin regiment to field this Hero (not hard-enforced — track it yourself). May take light armour and a shield for free.",
      meleeGroup: { label: "Melee weapon (choose one, free)", options: ["Hand weapon (default)", "Flail", "Additional hand weapon", "Spear", "Halberd", "Double handed weapon"] },
      missileGroup: { label: "Missile weapon (+10pts)", cost: 10, options: ["None (default)", "Bow", "Crossbow"] },
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
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "fireglaives", group: null, label: "Fireglaives — range 18\" S4 armour piercing, or +1S two-handed in melee (+5pt/model)", cost: 5, per: "model", theme: "modern" },
      ],
      champion: { name: "Chaos Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Chaos Dwarf Champion", tags: ["chaosDwarf"] },
    },
    {
      id: "cdblunderbusses", name: "Chaos Dwarf Blunderbusses", perModel: 12, minSize: 5, stat: "Chaos Dwarf Warriors", command: "standard",
      note: "Comes with heavy armour and Blunderbusses (may be reflavored as crossbows instead, under Old School Addendum — same points and profile). Fires even after moving, in a 12\" x (unit width) firing zone ahead of the regiment, hitting every model whose base is more than half within it (friend and foe alike). Hits are S3, rising to S4 with two full ranks or S5 with three-plus. No long-range/skirmisher penalty; normal cover and move-and-shoot penalties apply. Joined characters count as armed with Blunderbusses for strength purposes even if they aren't. May stand & shoot against distant chargers, hitting the charging unit only (no area effect on that reaction).",
      options: [
        { id: "shields", group: null, label: "Shields (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Chaos Dwarf Champion", baseCost: 20, magicItemSlots: 1, stat: "Chaos Dwarf Champion", tags: ["chaosDwarf"] },
    },
    {
      id: "towerguard", name: "Chaos Dwarf Tower Guard", perModel: 11, minSize: 5, stat: "Chaos Dwarf Tower Guards", command: "standard", restriction: "0-1",
      note: "Comes with heavy armour.",
      options: [
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "chaosarmour", group: null, label: "Upgrade heavy armour to Chaos Armour (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Commander of the Tower", baseCost: 30, magicItemSlots: 1, stat: "Commander of the Tower", tags: ["chaosDwarf"] },
    },
    {
      id: "hobgoblinwarriors", name: "Hobgoblin Warriors", perModel: 4, minSize: 5, stat: "Hobgoblin (CD)", command: "standard", tags: ["hobgoblin"],
      note: "Comes with shields.",
      options: [
        { id: "spears", group: "melee", label: "Spears (+1pt/model)", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Hobgoblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Hobgoblin Champion (CD)", tags: ["hobgoblin"] },
    },
    {
      id: "hobgoblinarchers", name: "Hobgoblin Archers", perModel: 5, minSize: 5, stat: "Hobgoblin (CD)", command: "standard", tags: ["hobgoblin"],
      note: "Comes with bows.",
      options: [
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "crossbows", group: null, label: "Upgrade bows to crossbows (+2pt/model)", cost: 2, per: "model", theme: "oldschool" },
      ],
      champion: { name: "Hobgoblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Hobgoblin Champion (CD)", tags: ["hobgoblin"] },
    },
    {
      id: "hobgoblinwolfriders", name: "Hobgoblin Wolf Riders", perModel: 11, minSize: 5, stat: "Hobgoblin (CD)", command: "fastCavalry", tags: ["hobgoblin"],
      note: "Rides Giant Wolves. Fast cavalry. May skirmish if armed with bows/short bows.",
      options: [
        { id: "standard", group: null, label: "Standard bearer, one model (+10pts flat)", cost: 10, per: "flat" },
        { id: "spears", group: "melee", label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "armour", group: null, label: "Light armour (+1pt/model)", cost: 1, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
        { id: "shortbows", group: "missile", label: "Short bows (+1pt/model)", cost: 1, per: "model" },
        { id: "bows", group: "missile", label: "Bows (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Hobgoblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Hobgoblin Champion (CD)", tags: ["hobgoblin"] },
    },
    {
      id: "sneakygits", name: "Hobgoblin Sneaky Gits", perModel: 8, minSize: 5, stat: "Hobgoblin (CD)", command: "standard", tags: ["hobgoblin"],
      note: "Comes with two poisoned daggers and light armour. After the first round of melee, any number of models may leave the unengaged rear ranks to lap around the enemy unit's flank/rear, expanding the front rank. If five or more end up engaged to a flank/rear this way, the Sneaky Gits get the flank/rear combat resolution bonus (and the enemy loses its rank bonus) — but the Sneaky Gits also lose their own rank bonus once models leave the rear ranks.",
      champion: { name: "Hobgoblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Hobgoblin Champion (CD)", tags: ["hobgoblin"] },
    },
    {
      id: "bullcentaurs", name: "Bull Centaurs", perModel: 24, minSize: 5, stat: "Bull Centaurs", command: "fastCavalry", tags: ["bullCentaur"],
      note: "Comes with light armour. Fast cavalry (unless given heavy armour).",
      options: [
        { id: "standard", group: null, label: "Standard bearer, one model (free if heavy armour taken, otherwise +10pts flat)", cost: 10, per: "flat" },
        { id: "shields", group: null, label: "Shields (+2pt/model)", cost: 2, per: "model" },
        { id: "heavyarmour", group: null, label: "Upgrade to heavy armour, free (loses fast cavalry)", cost: 0, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
      ],
      champion: { name: "Bull Centaur Champion", baseCost: 30, magicItemSlots: 1, stat: "Bull Centaur Champion", tags: ["bullCentaur"] },
    },
    {
      id: "orcslaves", name: "Orc Slave Warriors", perModel: 5, minSize: 5, stat: "Common Orc", command: "standard", tags: ["commonOrc"],
      note: "Comes with light armour.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons (+1pt/model)", cost: 1, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Common Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Common Orc Champion", tags: ["commonOrc"] },
    },
    {
      id: "blackorcslaves", name: "Black Orc Slave Warriors", perModel: 9, minSize: 5, stat: "Black Orc", command: "standard", tags: ["blackOrc"],
      note: "Comes with light armour.",
      options: [
        { id: "ahw", group: "melee", label: "Additional hand weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "spears", group: "melee", label: "Spears (+2pt/model)", cost: 2, per: "model" },
        { id: "halberds", group: "melee", label: "Halberds (+1pt/model)", cost: 1, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+3pt/model)", cost: 3, per: "model" },
        { id: "heavyarmour", group: null, label: "Swap light for heavy armour (+2pt/model)", cost: 2, per: "model" },
        { id: "shields", group: null, label: "Shields (+1pt/model)", cost: 1, per: "model" },
      ],
      champion: { name: "Black Orc Champion", baseCost: 20, magicItemSlots: 1, stat: "Black Orc Champion", tags: ["blackOrc"] },
    },
    {
      id: "goblinslaves", name: "Common Goblin Slave Warriors", perModel: 2.5, minSize: 5, stat: "Common Goblin", command: "standard", tags: ["commonGoblin"],
      options: [
        { id: "spears", group: "melee", label: "Spears (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+2pt/model)", cost: 2, per: "model" },
        { id: "shortbows", group: "missile", label: "Short bows — no shields if taken (+1pt/model)", cost: 1, per: "model" },
        { id: "armour", group: null, label: "Light armour (+0.5pt/model)", cost: 0.5, per: "model" },
        { id: "shields", group: null, label: "Shields — only if not armed with short bows (+0.5pt/model)", cost: 0.5, per: "model" },
      ],
      champion: { name: "Common Goblin Champion", baseCost: 10, magicItemSlots: 1, stat: "Common Goblin Champion", tags: ["commonGoblin"] },
    },
    // --- Modern Stuff regiments ---
    {
      id: "bullcentaurrenders", name: "Bull Centaur Renders", perModel: 54, minSize: 3, stat: "Bull Centaur Renders", command: "monstrous", theme: "modern",
      note: "Wear heavy armour. Monstrous, cause fear. Cannot take a standard bearer or musician.",
      options: [
        { id: "shields", group: null, label: "Shields (+4pt/model)", cost: 4, per: "model" },
        { id: "dhw", group: "melee", label: "Double handed weapons (+12pt/model)", cost: 12, per: "model" },
      ],
      champion: { name: "Bull Centaur Render Champion", baseCost: 50, magicItemSlots: 1, stat: "Bull Centaur Render Champion", tags: ["bullCentaur"] },
    },
    {
      id: "kdaiifireborn", name: "K'daii Fireborn", perModel: 41, minSize: 3, stat: "K'daii Fireborn", command: "none", theme: "modern",
      note: "Requires a Sorcerer elsewhere in the army (not hard-enforced — track it yourself). Monstrous; flaming attacks, immune to fire, regenerate 4+ (not cancelled by flaming, but is by magical attacks). At the start of every melee phase, any model in base contact (friend or foe) suffers an automatic flaming S3 hit that doesn't count toward combat resolution. Count as Daemons in all regards: cause fear, magical attacks, immune to poison/living-only effects/psychology, never flee (exorcised — counts as slain — if forced to). Cannot take a standard bearer or musician; only Daemonic characters may join.",
      champion: { name: "K'daii Manburner", baseCost: 50, magicItemSlots: 0, stat: "K'daii Manburner", note: "May take one Daemonic Reward from the Chaos army book's Daemonic Rewards (All) section (not modeled in this builder — apply on paper)." },
    },
  ],
  chariotsMonsters: [
    {
      id: "earthshaker", name: "Chaos Dwarf Earth Shaker Cannon", perUnit: 165, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Works like a Large Stone Thrower. Units hit by the template (even without a wound) can't move, shoot, or cast spells through the next magic phase and their next movement/shooting phases (compulsory/flee moves and spell-forced moves still happen). Crewed by three Chaos Dwarfs in heavy armour.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Chaos Dwarf crew",
    },
    {
      id: "deathrockets", name: "Chaos Dwarf Death Rockets", perUnit: 85, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Works like a Small Stone Thrower. Crewed by two Chaos Dwarf Warriors in heavy armour.",
      extraCrewCost: 10, extraCrewMax: 3, extraCrewLabel: "extra Chaos Dwarf crew",
    },
    {
      id: "hobgoblinboltthrowers", name: "Hobgoblin Bolt Throwers", perUnit: 43, stat: "War Machine (cannon, mortar, etc.)", kind: "warmachine",
      note: "Requires a Hobgoblin regiment in the army (not hard-enforced — track it yourself). Bolt thrower crewed by two Hobgoblins.",
      extraCrewCost: 4, extraCrewMax: 3, extraCrewLabel: "extra Hobgoblin crew",
    },
    // --- Old School Addendum war machines ---
    {
      id: "flamethrowerteam", name: "Flame Thrower Team", perUnit: 60, stat: "Weapon Team", kind: "warmachine", theme: "oldschool",
      note: "Weapon Team: two Chaos Dwarf Warriors in heavy armour on one 25x50mm base, skirmisher-style (360° LoS, no facing when charged by flyers, can't move-and-fire, may stand & shoot). Guess up to 6\" plus the artillery die; on a misfire the team is destroyed. Otherwise place the teardrop template (small end at the hit point) — models more than half covered suffer a flaming S5 hit, 1 wound=1D3. Any casualty forces a panic test. If it blows up during a stand & shoot, the charge counts as failed.",
    },
    {
      id: "swivelgunteam", name: "Swivel Gun Team", perUnit: 85, stat: "Weapon Team", kind: "warmachine", theme: "oldschool",
      note: "Weapon Team: two Chaos Dwarf Warriors in heavy armour on one 25x50mm base, skirmisher-style. Range 18\", 2D6 shots, S3 armour piercing (-1 save). On any double, fires in a random (scatter die) direction instead, hitting the first unit in its path within range — each shot then hits automatically.",
    },
    {
      id: "cdjuggernaut", name: "Chaos Dwarf Juggernaut", perUnit: 200, stat: "Chaos Dwarf Juggernaut", kind: "chariot", restriction: "0-1", theme: "oldschool",
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
    },
    {
      id: "cdhellcannon", name: "Hellcannon", perUnit: 120, stat: "Hellcannon Daemon", kind: "warmachine", theme: "modern",
      note: "From the Chaos army book. House rule / optional — ask your opponent's permission before including it, primarily meant for Siege Battles. A Daemon that works as a war machine, crewed by three Chaos Dwarfs in heavy armour. Shoots like a large stone thrower; any regiment losing even one model to it must take a panic test; shots count as magical. A misfire eats 1D3 crew instead of firing; if all crew die, it becomes an independent monster with random movement that charges the nearest model each turn (friend or foe), following normal Daemon rules — and still defends itself if charged.",
      extraCrewCost: 10, extraCrewMax: 2, extraCrewLabel: "extra Chaos Dwarf crew",
    },
    {
      id: "kdaiidestroyer", name: "K'daii Destroyer", perUnit: 300, stat: "K'daii Destroyer", kind: "monster", theme: "modern",
      note: "Requires a Sorcerer elsewhere in the army (not hard-enforced — track it yourself). Large monster, causes Terror, flaming attacks, immune to fire, regenerates 4+ (not cancelled by flaming, is by magical attacks). At the start of every melee phase, any model in base contact (friend or foe) suffers an automatic flaming S3 hit not counting toward combat resolution. Counts as a Daemon in all regards: magical attacks, immune to poison/living-only effects/psychology, never flees (exorcised — counts as slain — if forced to).",
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

const FACTION_LIST = [
  { key: "empire", name: "The Empire", data: EMPIRE },
  { key: "highelves", name: "High Elves", data: HIGH_ELVES },
  { key: "orcsgoblins", name: "Orcs & Goblins", data: ORCS_GOBLINS },
  { key: "dwarfs", name: "Dwarfs", data: DWARFS },
  { key: "skaven", name: "Skaven" },
  { key: "undead", name: "Undead" },
  { key: "woodElves", name: "Wood Elves", data: WOOD_ELVES },
  { key: "chaos", name: "Chaos", data: CHAOS },
  { key: "chaosdwarfs", name: "Chaos Dwarfs", data: CHAOS_DWARFS },
  { key: "darkelves", name: "Dark Elves" },
  { key: "bretonnia", name: "The Grand Army of Bretonnia", data: BRETONNIA },
  { key: "lizardmen", name: "Lizardmen" },
  { key: "dogsofwar", name: "Dogs of War", data: DOGS_OF_WAR },
  { key: "halflings", name: "Halflings of the Moot" },
  { key: "ogres", name: "Ogre Mercenaries" },
  { key: "kislev", name: "Kislev" },
  { key: "norse", name: "Norse" },
  { key: "slann", name: "The Slann Empire" },
];

const FACTIONS = { woodElves: WOOD_ELVES, empire: EMPIRE, chaos: CHAOS, highelves: HIGH_ELVES, dwarfs: DWARFS, bretonnia: BRETONNIA, orcsgoblins: ORCS_GOBLINS, dogsofwar: DOGS_OF_WAR, chaosdwarfs: CHAOS_DWARFS };
function getArmyData(factionKey) {
  return FACTIONS[factionKey] || WOOD_ELVES;
}

/* ============================================================================
   COST ENGINE
   ========================================================================== */

let uidCounter = 1;
const uid = (prefix) => `${prefix}-${uidCounter++}-${Date.now().toString(36)}`;

function characterCost(inst, def, armyData) {
  let total = def.cost;
  const mount = def.mounts?.find((m) => m.id === inst.mountId);
  if (mount) total += mount.cost;
  if (inst.bow && def.bowOption) total += def.bowOption.cost;
  if (def.missileGroup && inst.missile && inst.missile !== def.missileGroup.options[0]) total += def.missileGroup.cost;
  if (def.experimentalMissileGroup && inst.experimentalMissile && inst.experimentalMissile !== def.experimentalMissileGroup.options[0] && !mount) total += def.experimentalMissileGroup.cost;
  if (def.magicLevelOption) {
    const forbidden = def.magicLevelOption.forbiddenMark && inst.mark === def.magicLevelOption.forbiddenMark;
    if (!forbidden) total += (inst.magicLevel || 0) * def.magicLevelOption.costPerLevel;
  }
  if (def.wingsOption && inst.wings) total += def.wingsOption.cost;
  if (def.anvilOption && inst.anvil) total += def.anvilOption.cost;
  (inst.magicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  return total;
}

function regimentTrooperUnitCost(def, gearSelections) {
  let perModel = def.perModel;
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

function regimentCost(inst, def, armyData) {
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
  const toggleFreeStandard = def.fastCavalryToggleOption && inst.gearSelections?.[def.fastCavalryToggleOption];
  if (inst.standard && !toggleFreeStandard) {
    total += (def.command === "fastCavalry" || def.command === "monstrous") ? 10 : 0;
  }
  if (inst.standard && inst.magicBannerId) {
    const mi = miById(armyData.magicItems, inst.magicBannerId);
    if (mi) total += mi.cost;
  }
  if (inst.championIncluded && def.champion) {
    total += def.champion.baseCost;
    (inst.championMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  }
  if (def.branchWraith && inst.branchWraithIncluded) {
    total += def.branchWraith.cost;
    (inst.branchWraithSpriteIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
  }
  if (def.detachmentParent) {
    (inst.detachments || []).forEach((d) => { total += detachmentCost(d, armyData); });
  }
  return total;
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
    (inst.extraMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) total += mi.cost; });
    return total;
  }
  // full chariot
  let total = def.perUnit;
  total += (inst.extraCrew || 0) * (def.extraCrewCost || 0);
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

function unitCost(unit, armyData) {
  if (unit.kind === "character") {
    const def = armyData.characters.find((c) => c.id === unit.defId);
    return characterCost(unit, def, armyData);
  }
  if (unit.kind === "regiment") {
    const def = armyData.regiments.find((r) => r.id === unit.defId);
    return regimentCost(unit, def, armyData);
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
    if (u.magicBannerId) used.add(u.magicBannerId);
  });
  collect(roster.characters);
  collect(roster.regiments);
  collect(roster.chariots);
  collect(roster.specials);
  return used;
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

function knightGroupLimit(def, roster, armyData) {
  if (!def.knightGroup) return restrictionLimit(def.restriction);
  const knightUnits = roster.regiments.filter((u) => {
    const d = armyData.regiments.find((x) => x.id === u.defId);
    return d && d.knightGroup;
  });
  const groupsPresent = new Set(knightUnits.map((u) => armyData.regiments.find((x) => x.id === u.defId).knightGroup));
  if (groupsPresent.size === 0) return Infinity;
  if (groupsPresent.size === 1) return groupsPresent.has(def.knightGroup) ? Infinity : 1;
  const currentCount = knightUnits.filter((u) => armyData.regiments.find((x) => x.id === u.defId).knightGroup === def.knightGroup).length;
  return Math.max(currentCount, 1);
}

/* ============================================================================
   REUSABLE SUBCOMPONENTS
   ========================================================================== */

function StatBlock({ statKey, statNote }) {
  if (statNote) {
    return <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", margin: "6px 0" }}>{statNote}</p>;
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
function isItemAllowed(item, context) {
  if (item.excludeTags && context?.tags && item.excludeTags.some((t) => context.tags.includes(t))) return false;
  if (!item.restrictedTo) return true;
  if (!context) return false;
  return item.restrictedTo.some((cond) => matchesRestrictionCondition(cond, context));
}

function MagicItemPicker({ items, selectedIds, onToggle, maxSlots, usedElsewhere, categoryFilter, context }) {
  const grouped = useMemo(() => {
    const g = {};
    items.filter((m) => (!categoryFilter || categoryFilter.includes(m.cat)) && isItemAllowed(m, context)).forEach((m) => {
      g[m.cat] = g[m.cat] || [];
      g[m.cat].push(m);
    });
    return g;
  }, [items, categoryFilter, context]);
  const atLimit = selectedIds.length >= maxSlots;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span className="whr-label" style={{ marginBottom: 0 }}>Magic Items</span>
        <span className="whr-opt-cost">{selectedIds.length} / {maxSlots} slots</span>
      </div>
      {Object.entries(grouped).map(([cat, arr]) => (
        <div key={cat} style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: "0.08em", color: "var(--gold)", margin: "8px 0 2px" }}>{MI_CATEGORY_LABEL[cat]}</div>
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
      ))}
    </div>
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
  const [faction, setFaction] = useState("woodElves");

  return (
    <div className="whr-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 className="whr-h1" style={{ fontSize: 46, margin: 0 }}>WARHAMMER RENAISSANCE</h1>
        <LeafDivider />
        <p className="whr-eyebrow" style={{ margin: 0 }}>Army List Builder</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28 }} className="whr-builder-grid">
        <section className="whr-panel" style={{ padding: 28 }}>
          <h2 className="whr-h1" style={{ fontSize: 22, margin: 0 }}>Muster Forces</h2>
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
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5,
                    opacity: available ? 1 : 0.42,
                    borderColor: active ? "var(--gold)" : "var(--line-soft)",
                    background: active ? "#E9DCB4" : "var(--paper-2)",
                    boxShadow: active ? "0 0 0 1px var(--gold)" : "none",
                  }}
                >
                  {f.name}
                  {!available && <div style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontStyle: "italic", fontSize: 11.5, color: "var(--gold)", marginTop: 2 }}>Coming soon</div>}
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
              <h2 className="whr-h1" style={{ fontSize: 22, margin: 0 }}>The Barracks</h2>
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
                    <div className="whr-serif-italic" style={{ fontSize: 13 }}>{r.pointLimit} pts · {FACTION_LIST.find((f) => f.key === r.factionKey)?.name} · {r.totalPoints} pts used</div>
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
        <p className="whr-serif-italic" style={{ fontSize: 13, color: "var(--ink-faint)" }}>Maintained by ntdars</p>
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
  const themeVisible = (item) => !hasThemes || !item.theme || item.theme === currentTheme;

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
        <div style={{ fontFamily: "var(--font-display-sc)", fontSize: 16, letterSpacing: "0.02em" }}>{label}</div>
        {sub && <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{sub}</div>}
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
          {armyData.armyWideRules.map((r, i) => <p key={i} style={{ fontSize: 13, margin: "0 0 8px" }}>{r}</p>)}
        </div>
      )}

      <div className="whr-scroll" style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
        {hasThemes && (
          <Section id="armytheme" title="Army Theme">
            {armyData.themes.options.map((t) => (
              <label key={t.id} className="whr-opt-row" style={{ alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input type="radio" name="army-theme" checked={currentTheme === t.id} onChange={() => onSetTheme(t.id)} style={{ marginTop: 4 }} />
                <span style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display-sc)", fontSize: 15.5, letterSpacing: "0.02em" }}>{t.name}</div>
                  {t.desc && <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2, lineHeight: 1.35 }}>{t.desc}</div>}
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
            const limit = r.knightGroup ? knightGroupLimit(r, roster, armyData) : restrictionLimit(r.restriction);
            const count = countOfDef(roster, "regiment", r.id);
            const atLimit = count >= limit;
            return (
              <AddRow
                key={r.id}
                label={r.name + (r.restriction ? ` (${r.restriction})` : "")}
                sub={r.kind === "composite" ? "mixed unit, priced per model" : `${fmtPts(r.perModel * r.minSize)}pts, minimum ${r.minSize}`}
                disabled={atLimit}
                disabledReason={r.knightGroup ? "Only one Knight type unless it's your only type" : `Limit reached (${r.restriction})`}
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
      </div>
    </div>
  );
}

function resolveUnitStat(kind, unit, def) {
  if (kind === "character") {
    const mount = def.mounts?.find((m) => m.id === unit.mountId);
    if (mount) return { statKey: def.stat, statNote: null, mountStatKey: mount.stat, charLabel: def.name, mountLabel: mount.name.replace(/\s*\([^)]*\)\s*$/, "") };
    return { statKey: def.stat, statNote: null, mountStatKey: null };
  }
  if (kind === "regiment") {
    if (def.kind === "composite") return { statKey: null, statNote: null };
    const base = { statKey: def.statNote ? null : def.stat, statNote: def.statNote || null };
    if (def.mountStat) return { ...base, mountStatKey: def.mountStat, charLabel: def.riderLabel || def.name, mountLabel: def.mountLabel || def.mountStat };
    return base;
  }
  if (kind === "chariot") return { statKey: def.stat, statNote: null };
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

function resolveUnitTags(kind, unit, def, armyData) {
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
    if (def.magicLevelOption && unit.magicLevel > 0) tags.push(`+${unit.magicLevel} magic levels`);
    (unit.magicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
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
    if (unit.championIncluded && def.champion) {
      tags.push(def.champion.name);
      (unit.championMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
    }
    if (unit.branchWraithIncluded && def.branchWraith) {
      tags.push(def.branchWraith.name);
      (unit.branchWraithSpriteIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
    }
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
    } else if (def.kind === "warmachine") {
      if (unit.extraCrew) tags.push(`+${unit.extraCrew} ${def.extraCrewLabel || "crew"}`);
      (unit.extraMagicItemIds || []).forEach((id) => { const mi = miById(armyData.magicItems, id); if (mi) tags.push(mi.name); });
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

function RosterUnitCard({ kind, unit, def, cost, selected, onSelect, onRemove, models, armyData }) {
  const { statKey, statNote, mountStatKey, charLabel, mountLabel } = resolveUnitStat(kind, unit, def);
  const tags = resolveUnitTags(kind, unit, def, armyData);
  return (
    <div className={`whr-card ${selected ? "whr-card-selected" : ""}`} style={{ marginBottom: 10, cursor: "pointer" }} onClick={onSelect}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5 }}>{unit.customName || def.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="whr-badge-gold whr-badge">{fmtPts(cost)} pts</span>
          <button className="whr-btn-ghost" style={{ cursor: "pointer", color: "var(--burgundy)", fontFamily: "var(--font-display)" }}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}>✕</button>
        </div>
      </div>
      {models != null && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 6 }}>{models} Models</div>}
      {(statKey || statNote) && (
        <div style={{ marginTop: 6, marginBottom: tags.length ? 8 : 0 }}>
          {mountStatKey && (
            <div className="whr-eyebrow" style={{ fontSize: 11.5, marginBottom: 2 }}>{charLabel}</div>
          )}
          <StatBlock statKey={statKey} statNote={statNote} />
          {mountStatKey && (
            <>
              <div className="whr-eyebrow" style={{ fontSize: 11.5, margin: "6px 0 2px" }}>{mountLabel}</div>
              <StatBlock statKey={mountStatKey} statNote={null} />
            </>
          )}
        </div>
      )}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
          {tags.map((t, i) => (
            <span key={i} style={{ fontSize: 12, color: "var(--ink-soft)", background: "var(--paper-3)", border: "1px solid var(--line-soft)", borderRadius: 3, padding: "1px 7px" }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function RosterPanel({ armyData, roster, totalPoints, pointLimit, regimentPoints, auxiliaryInfo, selectedId, onSelect, onRemove }) {
  const regimentPct = totalPoints > 0 ? (regimentPoints / totalPoints) * 100 : 0;
  const overLimit = totalPoints > pointLimit;
  const underHalf = totalPoints > 0 && regimentPct < 50 - 0.001;
  const overAuxLimit = auxiliaryInfo?.hasAuxiliaryOption && auxiliaryInfo.auxCount > auxiliaryInfo.allowed;

  return (
    <div className="whr-col whr-builder-col" style={{ height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <h2 className="whr-h1" style={{ fontSize: 22, margin: 0 }}>{roster.name}</h2>
          <p className="whr-serif-italic" style={{ margin: "2px 0 0", fontSize: 13.5 }}>{roster.pointLimit} POINTS · {armyData.name.toUpperCase()}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: overLimit ? "var(--burgundy)" : "var(--forest-dark)" }}>
            {fmtPts(totalPoints)} / {roster.pointLimit}
          </div>
          <div style={{ fontSize: 12, color: underHalf ? "var(--burgundy)" : "var(--ink-soft)" }}>
            {fmtPts(regimentPoints)} in regiments ({regimentPct.toFixed(0)}%, min 50%)
          </div>
          {auxiliaryInfo?.hasAuxiliaryOption && auxiliaryInfo.totalRegiments > 0 && (
            <div style={{ fontSize: 12, color: overAuxLimit ? "var(--burgundy)" : "var(--ink-soft)" }}>
              {auxiliaryInfo.auxCount} / {auxiliaryInfo.allowed} regiments as auxiliaries
            </div>
          )}
        </div>
      </div>
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
              const def = armyData.characters.find((c) => c.id === u.defId);
              return <RosterUnitCard key={u.instanceId} kind="character" unit={u} def={def} cost={unitCost(u, armyData)} selected={selectedId === u.instanceId}
                onSelect={() => onSelect(u.instanceId)} onRemove={() => onRemove(u.instanceId)} armyData={armyData} />;
            })}
          </>
        )}

        {roster.regiments.length > 0 && (
          <>
            <div className="whr-eyebrow" style={{ margin: "16px 0 8px" }}>Regiments</div>
            {roster.regiments.map((u) => {
              const def = armyData.regiments.find((r) => r.id === u.defId);
              const models = def.kind === "composite"
                ? Object.values(u.composition || {}).reduce((a, b) => a + b, 0)
                : u.size;
              return <RosterUnitCard key={u.instanceId} kind="regiment" unit={u} def={def} cost={unitCost(u, armyData)} selected={selectedId === u.instanceId}
                onSelect={() => onSelect(u.instanceId)} onRemove={() => onRemove(u.instanceId)} models={models} armyData={armyData} />;
            })}
          </>
        )}

        {roster.chariots.length > 0 && (
          <>
            <div className="whr-eyebrow" style={{ margin: "16px 0 8px" }}>Chariots & Monsters</div>
            {roster.chariots.map((u) => {
              const def = armyData.chariotsMonsters.find((c) => c.id === u.defId);
              return <RosterUnitCard key={u.instanceId} kind="chariot" unit={u} def={def} cost={unitCost(u, armyData)} selected={selectedId === u.instanceId}
                onSelect={() => onSelect(u.instanceId)} onRemove={() => onRemove(u.instanceId)} models={def.kind === "quantity" ? u.qty : null} armyData={armyData} />;
            })}
          </>
        )}

        {roster.specials.length > 0 && (
          <>
            <div className="whr-eyebrow" style={{ margin: "16px 0 8px" }}>Special Characters</div>
            {roster.specials.map((u) => {
              const def = armyData.specialCharacters.find((s) => s.id === u.defId);
              return <RosterUnitCard key={u.instanceId} kind="special" unit={u} def={def} cost={unitCost(u, armyData)} selected={selectedId === u.instanceId}
                onSelect={() => onSelect(u.instanceId)} onRemove={() => onRemove(u.instanceId)} armyData={armyData} />;
            })}
          </>
        )}
      </div>
    </div>
  );
}

/* ---- Detail panel per unit kind ---- */

function CharacterDetail({ def, unit, roster, updateUnit, armyData }) {
  const usedElsewhere = allUsedMagicItemIds(roster, unit.instanceId);
  const mounted = !!unit.mountId;
  const visibleMounts = (def.mounts || []).filter((m) => !m.requiresMark || m.requiresMark === (unit.mark || def.markGroup?.options?.[0]));
  return (
    <div>
      <h3 className="whr-h1" style={{ fontSize: 19, margin: "0 0 2px" }}>{def.name}</h3>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <span className="whr-badge-gold whr-badge">{fmtPts(characterCost(unit, def, armyData))} pts</span>
      </div>
      {def.gearNote && <p style={{ fontSize: 13.5, marginTop: 10, color: "var(--ink-soft)" }}>{def.gearNote}</p>}

      {def.markGroup && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Mark of Chaos</span>
          {def.markGroup.options.map((opt) => (
            <label key={opt} className="whr-opt-row whr-opt-label">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`mark-${unit.instanceId}`} checked={(unit.mark || def.markGroup.options[0]) === opt}
                  onChange={() => {
                    const context = { characterId: def.id, mark: opt, tags: def.tags || [] };
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

      {def.magicLevelOption && (() => {
        const forbidden = def.magicLevelOption.forbiddenMark && (unit.mark || def.markGroup?.options?.[0]) === def.magicLevelOption.forbiddenMark;
        if (forbidden) return <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 8 }}>No magic levels — forbidden with the {def.magicLevelOption.forbiddenMark} Mark.</p>;
        return (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="whr-label" style={{ marginBottom: 0 }}>{def.magicLevelOption.label}</span>
              <span className="whr-opt-cost">+{def.magicLevelOption.costPerLevel}pts/level</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <Stepper value={unit.magicLevel || 0} min={0} max={def.magicLevelOption.max} onChange={(v) => updateUnit({ ...unit, magicLevel: v })} />
            </div>
          </div>
        );
      })()}

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

      {def.magicItemSlots > 0 && (
        <div style={{ marginTop: 14 }}>
          <MagicItemPicker items={armyData.magicItems} selectedIds={unit.magicItemIds || []} maxSlots={def.magicItemSlots} usedElsewhere={usedElsewhere}
            categoryFilter={def.magicItemCategoryFilter}
            context={{ characterId: def.id, mark: unit.mark || def.markGroup?.options?.[0] || def.impliedMark, tags: def.tags || [] }}
            onToggle={(id) => {
              const cur = unit.magicItemIds || [];
              const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
              updateUnit({ ...unit, magicItemIds: next });
            }} />
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
        <h3 className="whr-h1" style={{ fontSize: 19, margin: "0 0 2px" }}>{def.name}</h3>
        <span className="whr-badge-gold whr-badge">{fmtPts(total)} pts</span>
        <p style={{ fontSize: 13.5, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
        {def.composition.map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed var(--line-soft)" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display-sc)", fontSize: 16, letterSpacing: "0.02em" }}>{c.label}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{c.cost}pts each</div>
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
  const toggleFreeStandard = def.fastCavalryToggleOption && gearSelections[def.fastCavalryToggleOption];
  const autoStandard = def.command === "standard" || def.command === "special";
  const paidStandardCommand = def.command === "fastCavalry" || def.command === "monstrous";
  const standardAllowed = autoStandard || paidStandardCommand;
  const standardFree = autoStandard || toggleFreeStandard;
  const standardCost = paidStandardCommand && !toggleFreeStandard ? 10 : 0;

  const detachments = unit.detachments || [];
  const detachmentSizeUsed = detachments.reduce((s, d) => s + d.size, 0);

  return (
    <div>
      <h3 className="whr-h1" style={{ fontSize: 19, margin: "0 0 2px" }}>{def.name}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span className="whr-badge-gold whr-badge">{fmtPts(regimentCost(unit, def, armyData))} pts</span>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{size} Models{unit.championIncluded ? " (incl. champion)" : ""}</span>
      </div>
      {def.note && <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{def.note}</p>}

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
                      <label className="whr-opt-row whr-opt-label" style={{ fontSize: 13, color: "var(--ink-faint)" }}>
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
                <input type="checkbox" checked={!!unit.standard} onChange={(e) => updateUnit({ ...unit, standard: e.target.checked, magicBannerId: e.target.checked ? unit.magicBannerId : null })} />
                Standard Bearer
              </span>
              <span className="whr-opt-cost">{standardFree ? "free" : `+${standardCost}pts`}</span>
            </label>
          )}
          {def.command === "skirmisher" && <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Skirmishers cannot take a standard bearer.</p>}
        </div>
      )}
      {def.command === "none" && def.note?.includes("counts as having a musician") && (
        <div className="whr-opt-row" style={{ marginTop: 10 }}><span>Musician (sung, not carried)</span><span className="whr-badge">included</span></div>
      )}
      {def.command === "none" && def.note?.includes("No standard bearer or musician") && (
        <div className="whr-opt-row" style={{ marginTop: 10 }}><span>Standard bearer / musician</span><span className="whr-badge-burgundy whr-badge">not allowed</span></div>
      )}

      {(autoStandard || unit.standard) && (
        <div style={{ marginTop: 10 }}>
          <span className="whr-label">Magic Banner (optional)</span>
          <MagicItemPicker items={armyData.magicItems} selectedIds={unit.magicBannerId ? [unit.magicBannerId] : []} maxSlots={1} usedElsewhere={usedElsewhere}
            categoryFilter={["banner"]}
            context={{ regimentId: def.id, knightGroup: def.knightGroup, tags: def.tags || [] }}
            onToggle={(id) => updateUnit({ ...unit, magicBannerId: unit.magicBannerId === id ? null : id })} />
        </div>
      )}

      {def.champion && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Champion</span>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!unit.championIncluded} onChange={(e) => {
                const checked = e.target.checked;
                const newSize = checked ? size + 1 : Math.max(def.minSize, size - 1);
                updateUnit({ ...unit, championIncluded: checked, championMagicItemIds: checked ? unit.championMagicItemIds : [], size: newSize });
              }} />
              {def.champion.name}
            </span>
            <span className="whr-opt-cost">+{fmtPts(def.champion.baseCost + regimentTrooperUnitCost(def, gearSelections))}pts</span>
          </label>
          {unit.championIncluded && def.champion.magicItemSlots > 0 && (
            <MagicItemPicker items={armyData.magicItems} selectedIds={unit.championMagicItemIds || []} maxSlots={def.champion.magicItemSlots} usedElsewhere={usedElsewhere}
              categoryFilter={def.champion.magicItemCategoryFilter}
              context={{ regimentId: def.id, knightGroup: def.knightGroup, tags: def.champion.tags || [] }}
              onToggle={(id) => {
                const cur = unit.championMagicItemIds || [];
                const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
                updateUnit({ ...unit, championMagicItemIds: next });
              }} />
          )}
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
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{def.branchWraith.note}</p>
          {unit.branchWraithIncluded && (
            <MagicItemPicker items={armyData.magicItems} selectedIds={unit.branchWraithSpriteIds || []} maxSlots={def.branchWraith.spriteSlots} usedElsewhere={usedElsewhere}
              categoryFilter={["sprite"]}
              onToggle={(id) => {
                const cur = unit.branchWraithSpriteIds || [];
                const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
                updateUnit({ ...unit, branchWraithSpriteIds: next });
              }} />
          )}
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
          {def.extraOption.note && <p style={{ fontSize: 12.5, color: "var(--burgundy)", marginTop: 4 }}>{def.extraOption.note}</p>}
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
                  <span style={{ fontFamily: "var(--font-display-sc)", fontSize: 15 }}>{dtype ? dtype.name : "Unknown"}</span>
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
                {under50 && <div style={{ fontSize: 12, color: "var(--burgundy)", marginTop: 6 }}>Below the 50pt regiment minimum</div>}
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

function ChariotDetail({ def, unit, roster, updateUnit, armyData }) {
  const usedElsewhere = allUsedMagicItemIds(roster, unit.instanceId);

  if (def.kind === "abomination") {
    const cu = unit.charUpgrades || {};
    const sr = unit.specialRules || {};
    const srCount = ABOM_SPECIAL_RULES.filter((r) => sr[r.id]).length;
    return (
      <div>
        <h3 className="whr-h1" style={{ fontSize: 19, margin: "0 0 2px" }}>{def.name}</h3>
        <span className="whr-badge-gold whr-badge">{fmtPts(chariotCost(unit, def, armyData))} pts</span>
        <p style={{ fontSize: 13.5, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Characteristic upgrades (max 2 of each)</span>
          {ABOM_CHAR_UPGRADES.map((u) => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px dashed var(--line-soft)" }}>
              <span style={{ fontSize: 14.5 }}>{u.label} <span className="whr-opt-cost">({u.cost}pts each)</span></span>
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
        <h3 className="whr-h1" style={{ fontSize: 19, margin: "0 0 2px" }}>{def.name}</h3>
        <span className="whr-badge-gold whr-badge">{fmtPts(chariotCost(unit, def, armyData))} pts</span>
        <p style={{ fontSize: 13.5, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Quantity ({def.perUnit}pts each)</span>
          <Stepper value={unit.qty || 1} min={1} onChange={(v) => updateUnit({ ...unit, qty: v })} />
        </div>
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
        <h3 className="whr-h1" style={{ fontSize: 19, margin: "0 0 2px" }}>{def.name}</h3>
        <span className="whr-badge-gold whr-badge">{fmtPts(chariotCost(unit, def, armyData))} pts</span>
        <p style={{ fontSize: 13.5, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
        {def.extraCrewCost != null && (
          <div style={{ marginTop: 14 }}>
            <span className="whr-label">{def.extraCrewLabel || "Extra crew"} (max {def.extraCrewMax || 2}, +{def.extraCrewCost}pts/model)</span>
            <Stepper value={unit.extraCrew || 0} min={0} max={def.extraCrewMax || 2} onChange={(v) => updateUnit({ ...unit, extraCrew: v })} />
          </div>
        )}
        {def.magicItemSlots > 0 && (
          <div style={{ marginTop: 14 }}>
            <MagicItemPicker items={armyData.magicItems} selectedIds={unit.extraMagicItemIds || []} maxSlots={def.magicItemSlots} usedElsewhere={usedElsewhere}
              categoryFilter={def.magicItemCategoryFilter}
              context={{ regimentId: def.id }}
              onToggle={(id) => {
                const cur = unit.extraMagicItemIds || [];
                const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
                updateUnit({ ...unit, extraMagicItemIds: next });
              }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="whr-h1" style={{ fontSize: 19, margin: "0 0 2px" }}>{def.name}</h3>
      <span className="whr-badge-gold whr-badge">{fmtPts(chariotCost(unit, def, armyData))} pts</span>
      <p style={{ fontSize: 13.5, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>
      {def.extraCrewCost != null && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">{def.extraCrewLabel || "Extra crew"} (max 2, +{def.extraCrewCost}pts/model)</span>
          <Stepper value={unit.extraCrew || 0} min={0} max={2} onChange={(v) => updateUnit({ ...unit, extraCrew: v })} />
        </div>
      )}
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
          context={{ regimentId: def.id, tags: def.commanderTags || [] }}
          onToggle={(id) => {
            const cur = unit.commanderMagicItemIds || [];
            const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
            updateUnit({ ...unit, commanderMagicItemIds: next });
          }} />
      )}
    </div>
  );
}

function SpecialDetail({ def, unit, roster, updateUnit, armyData }) {
  const usedElsewhere = allUsedMagicItemIds(roster, unit.instanceId);
  return (
    <div>
      <h3 className="whr-h1" style={{ fontSize: 19, margin: "0 0 2px" }}>{def.name}</h3>
      <div className="whr-badge" style={{ marginBottom: 6 }}>{def.role}</div>
      <div><span className="whr-badge-gold whr-badge">{fmtPts(specialCost(unit, def, armyData))} pts</span></div>
      {def.note && <p style={{ fontSize: 13.5, marginTop: 10, color: "var(--ink-soft)" }}>{def.note}</p>}
      {def.items && <p style={{ fontSize: 13, marginTop: 8, fontStyle: "italic", color: "var(--ink-soft)" }}>{def.items}</p>}

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
          <span className="whr-opt-cost">+{def.mountOption.cost}pts</span>
        </label>
      )}

      {def.extraMagicItemSlots > 0 && (
        <div style={{ marginTop: 14 }}>
          <MagicItemPicker items={armyData.magicItems} selectedIds={unit.extraMagicItemIds || []} maxSlots={def.extraMagicItemSlots} usedElsewhere={usedElsewhere}
            context={{ characterId: def.id, tags: def.tags || [] }}
            onToggle={(id) => {
              const cur = unit.extraMagicItemIds || [];
              const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
              updateUnit({ ...unit, extraMagicItemIds: next });
            }} />
        </div>
      )}

      {def.extraSpriteSlots > 0 && (
        <div style={{ marginTop: 14 }}>
          <MagicItemPicker items={armyData.magicItems} selectedIds={unit.extraMagicItemIds || []} maxSlots={def.extraSpriteSlots} usedElsewhere={usedElsewhere}
            categoryFilter={["sprite"]}
            context={{ characterId: def.id, tags: def.tags || [] }}
            onToggle={(id) => {
              const cur = unit.extraMagicItemIds || [];
              const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
              updateUnit({ ...unit, extraMagicItemIds: next });
            }} />
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
      {kind === "regiment" && <RegimentDetail def={armyData.regiments.find((r) => r.id === u.defId)} unit={u} roster={roster} updateUnit={update} armyData={armyData} />}
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

  const totalPoints = useMemo(() => {
    let t = 0;
    roster.characters.forEach((u) => (t += unitCost(u, armyData)));
    roster.regiments.forEach((u) => (t += unitCost(u, armyData)));
    roster.chariots.forEach((u) => (t += unitCost(u, armyData)));
    roster.specials.forEach((u) => (t += unitCost(u, armyData)));
    return t;
  }, [roster, armyData]);

  const regimentPoints = useMemo(() => {
    let t = 0;
    roster.regiments.forEach((u) => (t += unitCost(u, armyData)));
    // the cheapest unit flagged countsAsFirstRegiment counts toward Regiments
    if (roster.chariots.length > 0) {
      const flaggedUnits = roster.chariots.filter((u) => {
        const d = armyData.chariotsMonsters.find((c) => c.id === u.defId);
        return d && d.countsAsFirstRegiment;
      });
      if (flaggedUnits.length > 0) {
        const costs = flaggedUnits.map((u) => unitCost(u, armyData));
        t += Math.min(...costs);
      }
    }
    return t;
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

  function addUnit(kind, defId) {
    let inst;
    if (kind === "character") {
      inst = { instanceId: uid("char"), kind: "character", defId, mountId: null, bow: false, missile: null, experimentalMissile: null, magicItemIds: [] };
      setRoster((r) => ({ ...r, characters: [...r.characters, inst] }));
    } else if (kind === "regiment") {
      const def = armyData.regiments.find((x) => x.id === defId);
      if (def.kind === "composite") {
        inst = { instanceId: uid("reg"), kind: "regiment", defId, composition: {} };
      } else {
        inst = { instanceId: uid("reg"), kind: "regiment", defId, size: def.minSize, gearSelections: {}, standard: def.command === "standard" || def.command === "special", magicBannerId: null, championIncluded: false, championMagicItemIds: [], branchWraithIncluded: false, branchWraithSpriteIds: [], detachments: [] };
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
    const keep = (list, defs) => list.filter((u) => {
      const def = defs.find((d) => d.id === u.defId);
      return !def || !def.theme || def.theme === themeId;
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
    const isRemoved = (list, defs) => {
      const u = list.find((x) => x.instanceId === selectedId);
      if (!u) return false;
      const def = defs.find((d) => d.id === u.defId);
      return !!(def && def.theme && def.theme !== themeId);
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
      characters: keep(r.characters, armyData.characters),
      regiments: stripThemedGear(keep(r.regiments, armyData.regiments), armyData.regiments),
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
    <div className="whr-content" style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="whr-btn whr-btn-sm" onClick={onBack}>← Barracks</button>
          <div>
            <h1 className="whr-h1" style={{ fontSize: 22, margin: 0 }}>{roster.name}</h1>
            <p className="whr-serif-italic" style={{ margin: 0, fontSize: 12.5 }}>{roster.pointLimit} points · {armyData.name}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{saveState}</span>
          <button className="whr-btn whr-btn-gold" onClick={onSave}>Save Roster</button>
        </div>
      </div>

      <div className="whr-builder-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr 340px", gap: 18, flex: 1, minHeight: 0 }}>
        <div className="whr-panel whr-builder-col" style={{ padding: 14, minHeight: 0 }}>
          <Sidebar armyData={armyData} roster={roster} onAdd={addUnit} onSetTheme={setArmyTheme} />
        </div>
        <div className="whr-panel whr-builder-col" style={{ padding: 18, minHeight: 0 }}>
          <RosterPanel armyData={armyData} roster={roster} totalPoints={totalPoints} pointLimit={roster.pointLimit}
            regimentPoints={regimentPoints} auxiliaryInfo={auxiliaryInfo} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeUnit} />
        </div>
        <div className="whr-panel whr-builder-col" style={{ padding: 18, minHeight: 0 }}>
          <DetailPanel armyData={armyData} roster={roster} selectedId={selectedId} updateUnit={updateUnit} />
        </div>
      </div>
    </div>
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
      roster.characters.forEach((u) => (totalPoints += unitCost(u, armyData)));
      roster.regiments.forEach((u) => (totalPoints += unitCost(u, armyData)));
      roster.chariots.forEach((u) => (totalPoints += unitCost(u, armyData)));
      roster.specials.forEach((u) => (totalPoints += unitCost(u, armyData)));

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
