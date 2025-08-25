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

interface UserRole {
  roleName: string;
  permissions: string[];
}

interface AuthUser {
  Role?: UserRole;
  [key: string]: any;
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

  // Only redirect on initial load if the current path is invalid
  useEffect(() => {
    if (isInitializing || !token || !user || !isMenuListReady) return;

    if (allowedRoles && !allowedRoles.includes(userRoleName)) {
      navigate("/page-error-403", { state: { from: location }, replace: true });
      return;
    }

    // Check if current path is valid
    const role = location.pathname.split("/")[1] || "administrative";
    console.log(location.pathname, "pathname");
    
    const isValidPath = menuList.some((menuGroup) => {
      // Handle special routes
      if (
        location.pathname.startsWith(`/${role}/schedule/edit`) ||
        location.pathname.startsWith(`/${role}/invoice/create`) ||
        location.pathname.startsWith(`/${role}/add-payment/supplier/create/fleet`) ||
        location.pathname.startsWith(`/${role}/add-payment/supplier/create`)
      ) {
        return true;
      }
      
      if (menuGroup.content?.length) {
        return menuGroup.content.some(
          (item) => item.to && location.pathname.startsWith(`/${role}/${item.to}`)
        );
      }
      return menuGroup.to && location.pathname === `/${role}/${menuGroup.to}`;
    });
    
    // Redirect only if the current path is invalid
    if (!isValidPath) {
      for (const menuGroup of menuList || []) {
        if (menuGroup.content?.length) {
          const firstChild = menuGroup.content.find((item) => item.to);
          if (firstChild) {
            handleNavigation(menuGroup.title);
            navigate(`/${role}/${firstChild.to}`, { replace: true });
            return;
          }
        }
        if (menuGroup.to) {
          handleNavigation(menuGroup.title);
          navigate(`/${role}/${menuGroup.to}`, { replace: true });
          return;
        }
      }
      navigate(`/${role}/welcome`, { replace: true });
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
    location,
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