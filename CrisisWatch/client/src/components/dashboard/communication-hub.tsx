import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MessageWithUser } from "@shared/schema";

export default function CommunicationHub() {
  const [newMessage, setNewMessage] = useState("");

  const { data: messages = [], isLoading } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        content,
        senderId: 1, // Current user ID - in a real app this would come from auth
        incidentId: null,
        isEmergency: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage("");
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const recentMessages = messages.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Communication Hub</CardTitle>
          <Button variant="ghost" size="sm">View All Messages</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : (
            recentMessages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`https://images.unsplash.com/photo-${
                    message.sender.role === 'government' ? '1494790108755-2616b612b5c5' : '1472099645785-5658abf4ff4e'
                  }?w=32&h=32&fit=crop&crop=face`} />
                  <AvatarFallback>
                    {message.sender.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{message.sender.name}</p>
                    <Badge variant={message.sender.isSpoc ? "default" : "secondary"} className="text-xs">
                      {message.sender.isSpoc ? "SPOC" : message.sender.role}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.createdAt || 0), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <button className="text-xs text-primary hover:underline">Reply</button>
                    <button className="text-xs text-gray-500 hover:text-gray-700">Forward</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
