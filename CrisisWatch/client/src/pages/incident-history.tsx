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
import { History, MapPin, Clock, Search, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import type { IncidentWithUsers } from "@shared/schema";

export default function IncidentHistory() {
  const [activeRole, setActiveRole] = useState("government");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const { isConnected } = useWebSocket();

  const { data: allIncidents = [], isLoading } = useQuery<IncidentWithUsers[]>({
    queryKey: ["/api/incidents"],
  });

  // For demo purposes, we'll show resolved incidents as historical
  const historicalIncidents = allIncidents.filter(incident => 
    incident.status === "resolved" || new Date(incident.createdAt || 0) < new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const filteredIncidents = historicalIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || incident.priority === priorityFilter;
    
    let matchesTime = true;
    if (timeFilter !== "all") {
      const incidentDate = new Date(incident.createdAt || 0);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeFilter) {
        case "week":
          matchesTime = daysDiff <= 7;
          break;
        case "month":
          matchesTime = daysDiff <= 30;
          break;
        case "quarter":
          matchesTime = daysDiff <= 90;
          break;
        default:
          matchesTime = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTime;
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
      case "resolved": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
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
                <h1 className="text-3xl font-bold text-gray-900">Incident History</h1>
                <p className="text-gray-600 mt-2">Review past incidents and generate reports</p>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{historicalIncidents.length}</p>
                    <p className="text-sm text-gray-600">Total Incidents</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {historicalIncidents.filter(i => i.status === "resolved").length}
                    </p>
                    <p className="text-sm text-gray-600">Resolved</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {historicalIncidents.filter(i => i.priority === "high").length}
                    </p>
                    <p className="text-sm text-gray-600">High Priority</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">4.2h</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setTimeFilter("all");
                  }}>
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading incident history...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <Card key={incident.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <History className={`h-5 w-5 text-white p-1 rounded ${getPriorityColor(incident.priority)}`} />
                            <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status.toUpperCase()}
                            </Badge>
                            <Badge className={`${getPriorityColor(incident.priority)} text-white`}>
                              {incident.priority.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-gray-600 mb-3">{incident.description}</p>

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {incident.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Reported: {format(new Date(incident.createdAt || 0), "MMM dd, yyyy 'at' HH:mm")}
                            </div>
                            {incident.status === "resolved" && (
                              <div className="text-green-600 font-medium">
                                ✓ Resolved
                              </div>
                            )}
                          </div>

                          {incident.assignedUsers && incident.assignedUsers.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Response Team:</p>
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
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredIncidents.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No historical incidents found</h3>
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || timeFilter !== "all"
                          ? "Try adjusting your search criteria or filters."
                          : "No incidents have been completed or archived yet."
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
    </div>
  );
}