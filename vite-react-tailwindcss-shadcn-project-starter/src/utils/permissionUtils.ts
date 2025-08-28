import type { Permission } from './role';
import { MenuItemConfig } from '../config/menuConfig.tsx';

/**
 * Filters menu items based on user permissions
 * @param menuItems - Array of menu item configurations
 * @param permissions - User's permissions array
 * @returns Filtered array of accessible menu items
 */
export function getAccessibleMenu(
  menuItems: MenuItemConfig[],
  permissions: Permission[] = []
): MenuItemConfig[] {
  if (!permissions.length) {
    return [];
  }

  return menuItems.filter((menuItem) => {
    // Get the permission name to check (use custom permissionName or fallback to key/title)
    const permissionToCheck = menuItem.permissionName || menuItem.key || menuItem.title;
    
    // Check if user has permission for this menu item
    return permissions.some((permission) => {
      // Match by module and permission name (case-insensitive)
      const moduleMatch = permission.module.toLowerCase() === menuItem.module.toLowerCase();
      const nameMatch = permission.name.toLowerCase() === permissionToCheck.toLowerCase();
      
      return moduleMatch && nameMatch;
    });
  });
}

/**
 * Groups menu items by module
 * @param menuItems - Array of menu item configurations
 * @returns Object with modules as keys and menu items as values
 */
export function groupMenuByModule(menuItems: MenuItemConfig[]): Record<string, MenuItemConfig[]> {
  return menuItems.reduce((groups, item) => {
    const module = item.module;
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(item);
    return groups;
  }, {} as Record<string, MenuItemConfig[]>);
}

/**
 * Filters menu items by location (header or sidebar)
 * @param menuItems - Array of menu item configurations
 * @param location - Location to filter by ('header' or 'sidebar')
 * @returns Filtered array of menu items for the specified location
 */
export function getMenuByLocation(
  menuItems: MenuItemConfig[],
  location: 'header' | 'sidebar'
): MenuItemConfig[] {
  return menuItems.filter(item => item.location === location);
}

/**
 * Gets unique modules from menu items (useful for header navigation)
 * @param menuItems - Array of menu item configurations
 * @returns Array of unique module names
 */
export function getUniqueModules(menuItems: MenuItemConfig[]): string[] {
  const modules = menuItems.map(item => item.module);
  return [...new Set(modules)];
}

/**
 * Finds the first menu item for a given module (useful for default navigation)
 * @param menuItems - Array of menu item configurations
 * @param module - Module name to find first item for
 * @returns First menu item for the module or undefined
 */
export function getFirstMenuItemForModule(
  menuItems: MenuItemConfig[],
  module: string
): MenuItemConfig | undefined {
  return menuItems.find(item => 
    item.module.toLowerCase() === module.toLowerCase() && 
    item.location === 'sidebar'
  );
}