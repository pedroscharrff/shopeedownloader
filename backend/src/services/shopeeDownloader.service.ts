import axios from 'axios';
import { prisma } from '../lib/prisma';

interface ShopeeDownloadResponse {
  success: boolean;
  videoUrl?: string;
  usage?: {
    current: number;
    limit: number;
    remaining: number | null;
  };
  error?: string;
}

const SHOPEE_API_URL = 'https://www.shopeevideodownloader.com/api/v1/download';
const SHOPEE_API_TOKEN = process.env.SHOPEE_API_TOKEN || 'b391b6331f9d2b3eeceb1223dcf1d69fdfde4a7e67bc0003a50bdbcda0b2cc0b';

export class ShopeeDownloaderService {
  async getVideoDownloadUrl(shopeeUrl: string): Promise<string> {
    try {
      const response = await axios.post<ShopeeDownloadResponse>(
        SHOPEE_API_URL,
        { url: shopeeUrl },
        {
          headers: {
            'Authorization': `Bearer ${SHOPEE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      if (!response.data.success || !response.data.videoUrl) {
        throw new Error('Falha ao obter URL do vídeo');
      }

      return response.data.videoUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Vídeo não encontrado');
        }
        if (error.response?.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
        }
        throw new Error(`Erro na API: ${error.message}`);
      }
      throw error;
    }
  }

  async processDownload(downloadId: string): Promise<void> {
    try {
      const download = await prisma.download.findUnique({
        where: { id: downloadId },
      });

      if (!download) {
        throw new Error('Download não encontrado');
      }

      await prisma.download.update({
        where: { id: downloadId },
        data: { status: 'PROCESSING' },
      });

      const videoDownloadUrl = await this.getVideoDownloadUrl(download.videoUrl);

      // Tenta obter o tamanho do arquivo apenas para registro (opcional), mas não baixa o conteúdo
      let fileSize = 0;
      try {
        const headResponse = await axios.head(videoDownloadUrl);
        fileSize = parseInt(headResponse.headers['content-length'] || '0', 10);
      } catch (e) {
        console.warn('Não foi possível obter o tamanho do arquivo:', e);
      }

      await prisma.download.update({
        where: { id: downloadId },
        data: {
          status: 'COMPLETED',
          filePath: videoDownloadUrl, // Salvando a URL direta no lugar do caminho do arquivo
          fileSize: fileSize > 0 ? BigInt(fileSize) : null,
          videoResolution: '1080p', // Mantendo hardcoded por enquanto ou poderia vir da API se disponível
          downloadedAt: new Date(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      await prisma.download.update({
        where: { id: downloadId },
        data: {
          status: 'FAILED',
          errorMessage,
        },
      });

      throw error;
    }
  }

  async getVideoInfo(shopeeUrl: string): Promise<{ videoUrl: string; available: boolean }> {
    try {
      const videoUrl = await this.getVideoDownloadUrl(shopeeUrl);
      return {
        videoUrl,
        available: true,
      };
    } catch (error) {
      return {
        videoUrl: '',
        available: false,
      };
    }
  }

  // Método mantido para compatibilidade, mas vazio pois não há arquivo físico para deletar
  deleteVideoFile(_filePath: string): void {
    // No-op: não há arquivo local para deletar
  }
}

export const shopeeDownloaderService = new ShopeeDownloaderService();
