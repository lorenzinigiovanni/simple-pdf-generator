import path from 'path';
import { PdfTemplate, PdfFiller, PdfField, PdfTable } from '../../src/PdfFiller';

interface AnotherNestedObject {
    group: string,
    groupDescription: string,
}

interface NestedObject {
    nestedName: string;
    nestedSurname: string;
    anotherNestedObject: AnotherNestedObject;
}

interface TableRow {
    index: number,
    name: string,
    surname: string,
    email: string
    nestedObject: NestedObject
}

@PdfTemplate({
    templatePath: path.join(__dirname, 'table.html'),
    includes: [
        { path: path.join(__dirname, 'table.css') },
    ],
})
export class PrintTable extends PdfFiller {
    @PdfField({ fieldName: 'number' })
    number = NaN;

    @PdfTable({ tableName: 'data' })
    data = new Array<TableRow>();
}
