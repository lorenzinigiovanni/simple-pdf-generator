import { TableTemplate } from './table/TableTemplate';
import { FormTemplate } from './form/FormTemplate';
import path from 'path';
import fs from 'fs';

(async () => {
    try {
        for (let i = 0; i < 3; i++) {
            const table = new TableTemplate();

            table.number = i;
            table.data = [
                {
                    index: 1,
                    name: 'Foo',
                    surname: 'Bar',
                    email: 'foo@bar.com',
                    nestedObject: {
                        nestedName: 'Foo',
                        nestedSurname: 'Bar',
                        anotherNestedObject: {
                            group: 'A',
                            groupDescription: 'Group A',
                        },
                    },
                },
                {
                    index: 2,
                    name: 'Pippo',
                    surname: 'de Pippis',
                    email: 'pippo@depippis.com',
                    nestedObject: {
                        nestedName: 'Pippo',
                        nestedSurname: 'de Pippis',
                        anotherNestedObject: {
                            group: 'B',
                            groupDescription: 'Group B',
                        },
                    },
                },
            ];

            await table.fill(path.join(__dirname, 'pdfs', `table${i}.pdf`));
        }

        for (let i = 0; i < 3; i++) {
            const form = new FormTemplate();

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
                `,
            });

            if (pdf != null) {
                await fs.promises.writeFile(
                    path.join(__dirname, 'pdfs', `form${i}.pdf`),
                    pdf,
                );
            }
        }
    } catch (error) {
        console.error(error);
    }
})();
