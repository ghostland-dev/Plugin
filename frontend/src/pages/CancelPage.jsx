import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function CancelPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Paiement annulé - AI-Shield Generator"
        description="Votre paiement a été annulé. Vous pouvez réessayer à tout moment."
        canonical="https://aishield.app/cancel"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50 text-center border border-gray-100 dark:border-gray-700 animate-scale-in">
          <div className="mb-4 flex items-center justify-center">
            <svg className="w-16 h-16 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Paiement annulé
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Réessayer
          </button>
        </div>
      </div>
    </>
  );
}
