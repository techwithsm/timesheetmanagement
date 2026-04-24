import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import StudentsPage from './pages/students/Students';
import StudentDetailPage from './pages/students/StudentDetail';
import StudentFormPage from './pages/students/StudentForm';
import TeachersPage from './pages/Teachers';
import ClassesPage from './pages/Classes';
import AttendancePage from './pages/attendance/Attendance';
import MarkAttendancePage from './pages/attendance/MarkAttendance';
import AttendanceHistoryPage from './pages/attendance/AttendanceHistory';
import HolidaysPage from './pages/Holidays';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import ProfilePage from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/new" element={<StudentFormPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/students/:id/edit" element={<StudentFormPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/attendance/mark" element={<MarkAttendancePage />} />
          <Route path="/attendance/history" element={<AttendanceHistoryPage />} />
          <Route path="/holidays" element={<HolidaysPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
