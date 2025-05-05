import { useState, useEffect } from 'react';
import axios from 'axios';
import { BsPlusLg, BsSearch, BsPencil, BsTrash, BsXLg } from 'react-icons/bs';

function Locations() {
  // State for locations data
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // State for add/edit panel
  const [showPanel, setShowPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [locationImage, setLocationImage] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({
    location_name: '',
    location_code: '',
    description: '',
    capacity_rsu: 100,
    image_url: ''
  });

  // State for toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch locations when component mounts
  useEffect(() => {
    fetchLocations();
  }, []);

  // Apply search and sort when locations, searchTerm, or sortBy changes
  useEffect(() => {
    if (locations.length > 0) {
      let filtered = [...locations];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(location => 
          location.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.location_code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        if (sortBy === 'name') {
          return a.location_name.localeCompare(b.location_name);
        } else if (sortBy === 'utilisation') {
          const utilisationA = a.current_rsu_usage / a.capacity_rsu;
          const utilisationB = b.current_rsu_usage / b.capacity_rsu;
          return utilisationB - utilisationA;
        }
        return 0;
      });
      
      setFilteredLocations(filtered);
    }
  }, [locations, searchTerm, sortBy]);

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/data/locations');
      setLocations(response.data);
      setFilteredLocations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setError('Failed to fetch locations. Please try again later.');
      setLoading(false);
    }
  };

  // Handler for adding a new location
  const handleAddLocation = () => {
    setCurrentLocation({
      location_name: '',
      location_code: '',
      description: '',
      capacity_rsu: 100,
      image_url: ''
    });
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setLocationImage(null);
    setShowPanel(true);
  };

  // Handler for editing a location
  const handleEditLocation = (location) => {
    setCurrentLocation({...location});
    setIsEditing(true);
    setShowDeleteConfirm(false);
    setShowPanel(true);
  };

  // Handler for form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLocation(prev => ({
      ...prev,
      [name]: name === 'capacity_rsu' ? parseInt(value, 10) : value
    }));
  };

  // Handler for image upload
  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Store file for preview
      setLocationImage(selectedFile);
      
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        // Upload the file
        const response = await axios.post('/data/locations/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Update the image URL in form state
        setCurrentLocation(prev => ({
          ...prev,
          image_url: response.data.imageUrl
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Failed to upload image. Please try again.', 'error');
      }
    }
  };

  // Handler for saving location (create or update)
  const handleSaveLocation = async () => {
    try {
      // Validate required fields
      if (!currentLocation.location_name || !currentLocation.location_code || !currentLocation.capacity_rsu) {
        showToast('Please fill out all required fields', 'error');
        return;
      }

      if (isEditing) {
        // Update existing location
        const response = await axios.put(
          `/data/locations/${currentLocation.location_id}`, 
          currentLocation
        );
        
        setLocations(prev => 
          prev.map(loc => 
            loc.location_id === currentLocation.location_id ? response.data : loc
          )
        );
        
        showToast('Location updated successfully!');
      } else {
        // Create new location
        const response = await axios.post('/data/locations', currentLocation);
        setLocations(prev => [...prev, response.data]);
        showToast('Location created successfully!');
      }
      
      // Close the panel and reset image
      setLocationImage(null);
      setShowPanel(false);
    } catch (err) {
      console.error('Failed to save location:', err);
      showToast(err.response?.data?.message || 'Error saving location', 'error');
    }
  };

  // Handler for deleting a location
  const handleDeleteLocation = async () => {
    try {
      const response = await axios.delete(`/data/locations/${currentLocation.location_id}`);
      
      setLocations(prev => 
        prev.filter(loc => loc.location_id !== currentLocation.location_id)
      );
      
      // Close the panel
      setShowPanel(false);
      if ( response.status === 200 ) {
        showToast('Location removed successfully');
      }
    } catch (err) {
      console.error('Failed to delete location:', err);
      showToast(err.response?.data?.message || 'Error deleting location', 'error');
    }
  };

  // Calculate utilisation percentage
  const calculateUtilisation = (current, capacity) => {
    return (current / capacity) * 100;
  };

  // Get colour class based on utilisation
  const getUtilisationColourClass = (utilisation) => {
    if (utilisation >= 90) return 'bg-red-500';
    if (utilisation >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-text">Locations</h1>
      
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search locations..." 
            className="w-full p-3 pl-10 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <BsSearch className="text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            className="p-3 border border-gray-300 rounded-md"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="utilisation">Sort by Utilisation</option>
          </select>
          
          <button 
            className="bg-primary text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center gap-2"
            onClick={handleAddLocation}
          >
            <BsPlusLg /> Add Location
          </button>
        </div>
      </div>
      
      {/* Locations grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">No locations found. Click `Add Location` to create your first location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map(location => (
            <div 
              key={location.location_id} 
              className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{location.location_name}</h3>
                  <span className="text-sm text-gray-500">{location.location_code}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditLocation(location)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit Location"
                  >
                    <BsPencil />
                  </button>
                </div>
              </div>
              
              {location.image_url && (
                <div className="mb-3 h-24 overflow-hidden rounded-md bg-gray-100">
                  <img 
                    src={location.image_url} 
                    alt={location.location_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300?text=Image+Not+Available';
                    }}
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{location.description}</p>
              
              <div className="mb-1 flex justify-between">
                <span className="text-sm font-medium">Space Utilisation</span>
                <span className="text-sm">{location.current_rsu_usage}/{location.capacity_rsu} RSU</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className={`h-2.5 rounded-full ${getUtilisationColourClass(calculateUtilisation(location.current_rsu_usage, location.capacity_rsu))}`}
                  style={{ width: `${calculateUtilisation(location.current_rsu_usage, location.capacity_rsu)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => handleEditLocation(location)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Manage Location
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add/Edit Panel - Slide in from right */}
      <div className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-lg transform ${showPanel ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-30 overflow-y-auto`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {isEditing ? `Edit Location: ${currentLocation.location_name}` : 'Add New Location'}
            </h2>
            <button 
              onClick={() => {
                setShowPanel(false);
                setLocationImage(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <BsXLg />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location_name"
                value={currentLocation.location_name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location_code"
                value={currentLocation.location_code}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="e.g., WRHS-A"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={currentLocation.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Space Capacity (RSU) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity_rsu"
                value={currentLocation.capacity_rsu}
                onChange={handleInputChange}
                min="1"
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Image
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="location-image"
                />
                <label
                  htmlFor="location-image"
                  className="cursor-pointer bg-gray-50 py-2 px-4 border border-gray-300 rounded-md text-sm"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {locationImage ? locationImage.name : 'No file chosen'}
                </span>
              </div>
              {(locationImage || currentLocation.image_url) && (
                <div className="mt-2">
                  <img
                    src={locationImage 
                      ? URL.createObjectURL(locationImage) 
                      : currentLocation.image_url}
                    alt="Location preview"
                    className="h-32 object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300?text=Image+Not+Available';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t flex justify-between">
              <button
                onClick={() => {
                  setShowPanel(false);
                  setLocationImage(null);
                }}
                className="bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              
              <div className="flex gap-2">
                {isEditing && (
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                      className="bg-red-50 text-red-700 py-2 px-4 rounded-md hover:bg-red-100 flex items-center gap-1"
                    >
                      <BsTrash /> Delete
                    </button>
                    
                    {/* Delete confirmation dropdown */}
                    {showDeleteConfirm && (
                      <div className="absolute right-0 bottom-12 w-64 bg-white shadow-lg rounded-md border border-gray-200 p-4">
                        <p className="text-sm text-gray-700 mb-3">Are you sure? This cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="py-1 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                          >
                            No
                          </button>
                          <button
                            onClick={handleDeleteLocation}
                            className="py-1 px-3 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md"
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={handleSaveLocation}
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay when panel is open */}
      {showPanel && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-20"
          onClick={() => setShowPanel(false)}
        ></div>
      )}
      
      {/* Toast notification */}
      {toast.show && (
        <div 
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg z-50 max-w-md animate-fade-in ${
            toast.type === 'success' 
              ? 'bg-green-50 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-50 text-red-800 border-l-4 border-red-500'
          }`}
        >
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 mr-3" fill="currentColour" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-3" fill="currentColour" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
    </section>
  );
}

export default Locations;