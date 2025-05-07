import { Link } from 'react-router-dom';
import { BsBoxSeam, BsRulers, BsLightbulb, BsCurrencyPound } from 'react-icons/bs';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">NeatStock</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-150">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pt-14 pb-8 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20 lg:pt-40 lg:pb-28">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Simplify Your Store&apos;s Inventory</span>
                <span className="block mt-2 text-primary">Know What You Have, Where It Is</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                Inventory management designed specifically for African grocery stores and small businesses. Stop wasting space and money on overstocking.
              </p>
              <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-600">
                Organize your products efficiently with our simple space management system, designed for business owners like you.
              </p>
              <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
                <div className="rounded-md shadow">
                  <Link to="/signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <a href="#how-it-works" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                    How It Works
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Inventory Management Made Simple for Small Businesses
          </h2>
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-2xl mb-4">
                <BsBoxSeam />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Stop Overstocking</h3>
              <p className="text-gray-600">Know exactly what you have and avoid buying products you already have in stock</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-2xl mb-4">
                <BsRulers />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Maximize Your Space</h3>
              <p className="text-gray-600">Track space utilization with our simple Relative Space Units system</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-2xl mb-4">
                <BsLightbulb />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Weekly Stock Counts</h3>
              <p className="text-gray-600">Update your inventory with our simple stocktake system each weekend</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-2xl mb-4">
                <BsCurrencyPound />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Affordable Solution</h3>
              <p className="text-gray-600">Just £12 per month, a fraction of what other systems charge</p>
            </div>
          </div>
        </div>
      </div>

      {/* RSU System Section */}
      <div className="bg-gray-50 py-16 sm:py-24" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Unique Space Management System
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-600">
                Track your inventory space with our intuitive Relative Space Units (RSU) system. No complex measurements or calculations needed.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Choose a standard product as your reference (1 RSU)
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Define location capacities in RSU (how many standard items fit)
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Assign RSU values to products based on relative size
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Get alerts when locations are getting full
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8 bg-gradient-to-br from-primary/10 to-blue-100/30">
                  <div className="text-center mb-8">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-primary">
                      Space Management
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="font-medium mb-4">Example RSU Values</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-blue-100 rounded mr-3"></div>
                          <span>Standard Can (1 RSU)</span>
                        </div>
                        <span>1 unit</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded mr-3"></div>
                          <span>Rice Bag (3 RSU)</span>
                        </div>
                        <span>3 units</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded mr-3"></div>
                          <span>Large Box (5 RSU)</span>
                        </div>
                        <span>5 units</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Comparison Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Affordable Inventory Management</h2>
            <p className="mt-4 text-lg text-gray-600">
              NeatStock is designed specifically for small retail businesses like yours
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white text-sm font-bold px-4 py-1 rounded-full">
                  Our Solution
                </span>
              </div>
              <h3 className="text-2xl font-bold text-center mb-6">NeatStock</h3>
              <div className="text-center text-3xl font-bold text-primary mb-6">£12<span className="text-base text-gray-500 font-normal">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Space management with RSU system</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Weekly stocktake system</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Low stock alerts</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Simple setup with one-time assistance</span>
                </li>
              </ul>
              <div className="text-center">
                <Link to="/signup" className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700">
                  Get Started
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-8">
              <h3 className="text-2xl font-bold text-center mb-6">Competitors</h3>
              <div className="text-center text-3xl font-bold text-gray-700 mb-6">£49-149<span className="text-base text-gray-500 font-normal">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-500">Complicated features you don`t need</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-500">High learning curve</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-500">Not designed for small African grocery stores</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-500">4-12× more expensive than NeatStock</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Why We Created NeatStock Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why We Created NeatStock</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              We saw a specific problem affecting small African grocery stores that no existing solution was addressing
            </p>
          </div>
          
          <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 sm:p-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">The Problem</h3>
                  <p className="mt-2 text-gray-600">
                    African grocery stores in the UK often operate in limited spaces with hundreds of unique products. 
                    Our research showed that owners frequently overstocked items because they lacked a clear system to 
                    track what they already had and where it was stored.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Existing Solutions Were Not Suitable</h3>
                  <p className="mt-2 text-gray-600">
                    Other inventory systems were either too expensive, too complex, or not designed 
                    for the specific needs of small African grocery stores. They required technical knowledge, 
                    extensive training, or were priced for much larger businesses.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Our Approach</h3>
                  <p className="mt-2 text-gray-600">
                    We designed NeatStock from the ground up for these specific businesses. We focused on 
                    space management, simplicity, and affordability. The result is a system that helps you 
                    know exactly what you have, where it is, and when you`re running low—without breaking the bank.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to organize your inventory?</span>
            <span className="block text-blue-100">Get started today for just £12/month.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-blue-50">
                Sign up
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Features</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase"><a href="mailto:up2136848@myport.ac.uk">Contact</a></h3>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; 2025 NeatStock. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;