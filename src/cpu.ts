import { runInThisContext } from "vm";
import { Memory } from "./memory";
import { height, width } from "./utils/consts";
import Keyboard from "./utils/keyboard";

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
    private registers: Uint8Array;
    private stack: Uint16Array;
    private screen: Uint8Array;
    private delayTimer: number;
    private soundTimer: number;
    private keyboard: Keyboard;
    private PC: number; // Program Counter
    private SP: number; // Stack Pointer
    private memory: Memory;

    constructor(keyboard: Keyboard) {
        this.registers = new Uint8Array(0x10).fill(0 & 0xFF);
        this.stack = new Uint16Array(0x10).fill(0 & 0xFFFF);
        this.screen = new Uint8Array(width * height);
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.keyboard = keyboard;
        this.PC = 0 & 0xFFFF;
        this.SP = 0;
        this.memory = new Memory();
    }

    getRegister(number: number): number {
        return this.registers[number];
    }
}