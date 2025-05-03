import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { studentId, facultyId } = req.query;
    let query = `
      SELECT 
        a.*,
        c.course_name,
        s.section,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        CONCAT(f.first_name, ' ', f.last_name) AS faculty_name
      FROM attendance a
      LEFT JOIN courses  c ON a.course_id       = c.course_id
      LEFT JOIN students s ON a.student_id      = s.student_id
      LEFT JOIN faculty  f ON a.marked_by_faculty = f.faculty_id
    `;
    const params = [];

    if (studentId) {
      query += ` WHERE a.student_id = ?`;
      params.push(studentId);
    } else if (facultyId) {
      query += ` WHERE a.marked_by_faculty = ?`;
      params.push(facultyId);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch attendance', details: error.message });
  }
});

router.put('/update-hours', async (req, res) => {
  const { studentId, courseId, date, incHours, isPresent, facultyId } = req.body;

  if (
    !studentId ||
    !courseId ||
    !date ||
    typeof incHours !== 'number' ||
    typeof isPresent !== 'boolean'
  ) {
    return res.status(400).json({ error: 'Missing or invalid fields.' });
  }

  const dateOnly = date.split('T')[0];

  try {
    const [rows] = await pool.query(
      `SELECT attendance_id, hours_present, hours_absent, total_classes
         FROM attendance
        WHERE student_id = ?
          AND course_id  = ?
          AND date       = ?`,
      [studentId, courseId, dateOnly]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'No attendance record found to update for this student/course/date.',
      });
    }

    const at = rows[0];
    let hoursPresent = Number(at.hours_present) || 0;
    let hoursAbsent  = Number(at.hours_absent)  || 0;
    let totalClasses = Number(at.total_classes) || 0;

    if (isPresent) {
      hoursPresent += incHours;
    } else {
      hoursAbsent  += incHours;
    }
    totalClasses += incHours;

    const status = (hoursPresent / totalClasses) >= 0.75 ? 'present' : 'absent';

    await pool.query(
      `UPDATE attendance
          SET hours_present     = ?,
              hours_absent      = ?,
              total_classes     = ?,
              status            = ?,
              marked_by_faculty = ?,
              last_edited       = NOW()
        WHERE attendance_id     = ?`,
      [
        hoursPresent,
        hoursAbsent,
        totalClasses,
        status,
        facultyId || null,
        at.attendance_id,
      ]
    );

    return res.json({ success: true, updated: true });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res
      .status(500)
      .json({ error: 'Failed to update attendance', details: error.message });
  }
});

export default router;
