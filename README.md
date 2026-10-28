# techadastra.com

The website of **Adastra Technology & Consulting** (Beşiktaş, Istanbul): computer training,
AI, software programming and game design courses, plus consulting. Available in English,
Turkish and German.

It is a static site. There is no database and no server process, so nginx serves the files
directly. A small build script with no dependencies generates every page in all three
languages.

```
techadastra/
├── build.mjs                 # node build.mjs → dist/
├── src/
│   ├── content/en.mjs        # all English text
│   ├── content/tr.mjs        # all Turkish text
│   ├── content/de.mjs        # all German text
│   ├── content/enterprise/   # extra text for the enterprise edition (en, tr, de)
│   ├── icons.mjs             # inline SVG icons
│   └── assets/
│       ├── config.js         # ← edition (theme), social links, WhatsApp, contact, form
│       ├── css/style.css     # classic design
│       ├── css/enterprise.css # enterprise design + the edition switch
│       ├── js/main.js
│       └── img/              # favicon, apple-touch-icon, og.png (link previews)
├── api/                      # contact-form API (Node; MariaDB/MySQL or Postgres)
├── Dockerfile                # builds the site into an nginx image
├── docker-compose.yml        # web + api + db
└── deploy/
    ├── deploy.sh             # build and rsync to server 1 (static only)
    ├── nginx-aapanel.conf    # extra vhost rules to paste into aaPanel
    └── docker/nginx.conf     # nginx config used inside the Docker image
```

Pages: `/en/`, `/tr/`, `/de/`, and under each of them `programs/`, `consulting/`, `about/`
and `contact/`. The site root `/` sends visitors to their saved language, or to their
browser's language. If neither is set, it uses English. The build also writes `sitemap.xml`,
`robots.txt`, hreflang tags, Open Graph tags and schema.org data.

## Two editions: classic and enterprise

The site ships in two designs, and every page contains both:

| `theme` | Look | Positioning |
|---|---|---|
| `'classic'` | Dark, space-themed, with gradients and a starfield | Technology education for everyone, including kids & teens |
| `'enterprise'` | Light, corporate: navy and white with serif headlines | Corporate training for companies, with "Request a proposal" calls to action, a home page written for HR and L&D teams, and no kids & teens program |

**To switch editions,** set `theme` at the top of `src/assets/config.js`, or of `assets/config.js`
on the server. The change is live on the next page load and needs no rebuild.

**To compare them without switching,** add `?theme=enterprise` or `?theme=classic` to any page
URL. Only your browser tab sees the preview, and it stays on while you browse. A small
*Preview* switch in the bottom-left corner flips between the editions; its ✕ (or
`?theme=reset`) ends the preview. Visitors never see that switch.

Text used only by the enterprise edition is in `src/content/enterprise/{en,tr,de}.mjs`. All
other text is shared, in `src/content/{en,tr,de}.mjs`.

## Changing links and contact details: `src/assets/config.js`

| Setting | What it does |
|---|---|
| `theme` | `'classic'` or `'enterprise'`. See *Two editions* above. |
| `social.instagram`, `social.linkedin` | Full profile URLs. Set one to `''` to hide that icon everywhere. |
| `whatsapp.number` | Digits only, in international format, e.g. `905321234567`. While it is empty, the WhatsApp buttons open the contact page. |
| `whatsapp.floatingButton` | Shows or hides the green chat button and the "Start chat" card. |
| `whatsapp.widgetScriptUrl` | For the WhatsApp chat integration you plan later (WATI, respond.io, Twilio, Elfsight…). Paste the provider's script URL here. It loads on every page and replaces the built-in button. |
| `contact.email`, `contact.phone`, `contact.address`, `contact.hours` | Shown in the footer and on the contact page. An empty value hides that line. |
| `contact.mapEmbedUrl` | Google Maps → Share → Embed a map → copy the `src`. |
| `contactForm.endpoint` | The URL the contact form POSTs its JSON to. The default, `/api/contact`, is the bundled API, which saves enquiries to MariaDB (see Docker below). Formspree, Getform or Web3Forms URLs also work. If the value is empty, or no API answers at that URL (for example on plain static hosting), the form opens the visitor's email app with a message addressed to `contact.email`. |

The browser reads this file on every page load, so you have two ways to change it:

* **On the server:** edit `/www/wwwroot/techadastra.com/assets/config.js` in the aaPanel file
  manager. The change is live immediately and needs no rebuild.
* **In the repo:** edit `src/assets/config.js`, then run `./deploy/deploy.sh --with-config`.
  A plain `deploy.sh` leaves the server's copy alone, so it never undoes changes made on the
  server.

## Changing text

Every word on the site is in `src/content/{en,tr,de}.mjs`, and the three files have the same
structure. To change course titles, durations, levels or formats, edit `programs.items`.
Then run:

