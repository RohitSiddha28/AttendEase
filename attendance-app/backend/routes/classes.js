const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

// GET /api/classes - get all classes for user
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// POST /api/classes - create new class
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Class name required' });

    const newClass = new Class({ name, description, owner: req.user._id, students: [], subjects: [] });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// GET /api/classes/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// DELETE /api/classes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    // Delete all attendance for this class
    await Attendance.deleteMany({ classId: req.params.id });
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// POST /api/classes/:id/students
router.post('/:id/students', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Student name required' });

    const cls = await Class.findOne({ _id: req.params.id, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    if (cls.students.includes(name.trim())) {
      return res.status(400).json({ error: 'Student already exists' });
    }
    cls.students.push(name.trim());
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// DELETE /api/classes/:id/students/:studentName
router.delete('/:id/students/:studentName', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const studentName = decodeURIComponent(req.params.studentName);
    cls.students = cls.students.filter(s => s !== studentName);
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove student' });
  }
});

// POST /api/classes/:id/subjects
router.post('/:id/subjects', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Subject name required' });

    const cls = await Class.findOne({ _id: req.params.id, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    if (cls.subjects.includes(name.trim())) {
      return res.status(400).json({ error: 'Subject already exists' });
    }
    cls.subjects.push(name.trim());
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add subject' });
  }
});

// DELETE /api/classes/:id/subjects/:subjectName
router.delete('/:id/subjects/:subjectName', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const subjectName = decodeURIComponent(req.params.subjectName);
    cls.subjects = cls.subjects.filter(s => s !== subjectName);
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove subject' });
  }
});

module.exports = router;
