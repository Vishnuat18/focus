/**
 * SMACK Beta Download Captcha Games
 * Each game exposes: { render(container), verify() → boolean }
 */

// ─── Utility ──────────────────────────────────────────────────────────────────
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const MASTER_WORD_POOL = [
    'PLANET', 'SCHOOL', 'BRIDGE', 'DREAM', 'GALAXY', 'FLOWER', 'ORANGE', 'BRIGHT',
    'SILENT', 'HEART', 'STUDY', 'ELBOW', 'GLEAN', 'FOSTER', 'STREAM', 'THING',
    'SLIVER', 'COFFEE', 'GUITAR', 'PENCIL', 'WINDOW', 'BOTTLE', 'CAMERA', 'CHURCH',
    'MARKET', 'DESERT', 'FOREST', 'SQUARE', 'CIRCLE', 'STORM', 'WINTER', 'SUMMER'
];

// ─── Game 1: Shape Equality ───────────────────────────────────────────────────
// Uses SVG shape pairs — no emoji
export function imageEqualityGame() {
    // Will use SVG_ICONS & SHAPE_COLORS defined later in file
    // We build pairs lazily inside render so the library is available
    let userAnswer = null;
    let isEqual = false;
    let pairA = null, pairB = null;

    return {
        title: 'Are these two shapes the same?',
        render(container, onInput) {
            const shapeKeys = Object.keys(SVG_ICONS);
            const colors    = SHAPE_COLORS;
            const sA = rnd(shapeKeys), cA = rnd(colors);
            isEqual = Math.random() > 0.5;
            const sB = isEqual ? sA : rnd(shapeKeys.filter(k => k !== sA));
            const cB = isEqual ? cA : rnd(colors.filter(c => c.hex !== cA.hex));
            pairA = { s: sA, c: cA };
            pairB = { s: sB, c: cB };

            const icon = (s, c, size=64) =>
                `<div style="color:${c.hex};display:flex;align-items:center;justify-content:center;
                    filter:drop-shadow(0 0 8px ${c.hex}66);">
                    ${SVG_ICONS[s].replace('width="48" height="48"', `width="${size}" height="${size}"`)}
                </div>`;

            container.innerHTML = `
                <div style="display:flex;align-items:center;gap:1.5rem;">
                    <div style="padding:1rem;border-radius:14px;background:rgba(255,255,255,0.05);
                        border:1.5px solid rgba(255,255,255,0.1);">${icon(sA,cA)}</div>
                    <span class="cg-eq-vs">vs</span>
                    <div style="padding:1rem;border-radius:14px;background:rgba(255,255,255,0.05);
                        border:1.5px solid rgba(255,255,255,0.1);">${icon(sB,cB)}</div>
                </div>
                <div class="cg-btn-row">
                    <button class="cg-choice-btn" data-val="equal">Same</button>
                    <button class="cg-choice-btn" data-val="notequal">Different</button>
                </div>`;
            container.querySelectorAll('.cg-choice-btn').forEach(btn => {
                btn.onclick = () => {
                    userAnswer = btn.dataset.val;
                    if (onInput) onInput(this.verify());
                    else {
                        container.querySelectorAll('.cg-choice-btn').forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                    }
                };
            });
        },
        verify() {
            if (!userAnswer) return false;
            return isEqual ? userAnswer === 'equal' : userAnswer === 'notequal';
        }
    };
}

