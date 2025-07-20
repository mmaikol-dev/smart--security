import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  guardDogs: defineTable({
    name: v.string(),
    breed: v.string(),
    age: v.number(),
    status: v.union(v.literal("active"), v.literal("resting"), v.literal("offline"), v.literal("medical")),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      zone: v.string(),
    }),
    handler: v.object({
      name: v.string(),
      contact: v.string(),
    }),
    healthMetrics: v.object({
      heartRate: v.number(),
      temperature: v.number(),
      lastCheckup: v.number(),
    }),
    lastPatrol: v.number(),
    isOnDuty: v.boolean(),
  }).index("by_status", ["status"])
    .index("by_zone", ["location.zone"]),

  bodyguards: defineTable({
    name: v.string(),
    employeeId: v.string(),
    assignedZone: v.string(),
    status: v.union(v.literal("on_duty"), v.literal("off_duty"), v.literal("break"), v.literal("emergency")),
    currentActivity: v.string(),
    shiftStart: v.number(),
    shiftEnd: v.number(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    contact: v.string(),
    certifications: v.array(v.string()),
  }).index("by_zone", ["assignedZone"])
    .index("by_status", ["status"]),

  cctvCameras: defineTable({
    cameraId: v.string(),
    name: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      zone: v.string(),
      description: v.string(),
    }),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("maintenance"), v.literal("error")),
    isRecording: v.boolean(),
    lastPing: v.number(),
    aiFeatures: v.object({
      motionDetection: v.boolean(),
      faceRecognition: v.boolean(),
      intrusionDetection: v.boolean(),
    }),
    resolution: v.string(),
    nightVision: v.boolean(),
  }).index("by_zone", ["location.zone"])
    .index("by_status", ["status"]),

  securityEvents: defineTable({
    type: v.union(
      v.literal("motion_detected"),
      v.literal("intrusion_alert"),
      v.literal("face_recognized"),
      v.literal("patrol_completed"),
      v.literal("emergency"),
      v.literal("system_alert")
    ),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    description: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      zone: v.string(),
    }),
    sourceId: v.string(), // ID of camera, dog, or guard that triggered the event
    sourceType: v.union(v.literal("camera"), v.literal("dog"), v.literal("guard"), v.literal("system")),
    isResolved: v.boolean(),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    metadata: v.optional(v.object({
      imageUrl: v.optional(v.string()),
      confidence: v.optional(v.number()),
      additionalInfo: v.optional(v.string()),
    })),
  }).index("by_type", ["type"])
    .index("by_severity", ["severity"])
    .index("by_zone", ["location.zone"])
    .index("by_resolved", ["isResolved"]),

  aiQueries: defineTable({
    query: v.string(),
    response: v.string(),
    userId: v.optional(v.id("users")),
    timestamp: v.number(),
    executionTime: v.number(),
    functionsUsed: v.array(v.string()),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
