import { useAppSelector, useAppDispatch } from './hooks';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserLoading,
  selectUserError,
  selectUserToken,
  loginSuccess,
  logout,
  updateProfile,
  setLoading,
  setError,
  clearError,
  setAuthenticated,
} from './slices/userSlice';

/**
 * Custom hook that provides easy access to user slice state and actions
 * This centralizes all user-related state management in one place
 */
export const useUserSlicer = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);
  const token = useAppSelector(selectUserToken);
  
  // Actions
  const actions = {
    login: (user: any, token: string) => dispatch(loginSuccess({ user, token })),
    logout: () => dispatch(logout()),
    updateProfile: (userData: any) => dispatch(updateProfile(userData)),
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    setError: (error: string | null) => dispatch(setError(error)),
    clearError: () => dispatch(clearError()),
    setAuthenticated: (authenticated: boolean) => dispatch(setAuthenticated(authenticated)),
  };
  
  return {
    // State
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    token,
    // Actions
    ...actions,
  };
};

/**
 * Generic slicer hook factory
 * You can create similar hooks for other slices
 */
export const createSlicer = <T extends Record<string, any>>(
  selectors: Record<string, (state: any) => any>,
  actions: Record<string, (...args: any[]) => any>
) => {
  return () => {
    const dispatch = useAppDispatch();
    
    // Get all selector values
    const state = Object.keys(selectors).reduce((acc, key) => {
      acc[key] = useAppSelector(selectors[key]);
      return acc;
    }, {} as Record<string, any>);
    
    // Wrap actions with dispatch
    const wrappedActions = Object.keys(actions).reduce((acc, key) => {
      acc[key] = (...args: any[]) => dispatch(actions[key](...args));
      return acc;
    }, {} as Record<string, any>);
    
    return {
      ...state,
      ...wrappedActions,
    };
  };
};

// Example usage for other slices:
// export const useDashboardSlicer = createSlicer(
//   {
//     data: selectDashboardData,
//     loading: selectDashboardLoading,
//   },
//   {
//     fetchData: fetchDashboardData,
//     clearData: clearDashboardData,
//   }
// );