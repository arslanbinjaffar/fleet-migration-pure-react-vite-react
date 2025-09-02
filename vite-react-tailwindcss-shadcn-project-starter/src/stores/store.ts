import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import API slice
import { apiSlice } from './api/apiSlice';

// Import reducers
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import fleetReducer from './slices/fleetSlice';
import lposReducer from './slices/lposSlice';
import customerReducer from './slices/customerSlice';
import timesheetReducer from './slices/timesheetSlice';
import fleetPurchasesReducer from './slices/fleetPurchasesSlice';
import jobsReducer from './slices/jobsSlice';
import repairsReducer from './slices/repairsSlice';
import productReducer from './slices/productSlice';
import warehouseReducer from './slices/warehouseSlice';
import categoryReducer from './slices/categorySlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user'], // Only persist auth and user data
};

// Root reducer
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  user: userReducer,
  auth: authReducer,
  fleet: fleetReducer,
  lpos: lposReducer,
  customer: customerReducer,
  timesheet: timesheetReducer,
  fleetPurchases: fleetPurchasesReducer,
  jobs: jobsReducer,
  repairs: repairsReducer,
  product: productReducer,
  warehouse: warehouseReducer,
  category: categoryReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PURGE',
          'persist/FLUSH',
          'persist/PAUSE',
        ],
      },
    })
    .concat(apiSlice.middleware)
});

// Create persistor
export const persistor = persistStore(store);

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;