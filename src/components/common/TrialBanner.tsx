import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, X } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

const DISMISS_KEY = 'trial-banner-dismissed-until';

export default function TrialBanner() {
  const navigate = useNavigate();
  const { status, trialEndsAt, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    const until = new Date();
    until.setHours(until.getHours() + 24);
    localStorage.setItem(DISMISS_KEY, until.toISOString());
    setDismissed(true);
  };

  if (loading || dismissed || status !== 'trial') return null;

  const daysLeft = trialEndsAt
    ? Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const expired = daysLeft !== null && daysLeft <= 0;

  // Cores por urgência
  const urgent = expired || (daysLeft !== null && daysLeft <= 3);
  const warning = !urgent && daysLeft !== null && daysLeft <= 7;

  const bgClass = urgent
    ? 'bg-red-600'
    : warning
    ? 'bg-amber-500'
    : 'bg-blue-600';

  const shortText = expired
    ? 'Trial encerrado'
    : daysLeft === 1
    ? 'Trial: 1 dia restante'
    : daysLeft !== null
    ? `Trial: ${daysLeft} dias restantes`
    : 'Período de testes ativo';

  const fullText = expired
    ? 'Seu período de testes encerrou. Escolha um plano para continuar usando o sistema.'
    : daysLeft === 1
    ? 'Seu período de testes termina amanhã. Assine agora e continue sem interrupções.'
    : daysLeft !== null
    ? `Seu período de testes termina em ${daysLeft} dias. Assine agora e continue sem interrupções.`
    : 'Você está no período de testes grátis. Assine um plano quando estiver pronto.';

  return (
    <div className={`${bgClass} px-3 md:px-6 py-2 flex items-center justify-between gap-2`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Calendar className="w-3.5 h-3.5 text-white flex-shrink-0" />
        <span className="md:hidden text-xs font-medium text-white truncate">
          {shortText}
        </span>
        <span className="hidden md:block text-xs font-medium text-white">
          {fullText}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => navigate('/assinatura')}
          className="bg-white/20 hover:bg-white/35 text-white text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap"
        >
          <span className="md:hidden">Assinar</span>
          <span className="hidden md:block">Assinar Agora →</span>
        </button>
        <button
          onClick={handleDismiss}
          title="Dispensar por 24h"
          className="text-white/70 hover:text-white transition-colors cursor-pointer p-1 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
