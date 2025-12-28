const { PrismaClient } = require('@prisma/client');

const isDev = process.env.NODE_ENV === 'development';

function shouldUseLibsqlAdapter() {
  const url = String(process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '');
  return url.startsWith('libsql://');
}

function createLibsqlPrismaClient() {
  const { createClient } = require('@libsql/client');
  const { PrismaLibSQL } = require('@prisma/adapter-libsql');

  const url = String(process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const libsqlClient = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsqlClient);

  return new PrismaClient({
    adapter,
    log: isDev ? ['query', 'error', 'warn'] : ['error'],
  });
}

const prisma = shouldUseLibsqlAdapter()
  ? createLibsqlPrismaClient()
  : new PrismaClient({
      log: isDev ? ['query', 'error', 'warn'] : ['error'],
    });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
