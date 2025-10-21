const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Account = require('./models/Account');

dotenv.config();
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

// Route 1: Create sample account
app.post('/create', async (req, res) => {
  try {
    const { name, balance } = req.body;
    const account = new Account({ name, balance });
    await account.save();
    res.status(201).json({ message: "Account created", account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 2: Transfer money
app.post('/transfer', async (req, res) => {
  try {
    const { sender, receiver, amount } = req.body;

    const senderAcc = await Account.findOne({ name: sender });
    const receiverAcc = await Account.findOne({ name: receiver });

    if (!senderAcc || !receiverAcc) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    if (senderAcc.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Sequential updates
    senderAcc.balance -= amount;
    receiverAcc.balance += amount;

    await senderAcc.save();
    await receiverAcc.save();

    res.json({ message: "Transfer successful", senderAcc, receiverAcc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 3: Get all accounts
app.get('/accounts', async (req, res) => {
  const accounts = await Account.find();
  res.json(accounts);
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
    