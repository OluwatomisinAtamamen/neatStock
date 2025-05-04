import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import {
  BsGrid1X2Fill, 
  BsSearch, 
  BsGearFill, 
  BsJournalText,
  BsMap,
  BsFileEarmarkText
} from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';

function Sidebar({openSidebarToggle, OpenSidebar}) {
  const { pathname } = useLocation();
  
  return (
    <aside className={`fixed left-0 top-0 h-screen overflow-y-auto w-64 bg-card shadow-lg z-30 transition-all duration-300 ease-in-out transform ${openSidebarToggle ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:shadow-none lg:w-60`}>
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
      
      <ul className="space-y-2 px-2 pb-8">
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
    </aside>
  );
}

Sidebar.propTypes = {
  openSidebarToggle: PropTypes.bool.isRequired,
  OpenSidebar: PropTypes.func.isRequired,
};

export default Sidebar;