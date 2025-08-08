import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { IncidentWithUsers } from "@shared/schema";

export default function RecentIncidents() {
  const { data: incidents = [], isLoading } = useQuery<IncidentWithUsers[]>({
    queryKey: ["/api/incidents"],
  });

  const recentIncidents = incidents
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-destructive bg-destructive/5";
      case "medium": return "border-l-warning bg-warning/5";
      case "low": return "border-l-secondary bg-secondary/5";
      default: return "border-l-gray-300 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Incidents</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 bg-gray-100 rounded-lg border-l-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Incidents</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentIncidents.map((incident) => (
            <div
              key={incident.id}
              className={`p-3 rounded-lg border-l-4 ${getBorderColor(incident.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    incident.priority === 'high' ? 'bg-destructive' :
                    incident.priority === 'medium' ? 'bg-warning' : 'bg-secondary'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{incident.location}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(incident.createdAt || 0), { addSuffix: true })}
                    </span>
                    <Badge variant={getPriorityVariant(incident.priority)} className="text-xs">
                      {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)} Priority
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


// === Static Data Inserted ===
