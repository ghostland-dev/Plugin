import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { downloadPack } from '../utils/api';
import SEOHead from '../components/SEOHead';

export default function DownloadPage() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleDownload = async () => {
      try {
        const blob = await downloadPack(sessionId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-shield-${sessionId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur téléchargement:', err);
        setError(err.response?.data?.error || 'Erreur lors du téléchargement');
        setLoading(false);
      }
    };

    if (sessionId) {
      handleDownload();
    } else {
      setError('Session ID manquant');
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <>
        <SEOHead
          title="Téléchargement en cours - AI-Shield Generator"
          description="Préparation de votre pack de protection..."
          canonical={`https://aishield.app/download/${sessionId}`}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Préparation du téléchargement...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead
          title="Erreur de téléchargement - AI-Shield Generator"
          description="Une erreur est survenue lors du téléchargement de votre pack."
          canonical={`https://aishield.app/download/${sessionId}`}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50 text-center border border-gray-100 dark:border-gray-700 animate-scale-in">
            <div className="mb-4 flex items-center justify-center">
              <svg className="w-16 h-16 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Erreur</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Le lien de téléchargement a peut-être expiré (valable 24h uniquement).
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Téléchargement - AI-Shield Generator"
        description="Téléchargez votre pack de protection contre les bots IA"
        canonical={`https://aishield.app/download/${sessionId}`}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50 text-center border border-gray-100 dark:border-gray-700 animate-scale-in">
          <div className="mb-4 flex items-center justify-center">
            <svg className="w-16 h-16 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Téléchargement lancé
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Votre pack AI-Shield devrait se télécharger automatiquement. 
            Si ce n'est pas le cas, vérifiez les paramètres de téléchargement de votre navigateur.
          </p>
        </div>
      </div>
    </>
  );
}

