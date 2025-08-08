import { MongoStorage } from "./storage-mongodb";

// Create a simple in-memory storage class for fallback
class MemStorage {
  private users = [
    { id: 1, username: "admin", password: "password123", role: "government", name: "Emergency Coordinator", email: "admin@disastercare.gov", phone: "+1-555-0001", location: "Emergency Operations Center", isSpoc: true, createdAt: new Date() },
    { id: 2, username: "john_volunteer", password: "password123", role: "volunteer", name: "John Smith", email: "john@email.com", phone: "+1-555-0002", location: "Downtown District", isSpoc: false, createdAt: new Date() }
  ];

  private incidents = [
    { id: 1, title: "Flood Emergency - Downtown Area", description: "Severe flooding affecting 200+ residents", location: "Downtown District", priority: "high", status: "active", type: "flood", affectedCount: 200, createdAt: new Date(), updatedAt: new Date() }
  ];

  private resources = [
    { id: 1, name: "Emergency Medical Supplies", type: "medical", quantity: 500, available: 350, location: "Central Hospital", status: "available", createdAt: new Date(), updatedAt: new Date() }
  ];

  private messages = [
    { id: 1, content: "Emergency shelter established at Community Center", senderId: 1, isEmergency: false, createdAt: new Date() }
  ];

  async getUser(id: number) { return this.users.find(u => u.id === id); }
  async getUserByUsername(username: string) { return this.users.find(u => u.username === username); }
  async createUser(user: any) { const newUser = { ...user, id: this.users.length + 1, createdAt: new Date() }; this.users.push(newUser); return newUser; }
  async updateUser(id: number, updates: any) { const user = this.users.find(u => u.id === id); if (user) Object.assign(user, updates); return user; }
  async getUsersByRole(role: string) { return this.users.filter(u => u.role === role); }

  async getIncidents() { return this.incidents; }
  async getIncident(id: number) { return this.incidents.find(i => i.id === id); }
  async createIncident(incident: any) { const newIncident = { ...incident, id: this.incidents.length + 1, createdAt: new Date(), updatedAt: new Date() }; this.incidents.push(newIncident); return newIncident; }
  async updateIncident(id: number, updates: any) { const incident = this.incidents.find(i => i.id === id); if (incident) Object.assign(incident, { ...updates, updatedAt: new Date() }); return incident; }
  async getIncidentsByStatus(status: string) { return this.incidents.filter(i => i.status === status); }
  async getIncidentsByPriority(priority: string) { return this.incidents.filter(i => i.priority === priority); }

  async getResources() { return this.resources; }
  async getResource(id: number) { return this.resources.find(r => r.id === id); }
  async createResource(resource: any) { const newResource = { ...resource, id: this.resources.length + 1, createdAt: new Date(), updatedAt: new Date() }; this.resources.push(newResource); return newResource; }
  async updateResource(id: number, updates: any) { const resource = this.resources.find(r => r.id === id); if (resource) Object.assign(resource, { ...updates, updatedAt: new Date() }); return resource; }
  async getResourcesByType(type: string) { return this.resources.filter(r => r.type === type); }
  async getResourcesByStatus(status: string) { return this.resources.filter(r => r.status === status); }

  async getMessages(incidentId?: number) { return incidentId ? this.messages.filter(m => m.incidentId === incidentId) : this.messages; }
  async createMessage(message: any) { const newMessage = { ...message, id: this.messages.length + 1, createdAt: new Date() }; this.messages.push(newMessage); return newMessage; }
  async getRecentMessages(limit: number) { return this.messages.slice(-limit); }

  async getVolunteerAssignments() { return []; }
  async createVolunteerAssignment(assignment: any) { return { ...assignment, id: 1 }; }
  async updateVolunteerAssignment(id: number, updates: any) { return { id, ...updates }; }

  async getDashboardStats() {
    return {
      activeIncidents: this.incidents.filter(i => i.status === 'active').length.toString(),
      activeVolunteers: this.users.filter(u => u.role === 'volunteer').length.toString(),
      resourcesAllocated: this.resources.filter(r => r.status === 'deployed').length.toString(),
      resolvedToday: "2"
    };
  }
}

// Create a hybrid storage that falls back to memory storage if MongoDB is not available
class HybridStorage {
  private mongoStorage: MongoStorage;
  private memStorage: MemStorage;
  private useMemory = false;

  constructor() {
    this.mongoStorage = new MongoStorage();
    this.memStorage = new MemStorage();
    
    // Test MongoDB connection
    this.testConnection();
  }

  private async testConnection() {
    try {
      // Try a simple operation to test if MongoDB is working
      await this.mongoStorage.getDashboardStats();
      console.log("✅ Using MongoDB for data persistence");
    } catch (error) {
      console.log("⚠️  MongoDB not available, using in-memory storage");
      this.useMemory = true;
      
      // Seed memory storage with sample data
      this.seedMemoryStorage();
    }
  }

  private seedMemoryStorage() {
    // Add some sample data to memory storage for development
    console.log("🌱 Seeding in-memory storage with sample data...");
    
    // This will be populated automatically when the first requests are made
    // The MemStorage class already has sample data built-in
  }

