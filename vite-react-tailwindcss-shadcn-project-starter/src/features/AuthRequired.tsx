import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  selectCurrentUser,
  selectToken,
  setCredentials,
} from "../stores/slices/authSlice";
import { useMenuList } from "../layouts/nav/Menu";
import type { RootState } from "../stores/store";

// Types
interface AuthRequiredProps {
  allowedRoles?: string[];
}

interface Permission {
  module: string;
  name: string;
  actions: string[];
}

interface UserRole {
  roleName: string;
  permissions: Permission[];
}

interface AuthUser {
  Role?: UserRole;
  email?: string;
  name?: string;
  [key: string]: any;
}

interface MenuItem {
  title: string;
  to?: string;
  module?: string;
  content?: MenuItem[];
  iconStyle?: React.ReactNode;
}

const capitalizeFirstLetter = (string: string): string => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const AuthRequired: React.FC<AuthRequiredProps> = ({ allowedRoles }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const location = useLocation();
  const navigate = useNavigate();

  const [isInitializing, setIsInitializing] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const userRoleName = capitalizeFirstLetter(user?.Role?.roleName || "");
  const userPermissions = useMemo(() => user?.Role?.permissions || [], [user]);

  const menuList = useMenuList(userPermissions);
  const isMenuListReady = useMemo(() => menuList.length > 0, [menuList]);

  // Restore token and user from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token && !user && storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setCredentials({ user: parsedUser, token: storedToken }));
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setIsInitializing(false);
  }, [dispatch, token, user]);

  // Load stored module from localStorage
  useEffect(() => {
    const storedModule = localStorage.getItem("selectedModule");
    if (storedModule) {
      setActiveModule(storedModule);
    }
  }, []);

  const handleNavigation = (moduleTitle: string) => {
    localStorage.setItem("selectedModule", moduleTitle);
    setActiveModule(moduleTitle);
  };

  // Handle role-based navigation and menu validation
  useEffect(() => {
    if (isInitializing || !token || !user || !isMenuListReady) return;

    // Check role permissions
    if (allowedRoles && !allowedRoles.includes(userRoleName)) {
      navigate("/page-error-403", { state: { from: location }, replace: true });
      return;
    }

    // Extract role from current path or default to user's role
    const currentRole = location.pathname.split("/")[1] || userRoleName.toLowerCase();
    const expectedRole = userRoleName.toLowerCase();
    
    // Validate if user is accessing correct role path
    if (currentRole !== expectedRole && currentRole !== "page-error-403") {
      // Redirect to user's correct role path
      const targetPath = location.pathname.replace(`/${currentRole}`, `/${expectedRole}`);
      navigate(targetPath, { replace: true });
      return;
    }

    // Check if current path is valid within user's menu permissions
    const isValidPath = menuList.some((menuGroup) => {
      // Handle special dynamic routes
      if (
        location.pathname.startsWith(`/${expectedRole}/schedule/edit`) ||
        location.pathname.startsWith(`/${expectedRole}/invoice/create`) ||
        location.pathname.startsWith(`/${expectedRole}/add-payment/supplier/create/fleet`) ||
        location.pathname.startsWith(`/${expectedRole}/add-payment/supplier/create`) ||
        location.pathname === `/${expectedRole}/welcome`
      ) {
        return true;
      }
      
      // Check menu items with sub-content
      if (menuGroup.content?.length) {
        return menuGroup.content.some(
          (item) => item.to && location.pathname.startsWith(`/${expectedRole}/${item.to}`)
        );
      }
      
      // Check direct menu items
      return menuGroup.to && location.pathname.startsWith(`/${expectedRole}/${menuGroup.to}`);
    });
    
    // Redirect to first available menu item if current path is invalid
    if (!isValidPath) {
      for (const menuGroup of menuList || []) {
        if (menuGroup.content?.length) {
          const firstChild = menuGroup.content.find((item) => item.to);
          if (firstChild) {
            handleNavigation(menuGroup.title);
            navigate(`/${expectedRole}/${firstChild.to}`, { replace: true });
            return;
          }
        }
        if (menuGroup.to) {
          handleNavigation(menuGroup.title);
          navigate(`/${expectedRole}/${menuGroup.to}`, { replace: true });
          return;
        }
      }
      // Fallback to welcome page
      navigate(`/${expectedRole}/welcome`, { replace: true });
    }
  }, [
    isInitializing,
    token,
    user,
    isMenuListReady,
    allowedRoles,
    userRoleName,
    navigate,
    menuList,
    location.pathname,
    handleNavigation,
  ]);

  if (isInitializing || !token || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return <Outlet />;
};

export default AuthRequired;