import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

// Types
interface SidebarProps {
  show: boolean;
  menuList: Array<{
    module: string;
    iconStyle: React.ReactNode;
    title: string;
    content?: Array<{
      to: string;
      title: string;
    }>;
    to?: string;
  }>;
  selectedModule: string;
}

interface UserRole {
  roleName: string;
  permissions: string[];
}

interface AuthUser {
  email?: string;
  avatar?: string;
  Role?: UserRole;
  [key: string]: any;
}

const Sidebar: React.FC<SidebarProps> = ({ show, menuList, selectedModule }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [manuallyOpenMenus, setManuallyOpenMenus] = useState<Record<string, boolean>>({});
  const [iconHover, setIconHover] = useState(false);
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const role = user?.Role?.roleName?.toLowerCase() || "administrative";
  const { theme } = useTheme();

  // Initialize open menus based on selectedModule and ensure first module is opened by default
  useEffect(() => {
    const storedModule = localStorage.getItem("selectedModule");
    const moduleGroups = menuList?.filter(item => item.module === selectedModule);
    
    // Set the first module to be opened by default if no stored preference
    if (moduleGroups && moduleGroups.length > 0) {
      const firstModuleTitle = moduleGroups[0].title;
      
      setManuallyOpenMenus(prev => {
        const newState = { ...prev };
        
        // If there's a stored module preference, use it
        if (storedModule && menuList.some(group => group.title === storedModule)) {
          newState[storedModule] = true;
        } else {
          // Otherwise, open the first module by default
          newState[firstModuleTitle] = true;
        }
        
        return newState;
      });
    }
  }, [selectedModule, menuList]);

  const handleModuleClick = (moduleTitle: string) => {
    if (menuList.some(group => group.title === moduleTitle)) {
      localStorage.setItem("selectedModule", moduleTitle);
      setManuallyOpenMenus(prev => ({
        ...prev,
        [moduleTitle]: !prev[moduleTitle],
      }));
    }
  };

  // Filter groups for the selected module
  const moduleGroups = useMemo(
    () => menuList?.filter(item => item.module === selectedModule),
    [menuList, selectedModule]
  );

  // Function to check if a path is active
  const isActive = (path?: string) => {
    if (!path) return false;
    const fullPath = `/${role}/${path}`;
    return (
      location.pathname === fullPath ||
      location.pathname.startsWith(`${fullPath}/`)
    );
  };

  // Handle navigation with error handling
  const handleNavigation = (path: string) => {
    const targetPath = `/${role}/${path}`;
    console.log(`Navigating to: ${targetPath}`);
    navigate(targetPath, { replace: false });
  };

  // Debug state and navigation
  useEffect(() => {
    console.log({
      pathname: location.pathname,
      selectedModule,
      moduleGroups,
      manuallyOpenMenus,
    });
  }, [location.pathname, selectedModule, moduleGroups, manuallyOpenMenus]);

  return (
    <div
      onMouseEnter={() => setIconHover(true)}
      onMouseLeave={() => setIconHover(false)}
      className={cn(
        "min-h-screen text-white transition-all duration-300 border-r border-border",
        "bg-gradient-to-b from-[#07292A] to-[#115456]",
        show ? "w-64" : "w-16",
        iconHover && !show ? "w-64" : ""
      )}
    >
      <div className="px-2 py-3 h-full overflow-y-auto">
        <nav className="flex flex-col space-y-1">
          {moduleGroups?.map((group, index) => {
            const hasActiveChild =
              group.content &&
              Array.isArray(group.content) &&
              group.content.some(child => group.content!.length > 1 && isActive(child?.to));

            const isOpen = manuallyOpenMenus[group.title] || hasActiveChild;
            
            // Check if the group is active (for single child, parent is active if the child's route is active)
            const isGroupActive =
              group.content && Array.isArray(group.content) && group.content.length === 1
                ? isActive(group.content[0]?.to)
                : hasActiveChild;

            const hasMultipleChildren = group.content && Array.isArray(group.content) && group.content.length > 1;

            return (
              <div key={group.title || index}>
                {hasMultipleChildren ? (
                  <Collapsible open={isOpen} onOpenChange={() => handleModuleClick(group.title)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between text-white hover:bg-white/10 px-3 py-2 mt-2 h-auto",
                          isGroupActive && "bg-primary text-white font-bold"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5">
                            {group.iconStyle}
                          </span>
                          <span className={cn(
                            "transition-opacity duration-200",
                            (!show && !iconHover) ? "opacity-0 w-0" : "opacity-100"
                          )}>
                            {group.title}
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
                    <CollapsibleContent className="space-y-1">
                      {group.content?.map((subModule, subIndex) => (
                        <Button
                          key={`${group.title}-${subIndex}`}
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full justify-start px-4 py-2 text-left h-auto",
                            isActive(subModule?.to)
                              ? "bg-primary text-white font-bold"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Link
                            to={`/${role}/${subModule?.to}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavigation(subModule?.to);
                            }}
                          >
                            <span className={cn(
                              "ml-2 transition-opacity duration-200",
                              (!show && !iconHover) ? "opacity-0" : "opacity-100"
                            )}>
                              {subModule?.title}
                            </span>
                          </Link>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full justify-start text-white hover:bg-white/10 px-3 py-2 mt-2 h-auto",
                      isGroupActive && "bg-primary text-white font-bold"
                    )}
                  >
                    <Link
                      to={group.content?.[0]?.to ? `/${role}/${group.content[0].to}` : "#"}
                      onClick={(e) => {
                        if (group.content?.[0]?.to) {
                          e.preventDefault();
                          handleNavigation(group.content[0].to);
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5">
                          {group.iconStyle}
                        </span>
                        <span className={cn(
                          "transition-opacity duration-200",
                          (!show && !iconHover) ? "opacity-0" : "opacity-100"
                        )}>
                          {group.title}
                        </span>
                      </span>
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;