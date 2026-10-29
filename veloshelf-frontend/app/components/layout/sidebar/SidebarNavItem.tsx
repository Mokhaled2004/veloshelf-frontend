"use client";

import { ChevronDown, LucideIcon } from "lucide-react";
import { SubMenuItem } from "./sidebarConfig";

interface SidebarNavItemProps {
  itemKey: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: SubMenuItem[];
  isCollapsed: boolean;
  activeItem: string;
  openDropdown: string | null;
  onItemClick: (key: string, firstChild?: string) => void;
  onChildClick: (childKey: string) => void;
}

export default function SidebarNavItem({
  itemKey,
  label,
  icon: Icon,
  badge,
  children,
  isCollapsed,
  activeItem,
  openDropdown,
  onItemClick,
  onChildClick,
}: SidebarNavItemProps) {
  const hasChildren = children && children.length > 0;
  
  const isChildActive = hasChildren ? children.some((child) => child.key === activeItem) : false;
  const isActive = activeItem === itemKey || isChildActive;
  const isOpen = openDropdown === itemKey;

  return (
    <div>
      <button
        onClick={() => onItemClick(itemKey, hasChildren ? children[0].key : undefined)}
        className={`w-full relative flex items-start justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? "bg-gray-50 text-navy font-semibold" : "text-gray-600 hover:bg-gray-100 hover:text-navy"
        } ${isCollapsed ? "justify-center mx-1 items-center py-3" : "mx-2"}`}
        title={isCollapsed ? label : undefined}
      >
        {/* Active Indicator Bar - adjusted spacing from icon when expanded */}
        {isActive && (
          <span className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-navy rounded-full ${isCollapsed ? "left-0" : "left-2"}`} />
        )}

        <div className={`flex items-start gap-3 min-w-0 ${isCollapsed ? "items-center justify-center" : "pl-2"}`}>
          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? "text-navy" : "text-gray-500"} ${isCollapsed ? "mt-0" : ""}`} />
          
          {!isCollapsed && (
            <span className="text-left leading-snug whitespace-normal break-words">
              {label}
            </span>
          )}
        </div>

        {/* Right side elements (Badge or Dropdown Arrow) */}
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2 mt-0.5">
            {badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-navy/10 text-navy rounded-full">
                {badge}
              </span>
            )}
            {hasChildren && (
              <ChevronDown 
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
              />
            )}
          </div>
        )}
      </button>

      {/* Nested Submenu Items */}
      {!isCollapsed && hasChildren && (
        <div 
          className={`grid transition-all duration-300 ease-in-out pl-6 pr-2 ${
            isOpen ? "grid-rows-[1fr] opacity-100 mt-1 space-y-1" : "grid-rows-[0fr] opacity-0 mt-0 space-y-0"
          } overflow-hidden`}
        >
          <div className="overflow-hidden space-y-1">
            {children.map((child) => {
              const ChildIcon = child.icon;
              const isChildItemActive = activeItem === child.key;

              return (
                <button
                  key={child.key}
                  onClick={() => onChildClick(child.key)}
                  className={`w-full relative flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors rounded-xl text-left ${
                    isChildItemActive 
                      ? "bg-gray-50 text-navy font-semibold" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-navy"
                  }`}
                >
                  {isChildItemActive && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-navy rounded-full" />
                  )}
                  <ChildIcon className={`w-4 h-4 shrink-0 ${isChildItemActive ? "ml-1 text-navy" : "text-gray-400"}`} />
                  <span className="leading-snug whitespace-normal break-words">{child.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}