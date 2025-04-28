import express from "express";
import pool from "../db/connection.js";

const router = express.Router();

// ------------------------------
// GET all subjects with faculty
// ------------------------------
router.get("/subjects", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.course_id AS courseId,
        c.course_name AS courseName,
        CONCAT(f.first_name, ' ', f.last_name) AS facultyName,
        f.faculty_id AS facultyId
      FROM courses c
      LEFT JOIN course_assignments ca ON ca.course_id = c.course_id
      LEFT JOIN faculty f ON ca.faculty_id = f.faculty_id
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects." });
  }
});

// ------------------------------
// GET important topics for a course
// ------------------------------
router.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    const [topics] = await pool.query(
      `
      SELECT 
        topic_id,
        topic,
        description,
        important_questions,
        date_added
      FROM important_topics
      WHERE course_id = ?
      ORDER BY date_added DESC
      `,
      [courseId]
    );

    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Failed to fetch important topics." });
  }
});

// ------------------------------
// POST upload a new important topic
// ------------------------------
router.post("/", async (req, res) => {
  const { courseId, facultyId, topic, description, importantQuestions } = req.body;

  if (!courseId || !facultyId || !topic) {
    return res.status(400).json({ error: "Required fields missing." });
  }

  try {
    await pool.query(
      `
      INSERT INTO important_topics (course_id, faculty_id, topic, description, important_questions)
      VALUES (?, ?, ?, ?, ?)
      `,
      [courseId, facultyId, topic, description || "", importantQuestions || ""]
    );

    res.json({ message: "Topic uploaded successfully." });
  } catch (error) {
    console.error("Error uploading topic:", error);
    res.status(500).json({ error: "Failed to upload topic." });
  }
});

export default router;
