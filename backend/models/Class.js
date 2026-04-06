const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: String,
    trim: true
  }],
  subjects: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
