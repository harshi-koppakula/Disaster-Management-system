import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  AlertTriangle, 
  History, 
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview and statistics"
  },
  {
    name: "Coordination",
    href: "/coordination",
    icon: Users,
    description: "Team and resource coordination"
  },
  {
    name: "Monitoring",
    href: "/monitoring",
    icon: Monitor,
    description: "Real-time monitoring"
  },
  {
    name: "Incidents",
    href: "/incidents",
    icon: AlertTriangle,
    description: "Active incidents management"
  },
  {
    name: "Incident History",
    href: "/incidents/history",
    icon: History,
    description: "Past incidents and reports"
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: Bell,
    description: "Emergency alerts and notifications"
  }
];

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));

          return (
            <Link key={item.name} href={item.href}>
              <a className="block">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 px-3",
                    isCollapsed && "px-2 justify-center",
                    isActive && "bg-primary text-primary-foreground shadow-sm"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    !isCollapsed && "mr-3"
                  )} />
                  {!isCollapsed && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs opacity-70">{item.description}</span>
                    </div>
                  )}
                </Button>
              </a>
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
        </div>
      )}
    </div>
  );
}