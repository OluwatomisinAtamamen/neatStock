import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <div className="grid grid-cols-[260px_1fr] grid-rows-[auto_1fr] min-h-screen">
      <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
      <main className="col-start-2 col-span-1 row-span-2 p-6 bg-background">
        <Outlet />
      </main>
    </div>
  );
}

export default App;