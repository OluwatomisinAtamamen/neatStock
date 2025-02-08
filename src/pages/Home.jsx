import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {

  return (
    <section className='home'>
      <Navbar />
      <h1>Home</h1>
      <Link to='/login'>Login</Link>
      <Link to='/signup'>Signup</Link>
    </section>
  );
}

export default Home;