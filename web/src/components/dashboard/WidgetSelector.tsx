import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar,
  CreditCard,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { WidgetConfig } from './DashboardWidget';

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: WidgetConfig) => void;
}

export function WidgetSelector({ isOpen, onClose, onAddWidget }: WidgetSelectorProps) {
  const availableWidgets: Omit<WidgetConfig, 'id'>[] = [
    {
      type: 'metric',
      title: 'Revenue Card',
      component: () => null,
      defaultW: 3,
      defaultH: 2,
      minW: 2,
      minH: 2,
    },
    {
      type: 'metric',
      title: 'Expenses Card',
      component: () => null,
      defaultW: 3,
      defaultH: 2,
      minW: 2,
      minH: 2,
    },
    {
      type: 'metric',
      title: 'Profit Card',
      component: () => null,
      defaultW: 3,
      defaultH: 2,
      minW: 2,
      minH: 2,
    },
    {
      type: 'chart',
      title: 'Balance Evolution',
      component: () => null,
      defaultW: 6,
      defaultH: 4,
      minW: 4,
      minH: 3,
    },
    {
      type: 'chart',
      title: 'Revenue vs Expenses',
      component: () => null,
      defaultW: 6,
      defaultH: 4,
      minW: 4,
      minH: 3,
    },
    {
      type: 'chart',
      title: 'Expenses by Category',
      component: () => null,
      defaultW: 4,
      defaultH: 4,
      minW: 3,
      minH: 3,
    },
    {
      type: 'table',
      title: 'Recent Transactions',
      component: () => null,
      defaultW: 8,
      defaultH: 6,
      minW: 6,
      minH: 4,
    },
    {
      type: 'list',
      title: 'Upcoming Bills',
      component: () => null,
      defaultW: 4,
      defaultH: 6,
      minW: 3,
      minH: 4,
    },
  ];

  const getWidgetIcon = (type: string, title: string) => {
    if (title.includes('Revenue') || title.includes('Profit')) return DollarSign;
    if (title.includes('Balance') || title.includes('Evolution')) return TrendingUp;
    if (title.includes('vs') || title.includes('Bar')) return BarChart3;
    if (title.includes('Category') || title.includes('Pie')) return PieChart;
    if (title.includes('Bills') || title.includes('Upcoming')) return Calendar;
    if (title.includes('Transactions')) return CreditCard;
    return BarChart3;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Widget</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableWidgets.map((widget, index) => {
                  const Icon = getWidgetIcon(widget.type, widget.title);
                  return (
                    <Card
                      key={index}
                      hover
                      className="p-4 cursor-pointer transition-all duration-200 hover:border-primary-300"
                      onClick={() => {
                        onAddWidget({
                          ...widget,
                          id: `widget-${Date.now()}-${index}`,
                        });
                        onClose();
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{widget.title}</h3>
                          <p className="text-sm text-gray-500 capitalize">{widget.type}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}