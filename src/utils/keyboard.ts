import { keysMap } from "./consts";
/**
 * CHIP-8 Emulator: Keyboard
 * Krzysztof Krawczyk, January 2021
 * 
 * Computers which originally used CHIP-8 had a 16-key
 * hex keyboard 0-F. It has to be mapped into other configuration.
 * 
 * 16-key hex keyboard layout:
 *   1  2  3  C
 *   4  5  6  D
 *   7  8  9  E
 *   A  0  B  F
 *
 * Thanks:
 *  - https://en.wikipedia.org/wiki/CHIP-8
 *  - http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
 */


export default class Keyboard {
    public keysPressed: Uint8Array;

    constructor() {
        this.keysPressed = new Uint8Array(0x10).fill(0);
        console.log('Keyboard initialized....');
    }
    
    public setKeyDown(event: KeyboardEvent) {
        const key: string = event.key.toUpperCase();
        let index: number = keysMap.indexOf(key); 
        if(index > -1) {
            this.keysPressed[index] = 1;
        }
        console.log(this.keysPressed);
    }

    public setKeyUp(event: KeyboardEvent) {
        const key: string = event.key.toUpperCase();
        let index: number = keysMap.indexOf(key); 
        if(index > -1) {
            this.keysPressed[index] = 0;
        }
        console.log(this.keysPressed);
    }
}