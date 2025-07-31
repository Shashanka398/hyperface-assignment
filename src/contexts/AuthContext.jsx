import React, { useState, useEffect } from 'react';
import { gameState } from '../utils/gameState';
import { crossTabSync } from '../utils/crossTabSync';
import {AuthContext} from './authContext';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabId] = useState(() => crossTabSync.generateTabId());
  useEffect(() => {
    const savedUser = localStorage.getItem('rps_current_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const gameStateData = gameState.getState();
        if (gameStateData.players[userData.username]) {
          setUser(userData);
        } else {
          localStorage.removeItem('rps_current_user');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('rps_current_user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe((newState) => {
      if (user && newState && !newState.players[user.username]) {
        logout();
      }
    });
    return unsubscribe;
  }, [user]);

  const login = async (username) => {
    try {
      setLoading(true);
      const player = gameState.addPlayer(username, tabId);
      setUser(player);
      localStorage.setItem('rps_current_user', JSON.stringify(player));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      try {
        gameState.removePlayer(user.username);
      } catch (error) {
        console.error('Error removing player:', error);
      }
      setUser(null);
      localStorage.removeItem('rps_current_user');
    }
  };

  useEffect(() => {
    return () => {
      if (user) {
        logout();
      }
    };
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 

export default AuthProvider;