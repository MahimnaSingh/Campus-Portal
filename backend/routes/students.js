
import express from 'express';
import pool from '../db/connection.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, CONCAT(s.first_name, ' ', s.last_name) as name,
       d.department_name, deg.degree_name
       FROM students s 
       LEFT JOIN departments d ON s.department_id = d.department_id
       LEFT JOIN degrees deg ON s.degree_id = deg.degree_id`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT s.*, CONCAT(s.first_name, ' ', s.last_name) as name,
       d.department_name, deg.degree_name
       FROM students s 
       LEFT JOIN departments d ON s.department_id = d.department_id
       LEFT JOIN degrees deg ON s.degree_id = deg.degree_id
       WHERE s.student_id = ?`,
      [req.params.id]
    );
    if (students.length > 0) {
      const [advisors] = await pool.query(
        `SELECT fa.*, CONCAT(f.first_name, ' ', f.last_name) as faculty_name,
        f.email as faculty_email
        FROM faculty_advisor fa
        JOIN faculty f ON fa.faculty_id = f.faculty_id
        WHERE fa.section = ? AND fa.degree_id = ?`,
        [students[0].section, students[0].degree_id]
      );
      const studentData = students[0];
      if (advisors.length > 0) {
        studentData.faculty_advisor_name = advisors[0].faculty_name;
        studentData.faculty_advisor_id = advisors[0].faculty_id;
        studentData.academic_advisor_email = advisors[0].faculty_email;
      }
      res.json(studentData);
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student profile', details: error.message });
  }
});

router.get("/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM students WHERE student_id = ?`,
      [studentId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
