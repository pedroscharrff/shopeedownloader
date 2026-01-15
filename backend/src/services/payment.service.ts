import { PrismaClient, PaymentStatus, PaymentType, PlanType, SubscriptionStatus } from '@prisma/client';
import openPixService from './openpix.service';

const prisma = new PrismaClient();

interface CreatePaymentData {
  userId: string;
  planType: 'PREMIUM';
  billingPeriod: 'monthly' | 'yearly';
  customerData: {
    name: string;
    taxID: string;
    email: string;
    phone: string;
  };
}

interface CreateSubscriptionData {
  userId: string;
  planType: 'PREMIUM';
  customerData: {
    name: string;
    taxID: string;
    email: string;
    phone: string;
  };
  dayGenerateCharge?: number;
}

class PaymentService {
  async createPayment(data: CreatePaymentData) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const values = {
      monthly: 29.90,
      yearly: 299.00,
    };

    const correlationID = `${data.userId}-${data.planType}-${data.billingPeriod}-${Date.now()}`;

    const openPixCharge = await openPixService.createCharge({
      value: Math.round(values[data.billingPeriod] * 100), // Converter para centavos
      correlationID,
      customer: data.customerData,
      comment: `Assinatura ${data.planType} - ${data.billingPeriod === 'monthly' ? 'Mensal' : 'Anual'}`,
      expiresIn: 86400,
    });

    const payment = await prisma.payment.create({
      data: {
        userId: data.userId,
        amount: values[data.billingPeriod],
        currency: 'BRL',
        status: PaymentStatus.ACTIVE,
        paymentMethod: 'PIX',
        paymentType: PaymentType.CHARGE,
        correlationId: openPixCharge.correlationID,
        openpixChargeId: openPixCharge.charge.identifier,
        openpixGlobalId: openPixCharge.charge.globalID,
        transactionId: openPixCharge.charge.transactionID,
        brCode: openPixCharge.brCode,
        qrCodeImage: openPixCharge.charge.qrCodeImage,
        paymentLinkUrl: openPixCharge.charge.paymentLinkUrl,
        expiresAt: new Date(openPixCharge.charge.expiresDate),
      },
    });

    return {
      payment,
      qrCode: {
        brCode: openPixCharge.brCode,
        qrCodeImage: openPixCharge.charge.qrCodeImage,
        paymentLinkUrl: openPixCharge.charge.paymentLinkUrl,
      },
    };
  }

  async createRecurringSubscription(data: CreateSubscriptionData) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        subscriptions: {
          where: {
            status: SubscriptionStatus.ACTIVE,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.subscriptions.length > 0 && user.subscriptions[0].openpixSubscriptionId) {
      throw new Error('Usuário já possui uma assinatura recorrente ativa');
    }

    const openPixSubscription = await openPixService.createRecurringSubscription(
      data.userId,
      data.planType,
      data.customerData,
      data.dayGenerateCharge
    );

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        userId: data.userId,
        planType: PlanType.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        expiresAt,
        autoRenew: true,
        openpixSubscriptionId: openPixSubscription.subscription.globalID,
        openpixGlobalId: openPixSubscription.subscription.globalID,
        dayGenerateCharge: openPixSubscription.subscription.dayGenerateCharge,
      },
    });

    await prisma.user.update({
      where: { id: data.userId },
      data: { planType: PlanType.PREMIUM },
    });

    return {
      subscription,
      openPixData: openPixSubscription.subscription,
    };
  }

  async handlePaymentWebhook(payload: any) {
    if (!payload.charge) {
      throw new Error('Payload de webhook inválido');
    }

    const { charge } = payload;
    const correlationID = charge.correlationID;

    const payment = await prisma.payment.findUnique({
      where: { correlationId: correlationID },
      include: { user: true },
    });

    if (!payment) {
      console.warn(`Pagamento não encontrado para correlationID: ${correlationID}`);
      return null;
    }

    if (charge.status === 'COMPLETED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: charge.paidAt ? new Date(charge.paidAt) : new Date(),
        },
      });

      const expiresAt = new Date();
      if (correlationID.includes('monthly')) {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (correlationID.includes('yearly')) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      let subscription = await prisma.subscription.findFirst({
        where: {
          userId: payment.userId,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      if (subscription) {
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            expiresAt,
            status: SubscriptionStatus.ACTIVE,
          },
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            userId: payment.userId,
            planType: PlanType.PREMIUM,
            status: SubscriptionStatus.ACTIVE,
            expiresAt,
            autoRenew: true,
          },
        });
      }

      await prisma.user.update({
        where: { id: payment.userId },
        data: { planType: PlanType.PREMIUM },
      });

      return { payment, subscription };
    }

    return null;
  }

  async checkExpiredSubscriptions() {
    const now = new Date();
    
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: {
          lte: now,
        },
        autoRenew: false,
      },
      include: { user: true },
    });

    for (const subscription of expiredSubscriptions) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.EXPIRED },
      });

      await prisma.user.update({
        where: { id: subscription.userId },
        data: { planType: PlanType.FREE },
      });

      console.log(`Assinatura expirada para usuário: ${subscription.user.email}`);
    }

    return expiredSubscriptions;
  }

  async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new Error('Assinatura ativa não encontrada');
    }

    if (subscription.openpixSubscriptionId) {
      try {
        await openPixService.cancelSubscription(subscription.openpixSubscriptionId);
      } catch (error) {
        console.error('Erro ao cancelar assinatura na OpenPix:', error);
      }
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        autoRenew: false,
      },
    });

    return subscription;
  }

  async getUserPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: true,
      },
    });
  }

  async getUserActiveSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async getPaymentByCorrelationId(correlationId: string) {
    return prisma.payment.findUnique({
      where: { correlationId },
      include: {
        user: true,
        subscription: true,
      },
    });
  }
}

export default new PaymentService();
