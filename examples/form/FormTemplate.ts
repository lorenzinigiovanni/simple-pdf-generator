import path from 'path';
import { PdfTemplate, PdfFiller, PdfField } from '../../src/PdfFiller';

@PdfTemplate({
    templatePath: path.join(__dirname, 'form.html'),
    includes: [
        { path: path.join(__dirname, '..', 'bootstrap.min.js') },
        { path: path.join(__dirname, '..', 'bootstrap.min.css') },
        { path: path.join(__dirname, 'form.css') },
    ],
})
export class FormTemplate extends PdfFiller {
    @PdfField()
    public number = NaN;

    @PdfField()
    public name = '';

    @PdfField()
    public surname = '';
}
