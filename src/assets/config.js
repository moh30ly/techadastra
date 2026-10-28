/*
 * ─────────────────────────────────────────────────────────────────────────
 *  ADASTRA SITE SETTINGS
 *  Edit this file to change social links, WhatsApp, contact details and the
 *  contact form. It is read by the browser on every page, so on the server you
 *  can edit  /www/wwwroot/techadastra.com/assets/config.js  directly — no
 *  rebuild needed. (It is also read at build time, so pages work without JS.)
 *
 *  Leave a value as '' to hide that item.
 * ─────────────────────────────────────────────────────────────────────────
 */
window.ADASTRA_CONFIG = {
  // Site edition:
  //   'classic'    — the original dark, space-themed design (courses for everyone)
  //   'enterprise' — light, corporate design focused on training for companies
  // To compare without changing this, open any page with ?theme=enterprise or
  // ?theme=classic (that browser tab keeps it; ?theme=reset goes back to this value).
  theme: 'classic',

  social: {
    // Full profile URLs. Empty string hides the icon everywhere.
    instagram: 'https://www.instagram.com/techadastra', // TODO: confirm handle
    linkedin: 'https://www.linkedin.com/company/techadastra', // TODO: confirm page
  },

  whatsapp: {
    // International format, digits only, no + or spaces. e.g. '905321234567'
    // While empty, WhatsApp buttons open the contact page instead.
    number: '',
    // Floating WhatsApp button in the bottom corner of every page.
    floatingButton: true,
    // Later: paste a third-party WhatsApp chat widget here (WATI, respond.io,
    // Twilio, Elfsight, …). When set, the script is loaded on every page and
    // the built-in floating button is hidden so the two don't overlap.
    widgetScriptUrl: '',
  },

  contact: {
    email: 'info@techadastra.com',
    phone: '', // e.g. '+90 212 000 00 00' — empty hides it
    address: 'Beşiktaş, İstanbul, Türkiye',
    // Google Maps "Embed a map" src URL (Share → Embed a map → copy the src).
    mapEmbedUrl: 'https://www.google.com/maps?q=Be%C5%9Fikta%C5%9F%2C%20%C4%B0stanbul&output=embed',
    hours: {
      en: 'Mon–Fri 09:00–18:00 · Sat 10:00–15:00',
      tr: 'Pzt–Cum 09:00–18:00 · Cmt 10:00–15:00',
      de: 'Mo–Fr 09:00–18:00 · Sa 10:00–15:00',
    },
  },

  contactForm: {
    // Where the contact form is POSTed (JSON). '/api/contact' is the bundled
    // API (see docker-compose.yml), which stores enquiries in the database.
    // Formspree, Getform or Web3Forms URLs work too. If the endpoint is empty
    // or there is no API behind it (plain static hosting), the form opens the
    // visitor's email app addressed to contact.email instead.
    endpoint: '/api/contact',
  },
};
