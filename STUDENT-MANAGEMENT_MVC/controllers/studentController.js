const Student = require('../models/Student');

// Controller handles all business logic

// CREATE - Add a new student
exports.createStudent = async (req, res) => {
  try {
    const { name, age, course, email } = req.body;

    // Validation
    if (!name || !age || !course) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, age, and course'
      });
    }

    // Create new student
    const student = new Student({
      name,
      age,
      course,
      email
    });

    // Save to database
    const savedStudent = await student.save();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: savedStudent
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error creating student',
      error: error.message
    });
  }
};

// READ - Get all students
exports.getAllStudents = async (req, res) => {
  try {
    // Optional: Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional: Add filtering
    const filter = {};
    if (req.query.course) {
      filter.course = req.query.course;
    }
    if (req.query.isActive) {
      filter.isActive = req.query.isActive === 'true';
    }

    const students = await Student.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    const totalStudents = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: students.length,
      total: totalStudents,
      page: page,
      totalPages: Math.ceil(totalStudents / limit),
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

// READ - Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

// UPDATE - Update a student by ID
exports.updateStudent = async (req, res) => {
  try {
    const { name, age, course, email, isActive } = req.body;

    // Find and update student
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, age, course, email, isActive },
      {
        new: true, // Return updated document
        runValidators: true // Run schema validations
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
};

// DELETE - Delete a student by ID (soft delete)
exports.deleteStudent = async (req, res) => {
  try {
    // Option 1: Soft delete (recommended)
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    // Option 2: Hard delete (permanent)
    // const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
};

// Additional Controller Methods

// Get students by course
exports.getStudentsByCourse = async (req, res) => {
  try {
    const students = await Student.findByCourse(req.params.course);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students by course',
      error: error.message
    });
  }
};

// Get student statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const courseStats = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const averageAge = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgAge: { $avg: '$age' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        courseDistribution: courseStats,
        averageAge: averageAge[0]?.avgAge || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};