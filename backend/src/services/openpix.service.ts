import axios, { AxiosInstance } from 'axios';

interface OpenPixCustomer {
  name: string;
  taxID: string;
  email: string;
  phone: string;
}

interface CreateChargeRequest {
  value: number;
  correlationID: string;
  customer?: OpenPixCustomer;
  comment?: string;
  expiresIn?: number;
}

interface CreateChargeResponse {
  charge: {
    customer: OpenPixCustomer | null;
    value: number;
    identifier: string;
    correlationID: string;
    paymentLinkID: string;
    transactionID: string;
    status: string;
    expiresDate: string;
    createdAt: string;
    updatedAt: string;
    brCode: string;
    paymentLinkUrl: string;
    qrCodeImage: string;
    globalID: string;
  };
  correlationID: string;
  brCode: string;
}

interface CreateSubscriptionRequest {
  value: number;
  customer: OpenPixCustomer;
  dayGenerateCharge?: number;
}

interface CreateSubscriptionResponse {
  subscription: {
    globalID: string;
    value: number;
    customer: OpenPixCustomer;
    dayGenerateCharge: number;
  };
}

interface WebhookPayload {
  event: string;
  charge?: {
    status: string;
    customer: OpenPixCustomer;
    value: number;
    correlationID: string;
    transactionID: string;
    paidAt?: string;
  };
  subscription?: {
    globalID: string;
    status: string;
  };
}

class OpenPixService {
  private api: AxiosInstance;
  private appId: string;

  constructor() {
    this.appId = process.env.OPENPIX_APP_ID || '';
    
    if (!this.appId) {
      throw new Error('OPENPIX_APP_ID não configurado nas variáveis de ambiente');
    }

    // Usar sandbox para desenvolvimento, produção para produção
    const baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api.openpix.com.br/api/v1'
      : 'https://api.woovi-sandbox.com/api/v1';

    this.api = axios.create({
      baseURL,
      headers: {
        'Authorization': this.appId,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.log(`🔧 OpenPix configurado para: ${baseURL}`);
  }

  async createCharge(data: CreateChargeRequest): Promise<CreateChargeResponse> {
    try {
      const response = await this.api.post<CreateChargeResponse>('/charge', {
        value: data.value,
        correlationID: data.correlationID,
        customer: data.customer,
        comment: data.comment,
        expiresIn: data.expiresIn || 86400, // 24 horas por padrão
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar cobrança OpenPix:', error.response?.data || error.message);
      throw new Error(`Falha ao criar cobrança: ${error.response?.data?.message || error.message}`);
    }
  }

  async createSubscription(data: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      const response = await this.api.post<CreateSubscriptionResponse>('/subscriptions', {
        value: data.value,
        customer: data.customer,
        dayGenerateCharge: data.dayGenerateCharge || 5, // Dia 5 de cada mês por padrão
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar assinatura OpenPix:', error.response?.data || error.message);
      throw new Error(`Falha ao criar assinatura: ${error.response?.data?.message || error.message}`);
    }
  }

  async getCharge(chargeId: string): Promise<any> {
    try {
      const response = await this.api.get(`/charge/${chargeId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar cobrança OpenPix:', error.response?.data || error.message);
      throw new Error(`Falha ao buscar cobrança: ${error.response?.data?.message || error.message}`);
    }
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await this.api.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar assinatura OpenPix:', error.response?.data || error.message);
      throw new Error(`Falha ao buscar assinatura: ${error.response?.data?.message || error.message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await this.api.delete(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura OpenPix:', error.response?.data || error.message);
      throw new Error(`Falha ao cancelar assinatura: ${error.response?.data?.message || error.message}`);
    }
  }

  validateWebhookPayload(payload: WebhookPayload): boolean {
    if (!payload.event) {
      return false;
    }

    if (payload.event === 'OPENPIX:CHARGE_COMPLETED' && !payload.charge) {
      return false;
    }

    if (payload.event === 'OPENPIX:SUBSCRIPTION_CREATED' && !payload.subscription) {
      return false;
    }

    return true;
  }

  async createChargeForPlan(
    userId: string,
    planType: 'PREMIUM',
    billingPeriod: 'monthly' | 'yearly',
    customer: OpenPixCustomer
  ): Promise<CreateChargeResponse> {
    const values = {
      monthly: 2990, // R$ 29,90 em centavos
      yearly: 29900, // R$ 299,00 em centavos
    };

    const correlationID = `${userId}-${planType}-${billingPeriod}-${Date.now()}`;

    return this.createCharge({
      value: values[billingPeriod],
      correlationID,
      customer,
      comment: `Assinatura ${planType} - ${billingPeriod === 'monthly' ? 'Mensal' : 'Anual'}`,
      expiresIn: 86400, // 24 horas
    });
  }

  async createRecurringSubscription(
    userId: string,
    planType: 'PREMIUM',
    customer: OpenPixCustomer,
    dayGenerateCharge: number = 5
  ): Promise<CreateSubscriptionResponse> {
    return this.createSubscription({
      value: 2990, // R$ 29,90 em centavos (sempre mensal para recorrência)
      customer,
      dayGenerateCharge,
    });
  }
}

export default new OpenPixService();
