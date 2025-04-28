
import express from 'express';
import pool from '../db/connection.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT f.*, d.department_name FROM faculty f LEFT JOIN departments d ON f.department_id = d.department_id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch faculty', details: error.message });
  }
});

export default router;
