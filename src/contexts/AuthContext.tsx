import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'farmer' | 'viewer';
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: 'admin' | 'farmer' | 'viewer') => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }): React.ReactElement => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const hasPermission = (requiredRole: 'admin' | 'farmer' | 'viewer') => {
    if (!user) return false;
    const roleHierarchy = {
      admin: 3,
      farmer: 2,
      viewer: 1
    };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'An unexpected error occurred');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const signup = async (username: string, password: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Failed to create account. Please try again.');
        }
      }

      // After successful signup, attempt to login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!loginResponse.ok) {
        const loginData = await loginResponse.json();
        if (loginData.error === 'Invalid credentials') {
          throw new Error('Account created but automatic login failed. Please try logging in manually.');
        } else if (loginData.error === 'Database connection failed') {
          throw new Error('Account created but unable to log in due to server issues. Please try logging in later.');
        } else {
          throw new Error('Account created but login failed: ' + (loginData.error || 'Unknown error'));
        }
      }

      const userData = await loginResponse.json();
      if (!userData || !userData.token) {
        throw new Error('Invalid response from server. Please try logging in manually.');
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};