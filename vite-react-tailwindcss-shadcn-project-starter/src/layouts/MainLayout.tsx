import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../stores/slices/authSlice";
import { useMenuList } from "../hooks/useMenuList";
import Header from "./nav/Header";
import Sidebar from "./nav/SideBar";
import MobileNav from "./nav/MobileNav";
import { cn } from "../lib/utils";
import type { AuthUser } from "../utils/role";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [headerFixed, setHeaderFixed] = useState(false);
  
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const role = user?.Role?.roleName?.toLowerCase() || "admin";
  
  const getUserPermissions = () => {
    if (user?.Role?.permissions) {
      return user.Role.permissions;
    }
    
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser?.Role?.permissions || [];
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
    return [];
  };
  
  const userPermissions = getUserPermissions();
  const menuData = useMenuList(userPermissions);

  useEffect(() => {
    const storedModule = localStorage.getItem("selectedModule");
    if (storedModule && menuData.modules.includes(storedModule)) {
      setSelectedModule(storedModule);
    } else if (menuData.modules.length > 0) {
      // Default to first available module
      const firstModule = menuData.modules[0];
      setSelectedModule(firstModule);
      localStorage.setItem("selectedModule", firstModule);
    }
  }, [menuData.modules]);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderFixed(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleModuleChange = (module: string) => {
    setSelectedModule(module);
    localStorage.setItem("selectedModule", module);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Mobile Layout */}
      <div className="md:hidden h-full flex flex-col">
        <MobileNav />
        <div className="flex-1 overflow-y-auto pt-16">
          <div className="p-4">
            <Outlet key={location.pathname} />
          </div>
        </div>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full">
        {/* Sidebar */}
        <Sidebar
          show={sidebarOpen}
          sidebarMenuItems={menuData.sidebarItems}
          selectedModule={selectedModule}
        />
        
        {/* Main Content Area */}
        <div 
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 h-full",
            sidebarOpen ? "ml-64" : "ml-16"
          )}
        >
          {/* Header */}
          <div className="flex-shrink-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <Header
              headerMenuItems={menuData.headerItems}
              onModuleChange={handleModuleChange}
            />
          </div>
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-purple-50/40 dark:from-slate-900/80 dark:via-slate-800/40 dark:to-slate-700/40">
            <div className="p-6 min-h-full">
              <div className="max-w-7xl mx-auto">
                <Outlet key={location.pathname} />
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "hidden md:block fixed top-6 z-50 p-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-r-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
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