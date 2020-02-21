var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(3000);

let clients = [];
let rooms = [];
let roomNumber = 1;

io.on('connection', function (client) {

    clients.push(client);
    let room = jumpInAvailableRoom(client);

    if (!room.player2) {
        client.emit('WAITING_OPPONENT_CONNECTION');
    } else {
        room.player1.emit('GAME_START', 'O');
        room.player2.emit('GAME_START', 'X');
    }

    client.on('PLAYER_MOVE', function (data) {
        console.log("The player " + data.player + " made a move");
        // TODO is the move legit?

        // update grid
        room.grid[data.y][data.x] = data.player;

        let clientTosend = data.player === 'O' ? room.player2 : room.player1;

        clientTosend.emit('OPPONENT_PLAYED', room.grid);
        client.emit('WAITING_OPPONENT_MOVE', room.grid);
    });
});

function jumpInAvailableRoom(client) {
    let room = {};

    room = rooms.find(r => {
        return !r.player2;
    });

    console.log(rooms.length);
    console.log(room);
    if (!room) {
        let newRoom = { roomNumber: roomNumber++, player1: client, player2: null, grid: getEmptyGrid() };
        rooms.push(newRoom);
        console.log("New room created");
        return newRoom;
    } else {
        room.player2 = client;
        console.log("Room found!");
        return room;
    }
}

function getEmptyGrid() {
    let grid = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];

    return grid;
}

