import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate email and password
  const validateInputs = () => {
    let isValid = true;
    const emailRegex = /\S+@\S+\.\S+/;
    
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      axios.post('data/users/login', { email, password })
        .then((response) => {

          if (response.status === 200) {
            navigate('/dashboard');
            console.log('Logged in');
            console.log(response.data);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            setPasswordError('Invalid email or password');
          } else {
            console.error(error);
          }
        });
      console.log({ email, password });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Link to='/' className="absolute top-4 left-4 text-primary hover:underline">Landing Page</Link>
      <div className="bg-card p-8 rounded-lg shadow-md w-96 max-w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-text">Login</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-text">Email:</label>
            <input 
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-text">Password:</label>
            <input 
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-primary text-white p-3 rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;