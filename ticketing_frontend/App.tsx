
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketListPage from './pages/TicketListPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import EquipmentRequestListPage from './pages/EquipmentRequestListPage';
import CreateEquipmentRequestPage from './pages/CreateEquipmentRequestPage';
import EquipmentRequestDetailsPage from './pages/EquipmentRequestDetailsPage';
import UserRequestListPage from './pages/UserRequestListPage';
import CreateUserRequestPage from './pages/CreateUserRequestPage';
import UserRequestDetailsPage from './pages/UserRequestDetailsPage';
import StudentRequestListPage from './pages/StudentRequestListPage';
import CreateStudentRequestPage from './pages/CreateStudentRequestPage';
import StudentRequestDetailsPage from './pages/StudentRequestDetailsPage';
import UserManagementPage from './pages/UserManagementPage';
import TaskManagerPage from './pages/TaskManagerPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LicenseExpiredPage from './pages/LicenseExpiredPage';
import { useNotifications } from './hooks/useNotifications';
import NotificationContainer from './components/common/NotificationContainer';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { SUPER_ADMIN_EMAIL_PLACEHOLDER } from './constants';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; superAdminOnly?: boolean }> = ({ children, adminOnly = false, superAdminOnly = false }) => {
  const { isAuthenticated, user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (superAdminOnly && user?.email !== SUPER_ADMIN_EMAIL_PLACEHOLDER) {
     // Note: SUPER_ADMIN_EMAIL_PLACEHOLDER is used from constants.ts
     // This check is simplified here. Proper super admin check is on backend.
    // return <Navigate to="/forbidden" replace />; 
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/forbidden" replace />; // A generic forbidden page
  }

  return <>{children}</>;
};


const App: React.FC = () => {
  const { licenseExpired } = useAuth(); 

  if (licenseExpired) {
    return <LicenseExpiredPage />;
  }
  
  return (
    <>
      <NotificationContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/license-expired" element={<LicenseExpiredPage />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/new" element={<CreateTicketPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailsPage />} />
          
          <Route path="requests/equipment" element={<EquipmentRequestListPage />} />
          <Route path="requests/equipment/new" element={<CreateEquipmentRequestPage />} />
          <Route path="requests/equipment/:requestId" element={<EquipmentRequestDetailsPage />} />

          <Route path="requests/users" element={<UserRequestListPage />} />
          <Route path="requests/users/new" element={<CreateUserRequestPage />} />
          <Route path="requests/users/:requestId" element={<UserRequestDetailsPage />} />

          <Route path="requests/students" element={<StudentRequestListPage />} />
          <Route path="requests/students/new" element={<CreateStudentRequestPage />} />
          <Route path="requests/students/:requestId" element={<StudentRequestDetailsPage />} />

          <Route path="admin/user-management" element={<ProtectedRoute adminOnly={true}><UserManagementPage /></ProtectedRoute>} />
          <Route path="admin/task-manager" element={<ProtectedRoute adminOnly={true}><TaskManagerPage /></ProtectedRoute>} />
          
          <Route path="profile" element={<ProfilePage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;