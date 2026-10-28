#!/usr/bin/env node
// Static site generator for techadastra.com — no dependencies, Node 18+.
//   node build.mjs            → writes ./dist
// Every page is generated in /en/, /tr/ and /de/ from src/content/*.mjs.

import { mkdirSync, rmSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

import en from './src/content/en.mjs';
import tr from './src/content/tr.mjs';
import de from './src/content/de.mjs';
import { icon } from './src/icons.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');
const SITE_URL = 'https://techadastra.com';
const LANGS = [en, tr, de];
const YEAR = new Date().getFullYear();
const VERSION = Date.now().toString(36); // cache-buster for css/js

// The same settings file the browser reads, evaluated here so pages are complete without JS.
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(ROOT, 'src/assets/config.js'), 'utf8'), sandbox);
const CFG = sandbox.window.ADASTRA_CONFIG;

const PAGES = [
  { id: 'home', slug: '' },
  { id: 'programs', slug: 'programs/' },
  { id: 'consulting', slug: 'consulting/' },
  { id: 'about', slug: 'about/' },
  { id: 'contact', slug: 'contact/' },
];

const esc = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const href = (L, slug) => `/${L.code}/${slug}`;
const waHref = (L) =>
  CFG.whatsapp.number
    ? `https://wa.me/${CFG.whatsapp.number}?text=${encodeURIComponent(L.common.whatsappPrefill)}`
    : href(L, 'contact/');
const hiddenIf = (cond) => (cond ? ' hidden' : '');

// ── shared pieces ─────────────────────────────────────────────────────────

const logo = (L) => `
<a class="logo" href="${href(L, '')}" aria-label="Adastra — ${esc(L.nav.home)}">
  <svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
    <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b6cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
    <rect width="40" height="40" rx="11" fill="url(#lg)"/>
    <path d="M11 30 20 10l9 20" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.6 23.5c4.6-2.2 10.6-2.6 15.6-1" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>
    <path d="M30 6.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#fff"/>
  </svg>
  <span class="logo-text">adastra<span class="logo-sub" lang="en">tech &amp; consulting</span></span>
</a>`;

const socialLinks = (cls = 'social') => `
<ul class="${cls}" role="list">
  <li data-social-wrap="instagram"${hiddenIf(!CFG.social.instagram)}><a data-social="instagram" href="${esc(CFG.social.instagram || '#')}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}</a></li>
  <li data-social-wrap="linkedin"${hiddenIf(!CFG.social.linkedin)}><a data-social="linkedin" href="${esc(CFG.social.linkedin || '#')}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon('linkedin')}</a></li>
  <li><a data-wa href="${esc(waHref(currentLang))}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp')}</a></li>
</ul>`;
let currentLang = en; // set per page render so socialLinks() knows the WhatsApp prefill language

const header = (L, page) => {
  const items = PAGES.filter((p) => p.id !== 'home')
    .map((p) => `<li><a href="${href(L, p.slug)}"${p.id === page.id ? ' aria-current="page"' : ''}>${esc(L.nav[p.id])}</a></li>`)
    .join('');
  const langs = LANGS.map(
    (o) =>
      `<li><a href="${href(o, page.slug)}" hreflang="${o.code}" lang="${o.code}" data-lang-link="${o.code}"${o.code === L.code ? ' aria-current="true"' : ''}><span class="lang-code">${o.short}</span>${esc(o.name)}</a></li>`
  ).join('');
  return `
<header class="site-header" data-header>
  <div class="container header-inner">
    ${logo(L)}
    <nav class="main-nav" id="main-nav" aria-label="Main">
      <ul role="list">${items}</ul>
      <div class="nav-mobile-extra">
        <a class="btn btn-primary btn-block" href="${href(L, 'contact/')}">${esc(L.nav.cta)}</a>
        ${socialLinks('social social-lg')}
      </div>
    </nav>
    <div class="header-actions">
      <div class="lang" data-lang-switcher>
        <button class="lang-btn" type="button" aria-expanded="false" aria-haspopup="true" aria-label="${esc(L.nav.language)}">${icon('globe')}<span>${L.short}</span>${icon('chevron', 'chev')}</button>
        <ul class="lang-menu" role="list">${langs}</ul>
      </div>
      <a class="btn btn-primary btn-sm header-cta" href="${href(L, 'contact/')}">${esc(L.nav.cta)}</a>
      <button class="burger" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="${esc(L.nav.menu)}" data-burger>${icon('menu', 'i-open')}${icon('close', 'i-close')}</button>
    </div>
  </div>
</header>`;
};

