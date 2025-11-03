import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentSession } from '../utils/api';
import ServerIcon from './ServerIcon';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function PaymentForm({ onSuccess }) {
  const [serverType, setServerType] = useState('');
  const [domain, setDomain] = useState('');
  const [includeLegal, setIncludeLegal] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!serverType) {
      setError('Veuillez sélectionner un type de serveur');
      setLoading(false);
      return;
    }

    try {
      // Créer la session de paiement
      const response = await createPaymentSession({
        server_type: serverType,
        domain: domain || undefined,
        include_legal: includeLegal,
        email: email || undefined,
      });

      // Rediriger vers Stripe Checkout
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe non configuré. Vérifiez votre clé publique Stripe.');
        }

        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: response.sessionId,
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      } catch (stripeErr) {
        // Détecter si Stripe est bloqué par un AdBlocker
        if (stripeErr.message && (
          stripeErr.message.includes('Failed to fetch') ||
          stripeErr.message.includes('ERR_BLOCKED_BY_ADBLOCKER') ||
          stripeErr.message.includes('network')
        )) {
          throw new Error('Stripe semble être bloqué. Veuillez désactiver votre bloqueur de publicité pour ce site ou utiliser une fenêtre de navigation privée.');
        }
        throw stripeErr;
      }
    } catch (err) {
      console.error('Erreur paiement:', err);
      setError(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <span className="text-base font-semibold">Type de serveur *</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Sélectionnez le type de serveur web que vous utilisez</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'apache', label: 'Apache', color: 'from-red-500 to-orange-500' },
            { value: 'nginx', label: 'Nginx', color: 'from-green-500 to-emerald-500' },
            { value: 'nodejs', label: 'Node.js', color: 'from-green-600 to-green-400' },
            { value: 'nextjs', label: 'Next.js', color: 'from-black to-gray-800' },
            { value: 'tomcat', label: 'Tomcat', color: 'from-yellow-500 to-orange-500' },
            { value: 'caddy', label: 'Caddy', color: 'from-blue-500 to-indigo-500' },
            { value: 'iis', label: 'IIS', color: 'from-blue-600 to-cyan-500' },
            { value: 'lighttpd', label: 'Lighttpd', color: 'from-yellow-400 to-amber-500' },
          ].map((server) => (
            <button
              key={server.value}
              type="button"
              onClick={() => setServerType(server.value)}
              className={`
                p-4 border-2 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center
                ${serverType === server.value
                  ? `border-primary-600 dark:border-primary-500 bg-gradient-to-br ${server.color} text-white shadow-lg dark:shadow-primary-500/30`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:shadow-gray-900/50'
                }
              `}
            >
              <div className="mb-2 flex items-center justify-center">
                <ServerIcon 
                  serverType={server.value} 
                  format="png" 
                  size="w-12 h-12"
                  className={serverType === server.value ? 'brightness-0 invert' : ''}
                />
              </div>
              <div className={`font-semibold text-sm ${serverType === server.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {server.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nom de domaine (optionnel)
        </label>
        <input
          type="text"
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="exemple.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email (optionnel, pour recevoir le pack)
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeLegal"
          checked={includeLegal}
          onChange={(e) => setIncludeLegal(e.target.checked)}
          className="w-4 h-4 text-primary-600 dark:text-primary-400 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700"
        />
        <label htmlFor="includeLegal" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Inclure la clause légale
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm animate-slide-down">
          <strong>Erreur :</strong> {error}
          {error.includes('bloqué') && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>
                Astuce : Ajoutez ce site à la liste blanche de votre bloqueur de publicité, 
                ou désactivez-le temporairement pour effectuer le paiement.
              </span>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !serverType}
        className="w-full bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 text-white py-4 px-6 rounded-xl font-bold hover:from-primary-700 hover:to-purple-700 dark:hover:from-primary-600 dark:hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl dark:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirection vers le paiement...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <ServerIcon serverType="apache" format="svg" size="w-5 h-5 mr-2" className="brightness-0 invert" />
            Protéger mon site maintenant - 5 €
          </span>
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Paiement sécurisé par Stripe • Paiement unique de 5 €
      </p>
    </form>
  );
}

