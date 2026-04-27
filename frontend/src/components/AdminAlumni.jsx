import React, { useEffect, useState } from "react";
import api from "../api/axios";

const sampleAlumni = [
  {
    id: "sample-1",
    full_name: "Maria Santos",
    college_id: "2020-00123",
    program_name: "Bachelor of Arts in English Language Studies",
    batch: "2020 - 2021",
    email: "maria.santos@example.com",
    created_at: "2026-01-12T09:15:00Z",
    isSample: true,
  },
  {
    id: "sample-2",
    full_name: "John Dela Cruz",
    college_id: "2019-00456",
    program_name: "Bachelor of Science in Business Administration - Marketing Management",
    batch: "2019 - 2020",
    email: "john.delacruz@example.com",
    created_at: "2026-02-05T14:30:00Z",
    isSample: true,
  },
  {
    id: "sample-3",
    full_name: "Liza Cruz",
    college_id: "2018-00987",
    program_name: "Bachelor of Science in Hospitality Management",
    batch: "2018 - 2019",
    email: "liza.cruz@example.com",
    created_at: "2026-03-21T11:45:00Z",
    isSample: true,
  },
];

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [decisionById, setDecisionById] = useState({});

  const loadAlumni = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/admin/alumni");
      setAlumni(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAlumni([]);
      setMessage(err?.response?.data?.message || "Failed to load alumni");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlumni();
  }, []);

  useEffect(() => {
    const handleAlumniUpdated = () => {
      loadAlumni();
    };

    window.addEventListener("alumni-updated", handleAlumniUpdated);

    return () => {
      window.removeEventListener("alumni-updated", handleAlumniUpdated);
    };
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this alumni record?");
    if (!confirmed) return;

    setMessage("");
    try {
      await api.delete(`/admin/alumni/${id}`);
      await loadAlumni();
      setMessage("Alumni deleted successfully.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to delete alumni");
    }
  };

  const handleDecision = (id, decision) => {
    setDecisionById((prev) => ({ ...prev, [id]: decision }));
    setMessage(`Alumni marked as ${decision}.`);
  };

  const displayedAlumni = alumni.length > 0 ? alumni : sampleAlumni;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Alumni</h1>
          <p className="text-sm text-gray-500">Manage alumni records from the dashboard.</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-blue-800">Manage Alumni List</h2>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading alumni...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-medium text-gray-600">S.No</th>
                  <th className="py-3 px-4 font-medium text-gray-600">Full Name</th>
                  <th className="py-3 px-4 font-medium text-gray-600">College ID</th>
                  <th className="py-3 px-4 font-medium text-gray-600">Program</th>
                  <th className="py-3 px-4 font-medium text-gray-600">Batch</th>
                  <th className="py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-600">Status</th>
                  <th className="py-3 px-4 font-medium text-gray-600">Registration Date</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedAlumni.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.full_name}</td>
                    <td className="py-3 px-4">{item.college_id || "-"}</td>
                    <td className="py-3 px-4">{item.program_name || "-"}</td>
                    <td className="py-3 px-4">{item.batch || "-"}</td>
                    <td className="py-3 px-4">{item.email}</td>
                    <td className="py-3 px-4 text-center align-middle">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          (decisionById[item.id] || item.status) === "Approved"
                            ? "bg-green-100 text-green-700"
                            : (decisionById[item.id] || item.status) === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {decisionById[item.id] || item.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-middle">{item.created_at ? new Date(item.created_at).toLocaleString() : "-"}</td>
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDecision(item.id, "Approved")}
                        className="min-w-[76px] rounded-md bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(item.id, "Rejected")}
                        className="min-w-[76px] rounded-md bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600"
                      >
                        Reject
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
