'use client';

import { Expert } from '@/types/chat';

interface ExpertPanelProps {
  experts: Expert[];
}

export default function ExpertPanel({ experts }: ExpertPanelProps) {
  const getExpertiseDisplayName = (expertise: string) => {
    const displayNames: Record<string, string> = {
      'devops': 'DevOps',
      'react_native': 'React Native',
      'frontend': 'Frontend',
      'backend': 'Backend',
      'ai_ml': 'AI/ML',
      'database': 'Database',
      'security': 'Security',
      'architecture': 'Architecture',
      'mobile': 'Mobile',
      'cloud': 'Cloud'
    };
    return displayNames[expertise] || expertise;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Available Experts</h2>
        <p className="text-sm text-gray-500 mt-1">
          {experts.length} experts ready to help
        </p>
      </div>

      {/* Experts list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {experts.map((expert) => (
          <div
            key={expert.id}
            className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0">
              <span className="text-2xl">{expert.avatar}</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center">
                <p 
                  className="text-sm font-medium truncate"
                  style={{ color: expert.color }}
                >
                  {expert.name}
                </p>
                <div 
                  className="ml-2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: expert.color }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {getExpertiseDisplayName(expert.expertise)} Specialist
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1">
            <li>• Ask any technical question</li>
            <li>• Relevant experts will respond</li>
            <li>• Complex questions get multiple expert views</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 