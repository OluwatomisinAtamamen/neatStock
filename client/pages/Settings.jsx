import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth';
import axios from 'axios';
import { BsChevronDown, BsChevronUp, BsPersonPlus, BsTrash, BsPlusLg } from 'react-icons/bs';

function Settings() {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedSection, setExpandedSection] = useState('business');
  const [addingStaff, setAddingStaff] = useState(false);
  const [staff, setStaff] = useState([]);
  const [businessProfile, setBusinessProfile] = useState({
    businessName: '',
    businessEmail: '',
    address: '',
    phone: '',
    contactPerson: ''
  });
  
  // New staff with simpler permissions model (just admin)
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
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

  // Check if user is admin and load data
  useEffect(() => {
    if (user) {
      // This would normally fetch from the backend
      setIsAdmin(true); // For now, assume the logged-in user is an admin
      
      // Fetch business profile (mock)
      setBusinessProfile({
        businessName: 'NeatStock Sample',
        businessEmail: 'contact@neatstock.com',
        address: '123 Business Street',
        phone: '555-123-4567',
        contactPerson: 'John Doe'
      });
      
      // Fetch staff (mock)
      setStaff([
        { id: 1, name: 'Jane Smith', username: 'jsmith', email: 'jane@example.com', is_admin: true },
        { id: 2, name: 'Mike Johnson', username: 'mjohnson', email: 'mike@example.com', is_admin: false }
      ]);
      
      // Fetch categories
      fetchCategories();
    }
  }, [user]);

  // Toggle section visibility
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Business profile update
  const handleBusinessProfileUpdate = (e) => {
    e.preventDefault();
    // API call to update business profile
    console.log('Updating business profile:', businessProfile);
    alert('Business profile updated successfully!');
  };

  // Staff management functions
  const handleAddStaff = (e) => {
    e.preventDefault();
    // API call to add staff
    console.log('Adding new staff:', newStaff);
    setStaff([...staff, {
      id: Date.now(),
      name: `${newStaff.firstName} ${newStaff.lastName}`,
      username: newStaff.username,
      email: newStaff.email,
      is_admin: newStaff.is_admin
    }]);
    setNewStaff({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      is_admin: false
    });
    setAddingStaff(false);
    alert('Staff added successfully!');
  };

  const removeStaff = (id) => {
    // API call to remove staff
    console.log('Removing staff ID:', id);
    setStaff(staff.filter(member => member.id !== id));
    alert('Staff removed successfully!');
  };

  const toggleAdminStatus = (id) => {
    setStaff(staff.map(member => {
      if (member.id === id) {
        return {
          ...member,
          is_admin: !member.is_admin
        };
      }
      return member;
    }));
  };

  // Category management functions
  const fetchCategories = async () => {
    try {
      // For now, use mock data
      const mockCategories = [
        { category_id: 1, category_name: 'Food', description: 'Edible items' },
        { category_id: 2, category_name: 'Electronics', description: 'Devices and gadgets' },
        { category_id: 3, category_name: 'Clothing', description: 'Wearable items' }
      ];
      setCategories(mockCategories);
      
      // In production, uncomment this to fetch from API:
      // const response = await axios.get('/data/settings/categories');
      // setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update existing category (mock)
        console.log('Updating category:', newCategory);
        setCategories(categories.map(cat => 
          cat.category_id === newCategory.category_id ? newCategory : cat
        ));
        
        // In production:
        // await axios.put(`/data/settings/categories/${newCategory.category_id}`, {
        //   category_name: newCategory.category_name,
        //   description: newCategory.description
        // });
      } else {
        // Add new category (mock)
        const mockNewCategory = {
          ...newCategory,
          category_id: Date.now()
        };
        console.log('Adding category:', mockNewCategory);
        setCategories([...categories, mockNewCategory]);
        
        // In production:
        // await axios.post('/data/settings/categories', {
        //   category_name: newCategory.category_name,
        //   description: newCategory.description
        // });
      }
      
      // Reset form
      setNewCategory({ category_name: '', description: '' });
      setAddingCategory(false);
      setEditingCategory(false);
      alert(`Category ${editingCategory ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Failed to save category: ${error.response?.data?.message || error.message}`);
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
      // Remove from local state (mock)
      setCategories(categories.filter(cat => cat.category_id !== categoryId));
      
      // In production:
      // await axios.delete(`/data/settings/categories/${categoryId}`);
      
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(`Failed to delete category: ${error.response?.data?.message || error.message}`);
    }
  };

  // Subscription management
  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone and you will lose access to your account.')) {
      // API call to cancel subscription
      console.log('Cancelling subscription');
      alert('Subscription cancelled successfully. Your account will remain active until the end of the current billing period.');
    }
  };

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-text">Settings</h1>
      
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
            {isAdmin ? (
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
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={businessProfile.address}
                      onChange={(e) => setBusinessProfile({...businessProfile, address: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={businessProfile.phone}
                      onChange={(e) => setBusinessProfile({...businessProfile, phone: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={businessProfile.contactPerson}
                      onChange={(e) => setBusinessProfile({...businessProfile, contactPerson: e.target.value})}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Update Business Profile
                </button>
              </form>
            ) : (
              <p className="text-gray-500">You need administrator rights to edit business profile.</p>
            )}
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
            {isAdmin ? (
              <>
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
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={newStaff.email}
                            onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
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
                                Email
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {member.email}
                                </td>
                                <td className="px-6 py-4">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      className="form-checkbox h-4 w-4 text-primary"
                                      checked={member.is_admin}
                                      onChange={() => toggleAdminStatus(member.id)}
                                    />
                                    <span className="ml-2 text-sm">Admin</span>
                                  </label>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <button
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => removeStaff(member.id)}
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
              </>
            ) : (
              <p className="text-gray-500">You need administrator rights to manage team members.</p>
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
            {isAdmin ? (
              <>
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
              </>
            ) : (
              <p className="text-gray-500">You need administrator rights to manage categories.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Subscription Section */}
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
            {isAdmin ? (
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
            ) : (
              <p className="text-gray-500">You need administrator rights to manage subscription.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Settings;