import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const upgradePlanSchema = z.object({
  planType: z.enum(['PREMIUM']),
  billingCycle: z.enum(['monthly', 'yearly']),
});

export const getCurrentSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

export const getPlans = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        type: 'FREE',
        price: 0,
        currency: 'BRL',
        features: [
          '5 downloads por dia',
          'Qualidade original',
          'Formato MP4',
          'Histórico de 10 downloads',
        ],
        limits: {
          dailyDownloads: 5,
          historySize: 10,
        },
      },
      {
        id: 'premium-monthly',
        name: 'Premium Mensal',
        type: 'PREMIUM',
        price: 29.90,
        currency: 'BRL',
        billingCycle: 'monthly',
        features: [
          'Downloads ilimitados',
          'Qualidade original',
          'Formato MP4',
          'Histórico completo',
          'Downloads simultâneos (até 3)',
          'Velocidade prioritária',
        ],
        limits: {
          dailyDownloads: 999999,
          historySize: -1,
          simultaneousDownloads: 3,
        },
      },
      {
        id: 'premium-yearly',
        name: 'Premium Anual',
        type: 'PREMIUM',
        price: 299.00,
        currency: 'BRL',
        billingCycle: 'yearly',
        savings: '16% de desconto',
        features: [
          'Downloads ilimitados',
          'Qualidade original',
          'Formato MP4',
          'Histórico completo',
          'Downloads simultâneos (até 3)',
          'Velocidade prioritária',
          'Economize R$ 59,80 por ano',
        ],
        limits: {
          dailyDownloads: 999999,
          historySize: -1,
          simultaneousDownloads: 3,
        },
      },
    ];

    res.json(plans);
  } catch (error) {
    next(error);
  }
};

export const upgradeSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planType, billingCycle } = upgradePlanSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.planType === 'PREMIUM') {
      throw new AppError('Você já possui um plano Premium', 400);
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId!,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: 'CANCELLED' },
      });
    }

    const expiresAt = new Date();
    if (billingCycle === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.userId!,
        planType,
        status: 'ACTIVE',
        expiresAt,
        autoRenew: true,
      },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { planType },
    });

    res.json({
      message: 'Upgrade realizado com sucesso',
      subscription,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      throw new AppError('Nenhuma assinatura ativa encontrada', 404);
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
      },
    });

    res.json({
      message: 'Assinatura cancelada. Você terá acesso até o fim do período pago.',
      expiresAt: subscription.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};
