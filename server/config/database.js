const { PrismaClient } = require('@prisma/client');

function shouldUseLibsqlAdapter() {
  const url = String(process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '');
  return url.startsWith('libsql://');
}

function createLibsqlPrismaClient() {
  const { createClient } = require('@libsql/client');
  const adapterLibsqlModule = require('@prisma/adapter-libsql');

  const url = String(process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const libsql = createClient({ url, authToken });

  const PrismaLibSQL =
    adapterLibsqlModule.PrismaLibSQL ||
    adapterLibsqlModule.PrismaLibSql ||
    adapterLibsqlModule.default ||
    adapterLibsqlModule;

  let adapter;
  try {
    adapter = new PrismaLibSQL(libsql);
  } catch (error) {
    adapter = PrismaLibSQL(libsql);
  }

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
