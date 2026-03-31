// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, Users, Settings, LogOut, Users as UsersIcon, Clock, CheckCircle, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "../api/axios";

import logoImg from "../assets/ETEEAP_LOGO.png";

import AdminApplicants from "./AdminApplicants";
import AdminActivityLog from "./AdminActivityLog";
import AdminSettings from "./AdminSettings";

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
  });

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "applicants", label: "Applicants", icon: Users },
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
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };
    fetchStats();
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
            setAdminPicture(adminImg || logoImg);
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Applicants */}
              <div className="bg-white rounded-xl shadow-md p-6">
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

              {/* Program Distribution */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Program Distribution</h3>
                {(() => {
                  const programData = (stats.programDistribution || []).filter(e => {
                    const name = (e.program || '').toString();
                    if (!name || name === 'undefined') return false;
                    if (['Incomplete requirements', 'Docs Awaiting Review', 'Awaiting review'].includes(name)) return false;
                    return Number(e.count) > 0;
                  });

                  if (!programData || programData.length === 0) {
                    return (
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📈</div>
                          <p>No data available</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={programData}
                            dataKey="count"
                            nameKey="program"
                            cx="50%"
                            cy="45%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                          >
                            {programData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} applicants`, name]}
                            contentStyle={{ 
                              backgroundColor: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex flex-wrap justify-center gap-4">
                        {programData.map((entry, index) => (
                          <div key={entry.program} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm text-gray-600">{entry.program}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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
