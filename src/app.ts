/**
 * CHIP-8 Emulator: Main app script
 * Krzysztof Krawczyk, January 2021
 */

import Keyboard from './utils/keyboard';
import CPU from './cpu';
import { height, width } from './utils/consts';

const keyboard: Keyboard = new Keyboard();
const canvas: HTMLCanvasElement = document.getElementById('screen') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

const cpu: CPU = new CPU(keyboard, ctx);

canvas.width = width;
canvas.height = height;

document.addEventListener("keydown", (event: KeyboardEvent): void => {
    keyboard.setKeyDown(event);
});

document.addEventListener("keyup", (event: KeyboardEvent): void => {
    keyboard.setKeyUp(event);
});

const loop = () => {
    requestAnimationFrame(loop);
    cpu.screen.render();
}

loop();

window.setInterval(() => cpu.updateTimers(), 1000 / 120)
window.setInterval(() => cpu.step(), 1000 / 240);


