import { 
  User, Incident, Resource, Message, VolunteerAssignment,
  type IUser, type IIncident, type IResource, type IMessage, type IVolunteerAssignment,
  type InsertUser, type InsertIncident, type InsertResource, 
  type InsertMessage, type InsertVolunteerAssignment,
  type IncidentWithUsers, type MessageWithUser, type ResourceWithIncident
} from "@shared/models";
import connectToDatabase from "./mongodb";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUserByUsername(username: string): Promise<IUser | undefined>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUser(id: string, updates: Partial<IUser>): Promise<IUser | undefined>;
  getUsersByRole(role: string): Promise<IUser[]>;
  
  // Incident operations
  getIncidents(): Promise<IncidentWithUsers[]>;
  getIncident(id: string): Promise<IncidentWithUsers | undefined>;
  createIncident(incident: InsertIncident): Promise<IIncident>;
  updateIncident(id: string, updates: Partial<IIncident>): Promise<IIncident | undefined>;
  getIncidentsByStatus(status: string): Promise<IncidentWithUsers[]>;
  getIncidentsByPriority(priority: string): Promise<IncidentWithUsers[]>;
  
  // Resource operations
  getResources(): Promise<ResourceWithIncident[]>;
  getResource(id: string): Promise<ResourceWithIncident | undefined>;
  createResource(resource: InsertResource): Promise<IResource>;
  updateResource(id: string, updates: Partial<IResource>): Promise<IResource | undefined>;
  getResourcesByType(type: string): Promise<ResourceWithIncident[]>;
  getResourcesByStatus(status: string): Promise<ResourceWithIncident[]>;
  
  // Message operations
  getMessages(incidentId?: string): Promise<MessageWithUser[]>;
  createMessage(message: InsertMessage): Promise<IMessage>;
  getRecentMessages(limit: number): Promise<MessageWithUser[]>;
  
  // Volunteer assignment operations
  getVolunteerAssignments(volunteerId?: string, incidentId?: string): Promise<IVolunteerAssignment[]>;
  createVolunteerAssignment(assignment: InsertVolunteerAssignment): Promise<IVolunteerAssignment>;
  updateVolunteerAssignment(id: string, updates: Partial<IVolunteerAssignment>): Promise<IVolunteerAssignment | undefined>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    activeIncidents: string;
    activeVolunteers: string;
    resourcesAllocated: string;
    resolvedToday: string;
  }>;
}

export class MongoStorage implements IStorage {
  private isConnected = false;

