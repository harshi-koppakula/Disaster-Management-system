import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, AlertTriangle, Volume2, Send, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { MessageWithUser } from "@shared/schema";

const alertSchema = z.object({
  content: z.string().min(10, "Alert message must be at least 10 characters"),
  isEmergency: z.boolean(),
  priority: z.enum(["low", "medium", "high"]),
});

type AlertForm = z.infer<typeof alertSchema>;

export default function Alerts() {
  const [activeRole, setActiveRole] = useState("government");
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertFilter, setAlertFilter] = useState("all");
  const { isConnected } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages"],
  });

  const form = useForm<AlertForm>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      content: "",
      isEmergency: false,
      priority: "medium",
    },
  });

  const sendAlertMutation = useMutation({
    mutationFn: async (data: AlertForm) => {
      return apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          content: data.content,
          isEmergency: data.isEmergency,
          senderId: 1, // Current user - in real app this would come from auth
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setShowAlertDialog(false);
      form.reset();
      toast({
        title: "Alert sent successfully",
        description: "Your alert has been broadcast to all teams",
      });
    },
  });

  const alerts = messages.filter(message => message.isEmergency || alertFilter === "all");

  const filteredAlerts = alertFilter === "all" ? messages : 
                        alertFilter === "emergency" ? messages.filter(m => m.isEmergency) :
                        messages.filter(m => !m.isEmergency);

  const onSubmit = (data: AlertForm) => {
    sendAlertMutation.mutate(data);
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
                <h1 className="text-3xl font-bold text-gray-900">Emergency Alerts</h1>
                <p className="text-gray-600 mt-2">Send and manage emergency alerts and notifications</p>
              </div>
              
              {activeRole === "government" && (
                <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Send className="mr-2 h-4 w-4" />
                      Send Alert
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Emergency Alert</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alert Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter your emergency alert message..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low Priority</SelectItem>
                                  <SelectItem value="medium">Medium Priority</SelectItem>
                                  <SelectItem value="high">High Priority</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isEmergency"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium text-red-600">
                                Mark as Emergency Alert
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setShowAlertDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={sendAlertMutation.isPending}>
                            {sendAlertMutation.isPending ? "Sending..." : "Send Alert"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                      <p className="text-2xl font-bold">{messages.length}</p>
                    </div>
                    <Bell className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Emergency Alerts</p>
                      <p className="text-2xl font-bold text-red-600">
                        {messages.filter(m => m.isEmergency).length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Recipients</p>
                      <p className="text-2xl font-bold text-green-600">24</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Alert History</span>
                  <Select value={alertFilter} onValueChange={setAlertFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alerts</SelectItem>
                      <SelectItem value="emergency">Emergency Only</SelectItem>
                      <SelectItem value="regular">Regular Alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading alerts...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAlerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                        alert.isEmergency ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {alert.isEmergency ? (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              ) : (
                                <Bell className="h-5 w-5 text-blue-600" />
                              )}
                              <span className="font-medium text-gray-900">{alert.sender.name}</span>
                              {alert.isEmergency && (
                                <Badge className="bg-red-500 text-white">EMERGENCY</Badge>
                              )}
                              <Badge variant={alert.sender.isSpoc ? "default" : "secondary"}>
                                {alert.sender.isSpoc ? "SPOC" : alert.sender.role}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-700 mb-2">{alert.content}</p>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(new Date(alert.createdAt || 0), { addSuffix: true })}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Volume2 className="h-4 w-4 mr-1" />
                              Broadcast
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredAlerts.length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                        <p className="text-gray-500">
                          {alertFilter === "emergency" 
                            ? "No emergency alerts have been sent yet."
                            : "No alerts have been sent yet."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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