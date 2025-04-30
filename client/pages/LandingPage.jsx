import { Link } from 'react-router-dom';

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
                <span className="block mt-2 text-primary">Know What You Have, Exactly Where It Is</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                Empower your retail store with seamless EPOS integration. Automatically update stock levels when sales occur—no more manual counting.
              </p>
              <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-600">
                Designed for small business owners: Fast, reliable, and easy to use. Tailored for African retail spaces.
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
            Smart Inventory Management for Small Businesses
          </h2>
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-2xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminate Guesswork</h3>
              <p className="text-gray-600">Accurate, real-time inventory tracking</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-2xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Save Time</h3>
              <p className="text-gray-600">Automate stock updates from your EPOS system</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-2xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Organize Your Space</h3>
              <p className="text-gray-600">Visual mapping and intuitive location tagging</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-2xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Affordable Solution</h3>
              <p className="text-gray-600">Built with simplicity and affordability in mind</p>
            </div>
          </div>
        </div>
      </div>

      {/* EPOS Integration Section */}
      <div className="bg-gray-50 py-16 sm:py-24" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Seamless EPOS Integration
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-600">
                Connect your point-of-sale system directly to your inventory management. When a sale happens, your stock levels update automatically.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Real-time synchronization between sales and inventory
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Automatic low-stock alerts based on your defined thresholds
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Works with popular EPOS systems used in African markets
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8 bg-gradient-to-br from-primary/10 to-blue-100/30">
                  <div className="text-center mb-8">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-primary">
                      Automated
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-500">Sale completed</span>
                      <span className="text-green-500 text-sm">✓ Just now</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded mb-4"></div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-500">Inventory updated</span>
                      <span className="text-green-500 text-sm">✓ Just now</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded mb-4"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Reports refreshed</span>
                      <span className="text-green-500 text-sm">✓ Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial-like Trust Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Trusted by small retailers across the UK and Africa</h2>
            <p className="mt-4 text-lg text-gray-600">
              Tailored for your store – Customizable layouts that work with your space
            </p>
          </div>
          
          <div className="mt-12 border-t border-gray-200 pt-12">
            <p className="text-center text-base text-gray-600">
              Secure and straightforward: Designed with your business in mind
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-100">Create your account today.</span>
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