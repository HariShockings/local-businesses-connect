import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Settings, User, HelpCircle, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  closeSidebar: () => void;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Analytics', icon: BarChart2, href: '/analytics' },
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Profile', icon: User, href: '/profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex flex-shrink-0 items-center px-4 h-16 border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center" onClick={closeSidebar}>
          <BarChart className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Insight</span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                />
                {item.name}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-0 w-1 h-8 bg-primary-600 dark:bg-primary-400 rounded-l-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="mx-2 mb-4 mt-auto">
          <div className="card p-4 bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
            <div className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium">Need Help?</span>
            </div>
            <p className="mt-2 text-xs text-primary-700 dark:text-primary-300">
              Check our documentation for help with features and troubleshooting.
            </p>
            <button 
              className="mt-3 w-full btn bg-primary-600 hover:bg-primary-700 text-white text-xs py-1"
              onClick={closeSidebar}
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}