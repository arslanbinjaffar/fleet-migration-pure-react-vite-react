# Role-Based Navigation System

This document explains how to use the role-based navigation system in the application to automatically handle user role prefixes in routes.

## Problem Statement

Previously, every navigation call required manually adding the user's role prefix to the route:

```typescript
// Old way - Manual role prefix
const role = user?.Role?.roleName?.toLowerCase() || 'admin';
navigate(`/${role}/fleet/create`);
navigate(`/${role}/customer/view/${id}`);
```

This approach had several issues:
- **Repetitive Code**: Every component needed to extract and use the role
- **Error Prone**: Easy to forget the role prefix or make typos
- **Maintenance**: Adding new roles required updating multiple files
- **Inconsistency**: Different components might handle roles differently

## Solution: Role-Based Navigation Utility

The new `useRoleBasedNavigation` hook automatically handles role prefixes:

```typescript
// New way - Automatic role prefix
const navigate = useRoleBasedNavigation();
navigate('/fleet/create');        // Becomes '/admin/fleet/create'
navigate('/customer/view/123');   // Becomes '/admin/customer/view/123'
```

## Usage Guide

### Basic Usage

1. **Import the hook**:
```typescript
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
```

2. **Use in component**:
```typescript
const MyComponent = () => {
  const navigate = useRoleBasedNavigation();
  
  const handleCreate = () => {
    navigate('/fleet/create'); // Automatically becomes '/admin/fleet/create'
  };
  
  return (
    <Button onClick={handleCreate}>Create Fleet</Button>
  );
};
```

### Advanced Usage

#### Absolute Navigation (No Role Prefix)

For routes that shouldn't have a role prefix (like login, error pages):

```typescript
const navigate = useRoleBasedNavigation();

// Navigate to absolute path without role prefix
navigate('/login', { absolute: true });     // Goes to '/login'
navigate('/error-404', { absolute: true }); // Goes to '/error-404'
```

#### Navigation with Options

```typescript
const navigate = useRoleBasedNavigation();

// Replace current history entry
navigate('/dashboard', { replace: true });

// Pass state data
navigate('/customer/view/123', { 
  state: { fromList: true } 
});

// Combine options
navigate('/login', { 
  absolute: true, 
  replace: true 
});
```

### Path Building Without Navigation

For building URLs or links without immediate navigation:

```typescript
import { useRoleBasedPath } from '../../../utils/roleBasedNavigation';

const MyComponent = () => {
  const getRolePath = useRoleBasedPath();
  
  const fleetCreatePath = getRolePath('/fleet/create'); // '/admin/fleet/create'
  const absolutePath = getRolePath('/login', { absolute: true }); // '/login'
  
  return (
    <Link to={fleetCreatePath}>Create Fleet</Link>
  );
};
```

### Getting Current User Role

```typescript
import { useCurrentUserRole } from '../../../utils/roleBasedNavigation';

const MyComponent = () => {
  const userRole = useCurrentUserRole(); // 'admin', 'manager', 'employee', etc.
  
  return <div>Current role: {userRole}</div>;
};
```

## Migration Guide

### Step 1: Update Imports

**Before:**
```typescript
import { useNavigate } from 'react-router-dom';
```

**After:**
```typescript
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
```

### Step 2: Update Hook Usage

**Before:**
```typescript
const navigate = useNavigate();
```

**After:**
```typescript
const navigate = useRoleBasedNavigation();
```

### Step 3: Update Navigation Calls

**Before:**
```typescript
const role = user?.Role?.roleName?.toLowerCase() || 'admin';
navigate(`/${role}/fleet/create`);
navigate(`/${role}/customer/view/${customerId}`);
navigate(`/${role}/dashboard`);
```

**After:**
```typescript
navigate('/fleet/create');
navigate(`/customer/view/${customerId}`);
navigate('/dashboard');
```

### Step 4: Handle Special Cases

**Absolute paths (no role prefix):**
```typescript
// Before
navigate('/login');
navigate('/error-404');

// After
navigate('/login', { absolute: true });
navigate('/error-404', { absolute: true });
```

## Examples

### Complete Component Example

```typescript
import React from 'react';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import { Button } from '@/components/ui/button';

const FleetList: React.FC = () => {
  const navigate = useRoleBasedNavigation();
  
  const handleCreate = () => {
    navigate('/fleet/create');
  };
  
  const handleView = (fleetId: string) => {
    navigate(`/fleet/view/${fleetId}`);
  };
  
  const handleEdit = (fleetId: string) => {
    navigate(`/fleet/edit/${fleetId}`);
  };
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  const handleLogout = () => {
    // Absolute navigation for logout
    navigate('/login', { absolute: true, replace: true });
  };
  
  return (
    <div>
      <Button onClick={handleCreate}>Create Fleet</Button>
      <Button onClick={handleBack}>Back to Dashboard</Button>
      <Button onClick={handleLogout}>Logout</Button>
      {/* Fleet items with view/edit buttons */}
    </div>
  );
};

export default FleetList;
```

### Link Building Example

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { useRoleBasedPath } from '../../../utils/roleBasedNavigation';

const Navigation: React.FC = () => {
  const getRolePath = useRoleBasedPath();
  
  return (
    <nav>
      <Link to={getRolePath('/dashboard')}>Dashboard</Link>
      <Link to={getRolePath('/fleet')}>Fleet Management</Link>
      <Link to={getRolePath('/customer')}>Customers</Link>
      <Link to={getRolePath('/reports')}>Reports</Link>
    </nav>
  );
};
```

## Best Practices

1. **Always use role-based navigation** for internal app routes
2. **Use absolute navigation** only for public routes (login, error pages)
3. **Consistent path format**: Always start with `/` (e.g., `/fleet/create`, not `fleet/create`)
4. **Avoid manual role extraction** in components
5. **Test with different user roles** to ensure proper routing

## Supported User Roles

The system automatically detects these common roles:
- `admin`
- `manager` 
- `employee`
- `user`
- `superadmin`

If a role is not recognized, it defaults to `admin`.

## Route Structure

With role-based navigation, your routes follow this pattern:

```
/{role}/{module}/{action}/{id?}

Examples:
/admin/fleet/create
/manager/customer/view/123
/employee/dashboard
/admin/reports/sales
```

## Troubleshooting

### Issue: Navigation not working
**Solution**: Ensure you're using `useRoleBasedNavigation` instead of `useNavigate`

### Issue: Double role prefix in URL
**Solution**: Don't include the role in your path - the utility adds it automatically

### Issue: Absolute routes not working
**Solution**: Use the `absolute: true` option for routes that shouldn't have role prefix

### Issue: Role not detected
**Solution**: Check that the user is properly authenticated and has a valid role in Redux state

## Future Enhancements

- **Route Guards**: Automatic permission checking based on routes
- **Role-based Menu**: Dynamic menu generation based on user permissions
- **Breadcrumb Integration**: Automatic breadcrumb generation
- **Deep Linking**: Handle direct URL access with proper role validation