let tables = [];
var tablesData;

document.addEventListener('start', () => {
    createTables();
})

function createTables() {
    const tablesTag = [...document.getElementsByTagName("inject-table")];

    for (const table of tablesTag) {
        const columns = [...table.getElementsByTagName("inject-column")];

        const newTable = document.createElement("table");
        const head = newTable.createTHead().insertRow();
        const body = newTable.createTBody();

        newTable.setAttribute("class", table.getAttribute("class"));
        newTable.setAttribute(":items", table.getAttribute(":items"))
        newTable.setAttribute("id", table.getAttribute("id"));
        newTable.setAttribute("style", table.getAttribute("style"));

        for (const [i, column] of columns.entries()) {
            const cell = document.createElement("th");

            cell.style = column.getAttribute("style");

            if (column.className != '') {
                cell.className = column.className;
            }
            if (column.id != '') {
                cell.id = column.id;
            }
            if (column.getAttribute("prop") != null) {
                cell.setAttribute("prop", column.getAttribute("prop"));
            }

            cell.innerText = column.getAttribute("label");

            head.appendChild(cell)
        }

        table.replaceWith(newTable);
        tables.push(newTable);

        populateTable(newTable);
    }
}

function populateTable(table) {
    const tableFound = tables.find(x => { return x == table; });
    if (tableFound === undefined) return;

    const tablesData = Reflect.get(this, "tablesData");
    const data = Reflect.get(tablesData, tableFound.getAttribute(":items"));

    const headColumns = [...tableFound.tHead.rows[0].cells];
    const body = tableFound.createTBody();

    for (const item of data) {
        let newRow = body.insertRow();

        headColumns.forEach(column => {
            const val = Reflect.get(item, column.getAttribute("prop"));
            newRow.insertCell().innerHTML = val ?? "";
        });
    }
}