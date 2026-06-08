import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Header({ setMobileOpen }: HeaderProps) {
  const location = useLocation();

  // Map route to page titles
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/clientes':
        return 'Clientes';
      case '/servicos':
        return 'Serviços';
      case '/profissionais':
        return 'Profissionais';
      case '/agendamentos':
        return 'Agendamentos';
      case '/usuarios':
        return 'Usuários';
      case '/logs':
        return 'Logs de Atividade';
      default:
        // Handle nested paths (e.g. /clientes/:id)
        if (pathname.startsWith('/clientes/')) return 'Perfil do Cliente';
        return 'Rosaê Clinic';
    }
  };

  return (
    <header className="h-[60px] bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-text-secondary hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h1 className="font-title font-semibold text-2xl text-text-primary">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* User Info / Profile */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-text-primary">Dra. Amanda Rosa</p>
          <p className="text-xs text-text-secondary">Dona / Administradora</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-200 text-rose-800 flex items-center justify-center font-semibold text-sm">
          AR
        </div>
      </div>
    </header>
  );
}
