const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

// GET /api/attendance/:classId - all attendance records for a class
router.get('/:classId', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.classId, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const records = await Attendance.find({ classId: req.params.classId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// POST /api/attendance/:classId - save/update attendance for a date+subject
router.post('/:classId', auth, async (req, res) => {
  try {
    const { subject, date, records } = req.body;
    if (!subject || !date || !records) {
      return res.status(400).json({ error: 'subject, date and records are required' });
    }

    const cls = await Class.findOne({ _id: req.params.classId, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const attendance = await Attendance.findOneAndUpdate(
      { classId: req.params.classId, subject, date },
      { classId: req.params.classId, subject, date, records },
      { upsert: true, new: true }
    );
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// DELETE /api/attendance/:classId/:subject/:date
router.delete('/:classId/:subject/:date', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.classId, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const subject = decodeURIComponent(req.params.subject);
    await Attendance.findOneAndDelete({ classId: req.params.classId, subject, date: req.params.date });
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
});

// GET /api/attendance/:classId/analytics/student?name=X
router.get('/:classId/analytics/student', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.classId, owner: req.user._id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Student name required' });

    const records = await Attendance.find({ classId: req.params.classId });

    // Per-subject stats
    const subjectStats = {};
    cls.subjects.forEach(sub => {
      subjectStats[sub] = { total: 0, present: 0, history: [] };
    });

    records.forEach(rec => {
      const sub = rec.subject;
      if (!subjectStats[sub]) subjectStats[sub] = { total: 0, present: 0, history: [] };
      const studentRecord = rec.records.find(r => r.student === name);
      if (studentRecord) {
        subjectStats[sub].total++;
        if (studentRecord.status === 'present') subjectStats[sub].present++;
        subjectStats[sub].history.push({ date: rec.date, status: studentRecord.status });
      }
    });

    // Compute percentages
    const analytics = {};
    Object.keys(subjectStats).forEach(sub => {
      const { total, present, history } = subjectStats[sub];
      analytics[sub] = {
        total,
        present,
        absent: total - present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        history: history.sort((a, b) => b.date.localeCompare(a.date))
      };
    });

    res.json({ student: name, analytics });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

module.exports = router;
