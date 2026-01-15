import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Plan } from '../types';
import { Crown, Check, Zap } from 'lucide-react';

export function Plans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.type === 'FREE') {
      return;
    }
    navigate('/payment', { state: { plan } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-xl text-gray-600">
            Baixe vídeos da Shopee de forma rápida e fácil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.type === 'PREMIUM' && plan.billingCycle === 'yearly'
                  ? 'ring-2 ring-orange-500 relative'
                  : ''
              }`}
            >
              {plan.type === 'PREMIUM' && plan.billingCycle === 'yearly' && (
                <div className="bg-orange-500 text-white text-center py-2 text-sm font-medium">
                  Mais Popular
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.type === 'PREMIUM' && (
                    <Crown className="h-8 w-8 text-yellow-500" />
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    {plan.billingCycle && (
                      <span className="text-gray-600 ml-2">
                        /{plan.billingCycle === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    )}
                  </div>
                  {plan.savings && (
                    <p className="text-sm text-green-600 font-medium mt-1">{plan.savings}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.type === 'FREE' || user?.planType === 'PREMIUM'}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.type === 'FREE' || user?.planType === 'PREMIUM'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : plan.type === 'PREMIUM' && plan.billingCycle === 'yearly'
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {user?.planType === 'PREMIUM'
                    ? 'Plano Atual'
                    : plan.type === 'FREE'
                    ? 'Plano Gratuito'
                    : 'Assinar Agora'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Por que escolher o Premium?</h3>
              <ul className="space-y-2 text-orange-100">
                <li className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Downloads ilimitados sem restrições diárias</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Velocidade de download prioritária</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Histórico completo de todos os seus downloads</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </div>
            <Crown className="h-32 w-32 text-orange-300 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
