import React, { useState, useEffect } from "react";
import { Trash2, Check, XCircle, Eye } from "lucide-react";
import axios from "axios";
import api from "../api/axios";
import Toast from "./Toast";

const FILE_COLUMNS = [
  "letter_of_intent",
  "resume",
  "picture",
  "application_form",
  "recommendation_letter",
  "school_credentials",
  "high_school_diploma",
  "transcript",
  "birth_certificate",
  "employment_certificate",
  "nbi_clearance",
  "marriage_certificate",
  "business_registration",
  "certificates"
];

const FILE_LABELS = {
  letter_of_intent: "Letter of Intent",
  resume: "Resume",
  picture: "Picture",
  application_form: "Application Form",
  recommendation_letter: "Recommendation Letter",
  school_credentials: "School Credentials",
  high_school_diploma: "High School Diploma",
  transcript: "Transcript",
  birth_certificate: "Birth Certificate",
  employment_certificate: "Employment Certificate",
  nbi_clearance: "NBI Clearance",
  marriage_certificate: "Marriage Certificate",
  business_registration: "Business Registration",
  certificates: "Certificates"
};

// Reusable button classes for consistent responsive UI
const BTN_BASE = "inline-flex items-center justify-center gap-2 px-2 py-1 text-sm font-medium rounded-md focus:outline-none transition-all duration-200";
const BTN_SUCCESS = `${BTN_BASE} bg-green-600 text-white hover:bg-green-700 hover:shadow-md`;
const BTN_DANGER = `${BTN_BASE} bg-red-600 text-white hover:bg-red-700 hover:shadow-md`;
const BTN_SECONDARY = `${BTN_BASE} bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md`;
const BTN_ICON = "inline-flex items-center justify-center p-2 rounded-md bg-white border hover:bg-gray-50";

import { useLocation } from 'react-router-dom';

