// backend/routes/studyMaterials.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import pool from '../db/connection.js';

console.log("🔌 studyMaterials router loaded");

const router = express.Router();

// Ensure uploads directory exists
const UPLOAD_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// GET materials for a course
router.get('/:courseId', async (req, res) => {
  console.log("GET /api/study-materials/:courseId", req.params.courseId);
  try {
    const [rows] = await pool.query(
      `SELECT material_id, material_title, file_url, file_type
         FROM study_materials
        WHERE course_id = ?
        ORDER BY upload_date DESC`,
      [req.params.courseId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ error: 'Failed to fetch study materials.' });
  }
});

// POST upload a new material
router.post(
  '/upload',
  (req, res, next) => {
    console.log("🛎️ Received request to /upload");
    next();
  },
  upload.single('file'),
  async (req, res) => {
    console.log('Upload payload:', req.body, req.file);
    if (!req.file) {
      console.error('🚨 No file attached');
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const { courseId, facultyId, title } = req.body;
    if (!courseId || !facultyId || !title) {
      console.error('🚨 Missing fields', req.body);
      return res.status(400).json({
        error: 'courseId, facultyId and title are required.',
      });
    }

    try {
      // derive extension instead of full MIME type
      const ext = path.extname(req.file.originalname).slice(1) || 'bin';
      const fileUrl = `/uploads/${req.file.filename}`;

      const [result] = await pool.query(
        `INSERT INTO study_materials
           (course_id, faculty_id, material_title, file_type, file_url, upload_date)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [courseId, facultyId, title, ext, fileUrl]
      );

      console.log('Inserted material_id=', result.insertId);
      res.json({ material_id: result.insertId, file_url: fileUrl });
    } catch (err) {
      console.error('❌ Error in POST /upload:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

export default router;
