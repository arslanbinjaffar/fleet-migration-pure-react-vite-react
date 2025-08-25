import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { AuthUser } from '../api/authApiSlice';

// Auth state interface
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginTime: string | null;
  sessionExpired: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginTime: null,
  sessionExpired: false,
};

// Helper function to check if session is expired
const isSessionExpired = (loginTime: string | null): boolean => {
  if (!loginTime) return true;
  const loginDate = new Date(loginTime);
  const currentDate = new Date();
  return currentDate > loginDate;
};

// Helper function to get user role
export const getUserRole = (user: AuthUser | null): string | null => {
  if (!user) return null;
  return user.Role?.roleName?.toLowerCase() || user.role?.toLowerCase() || null;
};

// Helper function to get role-based route
export const getRoleBasedRoute = (user: AuthUser | null): string => {
  const role = getUserRole(user);
  if (!role) return '/login';
  
  switch (role) {
    case 'admin':
      return '/admin';
    case 'supervisor':
      return '/supervisor';
    case 'finance':
      return '/finance';
    case 'employee':
      return '/employee';
    default:
      return `/${role}/welcome`;
  }
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set credentials (login success)
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string; refreshToken?: string }>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.sessionExpired = false;
      state.loginTime = localStorage.getItem('loginTime');
    },
    
    // Set credentials from localStorage (on app init)
    setCredentialsFromStorage: (state) => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');
      
      if (token && userStr && loginTime) {
        try {
          const user = JSON.parse(userStr) as AuthUser;
          
          // Check if session is expired
          if (isSessionExpired(loginTime)) {
            // Session expired, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            state.sessionExpired = true;
            return;
          }
          
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
          state.loginTime = loginTime;
          state.sessionExpired = false;
        } catch (error) {
          // Invalid user data, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
        }
      }
    },
    
    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.loginTime = null;
      state.sessionExpired = false;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
    },
    
    // Update user profile
    updateProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    
    // Set session expired
    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.sessionExpired = action.payload;
      if (action.payload) {
        // Clear auth state but keep user info for re-login
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
      }
    },
    
    // Refresh token success
    refreshTokenSuccess: (state, action: PayloadAction<{ token: string; user?: AuthUser }>) => {
      const { token, user } = action.payload;
      state.token = token;
      if (user) {
        state.user = user;
      }
      state.isAuthenticated = true;
      state.sessionExpired = false;
      
      // Update login time
      const newLoginTime = new Date();
      newLoginTime.setHours(newLoginTime.getHours() + 8);
      state.loginTime = newLoginTime.toISOString();
      localStorage.setItem('loginTime', state.loginTime);
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setCredentials,
  setCredentialsFromStorage,
  logout,
  updateProfile,
  setSessionExpired,
  refreshTokenSuccess,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUserRole = (state: RootState) => getUserRole(state.auth.user);
export const selectSessionExpired = (state: RootState) => state.auth.sessionExpired;
export const selectLoginTime = (state: RootState) => state.auth.loginTime;

// Export reducer
export default authSlice.reducer;