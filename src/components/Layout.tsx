import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Database, 
  Settings, 
  LogOut,
  PlusCircle,
  Search,
  Bell,
  Menu,
  X,
  Stethoscope,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../App';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'receptionist', 'accountant', 'doctor', 'owner'] },
    { id: 'patients', label: 'Patients', icon: Users, roles: ['admin', 'receptionist', 'doctor', 'owner'] },
    { id: 'staff', label: 'Staff Management', icon: Briefcase, roles: ['owner'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'accountant', 'owner'] },
    { id: 'invoices', label: 'Invoices', icon: FileText, roles: ['admin', 'accountant', 'owner'] },
    { id: 'backup', label: 'Backup Center', icon: Database, roles: ['admin', 'owner'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'owner'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(profile?.role || ''));

  return (
    <div className="w-64 bg-surface border-r border-outline-variant flex flex-col h-screen sticky top-0 dark:bg-surface-container">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary">
          <Stethoscope size={24} />
        </div>
        <span className="font-bold text-xl text-on-surface tracking-tight">S Dental</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === item.id 
                ? "bg-primary-container text-on-primary-container shadow-sm" 
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container font-bold text-xs">
            {profile?.displayName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{profile?.displayName}</p>
            <p className="text-xs text-on-surface-variant capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error-container transition-all"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export const Header: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-8 sticky top-0 z-10 dark:bg-surface-container">
      <h1 className="text-xl font-bold text-on-surface">{title}</h1>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="Search patients, invoices..." 
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary transition-all text-on-surface"
          />
        </div>
        <button className="p-2 text-on-surface-variant hover:text-on-surface relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>
      </div>
    </header>
  );
};
