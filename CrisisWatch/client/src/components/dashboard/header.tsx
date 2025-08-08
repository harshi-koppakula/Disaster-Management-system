import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import NotificationsPanel from "./notifications-panel";
import type { IncidentWithUsers, MessageWithUser } from "@shared/schema";

interface HeaderProps {
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export default function Header({ activeRole, onRoleChange }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: incidents = [] } = useQuery<IncidentWithUsers[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: messages = [] } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages"],
  });

  // Calculate notification count
  const highPriorityIncidents = incidents.filter(incident => 
    incident.priority === "high" && incident.status === "active"
  ).length;
  
  const emergencyMessages = messages.filter(message => message.isEmergency).length;
  const recentMessages = Math.min(messages.length, 3);
  
  const notificationCount = highPriorityIncidents + emergencyMessages + recentMessages;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <Shield className="mr-2 h-8 w-8" />
                  DisasterCare
                </h1>
              </div>
              <div className="hidden md:block">
                <Select value={activeRole} onValueChange={onRoleChange}>
                  <SelectTrigger className="w-[180px] bg-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government Agency</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="social">Social Service</SelectItem>
                    <SelectItem value="victim">Disaster Victim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Badge>
                )}
              </Button>
              
              {/* Only show profile for government agencies */}
              {activeRole === "government" && (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">Sarah Chen</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}
