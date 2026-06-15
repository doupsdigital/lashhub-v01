import { useAuth } from '../contexts/AuthContext';

export function useSubscription() {
  const { profile, plano, statusAssinatura, loading } = useAuth();

  const isPremium = plano === 'premium';
  const isBasico = plano === 'basico';

  const hasFeature = (feature: 'scheduling' | 'crm' | 'dashboard'): boolean => {
    if (loading || !profile) return false;
    
    switch (feature) {
      case 'crm':
      case 'dashboard':
        return true; // Ambos os planos têm acesso
      case 'scheduling':
        return isPremium; // Apenas plano Premium
      default:
        return false;
    }
  };

  const isSubscriptionActive = (): boolean => {
    if (!profile) return false;
    return statusAssinatura === 'trial' || statusAssinatura === 'ativo';
  };

  return {
    hasFeature,
    isPremium,
    isBasico,
    isSubscriptionActive,
    plano,
    status: statusAssinatura,
    loading
  };
}
