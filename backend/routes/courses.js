import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.course_id, 
        c.course_name, 
        c.semester, 
        c.credits, 
        d.department_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.department_id
    `);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch courses', 
      details: error.message 
    });
  }
});

export default router;
