import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { selectCurrentUser, logout } from "../../stores/slices/authSlice";
import { useTheme } from "../../contexts/ThemeContext";
import { FaSun, FaMoon, FaRegUser, FaCog } from "react-icons/fa";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
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
import { cn } from "../../lib/utils";
import type { AuthUser } from "../../utils/role";
import type { MenuItemConfig } from "../../config/menuConfig.tsx";
import { toast } from "sonner";
import { NotificationDropdown } from "../../modules/notifications/components";

interface HeaderProps {
  headerMenuItems?: MenuItemConfig[];
  onModuleChange?: (module: string) => void;
}

const Header: React.FC<HeaderProps> = ({ headerMenuItems = [], onModuleChange }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [headerFix, setHeaderFix] = useState(false);
  
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const role = user?.Role?.roleName?.toLowerCase() || "admin";

  useEffect(() => {
    const handleScroll = () => setHeaderFix(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleModuleNavigation = (module: string, path: string) => {
    localStorage.setItem("selectedModule", module);
    if (onModuleChange) {
      onModuleChange(module);
    }
    navigate(`/${role}/${path}`);
  };



  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("selectedModule");
    toast.success("Logout Successful"); // Add toast notification
    navigate("/", { replace: true });
  };

  return (
    <TooltipProvider>
      <div className="w-full flex justify-between items-center px-6 py-4 transition-all duration-300">
        <div className="flex items-center gap-2">
          {headerMenuItems.map((menuItem) => {
            const displayName = menuItem.module === "GENERAL" ? "Dashboard" : menuItem.title;
            return (
              <NavLink
                key={menuItem.key}
                to={`/${role}/${menuItem.path}`}
                onClick={() => handleModuleNavigation(menuItem.module, menuItem.path)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 no-underline",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 dark:shadow-blue-700/25"
                      : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300"
                  )
                }
              >
                {menuItem.icon}
                <span className="hidden sm:inline">{displayName}</span>
              </NavLink>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg"
              >
                {theme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Theme</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <NotificationDropdown
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg"
                  iconSize={18}
                  dropdownAlign="end"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenu open={showProfile} onOpenChange={setShowProfile}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={user?.avatar} 
                    alt="avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-4 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-border shadow-sm">
                  <AvatarImage 
                    src={user?.avatar} 
                    alt="avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
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
                className="cursor-pointer"
              >
                <FaRegUser className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowProfile(false);
                  navigate(`/${role}/notifications`);
                }}
                className="cursor-pointer"
              >
                <FaCog className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowProfile(false);
                  navigate(`/${role}/settings`);
                }}
                className="cursor-pointer"
              >
                <FaCog className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <FaCog className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Header;