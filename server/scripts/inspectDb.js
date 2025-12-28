const Database = require('better-sqlite3');
const path = require('path');

function resolveSqlitePath() {
	const dbUrl = process.env.DATABASE_URL;
	const serverRoot = path.join(__dirname, '..');
	const prismaDir = path.join(serverRoot, 'prisma');

	if (!dbUrl) return path.join(prismaDir, 'dev.db');

	if (dbUrl.startsWith('file:')) {
		const rel = dbUrl.replace(/^file:/, '').replace(/^\/+/, '');
		return path.resolve(prismaDir, rel);
	}

	return path.join(prismaDir, 'dev.db');
}

const dbPath = resolveSqlitePath();
const db = new Database(dbPath);

console.log('📁 SQLite file:', dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables:', tables);

const migrations = db
	.prepare("SELECT migration_name, finished_at, applied_steps_count FROM _prisma_migrations ORDER BY started_at")
	.all();
console.log('Migrations:', migrations);

const usersInfo = db.prepare('PRAGMA table_info(users)').all();
console.log('users columns:', usersInfo);
