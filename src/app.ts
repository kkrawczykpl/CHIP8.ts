import Keyboard from './utils/keyboard';
const keyboard = new Keyboard();

document.addEventListener("keydown", (event) => {
    keyboard.setKeyDown(event);
});

document.addEventListener("keyup", (event) => {
    keyboard.setKeyUp(event);
});