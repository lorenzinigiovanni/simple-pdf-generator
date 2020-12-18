import http from 'http'
import fs from 'fs'
import path from 'path';
import { URL } from 'url';
import { AddressInfo } from 'net';

export class Server {
    private server: http.Server;
    public staticFolderPath?: string;

    public get address(): string {
        let { address } = <AddressInfo>this.server.address();
        const { port } = <AddressInfo>this.server.address();
        if (address === '::') {
            address = 'localhost';
        }

        return new URL(`http://${address}:${port}`).toString();
    }

    constructor() {
        this.server = http.createServer(this.handleRequest.bind(this)).listen();
    }

    public close(): void {
        this.server.close();
    }

    private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        res.setHeader('Content-Type', 'text/html')

        if (req.url) {
            let filePath = path.join(__dirname, '..', 'template', req.url);

            try {
                if (!fs.existsSync(filePath) && this.staticFolderPath != null) {
                    filePath = path.join(this.staticFolderPath, req.url);
                }

                const data = await fs.promises.readFile(filePath);
                res.end(data);
            }
            catch (error) {
                res.statusCode = 500;
                res.end('Ho sfonnato tutto');
            }
        }
    }
}
