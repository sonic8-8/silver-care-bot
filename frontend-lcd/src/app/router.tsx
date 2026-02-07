import { Navigate, createBrowserRouter } from 'react-router-dom'
import { LcdScreenPage } from '../pages/LcdScreenPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/robots/1" replace />,
  },
  {
    path: '/robots/:robotId',
    element: <LcdScreenPage />,
  },
])

