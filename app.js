(function () {
  'use strict';

  /* ---------- small helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = s => { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const todayStr = () => ymd(new Date());
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortDate = s => { const d = parse(s); return DOW[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); };
  const monDay = s => { const d = parse(s); return MON[d.getMonth()] + ' ' + d.getDate(); };
  const fmtTime = t => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? ' AM' : ' PM'); };
  const toMin = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const num = v => { const n = Number(v); return isFinite(n) ? n : 0; };
  const fmtN = n => Math.round(n).toLocaleString();
  const fmtW = n => String(Math.round(n * 10) / 10);
  const clone = o => JSON.parse(JSON.stringify(o == null ? null : o));
  const e1rm = (w, r) => w * (1 + r / 30);
  const key = s => String(s || '').trim().toLowerCase();
  const clock = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + pad(s % 60); };
  const mondayOf = s => addDays(s, -((parse(s).getDay() + 6) % 7));

  /* ---------- palette (single deliberate light theme) ---------- */
  const G = '#D9B44A';
  let F = '#2E5E3E', M = '#D6EFDD';
  const GEM = { gold: G, green: '#3E9B63', blue: '#3D6DB5', red: '#B5404F' };
  const SPLITS = ['Push', 'Pull', 'Legs', 'Upper', 'Lower'];
  const DEFAULT_SPLIT = { 1: 'Push', 2: 'Pull', 3: 'Legs', 4: 'Upper', 5: 'Lower' };
  const DEF_SET = { name: '', theme: 'forest', custom: null, calGoal: 0, proGoal: 0, waterGoal: 8, restSecs: 90, focusMins: 25, sound: false, motion: true, evening: true };

  /* ---------- icons: each one means exactly one thing ---------- */
  const IC = {
    home: '<path d="M5 21V8h2v2h2V8h2v2h2V8h2v2h2V8h2v13ZM10 21v-4a2 2 0 0 1 4 0v4"/>',
    scroll: '<path d="M8 3h10a2 2 0 0 1 0 4h-2"/><path d="M8 3a2 2 0 0 0-2 2v11"/><path d="M16 7v10a3 3 0 0 1-3 3H5a2 2 0 0 1 0-4h8a2 2 0 0 1 2 2"/><path d="M9.5 8h3.5M9.5 12h3.5"/>',
    book: '<path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5c2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5zM12 6v13"/>',
    goblet: '<path d="M7 3h10l-1 5a4 4 0 0 1-8 0zM12 12v6M9 18h6M8 21h8"/>',
    sword: '<path d="M12 2l2 3v10h-4V5zM7 15h10M12 15v5"/><circle cx="12" cy="21" r="1"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.5 8-7 10c-3.5-2-7-5-7-10V6z"/>',
    hourglass: '<path d="M7 3h10M7 21h10M8 3v2c0 3 4 5 4 7c0-2 4-4 4-7V3M8 21v-2c0-3 4-5 4-7c0 2 4 4 4 7v2"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H5.5a2.5 2.5 0 0 0 2.5 4M16 6h2.5a2.5 2.5 0 0 1-2.5 4M12 14v3M9 21h6M10 17h4v4h-4z"/>',
    scale: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 10a3.5 3.5 0 0 1 7 0M12 10l1.5-2"/>',
    flame: '<path d="M12 3c.5 3 5 5 5 10a5 5 0 0 1-10 0c0-2.4 1.3-4 2.6-5c-.1 1.8.7 3 1.9 3.4C11.6 9 11 6 12 3z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    candle: '<path d="M9 10h6v11H9zM12 10V8"/><path d="M12 2c1.5 2 2 3 2 4a2 2 0 0 1-4 0c0-1 .5-2 2-4z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevleft: '<path d="M15 6l-6 6 6 6"/>',
    chevright: '<path d="M9 6l6 6-6 6"/>',
    chevdown: '<path d="M6 9l6 6 6-6"/>',
    chevup: '<path d="M6 15l6-6 6 6"/>',
    diamond: '<path d="M12 3l8 9-8 9-8-9z"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/>'
  };
  const ico = (n, s, cls) => `<svg class="${cls || ''}" width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
  const gem = (c, s) => `<svg class="gem" width="${s || 12}" height="${s || 12}" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1L11 6L6 11L1 6Z" fill="${c}" stroke="${G}" stroke-width="1.2"/></svg>`;
  const vial = (full, s) => `<svg width="${s || 30}" height="${s || 30}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${full ? '<path d="M7.6 15h8.8l.6 1.2a4 4 0 0 1-3.6 4.8h-3a4 4 0 0 1-3.6-4.8z" fill="#3D6DB5" stroke="none"/>' : ''}<path d="M10 3h4M11 3v5l-4 7a4 4 0 0 0 3.5 6h3a4 4 0 0 0 3.5-6l-4-7V3"/></svg>`;
  const stud = (x, y) => `<path d="M${x} ${y - 2.5}L${x + 2.5} ${y}L${x} ${y + 2.5}L${x - 2.5} ${y}Z" fill="${G}"/>`;
  const coin = icon => `<svg class="coin" width="46" height="46" viewBox="0 0 48 48" aria-hidden="true"><circle class="mf" cx="24" cy="24" r="20" fill="${M}" stroke="${G}" stroke-width="2.2"/><circle class="mr" cx="24" cy="24" r="16.5" fill="none" stroke="${G}" stroke-width="0.8" stroke-opacity="0.7"/>${stud(24, 4)}${stud(44, 24)}${stud(24, 44)}${stud(4, 24)}<svg x="12" y="12" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${F}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[icon]}</svg></svg>`;
  const KIND_ICON = { class: 'book', hw: 'book', lift: 'sword', other: 'diamond', exam: 'shield' };

  /* ---------- state ---------- */
  const S = { set: Object.assign({}, DEF_SET), plans: [], homework: [], exams: [], saved: [], food: {}, workouts: {}, weights: {}, page: 0, rest: { end: null }, focus: null };
  const U = { more: false, school: 'hw', openHw: null, showDone: false, weekStart: null, schedDay: null, editSaved: false, prOpen: false, est: null, estBusy: false, estErr: '', manual: false, glow: null };
  let SAMPLE = null; /* AI estimates are only in the Claude version; this one logs food by hand */
  const mem = { plans: {}, homework: {}, exams: {}, saved: {}, food: {}, workouts: {}, weights: {} };
  const COLS = Object.keys(mem);
  const MAPS = { food: 1, workouts: 1, weights: 1 };

  /* ---------- storage: saved on this phone (localStorage), with backup export and import ---------- */
  const LS_KEY = 'orii-data-v1';
  let canSave = true;
  function persist() {
    if (!canSave) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify({ v: 1, settings: S.set, data: mem })); }
    catch (e) { toast("Couldn't save. Your phone may be out of space."); }
  }
  function loadLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.settings) S.set = Object.assign({}, DEF_SET, o.settings);
        COLS.forEach(c => { mem[c] = (o && o.data && o.data[c]) || {}; });
      }
      localStorage.setItem(LS_KEY + '-test', '1'); localStorage.removeItem(LS_KEY + '-test');
    } catch (e) { canSave = false; }
    COLS.forEach(c => { const arr = Object.keys(mem[c]).map(id => Object.assign({ id }, clone(mem[c][id]))); if (MAPS[c]) { const m = {}; arr.forEach(o => { m[o.id] = o; }); S[c] = m; } else S[c] = arr; });
  }
  function applyCol(c, arr) {
    if (MAPS[c]) { const m = {}; arr.forEach(o => { m[o.id] = o; }); S[c] = m; } else S[c] = arr;
    scheduleRender();
  }
  function memApply(c) { applyCol(c, Object.keys(mem[c]).map(id => Object.assign({ id }, clone(mem[c][id])))); }
  function put(c, id, data) {
    const body = clone(data); delete body.id;
    mem[c][id] = body; persist(); memApply(c); return Promise.resolve();
  }
  function del(c, id) {
    delete mem[c][id]; persist(); memApply(c); return Promise.resolve();
  }
  function saveSettings() {
    persist(); applyMotion(); renderHeader(); scheduleRender();
    return Promise.resolve();
  }

  /* ---------- derived data ---------- */
  const activeHw = () => S.homework.filter(h => !h.done).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (a.created || 0) - (b.created || 0));
  const doneHw = () => S.homework.filter(h => h.done).sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
  function dueInfo(due) {
    if (!due) return { label: 'No due date', cls: '' };
    const d = diffDays(todayStr(), due);
    if (d < 0) return { label: 'Past due', cls: 'past' };
    if (d === 0) return { label: 'Due today', cls: '' };
    if (d === 1) return { label: 'Due tomorrow', cls: '' };
    return { label: 'Due in ' + d + ' days', cls: '' };
  }
  function examInfo(date) {
    const d = diffDays(todayStr(), date);
    const label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d + ' days';
    const cls = d <= 3 ? 'red' : d <= 10 ? 'orange' : d <= 20 ? 'yellow' : 'sage';
    return { d, label, cls };
  }
  const upcomingExams = () => S.exams.filter(e => e.date && diffDays(todayStr(), e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const classNames = () => Array.from(new Set(S.plans.filter(p => p.kind === 'class').map(p => p.title).filter(Boolean))).sort();
  const dayFood = d => { const f = S.food[d]; return { meals: clone((f && f.meals) || []), water: (f && f.water) || 0 }; };
  const dayW = d => { const w = S.workouts[d]; return { split: (w && w.split) || DEFAULT_SPLIT[parse(d).getDay()] || 'Push', ex: clone((w && w.ex) || []) }; };
  function setsChrono() {
    const out = [];
    Object.keys(S.workouts).sort().forEach(d => {
      ((S.workouts[d] && S.workouts[d].ex) || []).forEach(e => (e.sets || []).forEach(s => out.push({ date: d, name: e.name, k: key(e.name), w: num(s.w), r: num(s.r), e: e1rm(num(s.w), num(s.r)) })));
    });
    return out;
  }
  function bestBefore(name, date) { const k = key(name); let b = 0; setsChrono().forEach(s => { if (s.k === k && s.date < date && s.e > b) b = s.e; }); return b; }
  function bestAll(name) { const k = key(name); let b = 0; setsChrono().forEach(s => { if (s.k === k && s.e > b) b = s.e; }); return b; }
  function lastTime(name, date) {
    const k = key(name);
    const ds = Object.keys(S.workouts).filter(d => d < date).sort().reverse();
    for (const d of ds) { const e = ((S.workouts[d] && S.workouts[d].ex) || []).find(x => key(x.name) === k && (x.sets || []).length); if (e) return { date: d, sets: e.sets }; }
    return null;
  }
  function prEvents() {
    const best = {}, ev = [];
    setsChrono().forEach(s => { const b = best[s.k] || 0; if (b > 0 && s.e > b + 1e-9) ev.push(s); if (s.e > b) best[s.k] = s.e; });
    return ev;
  }
  function prTable() {
    const m = {};
    setsChrono().forEach(s => { if (!m[s.k] || s.e > m[s.k].e) m[s.k] = s; });
    return Object.values(m).sort((a, b) => a.name.localeCompare(b.name));
  }
  const exNames = () => Array.from(new Set(setsChrono().map(s => s.name).concat(Object.values(S.workouts).flatMap(w => (w.ex || []).map(e => e.name))))).sort();
  function didSomething(d) {
    const w = S.workouts[d];
    const lifted = w && (w.ex || []).some(e => (e.sets || []).length);
    const hw = S.homework.some(h => h.doneAt === d || (h.steps || []).some(s => s.doneAt === d));
    return !!(lifted || hw);
  }
  function weekdayStreak() {
    const t = todayStr(); let d = didSomething(t) || parse(t).getDay() % 6 === 0 ? t : addDays(t, -1);
    let seen = 0, n = 0;
    while (seen < 5) { const dw = parse(d).getDay(); if (dw !== 0 && dw !== 6) { seen++; if (didSomething(d)) n++; } d = addDays(d, -1); }
    return n;
  }
  function itemsOn(d) {
    const dw = parse(d).getDay(), out = [];
    S.plans.forEach(p => {
      const hit = p.date ? p.date === d : (p.days || []).map(Number).includes(dw);
      if (hit) out.push({ src: 'plan', id: p.id, kind: p.kind || 'other', title: p.title, start: p.start || '', end: p.end || '', sub: [p.end ? 'Until ' + fmtTime(p.end) : '', p.place || ''].filter(Boolean).join(' · ') });
    });
    S.exams.forEach(e => { if (e.date === d) out.push({ src: 'exam', id: e.id, kind: 'exam', title: e.title, start: '', sub: [e.course, 'Exam'].filter(Boolean).join(' · ') }); });
    S.homework.forEach(h => { if (!h.done && h.due === d) out.push({ src: 'hw', id: h.id, kind: 'hw', title: h.title, start: '', sub: [h.course, 'Homework due'].filter(Boolean).join(' · ') }); });
    return out.sort((a, b) => (a.start ? 1 : 0) - (b.start ? 1 : 0) || (a.start || '').localeCompare(b.start || ''));
  }
  function nextUp() {
    const now = new Date(), mins = now.getHours() * 60 + now.getMinutes();
    const items = itemsOn(todayStr()).filter(i => i.start);
    const cur = items.find(i => i.end && toMin(i.start) <= mins && mins < toMin(i.end));
    if (cur) return `Now: <b>${esc(cur.title)}</b> until ${fmtTime(cur.end)}`;
    const nx = items.find(i => toMin(i.start) > mins);
    if (!nx) return '';
    const dm = toMin(nx.start) - mins, h = Math.floor(dm / 60), m = dm % 60;
    return `Next: <b>${esc(nx.title)}</b> in ${h ? h + ' h ' : ''}${m} m`;
  }

  /* ---------- sound and motion ---------- */
  let AC = null;
  function chime() {
    if (!S.set.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      [880, 1320].forEach((f, k) => {
        const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f;
        const t = AC.currentTime + k * 0.12;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(g).connect(AC.destination); o.start(t); o.stop(t + 0.65);
      });
    } catch (e) { /* sound is optional */ }
  }
  const reduceMQ = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const motionOn = () => S.set.motion && !reduceMQ.matches;
  function applyMotion() { document.body.classList.toggle('calm', !motionOn()); applyTheme(); }
  /* ---------- color themes ---------- */
  const THEMES = [
    { id: 'forest', name: 'Forest', c: ['#D6EFDD', '#B5D3BD', '#2E5E3E'] },
    { id: 'pistachio', name: 'Pistachio', c: ['#E8F1D2', '#C6DBA3', '#3A5A2C'] },
    { id: 'eucalyptus', name: 'Eucalyptus', c: ['#D7EEE6', '#A9CFC1', '#2D5A4C'] },
    { id: 'lagoon', name: 'Lagoon', c: ['#DCEBF6', '#B0CDE4', '#274A69'] },
    { id: 'lavender', name: 'Lavender', c: ['#E9E3F6', '#C8BCE6', '#45376C'] },
    { id: 'rose', name: 'Rose', c: ['#F7E1E6', '#E6BAC5', '#6A2D3D'] },
    { id: 'peach', name: 'Peach', c: ['#FAE7D7', '#EEC6A6', '#683A1E'] },
    { id: 'stone', name: 'Stone', c: ['#E7E9E4', '#C9CEC5', '#38433E'] }
  ];
  const hexOk = h => /^#[0-9a-f]{6}$/i.test(h || '');
  function lum(h) { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; }
  function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mixHex(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  function customProblem(c) {
    if (!c.every(hexOk)) return 'Pick all three colors.';
    if (contrast(c[2], c[1]) < 4.5) return 'Pick a darker Dark color, or a lighter Middle, so text stays easy to read.';
    if (contrast(c[2], c[0]) < 4.5) return 'Pick a darker Dark color, or a lighter Light, so text stays easy to read.';
    return '';
  }
  function themeColors() {
    if (S.set.theme === 'custom') {
      const c = S.set.custom || {}, arr = [c.light, c.mid, c.dark];
      if (!customProblem(arr)) return arr;
    }
    return (THEMES.find(x => x.id === S.set.theme) || THEMES[0]).c;
  }
  function applyTheme() {
    const c = themeColors(), r = document.documentElement.style;
    M = c[0]; F = c[2];
    r.setProperty('--mint', c[0]); r.setProperty('--sage', c[1]); r.setProperty('--forest', c[2]);
    r.setProperty('--muted', mixHex(c[2], c[1], 0.12));
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', c[2]);
  }
  const swatch = c => `<span class="sw" aria-hidden="true"><i style="background:${c[0]}"></i><i style="background:${c[1]}"></i><i style="background:${c[2]}"></i></span>`;
  function themeBlock() {
    const cur = S.set.theme || 'forest', cu = S.set.custom || {};
    const cc = [cu.light, cu.mid, cu.dark].map((h, i) => hexOk(h) ? h : THEMES[0].c[i]);
    let x = `<div class="themes" role="radiogroup" aria-label="Colors">${THEMES.map(t => `<button type="button" class="theme ${cur === t.id ? 'on' : ''}" role="radio" aria-checked="${cur === t.id}" data-act="theme" data-v="${t.id}">${swatch(t.c)}<span>${t.name}</span></button>`).join('')}<button type="button" class="theme ${cur === 'custom' ? 'on' : ''}" role="radio" aria-checked="${cur === 'custom'}" data-act="theme" data-v="custom">${swatch(cc)}<span>Custom</span></button></div>`;
    if (cur === 'custom') {
      x += `<div class="custom-row">${[['light', 'Light', 'Page background'], ['mid', 'Middle', 'Cards and panels'], ['dark', 'Dark', 'Text, header, and menu']].map(([k, l, h], i) => `<label class="cpick"><input type="color" data-custom="${k}" value="${cc[i].toLowerCase()}"><span><b>${l}</b><small>${h}</small></span></label>`).join('')}</div><div class="err" id="custom-err"></div>`;
    }
    return x;
  }


  /* ---------- toast with undo ---------- */
  let toastT = null;
  function toast(msg, undo) {
    const el = $('#toast');
    el.innerHTML = '<span class="tmsg"></span>' + (undo ? '<button type="button" class="tundo">Undo</button>' : '');
    $('.tmsg', el).textContent = msg;
    el.hidden = false; clearTimeout(toastT);
    if (undo) $('.tundo', el).onclick = () => { el.hidden = true; undo(); };
    toastT = setTimeout(() => { el.hidden = true; }, undo ? 6500 : 3200);
  }
  function banner(msg) { const b = $('#banner'); if (!msg) { b.hidden = true; return; } b.textContent = msg; b.hidden = false; }

  /* ---------- shared bits ---------- */
  const secHead = (t, sub, c) => `<div class="sec-h"><h2 class="t">${gem(c, 13)}${t}</h2>${sub ? `<small>${sub}</small>` : ''}</div>`;
  function compliment() {
    const C = window.ORII_COMPLIMENTS || [];
    const n = new Date(), doy = Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 864e5);
    return C.length ? C[(doy - 1 + C.length) % C.length] : 'You keep showing up. That matters.';
  }
  function focusLeft() { const f = S.focus; if (!f) return 0; return f.end ? Math.max(0, (f.end - Date.now()) / 1000) : f.left; }
  function restLeft() { return S.rest.end ? Math.max(0, (S.rest.end - Date.now()) / 1000) : S.set.restSecs; }
  function stepLi(h, s, i) {
    return `<li id="st-${h.id}-${i}"><button class="chk ${s.done ? 'on' : ''}" data-act="step" data-id="${h.id}" data-i="${i}" aria-pressed="${!!s.done}" aria-label="${s.done ? 'Mark not done' : 'Mark done'}: ${esc(s.t)}">${s.done ? ico('check', 16) : ''}</button><span class="st ${s.done ? 'struck' : ''}">${esc(s.t)}</span></li>`;
  }

  /* ---------- install prompt ---------- */
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; scheduleRender(); });
  window.addEventListener('appinstalled', () => { deferredInstall = null; scheduleRender(); });
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  function installCard() {
    if (isStandalone()) return '';
    try { if (localStorage.getItem('orii-hide-install')) return ''; } catch (e) { /* ignore */ }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const how = deferredInstall ? 'Install Orii so it opens like an app, even offline.' : ios ? 'In Safari, tap the Share button, then Add to Home Screen.' : 'In Chrome, tap the ⋮ menu, then Add to Home screen or Install app.';
    return `<section class="card">${secHead('Put Orii on your home screen', '', G)}<p class="empty" style="margin-top:8px">${how}</p><div class="actions">${deferredInstall ? `<button class="btn gold" data-act="install">Install Orii</button>` : ''}<button class="btn ghost" data-act="hide-install">Hide this</button></div></section>`;
  }

  /* ---------- calendar reminders (.ics) and app icon badge ---------- */
  function icsText(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function icsFold(line) { const out = []; let l = line; while (l.length > 74) { out.push(l.slice(0, 74)); l = ' ' + l.slice(74); } out.push(l); return out.join('\r\n'); }
  function buildICS() {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const d8 = s => s.replace(/-/g, '');
    const ev = [];
    activeHw().filter(h => h.due && diffDays(todayStr(), h.due) >= 0).forEach(h => {
      ev.push(['BEGIN:VEVENT', 'UID:hw-' + h.id + '@orii', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d8(h.due), 'DTEND;VALUE=DATE:' + d8(addDays(h.due, 1)), 'SUMMARY:' + icsText('Due: ' + h.title), 'DESCRIPTION:' + icsText([h.course, 'Homework from Orii'].filter(Boolean).join(' · ')),
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText(h.title + ' is due tomorrow'), 'TRIGGER:-PT6H', 'END:VALARM',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText(h.title + ' is due today'), 'TRIGGER:PT8H', 'END:VALARM', 'END:VEVENT']);
    });
    upcomingExams().forEach(e => {
      ev.push(['BEGIN:VEVENT', 'UID:exam-' + e.id + '@orii', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d8(e.date), 'DTEND;VALUE=DATE:' + d8(addDays(e.date, 1)), 'SUMMARY:' + icsText('Exam: ' + e.title), 'DESCRIPTION:' + icsText([e.course, 'Exam from Orii'].filter(Boolean).join(' · ')),
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText(e.title + ' is in 3 days'), 'TRIGGER:-P2DT15H', 'END:VALARM',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText(e.title + ' is tomorrow'), 'TRIGGER:-PT6H', 'END:VALARM', 'END:VEVENT']);
    });
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Orii//Orii planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Orii'].concat(...ev, ['END:VCALENDAR']);
    return { text: lines.map(icsFold).join('\r\n') + '\r\n', count: ev.length };
  }
  async function shareFile(name, text, type) {
    const blob = new Blob([text], { type });
    try {
      const file = new File([blob], name, { type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return 'shared'; }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return 'downloaded';
  }
  function updateBadge() {
    try {
      const t = todayStr();
      const n = activeHw().filter(h => h.due && diffDays(t, h.due) <= 1).length;
      if (n && navigator.setAppBadge) navigator.setAppBadge(n).catch(() => {});
      else if (!n && navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {});
    } catch (e) { /* badges are optional */ }
  }

  /* ---------- HOME ---------- */
  function homeHTML() {
    const now = new Date(), h = now.getHours();
    const greet = h < 5 || h >= 17 ? 'Good evening' : h < 12 ? 'Good morning' : 'Good afternoon';
    const list = activeHw();
    let x = `<div class="hello"><div><div class="meta">${DOWL[now.getDay()]}, ${MONL[now.getMonth()]} ${now.getDate()}</div><p class="greet">${greet}${S.set.name ? ', ' + esc(S.set.name) : ''}</p>${S.set.name ? '' : '<button class="linkish" data-act="settings">Add your name</button>'}</div><span class="streak" title="Weekdays you lifted or finished homework">${ico('flame', 15)}${weekdayStreak()} of last 5 weekdays</span></div>`;
    x += `<section class="card next">${secHead("What's next", 'Quest log', GEM.green)}`;
    if (!list.length) {
      x += `<p class="empty">No homework waiting. When you add some, the next thing to do shows up here.</p><button class="btn gold" data-act="new-hw">${ico('plus', 18)}Add homework</button>`;
    } else {
      const top = list[0], d = dueInfo(top.due), steps = top.steps || [], done = steps.filter(s => s.done).length;
      x += `<div class="fh" id="top-hw"><div class="fh-top"><div class="fh-title">${esc(top.title)}</div><span class="pill ${d.cls}">${d.label}</span></div>${top.course ? `<div class="meta">${esc(top.course)}</div>` : ''}`;
      if (steps.length) x += `<div class="steps-prog"><div class="bar"><span style="width:${Math.round(done / steps.length * 100)}%"></span></div><span class="meta">${done} of ${steps.length} steps</span></div><ul class="steps">${steps.map((s, i) => stepLi(top, s, i)).join('')}</ul>`;
      if (S.focus && S.focus.hwId === top.id && (S.focus.end || S.focus.left < S.focus.total)) x += `<button class="focus-status" data-act="focus" data-id="${top.id}">${ico('candle', 16)}Focus: <span data-tick="focus">${clock(focusLeft())}</span> left</button>`;
      x += `<div class="actions"><button class="btn ghost" data-act="focus" data-id="${top.id}">${ico('candle', 18)}Focus</button><button class="btn gold" data-act="hw-done" data-id="${top.id}">${ico('check', 18)}Done</button></div></div>`;
      if (list.length > 1) {
        x += `<button class="more" data-act="toggle-more" aria-expanded="${U.more}">${U.more ? 'Hide the rest' : '+' + (list.length - 1) + ' more'}${ico(U.more ? 'chevup' : 'chevdown', 18)}</button>`;
        if (U.more) x += `<div class="minilist">${list.slice(1).map(hwMini).join('')}</div>`;
      }
    }
    x += `</section>`;
    x += `<section class="card compliment"><div class="ch">${gem(G)}Today's compliment${gem(G)}</div><p>${esc(compliment())}</p></section>`;
    x += installCard();
    if (!canSave) x += `<p class="empty small">Orii can't save on this browser. If you're in a private window, open Orii in a regular one.</p>`;
    return x;
  }
  function hwMini(h) {
    const d = dueInfo(h.due);
    return `<div class="mini"><button class="chk" data-act="hw-done" data-id="${h.id}" aria-label="Mark done: ${esc(h.title)}"></button><button class="open" data-act="open-hw" data-id="${h.id}"><span class="trunc" style="font-weight:700">${esc(h.title)}</span>${h.course ? `<span class="meta trunc">${esc(h.course)}</span>` : ''}</button><span class="pill ${d.cls}">${d.label}</span></div>`;
  }

  /* ---------- SCHEDULE ---------- */
  function recapCard() {
    const ws = addDays(mondayOf(todayStr()), -7), we = addDays(ws, 6);
    const inR = d => d && d >= ws && d <= we;
    const lifts = Object.keys(S.workouts).filter(d => inR(d) && (S.workouts[d].ex || []).some(e => (e.sets || []).length)).length;
    const hwDone = S.homework.filter(h => h.done && inR(h.doneAt)).length;
    const days = Object.keys(S.food).filter(d => inR(d) && (S.food[d].meals || []).length);
    const avgPro = days.length ? days.reduce((a, d) => a + S.food[d].meals.reduce((s, m) => s + num(m.pro), 0), 0) / days.length : 0;
    const prs = prEvents().filter(s => inR(s.date));
    if (!lifts && !hwDone && !days.length) return `<section class="card">${secHead('Last week', 'Week in review', G)}<p class="empty" style="margin-top:8px">Your first recap shows up here next Monday.</p></section>`;
    return `<section class="card">${secHead('Last week', monDay(ws) + ' to ' + monDay(we), G)}<div class="grid2" style="margin-top:12px"><div class="stat"><b>${lifts}</b><span>Workouts</span></div><div class="stat"><b>${hwDone}</b><span>Homework done</span></div><div class="stat"><b>${days.length ? fmtN(avgPro) + ' g' : 'None'}</b><span>Average protein</span></div><div class="stat"><b>${prs.length}</b><span>${prs.length ? 'New PRs, best: ' + esc(prs.sort((a, b) => b.e - a.e)[0].name) : 'New PRs'}</span></div></div></section>`;
  }
  function scheduleHTML() {
    const t = todayStr(); let x = '';
    if (parse(t).getDay() === 1) x += recapCard();
    const ws = U.weekStart, we = addDays(ws, 6);
    const days = [0, 1, 2, 3, 4, 5, 6].map(k => addDays(ws, k));
    const show = days.filter((d, k) => k < 5 || itemsOn(d).length || d === U.schedDay);
    const sm = parse(ws).getMonth() === parse(we).getMonth();
    x += `<div class="weekbar"><button class="icon-btn" data-act="wk" data-n="-7" aria-label="Previous week">${ico('chevleft', 22)}</button><span class="wk-label">${monDay(ws)} to ${sm ? parse(we).getDate() : monDay(we)}</span><button class="icon-btn" data-act="wk" data-n="7" aria-label="Next week">${ico('chevright', 22)}</button></div>`;
    x += `<div class="days">${show.map(d => { const p = parse(d), n = itemsOn(d).length; return `<button class="day ${d === U.schedDay ? 'on' : ''} ${d === t ? 'today' : ''}" data-act="day" data-d="${d}" aria-pressed="${d === U.schedDay}" aria-label="${DOWL[p.getDay()]}, ${MON[p.getMonth()]} ${p.getDate()}, ${n} items"><span class="dw">${DOW[p.getDay()]}</span><span class="dn">${p.getDate()}</span><span class="dots">${'<i></i>'.repeat(Math.min(n, 3))}</span></button>`; }).join('')}</div>`;
    const nx = nextUp();
    if (nx && U.schedDay === t) x += `<div class="nextline">${nx}</div>`;
    const items = itemsOn(U.schedDay);
    const title = U.schedDay === t ? 'Today' : U.schedDay === addDays(t, 1) ? 'Tomorrow' : shortDate(U.schedDay);
    x += `<section style="display:flex;flex-direction:column;gap:10px">${secHead(title, '', G)}`;
    x += items.length ? `<div class="list">${items.map(it => `<button class="item" data-act="edit-${it.src}" data-id="${it.id}"><span class="time">${it.start ? fmtTime(it.start) : 'All day'}</span><span class="ic">${ico(KIND_ICON[it.kind] || 'diamond', 18)}</span><span class="it-main"><span class="it-title">${esc(it.title)}</span>${it.sub ? `<span class="meta">${esc(it.sub)}</span>` : ''}</span></button>`).join('')}</div>` : `<p class="empty">Nothing planned. Add a class, a workout, or anything else.</p>`;
    x += `<button class="btn gold wide" data-act="new-plan">${ico('plus', 18)}Add to schedule</button></section>`;
    return x;
  }

  /* ---------- SCHOOL ---------- */
  function schoolHTML() {
    let x = `<div class="seg" role="tablist" aria-label="School"><button role="tab" aria-selected="${U.school === 'hw'}" class="${U.school === 'hw' ? 'on' : ''}" data-act="school-tab" data-v="hw"><span>Homework</span><small>Quest log</small></button><button role="tab" aria-selected="${U.school === 'ex'}" class="${U.school === 'ex' ? 'on' : ''}" data-act="school-tab" data-v="ex"><span>Exams</span><small>Trials ahead</small></button></div>`;
    if (U.school === 'hw') {
      const list = activeHw();
      x += list.length ? `<div class="list">${list.map(hwCard).join('')}</div>` : `<p class="empty">No homework yet. Add your first assignment and Orii will track when it's due.</p>`;
      x += `<button class="btn gold wide" data-act="new-hw">${ico('plus', 18)}Add homework</button>`;
      if (list.length || upcomingExams().length) x += calButton();
      const done = doneHw();
      if (done.length) {
        x += `<button class="more" data-act="toggle-done" aria-expanded="${U.showDone}">${U.showDone ? 'Hide finished' : 'Finished (' + done.length + ')'}${ico(U.showDone ? 'chevup' : 'chevdown', 18)}</button>`;
        if (U.showDone) x += `<div class="list">${done.slice(0, 40).map(h => `<div class="hw"><div class="hw-row"><button class="chk on" data-act="hw-undone" data-id="${h.id}" aria-label="Mark not done: ${esc(h.title)}">${ico('check', 16)}</button><div class="it-main"><span class="it-title struck">${esc(h.title)}</span><span class="meta">${h.course ? esc(h.course) + ' · ' : ''}Finished ${h.doneAt ? monDay(h.doneAt) : ''}</span></div><button class="icon-btn" data-act="del-hw" data-id="${h.id}" aria-label="Delete ${esc(h.title)}">${ico('x', 18)}</button></div></div>`).join('')}</div>`;
      }
    } else {
      const ex = upcomingExams();
      x += ex.length ? `<div class="exams">${ex.map(e => { const i = examInfo(e.date); return `<button class="exam ex-${i.cls}" data-act="edit-exam" data-id="${e.id}"><span class="ex-name">${esc(e.title)}</span><span class="ex-sub">${e.course ? esc(e.course) + ' · ' : ''}${shortDate(e.date)}</span><span class="ex-days">${i.label}</span></button>`; }).join('')}</div>` : `<p class="empty">No exams yet. Add one to start a countdown.</p>`;
      x += `<button class="btn gold wide" data-act="new-exam">${ico('plus', 18)}Add exam</button>`;
      if (ex.length || activeHw().length) x += calButton();
    }
    return x;
  }
  const calButton = () => `<div class="card"><h3 class="sub-h" style="margin-bottom:6px">${ico('bell', 20)}Phone reminders</h3><p class="empty small">Send your homework due dates and exams to your phone's calendar. It reminds you the evening before, and 3 days before each exam. Send again after adding new ones.</p><button class="btn ghost wide" style="margin-top:10px" data-act="ics">Send to my calendar</button></div>`;
  function hwCard(h) {
    const d = dueInfo(h.due), steps = h.steps || [], done = steps.filter(s => s.done).length, open = U.openHw === h.id;
    let x = `<div class="hw" id="hw-${h.id}"><div class="hw-row"><button class="chk" data-act="hw-done" data-id="${h.id}" aria-label="Mark done: ${esc(h.title)}"></button><button class="hw-open" data-act="toggle-hw" data-id="${h.id}" aria-expanded="${open}"><span class="it-title">${esc(h.title)}</span><span class="meta">${[h.course, steps.length ? done + ' of ' + steps.length + ' steps' : ''].filter(Boolean).map(esc).join(' · ') || 'Tap to add steps'}</span></button><span class="pill ${d.cls}">${d.label}</span></div>`;
    if (open) {
      x += `<div class="hw-panel">${steps.length ? `<ul class="steps">${steps.map((s, i) => stepLi(h, s, i).replace('</li>', `<button class="icon-btn" data-act="del-step" data-id="${h.id}" data-i="${i}" aria-label="Remove step: ${esc(s.t)}">${ico('x', 16)}</button></li>`)).join('')}</ul>` : ''}`;
      x += `<div><label class="lbl" for="step-in-${h.id}">Add a step</label><div class="inrow"><input class="field" id="step-in-${h.id}" data-keep data-enter="add-step" data-id="${h.id}" placeholder="Read pages 1 to 10" autocomplete="off"><button class="btn gold" data-act="add-step" data-id="${h.id}">Add</button></div><div class="err" id="step-err-${h.id}"></div></div>`;
      x += `<div class="actions" style="margin-top:0"><button class="btn ghost" data-act="focus" data-id="${h.id}">${ico('candle', 18)}Focus</button><button class="btn ghost" data-act="edit-hw" data-id="${h.id}">${ico('pencil', 18)}Edit</button></div></div>`;
    }
    return x + `</div>`;
  }

  /* ---------- FOOD ---------- */
  function ring(v, goal, label, val) {
    const frac = goal > 0 ? Math.min(v / goal, 1) : 0, off = (113.1 * (1 - frac)).toFixed(1);
    return `<div class="ring"><svg width="54" height="54" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="none" stroke="${M}" stroke-width="5"/>${goal > 0 && v > 0 ? `<circle cx="22" cy="22" r="18" fill="none" stroke="${frac >= 1 ? G : F}" stroke-width="5" stroke-linecap="round" stroke-dasharray="113.1" stroke-dashoffset="${off}" transform="rotate(-90 22 22)"/>` : ''}</svg><div style="min-width:0"><span>${label}</span><b>${val}</b></div></div>`;
  }
  function foodHTML() {
    const t = todayStr(), day = dayFood(t), g = S.set;
    const cal = day.meals.reduce((a, m) => a + num(m.cal), 0), pro = day.meals.reduce((a, m) => a + num(m.pro), 0);
    let x = secHead('Food', 'Provisions', GEM.blue);
    x += `<div class="card"><div class="grid2">${ring(cal, g.calGoal, 'Calories', fmtN(cal) + (g.calGoal ? ' / ' + fmtN(g.calGoal) : ''))}${ring(pro, g.proGoal, 'Protein', fmtN(pro) + ' g' + (g.proGoal ? ' / ' + fmtN(g.proGoal) + ' g' : ''))}</div>${!g.calGoal && !g.proGoal ? `<button class="linkish" style="margin-top:8px" data-act="settings">Set daily goals</button>` : ''}</div>`;
    x += `<section class="card"><label class="lbl" for="food-in">What did you eat?</label><div class="inrow"><input id="food-in" data-keep data-enter="${SAMPLE && !U.manual ? 'estimate' : ''}" class="field" placeholder="2 eggs and toast" autocomplete="off">${SAMPLE && !U.manual ? `<button class="btn gold" data-act="estimate" ${U.estBusy ? 'disabled' : ''}>${U.estBusy ? 'Estimating…' : 'Estimate'}</button>` : ''}</div><div class="err" id="food-err">${esc(U.estErr)}</div>`;
    if (U.est) {
      x += `<div class="est"><div class="meta">Estimate. Change anything that looks off.</div><div><label class="lbl" for="est-name">Name</label><input class="field" id="est-name" data-keep value="${esc(U.est.name)}"></div><div class="nums"><div><label class="lbl" for="est-cal">Calories</label><input class="field" id="est-cal" data-keep inputmode="numeric" value="${U.est.cal}"></div><div><label class="lbl" for="est-pro">Protein (g)</label><input class="field" id="est-pro" data-keep inputmode="numeric" value="${U.est.pro}"></div></div><label class="check-lbl"><input type="checkbox" id="est-save">Save as a one-tap meal</label><div class="err" id="est-err"></div><div class="actions" style="margin-top:0"><button class="btn ghost" data-act="cancel-est">Cancel</button><button class="btn gold" data-act="log-est">${ico('check', 18)}Log it</button></div></div>`;
    } else if (!SAMPLE || U.manual) {
      x += `<div class="nums" style="margin-top:10px"><div><label class="lbl" for="man-cal">Calories</label><input class="field" id="man-cal" data-keep inputmode="numeric" placeholder="330"></div><div><label class="lbl" for="man-pro">Protein (g)</label><input class="field" id="man-pro" data-keep inputmode="numeric" placeholder="18"></div></div><label class="check-lbl" style="margin-top:10px"><input type="checkbox" id="man-save">Save as a one-tap meal</label><div class="err" id="man-err"></div><button class="btn gold wide" style="margin-top:10px" data-act="log-manual">${ico('check', 18)}Log it</button>${SAMPLE ? `<button class="linkish" style="margin-top:6px" data-act="manual" data-v="0">Estimate it for me instead</button>` : ''}`;
    } else {
      x += `<button class="linkish" style="margin-top:6px" data-act="manual" data-v="1">Enter the numbers yourself</button>`;
    }
    x += `</section>`;
    x += `<section><h3 class="sub-h">Saved meals</h3>${S.saved.length ? `<div class="chips">${S.saved.slice().sort((a, b) => a.name.localeCompare(b.name)).map(s => U.editSaved ? `<button class="chip-btn del" data-act="del-saved" data-id="${s.id}" aria-label="Delete saved meal ${esc(s.name)}">${ico('x', 16)}${esc(s.name)}</button>` : `<button class="chip-btn" data-act="log-saved" data-id="${s.id}">${ico('plus', 16)}${esc(s.name)} <small>${fmtN(num(s.cal))} cal</small></button>`).join('')}</div><button class="linkish" style="margin-top:8px" data-act="edit-saved">${U.editSaved ? 'Done editing' : 'Edit saved meals'}</button>` : `<p class="empty small">After you log a meal, check "Save as a one-tap meal" and it shows up here.</p>`}</section>`;
    const goal = Math.min(Math.max(g.waterGoal || 8, 1), 12);
    x += `<section class="card"><div class="waterhead"><h3 class="sub-h" style="margin:0">Water</h3><span class="meta">${day.water} of ${goal} glasses</span></div><div class="vials">${Array.from({ length: goal }, (_, i) => `<button class="vial" data-act="water" data-i="${i}" aria-label="${i + 1} glasses" aria-pressed="${i < day.water}">${vial(i < day.water, 30)}</button>`).join('')}</div></section>`;
    x += `<section><h3 class="sub-h">Today</h3>${day.meals.length ? `<div class="list">${day.meals.map(m => `<div class="meal"><div class="nm"><div style="font-weight:700;overflow-wrap:anywhere">${esc(m.name)}</div><div class="meta">${fmtN(num(m.cal))} cal · ${fmtN(num(m.pro))} g protein</div></div><button class="icon-btn" data-act="del-meal" data-id="${m.id}" aria-label="Remove ${esc(m.name)}">${ico('x', 18)}</button></div>`).join('')}</div>` : `<p class="empty small">Nothing logged yet today.</p>`}</section>`;
    return x;
  }

  /* ---------- LIFTS ---------- */
  function liftsHTML() {
    const t = todayStr(), w = dayW(t), running = !!S.rest.end;
    let x = `<div class="restbar">${ico('hourglass', 30, 'hg' + (running ? ' run' : ''))}<div class="rt"><small>Rest timer</small><b data-tick="rest">${clock(restLeft())}</b></div><button class="btn ghost sm" data-act="rest-add" aria-label="Add 15 seconds">+15s</button><button class="btn gold sm" data-act="rest-toggle">${running ? 'Reset' : 'Start'}</button></div>`;
    x += secHead('Lifts', 'Training', GEM.red);
    x += `<div class="splits" role="group" aria-label="Today's split">${SPLITS.map(s => `<button class="split ${s === w.split ? 'on' : ''}" data-act="split" data-v="${s}" aria-pressed="${s === w.split}">${s}</button>`).join('')}</div>`;
    x += w.ex.length ? w.ex.map((e, i) => exCard(e, i, t)).join('') : `<p class="empty">No exercises logged today. Add your first one below.</p>`;
    x += `<div class="card"><label class="lbl" for="ex-in">Add an exercise</label><div class="inrow"><input id="ex-in" data-keep data-enter="add-ex" class="field" list="ex-list" placeholder="Bench press" autocomplete="off"><button class="btn gold" data-act="add-ex">Add</button></div><div class="err" id="ex-err"></div><datalist id="ex-list">${exNames().map(n => `<option value="${esc(n)}"></option>`).join('')}</datalist></div>`;
    const prs = prTable();
    x += `<section class="card"><button class="acc" data-act="toggle-pr" aria-expanded="${U.prOpen}">${ico('trophy', 20)}<span>PR list</span>${ico(U.prOpen ? 'chevup' : 'chevdown', 18)}</button>${U.prOpen ? (prs.length ? prs.map(p => `<div class="prrow"><span style="min-width:0;overflow-wrap:anywhere">${esc(p.name)}</span><span><b>${fmtW(p.w)} × ${p.r}</b> <span class="meta">${monDay(p.date)}</span></span></div>`).join('') : `<p class="empty small" style="margin-top:8px">Your best set for each exercise shows up here once you log some.</p>`) : ''}</section>`;
    x += bodyWeightCard();
    return x;
  }
  function exCard(e, i, t) {
    const last = lastTime(e.name, t);
    let run = bestBefore(e.name, t);
    const flags = (e.sets || []).map(s => { const v = e1rm(num(s.w), num(s.r)); const pr = run > 0 && v > run + 1e-9; if (v > run) run = v; return pr; });
    const prev = (e.sets || []).length ? e.sets[e.sets.length - 1] : (last ? last.sets[0] : null);
    return `<div class="card" id="ex-${i}"><div class="ex-top"><span class="ex-name">${esc(e.name)}</span><button class="icon-btn" data-act="del-ex" data-i="${i}" aria-label="Remove ${esc(e.name)}">${ico('x', 18)}</button></div><div class="meta">${last ? 'Last time, ' + monDay(last.date) + ': ' + last.sets.map(s => fmtW(num(s.w)) + ' × ' + num(s.r)).join(' · ') : 'First time logging this one'}</div>${(e.sets || []).length ? `<div class="sets">${e.sets.map((s, k) => `<button class="set ${flags[k] ? 'pr' : ''}" id="set-${i}-${k}" data-act="del-set" data-i="${i}" data-k="${k}" aria-label="Remove set ${fmtW(num(s.w))} by ${num(s.r)}${flags[k] ? ', a PR' : ''}">${fmtW(num(s.w))} × ${num(s.r)}${flags[k] ? ico('trophy', 14) : ''}</button>`).join('')}</div>` : ''}<div class="setrow"><input class="field sm" id="w-${i}" data-keep data-enter="log-set" data-i="${i}" inputmode="decimal" placeholder="lb" aria-label="Weight in pounds for ${esc(e.name)}" value="${prev ? fmtW(num(prev.w)) : ''}"><span class="x">×</span><input class="field sm" id="r-${i}" data-keep data-enter="log-set" data-i="${i}" inputmode="numeric" placeholder="reps" aria-label="Reps for ${esc(e.name)}" value="${prev ? num(prev.r) : ''}"><button class="btn gold" data-act="log-set" data-i="${i}">Log set</button></div><div class="err" id="set-err-${i}"></div></div>`;
  }
  function bodyWeightCard() {
    const ents = Object.keys(S.weights).sort().map(d => ({ d, lb: num(S.weights[d].lb) })).filter(e => e.lb > 0).slice(-30);
    let x = `<section class="card" id="bw-card"><h3 class="sub-h" style="margin:0">${ico('scale', 20)}Body weight</h3><div class="inrow" style="margin-top:10px"><input class="field" id="bw-in" data-keep data-enter="log-bw" inputmode="decimal" placeholder="Today's weight in lb" aria-label="Today's body weight in pounds"><button class="btn gold" data-act="log-bw">Log</button></div><div class="err" id="bw-err"></div>`;
    if (!ents.length) return x + `<p class="empty small" style="margin-top:10px">Log your weight to start a trend line.</p></section>`;
    const last = ents[ents.length - 1], first = ents[0];
    if (ents.length < 2) return x + `<div class="bw-head"><b>${fmtW(last.lb)} lb</b><span class="meta">${shortDate(last.d)}</span></div><p class="empty small">Log a few more days to see your trend.</p></section>`;
    const ch = last.lb - first.lb;
    x += `<div class="bw-head"><b>${fmtW(last.lb)} lb</b><span class="meta">${ch > 0 ? '+' : ''}${fmtW(ch)} lb since ${monDay(first.d)}</span></div>`;
    const W = 320, H = 130, pl = 36, pr = 14, pt = 12, pb = 24;
    const vals = ents.map(e => e.lb), lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
    const X = i => pl + (W - pl - pr) * i / (ents.length - 1), Y = v => pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo));
    const line = ents.map((e, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(e.lb).toFixed(1)).join(' ');
    const area = line + ` L${X(ents.length - 1).toFixed(1)} ${H - pb} L${pl} ${H - pb} Z`;
    x += `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Body weight from ${fmtW(first.lb)} to ${fmtW(last.lb)} pounds"><line x1="${pl}" y1="${Y(hi)}" x2="${W - pr}" y2="${Y(hi)}" stroke="${G}" stroke-opacity=".5" stroke-dasharray="3 4"/><line x1="${pl}" y1="${Y(lo)}" x2="${W - pr}" y2="${Y(lo)}" stroke="${G}" stroke-opacity=".5" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${Y(hi) + 4}" text-anchor="end" font-size="11" fill="${F}">${hi}</text><text x="${pl - 6}" y="${Y(lo) + 4}" text-anchor="end" font-size="11" fill="${F}">${lo}</text><path d="${area}" fill="${M}" fill-opacity=".8"/><path d="${line}" fill="none" stroke="${F}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>${ents.map((e, i) => i === ents.length - 1 ? '' : `<circle cx="${X(i).toFixed(1)}" cy="${Y(e.lb).toFixed(1)}" r="2.2" fill="${F}"/>`).join('')}<circle cx="${X(ents.length - 1).toFixed(1)}" cy="${Y(last.lb).toFixed(1)}" r="5" fill="${G}" stroke="${F}" stroke-width="1.5"/><text x="${pl}" y="${H - 6}" font-size="11" fill="${F}">${monDay(first.d)}</text><text x="${W - pr}" y="${H - 6}" font-size="11" fill="${F}" text-anchor="end">${monDay(last.d)}</text></svg>`;
    return x + `</section>`;
  }

  /* ---------- pages, nav, rendering ---------- */
  const PAGES = [
    { n: 'Home', ic: 'home', html: homeHTML },
    { n: 'Schedule', ic: 'scroll', html: scheduleHTML },
    { n: 'School', ic: 'book', html: schoolHTML },
    { n: 'Food', ic: 'goblet', html: foodHTML },
    { n: 'Lifts', ic: 'sword', html: liftsHTML }
  ];
  const pageEls = PAGES.map((_, i) => $('#p-' + i));
  const nav = $('#nav');
  nav.innerHTML = PAGES.map((p, i) => `<button class="md" data-act="nav" data-i="${i}" aria-label="${p.n}"><span class="pulse"></span>${coin(p.ic)}<span>${p.n}</span></button>`).join('');
  const navBtns = $$('.md', nav);

  function paint(el, html) {
    const keep = {};
    $$('[data-keep]', el).forEach(i => { if (i.id) keep[i.id] = i.value; });
    const act = document.activeElement, actId = act && el.contains(act) ? act.id : null;
    let sel = null;
    if (actId && typeof act.selectionStart === 'number') { try { sel = [act.selectionStart, act.selectionEnd]; } catch (e) { /* not selectable */ } }
    el.innerHTML = html;
    Object.keys(keep).forEach(id => { const i = document.getElementById(id); if (i && keep[id] != null) i.value = keep[id]; });
    if (actId) { const i = document.getElementById(actId); if (i) { i.focus({ preventScroll: true }); if (sel && i.setSelectionRange) { try { i.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } } } }
  }
  function renderPage(i) {
    paint(pageEls[i], PAGES[i].html());
    if (U.glow) { const g = $(U.glow); U.glow = null; if (g) { g.classList.remove('glow'); void g.offsetWidth; g.classList.add('glow'); setTimeout(() => g.classList.remove('glow'), 1700); } }
  }
  function renderNav() {
    const t = todayStr();
    const urgent = activeHw().some(h => h.due && diffDays(t, h.due) <= 1) || upcomingExams().some(e => diffDays(t, e.date) <= 3);
    navBtns.forEach((b, i) => {
      const on = i === S.page;
      b.setAttribute('aria-current', on ? 'page' : 'false');
      $('.mf', b).setAttribute('fill', on ? G : M);
      $('.mr', b).setAttribute('stroke', on ? F : G);
      const inner = $('svg svg', b); if (inner) inner.setAttribute('stroke', F);
      let badge = $('.badge', b);
      if (i === 2 && urgent && !badge) { badge = document.createElement('span'); badge.className = 'badge'; b.appendChild(badge); b.setAttribute('aria-label', 'School, something due soon'); }
      if (i === 2 && !urgent && badge) { badge.remove(); b.setAttribute('aria-label', 'School'); }
    });
  }
  function renderHeader() {
    const h = new Date().getHours(), night = h >= 17 || h < 5;
    $('#sky').innerHTML = ico(night ? 'moon' : 'sun', 22);
    $('#horizon').hidden = !(night && S.set.evening);
  }
  let rq = false;
  function scheduleRender() {
    if (rq) return; rq = true;
    requestAnimationFrame(() => { rq = false; renderPage(S.page); renderNav(); updateBadge(); });
  }
  function go(i, after) {
    closeQA();
    if (i === S.page) { renderPage(i); if (after) after(); return; }
    const dir = i > S.page ? 1 : -1, from = pageEls[S.page], to = pageEls[i];
    S.page = i; renderPage(i);
    if (motionOn()) {
      to.style.transition = 'none'; to.style.transform = `translateX(${dir * 36}px)`; to.style.opacity = '0'; to.hidden = false;
      void to.offsetWidth;
      to.style.transition = ''; to.style.transform = ''; to.style.opacity = '';
      from.style.transform = `translateX(${-dir * 36}px)`; from.style.opacity = '0';
      setTimeout(() => { if (pageEls[S.page] !== from) from.hidden = true; from.style.transform = ''; from.style.opacity = ''; }, 340);
      const b = navBtns[i]; b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip');
      setTimeout(() => b.classList.remove('flip'), 700);
    } else { from.hidden = true; to.hidden = false; }
    renderNav();
    if (after) setTimeout(after, motionOn() ? 360 : 0);
  }

  /* ---------- quick add ---------- */
  const QA_ITEMS = [
    ['hw', 'book', 'Homework'], ['exam', 'shield', 'Exam'], ['plan', 'scroll', 'Schedule item'],
    ['meal', 'goblet', 'Meal'], ['set', 'sword', 'Workout set'], ['bw', 'scale', 'Body weight']
  ];
  function openQA() {
    const m = $('#qmenu');
    m.innerHTML = QA_ITEMS.map(([v, ic, l]) => `<button class="btn gold" data-act="qa-do" data-v="${v}">${ico(ic, 18)}${l}</button>`).join('');
    m.hidden = false; $('#qa').setAttribute('aria-expanded', 'true');
    const f = $('button', m); if (f) f.focus();
  }
  function closeQA() { $('#qmenu').hidden = true; $('#qa').setAttribute('aria-expanded', 'false'); }
  function focusEl(sel) { const el = $(sel); if (el) { el.scrollIntoView({ block: 'center', behavior: motionOn() ? 'smooth' : 'auto' }); el.focus({ preventScroll: true }); } }

  /* ---------- sheets (forms) ---------- */
  let lastFocus = null;
  function openSheet(html, onMount) {
    closeSheet(); closeQA();
    lastFocus = document.activeElement;
    const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.id = 'scrim';
    scrim.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    scrim.addEventListener('click', e => { if (e.target === scrim) closeSheet(); });
    document.body.appendChild(scrim);
    const first = $('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), textarea, button', scrim);
    if (first) first.focus();
    if (onMount) onMount($('.sheet', scrim));
  }
  function closeSheet() { const s = $('#scrim'); if (s) { s.remove(); if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus(); } }
  const sheetHead = (title, ic) => `<div class="sheet-head"><h2>${ic ? ico(ic, 24) : ''}${title}</h2><button type="button" class="icon-btn" data-act="close-sheet" aria-label="Close">${ico('x', 22)}</button></div>`;
  const radio = (name, v, label, on) => `<label><input type="radio" name="${name}" value="${v}" ${on ? 'checked' : ''}><span>${label}</span></label>`;
  function setErr(form, name, msg) { const e = $(`[data-err="${name}"]`, form); if (e) e.textContent = msg || ''; }

  function openPlanForm(id) {
    const p = id ? S.plans.find(x => x.id === id) : null;
    const v = p || { title: '', kind: 'class', days: [], date: '', start: '', end: '', place: '' };
    const weekly = !v.date;
    openSheet(`<form id="f" novalidate>${sheetHead(p ? 'Edit schedule item' : 'Add to schedule', 'scroll')}
      <div><label class="lbl" for="pf-title">What is it?</label><input class="field" id="pf-title" name="title" value="${esc(v.title)}" placeholder="Anatomy 1" autocomplete="off"><div class="err" data-err="title"></div></div>
      <div><span class="lbl">Type</span><div class="radios">${radio('kind', 'class', 'Class', v.kind === 'class')}${radio('kind', 'lift', 'Workout', v.kind === 'lift')}${radio('kind', 'other', 'Other', v.kind === 'other')}</div></div>
      <div><span class="lbl">How often?</span><div class="radios">${radio('repeat', 'weekly', 'Every week', weekly)}${radio('repeat', 'once', 'One time', !weekly)}</div></div>
      <div data-show="weekly" ${weekly ? '' : 'hidden'}><span class="lbl">Which days?</span><div class="radios">${[1, 2, 3, 4, 5, 6, 0].map(d => `<label><input type="checkbox" name="days" value="${d}" ${(v.days || []).map(Number).includes(d) ? 'checked' : ''}><span>${DOW[d]}</span></label>`).join('')}</div><div class="err" data-err="days"></div></div>
      <div data-show="once" ${weekly ? 'hidden' : ''}><label class="lbl" for="pf-date">Date</label><input class="field" type="date" id="pf-date" name="date" value="${esc(v.date || U.schedDay || todayStr())}"><div class="err" data-err="date"></div></div>
      <div class="row2"><div><label class="lbl" for="pf-start">Starts</label><input class="field" type="time" id="pf-start" name="start" value="${esc(v.start || '')}"></div><div><label class="lbl" for="pf-end">Ends</label><input class="field" type="time" id="pf-end" name="end" value="${esc(v.end || '')}"></div></div>
      <div><label class="lbl" for="pf-place">Where (optional)</label><input class="field" id="pf-place" name="place" value="${esc(v.place || '')}" placeholder="Room 204" autocomplete="off"></div>
      <div class="sheet-actions">${p ? `<button type="button" class="btn danger" data-act="del-plan" data-id="${p.id}">Delete</button>` : ''}<button type="submit" class="btn gold">${p ? 'Save' : 'Add'}</button></div></form>`, sh => {
      const form = $('#f', sh);
      form.addEventListener('change', () => { const r = form.repeat.value; $('[data-show="weekly"]', form).hidden = r !== 'weekly'; $('[data-show="once"]', form).hidden = r !== 'once'; });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form), title = String(fd.get('title') || '').trim(), rep = fd.get('repeat');
        const days = fd.getAll('days').map(Number), date = String(fd.get('date') || '');
        let bad = false;
        setErr(form, 'title', title ? '' : 'Give it a name'); if (!title) bad = true;
        if (rep === 'weekly') { setErr(form, 'days', days.length ? '' : 'Pick at least one day'); if (!days.length) bad = true; }
        else { setErr(form, 'date', date ? '' : 'Pick a date'); if (!date) bad = true; }
        if (bad) return;
        const data = { title, kind: fd.get('kind') || 'other', days: rep === 'weekly' ? days : [], date: rep === 'once' ? date : '', start: String(fd.get('start') || ''), end: String(fd.get('end') || ''), place: String(fd.get('place') || '').trim() };
        put('plans', p ? p.id : rid(), data); closeSheet(); toast(p ? 'Saved ' + title : 'Added ' + title + ' to your schedule');
      });
    });
  }
  function openHwForm(id) {
    const h = id ? S.homework.find(x => x.id === id) : null;
    const v = h || { title: '', course: '', due: '', steps: [] };
    openSheet(`<form id="f" novalidate>${sheetHead(h ? 'Edit homework' : 'Add homework', 'book')}
      <div><label class="lbl" for="hf-title">What's the assignment?</label><input class="field" id="hf-title" name="title" value="${esc(v.title)}" placeholder="Ch. 15 worksheet" autocomplete="off"><div class="err" data-err="title"></div></div>
      <div><label class="lbl" for="hf-course">Class (optional)</label><input class="field" id="hf-course" name="course" list="class-list" value="${esc(v.course || '')}" placeholder="Anatomy 1" autocomplete="off"><datalist id="class-list">${classNames().map(n => `<option value="${esc(n)}"></option>`).join('')}</datalist></div>
      <div><label class="lbl" for="hf-due">Due date</label><input class="field" type="date" id="hf-due" name="due" value="${esc(v.due || '')}"><div class="err" data-err="due"></div></div>
      <div><label class="lbl" for="hf-steps">Break it into steps (optional, one per line)</label><textarea class="field" id="hf-steps" name="steps" placeholder="Read the chapter&#10;Answer questions 1 to 10&#10;Check answers">${esc((v.steps || []).map(s => s.t).join('\n'))}</textarea></div>
      <div class="sheet-actions">${h ? `<button type="button" class="btn danger" data-act="del-hw" data-id="${h.id}">Delete</button>` : ''}<button type="submit" class="btn gold">${h ? 'Save' : 'Add'}</button></div></form>`, sh => {
      const form = $('#f', sh);
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form), title = String(fd.get('title') || '').trim(), due = String(fd.get('due') || '');
        let bad = false;
        setErr(form, 'title', title ? '' : 'Give it a name'); if (!title) bad = true;
        setErr(form, 'due', due ? '' : 'Pick when it is due'); if (!due) bad = true;
        if (bad) return;
        const old = (h && h.steps) || [];
        const steps = String(fd.get('steps') || '').split('\n').map(s => s.trim()).filter(Boolean).map(t => { const o = old.find(s => s.t === t); return o ? clone(o) : { t, done: false, doneAt: null }; });
        const data = h ? Object.assign(clone(h), { title, course: String(fd.get('course') || '').trim(), due, steps }) : { title, course: String(fd.get('course') || '').trim(), due, steps, done: false, doneAt: null, created: Date.now() };
        put('homework', h ? h.id : rid(), data); closeSheet(); toast(h ? 'Saved ' + title : 'Added ' + title);
      });
    });
  }
  function openExamForm(id) {
    const x = id ? S.exams.find(e => e.id === id) : null;
    const v = x || { title: '', course: '', date: '' };
    openSheet(`<form id="f" novalidate>${sheetHead(x ? 'Edit exam' : 'Add exam', 'shield')}
      <div><label class="lbl" for="ef-title">Which exam?</label><input class="field" id="ef-title" name="title" value="${esc(v.title)}" placeholder="Anatomy lab practical" autocomplete="off"><div class="err" data-err="title"></div></div>
      <div><label class="lbl" for="ef-course">Class (optional)</label><input class="field" id="ef-course" name="course" list="class-list2" value="${esc(v.course || '')}" placeholder="Anatomy 1" autocomplete="off"><datalist id="class-list2">${classNames().map(n => `<option value="${esc(n)}"></option>`).join('')}</datalist></div>
      <div><label class="lbl" for="ef-date">Date</label><input class="field" type="date" id="ef-date" name="date" value="${esc(v.date || '')}"><div class="err" data-err="date"></div></div>
      <div class="sheet-actions">${x ? `<button type="button" class="btn danger" data-act="del-exam" data-id="${x.id}">Delete</button>` : ''}<button type="submit" class="btn gold">${x ? 'Save' : 'Add'}</button></div></form>`, sh => {
      const form = $('#f', sh);
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form), title = String(fd.get('title') || '').trim(), date = String(fd.get('date') || '');
        let bad = false;
        setErr(form, 'title', title ? '' : 'Give it a name'); if (!title) bad = true;
        setErr(form, 'date', date ? '' : 'Pick the exam date'); if (!date) bad = true;
        if (bad) return;
        put('exams', x ? x.id : rid(), { title, course: String(fd.get('course') || '').trim(), date }); closeSheet(); toast(x ? 'Saved ' + title : 'Added ' + title);
      });
    });
  }
  function openSettings() {
    const s = S.set;
    const numRow = (k, label, help, unit) => `<div class="set-row"><label for="set-${k}">${label}${help ? `<small>${help}</small>` : ''}</label><input class="field" id="set-${k}" data-set="${k}" inputmode="numeric" value="${s[k] || ''}" placeholder="${unit}"></div>`;
    const tgRow = (k, label, help) => `<div class="set-row"><label for="set-${k}">${label}${help ? `<small>${help}</small>` : ''}</label><input type="checkbox" class="tg" id="set-${k}" data-set="${k}" ${s[k] ? 'checked' : ''}></div>`;
    openSheet(`${sheetHead('Settings')}
      <div class="set-row" style="border-top:0;padding-top:0"><label for="set-name">Your name<small>Shown in the greeting</small></label><input class="field" id="set-name" data-set="name" data-text value="${esc(s.name || '')}" placeholder="Name" autocomplete="given-name" style="width:150px"></div>
      <div><h3 class="sub-h" style="margin-bottom:10px">Colors</h3><div id="theme-block">${themeBlock()}</div></div>
      <div><h3 class="sub-h" style="margin-bottom:0">Daily goals</h3>${numRow('calGoal', 'Calories', '', 'kcal')}${numRow('proGoal', 'Protein', 'Grams per day', 'g')}${numRow('waterGoal', 'Water', 'Glasses per day, up to 12', '8')}</div>
      <div><h3 class="sub-h" style="margin-bottom:0">Timers</h3>${numRow('restSecs', 'Rest timer', 'Seconds between sets', '90')}${numRow('focusMins', 'Focus timer', 'Minutes per focus session', '25')}</div>
      <div><h3 class="sub-h" style="margin-bottom:0">Comfort</h3>${tgRow('sound', 'Sound', 'A soft chime for wins and timers')}${tgRow('motion', 'Animations', 'Page slides, coin flips, and glows')}${tgRow('evening', 'Evening header', 'Gold horizon after 5 PM')}</div>
      <div><h3 class="sub-h" style="margin-bottom:6px">Backups</h3><p class="meta" style="margin:0 0 10px">Your entries are saved on this phone. Export a backup now and then, and use Import to move entries from the Claude version of Orii or to another device.</p>
      <div class="actions" style="margin-top:0"><button type="button" class="btn ghost" data-act="export">${ico('download', 18)}Export</button><button type="button" class="btn ghost" data-act="import">${ico('upload', 18)}Import</button></div>
      <input type="file" id="import-file" accept=".json,application/json" hidden><div class="err" id="import-err"></div></div>
      <button type="button" class="btn gold wide" data-act="close-sheet">Done</button>`, sh => {
      $('#import-file', sh).addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) importBackup(f); e.target.value = ''; });
      sh.addEventListener('input', e => {
        if (!e.target.closest('[data-custom]')) return;
        const v = {}; $$('[data-custom]', sh).forEach(i => { v[i.dataset.custom] = i.value; });
        const arr = [v.light, v.mid, v.dark], p = customProblem(arr), er = $('#custom-err', sh);
        if (er) er.textContent = p;
        const sw = $('.theme[data-v="custom"] .sw', sh); if (sw) $$('i', sw).forEach((el, k) => { el.style.background = arr[k]; });
        if (!p) { S.set.custom = v; applyTheme(); renderNav(); }
      });
      sh.addEventListener('change', e => {
        if (e.target.closest('[data-custom]')) { if (!customProblem([S.set.custom && S.set.custom.light, S.set.custom && S.set.custom.mid, S.set.custom && S.set.custom.dark])) saveSettings(); return; }
        const el = e.target.closest('[data-set]'); if (!el) return;
        const k = el.dataset.set;
        if ('text' in el.dataset) S.set[k] = el.value.trim().slice(0, 40);
        else if (el.type === 'checkbox') S.set[k] = el.checked;
        else { let n = Math.max(0, Math.round(num(el.value))); if (k === 'waterGoal') n = Math.min(Math.max(n || 8, 1), 12); if (k === 'restSecs') n = n || 90; if (k === 'focusMins') n = Math.min(n || 25, 180); S.set[k] = n; el.value = n || ''; }
        saveSettings();
        if (k === 'sound' && S.set.sound) chime();
      });
    });
  }

  /* ---------- focus timer (candle) ---------- */
  function candleSVG() {
    return `<svg width="120" height="190" viewBox="0 0 120 190" aria-hidden="true"><ellipse cx="60" cy="178" rx="46" ry="8" fill="${G}" stroke="${F}" stroke-width="1.5"/><rect x="34" y="166" width="52" height="10" rx="3" fill="${G}" stroke="${F}" stroke-width="1.5"/><rect id="cw" x="42" y="60" width="36" height="106" rx="4" fill="${M}" stroke="${F}" stroke-width="2"/><g id="cf"><line x1="60" y1="60" x2="60" y2="50" stroke="${F}" stroke-width="2"/><g class="flame"><path d="M60 18c8 12 12 18 12 26a12 12 0 0 1-24 0c0-8 4-14 12-26z" fill="${G}" stroke="${F}" stroke-width="1.5"/><path d="M60 34c4 6 6 9 6 13a6 6 0 0 1-12 0c0-4 2-7 6-13z" fill="#D9894A"/></g></g></svg>`;
  }
  function paintCandle() {
    const f = S.focus, cw = $('#cw'), cf = $('#cf'); if (!f || !cw) return;
    const frac = f.total ? focusLeft() / f.total : 0, h = 16 + 90 * frac, y = 166 - h;
    cw.setAttribute('y', y.toFixed(1)); cw.setAttribute('height', h.toFixed(1));
    cf.setAttribute('transform', `translate(0 ${(y - 60).toFixed(1)})`);
    cf.style.display = frac > 0 ? '' : 'none';
  }
  function openFocus(id) {
    const h = S.homework.find(x => x.id === id); if (!h) return;
    if (!S.focus || S.focus.hwId !== id) S.focus = { hwId: id, total: S.set.focusMins * 60, left: S.set.focusMins * 60, end: null, done: false };
    renderFocus(h);
  }
  function renderFocus(h) {
    const f = S.focus, running = !!f.end, fresh = !running && f.left >= f.total;
    const html = `${sheetHead('Focus', 'candle')}<p style="margin:0;font-weight:700;font-size:17px;overflow-wrap:anywhere">${esc(h.title)}</p>
      ${fresh ? `<div><span class="lbl">How long?</span><div class="radios">${[15, 25, 45].concat([S.set.focusMins]).filter((m, i, a) => a.indexOf(m) === i).sort((a, b) => a - b).map(m => `<label><input type="radio" name="fm" value="${m}" ${f.total === m * 60 ? 'checked' : ''}><span>${m} min</span></label>`).join('')}</div></div>` : ''}
      <div class="candle-wrap">${candleSVG()}</div><div class="ftime" data-tick="focus">${clock(focusLeft())}</div>
      ${f.done ? `<p class="fdone">Time's up. Nice focus. Take a short break.</p>` : ''}
      <div class="sheet-actions"><button type="button" class="btn ghost" data-act="focus-reset">Reset</button><button type="button" class="btn gold" data-act="focus-toggle">${running ? 'Pause' : fresh ? 'Start' : 'Resume'}</button></div>
      <p class="meta" style="margin:0;text-align:center">You can close this. The candle keeps burning.</p>`;
    const sh = $('#scrim .sheet');
    if (sh && sh.dataset.kind === 'focus') sh.innerHTML = html;
    else { openSheet(html); const s2 = $('#scrim .sheet'); if (s2) s2.dataset.kind = 'focus'; }
    const s3 = $('#scrim .sheet');
    if (s3) s3.onchange = e => { if (e.target.name === 'fm') { f.total = f.left = Number(e.target.value) * 60; renderFocus(h); } };
    paintCandle();
  }

  /* ---------- actions ---------- */
  function hwById(id) { return S.homework.find(h => h.id === id); }
  function completeHw(id) {
    const h = hwById(id); if (!h) return;
    const before = clone(h);
    put('homework', id, Object.assign(clone(h), { done: true, doneAt: todayStr() }));
    if (S.focus && S.focus.hwId === id) S.focus = null;
    chime(); toast('Finished ' + h.title, () => put('homework', id, before));
  }
  function logMeal(name, cal, pro, save) {
    const t = todayStr(), day = dayFood(t), mid = rid();
    day.meals.push({ id: mid, name, cal: Math.round(cal), pro: Math.round(pro), t: Date.now() });
    put('food', t, day);
    if (save && !S.saved.some(s => key(s.name) === key(name))) put('saved', rid(), { name, cal: Math.round(cal), pro: Math.round(pro) });
    toast(`Logged ${name}, ${fmtN(cal)} cal`, () => { const d2 = dayFood(t); d2.meals = d2.meals.filter(m => m.id !== mid); put('food', t, d2); });
  }
  async function estimate() {
    const inp = $('#food-in'), text = inp ? inp.value.trim() : '';
    if (!text) { U.estErr = 'Type what you ate first'; scheduleRender(); return; }
    if (!SAMPLE || U.estBusy) return;
    U.estErr = ''; U.estBusy = true; renderPage(S.page);
    try {
      const r = await SAMPLE.json('Estimate the nutrition of this food. If amounts are given use them, otherwise assume one typical serving: "' + text.slice(0, 300) + '".\nReply with only a JSON object in exactly this shape: {"name": "2 eggs and toast", "calories": 330, "protein": 18}\n"name" is a short tidy name for the food, "calories" is kcal and "protein" is grams. Both are whole numbers.', { modelTier: 'quick' });
      const cal = Math.round(num(r && r.calories)), pro = Math.round(num(r && r.protein));
      U.est = { name: String((r && r.name) || text).slice(0, 80), cal, pro };
      ['est-name', 'est-cal', 'est-pro'].forEach(i => { const el = document.getElementById(i); if (el) el.remove(); });
    } catch (e) {
      const c = e && e.code;
      if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) { SAMPLE = null; U.manual = true; U.estErr = "Estimates aren't available here, so enter the numbers yourself."; }
      else if (c === 'rate_limited') U.estErr = 'Too many estimates right now. Try again in a minute, or enter the numbers yourself.';
      else if (c === 'session_expired') U.estErr = 'Sign in to Claude again to get estimates.';
      else if (c !== 'cancelled') U.estErr = "Couldn't get an estimate. Try again, or enter the numbers yourself.";
    } finally { U.estBusy = false; renderPage(S.page); }
  }
  function startRest(secs) { S.rest.end = Date.now() + secs * 1000; }

  const ACT = {
    nav: b => go(Number(b.dataset.i)),
    theme: b => {
      const v = b.dataset.v;
      if (v === 'custom' && !(S.set.custom && hexOk(S.set.custom.dark))) { const c = themeColors(); S.set.custom = { light: c[0], mid: c[1], dark: c[2] }; }
      S.set.theme = v; saveSettings();
      const blk = $('#theme-block'); if (blk) { blk.innerHTML = themeBlock(); const on = $('.theme.on', blk); if (on) on.focus(); }
    },
    settings: () => openSettings(),
    'close-sheet': () => closeSheet(),
    qa: () => { if ($('#qmenu').hidden) openQA(); else closeQA(); },
    'qa-do': b => {
      const v = b.dataset.v; closeQA();
      if (v === 'hw') openHwForm(); else if (v === 'exam') openExamForm(); else if (v === 'plan') openPlanForm();
      else if (v === 'meal') go(3, () => focusEl('#food-in'));
      else if (v === 'set') go(4, () => focusEl('#ex-in'));
      else if (v === 'bw') go(4, () => focusEl('#bw-in'));
    },
    'new-hw': () => openHwForm(), 'edit-hw': b => openHwForm(b.dataset.id),
    'new-exam': () => openExamForm(), 'edit-exam': b => openExamForm(b.dataset.id),
    'new-plan': () => openPlanForm(), 'edit-plan': b => openPlanForm(b.dataset.id),
    'del-plan': b => { const p = S.plans.find(x => x.id === b.dataset.id); if (!p) return; const before = clone(p); del('plans', p.id); closeSheet(); toast('Deleted ' + p.title, () => put('plans', p.id, before)); },
    'del-exam': b => { const x = S.exams.find(e => e.id === b.dataset.id); if (!x) return; const before = clone(x); del('exams', x.id); closeSheet(); toast('Deleted ' + x.title, () => put('exams', x.id, before)); },
    'del-hw': b => { const h = hwById(b.dataset.id); if (!h) return; const before = clone(h); del('homework', h.id); closeSheet(); if (U.openHw === h.id) U.openHw = null; toast('Deleted ' + h.title, () => put('homework', h.id, before)); },
    'hw-done': b => completeHw(b.dataset.id),
    'hw-undone': b => { const h = hwById(b.dataset.id); if (!h) return; put('homework', h.id, Object.assign(clone(h), { done: false, doneAt: null })); toast('Moved ' + h.title + ' back to your list'); },
    step: b => {
      const h = hwById(b.dataset.id); if (!h) return; const i = Number(b.dataset.i), n = clone(h);
      const s = n.steps[i]; if (!s) return; s.done = !s.done; s.doneAt = s.done ? todayStr() : null;
      put('homework', h.id, n);
      if (s.done) { chime(); U.glow = '#st-' + h.id + '-' + i; }
    },
    'add-step': b => {
      const id = b.dataset.id, inp = document.getElementById('step-in-' + id), t = inp ? inp.value.trim() : '';
      const er = document.getElementById('step-err-' + id);
      if (!t) { if (er) er.textContent = 'Type a step first'; return; }
      const h = hwById(id); if (!h) return; const n = clone(h); n.steps = n.steps || []; n.steps.push({ t, done: false, doneAt: null });
      inp.value = ''; put('homework', id, n);
    },
    'del-step': b => { const h = hwById(b.dataset.id); if (!h) return; const before = clone(h), n = clone(h), i = Number(b.dataset.i), st = n.steps[i]; n.steps.splice(i, 1); put('homework', h.id, n); toast('Removed step: ' + (st ? st.t : ''), () => put('homework', h.id, before)); },
    'toggle-more': () => { U.more = !U.more; renderPage(S.page); },
    'open-hw': b => { U.school = 'hw'; U.openHw = b.dataset.id; go(2, () => focusEl('#hw-' + b.dataset.id + ' .hw-open')); },
    'toggle-hw': b => { U.openHw = U.openHw === b.dataset.id ? null : b.dataset.id; renderPage(S.page); },
    'toggle-done': () => { U.showDone = !U.showDone; renderPage(S.page); },
    'school-tab': b => { U.school = b.dataset.v; renderPage(S.page); },
    focus: b => openFocus(b.dataset.id),
    'focus-toggle': () => {
      const f = S.focus; if (!f) return;
      if (f.end) { f.left = focusLeft(); f.end = null; } else { if (f.left <= 0) f.left = f.total; f.done = false; f.end = Date.now() + f.left * 1000; }
      const h = hwById(f.hwId); if (h) renderFocus(h); scheduleRender();
    },
    'focus-reset': () => { const f = S.focus; if (!f) return; f.end = null; f.left = f.total; f.done = false; const h = hwById(f.hwId); if (h) renderFocus(h); scheduleRender(); },
    wk: b => { U.weekStart = addDays(U.weekStart, Number(b.dataset.n)); const t = todayStr(); U.schedDay = mondayOf(t) === U.weekStart ? (parse(t).getDay() % 6 === 0 ? U.weekStart : t) : U.weekStart; renderPage(S.page); },
    day: b => { U.schedDay = b.dataset.d; renderPage(S.page); },
    estimate: () => estimate(),
    manual: b => { U.manual = b.dataset.v === '1'; U.est = null; U.estErr = ''; renderPage(S.page); },
    'cancel-est': () => { U.est = null; renderPage(S.page); },
    'log-est': () => {
      const name = ($('#est-name') || {}).value || '', cal = ($('#est-cal') || {}).value, pro = ($('#est-pro') || {}).value;
      const er = $('#est-err');
      if (!name.trim()) { er.textContent = 'Give the meal a name'; return; }
      if (cal === '' || isNaN(Number(cal)) || Number(cal) < 0) { er.textContent = 'Enter calories as a number'; return; }
      logMeal(name.trim(), num(cal), num(pro), $('#est-save').checked);
      U.est = null; const fi = $('#food-in'); if (fi) fi.value = ''; ['est-name', 'est-cal', 'est-pro'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
      renderPage(S.page);
    },
    'log-manual': () => {
      const name = ($('#food-in') || {}).value || '', cal = ($('#man-cal') || {}).value, pro = ($('#man-pro') || {}).value;
      const er = $('#man-err');
      if (!name.trim()) { er.textContent = 'Type what you ate first'; return; }
      if (cal === '' || isNaN(Number(cal)) || Number(cal) < 0) { er.textContent = 'Enter calories as a number'; return; }
      logMeal(name.trim(), num(cal), num(pro), $('#man-save').checked);
      ['food-in', 'man-cal', 'man-pro'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
      renderPage(S.page);
    },
    'log-saved': b => { const s = S.saved.find(x => x.id === b.dataset.id); if (s) logMeal(s.name, num(s.cal), num(s.pro), false); },
    'edit-saved': () => { U.editSaved = !U.editSaved; renderPage(S.page); },
    'del-saved': b => { const s = S.saved.find(x => x.id === b.dataset.id); if (!s) return; const before = clone(s); del('saved', s.id); toast('Removed ' + s.name + ' from saved meals', () => put('saved', s.id, before)); },
    'del-meal': b => { const t = todayStr(), day = dayFood(t), before = clone(day), m = day.meals.find(x => x.id === b.dataset.id); if (!m) return; day.meals = day.meals.filter(x => x.id !== m.id); put('food', t, day); toast('Removed ' + m.name, () => put('food', t, before)); },
    water: b => { const t = todayStr(), day = dayFood(t), i = Number(b.dataset.i); day.water = day.water === i + 1 ? i : i + 1; put('food', t, day); },
    split: b => { const t = todayStr(), w = dayW(t); if (w.split === b.dataset.v) return; w.split = b.dataset.v; put('workouts', t, w); },
    'add-ex': () => {
      const inp = $('#ex-in'), name = inp ? inp.value.trim() : '', er = $('#ex-err');
      if (!name) { er.textContent = 'Type an exercise name first'; return; }
      const t = todayStr(), w = dayW(t), at = w.ex.findIndex(e => key(e.name) === key(name));
      inp.value = ''; er.textContent = '';
      if (at >= 0) { focusEl('#w-' + at); return; }
      const known = exNames().find(n => key(n) === key(name));
      w.ex.push({ name: known || name, sets: [] }); put('workouts', t, w);
      setTimeout(() => focusEl('#w-' + (w.ex.length - 1)), 60);
    },
    'del-ex': b => { const t = todayStr(), w = dayW(t), before = clone(w), i = Number(b.dataset.i), e = w.ex[i]; if (!e) return; w.ex.splice(i, 1); put('workouts', t, w); toast('Removed ' + e.name, () => put('workouts', t, before)); },
    'log-set': b => {
      const i = Number(b.dataset.i), wi = document.getElementById('w-' + i), ri = document.getElementById('r-' + i), er = document.getElementById('set-err-' + i);
      const wv = wi ? wi.value.trim() : '', rv = ri ? ri.value.trim() : '';
      if (wv === '' || isNaN(Number(wv)) || Number(wv) < 0) { er.textContent = 'Enter the weight as a number'; return; }
      if (rv === '' || !Number.isInteger(Number(rv)) || Number(rv) < 1) { er.textContent = 'Enter reps as a whole number'; return; }
      er.textContent = '';
      const t = todayStr(), w = dayW(t), e = w.ex[i]; if (!e) return;
      const wt = Math.round(Number(wv) * 10) / 10, rp = Number(rv), best = bestAll(e.name), pr = best > 0 && e1rm(wt, rp) > best + 1e-9;
      const before = clone(w);
      e.sets = e.sets || []; e.sets.push({ w: wt, r: rp }); put('workouts', t, w);
      startRest(S.set.restSecs);
      if (pr) { chime(); U.glow = '#set-' + i + '-' + (e.sets.length - 1); toast(`New PR on ${e.name}: ${fmtW(wt)} × ${rp}`, () => put('workouts', t, before)); }
      else toast(`Logged ${fmtW(wt)} × ${rp}. Rest timer started.`, () => put('workouts', t, before));
    },
    'del-set': b => { const t = todayStr(), w = dayW(t), before = clone(w), i = Number(b.dataset.i), k = Number(b.dataset.k), e = w.ex[i]; if (!e || !e.sets[k]) return; const s = e.sets[k]; e.sets.splice(k, 1); put('workouts', t, w); toast(`Removed set ${fmtW(num(s.w))} × ${num(s.r)}`, () => put('workouts', t, before)); },
    'toggle-pr': () => { U.prOpen = !U.prOpen; renderPage(S.page); },
    'log-bw': () => {
      const inp = $('#bw-in'), v = inp ? inp.value.trim() : '', er = $('#bw-err');
      if (v === '' || isNaN(Number(v)) || Number(v) <= 0) { er.textContent = 'Enter your weight as a number'; return; }
      const t = todayStr(), before = S.weights[t] ? clone(S.weights[t]) : null, lb = Math.round(Number(v) * 10) / 10;
      inp.value = ''; er.textContent = ''; put('weights', t, { lb });
      toast(`Logged ${fmtW(lb)} lb for today`, () => { if (before) put('weights', t, before); else del('weights', t); });
    },
    'rest-toggle': () => { if (S.rest.end) S.rest.end = null; else startRest(S.set.restSecs); renderPage(S.page); },
    'rest-add': () => { if (S.rest.end) S.rest.end += 15000; else startRest(S.set.restSecs + 15); renderPage(S.page); },
    export: async () => {
      const data = { app: 'Orii', exportedAt: new Date().toISOString(), settings: S.set, schedule: S.plans, homework: S.homework, exams: S.exams, savedMeals: S.saved, food: S.food, workouts: S.workouts, bodyWeight: S.weights };
      const r = await shareFile('orii-backup-' + todayStr() + '.json', JSON.stringify(data, null, 2), 'application/json');
      if (r === 'downloaded') toast('Backup saved to your downloads');
    },
    import: () => { const f = $('#import-file'); if (f) f.click(); },
    ics: async () => {
      const { text, count } = buildICS();
      if (!count) { toast('Add homework or an exam with a date first.'); return; }
      const r = await shareFile('orii-reminders.ics', text, 'text/calendar');
      if (r === 'downloaded') toast('Open the downloaded file to add ' + count + (count === 1 ? ' item' : ' items') + ' to your calendar.');
      else if (r === 'shared') toast('Choose Calendar, then Add All.');
    },
    install: async () => { if (!deferredInstall) return; deferredInstall.prompt(); try { await deferredInstall.userChoice; } catch (e) { /* ignore */ } deferredInstall = null; scheduleRender(); },
    'hide-install': () => { try { localStorage.setItem('orii-hide-install', '1'); } catch (e) { /* ignore */ } scheduleRender(); }
  };

  /* ---------- import a backup (from Claude Orii or another device) ---------- */
  function importBackup(file) {
    const er = $('#import-err');
    const reader = new FileReader();
    reader.onload = () => {
      let o;
      try { o = JSON.parse(String(reader.result)); } catch (e) { if (er) er.textContent = "That file isn't an Orii backup. Pick the .json file you exported."; return; }
      if (!o || (o.app !== 'Orii' && !o.homework && !o.schedule)) { if (er) er.textContent = "That file isn't an Orii backup. Pick the .json file you exported."; return; }
      let n = 0;
      const takeList = (c, arr) => (Array.isArray(arr) ? arr : []).forEach(it => { if (it && it.id) { const b = clone(it); delete b.id; mem[c][it.id] = b; n++; } });
      const takeMap = (c, obj) => Object.keys(obj && typeof obj === 'object' ? obj : {}).forEach(k => { if (/^\d{4}-\d{2}-\d{2}$/.test(k)) { const b = clone(obj[k]); delete b.id; mem[c][k] = b; n++; } });
      takeList('plans', o.schedule); takeList('homework', o.homework); takeList('exams', o.exams); takeList('saved', o.savedMeals);
      takeMap('food', o.food); takeMap('workouts', o.workouts); takeMap('weights', o.bodyWeight);
      if (o.settings && typeof o.settings === 'object') { const keepName = S.set.name; S.set = Object.assign({}, DEF_SET, o.settings); if (!S.set.name && keepName) S.set.name = keepName; }
      persist(); COLS.forEach(memApply); applyMotion(); renderHeader();
      closeSheet(); toast('Imported ' + n + (n === 1 ? ' entry' : ' entries'));
    };
    reader.onerror = () => { if (er) er.textContent = "Couldn't read that file. Try exporting it again."; };
    reader.readAsText(file);
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!$('#qmenu').hidden && !e.target.closest('#qmenu') && !e.target.closest('#qa')) closeQA();
    if (!b || b.disabled) return;
    const f = ACT[b.dataset.act];
    if (f) { e.preventDefault(); f(b, e); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if ($('#scrim')) closeSheet(); else closeQA(); return; }
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { const a = e.target.dataset.enter; if (ACT[a]) { e.preventDefault(); ACT[a](e.target, e); } }
  });
  document.addEventListener('input', e => { const el = e.target; if (!el.id) return; const er = el.closest('.card, .hw-panel, .est'); if (er) $$('.err', er).forEach(x => { if (x.id) x.textContent = ''; }); if (el.id === 'food-in' && U.estErr) U.estErr = ''; });

  /* ---------- 1-second ticker for timers ---------- */
  let lastMin = new Date().getMinutes();
  setInterval(() => {
    $$('[data-tick="rest"]').forEach(el => { el.textContent = clock(restLeft()); });
    $$('[data-tick="focus"]').forEach(el => { el.textContent = clock(focusLeft()); });
    if (S.focus && S.focus.end) paintCandle();
    if (S.rest.end && Date.now() >= S.rest.end) { S.rest.end = null; chime(); toast("Rest's up. Time for your next set."); if (S.page === 4) renderPage(4); }
    if (S.focus && S.focus.end && Date.now() >= S.focus.end) {
      const f = S.focus; f.end = null; f.left = 0; f.done = true; chime(); toast("Focus session done. Nice work.");
      const sh = $('#scrim .sheet'); const h = hwById(f.hwId); if (sh && sh.dataset.kind === 'focus' && h) renderFocus(h); scheduleRender();
    }
    const m = new Date().getMinutes();
    if (m !== lastMin) { lastMin = m; renderHeader(); if (S.page === 0 || S.page === 1) scheduleRender(); }
  }, 1000);

  /* ---------- start ---------- */
  (function initView() {
    const t = todayStr(), dw = parse(t).getDay();
    U.weekStart = mondayOf(t); U.schedDay = t;
    if (dw === 0 || dw === 6) { U.weekStart = addDays(mondayOf(t), 7); U.schedDay = U.weekStart; }
  })();
  loadLocal();
  applyMotion(); renderHeader(); renderPage(0); renderNav(); updateBadge();
  const sizeNav = () => document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
  sizeNav(); window.addEventListener('resize', sizeNav);
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', () => applyMotion());

  /* keep entries from being cleared by the browser, and work offline */
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* optional */ }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  /* pick up changes made in another tab, and refresh the day when the app comes back */
  window.addEventListener('storage', e => { if (e.key === LS_KEY) { loadLocal(); applyMotion(); renderHeader(); scheduleRender(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderHeader(); scheduleRender(); } else updateBadge(); });
})();
