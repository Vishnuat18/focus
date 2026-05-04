import { auth, fs, doc, getDoc, updateDoc, increment } from "./firebase-config.js";
import { 
    imageEqualityGame, colorWordGame, numberComparisonGame, visualMemoryGame,
    oddOneOutGame, shapeSilhouetteGame, dotCounterGame, patternSequenceGame,
    vectorPathGame, shapeMathGame, sizeComparisonGame, rotationMatchGame,
    countByShapeGame, wordUnscrambleGame,
    missingLetterGame, numberSequenceGame, equationSolverGame,
    rhymeFinderGame, anagramCheckGame, jigsawQuadrantGame, wordHuntGame,
    numberFlashGame, greenVsRedGame, swipeDirectionGame
} from "./captcha_games.js";

export const GAME_MAP = [
    { id: 0,  name: "Mirror Match",     fn: imageEqualityGame,    icon: "fa-columns", reflex: true },
    { id: 1,  name: "Ink Deception",    fn: colorWordGame,        icon: "fa-palette", reflex: true },
    { id: 2,  name: "Scale Master",     fn: numberComparisonGame, icon: "fa-balance-scale", reflex: true },
    { id: 3,  name: "Mind Scan",        fn: visualMemoryGame,     icon: "fa-brain", reflex: true },
    { id: 4,  name: "Glitch Hunter",    fn: oddOneOutGame,        icon: "fa-microchip", reflex: true },
    { id: 5,  name: "Ghost Trace",      fn: shapeSilhouetteGame,  icon: "fa-ghost", reflex: true },
    { id: 6,  name: "Nova Pulse",       fn: dotCounterGame,       icon: "fa-sun", reflex: true },
    { id: 7,  name: "Vector Path",      fn: vectorPathGame,       icon: "fa-project-diagram", reflex: true },
    { id: 8,  name: "Geometry Core",    fn: shapeMathGame,        icon: "fa-shapes", reflex: true },
    { id: 9,  name: "Mega Tiny",        fn: sizeComparisonGame,   icon: "fa-compress-arrows-alt", reflex: true },
    { id: 10, name: "Orbit Spin",       fn: rotationMatchGame,    icon: "fa-sync", reflex: true },
    { id: 12, name: "Fusion Count",     fn: countByShapeGame,     icon: "fa-calculator", reflex: true },
    { id: 14, name: "Word Scramble",    fn: wordUnscrambleGame,   icon: "fa-font", reflex: true },
    { id: 16, name: "Missing Piece",    fn: missingLetterGame,    icon: "fa-minus-square", reflex: true },
    { id: 17, name: "Digit Chain",      fn: numberSequenceGame,   icon: "fa-sort-numeric-down", reflex: true },
    { id: 18, name: "Quick Math",       fn: equationSolverGame,   icon: "fa-divide", reflex: true },
    { id: 19, name: "Rhyme Time",       fn: rhymeFinderGame,      icon: "fa-music", reflex: true },
    { id: 20, name: "Anagram Pro",      fn: anagramCheckGame,     icon: "fa-exchange-alt", reflex: true },
    { id: 23, name: "Jigsaw Rush",      fn: jigsawQuadrantGame,   icon: "fa-puzzle-piece", reflex: true },
    { id: 26, name: "Word Hunt",        fn: wordHuntGame,         icon: "fa-search", reflex: true },
    { id: 27, name: "Number Flash",     fn: numberFlashGame,      icon: "fa-hashtag", reflex: true },
    { id: 28, name: "Green Rush",       fn: greenVsRedGame,       icon: "fa-traffic-light", reflex: true },
    { id: 29, name: "Swift Swipe",      fn: swipeDirectionGame,   icon: "fa-hand-point-right", reflex: true }
];

let currentGame = null;
let currentPoints = 0;

export async function initSmackKIQ() {
    console.log("Initializing smackKIQ Dashboard...");
    const grid = document.getElementById('reflex-game-grid') || document.querySelector('.game-grid');
    
    if (!grid) {
        console.error("Game grid container not found!");
        return;
    }

    // Load points locally for guest experience
    const localPoints = localStorage.getItem('focus_xp') || 0;
    currentPoints = parseInt(localPoints);
    updatePointsUI();

    // Render Grid
    try {
        grid.innerHTML = GAME_MAP.map(g => `
            <div class="game-card glass" onclick="window.location.href='reflex_game.html?mode=focus&gameId=${g.id}'">
                <div class="blitz-btn" onclick="event.stopPropagation(); window.location.href='reflex_game.html?mode=focus&gameId=${g.id}'" title="30s Blitz Mode">
                    <i class="fas fa-bolt"></i>
                </div>
                <i class="fas ${g.icon} main-icon"></i>
                <h4>${g.name}</h4>
                <div class="point-tag">+10 XP</div>
                <div class="mobile-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error rendering game grid:", err);
    }

    // Modal Events
    document.getElementById('cg-close')?.addEventListener('click', closeKIQModal);
    document.getElementById('cg-verify-btn')?.addEventListener('click', verifyKIQGame);
}

let currentGameId = null;

window.playKIQGame = function(id) {
    const g = GAME_MAP.find(x => x.id === id);
    if (!g) return;
    
    currentGameId = id;
    const backdrop = document.getElementById('captcha-backdrop');
    const gameArea = document.getElementById('cg-game-area');
    const label = document.getElementById('cg-game-label');

    backdrop.classList.add('open');
    label.textContent = "Challenge: " + g.name;

    gameArea.innerHTML = "";
    currentGame = g.fn();
    currentGame.render(gameArea);
};

function closeKIQModal() {
    document.getElementById('captcha-backdrop')?.classList.remove('open');
}

async function verifyKIQGame() {
    const msg = document.getElementById('cg-msg');
    const modal = document.getElementById('captcha-modal');
    
    if (currentGame && currentGame.verify()) {
        msg.textContent = "✔ Correct! +10 XP earned.";
        msg.className = "success";
        
        currentPoints += 10;
        localStorage.setItem('focus_xp', currentPoints);
        updatePointsUI();

        setTimeout(closeKIQModal, 1500);
    } else {
        msg.textContent = "✖ Incorrect. Try again!";
        msg.className = "error";
        modal.classList.add('shake');
        setTimeout(() => modal.classList.remove('shake'), 500);
    }
}

function updatePointsUI() {
    const pVal = document.getElementById('points-val');
    if (pVal) pVal.textContent = currentPoints;
}

initSmackKIQ();
