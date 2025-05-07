import { useState } from 'react';
import PropTypes from 'prop-types';
import { BsBoxSeam, BsRulers } from 'react-icons/bs';

function ReferenceInfo({ onClose }) {
  const [activeTab, setActiveTab] = useState('rsu');

  return (
    <div className="bg-white rounded-lg">
      <div className="flex border-b">
        <button
          className={`px-4 py-3 flex items-center gap-2 ${activeTab === 'rsu' 
            ? 'text-primary border-b-2 border-primary' 
            : 'text-gray-500'}`}
          onClick={() => setActiveTab('rsu')}
        >
          <BsRulers /> RSU Guide
        </button>
        <button
          className={`px-4 py-3 flex items-center gap-2 ${activeTab === 'inventory' 
            ? 'text-primary border-b-2 border-primary' 
            : 'text-gray-500'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <BsBoxSeam /> Inventory Tips
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'rsu' && (
          <>
            <h3 className="text-xl font-semibold mb-4">Understanding Relative Space Units (RSU)</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">What is an RSU?</h4>
              <p className="text-gray-700 mb-4">
                A Relative Space Unit (RSU) is a simple way to measure how many `boxes/packs` of space your 
                products take up on your shelves and in storage. Think of it as counting boxes of 
                different sizes.
              </p>
              <p className="text-gray-700 mb-3">
                Instead of measuring in centimetres or calculating volumes, you simply:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Pick a common box or product as your `standard box` (1 RSU)</li>
                <li>Compare other products visually: `This takes up about 3 standard boxes of space`</li>
                <li>Assign RSU values based on how many standard boxes worth of space they occupy</li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">How to Use RSU in Your Store</h4>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
                <li>Choose a standard box size that`s common in your store (e.g., a tin of tomatoes)</li>
                <li>For locations: Estimate how many of these standard boxes would fit on a shelf</li>
                <li>For products: Compare each item to your standard box size</li>
                <li>Track how much space is being used in each location</li>
              </ol>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">Visual RSU Examples</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 border">Product Type</th>
                      <th className="p-3 border">Visual Comparison</th>
                      <th className="p-3 border">RSU Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border">Standard Can/Box</td>
                      <td className="p-3 border">
                        <div className="flex items-center">
                          <div className="bg-blue-100 w-10 h-10 rounded flex items-center justify-center border border-blue-300">1×</div>
                          <span className="ml-2">Standard tin of tomatoes, small box of spice mix</span>
                        </div>
                      </td>
                      <td className="p-3 border font-medium">1.0 RSU</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Small Packet</td>
                      <td className="p-3 border">
                        <div className="flex items-center">
                          <div className="bg-blue-100 w-6 h-6 rounded flex items-center justify-center border border-blue-300">½×</div>
                          <span className="ml-2">Small spice packet, bouillon cubes</span>
                        </div>
                      </td>
                      <td className="p-3 border font-medium">0.5 RSU</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Bottle/Medium Item</td>
                      <td className="p-3 border">
                        <div className="flex items-center">
                          <div className="bg-blue-100 w-12 h-12 rounded flex items-center justify-center border border-blue-300">2×</div>
                          <span className="ml-2">1L palm oil bottle, medium bag of beans</span>
                        </div>
                      </td>
                      <td className="p-3 border font-medium">2.0 RSU</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Large Item</td>
                      <td className="p-3 border">
                        <div className="flex items-center">
                          <div className="bg-blue-100 w-16 h-16 rounded flex items-center justify-center border border-blue-300">5×</div>
                          <span className="ml-2">5kg bag of rice, large box of detergent</span>
                        </div>
                      </td>
                      <td className="p-3 border font-medium">5.0 RSU</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Bulky Item</td>
                      <td className="p-3 border">
                        <div className="flex items-center">
                          <div className="bg-blue-100 w-20 h-20 rounded flex items-center justify-center border border-blue-300">10×</div>
                          <span className="ml-2">25kg sack of cassava, large container</span>
                        </div>
                      </td>
                      <td className="p-3 border font-medium">10.0 RSU</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 mt-3 text-sm italic">
                The blue boxes show the approximate relative size compared to your standard box (1 RSU)
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">Recommended Setup Process</h4>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Step 1: Create Categories</strong> - Organize your products into logical groups</li>
                <li><strong>Step 2: Add Locations</strong> - Set up your shelves, storage areas and display spaces with RSU capacities</li>
                <li><strong>Step 3: Add Items</strong> - Add your inventory items with their RSU values</li>
              </ol>
              <p className="text-gray-700">
                This sequence ensures that you can properly categorize and locate your items as you add them to your inventory.
              </p>
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <>
            <h3 className="text-xl font-semibold mb-4">Inventory Management Tips</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">Weekly Stocktake Best Practices</h4>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Set aside dedicated time each weekend for your stocktake</li>
                <li>Check low stock items first - they`re highlighted in reports</li>
                <li>Count items by location for better accuracy</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">Space Optimization</h4>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Keep high-turnover items at easily accessible locations</li>
                <li>Monitor your space utilization reports weekly</li>
                <li>Rearrange products when locations exceed 80% capacity</li>
                <li>Consider vertical storage for more efficient use of space</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-2">Need More Help?</h4>
              <p className="text-gray-700">
                Contact our support team at support@neatstock.com for personalized assistance
                with setting up your inventory system or optimizing your current processes.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="border-t p-4 flex justify-end">
        <button
          onClick={onClose}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

ReferenceInfo.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default ReferenceInfo;