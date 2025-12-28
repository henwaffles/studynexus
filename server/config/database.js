const { PrismaClient } = require('@prisma/client');

function shouldUseLibsqlAdapter() {
  const url = String(process.env.DATABASE_URL || '');
  if (url.startsWith('libsql://')) return true;
  if (process.env.TURSO_AUTH_TOKEN) return true;
  return false;
}

function createLibsqlPrismaClient() {
  const { createClient } = require('@libsql/client');
  const { PrismaLibSQL } = require('@prisma/adapter-libsql');

  const url = String(process.env.DATABASE_URL || '');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

const prisma = shouldUseLibsqlAdapter()
  ? createLibsqlPrismaClient()
  : new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
