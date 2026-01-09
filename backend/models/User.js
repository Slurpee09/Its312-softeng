// models/User.js
import db from "../config/db.js";
import bcrypt from "bcrypt";

const User = {
  // -----------------------------
  // Find user by email
  // -----------------------------
  findByEmail: async (email) => {
    if (!email) return null;
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      return rows[0] || null;
    } catch (err) {
      console.error("findByEmail error:", err);
      throw err;
    }
  },

  // -----------------------------
  // Find user by ID
  // -----------------------------
  findById: async (id) => {
    if (!id) return null;
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (err) {
      console.error("findById error:", err);
      throw err;
    }
  },

  // -----------------------------
  // Find user by Google ID
  // -----------------------------
  findByGoogleId: async (googleId) => {
    if (!googleId) return null;
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE google_id = ?", [googleId]);
      return rows[0] || null;
    } catch (err) {
      console.error("findByGoogleId error:", err);
      throw err;
    }
  },

  // -----------------------------
  // Create new user
  // -----------------------------
  createUser: async ({ fullname, email, password, role = "user", googleId = null }) => {
    try {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      const [result] = await db.query(
        "INSERT INTO users (fullname, email, password, role, google_id) VALUES (?, ?, ?, ?, ?)",
        [fullname, email, hashedPassword, role, googleId]
      );

      const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
      return rows[0] || null;
    } catch (err) {
      console.error("createUser error:", err);
      throw err;
    }
  },

  // -----------------------------
  // Update password by email
  // -----------------------------
  updatePassword: async (email, newHashedPassword) => {
    if (!email || !newHashedPassword) {
      throw new Error("Email and new password required");
    }
    try {
      const [result] = await db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [newHashedPassword, email]
      );
      return result;
    } catch (err) {
      console.error("updatePassword error:", err);
      throw err;
    }
  },

  // -----------------------------
  // Update Google ID for existing user by email
  // -----------------------------
  updateGoogleId: async (email, googleId) => {
    if (!email || !googleId) {
      throw new Error("Email and Google ID are required");
    }
    try {
      const [result] = await db.query(
        "UPDATE users SET google_id = ? WHERE email = ?",
        [googleId, email]
      );
      return result;
    } catch (err) {
      console.error("updateGoogleId error:", err);
      throw err;
    }
  },
};

export default User;
