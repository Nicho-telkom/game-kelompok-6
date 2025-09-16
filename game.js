// ====== TicTacToe Full JS (with sound + background music) ======

let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let player1Name = 'Player 1';
let player2Name = 'Player 2';
let player1Score = 0;
let player2Score = 0;
let draws = 0;

const playWithPlayerBtn = document.getElementById("playWithPlayer");
const playWithBotBtn = document.getElementById("playWithBot");
const difficultyOptions = document.getElementById("difficultyOptions");
const botOptions = document.getElementById("botOptions");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const startBotGameBtn = document.getElementById("startBotGameBtn");

let selectedDifficulty = null;
let botDifficulty = null;

// Elements
const cells = document.querySelectorAll('[data-cell]');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const winningMessage = document.getElementById('winning-message');
const restartButton = document.getElementById('restartButton');
const endSessionButton = document.getElementById('endSessionButton');
const startButton = document.getElementById('startButton');
const loginScreen = document.getElementById('loginScreen');
const gameScreen = document.getElementById('gameScreen');
const modeModal = document.getElementById('modeModal');
const welcomePopup = document.getElementById('welcomePopup');
const startGameBtn = document.getElementById('startGameBtn');
const chooseThemeBtn = document.getElementById('chooseThemeBtn');
const achievementNotification = document.getElementById('achievementNotification');
const backButton = document.getElementById('backButton');

// Welcome / Theme / UI initial
window.onload = () => {
  if (welcomePopup) welcomePopup.style.display = 'flex';
  if (modeModal) modeModal.style.display = 'none';
  if (loginScreen) loginScreen.style.display = 'none';
  if (gameScreen) gameScreen.style.display = 'none';
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
};

// ===== Achievements / State =====
let player1WinStreak = 0;
let player2WinStreak = 0;
let achievements = {
  fiveWins: { player1: false, player2: false, message: "5 Kemenangan!" },
  tenWins: { player1: false, player2: false, message: "10 Kemenangan!" },
  firstDraw: { achieved: false, message: "Seri Pertama!" },
  threeWinStreak: { player1: false, player2: false, message: "3 Kemenangan Beruntun!" },
  fiveWinStreak: { player1: false, player2: false, message: "5 Kemenangan Beruntun!" }
};

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// ====== SOUND: helper + background music support ======

// Try to get audio element by id; fallback to new Audio() using guessed filename (.wav first, then .mp3)
function getAudioByIdOrCreate(id) {
  let el = document.getElementById(id);
  if (el) return el;

  // fallback guess filenames (prefer .wav)
  const name = id.replace(/^sound/i, '').toLowerCase(); // e.g., "soundPlace" -> "place"
  const wavPath = `${name}.wav`;
  const mp3Path = `${name}.mp3`;

  // create Audio and try .wav (browser will handle if missing with error)
  try {
    const audio = new Audio(wavPath);
    // don't auto-play here; return audio object
    return audio;
  } catch (e) {
    return new Audio(mp3Path);
  }
}

// Play sound by id (supports both <audio id="soundPlace"> in HTML or fallback to file "place.wav")
function playSound(id) {
  try {
    const el = getAudioByIdOrCreate(id);
    if (!el) return;
    // some audio objects created dynamically don't support currentTime before loading; try/catch
    try { el.currentTime = 0; } catch (err) {}
    // play returns a promise; ignore errors (e.g., blocked autoplay) because most sounds happen after user click
    el.play().catch(() => {});
  } catch (err) {
    // silent fail
    // console.log("Play sound error:", err);
  }
}

// Background music: attempt to use <audio id="backgroundMusic"> if present, else create Audio('background.mp3')
let backgroundMusic = (function() {
  const el = document.getElementById('backgroundMusic');
  if (el) {
    el.loop = true;
    // default volume if not set
    if (typeof el.volume === 'number') el.volume = 0.45;
    return el;
  } else {
    // fallback audio object (user must have background.mp3 or background.wav in same folder)
    const a = new Audio('background.mp3');
    a.loop = true;
    a.volume = 0.45;
    return a;
  }
})();

let backgroundPlaying = false;

function startBackgroundMusic() {
  if (!backgroundMusic) return;
  backgroundMusic.play().catch(() => {
    // autoplay may be blocked until user interacts; ignore
  });
  backgroundPlaying = true;
}

