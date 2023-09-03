import { Asset, PdfGenerator } from './PdfGenerator';
import path from 'path';
import fs from 'fs';
import { PDFOptions } from 'puppeteer';
import { stringify } from './utils';
import mime from 'mime';
import validator from 'validator';

// ------------------------------

type PdfField = {
    propertyName: string;
};

export function PdfField() {
    return function (target: object, propertyKey: string): void {
        PdfFieldClass.registerDecorator(target, propertyKey);
    };
}

class PdfFieldClass {
    private static decoratorsMap = new Map<object, Map<string, PdfField>>();

    static registerDecorator(
        target: object,
        property: string,
    ) {
        let keys = this.decoratorsMap.get(target);
        if (!keys) {
            keys = new Map<string, PdfField>();
            this.decoratorsMap.set(target, keys);
        }

        keys.set(property, {
            propertyName: property,
        });
    }

    static getDecorators(target: object): Map<string, PdfField> | null {
        return this.decoratorsMap.get(Object.getPrototypeOf(target)) ?? null;
    }
}

// ------------------------------

type PdfTable = {
    propertyName: string;
};

export function PdfTable() {
    return function (target: object, propertyKey: string): void {
        PdfTableClass.registerDecorator(target, propertyKey);
    };
}

class PdfTableClass {
    private static decoratorsMap = new Map<object, PdfTable[]>();

    static registerDecorator(
        target: object,
        property: string,
    ) {
        let keys = this.decoratorsMap.get(target);
        if (!keys) {
            keys = [];
            this.decoratorsMap.set(target, keys);
        }

        keys.push({
            propertyName: property,
        });
    }

    static getDecorators(target: object): PdfTable[] | null {
        return this.decoratorsMap.get(Object.getPrototypeOf(target)) ?? null;
    }
}

// ------------------------------

type PdfTemplateOptions = {
    templatePath: string;
    pdfOptions?: PDFOptions;
    includes?: Asset[];
};

type PdfTemplate = {
    className: string;
    options: PdfTemplateOptions;
};

export function PdfTemplate(options: PdfTemplateOptions) {
    return function (target: object): void {
        PdfTemplateClass.registerDecorator(target, options);
    };
}

class PdfTemplateClass {
    private static decoratorMap = new Map<object, PdfTemplate>();

    static registerDecorator(target: object, options: PdfTemplateOptions) {
        this.decoratorMap.set(target, {
            className: target.constructor.name,
            options: options,
        });
    }

    static getDecorators(target: object) {
        return this.decoratorMap.get(Object.getPrototypeOf(target).constructor);
    }
}

// ------------------------------

export abstract class PdfFiller {
    [key: string]: unknown;

    private static searchRegex = new RegExp('(?:%%(?<propName>.*)%%)|(?:<img[^>]*src="(?<imgSrc>.*?)"[^>]*>)', 'g');

    public async fill(): Promise<Buffer>;
    public async fill(outputPath?: string): Promise<Buffer>;
    public async fill(outputPath?: string, pdfOptions?: PDFOptions): Promise<Buffer>;
    public async fill(outputPath?: string, pdfOptions?: PDFOptions): Promise<Buffer> {
        const fieldDecorators = PdfFieldClass.getDecorators(this);
        const tableDecorators = PdfTableClass.getDecorators(this);
        const classDecorators = PdfTemplateClass.getDecorators(this);

        if (classDecorators == null) {
            throw new Error('Missing mandatory decorators');
        }

        let template = (await fs.promises.readFile(classDecorators.options.templatePath)).toString();

        const includes = new Array<Asset>();

        for (const include of classDecorators.options.includes ?? []) {
            includes.push(include);
        }

        const matches = template.matchAll(PdfFiller.searchRegex);
        for (const match of matches) {
            if (match.groups?.['propName'] != null) {
                if (fieldDecorators != null) {
                    const decorator = fieldDecorators.get(match.groups.propName);
                    if (decorator != null) {
                        const value = Reflect.get(this, decorator.propertyName);
                        if (value != null) {
                            template = template.replace(match[0], validator.escape(value.toString()));
                        }
                    }
                }
            } else if (match.groups?.['imgSrc'] != null) {
                const mimeType = mime.getType(match.groups.imgSrc);

                if (mimeType != null) {
                    try {
                        let imgSrc = match.groups.imgSrc;
                        if (!path.isAbsolute(match.groups.imgSrc)) {
                            imgSrc = path.join(path.dirname(classDecorators.options.templatePath), match.groups.imgSrc);
                        }

                        const data = await fs.promises.readFile(imgSrc);
                        const base64 = data.toString('base64');
                        const newSrc = `data:${mimeType};base64,${base64}`;

                        template = template.replace(match[0], match[0].replace(match.groups.imgSrc, newSrc));
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }

        if (tableDecorators != null) {
            const tableData = new Object();
            for (const decorator of tableDecorators) {
                Object.defineProperty(tableData, decorator.propertyName, {
                    value: Reflect.get(this, decorator.propertyName),
                    enumerable: true,
                });
            }

            let script = PdfGenerator.tableGeneratorScript;
            script = script.replace('tablesData', `tablesData = ${stringify(tableData)}`);
            includes.push({ content: script, type: 'js' });
        }

        let _pdfOptions: PDFOptions = {};

        if (classDecorators.options.pdfOptions != null) {
            _pdfOptions = Object.assign(_pdfOptions, classDecorators.options.pdfOptions);
        }

        if (pdfOptions != null) {
            _pdfOptions = Object.assign(_pdfOptions, pdfOptions);
        }

        const pdf = await PdfGenerator.getPdf({
            options: {
                template: template,
                includes: includes,
            },
            pdfOptions: _pdfOptions,
        });

        if (outputPath != null) {
            await fs.promises.writeFile(outputPath, pdf);
        }

        return pdf;
    }
}
