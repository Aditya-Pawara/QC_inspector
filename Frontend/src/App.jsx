import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/FooterComponent";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RecentInspections from "./pages/RecentInspections";
import InspectionDetail from "./pages/InspectionDetail";
import UserProfile from "./pages/UserProfile";
import AuthGuard from "./components/AuthGuard";
import DashboardLayout from "./components/DashboardLayout";

const PublicLayout = () => {
  return (
    <div className="font-sans text-gray-900 dark:text-gray-100 bg-slate-50 dark:bg-slate-800">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Pages with Navbar & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Dashboard Pages with Sidebar */}
      <Route element={
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recent-inspections" element={<RecentInspections />} />
        <Route path="/inspections/:id" element={<InspectionDetail />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
