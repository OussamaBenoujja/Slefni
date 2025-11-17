import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SimPanel() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    creditType: "auto",
    profession: "",
    project: "",
    loanAmount: 600000,
    duration: 12,
    // these are technical fields, user doesn't edit them directly
    annualRate: 0,
    fees: 0,
    insuranceRate: 0,
    monthlyPayment: 0,
  });

  const handleChange = (name, value) => {
    setForm((old) => ({ ...old, [name]: value }));
  };

  // simple presets: normally this would come from admin settings, here we hardcode
  const getPreset = () => {
    if (form.creditType === "immo") {
      return { annualRate: 4.5, fees: 2000, insuranceRate: 0.3 };
    }
    if (form.creditType === "conso") {
      return { annualRate: 7.9, fees: 500, insuranceRate: 0.5 };
    }
    // default auto
    return { annualRate: 5.5, fees: 1000, insuranceRate: 0.4 };
  };

  // this is a very simplified formula, good enough for the mock
  const computeMonthlyPayment = () => {
    const preset = getPreset();
    const P = Number(form.loanAmount) || 0;
    const n = Number(form.duration) || 1;
    const rYear = Number(preset.annualRate) || 0;
    const r = rYear / 100 / 12;

    if (!P || !n) return 0;

    if (!r) {
      return Math.round(P / n);
    }

    const top = P * r * Math.pow(1 + r, n);
    const bottom = Math.pow(1 + r, n) - 1;
    const m = top / bottom;
    return Math.round(m);
  };

  const computeTotalCost = () => {
    const m = computeMonthlyPayment();
    const n = Number(form.duration) || 0;
    const fees = Number(getPreset().fees) || 0;
    const total = m * n + fees;
    return total;
  };

  const computeSimpleApr = () => {
    const P = Number(form.loanAmount) || 0;
    const total = computeTotalCost();
    if (!P) return 0;
    const interest = total - P;
    const years = (Number(form.duration) || 1) / 12;
    if (!years) return 0;
    const apr = (interest / P / years) * 100;
    return Math.round(apr * 10) / 10;
  };

  const buildAmortizationPreview = () => {
    const rows = [];
    const P = Number(form.loanAmount) || 0;
    const n = Number(form.duration) || 1;
    const rYear = Number(getPreset().annualRate) || 0;
    const r = rYear / 100 / 12;
    const m = computeMonthlyPayment();
    let remaining = P;

    const maxRows = Math.min(n, 6);
    for (let i = 1; i <= maxRows; i++) {
      const interest = Math.round(remaining * r);
      const principal = m - interest;
      remaining = remaining - principal;
      rows.push({ month: i, interest, principal, remaining: Math.max(0, Math.round(remaining)) });
    }
    return rows;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = async () => {
    const payload = {
      profession: form.profession,
      project: form.project,
      loanAmount: form.loanAmount,
      duration: form.duration,
      monthlyPayment: computeMonthlyPayment(),
    };

    try {
      const res = await fetch("http://localhost:5000/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to save simulation");
      }
      navigate("/apply", { state: { ...payload } });
    } catch (err) {
      console.error(err);
      alert(" Failed to save simulation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Credit Simulator
          </h1>
          <p className="text-slate-400 text-sm">
            Get an instant estimate of your monthly payments
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Credit Type Cards */}
          {[
            { value: 'auto', label: 'Auto Loan', icon: '🚗', rate: '5.5%' },
            { value: 'conso', label: 'Personal', icon: '💰', rate: '7.9%' },
            { value: 'immo', label: 'Mortgage', icon: '🏠', rate: '4.5%' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => handleChange('creditType', type.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                form.creditType === type.value
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="text-white font-semibold text-sm">{type.label}</div>
              <div className="text-slate-400 text-xs mt-1">From {type.rate}</div>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-5">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 text-lg">Your Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">
                    Profession
                  </label>
                  <select
                    value={form.profession}
                    onChange={(e) => handleChange("profession", e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="">Select your profession</option>
                    <option value="PRIVATE_EMPLOYEE">Private sector</option>
                    <option value="PUBLIC_EMPLOYEE">Government</option>
                    <option value="SELF_EMPLOYED_PROFESSIONAL">Self-employed</option>
                    <option value="MERCHANT">Merchant</option>
                    <option value="CRAFTSMAN">Craftsman</option>
                    <option value="RETIRED">Retired</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm mb-2">
                    Project
                  </label>
                  <select
                    value={form.project}
                    onChange={(e) => handleChange("project", e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="">Select a project</option>
                    <option value="PERSONAL_LOAN">Personal needs</option>
                    <option value="USED_CAR">Used vehicle</option>
                    <option value="NEW_CAR">New vehicle</option>
                    <option value="UNEXPECTED_EXPENSES">Emergency expenses</option>
                    <option value="HOME_EQUIPMENT">Home equipment</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 text-lg">Loan Details</h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300 text-sm">Amount</label>
                    <span className="text-blue-400 font-semibold">
                      {formatCurrency(form.loanAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="10000"
                    value={form.loanAmount}
                    onChange={(e) => handleChange("loanAmount", Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>10K</span>
                    <span>1M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300 text-sm">Duration</label>
                    <span className="text-blue-400 font-semibold">
                      {form.duration} months
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    step="6"
                    value={form.duration}
                    onChange={(e) => handleChange("duration", Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1 year</span>
                    <span>10 years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 shadow-2xl">
              <div className="text-blue-100 text-sm mb-2">Your monthly payment</div>
              <div className="text-white text-5xl font-bold mb-1">
                {formatCurrency(computeMonthlyPayment())}
              </div>
              <div className="text-blue-200 text-xs">per month for {form.duration} months</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 space-y-4">
              <h3 className="text-white font-semibold mb-3">Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Total amount</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(form.loanAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Interest rate</span>
                  <span className="text-white font-semibold">
                    {getPreset().annualRate}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Application fees</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(getPreset().fees)}
                  </span>
                </div>

                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Total to repay</span>
                    <span className="text-blue-400 font-bold text-lg">
                      {formatCurrency(computeTotalCost())}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">APR (TAEG)</span>
                  <span className="text-slate-300 text-sm">
                    {computeSimpleApr()}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
            >
              Apply for this loan
            </button>

            <p className="text-xs text-slate-500 text-center">
              This is an estimate. Final rates depend on your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimPanel;
