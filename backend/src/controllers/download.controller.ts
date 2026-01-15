import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { shopeeDownloaderService } from '../services/shopeeDownloader.service';

const createDownloadSchema = z.object({
  videoUrl: z.string().url('URL inválida'),
});

export const createDownload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { videoUrl } = createDownloadSchema.parse(req.body);

    if (!videoUrl.includes('shopee') && !videoUrl.includes('shp.ee') && !videoUrl.includes('sho.pe')) {
      throw new AppError('URL deve ser da Shopee (shopee.com, shp.ee ou sho.pe)', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const limit = user.planType === 'FREE' 
      ? parseInt(process.env.FREE_PLAN_TOTAL_LIMIT || '5')
      : parseInt(process.env.PREMIUM_PLAN_DAILY_LIMIT || '999999');

    if (user.totalDownloads >= limit) {
      throw new AppError(
        user.planType === 'FREE' 
          ? 'Você já utilizou seus 5 downloads gratuitos. Faça upgrade para o plano Premium para downloads ilimitados.'
          : 'Limite de downloads atingido',
        429
      );
    }

    const download = await prisma.download.create({
      data: {
        userId: req.userId!,
        videoUrl,
        status: 'PENDING',
        videoTitle: `Shopee Video ${Date.now()}`,
      },
    });

    await prisma.user.update({
      where: { id: req.userId! },
      data: { totalDownloads: user.totalDownloads + 1 },
    });

    try {
      await shopeeDownloaderService.processDownload(download.id);
    } catch (error) {
      console.error('Erro ao processar download:', error);
    }

    const updatedDownload = await prisma.download.findUnique({
      where: { id: download.id },
    });

    if (!updatedDownload) {
      throw new AppError('Erro ao recuperar download processado', 500);
    }

    const serializedDownload = {
      ...updatedDownload,
      videoDuration: updatedDownload.videoDuration ? Number(updatedDownload.videoDuration) : null,
      fileSize: updatedDownload.fileSize ? Number(updatedDownload.fileSize) : null,
    };

    res.status(201).json(serializedDownload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getDownloads = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [downloads, total] = await Promise.all([
      prisma.download.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.download.count({
        where: { userId: req.userId },
      }),
    ]);

    const serializedDownloads = downloads.map(download => ({
      ...download,
      videoDuration: download.videoDuration ? Number(download.videoDuration) : null,
      fileSize: download.fileSize ? Number(download.fileSize) : null,
    }));

    res.json({
      downloads: serializedDownloads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDownloadById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const download = await prisma.download.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!download) {
      throw new AppError('Download não encontrado', 404);
    }

    const serializedDownload = {
      ...download,
      videoDuration: download.videoDuration ? Number(download.videoDuration) : null,
      fileSize: download.fileSize ? Number(download.fileSize) : null,
    };

    res.json(serializedDownload);
  } catch (error) {
    next(error);
  }
};

export const deleteDownload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const download = await prisma.download.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!download) {
      throw new AppError('Download não encontrado', 404);
    }

    await prisma.download.delete({
      where: { id },
    });

    res.json({ message: 'Download deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const download = await prisma.download.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!download) {
      throw new AppError('Download não encontrado', 404);
    }

    if (download.status !== 'COMPLETED' || !download.filePath) {
      throw new AppError('Download ainda não foi concluído', 400);
    }

    // Redireciona para a URL direta do vídeo
    res.redirect(download.filePath);
  } catch (error) {
    next(error);
  }
};

export const getDownloadStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const totalDownloads = await prisma.download.count({
      where: { userId: req.userId },
    });

    const completedDownloads = await prisma.download.count({
      where: {
        userId: req.userId,
        status: 'COMPLETED',
      },
    });

    const limit = user.planType === 'FREE' 
      ? parseInt(process.env.FREE_PLAN_TOTAL_LIMIT || '5')
      : parseInt(process.env.PREMIUM_PLAN_DAILY_LIMIT || '999999');

    res.json({
      planType: user.planType,
      totalLimit: limit,
      usedDownloads: user.totalDownloads,
      remainingDownloads: Math.max(0, limit - user.totalDownloads),
      totalDownloads,
      completedDownloads,
    });
  } catch (error) {
    next(error);
  }
};
