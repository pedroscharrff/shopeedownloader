import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import paymentService from '../services/payment.service';

const createPaymentSchema = z.object({
  planType: z.enum(['PREMIUM']),
  billingPeriod: z.enum(['monthly', 'yearly']),
  customerData: z.object({
    name: z.string().min(3),
    taxID: z.string().regex(/^\d{11}$|^\d{14}$/, 'CPF ou CNPJ inválido'),
    email: z.string().email(),
    phone: z.string().regex(/^55\d{10,11}$/, 'Telefone deve estar no formato 55XXXXXXXXXXX'),
  }),
});

const createSubscriptionSchema = z.object({
  planType: z.enum(['PREMIUM']),
  customerData: z.object({
    name: z.string().min(3),
    taxID: z.string().regex(/^\d{11}$|^\d{14}$/, 'CPF ou CNPJ inválido'),
    email: z.string().email(),
    phone: z.string().regex(/^55\d{10,11}$/, 'Telefone deve estar no formato 55XXXXXXXXXXX'),
  }),
  dayGenerateCharge: z.number().min(1).max(28).optional(),
});

export const createPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createPaymentSchema.parse(req.body);

    const result = await paymentService.createPayment({
      userId: req.userId!,
      ...validatedData,
    });

    res.status(201).json({
      success: true,
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        status: result.payment.status,
        expiresAt: result.payment.expiresAt,
      },
      qrCode: result.qrCode,
      message: 'Pagamento criado com sucesso. Escaneie o QR Code para pagar.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const createRecurringSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createSubscriptionSchema.parse(req.body);

    const result = await paymentService.createRecurringSubscription({
      userId: req.userId!,
      ...validatedData,
    });

    res.status(201).json({
      success: true,
      subscription: {
        id: result.subscription.id,
        planType: result.subscription.planType,
        status: result.subscription.status,
        expiresAt: result.subscription.expiresAt,
        dayGenerateCharge: result.subscription.dayGenerateCharge,
      },
      message: 'Assinatura recorrente criada com sucesso.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          select: {
            planType: true,
            startedAt: true,
            expiresAt: true,
          },
        },
      },
    });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      include: {
        subscription: true,
      },
    });

    if (!payment) {
      throw new AppError('Pagamento não encontrado', 404);
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;

    if (!payload.event) {
      throw new AppError('Evento de webhook inválido', 400);
    }

    if (payload.event === 'OPENPIX:CHARGE_COMPLETED') {
      const result = await paymentService.handlePaymentWebhook(payload);
      
      if (result) {
        return res.json({ 
          success: true,
          message: 'Pagamento processado com sucesso',
        });
      }
    }

    res.json({ 
      success: true,
      message: 'Webhook recebido',
    });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    next(error);
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await paymentService.cancelSubscription(req.userId!);

    res.json({
      success: true,
      subscription,
      message: 'Assinatura cancelada com sucesso. Você terá acesso até o fim do período pago.',
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await paymentService.getUserActiveSubscription(req.userId!);

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: 'Nenhuma assinatura ativa encontrada',
      });
    }

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        status: 'ACTIVE',
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!subscription || !subscription.dayGenerateCharge) {
      return res.json({
        success: true,
        upcomingInvoices: [],
        message: 'Nenhuma assinatura recorrente ativa',
      });
    }

    const lastPayment = subscription.payments[0];
    const upcomingInvoices = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + i + 1);
      nextMonth.setDate(subscription.dayGenerateCharge);
      nextMonth.setHours(0, 0, 0, 0);

      if (nextMonth > today) {
        upcomingInvoices.push({
          dueDate: nextMonth.toISOString(),
          amount: lastPayment?.amount || 0,
          status: 'PENDING',
          description: `Fatura ${subscription.planType} - ${nextMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        });
      }
    }

    res.json({
      success: true,
      upcomingInvoices,
    });
  } catch (error) {
    next(error);
  }
};
