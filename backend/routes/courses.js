// routes/courses.js
import express from 'express';
import pool from '../db/connection.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.course_id,
        c.course_name,
        ca.faculty_id,
        CONCAT(f.first_name, ' ', f.last_name) AS faculty_name
      FROM courses c
      LEFT JOIN course_assignments ca ON c.course_id = ca.course_id
      LEFT JOIN faculty f ON ca.faculty_id = f.faculty_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

export default router;
