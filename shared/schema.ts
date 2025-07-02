import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const taxSessions = pgTable("tax_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  jurisdiction: text("jurisdiction").notNull().default("us"), // 'us' or 'in'
  currency: text("currency").notNull().default("usd"), // 'usd' or 'inr'
  status: text("status").notNull().default("active"), // 'active', 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => taxSessions.id).notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For storing structured data like question templates, categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionData = pgTable("session_data", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => taxSessions.id).notNull(),
  category: text("category").notNull(), // 'personal_income', 'deductions', 'business', 'compliance'
  dataKey: text("data_key").notNull(),
  dataValue: jsonb("data_value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaxSessionSchema = createInsertSchema(taxSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertSessionDataSchema = createInsertSchema(sessionData).omit({
  id: true,
  updatedAt: true,
});

export type TaxSession = typeof taxSessions.$inferSelect;
export type InsertTaxSession = z.infer<typeof insertTaxSessionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type SessionData = typeof sessionData.$inferSelect;
export type InsertSessionData = z.infer<typeof insertSessionDataSchema>;
