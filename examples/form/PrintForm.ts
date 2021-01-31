import path from 'path';
import { PdfTemplate, PdfFiller, PdfField } from '../../src/PdfFiller';

@PdfTemplate({
    templatePath: path.join(__dirname, 'form.html'),
    includes: [
        { path: path.join(__dirname, 'form.css') },
    ],
})
export class PrintForm extends PdfFiller {
    @PdfField({ fieldName: 'number' })
    number = NaN;

    @PdfField({ fieldName: 'name' })
    name = '';

    @PdfField({ fieldName: 'surname' })
    surname = '';
}
