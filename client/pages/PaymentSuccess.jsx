import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError('Invalid session.');
        setLoading(false);
        return;
      }
      try {
        // Verify payment was successful but don't create user yet
        const response = await axios.get(`/data/users/verify-payment?session_id=${sessionId}`);
        if (response.data.success) {
          // Set username from the response and show password form
          setUsername(response.data.username);
          setShowPasswordForm(true);
          setLoading(false);
        } else {
          setError(response.data.message || 'Payment verification failed.');
          setLoading(false);
        }
      } catch (error) {
        setError('Failed to verify payment.');
        setLoading(false);
        console.error('Payment verification error:', error);
      }
    };
    verifyPayment();
  }, [searchParams]);

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (validatePassword()) {
      setLoading(true);
      try {
        // Complete account creation with password
        const response = await axios.post('/data/users/complete-signup', {
          session_id: searchParams.get('session_id'),
          password
        });
        
        if (response.data.success) {
          setShowPasswordForm(false);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(response.data.message || 'Failed to complete signup.');
        }
      } catch (error) {
        setError('Failed to complete account setup.');
        console.error('Error during account setup:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {loading ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-text">Processing Your Payment...</h1>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-text">Payment Error</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-primary text-white px-6 py-3 rounded-md"
            >
              Try Again
            </button>
          </>
        ) : showPasswordForm ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-text">Payment Successful!</h1>
            <p className="text-green-600 mb-6">Your payment was processed successfully.</p>
            <p className="text-gray-600 mb-4">Complete your signup by setting a password for your account.</p>
            
            <form onSubmit={handlePasswordSubmit} className="text-left">
              <div className="mb-4">
                <label className="block mb-2 text-text">Username:</label>
                <input 
                  type="text" 
                  value={username} 
                  disabled 
                  className="w-full p-3 border border-gray-300 bg-gray-100 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-text">Password:</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-text">Confirm Password:</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white p-3 rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Complete Signup
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-text">Account Created!</h1>
            <div className="mb-6 text-green-500">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600 mb-8">
              Your account has been created successfully!<br />
              You will now be redirected to the login page.<br />
              Please log in using your username and password.
            </p>
            <p className="text-gray-600">
              Redirecting to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;