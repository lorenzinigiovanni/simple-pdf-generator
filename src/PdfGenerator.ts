import { Server } from './Server';
import puppeteer from 'puppeteer';
import _ from 'lodash';
import fs from 'fs';
import { getFileExtension } from './utils';

export interface Asset {
    path?: string,
    content?: string,
    type?: 'css' | 'js'
}

export interface PdfGeneratorTemplateOptions {
    template?: string,
    templatePath?: string,
    includes?: Asset[]
}

export interface PdfGeneratorOptions {
    pdfOptions?: puppeteer.PDFOptions,
    options?: PdfGeneratorTemplateOptions
}

export class PdfGenerator {
    private static _browser: puppeteer.Browser;
    private static _server: Server;
    public static get staticFilePath(): string | undefined {
        return this._server.staticFolderPath;
    }
    public static set staticFilePath(val: string | undefined) {
        this._server.staticFolderPath = val;
    }

    public static async start(): Promise<void> {
        await this._startServer();
        await this._startBrowser();
    }

    public static async stop(): Promise<void> {
        await this._browser.close();
        this._server.close();
    }

    private static async _startBrowser(): Promise<void> {
        this._browser = await puppeteer.launch({
            headless: true,
            args: ['--proxy-server=\'direct://\'', '--proxy-bypass-list=*'],
        });
    }

    private static async _startServer(): Promise<void> {
        this._server = new Server();
    }

    public static async getPdf(options: PdfGeneratorOptions): Promise<Buffer> {
        if (this._browser === undefined) {
            await this._startBrowser();
        }

        if (this._server === undefined) {
            await this._startServer();
        }

        const page = await this._browser.newPage();
        await page.goto(this._server.address);

        const template = await this._readContentOrFile(options.options?.template, options.options?.templatePath);

        if (template !== '') {
            if (/^\s*<!doctype html>/i.test(template)) {
                await page.setContent(template);
            } else {
                await page.evaluate((body) => {
                    const bodyElement = document.querySelector('body');
                    if (bodyElement != null) {
                        bodyElement.innerHTML = body;
                    }
                }, template);
            }
        }

        if (options.options?.includes != null) {
            await this.includeAssets(page, options.options.includes);
        }

        await page.waitForFunction('window.jQuery');
        await page.waitForFunction('$(window).ready');

        await page.evaluate(() => {
            document.dispatchEvent(new CustomEvent('start'));
        });

        let pdfOptions: puppeteer.PDFOptions = {
            format: 'A4',
            margin: {
                top: '2cm',
                bottom: '2cm',
                left: '1cm',
                right: '1cm',
            },
        };

        if (options.pdfOptions != null) {
            pdfOptions = Object.assign(pdfOptions, options.pdfOptions);
        }

        const result = await page.pdf(pdfOptions);
        await page.close();

        return result;
    }

    private static async includeAssets(page: puppeteer.Page, includes: Asset[]): Promise<void> {
        for (const include of includes) {
            let type = '';
            if (include.type != null) {
                type = include.type;
            } else if (include.path != null) {
                type = getFileExtension(include.path);
            }

            if (type === 'css') {
                await page.addStyleTag({ content: include.content, path: include.path });
            } else if (type === 'js') {
                await page.addScriptTag({ content: include.content, path: include.path });
            }
        }
    }

    private static async _readContentOrFile(content?: string, path?: string): Promise<string> {
        if (content)
            return _.toString(content);

        if (!path) return '';

        if ((await fs.promises.stat(path)).isDirectory()) return '';

        return (await fs.promises.readFile(path)).toString();
    }
}
