import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`💈 MILLION BARBER API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📍 Location: Chust district, Namangan region, Uzbekistan`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`⚡ Health: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
