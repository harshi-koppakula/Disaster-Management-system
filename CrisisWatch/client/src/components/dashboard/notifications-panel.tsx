import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, MessageSquare, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { IncidentWithUsers, MessageWithUser } from "@shared/schema";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { lastMessage } = useWebSocket();
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { data: incidents = [] } = useQuery<IncidentWithUsers[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: messages = [] } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages"],
  });

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get high priority incidents
  const highPriorityIncidents = incidents
    .filter(incident => incident.priority === "high" && incident.status === "active")
    .slice(0, 3);

  // Get recent emergency messages
  const emergencyMessages = messages
    .filter(message => message.isEmergency)
    .slice(0, 3);

  // Get recent general messages
  const recentMessages = messages
    .filter(message => !message.isEmergency)
    .slice(0, 5);

  const totalNotifications = highPriorityIncidents.length + emergencyMessages.length + Math.min(recentMessages.length, 3);

  return (
    <div className="absolute top-16 right-4 w-96 z-50" ref={panelRef}>
      <Card className="shadow-xl border-2 animate-in slide-in-from-top-2 duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Live Notifications</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto space-y-4">
          {totalNotifications === 0 ? (
            <p className="text-center text-gray-500 py-4">No new notifications</p>
          ) : (
            <>
              {/* High Priority Incidents */}
              {highPriorityIncidents.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
                    <span className="font-semibold text-sm">Critical Incidents</span>
                  </div>
                  <div className="space-y-2">
                    {highPriorityIncidents.map((incident) => (
                      <div key={incident.id} className="p-3 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{incident.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{incident.location}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="destructive" className="text-xs">HIGH PRIORITY</Badge>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(incident.createdAt || 0), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Messages */}
              {emergencyMessages.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 text-destructive mr-2" />
                    <span className="font-semibold text-sm">Emergency Messages</span>
                  </div>
                  <div className="space-y-2">
                    {emergencyMessages.map((message) => (
                      <div key={message.id} className="p-3 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{message.sender.name}</span>
                              <Badge variant="destructive" className="text-xs">EMERGENCY</Badge>
                            </div>
                            <p className="text-sm text-gray-700">{message.content}</p>
                            <span className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(message.createdAt || 0), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Messages */}
              {recentMessages.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-primary mr-2" />
                    <span className="font-semibold text-sm">Recent Updates</span>
                  </div>
                  <div className="space-y-2">
                    {recentMessages.slice(0, 3).map((message) => (
                      <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{message.sender.name}</span>
                              <Badge variant={message.sender.isSpoc ? "default" : "secondary"} className="text-xs">
                                {message.sender.isSpoc ? "SPOC" : message.sender.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{message.content}</p>
                            <span className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(message.createdAt || 0), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time update indicator */}
              {lastMessage && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live updates active
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}