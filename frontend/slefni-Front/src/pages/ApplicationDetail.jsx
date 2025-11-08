import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const apiBase = "http://localhost:5000";

  useEffect(() => {
    const fetchApp = async () => {
      const token = localStorage.getItem("admin_token");
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiBase}/applications/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed with ${res.status}`);
        }
        const data = await res.json();
        // ensure basic shape so form doesn't crash
        setApp({
          notes: [],
          applicant: {},
          ...data,
        });
      } catch (err) {
        console.error(err);
        setError(
          typeof err?.message === "string" ? err.message : "Failed to load",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApp();
  }, [apiBase, id]);

  const handleStatusChange = (e) => {
    if (!app) return;
    setApp({ ...app, status: e.target.value });
  };

  const handlePriorityToggle = () => {
    if (!app) return;
    setApp({ ...app, priority: !app.priority });
  };

  const handleNotesChange = (e) => {
    if (!app) return;
    const value = e.target.value;
   
    const lines = value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setApp({ ...app, notes: lines });
  };

  const notesText = Array.isArray(app?.notes) ? app.notes.join("\n") : "";

  const saveChanges = async () => {
    if (!app) return;
    const token = localStorage.getItem("admin_token");
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/applications/${app.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: app.status,
          priority: !!app.priority,
          notes: Array.isArray(app.notes) ? app.notes : [],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Save failed with ${res.status}`);
      }
      // we don't really need response, but update timestamp if provided
      const updated = await res.json();
      setApp((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      console.error(err);
      setError(
        typeof err?.message === "string" ? err.message : "Failed to save",
      );
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Error loading application</h2>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center space-y-4">
          <p className="text-slate-400 mb-4">Application not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const name = app.applicant?.fullName || app.fullName || "Unknown";
  const status = (app.status || "pending").toLowerCase();

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    in_progress: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    accepted: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-slate-400 hover:text-white transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to applications
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePriorityToggle}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                app.priority
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
              }`}
            >
              {app.priority ? "⭐ Priority" : "Mark as priority"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Applicant & Loan Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Application #{app.id}</p>
                  <h1 className="text-2xl font-bold text-white">{name}</h1>
                </div>
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all focus:outline-none ${
                    statusColors[status] || "bg-slate-700 text-slate-300 border-slate-600"
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-slate-400 text-sm mb-3 uppercase tracking-wider">Applicant Details</h3>
                  <div className="space-y-2">
                    {app.applicant?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-300">{app.applicant.email}</span>
                      </div>
                    )}
                    {app.applicant?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-slate-300">{app.applicant.phone}</span>
                      </div>
                    )}
                    {app.applicant?.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-slate-300">{app.applicant.city}</span>
                      </div>
                    )}
                    {app.applicant?.cin && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <span className="text-slate-300">CIN: {app.applicant.cin}</span>
                      </div>
                    )}
                    {app.applicant?.monthlyIncome && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-slate-300">Income: {formatCurrency(app.applicant.monthlyIncome)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-slate-400 text-sm mb-3 uppercase tracking-wider">Loan Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Project</p>
                      <p className="text-white font-medium">{app.project || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Amount</p>
                      <p className="text-white font-medium text-lg">{formatCurrency(app.loanAmount)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Duration</p>
                        <p className="text-white font-medium">{app.duration} months</p>
                      </div>
                      {app.monthlyPayment && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Monthly</p>
                          <p className="text-white font-medium">{formatCurrency(app.monthlyPayment)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-3">Internal Notes</h3>
              <textarea
                value={notesText}
                onChange={handleNotesChange}
                rows={8}
                className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                placeholder="Add internal notes about this application..."
              />
            </div>
          </div>

          {/* Right: Actions & Timestamps */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 space-y-4">
              <h3 className="text-white font-semibold">Actions</h3>
              
              <button
                onClick={saveChanges}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 space-y-3">
              <h3 className="text-white font-semibold text-sm">Timeline</h3>
              <div className="space-y-2">
                {app.createdAt && (
                  <div>
                    <p className="text-slate-500 text-xs">Created</p>
                    <p className="text-slate-300 text-sm">{new Date(app.createdAt).toLocaleString()}</p>
                  </div>
                )}
                {app.updatedAt && (
                  <div>
                    <p className="text-slate-500 text-xs">Last Updated</p>
                    <p className="text-slate-300 text-sm">{new Date(app.updatedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;
