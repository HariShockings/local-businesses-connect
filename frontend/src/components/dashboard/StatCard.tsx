import { ArrowUp, ArrowDown, DivideIcon as LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  stat: {
    id: number;
    name: string;
    value: string;
    change: string;
    isIncrease: boolean;
    icon: LucideIcon;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'accent';
  };
}

export default function StatCard({ stat }: StatCardProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
      secondary: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
      success: 'bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400',
      warning: 'bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
      error: 'bg-error-50 text-error-600 dark:bg-error-900/30 dark:text-error-400',
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
    };
    return colorMap[color as keyof typeof colorMap];
  };

  return (
    <div className="card p-5 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-opacity-20 shadow-sm bg-primary-100 dark:bg-primary-900/40">
          <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          stat.isIncrease 
            ? 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400' 
            : 'bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-400'
        }`}>
          {stat.isIncrease ? (
            <ArrowUp className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDown className="h-3 w-3 mr-1" />
          )}
          {stat.change}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
      <motion.p 
        className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {stat.value}
      </motion.p>
    </div>
  );
}