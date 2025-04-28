// routes/studyMaterials.js
import express from 'express';
import pool from '../db/connection.js';
const router = express.Router();

router.get('/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT material_id, title, file_link, file_type
       FROM study_materials
       WHERE course_id = ?
       ORDER BY uploaded_at DESC`,
      [courseId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching study materials:', err);
    res.status(500).json({ error: 'Failed to fetch study materials.' });
  }
});

router.post('/upload', async (req, res) => {
  const { courseId, facultyId, title, fileType, fileLink } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO study_materials
        (course_id, faculty_id, title, file_type, file_link)
       VALUES (?, ?, ?, ?, ?)`,
      [courseId, facultyId, title, fileType, fileLink]
    );
    res.json({ material_id: result.insertId });
  } catch (err) {
    console.error('Error uploading study material:', err);
    res.status(500).json({ error: 'Failed to upload study material.' });
  }
});

export default router;
