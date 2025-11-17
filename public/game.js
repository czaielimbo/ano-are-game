const socket = io();

// Game state
let currentRoom = null;
let playerName = '';
let isDrawer = false;
let isDrawing = false;
let currentColor = '#000000';
let brushSize = 3;

// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Initialize canvas
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Elements
const lobbyScreen = document.getElementById('lobby');
const gameScreen = document.getElementById('game');
const playerNameInput = document.getElementById('playerName');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const joinRoomInput = document.getElementById('joinRoomInput');
const roomCodeInput = document.getElementById('roomCode');
const confirmJoinBtn = document.getElementById('confirmJoinBtn');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const copyRoomCodeBtn = document.getElementById('copyRoomCodeBtn');
const gameStatus = document.getElementById('gameStatus');
const wordDisplay = document.getElementById('wordDisplay');
const drawingTools = document.getElementById('drawingTools');
const canvasOverlay = document.getElementById('canvasOverlay');
const drawerControls = document.getElementById('drawerControls');
const wordInput = document.getElementById('wordInput');
const getRandomWordBtn = document.getElementById('getRandomWordBtn');
const startRoundBtn = document.getElementById('startRoundBtn');
const endRoundBtn = document.getElementById('endRoundBtn');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const colorBtns = document.querySelectorAll('.color-btn');
const playerList = document.getElementById('playerList');
const chatMessages = document.getElementById('chatMessages');
const guessInput = document.getElementById('guessInput');
const guessText = document.getElementById('guessText');
const submitGuessBtn = document.getElementById('submitGuessBtn');

// Event Listeners
createRoomBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }
    playerName = name;
    socket.emit('create-room', playerName);
});

joinRoomBtn.addEventListener('click', () => {
    joinRoomInput.classList.toggle('hidden');
});

confirmJoinBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    const code = roomCodeInput.value.trim().toUpperCase();

    if (!name) {
        alert('Please enter your name');
        return;
    }
    if (!code) {
        alert('Please enter room code');
        return;
    }

    playerName = name;
    socket.emit('join-room', { roomCode: code, playerName });
});

copyRoomCodeBtn.addEventListener('click', () => {
    if (currentRoom) {
        navigator.clipboard.writeText(currentRoom.code);
        copyRoomCodeBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyRoomCodeBtn.textContent = 'Copy Code';
        }, 2000);
    }
});

getRandomWordBtn.addEventListener('click', () => {
    socket.emit('get-random-word');
});

startRoundBtn.addEventListener('click', () => {
    const word = wordInput.value.trim();
    if (!word) {
        alert('Please enter a word');
        return;
    }
    socket.emit('start-round', { roomCode: currentRoom.code, word });
});

endRoundBtn.addEventListener('click', () => {
    socket.emit('end-round', { roomCode: currentRoom.code });
});

brushSizeInput.addEventListener('input', (e) => {
    brushSize = e.target.value;
    brushSizeValue.textContent = brushSize;
});

clearCanvasBtn.addEventListener('click', () => {
    clearCanvas();
    socket.emit('clear-canvas', { roomCode: currentRoom.code });
});

colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.dataset.color;
    });
});

submitGuessBtn.addEventListener('click', submitGuess);
guessText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitGuess();
    }
});

function submitGuess() {
    const guess = guessText.value.trim();
    if (!guess) return;

    socket.emit('guess', { roomCode: currentRoom.code, guess });
    guessText.value = '';
}

// Canvas Drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

function startDrawing(e) {
    if (!isDrawer) return;

    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing || !isDrawer) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();

    // Broadcast drawing
    socket.emit('draw', {
        roomCode: currentRoom.code,
        drawData: {
            x0: x - e.movementX,
            y0: y - e.movementY,
            x1: x,
            y1: y,
            color: currentColor,
            size: brushSize
        }
    });
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.beginPath();
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Socket Events
socket.on('room-created', ({ roomCode, room }) => {
    currentRoom = room;
    isDrawer = true;
    switchToGameScreen();
});

socket.on('room-joined', ({ roomCode, room }) => {
    currentRoom = room;
    const player = room.players.find(p => p.id === socket.id);
    isDrawer = player ? player.isDrawer : false;
    switchToGameScreen();
});

socket.on('player-joined', (room) => {
    currentRoom = room;
    updatePlayerList();
    addSystemMessage('A new player joined the game!');
});

socket.on('player-left', (room) => {
    currentRoom = room;
    updatePlayerList();
    addSystemMessage('A player left the game');
});

socket.on('round-started', ({ drawerId, drawerName, wordLength, hint, currentRound, totalRounds }) => {
    isDrawer = socket.id === drawerId;
    clearCanvas();
    chatMessages.innerHTML = '';

    if (isDrawer) {
        gameStatus.textContent = `Round ${currentRound}/${totalRounds} - You are drawing!`;
        wordDisplay.classList.add('hidden');
        drawingTools.classList.remove('hidden');
        canvasOverlay.classList.add('hidden');
        drawerControls.classList.add('hidden');
        guessInput.classList.add('hidden');
        endRoundBtn.classList.remove('hidden');
        canvas.style.cursor = 'crosshair';
    } else {
        gameStatus.textContent = `Round ${currentRound}/${totalRounds} - ${drawerName} is drawing! Guess the word (${wordLength} letters)`;
        wordDisplay.textContent = hint;
        wordDisplay.classList.remove('hidden');
        drawingTools.classList.add('hidden');
        canvasOverlay.classList.remove('hidden');
        drawerControls.classList.add('hidden');
        guessInput.classList.remove('hidden');
        canvas.style.cursor = 'default';
    }
});

