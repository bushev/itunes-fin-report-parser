const table      = require('table').table;
const accounting = require('accounting');
const csv        = require('csvtojson');

class ReportGooglePlay {

    constructor(finReportPath) {

        this.finReportPath = finReportPath;

        this.reportData = [];
    }

    readReportData() {

        return new Promise((resolve, reject) => {

            csv()
                .fromFile(this.finReportPath)
                .on('json', jsonObj => {
                    this.reportData.push(jsonObj);
                })
                .on('done', err => {
                    if (err) return reject(err);
                    resolve();
                });
        });
    }

    doRefine() {

        this.apps = {};

        this.reportData.forEach(item => {

            if (!this.apps[item['Product id']]) {

                this.apps[item['Product id']] = [];
            }

            this.apps[item['Product id']].push(item);
        });
    }

    printReport() {

        const apps = [
            ['App', 'Proceeds']
        ];

        let proceedsTotal = 0;

        for (let appTitle in this.apps) {

            let proceeds = 0;

            this.apps[appTitle].forEach(item => {

                proceeds += parseFloat(item[`Amount (Merchant Currency)`]);
            });

            proceedsTotal += proceeds;

            apps.push([appTitle, accounting.toFixed(proceeds, 2) + ' USD']);
        }

        const config = {
            columns: {
                0: {
                    alignment: 'left',
                    minWidth: 15
                },
                2: {
                    alignment: 'right',
                    minWidth: 10
                }
            }
        };

        console.log(table(apps, config));

        console.log(`Total (calculated): ${accounting.toFixed(proceedsTotal, 2)} USD`);
    }

    async display() {

        await this.readReportData();

        this.doRefine();

        this.printReport();
    }
}

module.exports = ReportGooglePlay;