import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  // Field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [businessNameError, setBusinessNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateInputs = () => {
    let isValid = true;
    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError('First name is required.');
      isValid = false;
    } else {
      setFirstNameError('');
    }
    // Validate last name
    if (!lastName.trim()) {
      setLastNameError('Last name is required.');
      isValid = false;
    } else {
      setLastNameError('');
    }
    // Validate business name
    if (!businessName.trim()) {
      setBusinessNameError('Business name is required.');
      isValid = false;
    } else {
      setBusinessNameError('');
    }
    // Validate work email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!workEmail.trim() || !emailRegex.test(workEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }
    // Validate password length
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError('');
    }
    // Validate password confirmation
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    return isValid;
  };

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      axios.post('data/users/signup', {firstName, lastName, businessName, workEmail, password,})
        .then((response) => {
          console.log(response.data);

          // Redirect to login page
          if (response.status === 200){
            navigate('/login');
          } else if (response.status === 400) {
            alert('Email already in use');
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            setEmailError('Email already in use');
          } else {
            console.error(error);
          }
        });
      
      console.log({
        firstName,
        lastName,
        businessName,
        workEmail,
        password,
      });
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Link to='/' className="absolute top-4 left-4 text-primary hover:underline">Landing Page</Link>
      <div className="bg-card p-8 rounded-lg shadow-md w-96 max-w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-text">Signup</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block mb-2 text-text">First Name:</label>
            <input 
              type="text" 
              id="firstName" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {firstNameError && <p className="text-red-600 text-sm mt-1">{firstNameError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block mb-2 text-text">Last Name:</label>
            <input 
              type="text" 
              id="lastName" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {lastNameError && <p className="text-red-600 text-sm mt-1">{lastNameError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="businessName" className="block mb-2 text-text">Business Name:</label>
            <input 
              type="text" 
              id="businessName" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {businessNameError && <p className="text-red-600 text-sm mt-1">{businessNameError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="workEmail" className="block mb-2 text-text">Work Email:</label>
            <input 
              type="email" 
              id="workEmail" 
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
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

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-2 text-text">Confirm Password:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {confirmPasswordError && <p className="text-red-600 text-sm mt-1">{confirmPasswordError}</p>}
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-white p-3 rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;