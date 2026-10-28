// Storage for contact-form enquiries. The DATABASE_URL scheme picks the driver:
//   mysql://… or mariadb://…   → MariaDB / MySQL (mysql2)
//   postgres://… or postgresql://… → PostgreSQL (pg)
// Both expose the same three calls: init(), insert(row), list(limit), ping().

const COLUMNS = ['name', 'email', 'phone', 'language', 'interest', 'message', 'page', 'ip', 'user_agent'];
const LIST = 'SELECT id, created_at, name, email, phone, language, interest, message, page FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT ';

async function mariadb(url) {
  const { default: mysql } = await import('mysql2/promise');
  const u = new URL(url);
  u.protocol = 'mysql:'; // mysql2 does not know the mariadb:// scheme
  const pool = mysql.createPool({ uri: u.toString(), charset: 'utf8mb4', timezone: 'Z', connectionLimit: 5 });

  return {
    dialect: 'mariadb',
    init: () =>
      pool.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          name        VARCHAR(200) NOT NULL,
          email       VARCHAR(254) NOT NULL,
          phone       VARCHAR(50) NULL,
          language    VARCHAR(50) NULL,
          interest    VARCHAR(200) NULL,
          message     TEXT NOT NULL,
          page        VARCHAR(500) NULL,
          ip          VARCHAR(64) NULL,
          user_agent  VARCHAR(500) NULL,
          KEY contact_messages_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`),
    insert: async (row) => {
      const [res] = await pool.execute(
        `INSERT INTO contact_messages (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map(() => '?').join(', ')})`,
        COLUMNS.map((c) => row[c] || null)
      );
      return res.insertId;
    },
    list: async (limit) => (await pool.query(LIST + Number(limit)))[0],
    ping: () => pool.query('SELECT 1'),
  };
}

async function postgres(url) {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({ connectionString: url });

  return {
    dialect: 'postgres',
    init: () =>
      pool.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id          BIGSERIAL PRIMARY KEY,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          name        TEXT NOT NULL,
          email       TEXT NOT NULL,
          phone       TEXT,
          language    TEXT,
          interest    TEXT,
          message     TEXT NOT NULL,
          page        TEXT,
          ip          TEXT,
          user_agent  TEXT
        );
        CREATE INDEX IF NOT EXISTS contact_messages_created_at ON contact_messages (created_at DESC);`),
    insert: async (row) => {
      const { rows } = await pool.query(
        `INSERT INTO contact_messages (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
        COLUMNS.map((c) => row[c] || null)
      );
      return Number(rows[0].id);
    },
    list: async (limit) => (await pool.query(LIST + Number(limit))).rows.map((r) => ({ ...r, id: Number(r.id) })),
    ping: () => pool.query('SELECT 1'),
  };
}

export async function connect(url) {
  if (!url) throw new Error('DATABASE_URL is not set');
  const scheme = url.slice(0, url.indexOf(':')).toLowerCase();
  if (scheme === 'mysql' || scheme === 'mariadb') return mariadb(url);
  if (scheme === 'postgres' || scheme === 'postgresql') return postgres(url);
  throw new Error(`Unsupported DATABASE_URL scheme "${scheme}" (use mysql://, mariadb:// or postgres://)`);
}
