// Game variables
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let playerMoves = { X: [], O: [] };
let gameActive = true;
let isPlayerTurn = true;
let gameMode = 'normal';
let timeLeft = 5;
let timer = null;
let aiThinking = false;

// DOM elements
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turnIndicator');
const gameStatus = document.getElementById('gameStatus');
const playerMarksDisplay = document.getElementById('playerMarks');
const aiMarksDisplay = document.getElementById('aiMarks');
const gameModeSelect = document.getElementById('gameMode');
const timerDisplay = document.getElementById('timerDisplay');
const timeLeftDisplay = document.getElementById('timeLeft');

// Winning combinations
const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

// Initialize game
function startGame() {
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => playerClick(index));
    });
    
    gameModeSelect.addEventListener('change', (e) => {
        gameMode = e.target.value;
        resetGame();
    });
    
    updateDisplay();
}

// Handle player move
function playerClick(cellIndex) {
    if (!gameActive || !isPlayerTurn || aiThinking) return;
    if (gameBoard[cellIndex] !== '') return;

    makeMove(cellIndex, 'X');
    
    if (gameActive) {
        isPlayerTurn = false;
        updateDisplay();
        
        setTimeout(() => {
            if (gameActive) {
                aiThinking = true;
                updateDisplay();
                makeAIMove();
            }
        }, 500);
    }
}

// AI makes move using Minimax
function makeAIMove() {
    if (!gameActive || isPlayerTurn) return;

    const { move } = minimax(gameBoard.slice(), 0, true);

    if (move !== -1) {
        makeMove(move, 'O');
    }

    aiThinking = false;
    isPlayerTurn = true;
    updateDisplay();
}

// Core move logic
function makeMove(cellIndex, player) {
    if (gameMode === 'timed' && timer) clearInterval(timer);
    clearEffects();

    // Handle mark limit (3 marks max per player)
    if (playerMoves[player].length >= 3) {
        const oldestCell = playerMoves[player].shift();
        gameBoard[oldestCell] = '';
        cells[oldestCell].textContent = '';
        cells[oldestCell].classList.remove('x-mark', 'o-mark');
    }

    // Place new mark
    gameBoard[cellIndex] = player;
    playerMoves[player].push(cellIndex);
    cells[cellIndex].textContent = player;
    cells[cellIndex].classList.add(player === 'X' ? 'x-mark' : 'o-mark');

    updateDisplay();
    checkGameEnd();

    if (gameActive && gameMode === 'timed') startTimer();
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    const winner = checkWinner(board);
    if (winner !== null) {
        if (winner === 'O') return { score: 10 - depth };
        if (winner === 'X') return { score: depth - 10 };
        return { score: 0 }; // draw
    }

    const availableMoves = board.map((val, idx) => val === '' ? idx : null).filter(idx => idx !== null);

    if (isMaximizing) {
        let bestScore = -Infinity;
        let bestMove = -1;
        for (let move of availableMoves) {
            board[move] = 'O';
            const result = minimax(board, depth + 1, false);
            board[move] = '';
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = move;
            }
        }
        return { score: bestScore, move: bestMove };
    } else {
        let bestScore = Infinity;
        let bestMove = -1;
        for (let move of availableMoves) {
            board[move] = 'X';
            const result = minimax(board, depth + 1, true);
            board[move] = '';
            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = move;
            }
        }
        return { score: bestScore, move: bestMove };
    }
}

// Check winner or draw
function checkWinner(board) {
    for (const [a, b, c] of winningLines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (board.every(cell => cell !== '')) {
        return 'Draw';
    }

    return null;
}

// Check for game end (win or draw)
function checkGameEnd() {
    const winner = checkWinner(gameBoard);
    if (winner === 'X' || winner === 'O') {
        endGame(winner);
    } else if (winner === 'Draw') {
        endGame(null);
    }
}

// End game display
function endGame(winner) {
    gameActive = false;
    aiThinking = false;
    if (timer) clearInterval(timer);

    if (winner === 'X') {
        gameStatus.textContent = 'You Win!';
        gameStatus.className = 'game-status winner';
        turnIndicator.textContent = 'You Win!';
        turnIndicator.className = 'turn-indicator winner';
    } else if (winner === 'O') {
        gameStatus.textContent = 'AI Wins!';
        gameStatus.className = 'game-status loser';
        turnIndicator.textContent = 'AI Wins!';
        turnIndicator.className = 'turn-indicator loser';
    } else {
        gameStatus.textContent = "It's a Draw!";
        gameStatus.className = 'game-status';
        turnIndicator.textContent = "It's a Draw!";
        turnIndicator.className = 'turn-indicator';
    }
}

// Update UI display
function updateDisplay() {
    // Turn indicator
    if (gameActive) {
        if (aiThinking) {
            turnIndicator.textContent = 'AI is thinking...';
            turnIndicator.className = 'turn-indicator ai-turn';
        } else if (isPlayerTurn) {
            turnIndicator.textContent = 'Your Turn (X)';
            turnIndicator.className = 'turn-indicator player-turn';
        } else {
            turnIndicator.textContent = 'AI Turn (O)';
            turnIndicator.className = 'turn-indicator ai-turn';
        }
    }

    // Marks count
    playerMarksDisplay.textContent = `Marks: ${playerMoves.X.length}/3`;
    aiMarksDisplay.textContent = `Marks: ${playerMoves.O.length}/3`;

    // Timer display
    timerDisplay.classList.toggle('show', gameMode === 'timed' && gameActive);

    // Board state
    cells.forEach((cell, index) => {
        cell.classList.remove('blocked', 'oldest');
    });

    // Highlight oldest marks
    if (playerMoves.X.length === 3) {
        cells[playerMoves.X[0]].classList.add('oldest');
    }
    if (playerMoves.O.length === 3) {
        cells[playerMoves.O[0]].classList.add('oldest');
    }
}

// Timer functions
function startTimer() {
    timeLeft = 5;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) handleTimeOut();
    }, 1000);
}

function updateTimerDisplay() {
    timeLeftDisplay.textContent = timeLeft;
    timerDisplay.querySelector('.timer').classList.toggle('warning', timeLeft <= 10);
}

function handleTimeOut() {
    clearInterval(timer);
    if (!gameActive) return;
    
    endGame(isPlayerTurn ? 'O' : 'X');
}

// Utility functions
function clearEffects() {
    cells.forEach(cell => cell.classList.remove('oldest'));
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    playerMoves = { X: [], O: [] };
    gameActive = true;
    isPlayerTurn = true;
    timeLeft = 5;
    aiThinking = false;

    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    gameStatus.textContent = '';
    gameStatus.className = 'game-status';
    turnIndicator.textContent = 'Your Turn (X)';
    turnIndicator.className = 'turn-indicator player-turn';

    updateDisplay();
    if (gameMode === 'timed') startTimer();
}

// Start game on page load
document.addEventListener('DOMContentLoaded', startGame);