import { createBrowserRouter } from 'react-router-dom';
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

export const router = createBrowserRouter([
    // Agent 2: Infra
    { path: '/', element: <HomeScreen /> },
    { path: '/playground', element: <Playground /> },

    // Agent 2: Pages (Phase 0.4)
    { path: '/login', element: <LoginScreen /> },
    { path: '/signup', element: <SignupScreen /> },
    { path: '/elders', element: <ElderSelectScreen /> },
    { path: '/elders/:elderId', element: <DashboardScreen /> },
    { path: '/elders/:elderId/schedule', element: <ScheduleScreen /> },
    { path: '/elders/:elderId/robot', element: <RobotControlScreen /> },
    { path: '/elders/:elderId/robot/lcd', element: <RobotLCDScreen /> },
    { path: '/elders/:elderId/medications', element: <MedicationScreen /> },
    { path: '/elders/:elderId/history', element: <HistoryScreen /> },
    { path: '/elders/:elderId/map', element: <MapScreen /> },
    { path: '/notifications', element: <NotificationScreen /> },
    { path: '/settings', element: <SettingsScreen /> },
    { path: '/emergency/:id', element: <EmergencyScreen /> },
]);
