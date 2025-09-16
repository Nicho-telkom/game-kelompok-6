// ==================== SOUND ====================
const bgMusic = new Audio("sounds/bg-music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

const clickSound = new Audio("sounds/click.mp3");
const winSound = new Audio("sounds/win.mp3");
const drawSound = new Audio("sounds/draw.mp3");

// ==================== ELEMENT ====================
const welcomePopup = document.getElementById("welcomePopup");
const modeModal = document.getElementById("modeModal");

const startGameBtn = document.getElementById("startGameBtn");
const themeButton = document.getElementById("chooseThemeBtn"); // disesuaikan dengan HTML
const startButton = document.getElementById("startButton");

const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");

const cells = document.querySelectorAll(".cell");
const turnIndicator = document.getElementById("currentPlayer"); // pakai id currentPlayer
const winningMessage = document.getElementById("winning-message"); // sesuai HTML
const restartButton = document.getElementById("restartButton");

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let isGameActive = false;

// ==================== EVENT LISTENER ====================

// Tombol "Mulai Game"
if (startGameBtn) {
  startGameBtn.addEventListener("click", () => {
    clickSound.play();
    bgMusic.play().catch(err => console.log("Autoplay blocked:", err));

    // sembunyikan popup
    welcomePopup.classList.add("hidden");

    // tampilkan login screen
    loginScreen.classList.remove("hidden");
  });
}

// Tombol "Pilih Tema"
if (themeButton) {
  themeButton.addEventListener("click", () => {
    clickSound.play();
    modeModal.classList.remove("hidden");
  });
}

// Tombol "Mulai" di login screen
if (startButton) {
  startButton.addEventListener("click", () => {
    clickSound.play();

    const player1 = document.getElementById("player1").value.trim();
    const player2 = document.getElementById("player2").value.trim();

    if (!player1 || !player2) {
      alert("Masukkan nama kedua pemain!");
      return;
    }

    loginScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    startGame();
  });
}

// Tombol "Main Lagi"
if (restartButton) {
  restartButton.addEventListener("click", () => {
    clickSound.play();
    resetGame();
  });
}

// ==================== GAME LOGIC ====================

// Mulai game: reset board dan set giliran awal
function startGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  isGameActive = true;
  winningMessage.textContent = "";
  turnIndicator.textContent = currentPlayer;

  cells.forEach(cell => {
    cell.textContent = "";
    cell.style.pointerEvents = "auto"; // aktifkan klik
  });
}

// Reset game sama seperti startGame
function resetGame() {
  startGame();
}

// Cek apakah ada pemenang
function checkWinner() {
  const winningConditions = [
    [0,1,2], [3,4,5], [6,7,8], // baris
    [0,3,6], [1,4,7], [2,5,8], // kolom
    [0,4,8], [2,4,6]           // diagonal
  ];

  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a]; // pemenang (X atau O)
    }
  }
  return null;
}

// Cek apakah board penuh (draw)
function isBoardFull() {
  return board.every(cell => cell !== "");
}

// Event klik pada setiap cell
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!isGameActive) return;
    if (board[index] !== "") return; // sudah terisi

    clickSound.play();

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;

    // Cek pemenang
    const winner = checkWinner();
    if (winner) {
      isGameActive = false;
      winningMessage.textContent = `Player ${winner} menang! 🎉`;
      winSound.play();
      cells.forEach(c => c.style.pointerEvents = "none"); // nonaktifkan klik
      return;
    }

    // Cek draw
    if (isBoardFull()) {
      isGameActive = false;
      winningMessage.textContent = "Seri! 🤝";
      drawSound.play();
      return;
    }

    // Ganti giliran
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    turnIndicator.textContent = currentPlayer;
  });
});
