// routes/adminDashboard.js
import express from "express";
import { db } from "../server.js";
import { authenticateJWT } from "../utils/jwt.js";

const router = express.Router();

// JWT Authentication Middleware for dashboard
router.use(authenticateJWT);

// Admin role check
router.use((req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
  next();
});

// GET /admin/dashboard-stats
router.get("/dashboard-stats", async (req, res) => {
  const warnings = [];
  try {
    // Use per-query try/catch so we can pinpoint failing queries and still return defaults
    let totalRows = [{ total: 0 }];
    try {
      const [rows] = await db.query("SELECT COUNT(*) AS total FROM applications");
      totalRows = rows;
    } catch (e) {
      console.error("Total applicants query failed:", e);
      warnings.push("total_query_failed");
    }

    let statusRows = [];
    try {
      const [rows] = await db.query(
        `SELECT LOWER(status) AS status, COUNT(*) AS count
         FROM applications
         GROUP BY LOWER(status)`
      );
      statusRows = rows;
    } catch (e) {
      console.error("Status breakdown query failed:", e);
      warnings.push("status_query_failed");
    }

    // Count applications that have uploaded files but those files are not verified in the verified_files table
    let incompleteRows = [{ count: 0 }];
    try {
      const [rows] = await db.query(
        `SELECT COUNT(DISTINCT a.id) AS count
         FROM applications a
         WHERE (a.letter_of_intent IS NOT NULL AND NOT EXISTS (SELECT 1 FROM verified_files vf WHERE vf.application_id = a.id AND vf.file_key = 'letter_of_intent'))
            OR (a.resume IS NOT NULL AND NOT EXISTS (SELECT 1 FROM verified_files vf WHERE vf.application_id = a.id AND vf.file_key = 'resume'))
            OR (a.picture IS NOT NULL AND NOT EXISTS (SELECT 1 FROM verified_files vf WHERE vf.application_id = a.id AND vf.file_key = 'picture'))`
      );
      incompleteRows = rows;
    } catch (e) {
      console.error("Incomplete requirements query failed:", e);
      warnings.push("incomplete_query_failed");
    }

    // Count individual uploaded documents that are awaiting verification (unverified uploaded files)
    let docsAwaitingRows = [{ count: 0 }];
    try {
      const [rows] = await db.query(
        `SELECT COUNT(*) AS count FROM (
           SELECT a.id, 'letter_of_intent' AS file_key FROM applications a
             WHERE a.letter_of_intent IS NOT NULL AND NOT EXISTS (SELECT 1 FROM verified_files vf WHERE vf.application_id = a.id AND vf.file_key = 'letter_of_intent')
           UNION ALL
           SELECT a.id, 'resume' AS file_key FROM applications a
             WHERE a.resume IS NOT NULL AND NOT EXISTS (SELECT 1 FROM verified_files vf WHERE vf.application_id = a.id AND vf.file_key = 'resume')
           UNION ALL
           SELECT a.id, 'picture' AS file_key FROM applications a
             WHERE a.picture IS NOT NULL AND NOT EXISTS (SELECT 1 FROM verified_files vf WHERE vf.application_id = a.id AND vf.file_key = 'picture')
         ) t`
      );
      docsAwaitingRows = rows;
    } catch (e) {
      console.error("Docs awaiting review query failed:", e);
      warnings.push("docs_awaiting_query_failed");
    }

    let programRows = [];
    try {
      const [rows] = await db.query(
        `SELECT program_name, COUNT(*) AS count
         FROM applications
         GROUP BY program_name`
      );
      programRows = rows;
    } catch (e) {
      console.error("Program distribution query failed:", e);
      warnings.push("program_query_failed");
    }

    let monthlyRows = [];
    try {
      const [rows] = await db.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
         FROM applications
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      );
      monthlyRows = rows;
    } catch (e) {
      console.error("Monthly applicants query failed:", e);
      warnings.push("monthly_query_failed");
    }

    // Map statuses dynamically
    const statusCounts = {};
    (statusRows || []).forEach(s => {
      if (s && s.status) statusCounts[s.status] = s.count;
    });

    res.json({
      totalApplicants: totalRows[0]?.total || 0,
      accepted: statusCounts["accepted"] || 0,
      rejected: statusCounts["rejected"] || 0,
      pendingVerifications: statusCounts["pending"] || 0,
      incompleteRequirements: incompleteRows[0]?.count || 0,
      docsAwaiting: docsAwaitingRows[0]?.count || 0,
      programDistribution: programRows.length
        ? programRows.map(p => ({ program: p.program_name || "N/A", count: p.count }))
        : [],
      monthlyApplicants: monthlyRows.length
        ? monthlyRows.map(m => ({ month: m.month, count: m.count }))
        : [],
      warnings,
    });
  } catch (err) {
    console.error("Dashboard stats unexpected error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
