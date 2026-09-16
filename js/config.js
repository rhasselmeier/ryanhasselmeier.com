/* Site config — the only file you should need to edit for IDs.
   No secrets belong here. Public site keys only. */
window.SITE_CONFIG = {
  CANONICAL_ORIGIN: "https://ryanhasselmeier.com",

  /* Form delivery for GitHub Pages (no app server).
     FORM_PROVIDER:
       "json"     — POST JSON (current AGII Twilio Function)
       "formspree"— POST as FormData to a Formspree endpoint
       "basin"    — POST as FormData to a Basin endpoint
     Set FORM_ENDPOINT to your form URL. Leave empty to force the
     phone fallback instead of a broken submit. */
  FORM_PROVIDER: "json",
  FORM_ENDPOINT: "https://agii-vapi-bridge-9383.twil.io/web-contact",

  /* Cloudflare Turnstile — AGII/T4 default bot protection.
     Public site key only. The secret stays in the form backend,
     never in this repo.
     Get a key: https://dash.cloudflare.com/?to=/:account/turnstile
     Widget markup is in index.html (#contact). */
  TURNSTILE_SITEKEY: "0x4AAAAAAD8MVIhSPLH80f6N",

  /* GA4 measurement ID. Load only after cookie consent.
     Do not invent a property. Leave empty until you have a real one.
     Example once you have it: "G-XXXXXXXXXX"
     Insertion happens in js/site.js loadAnalytics(). */
  GA4_MEASUREMENT_ID: ""
};
