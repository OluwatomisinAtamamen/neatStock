import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { AuthContext } from '../context/auth';
import { HiMenuAlt1 } from 'react-icons/hi';

function DashboardLayout() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle button */}
      <button 
        className="sidebar-toggle"
        onClick={OpenSidebar}
        aria-label="Toggle sidebar"
      >
        <HiMenuAlt1 className="text-xl" />
      </button>
      
      <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
      
      <div className="main-content flex-1">
        <header className="header">
          <div>
            <h2 className="welcome-text">
              {user?.firstName ? `Welcome, ${user.firstName}` : 'Dashboard'}
            </h2>
          </div>
          <button 
            onClick={logout}
            className="logout-button"
          >
            Logout
          </button>
        </header>
        
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;