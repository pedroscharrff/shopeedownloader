import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { PaymentHistory as PaymentHistoryType, UpcomingInvoice } from '../types';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Receipt,
  TrendingUp,
  QrCode,
  Copy,
  X,
  ExternalLink
} from 'lucide-react';

export function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
  const [upcomingInvoices, setUpcomingInvoices] = useState<UpcomingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'upcoming'>('history');
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryType | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, invoicesRes] = await Promise.all([
        api.get('/payments'),
        api.get('/payments/upcoming-invoices'),
      ]);

      setPayments(paymentsRes.data);
      setUpcomingInvoices(invoicesRes.data.upcomingInvoices || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const isPaymentExpired = (payment: PaymentHistoryType) => {
    if (payment.status === 'COMPLETED' || payment.status === 'FAILED') {
      return false;
    }
    if (payment.expiresAt) {
      return new Date(payment.expiresAt) < new Date();
    }
    return false;
  };

  const getPaymentStatus = (payment: PaymentHistoryType) => {
    if (payment.status === 'COMPLETED') {
      return { text: 'Pago', color: 'bg-green-100 text-green-800' };
    }
    if (isPaymentExpired(payment)) {
      return { text: 'Expirado', color: 'bg-gray-100 text-gray-800' };
    }
    if (payment.status === 'FAILED') {
      return { text: 'Falhou', color: 'bg-red-100 text-red-800' };
    }
    if (payment.status === 'PENDING') {
      return { text: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (payment.status === 'REFUNDED') {
      return { text: 'Reembolsado', color: 'bg-blue-100 text-blue-800' };
    }
    return { text: payment.status, color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código PIX copiado para a área de transferência!');
  };

  const openPaymentDetails = (payment: PaymentHistoryType) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamentos e Faturas</h1>
          <p className="text-gray-600">
            Acompanhe seu histórico de pagamentos e próximas faturas
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5" />
                  <span>Histórico de Pagamentos</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Próximas Faturas</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'history' ? (
              <div>
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum pagamento encontrado
                    </h3>
                    <p className="text-gray-600">
                      Você ainda não realizou nenhum pagamento
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 rounded-full p-3">
                              <CreditCard className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {payment.subscription
                                    ? `Plano ${payment.subscription.planType}`
                                    : 'Pagamento Avulso'}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    getPaymentStatus(payment).color
                                  }`}
                                >
                                  {getPaymentStatus(payment).text}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Criado em {formatDate(payment.createdAt)}</span>
                                </div>
                                {payment.paidAt && (
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Pago em {formatDate(payment.paidAt)}</span>
                                  </div>
                                )}
                                {!payment.paidAt && payment.expiresAt && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span>
                                      {isPaymentExpired(payment)
                                        ? `Expirou em ${formatDate(payment.expiresAt)}`
                                        : `Expira em ${formatDate(payment.expiresAt)}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {payment.transactionId && (
                                <p className="text-xs text-gray-500 mt-2">
                                  ID: {payment.transactionId}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-sm text-gray-500 mb-3">{payment.currency}</p>
                            {(payment.brCode || payment.qrCodeImage || payment.paymentLinkUrl) && (
                              <button
                                onClick={() => openPaymentDetails(payment)}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                              >
                                <QrCode className="h-4 w-4" />
                                <span>Ver Detalhes</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {upcomingInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma fatura programada
                    </h3>
                    <p className="text-gray-600">
                      Você não possui assinatura recorrente ativa
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingInvoices.map((invoice, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 rounded-full p-3">
                              <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {invoice.description}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Vencimento: {formatDate(invoice.dueDate)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(invoice.amount)}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {user?.planType === 'FREE' && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Upgrade para Premium</h3>
                <p className="text-orange-100">
                  Tenha acesso a downloads ilimitados e recursos exclusivos
                </p>
              </div>
              <a
                href="/plans"
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                Ver Planos
              </a>
            </div>
          </div>
        )}
      </div>

      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Pagamento</h2>
                <button
                  onClick={closePaymentModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Plano</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedPayment.subscription
                        ? `Plano ${selectedPayment.subscription.planType}`
                        : 'Pagamento Avulso'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      getPaymentStatus(selectedPayment).color
                    }`}
                  >
                    {getPaymentStatus(selectedPayment).text}
                  </span>
                </div>
              </div>

              {selectedPayment.qrCodeImage && (
                <div className="text-center mb-6">
                  <div className="inline-block bg-white p-4 rounded-xl shadow-sm mb-4">
                    <img
                      src={selectedPayment.qrCodeImage}
                      alt="QR Code PIX"
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                    <QrCode className="h-5 w-5" />
                    <span className="text-sm">Escaneie com o app do seu banco</span>
                  </div>
                </div>
              )}

              {selectedPayment.brCode && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={selectedPayment.brCode}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedPayment.brCode!)}
                      className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {selectedPayment.paymentLinkUrl && (
                <div className="mb-6">
                  <a
                    href={selectedPayment.paymentLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Abrir Link de Pagamento</span>
                  </a>
                </div>
              )}

              {selectedPayment.expiresAt && !isPaymentExpired(selectedPayment) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Atenção:</strong> Este pagamento expira em{' '}
                    {formatDate(selectedPayment.expiresAt)}. Realize o pagamento antes desta data.
                  </p>
                </div>
              )}

              {isPaymentExpired(selectedPayment) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    <strong>Pagamento Expirado:</strong> Este pagamento expirou em{' '}
                    {formatDate(selectedPayment.expiresAt!)}. Você precisará gerar um novo pagamento.
                  </p>
                </div>
              )}

              {selectedPayment.status === 'COMPLETED' && selectedPayment.paidAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>Pagamento Confirmado!</strong> Pago em {formatDate(selectedPayment.paidAt)}.
                  </p>
                </div>
              )}

              <button
                onClick={closePaymentModal}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
