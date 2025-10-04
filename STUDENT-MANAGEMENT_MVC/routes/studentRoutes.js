const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Import controller methods
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByCourse,
  getStatistics
} = studentController;

// Define routes and connect them to controller methods

// @route   POST /api/students
// @desc    Create a new student
// @access  Public
router.post('/', createStudent);

// @route   GET /api/students
// @desc    Get all students (with optional pagination and filtering)
// @access  Public
router.get('/', getAllStudents);

// @route   GET /api/students/stats
// @desc    Get student statistics
// @access  Public
router.get('/stats', getStatistics);

// @route   GET /api/students/course/:course
// @desc    Get students by course
// @access  Public
router.get('/course/:course', getStudentsByCourse);

// @route   GET /api/students/:id
// @desc    Get a single student by ID
// @access  Public
router.get('/:id', getStudentById);

// @route   PUT /api/students/:id
// @desc    Update a student by ID
// @access  Public
router.put('/:id', updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete a student by ID
// @access  Public
router.delete('/:id', deleteStudent);

module.exports = router;