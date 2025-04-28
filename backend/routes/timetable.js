// routes/timetable.js

import express from "express";
import pool from "../db/connection.js";

const router = express.Router();

// GET /api/timetable/generate
router.get("/generate", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.course_name, 
        ca.faculty_id, 
        f.first_name, 
        f.last_name
      FROM course_assignments ca
      INNER JOIN faculty f ON ca.faculty_id = f.faculty_id
      INNER JOIN courses c ON ca.course_id = c.course_id
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ error: 'Failed to generate timetable' });
  }
});

export default router;
