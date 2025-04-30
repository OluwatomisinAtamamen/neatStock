import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsMenuButtonWideFill, BsFillGearFill, BsSearch} from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';

function Sidebar({openSidebarToggle, OpenSidebar}) {
  return (
    <aside className={`sidebar ${openSidebarToggle ? 'open' : ''}`}>
      <div className="branding">
        <BsCart3 className="text-primary text-xl" /> 
        <span>SHOP</span>
        <button 
          className="ml-auto text-text hover:text-primary lg:hidden" 
          onClick={OpenSidebar}
          aria-label="Close sidebar"
        >
          <IoMdClose className="text-xl" />
        </button>
      </div>
      
      <ul className="space-y-2 px-2">
        <li>
          <Link to="/dashboard" className="nav-item">
            <BsGrid1X2Fill /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/search" className="nav-item">
            <BsSearch /> Search
          </Link>
        </li>
        <li>
          <Link to="/items" className="nav-item">
            <BsFillArchiveFill /> Items
          </Link>
        </li>
        <li>
          <Link to="/reports" className="nav-item">
            <BsMenuButtonWideFill /> Reports
          </Link>
        </li>
        <li>
          <Link to="/settings" className="nav-item">
            <BsFillGearFill /> Settings
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