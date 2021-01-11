/**
 * CHIP-8 Emulator: Display
 * Krzysztof Krawczyk, January 2021
 *
 */

import { height, width } from "./utils/consts";

export default class Display {
    public screen: Uint8Array;
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.screen = new Uint8Array(width * height);
    }

    setPixel(x: number, y: number): boolean {
        if(x > width) { x -= width; } else if (x < 0) { x += width; }
        if(y > height) { y -= height; } else if (y < 0) { y += height; }

        this.screen[(y * width) + x] ^= 1;

        return !this.screen[(y * width) + x];
    }

    getPixel(x: number, y: number): number {
        return this.screen[(y * width) + x];
    }

    clear() {
        this.screen = new Uint8Array(width * height);
    }

    // @refactorneeded
    render() {
        this.ctx.clearRect(0, 0, 640, 320);
        for (let i = 0; i < width * height; i++) {
            const x = (i % width) * 10;
            const y = Math.floor(i / width) * 10;
            if (this.screen[i]) {
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(x, y, 10, 10);
            }
        }
    }
}