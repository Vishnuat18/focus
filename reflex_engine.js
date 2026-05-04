import { GAME_MAP } from "./smackkiq.js";

// ─── Game State ───────────────────────────────────────────────────────────────
let gameState = {
    mode: null, // 'endless', 'focus', 'random'
    score: 0,
    highScores: {},
    timer: 0,
    isActive: false,
    currentLevel: 1,
    gameInstance: null,
    focusGameId: null
};

const UI = {
    area: document.getElementById('reflex-game-area'),
    overlay: document.getElementById('reflex-overlay'),
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    score: document.getElementById('current-score'),
    bestScore: document.getElementById('best-score'),
    timerContainer: document.getElementById('timer-container'),
    timer: document.getElementById('game-timer'),
    flash: document.getElementById('flash-overlay'),
    finalScore: document.getElementById('final-score'),
    newBest: document.getElementById('new-best-score'),
    bestBox: document.getElementById('high-score-box'),
    instructionScreen: document.getElementById('instruction-screen'),
    instrGameName: document.getElementById('instr-game-name'),
    instrText: document.getElementById('instr-text'),
    startGameBtn: document.getElementById('start-game-btn'),
    loadingScreen: document.getElementById('loading-screen')
};

// ─── Sounds (Subtle) ──────────────────────────────────────────────────────────
const SOUNDS = {
    success: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'
};

function playSound(type) {
    try {
        const audio = new Audio(SOUNDS[type]);
        audio.volume = 0.2;
        audio.play().catch(() => {});
    } catch(e) {}
}

// ─── Core Loop ────────────────────────────────────────────────────────────────

// Delegated Listener for Reflex Input
UI.area?.addEventListener('click', (e) => {
    if (!gameState.isActive) return;
    
    const selectors = '.cg-choice-btn, .cg-color-btn, .cg-num-btn, .cg-mem-cell, .cg-shape-opt, .cg-pixel-cell, .cg-word-opt, .cg-word-btn, .cg-jig-opt, .cg-btile, .cg-dot-opt, .cg-odd-cell, .cg-arrow-opt, .cg-vector-opt, .cg-size-btn, .cg-rot-btn, .cg-math-opt';
    const target = e.target.closest(selectors);
    
    if (target) {
        setTimeout(() => {
            if (gameState.gameInstance) {
                handleResult(gameState.gameInstance.verify(), gameState.gameInstance);
            }
        }, 0);
    }
});

window.prepareGame = async function(mode, gameId = null) {
    gameState.mode = mode;
    gameState.focusGameId = gameId !== null ? parseInt(gameId) : null;
    
    UI.overlay.classList.add('active');
    UI.loadingScreen.style.display = 'none';
    UI.startScreen.style.display = 'none';
    UI.gameOverScreen.style.display = 'none';
    UI.instructionScreen.style.display = 'block';

    if (mode === 'focus' && gameState.focusGameId !== null) {
        const gData = GAME_MAP.find(g => g.id === gameState.focusGameId);
        if (gData) {
            UI.instrGameName.textContent = gData.name;
            document.getElementById('instr-icon').innerHTML = `<i class="fas ${gData.icon}"></i>`;
            const temp = gData.fn();
            UI.instrText.textContent = temp.title || "Solve the challenge as fast as possible!";
        }
    } else {
        UI.instrGameName.textContent = mode === 'endless' ? "Endless Mode" : "Random Chaos";
        document.getElementById('instr-icon').innerHTML = `<i class="fas ${mode === 'endless' ? 'fa-infinity' : 'fa-random'}"></i>`;
        UI.instrText.textContent = mode === 'endless' 
            ? "Survive as long as possible. One mistake and it's over!" 
            : "A rapid-fire sequence of random challenges. Stay focused!";
    }
};

UI.startGameBtn.onclick = () => {
    startReflexGame(gameState.mode, gameState.focusGameId);
};

window.startReflexGame = async function(mode, gameId = null) {
    try {
        gameState.mode = mode;
        gameState.score = 0;
        gameState.isActive = true;
        gameState.currentLevel = 1;
        gameState.focusGameId = gameId !== null ? parseInt(gameId) : null;

        await loadHighScore();

        UI.overlay.classList.remove('active');
        UI.startScreen.style.display = 'none';
        UI.instructionScreen.style.display = 'none';
        UI.gameOverScreen.style.display = 'none';
        UI.score.textContent = "0";

        gameState.timer = 30.0;
        UI.timerContainer.style.display = 'block';
        startTimer();

        loadNextChallenge();
    } catch (err) {
        console.error("Failed to start reflex game:", err);
    }
};

async function updateStartMenuHighScores() {
    const saved = localStorage.getItem('focus_reflex_scores');
    const scores = saved ? JSON.parse(saved) : {};
    
    if (document.getElementById('best-endless')) 
        document.getElementById('best-endless').textContent = scores['best_endless'] || 0;
    if (document.getElementById('best-focus')) 
        document.getElementById('best-focus').textContent = scores['best_focus_null'] || 0;
    if (document.getElementById('best-random')) 
        document.getElementById('best-random').textContent = scores['best_random'] || 0;
}

