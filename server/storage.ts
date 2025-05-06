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
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

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
    const [pattern] = await db.insert(workPatterns).values(patternData).returning();
    return pattern;
  }

  async updateWorkPattern(id: number, patternData: Partial<InsertWorkPattern>): Promise<WorkPattern | undefined> {
    const [pattern] = await db.update(workPatterns)
      .set(patternData)
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
