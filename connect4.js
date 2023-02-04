const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 6;
const LINE_LENGTH = 4;
const SQUARE_SIZE = 80;

// build array of all possible directions to check for potential lines
const LINE_OFFSETS = [];
const DIRECTIONAL_MULTIPLIERS = [
  [1, 0], // horizontal
  [0, 1], // vertical
  [1, 1], // diagonal down
  [1, -1], // diagonalup
];
for (let i1 = 1; i1 <= LINE_LENGTH; i1++) {
  DIRECTIONAL_MULTIPLIERS.forEach(([multiplyX, multiplyY]) => {
    LINE_OFFSETS.push(
      Array.from({ length: LINE_LENGTH }).map((_, i2) => {
        const n = i1 - LINE_LENGTH + i2;
        return [n * multiplyX, n * multiplyY];
      })
    );
  });
}

// set up basic elements
const root = document.querySelector("#root");
root.style.width = `${BOARD_WIDTH * SQUARE_SIZE}px`;

const divBoard = document.createElement("div");
divBoard.className = "divBoard";
divBoard.style.width = `${BOARD_WIDTH * SQUARE_SIZE}px`;
divBoard.style.height = `${BOARD_HEIGHT * SQUARE_SIZE}px`;

const divBoardActions = document.createElement("div");
divBoardActions.className = "divBoardActions";
const divBoardGraphics = document.createElement("div");
divBoardGraphics.className = "divBoardGraphics";

root.appendChild(divBoard);
divBoard.appendChild(divBoardGraphics);
divBoard.appendChild(divBoardActions);

const divCurrentPlayer = document.createElement("div");
divCurrentPlayer.className = "divCurrentPlayer";
root.appendChild(divCurrentPlayer);

const divGameOver = document.createElement("div");
divGameOver.className = "divGameOver";
divGameOver.innerHTML = `<h2><span id="divGameOverColour"></span></h2><button onClick="window.location.reload();">Play Again</button>`;
divGameOver.style.display = "none";
root.appendChild(divGameOver);

// set up blank board
let board = Array.from({ length: BOARD_HEIGHT }).map(() =>
  Array.from({ length: BOARD_WIDTH }).map(() => null)
);
let currentPlayer = 0;

// check all lines from a cell
// fn is a function that receives an array of the cells in an attached line
// eg: fn = (cells: [0,0,1,0]) => {})
function checkLinesFromCell(x, y, fn) {
  LINE_OFFSETS.forEach((line) => {
    const lineValues = [];
    for (let i = 0; i < line.length; i++) {
      const [offsetX, offsetY] = line[i];
      const checkX = x + offsetX;
      const checkY = y + offsetY;
      if (
        checkX < 0 ||
        checkX >= BOARD_WIDTH ||
        checkY < 0 ||
        checkY >= BOARD_HEIGHT
      ) {
        // outside boundaries of the board, ignore
        return;
      }
      lineValues.push(board[checkY][checkX]);
    }
    // if this line falls within the board then send the values back
    fn(lineValues);
  });
}

// calculate value of each spot on the board for each player
const values = [[], []];
function calculateValues() {
  values.forEach((player, playerIndex) => {
    board.forEach((row, y) => {
      player[y] = [];
      row.forEach((_, x) => {
        let value = 0;
        checkLinesFromCell(x, y, (line) => {
          // if line is a possible win
          if (line.every((d) => d === null || d === playerIndex)) {
            // how many of ours are currently in the line
            const numInLine = line.filter((d) => d === playerIndex).length;
            value += 1 + numInLine * 6;
          }
        });
        player[y][x] = value;
      });
    });
  });
}

// drawing the board
function drawBoard() {
  divCurrentPlayer.innerHTML = `<div class="${
    currentPlayer === 0 ? "red" : "yellow"
  }"></div>`;
  divBoardGraphics.innerHTML = "";
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const totalValue = values[0][y][x] + values[1][y][x];

      const cellEl = document.createElement("div");
      cellEl.style.width = `${SQUARE_SIZE}px`;
      cellEl.style.height = `${SQUARE_SIZE}px`;
      const cellCircle = document.createElement("div");
      cellCircle.className =
        cell === null ? "blank" : cell === 0 ? "red" : "yellow";
      cellCircle.innerHTML =
        cell === null
          ? `<span class='textRed'>${values[0][y][x]}</span><span class='textYellow'>${values[1][y][x]}</span><span>${totalValue}</span>`
          : "";
      cellEl.appendChild(cellCircle);
      divBoardGraphics.appendChild(cellEl);
    });
  });
}

// make a move
function move(x) {
  const canMove = board[0][x] === null;
  if (canMove) {
    // find lowest cell to drop into
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (board[y][x] === null) {
        // set board cell to current player
        board[y][x] = currentPlayer;

        // check if is a winning move
        let hasPlayerWon = false;
        checkLinesFromCell(x, y, (line) => {
          if (line.every((value) => value === currentPlayer)) {
            hasPlayerWon = true;
          }
        });

        // check if draw
        let isDraw =
          !hasPlayerWon && board.every((row) => row.every((d) => d !== null));

        // show game over if won
        if (hasPlayerWon) {
          divGameOver.style.display = "flex";
          document.querySelector("#divGameOverColour").innerHTML =
            currentPlayer === 0 ? "Red Wins" : "Yellow Wins";
        } else if (isDraw) {
          divGameOver.style.display = "flex";
          document.querySelector("#divGameOverColour").innerHTML = "Draw";
        } else {
          // switch player if game is ongoing
          currentPlayer = currentPlayer === 0 ? 1 : 0;
        }
        break;
      }
    }
    calculateValues();
    drawBoard();
  }
}

// handle user clicks on the board
board[0].forEach((_, x) => {
  const btn = document.createElement("button");
  btn.onclick = () => move(x);
  btn.style.width = `${SQUARE_SIZE}px`;
  divBoardActions.appendChild(btn);
});

// init the game
calculateValues();
drawBoard();
