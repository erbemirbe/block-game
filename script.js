const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Grid settings
const gridSize = 50; // Size of each square
const gridWidth = 20;
const gridHeight = 20;

// Camera position (starts at 0,0 but will be centered on the special square)
let cameraX = 0;
let cameraY = 0;

// Touch tracking
let startX, startY;
let isDragging = false;
let isHorizontal = null;

// Generate grid squares with random hues
const squares = [];
const specialSquare = { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) };

for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {
        if (i === specialSquare.x && j === specialSquare.y) continue;
        squares.push({ x: i, y: j, hue: Math.random() * 360 });
    }
}

// Render the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    squares.forEach(square => {
        ctx.fillStyle = `hsl(${square.hue}, 80%, 50%)`;
        ctx.fillRect(
            (square.x * gridSize) - cameraX + canvas.width / 2 - gridSize / 2,
            (square.y * gridSize) - cameraY + canvas.height / 2 - gridSize / 2,
            gridSize,
            gridSize
        );
    });
    
    // Draw the distinct center square
    ctx.fillStyle = "red";
    ctx.fillRect(
        canvas.width / 2 - gridSize / 2,
        canvas.height / 2 - gridSize / 2,
        gridSize,
        gridSize
    );
}

// Touch handling
canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isDragging = true;
    isHorizontal = null;
});

canvas.addEventListener("touchmove", (event) => {
    if (!isDragging) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    if (isHorizontal === null) {
        isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    }
    
    if (isHorizontal) {
        cameraX -= deltaX;
    } else {
        cameraY -= deltaY;
    }
    
    startX = touch.clientX;
    startY = touch.clientY;
    drawGrid();
});

canvas.addEventListener("touchend", () => {
    isDragging = false;
    snapToGrid();
});

// Smooth snap-to-grid function
function snapToGrid() {
    const targetX = Math.round(cameraX / gridSize) * gridSize;
    const targetY = Math.round(cameraY / gridSize) * gridSize;
    
    function animate() {
        cameraX += (targetX - cameraX) * 0.2;
        cameraY += (targetY - cameraY) * 0.2;
        
        if (Math.abs(targetX - cameraX) < 1 && Math.abs(targetY - cameraY) < 1) {
            cameraX = targetX;
            cameraY = targetY;
            drawGrid();
            return;
        }
        
        drawGrid();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

// Resize and initialize
function resizeCanvas() {
    canvas.width = window.innerWidth -100;
    canvas.height = window.innerHeight-100;
    drawGrid();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
