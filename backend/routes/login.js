import express from 'express';
import pool from '../db/connection.js';
const router = express.Router();

// Same student, faculty, and generic login endpoints as in the monolithic server.js
// ... keep existing code for login endpoints here, just change res and pool context

// Updated Student login endpoint with proper authentication
router.post('/student', async (req, res) => {
  const { studentId, password } = req.body;
  
  try {
    // First check if the credentials exist in login_credentials table
    const [credentials] = await pool.query(
      'SELECT * FROM login_credentials WHERE user_id = ? AND role = ?', 
      [studentId, 'student']
    );
    
    if (credentials.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid student ID or student not found' 
      });
    }
    
    // Check if password matches
    // Note: This is currently checking the raw password, ideally should use proper hashing
    if (credentials[0].password_hash !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }
    
    // Get student data if authentication is successful
    const [students] = await pool.query(
      `SELECT s.*, 
       CONCAT(s.first_name, ' ', s.last_name) as name,
       d.department_name, 
       deg.degree_name
       FROM students s 
       LEFT JOIN departments d ON s.department_id = d.department_id
       LEFT JOIN degrees deg ON s.degree_id = deg.degree_id
       WHERE s.student_id = ?`,
      [studentId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student data not found' 
      });
    }
    
    // Get faculty advisor information
    const [advisors] = await pool.query(
      `SELECT fa.*, 
       CONCAT(f.first_name, ' ', f.last_name) as faculty_name,
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
    
    // Update last login time
    await pool.query(
      'UPDATE login_credentials SET last_login = NOW() WHERE user_id = ?',
      [studentId]
    );
    
    res.json({ 
      success: true, 
      user: studentData,
      role: 'student'
    });
    
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login', 
      details: error.message 
    });
  }
});

// Updated Faculty login endpoint with proper authentication
router.post('/faculty', async (req, res) => {
  const { facultyId, password } = req.body;
  
  try {
    // First check if the credentials exist in login_credentials table
    const [credentials] = await pool.query(
      'SELECT * FROM login_credentials WHERE user_id = ? AND role = ?', 
      [facultyId, 'faculty']
    );
    
    if (credentials.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid faculty ID or faculty not found' 
      });
    }
    
    // Check if password matches
    // Note: This is currently checking the raw password, ideally should use proper hashing
    if (credentials[0].password_hash !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }
    
    // Get faculty data if authentication is successful
    const [faculty] = await pool.query(
      `SELECT f.*, d.department_name 
       FROM faculty f 
       LEFT JOIN departments d ON f.department_id = d.department_id 
       WHERE f.faculty_id = ?`,
      [facultyId]
    );
    
    if (faculty.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Faculty data not found' 
      });
    }
    
    // Update last login time
    await pool.query(
      'UPDATE login_credentials SET last_login = NOW() WHERE user_id = ?',
      [facultyId]
    );
    
    res.json({ 
      success: true, 
      user: faculty[0],
      role: 'faculty'
    });
  } catch (error) {
    console.error('Faculty login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login', 
      details: error.message 
    });
  }
});

// Generic login endpoint (kept for compatibility)
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Get user credentials
    const [users] = await pool.query(
      'SELECT * FROM login_credentials WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify the password
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    // Fetch appropriate user data based on role
    let userData;
    if (user.role === 'student') {
      const [students] = await pool.query(
        `SELECT s.*, 
         CONCAT(s.first_name, ' ', s.last_name) as name,
         d.department_name, 
         deg.degree_name
         FROM students s 
         LEFT JOIN departments d ON s.department_id = d.department_id
         LEFT JOIN degrees deg ON s.degree_id = deg.degree_id
         WHERE s.student_id = ?`,
        [user.user_id]
      );
      
      if (students.length > 0) {
        userData = students[0];
      }
    } else if (user.role === 'faculty') {
      const [facultyMembers] = await pool.query(
        `SELECT f.*, d.department_name 
         FROM faculty f 
         LEFT JOIN departments d ON f.department_id = d.department_id 
         WHERE f.faculty_id = ?`,
        [user.user_id]
      );
      
      if (facultyMembers.length > 0) {
        userData = facultyMembers[0];
      }
    }
    
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User data not found' });
    }
    
    // Update last login time
    await pool.query(
      'UPDATE login_credentials SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );
    
    res.json({ 
      success: true, 
      user: userData,
      role: user.role
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
});

export default router;
