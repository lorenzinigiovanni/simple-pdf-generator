/* eslint-disable no-undef */
const tables = [];
const tablesData;

document.addEventListener('start', () => {
    createTables();
});

function createTables() {
    const tablesTag = [...document.getElementsByTagName('inject-table')];

    for (const table of tablesTag) {
        const columns = [...table.getElementsByTagName('inject-column')];

        const newTable = document.createElement('table');
        const head = newTable.createTHead().insertRow();

        const classAttribute = table.getAttribute('class');
        if (classAttribute != null) {
            newTable.className = classAttribute;
        }

        const idAttribute = table.getAttribute('id');
        if (idAttribute != null) {
            newTable.id = idAttribute;
        }

        const styleAttribute = table.getAttribute('style');
        if (styleAttribute != null) {
            newTable.style = styleAttribute;
        }

        const itemAttribute = table.getAttribute('items');
        if (itemAttribute != null) {
            newTable.setAttribute('items', itemAttribute);
        }

        for (const column of columns.values()) {
            const cell = document.createElement('th');

            cell.style = column.getAttribute('style');

            if (column.className !== '') {
                cell.className = column.className;
            }
            if (column.id !== '') {
                cell.id = column.id;
            }
            if (column.getAttribute('prop') != null) {
                cell.setAttribute('prop', column.getAttribute('prop'));
            }

            cell.innerText = column.getAttribute('label');

            head.appendChild(cell);
        }

        table.replaceWith(newTable);
        tables.push(newTable);

        populateTable(newTable);
    }
}

function populateTable(table) {
    const tableFound = tables.find((documentTable) => documentTable === table);
    if (tableFound === undefined) return;

    const data = Reflect.get(tablesData, tableFound.getAttribute('items'));

    const headColumns = [...tableFound.tHead.rows[0].cells];
    const body = tableFound.createTBody();

    for (const item of data) {
        const newRow = body.insertRow();

        headColumns.forEach(column => {
            let val = Reflect.get(item, column.getAttribute('prop').split('.')[0]);
            if (val != null && typeof val === 'object') {
                const nestedProps = column.getAttribute('prop').split('.').slice(1);
                let nestedVal = val;
                nestedProps.forEach(prop => {
                    nestedVal = Reflect.get(nestedVal, prop);
                });
                val = nestedVal;
            }

            newRow.insertCell().innerHTML = val ?? '';
        });
    }
}

createTables();
