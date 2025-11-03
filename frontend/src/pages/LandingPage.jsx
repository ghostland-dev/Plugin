import { useState } from 'react';
import PaymentForm from '../components/PaymentForm';
import SEOHead from '../components/SEOHead';
import ServerIcon from '../components/ServerIcon';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
  return (
    <>
      <SEOHead
        title="AI-Shield Generator - Protégez votre site contre les bots IA et scrapers | 5€"
        description="Générez automatiquement des fichiers robots.txt, .htaccess, nginx.conf pour bloquer GPTBot, ClaudeBot, PerplexityBot et tous les bots IA. Support Apache, Nginx, Node.js, Tomcat, IIS. Protection instantanée en 2 minutes."
        keywords="protection bots IA, bloquer GPTBot, bloquer ClaudeBot, robots.txt, .htaccess, protection contenu, AI scraping, protection site web, anti-scraper, bloqueur IA, protection données, SEO protection"
        canonical="https://aishield.app/"
      />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 animate-fade-in">
              <img 
                src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/shield.svg" 
                alt="Bouclier de protection" 
                className="w-8 h-8 dark:brightness-0 dark:invert transition-transform hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI-Shield Generator</h2>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
            Protégez votre site web contre les bots IA et scrapers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Générez automatiquement des fichiers <strong className="text-gray-900 dark:text-white">robots.txt</strong>, <strong className="text-gray-900 dark:text-white">.htaccess</strong>, <strong className="text-gray-900 dark:text-white">nginx.conf</strong> 
            pour bloquer <strong className="text-gray-900 dark:text-white">GPTBot</strong>, <strong className="text-gray-900 dark:text-white">ClaudeBot</strong>, <strong className="text-gray-900 dark:text-white">PerplexityBot</strong> et tous les bots d'intelligence 
            artificielle. Installation en 2 minutes avec support <strong className="text-gray-900 dark:text-white">Apache</strong>, <strong className="text-gray-900 dark:text-white">Nginx</strong>, <strong className="text-gray-900 dark:text-white">Node.js</strong>, 
            <strong className="text-gray-900 dark:text-white">Tomcat</strong>, <strong className="text-gray-900 dark:text-white">IIS</strong>, <strong className="text-gray-900 dark:text-white">Caddy</strong> et <strong className="text-gray-900 dark:text-white">Lighttpd</strong>.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <svg className="text-green-500 dark:text-green-400 mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Installation rapide
            </div>
            <div className="flex items-center">
              <svg className="text-green-500 dark:text-green-400 mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Pack complet
            </div>
            <div className="flex items-center">
              <svg className="text-green-500 dark:text-green-400 mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Support multi-serveur
            </div>
          </div>
        </div>

        {/* Features */}
        <section aria-label="Fonctionnalités principales" className="grid md:grid-cols-3 gap-6 mb-12">
          <article className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:hover:shadow-gray-900 transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105 animate-fade-in">
            <div className="mb-3 flex items-center justify-center" aria-hidden="true">
              <img 
                src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/robot.svg" 
                alt="" 
                className="w-16 h-16 dark:brightness-0 dark:invert transition-transform hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Blocage des bots IA</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Bloque <strong className="text-gray-900 dark:text-white">GPTBot</strong>, <strong className="text-gray-900 dark:text-white">ClaudeBot</strong>, <strong className="text-gray-900 dark:text-white">PerplexityBot</strong>, 
              <strong className="text-gray-900 dark:text-white">Google-Extended</strong> et tous les autres bots IA connus. Protection complète 
              contre le scraping et l'indexation IA.
            </p>
          </article>
          <article className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:hover:shadow-gray-900 transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="mb-3 flex items-center justify-center" aria-hidden="true">
              <img 
                src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/folder.svg" 
                alt="" 
                className="w-16 h-16 dark:brightness-0 dark:invert transition-transform hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">8+ Types de serveurs</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Support complet pour <strong className="text-gray-900 dark:text-white">Apache</strong>, <strong className="text-gray-900 dark:text-white">Nginx</strong>, <strong className="text-gray-900 dark:text-white">Node.js</strong>, 
              <strong className="text-gray-900 dark:text-white">Next.js</strong>, <strong className="text-gray-900 dark:text-white">Tomcat</strong>, <strong className="text-gray-900 dark:text-white">Caddy</strong>, <strong className="text-gray-900 dark:text-white">IIS</strong>, 
              <strong className="text-gray-900 dark:text-white">Lighttpd</strong> et plus. Configurations prêtes à l'emploi.
            </p>
          </article>
          <article className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:hover:shadow-gray-900 transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="mb-3 flex items-center justify-center" aria-hidden="true">
              <img 
                src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/lightning.svg" 
                alt="" 
                className="w-16 h-16 dark:brightness-0 dark:invert transition-transform hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Génération instantanée</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Recevez votre pack complet par email et téléchargement immédiat. Installation 
              en moins de 2 minutes avec instructions détaillées incluses.
            </p>
          </article>
        </section>

        {/* Payment Form */}
        <div className="max-w-3xl mx-auto animate-scale-in">
          <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center flex items-center justify-center gap-2">
              <img 
                src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/shield.svg" 
                alt="" 
                className="w-8 h-8 dark:brightness-0 dark:invert transition-transform hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              Générez votre pack de protection
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Choisissez votre type de serveur et obtenez votre protection en quelques minutes
            </p>
            <PaymentForm />
          </div>
        </div>

        {/* How it works */}
        <section className="mt-16 max-w-3xl mx-auto animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Comment protéger votre site contre les bots IA en 4 étapes ?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Sélectionnez votre serveur</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Choisissez Apache, Nginx, Node.js ou Next.js</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Payer 5 €</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Paiement sécurisé par Stripe, paiement unique</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Recevez votre pack</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Téléchargez immédiatement et recevez-le par email</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Installez en 2 minutes</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Suivez les instructions incluses dans le pack</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-20 border-t border-gray-800 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 dark:text-gray-500">AI-Shield Generator - Protégez votre contenu contre les IA</p>
            <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">© 2024 - Tous droits réservés</p>
          </div>
        </div>
      </footer>
      
      {/* Structured Data pour SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "AI-Shield Generator Pack",
            "description": "Pack complet de protection contre les bots IA pour votre site web",
            "brand": {
              "@type": "Brand",
              "name": "AI-Shield Generator"
            },
            "offers": {
              "@type": "Offer",
              "price": "5.00",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock",
              "url": "https://aishield.app/",
              "priceValidUntil": "2025-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "1"
            }
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Comment protéger votre site contre les bots IA",
            "description": "Guide étape par étape pour protéger votre site web contre les bots IA",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Sélectionnez votre serveur",
                "text": "Choisissez votre type de serveur (Apache, Nginx, Node.js, etc.)",
                "position": 1
              },
              {
                "@type": "HowToStep",
                "name": "Payez 5€",
                "text": "Effectuez le paiement sécurisé via Stripe",
                "position": 2
              },
              {
                "@type": "HowToStep",
                "name": "Téléchargez le pack",
                "text": "Recevez votre pack complet par email et téléchargement",
                "position": 3
              },
              {
                "@type": "HowToStep",
                "name": "Installez en 2 minutes",
                "text": "Suivez les instructions détaillées pour installer la protection",
                "position": 4
              }
            ]
          })
        }}
      />
    </div>
    </>
  );
}

