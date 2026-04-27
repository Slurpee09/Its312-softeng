import db from "../config/db.js";
import { logActivity } from "../utils/activityLogger.js";

export const getAlumniList = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, college_id, gender, email, program_name, batch, success_story, picture, created_at
       FROM alumni
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching alumni list:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createAlumniEntry = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [applicationRows] = await db.query(
      `SELECT id
       FROM applications
       WHERE user_id = ? AND LOWER(COALESCE(status, '')) = 'accepted'
       LIMIT 1`,
      [userId]
    );

    if (!applicationRows.length) {
      return res.status(403).json({ message: "Only accepted applicants can add alumni" });
    }

    const {
      full_name,
      college_id,
      gender,
      batch,
      email,
      picture,
      success_story,
      program_name,
    } = req.body;

    const uploadedPicture = req.file ? `uploads/alumni/${req.file.filename}` : null;
    const pictureValue = uploadedPicture || picture || null;

    if (!full_name || !email) {
      return res.status(400).json({ message: "Full name and email are required" });
    }

    const [result] = await db.query(
      `INSERT INTO alumni (full_name, college_id, gender, batch, email, picture, success_story, program_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        college_id || null,
        gender || null,
        batch || null,
        email,
        pictureValue,
        success_story || null,
        program_name || null,
      ]
    );

    const [rows] = await db.query(`SELECT * FROM alumni WHERE id = ?`, [result.insertId]);
    const created = rows[0];

    await logActivity(userId, req.user.role || "user", "create_alumni", `Created alumni entry ${created.id}`);

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating alumni entry:", err);
    res.status(500).json({ message: "Server error" });
  }
};
