import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum('role', ['user', 'admin']);
export const locationEnum = pgEnum('location', ['home', 'office', 'annual_leave', 'personal_leave', 'public_holiday', 'other']);
export const patternTypeEnum = pgEnum('pattern_type', ['one_time', 'recurring']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").default('user').notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Work patterns table
export const workPatterns = pgTable("work_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  location: locationEnum("location").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recurring patterns table
export const recurringPatterns = pgTable("recurring_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  location: locationEnum("location").notNull(),
  monday: boolean("monday").default(false).notNull(),
  tuesday: boolean("tuesday").default(false).notNull(),
  wednesday: boolean("wednesday").default(false).notNull(),
  thursday: boolean("thursday").default(false).notNull(),
  friday: boolean("friday").default(false).notNull(),
  saturday: boolean("saturday").default(false).notNull(),
  sunday: boolean("sunday").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workPatterns: many(workPatterns),
  recurringPatterns: many(recurringPatterns),
}));

export const workPatternsRelations = relations(workPatterns, ({ one }) => ({
  user: one(users, { fields: [workPatterns.userId], references: [users.id] }),
}));

export const recurringPatternsRelations = relations(recurringPatterns, ({ one }) => ({
  user: one(users, { fields: [recurringPatterns.userId], references: [users.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.optional(),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  displayName: (schema) => schema.min(2, "Display name must be at least 2 characters"),
  email: (schema) => schema.email("Please enter a valid email address"),
}).omit({ createdAt: true })
  .transform((data) => ({
    ...data,
    // Default username to email if not provided
    username: data.username || data.email,
  }));

export const insertWorkPatternSchema = createInsertSchema(workPatterns, {
  notes: (schema) => schema.optional(),
  date: (schema) => z.string().or(z.date())
}).omit({ createdAt: true });

export const insertRecurringPatternSchema = createInsertSchema(recurringPatterns, {
  notes: (schema) => schema.optional(),
}).omit({ createdAt: true });

// Login schema - allow login with email or username
export const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WorkPattern = typeof workPatterns.$inferSelect;
export type InsertWorkPattern = z.infer<typeof insertWorkPatternSchema>;
export type RecurringPattern = typeof recurringPatterns.$inferSelect;
export type InsertRecurringPattern = z.infer<typeof insertRecurringPatternSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
