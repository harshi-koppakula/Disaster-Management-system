import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ResourceWithIncident } from "@shared/schema";

export default function ResourceAllocation() {
  const { data: resources = [], isLoading } = useQuery<ResourceWithIncident[]>({
    queryKey: ["/api/resources"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "text-secondary";
      case "deployed": return "text-warning";
      case "critical": return "text-destructive";
      default: return "text-gray-500";
    }
  };

  const getUtilizationPercentage = (resource: ResourceWithIncident) => {
    return Math.round(((resource.quantity - resource.available) / resource.quantity) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 75) return "bg-warning";
    return "bg-secondary";
  };

  const topResources = resources.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resource Allocation</CardTitle>
          <Button variant="ghost" size="sm">Manage Resources</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((num) => (
              <div key={`skeleton-${num}`} className="animate-pulse border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            topResources.map((resource) => {
              const utilizationPercentage = getUtilizationPercentage(resource);
              return (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{resource.name}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(resource.status)}`}>
                      {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>{resource.location}</span>
                    <span>{resource.quantity} units</span>
                  </div>
                  <div className="w-full mb-2">
                    <Progress 
                      value={utilizationPercentage} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{utilizationPercentage}% Allocated</span>
                    <span>{resource.eta ? `ETA: ${resource.eta} min` : "Available now"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
