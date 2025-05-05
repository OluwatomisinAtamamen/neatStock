import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { HiMenuAlt1 } from 'react-icons/hi';

function DashboardLayout() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle button */}
      <button 
        className="fixed top-4 left-4 z-40 p-2 rounded-md bg-primary text-white lg:hidden"
        onClick={OpenSidebar}
        aria-label="Toggle sidebar"
      >
        <HiMenuAlt1 className="text-xl" />
      </button>
      
      <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
      
      <div className="w-full min-h-screen bg-background p-4 transition-all duration-300 flex-1 lg:ml-60">
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;