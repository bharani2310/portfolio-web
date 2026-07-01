import { Routes, Route } from 'react-router-dom';
import Portfolio from './pages/Portfolio.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import AdminExperience from './pages/admin/AdminExperience.jsx';
import AdminSkills from './pages/admin/AdminSkills.jsx';
import AdminProjects from './pages/admin/AdminProjects.jsx';
import AdminMessages from './pages/admin/AdminMessages.jsx';
import AdminPassword from './pages/admin/AdminPassword.jsx';
import ProtectedRoute from './pages/admin/components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminProfile />} />
        <Route path="experience" element={<AdminExperience />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="password" element={<AdminPassword />} />
      </Route>
    </Routes>
  );
}