const footer = (L) => `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      ${logo(L)}
      <p>${esc(L.footer.tagline)}</p>
      ${socialLinks('social social-lg')}
    </div>
    <div>
      <h3 class="footer-title">${esc(L.footer.explore)}</h3>
      <ul role="list" class="footer-links">
        ${PAGES.map((p) => `<li><a href="${href(L, p.slug)}">${esc(L.nav[p.id])}</a></li>`).join('')}
      </ul>
    </div>
    <div>
      <h3 class="footer-title">${esc(L.footer.programs)}</h3>
      <ul role="list" class="footer-links">
        ${['computer', 'ai', 'software', 'games', 'youth']
          .map((c) => `<li><a href="${href(L, 'programs/')}#${c}">${esc(L.categories[c])}</a></li>`)
          .join('')}
      </ul>
    </div>
    <div>
      <h3 class="footer-title">${esc(L.footer.contact)}</h3>
      <ul role="list" class="footer-links footer-contact">
        <li data-cfg-wrap="email"${hiddenIf(!CFG.contact.email)}>${icon('mail')}<a data-cfg="email" href="mailto:${esc(CFG.contact.email)}">${esc(CFG.contact.email)}</a></li>
        <li data-cfg-wrap="phone"${hiddenIf(!CFG.contact.phone)}>${icon('phone')}<a data-cfg="phone" href="tel:${esc(CFG.contact.phone.replace(/\s/g, ''))}">${esc(CFG.contact.phone)}</a></li>
        <li>${icon('pin')}<span data-cfg="address">${esc(CFG.contact.address)}</span></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>© ${YEAR} Adastra Technology &amp; Consulting · techadastra.com. ${esc(L.footer.rights)}</p>
    <p class="footer-langs">${LANGS.map((o) => `<a href="${href(o, '')}" lang="${o.code}">${esc(o.name)}</a>`).join('<span aria-hidden="true">·</span>')}</p>
  </div>
</footer>`;

const whatsappWidget = (L) => `
<div class="wa" data-wa-widget${hiddenIf(!CFG.whatsapp.floatingButton)}>
  <div class="wa-card" id="wa-card" role="dialog" aria-label="WhatsApp" hidden>
    <div class="wa-card-head">
      <span class="wa-avatar">${icon('whatsapp')}</span>
      <div><strong>Adastra</strong><span class="wa-status">WhatsApp</span></div>
      <button class="wa-x" type="button" aria-label="Close" data-wa-close>${icon('close')}</button>
    </div>
    <div class="wa-card-body"><p class="wa-bubble">${esc(L.common.whatsappGreeting)}</p></div>
    <a class="btn btn-wa btn-block" data-wa href="${esc(waHref(L))}" target="_blank" rel="noopener">${icon('whatsapp')}${esc(L.common.whatsappStart)}</a>
  </div>
  <button class="wa-fab" type="button" aria-controls="wa-card" aria-expanded="false" aria-label="${esc(L.common.whatsappLabel)}" data-wa-toggle>${icon('whatsapp')}</button>
</div>`;

