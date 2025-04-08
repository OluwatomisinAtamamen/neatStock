import { useState } from 'react';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // This is where you would typically call an API to search your inventory
    // For now, we'll use mock data
    
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setHasSearched(true);
    
    // Mock search results
    const mockResults = [
      { id: 1, name: "Product Alpha", quantity: 15, location: "Warehouse A, Shelf 3" },
      { id: 2, name: "Alpha Max", quantity: 8, location: "Warehouse B, Shelf 1" },
    ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    setSearchResults(mockResults);
  };

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-text">Search Inventory</h1>
      
      <div className="bg-card rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search by name, category, or SKU..." 
              className="w-full p-3 pl-10 border border-gray-300 rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          <button 
            type="submit" 
            className="bg-primary text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </form>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">Filter: In Stock</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">Category: All</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">Location: All</span>
        </div>
      </div>
      
      {hasSearched && (
        <div className="bg-card rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-medium">Search Results</h2>
            <p className="text-gray-500">Found {searchResults.length} items for &quot;{searchQuery}&quot;</p>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                        <button className="text-gray-600 hover:text-gray-900">Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No results found. Try a different search term.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Search;