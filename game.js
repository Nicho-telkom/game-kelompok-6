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

// Player vs Player
playWithPlayerBtn.addEventListener("click", () => {
  document.getElementById("modeModal").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
  player2Name = 'Player 2';
  document.getElementById('player2').value = 'Player 2';
});

// Player vs Bot
playWithBotBtn.addEventListener("click", () => {
  difficultyOptions.style.display = "flex";
  botOptions.style.display = "none";
});

difficultyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedDifficulty = btn.dataset.difficulty;
    botOptions.style.display = "flex";
  });
});

startBotGameBtn.addEventListener("click", () => {
  const playerName = document.getElementById("botPlayerName").value || "Player";
  const botName = `Bot (${selectedDifficulty})`;

  player1Name = playerName;
  player2Name = "Bot";
  botDifficulty = selectedDifficulty;

  document.getElementById("player1Name").textContent = player1Name;
  document.getElementById("player2Name").textContent = botName;

  document.getElementById("modeModal").style.display = "none";
  document.getElementById("gameScreen").style.display = "flex";
  initializeGame();
});

// Variabel untuk Achievement
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

// Welcome
window.onload = () => {
  welcomePopup.style.display = 'flex';
  modeModal.style.display = 'none';
  loginScreen.style.display = 'none';
  gameScreen.style.display = 'none';
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
};

startGameBtn.addEventListener('click', () => {
  welcomePopup.style.display = 'none';
  modeModal.style.display = 'flex';
});

chooseThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

document.getElementById('toggleTheme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Start PvP
startButton.addEventListener('click', () => {
  player1Name = document.getElementById('player1').value || 'Player 1';
  if (player2Name !== "Bot") {
    player2Name = document.getElementById('player2').value || 'Player 2';
  }
  document.getElementById('player1Name').textContent = player1Name;
  document.getElementById('player2Name').textContent = player2Name;
  loginScreen.style.display = 'none';
  gameScreen.style.display = 'flex';
  initializeGame();
});

function initializeGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  winningMessage.textContent = '';
  document.getElementById('afterWinButtons').style.display = 'none';

  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning', 'x', 'o');
    cell.removeEventListener('click', handleCellClick);
    cell.addEventListener('click', handleCellClick, { once: true });
  });

  restartButton.addEventListener('click', restartGame);
  endSessionButton.addEventListener('click', endSession);
  updateDisplay();
  showAchievement({ player1: player1Score, player2: player2Score, seri: draws });
  document.getElementById('timerProgressBar').style.width = '100%';
}

function handleCellClick(e) {
  const cell = e.target;
  const cellIndex = Array.from(cells).indexOf(cell);
  if (board[cellIndex] !== '' || !gameActive) return;

  board[cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
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
    winningMessage.textContent = `🎉 ${winner} Menang!`;
    document.getElementById('afterWinButtons').style.display = 'flex';

    if (currentPlayer === 'X') {
      player1Score++;
      document.getElementById('player1Score').textContent = player1Score;
      player1WinStreak++; player2WinStreak = 0;
    } else {
      player2Score++;
      document.getElementById('player2Score').textContent = player2Score;
      player2WinStreak++; player1WinStreak = 0;
    }

    winningCells.forEach(i => cells[i].classList.add('winning'));
    checkAchievements();
    showAchievement({ player1: player1Score, player2: player2Score, seri: draws });
    return;
  }

  if (!board.includes('')) {
    gameActive = false;
    clearInterval(timerInterval);
    winningMessage.textContent = '🤝 Permainan Seri!';
    document.getElementById('afterWinButtons').style.display = 'flex';
    draws++;
    document.getElementById('draws').textContent = draws;
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
  currentPlayerDisplay.textContent = currentPlayer === 'X' ? player1Name : player2Name;
  const indicator = currentPlayerDisplay.closest('.turn-indicator');
  currentPlayer === 'X' ? indicator.classList.remove('o') : indicator.classList.add('o');
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
  timerCount.textContent = timeLeft;
  timerProgressBar.style.width = '100%';
  timerProgressBar.style.transition = `width ${timerDuration}s linear`;
  void timerProgressBar.offsetWidth;
  timerProgressBar.style.width = '0%';
  timerInterval = setInterval(() => {
    timeLeft--;
    timerCount.textContent = timeLeft;
    if (timeLeft <= 0) { clearInterval(timerInterval); handleTimeout(); }
  }, 1000);
}

function restartGame() {
  initializeGame();
}

function endSession() {
  clearInterval(timerInterval);
  player1Score = 0; player2Score = 0; draws = 0;
  document.getElementById('player1Score').textContent = 0;
  document.getElementById('player2Score').textContent = 0;
  document.getElementById('draws').textContent = 0;
  resetBoardOnly();
  gameScreen.style.display = 'none';
  modeModal.style.display = 'flex';
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

// Back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
  clearInterval(timerInterval);
  resetBoardOnly();
  gameScreen.style.display = 'none';
  modeModal.style.display = 'flex';
});

function resetBoardOnly() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true; currentPlayer = 'X';
  winningMessage.textContent = '';
  document.getElementById('afterWinButtons').style.display = 'none';
  player1WinStreak = 0; player2WinStreak = 0;
  cells.forEach(c => { c.textContent = ''; c.classList.remove('winning','x','o'); });
}

function showAchievement(score) {
  const list = document.getElementById('achievementList');
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
  achievementNotification.textContent = `✨ ${msg}`;
  achievementNotification.classList.add('show');
  setTimeout(() => achievementNotification.classList.remove('show'), 3000);
}
