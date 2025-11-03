import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPayment, downloadPack } from '../utils/api';
import SEOHead from '../components/SEOHead';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID manquant');
      setLoading(false);
      return;
    }

    // Vérifier le paiement et générer le pack avec retry automatique
    let retryCount = 0;
    const maxRetries = 5;
    
    const handlePayment = async () => {
      try {
        const result = await confirmPayment(sessionId);
        if (result.success) {
          setDownloadUrl(result.download_url || `/api/payment/download/${sessionId}`);
          setLoading(false);
          return;
        } else {
          // Si c'est un paiement non encore confirmé, attendre un peu et réessayer
          if (result.retry && result.error === 'Paiement non encore confirmé' && retryCount < maxRetries) {
            retryCount++;
            console.log(`⏳ Paiement non encore confirmé, nouvelle tentative ${retryCount}/${maxRetries} dans 3 secondes...`);
            setTimeout(() => {
              handlePayment();
            }, 3000);
            return; // Ne pas mettre loading à false
          }
          
          // Si on a atteint le max de tentatives
          if (retryCount >= maxRetries) {
            setError('Le paiement prend plus de temps que prévu. Veuillez vérifier votre email ou réessayer plus tard.');
            setLoading(false);
          } else {
            setError(result.error || 'Erreur lors de la confirmation');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Erreur:', err);
        
        // Si c'est une erreur 402 (Payment Required), attendre et réessayer
        if (err.response?.status === 402 && err.response?.data?.retry && retryCount < maxRetries) {
          retryCount++;
          console.log(`⏳ Paiement non encore confirmé, nouvelle tentative ${retryCount}/${maxRetries} dans 3 secondes...`);
          setTimeout(() => {
            handlePayment();
          }, 3000);
          return; // Ne pas mettre loading à false
        }
        
        // Si on a atteint le max de tentatives
        if (retryCount >= maxRetries) {
          setError('Le paiement prend plus de temps que prévu. Veuillez vérifier votre email ou réessayer plus tard.');
        } else {
          setError(err.response?.data?.error || err.response?.data?.message || 'Une erreur est survenue');
        }
        setLoading(false);
      }
    };

    handlePayment();
  }, [sessionId]);

  const handleDownload = async () => {
    if (!sessionId) return;

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
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      setError('Erreur lors du téléchargement');
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead
          title="Paiement en cours - AI-Shield Generator"
          description="Votre pack de protection est en cours de génération..."
          canonical="https://aishield.app/success"
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Génération de votre pack en cours...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead
          title="Erreur - AI-Shield Generator"
          description="Une erreur est survenue lors de la génération de votre pack."
          canonical="https://aishield.app/success"
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50 text-center border border-gray-100 dark:border-gray-700 animate-scale-in">
            <div className="mb-4 flex items-center justify-center">
              <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Erreur</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Paiement réussi - Téléchargez votre pack AI-Shield"
        description="Votre pack de protection contre les bots IA est prêt. Téléchargez vos fichiers robots.txt, .htaccess, nginx.conf et plus."
        canonical="https://aishield.app/success"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50 text-center border border-gray-100 dark:border-gray-700 animate-scale-in">
          <div className="mb-4 flex items-center justify-center">
            <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Paiement réussi !
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Votre pack AI-Shield a été généré avec succès. Vous pouvez le télécharger maintenant 
            ou le recevoir par email.
          </p>
          
          {downloadUrl && (
            <div className="space-y-4">
              <button
                onClick={handleDownload}
                className="w-full bg-primary-600 dark:bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger mon pack
                </span>
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Un email vous sera également envoyé avec le lien de téléchargement (valable 24h).
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </>
  );
}
