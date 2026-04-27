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

    let recentApplicationRows = [];
    try {
      const [rows] = await db.query(
        `SELECT id, COALESCE(full_name, '') AS full_name, COALESCE(email, '') AS email, COALESCE(program_name, 'Not Specified') AS program_name, COALESCE(status, 'Pending') AS status, created_at
         FROM applications
         ORDER BY created_at DESC
         LIMIT 6`
      );
      recentApplicationRows = rows;
    } catch (e) {
      console.error("Recent applications query failed:", e);
      warnings.push("recent_applications_query_failed");
    }

    let courseEnrollmentRows = [];
    try {
      const [rows] = await db.query(
        `SELECT COALESCE(program_name, 'Not Specified') AS program_name, COUNT(*) AS count
         FROM applications
         WHERE LOWER(COALESCE(status, '')) = 'accepted'
         GROUP BY COALESCE(program_name, 'Not Specified')
         ORDER BY count DESC, program_name ASC`
      );
      courseEnrollmentRows = rows;
    } catch (e) {
      console.error("Course enrollment query failed:", e);
      warnings.push("course_enrollment_query_failed");
    }

    let courseGraduateRows = [];
    try {
      const [rows] = await db.query(
        `SELECT COALESCE(program_name, 'Not Specified') AS program_name, COUNT(*) AS count
         FROM alumni
         GROUP BY COALESCE(program_name, 'Not Specified')
         ORDER BY count DESC, program_name ASC`
      );
      courseGraduateRows = rows;
    } catch (e) {
      console.error("Course graduates query failed:", e);
      warnings.push("course_graduates_query_failed");
    }

    let enrollmentYearRows = [];
    try {
      const [rows] = await db.query(
        `SELECT YEAR(created_at) AS academic_year, COUNT(*) AS count
         FROM applications
         WHERE LOWER(COALESCE(status, '')) = 'accepted' AND created_at IS NOT NULL
         GROUP BY YEAR(created_at)
         ORDER BY academic_year ASC`
      );
      enrollmentYearRows = rows;
    } catch (e) {
      console.error("Enrollment trend query failed:", e);
      warnings.push("enrollment_trend_query_failed");
    }

    let graduateYearRows = [];
    try {
      const [rows] = await db.query(
        `SELECT CASE
            WHEN batch REGEXP '^[0-9]{4}' THEN CAST(LEFT(batch, 4) AS UNSIGNED)
            ELSE YEAR(created_at)
         END AS academic_year, COUNT(*) AS count
         FROM alumni
         WHERE created_at IS NOT NULL OR batch IS NOT NULL
         GROUP BY academic_year
         ORDER BY academic_year ASC`
      );
      graduateYearRows = rows;
    } catch (e) {
      console.error("Graduate trend query failed:", e);
      warnings.push("graduate_trend_query_failed");
    }

    let courseEnrollmentByYearRows = [];
    try {
      const [rows] = await db.query(
        `SELECT COALESCE(program_name, 'Not Specified') AS program_name,
                YEAR(created_at) AS academic_year,
                COUNT(*) AS count
         FROM applications
         WHERE LOWER(COALESCE(status, '')) = 'accepted'
           AND created_at IS NOT NULL
         GROUP BY COALESCE(program_name, 'Not Specified'), YEAR(created_at)
         ORDER BY COALESCE(program_name, 'Not Specified') ASC, academic_year ASC`
      );
      courseEnrollmentByYearRows = rows;
    } catch (e) {
      console.error("Course enrollment by year query failed:", e);
      warnings.push("course_enrollment_year_query_failed");
    }

    let courseGraduateByYearRows = [];
    try {
      const [rows] = await db.query(
        `SELECT COALESCE(program_name, 'Not Specified') AS program_name,
                CASE
                  WHEN batch REGEXP '^[0-9]{4}' THEN CAST(LEFT(batch, 4) AS UNSIGNED)
                  ELSE YEAR(created_at)
                END AS academic_year,
                COUNT(*) AS count
         FROM alumni
         WHERE program_name IS NOT NULL
           AND (created_at IS NOT NULL OR batch IS NOT NULL)
         GROUP BY COALESCE(program_name, 'Not Specified'), academic_year
         ORDER BY COALESCE(program_name, 'Not Specified') ASC, academic_year ASC`
      );
      courseGraduateByYearRows = rows;
    } catch (e) {
      console.error("Course graduates by year query failed:", e);
      warnings.push("course_graduate_year_query_failed");
    }

    const sortedEnrollmentYears = (enrollmentYearRows || [])
      .map(row => ({ year: Number(row.academic_year), count: Number(row.count || 0) }))
      .filter(row => Number.isFinite(row.year))
      .sort((a, b) => a.year - b.year);

    const currentEnrollmentCount = sortedEnrollmentYears.at(-1)?.count || 0;
    const previousEnrollmentCount = sortedEnrollmentYears.at(-2)?.count || 0;
    const enrollmentDelta = currentEnrollmentCount - previousEnrollmentCount;
    const enrollmentDirection = enrollmentDelta > 0 ? "increase" : enrollmentDelta < 0 ? "decrease" : "flat";
    const enrollmentPercentChange = previousEnrollmentCount > 0
      ? Math.round((Math.abs(enrollmentDelta) / previousEnrollmentCount) * 100)
      : null;

    const courseReportsMap = new Map();
    (courseEnrollmentRows || []).forEach(row => {
      const program = row.program_name || "Not Specified";
      courseReportsMap.set(program, {
        program,
        enrollments: Number(row.count || 0),
        graduates: 0,
      });
    });
    (courseGraduateRows || []).forEach(row => {
      const program = row.program_name || "Not Specified";
      const existing = courseReportsMap.get(program) || {
        program,
        enrollments: 0,
        graduates: 0,
      };
      existing.graduates = Number(row.count || 0);
      courseReportsMap.set(program, existing);
    });

    const courseReports = Array.from(courseReportsMap.values()).sort((a, b) => {
      const totalDiff = (b.enrollments + b.graduates) - (a.enrollments + a.graduates);
      if (totalDiff !== 0) return totalDiff;
      return a.program.localeCompare(b.program);
    });

    const courseYearlyReportsMap = new Map();
    (courseEnrollmentByYearRows || []).forEach(row => {
      const program = row.program_name || "Not Specified";
      const year = Number(row.academic_year);
      if (!Number.isFinite(year)) return;
      const key = `${program}__${year}`;
      courseYearlyReportsMap.set(key, {
        program,
        year,
        enrollments: Number(row.count || 0),
        graduates: 0,
      });
    });

    (courseGraduateByYearRows || []).forEach(row => {
      const program = row.program_name || "Not Specified";
      const year = Number(row.academic_year);
      if (!Number.isFinite(year)) return;
      const key = `${program}__${year}`;
      const existing = courseYearlyReportsMap.get(key) || {
        program,
        year,
        enrollments: 0,
        graduates: 0,
      };
      existing.graduates = Number(row.count || 0);
      courseYearlyReportsMap.set(key, existing);
    });

    const courseYearlyReports = Array.from(courseYearlyReportsMap.values()).sort((a, b) => {
      const programDiff = a.program.localeCompare(b.program);
      if (programDiff !== 0) return programDiff;
      return a.year - b.year;
    });

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
      recentApplications: recentApplicationRows.length
        ? recentApplicationRows.map(row => ({
            id: row.id,
            full_name: row.full_name,
            email: row.email,
            program_name: row.program_name,
            status: row.status,
            created_at: row.created_at,
          }))
        : [],
      courseReports,
      courseYearlyReports,
      enrollmentByYear: sortedEnrollmentYears.map(row => ({ year: row.year, count: row.count })),
      graduatesByYear: (graduateYearRows || [])
        .map(row => ({ year: Number(row.academic_year), count: Number(row.count || 0) }))
        .filter(row => Number.isFinite(row.year))
        .sort((a, b) => a.year - b.year),
      enrollmentTrendSummary: {
        currentYear: sortedEnrollmentYears.at(-1)?.year || null,
        previousYear: sortedEnrollmentYears.at(-2)?.year || null,
        currentCount: currentEnrollmentCount,
        previousCount: previousEnrollmentCount,
        delta: enrollmentDelta,
        direction: enrollmentDirection,
        percentChange: enrollmentPercentChange,
      },
      warnings,
    });
  } catch (err) {
    console.error("Dashboard stats unexpected error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
