import { useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import AlertBanner from "@/components/dashboard/alert-banner";
import DashboardStats from "@/components/dashboard/stats";
import IncidentMap from "@/components/dashboard/incident-map";
import RecentIncidents from "@/components/dashboard/recent-incidents";
import QuickActions from "@/components/dashboard/quick-actions";
import CommunicationHub from "@/components/dashboard/communication-hub";
import ResourceAllocation from "@/components/dashboard/resource-allocation";
import IncidentForm from "@/components/forms/incident-form";
import ResourceForm from "@/components/forms/resource-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [activeRole, setActiveRole] = useState("government");
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const { isConnected } = useWebSocket();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header activeRole={activeRole} onRoleChange={setActiveRole} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <AlertBanner />
            <p>hello lisahdflkjhasdhfkjahdsfkjsadfhs</p>
            {/* <DashboardStats /> */}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* <IncidentMap /> */}
              </div>
              
              <div className="space-y-6">
                {/* <RecentIncidents /> */}
                <QuickActions 
                  onReportIncident={() => setShowIncidentForm(true)}
                  onAllocateResources={() => setShowResourceForm(true)}
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CommunicationHub />
              <ResourceAllocation />
            </div>
          </div>
        </main>
      </div>

      {/* WebSocket connection indicator */}
      <div className="fixed top-4 left-4 z-50">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
             title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowIncidentForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Modal Forms */}
      <IncidentForm 
        open={showIncidentForm} 
        onOpenChange={setShowIncidentForm} 
      />
      <ResourceForm 
        open={showResourceForm} 
        onOpenChange={setShowResourceForm} 
      />
    </div>
  );
}
