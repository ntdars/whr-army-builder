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
const MI_CATEGORY_LABEL = { weapon: "Magic Weapons", armour: "Magic Armour", enchanted: "Enchanted Items", arcane: "Arcane Items", banner: "Magic Banners", sprite: "Sprites", familiar: "Familiars" };
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
      id: "warhawkriders", name: "Wood Elf Warhawk Riders", perModel: 32, minSize: 5,
      statNote: "Rider: as Wood Elf Warriors. Mount: Giant Warhawk.",
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
      id: "lords", name: "Wood Elf Lords", perModel: 20, minSize: 5, stat: "Wood Elf Lords",
      command: "fastCavalry", fastCavalryToggleOption: "barding",
      note: "Lords riding Elven Steeds with light armour, shields and lances. Fast cavalry.",
      options: [
        { id: "barding", group: null, label: "Barding — free (loses fast cavalry, -1M, free standard bearer, save improves 4+\u21923+)", cost: 0, per: "flat" },
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander" },
    },
    {
      id: "gladeriders", name: "Wood Elf Glade Riders", perModel: 22, minSize: 5, stat: "Wood Elf Lords",
      command: "fastCavalry",
      note: "Warriors on Elven Steeds with light armour, spears & bows. Fast Cavalry, may skirmish, may Vanguard, may Fire & Flee as a charge reaction.",
      options: [
        { id: "shield", group: null, label: "Shields (+2pt/model)", cost: 2, per: "model" },
        { id: "longbow", group: null, label: "Upgrade bows to Wood Elf Longbows (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Elven Champion", baseCost: 20, magicItemSlots: 1, stat: "Elven Champion" },
    },
    {
      id: "falconers", name: "Wood Elf Falconers", perModel: 15, minSize: 5,
      statNote: "As Wood Elf Warriors, armed with Hunting Falcons (range 24\", S3 missile; -1 to hit vs Falconers in melee).",
      restriction: "0-1", command: "skirmisher",
      note: "Elven Warriors with Hunting Falcons. May skirmish. Falcons ignore long-range/move penalties but gain no shooting-buff bonuses.",
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
  { id: "em-panther", name: "Knights Panther Standard", cost: 0, cat: "banner", desc: "Free. Knights Panther only. Auto-dispels the first spell cast at the regiment, even Total Power. One use." },
  { id: "em-whitewolf", name: "White Wolf Standard", cost: 0, cat: "banner", desc: "Free. Knights of the White Wolf / Teutogen Foot Knights only. First charge against the regiment forces a terror test. One use." },
  { id: "em-reiksguard", name: "Reiksguard Standard", cost: 20, cat: "banner", desc: "Reiksguard regiments only. Auto-passes the first Ld test it fails (not break tests). One use." },
  { id: "em-carroburg", name: "Carroburg Standard", cost: 20, cat: "banner", desc: "Greatswords only. Auto-passes the first break test it fails." },
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
      id: "pistoliers", name: "Pistoliers", perModel: 17, minSize: 5, statNote: "State Troops in light armour with two pistols, on Normal Horses.", command: "fastCavalry",
      note: "Fast cavalry. May skirmish.",
      champion: { name: "Empire Captain", baseCost: 20, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "outriders", name: "Outriders", perModel: 17, minSize: 5, statNote: "State Troops in light armour with repeating handguns, on barded Normal Horses.", command: "standard",
      champion: { name: "Empire Captain", baseCost: 20, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "whitewolf", name: "Knights of the White Wolf", perModel: 20, minSize: 5, statNote: "Knights with barded warhorses, full plate armour, and double handed weapons.", command: "standard",
      knightGroup: "whiteWolf",
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "teutogen", name: "Teutogen Foot Knights", perModel: 13, minSize: 5, statNote: "Knights with full plate armour and double handed weapons.", command: "standard",
      knightGroup: "whiteWolf", detachmentParent: true,
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "panther", name: "Knights Panther", perModel: 25, minSize: 5, statNote: "Knights with barded warhorses, full plate armour, shields, and lances.", command: "standard",
      knightGroup: "panther",
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "blazingsun", name: "Knights of the Blazing Sun", perModel: 25, minSize: 5, statNote: "Knights with barded warhorses, full plate armour, shields, and lances.", command: "standard",
      knightGroup: "blazingSun", note: "Can alternatively represent a lesser Knightly Order of your own design.",
      champion: { name: "Empire Captain", baseCost: 30, magicItemSlots: 1, stat: "Empire Captain" },
    },
    {
      id: "reiksguardfoot", name: "Reiksguard Foot Knights", perModel: 11, minSize: 5, statNote: "Knights with full plate armour and shields.", command: "standard",
      knightGroup: "reiksguard", detachmentParent: true,
      options: [
        { id: "dhw", group: null, label: "Swap shields for double handed weapons (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Grand Commander", baseCost: 50, magicItemSlots: 1, stat: "Grand Commander" },
    },
    {
      id: "reiksguardmounted", name: "Mounted Reiksguard Knights", perModel: 25, minSize: 5, statNote: "Knights with barded warhorses, full plate armour, shields, and lances.", command: "standard",
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
      id: "kislevlancers", name: "Kislev Winged Lancers", perModel: 17, minSize: 5, stat: "Kislev Winged Lancer", command: "fastCavalry", auxiliary: true,
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
      id: "kislevhorsearchers", name: "Kislev Horse Archers", perModel: 10, minSize: 5, stat: "Fighter", command: "fastCavalry", auxiliary: true,
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

const CHAOS = {
  key: "chaos",
  name: "Chaos",
  tagline: "Warriors, sorcerers, and daemon-touched hosts of the Dark Powers",
  magicItems: [],
  armyWideRules: [
    "A Chaos army is either a specific faction — Chaos Warriors, Beastmen, or Daemons — or a Chaos Warband (may mix all three factions, but the general must be a Chaos Warrior character, and the army must include a Chaos Warrior or Chaos Knight regiment; a Warband BSB must come from the Chaos Warrior section). Warbands and single-faction armies are dedicated to one Chaos Power (Khorne/Tzeentch/Nurgle/Slaanesh/Undivided), except single-faction armies may mix Powers. At 2000+ points a Chaos Warhost may mix Chaos Powers like a Warband. This builder currently only models the Chaos Warriors faction — Beastmen and Daemons army lists weren't in the provided rules text.",
    "Marks of Chaos: characters with opposing Marks never join the same regiment, nor a regiment carrying a banner dedicated to a different Power. Khorne grants +1 WS and frenzy (no sorcerer may take it); Tzeentch lets the bearer re-roll one personal die roll (±1 after); Nurgle grants +1T and immunity to poison/disease effects; Slaanesh makes the bearer unbreakable (but still driven off if flying and beaten); Chaos Undivided grants +1 Ld, and if the general bears it, the army may include a Chaos Abomination.",
    "Chaos Rewards / Daemonic Rewards and Chaos Banners: this PDF excerpt didn't include the actual Chaos magic item/reward/banner list (it cut off before that section), so magic item slots exist on characters but currently have nothing to pick from — let me know if you have that section.",
    "Chaos Armour: Chaos Champions (in the broad sense — Chaos Warrior character section characters and regimental Chaos Champions) are automatically equipped with Chaos Armour (+1 armour save) for free; it doesn't use a magic item slot and can be freely exchanged for no armour, light, or heavy armour.",
    "Chaos Gifts are an optional physical-card mini-game (draw 2 cards/turn, 1 below 2000pts) layered on top of the rules — not simulated in this builder, since it's a play-time mechanic rather than a list-building one.",
    "Chaos Spawn: models turned into Chaos Spawn during a battle lose all gear/rules; this is a battle-phase mechanic and isn't simulated here either.",
    "In armies under 2000pts, the general may be a regimental champion (or even a Chaos Spawn, though that's ill-advised) if no other character could fill the role.",
  ],
  characters: [
    {
      id: "chaoslord", name: "Chaos Lord", cost: 208, stat: "Chaos Lord", magicItemSlots: 3,
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
      id: "chaoshero", name: "Chaos Hero", cost: 135, stat: "Chaos Hero", magicItemSlots: 2,
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
      id: "chaosbsb", name: "Chaos Battle Standard Bearer", cost: 116, stat: "Chaos BSB", magicItemSlots: 1, restriction: "0-1",
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
      id: "chaossorcererlord", name: "Chaos Sorcerer Lord (level 4)", cost: 388, stat: "Chaos Sorcerer Lord", magicItemSlots: 4,
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
      id: "chaosmastersorcerer", name: "Master Chaos Sorcerer (level 3)", cost: 272, stat: "Chaos Master Sorcerer", magicItemSlots: 3,
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
      id: "chaossorcererchampion", name: "Chaos Sorcerer Champion (level 2)", cost: 184, stat: "Chaos Sorcerer Champion", magicItemSlots: 2,
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
      id: "chaossorcerer", name: "Chaos Sorcerer (level 1)", cost: 96, stat: "Chaos Sorcerer", magicItemSlots: 1,
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
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 60, magicItemSlots: 1, stat: "Chaos Champion" },
    },
    {
      id: "marauderhorsemen", name: "Chaos Marauder Horsemen", perModel: 23, minSize: 5, stat: "Chaos Marauder", command: "fastCavalry",
      note: "Also called Chaos Thug Horsemen. Fast cavalry. Light armour, shields, spears, on Warhorses.",
      options: [
        { id: "flails", group: null, label: "Swap spears & shields for flails (+2pt/model)", cost: 2, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 80, magicItemSlots: 1, stat: "Chaos Champion" },
    },
    {
      id: "chaoswarriors", name: "Chaos Warriors", perModel: 18, minSize: 5, stat: "Chaos Warrior", command: "standard",
      note: "Chaos Armour and shields by default.",
      options: [
        { id: "halberdahw", group: "melee", label: "Swap shield for halberd or additional hand weapon (+2pt/model)", cost: 2, per: "model" },
        { id: "dhw", group: "melee", label: "Swap shield for double handed weapon (+4pt/model)", cost: 4, per: "model" },
      ],
      champion: { name: "Chaos Champion (with Mark of Chaos)", baseCost: 60, magicItemSlots: 1, stat: "Chaos Champion" },
    },
    {
      id: "chaosknights", name: "Chaos Knights", perModel: 45, minSize: 5, statNote: "Chaos Warriors on barded Chaos Warhorses, with Chaos Armour, shields, and lances.", command: "standard",
      champion: { name: "Chaos Champion (with Mark of Chaos, mounted)", baseCost: 80, magicItemSlots: 1, stat: "Chaos Champion" },
    },
    {
      id: "ogremercenaries", name: "Ogre Mercenaries", perModel: 24, minSize: 3, stat: "Ogre", command: "monstrous",
      note: "Light armour. Causes fear. Monstrous regiment.",
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
  ],
};

const HIGH_ELF_MAGIC_ITEMS = [
  { id: "he-forenrond", name: "Forenrond's Sword", cost: 0, cat: "weapon", desc: "Bearer becomes general by birthright regardless of Ld. 4 attacks hitting/wounding on 2+, no save, 1 wound=1D3. But: never chooses sides, always deploys first, never takes first turn, no scout/vanguard. 2000+pt armies only." },
  { id: "he-bowoldworld", name: "Bow of the Old-World Colonies", cost: 20, cat: "weapon", desc: "Longbow. May shoot as many shots as bearer has attacks, at bearer's strength." },
  { id: "he-defierofchaos", name: "Defier of Chaos", cost: 20, cat: "weapon", desc: "No armour save. Chaos models suffer double wounds." },
  { id: "he-arrowsofisha", name: "Arrows of Isha", cost: 25, cat: "weapon", desc: "Shield Maiden of the Everqueen only. Whole regiment gets magic flaming arrows, S4. Can't be nullified, doesn't vanish if bearer dies." },
  { id: "he-fangsword", name: "Fangsword of Eltharion", cost: 40, cat: "weapon", desc: "-3 to armour save. All models in base contact with bearer suffer -1A." },
  { id: "he-moonbow", name: "Moonbow", cost: 40, cat: "weapon", desc: "Longbow. S6, no armour save, 1 wound=1D3. Penetrates like a bolt thrower shot. Dark Elf casualties force an immediate panic test." },
  { id: "he-beladebelkorhadris", name: "Blade of Bel-Korhadris", cost: 50, cat: "weapon", desc: "Mages only. Always strikes first, no armour save. Once/battle: 1D6 extra attacks." },
  { id: "he-helmyvresse", name: "Helm of Yvresse", cost: 10, cat: "armour", desc: "May always re-roll Ld tests." },
  { id: "he-armourcaledor", name: "Armour of Caledor", cost: 40, cat: "armour", desc: "Dragon Armour. +1 armour save, 5+ ward save. Immune to all dragon breath attacks and fire-based attacks." },
  { id: "he-goldencrown", name: "Golden Crown of Atrazar", cost: 100, cat: "armour", desc: "3+ ward save." },
  { id: "he-hornofvalour", name: "Horn of Valour", cost: 25, cat: "enchanted", desc: "General only, one use. Whole army may re-roll Ld tests until the next High Elf turn; stops if the bearer is killed." },
  { id: "he-stoneofmidnight", name: "Stone of Midnight", cost: 100, cat: "enchanted", desc: "Models on foot only. Melee attacks against the bearer must re-roll successful to-hit and to-wound rolls." },
  { id: "he-talismanhoeth", name: "Talisman of Hoeth", cost: 100, cat: "enchanted", desc: "Cannot be taken by mages. Bearer casts as a level 2 mage (any college), may wear armour/two-handed weapons and still cast, but can't take arcane items." },
  { id: "he-cloakofstars", name: "Cloak of Stars", cost: 25, cat: "arcane", desc: "Hits against the bearer have S reduced by 2. First spell cast directly at the bearer/regiment is auto-dispelled unless Total Power." },
  { id: "he-warcrown", name: "War Crown of Saphery", cost: 50, cat: "arcane", desc: "+1 magic level. Doesn't increase the number of items the bearer can carry." },
  { id: "he-bookphoenix", name: "Book of the Phoenix", cost: 250, cat: "arcane", desc: "Once per magic phase, cast a spell without using power cards." },
  { id: "he-regalstandard", name: "Regal Standard", cost: 0, cat: "banner", desc: "Free. Troops with bows/longbows may move and shoot without the -1 moving penalty." },
  { id: "he-imperialresolve", name: "Standard of Imperial Resolve", cost: 10, cat: "banner", desc: "Unengaged spearmen get +1S when receiving a charge to the front." },
  { id: "he-bannerellyrion", name: "Banner of Ellyrion", cost: 30, cat: "banner", desc: "Elven Warriors/Archers/Spearmen/Reaver Knights/Silver Helms/BSB only. Ignores difficult ground movement penalty; may march with enemies within 8\"." },
  { id: "he-whitelionstandard", name: "White Lion Standard", cost: 40, cat: "banner", desc: "White Lions only. If the general joins, they auto-pass all Ld tests including break tests (may still break from fear-causing outnumbering etc.)." },
  { id: "he-worlddragon", name: "Banner of the World Dragon", cost: 80, cat: "banner", desc: "Dragon Princes only. Armour saves vs shooting treated as a fixed 2+ ward-style save, even against save-cancelling sources." },
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
      id: "magelord", name: "Mage Lord (level 4)", cost: 264, stat: "Mage Lord", magicItemSlots: 4,
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
      id: "mastermage", name: "Master Mage (level 3)", cost: 186, stat: "Master Mage", magicItemSlots: 3,
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (3).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "magechampion", name: "Mage Champion (level 2)", cost: 122, stat: "Mage Champion", magicItemSlots: 2,
      gearNote: "May take College Magic and High Magic. May take as many magic items as levels (2).",
      mounts: [
        { id: "steed", name: "Elven Steed (free, may take barding)", cost: 0, stat: "Elven Steed" },
        { id: "unicorn", name: "Unicorn", cost: 30, stat: "Unicorn" },
        { id: "pegasus", name: "Pegasus", cost: 40, stat: "Pegasus" },
        { id: "eagle", name: "Great Eagle", cost: 48, stat: "Great Eagle" },
      ],
    },
    {
      id: "mage", name: "Mage (level 1)", cost: 58, stat: "Mage", magicItemSlots: 1,
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
      id: "silverhelms", name: "Silver Helm Knights", perModel: 20, minSize: 5, stat: "Elven Elite", command: "fastCavalry", fastCavalryToggleOption: "heavyarmour",
      note: "Elven Elite on Elven Steeds, light armour, shields, lances. Fast cavalry (as long as no armour upgrade is taken).",
      options: [
        { id: "heavyarmour", group: null, label: "Heavy armour instead of light (+7pt/model) — loses fast cavalry, standard bearer becomes free", cost: 7, per: "model" },
      ],
      champion: { name: "Elven Commander", baseCost: 30, magicItemSlots: 1, stat: "Elven Commander (High Elf)" },
    },
    {
      id: "reaverknights", name: "Reaver Knights", perModel: 22, minSize: 5, statNote: "Warriors on Elven Steeds, light armour, spears, and bows.", command: "fastCavalry",
      note: "Fast Cavalry. May skirmish, act as Vanguard, and Fire & Flee as a charge reaction.",
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
      id: "dragonprinces", name: "Dragon Princes of Caledor", perModel: 27, minSize: 5, statNote: "Elven Elite on barded Elven Steeds, Dragon Armour, shields, and lances.", command: "standard", restriction: "0-1",
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

const FACTION_LIST = [
  { key: "empire", name: "The Empire", data: EMPIRE },
  { key: "highelves", name: "High Elves", data: HIGH_ELVES },
  { key: "orcsgoblins", name: "Orcs & Goblins" },
  { key: "dwarfs", name: "Dwarfs" },
  { key: "skaven", name: "Skaven" },
  { key: "undead", name: "Undead" },
  { key: "woodElves", name: "Wood Elves", data: WOOD_ELVES },
  { key: "chaos", name: "Chaos", data: CHAOS },
  { key: "chaosdwarfs", name: "Chaos Dwarfs" },
  { key: "darkelves", name: "Dark Elves" },
  { key: "bretonnia", name: "The Grand Army of Bretonnia" },
  { key: "lizardmen", name: "Lizardmen" },
  { key: "dogsofwar", name: "Dogs of War" },
  { key: "halflings", name: "Halflings of the Moot" },
  { key: "ogres", name: "Ogre Mercenaries" },
  { key: "kislev", name: "Kislev" },
  { key: "norse", name: "Norse" },
  { key: "slann", name: "The Slann Empire" },
];

const FACTIONS = { woodElves: WOOD_ELVES, empire: EMPIRE, chaos: CHAOS, highelves: HIGH_ELVES };
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
  let total = regimentTrooperUnitCost(def, inst.gearSelections || {}) * size;
  (def.options || []).forEach((opt) => {
    if (opt.per === "model") return;
    const selected = opt.group ? inst.gearSelections?.[opt.group] === opt.id : !!inst.gearSelections?.[opt.id];
    if (selected) total += opt.cost;
  });
  const toggleFreeStandard = def.fastCavalryToggleOption && inst.gearSelections?.[def.fastCavalryToggleOption];
  if (inst.standard && !toggleFreeStandard) {
    total += (def.command === "fastCavalry" || def.command === "monstrous") ? 10 : 0;
  }
  if (inst.standard && inst.magicBannerId) {
    const mi = miById(armyData.magicItems, inst.magicBannerId);
    if (mi) total += mi.cost;
  }
  if (inst.championIncluded && def.champion) {
    total += def.champion.baseCost + regimentTrooperUnitCost(def, inst.gearSelections || {});
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

function MagicItemPicker({ items, selectedIds, onToggle, maxSlots, usedElsewhere, categoryFilter }) {
  const grouped = useMemo(() => {
    const g = {};
    items.filter((m) => !categoryFilter || categoryFilter.includes(m.cat)).forEach((m) => {
      g[m.cat] = g[m.cat] || [];
      g[m.cat].push(m);
    });
    return g;
  }, [items, categoryFilter]);
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

function Sidebar({ armyData, roster, onAdd }) {
  const [openSection, setOpenSection] = useState("characters");
  const [rulesOpen, setRulesOpen] = useState(false);

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
        <Section id="characters" title="Characters">
          {armyData.characters.map((c) => {
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
          {armyData.regiments.map((r) => {
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
          {armyData.chariotsMonsters.map((c) => {
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
          {armyData.specialCharacters.map((s) => {
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
    return { statKey: mount ? mount.stat : def.stat, statNote: null };
  }
  if (kind === "regiment") {
    if (def.kind === "composite") return { statKey: null, statNote: null };
    return { statKey: def.statNote ? null : def.stat, statNote: def.statNote || null };
  }
  if (kind === "chariot" || kind === "special") return { statKey: def.stat, statNote: null };
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
  const { statKey, statNote } = resolveUnitStat(kind, unit, def);
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
          <StatBlock statKey={statKey} statNote={statNote} />
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
                  onChange={() => updateUnit({ ...unit, mark: opt, mountId: null })} />
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
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{size} Models</span>
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

      {(def.options || []).length > 0 && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Wargear</span>
          {(() => {
            const groups = {};
            const singles = [];
            def.options.forEach((o) => { if (o.group) { groups[o.group] = groups[o.group] || []; groups[o.group].push(o); } else singles.push(o); });
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
      )}

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
            onToggle={(id) => updateUnit({ ...unit, magicBannerId: unit.magicBannerId === id ? null : id })} />
        </div>
      )}

      {def.champion && (
        <div style={{ marginTop: 14 }}>
          <span className="whr-label">Champion</span>
          <label className="whr-opt-row whr-opt-label">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!unit.championIncluded} onChange={(e) => updateUnit({ ...unit, championIncluded: e.target.checked, championMagicItemIds: e.target.checked ? unit.championMagicItemIds : [] })} />
              {def.champion.name}
            </span>
            <span className="whr-opt-cost">+{fmtPts(def.champion.baseCost + regimentTrooperUnitCost(def, gearSelections))}pts</span>
          </label>
          {unit.championIncluded && def.champion.magicItemSlots > 0 && (
            <MagicItemPicker items={armyData.magicItems} selectedIds={unit.championMagicItemIds || []} maxSlots={def.champion.magicItemSlots} usedElsewhere={usedElsewhere}
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
      else if (def.kind === "warmachine") inst = { instanceId: uid("cm"), kind: "chariot", defId, extraCrew: 0 };
      else if (def.kind === "abomination") inst = { instanceId: uid("cm"), kind: "chariot", defId, charUpgrades: {}, specialRules: {}, rider: "sorcererLord" };
      else inst = { instanceId: uid("cm"), kind: "chariot", defId, extraCrew: 0, extraSteeds: 0, commander: false, commanderMagicItemIds: [], scythedWheels: false, variantSelections: {} };
      setRoster((r) => ({ ...r, chariots: [...r.chariots, inst] }));
    } else if (kind === "special") {
      inst = { instanceId: uid("sp"), kind: "special", defId, mounted: false, mountId: null, extraMagicItemIds: [] };
      setRoster((r) => ({ ...r, specials: [...r.specials, inst] }));
    }
    setSelectedId(inst.instanceId);
  }

  function removeUnit(instanceId) {
    setRoster((r) => ({
      characters: r.characters.filter((u) => u.instanceId !== instanceId),
      regiments: r.regiments.filter((u) => u.instanceId !== instanceId),
      chariots: r.chariots.filter((u) => u.instanceId !== instanceId),
      specials: r.specials.filter((u) => u.instanceId !== instanceId),
      name: r.name, pointLimit: r.pointLimit, factionKey: r.factionKey, id: r.id,
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
          <Sidebar armyData={armyData} roster={roster} onAdd={addUnit} />
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
    const newRoster = { id: uid("roster"), name, pointLimit, factionKey, ...emptyRosterUnits() };
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
