import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { BsSearch, BsPlusLg, BsTrash } from 'react-icons/bs';

function AddItem({ onComplete}) {
  // Main state for multiple items
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('neatstock-additems');
    return savedItems ? JSON.parse(savedItems) : [createEmptyItem()];
  });
  
  // Form support data
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Catalog search
  const [searchResults, setSearchResults] = useState({});
  const [showResults, setShowResults] = useState({});
  const [searchLoading, setSearchLoading] = useState({});
  const searchTimers = useRef({});

  // Create an empty item template
  function createEmptyItem() {
    return {
      name: '',
      sku: '',
      barcode: '',
      description: '',
      categoryId: '',
      locationId: '',
      quantity: 1,
      minStockLevel: 0,
      rsuValue: 1,
      costPrice: 0,
      unitPrice: 0,
      packSize: 1,
      catalogId: null,
      isNewCatalogItem: true
    };
  }
  
  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('neatstock-additems', JSON.stringify(items));
  }, [items]);
  
  // Load categories and locations when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, locRes] = await Promise.all([
          axios.get('/data/search/categories'),
          axios.get('/data/search/locations')
        ]);
        setCategories(catRes.data || []);
        setLocations(locRes.data || []);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // selectCatalogItem function to prevent recreation on every render
  const selectCatalogItem = useCallback(async (index, item) => {
    try {
      setItems(currentItems => {
        const updatedItems = [...currentItems];
        
        // Common properties regardless of item type
        updatedItems[index] = {
          ...updatedItems[index],
          name: item.name,
          barcode: item.barcode || '',
          description: item.description || '',
          packSize: item.pack_size || 1
        };
        
        if (item.is_from_catalog) {
          Object.assign(updatedItems[index], {
            itemId: item.id,
            catalogId: item.catalog_id,
            costPrice: item.cost_price || 0,
            unitPrice: item.unit_price || 0,
            categoryId: item.category_id || '',
            minStockLevel: item.min_stock_level || 0,
            isNewCatalogItem: false,
            isExistingInventoryItem: true
          });
        } else {
          Object.assign(updatedItems[index], {
            catalogId: item.id,
            isNewCatalogItem: false
          });
        }
        
        return updatedItems;
      });
    } catch (err) {
      console.error("Error checking item details:", err);
    } finally {
      setShowResults(prev => ({ ...prev, [index]: false }));
    }
  }, []);


  // Check for catalog item in localStorage on mount
  useEffect(() => {
    const savedCatalogItem = localStorage.getItem('neatstock-catalog-item');
    if (savedCatalogItem) {
      try {
        const item = JSON.parse(savedCatalogItem);
        
        // Reuse existing selectCatalogItem function
        selectCatalogItem(0, item);
        
        // Remove the item from localStorage
        localStorage.removeItem('neatstock-catalog-item');
      } catch (error) {
        console.error('Error parsing catalog item from localStorage:', error);
      }
    }
  }, [selectCatalogItem]);
  
  // Search catalog with debouncing
  const searchCatalog = useCallback((index, query) => {
    if (!query || query.length < 2) {
      setSearchResults(prev => ({ ...prev, [index]: [] }));
      return;
    }
    
    // Clear existing timer
    if (searchTimers.current[index]) {
      clearTimeout(searchTimers.current[index]);
    }
    
    setSearchLoading(prev => ({ ...prev, [index]: true }));
    setShowResults(prev => ({ ...prev, [index]: true }));
    
    // Set new timer
    searchTimers.current[index] = setTimeout(async () => {
      try {
        const res = await axios.get('/data/search/items', {
          params: { 
            query,
            inInventoryOnly: false
          }
        });
        setSearchResults(prev => ({ ...prev, [index]: res.data.items || [] }));
      } catch (err) {
        console.error('Error searching catalog:', err);
      } finally {
        setSearchLoading(prev => ({ ...prev, [index]: false }));
      }
    }, 300);
  }, []);
  
  // Handle input change for a specific item
  const handleChange = useCallback((index, name, value) => {
    // Handle name changes (which may need catalog search)
    if (name === 'name') {
      searchCatalog(index, value);
    }
    
    // Update the specific item using functional state update
    setItems(currentItems => {
      const updatedItems = [...currentItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value
      };
      return updatedItems;
    });
  }, [searchCatalog]);
  
  // Add another empty item
  const addItem = useCallback(() => {
    setItems(currentItems => [...currentItems, createEmptyItem()]);
  }, []);
  
  // Remove an item
  const removeItem = useCallback((index) => {
    setItems(currentItems => {
      if (currentItems.length === 1) {
        // Don't remove the last item, just clear it
        return [createEmptyItem()];
      } else {
        return currentItems.filter((_, i) => i !== index);
      }
    });
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Process each item
      const promises = items.map(item => {
        const itemData = {
          ...item,
          costPrice: parseFloat(item.costPrice) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          quantity: parseInt(item.quantity) || 0,
          minStockLevel: parseInt(item.minStockLevel) || 0,
          rsuValue: parseFloat(item.rsuValue) || 1,
          packSize: parseInt(item.packSize) || 1,
        };
        
        return axios.post('/data/inventory/items', itemData);
      });
      
      await Promise.all(promises);
      
      // Reset form
      setItems([createEmptyItem()]);
      localStorage.removeItem('neatstock-additems');
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Notify parent component
      if (onComplete) onComplete();
      
    } catch (err) {
      console.error('Error adding items:', err);
      alert('Failed to add one or more items. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear form
  const clearForm = useCallback(() => {
    if (window.confirm('Clear all items from the form?')) {
      setItems([createEmptyItem()]);
      localStorage.removeItem('neatstock-additems');
    }
  }, []);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {success && (
        <div className="p-2 bg-green-100 text-green-700 rounded">
          All items added successfully!
        </div>
      )}
      
      {items.map((item, index) => (
        <div key={index} className="p-4 border rounded-md bg-gray-50 relative">
          {items.length > 1 && (
            <button 
              type="button"
              onClick={() => removeItem(index)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
              title="Remove Item"
            >
              <BsTrash />
            </button>
          )}
          
          <h3 className="font-medium mb-4">Item {index + 1}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Product name with search */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={item.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  required
                  autoComplete="off"
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {searchLoading[index] ? (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  ) : (
                    <BsSearch className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Search results */}
              {showResults[index] && searchResults[index]?.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults[index].map(catalogItem => (
                    <div 
                      key={catalogItem.id} 
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => selectCatalogItem(index, catalogItem)}
                    >
                      <div>
                        <div className="font-medium">{catalogItem.name}</div>
                        <div className="text-sm text-gray-500">
                          {catalogItem.barcode && `Barcode: ${catalogItem.barcode}`} 
                          {catalogItem.category_name && ` • ${catalogItem.category_name}`}
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {catalogItem.is_from_catalog ? 'In Inventory' : 'Catalog Only'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {!item.isNewCatalogItem && (
                <div className="text-xs text-blue-600 mt-1">
                  Using existing catalog item
                </div>
              )}
            </div>
            
            {/* SKU */}
            <div>
              <label className="block text-sm font-medium mb-1">
                SKU
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={item.sku}
                onChange={(e) => handleChange(index, 'sku', e.target.value)}
                disabled={loading}
              />
            </div>
            
            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Barcode {item.isNewCatalogItem && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={item.barcode}
                onChange={(e) => handleChange(index, 'barcode', e.target.value)}
                required={item.isNewCatalogItem}
                disabled={loading}
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                className="w-full p-2 border rounded"
                value={item.categoryId}
                onChange={(e) => handleChange(index, 'categoryId', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-2 border rounded"
                value={item.locationId}
                onChange={(e) => handleChange(index, 'locationId', e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select Location</option>
                {locations.map(loc => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {loc.location_name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full p-2 border rounded"
                value={item.quantity}
                onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {/* Min Stock */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Stock Level
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full p-2 border rounded"
                value={item.minStockLevel}
                onChange={(e) => handleChange(index, 'minStockLevel', e.target.value)}
                disabled={loading}
              />
            </div>
            
            {/* RSU Value */}
            <div>
              <label className="block text-sm font-medium mb-1">
                RSU Value
              </label>
              <select
                className="w-full p-2 border rounded"
                value={item.rsuValue}
                onChange={(e) => handleChange(index, 'rsuValue', e.target.value)}
                disabled={loading}
              >
                <option value="0.25">Small (0.25)</option>
                <option value="0.5">Medium (0.5)</option>
                <option value="1">Standard (1)</option>
                <option value="2">Large (2)</option>
                <option value="4">Extra Large (4)</option>
              </select>
            </div>
            
            {/* Pack Size */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pack Size {item.isNewCatalogItem && <span className="text-red-500">*</span>}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="w-full p-2 border rounded"
                value={item.packSize}
                onChange={(e) => handleChange(index, 'packSize', e.target.value)}
                required={item.isNewCatalogItem}
                disabled={loading || !item.isNewCatalogItem} // Fixed logic
              />
            </div>
            
            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Cost Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full p-2 pl-8 border rounded"
                  value={item.costPrice}
                  onChange={(e) => handleChange(index, 'costPrice', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full p-2 pl-8 border rounded"
                  value={item.unitPrice}
                  onChange={(e) => handleChange(index, 'unitPrice', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Description - spans multiple columns */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                rows="2"
                className="w-full p-2 border rounded"
                value={item.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex flex-wrap gap-3 justify-between">
        <div>
          <button
            type="button"
            onClick={addItem}
            className="bg-white border border-primary text-primary px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2"
            disabled={loading}
          >
            <BsPlusLg /> Add Another Item
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearForm}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            disabled={loading}
          >
            Clear Form
          </button>
          
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
            ) : (
              <BsPlusLg />
            )}
            Save All Items
          </button>
        </div>
      </div>
    </form>
  );
}

AddItem.propTypes = {
  onComplete: PropTypes.func
};

export default AddItem;