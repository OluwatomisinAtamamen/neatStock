import { useState, useEffect } from 'react';
import axios from 'axios';
import { BsSearch, BsPlus, BsInfoCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

function Search() {
  const navigate = useNavigate();
  
  // State for search and results
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filter options
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // State for selected item and detail view
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          axios.get('/data/search/categories'),
          axios.get('/data/search/locations')
        ]);
        
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setError('Failed to load filter options');
        setCategories([]);
        setLocations([]);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Search function
  const searchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/data/search/items', {
        params: {
          query,
          category,
          location,
          stockStatus,
          sortBy: 'name',
          sortDir: 'asc',
          page: 1,
          limit: 50
        }
      });
      
      setItems(Array.isArray(response.data.items) ? response.data.items : []);
      setLoading(false);
    } catch (err) {
      console.error('Error searching items:', err);
      setError(`Failed to search items: ${err.message}`);
      setLoading(false);
      setItems([]);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    searchItems();
  };

  // Handle item click to show details
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  // Close detail view
  const closeDetails = () => {
    setShowDetails(false);
    setSelectedItem(null);
  };

  // Handle adding an item from the catalog to business inventory
  const handleAddToInventory = (item) => {
    localStorage.setItem('neatstock-catalog-item', JSON.stringify(item));
    navigate('/stocktake');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-text mb-6">Search Inventory</h1>
      
      {/* Search Bar */}
      <div className="bg-card rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search by name or SKU/barcode..." 
                className="w-full p-3 pl-10 border border-gray-300 rounded-md"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BsSearch className="text-gray-400" />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
          
          {/* Filter Options */}
          <div className="flex flex-wrap gap-4">
            <select 
              className="p-2 border border-gray-300 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_name}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            
            <select 
              className="p-2 border border-gray-300 rounded"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc.location_id} value={loc.location_name}>
                  {loc.location_name}
                </option>
              ))}
            </select>
            
            <select 
              className="p-2 border border-gray-300 rounded"
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="catalog-only">Catalog Items</option>
            </select>
          </div>
        </form>
      </div>
      
      {/* Results */}
      <div className="bg-card rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {query ? 'No items found. Try a different search term.' : 'Search for items to get started.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU/Barcode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr 
                    key={item.id} 
                    onClick={() => handleItemClick(item)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="h-10 w-10 mr-3 rounded object-cover" 
                          />
                        )}
                        <span>{item.name}</span>
                        {item.quantity === 0 && !item.is_from_catalog && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Out of Stock</span>
                        )}
                        {!item.is_from_catalog && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Catalog Item</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.sku || item.barcode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.category_name || 'Uncategorised'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.is_from_catalog ? item.quantity : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        className="text-primary hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                      >
                        <BsInfoCircle />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Item Detail Modal */}
      {showDetails && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedItem.name}</h2>
              <button 
                onClick={closeDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {selectedItem.image_url && (
              <img 
                src={selectedItem.image_url} 
                alt={selectedItem.name}
                className="w-full h-48 object-contain mb-4 bg-gray-50 rounded" 
              />
            )}
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-sm text-gray-500">SKU/Barcode:</div>
              <div>{selectedItem.sku || selectedItem.barcode || 'N/A'}</div>
              
              <div className="text-sm text-gray-500">Category:</div>
              <div>{selectedItem.category_name || 'Uncategorised'}</div>
              
              {selectedItem.is_from_catalog ? (
                <>
                  <div className="text-sm text-gray-500">Quantity:</div>
                  <div>{selectedItem.quantity}</div>
                  
                  <div className="text-sm text-gray-500">Location(s):</div>
                  <div>
                    {selectedItem.locations && selectedItem.locations.length > 0 
                      ? selectedItem.locations.join(', ') 
                      : 'None'}
                  </div>
                  
                  {selectedItem.cost_price !== null && (
                    <>
                      <div className="text-sm text-gray-500">Cost Price:</div>
                      <div>${selectedItem.cost_price}</div>
                    </>
                  )}
                  
                  {selectedItem.unit_price !== null && (
                    <>
                      <div className="text-sm text-gray-500">Unit Price:</div>
                      <div>${selectedItem.unit_price}</div>
                    </>
                  )}
                </>
              ) : (
                <div className="col-span-2 text-sm text-gray-500 mt-2">
                  This item is from the catalog and not yet in your inventory.
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              {!selectedItem.is_from_catalog ? (
                <button 
                  onClick={() => handleAddToInventory(selectedItem)}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-1"
                >
                  <BsPlus size={20} /> Add to Inventory
                </button>
              ) : (
                <button 
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                  onClick={closeDetails}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;