const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('gameStatus');
const restartBtn = document.getElementById('restartBtn');
const modeSelect = document.getElementById('modeSelect');
const pvpBtn = document.getElementById('pvpBtn');
const aiBtn = document.getElementById('aiBtn');

let gameActive, gameState, gameMode, currentPlayer;
const human = "X", ai = "O";
const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const statusText = () =>
  !gameActive ? "" :
  gameMode === "pvp" ? `Player ${currentPlayer}'s turn` : (currentPlayer === human ? "Your turn" : "AI's turn...");

const winMsg = () => gameMode === "pvp" ? `Player ${currentPlayer} wins!` : (currentPlayer === human ? `You win! 🎉` : `AI wins! 🤖`);

[pvpBtn, aiBtn].forEach((btn, idx) =>
  btn.onclick = () => { gameMode = idx ? "ai" : "pvp"; modeSelect.style.display = "none"; init(); });

function init() {
  gameActive = true;
  gameState = Array(9).fill("");
  currentPlayer = "X";
  cells.forEach(c => { c.textContent = ""; c.style.pointerEvents = "auto"; c.classList.remove('winner'); });
  statusDisplay.textContent = statusText();
}

function checkWin(state, player) {
  for (let combo of winCombos)
    if (combo.every(i => state[i] === player)) return combo;
  return null;
}

function isDraw(state) { 
    return state.every(cell => cell); 
}

function move(idx, player) {
  gameState[idx] = player;
  cells[idx].textContent = player;
  cells[idx].style.pointerEvents = "none";
}

function highlightCells(combo) {
  combo.forEach(i => cells[i].classList.add('winner'));
}

function handleCellClick(e) {
  if (!gameActive) return;
  const idx = +e.target.dataset.index;
  if (gameState[idx]) return;
  move(idx, currentPlayer);
  const winCombo = checkWin(gameState, currentPlayer);
  if (winCombo) return endGame(winCombo);
  if (isDraw(gameState)) return endGame();
  if (gameMode === "pvp") {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = statusText();
  } else {
    currentPlayer = ai;
    statusDisplay.textContent = statusText();
    setTimeout(aiMove, 400);
  }
}

function aiMove() {
  let best = -Infinity, moveIdx;
  for (let i = 0; i < 9; i++) if (!gameState[i]) {
    gameState[i] = ai;
    let score = minimax(gameState, 0, false);
    gameState[i] = "";
    if (score > best) best = score, moveIdx = i;
  }
  move(moveIdx, ai);
  const winCombo = checkWin(gameState, ai);
  if (winCombo) return endGame(winCombo);
  if (isDraw(gameState)) return endGame();
  currentPlayer = human;
  statusDisplay.textContent = statusText();
}

function minimax(state, depth, isMax) {
  const winAI = checkWin(state, ai), winH = checkWin(state, human);
  if (winAI) return 10 - depth;
  if (winH) return depth - 10;
  if (isDraw(state)) return 0;
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) if (!state[i]) {
    state[i] = isMax ? ai : human;
    let score = minimax(state, depth + 1, !isMax);
    state[i] = "";
    best = isMax ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function endGame(winCombo) {
  gameActive = false;
  statusDisplay.textContent = winCombo ? winMsg() : "It's a draw!";
  if (winCombo) highlightCells(winCombo);
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.onclick = () => { modeSelect.style.display = "flex"; };
init();
