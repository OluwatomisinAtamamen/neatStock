import { useState, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../context/auth';
import { HiHome } from 'react-icons/hi';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateInputs = () => {
    let isValid = true;
    
    if (!username.trim()) {
      setUsernameError('Please enter your username.');
      isValid = false;
    } else {
      setUsernameError('');
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      setLoginError('');
      const result = await login(username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setLoginError(result.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Link to='/' className="absolute top-4 left-4 text-primary hover:underline flex items-center">
        <HiHome className="text-2xl" />
      </Link>
      <div className="bg-card p-8 rounded-lg shadow-md w-96 max-w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-text">Login</h1>
        
        {loginError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-text">Username:</label>
            <input 
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {usernameError && <p className="text-red-600 text-sm mt-1">{usernameError}</p>}
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