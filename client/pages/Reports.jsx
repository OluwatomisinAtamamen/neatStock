import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Reports() {
  const [activeTab, setActiveTab] = useState('lowStock');
  const [lowStockData, setLowStockData] = useState(null);
  const [spaceUtilisationData, setSpaceUtilisationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === 'lowStock') {
          const response = await axios.get('/data/reports/low-stock');
          setLowStockData(response.data);
        } else {
          const response = await axios.get('/data/reports/space-utilisation');
          setSpaceUtilisationData(response.data);
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab} data:`, err);
        setError(`Failed to load report data. ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted items
  const getSortedItems = (items) => {
    if (!sortConfig.key) return items;
    
    return [...items].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Get status color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'out_of_stock':
        return 'bg-red-600 text-white';
      case 'below_minimum':
        return 'bg-yellow-500 text-white';
      case 'near_minimum':
        return 'bg-blue-500 text-white';
      case 'critical':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'good':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // Format status label
  const formatStatusLabel = (status) => {
    switch (status) {
      case 'out_of_stock':
        return 'Out of Stock';
      case 'below_minimum':
        return 'Below Minimum';
      case 'near_minimum':
        return 'Near Minimum';
      case 'critical':
        return 'Critical';
      case 'warning':
        return 'Warning';
      case 'good':
        return 'Good';
      default:
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Prepare chart data for Low Stock tab
  const lowStockChartData = {
    labels: lowStockData?.summary ? ['Out of Stock', 'Below Minimum', 'Near Minimum'] : [],
    datasets: [{
      label: 'Item Count',
      data: lowStockData?.summary ? [
        lowStockData.summary.out_of_stock, 
        lowStockData.summary.below_minimum, 
        lowStockData.summary.near_minimum
      ] : [],
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)', // Red for Out of Stock
        'rgba(234, 179, 8, 0.7)',  // Yellow for Below Minimum
        'rgba(59, 130, 246, 0.7)'  // Blue for Near Minimum
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(234, 179, 8)',
        'rgb(59, 130, 246)'
      ],
      borderWidth: 1
    }]
  };

  // Prepare chart data for Space utilisation tab
  const prepareSpaceUtilisationChartData = () => {
    if (!spaceUtilisationData?.locations || spaceUtilisationData.locations.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb']
        }]
      };
    }

    const locations = spaceUtilisationData.locations.slice(0, 8); // Limit to top 8 locations
    
    return {
      labels: locations.map(location => location.location_name),
      datasets: [{
        label: 'Used Space',
        data: locations.map(location => location.used_space),
        backgroundColor: locations.map(location => {
          const percent = location.utilisation_percentage;
          if (percent >= 90) return 'rgba(239, 68, 68, A.7)'; // Critical - red
          if (percent >= 75) return 'rgba(234, 179, 8, 0.7)'; // Warning - yellow
          return 'rgba(34, 197, 94, 0.7)'; // Good - green
        })
      }, {
        label: 'Available Space',
        data: locations.map(location => location.available_space),
        backgroundColor: 'rgba(203, 213, 225, 0.7)' // Light gray for available
      }]
    };
  };

  // Space utilisation chart options
  const spaceUtilisationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Location Space utilisation'
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Space Units'
        }
      }
    }
  };

  // Low stock chart options
  const lowStockChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Low Stock Items by Category'
      }
    }
  };

  return (
    <section className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        {/* Future enhancement: Add date range selector and export options here */}
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <div className="flex">
          <button
            className={`py-3 px-6 font-medium ${activeTab === 'lowStock' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('lowStock')}
          >
            Low Stock
          </button>
          <button
            className={`py-3 px-6 font-medium ${activeTab === 'spaceUtilisation' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('spaceUtilisation')}
          >
            Space utilisation
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Low Stock View */}
          {activeTab === 'lowStock' && lowStockData && (
            <div>
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
                  <p className="text-3xl font-bold mt-1">{lowStockData.summary.total_low_stock}</p>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
                  <p className="text-3xl font-bold mt-1 text-red-600">{lowStockData.summary.out_of_stock}</p>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Below Minimum</h3>
                  <p className="text-3xl font-bold mt-1 text-yellow-500">{lowStockData.summary.below_minimum}</p>
                </div>
              </div>
              
              {/* Chart Container */}
              <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="h-64">
                  <Bar 
                    data={lowStockChartData} 
                    options={lowStockChartOptions}
                  />
                </div>
              </div>
              
              {/* Data Table */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('item_name')}
                        >
                          Item Name
                          {sortConfig.key === 'item_name' && (
                            sortConfig.direction === 'asc' 
                              ? <BsChevronUp className="inline ml-1" />
                              : <BsChevronDown className="inline ml-1" />
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('category_name')}
                        >
                          Category
                          {sortConfig.key === 'category_name' && (
                            sortConfig.direction === 'asc' 
                              ? <BsChevronUp className="inline ml-1" />
                              : <BsChevronDown className="inline ml-1" />
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('total_quantity')}
                        >
                          Current Stock
                          {sortConfig.key === 'total_quantity' && (
                            sortConfig.direction === 'asc' 
                              ? <BsChevronUp className="inline ml-1" />
                              : <BsChevronDown className="inline ml-1" />
                          )}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getSortedItems(lowStockData.items).map((item) => (
                        <tr key={item.item_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.item_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.category_name || 'Uncategorised'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.total_quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(item.stock_status)}`}>
                              {formatStatusLabel(item.stock_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Space utilisation View */}
          {activeTab === 'spaceUtilisation' && spaceUtilisationData && (
            <div>
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Overall Space Usage</h3>
                  <div className="flex items-end">
                    <p className="text-3xl font-bold mt-1">
                      {spaceUtilisationData.summary.overall_usage}%
                    </p>
                    <div className="ml-2 mb-1 w-24 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          spaceUtilisationData.summary.overall_usage >= 90 
                            ? 'bg-red-600' 
                            : spaceUtilisationData.summary.overall_usage >= 75 
                              ? 'bg-yellow-500' 
                              : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(spaceUtilisationData.summary.overall_usage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Most Full Location</h3>
                  <p className="text-3xl font-bold mt-1">
                    {spaceUtilisationData.summary.most_full_location.name}
                    <span className="text-lg ml-2">
                      ({spaceUtilisationData.summary.most_full_location.percentage}%)
                    </span>
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Available Space</h3>
                  <p className="text-3xl font-bold mt-1">
                    {Math.round(spaceUtilisationData.summary.total_available)} RSU
                  </p>
                  <p className="text-sm text-gray-500">
                    of {Math.round(spaceUtilisationData.summary.total_capacity)} total
                  </p>
                </div>
              </div>
              
              {/* Chart Container */}
              <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="h-64">
                  <Bar 
                    data={prepareSpaceUtilisationChartData()} 
                    options={spaceUtilisationChartOptions}
                  />
                </div>
              </div>
              
              {/* Data Table */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('location_name')}
                        >
                          Location
                          {sortConfig.key === 'location_name' && (
                            sortConfig.direction === 'asc' 
                              ? <BsChevronUp className="inline ml-1" />
                              : <BsChevronDown className="inline ml-1" />
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('capacity_rsu')}
                        >
                          Capacity (RSU)
                          {sortConfig.key === 'capacity_rsu' && (
                            sortConfig.direction === 'asc' 
                              ? <BsChevronUp className="inline ml-1" />
                              : <BsChevronDown className="inline ml-1" />
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('used_space')}
                        >
                          Used Space
                          {sortConfig.key === 'used_space' && (
                            sortConfig.direction === 'asc' 
                              ? <BsChevronUp className="inline ml-1" />
                              : <BsChevronDown className="inline ml-1" />
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('utilisation_percentage')}
                        >
                          utilisation
                          {sortConfig.key === 'utilisation_percentage' && (
                            sortConfig.direction === 'asc' 
                              ? <BsChevronUp className="inline ml-1" />
                              : <BsChevronDown className="inline ml-1" />
                          )}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getSortedItems(spaceUtilisationData.locations).map((location) => (
                        <tr key={location.location_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {location.location_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {parseFloat(location.capacity_rsu).toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {parseFloat(location.used_space).toFixed(1)} RSU
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-2">{location.utilisation_percentage}%</span>
                              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    location.utilisation_percentage >= 90 
                                      ? 'bg-red-600' 
                                      : location.utilisation_percentage >= 75 
                                        ? 'bg-yellow-500' 
                                        : 'bg-green-600'
                                  }`}
                                  style={{ width: `${Math.min(location.utilisation_percentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(location.utilisation_status)}`}>
                              {formatStatusLabel(location.utilisation_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Reports;