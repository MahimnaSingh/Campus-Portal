// server.js

import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import pool from './db/connection.js';

// Routers
import departmentsRouter from './routes/departments.js';
import coursesRouter from './routes/courses.js';
import studentsRouter from './routes/students.js';
import facultyRouter from './routes/faculty.js';
import attendanceRouter from './routes/attendance.js';
import marksRouter from './routes/marks.js';
import noticesRouter from './routes/notices.js';
import loginRouter from './routes/login.js';
import timetableRouter from './routes/timetable.js'; // ✅ imported

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/** ROUTES **/

// Test Route
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Database connected successfully', data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Existing Routers
app.use('/api/departments', departmentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/marks', marksRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/login', loginRouter);

// Timetable Router ✅ (for your timetable page)
app.use('/api/timetable', timetableRouter);

// ================================
// ✨ NEW ROUTES (Exams Related APIs)
// ================================

// 1. Fetch all Exams
app.get('/api/exams', async (req, res) => {
  try {
    const [exams] = await pool.query('SELECT * FROM exams');
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// 2. Fetch Subjects for specific Exam
app.get('/api/exam-subjects/:examId', async (req, res) => {
  const { examId } = req.params;
  try {
    const [subjects] = await pool.query(`
      SELECT es.course_id, c.course_name, es.exam_date, es.exam_time, es.room 
      FROM exam_subjects es
      JOIN courses c ON es.course_id = c.course_id
      WHERE es.exam_id = ?
    `, [examId]);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching exam subjects:', error);
    res.status(500).json({ error: 'Failed to fetch exam subjects' });
  }
});

// 3. Fetch Students with Fee Status
app.get('/api/students-with-fees', async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        s.student_id, 
        CONCAT(s.first_name, ' ', s.last_name) AS name,
        s.section,
        CASE 
          WHEN p.payment_status = 'successful' THEN 'paid' 
          ELSE 'pending'
        END AS fee_status
      FROM students s
      LEFT JOIN payments p ON s.student_id = p.student_id
    `);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students with fees:', error);
    res.status(500).json({ error: 'Failed to fetch students with fees' });
  }
});

// 4. Fetch all Sections
app.get('/api/sections', async (req, res) => {
  try {
    const [sections] = await pool.query('SELECT DISTINCT section FROM students');
    res.json(sections.map(sec => ({
      id: sec.section,
      name: `Section ${sec.section}`
    })));
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// ================================
// ✨ END NEW ROUTES
// ================================

// Server Listen
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database connection parameters:`);
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`User: ${process.env.DB_USER || 'root'}`);
  console.log(`Database: ${process.env.DB_NAME || 'DBMS'}`);
});
