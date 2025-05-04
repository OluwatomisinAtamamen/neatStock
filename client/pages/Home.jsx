import { useContext } from 'react';
import { AuthContext } from '../context/auth';

function Home() {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <section className="p-6">
      {/* Header with welcome message and logout button (only on dashboard) */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium lg:text-xl">
            {user?.firstName ? `Welcome, ${user.firstName}` : 'Dashboard'}
          </h2>
        </div>
        <button 
          onClick={logout}
          className="bg-primary text-white py-1 px-3 rounded-md text-sm lg:py-2 lg:px-4"
        >
          Logout
        </button>
      </header>

      <h1 className="text-3xl font-bold mb-4 text-text">Dashboard Overview</h1>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-lg mb-2">Total Items</h2>
          <p className="text-2xl font-bold text-primary">142</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-lg mb-2">Low Stock</h2>
          <p className="text-2xl font-bold text-red-600">7</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-lg mb-2">Categories</h2>
          <p className="text-2xl font-bold text-primary">12</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-lg mb-2">Total Value</h2>
          <p className="text-2xl font-bold text-primary">£24,750</p>
        </div>
      </div>
    </section>
  );
}

export default Home;