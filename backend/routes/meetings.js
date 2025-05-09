const express = require('express');
const router = express.Router();
const Meeting = require('../functions/meeting.functions');

// GET all meetings
router.get('/', (req, res) => {
  Meeting.getMeetings((err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch meetings', error: err });
    res.json(results);
  });
});

// POST a new meeting
router.post('/', (req, res) => {
  const data = req.body;
  if (!data.title || !data.category || !data.location || !data.date || !data.start_time || !data.end_time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  Meeting.createMeeting(data, (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to create meeting', error: err });
    res.status(201).json({ message: 'Meeting created successfully' });
  });
});

module.exports = router;
