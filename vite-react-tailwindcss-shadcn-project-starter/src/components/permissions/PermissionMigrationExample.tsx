import React from 'react';
import { Plus, Edit, Trash2, Eye, Download, MoreHorizontal } from 'lucide-react';
import {
  PermissionButton,
  CreateButton,
  EditButton,
  DeleteButton,
  ViewButton,
  ExportButton,
  ActionsDropdown,
  PermissionWrapper,
  CreatePermission,
  AdminOnly,
  useModulePermissions,
  useHasPermission,
  PermissionModule,
} from './index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * PermissionMigrationExample - Demonstrates the new permission system
 * 
 * This component shows how to migrate from the old permission system
 * to the new TypeScript-based permission system with examples.
 */
const PermissionMigrationExample: React.FC = () => {
  // Example: Using the new permission hooks
  const fleetPermissions = useModulePermissions(PermissionModule.Fleet);
  const canCreateCustomer = useHasPermission(PermissionModule.Customers, 'create');
  const canManageTimesheets = useHasPermission(PermissionModule.Timesheets, 'manage');
  
  // Example handlers
  const handleCreateFleet = () => console.log('Creating fleet...');
  const handleEditFleet = () => console.log('Editing fleet...');
  const handleDeleteFleet = () => console.log('Deleting fleet...');
  const handleViewFleet = () => console.log('Viewing fleet...');
  const handleExportFleet = () => console.log('Exporting fleet...');
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Permission System Migration Example</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating the new TypeScript-based permission system
        </p>
      </div>
      
      {/* Permission Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current User Permissions</CardTitle>
          <CardDescription>
            Example of checking permissions using the new hooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Fleet Module</h3>
              <div className="space-y-1">
                <Badge variant={fleetPermissions.create ? 'default' : 'secondary'}>
                  Create: {fleetPermissions.create ? 'Allowed' : 'Denied'}
                </Badge>
                <Badge variant={fleetPermissions.read ? 'default' : 'secondary'}>
                  Read: {fleetPermissions.read ? 'Allowed' : 'Denied'}
                </Badge>
                <Badge variant={fleetPermissions.update ? 'default' : 'secondary'}>
                  Update: {fleetPermissions.update ? 'Allowed' : 'Denied'}
                </Badge>
                <Badge variant={fleetPermissions.delete ? 'default' : 'secondary'}>
                  Delete: {fleetPermissions.delete ? 'Allowed' : 'Denied'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Individual Checks</h3>
              <div className="space-y-1">
                <Badge variant={canCreateCustomer ? 'default' : 'secondary'}>
                  Create Customer: {canCreateCustomer ? 'Allowed' : 'Denied'}
                </Badge>
                <Badge variant={canManageTimesheets ? 'default' : 'secondary'}>
                  Manage Timesheets: {canManageTimesheets ? 'Allowed' : 'Denied'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Permission Buttons Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Buttons</CardTitle>
          <CardDescription>
            Buttons that automatically handle permission checks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Permission Buttons */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Permission Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <PermissionButton
                module={PermissionModule.Fleet}
                action="create"
                onClick={handleCreateFleet}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Fleet
              </PermissionButton>
              
              <PermissionButton
                module={PermissionModule.Fleet}
                action="update"
                variant="outline"
                onClick={handleEditFleet}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Fleet
              </PermissionButton>
              
              <PermissionButton
                module={PermissionModule.Fleet}
                action="delete"
                variant="destructive"
                onClick={handleDeleteFleet}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Fleet
              </PermissionButton>
            </div>
          </div>
          
          <Separator />
          
          {/* Pre-configured Buttons */}
          <div className="space-y-4">
            <h3 className="font-semibold">Pre-configured Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <CreateButton module={PermissionModule.Fleet} onClick={handleCreateFleet}>
                <Plus className="h-4 w-4 mr-2" />
                Create Fleet
              </CreateButton>
              
              <EditButton module={PermissionModule.Fleet} onClick={handleEditFleet}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </EditButton>
              
              <ViewButton module={PermissionModule.Fleet} onClick={handleViewFleet}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </ViewButton>
              
              <ExportButton module={PermissionModule.Fleet} onClick={handleExportFleet}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </ExportButton>
              
              <DeleteButton module={PermissionModule.Fleet} onClick={handleDeleteFleet}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DeleteButton>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Permission Dropdown Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Dropdowns</CardTitle>
          <CardDescription>
            Dropdown menus with automatic permission filtering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Fleet Actions:</span>
            <ActionsDropdown
              module={PermissionModule.Fleet}
              onView={handleViewFleet}
              onEdit={handleEditFleet}
              onDelete={handleDeleteFleet}
              trigger={
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Customer Actions:</span>
            <ActionsDropdown
              module={PermissionModule.Customers}
              onView={() => console.log('View customer')}
              onEdit={() => console.log('Edit customer')}
              onDelete={() => console.log('Delete customer')}
              onManage={() => console.log('Manage customer')}
              trigger={
                <Button variant="outline" size="sm">
                  Customer Actions
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Permission Wrapper Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Wrappers</CardTitle>
          <CardDescription>
            Wrap any content with permission checks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Permission Wrapper */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Permission Wrapper</h3>
            <PermissionWrapper module={PermissionModule.Fleet} action="create">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  ✅ This content is only visible to users who can create fleets
                </p>
              </div>
            </PermissionWrapper>
            
            <PermissionWrapper 
              module={PermissionModule.Fleet} 
              action="delete"
              fallback={
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">
                    ❌ You don't have permission to delete fleets
                  </p>
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  ✅ You can delete fleets - this is the main content
                </p>
              </div>
            </PermissionWrapper>
          </div>
          
          <Separator />
          
          {/* Convenience Wrappers */}
          <div className="space-y-4">
            <h3 className="font-semibold">Convenience Wrappers</h3>
            
            <CreatePermission module={PermissionModule.Customers}>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  ✅ Create Customer section - only visible with create permission
                </p>
              </div>
            </CreatePermission>
            
            <AdminOnly>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800">
                  👑 Admin Only Content - only visible to administrators
                </p>
              </div>
            </AdminOnly>
          </div>
        </CardContent>
      </Card>
      
      {/* Migration Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Examples</CardTitle>
          <CardDescription>
            How to migrate from the old system to the new system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">OLD WAY (Deprecated):</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const { create, update, delete: del, read } = usePermissionSet(PermissionName.Fleet);

{create && (
  <Button onClick={handleCreate}>
    Create Fleet
  </Button>
)}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">NEW WAY (Recommended):</h4>
              <pre className="bg-green-100 p-3 rounded text-sm overflow-x-auto">
{`// Option 1: Using permission components
<CreateButton module={PermissionModule.Fleet} onClick={handleCreate}>
  Create Fleet
</CreateButton>

// Option 2: Using hooks
const fleetPermissions = useModulePermissions(PermissionModule.Fleet);
const canCreate = useHasPermission(PermissionModule.Fleet, 'create');

// Option 3: Using wrapper
<CreatePermission module={PermissionModule.Fleet}>
  <Button onClick={handleCreate}>Create Fleet</Button>
</CreatePermission>`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">COMPATIBLE WAY (For gradual migration):</h4>
              <pre className="bg-blue-100 p-3 rounded text-sm overflow-x-auto">
{`const { create, update, delete: del, read } = useCompatiblePermissionSet('Fleet');

// Works with both old and new permission systems`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionMigrationExample;