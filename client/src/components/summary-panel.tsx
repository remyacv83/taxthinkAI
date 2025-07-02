import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { taxApi, type TaxSession } from "@/lib/api";
import { Lightbulb, CheckSquare, Calculator, Download, Share, InfoIcon } from "lucide-react";

interface SummaryPanelProps {
  session: TaxSession;
}

export default function SummaryPanel({ session }: SummaryPanelProps) {
  // Query for session data
  const { data: sessionData = [] } = useQuery({
    queryKey: ['/api/sessions', session.id, 'data'],
    queryFn: () => taxApi.getSessionData(session.id),
  });

  // Extract insights and action items from the latest messages
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/sessions', session.id, 'messages'],
    queryFn: () => taxApi.getMessages(session.id),
  });

  const getLatestInsights = () => {
    const assistantMessages = messages.filter(m => m.role === 'assistant' && m.metadata);
    const latestMessage = assistantMessages[assistantMessages.length - 1];
    return latestMessage?.metadata?.keyInsights || [];
  };

  const getLatestActions = () => {
    const assistantMessages = messages.filter(m => m.role === 'assistant' && m.metadata);
    const latestMessage = assistantMessages[assistantMessages.length - 1];
    return latestMessage?.metadata?.actionItems || [];
  };

  const keyInsights = getLatestInsights();
  const actionItems = getLatestActions();

  const formatCurrency = (amount: number) => {
    return session.currency === 'usd' 
      ? `$${amount.toLocaleString()}`
      : `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h2>
        
        {/* Key Insights */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <Lightbulb className="text-primary mr-2" size={16} />
            <h3 className="text-sm font-semibold text-gray-900">Key Insights</h3>
          </div>
          {keyInsights.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-2">
              {keyInsights.slice(0, 3).map((insight: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Badge 
                    variant="secondary" 
                    className="w-4 h-4 rounded-full p-0 flex items-center justify-center text-xs mr-2 mt-0.5"
                  >
                    ✓
                  </Badge>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Start chatting to see insights appear here</p>
          )}
        </div>

        {/* Action Items */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <CheckSquare className="text-secondary mr-2" size={16} />
            <h3 className="text-sm font-semibold text-gray-900">Next Actions</h3>
          </div>
          {actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.slice(0, 3).map((action: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <Checkbox className="mt-1" />
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Action items will appear as we discuss your tax situation</p>
          )}
        </div>

        {/* Tax Estimates */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <Calculator className="text-yellow-600 mr-2" size={16} />
            <h3 className="text-sm font-semibold text-gray-900">Tax Estimates</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Session:</span>
              <span className="font-medium text-gray-900">
                {session.jurisdiction === 'us' ? 'US' : 'IN'} Context
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Currency:</span>
              <span className="font-medium text-gray-900">
                {session.currency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <Badge variant="outline" className="text-xs">
                {session.status}
              </Badge>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-yellow-200">
            <p className="text-xs text-gray-500 flex items-start">
              <InfoIcon size={12} className="mr-1 mt-0.5 flex-shrink-0" />
              Estimates will appear as we gather more information about your tax situation
            </p>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <Button className="w-full" variant="default">
            <Download className="mr-2" size={16} />
            Export Summary
          </Button>
          <Button className="w-full" variant="outline">
            <Share className="mr-2" size={16} />
            Share Session
          </Button>
        </div>
      </div>
    </div>
  );
}