const layout = (L, page, { title, description, body, jsonld = '' }) => {
  const url = SITE_URL + href(L, page.slug);
  const alternates = LANGS.map((o) => `<link rel="alternate" hreflang="${o.code}" href="${SITE_URL + href(o, page.slug)}">`).join('\n  ');
  const fullTitle = page.id === 'home' ? `Adastra — ${title}` : `${title} | Adastra`;
  return `<!doctype html>
<html lang="${L.code}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${SITE_URL + href(en, page.slug)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(L.meta.siteName)}">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE_URL}/assets/img/og.png">
  <meta property="og:locale" content="${L.locale}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#070b1a">
  <script>document.documentElement.classList.add('js')</script>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap">
  <link rel="stylesheet" href="/assets/css/style.css?v=${VERSION}">
  <script src="/assets/config.js?v=${VERSION}" defer></script>
  <script src="/assets/js/main.js?v=${VERSION}" defer></script>
  ${jsonld}
</head>
<body data-page="${page.id}" data-lang="${L.code}">
  <a class="skip" href="#main">${esc(L.common.skip)}</a>
  ${header(L, page)}
  <main id="main">
${body}
  </main>
  ${footer(L)}
  ${whatsappWidget(L)}
  <script type="application/json" id="i18n">${JSON.stringify({
    form: L.contact.form,
    prefill: L.common.whatsappPrefill,
    contactHref: href(L, 'contact/'),
  }).replace(/</g, '\\u003c')}</script>
</body>
</html>
`;
};

// ── section helpers ───────────────────────────────────────────────────────

const sectionHead = ({ eyebrow, title, lead }, center = true) => `
      <div class="section-head${center ? ' center' : ''}" data-reveal>
        ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
        <h2>${esc(title)}</h2>
        ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
      </div>`;

const pageHero = (h, extra = '') => `
    <section class="page-hero">
      <div class="hero-bg" aria-hidden="true"><canvas data-stars></canvas><div class="glow glow-1"></div><div class="glow glow-2"></div></div>
      <div class="container narrow" data-reveal>
        <p class="eyebrow">${esc(h.eyebrow)}</p>
        <h1>${esc(h.title)}</h1>
        <p class="lead">${esc(h.lead)}</p>
        ${extra}
      </div>
    </section>`;

const steps = (items, cls = '') => `
      <ol class="steps ${cls}" role="list">
        ${items
          .map(
            (s, i) => `<li class="step" data-reveal style="--d:${i * 80}ms">
          <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
        </li>`
          )
          .join('')}
      </ol>`;

const ctaBand = (c, L, secondaryHref) => `
    <section class="section">
      <div class="container">
        <div class="cta-band" data-reveal>
          <div class="cta-stars" aria-hidden="true"></div>
          <h2>${esc(c.title)}</h2>
          <p>${esc(c.text)}</p>
          <div class="btn-row center">
            <a class="btn btn-light" href="${href(L, 'contact/')}">${esc(c.primary)}${icon('arrow')}</a>
            ${c.secondary ? `<a class="btn btn-ghost-light" href="${secondaryHref}">${esc(c.secondary)}</a>` : ''}
          </div>
        </div>
      </div>
    </section>`;

// ── pages ─────────────────────────────────────────────────────────────────

const heroVisual = `
        <div class="hero-visual" aria-hidden="true" data-reveal style="--d:150ms">
          <svg class="orbits" viewBox="0 0 520 520">
            <circle cx="260" cy="260" r="250" /><circle cx="260" cy="260" r="185" /><circle cx="260" cy="260" r="120" />
          </svg>
          <span class="planet p1"></span><span class="planet p2"></span><span class="planet p3"></span>
          <div class="code-card">
            <div class="code-top"><i></i><i></i><i></i><span>adastra.py</span></div>
<pre><code><span class="k">from</span> adastra <span class="k">import</span> Student

me = Student(<span class="s">"you"</span>)
me.learn(<span class="s">"python"</span>, <span class="s">"ai"</span>)
me.build(<span class="s">"a game"</span>)

<span class="k">while</span> me.curious:
    me.level_up()  <span class="c"># 🚀 ad astra</span></code></pre>
          </div>
          <div class="chip chip-ai">${icon('ai')}<span>model.fit()</span></div>
          <div class="chip chip-game">${icon('games')}<span>Unity · Unreal</span></div>
          <div class="chip chip-web">${icon('software')}<span>React · Node</span></div>
        </div>`;

