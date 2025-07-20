import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedSecurityData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data
    const existingDogs = await ctx.db.query("guardDogs").collect();
    const existingGuards = await ctx.db.query("bodyguards").collect();
    const existingCameras = await ctx.db.query("cctvCameras").collect();
    
    for (const dog of existingDogs) {
      await ctx.db.delete(dog._id);
    }
    for (const guard of existingGuards) {
      await ctx.db.delete(guard._id);
    }
    for (const camera of existingCameras) {
      await ctx.db.delete(camera._id);
    }

    // Seed Guard Dogs
    const dogs = [
      {
        name: "Rex",
        breed: "German Shepherd",
        age: 4,
        status: "active" as const,
        location: { lat: 40.7128, lng: -74.0060, zone: "North Gate" },
        handler: { name: "John Smith", contact: "+1-555-0101" },
        healthMetrics: { heartRate: 85, temperature: 101.5, lastCheckup: Date.now() - 7 * 24 * 60 * 60 * 1000 },
        lastPatrol: Date.now() - 2 * 60 * 60 * 1000,
        isOnDuty: true,
      },
      {
        name: "Luna",
        breed: "Belgian Malinois",
        age: 3,
        status: "active" as const,
        location: { lat: 40.7589, lng: -73.9851, zone: "East Wing" },
        handler: { name: "Sarah Johnson", contact: "+1-555-0102" },
        healthMetrics: { heartRate: 90, temperature: 101.8, lastCheckup: Date.now() - 3 * 24 * 60 * 60 * 1000 },
        lastPatrol: Date.now() - 1 * 60 * 60 * 1000,
        isOnDuty: true,
      },
      {
        name: "Max",
        breed: "Rottweiler",
        age: 5,
        status: "resting" as const,
        location: { lat: 40.7505, lng: -73.9934, zone: "South Entrance" },
        handler: { name: "Mike Wilson", contact: "+1-555-0103" },
        healthMetrics: { heartRate: 75, temperature: 101.2, lastCheckup: Date.now() - 1 * 24 * 60 * 60 * 1000 },
        lastPatrol: Date.now() - 4 * 60 * 60 * 1000,
        isOnDuty: false,
      },
    ];

    // Seed Bodyguards
    const guards = [
      {
        name: "Alex Rodriguez",
        employeeId: "BG001",
        assignedZone: "Main Building",
        status: "on_duty" as const,
        currentActivity: "Perimeter patrol",
        shiftStart: Date.now() - 4 * 60 * 60 * 1000,
        shiftEnd: Date.now() + 4 * 60 * 60 * 1000,
        location: { lat: 40.7614, lng: -73.9776 },
        contact: "+1-555-0201",
        certifications: ["Armed Security", "First Aid", "Crisis Management"],
      },
      {
        name: "Maria Garcia",
        employeeId: "BG002",
        assignedZone: "Parking Lot",
        status: "on_duty" as const,
        currentActivity: "Vehicle inspection",
        shiftStart: Date.now() - 3 * 60 * 60 * 1000,
        shiftEnd: Date.now() + 5 * 60 * 60 * 1000,
        location: { lat: 40.7580, lng: -73.9855 },
        contact: "+1-555-0202",
        certifications: ["Security Guard License", "Defensive Tactics"],
      },
      {
        name: "David Chen",
        employeeId: "BG003",
        assignedZone: "Reception Area",
        status: "break" as const,
        currentActivity: "Break time",
        shiftStart: Date.now() - 2 * 60 * 60 * 1000,
        shiftEnd: Date.now() + 6 * 60 * 60 * 1000,
        location: { lat: 40.7505, lng: -73.9934 },
        contact: "+1-555-0203",
        certifications: ["Customer Service", "Access Control"],
      },
    ];

    // Seed CCTV Cameras
    const cameras = [
      {
        cameraId: "CAM001",
        name: "Main Entrance Camera",
        location: { lat: 40.7128, lng: -74.0060, zone: "Main Entrance", description: "Front door monitoring" },
        status: "online" as const,
        isRecording: true,
        lastPing: Date.now(),
        aiFeatures: { motionDetection: true, faceRecognition: true, intrusionDetection: true },
        resolution: "4K",
        nightVision: true,
      },
      {
        cameraId: "CAM002",
        name: "Parking Lot Camera 1",
        location: { lat: 40.7589, lng: -73.9851, zone: "Parking Lot", description: "North parking area" },
        status: "online" as const,
        isRecording: true,
        lastPing: Date.now() - 30000,
        aiFeatures: { motionDetection: true, faceRecognition: false, intrusionDetection: true },
        resolution: "1080p",
        nightVision: true,
      },
      {
        cameraId: "CAM003",
        name: "Hallway Camera A",
        location: { lat: 40.7505, lng: -73.9934, zone: "Interior", description: "Main hallway" },
        status: "offline" as const,
        isRecording: false,
        lastPing: Date.now() - 10 * 60 * 1000,
        aiFeatures: { motionDetection: true, faceRecognition: true, intrusionDetection: false },
        resolution: "1080p",
        nightVision: false,
      },
      {
        cameraId: "CAM004",
        name: "Emergency Exit Camera",
        location: { lat: 40.7614, lng: -73.9776, zone: "Emergency Exit", description: "Rear emergency exit" },
        status: "maintenance" as const,
        isRecording: false,
        lastPing: Date.now() - 2 * 60 * 60 * 1000,
        aiFeatures: { motionDetection: true, faceRecognition: false, intrusionDetection: true },
        resolution: "720p",
        nightVision: true,
      },
    ];

    // Insert data
    for (const dog of dogs) {
      await ctx.db.insert("guardDogs", dog);
    }
    for (const guard of guards) {
      await ctx.db.insert("bodyguards", guard);
    }
    for (const camera of cameras) {
      await ctx.db.insert("cctvCameras", camera);
    }

    // Seed some security events
    const events = [
      {
        type: "motion_detected" as const,
        severity: "low" as const,
        description: "Motion detected in parking lot",
        location: { lat: 40.7589, lng: -73.9851, zone: "Parking Lot" },
        sourceId: "CAM002",
        sourceType: "camera" as const,
        isResolved: true,
        resolvedBy: "Maria Garcia",
        resolvedAt: Date.now() - 30 * 60 * 1000,
      },
      {
        type: "intrusion_alert" as const,
        severity: "high" as const,
        description: "Unauthorized access attempt at emergency exit",
        location: { lat: 40.7614, lng: -73.9776, zone: "Emergency Exit" },
        sourceId: "CAM004",
        sourceType: "camera" as const,
        isResolved: false,
      },
      {
        type: "patrol_completed" as const,
        severity: "low" as const,
        description: "Rex completed north gate patrol",
        location: { lat: 40.7128, lng: -74.0060, zone: "North Gate" },
        sourceId: "Rex",
        sourceType: "dog" as const,
        isResolved: true,
        resolvedBy: "System",
        resolvedAt: Date.now() - 2 * 60 * 60 * 1000,
      },
    ];

    for (const event of events) {
      await ctx.db.insert("securityEvents", event);
    }

    return { success: true, message: "Security data seeded successfully" };
  },
});
