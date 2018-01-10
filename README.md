# itunes-fin-report-parser
Display proceeds per application

## Install

```
npm i itunes-fin-report-parser -g
```

## Usage example

```
itunes-fin-report-parser -d /Users/bushev/Downloads/a76c2773-7227-4a72-baac-41ad75dfc366 -f /Users/bushev/Downloads/financial_report.csv -c USD

╔════════════════════════════╤══════════╤════════════╗
║ App                        │ Quantity │   Proceeds ║
╟────────────────────────────┼──────────┼────────────╢
║ SSH Tunnel                 │      101 │ 289.95 USD ║
╟────────────────────────────┼──────────┼────────────╢
║ Cookies Milk & Coffee love │        2 │   1.50 USD ║
╟────────────────────────────┼──────────┼────────────╢
║ Ya.Analytics Full          │        6 │  19.46 USD ║
╚════════════════════════════╧══════════╧════════════╝

Total: 309.47 USD (109 items)
Total (calculated): 310.91 USD (109 items)

```


### TODO: GP

`node bin/index_google_play.js -f ~/Downloads/PlayApps_201709.csv`