const prisma = require('./config/database');

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query - count flashcards
    const count = await prisma.flashcard.count();
    console.log(`📊 Flashcards in database: ${count}`);
    
    // Get database info
    console.log(`📁 Database URL: ${process.env.DATABASE_URL || '(not set)'}`);
    console.log('🔧 Provider: SQLite');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
