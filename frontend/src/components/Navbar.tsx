import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Crown, Download, Receipt, Zap } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Download className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-900">Shopee Downloader</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/plans"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Zap className="h-4 w-4" />
              <span>Planos</span>
            </Link>

            <Link
              to="/payment-history"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Receipt className="h-4 w-4" />
              <span>Pagamentos</span>
            </Link>

            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              {user?.planType === 'PREMIUM' ? (
                <>
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">Premium</span>
                </>
              ) : (
                <span className="text-sm font-medium text-gray-600">Plano Gratuito</span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
