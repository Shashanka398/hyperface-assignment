import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username) => {
    if (!username || !username.trim()) {
      setError('Username is required');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await login(username.trim());
      
      if (result.success) {
        navigate('/lobby', { replace: true });
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    handleLogin,
    isLoading,
    error,
    clearError
  };
}; 