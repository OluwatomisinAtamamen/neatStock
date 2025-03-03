import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './style/index.css'

import DashboardLayout from './layout/DashboardLayout.jsx';
import PublicLayout from './layout/PublicLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Home from './pages/Home.jsx';
import Items from './pages/Items.jsx';
import Search from './pages/Search.jsx';
import ErrorPage from './pages/ErrorPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
    ]
  },
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'dashboard', element: <Home /> },
      { path: 'search', element: <Search /> },
      { path: 'items', element: <Items /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);