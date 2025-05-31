import { User, ShoppingCart, CreditCard, FileText } from 'lucide-react';

const activities = [
  {
    id: 1,
    user: 'John Doe',
    action: 'created a new account',
    time: '3 minutes ago',
    icon: User,
    color: 'primary',
  },
  {
    id: 2,
    user: 'Sarah Smith',
    action: 'purchased Premium Plan',
    time: '2 hours ago',
    icon: CreditCard,
    color: 'success',
  },
  {
    id: 3,
    user: 'Mike Johnson',
    action: 'added 3 items to cart',
    time: '4 hours ago',
    icon: ShoppingCart,
    color: 'warning',
  },
  {
    id: 4,
    user: 'Emily Wilson',
    action: 'submitted a report',
    time: '1 day ago',
    icon: FileText,
    color: 'secondary',
  },
];

export default function RecentActivities() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center bg-${activity.color}-100 dark:bg-${activity.color}-900/30`}>
            <activity.icon className={`h-4 w-4 text-${activity.color}-600 dark:text-${activity.color}-400`} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.user} <span className="font-normal text-gray-600 dark:text-gray-300">{activity.action}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
          </div>
        </div>
      ))}
      
      <div className="pt-2">
        <button className="w-full py-2 text-xs font-medium text-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
          Load More
        </button>
      </div>
    </div>
  );
}