import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// GET all attendance (faculty name joined from faculty table)
router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;

    let query = `
      SELECT a.*, 
             c.course_name, 
             CONCAT(s.first_name, ' ', s.last_name) AS student_name,
             CONCAT(f.first_name, ' ', f.last_name) AS faculty_name
      FROM attendance a
      LEFT JOIN courses c ON a.course_id = c.course_id
      LEFT JOIN students s ON a.student_id = s.student_id
      LEFT JOIN faculty f ON a.marked_by_faculty = f.faculty_id
    `;
    let params = [];

    if (studentId) {
      query += ` WHERE a.student_id = ?`;
      params.push(studentId);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
  }
});

// PUT update attendance hours
router.put('/update-hours', async (req, res) => {
  const { studentId, courseId, date, incHours, isPresent, facultyId } = req.body;

  if (!studentId || !courseId || !date || !incHours || typeof isPresent === 'undefined') {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const [[attendance]] = await pool.query(
      `SELECT * FROM attendance WHERE student_id = ? AND course_id = ? AND date = ?`,
      [studentId, courseId, date]
    );

    if (!attendance) {
      let total_classes = incHours, hours_present = 0, hours_absent = 0;
      if (isPresent) hours_present = incHours;
      else hours_absent = incHours;

      await pool.query(
        `INSERT INTO attendance (student_id, course_id, date, total_classes, hours_present, hours_absent, status, marked_by_faculty) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, courseId, date, total_classes, hours_present, hours_absent, isPresent ? 'present' : 'absent', facultyId || null]
      );

      return res.json({ success: true, inserted: true });
    }

    let hoursPresent = parseFloat(attendance.hours_present) || 0;
    let hoursAbsent = parseFloat(attendance.hours_absent) || 0;
    let totalClasses = parseInt(attendance.total_classes) || 0;

    if (isPresent) hoursPresent += incHours;
    else hoursAbsent += incHours;

    totalClasses += incHours;
    let status = (hoursPresent / totalClasses) >= 0.75 ? 'present' : 'absent';

    await pool.query(
      `UPDATE attendance 
       SET hours_present = ?, hours_absent = ?, total_classes = ?, status = ?, last_edited = NOW()
       WHERE attendance_id = ?`,
      [hoursPresent, hoursAbsent, totalClasses, status, attendance.attendance_id]
    );

    res.json({ success: true, updated: true });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance', details: error.message });
  }
});

export default router;
