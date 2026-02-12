// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const levelDisplay = document.getElementById('level');
const gameStatus = document.getElementById('gameStatus');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let lives = 3;
let level = 1;
let gameActive = false;
let gamePaused = false;
let gameOver = false;

// Player Object
const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 60,
    width: 30,
    height: 30,
    speed: 5,
    dx: 0,
    dy: 0,
    jumping: false,
    jumpPower: 15,
    color: '#667eea'
};

// Game Objects Arrays
let collectibles = [];
let obstacles = [];
let enemies = [];

// Collectible Object
class Collectible {
    constructor() {
        this.x = Math.random() * (canvas.width - 20);
        this.y = Math.random() * (canvas.height - 100);
        this.width = 20;
        this.height = 20;
        this.color = '#FFD700';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Obstacle Object
class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 20;
        this.color = '#FF6B6B';
        this.dx = -2 - level;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;
    }
}

// Enemy Object
class Enemy {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * (canvas.height / 2);
        this.width = 25;
        this.height = 25;
        this.color = '#FF4500';
        this.speed = 2 + level * 0.5;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Event Listeners
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
canvas.addEventListener('click', shoot);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

// Game Functions
function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === 'ArrowRight') player.dx = player.speed;
    if (e.key === ' ') {
        e.preventDefault();
        if (!player.jumping) {
            player.jumping = true;
            player.dy = -player.jumpPower;
        }
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
}

function shoot() {
    // Implement shooting logic if needed
}

function startGame() {
    if (!gameActive) {
        gameActive = true;
        gameOver = false;
        gamePaused = false;
        score = 0;
        lives = 3;
        level = 1;
        collectibles = [];
        obstacles = [];
        enemies = [];
        
        // Initialize game objects
        for (let i = 0; i < 3 + level; i++) {
            collectibles.push(new Collectible());
        }
        for (let i = 0; i < 2 + level; i++) {
            enemies.push(new Enemy());
        }
        
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        updateUI();
        gameLoop();
    }
}

function togglePause() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
}

function restartGame() {
    gameActive = false;
    gameOver = false;
    gamePaused = false;
    score = 0;
    lives = 3;
    level = 1;
    player.dy = 0;
    player.jumping = false;
    player.x = canvas.width / 2 - 15;
    player.y = canvas.height - 60;
    collectibles = [];
    obstacles = [];
    enemies = [];
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    gameStatus.textContent = '';
    gameStatus.className = '';
    updateUI();
    draw();
}

function updateUI() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    levelDisplay.textContent = level;
}

function update() {
    if (!gameActive || gamePaused) return;

    // Update player position
    player.x += player.dx;
    player.y += player.dy;

    // Apply gravity
    player.dy += 0.4;

    // Ground collision
    if (player.y + player.height >= canvas.height - 10) {
        player.y = canvas.height - player.height - 10;
        player.jumping = false;
    }

    // Wall collision
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Update obstacles
    obstacles.forEach((obs, index) => {
        obs.update();
        if (obs.x > canvas.width) obstacles.splice(index, 1);
    });

    // Collectible collision
    collectibles.forEach((coll, index) => {
        if (checkCollision(player, coll)) {
            score += 10;
            collectibles.splice(index, 1);
            collectibles.push(new Collectible());
            
            // Level up at certain score
            if (score % 100 === 0 && score > 0) {
                level++;
                pauseBtn.textContent = 'Pause';
                gamePaused = true;
                gameStatus.textContent = `Level Up! Level ${level}`;
                gameStatus.className = 'playing';
                setTimeout(() => {
                    gamePaused = false;
                    gameStatus.textContent = '';
                }, 2000);
            }
        }
    });

    // Enemy collision
    enemies.forEach(enemy => {
        if (checkCollision(player, enemy)) {
            lives--;
            if (lives <= 0) {
                gameActive = false;
                gameOver = true;
                gameStatus.textContent = 'Game Over! You Lost!';
                gameStatus.className = 'lose';
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            } else {
                // Reset player position
                player.x = canvas.width / 2 - 15;
                player.y = canvas.height - 60;
            }
        }
    });

    // Obstacle collision
    obstacles.forEach(obs => {
        if (checkCollision(player, obs)) {
            lives--;
            if (lives <= 0) {
                gameActive = false;
                gameOver = true;
                gameStatus.textContent = 'Game Over! You Lost!';
                gameStatus.className = 'lose';
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        }
    });

    updateUI();
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw collectibles
    collectibles.forEach(coll => coll.draw());

    // Draw obstacles
    obstacles.forEach(obs => obs.draw());

    // Draw enemies
    enemies.forEach(enemy => enemy.draw());
}

function gameLoop() {
    if (!gameActive) return;

    // Randomly create obstacles
    if (Math.random() < 0.02 + level * 0.01) {
        obstacles.push(new Obstacle(canvas.width, Math.random() * (canvas.height - 100)));
    }

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initial draw
draw();
