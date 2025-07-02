import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taxApi, type TaxSession, type Message } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, User, Send, Paperclip, Mic, Circle } from "lucide-react";

interface ChatInterfaceProps {
  session: TaxSession;
  jurisdiction: 'us' | 'in';
  currency: 'usd' | 'inr';
}

export default function ChatInterface({ session, jurisdiction, currency }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for messages
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/sessions', session.id, 'messages'],
    queryFn: () => taxApi.getMessages(session.id),
    staleTime: 0,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => taxApi.sendMessage(session.id, { content }),
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', session.id, 'messages'] });
      setMessage("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (msg: Message) => {
    if (msg.role === 'assistant' && msg.metadata) {
      const { thinkingMode, categories, actionItems, keyInsights } = msg.metadata;
      
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900">TaxThink AI</span>
            <span className="text-xs text-secondary">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
            {thinkingMode && (
              <Badge variant="secondary" className="text-xs">
                {thinkingMode}
              </Badge>
            )}
          </div>
          
          <div className="prose prose-sm max-w-none">
            {msg.content.split('\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 mb-3">{paragraph}</p>
            ))}
          </div>

          {/* Action Items */}
          {actionItems && actionItems.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Next Actions
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {actionItems.map((item: string, i: number) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Insights */}
          {keyInsights && keyInsights.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Key Insights
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {keyInsights.map((insight: string, i: number) => (
                  <li key={i}>• {insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-medium text-white">You</span>
          <span className="text-xs text-blue-100">
            {new Date(msg.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-white">{msg.content}</p>
      </div>
    );
  };

  const quickActions = [
    { label: "Home Office Deduction", icon: "🏠" },
    { label: "Vehicle Expenses", icon: "🚗" },
    { label: "Education Credits", icon: "🎓" },
    { label: "Retirement Planning", icon: "🏦" },
  ];

  return (
    <>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Tax Thinking Companion</h2>
            <p className="text-sm text-secondary">
              Ask me anything about your tax situation - I'll guide you through structured thinking
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              <Circle className="w-2 h-2 fill-current mr-1" />
              AI Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start space-x-3 ${
            msg.role === 'user' ? 'justify-end' : ''
          }`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={16} />
              </div>
            )}
            
            <div className={`flex-1 ${msg.role === 'user' ? 'max-w-3xl' : ''}`}>
              <div className={`rounded-lg shadow-sm p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary text-white ml-12' 
                  : 'bg-white border border-gray-200'
              }`}>
                {formatMessage(msg)}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-gray-600" size={16} />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white" size={16} />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-secondary">TaxThink AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={3}
                  className="border-0 resize-none focus:ring-0 focus:outline-none rounded-t-lg"
                  placeholder="Describe your tax situation or ask a specific question..."
                />
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm">
                      <Paperclip size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mic size={16} />
                    </Button>
                    <span className="text-xs text-secondary">
                      Press Enter to send, Shift+Enter for new line
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-secondary">
                      {jurisdiction.toUpperCase()} Tax Context
                    </span>
                    <Button 
                      onClick={handleSend}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                    >
                      <Send size={16} className="mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center space-x-2 mt-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setMessage(action.label)}
              >
                <span className="mr-1">{action.icon}</span>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
