import { PrintTable } from './table/PrintTable';
import { PdfGenerator } from '../src/PdfGenerator';
import { PrintForm } from './form/PrintForm';
import path from 'path';
import fs from 'fs'

(async () => {
    try {
        console.log(new Date().getTime());
        await PdfGenerator.start();
        PdfGenerator.staticFilePath = path.join(__dirname, '..', 'assets');
        console.log(new Date().getTime());

        // for (let i = 0; i < 3; i++) {
        //     const table = new PrintTable();

        //     table.number = i;
        //     table.data = [{ index: 1, name: 'Foo', surname: 'Bar', email: 'foo@bar.com' }, { index: 2, name: 'Foo', surname: 'Bar', email: 'foo@bar.com' }];

        //     await table.fill(`pdfs/table${i}.pdf`);
        // }

        for (let i = 0; i < 3; i++) {
            const form = new PrintForm();

            form.number = i;
            form.name = 'Foo';
            form.surname = 'Bar';

            const pdf = await form.fill(undefined, {
                displayHeaderFooter: true,
                headerTemplate: `
                <style>
                    p { font-size: 10px; margin-top: -0.2cm !important } 
                </style>                
                <div>
                <p>ciao <span class=pageNumber></span></p>
                </div>
                `
            });
            if (pdf != null) {
                await fs.promises.writeFile(`pdfs/form${i}.pdf`, pdf);
            }
        }

        console.log(new Date().getTime());
    }
    catch (error) {
        console.error(error);
    }
})()
