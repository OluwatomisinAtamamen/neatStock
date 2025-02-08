import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  

  return (
    <section className='Dashboard'>
      <Link to='/'>Home</Link>
      <h1>Dashboard</h1>
      <p>Logged in</p>
    </section>
  );
}

export default Dashboard;