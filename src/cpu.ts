import { Memory } from "./memory";
import { height, width, digits } from "./utils/consts";
import Keyboard from "./utils/keyboard";

/**
 * CHIP-8 Emulator: CPU
 * Krzysztof Krawczyk, January 2021
 * 
 * CHIP-8 has 16 general purpose 8-bit registers V0-VF 
 * There is also 16-bit register called I and 
 * Pseudo-registers PC, SP.
 * 
 * Thanks:
 *  - https://en.wikipedia.org/wiki/CHIP-8
 *  - http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
 */
export default class CPU {
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
        this.PC = 0x200;
        this.SP = 0;
        this.memory = new Memory();
        this.memory.set(digits, 0x00);
    }

    disassemble(opcode: number) {
        switch(opcode & 0xF000) {
            case 0x0000:
                switch(opcode & 0x00FF) {
                    case 0xE0:
                        return 'CLS';
                    case 0xEE:
                        return 'RET';
                    default:
                        return `??? 0x${opcode.toString(16)}`;
                }
            case 0x1000: return "JMP";
            case 0x2000: return "CALL";
            case 0x3000: return "SKIP_EQ";
            case 0x4000: return "SKIP_NE";
            case 0x5000: return "SVY";
            case 0x6000: return "LOAD";
            case 0x7000: return "ADD";
            case 0x8000:
                switch(opcode & 0x000F) {
                    case 0x0: return "LOAD";
                    case 0x1: return "OR";
                    case 0x2: return "AND";
                    case 0x3: return "XOR";
                    case 0x4: return "ADD";
                    case 0x5: return "SUB";
                    case 0x6: return "SHIFT_R";
                    case 0x7: return "SUB VY VX";
                    case 0xE: return "SHIFT_L";
                    default: return `??? 0x${opcode.toString(16)}`;
                }
            case 0x9000: return "SKIP_NE";
            case 0xA000: return "LOAD I";
            case 0xB000: return "JUMP";
            case 0xC000: return "RND";
            case 0xD000: return "DRAW";
            case 0xE000:
                switch(opcode & 0x00FF) {
                    case 0x9E: return "SKIP_KP";
                    case 0xA1: return "SKIP_NKP";
                    default: return `??? 0x${opcode.toString(16)}`;
                }
            case 0xF000:
                switch(opcode & 0x00FF) {
                    case 0x07: return "LOAD_DT";
                    case 0x0A: return "LOAD_KEY";
                    case 0x15: return "SET_DT";
                    case 0x18: return "SET_ST";
                    case 0x1E: return "ADD I VX";
                    case 0x29: return "LD F V";
                    case 0x33: return "LD B V";
                    case 0x55: return "LD [I] V";
                    case 0x65: return "LD V [I]";
                    default: return `??? 0x${opcode.toString(16)}`;
                }
            default:
                return `0x${opcode.toString(16)}`;
        }
    }

    step() {
        const opcode = this.memory.read(this.PC) << 8 | this.memory.read(this.PC + 1);
        console.log(this.disassemble(opcode));
        this.PC += 2;
    }

    getRegister(number: number): number {
        return this.registers[number];
    }

    load(program: number[], startAddress = 0x200) {
        this.memory.set(program, startAddress);
    }

}