import connectToDatabase from "./mongodb";
import { User, Incident, Resource, Message, VolunteerAssignment } from "@shared/models";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await connectToDatabase();
    
    // Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Incident.deleteMany({}),
      Resource.deleteMany({}),
      Message.deleteMany({}),
      VolunteerAssignment.deleteMany({})
    ]);

    // Create sample users
    console.log("Creating sample users...");
    const users = await User.create([
      {
        username: "admin",
        password: "password123",
        role: "government",
        name: "Emergency Coordinator",
        email: "admin@disastercare.gov",
        phone: "+1-555-0001",
        location: "Emergency Operations Center",
        isSpoc: true
      },
      {
        username: "john_volunteer",
        password: "password123",
        role: "volunteer",
        name: "John Smith",
        email: "john@email.com",
        phone: "+1-555-0002",
        location: "Downtown District",
        isSpoc: false
      },
      {
        username: "sarah_medical",
        password: "password123",
        role: "social",
        name: "Dr. Sarah Johnson",
        email: "sarah@medicorps.org",
        phone: "+1-555-0003",
        location: "Central Hospital",
        isSpoc: true
      },
      {
        username: "mike_victim",
        password: "password123",
        role: "victim",
        name: "Mike Davis",
        email: "mike@email.com",
        phone: "+1-555-0004",
        location: "Riverside Community",
        isSpoc: false
      }
    ]);

    // Create sample incidents
    console.log("Creating sample incidents...");
    const incidents = await Incident.create([
      {
        title: "Flood Emergency - Downtown Area",
        description: "Severe flooding in downtown area affecting 200+ residents. Multiple buildings evacuated. Emergency shelters needed.",
        location: "Downtown District, Main Street",
        coordinates: { lat: 40.7589, lng: -73.9851 },
        priority: "high",
        status: "active",
        type: "flood",
        reportedBy: users[0]._id,
        assignedTo: users[1]._id,
        spocId: users[0]._id,
        affectedCount: 200
      },
      {
        title: "Medical Emergency Response",
        description: "Mass casualty incident requiring immediate medical attention and resources.",
        location: "Central Hospital District",
        coordinates: { lat: 40.7614, lng: -73.9776 },
        priority: "high",
        status: "in_progress",
        type: "medical",
        reportedBy: users[2]._id,
        assignedTo: users[2]._id,
        spocId: users[2]._id,
        affectedCount: 45
      },
      {
        title: "Power Outage - Residential Area",
        description: "Widespread power outage affecting 500+ homes. Estimated repair time 6-8 hours.",
        location: "Riverside Community",
        coordinates: { lat: 40.7505, lng: -73.9934 },
        priority: "medium",
        status: "active",
        type: "power_outage",
        reportedBy: users[3]._id,
        assignedTo: users[1]._id,
        spocId: users[0]._id,
        affectedCount: 500
      }
    ]);

    // Create sample resources
    console.log("Creating sample resources...");
    const resources = await Resource.create([
      {
        name: "Emergency Medical Supplies",
        type: "medical",
        quantity: 500,
        available: 350,
        location: "Central Hospital",
        status: "available",
        assignedIncident: incidents[1]._id,
        eta: 30
      },
      {
        name: "Emergency Shelter Capacity",
        type: "shelter",
        quantity: 200,
        available: 80,
        location: "Community Center",
        status: "deployed",
        assignedIncident: incidents[0]._id,
        eta: 45
      },
      {
        name: "Emergency Transport Vehicles",
        type: "transport",
        quantity: 20,
        available: 12,
        location: "Fire Station",
        status: "available"
      },
      {
        name: "Food Supplies",
        type: "food",
        quantity: 1000,
        available: 750,
        location: "Red Cross Center",
        status: "available"
      },
      {
        name: "Water Purification Units",
        type: "water",
        quantity: 10,
        available: 3,
        location: "Emergency Depot",
        status: "critical",
        assignedIncident: incidents[0]._id,
        eta: 60
      }
    ]);

    // Create sample messages
    console.log("Creating sample messages...");
    await Message.create([
      {
        content: "Emergency shelter at Community Center is now at 60% capacity. Additional shelter locations being prepared.",
        senderId: users[0]._id,
        incidentId: incidents[0]._id,
        isEmergency: false
      },
      {
        content: "Medical team dispatched to Central Hospital. ETA 15 minutes.",
        senderId: users[2]._id,
        incidentId: incidents[1]._id,
        isEmergency: false
      },
      {
        content: "URGENT: Building collapse reported on Oak Street. All units respond immediately!",
        senderId: users[0]._id,
        incidentId: incidents[1]._id,
        isEmergency: true
      },
      {
        content: "Power restoration crews working on main transformer. Expected completion in 4 hours.",
        senderId: users[1]._id,
        incidentId: incidents[2]._id,
        isEmergency: false
      },
      {
        content: "Water distribution center established at Park Avenue. Free bottled water available.",
        senderId: users[0]._id,
        isEmergency: false
      }
    ]);

    // Create sample volunteer assignments
    console.log("Creating sample volunteer assignments...");
    await VolunteerAssignment.create([
      {
        volunteerId: users[1]._id,
        incidentId: incidents[0]._id,
        role: "coordinator",
        status: "active"
      },
      {
        volunteerId: users[1]._id,
        incidentId: incidents[2]._id,
        role: "responder",
        status: "assigned"
      }
    ]);

    console.log("Database seeded successfully!");
    console.log("Sample users created:");
    console.log("- admin / password123 (Government)");
    console.log("- john_volunteer / password123 (Volunteer)");
    console.log("- sarah_medical / password123 (Social Service)");
    console.log("- mike_victim / password123 (Victim)");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();