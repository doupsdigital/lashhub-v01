import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronDown, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordModal from '../common/ChangePasswordModal';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Header({ setMobileOpen }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const userEmail = profile?.email || user?.email || '';
  const userName = profile?.nome || 'Usuário';
  const userRole = userEmail === 'rosae@clinic.com' ? 'Dona / Administradora' : 'Colaborador(a)';
  const initials = userName
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase();

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

      {/* User Info & Dropdown Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 hover:bg-bg p-1.5 rounded-lg transition-colors cursor-pointer select-none"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary leading-tight">{userName}</p>
            <p className="text-[10px] text-text-secondary">{userRole}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-200 text-rose-800 flex items-center justify-center font-semibold text-sm">
            {initials}
          </div>
          <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Card */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-lg py-1.5 z-50 animate-fade-in">
            {/* Header info (Mobile view indicator) */}
            <div className="px-4 py-2 border-b border-border sm:hidden">
              <p className="text-sm font-semibold text-text-primary truncate">{userName}</p>
              <p className="text-[10px] text-text-secondary truncate">{userEmail}</p>
            </div>
            
            {/* Actions */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsChangePasswordOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-rose-50 hover:text-rose-600 transition-colors text-left cursor-pointer"
            >
              <Lock className="w-4 h-4 text-text-secondary" />
              Alterar Senha
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer border-t border-border mt-1"
            >
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </button>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </header>
  );
}
