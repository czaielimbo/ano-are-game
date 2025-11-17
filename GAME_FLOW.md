# Ano Are - Game Flow Documentation

## Overview
Ano Are is a round-robin drawing and guessing game where every player gets a turn to draw. The game automatically rotates through all players and ends when everyone has had a turn.

## Game Lifecycle

### 1. Room Creation
- First player creates a room and receives a unique 6-character code
- They become the initial drawer
- Room settings initialized:
  - Current Round: 1
  - Total Rounds: 1 (updates as players join)

### 2. Players Join
- Other players join using the room code
- Each new player increases the total rounds count
- Total Rounds = Number of Players
- Example: 4 players = 4 rounds (everyone draws once)

### 3. Round Start
**Drawer's view:**
- Enters a word (or uses random word button)
- Clicks "Start Round"
- Can draw on canvas with various tools
- Can end round manually with "End Round" button

**Guessers' view:**
- See the drawer's name and round progress
- See hint (first letter + underscores)
- Watch the drawing update in real-time
- Type guesses in the chat box

### 4. During the Round
**Scoring System:**
- Base Points: 100 points for correct guess
- Time Bonus: Up to 100 additional points
  - Formula: 100 - (seconds elapsed)
  - Faster guesses = higher bonus
  - Example: Guess at 10 seconds = 100 + 90 = 190 points

**Real-time Updates:**
- All guesses appear in the chat
- Correct guesses are highlighted
- Leaderboard updates immediately
- Players who guessed correctly cannot guess again

### 5. Round End Conditions
A round ends when:
1. All non-drawer players have guessed correctly, OR
2. The drawer clicks "End Round"

**When round ends:**
- Word is revealed to all players
- Final scores are shown
- 3-second countdown to next round
- Message: "Round ended - Next drawer coming up..."

### 6. Drawer Rotation (Automatic)
After the 3-second delay:
1. System marks current drawer as "hasDrawn"
2. Finds next player who hasn't drawn yet
3. Assigns them as the new drawer
4. Increments round counter
5. Clears the canvas
6. All players notified: "[Name] is now the drawer!"
7. New drawer enters a word to start their round

### 7. Game End
**Trigger:** All players have had their turn to draw

**What happens:**
1. Game state changes to "gameEnded"
2. Final scores calculated
3. Winner determined (highest score)
4. Game Over screen appears with:
   - "🎉 Game Over! 🎉"
   - Winner's name and score
   - "Play Again" button
5. Chat shows:
   - "Game Over! Everyone has had a turn to draw."
   - "🏆 Winner: [Name] with [Score] points!"

### 8. Play Again
- Clicking "Play Again" reloads the page
- Players can create a new room or join another

## UI Elements

### Status Bar
Shows current game state:
- Waiting: "Round 1/4 - Waiting for drawer to start..."
- Drawing: "Round 2/4 - You are drawing!"
- Guessing: "Round 2/4 - Alice is drawing! Guess the word (5 letters)"
- Round End: "Round ended - Next drawer coming up..."
- Game End: "Game Over! Everyone has had a turn to draw."

### Leaderboard
- Always visible on the right
- Sorted by score (highest first)
- Shows medals for top 3:
  - 🥇 First place
  - 🥈 Second place
  - 🥉 Third place
- Current drawer marked with 🎨
- Updates in real-time

### Chat/Guesses Panel
- Shows all guesses
- Highlights correct guesses in green
- System messages in yellow
- Auto-scrolls to latest

## Example Game with 3 Players

**Players:** Alice, Bob, Charlie

**Round 1:**
- Drawer: Alice
- Status: "Round 1/3 - Alice is drawing"
- Alice draws "cat"
- Bob guesses in 5 seconds → +195 points
- Charlie guesses in 12 seconds → +188 points
- Round ends automatically
- 3-second pause

**Round 2:**
- Drawer: Bob (automatically)
- Status: "Round 2/3 - Bob is drawing"
- Bob draws "tree"
- Alice guesses in 8 seconds → +192 points
- Charlie guesses in 15 seconds → +185 points
- Round ends
- 3-second pause

**Round 3:**
- Drawer: Charlie (automatically)
- Status: "Round 3/3 - Charlie is drawing"
- Charlie draws "phone"
- Alice guesses in 6 seconds → +194 points
- Bob guesses in 10 seconds → +190 points
- Round ends
- Game detects all players have drawn

**Game Over:**
- Final Scores:
  - Alice: 386 points 🥇
  - Bob: 385 points 🥈
  - Charlie: 373 points 🥉
- Winner announcement: "🏆 Winner: Alice with 386 points!"
- Play Again button appears

## Technical Implementation

### Server State (per room)
```javascript
{
  code: "ABC123",
  players: [{
    id: "socket_id",
    name: "Alice",
    score: 386,
    isDrawer: false,
    hasDrawn: true
  }],
  currentWord: "phone",
  currentDrawer: "socket_id",
  currentDrawerIndex: 2,
  currentRound: 3,
  totalRounds: 3,
  roundStartTime: 1234567890,
  correctGuessers: ["socket_id1", "socket_id2"],
  gameStarted: true,
  gameEnded: true
}
```

### Key Events

**Server → Client:**
- `room-created` - Room successfully created
- `room-joined` - Player joined room
- `player-joined` - Notify others of new player
- `round-started` - Round begins, send hints
- `drawing` - Broadcast drawing strokes
- `new-guess` - Player submitted a guess
- `correct-guess` - Guess was correct, award points
- `round-ended` - Round finished, reveal word
- `drawer-changed` - New drawer assigned
- `game-ended` - All players have drawn

**Client → Server:**
- `create-room` - Create new game room
- `join-room` - Join existing room
- `start-round` - Drawer starts with word
- `draw` - Send drawing stroke data
- `clear-canvas` - Clear the canvas
- `guess` - Submit a guess
- `end-round` - Drawer ends round early
- `get-random-word` - Request random word

## Best Practices

### For Players
1. **Be creative** with your drawings
2. **Give clear hints** through your art
3. **Guess quickly** for bonus points
4. **Wait your turn** - everyone gets to draw!

### For Hosts
1. **Share the room code** via chat/text
2. **Wait for all players** before starting
3. **Use random words** if you can't think of one
4. **Be patient** - game auto-advances between rounds

## Troubleshooting

**Round not starting?**
- Make sure the drawer has entered a word and clicked "Start Round"

**Drawer stuck?**
- Drawer can click "End Round" to move on
- Game auto-advances after everyone guesses

**Player disconnected?**
- If drawer leaves, first remaining player becomes drawer
- Empty rooms are automatically deleted

**Game feels too long?**
- Drawer can end rounds early
- Consider smaller groups (2-4 players ideal)

## Future Enhancements

Potential additions:
- Round timer (60-90 seconds per round)
- Word categories/difficulty levels
- Hint system (reveal letters over time)
- Drawing replay at game end
- Save/share game results
- Rematch option (same players, new game)
