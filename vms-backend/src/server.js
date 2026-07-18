const express = require('express');
const cors = require('cors');
const path = require('path');
const { port } = require('./config');

const authRoutes = require('../routes/auth');
const visitorRoutes = require('../routes/visitors');
const appointmentRoutes = require('../routes/appointments');
const adminRoutes = require('../routes/admin');
const officerRoutes = require('../routes/officers');
const officesRoutes = require('../routes/offices');
const userRoutes = require('../routes/users');
const auditRoutes = require('../routes/audit');
const ftpRoutes = require('../routes/ftp');
const purposesRoutes = require('../routes/purposes');

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://vms.avanyaedge.com'],
  credentials: true
}));
app.use(express.json());

// Serve uploaded files from backend uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve FTP files (photos, documents, etc)
app.use('/ftp/files', express.static(path.join(__dirname, '../ftp/files')));

app.use('/auth', authRoutes);
app.use('/visitors', visitorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/admin', adminRoutes);
app.use('/officers', officerRoutes);
app.use('/offices', officesRoutes);
app.use('/users', userRoutes);
app.use('/ftp', ftpRoutes);
app.use('/audit', auditRoutes);
app.use('/purposes', purposesRoutes);

app.get('/', (req, res) => res.json({ ok: true, service: 'VMS API' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Global uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  console.error(err.stack);
});

// Start server
const server = app.listen(port, () => {
  console.log(`VMS API running on http://localhost:${port}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
  }
});
