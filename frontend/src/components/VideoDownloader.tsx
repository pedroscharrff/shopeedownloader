import { useState } from 'react';
import axios from 'axios';
import { Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  downloadUrl: string;
}

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVideoInfo(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/video/info`, { url });
      setVideoInfo(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar informações do vídeo');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;

    setDownloading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/api/video/download`,
        { url },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'video/mp4' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoInfo.title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer download do vídeo');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shopee Video Downloader
          </h1>
          <p className="text-gray-600">
            Baixe vídeos da Shopee de forma rápida e fácil
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Link do Vídeo da Shopee
              </label>
              <input
                id="url"
                type="url"
                placeholder="https://shopee.com.br/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !url}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando informações...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Buscar Vídeo
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {videoInfo && (
          <div className="bg-white rounded-lg shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Vídeo Encontrado!
                </h3>
                <p className="text-gray-600 text-sm">
                  Clique no botão abaixo para fazer o download
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              {videoInfo.thumbnail && (
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">{videoInfo.title}</h4>
                {videoInfo.duration && (
                  <p className="text-sm text-gray-600">Duração: {videoInfo.duration}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Baixar Vídeo
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-gray-600 text-sm">
        <p>© 2024 Shopee Video Downloader - Feito com ❤️</p>
      </footer>
    </div>
  );
}
