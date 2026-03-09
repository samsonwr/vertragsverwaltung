import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './database.js';
import { vertraegeRouter } from './routes/vertraege.js';
import { ereignisseRouter } from './routes/ereignisse.js';
import { historieRouter } from './routes/historie.js';
import { dashboardRouter } from './routes/dashboard.js';
import { benutzerRouter } from './routes/benutzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize DB
getDb();

// Routes
app.use('/api/vertraege', vertraegeRouter);
app.use('/api/ereignisse', ereignisseRouter);
app.use('/api/historie', historieRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/benutzer', benutzerRouter);

// Serve frontend
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
