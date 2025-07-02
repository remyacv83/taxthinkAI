import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { taxThinkingService } from "./services/openai";
import { insertTaxSessionSchema, insertMessageSchema, insertSessionDataSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new tax session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertTaxSessionSchema.parse(req.body);
      const session = await storage.createTaxSession(sessionData);
      
      // Generate welcome message
      const welcomeResponse = await taxThinkingService.generateWelcomeMessage(
        session.jurisdiction as 'us' | 'in',
        session.currency as 'usd' | 'inr'
      );
      
      // Store welcome message
      await storage.createMessage({
        sessionId: session.id,
        role: "assistant",
        content: welcomeResponse.content,
        metadata: {
          thinkingMode: welcomeResponse.thinkingMode,
          categories: welcomeResponse.categories,
          actionItems: welcomeResponse.actionItems,
          keyInsights: welcomeResponse.keyInsights,
        }
      });

      res.json({ session, welcomeMessage: welcomeResponse });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ error: "Failed to create session" });
    }
  });

  // Get all sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllTaxSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get specific session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getTaxSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Update session (jurisdiction/currency)
  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateTaxSession(sessionId, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Get messages for a session
  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const messages = await storage.getMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/sessions/:id/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { content } = req.body;

      // Get session details
      const session = await storage.getTaxSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Store user message
      const userMessage = await storage.createMessage({
        sessionId,
        role: "user",
        content,
      });

      // Get conversation history
      const messages = await storage.getMessagesBySession(sessionId);
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Generate AI response
      const aiResponse = await taxThinkingService.generateResponse({
        jurisdiction: session.jurisdiction as 'us' | 'in',
        currency: session.currency as 'usd' | 'inr',
        userMessage: content,
        conversationHistory,
      });

      // Store AI response
      const assistantMessage = await storage.createMessage({
        sessionId,
        role: "assistant",
        content: aiResponse.content,
        metadata: {
          thinkingMode: aiResponse.thinkingMode,
          categories: aiResponse.categories,
          actionItems: aiResponse.actionItems,
          keyInsights: aiResponse.keyInsights,
          nextQuestions: aiResponse.nextQuestions,
        }
      });

      // Update session timestamp
      await storage.updateTaxSession(sessionId, { updatedAt: new Date() });

      res.json({
        userMessage,
        assistantMessage,
        aiResponse,
      });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Store session data (key insights, action items, etc.)
  app.post("/api/sessions/:id/data", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const data = insertSessionDataSchema.parse({
        ...req.body,
        sessionId,
      });
      
      const sessionData = await storage.createOrUpdateSessionData(data);
      res.json(sessionData);
    } catch (error) {
      console.error("Error storing session data:", error);
      res.status(400).json({ error: "Failed to store session data" });
    }
  });

  // Get session data by category
  app.get("/api/sessions/:id/data/:category", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const category = req.params.category;
      const data = await storage.getSessionDataByCategory(sessionId, category);
      res.json(data);
    } catch (error) {
      console.error("Error fetching session data:", error);
      res.status(500).json({ error: "Failed to fetch session data" });
    }
  });

  // Get all session data
  app.get("/api/sessions/:id/data", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const data = await storage.getAllSessionData(sessionId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching session data:", error);
      res.status(500).json({ error: "Failed to fetch session data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
