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
- I didn't know the .every array method and I also didn't know every array method accepts
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
        grid[row][column] = playerToken
        renderToken(row, column, playerToken)

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
    const tokensEnum = Object.freeze([
        "X",
        "O"
    ])

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
    let activePlayerIndex = 0
    let activePlayer = players[activePlayerIndex]
    let tokenSelected = playersFactory.getToken(activePlayerIndex)

    // helper functions

    function getBoardSnapshot() {
        return board.getGrid()
    }

    function switchPlayerTurn() {
        activePlayerIndex = activePlayerIndex === 0 ? 1 : 0
        activePlayer = players[activePlayerIndex]
        tokenSelected = playersFactory.getToken(activePlayerIndex)
    }

    function evaluateGameState() {
        const gridSnapshot = getBoardSnapshot()
        const gridSize = gridSnapshot.length
        const lines = []

        function lineWinner(cells) {
            const first = cells[0]
            return first !== "" && cells.every(c => c === first) ? first : null
        }

        // push horizontal and vertical
        for(let i = 0; i < gridSize; i++) {
            lines.push(gridSnapshot[i])
            lines.push(gridSnapshot.map(row => row[i]))
        }

        // push diagonal
        lines.push(gridSnapshot.map((row, index) => row[index]))
        lines.push(gridSnapshot.map((row, index) => row[gridSize - 1 -index]))
        
        // check if there is a winner
        for (const line of lines) {
            const winner = lineWinner(line)
            if(winner) {
                if(winner === playersFactory.getToken(0)) {
                    return { result: players[0] }
                } else {
                    return { result: players[1] }
                }
            }
        }

        // check if there is a tie
        if (gridSnapshot.flat().every(cell => cell !== "")) return { result: "tie" }
        return { result: null }
    }

    // game flow functions

    function startGame() {
        // called once after players choose their name/token
        // called once after players hit restart
        if(currentGameState === gameStatesEnum["PLAYING"]) {
            console.log("Game is in playing gameState")
            return
        }

        board.createEmptyGrid()
        currentGameState = gameStatesEnum["PLAYING"]
        activePlayerIndex = 0
        activePlayer = players[activePlayerIndex]
        tokenSelected = playersFactory.getToken(activePlayerIndex)
    }

    function playRound(row, column) {
        const boardLength = getBoardSnapshot().length

        if(currentGameState !== gameStatesEnum.PLAYING) {
            console.log("Game has not started yet")
            return
        }

        if(row < 0 || row >= boardLength || column < 0 || column >= boardLength) {
            console.log("You selected a cell out of range")
            return
        }

        if(getBoardSnapshot()[row][column] !== "") {
            console.log("You selected a cell that was already used")
            return
        }
        
        board.addToken(row, column, tokenSelected)
        console.table(getBoardSnapshot())

        const outcomeGameState = evaluateGameState().result
        if(outcomeGameState !== null && outcomeGameState !== "tie") {
            playersFactory.increasePoints(players.indexOf(outcomeGameState))
            console.log(`
                ${outcomeGameState.name} won!

                Current score:
                ${players[0].name}: ${playersFactory.getPoints(0)}
                ${players[1].name}: ${playersFactory.getPoints(1)}`)
            currentGameState = gameStatesEnum.ENDED
        }

        if(outcomeGameState === "tie") {
            console.log(`
                It's a tie!

                Current score:
                ${players[0].name}: ${playersFactory.getPoints(0)}
                ${players[1].name}: ${playersFactory.getPoints(1)}`)

            currentGameState = gameStatesEnum.ENDED
            return
        }

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
        startGame,
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

// Interface
// TODO: Put this in factories/modules

const cells = document.querySelectorAll(".cell")
const cellsArray = Array.from(cells)
const firstRow = cellsArray.filter((item, index) => index < 3)
const secondRow = cellsArray.filter((item, index) => index >= 3 && index < 6)
const thirdRow = cellsArray.filter((item, index) => index >= 6 && index < 9)

for (let i = 0; i < 3; i++) {
    firstRow[i].addEventListener("click", () => gameController.playRound(0, i))
    secondRow[i].addEventListener("click", () => gameController.playRound(1, i))
    thirdRow[i].addEventListener("click", () => gameController.playRound(2, i))
}

function renderToken(row, column, playerToken) {
    const span = document.createElement("span")
    span.classList.add("material-symbols-sharp")

    if(playerToken === "X") {
        span.textContent = "close"
    } else {
        span.textContent = "circle"
    }

    const cellIndexDOM = (row * 3) + column

    cells[cellIndexDOM].appendChild(span)
}