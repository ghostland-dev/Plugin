// Liste complète des bots IA à bloquer (sans doublons)
const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
  'anthropic-ai',
  'Applebot-Extended',
  'Bytespider',
  'Diffbot',
  'FacebookBot',
  'ImagesBot',
  'Omgilibot',
  'omgilibot',
  'QiantuBot',
  'RCBot',
  'FriendlyCrawler',
  'SemrushBot',
  'AhrefsBot',
  'BLEXBot',
  'DataForSeoBot',
  'DotBot'
];

// Fonction utilitaire pour obtenir les bots uniques
function getUniqueBots() {
  return [...new Set(AI_BOTS)];
}

export function generateRobotsTxt(domain = null) {
  let content = `# AI-Shield Generator - robots.txt\n`;
  content += `# Généré automatiquement pour bloquer les bots IA\n`;
  content += `# Domaine: ${domain || 'non spécifié'}\n\n`;

  // Bloquer tous les bots IA spécifiques
  AI_BOTS.forEach(bot => {
    content += `User-agent: ${bot}\n`;
    content += `Disallow: /\n\n`;
  });

  // Bloquer tous les autres bots
  content += `# Bloquer tous les autres bots\n`;
  content += `User-agent: *\n`;
  content += `Disallow: /\n`;

  return content;
}

export function generateHtaccess() {
  const botPattern = AI_BOTS.join('|');
  
  return `<IfModule mod_rewrite.c>
RewriteEngine On
# Bloquer les bots IA
RewriteCond %{HTTP_USER_AGENT} (${botPattern}) [NC]
RewriteRule .* - [F,L]
</IfModule>

# Headers de protection
<IfModule mod_headers.c>
Header set X-Robots-Tag "noai, noimageai, noindex, nofollow"
Header set Permissions-Policy "interest-cohort=()"
Header set Cache-Control "no-store, no-cache, must-revalidate"
</IfModule>

# Désactiver le directory browsing
Options -Indexes

# Protéger les fichiers sensibles
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
`;
}

export function generateNginxConf() {
  const botPattern = AI_BOTS.join('|');
  
  return `# AI-Shield Generator - Configuration Nginx
# Ajoutez ces règles dans votre bloc server {}

# Bloquer les bots IA
if ($http_user_agent ~* (${botPattern})) {
    return 403;
}

# Headers de protection
add_header X-Robots-Tag "noai, noimageai, noindex, nofollow" always;
add_header Permissions-Policy "interest-cohort=()" always;
add_header Cache-Control "no-store, no-cache, must-revalidate" always;

# Bloquer les accès aux fichiers sensibles
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

# Protection supplémentaire
location ~* \.(txt|log|ini|conf)$ {
    add_header X-Robots-Tag "noai, noimageai, noindex, nofollow" always;
}
`;
}

export function generateCaddyfile() {
  const botPattern = AI_BOTS.join('|');
  
  return `# AI-Shield Generator - Configuration Caddy
# Ajoutez ces directives dans votre Caddyfile

# Bloquer les bots IA
@aiBots {
    header User-Agent "*(${botPattern})*"
}

respond @aiBots 403

# Headers de protection
header {
    X-Robots-Tag "noai, noimageai, noindex, nofollow"
    Permissions-Policy "interest-cohort=()"
    Cache-Control "no-store, no-cache, must-revalidate"
}

# Protéger les fichiers sensibles
@hidden {
    path_regexp \\.(txt|log|ini|conf)$
}
header @hidden {
    X-Robots-Tag "noai, noimageai, noindex, nofollow"
}
`;
}

export function generateTomcatWebXml() {
  const botPattern = AI_BOTS.join('|');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- AI-Shield Generator - Configuration Tomcat -->
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    
    <!-- Filter pour bloquer les bots IA -->
    <filter>
        <filter-name>AIBlockFilter</filter-name>
        <filter-class>com.example.AIBlockFilter</filter-class>
    </filter>
    
    <filter-mapping>
        <filter-name>AIBlockFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    
    <!-- Headers de protection -->
    <filter>
        <filter-name>SecurityHeadersFilter</filter-name>
        <filter-class>com.example.SecurityHeadersFilter</filter-class>
    </filter>
    
    <filter-mapping>
        <filter-name>SecurityHeadersFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    
</web-app>

<!-- Note: Vous devrez créer les classes Filter correspondantes -->
<!-- Pattern de bots à bloquer: ${botPattern} -->
`;
}

export function generateTomcatFilter() {
  const uniqueBots = getUniqueBots();
  const botsList = uniqueBots.map(bot => `        "${bot}"`).join(',\n');
  
  return `// AI-Shield Generator - Filter Tomcat
// Créez cette classe dans votre projet Java

package com.example;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class AIBlockFilter implements Filter {
    private static final List<String> AI_BOTS = Arrays.asList(
${botsList}
    );
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialisation
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String userAgent = httpRequest.getHeader("User-Agent");
        
        if (userAgent != null) {
            for (String bot : AI_BOTS) {
                if (userAgent.contains(bot)) {
                    httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    httpResponse.getWriter().write("Access Denied");
                    return;
                }
            }
        }
        
        // Ajouter les headers de protection
        httpResponse.setHeader("X-Robots-Tag", "noai, noimageai, noindex, nofollow");
        httpResponse.setHeader("Permissions-Policy", "interest-cohort=()");
        httpResponse.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        
        chain.doFilter(request, response);
    }
    
    @Override
    public void destroy() {
        // Nettoyage
    }
}
`;
}

export function generateIISWebConfig() {
  const botPattern = AI_BOTS.join('|');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- AI-Shield Generator - Configuration IIS (web.config) -->
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <!-- Bloquer les bots IA -->
                <rule name="BlockAIBots" stopProcessing="true">
                    <match url=".*" />
                    <conditions>
                        <add input="{HTTP_USER_AGENT}" pattern="(${botPattern})" />
                    </conditions>
                    <action type="CustomResponse" statusCode="403" statusReason="Forbidden" />
                </rule>
            </rules>
        </rewrite>
        
        <httpProtocol>
            <customHeaders>
                <!-- Headers de protection -->
                <add name="X-Robots-Tag" value="noai, noimageai, noindex, nofollow" />
                <add name="Permissions-Policy" value="interest-cohort=()" />
                <add name="Cache-Control" value="no-store, no-cache, must-revalidate" />
            </customHeaders>
        </httpProtocol>
        
        <!-- Désactiver le directory browsing -->
        <directoryBrowse enabled="false" />
        
        <!-- Sécurité -->
        <security>
            <requestFiltering>
                <hiddenSegments>
                    <add segment="." />
                </hiddenSegments>
            </requestFiltering>
        </security>
    </system.webServer>
</configuration>
`;
}

