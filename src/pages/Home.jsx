import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="p-6">
      <Link to='/' className="text-primary hover:underline mb-4 inline-block">Landing Page</Link>
      <h1 className="text-3xl font-bold mb-4 text-text">Home</h1>
      <p className="text-text">Logged in</p>
    </section>
  );  
}

export default Home;