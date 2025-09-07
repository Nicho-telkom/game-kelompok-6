let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let player1Name = 'Player 1';
let player2Name = 'Player 2';
let player1Score = 0;
let player2Score = 0;
let draws = 0;

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
const startButton = document.getElementById('startButton');
const loginScreen = document.getElementById('loginScreen');
const gameScreen = document.getElementById('gameScreen');

// 🔹 Tambahan Modal Mode + Toggle Tema
const modeModal = document.getElementById('modeModal');

// Saat pertama kali load → buka modal mode
window.onload = () => {
  modeModal.style.display = 'flex';
  loginScreen.style.display = 'none'; 
  gameScreen.style.display = 'none';
};

// Pilih mode Player vs Player
document.getElementById('playWithPlayer').addEventListener('click', () => {
  modeModal.style.display = 'none';
  loginScreen.style.display = 'flex';
});

// Pilih mode vs Bot
let botDifficulty = 'easy'; // default

const difficultyOptions = document.getElementById('difficultyOptions');
const playWithBotBtn = document.getElementById('playWithBot');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Tampilkan pilihan difficulty saat klik Player vs Bot
playWithBotBtn.addEventListener('click', () => {
  difficultyOptions.style.display = 'block';
});

// Pilih difficulty dan mulai game vs Bot
difficultyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    botDifficulty = btn.getAttribute('data-difficulty');
    modeModal.style.display = 'none';
    player2Name = 'Bot';
    document.getElementById('player1Name').textContent = player1Name;
    document.getElementById('player2Name').textContent = player2Name;
    loginScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    difficultyOptions.style.display = 'none';
    initializeGame();
  });
});

// Toggle Tema
document.getElementById('toggleTheme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Terapkan tema saat load
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// Start game
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
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning');
    cell.removeEventListener('click', handleCellClick);
    cell.addEventListener('click', handleCellClick, { once: true });
  });

  restartButton.addEventListener('click', restartGame);
  updateDisplay();
  showAchievement({ player1: player1Score, player2: player2Score, seri: draws });
}

function handleCellClick(e) {
  const cell = e.target;
  const cellIndex = Array.from(cells).indexOf(cell);

  if (board[cellIndex] !== '' || !gameActive) return;

  board[cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;
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
    const winner = currentPlayer === 'X' ? player1Name : player2Name;
    winningMessage.textContent = `🎉 ${winner} Menang!`;

    if (currentPlayer === 'X') {
      player1Score++;
      document.getElementById('player1Score').textContent = player1Score;
      player1WinStreak++;
      player2WinStreak = 0;
    } else {
      player2Score++;
      document.getElementById('player2Score').textContent = player2Score;
      player2WinStreak++;
      player1WinStreak = 0;
    }

    winningCells.forEach(index => {
      cells[index].classList.add('winning');
    });

    checkAchievements();
    showAchievement({ player1: player1Score, player2: player2Score, seri: draws });
    return;
  }

  if (!board.includes('')) {
    gameActive = false;
    winningMessage.textContent = '🤝 Permainan Seri!';
    draws++;
    document.getElementById('draws').textContent = draws;
    player1WinStreak = 0;
    player2WinStreak = 0;
    checkAchievements();
    showAchievement({ player1: player1Score, player2: player2Score, seri: draws });
    return;
  }

  // Ganti giliran
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateDisplay();

  // Jika vs Bot → giliran Bot
  if (player2Name === "Bot" && gameActive && currentPlayer === "O") {
    setTimeout(botMove, 500);
  }
}

