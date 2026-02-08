import { Navigate, createBrowserRouter } from 'react-router-dom';
import HomeScreen from '@/pages/Home/HomeScreen';
import Playground from '@/pages/Playground';
import LoginScreen from '@/pages/Login/LoginScreen';
import SignupScreen from '@/pages/Signup/SignupScreen';
import ElderSelectScreen from '@/pages/Elders/ElderSelectScreen';
import DashboardScreen from '@/pages/Dashboard/DashboardScreen';
import SettingsScreen from '@/pages/Settings/SettingsScreen';
import ScheduleScreen from '@/pages/Schedule/ScheduleScreen';
import RobotControlScreen from '@/pages/Robot/RobotControlScreen';
import RobotLCDScreen from '@/pages/Robot/RobotLCDScreen';
import MedicationScreen from '@/pages/Medication/MedicationScreen';
import HistoryScreen from '@/pages/History/HistoryScreen';
import MapScreen from '@/pages/Map/MapScreen';
import NotificationScreen from '@/pages/Notification/NotificationScreen';
import EmergencyScreen from '@/pages/Emergency/EmergencyScreen';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import RootRedirect from '@/app/RootRedirect';
import RobotDeviceScreen from '@/pages/Robot/RobotDeviceScreen';

const enablePlayground = import.meta.env.VITE_ENABLE_PLAYGROUND === 'true';

export const router = createBrowserRouter([
    // Agent 2: Infra
    { path: '/', element: <RootRedirect /> },
    { path: '/home', element: <HomeScreen /> },
    { path: '/playground', element: enablePlayground ? <Playground /> : <Navigate to="/login" replace /> },

    // Agent 2: Pages (Phase 0.4)
    { path: '/login', element: <LoginScreen /> },
    { path: '/signup', element: <SignupScreen /> },
    {
        path: '/elders',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><ElderSelectScreen /></ProtectedRoute>,
    },
    {
        path: '/elders/:elderId',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><DashboardScreen /></ProtectedRoute>,
    },
    {
        path: '/elders/:elderId/schedule',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><ScheduleScreen /></ProtectedRoute>,
    },
    {
        path: '/elders/:elderId/robot',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><RobotControlScreen /></ProtectedRoute>,
    },
    {
        path: '/elders/:elderId/robot/lcd',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><RobotLCDScreen /></ProtectedRoute>,
    },
    {
        path: '/elders/:elderId/medications',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><MedicationScreen /></ProtectedRoute>,
    },
    {
        path: '/elders/:elderId/history',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><HistoryScreen /></ProtectedRoute>,
    },
    {
        path: '/elders/:elderId/map',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><MapScreen /></ProtectedRoute>,
    },
    {
        path: '/notifications',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><NotificationScreen /></ProtectedRoute>,
    },
    {
        path: '/settings',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><SettingsScreen /></ProtectedRoute>,
    },
    {
        path: '/emergency/:id',
        element: <ProtectedRoute allowRoles={['WORKER', 'FAMILY']}><EmergencyScreen /></ProtectedRoute>,
    },
    {
        path: '/robots/:robotId/lcd',
        element: <ProtectedRoute allowRoles={['ROBOT']}><RobotDeviceScreen /></ProtectedRoute>,
    },
]);
