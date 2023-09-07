import puppeteer, { Browser, PDFOptions, Page, PaperFormat } from 'puppeteer';
import fs from 'fs';
import { getFileExtension, readContentOrFile } from './utils';
import path from 'path';

export interface Asset {
    path?: string;
    content?: string;
    type?: 'css' | 'js';
}

export interface PdfGeneratorTemplateOptions {
    template?: string;
    templatePath?: string;
    includes?: Asset[];
}

export interface PdfGeneratorOptions {
    pdfOptions?: PDFOptions;
    options?: PdfGeneratorTemplateOptions;
}

export class PdfGenerator {
    private static _browser: Browser | null;

    private static _tableGeneratorScript = '';
    public static get tableGeneratorScript(): string {
        if (this._tableGeneratorScript === '') {
            this._tableGeneratorScript = fs
                .readFileSync(path.join(__dirname, '..', 'template', 'js', 'table-generator.js'))
                .toString();
        }

        return this._tableGeneratorScript;
    }

    private static async _startBrowser(): Promise<void> {
        const browser_args = ["--proxy-server='direct://'", '--proxy-bypass-list=*', '--disable-web-security'];

        if (process.env.PUPPETEER_NO_SANDBOX === 'true') {
            browser_args.push(...['--no-sandbox', '--disable-setuid-sandbox']);
        }

        this._browser = await puppeteer.launch({
            headless: process.env.PUPPETEER_NO_HEADLESS === 'true' ? false : 'new',
            args: browser_args,
            defaultViewport: null,
        });

        this._browser.on('disconnected', async () => {
            this._browser?.close();
            this._browser = null;
            await this._startBrowser();
        });
    }

    public static async getPdf(options: PdfGeneratorOptions): Promise<Buffer> {
        if (this._browser == null) {
            await this._startBrowser();
        }

        if (this._browser == null) {
            throw new Error('Browser not started');
        }

        const page = await this._browser.newPage();
        await page.emulateMediaType('screen');

        const template = await readContentOrFile(options.options?.template, options.options?.templatePath);

        if (template !== '') {
            await page.setContent(template);
        }

        if (options.options?.includes != null) {
            await this._includeAssets(page, options.options.includes);
        }

        let pdfOptions: PDFOptions = {
            format: <PaperFormat>'A4',
            margin: {
                top: '2cm',
                bottom: '2cm',
                left: '1cm',
                right: '1cm',
            },
            printBackground: true,
        };

        if (options.pdfOptions != null) {
            pdfOptions = Object.assign(pdfOptions, options.pdfOptions);
        }

        const result = await page.pdf(pdfOptions);
        await page.close();

        return result;
    }

    private static async _includeAssets(page: Page, includes: Asset[]): Promise<void> {
        for (const include of includes) {
            let type = '';
            if (include.type != null) {
                type = include.type;
            } else if (include.path != null) {
                type = getFileExtension(include.path);
            }

            if (type === 'css') {
                await page.addStyleTag({
                    content: include.content,
                    path: include.path,
                });
            } else if (type === 'js') {
                await page.addScriptTag({
                    content: include.content,
                    path: include.path,
                });
            }
        }
    }
}
