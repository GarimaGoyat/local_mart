import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { local_market_backend } from '../../../../declarations/local_market_backend';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [backendActor, setBackendActor] = useState(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const authClient = await AuthClient.create();
      const isAuthed = await authClient.isAuthenticated();
      setIsAuthenticated(isAuthed);
      
      if (isAuthed) {
        const identity = await authClient.getIdentity();
        const principal = identity.getPrincipal();
        const userData = await local_market_backend.get_user(principal);
        setUser(userData);
        setBackendActor(local_market_backend);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  };

  const login = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: process.env.II_URL || "http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943",
        onSuccess: async () => {
          setIsAuthenticated(true);
          const identity = await authClient.getIdentity();
          const principal = identity.getPrincipal();
          const userData = await local_market_backend.get_user(principal);
          setUser(userData);
          setBackendActor(local_market_backend);
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();
      setIsAuthenticated(false);
      setUser(null);
      setBackendActor(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        backendActor,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 