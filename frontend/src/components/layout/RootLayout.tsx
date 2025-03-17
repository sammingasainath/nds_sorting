import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';

const navItems = [
  {
    path: '/',
    label: 'Home'
  },
  {
    path: '/explore',
    label: 'College Explorer'
  },
  {
    path: '/compare',
    label: 'Compare'
  },
  {
    path: '/about',
    label: 'About UCHIT'
  },
  {
    path: '/history',
    label: 'Sorting History'
  }
];

export const RootLayout = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Made smaller on mobile */}
            <motion.div
              className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-relaxed py-0.5"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Link to="/" className="leading-relaxed inline-block">U.C.H.I.T. (उचित)</Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    path === location.pathname
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, duration: 0.2 }}
                    style={{ display: 'inline-block', width: '100%' }}
                  >
                    {label}
                  </motion.span>
                </Link>
              ))}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9" // Made button smaller
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9"> {/* Made button smaller */}
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      Navigate through U.C.H.I.T.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col py-2">
                    {navItems.map(({ path, label }) => (
                      <Button
                        key={path}
                        variant={path === location.pathname ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start rounded-none px-4 py-6 text-base font-medium",
                          path === location.pathname && "bg-primary/10"
                        )}
                        onClick={() => handleNavigation(path)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <motion.footer
        className="border-t py-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between items-center">
            <p className="text-sm text-muted-foreground leading-relaxed text-center md:text-left">
              © 2024 UCHIT (उचित). All rights reserved.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </Link>
              <a
                href="mailto:sammingasainathrao@gmail.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                sammingasainathrao@gmail.com
              </a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}; 