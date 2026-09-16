# ryanhasselmeier.com

Static personal site for [Ryan Hasselmeier](https://ryanhasselmeier.com/), Montgomery, Texas. Hosted on **GitHub Pages**. No app server.

The [Website Minimum Complete Standard](https://github.com/rhasselmeier) (30 items) is the definition of done. A page is not done if any required item is missing, fake, or decorative-only.

## Canonical host

**`https://ryanhasselmeier.com`** (apex). That is what `CNAME` sets.

GitHub Pages does not 301 `www` by itself. Point DNS like this:

1. Apex `A`/`ALIAS`/`ANAME` to GitHub Pages (or Cloudflare CNAME flattening).
2. In Cloudflare (recommended): page rule or redirect — `www.ryanhasselmeier.com` → `https://ryanhasselmeier.com` (301).
3. Do not list both hosts as canonical. Canonical tags on every page use the apex.

HTTP → HTTPS is handled by GitHub Pages / Cloudflare. Assets are relative or `https://` only. No mixed content.

## Configure IDs (`js/config.js`)

Public values only. No secrets in this repo.

| Key | What to put |
|---|---|
| `FORM_PROVIDER` | `"json"` (current Twilio Function), `"formspree"`, or `"basin"` |
| `FORM_ENDPOINT` | Formspree: `https://formspree.io/f/xxxxxxxx` · Basin: your form URL · or the existing AGII JSON endpoint |
| `TURNSTILE_SITEKEY` | Cloudflare Turnstile **site** key. Widget markup is in `index.html`. The **secret** stays in the form backend. |
| `GA4_MEASUREMENT_ID` | Real GA4 ID (`G-XXXXXXXXXX`) or leave `""`. Empty means analytics never loads. Do not invent one. GA4 runs **only after Accept** on the cookie banner. |

Formspree setup: create a form, paste the endpoint, set `FORM_PROVIDER` to `"formspree"`. Thank-you is this site’s `/thank-you/` (JS `location.replace` after a successful POST), not Formspree’s hosted page.

Turnstile: [dash.cloudflare.com → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile). Pair the site key here with the secret on the backend that receives the POST.

## Security headers

GitHub Pages cannot set them. Cloudflare can. `_headers` is included for Cloudflare Pages or a proxied zone:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy` (camera, mic, geo off)

## 404

`404.html` at the repo root. GitHub Pages returns HTTP 404 with this file. That is a real 404, not a soft-200.

`500.html` is the branded failure page if Cloudflare (or another edge) is configured to serve it.

## Local

Serve the repo root as a static site (pretty URLs, real 404). Any static server that maps `/privacy/` → `privacy/index.html` will do.
