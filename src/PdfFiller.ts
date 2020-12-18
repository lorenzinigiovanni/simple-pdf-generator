import { Asset, PdfGenerator } from './PdfGenerator';
import path from 'path'
import fs from 'fs'
import stringifyObject from 'stringify-object';
import puppeteer from 'puppeteer';

// ------------------------------

interface PdfFieldOptions {
    fieldName: string;
}

interface PdfField {
    constructor: string,
    propertyName: string,
    fieldOptions: PdfFieldOptions
}

export function PdfField(options: PdfFieldOptions) {
    return function (target: any, propertyKey: string): void {
        PdfFieldClass.registerDecorator(target, propertyKey, options);
    }
}

class PdfFieldClass {
    private static decoratorsMap = new Map<any, PdfField[]>();

    static registerDecorator(target: any, property: any, options: PdfFieldOptions) {
        let keys = this.decoratorsMap.get(target);
        if (!keys) {
            keys = [];
            this.decoratorsMap.set(target, keys);
        }

        keys.push({ propertyName: property, constructor: target.constructor, fieldOptions: options });
    }

    static getDecorators(target: any) {
        return this.decoratorsMap.get(Object.getPrototypeOf(target));
    }
}

// ------------------------------

interface PdfTableOptions {
    tableName: string;
}

interface PdfTable {
    constructor: string,
    propertyName: string,
    fieldOptions: PdfTableOptions
}

export function PdfTable(options: PdfTableOptions) {
    return function (target: any, propertyKey: string): void {
        PdfTableClass.registerDecorator(target, propertyKey, options);
    }
}

class PdfTableClass {
    private static decoratorsMap = new Map<any, PdfTable[]>();

    static registerDecorator(target: any, property: any, options: PdfTableOptions) {
        let keys = this.decoratorsMap.get(target);
        if (!keys) {
            keys = [];
            this.decoratorsMap.set(target, keys);
        }

        keys.push({ propertyName: property, constructor: target.constructor, fieldOptions: options });
    }

    static getDecorators(target: any) {
        return this.decoratorsMap.get(Object.getPrototypeOf(target));
    }
}

// ------------------------------

interface PdfTemplateOptions {
    templatePath: string,
    pdfOptions?: puppeteer.PDFOptions
    includes?: Asset[]
}

interface PdfTemplate {
    className: string,
    options: PdfTemplateOptions
}

export function PdfTemplate(options: PdfTemplateOptions) {
    return function (target: any): void {
        PdfTemplateClass.registerDecorator(target, options);
    }
}

class PdfTemplateClass {
    private static decoratorMap = new Map<PdfFiller, PdfTemplate>();

    static registerDecorator(target: PdfFiller, options: PdfTemplateOptions) {
        this.decoratorMap.set(target, { className: target.constructor.name, options: options });
    }

    static getDecorators(target: PdfFiller) {
        return this.decoratorMap.get(Object.getPrototypeOf(target).constructor);
    }
}

// ------------------------------

export abstract class PdfFiller {
    public async fill(outputPath?: string, pdfOptions?: puppeteer.PDFOptions): Promise<Buffer | undefined> {
        const fieldDecorators = PdfFieldClass.getDecorators(this);
        const tableDecorators = PdfTableClass.getDecorators(this);
        const classDecorators = PdfTemplateClass.getDecorators(this);

        if (classDecorators != null && fieldDecorators != null) {
            let template = (await fs.promises.readFile(classDecorators.options.templatePath)).toString();

            fieldDecorators.forEach(property => {
                template = template.replace(new RegExp(`%%.*?(${property.fieldOptions.fieldName}).*?%%`, 'g'), Reflect.get(this, property.propertyName));
            });

            const includes = new Array<Asset>();

            includes.push({ path: path.join(__dirname, '..', 'template', 'css', 'bootstrap.min.css') });
            includes.push({ path: path.join(__dirname, '..', 'template', 'js', 'jquery-3.5.1.slim.min.js') });
            includes.push({ path: path.join(__dirname, '..', 'template', 'js', 'bootstrap.min.js') });

            classDecorators?.options.includes?.forEach(element => {
                includes.push(element);
            });

            if (tableDecorators != null) {
                const tableData = new Object();
                tableDecorators.forEach(element => {
                    Object.defineProperty(tableData, element.fieldOptions.tableName, { value: Reflect.get(this, element.propertyName), enumerable: true });
                });

                let script = (await fs.promises.readFile(path.join(__dirname, '..', 'template', 'js', 'table-generator.js'))).toString();
                script = script.replace('tablesData', `tablesData = ${stringifyObject(tableData)}`);
                includes.push({ content: script, type: 'js' });
            }

            let _pdfOptions: puppeteer.PDFOptions = {}

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
                pdfOptions: _pdfOptions
            });

            if (outputPath != null) {
                await fs.promises.writeFile(outputPath, pdf);
            }

            return pdf;
        }
    }
}
