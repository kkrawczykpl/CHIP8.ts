/**
 * CHIP-8 Emulator: Main app script
 * Krzysztof Krawczyk, January 2021
 */

import Keyboard from './utils/keyboard';
import CPU from './cpu';

const keyboard = new Keyboard();
const cpu = new CPU(keyboard);

document.addEventListener("keydown", (event) => {
    keyboard.setKeyDown(event);
});

document.addEventListener("keyup", (event) => {
    keyboard.setKeyUp(event);
});


