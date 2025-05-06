import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300); // Give time for fade out animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);
  
  if (!message || !visible) return null;
  
  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md 
                     text-white ${bgColor} transition-opacity duration-300
                     flex items-center`}>
      <span>{message}</span>
      <button 
        onClick={() => {
          setVisible(false);
          if (onClose) setTimeout(onClose, 300);
        }}
        className="ml-3 text-white hover:text-gray-200"
      >
        &times;
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func
};

export default Toast;