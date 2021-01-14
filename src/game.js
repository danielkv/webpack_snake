const settings = {
    fruitColor: '#ff0000',
    fruitSize: 20,
    snakeColor: '#000000',
    snakePieceSize: 20,
    canvasWidth: 700,
    canvasHeigth: 700,
};

const state = {
    snake: null,
    interval: null,
    fruitsEaten: 0,
    fruits: [],
    canvasContext: null,
    direction: 'left',
};

export function createGame(wrapper) {
    const canvas = createCanvas();
    wrapper.appendChild(canvas);

    start();
}

function resetGame(ctx) {
    resetCanvas(ctx);
    clearInterval(state.interval);
    state.fruits = [];
    state.snake = null;
    state.fruitsEaten = 0;
    state.direction = 'left';

    start();
}

function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    canvas.width = settings.canvasWidth;
    canvas.height = settings.canvasHeigth;

    return canvas;
}

function start() {
    const snakePieces = createSnakeTail(createRandomSnakeHead(), 8, state.direction);
    const fruit = createRandomFruit();
    const ctx = canvas.getContext('2d');

    state.fruits = [fruit];
    state.snake = snakePieces;
    state.canvasContext = ctx;

    state.interval = setInterval(draw, 50);
}

function calculateGame() {
    const snakePieces = state.snake;
    let fruits = state.fruits;
    let growSnake = false;
    let forceCreateFruits = false;

    // fruits
    const fruitHitIndex = testHitFruit(snakePieces, fruits);
    const fruitHit = fruits[fruitHitIndex];
    if (fruitHit) {
        fruits.splice(fruitHitIndex, 1);
        state.fruitsEaten++;
        growSnake = true;
        if (!fruits.length) forceCreateFruits = true;
    }

    fruits = createNewFruits(fruits, forceCreateFruits);

    state.fruits = fruits;

    // snake
    const snake = moveSnake(snakePieces, state.direction, growSnake);

    const head = snake[0];
    const tail = snake.slice(1);

    if (tail.some((piece) => piece.x === head.x && piece.y === head.y)) resetGame(ctx);
}

function draw() {
    const ctx = state.canvasContext;

    resetCanvas(ctx);

    calculateGame();

    // drawing
    drawSnake(ctx, state.snake);
    drawFruits(ctx, state.fruits);
}

function resetCanvas(context) {
    // Store the current transformation matrix
    context.save();

    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    context.restore();
}

function drawSnakePiece(ctx, { x, y }) {
    ctx.fillStyle = settings.snakeColor;
    ctx.fillRect(x, y, settings.snakePieceSize, settings.snakePieceSize);
}

function drawSnake(ctx, snakePieces) {
    snakePieces.forEach((piece) => drawSnakePiece(ctx, piece));
    state.snake = snakePieces;
}

function createSnakeTail(head, length = 8, direction = 'right') {
    const snakePieces = [head];

    const { speedX, speedY } = snakeSpeedDirection(direction);

    for (let i = 0; i < length - 1; i++) {
        const actualPiece = snakePieces[snakePieces.length - 1];

        const { finalX, finalY } = checkBounderies({ x: actualPiece.x - speedX, y: actualPiece.y - speedY });

        const nextPiece = { x: finalX, y: finalY };
        snakePieces.push(nextPiece);
    }

    return snakePieces;
}

function checkBounderies({ x, y }) {
    let finalX = x;
    let finalY = y;

    if (finalX >= settings.canvasWidth) finalX = 0;
    if (finalX < 0) finalX = settings.canvasWidth - settings.snakePieceSize;
    if (finalY >= settings.canvasHeigth) finalY = 0;
    if (finalY < 0) finalY = settings.canvasHeigth - settings.snakePieceSize;

    return { finalX, finalY };
}

function snakeSpeedDirection(direction) {
    let speedX = 0,
        speedY = 0;

    switch (direction) {
        case 'right':
            speedX = settings.snakePieceSize;
            break;
        case 'left':
            speedX = -settings.snakePieceSize;
            break;
        case 'up':
            speedY = -settings.snakePieceSize;
            break;
        case 'down':
            speedY = settings.snakePieceSize;
            break;
        default:
            speedX = 0;
            speedY = 0;
    }

    return {
        speedX,
        speedY,
    };
}

function createRandomSnakeHead() {
    const verticalSpaces = settings.canvasHeigth / settings.snakePieceSize;
    const horizontalSpaces = settings.canvasWidth / settings.snakePieceSize;

    return {
        x: Math.floor(Math.random() * horizontalSpaces) * settings.snakePieceSize,
        y: Math.floor(Math.random() * verticalSpaces) * settings.snakePieceSize,
    };
}

function moveSnake(snakePieces, direction, grow = false) {
    const { speedX, speedY } = snakeSpeedDirection(direction);

    const head = snakePieces[0];
    const nextPiece = { x: head.x + speedX, y: head.y + speedY };
    const { finalX, finalY } = checkBounderies(nextPiece);

    snakePieces = [{ x: finalX, y: finalY }, ...snakePieces];

    if (!grow) snakePieces.pop();

    return snakePieces;
}

export function changeDirection(direction) {
    const actualDirection = state.direction;

    const validDirections = ['up', 'down', 'right', 'left'];
    if (!validDirections.includes(direction)) return console.error('Direção inválida');

    const invalidChanges = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
    };

    if (invalidChanges[actualDirection] === direction) return console.error('Mudança de direção inválida');

    state.direction = direction;
}

function createRandomFruit() {
    const verticalSpaces = settings.canvasHeigth / settings.snakePieceSize;
    const horizontalSpaces = settings.canvasWidth / settings.snakePieceSize;

    return {
        x: Math.floor(Math.random() * horizontalSpaces) * settings.snakePieceSize,
        y: Math.floor(Math.random() * verticalSpaces) * settings.snakePieceSize,
    };
}

function drawFruit(ctx, { x, y }) {
    ctx.fillStyle = settings.fruitColor;
    ctx.fillRect(x, y, settings.fruitSize, settings.fruitSize);
}

function drawFruits(ctx, fruits) {
    fruits.forEach((fruit) => drawFruit(ctx, fruit));
}

function testHitFruit(snake, fruits) {
    const head = snake[0];

    const fruitHitIndex = fruits.findIndex((fruit) => fruit.x === head.x && fruit.y === head.y);

    return fruitHitIndex;
}

function createNewFruits(fruits, force = false) {
    if (!force && Math.random() < 0.98) return fruits;

    const newFruits = [createRandomFruit(), ...fruits];

    return newFruits;
}
