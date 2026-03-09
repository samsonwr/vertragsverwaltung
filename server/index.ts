import express from 'express';
import cors from 'cors';
import { getDb } from './database.js';
import { vertraegeRouter } from './routes/vertraege.js';
import { ereignisseRouter } from './routes/ereignisse.js';
import { historieRouter } from './routes/historie.js';
import { dashboardRouter } from './routes/dashboard.js';
import { benutzerRouter } from './routes/benutzer.js';

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

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
