import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taxApi, type TaxSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ChatInterface from "@/components/chat-interface";
import Sidebar from "@/components/sidebar";
import SummaryPanel from "@/components/summary-panel";
import { Brain, Plus, History } from "lucide-react";

export default function Home() {
  const [currentSession, setCurrentSession] = useState<TaxSession | null>(null);
  const [jurisdiction, setJurisdiction] = useState<'us' | 'in'>('us');
  const [currency, setCurrency] = useState<'usd' | 'inr'>('usd');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/sessions'],
    staleTime: 30000,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: { title: string; jurisdiction: 'us' | 'in'; currency: 'usd' | 'inr' }) =>
      taxApi.createSession(data),
    onSuccess: (response) => {
      setCurrentSession(response.session);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: "New Session Created",
        description: "Your tax thinking session has been started.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      taxApi.updateSession(id, updates),
    onSuccess: (updatedSession) => {
      setCurrentSession(updatedSession);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    },
  });

  // Sync jurisdiction and currency changes
  useEffect(() => {
    if (jurisdiction === 'us' && currency === 'inr') {
      setCurrency('usd');
    } else if (jurisdiction === 'in' && currency === 'usd') {
      setCurrency('inr');
    }
  }, [jurisdiction, currency]);

  // Update current session when jurisdiction/currency changes
  useEffect(() => {
    if (currentSession && (currentSession.jurisdiction !== jurisdiction || currentSession.currency !== currency)) {
      updateSessionMutation.mutate({
        id: currentSession.id,
        updates: { jurisdiction, currency }
      });
    }
  }, [jurisdiction, currency, currentSession]);

  const handleNewSession = () => {
    const title = `Tax Planning Session - ${new Date().toLocaleDateString()}`;
    createSessionMutation.mutate({ title, jurisdiction, currency });
  };

  const handleSessionSelect = (session: TaxSession) => {
    setCurrentSession(session);
    setJurisdiction(session.jurisdiction);
    setCurrency(session.currency);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TaxThink AI</h1>
                <p className="text-xs text-secondary">AI Thinking Companion</p>
              </div>
            </div>

            {/* Jurisdiction & Currency Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Jurisdiction:</label>
                <Select value={jurisdiction} onValueChange={(value: 'us' | 'in') => setJurisdiction(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="in">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Currency:</label>
                <Select value={currency} onValueChange={(value: 'usd' | 'inr') => setCurrency(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="inr">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Session Controls */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-secondary hover:text-primary">
                <History size={16} className="mr-1" />
                History
              </Button>
              <Button onClick={handleNewSession} disabled={createSessionMutation.isPending}>
                <Plus size={16} className="mr-1" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <Sidebar 
          currentSession={currentSession}
          sessions={sessions}
          onSessionSelect={handleSessionSelect}
        />

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col">
          {currentSession ? (
            <ChatInterface 
              session={currentSession}
              jurisdiction={jurisdiction}
              currency={currency}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to TaxThink AI
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create a new session to start your structured tax thinking journey
                </p>
                <Button onClick={handleNewSession} disabled={createSessionMutation.isPending}>
                  <Plus size={16} className="mr-1" />
                  Start New Session
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Panel */}
        {currentSession && (
          <SummaryPanel session={currentSession} />
        )}
      </div>
    </div>
  );
}
