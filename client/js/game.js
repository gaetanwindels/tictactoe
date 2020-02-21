// DOM ELEMENTS
let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');

// Useful variables
ctx.font = "30px Arial";
const CELL_SIZE = canvas.width / 3;

// STATE OF THE GAME
let grid = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];
let playerSymbol = null;
let isMyTurnToPlay = false;

// SOCKET EVENTS
let socket = io.connect("https://localhost");
socket.on('connect', function (data) {
    socket.emit('join', 'Hello World from client');
});

socket.on('WAITING_OPPONENT_CONNECTION', function (data) {
    writeStatus('Waiting opponent connection...');
});

socket.on('GAME_START', function (data) {
    playerSymbol = data;
    isMyTurnToPlay = data === 'O';
    writeStatus(isMyTurnToPlay ? 'Your turn...' : 'Opponent is playing...');
});

socket.on('WAITING_OPPONENT_MOVE', function (data) {
    if (checkWin() == playerSymbol) {
        writeStatus('You win!');
        isMyTurnToPlay = false;
    } else {
        writeStatus('Opponent is playing...');
    }
});

socket.on('OPPONENT_PLAYED', function (data) {
    console.log("Opponent played!");
    grid = data;
    drawGrid();
    isMyTurnToPlay = true;

    let symbolWin = checkWin();
    if (symbolWin == null) {
        writeStatus('Your turn...');
    } else {
        writeStatus('You ' + (symbolWin === playerSymbol ? 'win!' : 'lose!'));
        isMyTurnToPlay = false;
    }

    let allFilled = [...grid[0], ...grid[1], ...grid[2]].every(element => {
        return !!element;
    });

    if (allFilled) {
        writeStatus('Draw...');
    }
});

function checkWin() {
    // Vertical lines
    let comb1 = grid[0][0] === grid[1][0] && grid[1][0] === grid[2][0];
    if (comb1 && grid[0][0] && grid[1][0] && grid[2][0]) return grid[0][0];
    let comb2 = grid[0][1] === grid[1][1] && grid[1][1] === grid[2][1];
    if (comb2 && grid[0][1] && grid[1][1] && grid[2][1]) return grid[0][1];
    let comb3 = grid[0][2] === grid[2][1] && grid[1][2] === grid[2][2];
    if (comb3 && grid[0][2] && grid[2][1] && grid[2][2]) return grid[0][2];
    // Horizontal lines
    let comb4 = grid[0][0] === grid[0][1] && grid[0][1] === grid[0][2];
    if (comb4 && grid[0][0] && grid[0][1] && grid[0][1]) return grid[0][0];
    let comb5 = grid[1][0] === grid[1][1] && grid[1][1] === grid[1][2];
    if (comb5 && grid[1][0] && grid[1][1] && grid[1][1]) return grid[1][2];
    let comb6 = grid[2][0] === grid[2][1] && grid[2][1] === grid[2][2];
    if (comb6 && grid[2][0] && grid[2][1] && grid[2][1]) return grid[2][0];
    // Diagonals
    let comb7 = grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2];
    if (comb7 && grid[0][0] && grid[1][1] && grid[1][1]) return grid[0][0];
    let comb8 = grid[2][0] === grid[1][1] && grid[1][1] === grid[0][2];
    if (comb8 && grid[2][0] && grid[1][1] && grid[1][1]) return grid[2][0];
}

canvas.addEventListener("click", (event) => {
    play(event);
});

// FUNCTIONS 

function drawGrid() {
    ctx.fillStyle = "white";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let line = 0; line <= 3; line++) {
        ctx.beginPath();
        ctx.moveTo(line * CELL_SIZE, 0);
        ctx.lineTo(line * CELL_SIZE, canvas.width);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, line * CELL_SIZE);
        ctx.lineTo(canvas.width, line * CELL_SIZE);
        ctx.stroke();
    }

    ctx.fillStyle = "black";
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            ctx.fillText(grid[y][x], x * CELL_SIZE + 55, y * CELL_SIZE + 60);
        }
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function play(event) {
    if (!isMyTurnToPlay) {
        return;
    }
    let pos = getMousePos(canvas, event);
    let posX = Math.ceil(pos.x / CELL_SIZE) - 1;
    let posY = Math.ceil(pos.y / CELL_SIZE) - 1;

    if (grid[posY][posX]) {
        return;
    }

    grid[posY][posX] = playerSymbol;
    drawGrid();
    isMyTurnToPlay = false;
    socket.emit('PLAYER_MOVE', { player: playerSymbol, x: posX, y: posY });
}

function writeStatus(text) {
    document.getElementById('status').innerHTML = text;
}

drawGrid();
