const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// In-memory game rooms
const rooms = new Map();

// Generate a random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Word bank
const wordBank = [
  'cat', 'dog', 'house', 'car', 'tree', 'sun', 'moon', 'star',
  'flower', 'book', 'phone', 'computer', 'pizza', 'hamburger',
  'apple', 'banana', 'guitar', 'piano', 'mountain', 'ocean',
  'rainbow', 'butterfly', 'elephant', 'giraffe', 'penguin'
];

function getRandomWord() {
  return wordBank[Math.floor(Math.random() * wordBank.length)];
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create-room', (playerName) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      players: [{
        id: socket.id,
        name: playerName,
        score: 0,
        isDrawer: true
      }],
      currentWord: '',
      currentDrawer: socket.id,
      roundStartTime: null,
      correctGuessers: []
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.emit('room-created', { roomCode, room });
    console.log(`Room created: ${roomCode}`);
  });

  // Join existing room
  socket.on('join-room', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    // Check if player already in room
    if (room.players.find(p => p.id === socket.id)) {
      socket.emit('error', 'Already in room');
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName,
      score: 0,
      isDrawer: false
    });

    socket.join(roomCode);
    socket.emit('room-joined', { roomCode, room });
    io.to(roomCode).emit('player-joined', room);
    console.log(`Player ${playerName} joined room: ${roomCode}`);
  });

  // Start drawing round
  socket.on('start-round', ({ roomCode, word }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isDrawer) {
      socket.emit('error', 'Only the drawer can start the round');
      return;
    }

    room.currentWord = word.toLowerCase();
    room.roundStartTime = Date.now();
    room.correctGuessers = [];

    // Notify all players that round started
    io.to(roomCode).emit('round-started', {
      drawerId: socket.id,
      wordLength: word.length,
      hint: word.split('').map((c, i) => i === 0 ? c : '_').join('')
    });

    // Send word only to drawer
    socket.emit('your-word', word);
  });

  // Handle drawing
  socket.on('draw', ({ roomCode, drawData }) => {
    socket.to(roomCode).emit('drawing', drawData);
  });

  // Clear canvas
  socket.on('clear-canvas', ({ roomCode }) => {
    io.to(roomCode).emit('canvas-cleared');
  });

  // Handle guesses
  socket.on('guess', ({ roomCode, guess }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // Don't let drawer guess
    if (player.isDrawer) return;

    // Check if already guessed correctly
    if (room.correctGuessers.includes(socket.id)) return;

    // Broadcast the guess to all players
    io.to(roomCode).emit('new-guess', {
      playerName: player.name,
      guess: guess
    });

    // Check if guess is correct
    if (guess.toLowerCase().trim() === room.currentWord) {
      // Calculate points based on time
      const timeElapsed = Date.now() - room.roundStartTime;
      const basePoints = 100;
      const timeBonus = Math.max(0, 100 - Math.floor(timeElapsed / 1000));
      const points = basePoints + timeBonus;

      player.score += points;
      room.correctGuessers.push(socket.id);

      // Notify all players of correct guess
      io.to(roomCode).emit('correct-guess', {
        playerId: socket.id,
        playerName: player.name,
        points: points,
        leaderboard: room.players.sort((a, b) => b.score - a.score)
      });

      // If everyone guessed, end round
      const nonDrawers = room.players.filter(p => !p.isDrawer);
      if (room.correctGuessers.length === nonDrawers.length) {
        io.to(roomCode).emit('round-ended', {
          word: room.currentWord,
          leaderboard: room.players.sort((a, b) => b.score - a.score)
        });
      }
    }
  });

  // End round manually
  socket.on('end-round', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isDrawer) return;

    io.to(roomCode).emit('round-ended', {
      word: room.currentWord,
      leaderboard: room.players.sort((a, b) => b.score - a.score)
    });
  });

  // Change drawer
  socket.on('change-drawer', ({ roomCode, newDrawerId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    // Reset all players' drawer status
    room.players.forEach(p => p.isDrawer = false);

    // Set new drawer
    const newDrawer = room.players.find(p => p.id === newDrawerId);
    if (newDrawer) {
      newDrawer.isDrawer = true;
      room.currentDrawer = newDrawerId;
      io.to(roomCode).emit('drawer-changed', room);
    }
  });

  // Get random word
  socket.on('get-random-word', () => {
    socket.emit('random-word', getRandomWord());
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove player from all rooms
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        // If room is empty, delete it
        if (room.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted (empty)`);
        } else {
          // If drawer left, assign new drawer
          if (room.currentDrawer === socket.id && room.players.length > 0) {
            room.players[0].isDrawer = true;
            room.currentDrawer = room.players[0].id;
          }
          io.to(roomCode).emit('player-left', room);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