function pauseBackgroundMusic() {
  if (!backgroundMusic) return;
  try { backgroundMusic.pause(); } catch (e) {}
  backgroundPlaying = false;
}

function toggleBackgroundMusic() {
  if (backgroundPlaying) pauseBackgroundMusic();
  else startBackgroundMusic();
}

// If there's a toggle button in HTML with id="toggleMusic", hook it
const toggleMusicBtn = document.getElementById('toggleMusic');
if (toggleMusicBtn) {
  toggleMusicBtn.addEventListener('click', () => {
    playSound("soundClick");
    toggleBackgroundMusic();
    // optional UI feedback: toggle active class
    toggleMusicBtn.classList.toggle('muted', !backgroundPlaying);
  });
}

// ====== UI event bindings (set once, avoid duplicates) ======

// Mode buttons
if (playWithPlayerBtn) {
  playWithPlayerBtn.addEventListener("click", () => {
    playSound("soundClick");
    if (modeModal) modeModal.style.display = "none";
    if (loginScreen) loginScreen.style.display = "flex";
    player2Name = 'Player 2';
    const p2input = document.getElementById('player2');
    if (p2input) p2input.value = 'Player 2';
  });
}
if (playWithBotBtn) {
  playWithBotBtn.addEventListener("click", () => {
    playSound("soundClick");
    if (difficultyOptions) difficultyOptions.style.display = "flex";
    if (botOptions) botOptions.style.display = "none";
  });
}
difficultyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    playSound("soundClick");
    selectedDifficulty = btn.dataset.difficulty;
    if (botOptions) botOptions.style.display = "flex";
  });
});
if (startBotGameBtn) {
  startBotGameBtn.addEventListener("click", () => {
    playSound("soundClick");
    const playerName = document.getElementById("botPlayerName").value || "Player";
    const botName = `Bot (${selectedDifficulty})`;

    player1Name = playerName;
    player2Name = "Bot";
    botDifficulty = selectedDifficulty;

    const p1NameElem = document.getElementById("player1Name");
    const p2NameElem = document.getElementById("player2Name");
    if (p1NameElem) p1NameElem.textContent = player1Name;
    if (p2NameElem) p2NameElem.textContent = botName;

    if (modeModal) modeModal.style.display = "none";
    if (gameScreen) gameScreen.style.display = "flex";
    initializeGame();
  });
}

