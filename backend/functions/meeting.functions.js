const db = require('../db');

exports.createMeeting = (data, callback) => {
  const sql = `INSERT INTO meetings (title, category, location, date, start_time, end_time)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [data.title, data.category, data.location, data.date, data.start_time, data.end_time];
  db.query(sql, values, callback);
};

exports.getMeetings = (callback) => {
  db.query(`SELECT * FROM meetings`, callback);
};
