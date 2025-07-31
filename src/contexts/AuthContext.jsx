import React, { useState, useEffect, useCallback } from 'react';
import { gameState } from '../utils/gameState';
import { crossTabSync } from '../utils/crossTabSync';
import {AuthContext} from './authContext';
import { message } from 'antd';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabId] = useState(() => crossTabSync.generateTabId());
  useEffect(() => {
    const savedUser = sessionStorage.getItem('rps_current_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const gameStateData = gameState.getState();
        if (gameStateData.players[userData.username]) {
          setUser(userData);
        } else {
          sessionStorage.removeItem('rps_current_user');
        }
      } catch (error) {
        message.error('Error parsing saved user:', error);
        sessionStorage.removeItem('rps_current_user');
      }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    if (user) {
      try {
        gameState.removePlayer(user.username);
      } catch (error) {
        message.error('Error removing player:', error);
      }
      setUser(null);
      sessionStorage.removeItem('rps_current_user');
    }
  }, [user]);

  const login = async (username) => {
    try {
      setLoading(true);
      const player = gameState.addPlayer(username, tabId);
      setUser(player);
      sessionStorage.setItem('rps_current_user', JSON.stringify(player));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe((newState) => {
      if (user && newState && !newState.players[user.username]) {
        logout();
      }
    });
    return unsubscribe;
  }, [user, logout]);

  useEffect(() => {
    return () => {
      if (user) {
        logout();
      }
    };
  }, [user, logout]);

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