import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { BsPencil } from 'react-icons/bs';

function QuickCount({ onEditItem }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add state for tracking recently edited items
  const [recentlyEdited, setRecentlyEdited] = useState(() => {
    const saved = localStorage.getItem('neatstock-recently-edited');
    return saved ? JSON.parse(saved) : {};
  });

  // Filter items by search term and location
  const filteredItems = items.filter(item => {
    // Only show items for the selected location
    if (!selectedLocation) return false;
    
    // Check if item belongs to selected location
    const belongsToLocation = item.locations && 
      item.locations.includes(
        locations.find(l => l.location_id === selectedLocation)?.location_name
      );
    
    // Apply search filter if search term exists
    if (searchTerm) {
      return belongsToLocation && (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return belongsToLocation;
  });

  // Load locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('/data/search/locations');
        setLocations(res.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  // Load items when a location is selected
  useEffect(() => {
    if (!selectedLocation) {
      setItems([]);
      return;
    }
    
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/data/search/items', {
          params: {
            inInventoryOnly: true,
            locationId: selectedLocation,
            limit: 10000
          }
        });
        setItems(res.data.items || []);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [selectedLocation]);

  // Check for recently edited items and maintain the highlighting
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentlyEdited(prev => {
        const current = { ...prev };
        let changed = false;
        
        // Remove items older than 8 hours
        const now = Date.now();
        Object.keys(current).forEach(id => {
          if (now - current[id] > 8 * 60 * 60 * 1000) {
            delete current[id];
            changed = true;
          }
        });
        
        if (changed) {
          localStorage.setItem('neatstock-recently-edited', JSON.stringify(current));
        }
        return changed ? current : prev;
      });
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle count input
  const handleCountChange = (id, value) => {
    setCounts({ ...counts, [id]: value });
  };

  // Save counts
  const handleSave = async () => {
    if (!selectedLocation) return;
    
    setLoading(true);
    try {
      await axios.post('/data/inventory/stocktake', {
        locationId: selectedLocation,
        items: Object.fromEntries(
          Object.entries(counts)
            .filter(([, v]) => v !== '')
            .map(([id, count]) => [id, { count: parseInt(count) }])
        )
      });
      
      // Mark items as recently edited
      const updatedItems = { ...recentlyEdited };
      Object.keys(counts).forEach(id => {
        updatedItems[id] = Date.now();
      });
      setRecentlyEdited(updatedItems);
      localStorage.setItem('neatstock-recently-edited', JSON.stringify(updatedItems));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setCounts({});
      
      // Refresh items
      const res = await axios.get('/data/search/items', {
        params: {
          inInventoryOnly: true,
          locationId: selectedLocation,
          limit: 10000
        }
      });
      setItems(res.data.items || []);
      
    } catch (error) {
      console.error('Error saving counts:', error);
      alert('Failed to save counts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (item) => {
    const updatedItems = { ...recentlyEdited };
    updatedItems[item.item_id] = Date.now();
    setRecentlyEdited(updatedItems);
    localStorage.setItem('neatstock-recently-edited', JSON.stringify(updatedItems));
    
    if (onEditItem) onEditItem(item);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Location Stocktake</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Location selector (required) */}
          <div className="w-full md:w-1/3">
            <label className="block text-sm mb-1">
              Select Location <span className="text-red-500">*</span>
            </label>
            <select
              className="border rounded p-2 w-full"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Choose a location</option>
              {locations.map(loc => (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.location_name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div className="w-full md:w-2/3">
            <label className="block text-sm mb-1">Search</label>
            <input
              type="text"
              className="border rounded p-2 w-full"
              placeholder="Search items by name or SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={loading || !selectedLocation}
            />
          </div>
        </div>
        
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            Counts saved successfully!
          </div>
        )}
      </div>
      
      {!selectedLocation ? (
        <div className="p-6 text-center text-gray-500">
          Please select a location to begin counting items
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Current Count</th>
                  <th className="p-3 text-left">New Count</th>
                  <th className="p-3 text-left">+/-</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr key="loading">
                    <td colSpan="6" className="p-4 text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
                      <div className="mt-2">Loading items...</div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr key="empty">
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No items found in this location.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const diff =
                      counts[item.item_id] === undefined || counts[item.item_id] === ''
                        ? ''
                        : parseInt(counts[item.item_id]) - item.quantity;
                    
                    const isRecentlyEdited = recentlyEdited[item.item_id] ? true : false;
                    
                    return (
                      <tr 
                        key={item.item_id || item.id} 
                        className={`border-t ${isRecentlyEdited ? 'bg-green-50' : ''}`}
                      >
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.sku || 'N/A'}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            className="border rounded p-1 w-20"
                            value={counts[item.item_id] || ''}
                            onChange={e => handleCountChange(item.item_id, e.target.value)}
                            disabled={loading}
                          />
                        </td>
                        <td className="p-3">
                          <span className={diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}>
                            {diff === '' ? '-' : diff > 0 ? `+${diff}` : diff}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                            title="Edit Item"
                          >
                            <BsPencil />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Save button */}
          <div className="p-4 border-t flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading || Object.keys(counts).length === 0}
              className={`px-4 py-2 rounded ${
                Object.keys(counts).length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Saving...' : 'Save Counts'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

QuickCount.propTypes = {
  onEditItem: PropTypes.func
};

export default QuickCount;