const home = (L) => {
  const h = L.home;
  return `
    <section class="hero">
      <div class="hero-bg" aria-hidden="true"><canvas data-stars></canvas><div class="glow glow-1"></div><div class="glow glow-2"></div><div class="grid-lines"></div></div>
      <div class="container hero-grid">
        <div class="hero-copy" data-reveal>
          <p class="eyebrow eyebrow-pill"><span class="dot"></span>${esc(h.hero.eyebrow)}</p>
          <h1>${esc(h.hero.title[0])}<br><span class="grad">${esc(h.hero.title[1])}</span></h1>
          <p class="lead">${esc(h.hero.lead)}</p>
          <div class="btn-row">
            <a class="btn btn-primary" href="${href(L, 'programs/')}">${esc(h.hero.primary)}${icon('arrow')}</a>
            <a class="btn btn-ghost" href="${href(L, 'consulting/')}">${esc(h.hero.secondary)}</a>
          </div>
          <div class="hero-langs"><span>${esc(h.hero.badgesLabel)}</span>${h.hero.badges.map((b) => `<span class="tag">${b}</span>`).join('')}</div>
        </div>
        ${heroVisual}
      </div>
    </section>

    <section class="section" id="tracks">
      <div class="container">
        ${sectionHead(h.tracks)}
        <div class="grid grid-4">
          ${h.tracks.items
            .map(
              (t, i) => `<a class="card track track-${t.key}" href="${href(L, 'programs/')}#${t.key}" data-reveal style="--d:${i * 80}ms">
            <span class="icon-tile">${icon(t.key)}</span>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.text)}</p>
            <span class="card-link">${esc(L.common.learnMore)}${icon('arrow')}</span>
          </a>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead(h.why)}
        <div class="grid grid-3 features">
          ${h.why.items
            .map(
              (f, i) => `<div class="feature" data-reveal style="--d:${(i % 3) * 80}ms">
            <span class="icon-tile sm">${icon(f.icon)}</span>
            <div><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead(h.paths)}
        <div class="path" data-reveal>
          <div class="path-line" aria-hidden="true"><span></span></div>
          ${steps(h.paths.steps, 'steps-path')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container split">
        <div data-reveal>
          <p class="eyebrow">${esc(h.consulting.eyebrow)}</p>
          <h2>${esc(h.consulting.title)}</h2>
          <p class="lead">${esc(h.consulting.text)}</p>
          <ul class="checks" role="list">${h.consulting.points.map((p) => `<li>${icon('check')}${esc(p)}</li>`).join('')}</ul>
          <a class="btn btn-primary" href="${href(L, 'consulting/')}">${esc(h.consulting.cta)}${icon('arrow')}</a>
        </div>
        <div class="consult-visual" data-reveal style="--d:120ms" aria-hidden="true">
          ${L.consulting.services.items
            .slice(0, 4)
            .map((s, i) => `<div class="mini-card mc-${i}"><span class="icon-tile sm">${icon(s.icon)}</span><span>${esc(s.title)}</span></div>`)
            .join('')}
          <div class="consult-core"><svg viewBox="0 0 40 40"><path d="M11 30 20 10l9 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.6 23.5c4.6-2.2 10.6-2.6 15.6-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead(h.process)}
        ${steps(h.process.steps, 'steps-cards')}
      </div>
    </section>

    <section class="section section-alt">
      <div class="container narrow">
        ${sectionHead(h.faq)}
        <div class="faq" data-reveal>
          ${h.faq.items
            .map((q) => `<details><summary>${esc(q.q)}<span class="faq-icon" aria-hidden="true"></span></summary><p>${esc(q.a)}</p></details>`)
            .join('')}
        </div>
      </div>
    </section>
${ctaBand(h.cta, L, href(L, 'programs/'))}`;
};

const programs = (L) => {
  const p = L.programs;
  const cats = ['computer', 'ai', 'software', 'games', 'youth'];
  const filters = `
      <div class="filters" role="group" aria-label="${esc(p.filterLabel)}" data-filters>
        <button type="button" class="filter" aria-pressed="true" data-filter="all">${esc(L.common.all)}</button>
        ${cats.map((c) => `<button type="button" class="filter" aria-pressed="false" data-filter="${c}">${icon(c)}${esc(L.categories[c])}</button>`).join('')}
      </div>`;
  return `${pageHero(p.hero)}
    <section class="section section-tight">
      <div class="container">
        ${filters}
        <div class="grid grid-3 courses" data-courses>
          ${p.items
            .map(
              (c) => `<article class="card course" data-cat="${c.cat}" data-reveal>
            <div class="course-top">
              <span class="icon-tile sm cat-${c.cat}">${icon(c.cat)}</span>
              <span class="course-cat">${esc(L.categories[c.cat])}</span>
            </div>
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.text)}</p>
            <ul class="tags" role="list">${c.topics.map((t) => `<li class="tag">${esc(t)}</li>`).join('')}</ul>
            <dl class="course-meta">
              <div><dt>${esc(L.common.duration)}</dt><dd>${esc(c.duration)}</dd></div>
              <div><dt>${esc(L.common.level)}</dt><dd><span class="lvl lvl-${c.level}"></span>${esc(L.levels[c.level])}</dd></div>
              <div><dt>${esc(L.common.format)}</dt><dd>${esc(L.formats[c.format])}</dd></div>
            </dl>
            <a class="card-link" href="${href(L, 'contact/')}?interest=0&amp;topic=${encodeURIComponent(c.title)}">${esc(L.common.enquire)}${icon('arrow')}</a>
          </article>`
            )
            .join('')}
        </div>
        <p class="note">${esc(p.note)}</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="container">
        <div class="banner" data-reveal>
          <span class="icon-tile">${icon('mentor')}</span>
          <div><h2>${esc(p.corporate.title)}</h2><p>${esc(p.corporate.text)}</p></div>
          <a class="btn btn-primary" href="${href(L, 'contact/')}?interest=2">${esc(p.corporate.cta)}${icon('arrow')}</a>
        </div>
      </div>
    </section>`;
};

