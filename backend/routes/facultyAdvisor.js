import express from 'express';
import pool from '../db/connection.js';
const router = express.Router();

// GET /api/faculty-advisor?section=…&degree=…
router.get('/', async (req, res) => {
  const { section, degreeId } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT f.faculty_id,
              CONCAT(f.first_name,' ',f.last_name) AS name,
              f.email, f.phone, fa.section, fa.degree_id
       FROM faculty_advisor fa
       JOIN faculty f ON fa.faculty_id = f.faculty_id
       WHERE fa.section = ? AND fa.degree_id = ?`,
      [section, degreeId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch class teacher' });
  }
});

export default router;
