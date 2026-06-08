import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  Tag, 
  Calendar, 
  UserRound, 
  Settings, 
  List, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  // Persistence of sidebar state
  useEffect(() => {
    localStorage.setItem('rosae-sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Serviços', path: '/servicos', icon: Tag },
    { name: 'Agendamentos', path: '/agendamentos', icon: Calendar },
    { name: 'Profissionais', path: '/profissionais', icon: UserRound },
  ];

  const systemItems = [
    { name: 'Usuários', path: '/usuarios', icon: Settings },
    { name: 'Logs', path: '/logs', icon: List },
  ];

  const renderNavItems = (items: typeof menuItems) => {
    return items.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
            ${isActive 
              ? 'bg-rose-600 text-white font-medium' 
              : 'text-text-secondary hover:bg-rose-50 hover:text-rose-600'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? item.name : undefined}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105`} />
          {!collapsed && <span className="text-sm font-sans">{item.name}</span>}
        </NavLink>
      );
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 bg-white border-r border-border z-50 flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[64px]' : 'w-[220px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Header / Logo */}
        <div>
          <div className={`h-[60px] border-b border-border flex items-center px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-title font-semibold text-lg flex-shrink-0">
                R
              </div>
              {!collapsed && (
                <span className="font-title font-semibold text-xl text-text-primary tracking-wide whitespace-nowrap">
                  Rosaê Clinic
                </span>
              )}
            </div>

            {/* Desktop Collapse Button */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex absolute -right-3 top-[18px] w-6 h-6 rounded-full border border-border bg-white text-text-secondary hover:text-rose-600 items-center justify-center shadow-sm hover:scale-105 transition-all cursor-pointer z-50"
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-6">
            {/* MENU SECTION */}
            <div className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                  Menu
                </p>
              )}
              <div className="space-y-1">
                {renderNavItems(menuItems)}
              </div>
            </div>

            {/* SYSTEM SECTION */}
            <div className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                  Sistema
                </p>
              )}
              <div className="space-y-1">
                {renderNavItems(systemItems)}
              </div>
            </div>
          </nav>
        </div>

        {/* Footer: Logged in User Card */}
        <div className="p-3 border-t border-border bg-rose-50/30">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-semibold text-sm flex-shrink-0">
              AD
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">Administradora</p>
                <p className="text-[10px] text-text-secondary truncate">rosae@clinic.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
