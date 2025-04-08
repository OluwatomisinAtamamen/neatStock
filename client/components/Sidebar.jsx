import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsMenuButtonWideFill, BsFillGearFill, BsSearch} from 'react-icons/bs';

function Sidebar({openSidebarToggle, OpenSidebar}) {
  return (
    <aside className={`${openSidebarToggle ? "block" : "hidden md:block"} bg-card shadow-md p-4 row-span-2`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BsCart3 className="text-primary text-xl mr-2" /> 
          <span className="font-bold text-lg text-primary">SHOP</span>
        </div>
        <span className="md:hidden cursor-pointer text-text hover:text-primary" onClick={OpenSidebar}>X</span>
      </div>
      
      <ul className="space-y-4">
        <li>
          <Link to="/dashboard" className="flex items-center text-text hover:text-primary">
            <BsGrid1X2Fill className="mr-3" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/search" className="flex items-center text-text hover:text-primary">
            <BsSearch className="mr-3" /> Search
          </Link>
        </li>
        <li>
          <Link to="/items" className="flex items-center text-text hover:text-primary">
            <BsFillArchiveFill className="mr-3" /> Items
          </Link>
        </li>
        <li>
          <Link to="/reports" className="flex items-center text-text hover:text-primary">
            <BsMenuButtonWideFill className="mr-3" /> Reports
          </Link>
        </li>
        <li>
          <Link to="/settings" className="flex items-center text-text hover:text-primary">
            <BsFillGearFill className="mr-3" /> Settings
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