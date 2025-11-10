// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { verifyUserToken } from './services/supabase.js';
import { findRecordByEmail } from './services/filemaker.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => res.send('FileMaker ↔ Supabase backend is live!'));



// ✅ Route #2 — TEMPORARY: Direct FileMaker test
app.get('/api/testfilemaker', async (req, res) => {
  const testEmail = req.query.email || 'test@example.com';
  try {
    const record = await findRecordByEmail(testEmail);
    res.json({ success: true, record });
  } catch (err) {
    console.error('Test FileMaker error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Secure route
app.get('/api/userdata', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.replace('Bearer ', '');
  const user = await verifyUserToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid Supabase token' });

  try {
    const data = await findRecordByEmail(user.email);
    res.json({ user: user.email, record: data });
  } catch (err) {
    res.status(500).json({ error: 'FileMaker fetch failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
