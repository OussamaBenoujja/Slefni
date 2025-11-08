import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function ApplicationsTable() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt_desc");

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apiBase = useMemo(() => "http://localhost:5000", []);

  const fetchApplications = async () => {
    const token = localStorage.getItem("admin_token");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/applications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }

  const data = await res.json();
  setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(
        typeof err?.message === "string"
          ? err.message
          : "Failed to load applications",
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${apiBase}/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Update failed with ${res.status}`);
      }
      fetchApplications(); // refresh table
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(
        typeof err?.message === "string" ? err.message : "Failed to update",
      );
    }
  };

  const formatAmount = (val) => {
    if (typeof val !== "number") return "-";
    try {
      return new Intl.NumberFormat("en-MA").format(val) + " MAD";
    } catch (_) {
      return `${val} MAD`;
    }
  };

  const filteredAndSorted = useMemo(() => {
    let items = [...applications];

    // filter by status
    if (statusFilter !== "all") {
      items = items.filter(
        (a) => (a.status || "pending").toLowerCase() === statusFilter,
      );
    }

    // search by name or email
    const term = search.trim().toLowerCase();
    if (term) {
      items = items.filter((a) => {
        const name = (a.applicant?.fullName || a.fullName || "").toLowerCase();
        const email = (a.applicant?.email || "").toLowerCase();
        return name.includes(term) || email.includes(term);
      });
    }

    // sort
    items.sort((a, b) => {
      const field = sortBy.startsWith("createdAt") ? "createdAt" : "updatedAt";
      const dir = sortBy.endsWith("asc") ? 1 : -1;
      const av = a[field] ? new Date(a[field]).getTime() : 0;
      const bv = b[field] ? new Date(b[field]).getTime() : 0;
      return (av - bv) * dir;
    });

    return items;
  }, [applications, search, statusFilter, sortBy]);

  const total = applications.length;
  const pendingCount = applications.filter(
    (a) => (a.status || "pending").toLowerCase() === "pending",
  ).length;
  const inProgressCount = applications.filter(
    (a) => (a.status || "pending").toLowerCase() === "in_progress",
  ).length;
  const acceptedCount = applications.filter(
    (a) => (a.status || "pending").toLowerCase() === "accepted",
  ).length;
  const rejectedCount = applications.filter(
    (a) => (a.status || "pending").toLowerCase() === "rejected",
  ).length;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Status:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                All <span className="opacity-70">({total})</span>
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "pending"
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/20"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Pending <span className="opacity-70">({pendingCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("in_progress")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "in_progress"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                In Progress <span className="opacity-70">({inProgressCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("accepted")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "accepted"
                    ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Accepted <span className="opacity-70">({acceptedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "rejected"
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Rejected <span className="opacity-70">({rejectedCount})</span>
              </button>
            </div>
          </div>

          <div className="flex-1" />

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
            >
              <option value="createdAt_desc">Newest first</option>
              <option value="createdAt_asc">Oldest first</option>
              <option value="updatedAt_desc">Recently updated</option>
              <option value="updatedAt_asc">Least recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading applications...</p>
                  </div>
                </td>
              </tr>
            ) : filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((app) => {
                const name = app?.applicant?.fullName || app?.fullName || "Unknown";
                const project = app?.project || "—";
                const amount = formatAmount(app?.loanAmount);
                const duration = typeof app?.duration === "number" ? `${app.duration} mo` : "-";
                const status = (app?.status || "pending").toLowerCase();

                const statusColors = {
                  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                  in_progress: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                  accepted: "bg-green-500/10 text-green-400 border-green-500/20",
                  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
                };

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/admin/applications/${app.id}`)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors text-left"
                      >
                        {name}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-sm">
                      {project}
                    </td>
                    <td className="px-4 py-4 text-white font-medium text-sm">
                      {amount}
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-sm">
                      {duration}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus:outline-none ${
                          statusColors[status] || "bg-slate-700 text-slate-300 border-slate-600"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">No applications found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicationsTable;
