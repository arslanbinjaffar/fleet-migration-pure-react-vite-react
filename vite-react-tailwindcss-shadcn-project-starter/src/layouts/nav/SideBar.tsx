import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../stores/slices/authSlice";
import { useTheme } from "../../contexts/ThemeContext";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { cn } from "../../lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { Button } from "../../components/ui/button";
import type { AuthUser } from "../../utils/role";
import type { MenuItemConfig } from "../../config/menuConfig.tsx";

interface SidebarProps {
  show: boolean;
  sidebarMenuItems: MenuItemConfig[];
  selectedModule: string;
}

const Sidebar: React.FC<SidebarProps> = ({ show, sidebarMenuItems, selectedModule }) => {
  const [manuallyOpenMenus, setManuallyOpenMenus] = useState<Record<string, boolean>>({});
  const [iconHover, setIconHover] = useState(false);
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const role = user?.Role?.roleName?.toLowerCase() || "admin";
  const { theme } = useTheme();

  // Define the desired order for HRM module items (groups and standalone)
  const hrmItemOrder = ["payroll", "shift-type", "loans", "leave", "attendance", "employee", "holidays"];

  // Group menu items by module for the selected module
  const moduleMenuItems = sidebarMenuItems?.filter(item => item?.module === selectedModule && item.location === "sidebar");

  // Organize items into groups and standalone items
  const organizedItems = React.useMemo(() => {
    const groups: Record<string, MenuItemConfig[]> = {};
    const standalone: MenuItemConfig[] = [];
    const groupHeaders: Record<string, MenuItemConfig> = {};

    // Separate items into groups and standalone, ensuring no duplication
    moduleMenuItems.forEach(item => {
      if (item.isGroupHeader) {
        groupHeaders[item.group!] = item;
        groups[item.group!] = [];
      } else if (item.group) {
        if (!groups[item.group]) {
          groups[item.group] = [];
        }
        groups[item.group].push(item);
      } else {
        standalone.push(item);
      }
    });

    // For HRM module, sort both groups and standalone items according to hrmItemOrder
    if (selectedModule === "HRM") {
      const sortedItems: MenuItemConfig[] = [];
      const processedKeys = new Set<string>();

      // Process items in the order specified by hrmItemOrder
      hrmItemOrder.forEach(key => {
        // Check for group header
        const groupHeader = Object.values(groupHeaders).find(header => header.group === key);
        if (groupHeader && groups[key]) {
          sortedItems.push(groupHeader);
          sortedItems.push(...groups[key]);
          processedKeys.add(key);
        }
        // Check for standalone item
        const standaloneItem = standalone.find(item => item.key === key);
        if (standaloneItem) {
          sortedItems.push(standaloneItem);
          processedKeys.add(key);
        }
      });

      // Add any remaining groups not in hrmItemOrder
      Object.entries(groups).forEach(([groupKey, groupItems]) => {
        if (!processedKeys.has(groupKey) && groupHeaders[groupKey]) {
          sortedItems.push(groupHeaders[groupKey]);
          sortedItems.push(...groupItems);
        }
      });

      // Add any remaining standalone items not in hrmItemOrder
      standalone.forEach(item => {
        if (!processedKeys.has(item.key)) {
          sortedItems.push(item);
        }
      });

      return { groups, standalone, groupHeaders, sortedItems };
    }

    // For non-HRM modules, return groups and standalone as is
    return { groups, standalone, groupHeaders, sortedItems: [...standalone, ...Object.entries(groups).flatMap(([groupKey, groupItems]) => [groupHeaders[groupKey], ...groupItems]).filter(Boolean)] };
  }, [moduleMenuItems, selectedModule]);

  // Initialize open menus based on selectedModule
  useEffect(() => {
    const storedModule = localStorage.getItem("selectedModule");
    if (storedModule) {
      setManuallyOpenMenus(prev => ({
        ...prev,
        [storedModule]: true,
      }));
    }
  }, [selectedModule]);

  const handleGroupToggle = (groupKey: string) => {
    setManuallyOpenMenus(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  return (
    <div
      onMouseEnter={() => setIconHover(true)}
      onMouseLeave={() => setIconHover(false)}
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-300 border-r z-30",
        "bg-gradient-to-b from-slate-900 via-blue-900/20 to-purple-900/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30",
        "border-slate-700/60 dark:border-slate-800/60",
        "shadow-xl shadow-blue-900/10 dark:shadow-black/50",
        show ? "w-64" : "w-16",
        iconHover && !show ? "w-64" : ""
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center justify-center py-6 border-b border-slate-700/40 dark:border-slate-800/40",
        "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 shadow-lg shadow-blue-500/20 dark:shadow-blue-700/20"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-full h-24 rounded-lg  flex items-center justify-center">
            {/* <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg> */}
            <img src="/assets/logos/fleet-logo.png" alt="logo" className="w-full h-full object-contain " />
          </div>
          {/* <span className={cn(
            "text-white font-bold text-lg transition-opacity duration-200",
            (!show && !iconHover) ? "opacity-0 w-0" : "opacity-100"
          )}>
            FleetMS
          </span> */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600/50 dark:scrollbar-thumb-blue-700/50 scrollbar-track-transparent">
        <nav className="flex flex-col space-y-1 p-3">
          {organizedItems.sortedItems.map((item, index) => {
            if (item.isGroupHeader) {
              const groupKey = item.group!;
              const groupItems = organizedItems.groups[groupKey] || [];
              const isOpen = manuallyOpenMenus[groupKey];

              if (groupItems.length === 0) return null;

              return (
                <div key={item.key} className="mt-2">
                  <Collapsible open={isOpen} onOpenChange={() => handleGroupToggle(groupKey)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between text-slate-200 dark:text-slate-300 hover:bg-blue-800/30 dark:hover:bg-blue-900/30 px-3 py-3 h-auto rounded-lg transition-all duration-200",
                          "hover:text-white dark:hover:text-white hover:shadow-md hover:shadow-blue-500/10 dark:hover:shadow-blue-700/10"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5">
                            {item.icon}
                          </span>
                          <span className={cn(
                            "transition-opacity duration-200",
                            (!show && !iconHover) ? "opacity-0 w-0" : "opacity-100"
                          )}>
                            {item.title}
                          </span>
                        </span>
                        <span className={cn(
                          "transition-opacity duration-200",
                          (!show && !iconHover) ? "opacity-0" : "opacity-100"
                        )}>
                          {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-4">
                      {groupItems.map((menuItem) => (
                        <NavLink
                          key={menuItem.key}
                          to={`/${role}/${menuItem.path}`}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-slate-300 dark:text-slate-400 hover:bg-blue-800/20 dark:hover:bg-blue-900/20 hover:text-white dark:hover:text-white transition-all duration-200 no-underline",
                              isActive && "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 dark:shadow-blue-700/25"
                            )
                          }
                        >
                          <span className="flex items-center justify-center w-4 h-4">
                            {menuItem.icon}
                          </span>
                          <span className={cn(
                            "transition-opacity duration-200 text-sm",
                            (!show && !iconHover) ? "opacity-0 w-0" : "opacity-100"
                          )}>
                            {menuItem.title}
                          </span>
                        </NavLink>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            }

            // Only render standalone items that don't belong to any group
            if (item.group) return null;

            return (
              <div key={item.key}>
                <NavLink
                  to={`/${role}/${item.path}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 w-full px-3 py-3 mt-1 rounded-lg text-slate-200 dark:text-slate-300 hover:bg-blue-800/30 dark:hover:bg-blue-900/30 hover:text-white dark:hover:text-white transition-all duration-200 no-underline hover:shadow-md hover:shadow-blue-500/10 dark:hover:shadow-blue-700/10",
                      isActive && "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 dark:shadow-blue-700/25"
                    )
                  }
                >
                  <span className="flex items-center justify-center w-5 h-5">
                    {item.icon}
                  </span>
                  <span className={cn(
                    "transition-opacity duration-200",
                    (!show && !iconHover) ? "opacity-0 w-0" : "opacity-100"
                  )}>
                    {item.title}
                  </span>
                </NavLink>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;