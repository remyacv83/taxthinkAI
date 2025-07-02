import { 
  taxSessions, 
  messages, 
  sessionData,
  type TaxSession, 
  type InsertTaxSession,
  type Message,
  type InsertMessage,
  type SessionData,
  type InsertSessionData
} from "@shared/schema";

export interface IStorage {
  // Tax Sessions
  createTaxSession(session: InsertTaxSession): Promise<TaxSession>;
  getTaxSession(id: number): Promise<TaxSession | undefined>;
  getAllTaxSessions(): Promise<TaxSession[]>;
  updateTaxSession(id: number, updates: Partial<InsertTaxSession>): Promise<TaxSession | undefined>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: number): Promise<Message[]>;
  
  // Session Data
  createOrUpdateSessionData(data: InsertSessionData): Promise<SessionData>;
  getSessionDataByCategory(sessionId: number, category: string): Promise<SessionData[]>;
  getAllSessionData(sessionId: number): Promise<SessionData[]>;
}

export class MemStorage implements IStorage {
  private taxSessions: Map<number, TaxSession>;
  private messages: Map<number, Message>;
  private sessionData: Map<number, SessionData>;
  private currentSessionId: number;
  private currentMessageId: number;
  private currentDataId: number;

  constructor() {
    this.taxSessions = new Map();
    this.messages = new Map();
    this.sessionData = new Map();
    this.currentSessionId = 1;
    this.currentMessageId = 1;
    this.currentDataId = 1;
  }

  async createTaxSession(insertSession: InsertTaxSession): Promise<TaxSession> {
    const id = this.currentSessionId++;
    const now = new Date();
    const session: TaxSession = {
      ...insertSession,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.taxSessions.set(id, session);
    return session;
  }

  async getTaxSession(id: number): Promise<TaxSession | undefined> {
    return this.taxSessions.get(id);
  }

  async getAllTaxSessions(): Promise<TaxSession[]> {
    return Array.from(this.taxSessions.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async updateTaxSession(id: number, updates: Partial<InsertTaxSession>): Promise<TaxSession | undefined> {
    const existingSession = this.taxSessions.get(id);
    if (!existingSession) return undefined;

    const updatedSession: TaxSession = {
      ...existingSession,
      ...updates,
      updatedAt: new Date(),
    };
    this.taxSessions.set(id, updatedSession);
    return updatedSession;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBySession(sessionId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createOrUpdateSessionData(data: InsertSessionData): Promise<SessionData> {
    // Check if data with same sessionId, category, and dataKey exists
    const existing = Array.from(this.sessionData.values()).find(
      item => item.sessionId === data.sessionId && 
              item.category === data.category && 
              item.dataKey === data.dataKey
    );

    if (existing) {
      const updated: SessionData = {
        ...existing,
        dataValue: data.dataValue,
        updatedAt: new Date(),
      };
      this.sessionData.set(existing.id, updated);
      return updated;
    }

    const id = this.currentDataId++;
    const newData: SessionData = {
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.sessionData.set(id, newData);
    return newData;
  }

  async getSessionDataByCategory(sessionId: number, category: string): Promise<SessionData[]> {
    return Array.from(this.sessionData.values()).filter(
      item => item.sessionId === sessionId && item.category === category
    );
  }

  async getAllSessionData(sessionId: number): Promise<SessionData[]> {
    return Array.from(this.sessionData.values()).filter(
      item => item.sessionId === sessionId
    );
  }
}

export const storage = new MemStorage();
