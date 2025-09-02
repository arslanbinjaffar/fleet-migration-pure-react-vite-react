// Fleet Type Module Exports

// Components
export {
  FleetTypeList,
  FleetTypeCreate,
} from './components';

// Types
export type {
  FleetType,
  FleetTypeFormData,
  FleetTypeUpdateData,
  FleetTypesResponse,
  FleetTypeResponse,
  FleetTypeSearchParams,
  FleetTypeListState,
  FleetTypePermissions,
} from './types';

// Constants
export {
  FLEET_TYPE_ENDPOINTS,
  VALIDATION_RULES,
  UI_CONSTANTS,
  FLEET_TYPE_MESSAGES,
  FLEET_TYPE_LABELS,
  TABLE_COLUMNS,
  FLEET_TYPE_CONSTANTS,
} from './constants';

// Schemas
export {
  fleetTypeSchema,
  fleetTypeUpdateSchema,
  fleetTypeSearchSchema,
  fleetTypeFilterSchema,
  bulkFleetTypeOperationSchema,
  validateFleetType,
  validateFleetTypeUpdate,
  validateFleetTypeSearch,
  validateFleetTypeFilter,
  validateBulkFleetTypeOperation,
} from './schemas/fleetTypeSchema';

export type {
  FleetTypeFormData as FleetTypeSchemaData,
  FleetTypeUpdateData as FleetTypeUpdateSchemaData,
  FleetTypeSearchData,
  FleetTypeFilterData,
  BulkFleetTypeOperationData,
} from './schemas/fleetTypeSchema';

// API Hooks (re-exported from store)
export {
  useGetFleetTypesQuery,
  useGetFleetTypeByIdQuery,
  useCreateFleetTypeMutation,
  useUpdateFleetTypeMutation,
  useDeleteFleetTypeMutation,
  useBulkDeleteFleetTypesMutation,
} from '@/stores/api/fleetTypeApiSlice';