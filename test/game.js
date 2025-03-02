const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 32; // Each grid cell is 32x32 pixels
const mazeSize = 10; // 10x10 grid, so canvas is 320x320 pixels

// Maze layout: 1 = wall, 0 = path
const maze = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1]
];

/**
 * Converts grid coordinates to pixel coordinates
 * @param {number} gridX - X position in grid
 * @param {number} gridY - Y position in grid
 * @returns {Object} - Pixel coordinates {x, y}
 */
function gridToPixel(gridX, gridY) {
    return {
        x: gridX * cellSize,
        y: gridY * cellSize
    };
}

/**
 * Finds a random open position in the maze (where maze[y][x] === 0)
 * @returns {Object} - Grid coordinates {gridX, gridY}
 */
function getRandomOpenPosition() {
    let x, y;
    do {
        x = Math.floor(Math.random() * mazeSize);
        y = Math.floor(Math.random() * mazeSize);
    } while (maze[y][x] !== 0);
    return { gridX: x, gridY: y };
}

// Asset loading
let assetsLoaded = 0;
const totalAssets = 2; // bunny.png and carrot.png

/**
 * Loads an image asset and tracks loading progress
 * @param {string} imageSrc - Path to the image
 * @returns {Image} - The loaded image object
 */
function loadAsset(imageSrc) {
    const img = new Image();
    img.onload = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            startGame();
        }
    };
    img.onerror = () => console.error(`Failed to load image: ${imageSrc}`);
    img.src = imageSrc;
    return img;
}

const bunnyImg = loadAsset('bunny.png');
const carrotImg = loadAsset('carrot.png');

// Game objects
const bunny = {
    gridX: 1, // Starting at an open position
    gridY: 1,
    x: 0,     // Pixel position, set later
    y: 0
};

const carrot = {
    gridX: 0, // Will be set to random open position
    gridY: 0,
    x: 0,     // Pixel position, set later
    y: 0
};

/**
 * Initializes bunny and carrot positions, converting grid to pixel coordinates
 */
function initPositions() {
    const bunnyPixel = gridToPixel(bunny.gridX, bunny.gridY);
    bunny.x = bunnyPixel.x;
    bunny.y = bunnyPixel.y;

    const carrotPos = getRandomOpenPosition();
    carrot.gridX = carrotPos.gridX;
    carrot.gridY = carrotPos.gridY;
    const carrotPixel = gridToPixel(carrot.gridX, carrot.gridY);
    carrot.x = carrotPixel.x;
    carrot.y = carrotPixel.y;
}

/**
 * Renders the maze walls
 */
function renderMaze() {
    ctx.fillStyle = '#000'; // Black walls
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (maze[y][x] === 1) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

/**
 * Renders the entire game scene
 */
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderMaze();
    ctx.drawImage(bunnyImg, bunny.x, bunny.y);
    ctx.drawImage(carrotImg, carrot.x, carrot.y);
}

/**
 * Moves the bunny in the specified direction if possible
 * @param {number} dx - Change in gridX (-1, 0, 1)
 * @param {number} dy - Change in gridY (-1, 0, 1)
 */
function moveBunny(dx, dy) {
    const newGridX = bunny.gridX + dx;
    const newGridY = bunny.gridY + dy;
    // Check boundaries and if the new position is a path (0)
    if (newGridX >= 0 && newGridX < mazeSize &&
        newGridY >= 0 && newGridY < mazeSize &&
        maze[newGridY][newGridX] === 0) {
        bunny.gridX = newGridX;
        bunny.gridY = newGridY;
        const pixelPos = gridToPixel(newGridX, newGridY);
        bunny.x = pixelPos.x;
        bunny.y = pixelPos.y;
        checkCarrot();
    }
}

/**
 * Checks if the bunny has reached the carrot and repositions it if so
 */
function checkCarrot() {
    if (bunny.gridX === carrot.gridX && bunny.gridY === carrot.gridY) {
        const newPos = getRandomOpenPosition();
        carrot.gridX = newPos.gridX;
        carrot.gridY = newPos.gridY;
        const pixelPos = gridToPixel(newPos.gridX, newPos.gridY);
        carrot.x = pixelPos.x;
        carrot.y = pixelPos.y;
    }
}

/**
 * Main game loop
 */
function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}

/**
 * Starts the game once assets are loaded
 */
function startGame() {
    initPositions();
    gameLoop();
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            moveBunny(0, -1);
            break;
        case 'ArrowDown':
            moveBunny(0, 1);
            break;
        case 'ArrowLeft':
            moveBunny(-1, 0);
            break;
        case 'ArrowRight':
            moveBunny(1, 0);
            break;
    }
});
