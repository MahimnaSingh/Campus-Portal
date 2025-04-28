import express from 'express';
import pool from '../db/connection.js'; // (adjust path if your db connection file is elsewhere)
const router = express.Router();

// Fetch all marks
router.get('/', async (req, res) => {
  try {
    const [marks] = await pool.query(
      `SELECT 
        m.mark_id,
        m.student_id,
        m.course_id,
        c.course_name,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        m.exam_type,
        m.marks_obtained,
        m.total_marks,
        m.exam_date
      FROM marks m
      LEFT JOIN courses c ON m.course_id = c.course_id
      LEFT JOIN students s ON m.student_id = s.student_id`
    );

    res.json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks', details: error.message });
  }
});

router.post('/update', async (req, res) => {
  const { updatedMarks } = req.body;

  try {
    for (const studentId in updatedMarks) {
      for (const courseId in updatedMarks[studentId]) {
        const marks = updatedMarks[studentId][courseId];

        // Update assignments marks
        if (marks.assignments !== undefined) {
          await pool.query(
            `UPDATE marks
             SET marks_obtained = ?
             WHERE student_id = ? AND course_id = ? AND exam_type = 'assignment'`,
            [marks.assignments, studentId, courseId]
          );
        }

        // Update midterm marks
        if (marks.midterm !== undefined) {
          await pool.query(
            `UPDATE marks
             SET marks_obtained = ?
             WHERE student_id = ? AND course_id = ? AND exam_type = 'midterm'`,
            [marks.midterm, studentId, courseId]
          );
        }

        // Update final marks
        if (marks.final !== undefined) {
          await pool.query(
            `UPDATE marks
             SET marks_obtained = ?
             WHERE student_id = ? AND course_id = ? AND exam_type = 'final'`,
            [marks.final, studentId, courseId]
          );
        }
      }
    }

    res.json({ message: 'Marks updated successfully' });
  } catch (error) {
    console.error('Error updating marks:', error);
    res.status(500).json({ error: 'Failed to update marks', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [marks] = await pool.query(
      `SELECT 
        m.mark_id,
        m.student_id,
        m.course_id,
        c.course_name,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        m.exam_type,
        m.marks_obtained,
        m.total_marks,
        m.exam_date
      FROM marks m
      LEFT JOIN courses c ON m.course_id = c.course_id
      LEFT JOIN students s ON m.student_id = s.student_id`
    );

    console.log('Fetched Marks:', marks); // 👈 Add this line to see output

    res.json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks', details: error.message });
  }
});


export default router;

