
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');

const row = 20;
const column = 10;
const vacant = 'white';

const squareSize = 20;

// Draw a Square
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

// Create Board
const board = [];

for (let r = 0; r < row; r += 1) {
  board[r] = [];
  for (let c = 0; c < column; c += 1) {
    board[r][c] = vacant;
  }
}

// Draw Board
function drawBoard() {
  for (let r = 0; r < row; r += 1) {
    for (let c = 0; c < column; c += 1) {
      drawSquare(c, r, board[r][c]);
    }
  }
}

drawBoard();

// The Pieces and their colors
const pieces = [
  [T, 'purple'],
  [O, 'yellow'],
  [I, 'blue'],
  [L, 'green'],
];

// Piece Class
function Piece(tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;
  this.tetrominoN = 0;
  this.activeTetromino = this.tetronimo[this.tetrominoN];
  this.x = 3;
  this.y = -2;
}

// Generate random
function randomPiece() {
  const randomN = Math.floor(Math.random() * pieces.length);
  return new Piece(pieces[randomN][0], pieces[randomN][1]);
}

// New Piece instance
let p = randomPiece();

// Fill function
Piece.prototype.fill = (color) => {
  for (let r = 0; r < this.activeTetromino; r += 1) {
    for (let c = 0; c < this.activeTetromino; c += 1) {
      // only draw occupied squares
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};

// Draw the piece
Piece.prototype.draw = () => {
  this.fill(this.color);
};

// Undraw the piece
Piece.prototype.unDraw = () => {
  this.fill(vacant);
};

// Move piece down
Piece.prototype.moveDown = () => {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y += 1;
    this.draw();
  } else {
    // lock piece and generate new one
    this.lock();
    p = randomPiece();
  }
};

// Move piece right
Piece.prototype.moveRight = () => {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x += 1;
    this.draw();
  }
};

// Move piece left
Piece.prototype.moveLeft = () => {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x -= 1;
    this.draw();
  }
};

// Rotate piece
Piece.prototype.rotate = () => {
  const nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
  let kick = 0;
  if (this.collision(0, 0, nextPattern)) {
    if (this.x > column / 2) {
      // it's the right wall
      kick = -1; // move the piece to the left
    } else {
      // it's the left wall
      kick = 1; // move the piece to right
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

// Lock pieces
let score = 0;
let gameOver = false;

Piece.prototype.lock = () => {
  for (let r = 0; this.activeTetromino.length; r += 1) {
    for (let c = 0; this.activeTetromino.length; c += 1) {
      // we need to skip vacant squares
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // check if piece is locked on the top -> game over
      if (this.y + r < 0) {
        alert('Game Over');
        // stop request animation frame
        gameOver = true;
        break;
      }
      // we lock the piece
      board[this.y + r][this.x + c] = this.color;
    }
  }
  // remove full rows
  for (let r = 0; r < row; r += 1) {
    let isRowFull = true;
    for (let c = 0; c < column; c += 1) {
      isRowFull = isRowFull && (board[r][c] !== vacant);
    }
    if (isRowFull) {
      // if row is full
      // move down all rows above
      for (let y = r; y > 1; y -= 1) {
        for (let c = 0; c < column; c += 1) {
          board[y][c] = board[y - 1][c];
        }
      }
      // the top row board[0][...] has no row above it
      for (let c = 0; c < column; c += 1) {
        board[0][c] = vacant;
      }
      // increment the score
      score += 10;
    }
  }
  // update the boards
  drawBoard();
  // update the score
  scoreElement.innerHTML = score;
};

// Collision function
Piece.prototype.collision = (x, y, piece) => {
  for (let r = 0; r < piece.length; r += 1) {
    for (let c = 0; c < piece.length; c += 1) {
      // if the square is empty, we skipt it
      if (!piece[r][c]) {
        continue;
      }
      // get coords of the piece after the movement
      const newX = this.x + c + x;
      const newY = this.y + r + y;
      // add conditions
      if (newX < 0 || newX >= column || newY >= row) {
        return true;
      }
      // skip newY < 0 b/c board[-1] will crush the game
      if (newY < 0) {
        continue;
      }
      // check if there is a locked piece in place
      if (board[newX][newY] !== vacant) {
        return true;
      }
    }
  }
  return false;
};

// Control piece
function control(event) {
  if (event.keyCode === 37) {
    p.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode === 38) {
    p.rotate();
    dropStart = Date.now();
  } else if ( event.keyCode === 39) {
    p.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode === 40) {
    p.moveDown();
  }
}

document.addEventListener('keydown', control);

// Drop the piece every 1 second
let dropStart = Date.now();

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

drop();
