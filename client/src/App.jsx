import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CoursePage from './pages/CoursePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import QuizPage from './pages/QuizPage';
import CertificatePage from './pages/CertificatePage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';

// Protected Route Component
function ProtectedRoute({ children, role }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="surface rounded-3xl px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // check role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col page-bg">
      {user && <Navbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
            <Route path="/course/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
            <Route path="/course/:id/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute role="student"><DashboardPage /></ProtectedRoute>} />
            <Route path="/teacher-dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboardPage /></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><CertificatePage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
      {user && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
