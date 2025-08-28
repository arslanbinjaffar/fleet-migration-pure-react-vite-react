import React, { useState, useEffect, useMemo, memo } from "react";
import { useMenuList } from "./Menu";
import {
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaBell,
  FaSun,
  FaMoon,
  FaRegUser,
  FaCog,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../../stores/slices/authSlice";
import { useTheme } from "../../contexts/ThemeContext";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { cn } from "../../lib/utils";
import type { AuthUser } from "../../utils/role";

// Types
interface MenuGroup {
  module: string;
  iconStyle: React.ReactNode;
  title: string;
  content?: Array<{
    to: string;
    title: string;
    content?: Array<{
      to: string;
      title: string;
    }>;
  }>;
  to?: string;
}

interface MainModule {
  title: string;
  iconStyle: React.ReactNode | null;
  content: Array<{
    title: string;
    to?: string;
    iconStyle: React.ReactNode;
    content: Array<{
      to: string;
      title: string;
    }>;
  }>;
}

interface MenuItemProps {
  item: any;
  parentPath: string[];
  isActive: boolean;
  isExpanded: boolean;
  toggleExpand: (path: string) => void;
  navigate: (path: string) => void;
  role: string;
  setOpen: (open: boolean) => void;
  setExpanded: (expanded: Set<string>) => void;
  activePath: string[];
  expanded: Set<string>;
  isModule?: boolean;
  closeOtherModules: (moduleTitle: string) => void;
  currentModule: string | null;
  setCurrentModule: (module: string | null) => void;
}

const getMainModules = (menuList: MenuGroup[]): MainModule[] => {
  const modulesMap = new Map<string, MainModule>();

  menuList.forEach((item) => {
    const moduleName = item.module || item.module;

    if (!modulesMap.has(item.module)) {
      modulesMap.set(item.module, {
        title: moduleName === "GENERAL" ? "Dashboard" : moduleName,
        iconStyle: null,
        content: [],
      });
    }
    // Add the group as a submenu item, ensuring no redundant nesting
    modulesMap.get(item.module)!.content.push({
      title: item.title,
      to: item.to,
      iconStyle: item.iconStyle,
      content: item.content || [], // Include submodules if they exist
    });
  });

  return Array.from(modulesMap.values());
};

const hasSubmodules = (item: any): boolean => {
  return Array.isArray(item.content) && item.content.length > 0;
};

const hasSingleChild = (item: any): boolean => {
  return Array.isArray(item.content) && item.content.length === 1;
};

const isDirectLink = (item: any): boolean => {
  return item.to && !hasSubmodules(item);
};

const AnimatedSubmenu: React.FC<{ isExpanded: boolean; children: React.ReactNode }> = ({
  isExpanded,
  children,
}) => {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="overflow-y-auto">{children}</div>
    </div>
  );
};

const MenuItem = memo<MenuItemProps>(
  ({
    item,
    parentPath,
    isActive,
    isExpanded,
    toggleExpand,
    navigate,
    role,
    setOpen,
    setExpanded,
    activePath,
    expanded,
    isModule = false,
    closeOtherModules,
    currentModule,
    setCurrentModule,
  }) => {
    const path = [...parentPath, item.title];
    const pathStr = path.join("/");
    const showChevron =
      hasSubmodules(item) && !hasSingleChild(item) && !isDirectLink(item);
    const singleChild = hasSingleChild(item) ? item.content[0] : null;

    const handleClick = () => {
      if (item.title === "Dashboard") {
        setOpen(false);
        setExpanded(new Set());
        setCurrentModule(null);
        navigate(`/${role}`);
        return;
      }
      if (item.title === "Roles") {
        setOpen(false);
        setExpanded(new Set());
        setCurrentModule(null);
        navigate(`/${role}/group-permission`);
        return;
      }

      // Handle single child module - navigate directly to child
      if (hasSingleChild(item)) {
        setOpen(false);
        setExpanded(new Set());
        setCurrentModule(null);
        navigate(`/${role}/${singleChild.to}`);
        return;
      }

      if (isModule) {
        if (currentModule === item.title) {
          setCurrentModule(null);
        } else {
          closeOtherModules(item.title);
          setCurrentModule(item.title);
        }
        return;
      }

      if (isDirectLink(item)) {
        setOpen(false);
        setExpanded(new Set());
        setCurrentModule(null);
        navigate(`/${role}/${item.to}`);
        return;
      }

      if (showChevron) {
        toggleExpand(pathStr);
      }
    };

    return (
      <>
        <li
          className={cn(
            "flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer transition-all duration-200",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            isExpanded && "bg-gray-100 dark:bg-gray-800 border-l-4 border-l-primary font-bold text-primary",
            isActive && "bg-gray-50 dark:bg-gray-900 text-primary font-bold border-l-4 border-l-primary"
          )}
        >
          <span
            className="flex items-center flex-1 cursor-pointer"
            onClick={handleClick}
          >
            {item.iconStyle && (
              <span className="flex items-center justify-center mr-2">
                {item.iconStyle}
              </span>
            )}
            <span>{item.title}</span>
          </span>
          {showChevron && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                if (isModule) {
                  if (currentModule === item.title) {
                    setCurrentModule(null);
                  } else {
                    closeOtherModules(item.title);
                    setCurrentModule(item.title);
                  }
                } else {
                  toggleExpand(pathStr);
                }
              }}
            >
              {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </Button>
          )}
        </li>
        {isExpanded && showChevron && (
          <AnimatedSubmenu isExpanded={isExpanded}>
            {item.content.map((subItem: any) => (
              <MenuItem
                key={`${pathStr}/${subItem.title}`}
                item={subItem}
                parentPath={path}
                isActive={
                  activePath.length >= path.length + 1 &&
                  path.every((t, i) => t === activePath[i]) &&
                  subItem.title === activePath[path.length]
                }
                isExpanded={expanded.has(`${pathStr}/${subItem.title}`)}
                toggleExpand={toggleExpand}
                navigate={navigate}
                role={role}
                setOpen={setOpen}
                setExpanded={setExpanded}
                activePath={activePath}
                expanded={expanded}
                closeOtherModules={closeOtherModules}
                currentModule={currentModule}
                setCurrentModule={setCurrentModule}
              />
            ))}
          </AnimatedSubmenu>
        )}
      </>
    );
  }
);

