import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HiHome } from 'react-icons/hi';

function Signup() {
  // Field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [username, setUsername] = useState('');      

  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [businessNameError, setBusinessNameError] = useState('');
  const [businessEmailError, setBusinessEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const validateInputs = () => {
    let isValid = true;
    const emailRegex = /\S+@\S+\.\S+/;
    
    if (!firstName.trim()) {
      setFirstNameError('First name is required.');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName.trim()) {
      setLastNameError('Last name is required.');
      isValid = false;
    } else {
      setLastNameError('');
    }

    if (!businessName.trim()) {
      setBusinessNameError('Business name is required.');
      isValid = false;
    } else {
      setBusinessNameError('');
    }

    if (!businessEmail.trim() || !emailRegex.test(businessEmail)) {
      setBusinessEmailError('Please enter a valid business email.');
      isValid = false;
    } else {
      setBusinessEmailError('');
    }

    if (!username.trim()) {
      setUsernameError('Username is required.');
      isValid = false;
    } else {
      setUsernameError('');
    }
    
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      axios.post('data/users/signup', {
        firstName,
        lastName,
        businessName,
        businessEmail,
        username,
      })
      .then((response) => {
        if (response.status === 200 && response.data.url) {
          // Redirect to Stripe Checkout
          window.location.href = response.data.url;
        } else if (response.status === 400) {
          setBusinessEmailError('Email or username already in use');
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          setBusinessEmailError('Business email or username already in use');
        } else {
          console.error(error);
        }
      });
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Link to='/' className="absolute top-4 left-4 text-primary hover:underline flex items-center">
        <HiHome className="text-2xl" />
      </Link>
      
      <div className="bg-card p-8 rounded-lg shadow-md w-96 max-w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-text">Signup</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block mb-2 text-text">First Name:</label>
            <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
            {firstNameError && <p className="text-red-600 text-sm mt-1">{firstNameError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block mb-2 text-text">Last Name:</label>
            <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)}
              required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
            {lastNameError && <p className="text-red-600 text-sm mt-1">{lastNameError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="businessName" className="block mb-2 text-text">Business Name:</label>
            <input type="text" id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
              required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
            {businessNameError && <p className="text-red-600 text-sm mt-1">{businessNameError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="businessEmail" className="block mb-2 text-text">Business Email:</label>
            <input type="email" id="businessEmail" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)}
              required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
            {businessEmailError && <p className="text-red-600 text-sm mt-1">{businessEmailError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-text">Username:</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
              required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
            {usernameError && <p className="text-red-600 text-sm mt-1">{usernameError}</p>}
          </div>

          <button type="submit" className="w-full bg-primary text-white p-3 rounded font-medium hover:bg-blue-700 transition-colors">
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;