// backend/server.js
const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());           // allow requests from frontend
app.use(express.json());   // parse JSON bodies

// mount routes under /api
app.use('/api/products', productsRouter);

// health
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
