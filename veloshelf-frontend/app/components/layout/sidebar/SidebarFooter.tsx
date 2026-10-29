"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, User, LogOut } from "lucide-react";

interface SidebarFooterProps {
  isCollapsed: boolean;
  activeItem: string;
  setActiveItem: (key: string) => void;
}

export default function SidebarFooter({ isCollapsed, activeItem, setActiveItem }: SidebarFooterProps) {
  const router = useRouter();
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [username, setUsername] = useState("User");
  const [roleTitle, setRoleTitle] = useState("Retail Specialist");
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Decode username and tier directly from the secure JWT token payload for UI rendering
  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);

        if (payload.sub) {
          setUsername(payload.sub);
        }

        if (payload.tier) {
          const tierMap: Record<number, string> = {
            1: "General Manager",
            2: "Regional Manager",
            3: "Key Account Manager",
            4: "Supervisor",
            5: "Merchandiser",
          };
          setRoleTitle(tierMap[payload.tier] || "Retail Specialist");
        }
      }
    } catch (e) {
      console.error("Failed to parse token payload", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/sign-in");
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsProfileHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsProfileHovered(false);
    }, 2000);
  };

  const getInitials = (name: string) => {
    const parts = name.split(/[\.\s_-]/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-3 border-t border-gray-100 space-y-2 bg-white">
      {/* Settings Link */}
      <button
        onClick={() => setActiveItem("settings")}
        className={`w-full relative flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors rounded-xl text-left ${
          activeItem === "settings" ? "bg-gray-50 text-navy font-semibold" : "text-gray-600 hover:bg-gray-100 hover:text-navy"
        } ${isCollapsed ? "justify-center mx-0" : ""}`}
        title="Settings"
      >
        {activeItem === "settings" && (
          <span className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-navy rounded-full ${isCollapsed ? "left-0" : "left-1.5"}`} />
        )}
        <Settings className={`w-5 h-5 shrink-0 ${!isCollapsed && activeItem === "settings" ? "ml-1 text-navy" : ""}`} />
        {!isCollapsed && <span className="truncate">Settings</span>}
      </button>

      {/* User Profile Container */}
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={`absolute z-50 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 transition-all duration-300 transform ${
            isCollapsed 
              ? "left-full bottom-0 ml-2" 
              : "left-0 right-0 bottom-full mb-2" 
          } ${
            isProfileHovered 
              ? "opacity-100 translate-y-0 pointer-events-auto" 
              : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <button 
            onClick={() => setActiveItem("settings")}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-navy transition-colors text-left"
          >
            <User className="w-4 h-4 text-gray-500" />
            <span>View Profile</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Log out</span>
          </button>
        </div>

        {/* Profile Card */}
        <div 
          title={isCollapsed ? `${username} (${roleTitle})` : undefined}
          className={`flex items-center gap-3 p-2 rounded-xl bg-gray-50/80 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${isCollapsed ? "justify-center px-1" : ""}`}
        >
          <div className="relative w-9 h-9 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
            <span>{getInitials(username)}</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-navy truncate">{username}</span>
              <span className="text-[10px] text-gray-400 truncate">{roleTitle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}