socket.on('your-word', (word) => {
    wordDisplay.textContent = `Draw: ${word}`;
    wordDisplay.classList.remove('hidden');
});

socket.on('drawing', (drawData) => {
    ctx.strokeStyle = drawData.color;
    ctx.lineWidth = drawData.size;
    ctx.beginPath();
    ctx.moveTo(drawData.x0, drawData.y0);
    ctx.lineTo(drawData.x1, drawData.y1);
    ctx.stroke();
});

socket.on('canvas-cleared', () => {
    clearCanvas();
});

socket.on('new-guess', ({ playerName, guess }) => {
    addChatMessage(`${playerName}: ${guess}`);
});

socket.on('correct-guess', ({ playerId, playerName, points, leaderboard }) => {
    currentRoom.players = leaderboard;
    updatePlayerList();
    addSystemMessage(`${playerName} guessed correctly! +${points} points`, 'correct');

    if (playerId === socket.id) {
        guessInput.classList.add('hidden');
        gameStatus.textContent = 'You guessed it! Waiting for others...';
    }
});

socket.on('round-ended', ({ word, leaderboard }) => {
    currentRoom.players = leaderboard;
    updatePlayerList();
    addSystemMessage(`Round ended! The word was: ${word}`, 'correct');

    gameStatus.textContent = 'Round ended - Next drawer coming up...';
    drawingTools.classList.add('hidden');
    canvasOverlay.classList.remove('hidden');
    guessInput.classList.add('hidden');
    endRoundBtn.classList.add('hidden');
    drawerControls.classList.add('hidden');
    wordDisplay.classList.add('hidden');
});

socket.on('drawer-changed', ({ room, newDrawerId, newDrawerName, currentRound, totalRounds }) => {
    currentRoom = room;
    const player = room.players.find(p => p.id === socket.id);
    isDrawer = player ? player.isDrawer : false;
    updatePlayerList();

    clearCanvas();
    addSystemMessage(`${newDrawerName} is now the drawer!`, 'system');

    if (isDrawer) {
        gameStatus.textContent = `Round ${currentRound}/${totalRounds} - You are the drawer! Enter a word to start.`;
        drawerControls.classList.remove('hidden');
        canvasOverlay.classList.add('hidden');
        wordInput.value = '';
    } else {
        gameStatus.textContent = `Round ${currentRound}/${totalRounds} - Waiting for ${newDrawerName} to start...`;
        drawerControls.classList.add('hidden');
        canvasOverlay.classList.remove('hidden');
    }
});

socket.on('game-ended', ({ finalLeaderboard, message }) => {
    currentRoom.players = finalLeaderboard;
    updatePlayerList();

    // Clear the canvas and hide all controls
    clearCanvas();
    drawingTools.classList.add('hidden');
    canvasOverlay.classList.remove('hidden');
    guessInput.classList.add('hidden');
    endRoundBtn.classList.add('hidden');
    drawerControls.classList.add('hidden');
    wordDisplay.classList.add('hidden');

    // Show game over message
    gameStatus.textContent = message;
    addSystemMessage(message, 'correct');

    // Display winner
    const winner = finalLeaderboard[0];
    addSystemMessage(`🏆 Winner: ${winner.name} with ${winner.score} points!`, 'correct');

    // Show overlay with game over
    const overlayContent = canvasOverlay.querySelector('.overlay-content');
    overlayContent.innerHTML = `
        <h3>🎉 Game Over! 🎉</h3>
        <p>Winner: ${winner.name}</p>
        <p>Score: ${winner.score} points</p>
        <button class="btn btn-primary" onclick="location.reload()">Play Again</button>
    `;
    canvasOverlay.classList.remove('hidden');
});

socket.on('random-word', (word) => {
    wordInput.value = word;
});

socket.on('error', (message) => {
    alert('Error: ' + message);
});

// Helper Functions
function switchToGameScreen() {
    lobbyScreen.classList.remove('active');
    gameScreen.classList.add('active');
    roomCodeDisplay.textContent = currentRoom.code;
    updatePlayerList();

    const roundInfo = `Round ${currentRoom.currentRound}/${currentRoom.totalRounds}`;

    if (isDrawer) {
        gameStatus.textContent = `${roundInfo} - You are the drawer! Enter a word to start.`;
        drawerControls.classList.remove('hidden');
        canvasOverlay.classList.add('hidden');
        drawingTools.classList.add('hidden');
    } else {
        gameStatus.textContent = `${roundInfo} - Waiting for drawer to start...`;
        drawerControls.classList.add('hidden');
        canvasOverlay.classList.remove('hidden');
        drawingTools.classList.add('hidden');
    }
}

function updatePlayerList() {
    playerList.innerHTML = '';

    // Sort by score
    const sortedPlayers = [...currentRoom.players].sort((a, b) => b.score - a.score);

    sortedPlayers.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';

        if (player.isDrawer) {
            playerDiv.classList.add('drawer');
        }

        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;

        playerDiv.innerHTML = `
            <span class="player-name">${medal} ${player.name}${player.isDrawer ? ' 🎨' : ''}</span>
            <span class="player-score">${player.score}</span>
        `;

        playerList.appendChild(playerDiv);
    });
}

function addChatMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(message, type = 'system') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
