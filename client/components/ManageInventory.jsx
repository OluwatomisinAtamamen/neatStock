import { useState } from 'react';
import AddItem from './AddItem';
import EditItem from './EditItem';

function ManageInventory() {
  const [tab, setTab] = useState('add');
  return (
    <div className="bg-white rounded shadow">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${tab === 'add' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setTab('add')}
        >
          Add New Item
        </button>
        <button
          className={`px-4 py-2 ${tab === 'edit' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setTab('edit')}
        >
          Edit Items
        </button>
      </div>
      <div className="p-4">
        {tab === 'add' ? <AddItem onItemAdded={() => setTab('edit')} /> : <EditItem />}
      </div>
    </div>
  );
}

export default ManageInventory;