const Report = require('./report');
const argv   = require('optimist')
    .usage('Usage: $0 -d [string] -f [string] -c [string]')
    .demand(['d', 'f', 'c'])
    .describe('d', 'Path to detailed report directory')
    .describe('f', 'Path to financial report CSV file')
    .describe('c', 'Currency')
    .argv;

const report = new Report(argv.d, argv.f, argv.c);

(async () => {
    try {
        await report.display();
    } catch (err) {
        console.log(err);
    }
})();
