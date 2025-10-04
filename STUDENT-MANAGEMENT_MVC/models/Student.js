const mongoose = require('mongoose');

// Define Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Student age is required'],
    min: [5, 'Age must be at least 5'],
    max: [100, 'Age cannot exceed 100']
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true,
    enum: {
      values: [
        'Computer Science',
        'Mechanical Engineering',
        'Electrical Engineering',
        'Civil Engineering',
        'Business Administration',
        'Medicine',
        'Law',
        'Arts',
        'Other'
      ],
      message: '{VALUE} is not a valid course'
    }
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create indexes for better query performance
studentSchema.index({ name: 1 });
studentSchema.index({ course: 1 });

// Instance method example
studentSchema.methods.getFullInfo = function() {
  return `${this.name} (${this.age} years old) - ${this.course}`;
};

// Static method example
studentSchema.statics.findByCourse = function(course) {
  return this.find({ course: course, isActive: true });
};

// Create and export Student model
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;