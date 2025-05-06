import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertWorkPatternSchema, insertRecurringPatternSchema } from "@shared/schema";
import { z } from "zod";

// Helper to check if user is admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Not authorized" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API Routes
  
  // Team routes - Get all users
  app.get("/api/team", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const users = await storage.getAllUsers();
      
      // Return users without sensitive information
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      return res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching team users:", error);
      return res.status(500).json({ message: "Failed to fetch team users" });
    }
  });
  
  // Work Pattern Routes
  app.get("/api/work-patterns", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      let patterns = [];
      
      if (startDate && endDate) {
        // Get user work patterns for the date range
        patterns = await storage.getUserWorkPatternsInRange(userId!, startDate, endDate);
        
        // Get and add public holidays
        const { getQueenslandPublicHolidaysAsWorkPatterns, getQueenslandPublicHolidayName } = await import('./services/holidays');
        const publicHolidays = getQueenslandPublicHolidaysAsWorkPatterns(userId!, startDate, endDate);
        
        // Filter existing patterns that fall on public holidays (should be replaced with holiday)
        patterns = patterns.filter(pattern => {
          const patternDate = new Date(pattern.date);
          const holidayName = getQueenslandPublicHolidayName(patternDate);
          // Keep the pattern if it's not on a holiday or it's already marked as a public holiday
          return !holidayName || pattern.location === 'public_holiday';
        });
        
        // Add the public holidays
        patterns = [...patterns, ...publicHolidays];
      } else {
        patterns = await storage.getUserWorkPatterns(userId!);
        
        // Handle public holidays for the full set too
        const { getQueenslandPublicHolidayName } = await import('./services/holidays');
        
        // Filter out patterns that fall on public holidays
        patterns = patterns.filter(pattern => {
          const patternDate = new Date(pattern.date);
          const holidayName = getQueenslandPublicHolidayName(patternDate);
          return !holidayName || pattern.location === 'public_holiday';
        });
      }
      
      return res.json(patterns);
    } catch (error) {
      console.error("Error fetching work patterns:", error);
      return res.status(500).json({ message: "Failed to fetch work patterns" });
    }
  });
  
  app.post("/api/work-patterns", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      // Get the data from request body
      let data = { ...req.body };
      console.log("Original data received:", data);
      
      // Ensure date is properly converted to a Date object regardless of input format
      if (data.date) {
        // If it's already a Date object that was serialized as an object
        if (typeof data.date === 'object') {
          if (data.date instanceof Date) {
            console.log("Date is already a Date object");
          } else {
            console.log("Date is an object, converting to Date", data.date);
            data.date = new Date(data.date);
          }
        } 
        // If it's an ISO string
        else if (typeof data.date === 'string') {
          console.log("Date is a string, converting to Date:", data.date);
          data.date = new Date(data.date);
        }
      }
      
      console.log("Processed data after date conversion:", data);
      
      // Ensure the date is a proper Date object before validation
      if (data.date && !(data.date instanceof Date)) {
        console.error("Failed to convert to Date object:", data.date);
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // For debugging, check date validity
      if (data.date instanceof Date && isNaN(data.date.getTime())) {
        console.error("Date is invalid (NaN):", data.date);
        return res.status(400).json({ message: "Invalid date" });
      }
      
      const validatedData = insertWorkPatternSchema.parse({
        ...data,
        userId: req.user?.id
      });
      
      console.log("Validated data before saving:", validatedData);
      
      const newPattern = await storage.createWorkPattern(validatedData);
      console.log("New pattern created:", newPattern);
      return res.status(201).json(newPattern);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      console.error("Error creating work pattern:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ message: `Failed to create work pattern: ${errorMessage}` });
    }
  });
  
  app.put("/api/work-patterns/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const patternId = parseInt(req.params.id);
      const existingPattern = await storage.getWorkPattern(patternId);
      
      if (!existingPattern) {
        return res.status(404).json({ message: "Work pattern not found" });
      }
      
      if (existingPattern.userId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to update this pattern" });
      }
      
      const updatedPattern = await storage.updateWorkPattern(patternId, req.body);
      return res.json(updatedPattern);
    } catch (error) {
      console.error("Error updating work pattern:", error);
      return res.status(500).json({ message: "Failed to update work pattern" });
    }
  });
  
  app.delete("/api/work-patterns/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const patternId = parseInt(req.params.id);
      const existingPattern = await storage.getWorkPattern(patternId);
      
      if (!existingPattern) {
        return res.status(404).json({ message: "Work pattern not found" });
      }
      
      if (existingPattern.userId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to delete this pattern" });
      }
      
      const success = await storage.deleteWorkPattern(patternId);
      if (success) {
        return res.status(204).end();
      } else {
        return res.status(500).json({ message: "Failed to delete work pattern" });
      }
    } catch (error) {
      console.error("Error deleting work pattern:", error);
      return res.status(500).json({ message: "Failed to delete work pattern" });
    }
  });
  
  // Recurring Pattern Routes
  app.get("/api/recurring-patterns", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const patterns = await storage.getUserRecurringPatterns(userId!);
      return res.json(patterns);
    } catch (error) {
      console.error("Error fetching recurring patterns:", error);
      return res.status(500).json({ message: "Failed to fetch recurring patterns" });
    }
  });
  
  app.post("/api/recurring-patterns", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertRecurringPatternSchema.parse({
        ...req.body,
        userId: req.user?.id
      });
      
      const newPattern = await storage.createRecurringPattern(validatedData);
      return res.status(201).json(newPattern);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating recurring pattern:", error);
      return res.status(500).json({ message: "Failed to create recurring pattern" });
    }
  });
  
  app.put("/api/recurring-patterns/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const patternId = parseInt(req.params.id);
      const existingPattern = await storage.getRecurringPattern(patternId);
      
      if (!existingPattern) {
        return res.status(404).json({ message: "Recurring pattern not found" });
      }
      
      if (existingPattern.userId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to update this pattern" });
      }
      
      const updatedPattern = await storage.updateRecurringPattern(patternId, req.body);
      return res.json(updatedPattern);
    } catch (error) {
      console.error("Error updating recurring pattern:", error);
      return res.status(500).json({ message: "Failed to update recurring pattern" });
    }
  });
  
  app.delete("/api/recurring-patterns/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const patternId = parseInt(req.params.id);
      const existingPattern = await storage.getRecurringPattern(patternId);
      
      if (!existingPattern) {
        return res.status(404).json({ message: "Recurring pattern not found" });
      }
      
      if (existingPattern.userId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to delete this pattern" });
      }
      
      const success = await storage.deleteRecurringPattern(patternId);
      if (success) {
        return res.status(204).end();
      } else {
        return res.status(500).json({ message: "Failed to delete recurring pattern" });
      }
    } catch (error) {
      console.error("Error deleting recurring pattern:", error);
      return res.status(500).json({ message: "Failed to delete recurring pattern" });
    }
  });
  
  // Team Routes
  app.get("/api/team/work-patterns", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      // Use current month if dates not provided
      let startDate: Date, endDate: Date;
      
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate as string);
        endDate = new Date(req.query.endDate as string);
      } else {
        // Default to current month
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
      
      // Get work patterns for all users in this date range
      let patterns = await storage.getWorkPatternsInRange(startDate, endDate);
      
      // Get public holidays
      const { getQueenslandPublicHolidaysAsWorkPatterns } = await import('./services/holidays');
      // For team view, create system-wide holiday patterns with userId = 0
      const publicHolidays = getQueenslandPublicHolidaysAsWorkPatterns(0, startDate, endDate);
      patterns = [...patterns, ...publicHolidays];
      
      // Filter by location if specified
      const location = req.query.location as string | undefined;
      const filteredPatterns = location 
        ? patterns.filter(pattern => pattern.location === location)
        : patterns;
      
      // Add user details to each pattern
      const patternsWithUserInfo = await Promise.all(
        filteredPatterns.map(async (pattern) => {
          // For public holidays or system-generated patterns
          if (pattern.userId === 0) {
            return {
              ...pattern,
              user: {
                displayName: "Public Holiday",
                avatarUrl: null
              }
            };
          }
          
          // For regular user patterns
          const user = await storage.getUser(pattern.userId);
          return {
            ...pattern,
            user: user ? {
              displayName: user.displayName,
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      return res.json(patternsWithUserInfo);
    } catch (error) {
      console.error("Error fetching team work patterns:", error);
      return res.status(500).json({ message: "Failed to fetch team work patterns" });
    }
  });
  
  // User profile management
  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const { displayName, email, avatarUrl } = req.body;
      
      // Update only the fields that were provided
      const updateData: Record<string, any> = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (email !== undefined) updateData.email = email;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      
      // Update user in database
      const updatedUser = await storage.updateUser(userId!, updateData);
      
      // Update session user data
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        req.user = userWithoutPassword as any;
        return res.json(userWithoutPassword);
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Refresh Queensland public holidays
  app.post("/api/refresh-holidays", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const { getQueenslandPublicHolidaysAsWorkPatterns } = await import('./services/holidays');
      
      // Get the next 12 months worth of holidays
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      // Get existing work patterns for the user
      const existingPatterns = await storage.getUserWorkPatternsInRange(userId!, startDate, endDate);
      
      // Delete any existing public holidays
      const publicHolidayIds = existingPatterns
        .filter(pattern => pattern.location === 'public_holiday')
        .map(pattern => pattern.id);
      
      for (const id of publicHolidayIds) {
        await storage.deleteWorkPattern(id);
      }
      
      // Add the Queensland public holidays
      const holidays = getQueenslandPublicHolidaysAsWorkPatterns(userId!, startDate, endDate);
      
      for (const holiday of holidays) {
        await storage.createWorkPattern({
          userId: userId!,
          date: holiday.date,
          location: 'public_holiday',
          notes: holiday.notes
        });
      }
      
      return res.status(200).json({ 
        message: "Queensland public holidays refreshed successfully",
        count: holidays.length
      });
    } catch (error) {
      console.error("Error refreshing public holidays:", error);
      return res.status(500).json({ message: "Failed to refresh public holidays" });
    }
  });
  
  // User management (admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
