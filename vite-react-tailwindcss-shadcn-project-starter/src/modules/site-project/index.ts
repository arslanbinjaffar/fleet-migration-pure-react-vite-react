// Site Project Module Exports

// Components
export {
  SiteProjectList,
  SiteProjectCreate,
  SiteProjectView,
} from './components';

// Types
export type {
  SiteProject,
  SiteProjectFormData,
  SiteProjectCreateData,
  SiteProjectUpdateData,
  SiteProjectsResponse,
  SiteProjectResponse,
  SiteProjectSearchParams,
  SiteProjectListState,
  SiteProjectPermissions,
  AssignedFleet,
  SiteProjectFleets,
  ProjectTypeOption,
  ZoneOption,
  FormSection,
  FormSections,
} from './types';

// Constants
export {
  SITE_PROJECT_ENDPOINTS,
  VALIDATION_RULES,
  UI_CONSTANTS,
  PROJECT_TYPE_OPTIONS,
  ZONE_OPTIONS,
  PROJECT_NAME_OPTIONS,
  FORM_SECTIONS,
  SITE_PROJECT_MESSAGES,
  SITE_PROJECT_LABELS,
  TABLE_COLUMNS,
  SITE_PROJECT_CONSTANTS,
} from './constants';

// Schemas
export {
  siteProjectSchema,
  siteProjectUpdateSchema,
  siteProjectSearchSchema,
  siteProjectFilterSchema,
  bulkSiteProjectOperationSchema,
  siteProjectSectionSchema,
  validateSiteProject,
  validateSiteProjectUpdate,
  validateSiteProjectSearch,
  validateSiteProjectFilter,
  validateBulkSiteProjectOperation,
  validateSiteProjectSection,
} from './schemas/siteProjectSchema';

export type {
  SiteProjectFormData as SiteProjectSchemaData,
  SiteProjectUpdateData as SiteProjectUpdateSchemaData,
  SiteProjectSearchData,
  SiteProjectFilterData,
  BulkSiteProjectOperationData,
  SiteProjectSectionData,
} from './schemas/siteProjectSchema';

// API Hooks (re-exported from store)
export {
  useGetSiteProjectsQuery,
  useGetSiteProjectByIdQuery,
  useGetSiteProjectFleetsQuery,
  useCreateSiteProjectMutation,
  useUpdateSiteProjectMutation,
  useDeleteSiteProjectMutation,
  useBulkDeleteSiteProjectsMutation,
  useGetProjectTypesQuery,
  useGetSiteProjectStatsQuery,
} from '@/stores/api/siteProjectApiSlice';