// Welcome / theme
if (startGameBtn) {
  startGameBtn.addEventListener('click', () => {
    playSound("soundClick");
    if (welcomePopup) welcomePopup.style.display = 'none';
    if (modeModal) modeModal.style.display = 'flex';
  });
}
if (chooseThemeBtn) {
  chooseThemeBtn.addEventListener('click', () => {
    playSound("soundClick");
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}
const toggleThemeBtn = document.getElementById('toggleTheme');
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener('click', () => {
    playSound("soundClick");
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

// Start PvP button
if (startButton) {
  startButton.addEventListener('click', () => {
    playSound("soundClick");
    player1Name = document.getElementById('player1').value || 'Player 1';
    if (player2Name !== "Bot") {
      player2Name = document.getElementById('player2').value || 'Player 2';
    }
    const p1NameElem = document.getElementById('player1Name');
    const p2NameElem = document.getElementById('player2Name');
    if (p1NameElem) p1NameElem.textContent = player1Name;
    if (p2NameElem) p2NameElem.textContent = player2Name;
    if (loginScreen) loginScreen.style.display = 'none';
    if (gameScreen) gameScreen.style.display = 'flex';
    initializeGame();
  });
}

// Back button
if (backButton) {
  backButton.addEventListener('click', () => {
    playSound("soundClick");
    clearInterval(timerInterval);
    resetBoardOnly();
    if (gameScreen) gameScreen.style.display = 'none';
    if (modeModal) modeModal.style.display = 'flex';
    pauseBackgroundMusic();
  });
}

// Restart & End Session listeners (only added once)
if (restartButton) {
  restartButton.addEventListener('click', () => {
    playSound("soundClick");
    restartGame();
  });
}
if (endSessionButton) {
  endSessionButton.addEventListener('click', () => {
    playSound("soundClick");
    endSession();
  });
}

// ====== Main game functions ======

function initializeGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  if (winningMessage) winningMessage.textContent = '';
  const afterWinElem = document.getElementById('afterWinButtons');
  if (afterWinElem) afterWinElem.style.display = 'none';

  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning', 'x', 'o');
    // ensure single listener - remove then add with once:true
    cell.removeEventListener('click', handleCellClick);
    cell.addEventListener('click', handleCellClick, { once: true });
  });

  updateDisplay();
  showAchievement({ player1: player1Score, player2: player2Score, seri: draws });
  const progress = document.getElementById('timerProgressBar');
  if (progress) progress.style.width = '100%';

  // start background music when game starts (try/catch for autoplay block)
  startBackgroundMusic();
}

function handleCellClick(e) {
  const cell = e.target;
  const cellIndex = Array.from(cells).indexOf(cell);
  if (board[cellIndex] !== '' || !gameActive) return;

  board[cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());

  // sound when placing symbol
  playSound("soundPlace");

  checkResult();
}

function checkResult() {
  let roundWon = false;
  let winningCells = [];
  for (let [a, b, c] of winConditions) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      winningCells = [a, b, c];
      break;
    }
  }

  if (roundWon) {
    gameActive = false;
    clearInterval(timerInterval);
    const winner = currentPlayer === 'X' ? player1Name : player2Name;
    if (winningMessage) winningMessage.textContent = `🎉 ${winner} Menang!`;
    const afterWinElem = document.getElementById('afterWinButtons');
    if (afterWinElem) afterWinElem.style.display = 'flex';

    // play win sound
    playSound("soundWin");

    if (currentPlayer === 'X') {
      player1Score++;
      const el = document.getElementById('player1Score');
      if (el) el.textContent = player1Score;
      player1WinStreak++; player2WinStreak = 0;
    } else {
      player2Score++;
      const el = document.getElementById('player2Score');
      if (el) el.textContent = player2Score;
      player2WinStreak++; player1WinStreak = 0;
    }

    winningCells.forEach(i => cells[i].classList.add('winning'));
    checkAchievements();
    showAchievement({ player1: player1Score, player2: player2Score, seri: draws });
    // keep background music playing (optional) - do not stop automatically on win
    return;
  }

  if (!board.includes('')) {
    gameActive = false;
    clearInterval(timerInterval);
    if (winningMessage) winningMessage.textContent = '🤝 Permainan Seri!';
    const afterWinElem = document.getElementById('afterWinButtons');
    if (afterWinElem) afterWinElem.style.display = 'flex';

    // play draw sound
    playSound("soundDraw");

    draws++;
    const drawEl = document.getElementById('draws');
    if (drawEl) drawEl.textContent = draws;
    player1WinStreak = 0; player2WinStreak = 0;
    checkAchievements();
    showAchievement({ player1: player1Score, player2: player2Score, seri: draws });
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateDisplay();

  if (player2Name === "Bot" && gameActive && currentPlayer === "O") {
    setTimeout(botMove, 500);
  }
}

function botMove() {
  let index;
  if (botDifficulty === 'easy') {
    let empty = [...cells].filter((c, i) => board[i] === '');
    if (!empty.length) return;
    index = Array.from(cells).indexOf(empty[Math.floor(Math.random() * empty.length)]);
  } else if (botDifficulty === 'medium') {
    index = getWinningMove('O');
    if (index === -1) index = getWinningMove('X');
    if (index === -1) {
      let empty = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
      index = empty[Math.floor(Math.random() * empty.length)];
    }
  } else if (botDifficulty === 'hard') {
    index = getBestMove();
  }
  if (index === undefined || board[index] !== '') return;
  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  cells[index].classList.add(currentPlayer.toLowerCase());
  cells[index].removeEventListener('click', handleCellClick);

  // bunyi pas bot taruh simbol
  playSound("soundPlace");

  checkResult();
}

function getWinningMove(p) {
  for (let [a, b, c] of winConditions) {
    let vals = [board[a], board[b], board[c]];
    if (vals.filter(v => v === p).length === 2 && vals.includes('')) {
      return [a, b, c].find(i => board[i] === '');
    }
  }
  return -1;
}

function getBestMove() {
  let best = -Infinity, move;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > best) { best = score; move = i; }
    }
  }
  return move;
}

function minimax(bd, depth, isMax) {
  let res = checkWinnerForMinimax(bd);
  if (res !== null) {
    if (res === 'O') return 10 - depth;
    else if (res === 'X') return depth - 10;
    else return 0;
  }
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < bd.length; i++) {
      if (bd[i] === '') {
        bd[i] = 'O';
        let score = minimax(bd, depth + 1, false);
        bd[i] = ''; best = Math.max(score, best);
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < bd.length; i++) {
      if (bd[i] === '') {
        bd[i] = 'X';
        let score = minimax(bd, depth + 1, true);
        bd[i] = ''; best = Math.min(score, best);
      }
    }
    return best;
  }
}

