const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Fix for high-DPI screens (e.g., iOS)
function fixDPI() {
    let dpi = window.devicePixelRatio || 1;
    let styleHeight = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    let styleWidth = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    canvas.width = styleWidth * dpi;
    canvas.height = styleHeight * dpi;
    ctx.scale(dpi, dpi);
}

// Grid settings
const gridSize = 64; // Increased block size
const gridWidth = 20;
const gridHeight = 20;

// Camera position (centered on the special square initially)
let cameraX = (Math.floor(gridWidth / 2) * gridSize) - (canvas.width / 2 - gridSize / 2);
let cameraY = (Math.floor(gridHeight / 2) * gridSize) - (canvas.height / 2 - gridSize / 2);

// Touch tracking
let startX, startY;
let isDragging = false;
let isHorizontal = null;

// Generate grid squares with random light hues (only 10% of the grid is populated)
const squares = [];
const specialSquare = { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) };

for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {
        if (i === specialSquare.x && j === specialSquare.y) continue;
        if (Math.random() < 0.1) { // 10% chance to populate a square
            squares.push({ x: i, y: j, hue: Math.random() * 360 });
        }
    }
}

// Render the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    for (let i = 0; i <= gridWidth; i++) {
        for (let j = 0; j <= gridHeight; j++) {
            let x = (i * gridSize) - cameraX + canvas.width / 2 - gridSize / 2;
            let y = (j * gridSize) - cameraY + canvas.height / 2 - gridSize / 2;
            ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
    
    squares.forEach(square => {
        ctx.fillStyle = `hsl(${square.hue}, 80%, 80%)`; // Lighter colors
        ctx.fillRect(
            (square.x * gridSize) - cameraX + canvas.width / 2 - gridSize / 2,
            (square.y * gridSize) - cameraY + canvas.height / 2 - gridSize / 2,
            gridSize,
            gridSize
        );
    });
    
    // Draw the distinct center square (black)
    ctx.fillStyle = "black";
    ctx.fillRect(
        canvas.width / 2 - gridSize / 2,
        canvas.height / 2 - gridSize / 2,
        gridSize,
        gridSize
    );
}

// Touch handling
canvas.addEventListener("touchstart", (event) => {
    snapToGrid(true); // Instantly snap before dragging again
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
function snapToGrid(instaSnap = false) {
    const targetX = Math.round(cameraX / gridSize) * gridSize;
    const targetY = Math.round(cameraY / gridSize) * gridSize;
    
    if (instaSnap) {
        cameraX = targetX;
        cameraY = targetY;
        drawGrid();
        return;
    }
    
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
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    fixDPI();
    drawGrid();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();