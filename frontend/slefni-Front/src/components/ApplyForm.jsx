import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ApplyForm() {
  const { state: simulation } = useLocation();
  const navigate = useNavigate();

  const [applicant, setApplicant] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    cin: "",
    monthlyIncome: "",
    situation: "",
    comment: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicant({ ...applicant, [name]: value });
  };

  const validate = () => {
    const newErrors = {};

    if (!applicant.fullName.trim()) newErrors.fullName = "Name is required";
    if (!applicant.email.trim()) newErrors.email = "Email is required";
    if (applicant.email && !applicant.email.includes("@"))
      newErrors.email = "Email looks invalid";
    if (!applicant.phone.trim()) newErrors.phone = "Phone is required";
    if (!applicant.monthlyIncome.trim())
      newErrors.monthlyIncome = "Monthly income is required";

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const payload = {
      profession: simulation?.profession,
      project: simulation?.project,
      loanAmount: simulation?.loanAmount,
      duration: simulation?.duration,
      monthlyPayment: simulation?.monthlyPayment,
      applicant,
    };

    try {
      const res = await fetch("http://localhost:5000/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit application");

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong while submitting");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (!simulation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">No simulation found</h2>
          <p className="text-slate-400">
            Please complete a simulation first before applying.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Start simulation
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Application submitted!
            </h2>
            <p className="text-slate-400">
              We've received your credit application. Our team will review it and contact you within 24-48 hours.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Loan amount</span>
              <span className="text-white font-semibold">{formatCurrency(simulation?.loanAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Monthly payment</span>
              <span className="text-white font-semibold">{formatCurrency(simulation?.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Duration</span>
              <span className="text-white font-semibold">{simulation?.duration} months</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-slate-400 hover:text-white transition mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to simulator
          </button>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Complete Your Application
          </h1>
          <p className="text-slate-400 text-sm">
            Just a few more details to finalize your loan request
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Left Column - Summary (2/5) */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 shadow-2xl sticky top-6">
              <h3 className="text-blue-100 text-sm mb-4">Your loan summary</h3>
              
              <div className="space-y-3 mb-6">
                <div>
                  <div className="text-blue-200 text-xs mb-1">Monthly payment</div>
                  <div className="text-white text-3xl font-bold">
                    {formatCurrency(simulation?.monthlyPayment)}
                  </div>
                </div>
                
                <div className="border-t border-blue-400/30 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Loan amount</span>
                    <span className="text-white font-semibold">{formatCurrency(simulation?.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Duration</span>
                    <span className="text-white font-semibold">{simulation?.duration} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Project</span>
                    <span className="text-white font-semibold text-right">{simulation?.project}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/20 rounded-lg p-3 text-xs text-blue-100">
                This is a preliminary estimate. Final terms will be confirmed after review.
              </div>
            </div>
          </div>

          {/* Right Column - Form (3/5) */}
          <div className="md:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 space-y-6">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Personal Information</h3>
                <p className="text-slate-400 text-xs">All fields marked with * are required</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-300 text-sm mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={applicant.fullName}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 text-sm mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={applicant.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 text-sm mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={applicant.phone}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="+212 6XX XXX XXX"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 text-sm mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={applicant.city}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm mb-2">CIN / ID</label>
                  <input
                    type="text"
                    name="cin"
                    value={applicant.cin}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Identity number"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-white font-semibold text-lg mb-4">Financial Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">
                      Monthly Income <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={applicant.monthlyIncome}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                        placeholder="5000"
                      />
                      <span className="absolute right-3 top-3 text-slate-500 text-sm">MAD</span>
                    </div>
                    {errors.monthlyIncome && (
                      <p className="text-xs text-red-400 mt-1">{errors.monthlyIncome}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-2">
                      Professional Status
                    </label>
                    <select
                      name="situation"
                      value={applicant.situation}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="">Select status</option>
                      <option value="cdi">Permanent contract (CDI)</option>
                      <option value="cdd">Fixed-term (CDD)</option>
                      <option value="self">Self-employed</option>
                      <option value="public">Public servant</option>
                      <option value="student">Student</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Additional Comments
                </label>
                <textarea
                  name="comment"
                  value={applicant.comment}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                  placeholder="Any additional information you'd like to share..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplyForm;
