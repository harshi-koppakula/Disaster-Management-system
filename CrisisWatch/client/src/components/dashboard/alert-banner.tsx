import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AlertBanner() {
  return (
    <Alert className="mb-6 border-warning bg-warning/10">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="text-gray-900">
        <span className="font-semibold">Active Emergency Alert:</span> Flood warning in Downtown District - 15 incidents reported.{" "}
        <a href="#" className="text-primary hover:underline">View details</a>
      </AlertDescription>
    </Alert>
  );
}


// === Static Data Inserted ===

const staticAlerts = [
  { id: 1, message: "Cyclone Warning in Odisha", severity: "High" },
  { id: 2, message: "Heatwave Alert in Telangana", severity: "Moderate" }
];

export function StaticAlertsBanner() {
  return (
    <div>
      {staticAlerts.map(alert => (
        <div key={alert.id}>
          <strong>{alert.severity}:</strong> {alert.message}
        </div>
      ))}
    </div>
  );
}
