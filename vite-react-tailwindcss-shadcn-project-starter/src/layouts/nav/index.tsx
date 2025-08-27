import React, { useState, useEffect, Fragment } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../stores/slices/authSlice";
import { useMenuList } from "./Menu";
import Header from "./Header";
import Sidebar from "./SideBar";
import { cn } from "../../lib/utils";

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

function Nav({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (sidebarOpen: boolean) => void;
}) {

  const location = useLocation();
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [headerFixed, setHeaderFixed] = useState(false);

  const user = useSelector(selectCurrentUser) as AuthUser | null;

  const getUserPermissionsFromStorage = (): any[] => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser?.Role?.permissions || [];
      }
      return [];
    } catch (error) {
      console.warn("Error parsing user from localStorage:", error);
      return [];
    }
  };

  const localStoragePermissions = getUserPermissionsFromStorage();
  const userPermissions = localStoragePermissions.length > 0
    ? localStoragePermissions
    : user?.Role?.permissions || [];

  const menuList = useMenuList(userPermissions as any[]);

  const getModuleFromPath = (pathname: string): string => {
    if (!menuList || menuList.length === 0) return "";
    const pathWithoutRole = pathname.replace(/^\/[^/]+\/?/, "") || "/";
    console.log("Path without role:", pathWithoutRole);

    for (const menuItem of menuList) {
      if (menuItem.content) {
        const matchingChild = menuItem.content.find(child => {
          const childPath = child.to || "/";
          return pathWithoutRole === childPath || pathWithoutRole.startsWith(childPath + "/");
        });
        if (matchingChild) {
          return menuItem.module;
        }
      }
      const menuPath = menuItem.to || "/";
      if (pathWithoutRole === menuPath || pathWithoutRole.startsWith(menuPath + "/")) {
        return menuItem.module;
      }
    }
    return menuList[0]?.module || "";
  };

  useEffect(() => {
    console.log("Location changed:", location.pathname);
    if (menuList && menuList.length > 0) {
      const moduleFromPath = getModuleFromPath(location.pathname);
      console.log("Module from path:", moduleFromPath);
      if (moduleFromPath) {
        setSelectedModule(moduleFromPath);
      }
    }
  }, [location.pathname, menuList]);

  useEffect(() => {
    if (menuList && menuList.length > 0 && !selectedModule) {
      const moduleFromPath = getModuleFromPath(location.pathname);
      if (moduleFromPath) {
        setSelectedModule(moduleFromPath);
      }
    }
  }, [menuList, location.pathname, selectedModule]);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderFixed(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleModuleClick = (moduleName: string) => {
    setSelectedModule(moduleName);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <Fragment>
      {/* Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out flex-shrink-0",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <Sidebar
          show={sidebarOpen}
          menuList={menuList}
          selectedModule={selectedModule}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={cn(
            "transition-all duration-300",
            headerFixed ? "fixed top-0 right-0 z-40 shadow-lg" : "relative",
            headerFixed && sidebarOpen ? "left-64" : headerFixed && !sidebarOpen ? "left-16" : ""
          )}
          style={{
            width: headerFixed
              ? sidebarOpen
                ? "calc(100% - 16rem)"
                : "calc(100% - 4rem)"
              : "100%"
          }}
        >
          <Header
            menuList={menuList}
            onModuleClick={handleModuleClick}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default Nav;