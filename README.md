# Simple PDF Generator

Node module that converts HTML5 files to PDFs.

## Installation

This is a Node.js module available through the npm registry.
Before installing, download and install Node.js.

Installation is done using the npm install command:

```sh
$ npm install simple-pdf-generator
```

## Features

Simple PDF Generator:

-   supports custom CSS and JS;
-   fills custom fields in the HTML template;
-   can generate dynamic tables automatically.

## Quick Start

In order to have a template you must create a class that extends the `PdfFiller` abstract class:

```ts
import path from 'path';
import { PdfField, PdfFiller, PdfTable, PdfTemplate } from 'simple-pdf-generator';

@PdfTemplate({
    templatePath: path.join(__dirname, 'template.html'),
})
export class Template extends PdfFiller {
    @PdfField()
    firstField = '';

    @PdfField()
    secondField = '';
}
```

And add the HTML file:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

Then it's finally possible to use the template by calling the `fill()` method in order to generate the PDF:

```ts
import path from 'path';
import { Template } from './Template';

(async () => {
    const doc = new Template();

    doc.firstField = 'World';
    doc.secondField = 'Simple PDF Generator';

    await doc.fill(path.join(__dirname, 'doc.pdf'));
})();
```

## Generate Tables

To generate a table you must to use the `PdfTable` decorator on your data property:

```ts
import path from 'path';
import { PdfField, PdfFiller, PdfTable, PdfTemplate } from 'simple-pdf-generator';

interface TableRow {
    index: number;
    name: string;
    surname: string;
    email: string;
}

@PdfTemplate({
    templatePath: path.join(__dirname, 'template.html'),
})
export class Template extends PdfFiller {
    @PdfField()
    field = '';

    @PdfTable()
    data = new Array<TableRow>();
}
```

In the HTML file write this:

```html
<inject-table items="data" class="table">
    <inject-column prop="index" label="#" />
    <inject-column prop="name" label="Name" />
    <inject-column prop="surname" label="Surname" />
    <inject-column prop="email" label="Email" />
</inject-table>
```

And then, as above, use the `fill()` method like this:

```ts
import path from 'path';
import { Template } from './Template';

(async () => {
    const doc = new Template();

    doc.field = 'World';

    doc.tableData = [
        { index: 1, name: 'James', surname: 'Smith', email: 'james@smith.com' },
        { index: 2, name: 'Robert', surname: 'Johnson', email: 'robert@johnson.com' },
    ];

    await doc.fill(path.join(__dirname, 'doc.pdf'));
})();
```

## Include CSS an JS Files

Through the class decorator is possible to include CSS and JS files. Do not import them in the HTML file, they will be automatically imported from the `@PdfTemplate()` decorator `includes[]` property.

```ts
import path from 'path';
import { PdfField, PdfFiller, PdfTable, PdfTemplate } from 'simple-pdf-generator';

@PdfTemplate({
    templatePath: path.join(__dirname, 'template.html'),
    includes: [{ path: path.join(__dirname, 'template.css') }, { path: path.join(__dirname, 'template.js') }],
})
export class Template extends PdfFiller {
    @PdfField()
    firstField = '';

    @PdfField()
    secondField = '';
}
```

## Options

### `PdfFiller`

Extend abstract class `PdfFiller` and use the following decorators on the properties:

| Decorator  | HTML use                                                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PdfField` | `%%propertyName%%`                                                                                                                                                                                              |
| `PdfTable` | `<inject-table items="propertyName">`<br>&nbsp;&nbsp;&nbsp;&nbsp;`<inject-column prop="name" label="Name"/>`<br>&nbsp;&nbsp;&nbsp;&nbsp;`<inject-column prop="surname" label="Surname"/>`<br>`</inject-table>` |

### `fill`

PdfFiller `fill()` method returns the buffer of the PDF file.

| Parameter                          | Description                         |
| ---------------------------------- | ----------------------------------- |
| `outputPath: string`               | PDF output dir                      |
| `pdfOptions: puppeteer.PDFOptions` | Object with `Puppeteer PDF Options` |

PdfFiller `fill()` method accept two optional parameters:

-   the `outputPath` for the generated file;
-   the `pdfOptions` that accept `Puppeteer PDF Options`;

### `PdfTemplate`

Use: decorator to be applied to `PdfFiller` class.

| Parameter                          | Description                                             |
| ---------------------------------- | ------------------------------------------------------- |
| `templatePath: string`             | Path to the HTML file                                   |
| `pdfOptions: puppeteer.PDFOptions` | Object with `Puppeteer PDF Options`                     |
| `xssProtection: boolean`           | Enable or disable XSS protection (default: `true`)      |
| `includes: Asset[]`                | Assets (`css` and `js`) to be included in the HTML file |

```ts
export interface Asset {
    path?: string;
    content?: string;
    type?: 'css' | 'js';
}
```

### `Puppeteer PDF Options`

For `Puppeteer PDF Options` look at their [documentation](https://github.com/puppeteer/puppeteer), we show only a brief example:

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
        right: '1cm',
    },
};
```

`Puppeteer PDF Options` used in the decorator of the class.

```ts
@PdfTemplate({
    templatePath: path.join(__dirname, 'template.html'),
    includes: [{ path: path.join(__dirname, 'template.css') }, { path: path.join(__dirname, 'template.js') }],
    pdfOptions: pdfOptions,
})
export class Template extends PdfFiller {
    @PdfField()
    firstField = '';

    @PdfField()
    secondField = '';
}
```

`Puppeteer PDF Options` passed to `fill` method.

```ts
const doc = new Template();

doc.firstField = 'World';
doc.secondField = 'Simple PDF Generator';

doc.fill(path.join(__dirname, 'doc.pdf'), pdfOptions);
```

### Environment variables

It's possible to use environment variables to modify the behaviour of the library.

| Environment variable                    | Possible values     | Description                                                                                                                          |
| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `PUPPETEER_NO_HEADLESS`                 | `true`, `false`     | Used to run Chromium in non headless mode.                                                                                           |
| `PUPPETEER_NO_SANDBOX`                  | `true`, `false`     | Used to run Chromium in containers where a root user is used.                                                                        |
| `PUPPETEER_PRODUCT`                     | `chrome`, `firefox` | Specify which browser to download and use.                                                                                           |
| `PUPPETEER_CHROMIUM_REVISION`           | a chromium version  | Specify a version of Chromium you’d like Puppeteer to use.                                                                           |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`      | `true`, `false`     | Puppeteer will not download the bundled Chromium. You must provide `PUPPETEER_EXECUTABLE_PATH`.                                      |
| `PUPPETEER_EXECUTABLE_PATH`             | a path              | Specify an executable path to be used in `puppeteer.launch`. To be specified if `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` is set to `true`. |
| `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` | proxy url           | Defines HTTP proxy settings that are used to download and run Chromium.                                                              |

## People

This library is developed by:

-   @lorenzinigiovanni [lorenzinigiovanni.com](https://www.lorenzinigiovanni.com/)
-   @MassimilianoMontagni [solutiontech.tech](https://www.solutiontech.tech/)

## License

[MIT](LICENSE)