// ─── Game 2: Ink Deception (Color Match) ─────────────────────────────────────
export function colorWordGame() {
    const COLORS = [
        { name: 'Red',    hex: '#ef4444' },
        { name: 'Blue',   hex: '#3b82f6' },
        { name: 'Green',  hex: '#10b981' },
        { name: 'Yellow', hex: '#f59e0b' },
        { name: 'Purple', hex: '#8b5cf6' },
        { name: 'Orange', hex: '#f97316' },
        { name: 'Pink',   hex: '#ec4899' },
        { name: 'Cyan',   hex: '#06b6d4' },
        { name: 'Indigo', hex: '#6366f1' },
        { name: 'Lime',   hex: '#84cc16' },
        { name: 'Amber',  hex: '#f59e0b' }
    ];

    const target = rnd(COLORS);
    const options = shuffle([target, ...shuffle(COLORS.filter(c => c !== target)).slice(0, 3)]);
    const correctIdx = options.indexOf(target);
    let userAnswer = null;

    return {
        title: `SELECT THE COLOR: ${target.name.toUpperCase()}`,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="padding:1.5rem 2.5rem;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:20px; text-align:center;">
                        <span style="color:#ffffff; font-size:1.8rem; font-weight:900; letter-spacing:2px; text-transform:uppercase;">
                            ${target.name}
                        </span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;width:100%;">
                        ${options.map((c, i) => `
                            <button class="cg-color-btn" data-idx="${i}" style="
                                height:65px; border-radius:18px; border:none;
                                background:${c.hex}; cursor:pointer; transition:all 0.2s;
                                box-shadow: 0 4px 15px ${c.hex}44;">
                            </button>`).join('')}
                    </div>
                </div>`;
            container.querySelectorAll('.cg-color-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-color-btn').forEach(b => b.style.outline = 'none');
                    btn.style.outline = '3px solid white';
                    btn.style.outlineOffset = '2px';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 3: Number Comparison ────────────────────────────────────────────────
export function numberComparisonGame() {
    // Numbers within 30 of each other for harder comparison
    const base = Math.floor(Math.random() * 800) + 100;
    const diff = Math.floor(Math.random() * 30) + 1;
    const a = base;
    let b = Math.random() > 0.5 ? base + diff : base - diff;
    if (b < 1) b = base + diff;
    // Occasionally make them equal
    if (Math.random() < 0.15) b = a;

    const correctAnswer = a > b ? 'left' : b > a ? 'right' : 'equal';
    let userAnswer = null;

    return {
        title: 'Which number is larger?',
        render(container) {
            container.innerHTML = `
                <div class="cg-num-pair">
                    <button class="cg-num-btn" data-val="left">${a}</button>
                    <span class="cg-eq-vs">?</span>
                    <button class="cg-num-btn" data-val="right">${b}</button>
                </div>
                <div class="cg-btn-row" style="margin-top:0.5rem;">
                    <button class="cg-choice-btn" data-val="equal">= Equal</button>
                </div>
            `;
            container.querySelectorAll('.cg-num-btn, .cg-choice-btn').forEach(btn => {
                btn.onclick = () => {
                    container.querySelectorAll('.cg-num-btn, .cg-choice-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    userAnswer = btn.dataset.val;
                };
            });
        },
        verify() {
            return userAnswer === correctAnswer;
        }
    };
}

// ─── Game 4: Visual Memory ────────────────────────────────────────────────────
export function visualMemoryGame() {
    const GRID = 4;
    const HIGHLIGHT_COUNT = 6;
    const isBlitz = window.location.href.includes('reflex_game.html');
    const MEMORIZE_TIME = isBlitz ? 1500 : 4000; // 1.5s in blitz, 4s normal

    const totalCells = GRID * GRID;
    const highlighted = new Set();
    while (highlighted.size < HIGHLIGHT_COUNT) {
        highlighted.add(Math.floor(Math.random() * totalCells));
    }

    const userSelected = new Set();
    let revealed = true;

    return {
        title: `Memorize the highlighted cells — you have 4 seconds!`,
        render(container) {
            const buildGrid = (showHighlights) => {
                container.innerHTML = `
                    <div class="cg-mem-status" id="cg-mem-status">
                        ${showHighlights ? '⏳ Memorize these cells...' : '✏️ Now click the cells you saw'}
                    </div>
                    <div class="cg-mem-grid" id="cg-mem-grid">
                        ${Array.from({ length: totalCells }, (_, i) => `
                            <div class="cg-mem-cell ${showHighlights && highlighted.has(i) ? 'lit' : ''}" data-idx="${i}"></div>
                        `).join('')}
                    </div>
                `;

                if (!showHighlights) {
                    container.querySelectorAll('.cg-mem-cell').forEach(cell => {
                        cell.onclick = () => {
                            const idx = parseInt(cell.dataset.idx);
                            if (highlighted.has(idx)) {
                                if (!userSelected.has(idx)) {
                                    userSelected.add(idx);
                                    cell.classList.add('selected');
                                }
                            } else {
                                this.isWrong = true;
                                cell.classList.add('wrong');
                            }
                        };
                    });
                }
            };

            buildGrid(true);
            let countdown = MEMORIZE_TIME / 1000;
            const statusEl = () => container.querySelector('#cg-mem-status');
            const timer = setInterval(() => {
                countdown--;
                const s = statusEl();
                if (s) s.textContent = countdown > 0
                    ? `⏳ ${countdown}s — Memorize fast!`
                    : '✏️ Now click the cells you saw';
                if (countdown <= 0) clearInterval(timer);
            }, 1000);

            setTimeout(() => {
                revealed = false;
                buildGrid(false);
            }, MEMORIZE_TIME);
        },
        verify() {
            if (revealed) return false;
            if (userSelected.size !== highlighted.size) return false;
            for (const idx of highlighted) {
                if (!userSelected.has(idx)) return false;
            }
            return true;
        }
    };
}

// ─── Game 5: SVG Odd One Out ──────────────────────────────────────────────────
// Pure SVG shapes — no emoji
export function oddOneOutGame() {
    const GRID_SIZE = 9;
    const oddIndex  = Math.floor(Math.random() * GRID_SIZE);
    let userAnswer  = null;
    // Visually SIMILAR pairs to make it harder
    const svgPairs = [
        ['circle','ring'],      // filled vs hollow circle
        ['star','hexagon'],     // both pointy
        ['triangle','play'],    // both triangular
        ['square','pause'],     // both rectangular
        ['shield','heart'],     // both rounded-top
        ['ring','target'],      // both ring-like
        ['cross','pause'],      // both blocky
        ['arrow_r','arrow_u'],  // same arrow, different direction
        ['crescent','heart'],   // both curved
        ['diamond','star'],     // both pointed
    ];
    const [commonKey, oddKey] = rnd(svgPairs);
    const color = rnd(SHAPE_COLORS);

    const cell = (shapeKey) =>
        `<div style="color:${color.hex};display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
            ${SVG_ICONS[shapeKey].replace('width="48" height="48"','width="36" height="36"')}
        </div>`;

    return {
        title: 'Click the shape that is different from the rest',
        render(container) {
            container.innerHTML = `
                <div class="cg-odd-grid">
                    ${Array.from({ length: GRID_SIZE }, (_, i) => `
                        <button class="cg-odd-cell" data-idx="${i}">
                            ${cell(i === oddIndex ? oddKey : commonKey)}
                        </button>`).join('')}
                </div>`;
            container.querySelectorAll('.cg-odd-cell').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== oddIndex) this.isWrong = true;
                    container.querySelectorAll('.cg-odd-cell').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                };
            });
        },
        verify() { return userAnswer === oddIndex; }
    };
}

// ─── SVG Icon Library ────────────────────────────────────────────────────────
const SVG_ICONS = {
    circle:   `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="20" fill="currentColor"/></svg>`,
    square:   `<svg viewBox="0 0 48 48" width="48" height="48"><rect x="6" y="6" width="36" height="36" rx="4" fill="currentColor"/></svg>`,
    triangle: `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="24,4 44,44 4,44" fill="currentColor"/></svg>`,
    diamond:  `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="24,2 46,24 24,46 2,24" fill="currentColor"/></svg>`,
    star:     `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="24,2 29,18 46,18 33,29 38,46 24,36 10,46 15,29 2,18 19,18" fill="currentColor"/></svg>`,
    hexagon:  `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="24,2 43,13 43,35 24,46 5,35 5,13" fill="currentColor"/></svg>`,
    cross:    `<svg viewBox="0 0 48 48" width="48" height="48"><rect x="19" y="2" width="10" height="44" rx="3" fill="currentColor"/><rect x="2" y="19" width="44" height="10" rx="3" fill="currentColor"/></svg>`,
    arrow_r:  `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="2,16 30,16 30,6 46,24 30,42 30,32 2,32" fill="currentColor"/></svg>`,
    arrow_l:  `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="46,16 18,16 18,6 2,24 18,42 18,32 46,32" fill="currentColor"/></svg>`,
    arrow_u:  `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="16,46 16,18 6,18 24,2 42,18 32,18 32,46" fill="currentColor"/></svg>`,
    arrow_d:  `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="16,2 16,30 6,30 24,46 42,30 32,30 32,2" fill="currentColor"/></svg>`,
    shield:   `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 2 L42 10 L42 24 C42 34 34 42 24 46 C14 42 6 34 6 24 L6 10 Z" fill="currentColor"/></svg>`,
    heart:    `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 42 C24 42 4 28 4 16 C4 9 9 4 16 6 C19 7 22 10 24 13 C26 10 29 7 32 6 C39 4 44 9 44 16 C44 28 24 42 24 42 Z" fill="currentColor"/></svg>`,
    crescent: `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M32 6 A20 20 0 1 0 32 42 A14 14 0 1 1 32 6 Z" fill="currentColor"/></svg>`,
    lightning:`<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="28,2 10,26 22,26 20,46 38,22 26,22" fill="currentColor"/></svg>`,
    ring:     `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="8"/></svg>`,
    play:     `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="8,4 44,24 8,44" fill="currentColor"/></svg>`,
    pause:    `<svg viewBox="0 0 48 48" width="48" height="48"><rect x="6" y="4" width="14" height="40" rx="3" fill="currentColor"/><rect x="28" y="4" width="14" height="40" rx="3" fill="currentColor"/></svg>`,
    spiral:   `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 24 m0-18 a18 18 0 0 1 18 18 a14 14 0 0 1-14 14 a10 10 0 0 1-10-10 a6 6 0 0 1 6-6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
    target:   `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="24" r="4" fill="currentColor"/></svg>`,
};

const SHAPE_COLORS = [
    { name: 'Indigo',  hex: '#6366f1' },
    { name: 'Rose',    hex: '#f43f5e' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber',   hex: '#f59e0b' },
    { name: 'Cyan',    hex: '#06b6d4' },
    { name: 'Violet',  hex: '#8b5cf6' },
];

// ─── Game 6: Shape Silhouette Match ──────────────────────────────────────────
export function shapeSilhouetteGame() {
    const shapeKeys = Object.keys(SVG_ICONS);
    const targetKey = rnd(shapeKeys);
    // Pick 3 wrong shapes (different from target)
    const others = shuffle(shapeKeys.filter(k => k !== targetKey)).slice(0, 3);
    const options = shuffle([targetKey, ...others]);
    const correctIdx = options.indexOf(targetKey);
    let userAnswer = null;

    const color = rnd(SHAPE_COLORS);

    return {
        title: 'Pick the shape that matches the silhouette',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.2rem;width:100%;">
                    <div style="
                        width:90px;height:90px;
                        display:flex;align-items:center;justify-content:center;
                        background:rgba(255,255,255,0.04);
                        border:1.5px solid rgba(255,255,255,0.12);
                        border-radius:16px;
                        color:${color.hex};
                        filter:drop-shadow(0 0 12px ${color.hex}88);
                    ">${SVG_ICONS[targetKey]}</div>
                    <div style="font-size:0.7rem;color:rgba(255,255,255,0.35);letter-spacing:1px;text-transform:uppercase;">choose the same shape</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;width:100%;">
                        ${options.map((k, i) => `
                            <button class="cg-shape-opt" data-idx="${i}" style="
                                display:flex;align-items:center;justify-content:center;
                                padding:0.8rem;
                                border-radius:12px;
                                background:rgba(255,255,255,0.05);
                                border:1.5px solid rgba(255,255,255,0.1);
                                color:rgba(255,255,255,0.7);
                                cursor:pointer;
                                transition:all 0.2s;
                                width:100%;
                            ">${SVG_ICONS[k]}</button>
                        `).join('')}
                    </div>
                </div>
            `;
            container.querySelectorAll('.cg-shape-opt').forEach(btn => {
                btn.onmouseover = () => { if (!btn.classList.contains('selected')) btn.style.background = 'rgba(99,102,241,0.15)'; };
                btn.onmouseout  = () => { if (!btn.classList.contains('selected')) btn.style.background = 'rgba(255,255,255,0.05)'; };
                btn.onclick = () => {
                    container.querySelectorAll('.cg-shape-opt').forEach(b => {
                        b.classList.remove('selected');
                        b.style.background = 'rgba(255,255,255,0.05)';
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.color = 'rgba(255,255,255,0.7)';
                    });
                    btn.classList.add('selected');
                    btn.style.background = 'rgba(99,102,241,0.3)';
                    btn.style.borderColor = '#818cf8';
                    btn.style.color = '#c7d2fe';
                    userAnswer = parseInt(btn.dataset.idx);
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 7: Dot Counter ──────────────────────────────────────────────────────
export function dotCounterGame() {
    const count = Math.floor(Math.random() * 9) + 8; // 8–16 dots — harder to count
    // Mix two sizes to make dots harder to distinguish
    const dots = [];
    for (let i = 0; i < count; i++) {
        dots.push({
            cx: 5 + Math.random() * 90,
            cy: 5 + Math.random() * 90,
            r:  1.8 + Math.random() * 2.2  // smaller, varying
        });
    }
    const color = rnd(SHAPE_COLORS);
    // Wrong options: only ±1 and ±2 (not ±3) — closer guesses
    const offsets = shuffle([-2,-1,1,2]);
    const wrongs = [];
    for (const o of offsets) {
        const v = count + o;
        if (v > 0 && v < 25 && !wrongs.includes(v)) wrongs.push(v);
        if (wrongs.length === 3) break;
    }
    const options = shuffle([count, ...wrongs]);
    const correctIdx = options.indexOf(count);
    let userAnswer = null;

    return {
        title: 'Count the dots and pick the correct number',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;">
                    <div style="
                        width:100%;max-width:200px;
                        border-radius:14px;
                        border:1.5px solid rgba(255,255,255,0.1);
                        background:rgba(255,255,255,0.04);
                        overflow:hidden;
                    ">
                        <svg viewBox="0 0 100 100" width="100%" style="display:block;">
                            ${dots.map(d => `<circle cx="${d.cx.toFixed(1)}" cy="${d.cy.toFixed(1)}" r="${d.r.toFixed(1)}" fill="${color.hex}"/>`).join('')}
                        </svg>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;width:100%;">
                        ${options.map((v, i) => `
                            <button class="cg-num-btn cg-dot-opt" data-idx="${i}" style="min-width:unset;font-size:1.2rem;padding:0.7rem;">${v}</button>
                        `).join('')}
                    </div>
                </div>
            `;
            container.querySelectorAll('.cg-dot-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-dot-opt').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 8: Pattern Sequence ─────────────────────────────────────────────────
export function patternSequenceGame() {
    // Pattern: 3-item rotating sequence A B C A B C — user picks what comes 7th
    const shapeKeys = Object.keys(SVG_ICONS);
    const [shapeA, shapeB, shapeC] = shuffle(shapeKeys).slice(0, 3);
    const [colA, colB, colC]       = shuffle(SHAPE_COLORS).slice(0, 3);

    // Sequence shown: A B C A B C — answer is A (7th = 1st in cycle)
    const sequence = [
        { shape: shapeA, color: colA },
        { shape: shapeB, color: colB },
        { shape: shapeC, color: colC },
        { shape: shapeA, color: colA },
        { shape: shapeB, color: colB },
    ];
    const answer = { shape: shapeC, color: colC }; // 6th item

    // 3 wrong options: use correct shape but wrong color, or wrong shape same color
    const wrongs = shuffle([
        { shape: shapeC, color: rnd(SHAPE_COLORS.filter(c => c.hex !== colC.hex)) }, // right shape, wrong color
        { shape: rnd(shapeKeys.filter(k => k !== shapeC)), color: colC },            // wrong shape, right color
        { shape: rnd(shapeKeys.filter(k => k !== shapeC)), color: rnd(SHAPE_COLORS.filter(c => c.hex !== colC.hex)) },
    ]);
    const options = shuffle([answer, ...wrongs]);
    const correctIdx = options.findIndex(o => o.shape === answer.shape && o.color.hex === answer.color.hex);
    let userAnswer = null;

    const renderIcon = (item, size = 36) =>
        `<span style="color:${item.color.hex};display:flex;align-items:center;justify-content:center;">
            ${SVG_ICONS[item.shape].replace('width="48" height="48"', `width="${size}" height="${size}"`)}
        </span>`;

    return {
        title: 'What comes next in the sequence? (A B C A B ...?)',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.2rem;width:100%;">
                    <div style="display:flex;align-items:center;gap:0.6rem;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.1);border-radius:14px;padding:0.8rem 1.2rem;">
                        ${sequence.map(s => renderIcon(s, 40)).join(
                            '<span style="color:rgba(255,255,255,0.25);font-size:1.2rem;font-weight:700;">›</span>'
                        )}
                        <span style="color:rgba(255,255,255,0.25);font-size:1.2rem;font-weight:700;">›</span>
                        <span style="
                            width:44px;height:44px;
                            border:2px dashed rgba(99,102,241,0.5);
                            border-radius:8px;
                            display:flex;align-items:center;justify-content:center;
                            color:rgba(99,102,241,0.5);
                            font-size:1.4rem;font-weight:700;
                        ">?</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;width:100%;">
                        ${options.map((opt, i) => `
                            <button class="cg-pat-opt" data-idx="${i}" style="
                                display:flex;align-items:center;justify-content:center;
                                padding:0.8rem;
                                border-radius:12px;
                                background:rgba(255,255,255,0.05);
                                border:1.5px solid rgba(255,255,255,0.1);
                                cursor:pointer;
                                transition:all 0.2s;
                            ">${renderIcon(opt, 36)}</button>
                        `).join('')}
                    </div>
                </div>
            `;
            container.querySelectorAll('.cg-pat-opt').forEach(btn => {
                btn.onmouseover = () => { if (!btn.classList.contains('selected')) btn.style.background = 'rgba(99,102,241,0.15)'; };
                btn.onmouseout  = () => { if (!btn.classList.contains('selected')) btn.style.background = 'rgba(255,255,255,0.05)'; };
                btn.onclick = () => {
                    container.querySelectorAll('.cg-pat-opt').forEach(b => {
                        b.classList.remove('selected');
                        b.style.background = 'rgba(255,255,255,0.05)';
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                    });
                    btn.classList.add('selected');
                    btn.style.background = 'rgba(99,102,241,0.3)';
                    btn.style.borderColor = '#818cf8';
                    userAnswer = parseInt(btn.dataset.idx);
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 9: Vector Path (Pattern Logic) ─────────────────────────────────────
export function vectorPathGame() {
    const symbols = [
        { key: 'arrow_u', color: '#f59e0b' }, // Orange Up
        { key: 'arrow_d', color: '#8b5cf6' }, // Purple Down
        { key: 'spiral',  color: '#ef4444' }, // Red Spiral
        { key: 'circle',  color: '#3b82f6' }, // Blue Circle
        { key: 'star',    color: '#fbbf24' }, // Yellow Star
        { key: 'triangle',color: '#10b981' }  // Green Triangle
    ];

    // Pick 3 symbols for the pattern
    const pool = shuffle(symbols).slice(0, 3);
    // Pattern: A B C A B ?
    const sequence = [pool[0], pool[1], pool[2], pool[0], pool[1]];
    const correctSymbol = pool[2];
    
    const options = shuffle([...pool, rnd(symbols.filter(s => !pool.includes(s)))]);
    const correctIdx = options.indexOf(correctSymbol);
    let userAnswer = null;

    return {
        title: 'What comes next in the sequence?',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="display:flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.1);border-radius:18px;padding:1rem;width:100%;justify-content:center;">
                        ${sequence.map(s => `
                            <div style="color:${s.color};padding:5px;display:flex;align-items:center;justify-content:center;">
                                ${SVG_ICONS[s.key].replace('width="48" height="48"', 'width="34" height="34"')}
                            </div>
                            <i class="fas fa-chevron-right" style="font-size:0.6rem;opacity:0.2;"></i>
                        `).join('')}
                        <div style="width:40px;height:40px;border:2px dashed rgba(99,102,241,0.4);border-radius:8px;display:flex;align-items:center;justify-content:center;color:rgba(99,102,241,0.4);">
                            ?
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;width:100%;">
                        ${options.map((s, i) => `
                            <button class="cg-vector-opt" data-idx="${i}" style="
                                background:rgba(255,255,255,0.05);
                                border:1.5px solid rgba(255,255,255,0.1);
                                border-radius:16px;
                                padding:1rem;
                                display:flex;align-items:center;justify-content:center;
                                cursor:pointer;transition:all 0.2s;
                                color:${s.color};
                            ">
                                ${SVG_ICONS[s.key].replace('width="48" height="48"', 'width="38" height="38"')}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            container.querySelectorAll('.cg-vector-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-vector-opt').forEach(b => {
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.background = 'rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor = '#818cf8';
                    btn.style.background = 'rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 10: Shape Math ──────────────────────────────────────────────────────
export function shapeMathGame() {
    const shapeKeys = ['circle','square','triangle','diamond','star'];
    const shapeKey  = rnd(shapeKeys);
    const color     = rnd(SHAPE_COLORS);

    // Larger values for harder counting
    const useAdd = Math.random() > 0.5;
    const a = Math.floor(Math.random() * 5) + 4;  // 4–8 (was 2-6)
    const b = useAdd
        ? Math.floor(Math.random() * 5) + 2        // 2–6 (was 1-4)
        : Math.floor(Math.random() * (a - 2)) + 2; // 2..(a-2)
    const result = useAdd ? a + b : a - b;

    const wrongs = shuffle([
        result + 1, result - 1, result + 2, result - 2
    ].filter(v => v > 0 && v !== result)).slice(0, 3);
    const options = shuffle([result, ...wrongs]);
    const correctIdx = options.indexOf(result);
    let userAnswer = null;

    const makeIcons = (count, clr) =>
        Array.from({ length: count }, () =>
            `<span style="color:${clr};display:inline-flex;">${SVG_ICONS[shapeKey].replace('width="48" height="48"', 'width="28" height="28"')}</span>`
        ).join('');

    return {
        title: useAdd
            ? `How many shapes are there in total?`
            : `How many shapes remain after removing some?`,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;">
                    <div style="
                        background:rgba(255,255,255,0.04);
                        border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:14px;
                        padding:1rem;
                        width:100%;
                        box-sizing:border-box;
                    ">
                        <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;align-items:center;margin-bottom:0.6rem;">
                            ${makeIcons(a, color.hex)}
                        </div>
                        <div style="text-align:center;font-size:1.4rem;font-weight:800;color:rgba(255,255,255,0.5);line-height:1;">
                            ${useAdd ? '+' : '−'}
        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;align-items:center;margin-top:0.6rem;">
                            ${makeIcons(b, useAdd ? color.hex : '#ef4444')}
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;width:100%;">
                        ${options.map((v, i) => `
                            <button class="cg-num-btn cg-math-opt" data-idx="${i}" style="min-width:unset;font-size:1.3rem;padding:0.7rem;">${v}</button>
                        `).join('')}
                    </div>
                </div>
            `;
            container.querySelectorAll('.cg-math-opt').forEach(btn => {
                btn.onclick = () => {
                    container.querySelectorAll('.cg-math-opt').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    userAnswer = parseInt(btn.dataset.idx);
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 11: Size Comparison (Mega Tiny) ──────────────────────────────────
export function sizeComparisonGame() {
    const shapeKey = rnd(['circle','square','triangle','star','hexagon','heart','shield']);
    const color = rnd(SHAPE_COLORS);
    
    // 3 highly distinct sizes for reflex play
    const availableSizes = [24, 48, 75];
    const shuffleSizes = shuffle([...availableSizes]);
    const labels = ['Left', 'Middle', 'Right'];
    
    // Choose a target type: 0=Smallest, 1=Medium, 2=Largest
    const targetType = Math.floor(Math.random() * 3);
    const targetLabels = ['SMALLEST', 'MEDIUM', 'LARGEST'];
    const targetTitle = `TAP THE ${targetLabels[targetType]}`;
    
    // Find index of target in the shuffled array
    const targetValue = availableSizes[targetType];
    const correctIdx = shuffleSizes.indexOf(targetValue);
    let userAnswer = null;

    const icon = (sz) =>
        `<div style="color:${color.hex};display:flex;align-items:center;justify-content:center;
            filter:drop-shadow(0 0 10px ${color.hex}66);">
            ${SVG_ICONS[shapeKey].replace('width="48" height="48"', `width="${sz}" height="${sz}"`)}
        </div>`;

    return {
        title: targetTitle,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);letter-spacing:3px;font-weight:900;text-transform:uppercase;">
                        ${targetTitle}
                    </div>
                    <div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;
                        background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:24px;padding:2rem 1rem;width:100%;box-sizing:border-box;">
                        ${shuffleSizes.map((sz, i) => `
                            <button class="cg-size-btn" data-idx="${i}" style="
                                display:flex;flex-direction:column;align-items:center;gap:1rem;
                                background:none;border:2.5px solid transparent;
                                border-radius:16px;padding:0.8rem;cursor:pointer;transition:all 0.15s;
                                width:90px;height:110px;justify-content:flex-end;">
                                ${icon(sz)}
                                <span style="font-size:0.75rem;color:rgba(255,255,255,0.4);font-weight:800;letter-spacing:1px;">${labels[i]}</span>
                            </button>`).join('')}
                    </div>
                </div>`;
            container.querySelectorAll('.cg-size-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-size-btn').forEach(b => {
                        b.style.borderColor='transparent'; b.style.background='none';
                    });
                    btn.style.borderColor='#818cf8'; btn.style.background='rgba(99,102,241,0.15)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 10: Rotation Match (Orbit Spin) ──────────────────────────────────
export function rotationMatchGame() {
    const shapeKey = rnd(['arrow_r','play','lightning','crescent','shield','star']);
    const color = rnd(SHAPE_COLORS);
    const angles = [0, 90, 180, 270];
    const targetAngle = rnd(angles);
    const options = shuffle([...angles]);
    const correctIdx = options.indexOf(targetAngle);
    let userAnswer = null;

    const icon = (angle, sz=48) =>
        `<div style="color:${color.hex};display:flex;align-items:center;justify-content:center;
            transform:rotate(${angle}deg);transition:transform 0.3s;
            filter:drop-shadow(0 0 8px ${color.hex}55);">
            ${SVG_ICONS[shapeKey].replace('width="48" height="48"', `width="${sz}" height="${sz}"`)}
        </div>`;

    return {
        title: 'MATCH THIS ROTATION',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="padding:1.5rem;background:rgba(255,255,255,0.05);border:1.5px solid rgba(99,102,241,0.3);
                        border-radius:20px; box-shadow: 0 0 20px ${color.hex}22;">
                        ${icon(targetAngle, 64)}
                    </div>
                    <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);letter-spacing:2px;font-weight:800;">MATCH THIS ROTATION</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;width:100%;">
                        ${options.map((angle, i) => `
                            <button class="cg-rot-btn" data-idx="${i}" style="
                                display:flex;align-items:center;justify-content:center;
                                padding:1.2rem;border-radius:16px;
                                background:rgba(255,255,255,0.05);
                                border:1.5px solid rgba(255,255,255,0.1);
                                cursor:pointer;transition:all 0.2s;">
                                ${icon(angle, 42)}
                            </button>`).join('')}
                    </div>
                </div>`;
            container.querySelectorAll('.cg-rot-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-rot-btn').forEach(b => {
                        b.style.borderColor='rgba(255,255,255,0.1)'; b.style.background='rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor='#818cf8'; btn.style.background='rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 13: Shape Symmetry ──────────────────────────────────────────────────
// Is this shape left-right symmetric? Yes / No
export function shapeSymmetryGame() {
    const symmetric    = ['circle','square','diamond','star','hexagon','cross','ring','target','triangle','heart'];
    const asymmetric   = ['crescent','lightning','play','spiral','arrow_r','arrow_l','arrow_u','arrow_d'];
    const isSymmetric  = Math.random() > 0.5;
    const pool         = isSymmetric ? symmetric : asymmetric;
    const shapeKey     = rnd(pool);
    const color        = rnd(SHAPE_COLORS);
    let userAnswer     = null;

    return {
        title: 'Is this shape left-right symmetric?',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.2rem;">
                    <div style="padding:1.4rem;background:rgba(255,255,255,0.05);
                        border:1.5px solid rgba(255,255,255,0.1);border-radius:16px;
                        color:${color.hex};filter:drop-shadow(0 0 10px ${color.hex}66);">
                        ${SVG_ICONS[shapeKey].replace('width="48" height="48"','width="70" height="70"')}
                    </div>
                    <div style="display:flex;gap:0.8rem;">
                        <div style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;">
                            <div style="width:1px;height:60px;background:rgba(99,102,241,0.5);margin-bottom:4px;"></div>
                            <span style="font-size:0.65rem;color:rgba(99,102,241,0.6);letter-spacing:1px;">AXIS</span>
                        </div>
                    </div>
                    <div class="cg-btn-row">
                        <button class="cg-choice-btn" data-val="yes">Yes — Symmetric</button>
                        <button class="cg-choice-btn" data-val="no">No — Asymmetric</button>
                    </div>
                </div>`;
            container.querySelectorAll('.cg-choice-btn').forEach(btn => {
                btn.onclick = () => {
                    container.querySelectorAll('.cg-choice-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    userAnswer = btn.dataset.val;
                };
            });
        },
        verify() {
            if (!userAnswer) return false;
            return isSymmetric ? userAnswer === 'yes' : userAnswer === 'no';
        }
    };
}

// ─── Game 14: Count by Shape Type ────────────────────────────────────────────
// Mixed SVG shapes shown — count only the TARGET shape type
export function countByShapeGame() {
    const allKeys  = ['circle','square','triangle','diamond','star','hexagon','shield','heart'];
    const targetKey= rnd(allKeys);
    const others   = shuffle(allKeys.filter(k => k !== targetKey)).slice(0, 2);
    const color    = rnd(SHAPE_COLORS);

    // All shapes same color — target shapes NOT highlighted
    // User must count by shape type only, not by color cue
    const targetCount = Math.floor(Math.random() * 4) + 3; // 3-6
    const totalShapes = targetCount + Math.floor(Math.random() * 5) + 3; // extra 3-7 distractors
    const positions   = [];
    for (let i = 0; i < totalShapes; i++) {
        positions.push({
            key: i < targetCount ? targetKey : rnd(others),
            x: 5 + Math.random() * 80,
            y: 5 + Math.random() * 80,
            rot: Math.floor(Math.random() * 4) * 90
        });
    }
    const shuffledPos = shuffle(positions);

    const wrongs = shuffle([-1,1,-2,2].map(o=>targetCount+o).filter(v=>v>0&&v!==targetCount)).slice(0,3);
    const options = shuffle([targetCount, ...wrongs]);
    const correctIdx = options.indexOf(targetCount);
    let userAnswer = null;

    return {
        title: `Count only the <span style="color:${color.hex};font-weight:800;">${targetKey}</span> shapes`,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;">
                    <div style="font-size:0.8rem;color:rgba(255,255,255,0.6);">Count only:
                        <span style="color:${color.hex};font-weight:700;margin-left:4px;">${targetKey.toUpperCase()}</span>
                        <span style="color:${color.hex};display:inline-flex;vertical-align:middle;margin-left:4px;">
                            ${SVG_ICONS[targetKey].replace('width="48" height="48"','width="18" height="18"')}
                        </span>
                    </div>
                    <div style="position:relative;width:100%;max-width:220px;height:140px;
                        background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:14px;overflow:hidden;">
                        ${shuffledPos.map(p => `
                            <div style="position:absolute;left:${p.x}%;top:${p.y}%;
                                transform:translate(-50%,-50%) rotate(${p.rot}deg);
                                color:${color.hex};
                                display:flex;opacity:0.9;">
                                ${SVG_ICONS[p.key].replace('width="48" height="48"','width="20" height="20"')}
                            </div>`).join('')}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;width:100%;">
                        ${options.map((v,i)=>`
                            <button class="cg-num-btn cg-cnt-opt" data-idx="${i}"
                                style="min-width:unset;font-size:1.2rem;padding:0.7rem;">${v}</button>`).join('')}
                    </div>
                </div>`;
            container.querySelectorAll('.cg-cnt-opt').forEach(btn => {
                btn.onclick = () => {
                    container.querySelectorAll('.cg-cnt-opt').forEach(b=>b.classList.remove('selected'));
                    btn.classList.add('selected');
                    userAnswer = parseInt(btn.dataset.idx);
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 15: Color Swatch Match ──────────────────────────────────────────────
// A shape name is shown in a specific COLOR — pick the matching solid swatch
export function colorSwatchGame() {
    const swatches = [
        { name:'Indigo',  hex:'#6366f1' }, { name:'Rose',   hex:'#f43f5e' },
        { name:'Emerald', hex:'#10b981' }, { name:'Amber',  hex:'#f59e0b' },
        { name:'Cyan',    hex:'#06b6d4' }, { name:'Violet', hex:'#8b5cf6' },
        { name:'Lime',    hex:'#84cc16' }, { name:'Sky',    hex:'#38bdf8' },
    ];
    const target = rnd(swatches);
    const others = shuffle(swatches.filter(s=>s.hex!==target.hex)).slice(0,3);
    const options = shuffle([target, ...others]);
    const correctIdx = options.findIndex(s=>s.hex===target.hex);
    let userAnswer = null;

    const shapeName = rnd(Object.keys(SVG_ICONS));

    return {
        title: 'Pick the color swatch that matches the highlighted shape',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.2rem;width:100%;">
                    <div style="display:flex;align-items:center;gap:0.8rem;
                        background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:14px;padding:1rem 1.4rem;">
                        <div style="color:${target.hex};filter:drop-shadow(0 0 10px ${target.hex}88);">
                            ${SVG_ICONS[shapeName].replace('width="48" height="48"','width="48" height="48"')}
                        </div>
                        <span style="font-family:'Outfit';font-weight:700;font-size:0.9rem;
                            color:${target.hex};letter-spacing:0.5px;">${target.name}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;width:100%;">
                        ${options.map((s,i) => `
                            <button class="cg-swatch-btn" data-idx="${i}" style="
                                height:52px;border-radius:12px;
                                background:${s.hex};
                                border:2.5px solid transparent;
                                cursor:pointer;transition:all 0.2s;
                                box-shadow:0 4px 12px ${s.hex}44;"></button>`).join('')}
                    </div>
                </div>`;
            container.querySelectorAll('.cg-swatch-btn').forEach(btn => {
                btn.onmouseover = () => { if (!btn.classList.contains('selected')) btn.style.transform='scale(1.04)'; };
                btn.onmouseout  = () => { if (!btn.classList.contains('selected')) btn.style.transform='scale(1)'; };
                btn.onclick = () => {
                    container.querySelectorAll('.cg-swatch-btn').forEach(b => {
                        b.classList.remove('selected'); b.style.borderColor='transparent'; b.style.transform='scale(1)';
                    });
                    btn.classList.add('selected');
                    btn.style.borderColor='white'; btn.style.transform='scale(1.06)';
                    userAnswer = parseInt(btn.dataset.idx);
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Shared word style helper ─────────────────────────────────────────────────
const wordBtn = (text, idx, extraStyle = '') =>
    `<button class="cg-word-btn" data-idx="${idx}" style="
        padding:0.65rem 0.5rem;border-radius:10px;
        background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
        color:rgba(255,255,255,0.85);font-family:'Outfit',sans-serif;font-weight:600;
        font-size:0.88rem;cursor:pointer;transition:all 0.2s;letter-spacing:0.3px;
        ${extraStyle}">${text}</button>`;

const selectWordBtn = (container) => {
    let userAnswer = null;
    container.querySelectorAll('.cg-word-btn').forEach(btn => {
        btn.onmouseover = () => { if (!btn.classList.contains('selected')) btn.style.background='rgba(99,102,241,0.2)'; };
        btn.onmouseout  = () => { if (!btn.classList.contains('selected')) btn.style.background='rgba(255,255,255,0.05)'; };
        btn.onclick = () => {
            container.querySelectorAll('.cg-word-btn').forEach(b => {
                b.classList.remove('selected');
                b.style.background='rgba(255,255,255,0.05)';
                b.style.borderColor='rgba(255,255,255,0.1)';
            });
            btn.classList.add('selected');
            btn.style.background='rgba(99,102,241,0.3)';
            btn.style.borderColor='#818cf8';
            userAnswer = parseInt(btn.dataset.idx);
        };
    });
    return { get: () => userAnswer };
};

const wordBox = (content) =>
    `<div style="background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.1);
        border-radius:14px;padding:1.2rem;width:100%;box-sizing:border-box;text-align:center;">${content}</div>`;

const grid2x2 = (items) =>
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.55rem;width:100%;">${items}</div>`;

// ─── Game 16: Word Unscramble ──────────────────────────────────────────────────
export function wordUnscrambleGame() {
    const word = rnd(MASTER_WORD_POOL);
    const jumbled = shuffle(word.split('')).join('');
    const wrongs = shuffle(MASTER_WORD_POOL.filter(w => w.length === word.length && w !== word)).slice(0, 3);
    const options = shuffle([word, ...wrongs]);
    const correctIdx = options.indexOf(word);
    let userAnswer = null;

    return {
        title: 'UNSCRAMBLE THE WORD',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:20px; padding:2rem; width:100%; box-sizing:border-box; text-align:center;">
                        <span style="font-size:2.2rem; font-weight:900; letter-spacing:8px;
                            color:white; font-family:'Outfit',sans-serif; text-transform:uppercase;">
                            ${jumbled}
                        </span>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; width:100%;">
                        ${options.map((w, i) => `
                            <button class="cg-word-opt" data-idx="${i}" style="
                                padding:1.2rem; border-radius:16px;
                                background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                                color:white; font-family:'Outfit',sans-serif; font-weight:700;
                                font-size:1.1rem; cursor:pointer; transition:all 0.2s; letter-spacing:1px;
                                text-transform:uppercase;">
                                ${w}
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-word-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-word-opt').forEach(b => {
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.background = 'rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor = '#818cf8';
                    btn.style.background = 'rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 17: Image Odd Man Out (Lingo Match) ──────────────────────────────
export function wordCategoryGame() {
    const iconGroups = [
        { name: 'Weather', keys: ['sun','cloud','rain','storm','snow'] },
        { name: 'Shapes',  keys: ['circle','square','triangle','diamond','star','hexagon'] },
        { name: 'Arrows',  keys: ['arrow_u','arrow_d','arrow_l','arrow_r','play'] },
        { name: 'Symbols', keys: ['heart','shield','lightning','crescent','ring','cross'] },
        { name: 'Interface',keys: ['check','close','info','search','settings','menu'] }
    ];

    // Pick two different groups
    const mainGroup = rnd(iconGroups);
    const oddGroup = rnd(iconGroups.filter(g => g !== mainGroup));

    // Pick 3 from main, 1 from odd
    const mainIcons = shuffle(mainGroup.keys).slice(0, 3);
    const oddIcon = rnd(oddGroup.keys);

    const shown = shuffle([...mainIcons.map(k => ({ key: k, type: 'main' })), { key: oddIcon, type: 'odd' }]);
    const correctIdx = shown.findIndex(item => item.type === 'odd');
    let userAnswer = null;

    return {
        title: 'WHICH IMAGE IS DIFFERENT?',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; width:100%;">
                        ${shown.map((item, i) => `
                            <button class="cg-word-opt" data-idx="${i}" style="
                                padding:1.5rem; border-radius:20px;
                                background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                                display:flex; align-items:center; justify-content:center;
                                cursor:pointer; transition:all 0.2s; color:white;">
                                ${SVG_ICONS[item.key].replace('width="48" height="48"', 'width="42" height="42"')}
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-word-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-word-opt').forEach(b => {
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.background = 'rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor = '#818cf8';
                    btn.style.background = 'rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 18: Missing Letter (Missing Piece) ──────────────────────────────────
export function missingLetterGame() {
    const word = rnd(MASTER_WORD_POOL);
    const blankIdx = Math.floor(Math.random() * word.length);
    const correctLetter = word[blankIdx];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wrongs = shuffle(alphabet.filter(l => l !== correctLetter)).slice(0, 3);
    const options = shuffle([correctLetter, ...wrongs]);
    const correctIdx = options.indexOf(correctLetter);
    let userAnswer = null;

    const masked = [...word].map((c, i) => i === blankIdx
        ? `<span style="color:#818cf8; border-bottom:3px solid #818cf8; min-width:24px; display:inline-block; margin:0 2px;">_</span>`
        : c).join('');

    return {
        title: 'COMPLETE THE WORD',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:20px; padding:2rem; width:100%; box-sizing:border-box; text-align:center;">
                        <span style="font-size:2.2rem; font-weight:900; letter-spacing:6px;
                            color:white; font-family:'Outfit',sans-serif; text-transform:uppercase;">
                            ${masked}
                        </span>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; width:100%;">
                        ${options.map((l, i) => `
                            <button class="cg-word-opt" data-idx="${i}" style="
                                padding:1rem; border-radius:16px;
                                background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                                color:rgba(255,255,255,0.9); font-family:'Outfit',sans-serif; font-weight:900;
                                font-size:1.4rem; cursor:pointer; transition:all 0.2s;
                                text-transform:uppercase;">
                                ${l}
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-word-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-word-opt').forEach(b => {
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.background = 'rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor = '#818cf8';
                    btn.style.background = 'rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 19: Number Sequence (Digit Chain) ──────────────────────────────────
export function numberSequenceGame() {
    const sequences = [
        { seq: [2,4,8,16],    next: 32 },
        { seq: [1,4,9,16],    next: 25 },
        { seq: [3,6,11,18],   next: 27 },
        { seq: [1,1,2,3,5],   next: 8 },
        { seq: [100,90,81,73],next: 66 },
        { seq: [5,10,20,40],  next: 80 },
        { seq: [1,3,7,13],    next: 21 },
        { seq: [2,6,12,20],   next: 30 },
        { seq: [64,32,16,8],  next: 4 },
        { seq: [1,8,27,64],   next: 125 },
        { seq: [10,20,30,40], next: 50 },
        { seq: [1,2,4,7,11],  next: 16 }
    ];
    const chosen = rnd(sequences);
    const shown = chosen.seq;
    const nextValue = chosen.next;
    const wrongs = shuffle([nextValue+1, nextValue-1, nextValue+2, nextValue-2, nextValue*2].filter(v => v !== nextValue && v > 0)).slice(0, 3);
    const options = shuffle([nextValue, ...wrongs]);
    const correctIdx = options.indexOf(nextValue);
    let userAnswer = null;

    return {
        title: 'COMPLETE THE SEQUENCE',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:20px; padding:2rem; width:100%; box-sizing:border-box; text-align:center;
                        display:flex; align-items:center; justify-content:center; gap:0.8rem; flex-wrap:wrap;">
                        ${shown.map(n => `
                            <span style="font-size:2rem; font-weight:900; color:white; font-family:'Outfit',sans-serif;">${n}</span>
                            <span style="color:rgba(255,255,255,0.2); font-size:1.2rem;">›</span>
                        `).join('')}
                        <div style="width:50px; height:60px; border:2px dashed rgba(129, 140, 248, 0.4); 
                            border-radius:12px; display:flex; align-items:center; justify-content:center;
                            font-size:1.8rem; font-weight:900; color:#818cf8; background:rgba(129,140,248,0.05);">?</div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; width:100%;">
                        ${options.map((v, i) => `
                            <button class="cg-word-opt" data-idx="${i}" style="
                                padding:1.2rem; border-radius:16px;
                                background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                                color:white; font-family:'Outfit',sans-serif; font-weight:900;
                                font-size:1.5rem; cursor:pointer; transition:all 0.2s;">
                                ${v}
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-word-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-word-opt').forEach(b => {
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.background = 'rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor = '#818cf8';
                    btn.style.background = 'rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 20: Equation Solver (Quick Math) ──────────────────────────────────
export function equationSolverGame() {
    const ops = [
        { sym:'+', fn: (a,b)=>a+b },
        { sym:'−', fn: (a,b)=>a-b },
        { sym:'×', fn: (a,b)=>a*b },
    ];
    const op = rnd(ops);
    let a, b, result;
    if (op.sym === '×') {
        a = Math.floor(Math.random()*8)+2; b = Math.floor(Math.random()*8)+2;
    } else if (op.sym === '−') {
        a = Math.floor(Math.random()*30)+15; b = Math.floor(Math.random()*(a-1))+1;
    } else {
        a = Math.floor(Math.random()*40)+5; b = Math.floor(Math.random()*40)+5;
    }
    result = op.fn(a, b);

    // Hide one of: a, b, or result
    const hideWhich = rnd(['a','b','res']);
    let display, answer;
    if (hideWhich === 'a')   { display = `? ${op.sym} ${b} = ${result}`;   answer = a; }
    else if (hideWhich === 'b') { display = `${a} ${op.sym} ? = ${result}`; answer = b; }
    else                     { display = `${a} ${op.sym} ${b} = ?`;         answer = result; }

    const wrongs = shuffle([answer+1,answer-1,answer+2,answer-2].filter(v=>v>0&&v!==answer)).slice(0,3);
    const options = shuffle([answer, ...wrongs]);
    const correctIdx = options.indexOf(answer);
    let sel = null;

    return {
        title: 'Solve the equation — find the missing value',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;">
                    ${wordBox(`<span style="font-size:1.5rem;font-weight:800;letter-spacing:2px;
                        font-family:'Outfit',sans-serif;color:rgba(255,255,255,0.95);">${display}</span>`)}
                    ${grid2x2(options.map((v, i) => wordBtn(v, i, 'font-size:1.15rem;font-weight:800;')).join(''))}
                </div>`;
            sel = selectWordBtn(container);
        },
        verify() { return sel?.get() === correctIdx; }
    };
}

// ─── Game 21: Rhyme Match (Rhyme Time) ───────────────────────────────────────
export function rhymeFinderGame() {
    const rhymes = [
        { word:'CAT',   right:'BAT',  wrongs:['DOG','PEN','SUN'] },
        { word:'LIGHT', right:'NIGHT',wrongs:['DARK','BURN','COLD'] },
        { word:'RAIN',  right:'TRAIN',wrongs:['SNOW','WIND','HAIL'] },
        { word:'CLOCK', right:'ROCK', wrongs:['TIME','BELL','HOUR'] },
        { word:'BLUE',  right:'CLUE', wrongs:['RED','GREEN','PINK'] },
        { word:'MIND',  right:'FIND', wrongs:['THINK','BRAIN','LOSE'] },
        { word:'STONE', right:'TONE', wrongs:['ROCK','SAND','DUST'] },
        { word:'FLAME', right:'GAME', wrongs:['FIRE','BURN','HEAT'] },
        { word:'TREE',  right:'FREE', wrongs:['WOOD','LEAF','ROOT'] },
        { word:'SPACE', right:'RACE', wrongs:['STAR','MOON','DARK'] },
        { word:'BONE',  right:'CONE', wrongs:['FAST','SLOW','HERE'] },
        { word:'CHAIR', right:'STAIR',wrongs:['TABLE','DOOR','WALL'] },
        { word:'DREAM', right:'STEAM',wrongs:['SLEEP','NIGHT','DARK'] },
        { word:'FISH',  right:'DISH', wrongs:['WATER','SWIM','SEA'] },
        { word:'GOLD',  right:'COLD', wrongs:['HOT','WARM','FIRE'] },
        { word:'HAND',  right:'SAND', wrongs:['FOOT','ARM','LEG'] },
        { word:'ICE',   right:'MICE', wrongs:['COLD','SNOW','HEAT'] },
        { word:'JEEP',  right:'DEEP', wrongs:['CAR','ROAD','DRIVE'] },
        { word:'KITE',  right:'BITE', wrongs:['SKY','FLY','WIND'] },
        { word:'LAKE',  right:'CAKE', wrongs:['WATER','FISH','BOAT'] },
        { word:'MOON',  right:'SOON', wrongs:['SUN','STAR','NIGHT'] },
        { word:'NEST',  right:'REST', wrongs:['BIRD','EGG','TREE'] },
        { word:'OWL',   right:'BOWL', wrongs:['BIRD','NIGHT','FLY'] },
        { word:'PEN',   right:'TEN',  wrongs:['INK','WRITE','PAPER'] },
        { word:'QUEEN', right:'GREEN',wrongs:['KING','CROWN','GOLD'] },
        { word:'ROSE',  right:'NOSE', wrongs:['FLOWER','RED','PINK'] },
        { word:'STAR',  right:'CAR',  wrongs:['SKY','NIGHT','MOON'] },
        { word:'TRUCK', right:'LUCK', wrongs:['ROAD','DRIVE','FAST'] },
        { word:'UP',    right:'CUP',  wrongs:['DOWN','LEFT','RIGHT'] },
        { word:'VAN',   right:'PAN',  wrongs:['CAR','ROAD','DRIVE'] },
        { word:'WALL',  right:'BALL', wrongs:['DOOR','WINDOW','ROOF'] },
        { word:'YEAR',  right:'DEAR', wrongs:['MONTH','WEEK','DAY'] },
        { word:'ZIP',   right:'SHIP', wrongs:['FAST','SLOW','HERE'] },
        { word:'BEAR',  right:'WEAR', wrongs:['LION','TIGER','ZOO'] },
        { word:'DEER',  right:'NEAR', wrongs:['ZOO','WILD','WOOD'] },
        { word:'GOAT',  right:'BOAT', wrongs:['FARM','MILK','HORN'] },
        { word:'HORN',  right:'CORN', wrongs:['SOUND','MUSIC','LOUD'] },
        { word:'LAMP',  right:'CAMP', wrongs:['LIGHT','DARK','ROOM'] },
        { word:'MAIL',  right:'SAIL', wrongs:['POST','LETTER','BOX'] },
        { word:'PEAR',  right:'BEAR', wrongs:['FRUIT','SWEET','EAT'] },
        { word:'RING',  right:'SING', wrongs:['GOLD','FINGER','WEAR'] },
        { word:'TENT',  right:'SENT', wrongs:['CAMP','WOOD','SLEEP'] },
        { word:'VEST',  right:'BEST', wrongs:['WEAR','CLOTH','WARM'] },
        { word:'WING',  right:'KING', wrongs:['BIRD','FLY','SKY'] }
    ];
    const chosen = rnd(rhymes);
    const options = shuffle([chosen.right, ...chosen.wrongs]);
    const correctIdx = options.indexOf(chosen.right);
    let userAnswer = null;

    return {
        title: 'WHICH WORD RHYMES?',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                        border-radius:20px; padding:1.8rem; width:100%; box-sizing:border-box; text-align:center;">
                        <span style="font-size:2rem; font-weight:900; letter-spacing:4px;
                            color:#818cf8; font-family:'Outfit',sans-serif; text-transform:uppercase;">
                            ${chosen.word}
                        </span>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; width:100%;">
                        ${options.map((w, i) => `
                            <button class="cg-word-opt" data-idx="${i}" style="
                                padding:1.2rem; border-radius:16px;
                                background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                                color:rgba(255,255,255,0.9); font-family:'Outfit',sans-serif; font-weight:700;
                                font-size:1.1rem; cursor:pointer; transition:all 0.2s; letter-spacing:1px;
                                text-transform:uppercase;">
                                ${w}
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-word-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-word-opt').forEach(b => {
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.background = 'rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor = '#818cf8';
                    btn.style.background = 'rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 22: Anagram Check ───────────────────────────────────────────────────
export function anagramCheckGame() {
    const pairs = [
        { a:'LISTEN',  b:'SILENT',  isAnagram:true  },
        { a:'EARTH',   b:'HEART',   isAnagram:true  },
        { a:'DUSTY',   b:'STUDY',   isAnagram:true  },
        { a:'BELOW',   b:'ELBOW',   isAnagram:true  },
        { a:'ANGEL',   b:'GLEAN',   isAnagram:true  },
        { a:'PLANET',  b:'CASTLE',  isAnagram:false },
        { a:'BRIDGE',  b:'GRIMED',  isAnagram:false },
        { a:'FOREST',  b:'FOSTER',  isAnagram:true  },
        { a:'MASTER',  b:'STREAM',  isAnagram:true  },
        { a:'NIGHT',   b:'THING',   isAnagram:true  },
        { a:'MARBLE',  b:'PLANET',  isAnagram:false },
        { a:'SILVER',  b:'SLIVER',  isAnagram:true  },
    ];
    const chosen = rnd(pairs);
    let userAnswer = null;

    return {
        title: 'ARE THESE ANAGRAMS?',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="display:flex;align-items:center;gap:0.8rem;width:100%;">
                        <div style="flex:1;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
                            border-radius:16px;padding:1.2rem;text-align:center;">
                            <span style="font-size:1.1rem;font-weight:800;color:#818cf8;letter-spacing:2px;">${chosen.a}</span>
                        </div>
                        <span style="font-size:0.8rem;color:rgba(255,255,255,0.3);font-weight:900;">VS</span>
                        <div style="flex:1;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
                            border-radius:16px;padding:1.2rem;text-align:center;">
                            <span style="font-size:1.1rem;font-weight:800;color:#06b6d4;letter-spacing:2px;">${chosen.b}</span>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;width:100%;">
                        <button class="cg-choice-btn" data-val="yes" style="padding:1.2rem;border-radius:16px;">YES</button>
                        <button class="cg-choice-btn" data-val="no" style="padding:1.2rem;border-radius:16px;">NO</button>
                    </div>
                </div>`;
            container.querySelectorAll('.cg-choice-btn').forEach(btn => {
                btn.onclick = () => {
                    userAnswer = btn.dataset.val;
                    const correct = chosen.isAnagram ? userAnswer === 'yes' : userAnswer === 'no';
                    if (!correct) this.isWrong = true;
                    container.querySelectorAll('.cg-choice-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                };
            });
        },
        verify() {
            if (!userAnswer) return false;
            return chosen.isAnagram ? userAnswer === 'yes' : userAnswer === 'no';
        }
    };
}

// ─── Game 23: Word Length (Size Sort) ───────────────────────────────────────
export function wordLengthGame() {
    // Pick 4 words with different lengths from the master pool
    const used = new Set();
    const chosen = [];
    while (chosen.length < 4) {
        const w = rnd(MASTER_WORD_POOL);
        if (!used.has(w.length)) {
            chosen.push(w);
            used.add(w.length);
        }
    }
    
    const mode = Math.random() > 0.5 ? 'SHORTEST' : 'LONGEST';
    const sorted = [...chosen].sort((a,b) => a.length - b.length);
    const targetWord = mode === 'SHORTEST' ? sorted[0] : sorted[sorted.length-1];
    
    const options = shuffle(chosen);
    const correctIdx = options.indexOf(targetWord);
    let userAnswer = null;

    return {
        title: `TAP THE ${mode} WORD`,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; width:100%;">
                        ${options.map((w, i) => `
                            <button class="cg-word-opt" data-idx="${i}" style="
                                padding:1.2rem; border-radius:16px;
                                background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                                color:white; font-family:'Outfit',sans-serif; font-weight:700;
                                font-size:1rem; cursor:pointer; transition:all 0.2s; letter-spacing:1px;
                                text-transform:uppercase;">
                                ${w}
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-word-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-word-opt').forEach(b => {
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.background = 'rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor = '#818cf8';
                    btn.style.background = 'rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── SVG Scene Library (for image puzzles) ───────────────────────────────────
// Each scene is a 200×200 SVG body — split into 4 quadrants for puzzles
const IMG_SCENES = [
    // 0: Sunset landscape
    `<defs><linearGradient id="sg0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient></defs>
     <rect width="200" height="200" fill="url(#sg0)"/>
     <circle cx="100" cy="85" r="38" fill="#f59e0b" opacity="0.95"/>
     <ellipse cx="100" cy="205" rx="110" ry="55" fill="#10b981"/>
     <ellipse cx="45"  cy="195" rx="55"  ry="40" fill="#059669"/>
     <ellipse cx="165" cy="198" rx="55"  ry="42" fill="#047857"/>`,
    // 1: City skyline
    `<rect width="200" height="200" fill="#0f172a"/>
     <rect x="10"  y="110" width="28" height="90" fill="#6366f1"/>
     <rect x="50"  y="80"  width="22" height="120" fill="#8b5cf6"/>
     <rect x="84"  y="95"  width="32" height="105" fill="#6366f1"/>
     <rect x="128" y="70"  width="26" height="130" fill="#4f46e5"/>
     <rect x="165" y="120" width="22" height="80"  fill="#7c3aed"/>
     <circle cx="100" cy="38" r="22" fill="#fbbf24" opacity="0.85"/>
     <circle cx="100" cy="38" r="30" fill="#fbbf24" opacity="0.2"/>`,
    // 2: Overlapping circles
    `<rect width="200" height="200" fill="#0c0a1e"/>
     <circle cx="65"  cy="65"  r="55" fill="#f43f5e" opacity="0.65"/>
     <circle cx="135" cy="65"  r="55" fill="#6366f1" opacity="0.65"/>
     <circle cx="65"  cy="135" r="55" fill="#06b6d4" opacity="0.65"/>
     <circle cx="135" cy="135" r="55" fill="#10b981" opacity="0.65"/>`,
    // 3: Concentric diamonds
    `<rect width="200" height="200" fill="#1a1a2e"/>
     <polygon points="100,10 190,100 100,190 10,100" fill="#f59e0b" opacity="0.25"/>
     <polygon points="100,35 165,100 100,165 35,100" fill="#f43f5e" opacity="0.35"/>
     <polygon points="100,60 140,100 100,140 60,100" fill="#818cf8" opacity="0.55"/>
     <polygon points="100,82 118,100 100,118 82,100" fill="#c7d2fe"/>`,
    // 4: Gradient stripes
    `<rect x="0"   y="0"   width="200" height="40" fill="#6366f1"/>
     <rect x="0"   y="40"  width="200" height="40" fill="#7c3aed"/>
     <rect x="0"   y="80"  width="200" height="40" fill="#9333ea"/>
     <rect x="0"   y="120" width="200" height="40" fill="#a855f7"/>
     <rect x="0"   y="160" width="200" height="40" fill="#c084fc"/>`,
    // 5: Starfield
    `<rect width="200" height="200" fill="#040d21"/>
     <circle cx="30"  cy="25"  r="2.5" fill="white" opacity="0.9"/>
     <circle cx="75"  cy="15"  r="1.5" fill="white" opacity="0.7"/>
     <circle cx="120" cy="30"  r="3"   fill="white" opacity="0.95"/>
     <circle cx="170" cy="12"  r="2"   fill="white" opacity="0.8"/>
     <circle cx="55"  cy="60"  r="1.8" fill="white" opacity="0.6"/>
     <circle cx="145" cy="75"  r="2.5" fill="white" opacity="0.85"/>
     <circle cx="100" cy="100" r="18"  fill="#fbbf24" opacity="0.9"/>
     <circle cx="100" cy="100" r="28"  fill="#fbbf24" opacity="0.15"/>
     <circle cx="22"  cy="140" r="2"   fill="white" opacity="0.7"/>
     <circle cx="180" cy="155" r="1.5" fill="white" opacity="0.6"/>
     <circle cx="88"  cy="170" r="2.2" fill="white" opacity="0.8"/>`,
    // 6: Abstract X grid
    `<rect width="200" height="200" fill="#0f172a"/>
     <line x1="0" y1="0" x2="200" y2="200" stroke="#818cf8" stroke-width="18" stroke-linecap="round" opacity="0.4"/>
     <line x1="200" y1="0" x2="0" y2="200" stroke="#f43f5e" stroke-width="18" stroke-linecap="round" opacity="0.4"/>
     <circle cx="100" cy="100" r="40" fill="#1e293b"/>
     <circle cx="100" cy="100" r="22" fill="#6366f1"/>`,
];

// ─── Game 24: Pixel Pattern Fill ──────────────────────────────────────────────
// A colored grid with one missing cell — pick the correct color
export function pixelPatternGame() {
    const GRID = 6;
    const colorPairs = [
        ['#6366f1','#c7d2fe'], ['#f43f5e','#fecdd3'],
        ['#10b981','#a7f3d0'], ['#f59e0b','#fde68a'],
        ['#06b6d4','#a5f3fc'], ['#8b5cf6','#ddd6fe'],
    ];
    const [darkC, lightC] = rnd(colorPairs);
    const patternType = rnd(['checker','stripe_h','stripe_v','diagonal']);

    const getColor = (r, c) => {
        if (patternType === 'checker')  return (r + c) % 2 === 0 ? darkC : lightC;
        if (patternType === 'stripe_h') return r % 2 === 0 ? darkC : lightC;
        if (patternType === 'stripe_v') return c % 2 === 0 ? darkC : lightC;
        // diagonal
        return (r + c) % 3 === 0 ? darkC : (r + c) % 3 === 1 ? lightC : '#334155';
    };

    const blankR = 1 + Math.floor(Math.random() * (GRID - 2));
    const blankC = 1 + Math.floor(Math.random() * (GRID - 2));
    const correctColor = getColor(blankR, blankC);
    const wrongColors  = shuffle(colorPairs.flatMap(p => p).filter(c => c !== correctColor)).slice(0, 3);
    const options      = shuffle([correctColor, ...wrongColors]);
    const correctIdx   = options.indexOf(correctColor);
    let userAnswer     = null;

    const SZ = 30;
    const cells = [];
    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            const x = c * SZ, y = r * SZ;
            if (r === blankR && c === blankC) {
                cells.push(`<rect x="${x}" y="${y}" width="${SZ}" height="${SZ}" fill="rgba(255,255,255,0.04)" stroke="rgba(99,102,241,0.6)" stroke-width="1.5"/>
                    <text x="${x+SZ/2}" y="${y+SZ/2+5}" text-anchor="middle" font-size="13" font-weight="bold" fill="rgba(99,102,241,0.8)">?</text>`);
            } else {
                cells.push(`<rect x="${x}" y="${y}" width="${SZ}" height="${SZ}" fill="${getColor(r,c)}" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>`);
            }
        }
    }

    return {
        title: 'What color fills the missing cell?',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;">
                    <div style="border-radius:10px;overflow:hidden;border:1.5px solid rgba(255,255,255,0.1);">
                        <svg width="${GRID*SZ}" height="${GRID*SZ}" viewBox="0 0 ${GRID*SZ} ${GRID*SZ}">${cells.join('')}</svg>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.55rem;width:100%;">
                        ${options.map((color, i) => `
                            <button class="cg-ptile" data-idx="${i}" style="
                                height:44px;border-radius:10px;background:${color};
                                border:2.5px solid transparent;cursor:pointer;
                                transition:all 0.2s;box-shadow:0 4px 12px ${color}44;"></button>`).join('')}
                    </div>
                </div>`;
            container.querySelectorAll('.cg-ptile').forEach(btn => {
                btn.onmouseover = () => { if (!btn.classList.contains('selected')) btn.style.transform='scale(1.04)'; };
                btn.onmouseout  = () => { if (!btn.classList.contains('selected')) btn.style.transform='scale(1)'; };
                btn.onclick = () => {
                    container.querySelectorAll('.cg-ptile').forEach(b => {
                        b.classList.remove('selected'); b.style.borderColor='transparent'; b.style.transform='scale(1)';
                    });
                    btn.classList.add('selected');
                    btn.style.borderColor='white'; btn.style.transform='scale(1.05)';
                    userAnswer = parseInt(btn.dataset.idx);
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 25: Jigsaw Quadrant Puzzle ──────────────────────────────────────────
// A 2×2 SVG scene with one quadrant missing — pick the correct missing piece
export function jigsawQuadrantGame() {
    const sceneIdx  = Math.floor(Math.random() * IMG_SCENES.length);
    const scene     = IMG_SCENES[sceneIdx];
    const hiddenIdx = Math.floor(Math.random() * 4);

    // quadrant viewBox offsets
    const quads = [
        { vx:0,   vy:0   },  // TL
        { vx:100, vy:0   },  // TR
        { vx:0,   vy:100 },  // BL
        { vx:100, vy:100 },  // BR
    ];

    // Wrong options: same quadrant from 3 other scenes
    const wrongIdxs = shuffle(IMG_SCENES.map((_,i)=>i).filter(i=>i!==sceneIdx)).slice(0,3);
    const optionDefs = shuffle([
        { si: sceneIdx, qi: hiddenIdx },
        ...wrongIdxs.map(si => ({ si, qi: hiddenIdx }))
    ]);
    const correctOptIdx = optionDefs.findIndex(o => o.si === sceneIdx);
    let userAnswer = null;

    const tile = (sc, qi, sz) => {
        const q = quads[qi];
        return `<svg width="${sz}" height="${sz}" viewBox="${q.vx} ${q.vy} 100 100" style="display:block;border-radius:4px;">${sc}</svg>`;
    };

    return {
        title: 'Pick the missing piece to complete the picture',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;
                        background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;
                        border:1.5px solid rgba(255,255,255,0.15);width:fit-content;">
                        ${quads.map((q, i) => `
                            <div style="width:88px;height:88px;display:flex;align-items:center;justify-content:center;
                                ${i===hiddenIdx ? 'background:rgba(99,102,241,0.12);border:2px dashed rgba(99,102,241,0.5);' : ''}">
                                ${i !== hiddenIdx
                                    ? tile(scene, i, 88)
                                    : `<span style="font-size:1.8rem;font-weight:900;color:rgba(99,102,241,0.6);">?</span>`}
                            </div>`).join('')}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.55rem;width:100%;">
                        ${optionDefs.map((opt, i) => `
                            <button class="cg-jig-opt" data-idx="${i}" style="
                                display:flex;align-items:center;justify-content:center;
                                border-radius:10px;background:rgba(255,255,255,0.05);
                                border:1.5px solid rgba(255,255,255,0.1);
                                cursor:pointer;transition:all 0.2s;overflow:hidden;padding:0.5rem;">
                                ${tile(IMG_SCENES[opt.si], opt.qi, 68)}
                            </button>`).join('')}
                    </div>
                </div>`;
            container.querySelectorAll('.cg-jig-opt').forEach(btn => {
                btn.onmouseover = () => { if (!btn.classList.contains('selected')) btn.style.background='rgba(99,102,241,0.18)'; };
                btn.onmouseout  = () => { if (!btn.classList.contains('selected')) btn.style.background='rgba(255,255,255,0.05)'; };
                btn.onclick = () => {
                    container.querySelectorAll('.cg-jig-opt').forEach(b => {
                        b.classList.remove('selected'); b.style.background='rgba(255,255,255,0.05)'; b.style.borderColor='rgba(255,255,255,0.1)';
                    });
                    btn.classList.add('selected');
                    btn.style.background='rgba(99,102,241,0.3)'; btn.style.borderColor='#818cf8';
                    userAnswer = parseInt(btn.dataset.idx);
                };
            });
        },
        verify() { return userAnswer === correctOptIdx; }
    };
}

// ─── Game 26: Broken Tile Finder ──────────────────────────────────────────────
// 3×3 grid of SVG tiles — all look the same EXCEPT one has different colors.
// Click the tile that doesn't match.
export function brokenTileGame() {
    const GRID = 3;
    const normalScene = rnd(IMG_SCENES);
    // "broken" tile = same scene structure but from a visually different scene
    const brokenScene = rnd(IMG_SCENES.filter(s => s !== normalScene));
    const brokenIdx   = Math.floor(Math.random() * (GRID * GRID));
    let userAnswer    = null;

    // render each tile as a zoomed-in random quadrant (same quad for all = consistent)
    const qi     = Math.floor(Math.random() * 4);
    const quads  = [{ vx:0,vy:0 },{ vx:100,vy:0 },{ vx:0,vy:100 },{ vx:100,vy:100 }];
    const q      = quads[qi];
    const tileSVG = (sc) =>
        `<svg width="60" height="60" viewBox="${q.vx} ${q.vy} 100 100" style="display:block;">${sc}</svg>`;

    return {
        title: 'Click the tile that looks DIFFERENT from all the others',
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;">
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:fit-content;">
                        ${Array.from({ length: GRID * GRID }, (_, i) => `
                            <button class="cg-btile" data-idx="${i}" style="
                                width:64px;height:64px;
                                border-radius:8px;overflow:hidden;
                                border:2px solid rgba(255,255,255,0.08);
                                cursor:pointer;transition:all 0.2s;
                                display:flex;align-items:center;justify-content:center;
                                padding:0;background:none;">
                                ${tileSVG(i === brokenIdx ? brokenScene : normalScene)}
                            </button>`).join('')}
                    </div>
                    <div style="font-size:0.68rem;color:rgba(255,255,255,0.3);letter-spacing:0.5px;">One tile has a different colour scheme</div>
                </div>`;
            container.querySelectorAll('.cg-btile').forEach(btn => {
                btn.onmouseover = () => { if (!btn.classList.contains('selected')) btn.style.borderColor='rgba(99,102,241,0.5)'; };
                btn.onmouseout  = () => { if (!btn.classList.contains('selected')) btn.style.borderColor='rgba(255,255,255,0.08)'; };
                btn.onclick = () => {
                    container.querySelectorAll('.cg-btile').forEach(b => {
                        b.classList.remove('selected'); b.style.borderColor='rgba(255,255,255,0.08)'; b.style.background='none';
                    });
                    btn.classList.add('selected');
                    btn.style.borderColor='#818cf8'; btn.style.background='rgba(99,102,241,0.2)';
                    userAnswer = parseInt(btn.dataset.idx);
                };
            });
        },
        verify() { return userAnswer === brokenIdx; }
    };
}

// ─── Game 27: Arrow Direction (Reflex Point) ──────────────────────────────────
export function arrowDirectionGame() {
    const directions = [
        { key: 'arrow_u', label: 'UP',    icon: 'fa-arrow-up' },
        { key: 'arrow_d', label: 'DOWN',  icon: 'fa-arrow-down' },
        { key: 'arrow_l', label: 'LEFT',  icon: 'fa-arrow-left' },
        { key: 'arrow_r', label: 'RIGHT', icon: 'fa-arrow-right' }
    ];
    const target = rnd(directions);
    const options = shuffle([...directions]);
    const correctIdx = options.indexOf(target);
    let userAnswer = null;

    return {
        title: `TAP ${target.label}`,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="padding:2rem; background:rgba(255,255,255,0.05); border:2px solid #6366f1;
                        border-radius:24px; color:#6366f1; filter:drop-shadow(0 0 15px rgba(99,102,241,0.4));">
                        ${SVG_ICONS[target.key].replace('width="48" height="48"','width="80" height="80"')}
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.8rem; width:100%;">
                        ${options.map((d, i) => `
                            <button class="cg-word-opt" data-idx="${i}" style="
                                padding:1.2rem; border-radius:16px;
                                background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
                                color:white; font-family:'Outfit',sans-serif; font-weight:800;
                                font-size:1rem; cursor:pointer; transition:all 0.2s;">
                                <i class="fas ${d.icon}"></i> ${d.label}
                            </button>`).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-word-opt').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    userAnswer = idx;
                    if (userAnswer !== correctIdx) this.isWrong = true;
                    container.querySelectorAll('.cg-word-opt').forEach(b => {
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.background = 'rgba(255,255,255,0.05)';
                    });
                    btn.style.borderColor = '#6366f1';
                    btn.style.background = 'rgba(99,102,241,0.2)';
                };
            });
        },
        verify() { return userAnswer === correctIdx; }
    };
}

// ─── Game 28: Hidden Word Hunt ────────────────────────────────────────────────
export function wordHuntGame() {
    const list = [
        { full: 'TYUISCHOOLMMR', target: 'SCHOOL' },
        { full: 'BNEPLANETVXZ',  target: 'PLANET' },
        { full: 'OWBRIDGEQWER',  target: 'BRIDGE' },
        { full: 'KJDREAMPLM',    target: 'DREAM' },
        { full: 'XCGALAXYBT',    target: 'GALAXY' },
        { full: 'RTFLOWERUI',    target: 'FLOWER' },
        { full: 'MZORANGELK',    target: 'ORANGE' }
    ];
    const item = rnd(list);
    const startIdx = item.full.indexOf(item.target);
    const endIdx   = startIdx + item.target.length - 1;
    
    let selStart = null;
    let selEnd   = null;
    let isDragging = false;

    return {
        title: `FIND: ${item.target}`,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div id="hunt-grid" style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;
                        background:rgba(255,255,255,0.05);padding:1.2rem;border-radius:16px;border:1px solid rgba(255,255,255,0.1);
                        touch-action:none; user-select:none;">
                        ${item.full.split('').map((char, i) => `
                            <div class="cg-hunt-char" data-idx="${i}" style="
                                width:30px;height:42px;display:flex;align-items:center;justify-content:center;
                                font-size:1.3rem;font-weight:900;color:white;border-radius:8px;
                                transition:background 0.1s; pointer-events:none;">
                                ${char}
                            </div>
                        `).join('')}
                    </div>
                    <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:1px;">DRAG ACROSS THE WORD</div>
                </div>`;
            
            const grid = container.querySelector('#hunt-grid');
            const chars = container.querySelectorAll('.cg-hunt-char');

            const updateUI = () => {
                if (selStart === null || selEnd === null) return;
                const s = Math.min(selStart, selEnd);
                const e = Math.max(selStart, selEnd);
                chars.forEach((c, i) => {
                    if (i >= s && i <= e) {
                        c.style.background = '#6366f1';
                        c.style.boxShadow = '0 0 10px rgba(99,102,241,0.4)';
                    } else {
                        c.style.background = '';
                        c.style.boxShadow = '';
                    }
                });
            };

            const getIdx = (e) => {
                const touch = e.touches ? e.touches[0] : e;
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                if (el && el.classList.contains('cg-hunt-char')) return parseInt(el.dataset.idx);
                return null;
            };

            grid.onpointerdown = (e) => {
                const idx = getIdx(e);
                if (idx !== null) {
                    isDragging = true;
                    selStart = idx;
                    selEnd = idx;
                    updateUI();
                    grid.setPointerCapture(e.pointerId);
                }
            };

            grid.onpointermove = (e) => {
                if (!isDragging) return;
                const idx = getIdx(e);
                if (idx !== null && idx !== selEnd) {
                    selEnd = idx;
                    updateUI();
                }
            };

            grid.onpointerup = (e) => {
                if (!isDragging) return;
                isDragging = false;
                grid.releasePointerCapture(e.pointerId);
                
                const s = Math.min(selStart, selEnd);
                const e2 = Math.max(selStart, selEnd);
                if (s !== startIdx || e2 !== endIdx) {
                    this.isWrong = true;
                }
            };
        },
        verify() {
            if (selStart === null || selEnd === null) return false;
            const s = Math.min(selStart, selEnd);
            const e = Math.max(selStart, selEnd);
            return s === startIdx && e === endIdx;
        }
    };
}

// ─── Game 29: Number Flash (Find the Target) ──────────────────────────────────
export function numberFlashGame() {
    const target = Math.floor(Math.random() * 9) + 1; // 1-9
    const pool = [1,2,3,4,5,6,7,8,9];
    const options = shuffle(pool);
    let userAnswer = null;

    return {
        title: ``,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="
                        width:100%; max-width:240px; 
                        background:rgba(255,255,255,0.06); 
                        border:2px solid rgba(255,255,255,0.15);
                        border-radius:20px; 
                        padding:1.5rem; 
                        text-align:center;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                        margin-bottom: 0.5rem;
                    ">
                        <div style="font-size:0.7rem; color:rgba(255,255,255,0.4); letter-spacing:2px; font-weight:900; margin-bottom:0.5rem;">TARGET</div>
                        <div style="font-size:3.5rem; font-weight:900; color:white; font-family:'Outfit'; line-height:1;">${target}</div>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:fit-content; padding:10px;">
                        ${options.map((n) => `
                            <button class="cg-num-btn" data-val="${n}" style="
                                width:75px; height:75px;
                                border-radius:18px;
                                background: rgba(255,255,255,0.06);
                                border: 1.5px solid rgba(255,255,255,0.12);
                                color: white;
                                font-family: 'Outfit', sans-serif;
                                font-weight: 900;
                                font-size: 1.8rem;
                                cursor: pointer;
                                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                            ">
                                ${n}
                            </button>`).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-num-btn').forEach(btn => {
                btn.onclick = () => {
                    userAnswer = parseInt(btn.dataset.val);
                    if (userAnswer !== target) this.isWrong = true;
                };
            });
        },
        verify() { return userAnswer === target; }
    };
}

// ─── Game 30: Green Rush (Avoid Red) ──────────────────────────────────────────
export function greenVsRedGame() {
    const GRID_SIZE = 16;
    let activeIdx = -1;
    let activeColor = 'neutral';
    let userAnswer = null;
    let autoSkipTimer = null;

    const spawn = () => {
        if (userAnswer === 'correct') return;
        
        activeIdx = Math.floor(Math.random() * GRID_SIZE);
        activeColor = Math.random() > 0.4 ? 'green' : 'red';
        
        const cells = document.querySelectorAll('.cg-rush-cell');
        if (!cells.length) return;

        cells.forEach(c => {
            c.style.background = 'rgba(255,255,255,0.03)';
            c.style.boxShadow = 'none';
            c.style.borderColor = 'rgba(255,255,255,0.08)';
            c.classList.remove('active-green', 'active-red');
        });

        const target = cells[activeIdx];
        if (target) {
            target.classList.add(activeColor === 'green' ? 'active-green' : 'active-red');
            if (activeColor === 'green') {
                target.style.background = '#10b981';
                target.style.boxShadow = '0 0 25px rgba(16,185,129,0.5)';
                target.style.borderColor = '#34d399';
            } else {
                target.style.background = '#ef4444';
                target.style.boxShadow = '0 0 25px rgba(239,68,68,0.5)';
                target.style.borderColor = '#f87171';
            }
        }

        if (autoSkipTimer) clearTimeout(autoSkipTimer);
        autoSkipTimer = setTimeout(() => {
            if (!userAnswer) spawn();
        }, 1000);
    };

    return {
        title: 'TAP GREEN — IGNORE RED!',
        render(container) {
            container.innerHTML = `
                <style>
                    @keyframes pulse-active {
                        0% { transform: scale(1); filter: brightness(1); }
                        50% { transform: scale(1.08); filter: brightness(1.2); }
                        100% { transform: scale(1); filter: brightness(1); }
                    }
                    .active-green, .active-red { animation: pulse-active 0.6s ease-in-out infinite; z-index: 10; }
                </style>
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;width:fit-content;padding:10px;">
                        ${Array.from({ length: GRID_SIZE }, (_, i) => `
                            <div class="cg-rush-cell" data-idx="${i}" style="
                                width:55px; height:55px; border-radius:16px;
                                background:rgba(255,255,255,0.03); border:2px solid rgba(255,255,255,0.08);
                                cursor:pointer; transition:all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                                position:relative;
                            "></div>
                        `).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-rush-cell').forEach(cell => {
                cell.addEventListener('mousedown', (e) => {
                    const idx = parseInt(cell.dataset.idx);
                    if (idx === activeIdx) {
                        if (activeColor === 'green') {
                            userAnswer = 'correct';
                            cell.style.transform = 'scale(0.9)';
                        } else {
                            this.isWrong = true;
                            userAnswer = 'wrong';
                        }
                    } else {
                        // Clicking outside the active cell is now ignored or subtle penalty
                        // To keep it "workable", we'll ignore neutral clicks
                    }
                });
            });

            setTimeout(spawn, 300);
        },
        verify() { 
            if (autoSkipTimer) clearTimeout(autoSkipTimer);
            return userAnswer === 'correct'; 
        }
    };
}

// ─── Game 31: Prism Grid (Find Mentioned Color) ────────────────────────────────
export function colorGridGame() {
    const palette = [
        { name:'BLUE',   hex:'#3b82f6' }, { name:'ROSE',   hex:'#f43f5e' },
        { name:'EMERALD',hex:'#10b981' }, { name:'AMBER',  hex:'#f59e0b' },
        { name:'VIOLET', hex:'#8b5cf6' }, { name:'CYAN',   hex:'#06b6d4' },
        { name:'ORANGE', hex:'#f97316' }, { name:'LIME',   hex:'#84cc16' }
    ];
    const target = rnd(palette);
    // Fill a 16-cell grid with a mix, ensuring at least one target
    const gridColors = [target];
    while (gridColors.length < 16) {
        gridColors.push(rnd(palette));
    }
    const options = shuffle(gridColors);
    let userAnswer = null;

    return {
        title: `TAP ALL: ${target.name}`,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.2rem;width:100%;">
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;width:fit-content;">
                        ${options.map((c, i) => `
                            <div class="cg-prism-cell" data-hex="${c.hex}" style="
                                width:50px; height:50px; border-radius:10px;
                                background:${c.hex}; border:2.5px solid transparent;
                                cursor:pointer; transition:all 0.15s;
                                box-shadow: 0 4px 12px ${c.hex}33;
                            "></div>
                        `).join('')}
                    </div>
                </div>`;
            
            container.querySelectorAll('.cg-prism-cell').forEach(cell => {
                cell.onclick = () => {
                    const hex = cell.dataset.hex;
                    if (hex === target.hex) {
                        cell.style.borderColor = 'white';
                        cell.style.transform = 'scale(0.9)';
                        cell.style.opacity = '0.3';
                        cell.classList.add('found');
                        // Check if all targets are found
                        const remaining = [...container.querySelectorAll('.cg-prism-cell')].filter(c => c.dataset.hex === target.hex && !c.classList.contains('found'));
                        if (remaining.length === 0) userAnswer = 'done';
                    } else {
                        this.isWrong = true;
                    }
                };
            });
        },
        verify() { return userAnswer === 'done'; }
    };
}

// ─── Game 32: Gesture Swipe (Swipe Direction) ────────────────────────────────
export function swipeDirectionGame() {
    const directions = [
        { key: 'arrow_u', label: 'UP',    angle: 0,    icon: 'fa-chevron-up' },
        { key: 'arrow_d', label: 'DOWN',  angle: 180,  icon: 'fa-chevron-down' },
        { key: 'arrow_l', label: 'LEFT',  angle: 270,  icon: 'fa-chevron-left' },
        { key: 'arrow_r', label: 'RIGHT', angle: 90,   icon: 'fa-chevron-right' }
    ];
    const target = rnd(directions);
    let startX, startY;
    let swipedDir = null;

    return {
        title: `SWIPE OR TAP ${target.label}`,
        render(container) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%;">
                    <div id="swipe-zone" style="
                        width:150px; height:150px; border-radius:50%;
                        background:rgba(255,255,255,0.05); border:2px dashed rgba(99,102,241,0.4);
                        display:flex; align-items:center; justify-content:center;
                        touch-action:none; position:relative; cursor:grab;">
                        <div style="color:#6366f1; transform:rotate(${target.angle}deg); filter:drop-shadow(0 0 10px rgba(99,102,241,0.5));">
                            ${SVG_ICONS['arrow_u'].replace('width="48" height="48"','width="70" height="70"')}
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; max-width: 200px;">
                        <div></div>
                        <button class="cg-arrow-opt" data-dir="UP" style="padding:12px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white;"><i class="fas fa-chevron-up"></i></button>
                        <div></div>
                        <button class="cg-arrow-opt" data-dir="LEFT" style="padding:12px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white;"><i class="fas fa-chevron-left"></i></button>
                        <button class="cg-arrow-opt" data-dir="DOWN" style="padding:12px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white;"><i class="fas fa-chevron-down"></i></button>
                        <button class="cg-arrow-opt" data-dir="RIGHT" style="padding:12px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white;"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>`;
            
            const zone = container.querySelector('#swipe-zone');
            
            zone.onpointerdown = (e) => {
                startX = e.clientX;
                startY = e.clientY;
                zone.setPointerCapture(e.pointerId);
                zone.style.cursor = 'grabbing';
            };

            zone.onpointerup = (e) => {
                zone.releasePointerCapture(e.pointerId);
                zone.style.cursor = 'grab';
                const diffX = e.clientX - startX;
                const diffY = e.clientY - startY;
                const minDist = 30;
                let dir = null;
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (Math.abs(diffX) > minDist) dir = diffX > 0 ? 'RIGHT' : 'LEFT';
                } else {
                    if (Math.abs(diffY) > minDist) dir = diffY > 0 ? 'DOWN' : 'UP';
                }
                if (dir) {
                    swipedDir = dir;
                    if (swipedDir !== target.label) this.isWrong = true;
                }
            };

            container.querySelectorAll('.cg-arrow-opt').forEach(btn => {
                btn.onclick = () => {
                    swipedDir = btn.dataset.dir;
                    if (swipedDir !== target.label) this.isWrong = true;
                };
            });
        },
        verify() { return swipedDir === target.label; }
    };
}

// ─── Game Selector ────────────────────────────────────────────────────────────
export function getRandomGame() {
    const games = [
        imageEqualityGame, colorWordGame, numberComparisonGame, visualMemoryGame,
        oddOneOutGame, shapeSilhouetteGame, dotCounterGame, patternSequenceGame,
        vectorPathGame, arrowDirectionGame, shapeMathGame, sizeComparisonGame,
        rotationMatchGame, countByShapeGame,
        wordUnscrambleGame, missingLetterGame, numberSequenceGame,
        equationSolverGame, rhymeFinderGame, anagramCheckGame,
        jigsawQuadrantGame, wordHuntGame,
        numberFlashGame, greenVsRedGame, swipeDirectionGame
    ];
    return rnd(games)();
}
