import { useState } from 'react';
import '../registration.css';
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
    <div className="login-container">
      <Link to='/'>Home</Link>
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            {emailError && <p className="error">{emailError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            {passwordError && <p className="error">{passwordError}</p>}
          </div>
          
          <button type="submit" onClick={validateInputs}>Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;