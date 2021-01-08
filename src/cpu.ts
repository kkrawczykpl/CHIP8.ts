/**
 * CHIP-8 Emulator: CPU
 * Krzysztof Krawczyk, January 2020
 * 
 * CHIP-8 has 16 general purpose 8-bit registers V0-VF 
 * There is also 16-bit register called I and 
 * Pseudo-registers PC, SP.
 * 
 * Thanks:
 *  - https://en.wikipedia.org/wiki/CHIP-8
 *  - http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
 */
export class CPU {
    registers: Uint8Array;
    stack: Uint16Array;
    pc: number; // Program Counter
    sp: number; // Stack Pointer
    delayTimer: number;
    soundTimer: number;

    constructor() {
        this.registers = new Uint8Array(16).fill(0 & 0xFF);
        this.stack = new Uint16Array(16).fill(0 & 0xFFFF);
        this.pc = 0 & 0xFFFF;
        this.sp = 0;
        this.delayTimer = 0;
        this.soundTimer = 0;
    }

    getRegister(number: number): number {
        return this.registers[number];
    }
}