function botMove() {
  let index;
  if (botDifficulty === 'easy') {
    // Random move
    let emptyCells = [...cells].filter((c, i) => board[i] === '');
    if (emptyCells.length === 0) return;
    let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    index = Array.from(cells).indexOf(randomCell);
  } else if (botDifficulty === 'medium') {
    // Coba menang, jika tidak random
    index = getWinningMove('O');
    if (index === -1) index = getWinningMove('X');
    if (index === -1) {
      let emptyCells = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
      index = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  } else if (botDifficulty === 'hard') {
    // Minimax
    index = getBestMove();
  }

  if (index === undefined || board[index] !== '') return;
  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  cells[index].removeEventListener('click', handleCellClick);

  checkResult();
}

// Cari langkah menang/tahan
function getWinningMove(player) {
  for (let [a, b, c] of winConditions) {
    let values = [board[a], board[b], board[c]];
    if (values.filter(v => v === player).length === 2 && values.includes('')) {
      return [a, b, c].find(i => board[i] === '');
    }
  }
  return -1;
}

// Minimax untuk hard mode
function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  let result = checkWinnerForMinimax(newBoard);
  if (result !== null) {
    if (result === 'O') return 10 - depth;
    else if (result === 'X') return depth - 10;
    else return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinnerForMinimax(bd) {
  for (let [a, b, c] of winConditions) {
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
      return bd[a];
    }
  }
  if (!bd.includes('')) return 'draw';
  return null;
}

function updateDisplay() {
  const playerName = currentPlayer === 'X' ? player1Name : player2Name;
  currentPlayerDisplay.textContent = `${playerName} (${currentPlayer})`;
}

function restartGame() {
  currentPlayer = 'X';
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  winningMessage.textContent = '';
  player1WinStreak = 0;
  player2WinStreak = 0;

  initializeGame();
}

function checkAchievements() {
  if (player1Score >= 5 && !achievements.fiveWins.player1) {
    achievements.fiveWins.player1 = true;
    displayAchievement(player1Name, achievements.fiveWins.message);
  }
  if (player2Score >= 5 && !achievements.fiveWins.player2) {
    achievements.fiveWins.player2 = true;
    displayAchievement(player2Name, achievements.fiveWins.message);
  }

  if (player1Score >= 10 && !achievements.tenWins.player1) {
    achievements.tenWins.player1 = true;
    displayAchievement(player1Name, achievements.tenWins.message);
  }
  if (player2Score >= 10 && !achievements.tenWins.player2) {
    achievements.tenWins.player2 = true;
    displayAchievement(player2Name, achievements.tenWins.message);
  }

  if (draws === 1 && !achievements.firstDraw.achieved) {
    achievements.firstDraw.achieved = true;
    displayAchievement("Semua Pemain", achievements.firstDraw.message);
  }

  if (player1WinStreak === 3 && !achievements.threeWinStreak.player1) {
    achievements.threeWinStreak.player1 = true;
    displayAchievement(player1Name, achievements.threeWinStreak.message);
  }
  if (player2WinStreak === 3 && !achievements.threeWinStreak.player2) {
    achievements.threeWinStreak.player2 = true;
    displayAchievement(player2Name, achievements.threeWinStreak.message);
  }

  if (player1WinStreak === 5 && !achievements.fiveWinStreak.player1) {
    achievements.fiveWinStreak.player1 = true;
    displayAchievement(player1Name, achievements.fiveWinStreak.message);
  }
  if (player2WinStreak === 5 && !achievements.fiveWinStreak.player2) {
    achievements.fiveWinStreak.player2 = true;
    displayAchievement(player2Name, achievements.fiveWinStreak.message);
  }
}

function displayAchievement(playerName, message) {
  const achievementMessage = document.getElementById('achievementMessage');
  achievementMessage.textContent = `🏆 Achievement Baru! ${playerName}: ${message}`;
  achievementMessage.classList.add('show');
  setTimeout(() => {
    achievementMessage.classList.remove('show');
  }, 3000);
}

// Update isi Achievement Box di sidebar
function showAchievement(score) {
  const achievementList = document.getElementById('achievementList');
  achievementList.innerHTML = `
    <li>${player1Name}: <strong>${score.player1}</strong> poin</li>
    <li>${player2Name}: <strong>${score.player2}</strong> poin</li>
    <li>Seri: <strong>${score.seri}</strong></li>
  `;
}
const welcomePopup = document.getElementById('welcomePopup');
welcomePopup.addEventListener('animationstart', (e) => {
  if (e.animationName === 'slideDown') {
    welcomePopup.style.display = 'flex';
    modeModal.style.display = 'none';
  }
});
// Saat animasi selesai → tampilkan modal mode
welcomePopup.addEventListener('animationend', (e) => {
  if (e.animationName === 'slideUp') {
    welcomePopup.style.display = 'none';
    modeModal.style.display = 'flex';
  }
});
const backButton = document.getElementById('backButton');

backButton.addEventListener('click', () => {
  // Reset game
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  winningMessage.textContent = '';

  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning');
  });

  // Sembunyikan game screen, tampilkan kembali form mode
  gameScreen.style.display = 'none';
  document.getElementById('modeModal').style.display = 'flex';
});