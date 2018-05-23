const table      = require('table').table;
const accounting = require('accounting');
const fs         = require('fs');
const fx         = require('money');

class Report {

    constructor(detailedReportDirPath, finReportPath, baseCurrency) {

        this.detailedReportDirPath = detailedReportDirPath;
        this.finReportPath         = finReportPath;

        this.finReportProceedsTotal = 0;
        this.finReportItemsTotal    = 0;

        this.reportData = [];

        fx.base = baseCurrency;
    }

    async readReportData() {

        return new Promise((resolve, reject) => {

            fs.readdir(this.detailedReportDirPath, (err, items) => {
                if (err) return reject(err);

                items.forEach(item => {

                    if (item === `Summary.csv`) return; // Skip 'Summary.csv'

                    const reportData = fs.readFileSync(this.detailedReportDirPath + '/' + item, 'utf-8');

                    let i = 0;

                    const header = reportData.split('\n')[i++].split('\t');

                    while (reportData.split('\n')[i].indexOf('Total_Rows') === -1) {

                        const row = reportData.split('\n')[i].split('\t');

                        const dataRow = {};

                        header.forEach((headerItem, index) => {

                            dataRow[headerItem] = row[index];
                        });

                        dataRow['Unique title'] = dataRow['Title'] + ` (${dataRow['Vendor Identifier']})`;

                        this.reportData.push(dataRow);

                        i++;
                    }
                });

                resolve();
            });
        });
    }

    loadRates() {

        const finReport = fs.readFileSync(this.finReportPath, 'utf-8');

        finReport.split('\n').forEach(line => {

            const result = line.match(/.* \((\w+)\)","(.*)",".*",".*",".*",".*","(.*)","(.*)",".*",/);
            // const result = line.match(/.* \((\w+)\)","(.*)",".*",".*",".*",".*",".*",".*","(.*)","(.*)",".*",/);

            if (result) {

                if (+result[4] === 0) {

                    fx.rates[result[1]] = 99999999999; // will note be used

                } else {

                    fx.rates[result[1]] = result[3] / result[4];

                    // fx.rates[result[1]] = 1 / result[3];
                }

                // console.log(`curr: ${result[1]}, proceeds: ${parseFloat(result[4])}, items: ${parseFloat(result[2])}, rate: ${fx.rates[result[1]]}`);

                this.finReportProceedsTotal += parseFloat(result[4]);
                this.finReportItemsTotal += parseInt(result[2]);

            } else {

                // console.log(line);
            }

        });
    }

    doRefine() {

        this.apps = {};

        this.reportData.forEach(item => {

            if (!this.apps[item['Unique title']]) {

                this.apps[item['Unique title']] = [];
            }

            item[`Extended Partner Share (${fx.base})`] = fx.convert(item['Extended Partner Share'], {
                from: item['Partner Share Currency'],
                to: fx.base
            });

            // console.log(`From: ${item['Partner Share Currency']}, USD: ${item[`Extended Partner Share (${fx.base})`]}`);

            this.apps[item['Unique title']].push(item);
        });
    }

    printReport() {

        const apps = [
            ['App', 'Quantity', 'Proceeds']
        ];

        let itemsTotal    = 0;
        let proceedsTotal = 0;

        for (let appTitle in this.apps) {

            let quantity = 0;
            let proceeds = 0;

            this.apps[appTitle].forEach(item => {

                // console.log(parseFloat(item[`Extended Partner Share (${fx.base})`]));

                quantity += parseInt(item['Quantity'], 10);
                proceeds += parseFloat(item[`Extended Partner Share (${fx.base})`]);
            });

            itemsTotal += quantity;
            proceedsTotal += proceeds;

            apps.push([appTitle, quantity, accounting.toFixed(proceeds, 2) + ' ' + fx.base]);
        }

        const config = {
            columns: {
                0: {
                    alignment: 'left',
                    minWidth: 15
                },
                1: {
                    alignment: 'right',
                    minWidth: 10
                },
                2: {
                    alignment: 'right',
                    minWidth: 10
                }
            }
        };

        console.log(table(apps, config));

        console.log(`Total: ${accounting.toFixed(this.finReportProceedsTotal, 2)} ${fx.base} (${this.finReportItemsTotal} items)`);
        console.log(`Total (calculated): ${accounting.toFixed(proceedsTotal, 2)} ${fx.base} (${itemsTotal} items)`);
    }

    async display() {

        await this.readReportData();

        await this.loadRates();

        this.doRefine();

        this.printReport();
    }
}

module.exports = Report;