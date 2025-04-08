import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { AuthContext } from '../context/auth';

function DashboardLayout() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <div className="grid grid-cols-[260px_1fr] grid-rows-[auto_1fr] min-h-screen">
      <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
      <header className="col-start-2 col-span-1 bg-white p-4 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            {user?.firstName ? `Welcome, ${user.firstName}` : 'Dashboard'}
          </h2>
        </div>
        <button 
          onClick={logout}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Logout
        </button>
      </header>
      <main className="col-start-2 col-span-1 row-start-2 p-6 bg-background">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;