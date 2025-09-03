
    let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let player1Name = 'Player 1';
let player2Name = 'Player 2';
let player1Score = 0;
let player2Score = 0;
let draws = 0;

// Variabel baru untuk Achievement
let player1WinStreak = 0;
let player2WinStreak = 0;
let achievements = {
  firstWin: { player1: false, player2: false, message: "Kemenangan Pertama!" },
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
const nameModal = document.getElementById('nameModal');
const gameScreen = document.getElementById('gameScreen');

startButton.addEventListener('click', () => {
  player1Name = document.getElementById('player1').value || 'Player 1';
  player2Name = document.getElementById('player2').value || 'Player 2';
  
  document.getElementById('player1Name').textContent = player1Name;
  document.getElementById('player2Name').textContent = player2Name;
  
  nameModal.style.display = 'none';
  gameScreen.style.display = 'flex';
  
  initializeGame();
});

function initializeGame() {
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick, { once: true });
  });
  
  restartButton.addEventListener('click', restartGame);
  updateDisplay();

  // Tampilkan achievement awal
  showAchievement({
    player1: player1Score,
    player2: player2Score,
    seri: draws
  });
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
      player1Score += 5; // ✅ Tambah 5 poin
      document.getElementById('player1Score').textContent = player1Score;
      player1WinStreak++;
      player2WinStreak = 0;
    } else {
      player2Score += 5; // ✅ Tambah 5 poin
      document.getElementById('player2Score').textContent = player2Score;
      player2WinStreak++;
      player1WinStreak = 0;
    }

    winningCells.forEach(index => {
      cells[index].classList.add('winning');
    });

    checkAchievements();

    // 🔥 Update Achievement box
    showAchievement({
      player1: player1Score,
      player2: player2Score,
      seri: draws
    });

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

    // 🔥 Update Achievement box
    showAchievement({
      player1: player1Score,
      player2: player2Score,
      seri: draws
    });

    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateDisplay();
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
  
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning');
    cell.removeEventListener('click', handleCellClick);
    cell.addEventListener('click', handleCellClick, { once: true });
  });
  
  updateDisplay();

  // 🔥 Update Achievement box saat restart
  showAchievement({
    player1: player1Score,
    player2: player2Score,
    seri: draws
  });
}

// Fungsi untuk memeriksa dan menampilkan achievement
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

// Function untuk buat elemen achievement dan update isinya
function showAchievement(score) {
  const existing = document.querySelector('.achievement');
  if (existing) {
    existing.remove();
  }

  const achievement = document.createElement('div');
  achievement.className = 'Achievement';

  achievement.innerHTML = `
    <h3>🏆 Achievement</h3>
    <ul>
      <li>Player 1: <strong>${score.player1}</strong> poin</li>
      <li>Player 2: <strong>${score.player2}</strong> poin</li>
      <li>Seri: <strong>${score.seri}</strong></li>
    </ul>
  `;

  document.body.appendChild(achievement);
}
