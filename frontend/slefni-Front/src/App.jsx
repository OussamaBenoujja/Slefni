import { Routes, Route } from "react-router-dom";
import SimPanel from "./components/simPanel";
import ApplyForm from "./components/ApplyForm";
import AdminDashboard from "./pages/adminDashboard";
import ApplicationDetail from "./pages/ApplicationDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SimPanel />} />
      <Route path="/apply" element={<ApplyForm />} />
      <Route path="/admin/" element={<AdminDashboard />} />
      <Route
        path="/admin/applications/:id"
        element={<ApplicationDetail />}
      />
    </Routes>
  );
}

export default App;
