import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SessionTimer component tracks user activity and automatically logs out
 * the user after 5 minutes (default) of inactivity.
 */
const SessionTimer = ({ timeoutInMinutes = 5 }) => {
  const navigate = useNavigate();
  const TIMEOUT_MS = timeoutInMinutes * 60 * 1000;

  const handleLogout = useCallback(() => {
    console.log('Session timed out. Logging out...');
    sessionStorage.clear();
    // Redirect to login page with a timeout message if desired
    navigate('/login', { state: { message: 'Your session has expired due to inactivity.' } });
  }, [navigate]);

  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Only set timer if user is logged in
      if (sessionStorage.getItem('userType')) {
        timeoutId = setTimeout(handleLogout, TIMEOUT_MS);
      }
    };

    // Events that count as "activity"
    const events = [
      'mousedown', 
      'mousemove', 
      'keypress', 
      'scroll', 
      'touchstart',
      'click'
    ];

    const throttledResetTimer = () => {
      // Small optimization: don't reset on every single mousemove
      if (!timeoutId) return; 
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [handleLogout, TIMEOUT_MS]);

  return null; // This component doesn't render anything visually
};

export default SessionTimer;
