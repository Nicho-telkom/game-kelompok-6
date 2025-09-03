const cells = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const winningMessageText = document.getElementById('winning-message');
const restartButton = document.getElementById('restartButton');

let isXTurn = true;

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

startGame();

restartButton.addEventListener('click', startGame);

function startGame() {
  isXTurn = true;
  winningMessageText.innerText = '';
  cells.forEach(cell => {
    cell.classList.remove('winning');
    cell.innerText = '';
    cell.addEventListener('click', handleClick, { once: true });
  });
}

function handleClick(e) {
  const cell = e.target;
  const currentClass = isXTurn ? 'X' : 'O';
  cell.innerText = currentClass;

  if (checkWin(currentClass)) {
    endGame(false, currentClass);
  } else if (isDraw()) {
    endGame(true);
  } else {
    isXTurn = !isXTurn;
  }
}

function endGame(draw, winner) {
  if (draw) {
    winningMessageText.innerText = "Draw!";
  } else {
    winningMessageText.innerText = `${winner} Wins!`;
    highlightWinningCells(winner);
  }
  cells.forEach(cell => cell.removeEventListener('click', handleClick));
}

function isDraw() {
  return [...cells].every(cell => cell.innerText !== '');
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some(combination => {
    return combination.every(index => {
      return cells[index].innerText === currentClass;
    });
  });
}

function highlightWinningCells(winner) {
  WINNING_COMBINATIONS.forEach(combination => {
    if (combination.every(index => cells[index].innerText === winner)) {
      combination.forEach(index => cells[index].classList.add('winning'));
    }
  });
}
