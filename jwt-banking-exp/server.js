// server.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded user (for this exercise)
const HARD_USER = { username: 'user1', password: 'password123' };

// Secret (use .env in real apps)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '1h';

app.use(express.json());

/* Simple request logger (helps debugging)
   Logs method, url and time */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* In-memory balance for demo (single account) */
let accountBalance = 1000;

/* Login route - returns a signed JWT on successful credentials */
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  if (username !== HARD_USER.username || password !== HARD_USER.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = { username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });

  res.json({ token });
});

/* Middleware: verify Bearer JWT token */
function verifyToken(req, res, next) {
  const authHeader = req.header('Authorization') || '';
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({ message: 'Authorization header malformed. Expected "Bearer <token>"' });
  }

  const token = parts[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // token invalid or expired
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    // attach decoded info to req for route handlers
    req.user = decoded;
    next();
  });
}

/* Protected routes */
app.get('/balance', verifyToken, (req, res) => {
  res.json({ balance: accountBalance });
});

app.post('/deposit', verifyToken, (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid deposit amount' });
  }
  accountBalance += amount;
  res.json({ message: `Deposited $${amount}`, newBalance: accountBalance });
});

app.post('/withdraw', verifyToken, (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid withdraw amount' });
  }
  if (amount > accountBalance) {
    return res.status(400).json({ message: 'Insufficient funds' });
  }
  accountBalance -= amount;
  res.json({ message: `Withdrew $${amount}`, newBalance: accountBalance });
});

/* 404 and error handlers */
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