  // Proxy all methods to the appropriate storage
  async getUser(id: string) {
    if (this.useMemory) {
      // Convert string ID to number for MemStorage compatibility
      const numId = parseInt(id) || 1;
      return this.memStorage.getUser(numId);
    }
    return this.mongoStorage.getUser(id);
  }

  async getUserByUsername(username: string) {
    return this.useMemory ? this.memStorage.getUserByUsername(username) : this.mongoStorage.getUserByUsername(username);
  }

  async createUser(user: any) {
    return this.useMemory ? this.memStorage.createUser(user) : this.mongoStorage.createUser(user);
  }

  async updateUser(id: string, updates: any) {
    if (this.useMemory) {
      const numId = parseInt(id) || 1;
      return this.memStorage.updateUser(numId, updates);
    }
    return this.mongoStorage.updateUser(id, updates);
  }

  async getUsersByRole(role: string) {
    return this.useMemory ? this.memStorage.getUsersByRole(role) : this.mongoStorage.getUsersByRole(role);
  }

  async getIncidents() {
    return this.useMemory ? this.memStorage.getIncidents() : this.mongoStorage.getIncidents();
  }

  async getIncident(id: string) {
    if (this.useMemory) {
      const numId = parseInt(id) || 1;
      return this.memStorage.getIncident(numId);
    }
    return this.mongoStorage.getIncident(id);
  }

  async createIncident(incident: any) {
    return this.useMemory ? this.memStorage.createIncident(incident) : this.mongoStorage.createIncident(incident);
  }

  async updateIncident(id: string, updates: any) {
    if (this.useMemory) {
      const numId = parseInt(id) || 1;
      return this.memStorage.updateIncident(numId, updates);
    }
    return this.mongoStorage.updateIncident(id, updates);
  }

  async getIncidentsByStatus(status: string) {
    return this.useMemory ? this.memStorage.getIncidentsByStatus(status) : this.mongoStorage.getIncidentsByStatus(status);
  }

  async getIncidentsByPriority(priority: string) {
    return this.useMemory ? this.memStorage.getIncidentsByPriority(priority) : this.mongoStorage.getIncidentsByPriority(priority);
  }

  async getResources() {
    return this.useMemory ? this.memStorage.getResources() : this.mongoStorage.getResources();
  }

  async getResource(id: string) {
    if (this.useMemory) {
      const numId = parseInt(id) || 1;
      return this.memStorage.getResource(numId);
    }
    return this.mongoStorage.getResource(id);
  }

  async createResource(resource: any) {
    return this.useMemory ? this.memStorage.createResource(resource) : this.mongoStorage.createResource(resource);
  }

  async updateResource(id: string, updates: any) {
    if (this.useMemory) {
      const numId = parseInt(id) || 1;
      return this.memStorage.updateResource(numId, updates);
    }
    return this.mongoStorage.updateResource(id, updates);
  }

  async getResourcesByType(type: string) {
    return this.useMemory ? this.memStorage.getResourcesByType(type) : this.mongoStorage.getResourcesByType(type);
  }

  async getResourcesByStatus(status: string) {
    return this.useMemory ? this.memStorage.getResourcesByStatus(status) : this.mongoStorage.getResourcesByStatus(status);
  }

  async getMessages(incidentId?: string) {
    if (this.useMemory) {
      const numId = incidentId ? parseInt(incidentId) : undefined;
      return this.memStorage.getMessages(numId);
    }
    return this.mongoStorage.getMessages(incidentId);
  }

  async createMessage(message: any) {
    return this.useMemory ? this.memStorage.createMessage(message) : this.mongoStorage.createMessage(message);
  }

  async getRecentMessages(limit: number) {
    return this.useMemory ? this.memStorage.getRecentMessages(limit) : this.mongoStorage.getRecentMessages(limit);
  }

  async getVolunteerAssignments(volunteerId?: string, incidentId?: string) {
    if (this.useMemory) {
      const numVolunteerId = volunteerId ? parseInt(volunteerId) : undefined;
      const numIncidentId = incidentId ? parseInt(incidentId) : undefined;
      return this.memStorage.getVolunteerAssignments(numVolunteerId, numIncidentId);
    }
    return this.mongoStorage.getVolunteerAssignments(volunteerId, incidentId);
  }

  async createVolunteerAssignment(assignment: any) {
    return this.useMemory ? this.memStorage.createVolunteerAssignment(assignment) : this.mongoStorage.createVolunteerAssignment(assignment);
  }

  async updateVolunteerAssignment(id: string, updates: any) {
    if (this.useMemory) {
      const numId = parseInt(id) || 1;
      return this.memStorage.updateVolunteerAssignment(numId, updates);
    }
    return this.mongoStorage.updateVolunteerAssignment(id, updates);
  }

  async getDashboardStats() {
    return this.useMemory ? this.memStorage.getDashboardStats() : this.mongoStorage.getDashboardStats();
  }
}

export const storage = new HybridStorage();