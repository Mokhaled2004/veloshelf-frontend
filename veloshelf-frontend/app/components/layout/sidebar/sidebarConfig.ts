import { 
  BarChart3, 
  PieChart,
  CheckSquare,
  TrendingUp,
  Clock,
  Briefcase,
  Radar,
  LucideIcon
} from "lucide-react";

export interface SubMenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
}

export interface NavItemConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  roles?: string[];
  children?: SubMenuItem[];
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    key: "executive",
    label: "Executive",
    icon: Briefcase,
    badge: "Core",
    roles: ["admin", "region_manager", "field_rep", "commercial_analyst"],
    children: [
      { key: "exec-omni-radar",       label: "Omni Radar",            icon: Radar,        roles: ["admin", "region_manager", "commercial_analyst"] },
      { key: "exec-availability",     label: "Availability",          icon: CheckSquare,  roles: ["admin", "region_manager", "field_rep"] },
      { key: "exec-share-of-shelf",   label: "Share of Shelf",        icon: BarChart3,    roles: ["admin", "commercial_analyst", "region_manager"] },
      { key: "exec-share-of-display", label: "Share of Display",      icon: PieChart,     roles: ["admin", "commercial_analyst", "region_manager"] },
      { key: "exec-planogram",        label: "Planogram Compliance",  icon: TrendingUp,   roles: ["admin", "commercial_analyst", "region_manager"] },
      { key: "exec-scan-indepth",     label: "Scan Indepth",          icon: Clock,        roles: ["admin", "region_manager"] },
    ],
  },
];