MenuItem.displayName = "MenuItem";

const MobileNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(new Set<string>());
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount] = useState(0); // Placeholder for notification count
  
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const dispatch = useDispatch();
  const role = user?.Role?.roleName?.toLowerCase() || "admin";
  const userPermissions = user?.Role?.permissions || [];
  const menuList = useMenuList(userPermissions);
  const { theme, toggleTheme } = useTheme();

  const mainModules = useMemo(() => getMainModules(menuList || []), [menuList]);

  const activePath = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const roleSegment = pathSegments[0] || "admin";
    const segment = pathSegments[1] || "";
    let path: string[] = [];

    for (const module of mainModules) {
      for (const item of module.content) {
        if (item.to === segment) {
          path.push(module.title);
          path.push(item.title);
          return path;
        }
        if (item.content) {
          const subItem = item.content.find((child) => child.to === segment);
          if (subItem) {
            path.push(module.title);
            path.push(item.title);
            path.push(subItem.title);
            return path;
          }
        }
      }
    }

    return path;
  }, [location.pathname, mainModules]);

  useEffect(() => {
    if (activePath.length > 0) {
      setCurrentModule(activePath[0]);
    }
  }, [activePath]);

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (expanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const closeOtherModules = (moduleTitle: string) => {
    setExpanded(new Set());
    setCurrentModule(moduleTitle);
  };

  const handleLogout = () => {
    // Dispatch logout action to clear Redux state
    dispatch(logout());
    // Clear selected module from localStorage (not persisted by redux-persist)
    localStorage.removeItem("selectedModule");
    // Navigate to login page
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-between p-3 bg-primary text-primary-foreground fixed top-0 left-0 w-full z-50 shadow-lg">
        {/* Hamburger Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <FaBars size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 bg-primary text-primary-foreground">
              <SheetTitle className="text-white">Fleet Management</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full">
              <ul className="flex-1 overflow-y-auto">
                {mainModules.map((module) => (
                  <React.Fragment key={module.title}>
                    <MenuItem
                      item={module}
                      parentPath={[]}
                      isActive={activePath[0] === module.title}
                      isExpanded={currentModule === module.title}
                      toggleExpand={toggleExpand}
                      navigate={navigate}
                      role={role}
                      setOpen={setOpen}
                      setExpanded={setExpanded}
                      activePath={activePath || []}
                      expanded={expanded}
                      isModule={true}
                      closeOtherModules={closeOtherModules}
                      currentModule={currentModule}
                      setCurrentModule={setCurrentModule}
                    />
                  </React.Fragment>
                ))}
              </ul>
              <div className="p-4 border-t">
                <Button
                  onClick={() => {
                    setOpen(false);
                    setExpanded(new Set());
                    setCurrentModule(null);
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => {
            setOpen(false);
            navigate(`/${role}/dashboard`);
          }}
        >
          <span className="text-lg font-bold">Fleet Management</span>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/10"
          >
            {theme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
          </Button>

          {/* Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/10"
              >
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-center text-muted-foreground">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu open={showProfile} onOpenChange={setShowProfile}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt="avatar" />
                  <AvatarFallback className="bg-white/20 text-white">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-4 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src={user?.avatar} alt="avatar" />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium">{user?.email}</div>
                <div className="text-sm text-muted-foreground">
                  {user?.Role?.roleName}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setShowProfile(false);
                  navigate(`/${role}/profile`);
                }}
              >
                <FaRegUser className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowProfile(false);
                  navigate(`/${role}/settings`);
                }}
              >
                <FaCog className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <FaCog className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default MobileNav;