export function generateLighttpdConf() {
  const botPattern = AI_BOTS.join('|');
  
  return `# AI-Shield Generator - Configuration Lighttpd
# Ajoutez ces directives dans votre lighttpd.conf

# Bloquer les bots IA
\$HTTP["useragent"] =~ "(${botPattern})" {
    url.redirect = ("" => "/403.html")
}

# Headers de protection
setenv.add-response-header = (
    "X-Robots-Tag" => "noai, noimageai, noindex, nofollow",
    "Permissions-Policy" => "interest-cohort=()",
    "Cache-Control" => "no-store, no-cache, must-revalidate"
)

# Désactiver le directory listing
dir-listing.activate = "disable"

# Protéger les fichiers sensibles
\$HTTP["url"] =~ "\\.(txt|log|ini|conf)$" {
    setenv.add-response-header = (
        "X-Robots-Tag" => "noai, noimageai, noindex, nofollow"
    )
}
`;
}

export function generateHeadersJs(serverType = 'express') {
  if (serverType === 'express') {
    return `// AI-Shield Generator - Headers pour Express.js
// Ajoutez ce middleware dans votre app.js ou server.js

app.use((req, res, next) => {
  // Headers de protection contre les IA
  res.setHeader("X-Robots-Tag", "noai, noimageai, noindex, nofollow");
  res.setHeader("Permissions-Policy", "interest-cohort=()");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  
  // Bloquer les bots IA par User-Agent
  const aiBots = [
    'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web',
    'PerplexityBot', 'Google-Extended', 'CCBot', 'anthropic-ai'
  ];
  
  const userAgent = req.headers['user-agent'] || '';
  if (aiBots.some(bot => userAgent.includes(bot))) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  next();
});

// Exemple d'utilisation:
// const express = require('express');
// const app = express();
// // Copiez le code ci-dessus ici
`;
  } else if (serverType === 'nextjs') {
    return `// AI-Shield Generator - Headers pour Next.js
// Ajoutez dans votre next.config.js

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noai, noimageai, noindex, nofollow',
          },
          {
            key: 'Permissions-Policy',
            value: 'interest-cohort=()',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

// Ou dans middleware.js (Next.js 13+):
// export function middleware(request) {
//   const response = NextResponse.next();
//   response.headers.set('X-Robots-Tag', 'noai, noimageai, noindex, nofollow');
//   response.headers.set('Permissions-Policy', 'interest-cohort=()');
//   return response;
// }
`;
  }
  
  return `// AI-Shield Generator - Headers personnalisés
// Adaptez ce code à votre framework/serveur

const aiBots = [
  'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web',
  'PerplexityBot', 'Google-Extended', 'CCBot', 'anthropic-ai'
];

function checkBot(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';
  if (aiBots.some(bot => userAgent.includes(bot))) {
    return res.status(403).send('Accès refusé');
  }
  next();
}

// Ajoutez les headers de protection
res.setHeader('X-Robots-Tag', 'noai, noimageai, noindex, nofollow');
res.setHeader('Permissions-Policy', 'interest-cohort=()');
`;
}

export function generateLegalTxt(domain = null) {
  return `AVIS LÉGAL - PROTECTION DU CONTENU

Domaine: ${domain || 'Votre site web'}

L'accès automatisé au contenu de ce site web par des systèmes d'intelligence artificielle, 
des bots de scraping, des crawlers ou tout autre outil automatisé est strictement 
interdit sans autorisation préalable écrite du propriétaire du site.

Toute utilisation non autorisée du contenu de ce site, notamment :
- L'indexation par des systèmes d'IA pour l'entraînement de modèles
- Le scraping automatisé de données
- La collecte de contenu à des fins commerciales ou d'entraînement

fera l'objet de poursuites conformément aux lois sur la propriété intellectuelle, 
la protection des données et le droit d'auteur en vigueur.

Conformément au règlement général sur la protection des données (RGPD) et aux lois 
applicables, toute collecte non autorisée de données personnelles ou de contenu 
propriétaire est prohibée.

Pour toute demande d'autorisation, veuillez contacter l'administrateur du site.

© ${new Date().getFullYear()} - Tous droits réservés
`;
}

