import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = 'text-primary-600',
  loading = false
}: StatsCardProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card hover className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center animate-pulse">
              <div className="w-5 h-5 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <dd className="flex items-baseline">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </dd>
            </dl>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card hover className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor(change.trend)}`}>
                  {change.value}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </Card>
  );
}