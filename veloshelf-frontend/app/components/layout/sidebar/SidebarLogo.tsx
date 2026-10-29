"use client";

import Image from "next/image";

interface SidebarLogoProps {
  isCollapsed: boolean;
}

export default function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  return (
    <div
      className={`p-6 flex items-center border-b border-gray-100 ${isCollapsed ? "justify-center px-2 py-5" : ""}`}
    >
      {!isCollapsed ? (
        <div className="flex items-center gap-3">
          <Image
            src="/VeloLogoText.jpeg"
            alt="VeloShelf Logo"
            width={36}
            height={36}
            priority
            className="object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Shelfr
          </span>
        </div>
      ) : (
        <Image
          src="/VeloLogoSidebarShrink.jpeg"
          alt="VeloShelf Icon"
          width={36}
          height={36}
          priority
          className="object-contain"
        />
      )}
    </div>
  );
}
