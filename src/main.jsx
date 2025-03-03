import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './style/index.css'

import App from './layout/DashboardLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Home from './pages/Home.jsx';
import ErrorPage from './pages/ErrorPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
      { path: 'dashboard', element: <Home /> },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);