const consulting = (L) => {
  const c = L.consulting;
  return `${pageHero(c.hero, `<div class="btn-row center"><a class="btn btn-primary" href="${href(L, 'contact/')}?interest=3">${esc(c.cta.primary)}${icon('arrow')}</a></div>`)}
    <section class="section">
      <div class="container">
        ${sectionHead(c.services)}
        <div class="grid grid-3">
          ${c.services.items
            .map(
              (s, i) => `<div class="card service" data-reveal style="--d:${(i % 3) * 80}ms">
            <span class="icon-tile">${icon(s.icon)}</span>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead(c.process)}
        ${steps(c.process.steps, 'steps-cards')}
      </div>
    </section>
    <section class="section">
      <div class="container narrow">
        ${sectionHead(c.industries)}
        <ul class="pills" role="list" data-reveal>${c.industries.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
    </section>
${ctaBand(c.cta, L)}`;
};

const mapFrame = (L) =>
  `<div class="map" data-cfg-wrap="map"${hiddenIf(!CFG.contact.mapEmbedUrl)}><iframe data-cfg-map title="${esc(L.contact.mapTitle)}" src="${esc(CFG.contact.mapEmbedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;

const about = (L) => {
  const a = L.about;
  return `${pageHero(a.hero)}
    <section class="section">
      <div class="container split split-top">
        <div class="prose" data-reveal>
          <h2>${esc(a.story.title)}</h2>
          ${a.story.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
        </div>
        <div class="stack" data-reveal style="--d:120ms">
          <div class="card mv"><span class="icon-tile sm">${icon('sparkle')}</span><h3>${esc(a.mission.title)}</h3><p>${esc(a.mission.text)}</p></div>
          <div class="card mv"><span class="icon-tile sm">${icon('globe')}</span><h3>${esc(a.vision.title)}</h3><p>${esc(a.vision.text)}</p></div>
        </div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead(a.values)}
        <div class="grid grid-4">
          ${a.values.items
            .map((v, i) => `<div class="card value" data-reveal style="--d:${i * 80}ms"><span class="value-num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`)
            .join('')}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container split">
        <div data-reveal>
          <p class="eyebrow">${icon('pin')} Beşiktaş · İstanbul</p>
          <h2>${esc(a.location.title)}</h2>
          <p class="lead">${esc(a.location.text)}</p>
          <a class="btn btn-primary" href="${href(L, 'contact/')}">${esc(L.nav.cta)}${icon('arrow')}</a>
        </div>
        <div data-reveal style="--d:120ms">${mapFrame(L)}</div>
      </div>
    </section>`;
};

const contact = (L) => {
  const c = L.contact;
  const f = c.form;
  const cfgItem = (key, ic, label, value, link) => `
          <li class="info-item" data-cfg-wrap="${key}"${hiddenIf(!value)}>
            <span class="icon-tile sm">${icon(ic)}</span>
            <div><span class="info-label">${esc(label)}</span>${link ? `<a data-cfg="${key}" href="${esc(link)}">${esc(value)}</a>` : `<span data-cfg="${key}">${esc(value)}</span>`}</div>
          </li>`;
  return `${pageHero(c.hero)}
    <section class="section section-tight">
      <div class="container contact-grid">
        <form class="card form" data-contact-form novalidate>
          <h2>${esc(f.title)}</h2>
          <div class="form-row">
            <label class="field"><span>${esc(f.name)} *</span><input name="name" autocomplete="name" required></label>
            <label class="field"><span>${esc(f.email)} *</span><input name="email" type="email" autocomplete="email" required></label>
          </div>
          <div class="form-row">
            <label class="field"><span>${esc(f.phone)}</span><input name="phone" type="tel" autocomplete="tel"></label>
            <label class="field"><span>${esc(f.language)}</span>
              <select name="language">${LANGS.map((o) => `<option value="${o.name}"${o.code === L.code ? ' selected' : ''}>${o.name}</option>`).join('')}</select>
            </label>
          </div>
          <label class="field"><span>${esc(f.interest)}</span>
            <select name="interest" data-interest>${f.interests.map((x, i) => `<option value="${esc(x)}" data-i="${i}">${esc(x)}</option>`).join('')}</select>
          </label>
          <label class="field"><span>${esc(f.message)} *</span><textarea name="message" rows="5" required placeholder="${esc(f.messagePlaceholder)}"></textarea></label>
          <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <label class="consent"><input type="checkbox" name="consent" required><span>${esc(f.consent)} *</span></label>
          <button class="btn btn-primary btn-block" type="submit">${esc(f.submit)}${icon('arrow')}</button>
          <p class="form-status" role="status" aria-live="polite" data-form-status></p>
        </form>
        <aside class="contact-side">
          <div class="card">
            <h2 class="h3">${esc(c.info.title)}</h2>
            <ul class="info-list" role="list">
              ${cfgItem('email', 'mail', c.info.email, CFG.contact.email, `mailto:${CFG.contact.email}`)}
              ${cfgItem('phone', 'phone', c.info.phone, CFG.contact.phone, `tel:${CFG.contact.phone.replace(/\s/g, '')}`)}
              <li class="info-item" data-cfg-wrap="whatsapp"${hiddenIf(!CFG.whatsapp.number)}><span class="icon-tile sm wa-tile">${icon('whatsapp')}</span><div><span class="info-label">${esc(c.info.whatsapp)}</span><a data-wa data-wa-text href="${esc(waHref(L))}" target="_blank" rel="noopener">${esc(L.common.whatsappStart)}</a></div></li>
              ${cfgItem('address', 'pin', c.info.address, CFG.contact.address)}
              ${cfgItem('hours', 'clock', c.info.hours, CFG.contact.hours[L.code])}
            </ul>
            <div class="follow"><span class="info-label">${esc(c.info.follow)}</span>${socialLinks('social social-lg')}</div>
          </div>
          ${mapFrame(L)}
        </aside>
      </div>
    </section>`;
};

const notFound = (L) => `
    <section class="page-hero nf">
      <div class="hero-bg" aria-hidden="true"><canvas data-stars></canvas><div class="glow glow-1"></div></div>
      <div class="container narrow">
        <p class="nf-code grad">404</p>
        <h1>${esc(L.notFound.title)}</h1>
        <p class="lead">${esc(L.notFound.text)}</p>
        <div class="btn-row center">${LANGS.map((o) => `<a class="btn ${o.code === L.code ? 'btn-primary' : 'btn-ghost'}" href="${href(o, '')}" lang="${o.code}">${esc(o.notFound.cta)}</a>`).join('')}</div>
      </div>
    </section>`;

const orgJsonLd = (L) =>
  `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'ProfessionalService'],
    name: 'Adastra Technology & Consulting',
    url: SITE_URL,
    logo: `${SITE_URL}/assets/img/apple-touch-icon.png`,
    description: L.meta.defaultDescription,
    email: CFG.contact.email || undefined,
    telephone: CFG.contact.phone || undefined,
    address: { '@type': 'PostalAddress', addressLocality: 'Beşiktaş', addressRegion: 'İstanbul', addressCountry: 'TR' },
    availableLanguage: ['English', 'Turkish', 'German'],
    sameAs: [CFG.social.instagram, CFG.social.linkedin].filter(Boolean),
  })}</script>`;

// ── write ─────────────────────────────────────────────────────────────────

const render = { home, programs, consulting, about, contact };

const write = (rel, content) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

rmSync(OUT, { recursive: true, force: true });
cpSync(join(ROOT, 'src/assets'), join(OUT, 'assets'), { recursive: true });

for (const L of LANGS) {
  currentLang = L;
  for (const page of PAGES) {
    const meta = L[page.id];
    write(
      `${L.code}/${page.slug}index.html`,
      layout(L, page, {
        title: meta.title,
        description: meta.description,
        body: render[page.id](L),
        jsonld: page.id === 'home' ? orgJsonLd(L) : '',
      })
    );
  }
  write(`${L.code}/404.html`, layout(L, { id: '404', slug: '' }, { title: L.notFound.title, description: L.meta.defaultDescription, body: notFound(L) }).replace(/<link rel="canonical"[^>]*>\n/, '<meta name="robots" content="noindex">\n'));
}

// Root: send visitors to their language (saved choice → browser language → English).
write(
  'index.html',
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Adastra — Technology Education &amp; Consulting · Istanbul</title>
  <meta name="description" content="${esc(en.meta.defaultDescription)}">
  ${LANGS.map((o) => `<link rel="alternate" hreflang="${o.code}" href="${SITE_URL}/${o.code}/">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#070b1a">
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#070b1a;color:#e8ecf7;font:16px/1.5 system-ui,sans-serif}a{color:#a996ff;margin:0 .6em}</style>
  <script>
    (function () {
      var ok = ['en', 'tr', 'de'], l = null;
      try { l = localStorage.getItem('adastra-lang'); } catch (e) {}
      if (ok.indexOf(l) < 0) {
        var navs = navigator.languages || [navigator.language || 'en'];
        for (var i = 0; i < navs.length && ok.indexOf(l) < 0; i++) l = String(navs[i]).slice(0, 2).toLowerCase();
      }
      if (ok.indexOf(l) < 0) l = 'en';
      location.replace('/' + l + '/' + location.hash);
    })();
  </script>
</head>
<body>
  <p>${LANGS.map((o) => `<a href="/${o.code}/" lang="${o.code}">${esc(o.name)}</a>`).join('')}</p>
</body>
</html>
`
);

write('404.html', readFileSync(join(OUT, 'en/404.html'), 'utf8'));

write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.flatMap((L) =>
  PAGES.map(
    (p) => `  <url>
    <loc>${SITE_URL + href(L, p.slug)}</loc>
${LANGS.map((o) => `    <xhtml:link rel="alternate" hreflang="${o.code}" href="${SITE_URL + href(o, p.slug)}"/>`).join('\n')}
  </url>`
  )
).join('\n')}
</urlset>
`
);

write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${LANGS.length * PAGES.length} pages → ${OUT}`);
