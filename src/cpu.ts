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
 *  - https://github.com/mattmikolay/chip-8/wiki/CHIP%E2%80%908-Instruction-Set
 */
export default class CPU {
    private registers: Uint8Array;
    private stack: Uint16Array;
    private screen: Uint8Array;
    private delayTimer: number;
    private soundTimer: number;
    private keyboard: Keyboard;
    private memory: Memory;
    private PC: number; // Program Counter
    private SP: number; // Stack Pointer
    private I: number; // I register - stores memory addresses.

    constructor(keyboard: Keyboard) {
        this.registers = new Uint8Array(0x10).fill(0 & 0xFF);
        this.stack = new Uint16Array(0x10).fill(0 & 0xFFFF);
        this.screen = new Uint8Array(width * height);
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.keyboard = keyboard;
        this.memory = new Memory();
        this.memory.set(digits, 0x00);
        this.PC = 0x200;
        this.SP = 0;
        this.I = 0 & 0xFFFF;
    }

    doOpcode(opcode: number) {
        const x = (opcode & 0x0F00) >> 8;
        const y = (opcode & 0x00F0) >> 4;
        switch(opcode & 0xF000) {
            case 0x0000:
                switch(opcode & 0x00FF) {
                    // Clear the display.
                    case 0xE0:
                        return 'CLS';
                    // Return from a subroutine.
                    case 0xEE:
                        this.PC = this.stack[this.SP];
                        this.SP -= 1;
                        return 'RET';
                    default:
                        return `??? 0x${opcode.toString(16)}`;
                }
            // 1NNN Jump to location NNN.
            case 0x1000:
                this.PC = opcode & 0x0FFF;
                return "JMP";
            // 2NNN Call subroutine at NNN.
            case 0x2000:
                this.SP += 1;
                this.stack[this.SP] = this.PC;
                this.PC = opcode & 0x0FFF;
                return "CALL";
            // 3xKK Skip next instruction if Vx = KK.
            case 0x3000:
                if( this.registers[x] === (opcode & 0x00FF) ) {
                    this.PC += 2;
                }
                return "SKIP_EQ";
            // 4xKK Skip next instruction if Vx != kk
            case 0x4000:
                if( this.registers[x] != (opcode & 0x00FF) ) {
                    this.PC += 2;
                }
                return "SKIP_NE";
            // 5xy0 Skip next instruction if Vx = Vy.
            case 0x5000:
                if( this.registers[x] != this.registers[y] ) {
                    this.PC += 2;
                }
                return "SVY";
            // 6xKK Set Vx = kk.
            case 0x6000:
                this.registers[x] = (opcode & 0x00FF);
                return "LOAD";
            // 7xKK Set Vx = Vx + kk.
            case 0x7000:
                this.registers[x] = this.checkOverflow(this.registers[x] + (opcode & 0x00FF));
                return "ADD";
            case 0x8000:
                switch(opcode & 0x000F) {
                    // 8xy0 Set Vx = Vy
                    case 0x0:
                        this.registers[x] = this.registers[y]
                        return "LOAD";
                    // 8xy1 Set Vx = Vx OR Vy.
                    case 0x1:
                        this.registers[x] |= this.registers[y]
                        return "OR";
                    // 8xy2 Set Vx = Vx AND Vy.
                    case 0x2:
                        this.registers[x] &= this.registers[y];
                        return "AND";
                    // 8xy3 Set Vx = Vx XOR Vy.
                    case 0x3:
                        this.registers[x] ^= this.registers[y];
                        return "XOR";
                    // 8xy4 Add the value of register VY to register VX
                    case 0x4:
                        this.registers[0xF] = 0;
                        const sum = (this.registers[x] += this.registers[y]);
                        if(sum > 0xFF) {
                            this.registers[0xF] = 1;
                        }
                        this.registers[x] = sum;
                        return "ADD";
                    // 8xy5 - Subtract the value of register VY from register VX
                    case 0x5:
                        this.registers[0xF] = 0;
                        if(this.registers[x] > this.registers[y]) {
                            this.registers[0xF] = 1;
                        }
                        this.registers[x] -= this.registers[y];
                        return "SUB VX VY";
                    // 8xy6 Set Vx = Vx SHR 1.
                    case 0x6:
                        this.registers[0xF] = (this.registers[x] & 0x1);
                        this.registers[x] >>= 1;
                        return "SHIFT_R";
                    // 8xy7 Set Vx = Vy - Vx, set VF = NOT borrow.
                    case 0x7:
                        this.registers[0xF] = 0;
                        if(this.registers[y] > this.registers[x]) {
                            this.registers[0xF] = 1;
                        }
                        this.registers[y] -= this.registers[x];
                        return "SUB VY VX";
                    // 8xyE Set Vx = Vx SHL 1.
                    case 0xE:
                        this.registers[0xF] = (this.registers[x] & 0x80);
                        this.registers[x] <<= 1;
                        return "SHIFT_L";
                    default: return `??? 0x${opcode.toString(16)}`;
                }
            // 9xy0 Skip next instruction if Vx != Vy.
            case 0x9000:
                if(this.registers[x] != this.registers[y]) {
                    this.PC += 2;
                }
                return "SKIP_NE";
            // ANNN Set I NNN.
            case 0xA000:
                this.I = opcode & 0x0FFF;
                return "LOAD I";
            // BNNN Jump to location nnn + V0.
            case 0xB000:
                this.PC = (opcode & 0x0FFF) + this.registers[0];
                return "JUMP";
            // CxKK Set Vx = random byte AND kk.
            case 0xC000:
                this.registers[x] = Math.floor(Math.random() * 0xFF) & (opcode & 0x00FF);
                return "RND";
            // DxyN Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
            case 0xD000:
                this.registers[0xF] = this.drawSprite(this.I, this.registers[x], this.registers[y], (opcode & 0x000F));
                return "DRAW";
            case 0xE000:
                switch(opcode & 0x00FF) {
                    // Ex9E Skip next instruction if key with the value of Vx is pressed.
                    case 0x9E:
                        if (this.keyboard.keysPressed[x]) this.PC += 2;
                        return "SKIP_KP";
                    // ExA1 Skip next instruction if key with the value of Vx is not pressed.
                    case 0xA1:
                        if (!this.keyboard.keysPressed[x]) this.PC += 2;
                        return "SKIP_NKP";
                    default: return `??? 0x${opcode.toString(16)}`;
                }
            case 0xF000:
                switch(opcode & 0x00FF) {
                    // Fx07 Set Vx = delay timer value.
                    case 0x07:
                        this.registers[x] = this.delayTimer;
                        return "LOAD_DT";
                    // Fx08 Wait for a key press, store the value of the key in Vx.
                    case 0x0A:
                        // TODO
                        return "LOAD_KEY";
                    // Fx15 Set delay timer = Vx.
                    case 0x15:
                        this.delayTimer = this.registers[x];
                        return "SET_DT";
                    // Fx18 Set sound timer = Vx.
                    case 0x18:
                        this.soundTimer = this.registers[x];
                        return "SET_ST";
                    // Fx1E Set I = I + Vx.
                    case 0x1E:
                        this.I = this.checkOverflow(this.I + this.registers[x]);
                        return "ADD I VX";
                    // Fx29 Set I = location of sprite for digit Vx.
                    case 0x29:
                        // Characters 0-F (in hexadecimal) are represented by a 4x5 font.
                        // It's multiplied by 5 because each sprite is 5 bytes long.
                        this.I = this.registers[x] * 5;
                        return "LD F V";
                    // Fx33 Store BCD representation of Vx in memory locations I, I+1, and I+2.
                    case 0x33:
                        this.memory.write(this.I, Math.round(this.registers[x] / 100));
                        this.memory.write(this.I+1, Math.round(this.registers[x] / 10) % 10);
                        this.memory.write(this.I+2, this.registers[x] % 10);
                        return "LD B V";
                    // Fx55 Store registers V0 through Vx in memory starting at location I.
                    case 0x55:
                        for(let j = 0; j <= x; j++) {
                            this.memory.write(this.I + j, this.registers[x]);
                        }
                        return "LD [I] V";
                    // Fx65 Read registers V0 through Vx from memory starting at location I.
                    case 0x65:
                        for(let j = 0; j <= x; j++) {
                            this.registers[x] = this.memory.read(this.I + j);
                        }
                        return "LD V [I]";
                    default: return `??? 0x${opcode.toString(16)}`;
                }
            default:
                return `0x${opcode.toString(16)}`;
        }
    }

    step() {
        const opcode = this.memory.read(this.PC) << 8 | this.memory.read(this.PC + 1);
        console.log(this.doOpcode(opcode));
        // All instructions are 2 bytes long, so we have to 
        // increment the program counter by 2
        this.PC += 2;
    }

    getRegister(number: number): number {
        return this.registers[number];
    }

    load(program: number[], startAddress = 0x200): void {
        this.memory.set(program, startAddress);
    }

    drawSprite(addr: number, x0: number, y0: number, height: number): number {
        let collision = 0;
        for (let row = 0; row < height; row++) {
            let sprite = this.memory.read(this.I + row);
            for (let col = 0; col < width; col++) {
                if ((sprite & (0x80 >> col)) != 0) {
                    // TODO
                }
            }
        }
        return collision;
    }

    updateTimers(): void {
        (this.delayTimer) > 0 ? this.delayTimer -= 1 : null;
        (this.soundTimer) > 0 ? this.soundTimer -= 1 : null; 
    }

    checkOverflow(num: number): number {
        return (num > 0XFF) ? num - 0x100 : num
    }

}