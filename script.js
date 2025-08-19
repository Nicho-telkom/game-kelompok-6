document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = false;
    let gameMode = 'pvp'; // 'pvp' or 'pvc'
    let scores = { player1: 0, player2: 0 };
    let playerNames = { player1: 'Player 1', player2: 'Player 2' };
    let gameHistory = [];
    let soundEnabled = true;
    let timerInterval;
    let timeLeft = 15;
    
    // DOM elements
    const boardElement = document.getElementById('gameBoard');
    const statusMessage = document.getElementById('statusMessage');
    const player1Element = document.getElementById('player1');
    const player2Element = document.getElementById('player2');
    const player1Name = document.getElementById('player1Name');
    const player2Name = document.getElementById('player2Name');
    const player1Score = document.getElementById('player1Score');
    const player2Score = document.getElementById('player2Score');
    const gameModeBtn = document.getElementById('gameModeBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const leaderboard = document.getElementById('leaderboard');
    const gameHistoryElement = document.getElementById('gameHistory');
    const gameOverModal = document.getElementById('gameOverModal');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const gameOverMessage = document.getElementById('gameOverMessage');
    const rematchBtn = document.getElementById('rematchBtn');
    const newGameModalBtn = document.getElementById('newGameModalBtn');
    const playerNameModal = document.getElementById('playerNameModal');
    const player1Input = document.getElementById('player1Input');
    const player2Input = document.getElementById('player2Input');
    const startGameBtn = document.getElementById('startGameBtn');
    const themeToggle = document.getElementById('themeToggle');
    const soundToggle = document.getElementById('soundToggle');
    const timerContainer = document.getElementById('timerContainer');
    const timerBar = document.getElementById('timerBar');
    
    // Initialize game
    initGame();
    
    // Event listeners
    startGameBtn.addEventListener('click', startGame);
    newGameBtn.addEventListener('click', showNameModal);
    gameModeBtn.addEventListener('click', toggleGameMode);
    rematchBtn.addEventListener('click', rematch);
    newGameModalBtn.addEventListener('click', showNameModal);
    themeToggle.addEventListener('click', toggleTheme);
    soundToggle.addEventListener('click', toggleSound);
    
    // Initialize board
    function initGame() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', 'bg-white', 'dark:bg-slate-700', 'rounded-lg', 'shadow');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
        
        updateStatusMessage();
        loadLeaderboard();
        loadGameHistory();
    }
    
    // Handle cell click
    function handleCellClick(e) {
        if (!gameActive) return;
        
        const index = e.target.dataset.index;
        
        if (board[index] !== '') return;
        
        makeMove(index, currentPlayer);
        
        if (gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
            setTimeout(() => {
                const bestMove = findBestMove();
                makeMove(bestMove, 'O');
            }, 500);
        }
    }
    
    // Make a move
    function makeMove(index, player) {
        board[index] = player;
        const cell = boardElement.children[index];
        
        cell.textContent = player;
        cell.classList.add(player === 'X' ? 'x-symbol' : 'o-symbol');
        
        if (soundEnabled) {
            playSound('move');
        }
        
        if (checkWinner()) {
            endGame(false);
            return;
        }
        
        if (checkDraw()) {
            endGame(true);
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatusMessage();
        resetTimer();
        
        // Highlight current player
        if (currentPlayer === 'X') {
            player1Element.classList.add('ring-2', 'ring-blue-500');
            player2Element.classList.remove('ring-2', 'ring-red-500');
        } else {
            player2Element.classList.add('ring-2', 'ring-red-500');
            player1Element.classList.remove('ring-2', 'ring-blue-500');
        }
    }
    
    // Check for winner
    function checkWinner() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                // Highlight winning cells
                combination.forEach(index => {
                    boardElement.children[index].classList.add('winning-cell');
                });
                
                return true;
            }
        }
        
        return false;
    }
    
    // Check for draw
    function checkDraw() {
        return !board.includes('');
    }
    
    // End game
    function endGame(isDraw) {
        gameActive = false;
        clearInterval(timerInterval);
        
        if (soundEnabled) {
            playSound(isDraw ? 'draw' : 'win');
        }
        
        if (!isDraw) {
            if (currentPlayer === 'X') {
                scores.player2++;
                player2Score.textContent = scores.player2;
                gameOverTitle.textContent = 'Game Over!';
                gameOverMessage.textContent = `${playerNames.player2} wins!`;
                
                // Add to history
                gameHistory.push({
                    winner: playerNames.player2,
                    loser: playerNames.player1,
                    mode: gameMode,
                    date: new Date().toLocaleString()
                });
            } else {
                scores.player1++;
                player1Score.textContent = scores.player1;
                gameOverTitle.textContent = 'Game Over!';
                gameOverMessage.textContent = `${playerNames.player1} wins!`;
                
                // Add to history
                gameHistory.push({
                    winner: playerNames.player1,
                    loser: playerNames.player2,
                    mode: gameMode,
                    date: new Date().toLocaleString()
                });
            }
        } else {
            gameOverTitle.textContent = 'Draw!';
            gameOverMessage.textContent = 'No one wins this time!';
            
            // Add to history
            gameHistory.push({
                winner: 'Draw',
                loser: 'Draw',
                mode: gameMode,
                date: new Date().toLocaleString()
            });
        }
        
        saveGameHistory();
        saveLeaderboard();
        gameOverModal.classList.remove('hidden');
    }
    
    // Update status message
    function updateStatusMessage() {
        if (currentPlayer === 'X') {
            statusMessage.textContent = `${playerNames.player1}'s turn (X)`;
        } else {
            statusMessage.textContent = gameMode === 'pvp' 
                ? `${playerNames.player2}'s turn (O)` 
                : `Computer's turn (O)`;
        }
    }
    
    // Start game
    function startGame() {
        playerNames.player1 = player1Input.value || 'Player 1';
        playerNames.player2 = gameMode === 'pvp' 
            ? (player2Input.value || 'Player 2') 
            : 'Computer';
        
        player1Name.textContent = playerNames.player1;
        player2Name.textContent = playerNames.player2;
        
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        
        // Reset board UI
        Array.from(boardElement.children).forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x-symbol', 'o-symbol', 'winning-cell');
        });
        
        // Highlight current player
        player1Element.classList.add('ring-2', 'ring-blue-500');
        player2Element.classList.remove('ring-2', 'ring-red-500');
        
        updateStatusMessage();
        playerNameModal.classList.add('hidden');
        resetTimer();
    }
    
    // Show name modal
    function showNameModal() {
        playerNameModal.classList.remove('hidden');
        gameOverModal.classList.add('hidden');
    }
    
    // Toggle game mode
    function toggleGameMode() {
        gameMode = gameMode === 'pvp' ? 'pvc' : 'pvp';
        gameModeBtn.textContent = gameMode === 'pvp' ? 'Player vs Player' : 'Player vs Computer';
        
        if (gameMode === 'pvc') {
            player2Input.value = 'Computer';
            player2Input.disabled = true;
        } else {
            player2Input.disabled = false;
        }
    }
    
    // Rematch
    function rematch() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        
        // Reset board UI
        Array.from(boardElement.children).forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x-symbol', 'o-symbol', 'winning-cell');
        });
        
        // Highlight current player
        player1Element.classList.add('ring-2', 'ring-blue-500');
        player2Element.classList.remove('ring-2', 'ring-red-500');
        
        updateStatusMessage();
        gameOverModal.classList.add('hidden');
        resetTimer();
    }
    
    // AI logic - Minimax algorithm
    function findBestMove() {
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, 0, false);
                board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    function minimax(board, depth, isMaximizing) {
        // Check terminal states
        if (checkWinner()) {
            return isMaximizing ? -10 + depth : 10 - depth;
        }
        
        if (checkDraw()) {
            return 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            
            return bestScore;
        } else {
            let bestScore = Infinity;
            
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            
            return bestScore;
        }
    }
    
    // Timer functions
    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = 15;
        timerBar.style.width = '100%';
        
        if (gameActive) {
            timerContainer.classList.remove('hidden');
            timerInterval = setInterval(() => {
                timeLeft--;
                timerBar.style.width = `${(timeLeft / 15) * 100}%`;
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    // Time's up - switch player
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                    updateStatusMessage();
                    resetTimer();
                    
                    if (gameMode === 'pvc' && currentPlayer === 'O') {
                        setTimeout(() => {
                            const bestMove = findBestMove();
                            makeMove(bestMove, 'O');
                        }, 500);
                    }
                }
            }, 1000);
        } else {
            timerContainer.classList.add('hidden');
        }
    }
    
    // Leaderboard functions
    function loadLeaderboard() {
        const savedLeaderboard = localStorage.getItem('ticTacToeLeaderboard');
        if (savedLeaderboard) {
            scores = JSON.parse(savedLeaderboard);
            player1Score.textContent = scores.player1;
            player2Score.textContent = scores.player2;
        }
    }
    
    function saveLeaderboard() {
        localStorage.setItem('ticTacToeLeaderboard', JSON.stringify(scores));
    }
    
    // Game history functions
    function loadGameHistory() {
        const savedHistory = localStorage.getItem('ticTacToeHistory');
        if (savedHistory) {
            gameHistory = JSON.parse(savedHistory);
            renderGameHistory();
        }
    }
    
    function saveGameHistory() {
        localStorage.setItem('ticTacToeHistory', JSON.stringify(gameHistory));
    }
    
    function renderGameHistory() {
        if (gameHistory.length === 0) {
            gameHistoryElement.innerHTML = '<div class="text-center py-4">No games played yet</div>';
            return;
        }
        
        gameHistoryElement.innerHTML = '';
        const recentHistory = gameHistory.slice(-5).reverse();
        
        recentHistory.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.className = 'p-3 border-b dark:border-slate-700';
            
            if (game.winner === 'Draw') {
                gameItem.innerHTML = `
                    <div class="text-gray-500 dark:text-gray-400">Draw</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">${game.mode} • ${game.date}</div>
                `;
            } else {
                gameItem.innerHTML = `
                    <div class="font-medium">${game.winner} <span class="text-green-600">won</span> vs ${game.loser}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">${game.mode} • ${game.date}</div>
                `;
            }
            
            gameHistoryElement.appendChild(gameItem);
        });
    }
    
    // Theme toggle
    function toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // Sound toggle
    function toggleSound() {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled 
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 011.414 1.414" />
            </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>`;
        
        localStorage.setItem('soundEnabled', soundEnabled);
    }
    
    // Check for saved sound preference
    if (localStorage.getItem('soundEnabled') === 'false') {
        soundEnabled = false;
        soundToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>`;
    }
    
    // Sound effects
    function playSound(type) {
        if (!soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'move':
                oscillator.type = 'sine';
                oscillator.frequency.value = 440;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'win':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.5);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
                break;
            case 'draw':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(164.81, audioContext.currentTime + 0.5);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
                break;
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.6);
    }
});