function AdminApplicants() {
  const location = useLocation();
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState("");
  const [showView, setShowView] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [trashedApplicants, setTrashedApplicants] = useState([]);

  // Remark modal states
  const [remarkData, setRemarkData] = useState(null);
  const [remarkText, setRemarkText] = useState("");
  const [showVerifyAllConfirm, setShowVerifyAllConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [supportedDocStatusKeys, setSupportedDocStatusKeys] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [programFilter, setProgramFilter] = useState("All");

  // derived program list (include additional known programs)
  const EXTRA_PROGRAMS = [
    "Bachelor of Arts in English Language Studies",
    "Bachelor of Science in Business Administration - Human Resource Management",
    "Bachelor of Science in Business Administration - Marketing Management",
    "Bachelor of Science in Hospitality Management"
  ];
  const programs = Array.from(new Set([
    ...applicants.map(a => a.program_name).filter(Boolean),
    ...EXTRA_PROGRAMS
  ])).sort();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper function to format deleted_at date to MM/DD/YYYY, HH:MM:SS AM/PM format
  const formatDeletedDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
    } catch (e) {
      return "N/A";
    }
  };

  // Helper function to calculate expected deletion date (30 days after deleted_at)
  const getExpectedDeleteDate = (deletedAt) => {
    if (!deletedAt) return "N/A";
    try {
      const date = new Date(deletedAt);
      date.setDate(date.getDate() + 30);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return "N/A";
    }
  };


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openId = params.get('open');
    if (!openId) return;

    // after applicants are loaded, try to open
    const tryOpen = () => {
      const found = applicants.find(a => String(a.id) === String(openId));
      if (found) setShowView(found);
    };

    tryOpen();
  }, [location.search, applicants]);

  useEffect(() => {
    const fetchSupported = async () => {
      try {
        const res = await api.get("/admin/document-status-supported");
        setSupportedDocStatusKeys(res.data.supported || []);
      } catch (e) {
        console.warn('Failed to fetch supported doc status keys', e?.response?.data || e.message);
        setSupportedDocStatusKeys([]);
      }
    };
    fetchSupported();
  }, []);

  // Fetch the applicants list when this component mounts
  useEffect(() => {
    fetchApplicants();
  }, []);

  // --- LOG ACTIVITY ---
  const logActivity = async (action, details) => {
    try {
      await api.post("/admin/log", { action, details });
    } catch (err) {
      console.error("Activity logging failed:", err);
    }
  };

  // --- FETCH APPLICANTS ---
  const fetchApplicants = async () => {
    try {
      const res = await api.get("/admin/applications");
      setApplicants(res.data);
    } catch (err) { console.error(err); }
  };


  // --- ACCEPT / REJECT SINGLE APPLICANT ---
  const acceptRejectApplicant = async (id, status) => {
    try {
      const normalized = String(status).toLowerCase();

      // Update application status on server first
      const res = await api.put(`/admin/applications/${id}/status`, { status: normalized });
      const updated = res.data || {};

      // Find current applicant record (to know which files are uploaded)
      const applicant = applicants.find(a => a.id === id) || (showView && showView.id === id && showView) || {};

      // If Accepted: verify all uploaded files
      if (normalized === "accepted") {
        const filesToVerify = FILE_COLUMNS.filter(f => applicant[f]);
        if (filesToVerify.length > 0) {
          await Promise.all(filesToVerify.map(f =>
            api.put(`/admin/applications/${id}/documents/${f}/verify`, { verified: 1 })
          ));

          // Merge verified flags locally
          setApplicants(prev => prev.map(a => {
            if (a.id !== id) return a;
            const updates = {};
            filesToVerify.forEach(f => { updates[`${f}_verified`] = 1; });
            return { ...a, ...updates, status: updated.status || a.status };
          }));
          if (showView && showView.id === id) {
            setShowView(prev => {
              const updates = {};
              FILE_COLUMNS.filter(f => prev[f]).forEach(f => { updates[`${f}_verified`] = 1; });
              return { ...prev, ...updates, status: updated.status || prev.status };
            });
          }
        }
        await logActivity("Bulk Verify on Accept", `Applicant ID ${id} - verified ${filesToVerify.length} files and set status to Accepted`);
        showToast(`Applicant accepted and ${applicant ? FILE_COLUMNS.filter(f => applicant[f]).length : 0} files verified`, "success");
      }

      // If Rejected: unverify all uploaded files
      else if (normalized === "rejected") {
        const filesToUnverify = FILE_COLUMNS.filter(f => applicant[f]);
        if (filesToUnverify.length > 0) {
          await Promise.all(filesToUnverify.map(f =>
            api.put(`/admin/applications/${id}/documents/${f}/verify`, { verified: 0 })
          ));

          setApplicants(prev => prev.map(a => {
            if (a.id !== id) return a;
            const updates = {};
            filesToUnverify.forEach(f => { updates[`${f}_verified`] = 0; });
            return { ...a, ...updates, status: updated.status || a.status };
          }));
          if (showView && showView.id === id) {
            setShowView(prev => {
              const updates = {};
              FILE_COLUMNS.filter(f => prev[f]).forEach(f => { updates[`${f}_verified`] = 0; });
              return { ...prev, ...updates, status: updated.status || prev.status };
            });
          }
        }
        await logActivity("Bulk Unverify on Reject", `Applicant ID ${id} - unverified ${filesToUnverify.length} files and set status to Rejected`);
        showToast("Applicant rejected and all file verifications removed", "success");
      }

      // If Pending: set application status and set each document status to pending
      else if (normalized === "pending") {
        const filesToSet = FILE_COLUMNS.filter(f => applicant[f] && supportedDocStatusKeys.includes(f));
        let failedCount = 0;
        if (filesToSet.length > 0) {
          const results = await Promise.all(filesToSet.map(async (f) => {
            try {
              return await api.put(`/admin/applications/${id}/documents`, { documentName: f, status: "pending" });
            } catch (err) {
              // log and count but don't throw to allow other updates to proceed
              console.warn(`Failed to set document ${f} to pending for application ${id}:`, err?.response?.data || err.message);
              failedCount += 1;
              return null;
            }
          }));
        }
        // Merge status into local state
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: updated.status || a.status } : a));
        if (showView && showView.id === id) setShowView(prev => ({ ...prev, status: updated.status || prev.status }));
        await logActivity("Set Pending", `Applicant ID ${id} - set status to Pending and attempted to set ${filesToSet.length} document(s) to pending (${failedCount} failed)`);
        if (failedCount > 0) showToast(`Applicant set to Pending; ${failedCount} document(s) could not be updated`, "warning");
        else showToast("Applicant set to Pending; documents set to Pending", "success");
      }

      // If none of above, still update the app row from server
      else {
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
        if (showView && showView.id === id) setShowView(prev => ({ ...prev, ...updated }));
        showToast(`Status updated: ${updated.status || status}`, "success");
        await logActivity("Applicant Status Change", `Applicant ID ${id} set to ${updated.status || status}`);
      }
    } catch (err) {
      console.error("Error updating applicant status:", err);
      const msg = err?.response?.data?.message || err.message || "Failed to update applicant status. Please try again.";
      showToast(msg, "error");
    }
  };



  // --- DELETE APPLICANT ---
  const confirmDelete = id => setDeleteId(id);
  const doDelete = async () => {
    try {
      // Get applicant data before deletion to create notification and get user_id
      const applicant = applicants.find(a => a.id === deleteId);
      
      if (applicant && applicant.user_id) {
        try {
          // Create a deletion notification for the user
          await api.post(`/notifications/create-deletion-notification`, {
            application_id: deleteId,
            user_id: applicant.user_id,
            program_name: applicant.program_name
          });
        } catch (notifErr) {
          console.warn("Failed to create deletion notification:", notifErr);
          // Don't block deletion if notification fails
        }
      }

      await api.delete(`/admin/applications/${deleteId}`);
      // Refresh both lists so trash shows the moved item
      await fetchTrash();
      setApplicants(prev => prev.filter(a => a.id !== deleteId));
      await logActivity("Applicant Trashed", `Applicant ID ${deleteId} moved to trash`);
      setDeleteId(null);
      showToast("Applicant moved to Trash", "success");
    } catch (err) { console.error(err); showToast("Failed to delete applicant", "error"); }
  };

  // --- TRASH OPERATIONS ---
  const fetchTrash = async () => {
    try {
      const res = await api.get(`/admin/applications/trash`);
      setTrashedApplicants(res.data || []);
    } catch (err) { console.error('Failed to fetch trashed applications', err); setTrashedApplicants([]); }
  };

  const restoreTrashed = async (trashId) => {
    try {
      await api.post(`/admin/applications/trash/${trashId}/restore`);
      showToast('Application restored', 'success');
      await logActivity('Restore Application', `Restored trashed application ${trashId}`);
      fetchTrash();
      fetchApplicants();
    } catch (err) { console.error('Failed to restore trashed application', err); showToast('Restore failed', 'error'); }
  };

  const permanentlyDelete = async (trashId) => {
    try {
      await api.delete(`/admin/applications/trash/${trashId}`);
      showToast('Trashed application permanently deleted', 'success');
      await logActivity('Permanent Delete', `Permanently deleted trashed application ${trashId}`);
      fetchTrash();
    } catch (err) { console.error('Failed to permanently delete trashed application', err); showToast('Delete failed', 'error'); }
  };

  // --- EXPORT CSV ---


  // --- SEARCH + STATUS FILTER ---
  const filtered = applicants.filter(a => {
    const name = String(a.full_name || (a.data && a.data.full_name) || "");
    const email = String(a.email || (a.data && a.data.email) || "");
    const phone = String(a.phone || "");
    const program = String(a.program_name || "");

    const q = search.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q) ||
      program.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' ? true : String(a.status) === statusFilter;

    const matchesProgram = programFilter === 'All' ? true : String(a.program_name) === programFilter;

    // Completeness: all FILE_COLUMNS present (kept for potential future use)
    const uploadedFiles = FILE_COLUMNS.filter(f => a[f]);
    const isComplete = uploadedFiles.length > 0 && uploadedFiles.length === FILE_COLUMNS.length;

    // Exclude Draft applications from the admin list
    return matchesSearch && matchesStatus && matchesProgram && a.status !== 'Draft';
  });

  // --- REMARK FUNCTIONS ---
  const showRemark = async (applicationId, documentName) => {
    try {
      const res = await api.get(`/admin/applications/${applicationId}/documents/${documentName}/remark`);
      setRemarkData({ applicationId, documentName });
      setRemarkText(res.data.remark || "");
    } catch (err) {
      console.error(err);
      setRemarkData({ applicationId, documentName });
      setRemarkText("Error fetching remark");
      showToast("Failed to fetch remark", "error");
    }
  };

  const saveRemark = async () => {
    try {
      await api.post(`/admin/applications/${remarkData.applicationId}/documents/${remarkData.documentName}/remark`, {
        remark: remarkText
      });
      await logActivity("Remark Sent", `Remark sent to Applicant ID ${remarkData.applicationId} for ${remarkData.documentName}`);
      setRemarkData(null);
      setRemarkText("");
    } catch (err) {
      console.error(err);
      showToast("Failed to save remark", "error");
    }
  };

  // --- VERIFY FILE ---
  const verifyFile = async (applicantId, fileKey) => {
    try {
      // toggle verify/unverify depending on current state
      const applicant = applicants.find(a => a.id === applicantId) || (showView && showView.id === applicantId && showView);
      const currentlyVerified = applicant ? (applicant[`${fileKey}_verified`] === 1) : false;
      const newVal = currentlyVerified ? 0 : 1;
      // Use server's authoritative response which includes explicit per-file verified flags
      const res = await api.put(`/admin/applications/${applicantId}/documents/${fileKey}/verify`, { verified: newVal });
      const updatedApp = res.data || {};

      // Build updates only for recognized verified flags so we don't accidentally overwrite other fields
      const updates = {};
      FILE_COLUMNS.forEach(f => {
        const key = `${f}_verified`;
        if (typeof updatedApp[key] !== "undefined") updates[key] = Number(updatedApp[key]);
      });
      if (typeof updatedApp.status !== "undefined") updates.status = updatedApp.status;

      setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, ...updates } : a));
      if (showView && showView.id === applicantId) {
        setShowView(prev => ({ ...prev, ...updates }));
      }

      await logActivity("File Verify Toggled", `Applicant ID ${applicantId}, File ${fileKey} set to ${newVal}`);

      // If we just unverified a file, set application status to Pending on the server (status endpoint returns app row)
      if (newVal === 0) {
        try {
          const statusRes = await api.put(`/admin/applications/${applicantId}/status`, { status: "pending" });
          const updated = statusRes.data || {};
          // Merge only the status field to avoid clobbering verified flags
          setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: updated.status || a.status } : a));
          if (showView && showView.id === applicantId) setShowView(prev => ({ ...prev, status: updated.status || prev.status }));
          showToast("File unverified — application status set to Pending", "success");
        } catch (statusErr) {
          console.error("Failed to set application status to Pending:", statusErr);
          showToast("File unverified but failed to update status on server", "error");
        }
      }

      showToast(newVal === 1 ? "File verified" : "File unverified", "success");
    } catch (err) {
      console.error("Failed to verify file:", err);
      showToast("Failed to verify file. Please try again.", "error");
    }
  };

  // --- VERIFY ALL UPLOADED FILES ---
  const verifyAllFiles = async () => {
    if (!showView) return;
    try {
      const filesToVerify = FILE_COLUMNS.filter(f => showView[f]);
      // Explicitly mark each uploaded file as verified on backend
      await Promise.all(filesToVerify.map(f =>
        api.put(`/admin/applications/${showView.id}/documents/${f}/verify`, { verified: 1 })
      ));

      // Also update applicant status on backend to Accepted
      try {
        await api.put(`/admin/applications/${showView.id}/status`, { status: "Accepted" });
      } catch (statusErr) {
        console.error("Failed to update applicant status on server:", statusErr);
        // continue, but show an error toast
        showToast("Files verified but failed to set status on server", "error");
      }

      // Update local state
      setApplicants(prev => prev.map(a => {
        if (a.id !== showView.id) return a;
        const updates = {};
        filesToVerify.forEach(f => { updates[`${f}_verified`] = 1; });
        return { ...a, ...updates };
      }));

      setShowView(prev => {
        const updates = {};
        filesToVerify.forEach(f => { updates[`${f}_verified`] = 1; });
        // Also mark applicant as Accepted when re-verifying all files
        return { ...prev, ...updates, status: "Accepted" };
      });

      setShowVerifyAllConfirm(false);
      await logActivity("Verify All", `Re-verified all files for Applicant ID ${showView.id} and set status to Accepted`);
      showToast("All files re-verified and status set to Accepted", "success");
    } catch (err) {
      console.error("Failed to verify all files:", err);
      showToast("Failed to re-verify all files. Please try again.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          {showTrash ? "Trashed Applications" : "Applicant Management"}
        </h2>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 md:min-w-64"
            >
              <option value="All">All Programs</option>
              {programs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 md:min-w-36"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>

            {!remarkData && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                onClick={async () => { const next = !showTrash; setShowTrash(next); if (next) await fetchTrash(); }}
              >
                <Trash2 size={16} />
                <span>{showTrash ? 'Back to Applicants' : 'Trash Bin'}</span>
              </button>
            )}
          </div>
        </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block">
        {showTrash ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Email</th>
                  <th className="px-6 py-3 text-left font-semibold">Program</th>
                  <th className="px-6 py-3 text-left font-semibold">Deleted At</th>
                  <th className="px-6 py-3 text-left font-semibold">Expected Delete</th>
                  <th className="px-6 py-3 text-left font-semibold">Original ID</th>
                  <th className="px-6 py-3 text-center font-semibold w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trashedApplicants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No trashed applications found
                    </td>
                  </tr>
                ) : (
                  trashedApplicants.map(t => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-3">{t.full_name || (t.data && t.data.full_name) || '-'}</td>
                      <td className="px-6 py-3">{t.email || (t.data && t.data.email) || '-'}</td>
                      <td className="px-6 py-3">{t.program_name || (t.data && t.data.program_name) || 'Not Specified'}</td>
                      <td className="px-6 py-3">{formatDeletedDate(t.deleted_at)}</td>
                      <td className="px-6 py-3 text-red-600 font-medium">{getExpectedDeleteDate(t.deleted_at)}</td>
                      <td className="px-6 py-3">{t.original_id}</td>
                      <td className="px-6 py-3 text-center w-32" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center gap-1">
                          <button 
                            onClick={() => restoreTrashed(t.id)} 
                            className={`${BTN_SUCCESS}`}
                            title="Restore"
                          >
                            Restore
                          </button>
                          <button 
                            onClick={() => {
                              if (!window.confirm('Permanently delete this trashed application? This cannot be undone.')) return;
                              permanentlyDelete(t.id);
                            }}
                            className={`${BTN_DANGER}`}
                            title="Delete Permanently"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Email</th>
                  <th className="px-6 py-3 text-left font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left font-semibold">Program</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-center font-semibold">Documents</th>
                  <th className="px-6 py-3 text-center font-semibold w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No applicants found
                    </td>
                  </tr>
                ) : (
                  filtered.map(a => {
                    const isLocked = a.status === "Accepted" || a.status === "Rejected";
                    return (
                      <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={() => setShowView(a)}>
                        <td className="px-6 py-3">{a.full_name}</td>
                        <td className="px-6 py-3">{a.email}</td>
                        <td className="px-6 py-3">{a.phone || "-"}</td>
                        <td className="px-6 py-3">{a.program_name || "Not Specified"}</td>
                        <td className={`px-6 py-3 font-medium ${
                          a.status === "Accepted"
                            ? "text-green-600"
                            : a.status === "Rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}>
                          {a.status}
                        </td>
                        <td className="px-6 py-3 text-center">{FILE_COLUMNS.filter(f => a[f]).length}</td>
                        <td className="px-6 py-3 text-center w-32" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-center gap-1">
                            <button 
                              disabled={a.status === "Accepted" || a.status === "Rejected"} 
                              onClick={() => acceptRejectApplicant(a.id, "Accepted")}
                              title={a.status === "Accepted" || a.status === "Rejected" ? "Cannot accept after rejected or accepted" : "Accept"}
                              className={`${BTN_SUCCESS} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              Accept
                            </button>
                            <button 
                              disabled={a.status === "Accepted" || a.status === "Rejected"} 
                              onClick={() => acceptRejectApplicant(a.id, "Rejected")}
                              title={a.status === "Accepted" || a.status === "Rejected" ? "Cannot reject after already rejected or accepted" : "Reject"}
                              className={`${BTN_DANGER} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              Reject
                            </button>
                            <button
                              disabled={a.status === "Accepted" || a.status === "Pending"}
                              onClick={() => confirmDelete(a.id)}
                              title={a.status === "Accepted" ? "Cannot delete accepted applications" : a.status === "Pending" ? "Cannot delete pending applications" : "Delete"}
                              className={`${BTN_SECONDARY} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden space-y-4">
        {showTrash ? (
          trashedApplicants.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              No trashed applications found
            </div>
          ) : (
            trashedApplicants.map(t => (
              <div key={t.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="font-semibold text-blue-800 text-lg mb-2">{t.full_name || (t.data && t.data.full_name) || 'Unknown'}</div>
                <div className="text-gray-600 mb-1">{t.email || (t.data && t.data.email) || 'No email'}</div>
                <div className="text-gray-500 text-sm mb-2">{t.program_name || (t.data && t.data.program_name) || 'Not Specified'}</div>
                <div className="text-gray-400 text-xs mb-1">Deleted: {formatDeletedDate(t.deleted_at)}</div>
                <div className="text-red-600 text-xs font-medium mb-4">Expected Delete: {getExpectedDeleteDate(t.deleted_at)}</div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => restoreTrashed(t.id)} 
                    className={`${BTN_SUCCESS} flex-1`}
                  >
                    Restore
                  </button>
                  <button 
                    onClick={() => {
                      if (!window.confirm('Permanently delete this trashed application? This cannot be undone.')) return;
                      permanentlyDelete(t.id);
                    }}
                    className={`${BTN_DANGER} flex-1`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              No applicants found
            </div>
          ) : (
            filtered.map(a => {
              const isLocked = a.status === "Accepted" || a.status === "Rejected";
              return (
                <div key={a.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => setShowView(a)}>
                  <div className="font-semibold text-blue-800 text-lg mb-2">{a.full_name}</div>
                  <div className={`mb-1 font-medium ${
                    a.status === "Accepted"
                      ? "text-green-600"
                      : a.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}>{a.status}</div>
                  <div className="text-gray-600 mb-1">{a.email}</div>
                  <div className="text-gray-500 text-sm mb-4">{a.program_name || "Not Specified"}</div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                      disabled={a.status === "Accepted" || a.status === "Rejected"} 
                      onClick={() => acceptRejectApplicant(a.id, "Accepted")}
                      title={a.status === "Accepted" || a.status === "Rejected" ? "Cannot accept after rejected or accepted" : "Accept"}
                      className={`${BTN_SUCCESS} w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Check size={16} />
                      <span>Accept</span>
                    </button>
                    <button 
                      disabled={a.status === "Accepted" || a.status === "Rejected"} 
                      onClick={() => acceptRejectApplicant(a.id, "Rejected")}
                      title={a.status === "Accepted" || a.status === "Rejected" ? "Cannot reject after already rejected or accepted" : "Reject"}
                      className={`${BTN_DANGER} w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                    <button
                      disabled={a.status === "Accepted" || a.status === "Pending"}
                      onClick={() => confirmDelete(a.id)}
                      title={a.status === "Accepted" ? "Cannot delete accepted applications" : a.status === "Pending" ? "Cannot delete pending applications" : "Delete"}
                      className={`${BTN_SECONDARY} w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* VIEW MODAL */}
      {showView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-2">
          <div className="bg-white rounded-xl shadow-lg w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800">
                {showView.full_name}'s Files
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FILE_COLUMNS.map(f => {
                const fileURL = showView[f];
                const verified = showView[`${f}_verified`] === 1;

                return (
                  <div key={f} className="border bg-gray-50 rounded-lg p-3 shadow-sm flex flex-col items-center">
                    <div className="text-sm font-semibold text-gray-700 mb-2 text-center">{FILE_LABELS[f]}</div>

                    {fileURL ? (
                      <button onClick={() => window.open(`http://localhost:5000/${fileURL}`, "_blank")}
                        className="text-gray-600 hover:text-gray-800 mb-1">
                        <Eye size={24} />
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500 italic mb-1">No file uploaded</div>
                    )}

                    {fileURL && (
                      <div className="text-xs text-gray-400 truncate w-full text-center mb-2">
                        {fileURL.split("/").pop()}
                      </div>
                    )}

                    {fileURL && (
                      <div className="flex justify-between gap-2 mt-2">
                        <button
                          onClick={() => verifyFile(showView.id, f)}
                          className={`${verified ? "bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-md" : BTN_SUCCESS.replace("bg-green-600", "bg-green-600")} px-3 py-1 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 flex-1`}
                        >
                          {verified ? "Unverify" : "Verify"}
                        </button>

                        <button
                          onClick={() => showRemark(showView.id, f)}
                          className={`${BTN_DANGER} flex-1`}
                        >
                          Remark
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end relative">
              {(() => {
                const uploaded = FILE_COLUMNS.filter(f => showView[f]);
                const allVerified = uploaded.length > 0 && uploaded.every(f => showView[`${f}_verified`] === 1);

                return (
                  <>
                    {allVerified && (
                      <div className="relative mr-2">
                        <button
                          onClick={() => setShowVerifyAllConfirm(prev => !prev)}
                          className={BTN_PRIMARY}
                        >
                          Re-verify All
                        </button>

                        {showVerifyAllConfirm && (
                          <div className="absolute bottom-full mb-2 right-0 bg-white border rounded p-3 shadow text-sm w-64 z-50">
                            <div className="mb-3 text-gray-700">All uploaded files are already verified. Re-verify all files?</div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setShowVerifyAllConfirm(false)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-all duration-200">Cancel</button>
                              <button onClick={() => verifyAllFiles()} className={BTN_PRIMARY}>Confirm</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button onClick={() => setShowView(null)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-all duration-200">Close</button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* REMARK MODAL */}
      {remarkData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow p-4 w-80 max-w-[90vw] text-center">
            <h4 className="font-semibold text-blue-700 mb-2">{FILE_LABELS[remarkData.documentName]}</h4>
            <textarea
              className="w-full border rounded p-2 mb-4 text-sm"
              rows={4}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
            />
            {/* removed Trash Bin toggle from remark modal */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setRemarkData(null)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={saveRemark}
                className={BTN_DANGER}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-96 text-center shadow">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">Move this applicant to Trash Bin? You can restore it within 30 days.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-all duration-200">Cancel</button>
              <button onClick={doDelete} className={BTN_DANGER}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}

export default AdminApplicants;