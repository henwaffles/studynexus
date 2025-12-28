const app = require('./app');
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST;

// Start server
const listenOptions = HOST
  ? { port: PORT, host: HOST }
  : { port: PORT, host: '::', ipv6Only: false };

app.listen(listenOptions, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  if (HOST) {
    console.log(`📡 Listening on ${HOST}:${PORT}`);
  } else {
    console.log(`📡 Listening on ::(dual-stack):${PORT}`);
  }
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});

module.exports = app;
