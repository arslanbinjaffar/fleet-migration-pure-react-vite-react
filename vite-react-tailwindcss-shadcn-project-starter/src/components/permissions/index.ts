// Permission System Components
// This module provides a comprehensive TypeScript-based permission system
// that replaces the fragmented permission implementation across the application.

// Core Components
export { default as PermissionButton } from './PermissionButton';
export {
  CreateButton,
  EditButton,
  DeleteButton,
  ViewButton,
  ExportButton,
  ManageButton,
  ApproveButton,
} from './PermissionButton';

export {
  PermissionDropdown,
  PermissionDropdownItem,
  ActionsDropdown,
  StatusDropdown,
  BulkActionsDropdown,
} from './PermissionDropdown';

export { default as PermissionWrapper } from './PermissionWrapper';
export {
  AdminOnly,
  ManagerOrAbove,
  CreatePermission,
  EditPermission,
  DeletePermission,
  ViewPermission,
  ExportPermission,
  ManagePermission,
} from './PermissionWrapper';

// Context and Hooks
export {
  PermissionProvider,
  usePermissions,
  useUserRole,
  useModulePermissions,
  useHasPermission,
  useHasPermissions,
  useHasAnyPermission,
} from '../../contexts/PermissionContext';

// Types
export type {
  Permission,
  UserRole,
  AuthUser,
  PermissionAction,
  PermissionModuleType,
  PermissionSet,
  PermissionButtonProps,
  PermissionDropdownProps,
  PermissionDropdownItemProps,
  PermissionContextType,
  PermissionProviderProps,
  RequiredPermission,
  OptionalPermission,
  PermissionConfig,
} from '../../types/permissions';

// Constants
export { PermissionModule } from '../../types/permissions';

/**
 * Permission System Architecture Documentation
 * 
 * This permission system provides a centralized, type-safe approach to handling
 * user permissions throughout the application. It consists of several key components:
 * 
 * ## Core Components:
 * 
 * ### 1. PermissionButton
 * A reusable button component that encapsulates permission logic:
 * - Automatically checks user permissions before rendering
 * - Supports fallback content for denied permissions
 * - Provides tooltip feedback for permission denials
 * - Includes pre-configured variants (CreateButton, EditButton, etc.)
 * 
 * ### 2. PermissionDropdown
 * A dropdown menu component with built-in permission checking:
 * - Automatically filters menu items based on permissions
 * - Supports nested permission checks for individual items
 * - Includes pre-configured variants (ActionsDropdown, StatusDropdown, etc.)
 * 
 * ### 3. PermissionWrapper
 * A flexible wrapper for any content that needs permission control:
 * - Supports single or multiple permission checks
 * - Configurable AND/OR logic for multiple permissions
 * - Includes convenience wrappers (AdminOnly, ManagerOrAbove, etc.)
 * 
 * ## Context and Hooks:
 * 
 * ### PermissionProvider
 * Provides permission context throughout the application:
 * - Integrates with Redux auth state
 * - Provides centralized permission checking logic
 * - Supports role-based access control
 * 
 * ### Permission Hooks
 * - usePermissions: Access to full permission context
 * - useUserRole: Get current user's role
 * - useModulePermissions: Get all permissions for a module
 * - useHasPermission: Check single permission
 * - useHasPermissions: Check multiple permissions (AND logic)
 * - useHasAnyPermission: Check multiple permissions (OR logic)
 * 
 * ## Usage Examples:
 * 
 * ```tsx
 * // Basic permission button
 * <PermissionButton module={PermissionModule.Fleet} action="create" onClick={handleCreate}>
 *   Create Fleet
 * </PermissionButton>
 * 
 * // Pre-configured button
 * <CreateButton module={PermissionModule.Fleet} onClick={handleCreate}>
 *   Create Fleet
 * </CreateButton>
 * 
 * // Permission dropdown
 * <ActionsDropdown
 *   module={PermissionModule.Fleet}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * 
 * // Permission wrapper
 * <PermissionWrapper module={PermissionModule.Fleet} action="create">
 *   <div>This content is only visible to users who can create fleets</div>
 * </PermissionWrapper>
 * 
 * // Multiple permissions with OR logic
 * <PermissionWrapper
 *   permissions={[
 *     { module: PermissionModule.Fleet, action: 'create' },
 *     { module: PermissionModule.Fleet, action: 'update' }
 *   ]}
 *   requireAll={false}
 * >
 *   <div>Visible to users who can create OR update fleets</div>
 * </PermissionWrapper>
 * 
 * // Using hooks
 * const { hasPermission } = usePermissions();
 * const canCreateFleet = hasPermission(PermissionModule.Fleet, 'create');
 * const fleetPermissions = useModulePermissions(PermissionModule.Fleet);
 * ```
 * 
 * ## Migration from Old System:
 * 
 * The old permission system used scattered checks like:
 * ```jsx
 * const { create, update, delete: del, read } = usePermissionSet(PermissionName.Fleet);
 * ```
 * 
 * This is now replaced with:
 * ```tsx
 * const fleetPermissions = useModulePermissions(PermissionModule.Fleet);
 * // or for individual checks:
 * const canCreate = useHasPermission(PermissionModule.Fleet, 'create');
 * ```
 * 
 * ## Benefits:
 * 
 * 1. **Centralized Logic**: All permission logic is centralized in the context
 * 2. **Type Safety**: Full TypeScript support prevents runtime errors
 * 3. **Reusability**: Components can be reused across all modules
 * 4. **Consistency**: Uniform permission handling across the application
 * 5. **Maintainability**: Easy to modify permission behavior globally
 * 6. **Performance**: Memoized permission checks prevent unnecessary re-renders
 * 7. **Developer Experience**: Clear API with helpful TypeScript intellisense
 */