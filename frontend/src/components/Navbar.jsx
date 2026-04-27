import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaUserCircle, FaFolderOpen } from "react-icons/fa";
import ETEEAP_LOGO from "../assets/ETEEAP_LOGO.png";
import LCCB_LOGO from "../assets/LCCB_LOGO.png";
import axios from "axios";
import ProfileModal from "./ProfileModal";
import { UserContext } from "./UserContext";

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const pollIntervalRef = useRef(null);
  const notificationRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = async (notificationKey) => {
    if (!notificationKey) return;
    try {
      await axios.post(
        "http://localhost:5000/notifications/mark-read",
        { notification_key: notificationKey },
        { headers: user ? { "x-user-id": user.id } : {}, withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.notification_key === notificationKey ? { ...n, read: true } : n))
      );
      try { window.dispatchEvent(new CustomEvent("notifications-updated")); } catch (e) {}
    } catch (e) {
      console.error("Failed to mark notification read:", e?.response?.data || e.message);
    }
  };

  const markAllNotificationsRead = async (list) => {
    const source = Array.isArray(list) ? list : notifications;
    const unread = source.filter((n) => n.notification_key && !n.read);
    if (unread.length === 0) {
      setNotifications(source);
      return;
    }

    const results = await Promise.allSettled(
      unread.map((n) =>
        axios.post(
          "http://localhost:5000/notifications/mark-read",
          { notification_key: n.notification_key },
          { headers: user ? { "x-user-id": user.id } : {}, withCredentials: true }
        )
      )
    );

    const successKeys = unread
      .filter((_, idx) => results[idx].status === "fulfilled")
      .map((n) => n.notification_key);

    if (successKeys.length > 0) {
      const keySet = new Set(successKeys);
      setNotifications(source.map((n) => (keySet.has(n.notification_key) ? { ...n, read: true } : n)));
      try { window.dispatchEvent(new CustomEvent("notifications-updated")); } catch (e) {}
    } else {
      setNotifications(source);
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    setMobileProfileOpen(false);
    setMobileOpen(false);
    setShowNotifications(false);
    // Navigate to home and ensure scroll is at top (fixes leftover scroll position after logout)
    navigate("/", { replace: true });
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (e) {
      // ignore in non-browser environments
    }
  };

  const toggleMobile = () => setMobileOpen((v) => !v);

  const toggleNotifications = () => {
    // On small screens we don't render the inline dropdown (it's part of the md:flex block).
    // Navigate to the notifications page instead so users can view them on mobile.
    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isMobile) {
        setMobileOpen(false);
        navigate('/notifications');
        return;
      }
    } catch (e) {
      // ignore
    }

    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    if (willOpen) fetchNotifications({ markAsRead: true });
  };

  const fetchNotifications = async ({ markAsRead = false } = {}) => {
    if (!user) return;
    try {
      const res = await axios.get("http://localhost:5000/notifications", {
        headers: { "x-user-id": user.id },
        withCredentials: true,
      });
      const list = Array.isArray(res.data) ? res.data : [];
      if (markAsRead) {
        await markAllNotificationsRead(list);
      } else {
        setNotifications(list);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err.response?.data || err.message);
      setNotifications([]);
    }
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    // Poll for new notifications every 15 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for requests to open the profile modal (used after OAuth flows)
  useEffect(() => {
    const onOpenProfile = () => setShowProfile(true);
    window.addEventListener('openProfile', onOpenProfile);
    return () => window.removeEventListener('openProfile', onOpenProfile);
  }, []);

  useEffect(() => {
    const onNotificationsUpdated = () => fetchNotifications();
    window.addEventListener("notifications-updated", onNotificationsUpdated);
    return () => window.removeEventListener("notifications-updated", onNotificationsUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const toggleProfile = () => setShowProfile(!showProfile);

  // Helper to correctly get full image URL
  const getProfileImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `http://localhost:5000${path}`;
    return `http://localhost:5000/${path}`;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={LCCB_LOGO} alt="LCCB Logo" className="h-10 md:h-12 mr-3" />
            <img src={ETEEAP_LOGO} alt="ETEEAP Logo" className="h-10 md:h-12" />
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link to="/" className="transition-colors duration-300 hover:text-blue-600">Home</Link>
            <Link to="/about" className="transition-colors duration-300 hover:text-blue-600">About</Link>
            <Link to="/programs" className="transition-colors duration-300 hover:text-blue-600">Programs</Link>
            <Link to="/alumni" className="transition-colors duration-300 hover:text-blue-600">Alumni</Link>
            <Link to="/faqs" className="transition-colors duration-300 hover:text-blue-600">FAQ's</Link>
          </div>

          {/* Mobile: hamburger button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Notifications icon (mobile) with Drafts beside it */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => { setMobileOpen(false); navigate('/notifications'); }}
                    aria-label="Notifications"
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                  >
                    <FaEnvelope size={26} className="text-gray-600" />
                  </button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => { setMobileOpen(false); navigate('/my-drafts'); }}
                  aria-label="My Drafts"
                  className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                >
                  <FaFolderOpen size={26} className="text-gray-600" />
                </button>
              </div>
            )}

            {/* Profile icon (mobile) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => { setMobileProfileOpen((v) => !v); setMobileOpen(false); }}
                  aria-label="Profile"
                  className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                >
                  {user.profile_picture ? (
                    <img src={getProfileImageUrl(user.profile_picture)} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <FaUserCircle size={26} className="text-gray-600" />
                  )}
                </button>

                {mobileProfileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-1 z-50">
                    <button
                      onClick={() => { setShowProfile(true); setMobileProfileOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => { setMobileProfileOpen(false); handleLogout(); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* hamburger */}
            <button
              onClick={toggleMobile}
              aria-label="Toggle menu"
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          <div className="hidden md:flex space-x-3 items-center relative">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div 
                    ref={notificationRef}
                    className="relative cursor-pointer" 
                    onClick={toggleNotifications}
                    onMouseEnter={() => {
                      if (!showNotifications) {
                        setShowNotifications(true);
                        fetchNotifications({ markAsRead: true });
                      }
                    }}
                  >
                    <FaEnvelope size={28} className="text-gray-600 hover:text-blue-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-sm w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md p-2 z-50">
                        <div className="px-2 pb-2 border-b">
                          <span className="font-semibold">Notifications</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-3 text-sm text-gray-500">You're all caught up.</p>
                          ) : (
                            notifications.map((n, idx) => (
                              <button
                                key={idx}
                                onClick={async () => {
                                  setShowNotifications(false);
                                  await markNotificationRead(n.notification_key);

                                  if (n.type === "remark") navigate(`/applications/${n.application_id}?doc=${encodeURIComponent(n.document_name)}`);
                                  else if (n.type === "application") navigate(`/admin?open=${n.application_id}`);
                                  else navigate(`/applications/${n.application_id}`);
                                }}
                                className="w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-gray-50"
                              >
                                <div className="text-sm font-medium">{n.title || "Update"}</div>
                                <div className="text-xs text-gray-600">{n.message}</div>
                                <div className="text-xs text-gray-400 mt-1">{new Date(n.date).toLocaleString()}</div>
                              </button>
                            ))
                          )}
                        </div>
                        <div className="text-center mt-2">
                          <Link to="/notifications" className="text-sm text-blue-600 hover:underline">View all</Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/my-drafts')}
                    aria-label="My Drafts"
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                  >
                    <FaFolderOpen size={28} className="text-gray-600" />
                  </button>
                </div>

                {/* Profile Icon */}
                <div className="relative cursor-pointer mx-2" onClick={toggleProfile}>
                  {user.profile_picture ? (
                    <img
                      src={getProfileImageUrl(user.profile_picture)}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border border-gray-300 hover:border-blue-600"
                    />
                  ) : (
                    <FaUserCircle size={34} className="text-gray-600 hover:text-blue-600" />
                  )}
                </div>

                {/* Logout moved into ProfileModal */}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu panel with smooth animation */}
      {mobileOpen && (
        <div className="md:hidden fixed left-0 right-0 z-40 animate-in fade-in slide-in-from-top-2 duration-300" style={{ top: '64px' }}>
          <div className="bg-white border-b shadow-sm" style={{ maxHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
            <div className="px-4 py-3 space-y-2">
            <Link onClick={() => setMobileOpen(false)} to="/" className="block px-2 py-2 rounded hover:bg-gray-100">Home</Link>
            <Link onClick={() => setMobileOpen(false)} to="/about" className="block px-2 py-2 rounded hover:bg-gray-100">About</Link>
            <Link onClick={() => setMobileOpen(false)} to="/programs" className="block px-2 py-2 rounded hover:bg-gray-100">Programs</Link>
            <Link onClick={() => setMobileOpen(false)} to="/alumni" className="block px-2 py-2 rounded hover:bg-gray-100">Alumni</Link>
            <Link onClick={() => setMobileOpen(false)} to="/faqs" className="block px-2 py-2 rounded hover:bg-gray-100">FAQ's</Link>

            {user ? null : (
              <div className="border-t pt-2">
                <Link onClick={() => setMobileOpen(false)} to="/login" className="block px-2 py-2 rounded hover:bg-gray-100">Log In</Link>
                <Link onClick={() => setMobileOpen(false)} to="/signup" className="block px-2 py-2 rounded hover:bg-gray-100">Sign Up</Link>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal Component */}
      {showProfile && user && <ProfileModal user={user} onClose={toggleProfile} />}
    </>
  );
}

export default Navbar;
