// App.jsx - Main application component with routing
// Handles all routes for admin and participant flows

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateQuiz from './pages/admin/CreateQuiz';
import ManageQuestions from './pages/admin/ManageQuestions';
import QuizControl from './pages/admin/QuizControl';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import MasterSettings from './pages/admin/MasterSettings';
import JoinQuiz from './pages/participant/JoinQuiz';
import LiveQuestion from './pages/participant/LiveQuestion';

// Home redirect component
const HomeRedirect = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin' : '/join'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Home Redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute adminOnly>
                <MasterSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/create" element={
              <ProtectedRoute adminOnly>
                <CreateQuiz />
              </ProtectedRoute>
            } />
            <Route path="/admin/quiz/:quizId/questions" element={
              <ProtectedRoute adminOnly>
                <ManageQuestions />
              </ProtectedRoute>
            } />
            <Route path="/admin/quiz/:quizId/control" element={
              <ProtectedRoute adminOnly>
                <QuizControl />
              </ProtectedRoute>
            } />
            <Route path="/admin/quiz/:quizId/results" element={
              <ProtectedRoute adminOnly>
                <AdminLeaderboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/quiz/:quizId" element={
              <ProtectedRoute adminOnly>
                <ManageQuestions />
              </ProtectedRoute>
            } />

            {/* Participant Routes */}
            <Route path="/join" element={
              <ProtectedRoute>
                <JoinQuiz />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:quizId" element={
              <ProtectedRoute>
                <LiveQuestion />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
