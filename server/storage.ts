import { db } from "@db";
import { users, workPatterns, recurringPatterns, User, InsertUser, WorkPattern, InsertWorkPattern, RecurringPattern, InsertRecurringPattern } from "@shared/schema";
import { eq, and, between, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Work pattern methods
  getWorkPattern(id: number): Promise<WorkPattern | undefined>;
  getUserWorkPatterns(userId: number): Promise<WorkPattern[]>;
  getWorkPatternsInRange(startDate: Date, endDate: Date): Promise<WorkPattern[]>;
  getUserWorkPatternsInRange(userId: number, startDate: Date, endDate: Date): Promise<WorkPattern[]>;
  createWorkPattern(patternData: InsertWorkPattern): Promise<WorkPattern>;
  updateWorkPattern(id: number, patternData: Partial<InsertWorkPattern>): Promise<WorkPattern | undefined>;
  deleteWorkPattern(id: number): Promise<boolean>;
  
  // Recurring pattern methods
  getRecurringPattern(id: number): Promise<RecurringPattern | undefined>;
  getUserRecurringPatterns(userId: number): Promise<RecurringPattern[]>;
  createRecurringPattern(patternData: InsertRecurringPattern): Promise<RecurringPattern>;
  updateRecurringPattern(id: number, patternData: Partial<InsertRecurringPattern>): Promise<RecurringPattern | undefined>;
  deleteRecurringPattern(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Using any to avoid TypeScript errors with session.SessionStore
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to work around TypeScript errors

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.displayName);
  }

  // Work pattern methods
  async getWorkPattern(id: number): Promise<WorkPattern | undefined> {
    const result = await db.select().from(workPatterns).where(eq(workPatterns.id, id)).limit(1);
    return result[0];
  }

  async getUserWorkPatterns(userId: number): Promise<WorkPattern[]> {
    return await db.select().from(workPatterns).where(eq(workPatterns.userId, userId)).orderBy(desc(workPatterns.date));
  }

  async getWorkPatternsInRange(startDate: Date, endDate: Date): Promise<WorkPattern[]> {
    return await db.select().from(workPatterns)
      .where(between(workPatterns.date, startDate, endDate))
      .orderBy(workPatterns.date);
  }

  async getUserWorkPatternsInRange(userId: number, startDate: Date, endDate: Date): Promise<WorkPattern[]> {
    return await db.select().from(workPatterns)
      .where(and(
        eq(workPatterns.userId, userId),
        between(workPatterns.date, startDate, endDate)
      ))
      .orderBy(workPatterns.date);
  }

  async createWorkPattern(patternData: InsertWorkPattern): Promise<WorkPattern> {
    // Make sure we have a proper Date object for date
    const cleanDate = patternData.date instanceof Date 
      ? patternData.date 
      : new Date(patternData.date);
    
    // Check if there's already a pattern for this user on this date
    const existingPattern = await db.select()
      .from(workPatterns)
      .where(
        and(
          eq(workPatterns.userId, patternData.userId),
          sql`DATE(${workPatterns.date}) = DATE(${cleanDate})`
        )
      )
      .limit(1);
    
    // If there's an existing pattern, update it instead of creating a new one
    if (existingPattern.length > 0) {
      console.log(`Overwriting existing pattern ${existingPattern[0].id} for date ${cleanDate}`);
      const [pattern] = await db.update(workPatterns)
        .set({
          location: patternData.location,
          notes: patternData.notes
        })
        .where(eq(workPatterns.id, existingPattern[0].id))
        .returning();
      return pattern;
    }
    
    // Otherwise create a new pattern with cleaned date
    const [pattern] = await db.insert(workPatterns).values({
      ...patternData,
      date: cleanDate
    }).returning();
    return pattern;
  }

  async updateWorkPattern(id: number, patternData: Partial<InsertWorkPattern>): Promise<WorkPattern | undefined> {
    // Clean data before updating
    const cleanData: Partial<InsertWorkPattern> = { ...patternData };
    
    // Convert date string to Date object if present
    if (patternData.date) {
      cleanData.date = patternData.date instanceof Date 
        ? patternData.date 
        : new Date(patternData.date);
    }
    
    const [pattern] = await db.update(workPatterns)
      .set(cleanData)
      .where(eq(workPatterns.id, id))
      .returning();
    return pattern;
  }

  async deleteWorkPattern(id: number): Promise<boolean> {
    const result = await db.delete(workPatterns).where(eq(workPatterns.id, id)).returning();
    return result.length > 0;
  }

  // Recurring pattern methods
  async getRecurringPattern(id: number): Promise<RecurringPattern | undefined> {
    const result = await db.select().from(recurringPatterns).where(eq(recurringPatterns.id, id)).limit(1);
    return result[0];
  }

  async getUserRecurringPatterns(userId: number): Promise<RecurringPattern[]> {
    return await db.select().from(recurringPatterns).where(eq(recurringPatterns.userId, userId));
  }

  async createRecurringPattern(patternData: InsertRecurringPattern): Promise<RecurringPattern> {
    const [pattern] = await db.insert(recurringPatterns).values(patternData).returning();
    return pattern;
  }

  async updateRecurringPattern(id: number, patternData: Partial<InsertRecurringPattern>): Promise<RecurringPattern | undefined> {
    const [pattern] = await db.update(recurringPatterns)
      .set(patternData)
      .where(eq(recurringPatterns.id, id))
      .returning();
    return pattern;
  }

  async deleteRecurringPattern(id: number): Promise<boolean> {
    const result = await db.delete(recurringPatterns).where(eq(recurringPatterns.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
