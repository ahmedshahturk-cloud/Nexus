import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Team', icon: Users, path: '/team', adminOnly: true },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed lg:relative z-40 w-72 h-full bg-dark-sidebar border-r border-dark-border flex flex-col"
          >
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Nexus</h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-text-secondary hover:bg-dark-card hover:text-text-primary'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-primary'}`} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-dark-border">
              <div className="bg-dark-card rounded-2xl p-4 flex items-center gap-3 mb-4 border border-dark-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
                  <p className="text-xs text-text-secondary truncate capitalize">{user?.role}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={logout}
                className="w-full justify-start gap-3 text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-20 bg-dark/50 backdrop-blur-md border-b border-dark-border flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-text-secondary hover:text-text-primary"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="hidden md:flex items-center bg-dark-card border border-dark-border rounded-xl px-3 py-1.5 w-80">
              <Search className="w-4 h-4 text-text-secondary mr-2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none focus:outline-none text-sm text-text-primary w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_#00D9FF]"></span>
            </Button>
            <div className="h-10 w-px bg-dark-border mx-2"></div>
            <div className="flex items-center gap-3">
              <p className="hidden sm:block text-sm font-medium text-text-primary">{user?.name}</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg shadow-primary/20">
                <div className="w-full h-full rounded-[10px] bg-dark flex items-center justify-center font-bold text-primary">
                  {user?.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
