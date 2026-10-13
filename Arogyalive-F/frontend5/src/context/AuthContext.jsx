import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved =
        localStorage.getItem('arogya_user');

      return saved
        ? JSON.parse(saved)
        : null;
    } catch (error) {
      localStorage.removeItem('arogya_user');
      return null;
    }
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        'arogya_user',
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem('arogya_user');
    }
  }, [user]);

  /**
   * Login with real Spring Boot authentication.
   */
  async function login({
    role,
    email,
    password,
  }) {
    setLoading(true);
    setError(null);

    try {
      /*
       * role is kept in the function signature because
       * Login.jsx currently supplies it.
       *
       * authService intentionally ignores it and lets
       * the backend determine the real role.
       */
      const response =
        await authService.login({
          role,
          email,
          password,
        });

      const {
        token,
        user: loggedInUser,
      } = response;

      localStorage.setItem(
        'arogya_token',
        token
      );

      localStorage.setItem(
        'arogya_user',
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);

      return loggedInUser;

    } catch (err) {

      const message =
        err?.message ||
        'Invalid email or password. Please try again.';

      setError(message);

      throw err;

    } finally {
      setLoading(false);
    }
  }

  /**
   * Register with real Spring Boot authentication.
   */
  async function register({
    name,
    email,
    password,
    role,
    metadata = {},
  }) {
    setLoading(true);
    setError(null);

    try {
      const response =
        await authService.register({
          name,
          email,
          password,
          role,
          metadata,
        });

      const {
        token,
        user: newUser,
      } = response;

      localStorage.setItem(
        'arogya_token',
        token
      );

      localStorage.setItem(
        'arogya_user',
        JSON.stringify(newUser)
      );

      setUser(newUser);

      return newUser;

    } catch (err) {

      const message =
        err?.message ||
        'Could not create account. Please try again.';

      setError(message);

      throw err;

    } finally {
      setLoading(false);
    }
  }

  /**
   * Logout.
   */
  function logout() {
    localStorage.removeItem(
      'arogya_token'
    );

    localStorage.removeItem(
      'arogya_user'
    );

    localStorage.removeItem(
      'registeredAmbulanceId'
    );

    setUser(null);
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}