const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// CORS middleware (if needed for frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Import Routes
const studentRoutes = require('./routes/studentRoutes');

// Use Routes
app.use('/api/students', studentRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Student Management System API',
    version: '1.0.0',
    endpoints: {
      'POST /api/students': 'Create a new student',
      'GET /api/students': 'Get all students (supports ?page=1&limit=10&course=...)',
      'GET /api/students/:id': 'Get a student by ID',
      'PUT /api/students/:id': 'Update a student by ID',
      'DELETE /api/students/:id': 'Delete a student by ID',
      'GET /api/students/course/:course': 'Get students by course',
      'GET /api/students/stats': 'Get student statistics'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});