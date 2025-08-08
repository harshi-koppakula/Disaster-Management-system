import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Users, Package, CheckCircle } from "lucide-react";

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{(stats as any)?.activeIncidents || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
              <p className="text-2xl font-bold text-gray-900">{(stats as any)?.activeVolunteers || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Package className="h-6 w-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resources Allocated</p>
              <p className="text-2xl font-bold text-gray-900">{(stats as any)?.resourcesAllocated || 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900">{(stats as any)?.resolvedToday || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
