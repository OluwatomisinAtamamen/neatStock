import { useState } from 'react';
import '../registration.css';
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
    <div className="login-container">
      <Link to='/'>Home</Link>
      <div className="login-card">
        <h1>Signup</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name:</label>
            <input 
              type="text" 
              id="firstName" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required 
            />
            {firstNameError && <p className="error">{firstNameError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input 
              type="text" 
              id="lastName" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
            />
            {lastNameError && <p className="error">{lastNameError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="businessName">Business Name:</label>
            <input 
              type="text" 
              id="businessName" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required 
            />
            {businessNameError && <p className="error">{businessNameError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="workEmail">Work Email:</label>
            <input 
              type="email" 
              id="workEmail" 
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
            {confirmPasswordError && <p className="error">{confirmPasswordError}</p>}
          </div>

          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;