import { db } from "./db";
import { users, incidents, resources, messages } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  try {
    // Create sample users
    const adminUser = await db.insert(users).values({
      username: "admin",
      password: "password",
      role: "government",
      name: "Sarah Chen",
      email: "sarah.chen@gov.org",
      phone: "+1-555-0123",
      location: "Emergency Operations Center",
      isSpoc: false,
    }).returning();

    const spocUser = await db.insert(users).values({
      username: "maria_spoc",
      password: "password",
      role: "government",
      name: "Maria Rodriguez",
      email: "maria.rodriguez@gov.org",
      phone: "+1-555-0124",
      location: "Downtown District",
      isSpoc: true,
    }).returning();

    const volunteerUser = await db.insert(users).values({
      username: "james_volunteer",
      password: "password",
      role: "volunteer",
      name: "James Kim",
      email: "james.kim@volunteer.org",
      phone: "+1-555-0125",
      location: "North Hills",
      isSpoc: false,
    }).returning();

    // Create sample incidents
    const floodIncident = await db.insert(incidents).values({
      title: "Flood Emergency - Downtown District",
      description: "Major flooding reported in downtown area affecting multiple city blocks",
      location: "Main Street & 5th Avenue",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      priority: "high",
      status: "active",
      type: "flood",
      reportedBy: adminUser[0].id,
      assignedTo: volunteerUser[0].id,
      spocId: spocUser[0].id,
      affectedCount: 150,
    }).returning();

    await db.insert(incidents).values({
      title: "Power Outage Reported",
      description: "Widespread power outage affecting residential areas",
      location: "North Hills Residential Area",
      coordinates: { lat: 40.7589, lng: -73.9851 },
      priority: "medium",
      status: "in_progress",
      type: "power_outage",
      reportedBy: volunteerUser[0].id,
      assignedTo: adminUser[0].id,
      spocId: null,
      affectedCount: 85,
    });

    // Create sample resources
    await db.insert(resources).values({
      name: "Emergency Medical Supplies",
      type: "medical",
      quantity: 150,
      available: 37,
      location: "Central Warehouse",
      status: "available",
      assignedIncident: floodIncident[0].id,
      eta: 25,
    });

    await db.insert(resources).values({
      name: "Search & Rescue Teams",
      type: "personnel",
      quantity: 8,
      available: 1,
      location: "Fire Station #3",
      status: "deployed",
      assignedIncident: floodIncident[0].id,
      eta: 12,
    });

    await db.insert(resources).values({
      name: "Emergency Shelters",
      type: "shelter",
      quantity: 500,
      available: 25,
      location: "Community Centers",
      status: "critical",
      assignedIncident: null,
      eta: null,
    });

    // Create sample messages
    await db.insert(messages).values({
      content: "Downtown evacuation is 75% complete. Need additional transport for elderly residents.",
      senderId: spocUser[0].id,
      incidentId: floodIncident[0].id,
      isEmergency: false,
    });

    await db.insert(messages).values({
      content: "Medical team has arrived at North Hills. Setting up triage station.",
      senderId: volunteerUser[0].id,
      incidentId: null,
      isEmergency: false,
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run if this file is executed directly
seedDatabase().then(() => process.exit(0));