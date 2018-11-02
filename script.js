const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');

const row = 20;
const column = 10;

const tileSize = 20;

const vacant = 'white';

// Draw Square
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  ctx.strokeStyle = 'grey';
  ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
}

// Create the Grid
let grid = [];

for (let r = 0; r < row; r += 1) {
  grid[r] = [];
  for (let c = 0; c < column; c += 1) {
    grid[r][c] = vacant;
  }
}

// Draw the Grid
function drawGrid() {
  for (let r = 0; r < row; r += 1) {
    for (let c = 0; c < column; c += 1) {
      drawSquare(c, r, grid[r][c]);
    }
  }
}

drawGrid();

// Initializing the pieces and their colors
const pieces = [
  [T,'rgb(83, 164, 81'],
  [O,'rgb(64, 86, 55'],
  [L,'grey'],
  [I,'rgb(43, 51, 27'],
];

// Generate random pieces
function randomPiece() {
  const r = Math.floor(Math.random() * pieces.length);
  return new Piece(pieces[r][0], pieces[r][1]);
}

let p = randomPiece();

// Piece Constructor
function Piece (tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;
  // Start from the first matrix of the selected tetromino
  this.tetrominoN = 0;
  this.activeTetromino = this.tetromino[this.tetrominoN];
  // Default Position (right on top of the grid)
  this.x = 3;
  this.y = -2;
}

// Fill function
Piece.prototype.fill = function (color) {
  for (let r = 0; r < this.activeTetromino.length; r += 1) {
    for (let c = 0; c < this.activeTetromino.length; c += 1) {
      // Only draw occupied squares (true = occupied)
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};

// Draw a piece to the grid
Piece.prototype.draw = function () {
  this.fill(this.color);
};

// Undraw a piece from the grid
Piece.prototype.unDraw = function () {
  this.fill(vacant);
};

// Move piece down
Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y += 1;
    this.draw();
  } else {
    // Lock the piece and generate a new one
    this.lock();
    p = randomPiece();
  }
};

// Move piece right
Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x += 1;
    this.draw();
  }
};

// Move piece left
Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x -= 1;
    this.draw();
  }
};

// Rotate piece
Piece.prototype.rotate = function () {
  let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
  let kick = 0;

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > column / 2) {
      // Right wall -> Move piece to the left
      kick = -1;
    } else {
      // Left wall -> Move iece to the right
      kick = 1;
    }
  }
  if (!this.collision(kick, 0, nextPattern)) {
    this.unDraw();
    this.x += kick;
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
};

// LOCK BOTTOM PIECES TO GRID
let score = 0;

Piece.prototype.lock = function () {
  for (let r = 0; r < this.activeTetromino.length; r += 1) {
    for (let c = 0; c < this.activeTetromino.length; c += 1) {
      // Skip the vacant squares
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // Pieces to lock on top = game over
      if (this.y + r < 0) {
        alert("Game Over");
        // Stop request animation frame
        gameOver = true;
        // Update player's score
        if (session === 1) {
          player.player1 = score;
          session = 2; 
        } else {
          player.player2 = score;
          session = 1;
        }
        console.log(player);
        this.lock = [];
        break;
      }
      // Lock the piece
      grid[this.y + r][this.x + c] = this.color;
    }
  }
  // Remove full rows
  for (let r = 0; r < row; r += 1) {
    let isrowFull = true;
    for (let c = 0; c < column; c += 1) {
      isrowFull = isrowFull && (grid[r][c] !== vacant);
    }
    if (isrowFull) {
      // If the row is full -> move down all the rows above it
      for (let y = r; y > 1; y -= 1) {
        for (let c = 0; c < column; c += 1) {
          grid[y][c] = grid[y - 1][c];
        }
      }
      // The top row grid[0][..] has no row above it
      for (let c = 0; c < column; c += 1) {
        grid[0][c] = vacant;
      }
      // Increment the score
      score += 10;
    }
  }
  // Update the grid
  drawGrid();
  // Update the score
  scoreElement.innerHTML = score;
  winner();
};

// Collision function
Piece.prototype.collision = function (x, y, piece) {
  for (let r = 0; r < piece.length; r += 1) {
    for (let c = 0; c < piece.length; c += 1) {
      // If the square is empty, skip it
      if (!piece[r][c]) {
        continue;
      }
      // Coordinates of the piece after movement
      let newX = this.x + c + x;
      let newY = this.y + r + y;               
      // Conditions
      if (newX < 0 || newX >= column || newY >= row) {
        return true;
      }
      // Skip newY < 0; grid[-1] will crush the game
      if (newY < 0) {
        continue;
      }
      // Check if there is a locked piece already in place
      if (grid[newY][newX] !== vacant) {
        return true;
      }
    }
  }
  return false;
};

// Control piece
document.addEventListener('keydown', control);

function control(event) {
  if (event.keyCode === 37) {
    p.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode === 38) {
    p.rotate();
    dropStart = Date.now();
  } else if (event.keyCode === 39) {
    p.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode === 40) {
    p.moveDown();
  }
}

// Drop piece every second
let dropStart = Date.now();
let gameOver = false;

function drop() {
  const now = Date.now();
  const delta = now - dropStart;
  if (delta > 1000) {
    p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}

document.getElementById('start').onclick = function () {
  drop();
  undraw();
}

let player = {
  player1: 0,
  player2: 0
}

let session = 1;

function winner () {
  if (player.player1 > player.player2) {
    alert('Player 1 Win`s!');
    return player.player1;
  }
  if (player.player2 > player.player1) {
    alert('Player 2 Win`s!');
    return player.player2;
  } if (player.player1 !== 0 && player.player2 !== 0 && player.player1 === player.player2) {
    alert('Draw, play again!');
  }
}
