import { useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Monitor, Activity, MapPin, Users, Zap } from "lucide-react";

export default function Monitoring() {
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
              <h1 className="text-3xl font-bold text-gray-900">Real-time Monitoring</h1>
              <p className="text-gray-600 mt-2">Monitor system status, resources, and ongoing operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Status</p>
                      <p className="text-2xl font-bold text-green-600">Online</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Teams</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Coverage Areas</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Time</p>
                      <p className="text-2xl font-bold">4.2m</p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="mr-2 h-5 w-5" />
                    Resource Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Medical Supplies</span>
                        <span className="text-sm text-gray-500">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Emergency Vehicles</span>
                        <span className="text-sm text-gray-500">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Shelter Capacity</span>
                        <span className="text-sm text-gray-500">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Communication Systems</span>
                        <span className="text-sm text-gray-500">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div>
                        <p className="font-semibold text-sm">Downtown Flood Response</p>
                        <p className="text-xs text-gray-600">Team Alpha, Bravo deployed</p>
                      </div>
                      <Badge className="bg-red-500">Critical</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div>
                        <p className="font-semibold text-sm">Power Grid Restoration</p>
                        <p className="text-xs text-gray-600">Utility crew on-site</p>
                      </div>
                      <Badge className="bg-orange-500">High</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div>
                        <p className="font-semibold text-sm">Evacuation Center Setup</p>
                        <p className="text-xs text-gray-600">Volunteers coordinating</p>
                      </div>
                      <Badge className="bg-blue-500">Medium</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div>
                        <p className="font-semibold text-sm">Medical Supply Distribution</p>
                        <p className="text-xs text-gray-600">Route optimization complete</p>
                      </div>
                      <Badge className="bg-green-500">Low</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Activity className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-green-800">Database</h3>
                      <p className="text-sm text-green-600">All systems operational</p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-green-800">WebSocket</h3>
                      <p className="text-sm text-green-600">Real-time updates active</p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Monitor className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-green-800">API Services</h3>
                      <p className="text-sm text-green-600">Response time: 45ms</p>
                    </div>
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