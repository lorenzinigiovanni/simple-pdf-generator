import { PrintTable } from './table/PrintTable';
import { PdfGenerator } from '../src/PdfGenerator';
import { PrintForm } from './form/PrintForm';
import path from 'path';
import fs from 'fs';

(async () => {
    try {
        await PdfGenerator.start();
        PdfGenerator.staticFilePath = path.join(__dirname, '..', 'assets');

        for (let i = 0; i < 3; i++) {
            const table = new PrintTable();

            table.number = i;
            table.data = [
                {
                    index: 1, name: 'Foo', surname: 'Bar', email: 'foo@bar.com',
                    nestedObject: {
                        nestedName: 'Foo', nestedSurname: 'Bar',
                        anotherNestedObject: { group: 'A', groupDescription: 'Group A' },
                    },
                },
                {
                    index: 2, name: 'Foo', surname: 'Bar', email: 'foo@bar.com',
                    nestedObject: {
                        nestedName: 'Foo', nestedSurname: 'Bar',
                        anotherNestedObject: { group: 'B', groupDescription: 'Group B' },
                    },
                },
            ];

            await table.fill(path.join(__dirname, 'pdfs', `table${i}.pdf`));
        }

        for (let i = 0; i < 3; i++) {
            const form = new PrintForm();

            form.number = i;
            form.name = 'Foo';
            form.surname = 'Bar';

            const pdf = await form.fill({
                displayHeaderFooter: true,
                headerTemplate: `
                <style>
                    p { font-size: 10px; margin-top: -0.2cm !important } 
                </style>                
                <div>
                <p>ciao <span class=pageNumber></span></p>
                </div>
                `,
            });

            if (pdf != null) {
                await fs.promises.writeFile(path.join(__dirname, 'pdfs', `form${i}.pdf`), pdf);
            }
        }
    } catch (error) {
        console.error(error);
    }
})();
