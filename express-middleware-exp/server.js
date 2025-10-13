// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

/*
 Logging middleware (applied globally)
 Logs HTTP method, URL and ISO timestamp for every incoming request
*/
function requestLogger(req, res, next) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  // You can also attach the timestamp to req for later use:
  req.requestTime = now;
  next();
}

/*
 Bearer token auth middleware
 Checks Authorization header for: "Bearer mysecrettoken"
 If missing or incorrect, responds with 401 and message.
*/
function bearerAuth(req, res, next) {
  const authHeader = req.header('Authorization') || '';
  // Expect header like: "Bearer mysecrettoken"
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({ error: 'Authorization header malformed. Expected "Bearer <token>"' });
  }

  const token = parts[1];
  const expectedToken = 'mysecrettoken';

  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // token ok — you may attach user info to req here
  req.user = { tokenValid: true };
  next();
}

/* Apply logging middleware to all routes */
app.use(requestLogger);

/* For parsing JSON bodies if you later add POST routes */
app.use(express.json());

/* Public route - no auth required */
app.get('/', (req, res) => {
  res.json({
    message: 'Hello! This is a public route. No authentication required.',
    requestedAt: req.requestTime || null
  });
});

/* Protected route - apply bearerAuth middleware */
app.get('/protected', bearerAuth, (req, res) => {
  res.json({
    message: 'You have accessed the protected route. Token accepted.',
    requestedAt: req.requestTime || null
  });
});

/* Example route to show a 403 case (optional) */
app.get('/admin', bearerAuth, (req, res) => {
  // in a real app you would check role; here we just demonstrate protected access
  res.json({ message: 'Admin area — token OK.' });
});

/* Not found handler */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

/* Error handler */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
