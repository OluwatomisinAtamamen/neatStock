import { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsChevronDown, BsChevronUp, BsPersonPlus, BsTrash, BsPlusLg } from 'react-icons/bs';
import Toast from '../components/Toast';

function Settings() {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('business');
  const [addingStaff, setAddingStaff] = useState(false);
  const [staff, setStaff] = useState([]);
  const [businessProfile, setBusinessProfile] = useState({
    businessName: '',
    businessEmail: '',
    add1: '',
    add2: '',
    city: '',
    postcode: '',
    country: '',
    rsu_reference: '',
  });
  
  // Toast notifications
  const [toast, setToast] = useState({
    message: '',
    type: 'success'
  });
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  
  // Staff state
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    is_admin: false
  });
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ 
    category_name: '', 
    description: '' 
  });

  const loadBusinessProfile = useCallback(async () => {
    try {
      const response = await axios.get('/data/settings/business');
      setBusinessProfile(response.data);
    } catch (error) {
      console.error('Error loading business profile:', error);
      showToast('Failed to load business profile', 'error');
    }
  }, []); // Empty dependency array as it only depends on stable values (axios, showToast)
  
  const loadStaff = useCallback(async () => {
    try {
      const response = await axios.get('/data/settings/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error loading staff:', error);
      showToast('Failed to load team members', 'error');
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await axios.get('/data/settings/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast('Failed to load categories', 'error');
    }
  }, []);

  // Just check if the user is logged in and fetch data if they're admin
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        
        if (isAdmin) {
          loadBusinessProfile();
          loadStaff();
          loadCategories();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings data:', error);
        showToast('Error loading settings. Please try again.', 'error');
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, navigate, isAdmin, loadBusinessProfile, loadStaff, loadCategories]);


  // Toggle section visibility
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Business profile update
  const handleBusinessProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put('/data/settings/business', businessProfile);
      showToast('Business profile updated successfully');
    } catch (error) {
      console.error('Error updating business profile:', error);
      showToast('Failed to update business profile', 'error');
    }
  };

  // Staff management functions
  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/data/settings/staff', newStaff);
      
      setStaff([...staff, response.data]);
      setNewStaff({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        is_admin: false
      });
      setAddingStaff(false);
      showToast('Staff member added successfully');
    } catch (error) {
      console.error('Error adding staff:', error);
      showToast(error.response?.data?.message || 'Failed to add staff member', 'error');
    }
  };

  const removeStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    
    try {
      await axios.delete(`/data/settings/staff/${id}`);
      setStaff(staff.filter(member => member.id !== id));
      showToast('Staff member removed successfully');
    } catch (error) {
      console.error('Error removing staff:', error);
      showToast('Failed to remove staff member', 'error');
    }
  };

  const toggleAdminStatus = async (id) => {
    try {
      const staffMember = staff.find(member => member.id === id);
      if (!staffMember) return;
      
      const newAdminStatus = !staffMember.is_admin;
      
      await axios.patch(`/data/settings/staff/${id}`, {
        is_admin: newAdminStatus
      });
      
      setStaff(staff.map(member => {
        if (member.id === id) {
          return {
            ...member,
            is_admin: newAdminStatus
          };
        }
        return member;
      }));
      
      showToast(`Admin status ${newAdminStatus ? 'granted' : 'revoked'} successfully`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      showToast('Failed to update admin status', 'error');
    }
  };

  // Category management functions
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        const response = await axios.put(`/data/settings/categories/${newCategory.category_id}`, {
          category_name: newCategory.category_name,
          description: newCategory.description
        });
        
        setCategories(categories.map(cat => 
          cat.category_id === newCategory.category_id ? response.data : cat
        ));
        
        showToast('Category updated successfully');
      } else {
        const response = await axios.post('/data/settings/categories', {
          category_name: newCategory.category_name,
          description: newCategory.description
        });
        
        setCategories([...categories, response.data]);
        showToast('Category added successfully');
      }
      
      // Reset form
      setNewCategory({ category_name: '', description: '' });
      setAddingCategory(false);
      setEditingCategory(false);
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(error.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  const editCategory = (category) => {
    setNewCategory({ ...category });
    setEditingCategory(true);
    setAddingCategory(true);
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This may affect items using it.')) {
      return;
    }
    
    try {
      await axios.delete(`/data/settings/categories/${categoryId}`);
      setCategories(categories.filter(cat => cat.category_id !== categoryId));
      showToast('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(error.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  // Subscription management
  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone and you will lose access to your account.')) {

      showToast('This feature is not available yet', 'info');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <section className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-text">Settings</h1>
        <div className="bg-yellow-50 p-8 rounded-lg border border-yellow-200 text-center">
          <h2 className="text-xl text-yellow-800 font-semibold mb-4">Admin Access Required</h2>
          <p className="text-gray-700 mb-4">
            You need administrator privileges to access and manage system settings.
            Please contact your system administrator for assistance.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-text">Settings</h1>
      
      {/* Toast Notification */}
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
      
      {/* Business Profile Section */}
      <div className="bg-card rounded-lg shadow-md mb-6">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => toggleSection('business')}
        >
          <h2 className="text-xl font-semibold">Business Profile</h2>
          {expandedSection === 'business' ? <BsChevronUp /> : <BsChevronDown />}
        </div>
        
        {expandedSection === 'business' && (
          <div className="p-4 border-t">
            <form onSubmit={handleBusinessProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={businessProfile.businessName}
                    onChange={(e) => setBusinessProfile({...businessProfile, businessName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={businessProfile.businessEmail}
                    onChange={(e) => setBusinessProfile({...businessProfile, businessEmail: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={businessProfile.add1}
                    onChange={(e) => setBusinessProfile({...businessProfile, add1: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={businessProfile.add2}
                    onChange={(e) => setBusinessProfile({...businessProfile, add2: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={businessProfile.city}
                    onChange={(e) => setBusinessProfile({...businessProfile, city: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={businessProfile.postcode}
                    onChange={(e) => setBusinessProfile({...businessProfile, postcode: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={businessProfile.country}
                    onChange={(e) => setBusinessProfile({...businessProfile, country: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RSU Reference 
                    <span className="ml-1 text-xs text-gray-500">(Relative Space Unit)</span>
                  </label>
                  <input
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded"
                    value={businessProfile.rsu_reference}
                    onChange={(e) => setBusinessProfile({...businessProfile, rsu_reference: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pick one familiar item (e.g. a standard can or a particular product box) to represent 1 Relative Space Unit. This would be used as a reference in all locations and reports.
                  </p>
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Update Business Profile
              </button>
            </form>
          </div>
        )}
      </div>
      
      {/* Team Management Section */}
      <div className="bg-card rounded-lg shadow-md mb-6">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => toggleSection('team')}
        >
          <h2 className="text-xl font-semibold">Team Management</h2>
          {expandedSection === 'team' ? <BsChevronUp /> : <BsChevronDown />}
        </div>
        
        {expandedSection === 'team' && (
          <div className="p-4 border-t">
            {addingStaff ? (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setAddingStaff(false)}
                    className="text-gray-600 hover:text-gray-800 mr-2"
                  >
                    &larr; Back
                  </button>
                  <h3 className="text-lg font-medium">Add New Staff Member</h3>
                </div>
                
                <form onSubmit={handleAddStaff}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={newStaff.firstName}
                        onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={newStaff.lastName}
                        onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={newStaff.username}
                        onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Access
                      </label>
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-primary"
                            checked={newStaff.is_admin}
                            onChange={() => setNewStaff({...newStaff, is_admin: !newStaff.is_admin})}
                          />
                          <span className="ml-2">Grant admin privileges</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-700 mr-2"
                  >
                    Add Staff Member
                  </button>
                  
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                    onClick={() => setAddingStaff(false)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Your Team</h3>
                  <button
                    onClick={() => setAddingStaff(true)}
                    className="flex items-center bg-primary text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    <BsPersonPlus className="mr-1" /> Add Staff
                  </button>
                </div>
                
                {staff.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {staff.map((member) => (
                          <tr key={member.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.username}
                            </td>
                            <td className="px-6 py-4">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-primary"
                                  checked={member.is_admin}
                                  onChange={() => toggleAdminStatus(member.id)}
                                  disabled={member.is_owner}
                                />
                                <span className="ml-2 text-sm">Admin</span>
                              </label>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => removeStaff(member.id)}
                                disabled={member.is_owner}
                                title={member.is_owner ? "Owners cannot be removed" : "Remove this staff member"}
                              >
                                <BsTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">You have not added any team members yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Categories Section */}
      <div className="bg-card rounded-lg shadow-md mb-6">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => toggleSection('categories')}
        >
          <h2 className="text-xl font-semibold">Categories</h2>
          {expandedSection === 'categories' ? <BsChevronUp /> : <BsChevronDown />}
        </div>
        
        {expandedSection === 'categories' && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Manage Categories</h3>
              <button
                onClick={() => {
                  setAddingCategory(true);
                  setEditingCategory(false);
                  setNewCategory({ category_name: '', description: '' });
                }}
                className="flex items-center bg-primary text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                <BsPlusLg className="mr-1" /> Add Category
              </button>
            </div>
            
            {/* Categories list */}
            {categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.category_id}>
                        <td className="px-6 py-4 whitespace-nowrap">{category.category_name}</td>
                        <td className="px-6 py-4">{category.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => editCategory(category)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => deleteCategory(category.category_id)}
                          >
                            <BsTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">You have not created any categories yet.</p>
            )}
            
            {/* Add/Edit Category form */}
            {addingCategory && (
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-3">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h4>
                <form onSubmit={handleCategorySubmit}>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={newCategory.category_name}
                        onChange={(e) => setNewCategory({...newCategory, category_name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded"
                        rows="3"
                        value={newCategory.description || ''}
                        onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                      {editingCategory ? 'Update' : 'Add'} Category
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                      onClick={() => {
                        setAddingCategory(false);
                        setEditingCategory(false);
                        setNewCategory({ category_name: '', description: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Subscription Section - Keeping as is for now */}
      <div className="bg-card rounded-lg shadow-md mb-6">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => toggleSection('subscription')}
        >
          <h2 className="text-xl font-semibold">Subscription</h2>
          {expandedSection === 'subscription' ? <BsChevronUp /> : <BsChevronDown />}
        </div>
        
        {expandedSection === 'subscription' && (
          <div className="p-4 border-t">
            <div>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-medium mb-2">Current Plan: Premium</h3>
                <p className="text-sm text-gray-600 mb-1">Renewal Date: June 1, 2025</p>
                <p className="text-sm text-gray-600">Amount: £12/month</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-red-600 mb-2">Cancel Subscription</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Warning: Cancelling your subscription will result in losing access to your account
                  and all your data at the end of your billing period.
                </p>
                <button
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  onClick={handleCancelSubscription}
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Settings;