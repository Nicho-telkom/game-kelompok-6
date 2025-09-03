
    let currentPlayer = 'X';
    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let player1Name = 'Player 1';
    let player2Name = 'Player 2';
    let player1Score = 0;
    let player2Score = 0;
    let draws = 0;

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
        } else {
          player2Score++;
          document.getElementById('player2Score').textContent = player2Score;
        }

        winningCells.forEach(index => {
          cells[index].classList.add('winning');
        });

        return;
      }

      if (!board.includes('')) {
        gameActive = false;
        winningMessage.textContent = '🤝 Permainan Seri!';
        draws++;
        document.getElementById('draws').textContent = draws;
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
      
      cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning');
        cell.removeEventListener('click', handleCellClick);
        cell.addEventListener('click', handleCellClick, { once: true });
      });
      
      updateDisplay();
    }