```bash
node build.mjs
```

To preview locally:

```bash
cd dist && python3 -m http.server 8484
```

## Running with Docker (site + contact API + database)

```bash
cp .env.example .env        # set DB_PASSWORD and ADMIN_TOKEN
docker compose up -d --build
```

This starts three containers: nginx with the site, the contact-form API, and MariaDB 11.4.
The site is then at http://localhost:8484. If another program already uses that port
(`docker compose up` reports "port is already allocated"), set a free one with `WEB_PORT`
in `.env`.
Contact-form enquiries are saved in the `contact_messages` table (utf8mb4, so Turkish,
German and emoji are stored intact). The API creates the table when it starts. To read the
enquiries:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8484/api/messages
```

```bash
docker compose exec db mariadb --default-character-set=utf8mb4 -uadastra -p adastra -e "SELECT * FROM contact_messages ORDER BY id DESC"
```

### Which database: `DATABASE_URL`

The API picks its driver from the URL scheme:

| `DATABASE_URL` | Database |
|---|---|
| `mysql://user:pass@host:3306/db` or `mariadb://…` | MariaDB / MySQL |
| `postgres://user:pass@host:5432/db` | PostgreSQL |

If `DATABASE_URL` is not set, the API uses the bundled `db` container. When you use an
existing database, start only the web and API containers:

```bash
docker compose up -d --build web api
```

### Using server 1's MariaDB (aaPanel)

aaPanel's MariaDB runs on the host, not in Docker. The API reaches it through
`host.docker.internal`.

1. **Create the database and a user** that Docker containers can log in as. Containers
   connect from `172.x` addresses. Run this as root, using the client at
   `/www/server/mysql/bin/mysql`:

   ```sql
   CREATE DATABASE techadastra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'techadastra'@'172.%' IDENTIFIED BY 'a-long-random-password';
   GRANT SELECT, INSERT, CREATE ON techadastra.* TO 'techadastra'@'172.%';
   ```

2. **Make MariaDB listen beyond 127.0.0.1.** In `/etc/my.cnf`, set
   `bind-address = 0.0.0.0` or comment the line out, then restart MariaDB from aaPanel.
   Keep port 3306 **closed** in aaPanel's firewall: the containers reach it over Docker's
   internal network, so it never needs to be open to the internet.

3. **Point the API at it** in `.env`:

   ```
   DATABASE_URL=mysql://techadastra:a-long-random-password@host.docker.internal:3306/techadastra
   ```

   Then run `docker compose up -d --build web api`. If the API log
   (`docker compose logs api`) ends with `contact API listening on :3000 (mariadb)`, it is
   connected.

4. **Publish the site.** In aaPanel, set `techadastra.com` to reverse-proxy to
   `http://127.0.0.1:8484` (Website → techadastra.com → Reverse proxy), then add SSL as
   described below.

### Other Docker notes

* **Settings:** the `src/assets` folder is mounted into the container, so edits to
  `config.js`, including the `theme` switch, are live without a rebuild. After changing text in `src/content/`, run
  `docker compose up -d --build web`.
* **API limits:** the API accepts at most 5 enquiries per IP every 10 minutes. It
  rejects fields that are too long and silently drops submissions that fill in the
  honeypot field.
* **Building behind a TLS-intercepting proxy:** pass its CA with
  `docker build --secret id=ca,src=ca.crt ./api`.

## Going live (first time)

**1. DNS at Namecheap.** Open Domain List → techadastra.com → Manage → Advanced DNS. Remove
the parking records, then add:

| Type | Host | Value |
|---|---|---|
| A Record | `@` | `63.250.54.80` |
| CNAME Record | `www` | `techadastra.com.` |

**2. Create the site in aaPanel.** Go to Website → Add site:
* Domain: `techadastra.com` and `www.techadastra.com`
* Root: `/www/wwwroot/techadastra.com`
* PHP: *Static*
* No database

**3. Upload the files** from a machine that can SSH to the server:

```bash
./deploy/deploy.sh
```

This needs Node 18+ and rsync on that machine. Without them, run `node build.mjs` and
upload the contents of `dist/` to the site root with the aaPanel file manager.

**4. SSL.** After DNS resolves, go to Website → techadastra.com → SSL → Let's Encrypt.
Select both domains, apply, and turn on **Force HTTPS**. Under *Redirect*, send
`www.techadastra.com` to `https://techadastra.com`. The canonical URLs use the domain
without `www`.

**5. Nginx extras.** Go to Website → techadastra.com → Conf and paste
`deploy/nginx-aapanel.conf` as the comments in that file describe. This adds clean URLs,
a 404 page per language, and makes `config.js` uncacheable so that edits made on the server
show up immediately.

## Later deploys

```bash
./deploy/deploy.sh
```
