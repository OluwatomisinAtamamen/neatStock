import { useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [array, setArray] = useState([]);

  const fetchData = async () => {
    const response = await axios.get('/api/test');
    setArray(response.data.message);
    console.log(response.data.message);
  };

  return (
    <>
      <div className="card">
        <button onClick={fetchData}>Fetch Data</button>
        <p>{array}</p>
      </div>
    </>
  )
}

export default App
