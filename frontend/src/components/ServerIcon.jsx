/**
 * Composant pour afficher les icônes de serveurs depuis dashboardicons.com
 * https://dashboardicons.com/icons
 */

const ICON_BASE_URL = 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons';

// Mapping des types de serveurs vers les noms d'icônes
// Voir https://dashboardicons.com/icons pour toutes les icônes disponibles
const SERVER_ICON_MAP = {
  apache: 'apache',
  nginx: 'nginx',
  nodejs: 'nodejs',
  nextjs: 'nextjs',
  tomcat: 'apache-tomcat-light', // Format: apache-tomcat-light.png ou apache-tomcat.svg
  caddy: 'caddy',
  iis: 'iis',
  lighttpd: 'lighttpd',
};

// Mapping pour les icônes génériques
const GENERIC_ICON_MAP = {
  shield: 'shield',
  robot: 'robot',
  folder: 'folder',
  lightning: 'lightning',
  check: 'check',
};

/**
 * Composant ServerIcon - Affiche une icône de serveur
 * @param {string} serverType - Type de serveur (apache, nginx, nodejs, etc.)
 * @param {string} format - Format de l'icône ('svg', 'png', 'webp') - par défaut 'svg'
 * @param {string} size - Taille de l'icône (par défaut 'w-8 h-8')
 * @param {string} className - Classes CSS supplémentaires
 * @param {string} alt - Texte alternatif
 */
export default function ServerIcon({ 
  serverType, 
  format = 'svg', 
  size = 'w-8 h-8',
  className = '',
  alt 
}) {
  if (!serverType || !SERVER_ICON_MAP[serverType]) {
    return null;
  }

  const iconName = SERVER_ICON_MAP[serverType];
  const iconUrl = `${ICON_BASE_URL}/${format}/${iconName}.${format}`;
  const altText = alt || `${serverType} icon`;

  return (
    <img
      src={iconUrl}
      alt={altText}
      className={`${size} object-contain ${className}`}
      loading="lazy"
      onError={(e) => {
        // Fallback en cas d'erreur de chargement
        console.warn(`Failed to load icon for ${serverType}, using fallback`);
        e.target.style.display = 'none';
      }}
    />
  );
}

/**
 * Composant GenericIcon - Pour les icônes génériques (shield, robot, etc.)
 */
export function GenericIcon({ 
  iconType, 
  format = 'svg', 
  size = 'w-8 h-8',
  className = '',
  alt 
}) {
  if (!iconType || !GENERIC_ICON_MAP[iconType]) {
    return null;
  }

  const iconName = GENERIC_ICON_MAP[iconType];
  const iconUrl = `${ICON_BASE_URL}/${format}/${iconName}.${format}`;
  const altText = alt || `${iconType} icon`;

  return (
    <img
      src={iconUrl}
      alt={altText}
      className={`${size} object-contain ${className}`}
      loading="lazy"
      onError={(e) => {
        console.warn(`Failed to load icon for ${iconType}, using fallback`);
        e.target.style.display = 'none';
      }}
    />
  );
}

/**
 * Fonction utilitaire pour obtenir l'URL d'une icône
 */
export function getServerIconUrl(serverType, format = 'svg') {
  if (!SERVER_ICON_MAP[serverType]) {
    return null;
  }
  const iconName = SERVER_ICON_MAP[serverType];
  return `${ICON_BASE_URL}/${format}/${iconName}.${format}`;
}

