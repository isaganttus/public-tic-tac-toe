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
- Use IIFEs or factories correctly - factory when you need more than one version of that object,
IIFEs when it's going to have only one instance.
- Create handles for IIFEs
- Differentiate read values from get values board/boardSnapshot

*/

const board = (function Board() {
    let grid = []
    let columns, rows
    columns = rows = 3

    function createEmptyGrid() {
        grid = []

        for(let i = 0; i < rows; i++) {
            grid[i] = []
            for (let j = 0; j < columns; j++) {
                grid[i].push("")
            }
        }
    }

    function addToken(row, column, playerToken) {
        grid[row][column] = playerToken
        gameInterface.renderToken(row, column, playerToken)
    }

    function getGrid() {
        return structuredClone(grid)
    }

    return {
        createEmptyGrid,
        addToken,
        getGrid,
    }
})()


const game = (function GameController() {
    // constants, variables and enums
    const players = Players()
    
    const gameStatesEnum = Object.freeze({
        WAITING: "waiting",
        PLAYING: "playing",
        ENDED: "ended",
    })
    
    let currentGameState = gameStatesEnum.WAITING
    let activePlayerIndex = 0
    let tokenSelected = players.getToken(activePlayerIndex)
    
    // helper functions
    const getBoard = () => board.getGrid()
    
    function switchPlayerTurn() {
        activePlayerIndex = activePlayerIndex === 0 ? 1 : 0
        tokenSelected = players.getToken(activePlayerIndex)
        gameInterface.renderGameState(activePlayerIndex, "turn", "")
    }
    
    function evaluateGameState() {
        const boardSnapshot = getBoard()
        const boardSnapshotLength = boardSnapshot.length
        const lines = []
        
        function lineWinner(cells) {
            const first = cells[0]
            return first !== "" && cells.every(c => c === first) ? first : null
        }
        
        // push horizontal and vertical
        for(let i = 0; i < boardSnapshotLength; i++) {
            lines.push(boardSnapshot[i])
            lines.push(boardSnapshot.map(row => row[i]))
        }
        
        // push diagonal
        lines.push(boardSnapshot.map((row, index) => row[index]))
        lines.push(boardSnapshot.map((row, index) => row[boardSnapshotLength - 1 -index]))
        
        // check if there is a winner
        for (const line of lines) {
            const winner = lineWinner(line)
            if(winner) {
                if(winner === players.getToken(0)) {
                    return { winnerIndex: 0 }
                } else {
                    return { winnerIndex: 1 }
                }
            }
        }
        
        // check if there is a tie
        if (boardSnapshot.flat().every(cell => cell !== "")) return { winnerIndex: "tie" }
        return { winnerIndex: null }
    }
    
    // game flow functions
    function startGame() {
        // called once after players choose their name/token
        // called once after players hit restart
        board.createEmptyGrid()
        currentGameState = gameStatesEnum["PLAYING"]
        activePlayerIndex = 0
        tokenSelected = players.getToken(activePlayerIndex)
    }
    
    function playRound(row, column) {
        const boardSnapshot = getBoard()
        const boardSnapshotLength = boardSnapshot.length
        
        if(currentGameState !== gameStatesEnum.PLAYING) {
            // render instructions text for replay
            return
        }
        
        if(boardSnapshot[row][column] !== "") {
            gameInterface.renderInstructionsText("You selected a cell that was already used.")
            return
        }
        
        board.addToken(row, column, tokenSelected)
        console.table(boardSnapshot)
        
        const outcomeGameState = evaluateGameState().winnerIndex
        if(outcomeGameState !== null && outcomeGameState !== "tie") {
            players.increasePoints(outcomeGameState)
            gameInterface.renderGameState(activePlayerIndex, "win", players.getName(outcomeGameState))
            gameInterface.renderScore(`${players.getName(0)}: ${players.getPoints(0)}, ${players.getName(1)}: ${players.getPoints(1)}`)
            currentGameState = gameStatesEnum.ENDED
            return
        }
        
        if(outcomeGameState === "tie") {
            gameInterface.renderGameState(activePlayerIndex, "tie", "")
            gameInterface.renderScore(`${players.getName(0)}: ${players.getPoints(0)}, ${players.getName(1)}: ${players.getPoints(1)}`)
            currentGameState = gameStatesEnum.ENDED
            return
        }
        
        if(currentGameState === gameStatesEnum.PLAYING) {
            switchPlayerTurn()
        }
    }
    
    // init
    
    return {
        playRound,
        startGame,
    }
})()

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

    function getName(playerIndex) {
        return players[playerIndex].name
    }

    return {
        setToken,
        getToken,
        increasePoints,
        getPoints,
        getName,
    }
}

/*

On restart screen the player should be able to change their token

*/

// Interface

const gameInterface = (function GameInterface() {
    function renderGrid() {
        const gridData = board.getGrid()
        const rowsAmount = gridData.length
        const columnsAmount = gridData[0].length
        const boardElement = document.querySelector(".board")
        boardElement.textContent = ""

        for (let i = 0; i < rowsAmount; i++) {
            const row = document.createElement("div")
            row.classList.add("row")

            for (let j = 0; j < columnsAmount; j++) {
                const cell  = document.createElement("div")
                cell.classList.add("cell")
                cell.addEventListener("click", () => game.playRound(i, j))
                row.appendChild(cell)
            }

            boardElement.appendChild(row)
        }
    }

    function renderToken(row, column, playerToken) {
        const span = document.createElement("span")
        span.classList.add("material-symbols-sharp")
    
        if(playerToken === "X") {
            span.textContent = "close"
        } else {
            span.textContent = "circle"
        }
        
        const cells = document.querySelectorAll(".cell")
        const cellIndexDOM = (row * 3) + column
        cells[cellIndexDOM].appendChild(span)
    }

    // status interface
    function renderInstructionsText(string) {
        const instructions = document.querySelector(".instructions")
        instructions.textContent = string
    }
    
    function renderGameState(activePlayerIndex, gameState, name) {
        const state = document.querySelector(".state")
    
        switch (gameState) {
            case "turn":
                let playerString = ""
                if(activePlayerIndex === 0) {
                    playerString = "player 1 (X)"
                } else {
                    playerString = "player 2 (O)"
                }
                state.textContent = `It is ${playerString} turn`
                break
            case "win":
                state.textContent = `${name} won!`
                break
            case "tie":
                state.textContent = `It's a tie!`
                break
        }
    }
    
    function renderScore(string) {
        const score = document.querySelector(".score")
        score.textContent = string
    }

    // start game interface
    (function addPlayEvent() {
        const playButton = document.querySelector("button")
        playButton.addEventListener("click", () => {
            game.startGame()
            renderGrid()
        })
    })()

    return {
        renderToken,
        renderInstructionsText,
        renderGameState,
        renderScore,
    }
})()