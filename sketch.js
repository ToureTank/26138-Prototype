// Game Grid Configuration
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const BOARD_WIDTH = COLS * BLOCK_SIZE;

let grid = [];
let currentPiece;
let score = 0;
let gameOver = false;
let fallSpeed = 30; 

// Animation frame tracking for Bowser laughing
let laughTimer = 0;

// Define the 7 Tetris shapes (Tetrominoes)
const SHAPES = [
  [[1, 1, 1, 1]],                               // I
  [[0, 1, 0], [1, 1, 1]],                       // T
  [[1, 0, 0], [1, 1, 1]],                       // L
  [[0, 0, 1], [1, 1, 1]],                       // J
  [[1, 1], [1, 1]],                             // O
  [[1, 1, 0], [0, 1, 1]],                       // Z
  [[0, 1, 1], [1, 1, 0]]                        // S
];

// Mario Palette Assignment Matrix
const BLOCK_TYPES = [
  { name: 'COIN',       primary: '#fcd116', shadow: '#bfa100', pattern: 'coin' },    // Yellow
  { name: 'BRICK',      primary: '#d84818', shadow: '#801800', pattern: 'brick' },   // Red
  { name: 'QUESTION',   primary: '#fc9838', shadow: '#a04800', pattern: 'question' },// Orange
  { name: 'PIPE',       primary: '#00a800', shadow: '#005800', pattern: 'pipe' },    // Green
  { name: 'ICE',        primary: '#3cbcfc', shadow: '#0068a8', pattern: 'ice' },     // Blue
  { name: 'MUSHROOM',   primary: '#fcb8fc', shadow: '#b844b8', pattern: 'shroom' },  // Pink
  { name: 'PLATFORM',   primary: '#b8b8f8', shadow: '#4444b8', pattern: 'steel' }    // Indigo
];

function setup() {
  createCanvas(BOARD_WIDTH + 160, ROWS * BLOCK_SIZE);
  resetGame();
}

function draw() {
  background(92, 148, 252); // Classic Super Mario Sky Blue Background
  
  // Game Loop Ticks
  if (!gameOver && frameCount % fallSpeed === 0) {
    movePiece(0, 1);
  }

  drawGrid();
  if (currentPiece) {
    currentPiece.show();
  }
  drawSidebar();

  if (gameOver) {
    laughTimer += 0.15;
    drawGameOverScreen();
  }
}

function resetGame() {
  score = 0;
  gameOver = false;
  laughTimer = 0;
  for (let r = 0; r < ROWS; r++) {
    grid[r] = new Array(COLS).fill(0);
  }
  spawnPiece();
}

function spawnPiece() {
  let index = floor(random(SHAPES.length));
  currentPiece = new Piece(SHAPES[index], BLOCK_TYPES[index]);
  
  if (currentPiece.collides(0, 0, currentPiece.matrix)) {
    gameOver = true;
  }
}

