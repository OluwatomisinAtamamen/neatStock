import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth';
// import axios from 'axios';
import { BsChevronDown, BsChevronUp, BsPersonPlus, BsTrash } from 'react-icons/bs';

function Settings() {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedSection, setExpandedSection] = useState('business');
  const [addingStaff, setAddingStaff] = useState(false);
  const [staff, setStaff] = useState([]);
  const [theme, setTheme] = useState('light');
  const [units, setUnits] = useState('metric');
  const [businessProfile, setBusinessProfile] = useState({
    businessName: '',
    businessEmail: '',
    address: '',
    phone: '',
    contactPerson: ''
  });
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    logsPermission: false,
    reportsPermission: false
  });

  // Check if user is admin
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
        { id: 1, name: 'Jane Smith', username: 'jsmith', email: 'jane@example.com', logsPermission: true, reportsPermission: true },
        { id: 2, name: 'Mike Johnson', username: 'mjohnson', email: 'mike@example.com', logsPermission: false, reportsPermission: true }
      ]);
    }
  }, [user]);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleBusinessProfileUpdate = (e) => {
    e.preventDefault();
    // API call to update business profile
    console.log('Updating business profile:', businessProfile);
    alert('Business profile updated successfully!');
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    // API call to add staff
    console.log('Adding new staff:', newStaff);
    setStaff([...staff, {
      id: Date.now(),
      name: `${newStaff.firstName} ${newStaff.lastName}`,
      username: newStaff.username,
      email: newStaff.email,
      logsPermission: newStaff.logsPermission,
      reportsPermission: newStaff.reportsPermission
    }]);
    setNewStaff({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      logsPermission: false,
      reportsPermission: false
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

  const togglePermission = (id, permission) => {
    setStaff(staff.map(member => {
      if (member.id === id) {
        return {
          ...member,
          [permission]: !member[permission]
        };
      }
      return member;
    }));
  };

  const updateTheme = (e) => {
    setTheme(e.target.value);
    // Apply theme change logic here
  };

  const updateUnits = (e) => {
    setUnits(e.target.value);
    // Save units preference
  };

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
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Permissions:</h4>
                        <div className="flex flex-col space-y-2">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-primary"
                              checked={newStaff.logsPermission}
                              onChange={() => setNewStaff({...newStaff, logsPermission: !newStaff.logsPermission})}
                            />
                            <span className="ml-2">Logs Access</span>
                          </label>
                          
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-primary"
                              checked={newStaff.reportsPermission}
                              onChange={() => setNewStaff({...newStaff, reportsPermission: !newStaff.reportsPermission})}
                            />
                            <span className="ml-2">Reports Access</span>
                          </label>
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
                                Permissions
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
                                  <div className="flex flex-col space-y-2">
                                    <label className="inline-flex items-center">
                                      <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-primary"
                                        checked={member.logsPermission}
                                        onChange={() => togglePermission(member.id, 'logsPermission')}
                                      />
                                      <span className="ml-2 text-sm">Logs</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                      <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-primary"
                                        checked={member.reportsPermission}
                                        onChange={() => togglePermission(member.id, 'reportsPermission')}
                                      />
                                      <span className="ml-2 text-sm">Reports</span>
                                    </label>
                                  </div>
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
      
      {/* Preferences Section */}
      <div className="bg-card rounded-lg shadow-md mb-6">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => toggleSection('preferences')}
        >
          <h2 className="text-xl font-semibold">Preferences</h2>
          {expandedSection === 'preferences' ? <BsChevronUp /> : <BsChevronDown />}
        </div>
        
        {expandedSection === 'preferences' && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={theme}
                  onChange={updateTheme}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={units}
                  onChange={updateUnits}
                >
                  <option value="metric">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lb, in)</option>
                </select>
              </div>
            </div>
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