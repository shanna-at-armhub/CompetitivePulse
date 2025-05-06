import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting seed...");
    
    // Check if we already have users
    const existingUsers = await db.select({ count: db.count() }).from(schema.users);
    
    if (existingUsers[0].count > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    
    // Create admin and sample users
    const adminPassword = await hashPassword("admin123");
    const userPassword = await hashPassword("user123");
    
    const admin = await db.insert(schema.users).values({
      username: "admin",
      password: adminPassword,
      displayName: "Admin User",
      role: "admin",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    }).returning();
    
    const sarah = await db.insert(schema.users).values({
      username: "sarah",
      password: userPassword,
      displayName: "Sarah L.",
      role: "user",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    }).returning();
    
    const michael = await db.insert(schema.users).values({
      username: "michael",
      password: userPassword,
      displayName: "Michael R.",
      role: "user",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    }).returning();
    
    const alex = await db.insert(schema.users).values({
      username: "alex",
      password: userPassword,
      displayName: "Alex M.",
      role: "user",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    }).returning();
    
    console.log("Users created successfully!");
    
    // Generate some work patterns for the current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create a date in the current month
    const getDate = (day: number) => new Date(currentYear, currentMonth, day);
    
    // Sample work patterns for Sarah
    await db.insert(schema.workPatterns).values([
      {
        userId: sarah[0].id,
        date: getDate(2),
        location: "office",
        notes: "Team meeting day",
      },
      {
        userId: sarah[0].id,
        date: getDate(3),
        location: "office",
        notes: "",
      },
      {
        userId: sarah[0].id,
        date: getDate(4),
        location: "office",
        notes: "",
      },
      {
        userId: sarah[0].id,
        date: getDate(5),
        location: "home",
        notes: "Focus work",
      },
      {
        userId: sarah[0].id,
        date: getDate(8),
        location: "office",
        notes: "",
      },
      {
        userId: sarah[0].id,
        date: getDate(9),
        location: "office",
        notes: "",
      },
      {
        userId: sarah[0].id,
        date: getDate(10),
        location: "office",
        notes: "",
      },
    ]);
    
    // Sample work patterns for Michael
    await db.insert(schema.workPatterns).values([
      {
        userId: michael[0].id,
        date: getDate(2),
        location: "home",
        notes: "Working on project deadlines",
      },
      {
        userId: michael[0].id,
        date: getDate(3),
        location: "home",
        notes: "",
      },
      {
        userId: michael[0].id,
        date: getDate(4),
        location: "home",
        notes: "",
      },
      {
        userId: michael[0].id,
        date: getDate(5),
        location: "home",
        notes: "",
      },
      {
        userId: michael[0].id,
        date: getDate(8),
        location: "office",
        notes: "Quarterly planning",
      },
      {
        userId: michael[0].id,
        date: getDate(9),
        location: "office",
        notes: "",
      },
      {
        userId: michael[0].id,
        date: getDate(10),
        location: "office",
        notes: "",
      },
    ]);
    
    // Sample work patterns for Alex
    await db.insert(schema.workPatterns).values([
      {
        userId: alex[0].id,
        date: getDate(3),
        location: "office",
        notes: "",
      },
      {
        userId: alex[0].id,
        date: getDate(4),
        location: "office",
        notes: "",
      },
      {
        userId: alex[0].id,
        date: getDate(8),
        location: "home",
        notes: "Remote meeting day",
      },
      {
        userId: alex[0].id,
        date: getDate(9),
        location: "home",
        notes: "",
      },
    ]);
    
    // Create recurring patterns
    await db.insert(schema.recurringPatterns).values([
      {
        userId: sarah[0].id,
        location: "office",
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        notes: "Standard office schedule",
      },
      {
        userId: michael[0].id,
        location: "home",
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        notes: "Remote work schedule",
      },
      {
        userId: alex[0].id,
        location: "office",
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
        notes: "Hybrid schedule - first half of week in office",
      },
      {
        userId: alex[0].id,
        location: "home",
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        notes: "Hybrid schedule - second half of week at home",
      },
    ]);
    
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

seed();
