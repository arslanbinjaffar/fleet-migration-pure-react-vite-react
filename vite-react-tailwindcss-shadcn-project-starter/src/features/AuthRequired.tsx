import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  selectToken,
  selectCurrentUser,
  setCredentials,
} from "../stores/slices/authSlice";
import { useMenuList } from "../layouts/nav/Menu";
import type { AuthUser } from "../utils/role";

const capitalizeFirstLetter = (string: string): string => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

interface AuthRequiredProps {
  allowedRoles?: string[];
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ allowedRoles }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const location = useLocation();
  const navigate = useNavigate();

  const [isInitializing, setIsInitializing] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [hasRunInitialValidation, setHasRunInitialValidation] = useState(false); // New flag for initial only

  const userRoleName = capitalizeFirstLetter(user?.Role?.roleName || "");
  const userPermissions = useMemo(() => user?.Role?.permissions || [], [user]);

  const menuList = useMenuList(userPermissions);
  const isMenuListReady = useMemo(() => menuList.length > 0, [menuList]);

  // Initialize component after redux-persist rehydration
  useEffect(() => {
    // Redux-persist handles state restoration automatically
    // Just set initialization as complete
    setIsInitializing(false);
  }, []);

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

  // Simplified validation - only check roles, no path validation
  useEffect(() => {
    if (isInitializing || !token || !user || hasRunInitialValidation) return;

    if (allowedRoles && !allowedRoles.includes(userRoleName)) {
      navigate("/page-error-403", { state: { from: location }, replace: true });
      return;
    }

    // Mark validation as complete without path validation
    setHasRunInitialValidation(true);
  }, [
    isInitializing,
    token,
    user,
    allowedRoles,
    userRoleName,
    navigate,
    location,
  ]);

  if (isInitializing || !token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Outlet />;
};

export default AuthRequired;