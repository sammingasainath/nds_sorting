import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, Compare, History, Settings, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'College Explorer', path: '/explore' },
    { icon: Compare, label: 'Compare', path: '/compare' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'U.C.H.I.T.';
    if (path === '/explore') return 'College Explorer';
    if (path === '/compare') return 'Compare';
    if (path === '/history') return 'History';
    if (path === '/settings') return 'Settings';
    return 'U.C.H.I.T.';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur z-50 flex items-center px-4">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 -ml-2 hover:bg-accent rounded-full"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-center">
          {getPageTitle()}
        </h1>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 -mr-2 hover:bg-accent rounded-full"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>
      </header>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-background z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-semibold">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-accent rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-4 hover:bg-accent/50 transition-colors",
                        isActive && "bg-accent"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-base">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur z-40">
        <div className="grid grid-cols-5 h-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 hover:bg-accent/50 transition-colors",
                  isActive && "text-primary"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}; 