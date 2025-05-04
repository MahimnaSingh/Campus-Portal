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
import timetableRouter from './routes/timetable.js';
import importantTopicsRouter from './routes/importantTopics.js';
import studyMaterialsRouter from './routes/studyMaterials.js';
import enrollmentsRouter from './routes/enrollments.js';
import facultyAdvisorRouter from './routes/facultyAdvisor.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — only allow your React app origin, and allow credentials
app.use(cors({
  origin: 'http://localhost:8080',   // <- your frontend origin
  credentials: true,                 // <- enable Set-Cookie
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
// Handle preflight for all routes
app.options('*', cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

// JSON body parser
app.use(express.json());

// Health-check
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Database connected successfully', data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Mount routers
app.use('/api/departments', departmentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/marks', marksRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/login', loginRouter);
app.use('/api/timetable', timetableRouter);
app.use('/api/important-topics', importantTopicsRouter);
app.use('/api/study-materials', studyMaterialsRouter);
app.use('/api/enrollments', enrollmentsRouter);
app.use('/api/faculty-advisor', facultyAdvisorRouter);

// Exams
app.get('/api/exams', async (req, res) => {
  try {
    const [exams] = await pool.query('SELECT * FROM exams');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

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
    res.status(500).json({ error: 'Failed to fetch exam subjects' });
  }
});

// Students with fee status
app.get('/api/students-with-fees', async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) AS name,
        s.section,
        CASE WHEN p.payment_status = 'successful' THEN 'paid' ELSE 'pending' END AS fee_status
      FROM students s
      LEFT JOIN payments p ON s.student_id = p.student_id
    `);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students with fees' });
  }
});

// Sections
app.get('/api/sections', async (req, res) => {
  try {
    const [sections] = await pool.query('SELECT DISTINCT section FROM students');
    res.json(sections.map(sec => ({
      id: sec.section,
      name: `Section ${sec.section}`
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Faculty profile (example)
app.get('/api/faculty/profile', async (req, res) => {
  // Assuming you have an auth middleware that sets req.user.facultyId
  const facultyId = req.user?.facultyId;
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM faculty WHERE faculty_id = ?', [facultyId]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Optional: custom faculty courses endpoint
app.get('/api/faculty/courses', async (req, res) => {
  const facultyId = req.query.facultyId;
  try {
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE faculty_id = ?',
      [facultyId]
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
