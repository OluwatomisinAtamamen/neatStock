import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import {
  BsGrid1X2Fill,
  BsBoxArrowRight,
  BsJournalText,
  BsMap,
  BsSearch,
  BsFileEarmarkText,
  BsGearFill,
} from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { AuthContext } from '../context/auth';

function Sidebar({openSidebarToggle, OpenSidebar}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <aside className={`fixed left-0 top-0 h-screen overflow-y-auto w-64 bg-card shadow-lg z-30 transition-all duration-300 ease-in-out transform ${openSidebarToggle ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:shadow-none lg:w-60 flex flex-col`}>
      <div className="flex items-center gap-2 text-primary font-bold text-xl mb-8 px-4 pt-4">
        <span>NeatStock</span>
        <button 
          className="ml-auto text-text hover:text-primary lg:hidden" 
          onClick={OpenSidebar}
          aria-label="Close sidebar"
        >
          <IoMdClose className="text-xl" />
        </button>
      </div>
      
      <ul className="space-y-2 px-2 pb-8 flex-grow">
        {/* Dashboard - Overview */}
        <li>
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-200 
            ${pathname === '/dashboard' 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'hover:bg-gray-100 text-text'}`}
          >
            <BsGrid1X2Fill /> Dashboard
          </Link>
        </li>
        
        {/* Stocktake - Count and add items */}
        <li>
          <Link 
            to="/stocktake" 
            className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-200 
            ${pathname === '/stocktake' 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'hover:bg-gray-100 text-text'}`}
          >
            <BsJournalText /> Stocktake
          </Link>
        </li>
        
        {/* Locations - Manage storage locations */}
        <li>
          <Link 
            to="/locations" 
            className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-200 
            ${pathname === '/locations' 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'hover:bg-gray-100 text-text'}`}
          >
            <BsMap /> Locations
          </Link>
        </li>
        
        {/* Search - Advanced search */}
        <li>
          <Link 
            to="/search" 
            className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-200 
            ${pathname === '/search' 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'hover:bg-gray-100 text-text'}`}
          >
            <BsSearch /> Search
          </Link>
        </li>
        
        {/* Reports */}
        <li>
          <Link 
            to="/reports" 
            className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-200 
            ${pathname === '/reports' 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'hover:bg-gray-100 text-text'}`}
          >
            <BsFileEarmarkText /> Reports
          </Link>
        </li>
        
        {/* Settings */}
        <li>
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-200 
            ${pathname === '/settings' 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'hover:bg-gray-100 text-text'}`}
          >
            <BsGearFill /> Settings
          </Link>
        </li>
      </ul>
      
      {/* Logout button - added at the bottom */}
      <div className="px-2 pb-6 mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 p-3 rounded-md transition-colors duration-200 text-red-600 hover:bg-red-50"
        >
          <BsBoxArrowRight /> Logout
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  openSidebarToggle: PropTypes.bool.isRequired,
  OpenSidebar: PropTypes.func.isRequired,
};

export default Sidebar;