function drawGrid() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let x = c * BLOCK_SIZE;
      let y = r * BLOCK_SIZE;
      
      if (grid[r][c] !== 0) {
        renderMarioPixelIcon(x, y, grid[r][c]);
      } else {
        fill(0, 40);
        stroke(92, 148, 252);
        strokeWeight(1);
        rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function renderMarioPixelIcon(x, y, typeInfo) {
  push();
  translate(x, y);
  
  fill(typeInfo.primary);
  noStroke();
  rect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
  
  fill(typeInfo.shadow);
  rect(BLOCK_SIZE - 4, 0, 4, BLOCK_SIZE);
  rect(0, BLOCK_SIZE - 4, BLOCK_SIZE, 4);
  
  fill(255, 180);
  rect(0, 0, BLOCK_SIZE, 3);
  rect(0, 0, 3, BLOCK_SIZE);

  if (typeInfo.pattern === 'brick') {
    fill(typeInfo.shadow);
    rect(0, 10, BLOCK_SIZE, 3);
    rect(0, 20, BLOCK_SIZE, 3);
    rect(12, 0, 3, 10);
    rect(24, 10, 3, 10);
    rect(8, 20, 3, 10);
  } 
  else if (typeInfo.pattern === 'question') {
    fill(typeInfo.shadow);
    rect(12, 8, 8, 4);
    rect(16, 12, 4, 6);
    rect(12, 16, 4, 4);
    rect(12, 22, 4, 4);
  } 
  else if (typeInfo.pattern === 'coin') {
    fill(255);
    rect(13, 8, 4, 14);
    fill(typeInfo.shadow);
    rect(6, 6, 4, 4);
    rect(20, 6, 4, 4);
  }
  else {
    fill(typeInfo.shadow);
    rect(5, 5, 3, 3);
    rect(BLOCK_SIZE - 8, 5, 3, 3);
    rect(5, BLOCK_SIZE - 8, 3, 3);
    rect(BLOCK_SIZE - 8, BLOCK_SIZE - 8, 3, 3);
  }
  pop();
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

  if (gameOver) {
    resetGame();
    return;
  }

  if (mouseX >= BOARD_WIDTH) {
    while (!movePiece(0, 1)) { /* hard drop */ }
    return;
  }

  let zoneWidth = BOARD_WIDTH / 3;
  if (mouseX < zoneWidth) {
    movePiece(-1, 0);
  } else if (mouseX > zoneWidth * 2) {
    movePiece(1, 0);
  } else {
    currentPiece.rotate();
  }
}

function movePiece(dx, dy) {
  if (!currentPiece.collides(dx, dy, currentPiece.matrix)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    return false;
  }
  if (dy > 0) {
    lockPiece();
    clearLines();
    spawnPiece();
    return true; 
  }
  return false;
}

function lockPiece() {
  for (let r = 0; r < currentPiece.matrix.length; r++) {
    for (let c = 0; c < currentPiece.matrix[r].length; c++) {
      if (currentPiece.matrix[r][c] === 1) {
        let gridX = currentPiece.x + c;
        let gridY = currentPiece.y + r;
        if (gridY >= 0) {
          grid[gridY][gridX] = currentPiece.typeInfo;
        }
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!grid[r].includes(0)) {
      grid.splice(r, 1);
      grid.unshift(new Array(COLS).fill(0));
      cleared++;
      r++; 
    }
  }
  if (cleared === 1) score += 100;
  else if (cleared === 2) score += 300;
  else if (cleared === 3) score += 500;
  else if (cleared === 4) score += 1000;
}

function drawSidebar() {
  push();
  translate(BOARD_WIDTH, 0);
  
  fill(40, 40, 50);
  noStroke();
  rect(0, 0, 160, height);
  
  textAlign(CENTER);
  fill('#d84818');
  stroke(255);
  strokeWeight(2);
  textSize(18);
  text("MARIO", 80, 40);
  text("TETRIS", 80, 65);
  
  noStroke();
  fill(255);
  textSize(12);
  text("COINS / SCORE", 80, 130);
  
  fill('#fcd116');
  textSize(22);
  text(score, 80, 160);
  
  fill(20, 20, 30, 180);
  rect(10, 230, 140, 220, 10);
  
  fill(255);
  textSize(11);
  text("PAD CONTROLS", 80, 255);
  
  fill(220);
  textSize(10);
  textAlign(LEFT);
  text("👈 Tap Left: Move L", 20, 290);
  text("👉 Tap Right: Move R", 20, 320);
  text("🎯 Tap Center: Spin", 20, 350);
  text("⚡ Tap Sidebar: Drop", 20, 380);
  pop();
}

function drawGameOverScreen() {
  // Dark overlay
  fill(0, 0, 0, 220);
  rect(0, 0, width, height);
  
  // Game over text banner
  fill(255, 50, 50);
  textAlign(CENTER, CENTER);
  textSize(32);
  stroke(0);
  strokeWeight(4);
  text("GAME OVER", width / 2, 70);
  
  noStroke();
  fill(255);
  textSize(14);
  text("Tap screen to Retry", width / 2, height - 40);

  // Set up scene positions
  let groundY = height - 100;
  let bowserX = width / 2 - 40;
  let peachX = width / 2 + 50;

  // Laugh animation shake effect
  let shakeY = sin(laughTimer * 2) * 6;

  // --- DRAW RETRO BOWSER ---
  push();
  translate(bowserX, groundY + shakeY);
  // Shell (Green & White)
  fill('#00a800'); rect(-25, -45, 30, 40, 5);
  fill(255); rect(-30, -35, 10, 25, 4);
  // Body (Yellow/Orange)
  fill('#fc9838');
  rect(-10, -50, 35, 45, 8); // main head/torso
  rect(-5, -15, 12, 20);      // left leg
  rect(15, -15, 12, 20);      // right leg
  // Snout & Hair
  fill('#fcb8fc'); rect(15, -42, 18, 15, 4); // snout
  fill('#d84818'); rect(-15, -62, 35, 15, 5); // red hair/crest
  // Eyes (Evil red glow)
  fill(255); rect(10, -48, 12, 8);
  fill('#f00'); rect(14, -46, 4, 4);
  pop();

  // --- DRAW CAPTURED PRINCESS PEACH ---
  push();
  translate(peachX, groundY);
  // Dress (Pink)
  fill('#fcb8fc'); rect(-15, -35, 30, 40, 10);
  fill('#b844b8'); rect(-18, -10, 36, 15, 2); // lower skirt expand
  // Skin/Face
  fill('#ffe0b2'); rect(-10, -52, 20, 20, 5);
  // Hair (Yellow)
  fill('#fcd116'); 
  rect(-14, -55, 28, 22, 4); // Back hair
  rect(-12, -58, 24, 8);   // Top bangs
  // Crown
  fill('#fc9838'); rect(-6, -63, 12, 6);
  // Sad Eyes / Tears
  fill('#3cbcfc'); rect(-5, -45, 3, 5); rect(3, -45, 3, 5);
  pop();

  // --- ANIMATED SPEECH BUBBLE ("Bwahaha!") ---
  push();
  translate(bowserX + 35, groundY - 75 + (shakeY * 0.5));
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(-45, -20, 90, 30, 8);
  // Bubble triangle tail pointing down to Bowser
  triangle(-10, 10, 0, 10, -15, 22);
  
  // Text
  noStroke();
  fill(0);
  textSize(12);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text("Bwahaha!!", 0, -5);
  pop();
}

class Piece {
  constructor(matrix, typeInfo) {
    this.matrix = matrix;
    this.typeInfo = typeInfo;
    this.x = floor(COLS / 2) - floor(matrix[0].length / 2);
    this.y = 0;
  }

  show() {
    for (let r = 0; r < this.matrix.length; r++) {
      for (let c = 0; c < this.matrix[r].length; c++) {
        if (this.matrix[r][c] === 1) {
          let targetX = (this.x + c) * BLOCK_SIZE;
          let targetY = (this.y + r) * BLOCK_SIZE;
          renderMarioPixelIcon(targetX, targetY, this.typeInfo);
        }
      }
    }
  }

  rotate() {
    let n = this.matrix.length;
    let m = this.matrix[0].length;
    let newMatrix = Array.from({ length: m }, () => new Array(n).fill(0));
    
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) {
        newMatrix[c][n - 1 - r] = this.matrix[r][c];
      }
    }
    
    if (!this.collides(0, 0, newMatrix)) {
      this.matrix = newMatrix;
    }
  }

  collides(dx, dy, checkMatrix) {
    for (let r = 0; r < checkMatrix.length; r++) {
      for (let c = 0; c < checkMatrix[r].length; c++) {
        if (checkMatrix[r][c] === 1) {
          let nextX = this.x + c + dx;
          let nextY = this.y + r + dy;
          
          if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
            return true;
          }
          if (nextY >= 0 && grid[nextY][nextX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
