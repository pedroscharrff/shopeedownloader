import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Plan, CreatePaymentRequest, PaymentResponse } from '../types';
import { CreditCard, AlertCircle, CheckCircle, QrCode, Copy } from 'lucide-react';

export function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const plan = location.state?.plan as Plan;

  const [name, setName] = useState(user?.name || '');
  const [taxID, setTaxID] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);

  if (!plan || plan.type === 'FREE') {
    navigate('/plans');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanTaxID = taxID.replace(/\D/g, '');
      const cleanPhone = phone.replace(/\D/g, '');

      if (!cleanPhone.startsWith('55')) {
        throw new Error('Telefone deve começar com código do país 55');
      }

      const request: CreatePaymentRequest = {
        planType: 'PREMIUM',
        billingPeriod: plan.billingCycle || 'monthly',
        customerData: {
          name,
          taxID: cleanTaxID,
          email,
          phone: cleanPhone,
        },
      };

      const response = await api.post('/payments/create', request);
      setPaymentData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const formatTaxID = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('55')) {
      return numbers.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    }
    return numbers;
  };

  if (paymentData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pagamento Criado com Sucesso!
              </h2>
              <p className="text-gray-600">
                Escaneie o QR Code abaixo ou copie o código PIX para realizar o pagamento
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Plano</p>
                  <p className="text-lg font-bold text-gray-900">{plan.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {Number(paymentData.payment.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              {paymentData.qrCode.qrCodeImage && (
                <div className="inline-block bg-white p-4 rounded-xl shadow-sm mb-4">
                  <img
                    src={paymentData.qrCode.qrCodeImage}
                    alt="QR Code PIX"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              )}
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                <QrCode className="h-5 w-5" />
                <span className="text-sm">Escaneie com o app do seu banco</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código PIX Copia e Cola
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={paymentData.qrCode.brCode}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(paymentData.qrCode.brCode)}
                  className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>

            {paymentData.qrCode.paymentLinkUrl && (
              <div className="mb-6">
                <a
                  href={paymentData.qrCode.paymentLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Abrir Link de Pagamento
                </a>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Após realizar o pagamento, seu plano será ativado
                automaticamente em alguns instantes. Você receberá uma confirmação por email.
              </p>
            </div>

            <button
              onClick={() => {
                refreshUser();
                navigate('/');
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h2>
            <p className="text-gray-600">Complete seus dados para gerar o pagamento PIX</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Plano Selecionado</p>
                <p className="text-2xl font-bold">{plan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-orange-100 text-sm mb-1">Valor</p>
                <p className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="taxID" className="block text-sm font-medium text-gray-700 mb-2">
                CPF ou CNPJ
              </label>
              <input
                id="taxID"
                type="text"
                value={formatTaxID(taxID)}
                onChange={(e) => setTaxID(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone (com DDD)
              </label>
              <input
                id="phone"
                type="tel"
                value={formatPhone(phone)}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+55 (11) 99999-9999"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Formato: 55 + DDD + Número (ex: 5511999999999)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : 'Gerar Pagamento PIX'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
