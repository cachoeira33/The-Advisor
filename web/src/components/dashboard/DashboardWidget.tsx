import React from 'react';
import { motion } from 'framer-motion';
import { X, Move } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  minW?: number;
  minH?: number;
  defaultW?: number;
  defaultH?: number;
}

interface DashboardWidgetProps {
  widget: WidgetConfig;
  isEditMode: boolean;
  onRemove?: (widgetId: string) => void;
  children: React.ReactNode;
}

export function DashboardWidget({ 
  widget, 
  isEditMode, 
  onRemove, 
  children 
}: DashboardWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative h-full"
    >
      <Card className="h-full relative overflow-hidden">
        {isEditMode && (
          <div className="absolute top-2 right-2 z-10 flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 bg-white shadow-sm"
              title="Drag to move"
            >
              <Move className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 bg-white shadow-sm text-red-600 hover:text-red-700"
              onClick={() => onRemove?.(widget.id)}
              title="Remove widget"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        <div className={`h-full ${isEditMode ? 'pr-16' : ''}`}>
          {children}
        </div>
      </Card>
    </motion.div>
  );
}