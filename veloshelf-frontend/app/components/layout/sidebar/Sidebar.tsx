"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "./sidebarConfig";
import SidebarLogo from "./SidebarLogo";
import SidebarNavItem from "./SidebarNavItem";
import SidebarFooter from "./SidebarFooter";

interface SidebarProps {
  activeItem: string;
  setActiveItem: (key: string) => void;
}

export default function Sidebar({ activeItem, setActiveItem }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>("executive");

  const handleParentClick = (key: string, firstChildRoute?: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenDropdown(key);
      if (firstChildRoute) setActiveItem(firstChildRoute);
      return;
    }

    if (openDropdown === key) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(key);
      if (firstChildRoute) {
        setActiveItem(firstChildRoute);
      }
    }
  };

  return (
    <aside
      className={`relative bg-white text-navy flex flex-col border-r border-gray-200 transition-all duration-300 overflow-visible ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-7 bg-white border border-gray-200 text-gray-600 hover:text-navy p-1.5 rounded-full shadow-md z-30 transition-transform flex items-center justify-center"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <SidebarLogo isCollapsed={isCollapsed} />

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.key}
            itemKey={item.key}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            children={item.children}
            isCollapsed={isCollapsed}
            activeItem={activeItem}
            openDropdown={openDropdown}
            onItemClick={(key, firstChild) => {
              if (!item.children) {
                setActiveItem(key);
              } else {
                handleParentClick(key, firstChild);
              }
            }}
            onChildClick={(childKey) => setActiveItem(childKey)}
          />
        ))}
      </nav>

      <SidebarFooter 
        isCollapsed={isCollapsed} 
        activeItem={activeItem} 
        setActiveItem={setActiveItem} 
      />
    </aside>
  );
}