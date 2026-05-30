/*

ASSIGNMENT:

I need to create a TicTacToe game without using global variables,
trying to use factory functions as much as possible and module
pattern (IIFE) on factories I don't need more than one instance of.

THE PROGRAM IN NATURAL LANGUAGE:

Tic Tac Toe is a game played by 2 players, where it can end on a win,
loss or tie. Each player has a token of their preference, X or O.

The board of the game consists of a 3x3 grid, and the winning condition
is to have formed a line of three of your tokens in sequence, vertically,
horizontally or diagonally.

To play the player must click on the cell he wants to add his token to,
if that cell is not empty the click registers as a move, and the cell
value is then assigned to the player's token.

A round ends when someone wins or when the grid is full but has no
winners - a tie.

At the end of the round the program registers the points of each player
and restarts a new, empty board.

PSEUDO CODE OF WHAT I'M DOING:

->  Create an array of players, with two objects, each representing a Player.
    A player contains three key-value properties: it's name, it's token and
    its points.

->  Create a GameController function that holds all the flow of the game, as well as
    a gameStatesEnum and a currentGameState with methods available.

->  Create a Board function that exposes methods to create and manage the grid, with very
    important ones such as addToken.

->  Create a Player function that stores players and expose methods to manage players properties.

->  Create the logic for each turn, with switchPlayersTurn, playRound and evaluateState


ERRORS I MADE/THINGS I LEARNED:

- I didn't store a function inside a variable, and kept trying to modify the variables
inside the function by calling it, which created a new instance of that function each time
- I did a fake encapsulation of players inside the Players() factory, where I was returning
a reference to the array instead of a copy of the array
- I didn't know the .every array method and I also didn't  know every array method accepts
a second argument that is an index argument/and accumulator
- The score was not increasing because the players const returns a clone.
I needed to create a method to read scores.
key learning: every time I return a structureClone I need to create 
set and get methods.

*/

function Board() {
    let grid = []
    let columns, rows
    columns = rows = 3

    function createEmptyGrid() {
        for(let i = 0; i < rows; i++) {
            grid[i] = []
            for (let j = 0; j < columns; j++) {
                grid[i].push("")
            }
        }
    }

    createEmptyGrid()

    function addToken(row, column, playerToken) {
        if(grid[row][column] === "") {
            grid[row][column] = playerToken
        }
    }

    function getGrid() {
        return structuredClone(grid)
    }

    return {
        createEmptyGrid,
        addToken,
        getGrid,
    }
}

function Players() {
    const tokensEnum = Object.freeze({
        0: "X",
        1: "O",
    })

    const players = [
        {
            name: "Player 1",
            token: tokensEnum[0],
            points: 0,
        },
        {
            name: "Player 2",
            token: tokensEnum[1],
            points: 0,
        }
    ]

    function getPlayers() {
        return structuredClone(players)
    }

    function setToken(playerIndex, tokenIndex) {
        players[playerIndex].token = tokensEnum[tokenIndex]
    }

    function getToken(playerIndex) {
        return players[playerIndex].token
    }

    function increasePoints(playerIndex) {
        players[playerIndex].points++
    }

    function getPoints(playerIndex) {
        return players[playerIndex].points
    }

    return {
        getPlayers,
        setToken,
        getToken,
        increasePoints,
        getPoints,
    }
}

function GameController() {
    // constants, variables and enums
    const board = Board()
    const playersFactory = Players()
    const players = playersFactory.getPlayers()

    const gameStatesEnum = Object.freeze({
        WAITING: "waiting",
        PLAYING: "playing",
        ENDED: "ended",
    })

    let currentGameState = gameStatesEnum.WAITING
    let activePlayer = players[0]
    let activePlayerIndex = players.indexOf(activePlayer)
    let tokenSelected = playersFactory.getToken(activePlayerIndex)

    // helper functions

    function getBoardSnapshot() {
        return board.getGrid()
    }

    function switchPlayerTurn() {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]
        activePlayerIndex = players.indexOf(activePlayer)
        tokenSelected = playersFactory.getToken(activePlayerIndex)
    }

    function evaluateGameState() {
        const boardLookup = getBoardSnapshot()
        const tokenLookup = tokenSelected
        const size = boardLookup.length

        function won() {
            playersFactory.increasePoints(activePlayerIndex)
            console.log(`
${activePlayer.name} won!
                
This is the current score:
${players[0].name}: ${playersFactory.getPoints(0)}
${players[1].name}: ${playersFactory.getPoints(1)}`)
            currentGameState = gameStatesEnum.ENDED
        }

        function tie() {
            console.log(`
It's a tie!
                
This is the current score:
${players[0].name}: ${playersFactory.getPoints(0)}
${players[1].name}: ${playersFactory.getPoints(1)}`)
            currentGameState = gameStatesEnum.ENDED
        }

        // horizontal
        for(let i = 0; i < size; i++) {
            if(boardLookup[i].every(cell => cell === tokenLookup)) return won()
        }
    
        // vertical
        for(let j = 0; j < size; j++) {
            if(boardLookup.every(row => row[j] === tokenLookup)) return won()
        }

        // diagonal
        if (boardLookup.every((row, i) => row[i] === tokenLookup)) return won()
        if (boardLookup.every((row, i) => row[size - 1 - i] === tokenLookup)) return won()

        // tie
        let amountOfFilledCells = 0

        for (let k = 0; k < size; k++) {
            boardLookup[k].forEach(cell => {
                if(cell === "X" || cell === "O") {
                    amountOfFilledCells++
                }
            })
        }

        if(amountOfFilledCells === size * size) {
            tie()
        }
    }

    // game flow functions

    function startGame() {
        // called once after players choose their name/token
        // called once after players hit restart
        if(currentGameState === gameStatesEnum["PLAYING"]) return console.log("Game is in playing gameState")

        board.createEmptyGrid()
        currentGameState = gameStatesEnum["PLAYING"]
        activePlayer = players[0]
        activePlayerIndex = players.indexOf(activePlayer)
        tokenSelected = playersFactory.getToken(activePlayerIndex)
    }

    function playRound(row, column) {
        const board = getBoardSnapshot()
        const boardLength = board.length

        if(currentGameState !== gameStatesEnum.PLAYING) {
            console.log("Game has not started yet")
            return
        }

        if(row >= boardLength || column >= boardLength) {
            console.log("You selected a cell out of range")
            return
        }

        if(board[row][column] !== "") {
            console.log("You selected a cell that was already used")
            return
        }

        board.addToken(row, column, tokenSelected)
        console.table(getBoardSnapshot())
        evaluateGameState()
        switchPlayerTurn()
        if(currentGameState === gameStatesEnum.PLAYING) {
            console.log(`It is ${activePlayer.name} turn`)
        }
    }

    // init

    startGame()

    return {
        getBoardSnapshot,
        playRound,
    }
}

const gameController = GameController()

console.log(`
    Welcome to this humble Tic-Tac-Toe game!
    You are both player 1 and player 2 because I still haven't learned
    how to create a machine as good as you lol

    To play a round type this in your console:

    gameController.playRound(rowNumber, columnNumber)

    Once the game ends you will not be able to play rounds.
    You need to actually type this in your console to start another game:

    gameController.startGame()
    `)
console.table(gameController.getBoardSnapshot())

/*

On restart screen the player should be able to change their token

*/