(function () {
  "use strict";

  var CONSENT_KEY = "rh-cookie-consent";
  var cfg = window.SITE_CONFIG || {};

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ---------- unexpected / offline note ---------- */
  var note = $("#offline-note");
  function showNote(msg) {
    if (!note) return;
    note.textContent = msg;
    note.hidden = false;
  }
  function hideNote() {
    if (!note) return;
    note.hidden = true;
  }
  window.addEventListener("offline", function () {
    showNote("You appear to be offline. Call (936) 448-5900 if you need Ryan now.");
  });
  window.addEventListener("online", hideNote);

  function isProdHost() {
    var h = location.hostname;
    return h === "ryanhasselmeier.com" || h === "www.ryanhasselmeier.com";
  }

  /* Turnstile: production site key on the real host; Cloudflare dummy
     always-pass key everywhere else so preview/localhost does not 400. */
  var turnstileWidget = document.querySelector(".cf-turnstile");
  if (turnstileWidget) {
    var sitekey = isProdHost()
      ? (cfg.TURNSTILE_SITEKEY || "")
      : "1x00000000000000000000AA";
    if (sitekey) {
      turnstileWidget.setAttribute("data-sitekey", sitekey);
      var ts = document.createElement("script");
      ts.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      ts.async = true;
      ts.defer = true;
      document.head.appendChild(ts);
    }
  }

  /* ---------- header scroll state ---------- */
  var header = $(".site-header--overlay");
  var hero = $("#hero");
  function onScrollHeader() {
    if (!header) return;
    if (!hero) {
      header.classList.add("is-scrolled");
      return;
    }
    var past = window.scrollY > Math.max(24, hero.getBoundingClientRect().height * 0.12);
    header.classList.toggle("is-scrolled", past);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- cinematic hero: desktop parallax (CSS Ken Burns is separate) ---------- */
  var heroMedia = $("#hero-media");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var parallaxTicking = false;

  function updateParallax() {
    parallaxTicking = false;
    if (!heroMedia || !hero) return;
    if (reduceMotion.matches) {
      heroMedia.style.transform = "";
      return;
    }
    if (window.matchMedia("(max-width: 767px)").matches) {
      heroMedia.style.transform = "";
      return;
    }
    var y = window.scrollY;
    if (y > window.innerHeight) return;
    heroMedia.style.transform = "translate3d(0," + Math.round(y * 0.18) + "px,0)";
  }
  function onParallaxScroll() {
    if (parallaxTicking) return;
    parallaxTicking = true;
    window.requestAnimationFrame(updateParallax);
  }
  updateParallax();
  window.addEventListener("scroll", onParallaxScroll, { passive: true });
  window.addEventListener("resize", updateParallax);
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", updateParallax);
  }

  /* ---------- cookie consent (gates non-essential scripts) ---------- */
  var banner = $("#cookie-banner");
  var acceptBtn = $("#cookie-accept");
  var rejectBtn = $("#cookie-reject");
  var settingsBtns = $all("[data-cookie-settings]");
  var analyticsLoaded = false;

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }
  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) { /* private mode — still honor this session */ }
  }

  function loadAnalytics() {
    /* GA4 insertion point. Do not invent a property ID.
       Set SITE_CONFIG.GA4_MEASUREMENT_ID in js/config.js once you have a real GA4 property. */
    var id = cfg.GA4_MEASUREMENT_ID;
    if (!id || analyticsLoaded) return;
    if (getConsent() !== "accepted") return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  function applyConsent(value, persist) {
    if (persist) setConsent(value);
    document.body.classList.remove("cookie-open");
    if (banner) banner.hidden = true;
    if (value === "accepted") loadAnalytics();
    measureCookie();
  }

  function openBanner() {
    if (!banner) return;
    banner.hidden = false;
    document.body.classList.add("cookie-open");
    measureCookie();
    if (acceptBtn) acceptBtn.focus();
  }

  function measureCookie() {
    if (!banner || banner.hidden) {
      document.documentElement.style.setProperty("--cookie-h", "0px");
      return;
    }
    document.documentElement.style.setProperty("--cookie-h", banner.offsetHeight + "px");
  }

  var existing = getConsent();
  if (existing === "accepted" || existing === "rejected") {
    applyConsent(existing, false);
  } else {
    openBanner();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () { applyConsent("accepted", true); });
  }
  if (rejectBtn) {
    rejectBtn.addEventListener("click", function () { applyConsent("rejected", true); });
  }
  settingsBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { openBanner(); });
  });
  window.addEventListener("resize", measureCookie);

  /* ---------- sticky mobile CTA (after hero; hide over notary, form, footer) ---------- */
  var sticky = $("#sticky-cta");
  var contact = $("#contact");
  var notary = $("#notary");
  var footer = $(".site-footer");

  function sectionInView(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    var visible = Math.min(r.bottom, window.innerHeight - 48) - Math.max(r.top, 72);
    return visible > 140;
  }

  function updateSticky() {
    if (!sticky || !hero) return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      sticky.classList.remove("is-visible");
      document.body.classList.remove("has-sticky-cta");
      return;
    }
    var heroRect = hero.getBoundingClientRect();
    var pastHero = heroRect.bottom < window.innerHeight * 0.55;
    var hide =
      sectionInView(notary) ||
      sectionInView(contact) ||
      (footer && footer.getBoundingClientRect().top < window.innerHeight - 8);
    var show = pastHero && !hide;
    sticky.classList.toggle("is-visible", show);
    document.body.classList.toggle("has-sticky-cta", show);
  }
  updateSticky();
  window.addEventListener("scroll", updateSticky, { passive: true });
  window.addEventListener("resize", updateSticky);

  /* Prefill notary reason from notary CTAs */
  function prefillNotary(e) {
    var reason = $("#reason");
    if (reason) reason.value = "Notary";
  }
  $all("[data-prefill-notary]").forEach(function (el) {
    el.addEventListener("click", prefillNotary);
  });

  /* ---------- contact form ---------- */
  var form = $("#contact-form");
  if (!form) return;

  var submitBtn = $("#submit-btn");
  var statusEl = $("#form-status");
  var fields = {
    name: $("#name"),
    email: $("#email"),
    phone: $("#phone"),
    reason: $("#reason"),
    message: $("#message"),
    consent: $("#pii-consent")
  };

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.classList.toggle("is-error", kind === "error");
    statusEl.classList.toggle("is-ok", kind === "ok");
  }

  function setFieldError(input, msg) {
    if (!input) return;
    var wrap = input.closest(".field") || input.closest(".consent") || input.parentElement;
    var err = wrap ? wrap.querySelector(".field-error") : null;
    if (wrap && wrap.classList) wrap.classList.toggle("has-error", Boolean(msg));
    if (err) err.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function clearErrors() {
    Object.keys(fields).forEach(function (k) { setFieldError(fields[k], ""); });
    setStatus("", "");
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function turnstileToken() {
    var el = form.querySelector("[name='cf-turnstile-response']");
    if (el && el.value) return el.value;
    if (window.turnstile && typeof window.turnstile.getResponse === "function") {
      try { return window.turnstile.getResponse() || ""; } catch (e) { return ""; }
    }
    return "";
  }

  function validate() {
    clearErrors();
    var first = null;
    function fail(input, msg) {
      setFieldError(input, msg);
      if (!first && input) first = input;
    }

    var name = (fields.name && fields.name.value || "").trim();
    var email = (fields.email && fields.email.value || "").trim();
    var phone = (fields.phone && fields.phone.value || "").trim();
    var reason = fields.reason && fields.reason.value;
    var message = (fields.message && fields.message.value || "").trim();
    var consent = fields.consent && fields.consent.checked;

    if (!name) fail(fields.name, "Please enter your name.");
    if (!email) fail(fields.email, "Please enter an email address.");
    else if (!validEmail(email)) fail(fields.email, "That email does not look right.");
    if (!reason) fail(fields.reason, "Please choose a reason.");
    if (!message) fail(fields.message, "Please add a short message.");
    if (!consent) fail(fields.consent, "Please confirm we may use this to respond.");

    if (cfg.TURNSTILE_SITEKEY && !turnstileToken()) {
      setStatus("Confirm you are not a bot, then send again.", "error");
      if (!first) first = $(".cf-turnstile") || submitBtn;
    }

    if (first) {
      first.focus();
      return false;
    }
    return true;
  }

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    var label = submitBtn.querySelector(".btn-label");
    var loading = submitBtn.querySelector(".btn-loading");
    if (label) label.hidden = on;
    if (loading) loading.hidden = !on;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var hp = form.querySelector("[name='website']");
    if (hp && hp.value) {
      window.location.replace("/thank-you/");
      return;
    }

    var endpoint = cfg.FORM_ENDPOINT;
    if (!endpoint) {
      setStatus("The form is not connected yet. Call or text (936) 448-5900.", "error");
      return;
    }

    var payload = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      request_type: fields.reason.value,
      message: fields.message.value.trim(),
      business: "AGII",
      source: "ryanhasselmeier.com",
      "cf-turnstile-response": turnstileToken()
    };

    setLoading(true);
    setStatus("Sending…", "");

    var provider = cfg.FORM_PROVIDER || "json";
    var req;

    if (provider === "formspree" || provider === "basin") {
      var fd = new FormData();
      Object.keys(payload).forEach(function (k) { fd.append(k, payload[k]); });
      req = fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      });
    } else {
      req = fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
    }

    req.then(function (res) {
      if (!res.ok) throw new Error("bad-status");
      window.location.replace("/thank-you/");
    }).catch(function () {
      setLoading(false);
      setStatus("The message did not go through. Call or text (936) 448-5900.", "error");
    });
  });
})();
