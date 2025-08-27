import React from "react";

// Simple Header component matching the old project's Header.jsx
interface HeaderProps {
  menuList?: any[];
  onModuleClick?: (moduleName: string) => void;
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <div
      className="w-full flex justify-between items-center mb-4 p-4 bg-card border-b border-border"
    >
      <img
        src="/assets/images/logo.png"
        alt="Logo"
        className="h-10"
        onError={(e) => {
          // Fallback if logo doesn't exist
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback logo text */}
      <div className="hidden text-xl font-bold text-primary">
        Fleet Management
      </div>

      <img 
        src="/assets/images/dash.png" 
        alt="Menu Icon" 
        className="h-8 w-8"
        onError={(e) => {
          // Fallback if dash icon doesn't exist
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback menu icon */}
      <div className="hidden w-8 h-8 bg-primary rounded flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-primary-foreground rounded"></div>
      </div>
    </div>
  );
};

export default Header;