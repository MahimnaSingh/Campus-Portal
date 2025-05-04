// routes/attendance.js
import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

/**
 * GET /api/attendance
 * - ?studentId=… filters by a.student_id
 * - ?facultyId=… filters by a.marked_by_faculty
 * Returns student_name, course_name, and faculty_name (who last edited).
 */
router.get('/', async (req, res) => {
  try {
    const { studentId, facultyId } = req.query;
    let query = `
      SELECT 
        a.*,
        c.course_name,
        s.section,
        CONCAT(s.first_name, ' ', s.last_name)   AS student_name,
        CONCAT(f.first_name, ' ', f.last_name)   AS faculty_name
      FROM attendance a
      LEFT JOIN courses  c ON a.course_id          = c.course_id
      LEFT JOIN students s ON a.student_id         = s.student_id
      LEFT JOIN faculty  f ON a.marked_by_faculty   = f.faculty_id
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
    res.status(500).json({
      error: 'Failed to fetch attendance',
      details: error.message
    });
  }
});

/**
 * PUT /api/attendance/:attendanceId
 * Body: { incHours: number, isPresent: boolean, facultyId?: string }
 * Updates hours_present/absent/total_classes, status, and marked_by_faculty.
 */
router.put('/:attendanceId', async (req, res) => {
  const { attendanceId } = req.params;
  const { incHours, isPresent, facultyId } = req.body;

  if (typeof incHours !== 'number' || typeof isPresent !== 'boolean') {
    return res
      .status(400)
      .json({ error: 'Missing or invalid fields.' });
  }

  try {
    // fetch existing counts
    const [rows] = await pool.query(
      `SELECT hours_present, hours_absent, total_classes
         FROM attendance
        WHERE attendance_id = ?`,
      [attendanceId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No record with that id.' });
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

    const status = (hoursPresent / totalClasses) >= 0.75
      ? 'present'
      : 'absent';

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
        attendanceId,
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      error: 'Failed to update attendance',
      details: error.message
    });
  }
});

export default router;
