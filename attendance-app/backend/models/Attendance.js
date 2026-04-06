const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  records: [{
    student: { type: String, required: true },
    status: { type: String, enum: ['present', 'absent'], default: 'absent' }
  }]
}, { timestamps: true });

// Compound index: one attendance record per class+subject+date
attendanceSchema.index({ classId: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
