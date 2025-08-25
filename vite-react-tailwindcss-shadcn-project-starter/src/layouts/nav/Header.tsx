import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBell,
  FaSun,
  FaMoon,
  FaCog,
  FaRegUser,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../stores/slices/authSlice";
import { useTheme } from "../../contexts/ThemeContext";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { debounce } from "lodash";

// Types
interface HeaderProps {
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
  onModuleClick: (moduleName: string) => void;
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

const Header: React.FC<HeaderProps> = ({ menuList, onModuleClick }) => {
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const location = useLocation();
  const [headerFix, setHeaderFix] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount] = useState(0); // Placeholder for notification count
  const { theme, toggleTheme } = useTheme();

  // Compute unique modules and their icons
  const uniqueModules = useMemo(() => 
    [...new Set(menuList.map(item => item.module))],
    [menuList]
  );
  
  const moduleIcons = useMemo(() => {
    const icons: Record<string, React.ReactNode> = {};
    menuList.forEach(group => {
      if (!icons[group.module]) {
        icons[group.module] = group.iconStyle;
      }
    });
    return icons;
  }, [menuList]);

  // Initialize selectedModule with the first module or based on current route
  const [selectedModule, setSelectedModule] = useState(() => {
    const currentGroup = menuList.find(group =>
      group.content?.some(sub => location.pathname.includes(sub.to))
    );
    return currentGroup ? currentGroup.module : uniqueModules[0] || "";
  });

  const debouncedFetchNotifications = useMemo(
    () => debounce(() => {
      // Placeholder for notification fetching
      console.log("Fetching notifications...");
    }, 300),
    []
  );

  useEffect(() => {
    const handleScroll = () => setHeaderFix(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedModule = localStorage.getItem("selectedModule");
    if (storedModule) {
      setSelectedModule(storedModule);
    }
  }, []);

  const handleModuleClick = (moduleName: string) => {
    localStorage.setItem("selectedModule", moduleName);
    setSelectedModule(moduleName);
  };

  // Update parent component when selectedModule changes
  useEffect(() => {
    if (selectedModule) {
      onModuleClick(selectedModule);
    }
  }, [selectedModule, onModuleClick]);

  const handleNotificationToggle = (isOpen: boolean) => {
    setIsNotificationOpen(isOpen);
    if (isOpen) debouncedFetchNotifications();
  };

  const handleLogout = () => {
    // Placeholder for logout functionality
    console.log("Logging out...");
  };

  return (
    <div className={`bg-primary text-primary-foreground transition-all duration-300 ${
      headerFix ? "fixed top-0 left-0 right-0 z-50 shadow-lg" : ""
    }`}>
      <div className="w-full px-4 py-3 flex items-center justify-between">
        {/* Left section - Module List */}
        <div className="flex items-center gap-3">
          {uniqueModules.map((moduleName, index) => {
            const icon = moduleIcons[moduleName];
            return (
              <Button
                key={index}
                variant="ghost"
                onClick={() => handleModuleClick(moduleName)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 hover:bg-white/10 ${
                  selectedModule === moduleName 
                    ? "bg-white/15 text-yellow-400" 
                    : "text-white hover:text-white"
                }`}
              >
                <span className="flex items-center justify-center">{icon}</span>
                <span>{moduleName === "GENERAL" ? "Dashboard" : moduleName}</span>
              </Button>
            );
          })}
        </div>

        {/* Right section - Icons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  {theme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <DropdownMenu open={isNotificationOpen} onOpenChange={handleNotificationToggle}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/10 hover:text-white"
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
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-center text-muted-foreground">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white p-2"
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
              <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt="avatar" />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user?.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {user?.Role?.roleName}
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <FaRegUser className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="flex items-center gap-2">
                  <FaBell className="h-4 w-4" />
                  Notifications
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <FaCog className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;