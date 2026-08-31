import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import {
  getAuth, onAuthStateChanged, signInAnonymously,
  signInWithEmailAndPassword, signOut
} from 'firebase/auth';

// ── Firebase ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCRAFg_hm5vdIQPI9S1Qj_wAdsMIIyzxuc",
  authDomain: "japan-trip-a530c.firebaseapp.com",
  databaseURL: "https://japan-trip-a530c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "japan-trip-a530c",
  storageBucket: "japan-trip-a530c.firebasestorage.app",
  messagingSenderId: "277616419193",
  appId: "1:277616419193:web:eb39d46abc264fb5dd8fa8"
};

const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);
const auth = getAuth(fbApp);

// ── Font injection ────────────────────────────────────────────────────────────
(() => {
  if (!document.querySelector('#heebo-font')) {
    const l = document.createElement('link');
    l.id = 'heebo-font';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }
})();

// ── Global CSS ────────────────────────────────────────────────────────────────
const STYLES = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --gold: #D4AF37;
  --gold-dim: #b8952e;
  --gold-faint: rgba(212,175,55,0.13);
  --bg: #FAF9F6;
  --bg-card: #FFFFFF;
  --bg-card2: #F3F1ED;
  --surface: #ECEAE5;
  --border: rgba(0,0,0,0.08);
  --text: #1A1A1A;
  --text2: #4E4C47;
  --text3: #8A8780;
  --shadow: 0 2px 10px rgba(0,0,0,0.07);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.11);
  --r: 14px;
  --r-sm: 8px;
  --font: 'Heebo', system-ui, -apple-system, sans-serif;
  --hh: 56px;
  --th: 68px;
  --c-tokyo: #C1121F;
  --c-kanazawa: #2D6A4F;
  --c-kyoto: #6B2D8B;
  --c-osaka: #B5500B;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #111111;
    --bg-card: #1C1C1E;
    --bg-card2: #252527;
    --surface: #2C2C2E;
    --border: rgba(255,255,255,0.09);
    --text: #F0EEE8;
    --text2: #ABA9A3;
    --text3: #6A6865;
    --shadow: 0 2px 10px rgba(0,0,0,0.35);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.45);
  }
}
:root[data-theme="dark"] {
  --bg: #111111;
  --bg-card: #1C1C1E;
  --bg-card2: #252527;
  --surface: #2C2C2E;
  --border: rgba(255,255,255,0.09);
  --text: #F0EEE8;
  --text2: #ABA9A3;
  --text3: #6A6865;
  --shadow: 0 2px 10px rgba(0,0,0,0.35);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.45);
}
:root[data-theme="light"] {
  --bg: #FAF9F6;
  --bg-card: #FFFFFF;
  --bg-card2: #F3F1ED;
  --surface: #ECEAE5;
  --border: rgba(0,0,0,0.08);
  --text: #1A1A1A;
  --text2: #4E4C47;
  --text3: #8A8780;
  --shadow: 0 2px 10px rgba(0,0,0,0.07);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.11);
}

html { direction: rtl; scroll-behavior: smooth; }
body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior-y: none;
}
#root {
  max-width: 640px;
  margin: 0 auto;
  position: relative;
  min-height: 100dvh;
}
button { font-family: var(--font); cursor: pointer; border: none; background: none; }
input, textarea { font-family: var(--font); }
a { color: var(--gold); }

