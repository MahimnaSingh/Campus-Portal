import express from 'express';
import pool from '../db/connection.js';
const router = express.Router();

// GET /api/enrollments?studentId=…
router.get('/', async (req, res) => {
  const { studentId } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT e.course_id
       FROM enrollments e
       WHERE e.student_id = ? AND e.status = 'enrolled'`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

export default router;
