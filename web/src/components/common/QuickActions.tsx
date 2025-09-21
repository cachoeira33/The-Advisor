import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Download, Calculator, TrendingUp, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export function QuickActions({ actions, title = "Quick Actions" }: QuickActionsProps) {
  return (
    <Card className="p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            <Button
              variant={action.variant || 'outline'}
              className="w-full h-auto p-4 flex flex-col items-center space-y-2"
              onClick={action.onClick}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

export const commonQuickActions: QuickAction[] = [
  {
    label: 'Add Transaction',
    icon: Plus,
    onClick: () => console.log('Add transaction'),
    variant: 'primary',
  },
  {
    label: 'Import Data',
    icon: Upload,
    onClick: () => console.log('Import data'),
  },
  {
    label: 'Export Report',
    icon: Download,
    onClick: () => console.log('Export report'),
  },
  {
    label: 'Run Forecast',
    icon: TrendingUp,
    onClick: () => console.log('Run forecast'),
  },
  {
    label: 'Calculate Budget',
    icon: Calculator,
    onClick: () => console.log('Calculate budget'),
  },
  {
    label: 'Generate Report',
    icon: FileText,
    onClick: () => console.log('Generate report'),
  },
];