/* ── Header ── */
.hdr {
  position: fixed; top: 0; right: 0; left: 0;
  height: calc(var(--hh) + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding-right: 16px; padding-left: 16px;
  z-index: 200;
  max-width: 640px; margin: 0 auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.hdr-title {
  font-size: 17px; font-weight: 900; letter-spacing: -0.5px;
  color: var(--text);
  display: flex; align-items: center; gap: 6px;
  line-height: 1.1;
}
.hdr-title .jp-main { font-size: 20px; font-weight: 900; color: var(--gold); }
.hdr-title .jp-sub  { font-size: 10px; font-weight: 600; letter-spacing: 2px; color: var(--text3); text-transform: uppercase; margin-top: 2px; }
.hdr-title-wrap { display: flex; flex-direction: column; }
.hdr-title span { color: var(--gold); }
.hdr-actions { display: flex; align-items: center; gap: 4px; }
.btn-icon {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; transition: background 0.15s;
  color: var(--text);
}
.btn-icon:hover { background: var(--surface); }
.btn-icon:active { background: var(--border); }

/* ── Main scroll area ── */
.main {
  padding-top: calc(var(--hh) + env(safe-area-inset-top));
  padding-bottom: calc(var(--th) + env(safe-area-inset-bottom));
  min-height: 100dvh;
}

/* ── Tab bar ── */
.tabbar {
  position: fixed; bottom: 0; right: 0; left: 0;
  height: calc(var(--th) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--bg);
  border-top: 1px solid var(--border);
  display: flex; align-items: stretch;
  z-index: 200;
  max-width: 640px; margin: 0 auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.tab-btn {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 3px; padding: 6px 2px;
  color: var(--text3); transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.tab-btn.active { color: var(--gold); }
.tab-btn .t-emoji { font-size: 20px; line-height: 1; }
.tab-btn .t-label { font-size: 10px; font-weight: 600; letter-spacing: 0.2px; }

/* ── City strip ── */
.city-strip {
  display: flex; gap: 6px;
  overflow-x: auto; padding: 12px 16px;
  scrollbar-width: none; -ms-overflow-style: none;
  position: sticky; top: calc(var(--hh) + env(safe-area-inset-top));
  background: var(--bg); z-index: 10;
  border-bottom: 1px solid var(--border);
}
.city-strip::-webkit-scrollbar { display: none; }
.city-chip {
  flex-shrink: 0;
  padding: 6px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600;
  background: var(--surface); color: var(--text2);
  transition: all 0.15s; white-space: nowrap;
  border: 1.5px solid transparent;
}
.city-chip.active {
  background: var(--gold-faint);
  border-color: var(--gold);
  color: var(--gold-dim);
}

/* ── Day list ── */
.day-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.day-card {
  background: var(--bg-card);
  border-radius: var(--r);
  padding: 14px 16px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: var(--shadow);
  cursor: pointer; transition: transform 0.12s, box-shadow 0.12s;
  border-right: 4px solid transparent;
  -webkit-tap-highlight-color: transparent;
}
.day-card:active { transform: scale(0.98); box-shadow: none; }
.day-card .dc-emoji { font-size: 28px; flex-shrink: 0; }
.day-card .dc-info { flex: 1; min-width: 0; }
.day-card .dc-date { font-size: 11px; font-weight: 600; color: var(--text3); letter-spacing: 0.5px; text-transform: uppercase; }
.day-card .dc-title { font-size: 15px; font-weight: 700; color: var(--text); margin-top: 1px; }
.day-card .dc-hotel { font-size: 11px; color: var(--text3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.day-card .dc-arrow { font-size: 16px; color: var(--text3); flex-shrink: 0; }

/* ── Day detail ── */
.day-detail { padding: 0 0 16px; }
.dd-header {
  padding: 16px 16px 12px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}
.dd-back {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: var(--gold);
  margin-bottom: 12px; padding: 2px 0;
}
.dd-back:hover { opacity: 0.8; }
.dd-date-row { font-size: 11px; font-weight: 600; color: var(--text3); letter-spacing: 0.5px; text-transform: uppercase; }
.dd-title { font-size: 22px; font-weight: 800; color: var(--text); margin-top: 4px; text-wrap: balance; }
.dd-hotel { font-size: 12px; color: var(--text3); margin-top: 4px; display: flex; align-items: center; gap: 4px; }

.dd-map {
  margin: 12px 16px;
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: var(--shadow);
  height: 200px;
}
.dd-map iframe {
  width: 100%; height: 100%; border: none; display: block;
}

/* ── Timeline ── */
.timeline { padding: 0 16px; margin-top: 4px; }
.timeline-title { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--text3); text-transform: uppercase; margin-bottom: 10px; }
.tl-item {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
  border-radius: 6px; margin: 0 -6px; padding-left: 6px; padding-right: 6px;
}
.tl-item:last-child { border-bottom: none; }
.tl-item:active { background: var(--surface); }
.tl-time { font-size: 12px; font-weight: 700; color: var(--text3); min-width: 44px; padding-top: 1px; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.tl-emoji { font-size: 18px; flex-shrink: 0; }
.tl-content { flex: 1; min-width: 0; }
.tl-name { font-size: 14px; font-weight: 700; color: var(--text); }
.tl-desc { font-size: 12px; color: var(--text2); margin-top: 2px; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.tl-chevron { font-size: 14px; color: var(--text3); flex-shrink: 0; padding-top: 2px; }

/* ── Notes ── */
.notes-section { padding: 16px; margin-top: 8px; }
.notes-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--text3); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.notes-sync { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
.notes-ta {
  width: 100%; min-height: 100px; resize: vertical;
  background: var(--bg-card); border: 1.5px solid var(--border);
  border-radius: var(--r-sm); padding: 10px 12px;
  font-size: 14px; color: var(--text); line-height: 1.6;
  transition: border-color 0.15s;
  direction: rtl;
}
.notes-ta:focus { outline: none; border-color: var(--gold); }
.notes-ta:disabled { opacity: 0.6; cursor: not-allowed; }
.notes-hint { font-size: 11px; color: var(--text3); margin-top: 6px; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: flex-end; justify-content: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.2s;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal-sheet {
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  padding: 0 20px 32px;
  width: 100%; max-width: 640px;
  max-height: 80dvh;
  overflow-y: auto;
  animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
.modal-sheet.center {
  border-radius: 20px;
  max-width: 360px;
  margin: auto;
}
.modal-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 12px auto 16px; }
.modal-title { font-size: 19px; font-weight: 800; margin-bottom: 10px; color: var(--text); text-wrap: balance; }
.modal-time { font-size: 13px; font-weight: 600; color: var(--gold); margin-bottom: 12px; }
.modal-desc { font-size: 15px; line-height: 1.7; color: var(--text2); }
.modal-close {
  width: 100%; margin-top: 20px; padding: 13px;
  background: var(--surface); border-radius: var(--r-sm);
  font-size: 15px; font-weight: 700; color: var(--text);
  transition: background 0.15s;
}
.modal-close:hover { background: var(--border); }

/* ── Login modal ── */
.login-modal {
  position: fixed; inset: 0; z-index: 600;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  padding: 20px;
}
.login-card {
  background: var(--bg-card); border-radius: 20px;
  padding: 28px 24px; width: 100%; max-width: 340px;
  box-shadow: var(--shadow-md);
  animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes popIn { from{transform:scale(0.9);opacity:0} to{transform:scale(1);opacity:1} }
.login-title { font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 20px; }
.login-field { margin-bottom: 14px; }
.login-field label { display: block; font-size: 12px; font-weight: 600; color: var(--text3); margin-bottom: 5px; }
.login-field input {
  width: 100%; padding: 11px 13px;
  background: var(--bg-card2); border: 1.5px solid var(--border);
  border-radius: var(--r-sm); font-size: 14px; color: var(--text);
  direction: ltr; text-align: left;
}
.login-field input:focus { outline: none; border-color: var(--gold); }
.login-err { font-size: 13px; color: #C1121F; text-align: center; margin-bottom: 10px; }
.login-btn {
  width: 100%; padding: 13px;
  background: var(--gold); color: #1A1400;
  border-radius: var(--r-sm); font-size: 15px; font-weight: 800;
  margin-bottom: 10px; transition: opacity 0.15s;
}
.login-btn:hover { opacity: 0.88; }
.login-btn:disabled { opacity: 0.5; }
.login-cancel {
  width: 100%; padding: 11px;
  background: var(--surface); color: var(--text2);
  border-radius: var(--r-sm); font-size: 14px; font-weight: 600;
  transition: background 0.15s;
}
.login-cancel:hover { background: var(--border); }

/* ── Section header ── */
.sec-header {
  padding: 20px 16px 10px;
  font-size: 11px; font-weight: 700; letter-spacing: 1px;
  color: var(--text3); text-transform: uppercase;
  display: flex; align-items: center; gap: 8px;
}
.sec-header::after { content:''; flex:1; height:1px; background: var(--border); }

/* ── Restaurant cards ── */
.rest-list { padding: 0 16px 8px; display: flex; flex-direction: column; gap: 10px; }
.rest-card {
  background: var(--bg-card); border-radius: var(--r);
  padding: 14px 16px; box-shadow: var(--shadow);
}
.rest-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.rest-name { font-size: 15px; font-weight: 700; color: var(--text); }
.rest-badge {
  padding: 3px 8px; border-radius: 20px;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
  background: var(--gold-faint); color: var(--gold-dim);
}
.rest-desc { font-size: 13px; color: var(--text2); line-height: 1.55; }
.rest-loc { font-size: 11px; color: var(--text3); margin-top: 5px; }

/* ── Info accordion ── */
.acc-list { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 8px; }
.acc-item {
  background: var(--bg-card); border-radius: var(--r);
  box-shadow: var(--shadow); overflow: hidden;
}
.acc-btn {
  width: 100%; display: flex; align-items: center;
  padding: 14px 16px; gap: 10px;
  text-align: right; -webkit-tap-highlight-color: transparent;
}
.acc-btn:active { background: var(--surface); }
.acc-btn-icon { font-size: 20px; flex-shrink: 0; }
.acc-btn-title { flex: 1; font-size: 15px; font-weight: 700; color: var(--text); }
.acc-btn-arrow { font-size: 13px; color: var(--text3); transition: transform 0.2s; flex-shrink: 0; }
.acc-btn-arrow.open { transform: rotate(180deg); }
.acc-body { padding: 0 16px 14px; font-size: 14px; color: var(--text2); line-height: 1.7; }
.acc-body ul { padding-right: 18px; margin-top: 4px; }
.acc-body li { margin-bottom: 4px; }
.acc-body strong { color: var(--text); font-weight: 700; }

/* ── Bookings ── */
.book-list { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 8px; }
.book-card {
  background: var(--bg-card); border-radius: var(--r);
  padding: 13px 16px; box-shadow: var(--shadow);
  display: flex; align-items: flex-start; gap: 12px;
}
.book-status { font-size: 18px; flex-shrink: 0; padding-top: 1px; }
.book-info { flex: 1; min-width: 0; }
.book-name { font-size: 14px; font-weight: 700; color: var(--text); }
.book-date { font-size: 11px; font-weight: 600; color: var(--text3); margin-bottom: 2px; }
.book-note { font-size: 12px; color: var(--text2); margin-top: 3px; }
.book-badge {
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.badge-done { background: rgba(45,106,79,0.15); color: #2D6A4F; }
.badge-open { background: rgba(212,175,55,0.15); color: #b8952e; }
.badge-skip { background: var(--surface); color: var(--text3); }

/* ── Recs ── */
.recs-list { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 10px; }
.rec-card {
  background: var(--bg-card); border-radius: var(--r);
  padding: 14px 16px; box-shadow: var(--shadow);
  display: flex; align-items: flex-start; gap: 12px;
}
.rec-body { flex: 1; min-width: 0; }
.rec-cat {
  display: inline-block; padding: 2px 8px; border-radius: 20px;
  font-size: 11px; font-weight: 700; margin-bottom: 5px;
  background: var(--gold-faint); color: var(--gold-dim);
}
.rec-text { font-size: 14px; color: var(--text); line-height: 1.6; }
.rec-author { font-size: 11px; color: var(--text3); margin-top: 4px; }
.rec-del {
  padding: 5px 8px; border-radius: 8px; font-size: 14px;
  color: var(--text3); transition: background 0.15s; flex-shrink: 0;
}
.rec-del:hover { background: rgba(193,18,31,0.1); color: #C1121F; }
.recs-empty { text-align: center; padding: 40px 20px; color: var(--text3); font-size: 15px; }

/* ── Loading spinner ── */
.spinner-wrap { display: flex; align-items: center; justify-content: center; padding: 60px; }
.spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--gold);
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Misc ── */
.tab-content { animation: fadeInUp 0.18s ease; }
@keyframes fadeInUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.divider { height: 1px; background: var(--border); margin: 0 16px; }
`;

(() => {
  if (!document.querySelector('#jp-styles')) {
    const s = document.createElement('style');
    s.id = 'jp-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }
})();

// ── Data ──────────────────────────────────────────────────────────────────────
const CITY_META = {
  tokyo1:    { label: 'טוקיו 1',    emoji: '🗼', color: '#C1121F', dates: '8–15.9' },
  kanazawa:  { label: 'קנאזאווה',   emoji: '⛩️', color: '#2D6A4F', dates: '15–17.9' },
  kyoto:     { label: 'קיוטו',      emoji: '🌸', color: '#6B2D8B', dates: '17–21.9' },
  osaka:     { label: 'אוסקה',      emoji: '🎉', color: '#B5500B', dates: '21–25.9' },
  tokyo2:    { label: 'טוקיו 2',    emoji: '🗼', color: '#C1121F', dates: '25–29.9' },
};
const CITY_ORDER = ['tokyo1','kanazawa','kyoto','osaka','tokyo2'];

const DAYS = [
  { key:"d_08_09", date:"08.09", dow:"יום ג׳", city:"tokyo1", title:"נחיתה בנריטה", emoji:"✈️",
    hotel:"karaksa hotel colors Tokyo Yaesu",
    map:{w:139.73,s:35.67,e:139.78,n:35.70},
    schedule:[
      {time:"08:25",emoji:"✈️",title:"נחיתה בנריטה",desc:"נחיתה, קבלת כבודה, המתנה לשאר הנוסעים"},
      {time:"10:00",emoji:"🚂",title:"Keisei Skyliner לאוּאֶנו",desc:"~¥9,890 למשפחה. לרכוש מראש ב-Klook/KKday"},
      {time:"11:30",emoji:"🏨",title:"צ׳ק-אין מלון Yaesu",desc:"karaksa hotel colors Tokyo Yaesu, 5–6 דק׳ הליכה מיציאת Yaesu Central Exit"},
      {time:"14:00",emoji:"🌆",title:"סיבוב ערב ראשון בטוקיו",desc:"התאוששות מג׳ט-לג, טיול קל באזור המלון"},
      {time:"19:00",emoji:"🍜",title:"ארוחת ערב ראשונה",desc:"מסעדה קרובה למלון ביאסו או גינזה"},
    ]},
  { key:"d_09_09", date:"09.09", dow:"יום ד׳", city:"tokyo1", title:"אקיהברה ואסאקוסה", emoji:"⛩️",
    hotel:"karaksa hotel colors Tokyo Yaesu",
    map:{w:139.77,s:35.70,e:139.81,n:35.73},
    schedule:[
      {time:"06:25",emoji:"🚃",title:"יציאה מהמלון",desc:"הליכה ל-Kyobashi/Nihombashi (קו Ginza), כ-7 דק׳"},
      {time:"07:00",emoji:"⛩️",title:"Sensō-ji – בוקר מוקדם",desc:"מקדש אסאקוסה לפני העומס. Asakusa Shrine צמוד — שני מבנים ששרדו מלחמת העולם. פתקי Omikuji (~¥100, כיף לילדים)"},
      {time:"09:00",emoji:"🦦",title:"Capybara Cafe אסאקוסה",desc:"5 דק׳ מהתחנה — הזמנה מראש חובה! נפתח 14 יום מראש בחצות יפן (26.08.2026). נגמר תוך דקות"},
      {time:"10:00",emoji:"🛍️",title:"Nakamise Market",desc:"רחוב הקניות של אסאקוסה, חטיפים ומזכרות"},
      {time:"10:30",emoji:"🚃",title:"נסיעה לאוּאֶנו",desc:"קו Ginza ישיר, כ-10 דק׳ (5 תחנות)"},
      {time:"10:30",emoji:"🌳",title:"Ueno Park + שוק אמייוקו",desc:"גן אוּאֶנו, ארוחת צהריים בשוק Ameyoko"},
      {time:"13:00",emoji:"🚃",title:"נסיעה לאקיהברה",desc:"JR Yamanote/Keihin-Tohoku, תחנה אחת, ~3–4 דק׳"},
      {time:"14:00",emoji:"🎮",title:"אקיהברה",desc:"Mandarake Complex (8 קומות מנגה/פיגורות), AmiAmi Radio Kaikan, Super Potato (רטרו), ארקיידים עם claw machines — כיף לילדים"},
      {time:"16:30",emoji:"🚃",title:"חזרה למלון",desc:"JR Yamanote מ-Akihabara לתחנת טוקיו, 2 תחנות, ~5 דק׳"},
      {time:"17:00",emoji:"🍽️",title:"ארוחת ערב ביאסו/גינזה",desc:"מנוחה מוקדמת — יום DisneySea מחר!"},
    ]},
  { key:"d_10_09", date:"10.09", dow:"יום ה׳", city:"tokyo1", title:"DisneySea 🎡", emoji:"🎡",
    hotel:"karaksa hotel colors Tokyo Yaesu",
    map:{w:139.87,s:35.61,e:139.90,n:35.64},
    schedule:[
      {time:"08:00",emoji:"🚶",title:"יציאה למלון",desc:"הליכה לרציפי JR Keiyo Line בתחנת טוקיו (יציאת יאסו, ~15 דק׳ הליכה בתוך התחנה)"},
      {time:"08:20",emoji:"🚃",title:"JR Keiyo Line → Maihama",desc:"נסיעה ישירה ~20 דק׳ בלי החלפות"},
      {time:"08:40",emoji:"🎠",title:"Disney Resort Line",desc:"מונורייל ל-DisneySea"},
      {time:"09:00",emoji:"📱",title:"כניסה לפארק + DPA #1",desc:"לפתוח אפליקציה מיד! DPA ראשון: Anna & Elsa's Frozen Journey — לקנות תוך 30 דק׳, נגמר עד 09:15"},
      {time:"09:45",emoji:"❄️",title:"Frozen Journey + סיור בפארק",desc:"DisneySea חוגג 25 שנה ביום הביקור! עיטורים וסדנאות מיוחדות"},
      {time:"13:00",emoji:"💸",title:"DPA #2: Rapunzel's Lantern Festival",desc:"ביקוש גבוה מאוד — לקנות מוקדם"},
      {time:"14:00",emoji:"🎢",title:"אטרקציות Standby",desc:"Journey to the Center of the Earth, Tower of Terror"},
      {time:"17:00",emoji:"🎠",title:"DPA #3",desc:"Tower of Terror / Journey to the Earth — לפי מה שנשאר"},
      {time:"17:30",emoji:"🍽️",title:"ארוחת ערב בפארק",desc:"אוכל יפני-איטלקי בפארק"},
      {time:"21:00",emoji:"🚃",title:"חזרה למלון",desc:"JR Keiyo Line + הליכה, ~35–40 דק׳"},
    ]},
  { key:"d_11_09", date:"11.09", dow:"יום ו׳", city:"tokyo1", title:"שינג׳וקו + הראג׳וקו + שיבויה", emoji:"🌆",
    hotel:"karaksa hotel colors Tokyo Yaesu",
    map:{w:139.68,s:35.65,e:139.73,n:35.70},
    schedule:[
      {time:"08:30",emoji:"🚃",title:"נסיעה לשינג׳וקו",desc:"JR Chuo Line Rapid ישיר, ~14–16 דק׳ בלי החלפה. הליכה מהיציאה הדרומית לגן (~8–10 דק׳)"},
      {time:"09:00",emoji:"🌿",title:"Shinjuku Gyoen National Garden",desc:"גן לאומי יפהפה בלב שינג׳וקו"},
      {time:"10:15",emoji:"🦕",title:"Godzilla Head (Kabukicho)",desc:"ראש גודזילה הענק על גג מלון Gracery, ~15–20 דק׳ הליכה מהגן. ⚠️ מעבר לראג׳וקו עלול לקחת 15–18 דק׳ — לצאת מוקדם"},
      {time:"11:00",emoji:"⛩️",title:"Meiji Jingu",desc:"מקדש שינטו מרכזי, יער עירוני שקט. Yoyogi Park צמוד — שדות דשא גדולים"},
      {time:"12:30",emoji:"🐷",title:"הראג׳וקו – Takeshita Street",desc:"Kiddy Land (4 קומות צעצועים), Totti Candy Factory (צמר גפן צבעוני), Marion Crêpes. ארוחת צהריים"},
      {time:"13:30",emoji:"🐽",title:"Mipig Cafe",desc:"בית קפה חזירים ממש ליד Takeshita Street — הזמנה מראש חובה (לא יאוחר מ-04.09)"},
      {time:"14:15",emoji:"🚶",title:"הליכה לשיבויה",desc:"דרך Omotesando (~15 דק׳) — אפשר גם Cat Street (בוטיקים ווינטג׳)"},
      {time:"14:30",emoji:"🌿",title:"Tokyu Plaza Omotesando",desc:"גינת גג חינמית עם נוף"},
      {time:"16:00",emoji:"☠️",title:"חנות One Piece – MAGNET by SHIBUYA109",desc:"קומה 6, 1-23-10 Jinnan. שעות: 10:00–21:00. ⚠️ MAGNET ו-PARCO הם בניינים שונים — צריך 8–10 דק׳ הליכה ביניהם"},
      {time:"16:45",emoji:"👻",title:"THE★JOJO WORLD – Shibuya PARCO",desc:"קומה 6. כניסה חינם. באותה קומה: Nintendo Tokyo — מרצ׳נדייז בלעדי ודמואים"},
      {time:"17:15",emoji:"🌅",title:"Shibuya Sky",desc:"תצפית 360° — מומלץ לשקיעה! ~¥2,200. ⏳ כרטיסים נפתחים 14 יום מראש (21.08.2026) — חלון timed-entry"},
      {time:"18:30",emoji:"🍽️",title:"ארוחת ערב בשיבויה",desc:"Shibuya Tokyu Food Show (פודקורט ~40 דוכנים) או Afuri Ramen (ראמן יוזו, אפשרות טבעונית)"},
      {time:"20:00",emoji:"🚃",title:"חזרה למלון",desc:"JR Yamanote מ-Shibuya לתחנת טוקיו, ישיר ~25 דק׳"},
    ]},
  { key:"d_12_09", date:"12.09", dow:"יום ש׳", city:"tokyo1", title:"Gōtoku-ji + שימוקיטזאווה", emoji:"🐱",
    hotel:"karaksa hotel colors Tokyo Yaesu",
    map:{w:139.63,s:35.64,e:139.68,n:35.68},
    schedule:[
      {time:"09:15",emoji:"🚃",title:"נסיעה ל-Gōtoku-ji",desc:"JR Chuo Line + קו Odakyu → תחנת Gotokuji. ~40 דק׳, הליכה 10–13 דק׳ למקדש"},
      {time:"10:20",emoji:"🐈",title:"מקדש Gōtoku-ji",desc:"אלפי חתולי מנקי-נקו (חתול המזל). קניית קמע קטן כמזכרת"},
      {time:"12:00",emoji:"🍡",title:"Mahoro Do Sogetsu",desc:"חנות דנגו/ממתקים יפניים ליד המקדש"},
      {time:"12:30",emoji:"🚃",title:"נסיעה לשימוקיטזאווה",desc:"קו Odakyu ישיר, ~4–5 תחנות, ~10 דק׳"},
      {time:"12:45",emoji:"🎸",title:"שימוקיטזאווה (Shimo-Kitazawa)",desc:"שכונה בוהמית/טרנדית, ארוחת צהריים. חנויות ווינטג׳, בתי קפה, אווירה נעימה למשפחה"},
      {time:"14:00",emoji:"🛍️",title:"המשך שיטוט",desc:"חנויות, בתי קפה, זמן גמיש ורגוע"},
      {time:"15:15",emoji:"🚃",title:"חזרה למלון",desc:"קו Odakyu → שינג׳וקו → JR Chuo ← תחנת טוקיו. ~30 דק׳ סה׳׳כ"},
    ]},
  { key:"d_13_09", date:"13.09", dow:"יום א׳", city:"tokyo1", title:"פוג׳י + האקונה", emoji:"🗻",
    hotel:"karaksa hotel colors Tokyo Yaesu",
    map:{w:138.80,s:35.10,e:139.20,n:35.50},
    schedule:[
      {time:"07:00",emoji:"🚶",title:"יציאה לנקודת האיסוף",desc:"הליכה מהמלון דרך תחנת טוקיו (~20 דק׳)"},
      {time:"07:20",emoji:"📍",title:"נקודת איסוף",desc:"1 Chome-9 Marunouchi, ליד Shin-Marunouchi Building, יציאת מרונוצ׳י-קיטה של תחנת טוקיו"},
      {time:"07:30",emoji:"🚌",title:"יציאת הטיול המאורגן",desc:"GetYourGuide: Mt Fuji & Hakone Ropeway, Lake Ashi Cruise, Owakudani (~10 שעות כולל חזרה בשינקנסן)"},
      {time:"09:30",emoji:"🏘️",title:"Oshino Hakkai",desc:"כפר מסורתי עם 8 מעיינות ונוף לפוג׳י"},
      {time:"10:10",emoji:"🚡",title:"האקונה + Hakone Ropeway",desc:"רכבל מעל הנוף הגעשי"},
      {time:"11:15",emoji:"🌋",title:"Owakudani",desc:"עמק געשי, ביצים שחורות — ⚠️ בסיכון טייפון! המפעיל מבטל/מזכה אם יש סופה"},
      {time:"11:45",emoji:"⛵",title:"שייט באגם Ashi + צהריים",desc:"ארוחת צהריים לא כלולה"},
      {time:"12:45",emoji:"⛩️",title:"Hakone Shrine",desc:"עצירת צילום"},
      {time:"13:05",emoji:"🚃",title:"נסיעה חזרה",desc:"שינקנסן לטוקיו (פרטים מהמפעיל יום לפני)"},
      {time:"17:30",emoji:"🏨",title:"חזרה למלון",desc:"ארוחת ערב ומנוחה"},
    ]},
  { key:"d_14_09", date:"14.09", dow:"יום ב׳", city:"tokyo1", title:"TeamLab Borderless + טוקיו טאואר", emoji:"🌊",
    hotel:"karaksa hotel colors Tokyo Yaesu",
    map:{w:139.72,s:35.65,e:139.76,n:35.68},
    schedule:[
      {time:"09:30",emoji:"🚃",title:"נסיעה ל-Azabudai Hills",desc:"קו Namboku מ-Otemachi → Roppongi-itchome → חיבור תת-קרקעי ל-Azabudai Hills"},
      {time:"10:15",emoji:"🌊",title:"TeamLab Borderless",desc:"2–3 שעות. ⚠️ לזכור בגדי חילוף לילד בן 6 (בריכות מים)! לא לבשות שמלות/חצאיות בלי טייץ — הרצפות מראות"},
      {time:"13:00",emoji:"🍽️",title:"ארוחת צהריים ב-Azabudai Hills",desc:"מתחם מסחרי מודרני, מגוון מסעדות"},
      {time:"14:00",emoji:"🗼",title:"טוקיו טאואר",desc:"תצפית מגדל הטלוויזיה האייקוני. נוף לפוג׳י בימים בהירים"},
      {time:"16:15",emoji:"🕷️",title:"Roppongi Hills",desc:"פסל עכביש ענק 'Maman' (חינם) + גן Mohri Garden (קרפיונים וצבים) + קניות קלות ב-West Walk"},
      {time:"17:30",emoji:"🚃",title:"חזרה למלון",desc:"קו Hibiya מ-Roppongi לגינזה (~15 דק׳) ← הליכה לתחנת טוקיו"},
      {time:"18:30",emoji:"🍽️",title:"ארוחת ערב",desc:"🧳 טיפ: שלחו מזוודות גדולות ב-Takkyubin ישר לקיוטו מחר בבוקר! (~¥1,650–2,530 למזוודה)"},
    ]},
  // KANAZAWA
  { key:"d_15_09", date:"15.09", dow:"יום ג׳", city:"kanazawa", title:"טוקיו → קנאזאווה + Higashi Chaya", emoji:"🚄",
    hotel:"INOVA Kanazawa",
    map:{w:136.59,s:36.54,e:136.67,n:36.61},
    schedule:[
      {time:"09:00",emoji:"🧳",title:"צ׳ק-אאוט מטוקיו",desc:"מזוודות גדולות → Takkyubin ישר לקיוטו (לבקש מהקבלה)"},
      {time:"10:00",emoji:"🚄",title:"שינקנסן Kagayaki 509",desc:"יציאה 10:22 מטוקיו → הגעה 12:49 קנאזאווה. קרון 8, מקומות 10A-10E. Receipt: AED3752L. לאסוף ב-JR EAST Service Center, יציאת Marunouchi North"},
      {time:"12:49",emoji:"🏨",title:"צ׳ק-אין INOVA Kanazawa",desc:"9.4/10, דירת שירות עם מטבח ומכונת כביסה"},
      {time:"13:00",emoji:"🍽️",title:"ארוחת צהריים ומנוחה",desc:""},
      {time:"15:00",emoji:"🏮",title:"Higashi Chaya — רובע הגיישות",desc:"(1) Animal Café Hyakki Yakō: 40+ מינים (עצלנים, לוריס, כלבי ערבה), ¥990/שעה מבוגר, ¥660 ילד, ללא הזמנה מראש; (2) Hakuza Gold Leaf: גלידת רך עלה זהב (~¥900, איקוני!); (3) הצצה ל-Shima/Kaikaro Teahouse"},
      {time:"17:00",emoji:"🍽️",title:"ארוחת ערב",desc:""},
    ]},
  { key:"d_16_09", date:"16.09", dow:"יום ד׳", city:"kanazawa", title:"יום שלם בקנאזאווה", emoji:"🏯",
    hotel:"INOVA Kanazawa",
    map:{w:136.61,s:36.55,e:136.67,n:36.58},
    schedule:[
      {time:"09:00",emoji:"🍳",title:"ארוחת בוקר במלון",desc:""},
      {time:"10:00",emoji:"🥷",title:"מקדש הנינג׳ה Myoryuji",desc:"דלתות סודיות, מלכודות, חדרים נסתרים — ⚠️ חובה הזמנה מראש! דרך האתר הרשמי, לפחות יום לפני"},
      {time:"11:30",emoji:"⚔️",title:"רובע הסמוראים Nagamachi",desc:"סמטאות עתיקות, קירות טיח לבן, בית Nomura-ke"},
      {time:"12:00",emoji:"🍽️",title:"ארוחת צהריים ב-Nagamachi",desc:""},
      {time:"13:00",emoji:"🚶",title:"המשך רובע הסמוראים",desc:""},
      {time:"14:15",emoji:"🏰",title:"טירת קנאזאווה",desc:"שטח חיצוני, חלקים בכניסה חופשית"},
      {time:"15:30",emoji:"🌿",title:"גן Kenroku-en",desc:"אחד משלושת הגנים הגדולים ביפן"},
      {time:"17:00",emoji:"🐟",title:"שוק Omicho",desc:"שוק דגים ופירות ים טריים. מסעדות: Mori Mori Sushi (קייטן), Sensai Enishi (קאיסנדון), Okura (קייטן זול)"},
      {time:"18:00",emoji:"🍽️",title:"ארוחת ערב + חזרה למלון",desc:""},
    ]},
  // KYOTO
  { key:"d_17_09", date:"17.09", dow:"יום ה׳", city:"kyoto", title:"קנאזאווה → קיוטו + Kiyomizudera", emoji:"⛩️",
    hotel:"Oriental Hotel Kyoto Rokujo",
    map:{w:135.77,s:34.99,e:135.80,n:35.01},
    schedule:[
      {time:"08:30",emoji:"🚄",title:"צ׳ק-אאוט + נסיעה",desc:"Tsurugi 17: קנאזאווה 10:05 → Tsuruga 11:01. Thunder-Bird 18: Tsuruga 11:14 → קיוטו 12:09. עלות ¥30,080. Receipt: AED3779L"},
      {time:"12:09",emoji:"🏨",title:"הגעה לקיוטו + צ׳ק-אין",desc:"Oriental Hotel Kyoto Rokujo — חדר מחובר 42 מ׳׳ר, ארוחת בוקר כלולה, דלפק 24/7"},
      {time:"11:30",emoji:"🍽️",title:"ארוחת צהריים ליד המלון",desc:""},
      {time:"13:05",emoji:"🚌",title:"נסיעה ל-Kiyomizudera",desc:"אוטובוס/רכבת מהמלון, ~35 דק׳"},
      {time:"13:05",emoji:"⛩️",title:"מקדש Kiyomizudera",desc:"מקדש מפורסם על גבעה עם בלקון עץ ענק ונוף על קיוטו"},
      {time:"14:30",emoji:"🪨",title:"סמטאות עתיקות",desc:"Ninenzaka ו-Sannenzaka — רחובות אבן עתיקים, חנויות מסורתיות"},
      {time:"16:00",emoji:"🛍️",title:"זמן חופשי/קניות",desc:""},
      {time:"18:30",emoji:"🍽️",title:"ארוחת ערב",desc:"Gyoza Hohei (גיוזה עם שום, Gion), Azuma Sushi (סושי שכונתי)"},
    ]},
  { key:"d_18_09", date:"18.09", dow:"יום ו׳", city:"kyoto", title:"שייט הוזוגאווה + ארשיאמה", emoji:"🚣",
    hotel:"Oriental Hotel Kyoto Rokujo",
    map:{w:135.66,s:35.00,e:135.70,n:35.03},
    schedule:[
      {time:"07:30",emoji:"🚃",title:"נסיעה לקמאוקה",desc:"JR San'in Line, ~20 דק׳"},
      {time:"08:00",emoji:"🚣",title:"שייט הוזוגאווה",desc:"קמאוקה→ארשיאמה, 2 שעות (~¥16,300 למשפחה). לרכוש ב-Klook/KKday או באתר hozugawaboatride.com"},
      {time:"10:15",emoji:"🏛️",title:"מקדש Tenryu-ji + גן",desc:"השער האחורי מוביל ישר ליער הבמבוק"},
      {time:"11:00",emoji:"🎋",title:"יער הבמבוק Arashiyama",desc:"דרך השער האחורי של Tenryu-ji"},
      {time:"12:15",emoji:"🐒",title:"פארק הקופים Iwatayama",desc:"טיפוס תלול ~20 דק׳, נוף מלמעלה"},
      {time:"13:30",emoji:"🍽️",title:"ארוחת צהריים ליד הגשר",desc:""},
      {time:"14:30",emoji:"🛍️",title:"זמן חופשי/קניות ליד גשר Togetsukyo",desc:""},
      {time:"15:15",emoji:"🚃",title:"חזרה לקיוטו",desc:"JR Sagano Line: Saga-Arashiyama→קיוטו, ~15–20 דק׳"},
      {time:"19:00",emoji:"🌕",title:"Kangetsu ב-Daikakuji",desc:"שייט בסירות דרקון על בריכת Osawa, ליל ירח קציר. ¥500 כניסה, כניסה אחרונה 20:30. ⚠️ לוודא תאריך מדויק באתר הרשמי"},
    ]},
  { key:"d_19_09", date:"19.09", dow:"יום ש׳", city:"kyoto", title:"Fushimi Inari + Kinkaku-ji + Nijo", emoji:"⛩️",
    hotel:"Oriental Hotel Kyoto Rokujo",
    map:{w:135.72,s:34.97,e:135.77,n:35.03},
    schedule:[
      {time:"07:30",emoji:"🚃",title:"נסיעה ל-Fushimi Inari",desc:"רכבת Keihan מ-Gojo, ~15 דק׳, ישיר"},
      {time:"08:15",emoji:"⛩️",title:"Fushimi Inari",desc:"10,000 שערי טוריי כתומים. בוקר מוקדם = פחות עומס ותמונות טובות"},
      {time:"10:00",emoji:"🚌",title:"נסיעה ל-Kinkaku-ji",desc:"אוטובוס קו 205, ~40–50 דק׳"},
      {time:"10:50",emoji:"✨",title:"מקדש הזהב Kinkaku-ji",desc:"המקדש המוזהב המשתקף בבריכה — אחד הסמלים הכי מפורסמים של יפן"},
      {time:"12:00",emoji:"🪨",title:"Ryoan-ji — גן האבנים",desc:"15 אבנים על שטח חצץ — מיסטי ושקט"},
      {time:"13:10",emoji:"🍽️",title:"ארוחת צהריים באזור",desc:""},
      {time:"14:10",emoji:"🚌",title:"נסיעה לטירת Nijo",desc:"~25–30 דק׳"},
      {time:"14:40",emoji:"🏯",title:"טירת Nijo + תערוכת ציורי קיר",desc:"'ציורי הקיר שקישטו את מושב הקיסר' — עד 8.11.2026 בלבד! חוגגת 400 שנה לביקור הקיסר"},
      {time:"16:00",emoji:"🚃",title:"חזרה למלון",desc:"Tozai Line→Karasuma Line ל-Gojo, ~20–25 דק׳"},
    ]},
  { key:"d_20_09", date:"20.09", dow:"יום א׳", city:"kyoto", title:"יום נארה", emoji:"🦌",
    hotel:"Oriental Hotel Kyoto Rokujo",
    map:{w:135.82,s:34.67,e:135.86,n:34.70},
    schedule:[
      {time:"09:30",emoji:"🚃",title:"נסיעה לנארה",desc:"Kintetsu Kyoto Line מתחנת קיוטו לנארה, ~45–50 דק׳ (Express). 🔴 יום ראשון לפני Silver Week — רכבות עמוסות, לצאת מוקדם"},
      {time:"10:40",emoji:"🦌",title:"פארק נארה — צבאים חופשיים",desc:"האכלת מאות צבאים חופשיים בפארק הגדול. Shika-senbei (~¥200 למנה)"},
      {time:"13:00",emoji:"🍽️",title:"ארוחת צהריים בנארה",desc:"Kakinoha-zushi (סושי עטוף בעלה דחן, מנה מסורתית נארה)"},
      {time:"14:00",emoji:"🏛️",title:"מקדש Todai-ji",desc:"פסל הבודהה הגדול ביפן (דאיבוצו), בניין עץ מרשים"},
      {time:"15:30",emoji:"🚃",title:"חזרה לקיוטו",desc:"Kintetsu-Nara Line ישיר, ~35–45 דק׳"},
      {time:"18:00",emoji:"🍽️",title:"ארוחת ערב ומנוחה",desc:"יום רגוע יותר לפני מעבר לאוסקה"},
    ]},
  // OSAKA
  { key:"d_21_09", date:"21.09", dow:"יום ב׳", city:"osaka", title:"קיוטו → אוסקה + טירה + דוטונבורי", emoji:"🏯",
    hotel:"Karaksa Hotel Osaka Namba",
    map:{w:135.49,s:34.66,e:135.53,n:34.69},
    schedule:[
      {time:"09:00",emoji:"🧳",title:"צ׳ק-אאוט + Takkyubin",desc:"לשלוח מזוודות גדולות ב-Yamato למלון אוסקה (~¥1,500–2,000 למזוודה). 🔴 חג כבוד הקשישים! Silver Week פתיחה — עומסים בכל מקום"},
      {time:"09:30",emoji:"🚄",title:"JR Special Rapid קיוטו→אוסקה",desc:"~30 דק׳"},
      {time:"10:00",emoji:"🏨",title:"הגעה לאוסקה + צ׳ק-אין",desc:"Karaksa Hotel Osaka Namba — בין דוטונבורי לשינסאיבאשי, 5–7 דק׳ הליכה. 2 חדרים מחוברים, 2 חדרי רחצה, ארוחת בוקר כלולה"},
      {time:"11:00",emoji:"🐙",title:"שוק Kuromon",desc:"שוק פירות ים/טקויאקי טרי, קרוב למלון (~10 דק׳). ארוחת צהריים"},
      {time:"13:00",emoji:"🏯",title:"טירת אוסקה",desc:"שטח חיצוני גדול + מוזיאון. ⚠️ תורים ארוכים במיוחד בחג — להגיע מוקדם"},
      {time:"15:00",emoji:"🛍️",title:"Nipponbashi Den Den Town",desc:"'אקיהברה של אוסקה' — אנימה, אלקטרוניקה, גאצ׳פונים"},
      {time:"17:00",emoji:"🌃",title:"רובע דוטונבורי",desc:"שלטי ניאון, Glico Man, אוכל רחוב, Hozenji Yokocho (סמטת אבן עתיקה עם פנסים אדומים). גלגל Ebisu Tower (על גג Don Quijote)"},
      {time:"19:00",emoji:"🍽️",title:"ארוחת ערב בדוטונבורי",desc:"Gyozaoh! (להגיע בדיוק 17:00 או בסוף השבוע להזמין), Mizuno Okonomiyaki (Michelin Bib Gourmand)"},
    ]},
  { key:"d_22_09", date:"22.09", dow:"יום ג׳", city:"osaka", title:"אקווריום קאיוקאן", emoji:"🐋",
    hotel:"Karaksa Hotel Osaka Namba",
    map:{w:135.42,s:34.66,e:135.46,n:34.68},
    schedule:[
      {time:"09:00",emoji:"🍳",title:"ארוחת בוקר + יציאה",desc:""},
      {time:"09:30",emoji:"🚃",title:"נסיעה לקאיוקאן",desc:"קו Midosuji מ-Namba ל-Hommachi (~3 דק׳) + קו Chuo ל-Osakako (~15 דק׳). סה׳׳כ ~20 דק׳"},
      {time:"10:00",emoji:"🐋",title:"אקווריום Kaiyukan",desc:"✅ כרטיסים נרכשו! כניסה 10:15–10:30. כרישי לוויתן, טנק ענק 9 מ׳ עומק"},
      {time:"13:00",emoji:"🍽️",title:"ארוחת צהריים Tempozan",desc:"אזור הנמל, מסעדות ליד האקווריום"},
      {time:"14:00",emoji:"🛍️",title:"זמן חופשי/קניות",desc:"מנוחה לפני יום השיא מחר!"},
      {time:"16:00",emoji:"🚃",title:"חזרה למלון",desc:"קו Chuo → Hommachi + Midosuji → Namba"},
      {time:"18:00",emoji:"🌙",title:"ארוחת ערב + שינה מוקדמת",desc:"לצאת מוקדם מחר ל-USJ!"},
    ]},
  { key:"d_23_09", date:"23.09", dow:"יום ד׳", city:"osaka", title:"🎉 יום הבר מצווה — USJ + One Piece", emoji:"🎉",
    hotel:"Karaksa Hotel Osaka Namba",
    map:{w:135.42,s:34.66,e:135.45,n:34.68},
    schedule:[
      {time:"08:00",emoji:"🥳",title:"ארוחת בוקר חגיגית",desc:"יום השיא של הטיול! מזל טוב!"},
      {time:"09:00",emoji:"🚃",title:"נסיעה ל-USJ",desc:"קו Yotsubashi מ-Namba ל-Nishikujo (~15 דק׳) + JR Yumesaki תחנה אחת ל-Universal City (~5 דק׳)"},
      {time:"09:30",emoji:"🍄",title:"כניסה + Super Nintendo World",desc:"Express Pass: Mario Kart, Yoshi's Adventure ועוד. חגיגת הבר מצווה! USJ חוגג 25 שנה + Halloween Horror Nights"},
      {time:"12:00",emoji:"🍽️",title:"ארוחת צהריים חגיגית בפארק",desc:""},
      {time:"13:00",emoji:"🎢",title:"המשך פארק",desc:"Harry Potter, Standby לפי רצון, צילומים, זמן איכות"},
      {time:"17:00",emoji:"🍽️",title:"ארוחת ערב מוקדמת בפארק",desc:""},
      {time:"18:45",emoji:"☠️",title:"One Piece Premier Show VIP",desc:"✅ כרטיסים בידיים! מופע VIP ב-18:45 — מרהיב!"},
      {time:"20:00",emoji:"🚃",title:"חזרה למלון",desc:"אותו מסלול הפוך, ~20–25 דק׳. מזל טוב!! 🎊"},
    ]},
  { key:"d_24_09", date:"24.09", dow:"יום ה׳", city:"osaka", title:"USJ יום 2", emoji:"🎢",
    hotel:"Karaksa Hotel Osaka Namba",
    map:{w:135.42,s:34.66,e:135.45,n:34.68},
    schedule:[
      {time:"09:00",emoji:"🍳",title:"ארוחת בוקר + יציאה",desc:"אחרי Silver Week — פחות עומס!"},
      {time:"09:30",emoji:"🚃",title:"נסיעה ל-USJ",desc:"קו Yotsubashi + JR Yumesaki, ~20 דק׳"},
      {time:"10:00",emoji:"🍄",title:"Nintendo World בנחת",desc:"Express Pass: Mario Kart, Mine-Cart Madness ועוד. זמן לטייל ולצלם בלי לרוץ"},
      {time:"12:00",emoji:"🍽️",title:"ארוחת צהריים בפארק",desc:""},
      {time:"13:00",emoji:"🧙",title:"Harry Potter World",desc:"Express + Standby לפי מה שנשאר"},
      {time:"15:00",emoji:"🎢",title:"Hollywood Dream + זמן חופשי",desc:""},
      {time:"17:00",emoji:"🛍️",title:"קניות בפארק",desc:"מזכרות אחרונות — לא תהיה עוד הזדמנות!"},
      {time:"18:00",emoji:"🚃",title:"חזרה למלון",desc:""},
      {time:"19:00",emoji:"🍽️",title:"ארוחת ערב",desc:"Rikimaru Shinsaibashi (וואגיו tabehoudai קרוב למלון, להזמין מראש)"},
    ]},
  { key:"d_25_09", date:"25.09", dow:"יום ו׳", city:"osaka", title:"קניות + שינקנסן → טוקיו 2", emoji:"🚄",
    hotel:"karaksa hotel TOKYO STATION",
    map:{w:139.76,s:35.67,e:139.78,n:35.69},
    schedule:[
      {time:"09:00",emoji:"🧳",title:"צ׳ק-אאוט מאוסקה",desc:""},
      {time:"09:30",emoji:"🛍️",title:"קניות אחרונות באוסקה",desc:"Tokyu Hands / דון קישוט (Shinsaibashi או Namba)"},
      {time:"12:00",emoji:"🍽️",title:"ארוחת צהריים",desc:""},
      {time:"13:00",emoji:"🚃",title:"נסיעה לתחנת Shin-Osaka",desc:"~10 דק׳"},
      {time:"13:30",emoji:"🚄",title:"שינקנסן טוקאידו אוסקה→טוקיו",desc:"~2.5 שעות. ⚠️ לקנות ~26.08.2026 (30 יום מראש). 5 מקומות ביחד"},
      {time:"16:00",emoji:"🏨",title:"צ׳ק-אין טוקיו",desc:"karaksa hotel TOKYO STATION — ~5 דק׳ הליכה מתחנת טוקיו"},
      {time:"18:15",emoji:"🎮",title:"Sony Showroom – Ginza Place",desc:"דמואים אינטראקטיביים, אפשר לשחק עם הכלב הרובוטי Aibo! כניסה חינם"},
      {time:"18:00",emoji:"🍽️",title:"ארוחת ערב בגינזה",desc:""},
    ]},
  // TOKYO 2
  { key:"d_26_09", date:"26.09", dow:"יום ש׳", city:"tokyo2", title:"TeamLab Planets + אודייבה", emoji:"🌈",
    hotel:"karaksa hotel TOKYO STATION",
    map:{w:139.77,s:35.62,e:139.82,n:35.66},
    schedule:[
      {time:"09:30",emoji:"🚃",title:"נסיעה ל-Toyosu",desc:"רכבת/מטרו + Yurikamome (מונורייל) מהמלון, ~40 דק׳"},
      {time:"10:30",emoji:"🌊",title:"TeamLab Planets – Toyosu",desc:"✅ כרטיסים נרכשו! יחפים, בריכות מים. ⚠️ בגדי חילוף לילד! לא שמלות בלי טייץ — הרצפות מראות"},
      {time:"13:00",emoji:"🍽️",title:"ארוחת צהריים Toyosu",desc:""},
      {time:"14:00",emoji:"🤣",title:"Unko Museum (מוזיאון הקקי)",desc:"DiverCity Tokyo Plaza קומה 2, אודייבה. כיף לילדים! בחוץ: פסל Gundam בגודל טבעי"},
      {time:"15:20",emoji:"🌊",title:"Tokyo Aqua Symphony + זמן חופשי",desc:"מזרקה חינמית עד 150 מ׳ גובה מול Rainbow Bridge. מופעים בכל שעה עגולה, 15:00–21:30"},
      {time:"16:00",emoji:"🚃",title:"חזרה למלון",desc:"Yurikamome + רכבת/מטרו, ~40 דק׳"},
      {time:"18:00",emoji:"🍽️",title:"ארוחת ערב",desc:""},
    ]},
  { key:"d_27_09", date:"27.09", dow:"יום א׳", city:"tokyo2", title:"Day Trip — לבחור קרוב לתאריך", emoji:"🗺️",
    hotel:"karaksa hotel TOKYO STATION",
    map:{w:139.55,s:35.26,e:139.60,n:35.30},
    schedule:[
      {time:"09:00",emoji:"🚃",title:"יציאה לפי האופציה שנבחרה",desc:""},
      {time:"09:00",emoji:"🏯",title:"אופציה A: קמאקורה",desc:"בודהה הגדול (Kotoku-in), מקדשי זן, חוף. JR Yokosuka Line ~53 דק׳ ישיר"},
      {time:"09:00",emoji:"🌊",title:"אופציה B: יוקוהמה + אנושימה",desc:"אקווריום יוקוהמה, נמל ציורי, Chinatown הגדול ביפן, נוף לפוג׳י מהאי"},
      {time:"09:00",emoji:"🛍️",title:"אופציה C: Gotemba Premium Outlets",desc:"290 חנויות עם נוף ישיר לפוג׳י. אוטובוס ישיר ~90–120 דק׳"},
      {time:"18:00",emoji:"🏨",title:"חזרה למלון",desc:"ארוחת ערב"},
    ]},
  { key:"d_28_09", date:"28.09", dow:"יום ב׳", city:"tokyo2", title:"שינג׳וקו + ארוחת ערב אחרונה", emoji:"🌃",
    hotel:"karaksa hotel TOKYO STATION",
    map:{w:139.68,s:35.68,e:139.73,n:35.70},
    schedule:[
      {time:"09:00",emoji:"🧳",title:"השארת מזוודות במלון",desc:"לא צריך coin locker — המלון מחזיק עד אחרי ה-check-out"},
      {time:"09:30",emoji:"🚃",title:"נסיעה לשינג׳וקו",desc:"JR Chuo/Yamanote Line, ~20 דק׳"},
      {time:"10:30",emoji:"🦕",title:"Godzilla Head (Kabukicho)",desc:""},
      {time:"11:00",emoji:"🍢",title:"Omoide Yokocho",desc:"'סמטת הנוסטלגיה' — ברים וקיוסקים קטנטנים, יקיטורי"},
      {time:"12:00",emoji:"🍽️",title:"ארוחת צהריים שינג׳וקו",desc:""},
      {time:"13:00",emoji:"🛍️",title:"Takashimaya Times Square / Isetan Shinjuku",desc:"קניות אחרונות"},
      {time:"17:00",emoji:"🚃",title:"חזרה למלון",desc:"JR Chuo Line, ~20 דק׳"},
      {time:"18:30",emoji:"🎊",title:"ארוחת ערב אחרונה בטוקיו",desc:"חגיגה קטנה לסיום הטיול המדהים! 🇯🇵 הטיסה ב-29.09 ב-11:00 — לא צריך מלון ליד השדה"},
    ]},
  { key:"d_29_09", date:"29.09", dow:"יום ג׳", city:"tokyo2", title:"✈️ המראה LX 161", emoji:"✈️",
    hotel:"נריטה",
    map:{w:140.37,s:35.76,e:140.40,n:35.78},
    schedule:[
      {time:"08:00",emoji:"🍳",title:"ארוחת בוקר + צ׳ק-אאוט",desc:"karaksa hotel TOKYO STATION — ~5 דק׳ הליכה מהמלון לתחנת טוקיו!"},
      {time:"08:30",emoji:"🚃",title:"Narita Express מתחנת טוקיו",desc:"~53 דק׳ ישיר לנריטה טרמינל 1 — נוח מאוד!"},
      {time:"09:30",emoji:"✈️",title:"צ׳ק-אין + ביטחון + פספורט",desc:"נריטה טרמינל 1"},
      {time:"11:00",emoji:"🛫",title:"המראה LX 161",desc:"שיוהיה בהצלחה! ביקרנו ביפן — זה יהיה בלתי נשכח 🇯🇵"},
    ]},
];

const RESTAURANTS = [
  { city:'טוקיו', section:'וואגיו מיוחד', items:[
    { name:'Hinomaru (Kabukicho)', cat:'יאקיניקו/בופה', desc:'4.9⭐, 20,242 ביקורות. מהמפורסמים בטוקיו לוואגיו.', loc:'Kabukicho, Shinjuku' },
    { name:'Ishibashi (Akihabara)', cat:'סוקיאקי', desc:'סוקיאקי וואגיו אותנטי מ-1879, מסורת שנמשכת דורות.', loc:'Akihabara' },
    { name:'Genchan Charcoal (שינג׳וקו)', cat:'tabehoudai', desc:'A4 וואגיו tabehoudai ~¥3,480 — מחיר יוצא דופן לאיכות הזו.', loc:'Shinjuku' },
    { name:'Toranomon Meat & Sake', cat:'יאקיניקו', desc:'קבוצה שמייבאת פרות וואגיו שלמות — מ-farm to table.', loc:'Toranomon' },
    { name:'Ganryujima (גינזה)', cat:'A5 tabehoudai', desc:'יאקיניקו/שאבו/סוקיאקי A5 tabehoudai — הטוב ביותר בגינזה.', loc:'Ginza' },
  ]},
  { city:'טוקיו', section:'חובה להזמין מראש', items:[
    { name:'Nagami (אסאקוסה)', cat:'קייסקי', desc:'4.9⭐ — חוויית קייסקי ברמה שלא תצפו למחיר.', loc:'Asakusa' },
    { name:'Tsujita Kanda (אקיהברה)', cat:'ראמן', desc:'4.9⭐ ראמן. תור ארוך — להגיע מוקדם.', loc:'Kanda/Akihabara' },
    { name:'Sushi Suzuki (צוקישימה)', cat:'אומקסה', desc:'סושי אומקסה ממגישים בדלפק — חוויית אפ-קאונטר אמיתית.', loc:'Tsukishima' },
  ]},
  { city:'קנאזאווה', section:'שוק Omicho', items:[
    { name:'Mori Mori Sushi', cat:'קייטן-סושי', desc:'קייטן-סושי עם פירות ים טריים מהשוק. פופולרי מאוד.', loc:'Omicho Market' },
    { name:'Sensai Enishi', cat:'קאיסנדון', desc:'קערת סשימי על אורז — מנה מקומית מהממת.', loc:'Omicho Market' },
    { name:'Okura', cat:'קייטן זול', desc:'קייטן-סושי במחיר נגיש — אידיאלי למשפחות.', loc:'Omicho Market' },
  ]},
  { city:'קיוטו', section:'Gion / Higashiyama', items:[
    { name:'Gyoza Hohei', cat:'גיוזה', desc:'גיוזה עם שום — פשוט ומושלם. פופולרי מאוד בקיוטו.', loc:'Gion' },
    { name:'Azuma Sushi', cat:'סושי שכונתי', desc:'סושי שכונתי ישן-ישן — מחירים הוגנים, איכות גבוהה.', loc:'Higashiyama' },
    { name:'Nikuryori Oka', cat:'וואגיו מיושן', desc:'וואגיו מיושן של קיוטו — חוויה שלא תמצאו בטוקיו.', loc:'Gion' },
    { name:'Tousuiro Gion', cat:'קייסקי', desc:'טופו ויובה קייסקי — ידידותי למשפחות, חוויה מסורתית.', loc:'Gion' },
  ]},
  { city:'אוסקה', section:'המלצות', items:[
    { name:'Mizuno Okonomiyaki', cat:'Michelin Bib Gourmand', desc:'6 שנות Bib Gourmand רצופות — לגרום להם לבשל מולכם.', loc:'Dotonbori' },
    { name:'Gyozaoh! Dotonbori', cat:'גיוזה', desc:'להגיע בדיוק 17:00 (פתיחה) לאכול מיד, או להזמין.', loc:'Dotonbori' },
    { name:'Rikimaru Shinsaibashi', cat:'וואגיו tabehoudai', desc:'קרוב למלון Namba — וואגיו tabehoudai. להזמין מראש.', loc:'Shinsaibashi' },
    { name:'Matsuzakagyu Yakiniku M', cat:'יאקיניקו', desc:'וואגיו מאטסוזאקה — הבשר הכי יוקרתי ביפן.', loc:'Osaka' },
    { name:'Sukiyaki Kitamura', cat:'סוקיאקי', desc:'סוקיאקי מ-1881 — היסטוריה ואיכות בצלחת אחת.', loc:'Osaka' },
  ]},
  { city:'רשתות', section:'S-Tier — בכל מקום', items:[
    { name:'CoCo Ichibanya', cat:'קארי יפני', desc:'קארי יפני בהתאמה אישית. טעים תמיד, קל למשפחות.', loc:'בכל הרשת' },
    { name:'Sushiro', cat:'סושי מסוע', desc:'סושי איכות גבוהה במחיר נמוך — רשת המסוע הטובה ביותר.', loc:'בכל הרשת' },
    { name:'Ippudo', cat:'ראמן', desc:'ראמן רשת ברמה גבוהה — ברוטה קרמי מנצח.', loc:'בכל הרשת' },
    { name:'Matsuya', cat:'גיודון זול', desc:'ארוחת בוקר/צהריים מהירה וזולה — בשר על אורז.', loc:'בכל הרשת' },
    { name:'Saizeriya', cat:'איטלקי', desc:'איטלקי זול ונוח למשפחות — פיצה/פסטה/סלט, הכל ¥300–600.', loc:'בכל הרשת' },
  ]},
];

const INFO_SECTIONS = [
  { icon:'🛂', title:'כניסה ליפן', content:
    <><p>ישראלים <strong>לא צריכים ויזה</strong> ליפן עד 90 יום. כל מה שצריך:</p>
    <ul><li><strong>Visit Japan Web</strong> — להגיש מראש קצת לפני הנחיתה (כניסה + מכס). יוצר QR code שמאיץ את הכניסה</li>
    <li>חלופה: טפסי נייר בנחיתה — יותר ארוך אבל עובד</li>
    <li>דרכון בתוקף לפחות 6 חודשים מתאריך היציאה</li></ul></>
  },
  { icon:'💳', title:'תשלומים ומטבע', content:
    <><p><strong>⚠️ DCC חשוב:</strong> בקופה/ATM שואלים "לשלם בשקלים או בין?" — תמיד לבחור <strong>ין (JPY)</strong>! שקלים = המרה גרועה של הבנק שלהם.</p>
    <ul><li><strong>כרטיס אשראי</strong> — רוב החנויות הגדולות מקבלות. טאץ׳ מוגבל ל-¥10,000–15,000 — לכן צריך כרטיס פיזי</li>
    <li><strong>מזומן</strong> — הרבה מסעדות קטנות קבלו מזומן בלבד. להחזיק ¥10,000 בכיס</li>
    <li><strong>Suica/Pasmo</strong> — כרטיס תחבורה ציבורית + תשלום בנוחות בחנויות</li>
    <li><strong>ATM</strong> — 7-Eleven ו-Japan Post Bank קולטים כרטיסים ישראלים</li>
    <li><strong>המרה</strong> — ACCESS TICKET בשינג׳וקו ועוד סניפים — שערים טובים מאוד</li></ul></>
  },
  { icon:'💡', title:'טיפים כלליים', content:
    <><ul>
    <li><strong>פטור ממע׳׳מ (~10%)</strong> — לקנות עם דרכון פיזי. מינימום ¥5,000 בחנות אחת (לא מצטבר). שווה מאוד!</li>
    <li><strong>כרטיס פיזי</strong> — Suica/Pasmo עובד בתחבורה ובקניות ב-7-Eleven, Family Mart, Lawson</li>
    <li><strong>אינטרנט</strong> — Pocket Wi-Fi או SIM מקומי. להזמין מראש ב-Klook</li>
    <li><strong>תרגום</strong> — Google Translate עם מצלמה — מצוין לתפריטים ביפנית</li>
    <li><strong>נימוסים</strong> — לא לדבר בטלפון ברכבת, לא לאכול תוך כדי הליכה (בעיקר בקיוטו)</li></ul></>
  },
  { icon:'🧺', title:'כביסה', content:
    <><ul>
    <li><strong>INOVA Kanazawa</strong> — מכונת כביסה בחדר! מזל</li>
    <li>מלונות אחרים — מכונות שירות ~¥100 לכביסה + ¥100 לייבוש (לרוב בקומת כביסה)</li>
    <li>טיפ: להביא קטן של Ariel Pods יפני (3–4 יחידות) מה-7-Eleven</li>
    <li>Takkyubin — שילוח מזוודות בין ערים: ¥1,650–2,530 למזוודה. לשלוח לילה לפני, מגיע בצהריים</li></ul></>
  },
  { icon:'🌀', title:'גיבוי לגשם / טייפון', content:
    <><p><strong>ספטמבר = עונת טייפונים.</strong> כמה ימים בסיכון:</p>
    <ul>
    <li>🔴 <strong>13.09 (פוג׳י/האקונה)</strong> — הטיול המאורגן מבטל/מזכה בסופה. גיבוי: TeamLab Borderless מוקדם</li>
    <li>🔴 <strong>10.09 (DisneySea)</strong> — ידרושו גשמית חזקה ופונצ׳ו לילדים</li>
    <li>✅ ימים בטוחים גשם: <strong>14.09</strong> (TeamLab Borderless), <strong>26.09</strong> (Planets)</li>
    <li><strong>גיבויים מקורים:</strong> Namja Town (שינג׳וקו), Pokemon Center, מוזיאונים, קניונים גדולים</li></ul></>
  },
  { icon:'🍫', title:'KitKat מיוחדים יפן', content:
    <><p>לקנות ב-<strong>Don Quijote</strong>, Duty Free, 7-Eleven:</p>
    <ul>
    <li>🍵 Matcha (הכי קלאסי)</li>
    <li>🍌 Tokyo Banana Flavor</li>
    <li>☕ Hojicha (תה קלוי)</li>
    <li>🍓 Strawberry Cheesecake</li>
    <li>🍶 Sake (כן, ממש!)</li>
    <li>🌿 Wasabi (לאמיצים)</li>
    <li>🍋 Yuzu (לימון יפני)</li>
    <li>🌸 Sakura (עונתי)</li>
    <li>🥜 Kinako (קמח סויה קלויה)</li></ul>
    <p>לקנות גם מארזות מתנה (箱) לאנשים בבית — הכי נוח ב-Duty Free נריטה ביציאה.</p></>
  },
  { icon:'👗', title:'קניות ומותגי לבוש', content:
    <><ul>
    <li><strong>ISSEY MIYAKE, COMME des GARÇONS</strong> — פריים, מחירים יקרים אבל אותנטיים ומיוחדים</li>
    <li><strong>UNIQLO</strong> — איכות יפנית, מחיר נגיש. לקנות Heattech לחורף, Airism לקיץ</li>
    <li><strong>MUJI</strong> — עיצוב מינימליסטי, כל בית צריך משהו מ-MUJI</li>
    <li><strong>GU</strong> — אחות זולה של UNIQLO, מגמות צעירות</li>
    <li>⚠️ <strong>Tax-Free עם דרכון</strong> — להציג בקופה! עובד ב-UNIQLO, MUJI, ועוד</li></ul></>
  },
];

const BOOKINGS = [
  { status:'✅', name:'TeamLab Borderless', date:'14.09', note:'Azabudai Hills — כרטיסים נרכשו', badge:'badge-done' },
  { status:'✅', name:'TeamLab Planets', date:'26.09', note:'Toyosu — כרטיסים נרכשו', badge:'badge-done' },
  { status:'✅', name:'DisneySea', date:'10.09', note:'¥37,800 — נרכש', badge:'badge-done' },
  { status:'✅', name:'USJ 2 ימים + Express Pass', date:'23–24.09', note:'$1,437.82 (Klook)', badge:'badge-done' },
  { status:'✅', name:'Shibuya Sky', date:'11.09, 17:00', note:'נרכש 21.08.2026', badge:'badge-done' },
  { status:'✅', name:'One Piece VIP Show', date:'23.09, 18:45', note:'כרטיסים בידיים!', badge:'badge-done' },
  { status:'✅', name:'Kaiyukan אקווריום', date:'22.09, 10:15', note:'¥11,500 — כרטיסים נרכשו', badge:'badge-done' },
  { status:'✅', name:'שינקנסן Kagayaki טוקיו→קנאזאווה', date:'15.09', note:'Receipt: AED3752L — קרון 8, מקומות 10A-10E', badge:'badge-done' },
  { status:'✅', name:'שינקנסן קנאזאווה→קיוטו', date:'17.09', note:'Receipt: AED3779L — ¥30,080', badge:'badge-done' },
  { status:'✅', name:'5 מלונות', date:'כל הטיול', note:'karaksa Yaesu / INOVA Kanazawa / Oriental Kyoto / karaksa Namba / karaksa Tokyo Station', badge:'badge-done' },
  { status:'⏳', name:'Keisei Skyliner נריטה→אוּאֶנו', date:'08.09', note:'~¥9,890 למשפחה — לרכוש מראש ב-Klook/KKday', badge:'badge-open' },
  { status:'⏳', name:'שייט Hozugawa', date:'18.09', note:'~¥16,300 — Klook/KKday או hozugawaboatride.com', badge:'badge-open' },
  { status:'⏳', name:'מקדש הנינג׳ה Myoryuji', date:'16.09', note:'הזמנה חובה — לפחות יום מראש דרך האתר הרשמי', badge:'badge-open' },
  { status:'⏳', name:'שינקנסן אוסקה→טוקיו', date:'25.09', note:'לקנות ~26.08.2026 (30 יום מראש) — 5 מקומות ביחד', badge:'badge-open' },
  { status:'⏳', name:'Mipig Cafe הראג׳וקו', date:'11.09', note:'הזמנה מראש חובה — עד 04.09', badge:'badge-open' },
  { status:'❌', name:'מוזיאון נינטנדו', date:'—', note:'אזל — ויתרנו', badge:'badge-skip' },
  { status:'🔴', name:'Kangetsu Daikakuji', date:'18.09', note:'לוודא תאריך מדויק קרוב לטיול', badge:'badge-skip' },
];

// ── Components ────────────────────────────────────────────────────────────────

function ItemModal({ item, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div style={{fontSize:32, marginBottom:8}}>{item.emoji}</div>
        {item.time && <div className="modal-time">{item.time}</div>}
        <div className="modal-title">{item.title}</div>
        <div className="modal-desc">{item.desc}</div>
        <button className="modal-close" onClick={onClose}>סגור</button>
      </div>
    </div>
  );
}

function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      onLogin(cred.user);
    } catch (ex) {
      setErr(ex.code === 'auth/wrong-password' || ex.code === 'auth/user-not-found'
        ? 'שם משתמש או סיסמה שגויים' : 'שגיאה — נסה שוב');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-modal" onClick={onClose}>
      <div className="login-card" onClick={e => e.stopPropagation()}>
        <div className="login-title">🔑 כניסת עורכים</div>
        <form onSubmit={handle}>
          <div className="login-field">
            <label>אימייל</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoFocus />
          </div>
          <div className="login-field">
            <label>סיסמה</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          </div>
          {err && <div className="login-err">{err}</div>}
          <button className="login-btn" type="submit" disabled={loading || !email || !pass}>
            {loading ? '...' : 'כניסה'}
          </button>
        </form>
        <button className="login-cancel" onClick={onClose}>ביטול</button>
      </div>
    </div>
  );
}

function DayDetail({ day, user, onBack }) {
  const [note, setNote] = useState('');
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const debounceRef = useRef(null);
  const cityColor = CITY_META[day.city]?.color || '#D4AF37';

  useEffect(() => {
    const r = ref(db, `notes/${day.key}`);
    const unsub = onValue(r, snap => {
      setNote(snap.val() || '');
      setNoteLoaded(true);
    });
    return () => unsub();
  }, [day.key]);

  const handleNoteChange = (val) => {
    setNote(val);
    if (user && !user.isAnonymous) {
      setSyncing(true);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try { await set(ref(db, `notes/${day.key}`), val); }
        finally { setSyncing(false); }
      }, 600);
    }
  };

  const centerLat = ((day.map.s + day.map.n) / 2).toFixed(5);
  const centerLon = ((day.map.w + day.map.e) / 2).toFixed(5);
  const googleMapsUrl = `https://www.google.com/maps/@${centerLat},${centerLon},14z`;
  const mapSrcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map=L.map('map',{zoomControl:false,scrollWheelZoom:false,dragging:false,keyboard:false,tap:false})
  .setView([${centerLat},${centerLon}],13);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  {maxZoom:18,attribution:''}).addTo(map);
L.circleMarker([${centerLat},${centerLon}],{radius:7,color:'#D4AF37',fillColor:'#D4AF37',fillOpacity:1,weight:2}).addTo(map);
</script></body></html>`;

  return (
    <div className="day-detail">
      <div className="dd-header">
        <button className="dd-back" onClick={onBack}>
          <span>→</span> חזרה לרשימה
        </button>
        <div className="dd-date-row">{day.dow} · {day.date}</div>
        <div className="dd-title">{day.emoji} {day.title}</div>
        <div className="dd-hotel">🏨 {day.hotel}</div>
      </div>

      <div className="dd-map" style={{position:'relative'}}>
        <iframe
          srcdoc={mapSrcdoc}
          title={`מפה — ${day.title}`}
          scrolling="no"
        />
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position:'absolute', bottom:10, left:10,
            background:'rgba(255,255,255,0.92)', color:'#1a73e8',
            padding:'5px 12px', borderRadius:20, fontSize:12,
            fontWeight:700, textDecoration:'none', boxShadow:'0 1px 6px rgba(0,0,0,0.25)',
            display:'flex', alignItems:'center', gap:5,
          }}
        >
          🗺️ פתח בגוגל מפות
        </a>
      </div>

      <div className="timeline">
        <div className="timeline-title">לוח זמנים</div>
        {day.schedule.map((item, i) => (
          <div key={i} className="tl-item" onClick={() => setActiveItem(item)}
               style={{borderRight: `3px solid ${cityColor}`, paddingRight:10, marginRight:0}}>
            <div className="tl-time">{item.time}</div>
            <div className="tl-emoji">{item.emoji}</div>
            <div className="tl-content">
              <div className="tl-name">{item.title}</div>
              {item.desc && <div className="tl-desc">{item.desc}</div>}
            </div>
            <div className="tl-chevron">‹</div>
          </div>
        ))}
      </div>

      <div className="notes-section">
        <div className="notes-label">
          📝 הערות ליום
          {syncing && <span className="notes-sync" title="שומר..." />}
        </div>
        {!noteLoaded
          ? <div style={{color:'var(--text3)',fontSize:13}}>טוען...</div>
          : <>
            <textarea
              className="notes-ta"
              value={note}
              onChange={e => handleNoteChange(e.target.value)}
              disabled={!user || user.isAnonymous}
              placeholder={user && !user.isAnonymous ? 'כתבו הערות, תזכורות, קישורים...' : 'רק משתמשים רשומים יכולים לכתוב הערות'}
              rows={4}
            />
            {(!user || user.isAnonymous) && (
              <div className="notes-hint">כדי לערוך הערות — התחבר עם כפתור 🔑 למעלה</div>
            )}
          </>
        }
      </div>

      {activeItem && <ItemModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}

function Tab1Schedule({ user }) {
  const [city, setCity] = useState('tokyo1');
  const [selectedDay, setSelectedDay] = useState(null);

  const cityDays = DAYS.filter(d => d.city === city);
  const cityColor = CITY_META[city]?.color || '#D4AF37';

  if (selectedDay) {
    return <DayDetail day={selectedDay} user={user} onBack={() => setSelectedDay(null)} />;
  }

  return (
    <div className="tab-content">
      <div className="city-strip">
        {CITY_ORDER.map(c => {
          const m = CITY_META[c];
          return (
            <button key={c} className={`city-chip${city===c?' active':''}`}
                    onClick={() => setCity(c)}
                    style={city===c ? {color: m.color, borderColor: m.color, background:`${m.color}18`} : {}}>
              {m.emoji} {m.label}
            </button>
          );
        })}
      </div>
      <div className="day-list">
        {cityDays.map(day => (
          <div key={day.key} className="day-card"
               style={{borderRightColor: cityColor}}
               onClick={() => setSelectedDay(day)}>
            <div className="dc-emoji">{day.emoji}</div>
            <div className="dc-info">
              <div className="dc-date">{day.dow} · {day.date}</div>
              <div className="dc-title">{day.title}</div>
              <div className="dc-hotel">🏨 {day.hotel}</div>
            </div>
            <div className="dc-arrow">‹</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tab2Restaurants() {
  return (
    <div className="tab-content" style={{paddingBottom:8}}>
      {RESTAURANTS.map((group, gi) => (
        <div key={gi}>
          <div className="sec-header">{group.city} — {group.section}</div>
          <div className="rest-list">
            {group.items.map((r, i) => (
              <div key={i} className="rest-card">
                <div className="rest-top">
                  <div className="rest-name">{r.name}</div>
                  <div className="rest-badge">{r.cat}</div>
                </div>
                <div className="rest-desc">{r.desc}</div>
                <div className="rest-loc">📍 {r.loc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AccordionItem({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="acc-item">
      <button className="acc-btn" onClick={() => setOpen(o => !o)}>
        <span className="acc-btn-icon">{section.icon}</span>
        <span className="acc-btn-title">{section.title}</span>
        <span className={`acc-btn-arrow${open?' open':''}`}>▼</span>
      </button>
      {open && <div className="acc-body">{section.content}</div>}
    </div>
  );
}

function Tab3Info() {
  return (
    <div className="tab-content">
      <div className="sec-header">מידע שימושי לטיול</div>
      <div className="acc-list">
        {INFO_SECTIONS.map((s, i) => <AccordionItem key={i} section={s} />)}
      </div>
    </div>
  );
}

function Tab4Bookings() {
  const done = BOOKINGS.filter(b => b.status === '✅');
  const open = BOOKINGS.filter(b => b.status === '⏳');
  const other = BOOKINGS.filter(b => b.status !== '✅' && b.status !== '⏳');

  const Group = ({ title, items }) => items.length === 0 ? null : (
    <>
      <div className="sec-header">{title}</div>
      <div className="book-list">
        {items.map((b, i) => (
          <div key={i} className="book-card">
            <div className="book-status">{b.status}</div>
            <div className="book-info">
              <div className="book-date">{b.date}</div>
              <div className="book-name">{b.name}</div>
              {b.note && <div className="book-note">{b.note}</div>}
            </div>
            <div className={`book-badge ${b.badge}`}>
              {b.status==='✅'?'נרכש':b.status==='⏳'?'בהמתנה':'לא רלוונטי'}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="tab-content" style={{paddingBottom:8}}>
      <Group title={`✅ נרכש (${done.length})`} items={done} />
      <Group title={`⏳ עדיין פתוח (${open.length})`} items={open} />
      <Group title="❌ / 🔴 ביטול / לוודא" items={other} />
    </div>
  );
}

function Tab5Recs({ user }) {
  const [recs, setRecs] = useState(null);

  useEffect(() => {
    const r = ref(db, 'recs');
    const unsub = onValue(r, snap => {
      const val = snap.val();
      setRecs(val ? Object.entries(val).map(([id, v]) => ({ id, ...v })) : []);
    });
    return () => unsub();
  }, []);

  const delRec = async (id) => {
    try { await remove(ref(db, `recs/${id}`)); } catch {}
  };

  if (recs === null) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const byCategory = recs.reduce((acc, r) => {
    const cat = r.category || 'כללי';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const canDelete = user && !user.isAnonymous;

  if (recs.length === 0) {
    return (
      <div className="tab-content">
        <div className="recs-empty">
          <div style={{fontSize:40,marginBottom:12}}>⭐</div>
          <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>אין המלצות עדיין</div>
          <div style={{fontSize:14}}>המלצות שיתווספו לפרויקט יופיעו כאן</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content" style={{paddingBottom:8}}>
      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat}>
          <div className="sec-header">{cat}</div>
          <div className="recs-list">
            {items.map(rec => (
              <div key={rec.id} className="rec-card">
                <div className="rec-body">
                  <div className="rec-cat">{cat}</div>
                  <div className="rec-text">{rec.text}</div>
                  {rec.author && <div className="rec-author">— {rec.author}</div>}
                </div>
                {canDelete && (
                  <button className="rec-del" onClick={() => delRec(rec.id)} title="מחק">🗑</button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
const TABS_CONFIG = [
  { emoji:'📅', label:'לוז',      Comp: Tab1Schedule },
  { emoji:'🍜', label:'מסעדות',   Comp: Tab2Restaurants },
  { emoji:'ℹ️',  label:'מידע',     Comp: Tab3Info },
  { emoji:'🎟️', label:'הזמנות',   Comp: Tab4Bookings },
  { emoji:'⭐',  label:'המלצות',   Comp: Tab5Recs },
];

export default function App() {
  const [tabIdx, setTabIdx] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('jp_dark') === '1'; } catch { return false; }
  });
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    try { localStorage.setItem('jp_dark', darkMode ? '1' : '0'); } catch {}
  }, [darkMode]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) {
        signInAnonymously(auth).catch(() => {});
      }
    });
    return unsub;
  }, []);

  const { Comp: CurrentTab } = TABS_CONFIG[tabIdx];

  return (
    <>
      <header className="hdr">
        <div className="hdr-title">
          <span style={{fontSize:26}}>🇯🇵</span>
          <div className="hdr-title-wrap">
            <div className="jp-main">יפן ספטמבר 2026</div>
            <div className="jp-sub">Volmark Family Trip · Japan</div>
          </div>
        </div>
        <div className="hdr-actions">
          {authReady && (
            user && !user.isAnonymous
              ? <button className="btn-icon" onClick={() => signOut(auth)} title="התנתק">👤</button>
              : <button className="btn-icon" onClick={() => setShowLogin(true)} title="כניסת עורכים">🔑</button>
          )}
          <button className="btn-icon" onClick={() => setDarkMode(d => !d)} title="מצב לילה">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="main">
        <CurrentTab user={user} db={db} />
      </main>

      <nav className="tabbar">
        {TABS_CONFIG.map((t, i) => (
          <button
            key={i}
            className={`tab-btn${tabIdx===i?' active':''}`}
            onClick={() => setTabIdx(i)}
          >
            <span className="t-emoji">{t.emoji}</span>
            <span className="t-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={(u) => { setUser(u); setShowLogin(false); }}
        />
      )}
    </>
  );
}
