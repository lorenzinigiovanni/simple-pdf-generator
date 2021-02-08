# Simple PDF Generator

Node module that coverts HTML5 files to PDFs.

## Installation

This is a Node.js module available through the npm registry.
Before installing, download and install Node.js.

Installation is done using the npm install command:

```sh
$ npm install simple-pdf-generator
```

## Features

Simple PDF Generator:

- useses bootstrap theme and js;
- supports custom css and js;
- fills custom fields in the html template;
- can generate dynamic tables automatically.

## Quick Start

To create a template you need to, create a .ts file with the class:

```ts
import path from 'path';
import { PdfField, PdfFiller, PdfTable, PdfTemplate } from 'simple-pdf-generator';

@PdfTemplate({
    templatePath: path.join(__dirname, 'template.html')
})
export class Template extends PdfFiller {
    @PdfField()
    firstField = '';

    @PdfField()
    secondField = '';
}
```

Add and html file:

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div class="container-fluid">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-10 text-center">
                    <h1>Hello %%firstField%%</h1>
                    <h2>Welcome in %%secondField%%</h2>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
```

Then it's finally possible to use the template:

```ts
import path from 'path';
import { Template } from './Template';

(async () => {
    const doc = new Template();

    doc.firstField = 'World';
    doc.secondField = 'Simple PDF Generator';

    doc.fill(path.join(__dirname, 'doc.pdf'));
})();
```

## Generate Tables

To generate tebles is necessary to declare a PdfTable in the class:

```ts
import path from 'path';
import { PdfField, PdfFiller, PdfTable, PdfTemplate } from 'simple-pdf-generator';

@PdfTemplate({
    templatePath: path.join(__dirname, 'template.html'),
})
export class Template extends PdfFiller {
    @PdfField({ fieldName: 'field' })
    field = '';

    @PdfTable({ fieldName: 'table' })
    table = '';
}
```

In the HTML file write something like this:

```html
<inject-table :items="data" class="table customClass">
    <inject-column prop="index" label="#" />
    <inject-column prop="name" label="Name" />
    <inject-column prop="surname" label="Surname" />
    <inject-column prop="email" label="Email" />
</inject-table>
```

And then use it like this:

```ts
import path from 'path';
import { Template } from './Template';

(async () => {
    const doc = new Template();

    doc.field = 'World';

    doc.table = [
        { index: 1, name: 'James', surname: 'Smith', email: 'james@smith.com' },
        { index: 2, name: 'Robert', surname: 'Johnson', email: 'robert@johnson.com' },
    ];

    doc.fill(path.join(__dirname, 'doc.pdf'))
})();
```

## Include CSS and JS Files

Through the class decorator is possible to include css and js files. Do not import them in the HTML file, they will be automatically imported.

```ts
import path from 'path';
import { PdfField, PdfFiller, PdfTable, PdfTemplate } from 'simple-pdf-generator';

@PdfTemplate({
    templatePath: path.join(__dirname, 'template.html'),
    includes: [
        { path: path.join(__dirname, 'template.css') },
        { path: path.join(__dirname, 'template.js') },
    ] 
})
export class Template extends PdfFiller {
    @PdfField({ fieldName: 'firstField' })
    firstField = '';

    @PdfField({ fieldName: 'secondField' })
    secondField = '';
}
```

## Options

PdfFiller `fill` function accept two parameters (that can be omitted):
- the `outputPath` for the generated file;
- the `pdfOptions` that accept puppeteer options;

PdfFiller `fill` function returns the buffer of the PDF file.

The `pdfOptions` parameter could also be set in the class decorator.

For puppeteer PDF options look at their [documentation](https://github.com/puppeteer/puppeteer), we show only a brief example:

```ts
pdfOptions = {
    background: true,
    displayHeaderFooter: true,
    headerTemplate: `
    <style>
        div { margin-left: 15px !important }
    </style>                
    <div>Header</div>
    `,
    footerTemplate: `          
    <div>Footer</div>
    `,
    margin: {
        top: '5cm',
        bottom: '4cm',
        left: '1cm',
        right: '1cm'
    },
};
```

```ts
@PdfTemplate({
    templatePath: path.join(__dirname, 'template.html'),
    includes: [
        { path: path.join(__dirname, 'template.css') },
        { path: path.join(__dirname, 'template.js') },
    ],
    pdfOptions: pdfOptions,
})
export class Template extends PdfFiller {
    @PdfField({ fieldName: 'firstField' })
    firstField = '';

    @PdfField({ fieldName: 'secondField' })
    secondField = '';
}
```

```ts
const doc = new Template();

doc.firstField = 'World';
doc.secondField = 'Simple PDF Generator';

doc.fill(path.join(__dirname, 'doc.pdf'), pdfOptions);
```

## People

This library is developed by:

- @lorenzinigiovanni
- @MassimilianoMontagni

## License

[MIT](LICENSE)
