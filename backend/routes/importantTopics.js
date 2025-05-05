// routes/importantTopics.js
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
        c.course_id   AS courseId,
        c.course_name AS courseName,
        CONCAT(f.first_name, ' ', f.last_name) AS facultyName,
        f.faculty_id  AS facultyId
      FROM courses c
      LEFT JOIN course_assignments ca ON ca.course_id = c.course_id
      LEFT JOIN faculty f            ON ca.faculty_id = f.faculty_id
    `);
    res.json(rows);
  } catch (err) {
    console.error("📚 Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects." });
  }
});

// ---------------------------------------
// GET important topics for a given course
// ---------------------------------------
router.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;
  try {
    const [topics] = await pool.query(
      `
      SELECT
        topic_id,
        topic_title       AS topic,
        topic_description AS description,
        important_questions,
        DATE_FORMAT(date_posted, '%Y-%m-%d %H:%i:%s') AS date_added
      FROM important_topics
      WHERE course_id = ?
      ORDER BY date_posted DESC
      `,
      [courseId]
    );
    res.json(topics);
  } catch (err) {
    console.error(`👀 Error fetching topics for courseId=${courseId}:`, err);
    res.status(500).json({ error: "Failed to fetch important topics." });
  }
});

// ------------------------------
// POST a new important topic
// ------------------------------
router.post("/", async (req, res) => {
  const { courseId, facultyId, topic, description, importantQuestions } = req.body;

  if (!courseId || !facultyId || !topic) {
    return res
      .status(400)
      .json({ error: "courseId, facultyId and topic are required." });
  }

  try {
    // 1) insert the new row
    const [result] = await pool.query(
      `
      INSERT INTO important_topics
        (course_id, faculty_id, topic_title, topic_description, important_questions)
      VALUES (?, ?, ?, ?, ?)
      `,
      [courseId, facultyId, topic, description || "", importantQuestions || ""]
    );

    // 2) fetch it back so we can return the same shape as our GET
    const [newRows] = await pool.query(
      `
      SELECT
        topic_id,
        topic_title       AS topic,
        topic_description AS description,
        important_questions,
        DATE_FORMAT(date_posted, '%Y-%m-%d %H:%i:%s') AS date_added
      FROM important_topics
      WHERE topic_id = ?
      `,
      [result.insertId]
    );

    // if for some reason there’s no row back, bail out
    if (!newRows.length) {
      console.warn("⚠️ Insert succeeded but could not re-select the row:", result);
      return res
        .status(500)
        .json({ error: "Topic was inserted but cannot retrieve it." });
    }

    res.status(201).json(newRows[0]);
  } catch (err) {
    console.error("🚨 Error inserting new topic:", err);
    res.status(500).json({ error: "Failed to upload topic." });
  }
});

export default router;
