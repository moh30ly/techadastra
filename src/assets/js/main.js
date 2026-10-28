/* Adastra — site behaviour. No dependencies. */
(function () {
  'use strict';

  var CFG = window.ADASTRA_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lang = document.body.getAttribute('data-lang') || 'en';
  var i18n = {};
  try { i18n = JSON.parse($('#i18n').textContent); } catch (e) {}
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── settings from config.js ────────────────────────────────────────────
  function applyConfig() {
    var social = CFG.social || {};
    ['instagram', 'linkedin'].forEach(function (k) {
      $$('[data-social="' + k + '"]').forEach(function (a) { if (social[k]) a.href = social[k]; });
      $$('[data-social-wrap="' + k + '"]').forEach(function (li) { li.hidden = !social[k]; });
    });

    var wa = CFG.whatsapp || {};
    var waUrl = wa.number
      ? 'https://wa.me/' + String(wa.number).replace(/\D/g, '') + '?text=' + encodeURIComponent(i18n.prefill || '')
      : i18n.contactHref || '/';
    $$('[data-wa]').forEach(function (a) {
      a.href = waUrl;
      if (!wa.number) { a.removeAttribute('target'); }
    });

    $$('[data-cfg-wrap="whatsapp"]').forEach(function (el) { el.hidden = !wa.number; });

    var widget = $('[data-wa-widget]');
    if (widget) widget.hidden = wa.floatingButton === false || !!wa.widgetScriptUrl;
    if (wa.widgetScriptUrl) {
      var sc = document.createElement('script');
      sc.src = wa.widgetScriptUrl;
      sc.async = true;
      document.body.appendChild(sc);
    }

    var c = CFG.contact || {};
    var values = {
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      hours: (c.hours && (c.hours[lang] || c.hours.en)) || '',
    };
    Object.keys(values).forEach(function (k) {
      $$('[data-cfg="' + k + '"]').forEach(function (el) {
        el.textContent = values[k];
        if (k === 'email') el.href = 'mailto:' + values[k];
        if (k === 'phone') el.href = 'tel:' + values[k].replace(/\s/g, '');
      });
      $$('[data-cfg-wrap="' + k + '"]').forEach(function (el) { el.hidden = !values[k]; });
    });
    $$('[data-cfg-map]').forEach(function (f) { if (c.mapEmbedUrl && f.src !== c.mapEmbedUrl) f.src = c.mapEmbedUrl; });
    $$('[data-cfg-wrap="map"]').forEach(function (el) { el.hidden = !c.mapEmbedUrl; });
  }

  // ── header, menu, language ─────────────────────────────────────────────
  function initHeader() {
    var header = $('[data-header]');
    var burger = $('[data-burger]');
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 10); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var setMenu = function (open) {
      header.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setMenu(!header.classList.contains('open')); });
    $$('.main-nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

    var langBox = $('[data-lang]');
    var langBtn = $('.lang-btn', langBox);
    var setLang = function (open) { langBox.classList.toggle('open', open); langBtn.setAttribute('aria-expanded', String(open)); };
    langBtn.addEventListener('click', function (e) { e.stopPropagation(); setLang(!langBox.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!langBox.contains(e.target)) setLang(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setLang(false); setMenu(false); setWa(false); }
    });

    // Remember the chosen language, and keep the #hash (e.g. a programs filter) across the switch.
    $$('[data-lang-link], .footer-langs a').forEach(function (a) {
      a.addEventListener('click', function () {
        try { localStorage.setItem('adastra-lang', a.getAttribute('lang')); } catch (e) {}
        if (location.hash && a.hasAttribute('data-lang-link')) a.href = a.getAttribute('href').split('#')[0] + location.hash;
      });
    });
    try { localStorage.setItem('adastra-lang', lang); } catch (e) {}
  }

  // ── WhatsApp card ──────────────────────────────────────────────────────
  var setWa = function () {};
  function initWhatsApp() {
    var toggle = $('[data-wa-toggle]');
    var card = $('#wa-card');
    if (!toggle || !card) return;
    setWa = function (open) { card.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); };
    toggle.addEventListener('click', function () { setWa(card.hidden); });
    $('[data-wa-close]').addEventListener('click', function () { setWa(false); });
  }

  // ── reveal on scroll ───────────────────────────────────────────────────
  function initReveal() {
    var els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  // ── starfield ──────────────────────────────────────────────────────────
  function initStars() {
    $$('canvas[data-stars]').forEach(function (cv) {
      var ctx = cv.getContext('2d');
      var stars = [];
      var w, h, dpr;
      var resize = function () {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = cv.offsetWidth; h = cv.offsetHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = Math.round((w * h) / 5200);
        stars = [];
        for (var i = 0; i < n; i++) {
          stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.2 + 0.2, a: Math.random(), s: Math.random() * 0.015 + 0.003, v: Math.random() * 0.08 + 0.01 });
        }
      };
      var draw = function () {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < stars.length; i++) {
          var st = stars[i];
          st.a += st.s;
          var alpha = 0.25 + Math.abs(Math.sin(st.a)) * 0.75;
          if (!reduceMotion) { st.y -= st.v; if (st.y < 0) st.y = h; }
          ctx.globalAlpha = alpha;
          ctx.fillStyle = i % 9 === 0 ? '#bfb2ff' : i % 13 === 0 ? '#a5f3fc' : '#ffffff';
          ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill();
        }
        if (!reduceMotion && visible) requestAnimationFrame(draw);
      };
      var visible = true;
      resize();
      draw();
      window.addEventListener('resize', resize);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) {
          var was = visible; visible = e[0].isIntersecting;
          if (visible && !was) draw();
        }).observe(cv);
      }
    });
  }

  // ── program filters ────────────────────────────────────────────────────
  function initFilters() {
    var box = $('[data-filters]');
    if (!box) return;
    var buttons = $$('[data-filter]', box);
    var cards = $$('[data-courses] .course');
    var apply = function (cat) {
      if (!buttons.some(function (b) { return b.dataset.filter === cat; })) cat = 'all';
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === cat)); });
      cards.forEach(function (c) {
        var show = cat === 'all' || c.dataset.cat === cat;
        c.classList.toggle('is-hidden', !show);
        if (show) c.classList.add('in');
      });
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        apply(b.dataset.filter);
        history.replaceState(null, '', b.dataset.filter === 'all' ? location.pathname : '#' + b.dataset.filter);
      });
    });
    apply(location.hash.slice(1) || 'all');
    window.addEventListener('hashchange', function () { apply(location.hash.slice(1) || 'all'); });
  }

  // ── contact form ───────────────────────────────────────────────────────
  function initForm() {
    var form = $('[data-contact-form]');
    if (!form) return;
    var t = i18n.form || {};
    var status = $('[data-form-status]', form);
    var btn = $('button[type="submit"]', form);
    var btnHtml = btn.innerHTML;

    // ?interest=<index>&topic=<course title> from the program cards
    var q = new URLSearchParams(location.search);
    var sel = $('[data-interest]', form);
    if (q.has('interest') && sel.options[+q.get('interest')]) sel.selectedIndex = +q.get('interest');
    if (q.get('topic')) form.message.value = q.get('topic') + ' — ';

    var say = function (msg, cls) { status.textContent = msg; status.className = 'form-status ' + (cls || ''); };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form._gotcha.value) return; // bot
      var bad = ['name', 'email', 'message'].filter(function (n) {
        var el = form[n];
        var ok = el.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.classList.toggle('invalid', !ok);
        return !ok;
      });
      var consent = form.consent.checked;
      form.consent.parentNode.classList.toggle('invalid', !consent);
      if (bad.length || !consent) {
        say(t.required, 'err');
        (bad.length ? form[bad[0]] : form.consent).focus();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        language: form.language.value,
        interest: form.interest.value,
        message: form.message.value.trim(),
        page: location.href,
      };
      var endpoint = (CFG.contactForm || {}).endpoint;
      var to = (CFG.contact || {}).email || 'info@techadastra.com';

      var mailto = function () {
        var body = data.message + '\n\n—\n' + data.name + '\n' + data.email + (data.phone ? '\n' + data.phone : '') + '\n' + data.interest + ' · ' + data.language;
        location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Adastra — ' + data.interest + ' — ' + data.name) + '&body=' + encodeURIComponent(body);
        say(t.mailtoNotice, 'ok');
      };
      if (!endpoint) return mailto();

      btn.disabled = true;
      btn.textContent = t.sending;
      say('');
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (r) {
          // No API behind this deployment (plain static hosting): fall back to email.
          if ([404, 405, 501, 502, 503, 504].indexOf(r.status) >= 0) return mailto();
          if (!r.ok) throw new Error(r.status);
          form.reset();
          say(t.success, 'ok');
        })
        .catch(function (err) { if (err instanceof TypeError) mailto(); else say(t.error, 'err'); })
        .then(function () { btn.disabled = false; btn.innerHTML = btnHtml; });
    });

    $$('input, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () { el.classList.remove('invalid'); });
    });
  }

  applyConfig();
  initHeader();
  initWhatsApp();
  initReveal();
  initStars();
  initFilters();
  initForm();
})();