function checkWinnerForMinimax(bd) {
  for (let [a, b, c] of winConditions) {
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return bd[a];
  }
  if (!bd.includes('')) return 'draw';
  return null;
}

function updateDisplay() {
  if (currentPlayerDisplay) currentPlayerDisplay.textContent = currentPlayer === 'X' ? player1Name : player2Name;
  const indicator = currentPlayerDisplay ? currentPlayerDisplay.closest('.turn-indicator') : null;
  if (indicator) {
    if (currentPlayer === 'X') indicator.classList.remove('o'); else indicator.classList.add('o');
  }
  startTurnTimer();
}

// Timer
let timerInterval;
let timerDuration = 10;
const timerCount = document.getElementById('timerCount');
const timerProgressBar = document.getElementById('timerProgressBar');

function startTurnTimer() {
  clearInterval(timerInterval);
  let timeLeft = timerDuration;
  if (timerCount) timerCount.textContent = timeLeft;
  if (timerProgressBar) timerProgressBar.style.width = '100%';
  if (timerProgressBar) timerProgressBar.style.transition = `width ${timerDuration}s linear`;
  // force reflow for transition
  if (timerProgressBar) void timerProgressBar.offsetWidth;
  if (timerProgressBar) timerProgressBar.style.width = '0%';

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timerCount) timerCount.textContent = timeLeft;
    if (timeLeft <= 0) { clearInterval(timerInterval); handleTimeout(); }
  }, 1000);
}

function restartGame() {
  // restart keeps scores, resets board
  initializeGame();
}

function endSession() {
  clearInterval(timerInterval);
  player1Score = 0; player2Score = 0; draws = 0;
  const p1El = document.getElementById('player1Score');
  const p2El = document.getElementById('player2Score');
  const dEl = document.getElementById('draws');
  if (p1El) p1El.textContent = 0;
  if (p2El) p2El.textContent = 0;
  if (dEl) dEl.textContent = 0;
  resetBoardOnly();
  if (gameScreen) gameScreen.style.display = 'none';
  if (modeModal) modeModal.style.display = 'flex';
  pauseBackgroundMusic();
}

function handleTimeout() {
  if (!gameActive) return;
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateDisplay();
  startTurnTimer();
  if (player2Name === "Bot" && gameActive && currentPlayer === "O") {
    setTimeout(botMove, 500);
  }
}

function resetBoardOnly() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true; currentPlayer = 'X';
  if (winningMessage) winningMessage.textContent = '';
  const afterWinElem = document.getElementById('afterWinButtons');
  if (afterWinElem) afterWinElem.style.display = 'none';
  player1WinStreak = 0; player2WinStreak = 0;
  cells.forEach(c => { c.textContent = ''; c.classList.remove('winning','x','o'); });
}

// Achievements + UI helpers
function showAchievement(score) {
  const list = document.getElementById('achievementList');
  if (!list) return;
  list.innerHTML = `
    <li>${player1Name}: <strong class="score-value">${score.player1}</strong> poin</li>
    <li>${player2Name}: <strong class="score-value">${score.player2}</strong> poin</li>
    <li>Seri: <strong class="score-value">${score.seri}</strong></li>`;
}

function checkAchievements() {
  if (draws === 1 && !achievements.firstDraw.achieved) {
    achievements.firstDraw.achieved = true;
    showAchievementNotification(achievements.firstDraw.message);
  }
  if (player1Score >= 5 && !achievements.fiveWins.player1) {
    achievements.fiveWins.player1 = true;
    showAchievementNotification(`${player1Name} mencapai ${achievements.fiveWins.message}`);
  }
  if (player1WinStreak >= 3 && !achievements.threeWinStreak.player1) {
    achievements.threeWinStreak.player1 = true;
    showAchievementNotification(`${player1Name} mencapai ${achievements.threeWinStreak.message}`);
  }
}

function showAchievementNotification(msg) {
  if (!achievementNotification) return;
  achievementNotification.textContent = `✨ ${msg}`;
  achievementNotification.classList.add('show');
  setTimeout(() => achievementNotification.classList.remove('show'), 3000);
}

