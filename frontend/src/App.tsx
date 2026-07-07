import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/shared/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { TeacherLogin } from './pages/auth/TeacherLogin';
import { StudentLogin } from './pages/auth/StudentLogin';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { CreateAssignment } from './pages/teacher/CreateAssignment';
import { SubmittedAssignments } from './pages/teacher/SubmittedAssignments';
import { TeacherProfile } from './pages/teacher/TeacherProfile';
import { BatchManagement } from './pages/teacher/BatchManagement';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { AssignmentDetail } from './pages/student/AssignmentDetail';
import { LearningProgress } from './pages/student/LearningProgress';
import { StudentProfile } from './pages/student/StudentProfile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Teacher Auth */}
            <Route
              path="/teacher/login"
              element={<PublicRoute role="teacher"><TeacherLogin /></PublicRoute>}
            />

            {/* Teacher Protected */}
            <Route
              path="/teacher/dashboard"
              element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>}
            />
            <Route
              path="/teacher/batches"
              element={<ProtectedRoute role="teacher"><BatchManagement /></ProtectedRoute>}
            />
            <Route
              path="/teacher/assignments"
              element={<ProtectedRoute role="teacher"><TeacherAssignments /></ProtectedRoute>}
            />
            <Route
              path="/teacher/assignments/create"
              element={<ProtectedRoute role="teacher"><CreateAssignment /></ProtectedRoute>}
            />
            <Route
              path="/teacher/assignments/edit/:id"
              element={<ProtectedRoute role="teacher"><CreateAssignment /></ProtectedRoute>}
            />
            <Route
              path="/teacher/submitted"
              element={<ProtectedRoute role="teacher"><SubmittedAssignments /></ProtectedRoute>}
            />
            <Route
              path="/teacher/profile"
              element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>}
            />

            {/* Student Auth */}
            <Route
              path="/student/login"
              element={<PublicRoute role="student"><StudentLogin /></PublicRoute>}
            />

            {/* Student Protected */}
            <Route
              path="/student/dashboard"
              element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}
            />
            <Route
              path="/student/assignments"
              element={<ProtectedRoute role="student"><StudentAssignments /></ProtectedRoute>}
            />
            <Route
              path="/student/assignments/:id"
              element={<ProtectedRoute role="student"><AssignmentDetail /></ProtectedRoute>}
            />
            <Route
              path="/student/progress"
              element={<ProtectedRoute role="student"><LearningProgress /></ProtectedRoute>}
            />
            <Route
              path="/student/profile"
              element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>}
            />

            {/* Redirect /student to /student/dashboard */}
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--brand-background)',
              color: 'var(--text-primary)',
              border: '1px solid var(--brand-border)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#01AC9F', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'white' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
