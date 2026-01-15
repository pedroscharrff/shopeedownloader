import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';
import { AuthRequest } from './auth';
import { SubscriptionStatus } from '@prisma/client';

export const checkActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: SubscriptionStatus.ACTIVE,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const activeSubscription = user.subscriptions[0];

    if (!activeSubscription) {
      throw new AppError('Assinatura ativa não encontrada. Faça upgrade para Premium.', 403);
    }

    if (activeSubscription.expiresAt && activeSubscription.expiresAt < new Date()) {
      await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: SubscriptionStatus.EXPIRED },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { planType: 'FREE' },
      });

      throw new AppError('Sua assinatura expirou. Renove para continuar usando recursos Premium.', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkPremiumPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.planType !== 'PREMIUM') {
      throw new AppError('Este recurso está disponível apenas para usuários Premium', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
