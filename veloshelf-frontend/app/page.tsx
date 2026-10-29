"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/ui/Loader";
import Sidebar from "@/app/components/layout/sidebar/Sidebar";
import OmniRadarView from "@/app/components/sections/omni-radar/OmniRadarView";
import AvailabilityView from "@/app/components/sections/availability/AvailabilityView";
import ShareOfShelfView from "@/app/components/sections/share-of-shelf/ShareOfShelfView";
import ShareOfDisplayView from "@/app/components/sections/share-of-display/ShareOfDisplayView";
import PlanogramView from "@/app/components/sections/planogram/PlanogramView";
import UserAttendanceView from "@/app/components/sections/user-attendance/UserAttendanceView";
import SettingsView from "@/app/components/sections/settings/SettingsView";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeItem, setActiveItem] = useState<string>("exec-omni-radar");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/sign-in");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FEFEFE]">
        <Loader />
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeItem) {
      case "exec-omni-radar":
        return <OmniRadarView />;
      case "exec-availability":
        return <AvailabilityView />;
      case "exec-share-of-shelf":
        return <ShareOfShelfView />;
      case "exec-share-of-display":
        return <ShareOfDisplayView />;
      case "exec-planogram":
        return <PlanogramView />;
      case "exec-scan-indepth":
        return <UserAttendanceView />;
      case "settings":
        return <SettingsView />;
      default:
        return <OmniRadarView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FEFEFE] text-navy">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <main className="flex-1 overflow-y-auto flex flex-col justify-start">
        {renderActiveSection()}
      </main>
    </div>
  );
}
