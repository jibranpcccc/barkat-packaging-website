# Barkat Packaging — Production Website

Corrugated carton factory, Plot F 9, S.I.T.E. Industrial Area, Hyderabad, Sindh
71800, Pakistan. Established May 2000.

**Live site: <https://barkatcartons.com/>**

---

## Business details

| | |
|---|---|
| Company | Barkat Packaging |
| Factory | Plot F 9, S.I.T.E. Industrial Area, Hyderabad, Sindh 71800, Pakistan |
| Phone | +92 333 2622963 |
| Email | jibranpccc@gmail.com |
| Hours | Monday – Saturday, 10:00 AM – 1:30 PM |
| Google Maps CID | 305341297154128408 |
| Product | 3-ply, 5-ply and 7-ply corrugated boxes, plain sheets, agro export cartons |

---

## Pages

| file | page |
|---|---|
| `index.html` | Home — B2B portal, solutions, live factory stats |
| `products.html` | Full catalogue with PKR ranges — 3-ply, 5-ply, 7-ply, duplex, fluting |
| `agro-packaging.html` | Sindhri mango and agro cold-chain export packaging |
| `mango-carton.html` | Mango boxes and cartons, 2 kg to 10 kg |
| `kharboza-carton.html` | Kharboza melon and fruit transport cartons |
| `corrugated-box-hyderabad.html` | Corrugated box ranges and rates, Hyderabad |
| `mango-export-packaging-standard-pakistan.html` | Reference: S.R.O. 192(I)/2013 export box weights, TDAP guidance, ISPM-15 |
| `calculator.html` | Box dimension, volume and WhatsApp quote tool |
| `about.html` | Heritage, factory machinery, QC laboratory |
| `contact.html` | Master NAP, RFQ form, logistics directions |

Supporting: `sitemap.xml`, `feed.xml`, `robots.txt`, `llms.txt`, `BingSiteAuth.xml`,
`CNAME`, `_redirects`.

---

## Hosting

Served by **GitHub Pages** from branch `main`, path `/`, with `CNAME` pointing
`barkatcartons.com` at Pages. **Cloudflare** proxies the domain with SSL mode
`full` — not `full (strict)`, which returns HTTP 526 on this GitHub Pages setup.

Deploying is a push to `main`:

```
git add -A
git commit -m "…"
git push origin main
```

Then confirm the Pages build finished before assuming the change is live:

```
gh api repos/jibranpcccc/barkat-packaging-website/pages/builds/latest
```

Note: `git push` exits with code 1 on this machine because of a broken
post-commit hook (`C:\Users\jibra\.git-hooks/post-commit: Exec format error`).
The push itself succeeds. Check the remote line, not the exit code.

---

## Verification

There is a static pre-check that validates NAP consistency, schema, sitemap,
feed and internal links across the served pages:

```
python ..\Tools_And_Scripts\_precheck.py
```

For the reference page specifically, two gates exist — one local, one against the
deployed bytes, which also confirms every cited source still resolves:

```
python ..\Tools_And_Scripts\_verify_spec_page.py
python ..\Tools_And_Scripts\_verify_spec_live.py
```

Discovery is submitted to IndexNow (fan-out to Bing and Yandex):

```
python ..\Tools_And_Scripts\_indexnow.py
```

Any change to a page's content should be followed by an IndexNow submission,
because the site is submitted by URL list rather than by crawl.

---

## Editorial rules used on this site

- Prices are published only where a real rate exists, in PKR. No invented prices.
- No `aggregateRating`, `reviewCount` or `review` markup — reviews are not
  fabricated.
- Reference pages cite a resolvable primary source for every figure, and state
  where sources disagree rather than picking one.
- The reference page publishes boxes-per-layer rather than a total per container,
  because stack height depends on board grade and destination.

---

Copyright © 2026 Barkat Packaging, Hyderabad, Sindh. All rights reserved.
