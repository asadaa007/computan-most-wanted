import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layouts/public/PublicLayout';
import AdminLayout from '../layouts/admin/AdminLayout';
import HomePage from '../pages/public/HomePage';
import PersonDetailPage from '../pages/public/PersonDetailPage';
import NotFound from '../pages/NotFound';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageEmployees from '../pages/admin/ManageEmployees';
import AddEmployee from '../pages/admin/AddEmployee';
import EditEmployee from '../pages/admin/EditEmployee';
import FormSubmissions from '../pages/admin/FormSubmissions';
import ManageDepartments from '../pages/admin/ManageDepartments';
import ManageAttendance from '../pages/admin/ManageAttendance';
import Settings from '../pages/admin/Settings';
import ProtectedRoute from '../components/admin/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'person/:slug',
        element: <PersonDetailPage />,
      },
      // Add more public routes here
    ],
  },
  {
    path: '/comp-admin',
    element: <AdminLogin />,
  },
  {
    path: '/comp-admin/dashboard',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
    ],
  },
  {
    path: '/comp-admin/employees',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ManageEmployees />,
      },
    ],
  },
  {
    path: '/comp-admin/employees/add',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AddEmployee />,
      },
    ],
  },
  {
    path: '/comp-admin/employees/edit/:id',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <EditEmployee />,
      },
    ],
  },
  {
    path: '/comp-admin/submissions',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <FormSubmissions />,
      },
    ],
  },
  {
    path: '/comp-admin/departments',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ManageDepartments />,
      },
    ],
  },
  {
    path: '/comp-admin/attendance',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ManageAttendance />,
      },
    ],
  },
  {
    path: '/comp-admin/settings',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]); 