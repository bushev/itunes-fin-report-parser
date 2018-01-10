#!/usr/bin/env node

const ReportGooglePlay = require('../report_google_play');
const argv             = require('optimist')
    .usage('Usage: $0 -f [string]')
    .demand(['f'])
    .describe('f', 'Path to financial report CSV file')
    .argv;

const report = new ReportGooglePlay(argv.f);

(async () => {
    try {
        await report.display();
    } catch (err) {
        console.log(err);
    }
})();
