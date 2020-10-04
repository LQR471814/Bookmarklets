// function KeyboardController(keys, repeat, element) {
//     var timers = {};

//     element.onkeydown = function(event) {
//         var key= (event || window.event).keyCode;
//         if (!(key in keys))
//             return true;
//         if (!(key in timers)) {
//             timers[key] = null;
//             keys[key]();
//             if (repeat !== 0)
//                 timers[key] = setInterval(keys[key], repeat);
//         }
//         return false;
//     };

//     element.onkeyup = function(event) {
//         var key = (event || window.event).keyCode;
//         if (key in timers) {
//             if (timers[key] !== null)
//                 clearInterval(timers[key]);
//             delete timers[key];
//         }
//     };

//     window.onblur = function() {
//         for (key in timers)
//             if (timers[key] !== null)
//                 clearInterval(timers[key]);
//         timers = {};
//     };
// };

function makeDrag(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    elmnt.onmousedown = dragMouseDown
    elmnt.oncontextmenu = (e) => { return false }

    function dragMouseDown(e) {
        if (e.button === 2 || e.altKey === true) {
            e = e || window.event
            e.preventDefault()
            pos3 = e.clientX
            pos4 = e.clientY
            document.onmouseup = closeDragElement
            document.onmousemove = elementDrag
        }
    }

    function elementDrag(e) {
        e = e || window.event
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}

async function spawnTetris() {
    class piece {
        constructor(x, y) {
            this.origin = [x, y]
            this.orientations = []
            this.squares = this.constructSquares()
            this.rotation = 0
            this.type = undefined
        }

        commitPositions(orientation, origin) {
            var locations = []
            for (var i in orientation) {
                locations.push([origin[0] + orientation[i][0], origin[1] + orientation[i][1]])
            }
            return locations
        }

        constructSquares(orientation) {
            var squares = []
            for (var squarePos in orientation) {
                squares.push(new square(this.origin[0] + orientation[squarePos][0], this.origin[1] + orientation[squarePos][1], 1))
            }
            return squares
        }

        rotate() {
            this.rotation += 1
            if (this.orientations.length === this.rotation) {
                this.rotation = 0
            }
            this.update()
        }

        calculateCollisionHeight(grid) {
            var yVals = []
            var yVal = 0

            while (yVal < gridHeight) {
                var free = 1
                var positions = this.commitPositions(this.orientations[this.rotation], [this.origin[0], yVal])
                for (var i in positions) {
                    if (grid[positions[i][1]] !== undefined) {
                        if (grid[positions[i][1]][positions[i][0]] !== undefined) {
                            if (grid[positions[i][1]][positions[i][0]] === 1) {
                                free *= 0
                                break
                            }
                        } else {
                            free *= 0
                            break
                        }
                    } else {
                        free *= 0
                        break
                    }
                }
                if (free === 1) {
                    yVals.push(yVal)
                }
                yVal += 1
            }
            yVals.sort((a, b) => {return a - b})
            yVals = removeConsecutives(yVals)
            return yVals[yVals.length - 1]
        }

        commit(grid, lockedGrid) {
            this.update()
            var collisionHeight = this.calculateCollisionHeight(lockedGrid)
            var previewPositions = this.commitPositions(this.orientations[this.rotation], [this.origin[0], collisionHeight])
            for (var sqr in this.squares) {
                try {
                    grid[this.squares[sqr].y][this.squares[sqr].x] = this.squares[sqr]
                } catch {}
            }
            for (var preview in previewPositions) {
                grid[previewPositions[preview][1]][previewPositions[preview][0]] = new square(previewPositions[preview][0], previewPositions[preview][1], 2)
            }
            return grid
        }

        update() {
            this.squares = this.constructSquares(this.orientations[this.rotation])
        }
    }

    class oPiece extends piece {
        constructor(x, y) {
            super(x, y)
            this.type = "O"
            this.orientations = [
                [
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0]
                ]
            ]
        }
    }

    class iPiece extends piece {
        constructor(x, y) {
            super(x, y)
            this.type = "I"
            this.orientations = [
                [
                    [0, 0],
                    [0, -1],
                    [0, -2],
                    [0, 1]
                ],
                [
                    [0, 0],
                    [-2, 0],
                    [-1, 0],
                    [1, 0]
                ],
                [
                    [-1, 0],
                    [-1, -1],
                    [-1, -2],
                    [-1, 1]
                ],
                [
                    [0, -1],
                    [-2, -1],
                    [-1, -1],
                    [1, -1]
                ]
            ]
        }
    }

    class jPiece extends piece {
        constructor(x, y) {
            super(x, y)
            this.type = "J"
            this.orientations = [
                [
                    [0, 0],
                    [-1, 0],
                    [1, 0],
                    [-1, 1]
                ],
                [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [0, -1]
                ],
                [
                    [0, 0],
                    [1, 0],
                    [-1, 0],
                    [1, -1]
                ],
                [
                    [0, 0],
                    [0, 1],
                    [0, -1],
                    [-1, -1]
                ]
            ]
        }
    }

    class lPiece extends piece {
        constructor(x, y) {
            super(x, y)
            this.type = "L"
            this.orientations = [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [-1, 0]
                ],
                [
                    [0, 0],
                    [0, 1],
                    [0, -1],
                    [1, -1]
                ],
                [
                    [0, 0],
                    [1, 0],
                    [-1, 0],
                    [-1, -1]
                ],
                [
                    [0, 0],
                    [0, 1],
                    [0, -1],
                    [-1, 1]
                ]
            ]
        }
    }

    class tPiece extends piece {
        constructor(x, y) {
            super(x, y)
            this.type = "T"
            this.orientations = [
                [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [-1, 1]
                ],
                [
                    [0, 0],
                    [0, 1],
                    [0, -1],
                    [-1, 0]
                ],
                [
                    [0, 0],
                    [0, 1],
                    [-1, 0],
                    [1, 0]
                ],
                [
                    [0, 0],
                    [-1, 0],
                    [-1, 1],
                    [-1, -1]
                ]
            ]
        }
    }

    class sPiece extends piece {
        constructor(x, y) {
            super(x, y)
            this.type = "S"
            this.orientations = [
                [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [-1, 0]
                ],
                [
                    [0, 0],
                    [-1, 0],
                    [0, -1],
                    [-1, 1]
                ]
            ]
        }
    }

    class zPiece extends piece {
        constructor(x, y) {
            super(x, y)
            this.type = "Z"
            this.orientations = [
                [
                    [0, 0],
                    [0, 1],
                    [1, 0],
                    [-1, 1]
                ],
                [
                    [0, 0],
                    [0, 1],
                    [-1, 0],
                    [-1, -1]
                ]
            ]
        }
    }

    class square {
        constructor(x, y, type) {
            this.x = x
            this.y = y
            this.type = type //? Type Format - 0:Empty, 1:Occupied, 2:Preview
        }
    }

    function setSquareColor(x, y, color) {
        try {
            document.getElementById(x.toString() + ";" + y.toString()).style.backgroundColor = color
        } catch(e) {}
    }

    function createSquareElement(color) {
        squareDiv = document.createElement("div")
        squareDiv.style.height = cellSize.toString() + "px"
        squareDiv.style.width = cellSize.toString() + "px"
        squareDiv.style.backgroundColor = color
        return squareDiv
    }

    function clearRow(lockedGrid, y) {
        lockedGrid.splice(y, 1)
        var lockedRow = []
        for (var i = 0; i < gridWidth; i++) {
            lockedRow.push(0)
        }
        lockedGrid.push(lockedRow)
        return lockedGrid
    }

    function lockPiece() {
        var affectedRows = []
        var clearRows = []

        for (var square in currentPiece.squares) { //? Find all rows affected by the piece and set the pieces' squares to 1 in the lockedGrid
            lockedGrid[currentPiece.squares[square].y][currentPiece.squares[square].x] = 1
            if (!affectedRows.includes(currentPiece.squares[square].y)) {
                affectedRows.push(currentPiece.squares[square].y)
            }
        }

        for (var row in affectedRows) { //? Go through each affected row and check if that row is filled, add it to clearRows
            var filled = 1
            for (var square in lockedGrid[row]) {
                if (lockedGrid[affectedRows[row]][square] === 0) {
                    filled *= 0
                    break
                }
            }
            if (filled > 0) {
                clearRows.push(parseInt(affectedRows[row]))
            }
        }

        clearRows.sort((a, b) => {return a - b})
        for (var row in clearRows) { //? Remove filled rows given clearRows array
            lockedGrid = clearRow(lockedGrid, clearRows[row])
            for (var i in clearRows) {
                clearRows[i] -= 1
            }
        }

        holdPiece = 1
        currentPiece = randomPiece() //? Reset currentPiece to a random piece
    }

    function removeConsecutives(x) {
        var toBePopped = []
        for (var i in x) {
            if (x[i - 1] + 1 === x[i]) {
                toBePopped.push(parseInt(i))
            }
        }
        for (var pop in toBePopped) {
            x.splice(toBePopped[pop], 1)
            for (var other in toBePopped) {
                toBePopped[other] -= 1
            }
        }
        return x
    }

    function resetGrid() {
        gridData = []
        for (y = 0; y < gridHeight; y++) {
            var row = []
            for (x = 0; x < gridWidth; x++) {
                setSquareColor(x, y, "#000000")
                row.push(new square(x, y, 0))
            }
            gridData.push(row)
        }
    }

    function render() {
        for (y = 0;y < gridHeight; y++) {
            for (x = 0;x < gridWidth; x++) {
                if (lockedGrid[y][x] === 1) {
                    setSquareColor(x, y, "#ffffff")
                } else if (gridData[y][x].type === 1) {
                    setSquareColor(x, y, "#ffffff")
                } else if (gridData[y][x].type === 2) {
                    setSquareColor(x, y, "#ababab")
                }
            }
        }
        for (var square in currentPiece.squares) {
            setSquareColor(currentPiece.squares[square].x, currentPiece.squares[square].y, "#ffffff")
        }
    }

    function randomPiece() {
        var pieces = []
        var catalog = getPieceCatalog()
        for (var i in catalog) {
            pieces.push(catalog[i])
        }
        if (typeof currentPiece !== "undefined") {
            while (true) {
                var piece = pieces[Math.floor(Math.random() * pieces.length)]
                if (currentPiece.type !== piece.type) {
                    break
                }
            }
        } else {
            var piece = pieces[Math.floor(Math.random() * pieces.length)]
        }
        return piece
    }

    function setSpeed(newSpeed) {
        speed = newSpeed

        gravitySpeed *= speed
    }

    function tick() {
        if (tickCount % gravitySpeed == 0 && tickCount !== 0) { //? On Gravity
            resetGrid()
            if (currentPiece.calculateCollisionHeight(lockedGrid) < currentPiece.origin[1]) {
                currentPiece.origin[1] -= 1
            } else {
                lockPiece()
            }

            gridData = currentPiece.commit(gridData, lockedGrid)
            render()
        }
        try {
            if (inputQueue[0] === hardDrop) {
                resetGrid()
                currentPiece.origin[1] = currentPiece.calculateCollisionHeight(lockedGrid)
                currentPiece.update()
                lockPiece()
                gridData = currentPiece.commit(gridData, lockedGrid)
                render()
            } else if (inputQueue[0] === softDrop) {
                resetGrid()
                if (currentPiece.calculateCollisionHeight(lockedGrid) < currentPiece.origin[1]) {
                    currentPiece.origin[1] -= 1
                } else {
                    lockPiece()
                }
                gridData = currentPiece.commit(gridData, lockedGrid)
                render()
            } else if (inputQueue[0] === rotate) {
                resetGrid()
                try {
                    currentPiece.rotate()
                } catch {

                }
                gridData = currentPiece.commit(gridData, lockedGrid)
                render()
            } else if (inputQueue[0] === hold) {
                if (holdPiece > 0) {
                    resetGrid()

                    if (heldPiece === undefined) {
                        var originalHeld = randomPiece()
                    } else {
                        var originalHeld = getPieceCatalog()[heldPiece.type]
                    }
                    heldPiece = getPieceCatalog()[currentPiece.type]
                    currentPiece = originalHeld
                    holdButton.innerText = heldPiece.type

                    holdPiece *= 0

                    gridData = currentPiece.commit(gridData, lockedGrid)
                    render()
                }
            } else if (inputQueue[0] === left) {
                resetGrid()

                //? Check if the piece is moving off screen or will collide with a block (to the left)
                var move = 1
                var commitPositions = currentPiece.commitPositions(currentPiece.orientations[currentPiece.rotation], [currentPiece.origin[0] - 1, currentPiece.origin[1]])

                for (var i in commitPositions) {
                    try {
                        if (commitPositions[i][0] < 0 || lockedGrid[commitPositions[i][1]][commitPositions[i][0]] === 1) {
                            move *= 0
                        }
                    } catch {}
                }

                if (move > 0) {
                    currentPiece.origin[0] -= 1
                }

                gridData = currentPiece.commit(gridData, lockedGrid)
                render()
            } else if (inputQueue[0] === right) {
                resetGrid()

                //? Check if the piece is moving off screen or will collide with a block (to the right)
                var move = 1
                var commitPositions = currentPiece.commitPositions(currentPiece.orientations[currentPiece.rotation], [currentPiece.origin[0] + 1, currentPiece.origin[1]])

                for (var i in commitPositions) {
                    try {
                        if (commitPositions[i][0] === gridWidth || lockedGrid[commitPositions[i][1]][commitPositions[i][0]] === 1) {
                            move *= 0
                        }
                    } catch {}
                }

                if (move > 0) {
                    currentPiece.origin[0] += 1
                }

                gridData = currentPiece.commit(gridData, lockedGrid)
                render()
            } else {
                speedAmplifier = 1
            }
            inputQueue.splice(0, 1)
        } catch(e) {
            console.log(e)
        }
        tickCount += 1
    }

    function getPieceCatalog() {
        var pieceCatalog = {
            "O": new oPiece(gridWidth / 2, gridHeight),
            "I": new iPiece(gridWidth / 2, gridHeight),
            "J": new jPiece(gridWidth / 2, gridHeight),
            "L": new lPiece(gridWidth / 2, gridHeight),
            "T": new tPiece(gridWidth / 2, gridHeight),
            "Z": new zPiece(gridWidth / 2, gridHeight),
            "S": new sPiece(gridWidth / 2, gridHeight)
        }
        return pieceCatalog
    }

    //? Settings

    var tickCount = 0 //? Number of ticks processed
    var tickSpeed = 10 //? Time (ms) till next tick
    var gravitySpeed = 75 //? Gravity is applied every ? ticks
    var gridHeight = 24 //? Grid height
    var gridWidth = 10 //? Grid width
    var softDropTime = 75 //? Soft drop is locked after ? ticks
    var clearTime = 75 //? Row is fully cleared after ? ticks
    var cellSize = 20 //? Square size

    //? Controls
    var left = "ArrowLeft"
    var right = "ArrowRight"
    var rotate = "ArrowUp"
    var softDrop = "ArrowDown"
    var hardDrop = "Space"
    var hold = "KeyC"

    //? Initialize variables
    var currentPiece = randomPiece()
    var heldPiece = undefined
    var speed = 1.0
    var gridContainer = document.createElement("div")
    var grid = document.createElement("div")
    var closeButton = document.createElement("button")
    var holdButton = document.createElement("button")
    var gridData = []
    var lockedGrid = []
    var run = true
    var holdPiece = 1

    var inputQueue = [] //? Input format - 0: Hard drop, 1: Soft drop, 2: Rotate, 3: Hold, 4: Left, 5: Right

    grid.style.display = "grid"
    grid.style.gridTemplateColumns = "repeat(10, 1fr)"
    grid.style.gridTemplateRows = "repeat(24, 1fr)"

    for (y = 0; y < gridHeight; y++) {
        var row = []
        var lockRow = []
        for (x = 0; x < gridWidth; x++) {
            voidDiv = createSquareElement("#000000")
            voidDiv.id = x.toString() + ";" + (gridHeight - (y + 1)).toString()
            grid.appendChild(voidDiv)
            lockRow.push(0)
            row.push(new square(x, y, 0))
        }
        lockedGrid.push(lockRow)
        gridData.push(row)
    }

    closeButton.style.position = "absolute"
    closeButton.style.top = "100%"
    closeButton.style.left = "100%"
    closeButton.innerText = "x"
    closeButton.onclick = (e) => { gridContainer.remove(); run = false }

    holdButton.style.position = "absolute"
    holdButton.style.padding = "7.5px"
    holdButton.style.top = "0%"
    holdButton.style.left = "-15%"
    holdButton.innerText = "-"
    holdButton.onclick = (e) => { inputQueue.push(hold); gridContainer.focus() }

    makeDrag(gridContainer)

    gridContainer.tabIndex = "-1"
    gridContainer.onkeydown = (e) => { inputQueue.push(e.code) }

    gridContainer.style.position = "fixed"
    gridContainer.style.top = "30%"
    gridContainer.style.left = "40%"

    gridContainer.appendChild(grid)
    gridContainer.appendChild(closeButton)
    gridContainer.appendChild(holdButton)

    document.body.appendChild(gridContainer)
    gridContainer.focus()
    while (run) {
        tick()
        await new Promise(resolve => setTimeout(resolve, tickSpeed));
    }
}

spawnTetris()