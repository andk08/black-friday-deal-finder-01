# Real Deal Friday

A Black Friday deal finder: 19 real deals from 6 stores, every price checked
on 27 November 2026 at the store or in a deals source that names the store.

## What it does

- Lists Black Friday and Cyber Monday deals with the product, store, store
  link, sale price, usual price, discount and check time
- Search, and filters by category, store and minimum discount, that work;
  sort by biggest % off, biggest saving, lowest price, or new lows first
- A page for each deal with its full check record and a second store's price
  where one was checked, so a shopper can compare
- A verdict on every deal — New low, Strong price, or Routine sale — with the
  evidence behind it
- Runs as plain static files in `app/`, with no network request, on desktop
  and on a phone

## How the prices were checked

Every deal was found and checked by the agent on Black Friday itself
(27 November 2026), reading the price at the store or in a deals source that
names the store. Each deal says when its price was checked and where it was
read. Prices change fast on Black Friday — check the store link before you buy.

## Run it

```
node serve.ts          # app/ on http://localhost:8080
```

Hand it in:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

## Layout

- `app/index.html` — the page shell
- `app/data.js` — the 19 deals
- `app/views.js` — the board and deal pages
- `app/main.js` — hash routes, search, filters and sorting
- `app/style.css` — the design
- `main.ts` — the hand-in program
- `screenshots/` — 4 renders of the site (see `shots.json`)
