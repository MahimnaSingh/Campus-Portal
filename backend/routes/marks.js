// routes/marks.js
import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

/**
 * GET /api/marks
 * List all marks with course & student info
 */
router.get('/', async (req, res) => {
  try {
    const [marks] = await pool.query(`
      SELECT
        m.mark_id,
        m.student_id,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        m.course_id,
        c.course_name,
        m.exam_type,
        m.marks_obtained,
        m.total_marks,
        m.exam_date
      FROM marks m
      LEFT JOIN courses c  ON m.course_id  = c.course_id
      LEFT JOIN students s ON m.student_id = s.student_id
      ORDER BY m.mark_id
    `);
    res.json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks', details: error.message });
  }
});

/**
 * GET /api/marks/:markId
 * Fetch a single mark by its ID
 */
router.get('/:markId', async (req, res) => {
  const { markId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT
        m.mark_id,
        m.student_id,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        m.course_id,
        c.course_name,
        m.exam_type,
        m.marks_obtained,
        m.total_marks,
        m.exam_date
      FROM marks m
      LEFT JOIN courses c  ON m.course_id  = c.course_id
      LEFT JOIN students s ON m.student_id = s.student_id
      WHERE m.mark_id = ?
    `, [markId]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Mark not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching mark ${markId}:`, error);
    res.status(500).json({ error: 'Failed to fetch mark', details: error.message });
  }
});

/**
 * POST /api/marks
 * Create a new mark record
 */
router.post('/', async (req, res) => {
  const {
    student_id,
    course_id,
    exam_type,
    marks_obtained,
    total_marks,
    exam_date
  } = req.body;

  if (
    !student_id ||
    !course_id   ||
    !exam_type   ||
    marks_obtained == null ||
    total_marks  == null ||
    !exam_date
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(`
      INSERT INTO marks
        (student_id, course_id, exam_type, marks_obtained, total_marks, exam_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      student_id,
      course_id,
      exam_type,
      marks_obtained,
      total_marks,
      exam_date
    ]);
    res.status(201).json({ mark_id: result.insertId });
  } catch (error) {
    console.error('Error creating mark:', error);
    res.status(500).json({ error: 'Failed to create mark', details: error.message });
  }
});

/**
 * PUT /api/marks/:markId
 * Update marks_obtained and/or total_marks for an existing mark
 */
router.put('/:markId', async (req, res) => {
  const { markId } = req.params;
  const { marks_obtained, total_marks } = req.body;

  if (marks_obtained == null && total_marks == null) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    // Build SET clause dynamically
    const fields = [];
    const values = [];
    if (marks_obtained != null) {
      fields.push('marks_obtained = ?');
      values.push(marks_obtained);
    }
    if (total_marks != null) {
      fields.push('total_marks = ?');
      values.push(total_marks);
    }
    values.push(markId);

    const sql = `
      UPDATE marks
      SET ${fields.join(', ')}
      WHERE mark_id = ?
    `;
    await pool.query(sql, values);

    res.json({ success: true });
  } catch (error) {
    console.error(`Error updating mark ${markId}:`, error);
    res.status(500).json({ error: 'Failed to update mark', details: error.message });
  }
});

/**
 * DELETE /api/marks/:markId
 * Remove a mark record
 */
router.delete('/:markId', async (req, res) => {
  const { markId } = req.params;
  try {
    await pool.query('DELETE FROM marks WHERE mark_id = ?', [markId]);
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting mark ${markId}:`, error);
    res.status(500).json({ error: 'Failed to delete mark', details: error.message });
  }
});

export default router;
