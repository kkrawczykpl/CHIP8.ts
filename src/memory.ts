/**
 * CHIP-8 Emulator: Memory
 * Krzysztof Krawczyk, January 2020
 * 
 * Handles initialization of the memory, write and read functionalities.
 * Thanks:
 *  - https://en.wikipedia.org/wiki/CHIP-8
 */
export class Memory {
    private memory: Uint8Array;
    constructor() {
        // CHIP-8 was most commonly implemented on 4K systems
        this.memory = new Uint8Array(new ArrayBuffer(0x1000)).fill(0 & 0xFF);
    }

    read(addr: number): number {
        if(addr > 0xFFF) {
            console.log("R: Memory overflow!");
            return 0;
        }else{
            return this.memory[addr];
        }
    }

    write(addr: number, writeData: number): void {
        if(addr > 0xFFF) {
            console.log("W: Memory overflow!");
        }else{
            this.memory[addr] = writeData;
        }
    }
}