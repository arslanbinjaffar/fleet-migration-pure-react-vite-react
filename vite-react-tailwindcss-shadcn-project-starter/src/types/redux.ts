import { store } from '../stores/store';
import { apiSlice } from '../stores/api/apiSlice';

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// RTK Query types
export type ApiSliceType = typeof apiSlice;

// Generic API state types
export interface ApiState<T = any> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastFetched?: number;
}

// Async thunk states
export type AsyncThunkState = 'idle' | 'pending' | 'fulfilled' | 'rejected';

// Generic slice state with async operations
export interface SliceState<T = any> {
  data: T[];
  currentItem: T | null;
  status: AsyncThunkState;
  error: string | null;
  filters: Record<string, any>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Action payload types for common operations
export interface CreateActionPayload<T> {
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateActionPayload<T> {
  id: string;
  data: Partial<T>;
}

export interface DeleteActionPayload {
  id: string;
}

export interface FetchListActionPayload {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// RTK Query endpoint types
export interface QueryEndpoint<TQueryArg = void, TResult = unknown> {
  query: (arg: TQueryArg) => any;
  providesTags?: any[];
}

export interface MutationEndpoint<TMutationArg = void, TResult = unknown> {
  query: (arg: TMutationArg) => any;
  invalidatesTags?: any[];
}

// Enhanced RTK Query hooks return types
export interface UseQueryResult<T> {
  data: T | undefined;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => void;
}

export interface UseMutationResult<T, TArg> {
  mutate: (arg: TArg) => Promise<T>;
  data: T | undefined;
  error: any;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

// Middleware types
export interface SerializableCheckOptions {
  ignoredActions?: string[];
  ignoredActionsPaths?: string[];
  ignoredPaths?: string[];
  warnAfter?: number;
}

// Store enhancer types
export interface StoreEnhancerOptions {
  trace?: boolean;
  traceLimit?: number;
}

// Selector types
export type Selector<TState, TResult> = (state: TState) => TResult;
export type ParametricSelector<TState, TParams, TResult> = (
  state: TState,
  params: TParams
) => TResult;

// Memoized selector types
export type MemoizedSelector<TState, TResult> = Selector<TState, TResult> & {
  recomputations: () => number;
  resetRecomputations: () => number;
};

// Action creator types
export interface ActionCreator<T = any> {
  type: string;
  payload?: T;
  meta?: any;
  error?: boolean;
}

export interface AsyncActionCreator<TArg = void, TResult = any> {
  pending: ActionCreator<undefined>;
  fulfilled: ActionCreator<TResult>;
  rejected: ActionCreator<any>;
  (arg: TArg): any;
}

// Thunk types
export interface ThunkAPI {
  dispatch: AppDispatch;
  getState: () => RootState;
  extra?: any;
  requestId: string;
  signal: AbortSignal;
  rejectWithValue: (value: any) => any;
  fulfillWithValue: (value: any) => any;
}

// Entity adapter types (for normalized state)
export interface EntityState<T> {
  ids: string[];
  entities: Record<string, T>;
}

export interface EntityAdapter<T> {
  addOne: (state: EntityState<T>, entity: T) => void;
  addMany: (state: EntityState<T>, entities: T[]) => void;
  setOne: (state: EntityState<T>, entity: T) => void;
  setMany: (state: EntityState<T>, entities: T[]) => void;
  setAll: (state: EntityState<T>, entities: T[]) => void;
  removeOne: (state: EntityState<T>, key: string) => void;
  removeMany: (state: EntityState<T>, keys: string[]) => void;
  removeAll: (state: EntityState<T>) => void;
  updateOne: (state: EntityState<T>, update: { id: string; changes: Partial<T> }) => void;
  updateMany: (state: EntityState<T>, updates: { id: string; changes: Partial<T> }[]) => void;
  upsertOne: (state: EntityState<T>, entity: T) => void;
  upsertMany: (state: EntityState<T>, entities: T[]) => void;
}