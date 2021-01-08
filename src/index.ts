import express from 'express';
import { AddressInfo } from 'net';

export class App {
    public app: express.Application;

    constructor() {
        this.app = express();
    }

    public listen = () => {
        const server = this.app.listen(1337, '0.0.0.0', () => {
            const {port, address} = server.address() as AddressInfo;
            console.log(`Server listening on ${address}:${port}`)
        });
    }
}