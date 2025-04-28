
import express from 'express';
import pool from '../db/connection.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, CONCAT(f.first_name, ' ', f.last_name) as faculty_name,
       d.department_name
       FROM notices n 
       LEFT JOIN faculty f ON n.issued_by = f.faculty_id
       LEFT JOIN departments d ON n.department_id = d.department_id`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notices', details: error.message });
  }
});

export default router;
