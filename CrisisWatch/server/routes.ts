import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage-hybrid";
import { insertIncidentSchema, insertResourceSchema, insertMessageSchema, insertUserSchema } from "@shared/models";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // User routes
  app.get("/api/users/role/:role", async (req, res) => {
    try {
      const { role } = req.params;
      const users = await storage.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      broadcast({ type: 'user_created', data: user });
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  // Incident routes
  app.get("/api/incidents", async (req, res) => {
    try {
      const { status, priority } = req.query;
      
      let incidents;
      if (status) {
        incidents = await storage.getIncidentsByStatus(status as string);
      } else if (priority) {
        incidents = await storage.getIncidentsByPriority(priority as string);
      } else {
        incidents = await storage.getIncidents();
      }
      
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.get("/api/incidents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const incident = await storage.getIncident(id);
      
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      res.json(incident);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incident" });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(incidentData);
      
      // Broadcast new incident to all connected clients
      broadcast({ type: 'incident_created', data: incident });
      
      res.json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid incident data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create incident" });
      }
    }
  });

  app.patch("/api/incidents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const incident = await storage.updateIncident(id, updates);
      
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      // Broadcast incident update
      broadcast({ type: 'incident_updated', data: incident });
      
      res.json(incident);
    } catch (error) {
      res.status(500).json({ message: "Failed to update incident" });
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    try {
      const { type, status } = req.query;
      
      let resources;
      if (type) {
        resources = await storage.getResourcesByType(type as string);
      } else if (status) {
        resources = await storage.getResourcesByStatus(status as string);
      } else {
        resources = await storage.getResources();
      }
      
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.post("/api/resources", async (req, res) => {
    try {
      const resourceData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(resourceData);
      
      broadcast({ type: 'resource_created', data: resource });
      
      res.json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create resource" });
      }
    }
  });

  app.patch("/api/resources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const resource = await storage.updateResource(id, updates);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      broadcast({ type: 'resource_updated', data: resource });
      
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update resource" });
    }
  });

  // Message routes
  app.get("/api/messages", async (req, res) => {
    try {
      const { incident_id, limit } = req.query;
      
      let messages;
      if (incident_id) {
        messages = await storage.getMessages(parseInt(incident_id as string));
      } else if (limit) {
        messages = await storage.getRecentMessages(parseInt(limit as string));
      } else {
        messages = await storage.getRecentMessages(50);
      }
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // Get the message with user data for broadcasting
      const messages = await storage.getMessages();
      const enrichedMessage = messages.find(m => m.id === message.id);
      
      broadcast({ type: 'message_created', data: enrichedMessage });
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });

  // Volunteer assignment routes
  app.get("/api/volunteer-assignments", async (req, res) => {
    try {
      const { volunteer_id, incident_id } = req.query;
      
      const assignments = await storage.getVolunteerAssignments(
        volunteer_id ? parseInt(volunteer_id as string) : undefined,
        incident_id ? parseInt(incident_id as string) : undefined
      );
      
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch volunteer assignments" });
    }
  });

  app.post("/api/volunteer-assignments", async (req, res) => {
    try {
      const assignmentData = req.body;
      const assignment = await storage.createVolunteerAssignment(assignmentData);
      
      broadcast({ type: 'volunteer_assigned', data: assignment });
      
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create volunteer assignment" });
    }
  });

  return httpServer;
}
