// frontend/src/components/dashboard/TopInsights.tsx

import React from 'react';

interface Insight {
  title: string;
  value: string;
  description: string;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

interface Props {
  insights: Insight[];
}

export const TopInsights: React.FC<Props> = ({ insights }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <h2 className="text-xl font-bold mb-4">
        Top Insights
      </h2>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`${insight.color} rounded-lg p-4 border-2 border-gray-200`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-3xl">{insight.icon}</span>
              <span className={`text-xl ${getTrendColor(insight.trend)}`}>
                {getTrendIcon(insight.trend)}
              </span>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-1 text-sm">
              {insight.title}
            </h3>
            
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {insight.value}
            </p>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      {/* Footer con fecha de actualización */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Actualizado: {new Date().toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};