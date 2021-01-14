import { createGame, changeDirection } from './game';

const root = document.getElementById('root');

createGame(root);

document.addEventListener('keypress', (e) => {
    const directions = {
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
    };

    const newDirection = directions[e.key];

    console.log(newDirection);

    changeDirection(newDirection);
});
