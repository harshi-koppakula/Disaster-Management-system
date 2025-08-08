import { useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Clock, Phone } from "lucide-react";

export default function Coordination() {
  const [activeRole, setActiveRole] = useState("government");
  const { isConnected } = useWebSocket();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header activeRole={activeRole} onRoleChange={setActiveRole} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Team Coordination</h1>
              <p className="text-gray-600 mt-2">Manage teams, assignments, and coordination efforts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Active Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Emergency Response Team Alpha</h3>
                          <p className="text-sm text-gray-600">Leader: Dr. Sarah Johnson</p>
                          <div className="flex items-center mt-2">
                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-sm">Downtown Flood Zone</span>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Medical Support Unit</h3>
                          <p className="text-sm text-gray-600">Leader: Dr. Michael Chen</p>
                          <div className="flex items-center mt-2">
                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-sm">Central Hospital</span>
                          </div>
                        </div>
                        <Badge className="bg-orange-500">Standby</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Volunteer Coordination Team</h3>
                          <p className="text-sm text-gray-600">Leader: Maria Rodriguez</p>
                          <div className="flex items-center mt-2">
                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-sm">Community Center</span>
                          </div>
                        </div>
                        <Badge className="bg-purple-500">Deployed</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Team Alpha deployed to flood zone</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Medical supplies allocated to Unit 2</p>
                        <p className="text-xs text-gray-500">12 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">15 volunteers assigned to evacuation</p>
                        <p className="text-xs text-gray-500">18 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Communication Center
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-16 bg-red-500 hover:bg-red-600">
                      <div className="text-center">
                        <div className="font-semibold">Emergency Broadcast</div>
                        <div className="text-xs">Send to all teams</div>
                      </div>
                    </Button>

                    <Button variant="outline" className="h-16">
                      <div className="text-center">
                        <div className="font-semibold">Team Check-in</div>
                        <div className="text-xs">Request status updates</div>
                      </div>
                    </Button>

                    <Button variant="outline" className="h-16">
                      <div className="text-center">
                        <div className="font-semibold">Resource Request</div>
                        <div className="text-xs">Coordinate supplies</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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