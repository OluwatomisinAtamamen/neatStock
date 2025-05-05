import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

function EditItem({ item, onSave }) {
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize form with item data
  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        sku: item.sku || '',
        barcode: item.barcode || '',
        description: item.description || '',
        categoryId: item.category_id || '',
        locationId: '',
        quantity: item.quantity_in_stock || 0,
        minStockLevel: item.min_stock_level || 0,
        rsuValue: item.rsu_value || 1,
        costPrice: item.cost_price || 0,
        unitPrice: item.unit_price || 0,
        packSize: item.pack_size || 1,
        catalogId: item.catalog_id || null
      });
    }
  }, [item]);

  // Load categories and locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          axios.get('/data/search/categories'),
          axios.get('/data/search/locations')
        ]);
        setCategories(catRes.data || []);
        setLocations(locRes.data || []);
      } catch (err) {
        console.error('Failed to load form data:', err);
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseFloat(value) : value;
    setForm(prev => ({ ...prev, [name]: finalValue }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update the item
      await axios.put(`/data/inventory/items/${item.item_id}`, {
        name: form.name,
        sku: form.sku,
        categoryId: form.categoryId,
        minStockLevel: parseInt(form.minStockLevel) || 0,
        rsuValue: parseFloat(form.rsuValue) || 1,
        costPrice: parseFloat(form.costPrice) || 0,
        unitPrice: parseFloat(form.unitPrice) || 0
      });
      
      // If location is specified, update item quantity in this location
      if (form.locationId) {
        await axios.post(`/data/inventory/items/${item.item_id}/locations`, {
          locationId: form.locationId,
          quantity: parseInt(form.quantity) || 0
        });
      }
      
      // Show success message
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSave) onSave();
      }, 1500);
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="mb-2 p-2 bg-green-100 text-green-700 rounded">
          Item updated successfully!
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Item Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          className="w-full p-2 border rounded"
          value={form.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            className="w-full p-2 border rounded"
            value={form.sku}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            name="categoryId"
            className="w-full p-2 border rounded"
            value={form.categoryId}
            onChange={handleChange}
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
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Location for Stock Update
          </label>
          <select
            name="locationId"
            className="w-full p-2 border rounded"
            value={form.locationId}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select Location</option>
            {locations.map(loc => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.location_name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Optional. Select to update stock in a specific location.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            min="0"
            step="1"
            className="w-full p-2 border rounded"
            value={form.quantity}
            onChange={handleChange}
            disabled={loading || !form.locationId}
          />
          <p className="text-xs text-gray-500 mt-1">
            {!form.locationId ? 'Select a location to update quantity' : ''}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Min Stock Level
          </label>
          <input
            type="number"
            name="minStockLevel"
            min="0"
            step="1"
            className="w-full p-2 border rounded"
            value={form.minStockLevel}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            RSU Value
          </label>
          <select
            name="rsuValue"
            className="w-full p-2 border rounded"
            value={form.rsuValue}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="0.25">Small (0.25)</option>
            <option value="0.5">Medium (0.5)</option>
            <option value="1">Standard (1)</option>
            <option value="2">Large (2)</option>
            <option value="4">Extra Large (4)</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cost Price
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
            <input
              type="number"
              name="costPrice"
              min="0"
              step="0.01"
              className="w-full p-2 pl-8 border rounded"
              value={form.costPrice}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Unit Price
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
            <input
              type="number"
              name="unitPrice"
              min="0"
              step="0.01"
              className="w-full p-2 pl-8 border rounded"
              value={form.unitPrice}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          name="description"
          rows="3"
          className="w-full p-2 border rounded"
          value={form.description}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
          ) : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

EditItem.propTypes = {
  item: PropTypes.object,
  onSave: PropTypes.func
};

export default EditItem;