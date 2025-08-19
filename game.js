document.addEventListener('DOMContentLoaded', () => {
    const gameState = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        scores: { X: 0, O: 0 },
        gameActive: true,
        leaderboard: [],
        playerNames: { X: '', O: '' },
        gameStarted: false,
        startTime: null
    };

    const cells = document.querySelectorAll('.cell');
    const player1Element = document.getElementById('player1');
    const player2Element = document.getElementById('player2');
    const score1Element = document.getElementById('score1');
    const score2Element = document.getElementById('score2');
    const resetBtn = document.getElementById('reset-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const winnerModal = document.getElementById('winner-modal');
    const winnerText = document.getElementById('winner-text');
    const winnerMessage = document.getElementById('winner-message');
    const modalBtn = document.getElementById('modal-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const playerSetupModal = document.getElementById('player-setup-modal');

    initGame();

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetRound);
    newGameBtn.addEventListener('click', newGame);
    modalBtn.addEventListener('click', closeModal);
    startGameBtn.addEventListener('click', startGame);

    function startGame() {
        const player1Name = document.getElementById('player1-name').value.trim();
        const player2Name = document.getElementById('player2-name').value.trim();

        if (!player1Name || !player2Name) {
            alert('Please enter names for both players');
            return;
        }

        gameState.playerNames.X = player1Name;
        gameState.playerNames.O = player2Name;
        gameState.gameStarted = true;
        gameState.startTime = Date.now();

        document.querySelector('#player1 span').textContent = player1Name;
        document.querySelector('#player2 span').textContent = player2Name;

        closeModal(); // akan menutup modal setup juga

        document.getElementById('reset-btn').disabled = false;
        document.getElementById('new-game-btn').disabled = false;
        document.getElementById('board').style.opacity = '1';
        document.getElementById('board').style.pointerEvents = 'auto';
        setupBoard();
    }

    function initGame() {
        const savedLeaderboard = localStorage.getItem('ticTacToeLeaderboard');
        if (savedLeaderboard) {
            gameState.leaderboard = JSON.parse(savedLeaderboard);
            updateLeaderboard();
        }

        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            gameState.scores = JSON.parse(savedScores);
            updateScores();
        }

        setupBoard();
    }

    function setupBoard() {
        gameState.board = ['', '', '', '', '', '', '', '', ''];
        gameState.currentPlayer = 'X';
        gameState.gameActive = true;

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });

        updatePlayerTurn();
    }

    function handleCellClick(e) {
        const index = e.target.dataset.index;

        if (!gameState.gameStarted || !gameState.gameActive || gameState.board[index] !== '') {
            return;
        }

        gameState.board[index] = gameState.currentPlayer;
        e.target.textContent = gameState.currentPlayer;
        e.target.classList.add(gameState.currentPlayer.toLowerCase());

        if (checkWinner()) {
            endGame(gameState.currentPlayer);
            return;
        }

        if (isDraw()) {
            endGame(null);
            return;
        }

        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updatePlayerTurn();
    }

    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return gameState.board[a] !== '' &&
                   gameState.board[a] === gameState.board[b] &&
                   gameState.board[a] === gameState.board[c];
        });
    }

    function isDraw() {
        return !gameState.board.includes('');
    }

    function endGame(winner) {
        gameState.gameActive = false;

        const endTime = Date.now();
        const duration = Math.floor((endTime - gameState.startTime) / 1000); // dalam detik

        if (winner) {
            gameState.scores[winner]++;
            updateScores();

            const matchResult = {
                date: new Date().toLocaleString(),
                winner: gameState.playerNames[winner],
                loser: winner === 'X' ? gameState.playerNames.O : gameState.playerNames.X,
                winnerSymbol: winner,
                duration: duration
            };

            gameState.leaderboard.push(matchResult);
            gameState.leaderboard.sort((a, b) => a.duration - b.duration);
            if (gameState.leaderboard.length > 10) {
                gameState.leaderboard = gameState.leaderboard.slice(0, 10);
            }

            localStorage.setItem('ticTacToeScores', JSON.stringify(gameState.scores));
            localStorage.setItem('ticTacToeLeaderboard', JSON.stringify(gameState.leaderboard));

            updateLeaderboard();
            showWinner(winner);
        } else {
            winnerText.textContent = "It's a Draw!";
            winnerMessage.textContent = "No winners this time. Try again!";
            winnerModal.classList.add('show');
        }
    }

    function showWinner(winner) {
        winnerText.textContent = `${gameState.playerNames[winner]} Wins!`;
        winnerMessage.textContent = winner === 'X'
            ? "Player X dominates the board!"
            : "Player O takes the victory!";
        winnerModal.classList.add('show');
    }

    function closeModal() {
        winnerModal.classList.remove('show');
        playerSetupModal.classList.remove('show'); // <-- inilah baris penting yang ditambahkan
    }

    function updatePlayerTurn() {
        if (gameState.currentPlayer === 'X') {
            player1Element.classList.add('active');
            player2Element.classList.remove('active');
        } else {
            player1Element.classList.remove('active');
            player2Element.classList.add('active');
        }
    }

    function updateScores() {
        score1Element.textContent = gameState.scores.X;
        score2Element.textContent = gameState.scores.O;
    }

    function updateLeaderboard() {
        leaderboardBody.innerHTML = '';

        if (gameState.leaderboard.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" style="text-align: center;">No matches played yet</td>`;
            leaderboardBody.appendChild(row);
            return;
        }

        gameState.leaderboard.forEach((match, index) => {
            const row = document.createElement('tr');

            const winnerClass = match.winnerSymbol === 'X' ? 'winner' : '';
            const loserClass = match.winnerSymbol === 'X' ? 'loser' : '';

            row.innerHTML = `
                <td class="rank">${index + 1}</td>
                <td>${match.date}</td>
                <td><span class="${winnerClass}">${match.winner}</span> vs <span class="${loserClass}">${match.loser}</span></td>
                <td>${match.duration}s</td>
            `;

            leaderboardBody.appendChild(row);
        });
    }

    function resetRound() {
        setupBoard();
        gameState.startTime = Date.now(); // mulai hitung ulang waktu baru
    }

    function newGame() {
        gameState.scores = { X: 0, O: 0 };
        updateScores();
        localStorage.removeItem('ticTacToeScores');
        setupBoard();
        gameState.startTime = Date.now();
    }
});
