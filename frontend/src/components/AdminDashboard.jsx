// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, Users, Settings, LogOut, Users as UsersIcon, Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import api from "../api/axios";

import logoImg from "../assets/ETEEAP_LOGO.png";

import AdminApplicants from "./AdminApplicants";
import AdminActivityLog from "./AdminActivityLog";
import AdminSettings from "./AdminSettings";
import AdminAlumni from "./AdminAlumni";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [adminName, setAdminName] = useState("Renell L. Bruma");
  // Use logoImg as the default profile picture (do not bundle a built-in admin image)
  const [adminPicture, setAdminPicture] = useState(logoImg);

  const [stats, setStats] = useState({
    totalApplicants: 0,
    pendingVerifications: 0,
    accepted: 0,
    rejected: 0,
    programDistribution: [],
    monthlyApplicants: [],
    recentApplications: [],
    courseReports: [],
    courseYearlyReports: [],
    enrollmentByYear: [],
    graduatesByYear: [],
    enrollmentTrendSummary: {},
  });
  const [alumniCount, setAlumniCount] = useState(0);
  const [alumni, setAlumni] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");

  const SAMPLE_RECENT_APPLICATIONS = [
    { id: "sample-app-1", full_name: "Maria Santos", email: "maria.santos@example.com", program_name: "Bachelor of Science in Business Administration - Marketing Management", status: "Pending", created_at: "2026-04-20T08:30:00Z" },
    { id: "sample-app-2", full_name: "John Dela Cruz", email: "john.delacruz@example.com", program_name: "Bachelor of Arts in English Language Studies", status: "Accepted", created_at: "2026-04-18T10:15:00Z" },
    { id: "sample-app-3", full_name: "Liza Cruz", email: "liza.cruz@example.com", program_name: "Bachelor of Science in Hospitality Management", status: "Rejected", created_at: "2026-04-15T14:45:00Z" },
  ];

  const SAMPLE_COURSE_REPORTS = [
    { program: "Bachelor of Science in Business Administration - Marketing Management", enrollments: 18, graduates: 12 },
    { program: "Bachelor of Arts in English Language Studies", enrollments: 12, graduates: 9 },
    { program: "Bachelor of Science in Hospitality Management", enrollments: 10, graduates: 7 },
  ];

  const SAMPLE_COURSE_YEARLY_REPORTS = [
    { program: "Bachelor of Science in Business Administration - Marketing Management", year: 2023, enrollments: 5, graduates: 2 },
    { program: "Bachelor of Arts in English Language Studies", year: 2023, enrollments: 4, graduates: 1 },
    { program: "Bachelor of Science in Hospitality Management", year: 2023, enrollments: 3, graduates: 2 },
    { program: "Bachelor of Science in Business Administration - Marketing Management", year: 2024, enrollments: 6, graduates: 3 },
    { program: "Bachelor of Arts in English Language Studies", year: 2024, enrollments: 5, graduates: 2 },
    { program: "Bachelor of Science in Hospitality Management", year: 2024, enrollments: 4, graduates: 2 },
    { program: "Bachelor of Science in Business Administration - Marketing Management", year: 2025, enrollments: 7, graduates: 4 },
    { program: "Bachelor of Arts in English Language Studies", year: 2025, enrollments: 6, graduates: 3 },
    { program: "Bachelor of Science in Hospitality Management", year: 2025, enrollments: 5, graduates: 3 },
  ];

  const SAMPLE_ENROLLMENT_YEAR = [
    { year: 2021, count: 14 },
    { year: 2022, count: 19 },
    { year: 2023, count: 15 },
    { year: 2024, count: 22 },
    { year: 2025, count: 27 },
  ];

  const SAMPLE_GRADUATES_YEAR = [
    { year: 2021, count: 8 },
    { year: 2022, count: 11 },
    { year: 2023, count: 9 },
    { year: 2024, count: 14 },
    { year: 2025, count: 16 },
  ];

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "applicants", label: "Applicants", icon: Users },
    { key: "alumni", label: "Alumni", icon: Users },
    { key: "logs", label: "Activity Log", icon: Settings },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard-stats");
        const data = res.data;

        // Make sure all numeric fields are numbers
        setStats({
          totalApplicants: Number(data.totalApplicants ?? 0),
          pendingVerifications: Number(data.pendingVerifications ?? 0),
          accepted: Number(data.accepted ?? 0),
          rejected: Number(data.rejected ?? 0),
          docsAwaiting: Number(data.docsAwaiting ?? 0),
          incompleteRequirements: Number(data.incompleteRequirements ?? 0),
          programDistribution: Array.isArray(data.programDistribution) ? data.programDistribution : [],
          monthlyApplicants: Array.isArray(data.monthlyApplicants) ? data.monthlyApplicants : [],
          recentApplications: Array.isArray(data.recentApplications) ? data.recentApplications : [],
          courseReports: Array.isArray(data.courseReports) ? data.courseReports : [],
          courseYearlyReports: Array.isArray(data.courseYearlyReports) ? data.courseYearlyReports : [],
          enrollmentByYear: Array.isArray(data.enrollmentByYear) ? data.enrollmentByYear : [],
          graduatesByYear: Array.isArray(data.graduatesByYear) ? data.graduatesByYear : [],
          enrollmentTrendSummary: data.enrollmentTrendSummary || {},
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    const fetchAlumni = async () => {
      setAlumniLoading(true);
      try {
        const res = await api.get("/admin/alumni");
        const list = Array.isArray(res.data) ? res.data : [];
        setAlumni(list);
        setAlumniCount(list.length);
      } catch (err) {
        console.error("Failed to fetch alumni:", err);
        setAlumni([]);
        setAlumniCount(0);
      } finally {
        setAlumniLoading(false);
      }
    };

    fetchStats();
    fetchAlumni();
  }, []);

  // Load admin profile from localStorage and listen for updates from AdminSettings
  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem('user');
        const u = stored ? JSON.parse(stored) : null;
        if (u) {
          setAdminName(u.fullname || 'Admin');
          const pic = u.profile_picture || null;
          if (pic && String(pic).toLowerCase().startsWith('http')) {
            setAdminPicture(pic);
          } else if (pic) {
            setAdminPicture(`http://localhost:5000/${String(pic).replace(/^\//, '')}`);
          } else {
            setAdminPicture(logoImg);
          }
        }
      } catch (e) { /* ignore */ }
    };

    loadProfile();

    const handler = (e) => {
      const d = e?.detail || {};
      setAdminName(d.fullname || adminName);
      if (d.profile_picture) {
        const p = d.profile_picture;
        if (String(p).toLowerCase().startsWith('http')) setAdminPicture(p);
        else setAdminPicture(`http://localhost:5000/${String(p).replace(/^\//, '')}`);
      }
    };
    window.addEventListener('profileUpdated', handler);
    return () => window.removeEventListener('profileUpdated', handler);
  }, []);

  // Prevent navigating back out of admin dashboard when an admin is logged in
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const u = stored ? JSON.parse(stored) : null;
      
      // Redirect to home if not admin
      if (!u || u.role !== 'admin') {
        window.location.href = '/';
        return;
      }

      // Push a history state so that pressing Back stays on the admin page
      window.history.pushState(null, '', window.location.href);
      const onPopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    } catch (e) {
      // Redirect on error
      window.location.href = '/';
    }
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57"];
  const KNOWN_BACHELOR_PROGRAMS = [
    "Bachelor of Arts in English Language Studies",
    "Bachelor of Science in Business Administration - Human Resource Management",
    "Bachelor of Science in Business Administration - Marketing Management",
    "Bachelor of Science in Hospitality Management",
  ];
  const PROGRAM_COLOR_KEYWORDS = [
    { match: /human resource management/i, color: "#16a34a" },
    { match: /marketing management/i, color: "#eab308" },
    { match: /english language studies/i, color: "#0ea5e9" },
    { match: /hospitality management/i, color: "#f59e0b" },
    { match: /information technology|it/i, color: "#8b5cf6" },
  ];
  const PIE_MIN_VISIBLE_VALUE = 1;

  const getProgramColor = (programName, index) => {
    const key = String(programName || "");
    const known = PROGRAM_COLOR_KEYWORDS.find(item => item.match.test(key));
    return known ? known.color : COLORS[index % COLORS.length];
  };

  const recentApplications = Array.isArray(stats.recentApplications) ? stats.recentApplications : [];
  const courseReports = Array.isArray(stats.courseReports) ? stats.courseReports : [];
  const courseYearlyReports = Array.isArray(stats.courseYearlyReports) ? stats.courseYearlyReports : [];
  const courseReportsWithFallback = courseReports.length > 0 ? courseReports : SAMPLE_COURSE_REPORTS;
  const courseYearlyReportsWithFallback = courseYearlyReports.length > 0 ? courseYearlyReports : SAMPLE_COURSE_YEARLY_REPORTS;
  const recentApplicationsWithFallback = recentApplications.length > 0 ? recentApplications : SAMPLE_RECENT_APPLICATIONS;
  const allProgramsForPie = Array.from(new Set([
    ...KNOWN_BACHELOR_PROGRAMS,
    ...courseReportsWithFallback.map(item => item.program).filter(Boolean),
  ]));
  const enrolledByProgram = new Map(
    courseReportsWithFallback.map(item => [item.program, Number(item.enrollments || 0)])
  );
  const coursePieData = allProgramsForPie.map((program, index) => {
    const actualValue = enrolledByProgram.get(program) || 0;
    return {
      name: program,
      value: actualValue,
      pieValue: actualValue > 0 ? actualValue : PIE_MIN_VISIBLE_VALUE,
      color: getProgramColor(program, index),
    };
  });

  const academicTrendData = (() => {
    const enrollmentSource = (stats.enrollmentByYear || []).length > 0 ? stats.enrollmentByYear : SAMPLE_ENROLLMENT_YEAR;
    const graduateSource = (stats.graduatesByYear || []).length > 0 ? stats.graduatesByYear : SAMPLE_GRADUATES_YEAR;
    const combined = new Map();
    enrollmentSource.forEach(item => {
      const year = Number(item.year);
      if (!Number.isFinite(year)) return;
      combined.set(year, { year, enrollments: Number(item.count || 0), graduates: 0 });
    });
    graduateSource.forEach(item => {
      const year = Number(item.year);
      if (!Number.isFinite(year)) return;
      const existing = combined.get(year) || { year, enrollments: 0, graduates: 0 };
      existing.graduates = Number(item.count || 0);
      combined.set(year, existing);
    });
    return Array.from(combined.values()).sort((a, b) => a.year - b.year);
  })();

  const trendSummary = stats.enrollmentTrendSummary || {};
  const sampleTrendSummary = (() => {
    const currentYear = SAMPLE_ENROLLMENT_YEAR.at(-1);
    const previousYear = SAMPLE_ENROLLMENT_YEAR.at(-2);
    const delta = (currentYear?.count || 0) - (previousYear?.count || 0);
    return {
      currentYear: currentYear?.year || null,
      previousYear: previousYear?.year || null,
      currentCount: currentYear?.count || 0,
      previousCount: previousYear?.count || 0,
      delta,
      direction: delta > 0 ? "increase" : delta < 0 ? "decrease" : "flat",
      percentChange: previousYear?.count > 0 ? Math.round((Math.abs(delta) / previousYear.count) * 100) : null,
    };
  })();
  const effectiveTrendSummary = trendSummary.currentYear ? trendSummary : sampleTrendSummary;
  const trendDirection = trendSummary.direction === "increase"
    ? "increase"
    : trendSummary.direction === "decrease"
      ? "decrease"
      : "flat";
  const effectiveTrendDirection = effectiveTrendSummary.direction === "increase"
    ? "increase"
    : effectiveTrendSummary.direction === "decrease"
      ? "decrease"
      : "flat";

  const yearlyOptions = Array.from(
    new Set(
      courseYearlyReportsWithFallback
        .map(item => Number(item.year))
        .filter(year => Number.isFinite(year))
    )
  ).sort((a, b) => a - b);

  useEffect(() => {
    if (yearlyOptions.length === 0) {
      if (selectedYear) setSelectedYear("");
      return;
    }

    const latestYear = String(yearlyOptions[yearlyOptions.length - 1]);
    if (!selectedYear || !yearlyOptions.includes(Number(selectedYear))) {
      setSelectedYear(latestYear);
    }
  }, [yearlyOptions, selectedYear]);

  const selectedYearProgramData = courseYearlyReportsWithFallback
    .filter(item => Number(item.year) === Number(selectedYear))
    .map(item => ({
      program: item.program || "Not Specified",
      enrollments: Number(item.enrollments || 0),
      graduates: Number(item.graduates || 0),
    }))
    .sort((a, b) => {
      const totalDiff = (b.enrollments + b.graduates) - (a.enrollments + a.graduates);
      if (totalDiff !== 0) return totalDiff;
      return a.program.localeCompare(b.program);
    });

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { 
                  label: "Total Applicants", 
                  value: stats.totalApplicants, 
                  color: "blue", 
                  icon: UsersIcon,
                  bgColor: "bg-blue-50",
                  iconColor: "text-blue-600"
                },
                { 
                  label: "Pending", 
                  value: stats.pendingVerifications, 
                  color: "yellow", 
                  icon: Clock,
                  bgColor: "bg-yellow-50",
                  iconColor: "text-yellow-600"
                },
                { 
                  label: "Accepted", 
                  value: stats.accepted, 
                  color: "green", 
                  icon: CheckCircle,
                  bgColor: "bg-green-50",
                  iconColor: "text-green-600"
                },
                { 
                  label: "Rejected", 
                  value: stats.rejected, 
                  color: "red", 
                  icon: XCircle,
                  bgColor: "bg-red-50",
                  iconColor: "text-red-600"
                },
                {
                  label: "Alumni",
                  value: alumniCount,
                  color: "purple",
                  icon: UsersIcon,
                  bgColor: "bg-violet-50",
                  iconColor: "text-violet-600"
                }
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts and Reports */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Monthly Applicants */}
              <div className="bg-white rounded-xl shadow-md p-6 xl:col-span-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Monthly Applicants</h3>
                {stats.monthlyApplicants.length === 0 ? (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p>No data available</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.monthlyApplicants} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#4f46e5" 
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 xl:col-span-1">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Reports by Course</h3>
                    <p className="text-sm text-gray-500">Accepted applicants per program.</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${effectiveTrendDirection === "increase" ? "bg-green-50 text-green-700" : effectiveTrendDirection === "decrease" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                    {effectiveTrendDirection === "increase" ? <ArrowUpRight size={14} /> : effectiveTrendDirection === "decrease" ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                    {effectiveTrendDirection === "increase" ? "Enrollment up" : effectiveTrendDirection === "decrease" ? "Enrollment down" : "No change"}
                  </span>
                </div>
                {courseReportsWithFallback.length === 0 ? (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p>No data available</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={coursePieData}
                          dataKey="pieValue"
                          nameKey="name"
                          cx="50%"
                          cy="48%"
                          innerRadius={56}
                          outerRadius={105}
                          paddingAngle={2}
                          minAngle={12}
                        >
                          {coursePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, item) => [`${item?.payload?.value ?? 0} enrolled`, name]}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {coursePieData.map((entry, index) => (
                        <div key={`${entry.name}-${index}`} className="flex items-start gap-2">
                          <div className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: entry.color }}></div>
                          <span className="text-sm leading-5 text-gray-600 break-words">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 xl:col-span-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Reports</h3>
                <div className="mb-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  {effectiveTrendSummary.currentYear && effectiveTrendSummary.previousYear
                    ? `Enrollment ${effectiveTrendDirection} by ${effectiveTrendSummary.percentChange == null ? "N/A" : `${effectiveTrendSummary.percentChange}%`} compared with ${effectiveTrendSummary.previousYear}.`
                    : "Not enough annual data to compare enrollment movement yet."}
                </div>
                {recentApplicationsWithFallback.length === 0 ? (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🗂️</div>
                      <p>No recent applications</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[330px] overflow-y-auto pr-1">
                    {recentApplicationsWithFallback.map(item => (
                      <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">{item.full_name || "Unknown applicant"}</p>
                            <p className="truncate text-sm text-gray-500">{item.email || "No email"}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Accepted" ? "bg-green-100 text-green-700" : item.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {item.status || "Pending"}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                          <span>{item.program_name || "Not Specified"}</span>
                          <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Enrollment vs Graduates by Academic Year</h3>
                <p className="text-sm text-gray-500 mb-4">Accepted applicants are treated as enrollments; alumni records represent graduates.</p>
                {effectiveTrendSummary.currentYear && effectiveTrendSummary.previousYear ? (
                  <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${effectiveTrendDirection === "increase" ? "bg-green-50 text-green-700" : effectiveTrendDirection === "decrease" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      {effectiveTrendDirection === "increase" ? <ArrowUpRight size={16} /> : effectiveTrendDirection === "decrease" ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                      <span>
                        {effectiveTrendDirection === "increase"
                          ? "Enrollment increased from last year"
                          : effectiveTrendDirection === "decrease"
                            ? "Enrollment decreased from last year"
                            : "Enrollment unchanged from last year"}
                      </span>
                    </div>
                    <p className="mt-1">
                      {effectiveTrendSummary.currentYear} vs {effectiveTrendSummary.previousYear}: {effectiveTrendSummary.currentCount} vs {effectiveTrendSummary.previousCount}
                      {` (`}
                      {effectiveTrendDirection === "increase" ? "+" : effectiveTrendDirection === "decrease" ? "-" : ""}
                      {Math.abs(Number(effectiveTrendSummary.delta || 0))}
                      {effectiveTrendSummary.percentChange == null ? "" : `, ${effectiveTrendSummary.percentChange}%`}
                      {`)`}
                    </p>
                    <p className="mt-1 text-xs opacity-90">
                      Example: If 2024 enrollments are 20 and 2025 enrollments are 25, that is +5 and +25% (increase).
                    </p>
                  </div>
                ) : null}
                {academicTrendData.length === 0 ? (
                  <div className="h-72 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📉</div>
                      <p>No yearly trend data available</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={academicTrendData} margin={{ top: 18, right: 20, left: 0, bottom: 8 }} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={30} />
                      <Bar dataKey="enrollments" name="Enrollments" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={30}>
                        <LabelList dataKey="enrollments" position="top" formatter={(value) => Number(value || 0)} style={{ fill: "#1f2937", fontSize: 12, fontWeight: 600 }} />
                      </Bar>
                      <Bar dataKey="graduates" name="Graduates" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={30}>
                        <LabelList dataKey="graduates" position="top" formatter={(value) => Number(value || 0)} style={{ fill: "#1f2937", fontSize: 12, fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Per Course Graduates</h3>
                <p className="text-sm text-gray-500 mb-4">Compare graduates across all bachelor programs by year.</p>
                {yearlyOptions.length === 0 ? (
                  <div className="h-72 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📚</div>
                      <p>No per-program yearly data available</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label htmlFor="yearly-course-filter" className="text-sm font-medium text-gray-700">
                        Academic Year
                      </label>
                      <select
                        id="yearly-course-filter"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-[360px]"
                      >
                        {yearlyOptions.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {selectedYearProgramData.length === 0 ? (
                      <div className="h-72 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📘</div>
                          <p>No yearly records found for the selected year</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={selectedYearProgramData.length * 52 + 70}>
                        <BarChart data={selectedYearProgramData} layout="vertical" margin={{ top: 10, right: 20, left: 140, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="program" width={140} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value} graduates`, "Graduates"]}
                          />
                          <Bar dataKey="graduates" name="Graduates" fill="#16a34a" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setActiveSection("applicants")} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  View Applicants
                </button>
                <button 
                  onClick={() => setActiveSection("alumni")} 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  View Alumni
                </button>
                <button 
                  onClick={() => setActiveSection("logs")} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Activity Logs
                </button>
              </div>
            </div>
          </div>
        );

      case "applicants":
        return <AdminApplicants />;
      case "alumni":
        return <AdminAlumni />;
      case "logs":
        return <AdminActivityLog />;
      case "settings":
        return <AdminSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full z-30
        ${sidebarOpen ? "w-64" : "w-20"}
        ${mobileSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        bg-blue-800 text-white flex flex-col transition-all duration-300`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="ETEEAP" className="w-10 h-10 rounded-full" />
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg">ETEEAP Admin</h2>
                <p className="text-xs text-blue-200">Control Center</p>
              </div>
            )}
          </div>
          <button className="lg:hidden p-1" onClick={() => setMobileSidebar(false)}><X /></button>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setActiveSection(key); setMobileSidebar(false); }}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${activeSection===key?"bg-blue-600":"hover:bg-blue-700"}`}>
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <button onClick={() => { localStorage.removeItem("user"); window.location.href="/"; }}
            className="w-full flex items-center gap-3 p-2 rounded bg-blue-700 hover:bg-blue-600">
            <LogOut size={18} /> {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-white p-4 shadow">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileSidebar(true)}><Menu size={24} /></button>
            <div className="text-xl font-semibold text-blue-800">Admin Portal</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="font-semibold text-gray-700">{adminName}</div>
              <div className="text-xs text-gray-500">Coordinator</div>
            </div>
            <img src={adminPicture} className="w-10 h-10 rounded-full border" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
