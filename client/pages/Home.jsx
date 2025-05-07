import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BsBoxSeam, BsExclamationTriangle, BsPlusLg, BsQuestionCircle } from 'react-icons/bs';
import { FaWarehouse, FaChartBar } from 'react-icons/fa';
import ReferenceInfo from '../components/ReferenceInfo';

function Home() {
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalValue: 0,
    spaceUtilization: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/data/dashboard');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <BsQuestionCircle /> Help & Info
        </button>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Inventory Items */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Items</p>
              <h3 className="text-2xl font-bold">
                {loading ? '...' : metrics.totalItems}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <BsBoxSeam size={20} />
            </div>
          </div>
        </div>
        
        {/* Space Utilization */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Space Utilization</p>
              <h3 className="text-2xl font-bold">
                {loading ? '...' : `${metrics.spaceUtilization}%`}
              </h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <FaWarehouse size={20} />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                metrics.spaceUtilization > 90 ? 'bg-red-500' : 
                metrics.spaceUtilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`} 
              style={{ width: `${loading ? 0 : metrics.spaceUtilization}%` }}
            ></div>
          </div>
        </div>
        
        {/* Low Stock Alerts */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold">
                {loading ? '...' : metrics.lowStockItems}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
              <BsExclamationTriangle size={20} />
            </div>
          </div>
        </div>
        
        {/* Inventory Value */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Inventory Value</p>
              <h3 className="text-2xl font-bold">
                {loading ? '...' : `£${metrics.totalValue.toFixed(2)}`}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <FaChartBar size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Add Item */}
        <Link 
          to="/stocktake"
          className="bg-card p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-primary text-white rounded-full mb-4">
              <BsPlusLg size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Add Items</h3>
            <p className="text-gray-500">Add new items to your inventory or update existing ones</p>
          </div>
        </Link>
        
        {/* View Reports */}
        <Link 
          to="/reports"
          className="bg-card p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-blue-600 text-white rounded-full mb-4">
              <FaChartBar size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">View Reports</h3>
            <p className="text-gray-500">Access detailed reports and analytics for your inventory</p>
          </div>
        </Link>
        
        {/* Manage Locations */}
        <Link 
          to="/locations"
          className="bg-card p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-green-600 text-white rounded-full mb-4">
              <FaWarehouse size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Manage Locations</h3>
            <p className="text-gray-500">Organize your storage spaces and track utilization</p>
          </div>
        </Link>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Help & Information</h2>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <ReferenceInfo onClose={() => setShowHelp(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;