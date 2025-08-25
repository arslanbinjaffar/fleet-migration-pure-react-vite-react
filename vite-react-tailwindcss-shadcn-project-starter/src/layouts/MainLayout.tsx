import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../stores/slices/authSlice";
import { useMenuList } from "./nav/Menu";
import Header from "./nav/Header";
import Sidebar from "./nav/SideBar";
import MobileNav from "./nav/MobileNav";
import { cn } from "../lib/utils";

// Types
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

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [headerFixed, setHeaderFixed] = useState(false);
  
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const userPermissions = user?.Role?.permissions || [];
  const menuList = useMenuList(userPermissions);

  // Initialize selectedModule with the first module (enhanced functionality requirement)
  useEffect(() => {
    if (menuList && menuList.length > 0) {
      const storedModule = localStorage.getItem("selectedModule");
      if (storedModule) {
        setSelectedModule(storedModule);
      } else {
        // Set first module as default (enhanced functionality)
        const firstModule = menuList[0]?.module;
        if (firstModule) {
          setSelectedModule(firstModule);
          localStorage.setItem("selectedModule", firstModule);
        }
      }
    }
  }, [menuList]);

  // Handle scroll for header fixed state (enhanced functionality)
  useEffect(() => {
    const handleScroll = () => {
      setHeaderFixed(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleModuleClick = (moduleName: string) => {
    setSelectedModule(moduleName);
    localStorage.setItem("selectedModule", moduleName);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation - Only visible on mobile */}
      <div className="md:hidden">
        <MobileNav />
        {/* Add top padding to account for fixed mobile nav */}
        <div className="pt-16">
          <Outlet />
        </div>
      </div>

      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out flex-shrink-0",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <Sidebar
            show={sidebarOpen}
            menuList={menuList || []}
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
              menuList={menuList || []}
              onModuleClick={handleModuleClick}
            />
          </div>

          {/* Content */}
          <main
            className={cn(
              "flex-1 transition-all duration-300",
              headerFixed ? "pt-16" : ""
            )}
          >
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Sidebar Toggle Button for Desktop */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "hidden md:block fixed top-4 z-50 p-2 bg-primary text-primary-foreground rounded-r-md shadow-lg transition-all duration-300",
          sidebarOpen ? "left-64" : "left-16"
        )}
        aria-label="Toggle Sidebar"
      >
        <svg
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            sidebarOpen ? "rotate-180" : ""
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default MainLayout;