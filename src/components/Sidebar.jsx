import PropTypes from 'prop-types';
import {BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, 
  BsListCheck, BsMenuButtonWideFill, BsFillGearFill} from 'react-icons/bs';

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
          <a href="#" className="flex items-center text-text hover:text-primary">
            <BsGrid1X2Fill className="mr-3" /> Dashboard
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center text-text hover:text-primary">
            <BsFillArchiveFill className="mr-3" /> Products
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center text-text hover:text-primary">
            <BsFillGrid3X3GapFill className="mr-3" /> Categories
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center text-text hover:text-primary">
            <BsPeopleFill className="mr-3" /> Customers
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center text-text hover:text-primary">
            <BsListCheck className="mr-3" /> Inventory
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center text-text hover:text-primary">
            <BsMenuButtonWideFill className="mr-3" /> Reports
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center text-text hover:text-primary">
            <BsFillGearFill className="mr-3" /> Settings
          </a>
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