// Game variables
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let playerMoves = { X: [], O: [] };
let blockedCells = { X: [], O: [] };
let gameActive = true;
let isPlayerTurn = true;
let gameMode = 'normal';
let timeLeft = 30;
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
    [0, 4, 8], [2, 4, 6] // diagonals
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
    if (gameBoard[cellIndex] !== '' || blockedCells.X.includes(cellIndex)) return;

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
        }, 1000);
    }
}

// AI makes move
function makeAIMove() {
    if (!gameActive || isPlayerTurn) return;

    let aiMove = findWinningMove('O');
    if (aiMove === -1) aiMove = findWinningMove('X');
    if (aiMove === -1) {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (gameBoard[i] === '' && !blockedCells.O.includes(i)) {
                availableMoves.push(i);
            }
        }
        aiMove = availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : -1;
    }

    if (aiMove !== -1) {
        makeMove(aiMove, 'O');
    }
    
    aiThinking = false;
    isPlayerTurn = true;
    updateDisplay();
}

// Core move logic
function makeMove(cellIndex, player) {
    if (gameMode === 'timed' && timer) clearInterval(timer);
    clearEffects();

    // Handle mark limit
    if (playerMoves[player].length >= 3) {
        const oldestCell = playerMoves[player].shift();
        gameBoard[oldestCell] = '';
        cells[oldestCell].textContent = '';
        cells[oldestCell].classList.remove('x-mark', 'o-mark');
        blockedCells[player] = [oldestCell];
    } else {
        blockedCells[player] = [];
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

// Helper functions
function findWinningMove(player) {
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] !== '' || blockedCells[player].includes(i)) continue;
        
        gameBoard[i] = player;
        const isWin = winningLines.some(line => 
            line.every(index => gameBoard[index] === player)
        );
        gameBoard[i] = '';
        
        if (isWin) return i;
    }
    return -1;
}

function checkGameEnd() {
    // Check for winner
    for (const line of winningLines) {
        const [a, b, c] = line;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            endGame(gameBoard[a]);
            return;
        }
    }

    // Check for draw
    const canPlayerMove = gameBoard.some((cell, i) => cell === '' && !blockedCells.X.includes(i));
    const canAIMove = gameBoard.some((cell, i) => cell === '' && !blockedCells.O.includes(i));
    
    if (!canPlayerMove && !canAIMove) {
        endGame(null);
    }
}

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

// Display updates
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
        cell.classList.toggle('blocked', 
            blockedCells.X.includes(index) || blockedCells.O.includes(index)
        );
        cell.classList.remove('oldest');
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
    timeLeft = 30;
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
    blockedCells = { X: [], O: [] };
    gameActive = true;
    isPlayerTurn = true;
    timeLeft = 30;
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

// Start game
document.addEventListener('DOMContentLoaded', startGame);