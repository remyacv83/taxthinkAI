import { apiRequest } from './queryClient';

export interface TaxSession {
  id: number;
  title: string;
  jurisdiction: 'us' | 'in';
  currency: 'usd' | 'inr';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  sessionId: number;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  createdAt: string;
}

export interface CreateSessionRequest {
  title: string;
  jurisdiction: 'us' | 'in';
  currency: 'usd' | 'inr';
}

export interface SendMessageRequest {
  content: string;
}

export const taxApi = {
  // Sessions
  createSession: async (data: CreateSessionRequest) => {
    const response = await apiRequest('POST', '/api/sessions', data);
    return response.json();
  },

  getSessions: async (): Promise<TaxSession[]> => {
    const response = await apiRequest('GET', '/api/sessions');
    return response.json();
  },

  getSession: async (id: number): Promise<TaxSession> => {
    const response = await apiRequest('GET', `/api/sessions/${id}`);
    return response.json();
  },

  updateSession: async (id: number, updates: Partial<CreateSessionRequest>) => {
    const response = await apiRequest('PATCH', `/api/sessions/${id}`, updates);
    return response.json();
  },

  // Messages
  getMessages: async (sessionId: number): Promise<Message[]> => {
    const response = await apiRequest('GET', `/api/sessions/${sessionId}/messages`);
    return response.json();
  },

  sendMessage: async (sessionId: number, data: SendMessageRequest) => {
    const response = await apiRequest('POST', `/api/sessions/${sessionId}/messages`, data);
    return response.json();
  },

  // Session Data
  storeSessionData: async (sessionId: number, data: {
    category: string;
    dataKey: string;
    dataValue: any;
  }) => {
    const response = await apiRequest('POST', `/api/sessions/${sessionId}/data`, data);
    return response.json();
  },

  getSessionData: async (sessionId: number, category?: string) => {
    const url = category 
      ? `/api/sessions/${sessionId}/data/${category}`
      : `/api/sessions/${sessionId}/data`;
    const response = await apiRequest('GET', url);
    return response.json();
  },
};
