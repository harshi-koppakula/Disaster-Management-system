import { 
  users, incidents, resources, messages, volunteerAssignments,
  type User, type InsertUser,
  type Incident, type InsertIncident, type IncidentWithUsers,
  type Resource, type InsertResource, type ResourceWithIncident,
  type Message, type InsertMessage, type MessageWithUser,
  type VolunteerAssignment, type InsertVolunteerAssignment
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Incident operations
  getIncidents(): Promise<IncidentWithUsers[]>;
  getIncident(id: number): Promise<IncidentWithUsers | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, updates: Partial<Incident>): Promise<Incident | undefined>;
  getIncidentsByStatus(status: string): Promise<IncidentWithUsers[]>;
  getIncidentsByPriority(priority: string): Promise<IncidentWithUsers[]>;
  
  // Resource operations
  getResources(): Promise<ResourceWithIncident[]>;
  getResource(id: number): Promise<ResourceWithIncident | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, updates: Partial<Resource>): Promise<Resource | undefined>;
  getResourcesByType(type: string): Promise<ResourceWithIncident[]>;
  getResourcesByStatus(status: string): Promise<ResourceWithIncident[]>;
  
  // Message operations
  getMessages(incidentId?: number): Promise<MessageWithUser[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(limit: number): Promise<MessageWithUser[]>;
  
  // Volunteer assignment operations
  getVolunteerAssignments(volunteerId?: number, incidentId?: number): Promise<VolunteerAssignment[]>;
  createVolunteerAssignment(assignment: InsertVolunteerAssignment): Promise<VolunteerAssignment>;
  updateVolunteerAssignment(id: number, updates: Partial<VolunteerAssignment>): Promise<VolunteerAssignment | undefined>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    activeIncidents: number;
    activeVolunteers: number;
    resourcesAllocated: number;
    resolvedToday: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private incidents: Map<number, Incident> = new Map();
  private resources: Map<number, Resource> = new Map();
  private messages: Map<number, Message> = new Map();
  private volunteerAssignments: Map<number, VolunteerAssignment> = new Map();
  
  private currentUserId = 1;
  private currentIncidentId = 1;
  private currentResourceId = 1;
  private currentMessageId = 1;
  private currentAssignmentId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "password",
      role: "government",
      name: "Sarah Chen",
      email: "sarah.chen@gov.org",
      phone: "+1-555-0123",
      location: "Emergency Operations Center",
      isSpoc: false,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    const spocUser: User = {
      id: this.currentUserId++,
      username: "maria_spoc",
      password: "password",
      role: "government",
      name: "Maria Rodriguez",
      email: "maria.rodriguez@gov.org",
      phone: "+1-555-0124",
      location: "Downtown District",
      isSpoc: true,
      createdAt: new Date(),
    };
    this.users.set(spocUser.id, spocUser);

    const volunteerUser: User = {
      id: this.currentUserId++,
      username: "james_volunteer",
      password: "password",
      role: "volunteer",
      name: "James Kim",
      email: "james.kim@volunteer.org",
      phone: "+1-555-0125",
      location: "North Hills",
      isSpoc: false,
      createdAt: new Date(),
    };
    this.users.set(volunteerUser.id, volunteerUser);

    // Create sample incidents
    const floodIncident: Incident = {
      id: this.currentIncidentId++,
      title: "Flood Emergency - Downtown District",
      description: "Major flooding reported in downtown area affecting multiple city blocks",
      location: "Main Street & 5th Avenue",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      priority: "high",
      status: "active",
      type: "flood",
      reportedBy: adminUser.id,
      assignedTo: volunteerUser.id,
      spocId: spocUser.id,
      affectedCount: 150,
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      updatedAt: new Date(),
    };
    this.incidents.set(floodIncident.id, floodIncident);

    const powerOutage: Incident = {
      id: this.currentIncidentId++,
      title: "Power Outage Reported",
      description: "Widespread power outage affecting residential areas",
      location: "North Hills Residential Area",
      coordinates: { lat: 40.7589, lng: -73.9851 },
      priority: "medium",
      status: "in_progress",
      type: "power_outage",
      reportedBy: volunteerUser.id,
      assignedTo: adminUser.id,
      spocId: null,
      affectedCount: 85,
      createdAt: new Date(Date.now() - 32 * 60 * 1000), // 32 minutes ago
      updatedAt: new Date(),
    };
    this.incidents.set(powerOutage.id, powerOutage);

    // Create sample resources
    const medicalSupplies: Resource = {
      id: this.currentResourceId++,
      name: "Emergency Medical Supplies",
      type: "medical",
      quantity: 150,
      available: 37,
      location: "Central Warehouse",
      status: "available",
      assignedIncident: floodIncident.id,
      eta: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.resources.set(medicalSupplies.id, medicalSupplies);

    const rescueTeams: Resource = {
      id: this.currentResourceId++,
      name: "Search & Rescue Teams",
      type: "personnel",
      quantity: 8,
      available: 1,
      location: "Fire Station #3",
      status: "deployed",
      assignedIncident: floodIncident.id,
      eta: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.resources.set(rescueTeams.id, rescueTeams);

    const shelters: Resource = {
      id: this.currentResourceId++,
      name: "Emergency Shelters",
      type: "shelter",
      quantity: 500,
      available: 25,
      location: "Community Centers",
      status: "critical",
      assignedIncident: null,
      eta: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.resources.set(shelters.id, shelters);

    // Create sample messages
    const message1: Message = {
      id: this.currentMessageId++,
      content: "Downtown evacuation is 75% complete. Need additional transport for elderly residents.",
      senderId: spocUser.id,
      incidentId: floodIncident.id,
      isEmergency: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    };
    this.messages.set(message1.id, message1);

    const message2: Message = {
      id: this.currentMessageId++,
      content: "Medical team has arrived at North Hills. Setting up triage station.",
      senderId: volunteerUser.id,
      incidentId: powerOutage.id,
      isEmergency: false,
      createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
    };
    this.messages.set(message2.id, message2);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Incident operations
  async getIncidents(): Promise<IncidentWithUsers[]> {
    return Array.from(this.incidents.values()).map(incident => this.enrichIncident(incident));
  }

  async getIncident(id: number): Promise<IncidentWithUsers | undefined> {
    const incident = this.incidents.get(id);
    return incident ? this.enrichIncident(incident) : undefined;
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const incident: Incident = {
      ...insertIncident,
      id: this.currentIncidentId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.incidents.set(incident.id, incident);
    return incident;
  }

  async updateIncident(id: number, updates: Partial<Incident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident = { ...incident, ...updates, updatedAt: new Date() };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async getIncidentsByStatus(status: string): Promise<IncidentWithUsers[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.status === status)
      .map(incident => this.enrichIncident(incident));
  }

  async getIncidentsByPriority(priority: string): Promise<IncidentWithUsers[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.priority === priority)
      .map(incident => this.enrichIncident(incident));
  }

  private enrichIncident(incident: Incident): IncidentWithUsers {
    return {
      ...incident,
      reportedByUser: incident.reportedBy ? this.users.get(incident.reportedBy) : undefined,
      assignedToUser: incident.assignedTo ? this.users.get(incident.assignedTo) : undefined,
      spocUser: incident.spocId ? this.users.get(incident.spocId) : undefined,
    };
  }

  // Resource operations
  async getResources(): Promise<ResourceWithIncident[]> {
    return Array.from(this.resources.values()).map(resource => this.enrichResource(resource));
  }

  async getResource(id: number): Promise<ResourceWithIncident | undefined> {
    const resource = this.resources.get(id);
    return resource ? this.enrichResource(resource) : undefined;
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const resource: Resource = {
      ...insertResource,
      id: this.currentResourceId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.resources.set(resource.id, resource);
    return resource;
  }

  async updateResource(id: number, updates: Partial<Resource>): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...updates, updatedAt: new Date() };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  async getResourcesByType(type: string): Promise<ResourceWithIncident[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.type === type)
      .map(resource => this.enrichResource(resource));
  }

  async getResourcesByStatus(status: string): Promise<ResourceWithIncident[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.status === status)
      .map(resource => this.enrichResource(resource));
  }

  private enrichResource(resource: Resource): ResourceWithIncident {
    return {
      ...resource,
      incident: resource.assignedIncident ? this.incidents.get(resource.assignedIncident) : undefined,
    };
  }

  // Message operations
  async getMessages(incidentId?: number): Promise<MessageWithUser[]> {
    let messages = Array.from(this.messages.values());
    if (incidentId) {
      messages = messages.filter(message => message.incidentId === incidentId);
    }
    return messages
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(message => this.enrichMessage(message));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      ...insertMessage,
      id: this.currentMessageId++,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async getRecentMessages(limit: number): Promise<MessageWithUser[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(message => this.enrichMessage(message));
  }

  private enrichMessage(message: Message): MessageWithUser {
    const sender = this.users.get(message.senderId);
    if (!sender) throw new Error(`Sender not found for message ${message.id}`);
    return { ...message, sender };
  }

  // Volunteer assignment operations
  async getVolunteerAssignments(volunteerId?: number, incidentId?: number): Promise<VolunteerAssignment[]> {
    let assignments = Array.from(this.volunteerAssignments.values());
    if (volunteerId) {
      assignments = assignments.filter(assignment => assignment.volunteerId === volunteerId);
    }
    if (incidentId) {
      assignments = assignments.filter(assignment => assignment.incidentId === incidentId);
    }
    return assignments;
  }

  async createVolunteerAssignment(insertAssignment: InsertVolunteerAssignment): Promise<VolunteerAssignment> {
    const assignment: VolunteerAssignment = {
      ...insertAssignment,
      id: this.currentAssignmentId++,
      assignedAt: new Date(),
    };
    this.volunteerAssignments.set(assignment.id, assignment);
    return assignment;
  }

  async updateVolunteerAssignment(id: number, updates: Partial<VolunteerAssignment>): Promise<VolunteerAssignment | undefined> {
    const assignment = this.volunteerAssignments.get(id);
    if (!assignment) return undefined;
    
    const updatedAssignment = { ...assignment, ...updates };
    this.volunteerAssignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    activeIncidents: number;
    activeVolunteers: number;
    resourcesAllocated: number;
    resolvedToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeIncidents = Array.from(this.incidents.values())
      .filter(incident => incident.status === 'active').length;

    const activeVolunteers = Array.from(this.users.values())
      .filter(user => user.role === 'volunteer').length;

    const totalResources = Array.from(this.resources.values()).length;
    const deployedResources = Array.from(this.resources.values())
      .filter(resource => resource.status === 'deployed').length;
    const resourcesAllocated = totalResources > 0 ? Math.round((deployedResources / totalResources) * 100) : 0;

    const resolvedToday = Array.from(this.incidents.values())
      .filter(incident => 
        incident.status === 'resolved' && 
        incident.updatedAt >= today
      ).length;

    return {
      activeIncidents,
      activeVolunteers,
      resourcesAllocated,
      resolvedToday,
    };
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Incident operations
  async getIncidents(): Promise<IncidentWithUsers[]> {
    const result = await db
      .select({
        incident: incidents,
        reportedByUser: users,
      })
      .from(incidents)
      .leftJoin(users, eq(incidents.reportedBy, users.id));

    return result.map(row => ({
      ...row.incident,
      reportedByUser: row.reportedByUser || undefined,
    })) as IncidentWithUsers[];
  }

  async getIncident(id: number): Promise<IncidentWithUsers | undefined> {
    const [result] = await db
      .select({
        incident: incidents,
        reportedByUser: users,
      })
      .from(incidents)
      .leftJoin(users, eq(incidents.reportedBy, users.id))
      .where(eq(incidents.id, id));

    if (!result) return undefined;

    return {
      ...result.incident,
      reportedByUser: result.reportedByUser || undefined,
    } as IncidentWithUsers;
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const [incident] = await db
      .insert(incidents)
      .values(insertIncident)
      .returning();
    return incident;
  }

  async updateIncident(id: number, updates: Partial<Incident>): Promise<Incident | undefined> {
    const [incident] = await db
      .update(incidents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return incident || undefined;
  }

  async getIncidentsByStatus(status: string): Promise<IncidentWithUsers[]> {
    const result = await db
      .select({
        incident: incidents,
        reportedByUser: users,
      })
      .from(incidents)
      .leftJoin(users, eq(incidents.reportedBy, users.id))
      .where(eq(incidents.status, status));

    return result.map(row => ({
      ...row.incident,
      reportedByUser: row.reportedByUser || undefined,
    })) as IncidentWithUsers[];
  }

  async getIncidentsByPriority(priority: string): Promise<IncidentWithUsers[]> {
    const result = await db
      .select({
        incident: incidents,
        reportedByUser: users,
      })
      .from(incidents)
      .leftJoin(users, eq(incidents.reportedBy, users.id))
      .where(eq(incidents.priority, priority));

    return result.map(row => ({
      ...row.incident,
      reportedByUser: row.reportedByUser || undefined,
    })) as IncidentWithUsers[];
  }

  // Resource operations
  async getResources(): Promise<ResourceWithIncident[]> {
    const result = await db
      .select({
        resource: resources,
        incident: incidents,
      })
      .from(resources)
      .leftJoin(incidents, eq(resources.assignedIncident, incidents.id));

    return result.map(row => ({
      ...row.resource,
      incident: row.incident || undefined,
    })) as ResourceWithIncident[];
  }

  async getResource(id: number): Promise<ResourceWithIncident | undefined> {
    const [result] = await db
      .select({
        resource: resources,
        incident: incidents,
      })
      .from(resources)
      .leftJoin(incidents, eq(resources.assignedIncident, incidents.id))
      .where(eq(resources.id, id));

    if (!result) return undefined;

    return {
      ...result.resource,
      incident: result.incident || undefined,
    } as ResourceWithIncident;
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values(insertResource)
      .returning();
    return resource;
  }

  async updateResource(id: number, updates: Partial<Resource>): Promise<Resource | undefined> {
    const [resource] = await db
      .update(resources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return resource || undefined;
  }

  async getResourcesByType(type: string): Promise<ResourceWithIncident[]> {
    const result = await db
      .select({
        resource: resources,
        incident: incidents,
      })
      .from(resources)
      .leftJoin(incidents, eq(resources.assignedIncident, incidents.id))
      .where(eq(resources.type, type));

    return result.map(row => ({
      ...row.resource,
      incident: row.incident || undefined,
    })) as ResourceWithIncident[];
  }

  async getResourcesByStatus(status: string): Promise<ResourceWithIncident[]> {
    const result = await db
      .select({
        resource: resources,
        incident: incidents,
      })
      .from(resources)
      .leftJoin(incidents, eq(resources.assignedIncident, incidents.id))
      .where(eq(resources.status, status));

    return result.map(row => ({
      ...row.resource,
      incident: row.incident || undefined,
    })) as ResourceWithIncident[];
  }

  // Message operations
  async getMessages(incidentId?: number): Promise<MessageWithUser[]> {
    let query = db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .orderBy(sql`${messages.createdAt} DESC`);

    if (incidentId) {
      query = query.where(eq(messages.incidentId, incidentId)) as any;
    }

    const result = await query;

    return result.map(row => ({
      ...row.message,
      sender: row.sender,
    })) as MessageWithUser[];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getRecentMessages(limit: number): Promise<MessageWithUser[]> {
    const result = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .orderBy(sql`${messages.createdAt} DESC`)
      .limit(limit);

    return result.map(row => ({
      ...row.message,
      sender: row.sender,
    })) as MessageWithUser[];
  }

  // Volunteer assignment operations
  async getVolunteerAssignments(volunteerId?: number, incidentId?: number): Promise<VolunteerAssignment[]> {
    let query = db.select().from(volunteerAssignments);

    if (volunteerId && incidentId) {
      query = query.where(
        sql`${volunteerAssignments.volunteerId} = ${volunteerId} AND ${volunteerAssignments.incidentId} = ${incidentId}`
      );
    } else if (volunteerId) {
      query = query.where(eq(volunteerAssignments.volunteerId, volunteerId));
    } else if (incidentId) {
      query = query.where(eq(volunteerAssignments.incidentId, incidentId));
    }

    return await query;
  }

  async createVolunteerAssignment(insertAssignment: InsertVolunteerAssignment): Promise<VolunteerAssignment> {
    const [assignment] = await db
      .insert(volunteerAssignments)
      .values(insertAssignment)
      .returning();
    return assignment;
  }

  async updateVolunteerAssignment(id: number, updates: Partial<VolunteerAssignment>): Promise<VolunteerAssignment | undefined> {
    const [assignment] = await db
      .update(volunteerAssignments)
      .set(updates)
      .where(eq(volunteerAssignments.id, id))
      .returning();
    return assignment || undefined;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    activeIncidents: number;
    activeVolunteers: number;
    resourcesAllocated: number;
    resolvedToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeIncidentsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(incidents)
      .where(eq(incidents.status, 'active'));

    const [activeVolunteersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'volunteer'));

    const [totalResourcesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(resources);

    const [deployedResourcesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(resources)
      .where(eq(resources.status, 'deployed'));

    const [resolvedTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(incidents)
      .where(
        sql`${incidents.status} = 'resolved' AND ${incidents.updatedAt} >= ${today}`
      );

    const totalResources = totalResourcesResult.count || 0;
    const deployedResources = deployedResourcesResult.count || 0;
    const resourcesAllocated = totalResources > 0 ? Math.round((deployedResources / totalResources) * 100) : 0;

    return {
      activeIncidents: activeIncidentsResult.count || 0,
      activeVolunteers: activeVolunteersResult.count || 0,
      resourcesAllocated,
      resolvedToday: resolvedTodayResult.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
