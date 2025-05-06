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
  
  // Work Pattern Routes
  app.get("/api/work-patterns", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userId = req.user?.id;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (startDate && endDate) {
        const patterns = await storage.getUserWorkPatternsInRange(userId!, startDate, endDate);
        return res.json(patterns);
      } else {
        const patterns = await storage.getUserWorkPatterns(userId!);
        return res.json(patterns);
      }
    } catch (error) {
      console.error("Error fetching work patterns:", error);
      return res.status(500).json({ message: "Failed to fetch work patterns" });
    }
  });
  
  app.post("/api/work-patterns", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertWorkPatternSchema.parse({
        ...req.body,
        userId: req.user?.id
      });
      
      const newPattern = await storage.createWorkPattern(validatedData);
      return res.status(201).json(newPattern);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating work pattern:", error);
      return res.status(500).json({ message: "Failed to create work pattern" });
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
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const patterns = await storage.getWorkPatternsInRange(startDate, endDate);
      
      // Filter by location if specified
      const location = req.query.location as string | undefined;
      const filteredPatterns = location 
        ? patterns.filter(pattern => pattern.location === location)
        : patterns;
      
      return res.json(filteredPatterns);
    } catch (error) {
      console.error("Error fetching team work patterns:", error);
      return res.status(500).json({ message: "Failed to fetch team work patterns" });
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
