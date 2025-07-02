import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type TaxSession } from "@/lib/api";
import { Clock, Folder, HelpCircle, TrendingUp } from "lucide-react";

interface SidebarProps {
  currentSession: TaxSession | null;
  sessions: TaxSession[];
  onSessionSelect: (session: TaxSession) => void;
}

export default function Sidebar({ currentSession, sessions, onSessionSelect }: SidebarProps) {
  const categories = [
    { name: "Personal Income", count: 3, color: "bg-green-500" },
    { name: "Deductions", count: 0, color: "bg-gray-400" },
    { name: "Business Expenses", count: 0, color: "bg-gray-400" },
    { name: "Compliance", count: 1, color: "bg-yellow-500" },
  ];

  const questionTemplates = [
    "Income Assessment",
    "Deduction Planning", 
    "Compliance Review",
    "Tax Optimization",
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Structured Thinking Framework
        </h2>
        
        {/* Current Session Info */}
        {currentSession && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-primary">Current Session</h3>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-800 border-green-200">
                Active
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-2">{currentSession.title}</p>
            <div className="text-xs text-secondary flex items-center">
              <Clock size={12} className="mr-1" />
              Started {formatTimeAgo(currentSession.createdAt)}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {sessions.length > 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Sessions</h3>
            <div className="space-y-2">
              {sessions.slice(0, 3).map((session) => (
                <Button
                  key={session.id}
                  variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left p-2 h-auto"
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(session.updatedAt)}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Tax Categories */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Tax Categories</h3>
              <Folder className="text-secondary" size={16} />
            </div>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{category.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-white text-xs ${category.color}`}
                  >
                    {category.count} items
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Question Templates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Question Templates</h3>
              <HelpCircle className="text-secondary" size={16} />
            </div>
            <div className="space-y-2">
              {questionTemplates.map((template) => (
                <Button
                  key={template}
                  variant="ghost"
                  className="w-full justify-start text-sm text-gray-700 hover:text-primary hover:bg-blue-50 p-2 h-auto"
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
              <TrendingUp className="text-secondary" size={16} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Information Gathering</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Analysis</span>
                  <span>40%</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Recommendations</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
