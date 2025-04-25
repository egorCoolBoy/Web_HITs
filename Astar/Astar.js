document.getElementById('clustAlg').addEventListener('click', function() {
    window.location.href = "../Clust Alg/Clust Alg.html";
});
document.getElementById('neuralNet').addEventListener('click', function() 
{
    window.location.href = "../Neural Net/NN.html";
});

let mode = null; 
let startCell = null;
let endCell = null;

// установка режима + визуал
function setMode(newMode) {
    mode = newMode;
    const buttons = document.querySelectorAll('.mode-buttons button');

    for (let i = 0; i < 3; i++) {
        const btn = buttons[i];

        if (
            (newMode === 'start' && btn.id === 'btnStart') ||
            (newMode === 'end' && btn.id === 'btnEnd') ||
            (newMode === 'wall' && btn.id === 'btnWall')
        ) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

// создание сетки линейной
function createMap() {
    const size = parseInt(document.getElementById('size').value);
    if (Number.isNaN(size) || size < 2)
    {
        alert("Введите корректный размер поля")
        return;
    }
    
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 35px)`;
    grid.style.gridTemplateRows = `repeat(${size}, 35px)`;

    startCell = null;
    endCell = null;

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;

        cell.addEventListener('click', () => {
            switch (mode) {
                case 'start':
                    setStartCell(cell);
                    break;
                case 'end':
                    setEndCell(cell);
                    break;
                case 'wall':
                    toggleWall(cell);
                    break;
            }
        });

        grid.appendChild(cell);
    }
}

// обработка кликов
function setStartCell(cell) {
    if (startCell !== null) {
        startCell.classList.remove('start');
    }
    startCell = cell;
    cell.classList.add('start');
}

function setEndCell(cell) {
    if (endCell !== null) {
        endCell.classList.remove('end');
    }
    endCell = cell;
    cell.classList.add('end');
}

function toggleWall(cell) {
    if (cell.classList.contains('wall') === true) {
        cell.classList.remove('wall');
    } else {
        cell.classList.add('wall');
    }
}

function showWay() {
    if (!startCell || !endCell) {
        alert("Укажите старт и финиш");
        return;
    }
    const size = parseInt(document.getElementById('size').value);
    const gridArray = [];
    // создает сетку, 1 - стена, 0 - свободно
    for (let y = 0; y < size; y++) {
        gridArray[y] = [];
        for (let x = 0; x < size; x++) {
            const cell = document.getElementById('grid').children[y * size + x];
            gridArray[y][x] = cell.classList.contains('wall') === true ? 1 : 0;

            if (cell.classList.contains('path') === true) {
                cell.classList.remove('path');
            }
        }
    }

    const path = aStar(
        gridArray,
        { x: getCellX(startCell), y: getCellY(startCell) },
        { x: getCellX(endCell), y: getCellY(endCell) }
    );

    if (path === null) {
        alert('Путь не найден');
        return;
    }

    // путь
    for (const pos of path) {
        const cell = document.getElementById('grid').children[pos.y * size + pos.x];
        if (cell !== startCell && cell !== endCell) {
            cell.classList.add('path');
        }
    }
}

// координаты клеток x,y
function getCellX(cell) {
    return cell.dataset.index % Math.sqrt(document.getElementById('grid').children.length);
}

function getCellY(cell) {
    return Math.floor(cell.dataset.index / Math.sqrt(document.getElementById('grid').children.length));
}

// А*

class Cell {
    constructor(x, y, g = 0, h = 0, f = 0, prev = null) {
        this.x = x;           
        this.y = y;           
        this.g = g;           
        this.h = h;           
        this.f = f;           
        this.prev = prev; 
    }
}

function distance(cellA, cellB) {
    return Math.abs(cellA.x - cellB.x) + Math.abs(cellA.y - cellB.y);
}

function getNeighbors(currentCell, grid) {
    const neighbors = [];

    const directions = [
        [0, -1], 
        [0, 1],  
        [-1, 0], 
        [1, 0]   
    ];

    for (const [dx, dy] of directions) {
        const neighborX = currentCell.x + dx;
        const neighborY = currentCell.y + dy;

        if (neighborX >= 0 && neighborX < grid[0].length && neighborY >= 0 && neighborY < grid.length) {

            if (grid[neighborY][neighborX] === 0) {
                neighbors.push(new Cell(neighborX, neighborY));
            }
        }
    }

    return neighbors;
}

function aStar(grid, startPos, endPos) {
    const openCells = [];
    const closedCells = new Set();

    const startCell = new Cell(startPos.x, startPos.y);
    const endCell = new Cell(endPos.x, endPos.y);

    openCells.push(startCell);

    while (openCells.length > 0) {
        openCells.sort((a, b) => a.f - b.f);
        const currentCell = openCells.shift();

        closedCells.add(currentCell.y * grid[0].length + currentCell.x);

        // проверка на финиш
        if (currentCell.x === endCell.x && currentCell.y === endCell.y) {
            const path = [];
            let cell = currentCell;
            while (cell) {
                path.push({ x: cell.x, y: cell.y });
                cell = cell.prev;
            }
            return path.reverse(); // чтобы путь шел от старта к финишу
        }

        const neighbors = getNeighbors(currentCell, grid);
        // проход по соседям, вычисление g, проверка на открытый/закрытый список и присваивание значений
        for (const neighbor of neighbors) {
            const neighborId = neighbor.y * grid[0].length + neighbor.x;

            if (closedCells.has(neighborId) === true) continue;

            const tentativeG = currentCell.g + 1;

            const openCell = openCells.find(c => c.x === neighbor.x && c.y === neighbor.y);

            if (!openCell || tentativeG < openCell.g) {
                neighbor.g = tentativeG;
                neighbor.h = distance(neighbor, endCell);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.prev = currentCell;

                // соседа нет в открытом списке — добавляем
                if (!openCell) {
                    openCells.push(neighbor);
                }
            }
        }
    }

    // путь не найден — null
    return null;
}
