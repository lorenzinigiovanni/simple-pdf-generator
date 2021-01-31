import path from 'path';
import { PdfTemplate, PdfFiller, PdfField, PdfTable } from '../../src/PdfFiller';

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
    data: any;
}