function loadNextChallenge() {
    if (!gameState.isActive) return;

    UI.area.style.transform = 'scale(0.95)';
    UI.area.style.opacity = '0.5';

    setTimeout(() => {
        try {
            UI.area.innerHTML = "";
            let gData;
            const reflexPool = GAME_MAP.filter(g => g.reflex);
            
            if (gameState.mode === 'focus' && gameState.focusGameId !== null) {
                gData = GAME_MAP.find(g => g.id === gameState.focusGameId);
            } else {
                gData = reflexPool[Math.floor(Math.random() * reflexPool.length)];
            }

            if (!gData) throw new Error("No game data found");

            const game = gData.fn();
            gameState.gameInstance = game;
            game.render(UI.area);

            UI.area.style.transform = 'scale(1)';
            UI.area.style.opacity = '1';
        } catch (err) {
            console.error("Error loading challenge:", err);
            loadNextChallenge(); 
        }
    }, 10);
}

function handleResult(isCorrect, game) {
    if (!gameState.isActive) return;

    if (isCorrect) {
        gameState.score++;
        UI.score.textContent = gameState.score;
        playSound('success');
        flashScreen('success');
        loadNextChallenge();
    } else if (game && game.isWrong) {
        playSound('error');
        flashScreen('error');
        shakeGameArea();
        if (navigator.vibrate) navigator.vibrate(200);
        loadNextChallenge();
    }
}

function shakeGameArea() {
    UI.area.classList.add('shake');
    setTimeout(() => UI.area.classList.remove('shake'), 400);
}

function flashScreen(type) {
    if (!UI.flash) return;
    UI.flash.className = type === 'success' ? 'flash-success' : 'flash-error';
    setTimeout(() => { if (UI.flash) UI.flash.className = ''; }, 200);
}

function startTimer() {
    if (window.reflexTimer) clearInterval(window.reflexTimer);
    window.reflexTimer = setInterval(() => {
        if (!gameState.isActive || (gameState.mode !== 'focus' && gameState.mode !== 'random' && gameState.mode !== 'endless')) {
            // Note: Endless mode might not use this timer, but for now we follow the 30s Blitz style as requested earlier
        }

        gameState.timer -= 0.1;
        if (UI.timer) UI.timer.textContent = gameState.timer.toFixed(1);
        
        if (gameState.timer <= 5) UI.timer?.classList.add('warning');
        
        if (gameState.timer <= 0) {
            gameState.timer = 0;
            if (UI.timer) UI.timer.textContent = "0.0";
            clearInterval(window.reflexTimer);
            endGame("Time's Up!");
        }
    }, 100);
}

async function endGame(msg = "Game Over") {
    gameState.isActive = false;
    if (window.reflexTimer) clearInterval(window.reflexTimer);
    playSound('error');
    flashScreen('error');

    const bestKey = gameState.mode === 'focus' ? `best_focus_${gameState.focusGameId}` : `best_${gameState.mode}`;
    let isNewBest = false;
    
    if (gameState.score > (gameState.highScores[bestKey] || 0)) {
        gameState.highScores[bestKey] = gameState.score;
        isNewBest = true;
        await saveHighScore();
    }

    UI.overlay.classList.add('active');
    UI.startScreen.style.display = 'none';
    UI.gameOverScreen.style.display = 'block';
    
    document.getElementById('result-title').textContent = msg;
    document.getElementById('final-score').textContent = gameState.score;
    
    if (isNewBest) {
        UI.bestBox.style.display = 'block';
        UI.newBest.textContent = gameState.score;
        document.getElementById('result-icon').textContent = "🏆";
    } else {
        UI.bestBox.style.display = 'none';
        document.getElementById('result-icon').textContent = "💀";
    }
}

window.restartReflexGame = function() {
    startReflexGame(gameState.mode, gameState.focusGameId);
};

window.exitToMenu = function() {
    window.location.href = "smackKIQ.html";
};

// ─── Data Management ─────────────────────────────────────────────────────────
async function saveHighScore() {
    localStorage.setItem('focus_reflex_scores', JSON.stringify(gameState.highScores));
}

async function loadHighScore() {
    const saved = localStorage.getItem('focus_reflex_scores');
    if (saved) {
        gameState.highScores = JSON.parse(saved);
    }
    const key = gameState.mode === 'focus' ? `best_focus_${gameState.focusGameId}` : `best_${gameState.mode}`;
    UI.bestScore.textContent = gameState.highScores[key] || 0;
}

// ─── Initialization ──────────────────────────────────────────────────────────
function initReflexGame() {
    UI.overlay.classList.add('active');
    UI.loadingScreen.style.display = 'flex';
    UI.startScreen.style.display = 'none';
    UI.instructionScreen.style.display = 'none';
    UI.gameOverScreen.style.display = 'none';

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const gameId = params.get('gameId');

    setTimeout(() => {
        if (mode) {
            prepareGame(mode, gameId !== null ? parseInt(gameId) : null);
        } else {
            UI.loadingScreen.style.display = 'none';
            UI.startScreen.style.display = 'block';
            updateStartMenuHighScores();
        }
    }, 600);
}

initReflexGame();
