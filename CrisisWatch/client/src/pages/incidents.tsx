import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MapPin, Clock, Filter, Search, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { IncidentWithUsers } from "@shared/schema";
import IncidentForm from "@/components/forms/incident-form";

export default function Incidents() {
  const [activeRole, setActiveRole] = useState("government");
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { isConnected } = useWebSocket();

  const { data: incidents = [], isLoading } = useQuery<IncidentWithUsers[]>({
    queryKey: ["/api/incidents"],
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || incident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-orange-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header activeRole={activeRole} onRoleChange={setActiveRole} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Active Incidents</h1>
                <p className="text-gray-600 mt-2">Manage and track emergency incidents</p>
              </div>
              <Button onClick={() => setShowIncidentForm(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Report Incident
              </Button>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search incidents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading incidents...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredIncidents.map((incident) => (
                  <Card key={incident.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <AlertTriangle className={`h-5 w-5 text-white p-1 rounded ${getPriorityColor(incident.priority)}`} />
                            <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status.toUpperCase()}
                            </Badge>
                            <Badge className={`${getPriorityColor(incident.priority)} text-white`}>
                              {incident.priority.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-gray-600 mb-3">{incident.description}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {incident.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(new Date(incident.createdAt || 0), { addSuffix: true })}
                            </div>
                          </div>

                          {incident.assignedUsers && incident.assignedUsers.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Assigned Team:</p>
                              <div className="flex flex-wrap gap-2">
                                {incident.assignedUsers.map((user) => (
                                  <Badge key={user.id} variant="outline" className="text-xs">
                                    {user.name} ({user.role})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            Update Status
                          </Button>
                          <Button size="sm" variant="outline">
                            Assign Team
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredIncidents.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                          ? "Try adjusting your filters or search terms."
                          : "No incidents have been reported yet."
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* WebSocket connection indicator */}
      <div className="fixed top-4 left-4 z-50">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
             title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>

      <IncidentForm 
        open={showIncidentForm} 
        onOpenChange={setShowIncidentForm} 
      />
    </div>
  );
}