import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import RoleSelect from './pages/auth/RoleSelect';
import Dashboard from './pages/Dashboard';
import Projects from './pages/projects/Projects';
import ProjectDetails from './pages/projects/ProjectDetails';
import MyTasks from './pages/tasks/MyTasks';
import type { UserRole } from './types';

const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/my-tasks'} />;
};

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: UserRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/choose" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/choose" element={<RoleSelect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <HomeRedirect />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute role="admin">
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute role="admin">
              <Layout>
                <Projects />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/projects/:id" element={
            <ProtectedRoute role="admin">
              <Layout>
                <ProjectDetails />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/my-tasks" element={
            <ProtectedRoute role="member">
              <Layout>
                <MyTasks />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
