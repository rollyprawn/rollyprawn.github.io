// Declaration of required global variables.
let width;
let height;
let fps;
let tileSize;
let canvas;
let ctx;
let paddle;
let ball;
let score;
let isPaused;
let interval;
let gravity;
let paddleWidth;
let paddleSpeed;
let ballMultiplicity;
let ballElasticity;
let isGame;
let instructionsShowing;
let gameInitialised = 0;
let startInitialised = 0;
var ball_list = {};
var Keys = {

    left : false,
    right : false

}

window.onkeydown = function(e) {

    var kc = e.keyCode;
    //e.preventDefault();

    if      (kc === 37) Keys.left = true;
    else if (kc === 39) Keys.right = true;
    
};

window.onkeyup = function(e) {

    var kc = e.keyCode;
    //e.preventDefault();

    if      (kc === 37) Keys.left = false;
    else if (kc === 39) Keys.right = false;
    
};

// Loading the browser window
window.addEventListener("load",function(){

    main();

});

// Adding an event listener for key presses.
window.addEventListener("keydown", function (evt) {

    if (evt.keyCode === 32) {
        evt.preventDefault();
        isPaused = !isPaused;
        showPaused();
    }

    if (evt.keyCode === 13) {
        evt.preventDefault();
        isGame = true;
    }

});

// Determining a spawn location on the grid.
function spawnLocation(xPos, yPos) {

    return { x: xPos, y: yPos };

}

// Determining a random spawn location on the grid.
function randomSpawnLocation() {

    let xPos;
    let yPos;
    
    // Breaking the entire canvas into a grid of tiles.
    let rows = width / tileSize;
    let cols = height / tileSize;

    xPos = Math.floor(Math.random() * rows) * tileSize;
    yPos = Math.floor(Math.random() * 0.5*cols) * tileSize;

    return { x: xPos, y: yPos };

}

// Showing the score of the player.
function showScore() {

    ctx.textAlign = "center";
    ctx.font = "25px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("SCORE: " + score, width - 120, 30);

}

// Showing if the game is paused.
function showPaused() {

    ctx.textAlign = "center";
    ctx.font = "35px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("PAUSED", width / 2, height / 2);

}

// Showing the start screen instructions
function showStartInstructions() {

    ctx.textAlign = "center";
    ctx.font = "35px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Use LEFT and RIGHT keys to move.", width / 2, height / 2);
    ctx.fillText("Hit ENTER to begin!", width / 2, height / 1.6);

}

// Treating the paddle as an object.
class Paddle {

    // Initialization of object properties.
    constructor(pos, color) {

        this.x = pos.x;
        this.y = pos.y;
        this.velX = 0;
        this.velY = 0;
        this.color = color;

    }

    // Drawing the paddle on the canvas.
    draw() {

        ctx.beginPath();
        ctx.rect(this.x, this.y, paddleWidth * tileSize, tileSize);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();

    }

    // Moving the paddle by updating position.
    move() {

        // Movement
	if (Keys['left']) {
            this.x -= paddleSpeed;
	};
	if (Keys['right']) {
            this.x += paddleSpeed;
	};

    }
    
}

// Treating the ball as an object.
class Ball {

    // Initialization of object properties.
    constructor(pos, color) {

        this.x = pos.x;
        this.y = pos.y;
        this.velX = Math.random() * 2 - 1;
        this.velY = Math.random() * 2 - 1;
        this.color = color;

    }

    // Drawing the paddle on the canvas.
    draw() {

        ctx.beginPath();
        ctx.rect(this.x, this.y, tileSize, tileSize);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();

    }

    // Moving the paddle by updating position.
    move() {

        // Movement 
        this.x += this.velX * tileSize;
        this.y += this.velY * tileSize;

    }

    // Changing the direction of movement.
    dir(dirX, dirY) {

        this.velX = dirX;
        this.velY = dirY;

    }
    
    // Changing the direction of movement.
    gravitate() {

        this.velY += gravity;

    }
    
    
}

// Game view controller
function game() {

    if (!gameInitialised) {

	game_init();
	gameInitialised = true;

    }
    else {

	game_update();

    };
    
}

// Initialization of the game objects.
function game_init() {
    
    tileSize = 20;
    gravity = 0.05;
    paddleWidth = 8;
    paddleSpeed = 40;
    ballMultiplicity = 10;
    ballElasticity = 1.05;

    // Dynamically controlling the size of canvas.
    width = tileSize * Math.floor(window.innerWidth / tileSize);
    height = tileSize * Math.floor(window.innerHeight / tileSize);;

    canvas = document.getElementById("game-area");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");

    isPaused = false;
    score = 0;
    paddle = new Paddle(spawnLocation(width / 2, yPos = Math.floor(height * 0.9)), "red");
    
    for (let i = 0; i < ballMultiplicity; i++) {

	ball_list[i] = new Ball(randomSpawnLocation(), "blue");
	//ball = new Ball(spawnLocation(width / 2, yPos = Math.floor(height * 0.1)), "blue");
	
    }

}

// Updating the position and redrawing of game objects.
function game_update() {
    
    // Checking if game is paused.
    if (isPaused) {
        return;
    }

    // Clearing the canvas for redrawing.
    ctx.clearRect(0, 0, width, height);

    paddle.draw();
    paddle.move();
    paddle.velX = 0;
    paddle.velY = 0;
    
    // Loop for handling balls
    for (const [i, ball] of Object.entries(ball_list)) {
	
	ball.draw();
	ball.move();
	ball.gravitate();

	// Collision handling
	if ((ball.y > paddle.y - 1 * tileSize) &
	    (ball.x < paddle.x + Math.floor(paddleWidth * tileSize) &
	     ball.x > paddle.x - Math.floor(paddleWidth)))
	{
	    score += 1;
	    ball.velY *= -1 * ballElasticity;
	}
	
	// Balls bounce off walls
	if ((ball.x < 0) | (ball.x > width - tileSize)) {
	    ball.velX *= -1 * ballElasticity;
	}

	if (ball.y < 0) {
	    ball.velY *= -1 * ballElasticity;
	}
	
	// Balls disappear when they fall out of the screen	
	if (ball.y > height) {
	    delete ball_list[i];
	}

    }
	
    showScore();
    
    // Paddle can't disappear from screen
    if (paddle.x < -paddleWidth * tileSize) {
	paddle.x = width - paddleWidth * tileSize;
    }
    else if (paddle.x > width ) {
	paddle.x = 0;
    }
    
    showScore();
    
}

// Start view controller
function start() {

    if (!startInitialised) {

	start_init();
	startInitialised = true;

    }
    else {

	start_update();

    };
    
}

// Initialization of the start screen.
function start_init() {
    
    instructionsShowing = 1;
    isGame = 0;
    tileSize = 20;

    // Dynamically controlling the size of canvas.
    width = tileSize * Math.floor(window.innerWidth / tileSize);
    height = tileSize * Math.floor(window.innerHeight / tileSize);;

    canvas = document.getElementById("game-area");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");

}

// Updating the position and redrawing of game objects.
function start_update() {
    
    // Clearing the canvas for redrawing.
    ctx.clearRect(0, 0, width, height);
    
    // Flashing instructions
    if (instructionsShowing) {
	showStartInstructions();
    }

    //instructionsShowing = !instructionsShowing;
    
}

// The actual game function.
function main() {

    fps = 20;
    
    //interval = setInterval(game_update,1000/fps);
    var interval = setInterval(function(){
	if (!isGame) {
	    start();
	}
	else {
	    game();
	}
    }, 1000/fps);


}
