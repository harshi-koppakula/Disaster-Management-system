import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import type { IncidentWithUsers } from "@shared/schema";

export default function IncidentMap() {
  const [filter, setFilter] = useState<string>("all");
  
  const { data: incidents = [], isLoading } = useQuery<IncidentWithUsers[]>({
    queryKey: ["/api/incidents"],
  });

  const filteredIncidents = incidents.filter(incident => {
    if (filter === "all") return true;
    if (filter === "high") return incident.priority === "high";
    if (filter === "unassigned") return !incident.assignedTo;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-secondary text-secondary-foreground";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPrioritySize = (priority: string) => {
    switch (priority) {
      case "high": return "w-8 h-8 text-sm";
      case "medium": return "w-6 h-6 text-xs";
      case "low": return "w-5 h-5 text-xs";
      default: return "w-6 h-6 text-xs";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Incident Map</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={filter === "all" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "high" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilter("high")}
            >
              High Priority
            </Button>
            <Button 
              variant={filter === "unassigned" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilter("unassigned")}
            >
              Unassigned
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden">
          {/* Map controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Incident markers */}
          {!isLoading && filteredIncidents.map((incident, index) => (
            <div
              key={incident.id}
              className={`absolute rounded-full flex items-center justify-center font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform ${getPriorityColor(incident.priority)} ${getPrioritySize(incident.priority)}`}
              style={{
                top: `${20 + (index * 15) % 60}%`,
                left: `${15 + (index * 25) % 70}%`,
              }}
              title={`${incident.title} - ${incident.priority} priority`}
            >
              {incident.priority[0].toUpperCase()}
            </div>
          ))}
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Incident Priority</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-xs text-gray-600">High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-xs text-gray-600">Low</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
