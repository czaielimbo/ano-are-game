# Ano Are - Drawing & Guessing Game

A real-time multiplayer drawing and guessing game where one player draws while others try to guess the word. Built with HTML Canvas, Node.js, Express, and Socket.io.

## Features

- **Real-time multiplayer gameplay** using WebSocket connections
- **Shareable room codes** - create a room and share the code with friends
- **Drawing tools** with adjustable brush size, multiple colors
- **Time-based scoring** - faster guesses earn more points
- **Live leaderboard** - see rankings update in real-time
- **No database required** - all game data is stored in memory
- **Responsive design** - works on desktop and mobile devices

## Tech Stack

- **Frontend**: HTML5 Canvas, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Real-time**: Socket.io
- **No database** - all data stored in memory (temporary)

## Installation

1. **Install Node.js** if you haven't already (https://nodejs.org/)

2. **Install dependencies**:
```bash
npm install
```

## Running the Game

1. **Start the server**:
```bash
npm start
```

2. **Open your browser** and go to:
```
http://localhost:3000
```

3. **For development** (with auto-restart on file changes):
```bash
npm run dev
```

## How to Play

### Creating a Game

1. Enter your name
2. Click "Create Room"
3. Share the room code with your friends
4. As the drawer, enter a word (or click "Random Word")
5. Click "Start Round" to begin drawing

### Joining a Game

1. Enter your name
2. Click "Join Room"
3. Enter the room code shared by your friend
4. Wait for the drawer to start the round
5. Type your guesses in the chat

### Scoring

- **Base points**: 100 points for correct guess
- **Time bonus**: Up to 100 additional points based on how fast you guess
- **Faster guesses = Higher scores!**

### Drawing Tools

- **Brush Size**: Adjust from 1 to 20
- **Colors**: 9 different colors to choose from
- **Clear Canvas**: Start over with a blank canvas

## Game Rules

1. One player is designated as the "drawer"
2. The drawer chooses a word and draws it
3. Other players try to guess the word by typing in chat
4. Correct guesses earn points (faster = more points)
5. Round ends when everyone guesses or drawer ends it manually
6. Players are ranked by total score

## Features Breakdown

### Room System
- Random 6-character room codes
- Players can join/leave rooms freely
- Automatic cleanup of empty rooms

### Drawing Features
- Real-time canvas synchronization
- Smooth drawing with adjustable brush
- Color palette
- Clear canvas option
- Touch support for mobile devices

### Scoring System
- 100 base points for correct guess
- Time bonus: 100 points - (seconds elapsed)
- Real-time leaderboard updates
- Medal indicators (🥇🥈🥉) for top 3 players

### Chat/Guess System
- All guesses visible to all players
- Visual feedback for correct guesses
- System messages for game events

## Customization

### Adding More Words

Edit `server.js` and add words to the `wordBank` array:

```javascript
const wordBank = [
  'cat', 'dog', 'house', 'car', 'tree',
  // Add your words here
];
```

### Changing Port

Set the `PORT` environment variable or edit `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

### Adjusting Scoring

Modify the scoring logic in `server.js` (around line 130):

```javascript
const basePoints = 100;
const timeBonus = Math.max(0, 100 - Math.floor(timeElapsed / 1000));
const points = basePoints + timeBonus;
```

## Project Structure

```
draw/
├── public/
│   ├── index.html      # Main HTML file
│   ├── style.css       # All styles
│   └── game.js         # Client-side game logic
├── server.js           # Server and game logic
├── package.json        # Dependencies
└── README.md          # This file
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (with touch support)

## Known Limitations

- All data is temporary (stored in memory)
- Server restart will clear all rooms and scores
- No persistent user accounts
- No game history

## Future Enhancements

Potential features to add:
- Multiple rounds with automatic drawer rotation
- Round timer
- Word categories/difficulty levels
- Custom word lists per room
- Drawing replay feature
- Private messages
- Better mobile UI
- Game statistics

## Troubleshooting

**Port already in use**:
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm start
```

**Connection issues**:
- Check firewall settings
- Ensure server is running
- Verify correct port number

**Canvas not drawing**:
- Make sure you're the drawer
- Check if round has started
- Try refreshing the page

## License

MIT License - feel free to use and modify for your projects!

## Credits

Created as a real-time multiplayer drawing game demonstration using Socket.io and HTML Canvas.