  constructor() {
    // Try to initialize database connection
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      await connectToDatabase();
      this.isConnected = true;
    } catch (error) {
      console.warn('MongoDB not available, methods will return empty data');
      this.isConnected = false;
    }
  }

  private async ensureConnection() {
    if (!this.isConnected) {
      try {
        await connectToDatabase();
        this.isConnected = true;
      } catch (error) {
        // Return default/empty data when MongoDB is not available
        return false;
      }
    }
    return true;
  }

  // User operations
  async getUser(id: string): Promise<IUser | undefined> {
    try {
      if (!(await this.ensureConnection())) return undefined;
      const user = await User.findById(id);
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | undefined> {
    try {
      await connectToDatabase();
      const user = await User.findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<IUser> {
    try {
      await connectToDatabase();
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | undefined> {
    try {
      await connectToDatabase();
      const user = await User.findByIdAndUpdate(id, updates, { new: true });
      return user || undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    try {
      await connectToDatabase();
      return await User.find({ role });
    } catch (error) {
      console.error("Error getting users by role:", error);
      return [];
    }
  }

  // Incident operations
  async getIncidents(): Promise<IncidentWithUsers[]> {
    try {
      await connectToDatabase();
      const incidents = await Incident.find()
        .populate('reportedBy', 'name username role')
        .populate('assignedTo', 'name username role')
        .populate('spocId', 'name username role')
        .sort({ createdAt: -1 });
      
      return incidents.map(incident => ({
        ...incident.toObject(),
        reportedByUser: incident.reportedBy as any,
        assignedToUser: incident.assignedTo as any,
        spocUser: incident.spocId as any
      }));
    } catch (error) {
      console.error("Error getting incidents:", error);
      return [];
    }
  }

  async getIncident(id: string): Promise<IncidentWithUsers | undefined> {
    try {
      await connectToDatabase();
      const incident = await Incident.findById(id)
        .populate('reportedBy', 'name username role')
        .populate('assignedTo', 'name username role')
        .populate('spocId', 'name username role');
      
      if (!incident) return undefined;
      
      return {
        ...incident.toObject(),
        reportedByUser: incident.reportedBy as any,
        assignedToUser: incident.assignedTo as any,
        spocUser: incident.spocId as any
      };
    } catch (error) {
      console.error("Error getting incident:", error);
      return undefined;
    }
  }

  async createIncident(incidentData: InsertIncident): Promise<IIncident> {
    try {
      await connectToDatabase();
      const incident = new Incident(incidentData);
      return await incident.save();
    } catch (error) {
      console.error("Error creating incident:", error);
      throw error;
    }
  }

  async updateIncident(id: string, updates: Partial<IIncident>): Promise<IIncident | undefined> {
    try {
      await connectToDatabase();
      const incident = await Incident.findByIdAndUpdate(id, 
        { ...updates, updatedAt: new Date() }, 
        { new: true }
      );
      return incident || undefined;
    } catch (error) {
      console.error("Error updating incident:", error);
      return undefined;
    }
  }

  async getIncidentsByStatus(status: string): Promise<IncidentWithUsers[]> {
    try {
      await connectToDatabase();
      const incidents = await Incident.find({ status })
        .populate('reportedBy', 'name username role')
        .populate('assignedTo', 'name username role')
        .populate('spocId', 'name username role')
        .sort({ createdAt: -1 });
      
      return incidents.map(incident => ({
        ...incident.toObject(),
        reportedByUser: incident.reportedBy as any,
        assignedToUser: incident.assignedTo as any,
        spocUser: incident.spocId as any
      }));
    } catch (error) {
      console.error("Error getting incidents by status:", error);
      return [];
    }
  }

  async getIncidentsByPriority(priority: string): Promise<IncidentWithUsers[]> {
    try {
      await connectToDatabase();
      const incidents = await Incident.find({ priority })
        .populate('reportedBy', 'name username role')
        .populate('assignedTo', 'name username role')
        .populate('spocId', 'name username role')
        .sort({ createdAt: -1 });
      
      return incidents.map(incident => ({
        ...incident.toObject(),
        reportedByUser: incident.reportedBy as any,
        assignedToUser: incident.assignedTo as any,
        spocUser: incident.spocId as any
      }));
    } catch (error) {
      console.error("Error getting incidents by priority:", error);
      return [];
    }
  }

  // Resource operations
  async getResources(): Promise<ResourceWithIncident[]> {
    try {
      await connectToDatabase();
      const resources = await Resource.find()
        .populate('assignedIncident', 'title status priority')
        .sort({ createdAt: -1 });
      
      return resources.map(resource => ({
        ...resource.toObject(),
        incident: resource.assignedIncident as any
      }));
    } catch (error) {
      console.error("Error getting resources:", error);
      return [];
    }
  }

  async getResource(id: string): Promise<ResourceWithIncident | undefined> {
    try {
      await connectToDatabase();
      const resource = await Resource.findById(id)
        .populate('assignedIncident', 'title status priority');
      
      if (!resource) return undefined;
      
      return {
        ...resource.toObject(),
        incident: resource.assignedIncident as any
      };
    } catch (error) {
      console.error("Error getting resource:", error);
      return undefined;
    }
  }

  async createResource(resourceData: InsertResource): Promise<IResource> {
    try {
      await connectToDatabase();
      const resource = new Resource(resourceData);
      return await resource.save();
    } catch (error) {
      console.error("Error creating resource:", error);
      throw error;
    }
  }

  async updateResource(id: string, updates: Partial<IResource>): Promise<IResource | undefined> {
    try {
      await connectToDatabase();
      const resource = await Resource.findByIdAndUpdate(id, 
        { ...updates, updatedAt: new Date() }, 
        { new: true }
      );
      return resource || undefined;
    } catch (error) {
      console.error("Error updating resource:", error);
      return undefined;
    }
  }

  async getResourcesByType(type: string): Promise<ResourceWithIncident[]> {
    try {
      await connectToDatabase();
      const resources = await Resource.find({ type })
        .populate('assignedIncident', 'title status priority')
        .sort({ createdAt: -1 });
      
      return resources.map(resource => ({
        ...resource.toObject(),
        incident: resource.assignedIncident as any
      }));
    } catch (error) {
      console.error("Error getting resources by type:", error);
      return [];
    }
  }

  async getResourcesByStatus(status: string): Promise<ResourceWithIncident[]> {
    try {
      await connectToDatabase();
      const resources = await Resource.find({ status })
        .populate('assignedIncident', 'title status priority')
        .sort({ createdAt: -1 });
      
      return resources.map(resource => ({
        ...resource.toObject(),
        incident: resource.assignedIncident as any
      }));
    } catch (error) {
      console.error("Error getting resources by status:", error);
      return [];
    }
  }

  // Message operations
  async getMessages(incidentId?: string): Promise<MessageWithUser[]> {
    try {
      await connectToDatabase();
      const query = incidentId ? { incidentId } : {};
      const messages = await Message.find(query)
        .populate('senderId', 'name username role')
        .sort({ createdAt: -1 });
      
      return messages.map(message => ({
        ...message.toObject(),
        sender: message.senderId as any
      }));
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  async createMessage(messageData: InsertMessage): Promise<IMessage> {
    try {
      await connectToDatabase();
      const message = new Message(messageData);
      return await message.save();
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  async getRecentMessages(limit: number): Promise<MessageWithUser[]> {
    try {
      await connectToDatabase();
      const messages = await Message.find()
        .populate('senderId', 'name username role')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return messages.map(message => ({
        ...message.toObject(),
        sender: message.senderId as any
      }));
    } catch (error) {
      console.error("Error getting recent messages:", error);
      return [];
    }
  }

  // Volunteer assignment operations
  async getVolunteerAssignments(volunteerId?: string, incidentId?: string): Promise<IVolunteerAssignment[]> {
    try {
      await connectToDatabase();
      const query: any = {};
      if (volunteerId) query.volunteerId = volunteerId;
      if (incidentId) query.incidentId = incidentId;
      
      return await VolunteerAssignment.find(query)
        .populate('volunteerId', 'name username role')
        .populate('incidentId', 'title status priority')
        .sort({ assignedAt: -1 });
    } catch (error) {
      console.error("Error getting volunteer assignments:", error);
      return [];
    }
  }

  async createVolunteerAssignment(assignmentData: InsertVolunteerAssignment): Promise<IVolunteerAssignment> {
    try {
      await connectToDatabase();
      const assignment = new VolunteerAssignment(assignmentData);
      return await assignment.save();
    } catch (error) {
      console.error("Error creating volunteer assignment:", error);
      throw error;
    }
  }

  async updateVolunteerAssignment(id: string, updates: Partial<IVolunteerAssignment>): Promise<IVolunteerAssignment | undefined> {
    try {
      await connectToDatabase();
      const assignment = await VolunteerAssignment.findByIdAndUpdate(id, updates, { new: true });
      return assignment || undefined;
    } catch (error) {
      console.error("Error updating volunteer assignment:", error);
      return undefined;
    }
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    activeIncidents: string;
    activeVolunteers: string;
    resourcesAllocated: string;
    resolvedToday: string;
  }> {
    try {
      await connectToDatabase();
      
      const [activeIncidents, activeVolunteers, resourcesAllocated, resolvedToday] = await Promise.all([
        Incident.countDocuments({ status: { $in: ['active', 'in_progress'] } }),
        User.countDocuments({ role: 'volunteer' }),
        Resource.countDocuments({ status: 'deployed' }),
        Incident.countDocuments({ 
          status: 'resolved', 
          updatedAt: { 
            $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
          } 
        })
      ]);

      return {
        activeIncidents: activeIncidents.toString(),
        activeVolunteers: activeVolunteers.toString(),
        resourcesAllocated: resourcesAllocated.toString(),
        resolvedToday: resolvedToday.toString()
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        activeIncidents: "0",
        activeVolunteers: "0",
        resourcesAllocated: "0",
        resolvedToday: "0"
      };
    }
  }
}

export const storage = new MongoStorage();