import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuickCount from '../components/QuickCount.jsx';
import AddItems from '../components/AddItem.jsx';
import EditItem from '../components/EditItem.jsx';
import { BsPlusLg, BsXLg } from 'react-icons/bs';

function Stocktake() {
  const [showAddItems, setShowAddItems] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [searchParams] = useSearchParams();
  const catalogId = searchParams.get('catalogId');
  
  // Check for catalogId param and show the add form if present
  useEffect(() => {
    if (catalogId) {
      setShowAddItems(true);
    }
  }, [catalogId]);

  const handleEditItem = (item) => {
    setCurrentEditItem(item);
    setShowEditItem(true);
  };

  return (
    <div className="p-6">
      {/* Header with title and button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Stocktake</h1>
        <button 
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center gap-2"
          onClick={() => setShowAddItems(prev => !prev)}
        >
          <BsPlusLg /> {showAddItems ? 'Hide Form' : 'Add Items'}
        </button>
      </div>
      
      {/* Expandable Add Items section */}
      {showAddItems && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <AddItems 
            catalogId={catalogId} 
            onComplete={() => setShowAddItems(false)} 
          />
        </div>
      )}
      
      {/* Quick Count section */}
      <QuickCount onEditItem={handleEditItem} />

      {/* Edit Item Slide-in Panel */}
      {showEditItem && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-20"
            onClick={() => setShowEditItem(false)}
          ></div>
          
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out z-30 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Item</h2>
                <button 
                  onClick={() => setShowEditItem(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <BsXLg />
                </button>
              </div>
              
              <EditItem 
                item={currentEditItem} 
                onSave={() => {
                  setShowEditItem(false);
                  setCurrentEditItem(null);
                }} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Stocktake;