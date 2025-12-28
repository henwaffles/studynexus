const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;
    const key = raw.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = value;
      i++;
    }
  }
  return args;
}

function splitSqlStatements(sql) {
  const statements = [];
  let buf = '';

  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
        buf += ch;
      }
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (!inSingle && !inDouble) {
      if (ch === '-' && next === '-') {
        inLineComment = true;
        i++;
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
    }

    if (ch === "'" && !inDouble) {
      // Handle escaped single quote: ''
      if (inSingle && next === "'") {
        buf += "''";
        i++;
        continue;
      }
      inSingle = !inSingle;
      buf += ch;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      buf += ch;
      continue;
    }

    if (ch === ';' && !inSingle && !inDouble) {
      const stmt = buf.trim();
      if (stmt) statements.push(stmt);
      buf = '';
      continue;
    }

    buf += ch;
  }

  const tail = buf.trim();
  if (tail) statements.push(tail);
  return statements;
}

async function main() {
  const args = parseArgs(process.argv);

  const url = String(args.url || process.env.TURSO_DATABASE_URL || '').trim();
  const authToken = String(args.token || process.env.TURSO_AUTH_TOKEN || '').trim();

  if (!url) {
    console.error('Missing Turso URL. Provide --url or set TURSO_DATABASE_URL.');
    process.exit(1);
  }
  if (!url.startsWith('libsql://')) {
    console.error(`Turso URL must start with libsql:// (got: ${url})`);
    process.exit(1);
  }
  if (!authToken) {
    console.error('Missing Turso auth token. Provide --token or set TURSO_AUTH_TOKEN.');
    process.exit(1);
  }

  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationDirs = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const migrationFiles = migrationDirs
    .map((dir) => path.join(migrationsDir, dir, 'migration.sql'))
    .filter((p) => fs.existsSync(p));

  if (migrationFiles.length === 0) {
    console.error(`No migration.sql files found under ${migrationsDir}`);
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  console.log(`Applying ${migrationFiles.length} migrations to ${url}`);

  for (const filePath of migrationFiles) {
    const rel = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
    console.log(`\n==> ${rel}`);

    const sql = fs.readFileSync(filePath, 'utf8');
    const statements = splitSqlStatements(sql);

    for (const stmt of statements) {
      // Skip empty PRAGMA (shouldn't happen) and allow safe repeats where possible
      try {
        await client.execute({ sql: stmt, args: [] });
      } catch (err) {
        const msg = String(err && err.message ? err.message : err);
        // If re-running, some statements may already exist; treat these as non-fatal.
        if (
          msg.includes('already exists') ||
          msg.includes('duplicate') ||
          msg.includes('UNIQUE constraint failed')
        ) {
          continue;
        }
        console.error(`Failed statement:\n${stmt}\n`);
        throw err;
      }
    }
  }

  console.log('\nDone. Your Turso DB should now have tables (users, flashcards, etc).');
}

main().catch((err) => {
  console.error('Migration apply failed:', err);
  process.exit(1);
});
