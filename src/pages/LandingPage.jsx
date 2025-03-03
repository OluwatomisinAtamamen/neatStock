import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function LandingPage() {
  return (
    <section className="p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <h1 className="text-4xl font-bold mb-6 text-text">Landing Page</h1>
        <div className="space-x-4">
          <Link to='/login' className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">Login</Link>
          <Link to='/signup' className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">Signup</Link>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;