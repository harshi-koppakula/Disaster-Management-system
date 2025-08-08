import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Truck, Users, Edit } from "lucide-react";

interface QuickActionsProps {
  onReportIncident: () => void;
  onAllocateResources: () => void;
}

export default function QuickActions({ onReportIncident, onAllocateResources }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto p-3"
            onClick={onReportIncident}
          >
            <Plus className="mr-3 h-5 w-5 text-destructive" />
            <div className="text-left">
              <p className="text-sm font-medium">Report New Incident</p>
              <p className="text-xs text-gray-600">Submit emergency report</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start h-auto p-3"
            onClick={onAllocateResources}
          >
            <Truck className="mr-3 h-5 w-5 text-accent" />
            <div className="text-left">
              <p className="text-sm font-medium">Allocate Resources</p>
              <p className="text-xs text-gray-600">Manage resource distribution</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start h-auto p-3"
          >
            <Users className="mr-3 h-5 w-5 text-secondary" />
            <div className="text-left">
              <p className="text-sm font-medium">Assign Volunteers</p>
              <p className="text-xs text-gray-600">Coordinate volunteer efforts</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start h-auto p-3"
          >
            <Edit className="mr-3 h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium">Update Status</p>
              <p className="text-xs text-gray-600">Modify incident status</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
