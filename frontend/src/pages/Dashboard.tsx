import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Download, DownloadStats, CreateDownloadRequest } from '../types';
import { 
  Download as DownloadIcon, 
  Crown, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDownloads();
    loadStats();
  }, []);

  const loadDownloads = async () => {
    try {
      const response = await api.get('/downloads?limit=20');
      setDownloads(response.data.downloads);
    } catch (err) {
      console.error('Erro ao carregar downloads:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/downloads/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const request: CreateDownloadRequest = { videoUrl };
      const response = await api.post('/downloads', request);
      setSuccess('Download iniciado com sucesso!');
      setVideoUrl('');
      setDownloads([response.data, ...downloads]);
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao iniciar download');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este download?')) return;

    try {
      await api.delete(`/downloads/${id}`);
      setDownloads(downloads.filter(d => d.id !== id));
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir download');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Concluído';
      case 'PROCESSING':
        return 'Processando';
      case 'FAILED':
        return 'Falhou';
      default:
        return 'Pendente';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.planType === 'FREE' && (
          <div className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Upgrade para Premium</h3>
                <p className="text-orange-100 mb-4">
                  Downloads ilimitados, velocidade prioritária e muito mais!
                </p>
                <Link
                  to="/plans"
                  className="inline-flex items-center space-x-2 bg-white text-orange-600 px-6 py-2.5 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                >
                  <Crown className="h-5 w-5" />
                  <span>Ver Planos</span>
                </Link>
              </div>
              <Crown className="h-16 w-16 text-orange-300 opacity-50" />
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Downloads Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.todayDownloads}/{stats.dailyLimit}
                  </p>
                </div>
                <DownloadIcon className="h-10 w-10 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Restantes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.remainingDownloads}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
                </div>
                <DownloadIcon className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Concluídos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedDownloads}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Baixar Vídeo da Shopee</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleDownload} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL do Vídeo
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://shopee.com.br/..."
                  required
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Cole o link do vídeo da Shopee que deseja baixar
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || (stats?.remainingDownloads === 0)}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <DownloadIcon className="h-5 w-5" />
              <span>{loading ? 'Processando...' : 'Baixar Vídeo'}</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Downloads</h2>

          {downloads.length === 0 ? (
            <div className="text-center py-12">
              <DownloadIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum download ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {downloads.map((download) => (
                <div
                  key={download.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(download.status)}
                        <span className="font-medium text-gray-900">
                          {download.videoTitle || 'Vídeo da Shopee'}
                        </span>
                        <span className="text-sm text-gray-500">{getStatusText(download.status)}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Resolução:</span>{' '}
                          {download.videoResolution || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Tamanho:</span>{' '}
                          {formatFileSize(download.fileSize)}
                        </div>
                        <div>
                          <span className="font-medium">Data:</span>{' '}
                          {formatDate(download.createdAt)}
                        </div>
                      </div>

                      {download.errorMessage && (
                        <p className="text-sm text-red-600 mt-2">{download.errorMessage}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {download.status === 'COMPLETED' && download.filePath && (
                        <a
                          href={download.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Baixar arquivo"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(download.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
