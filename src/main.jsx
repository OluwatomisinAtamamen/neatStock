import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ErrorPage from './pages/ErrorPage.jsx';

const router = createBrowserRouter([{
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: <Login />, 
    errorElement: <ErrorPage />,
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/reports',
    element: <Reports />, 
    errorElement: <ErrorPage />,
  },
  {
    path: '/settings',
    element: <Settings />, 
    errorElement: <ErrorPage />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />, 
    errorElement: <ErrorPage />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
