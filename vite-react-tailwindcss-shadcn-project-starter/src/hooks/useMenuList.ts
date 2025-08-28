import { useState, useEffect, useMemo } from 'react';
import { menuConfig, MenuItemConfig } from '../config/menuConfig.tsx';
import { getAccessibleMenu, getMenuByLocation, groupMenuByModule } from '../utils/permissionUtils';
import type { Permission } from '../utils/role';

/**
 * Hook to get filtered menu items based on user permissions
 * @param userPermissions - Array of user permissions
 * @returns Object containing filtered menu items for different locations and purposes
 */
export function useMenuList(userPermissions: Permission[] = []) {
  const [accessibleMenuItems, setAccessibleMenuItems] = useState<MenuItemConfig[]>([]);

  // Filter menu items based on permissions
  useEffect(() => {
    const filteredItems = getAccessibleMenu(menuConfig, userPermissions);
    setAccessibleMenuItems(filteredItems);
  }, [userPermissions]);

  // Memoized computed values
  const menuData = useMemo(() => {
    // Get menu items by location
    const headerMenuItems = getMenuByLocation(accessibleMenuItems, 'header');
    const sidebarMenuItems = getMenuByLocation(accessibleMenuItems, 'sidebar');
    
    // Group sidebar items by module for organized display
    const sidebarByModule = groupMenuByModule(sidebarMenuItems);
    
    // Get unique modules for header navigation
    const availableModules = [...new Set(accessibleMenuItems.map(item => item.module))];
    
    return {
      // All accessible menu items
      allItems: accessibleMenuItems,
      
      // Items for header (module navigation)
      headerItems: headerMenuItems,
      
      // Items for sidebar (detailed navigation)
      sidebarItems: sidebarMenuItems,
      
      // Sidebar items grouped by module
      sidebarByModule,
      
      // Available modules
      modules: availableModules,
      
      // Helper function to get items for a specific module
      getItemsForModule: (module: string) => 
        accessibleMenuItems.filter(item => 
          item.module.toLowerCase() === module.toLowerCase() && 
          item.location === 'sidebar'
        ),
      
      // Helper function to get first item for a module (for default navigation)
      getFirstItemForModule: (module: string) => 
        accessibleMenuItems.find(item => 
          item.module.toLowerCase() === module.toLowerCase() && 
          item.location === 'sidebar'
        ),
    };
  }, [accessibleMenuItems]);

  return menuData;
}

// Legacy compatibility - returns menu items in the old format for existing components
export function useMenuListLegacy(userPermissions: Permission[] = []) {
  const { sidebarByModule } = useMenuList(userPermissions);
  
  // Convert to legacy format for backward compatibility
  return useMemo(() => {
    return Object.entries(sidebarByModule).map(([module, items]) => {
      // Get the first item to use its icon and title for the group
      const firstItem = items[0];
      if (!firstItem) return null;
      
      return {
        title: module,
        module: module,
        classsChange: 'mm-collapse',
        iconStyle: firstItem.icon,
        content: items.map(item => ({
          title: item.title,
          to: item.path,
        })),
      };
    }).filter(Boolean);
  }, [sidebarByModule]);
}