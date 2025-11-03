import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateRobotsTxt,
  generateHtaccess,
  generateNginxConf,
  generateHeadersJs,
  generateLegalTxt,
  generateCaddyfile,
  generateTomcatWebXml,
  generateTomcatFilter,
  generateIISWebConfig,
  generateLighttpdConf
} from './generateFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createZipFile(sessionId, serverType, domain, includeLegal) {
  return new Promise((resolve, reject) => {
    // Sur Vercel, utiliser /tmp pour les fichiers temporaires
    // En local, utiliser le dossier downloads
    const isVercel = process.env.VERCEL === '1';
    const downloadsDir = isVercel 
      ? '/tmp/downloads'  // Vercel Serverless Functions
      : path.join(__dirname, '../downloads'); // Local
    
    // Créer le dossier downloads s'il n'existe pas
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const zipPath = path.join(downloadsDir, `${sessionId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression maximale
    });

    output.on('close', () => {
      console.log(`✅ ZIP créé: ${zipPath} (${archive.pointer()} bytes)`);
      resolve(zipPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Générer et ajouter robots.txt
    const robotsTxt = generateRobotsTxt(domain);
    archive.append(robotsTxt, { name: 'robots.txt' });

    // Générer et ajouter les fichiers selon le type de serveur
    if (serverType === 'apache') {
      const htaccess = generateHtaccess();
      archive.append(htaccess, { name: '.htaccess' });
      const instructions = generateInstructions('apache');
      archive.append(instructions, { name: 'INSTRUCTIONS_APACHE.md' });
    } else if (serverType === 'nginx') {
      const nginxConf = generateNginxConf();
      archive.append(nginxConf, { name: 'nginx-ai-shield.conf' });
      const instructions = generateInstructions('nginx');
      archive.append(instructions, { name: 'INSTRUCTIONS_NGINX.md' });
    } else if (serverType === 'nodejs') {
      const headersJs = generateHeadersJs('express');
      archive.append(headersJs, { name: 'headers.js' });
      const instructions = generateInstructions('nodejs');
      archive.append(instructions, { name: 'INSTRUCTIONS_NODEJS.md' });
    } else if (serverType === 'nextjs') {
      const headersJs = generateHeadersJs('nextjs');
      archive.append(headersJs, { name: 'next.config.js' });
      const instructions = generateInstructions('nextjs');
      archive.append(instructions, { name: 'INSTRUCTIONS_NEXTJS.md' });
    } else if (serverType === 'tomcat') {
      const webXml = generateTomcatWebXml();
      archive.append(webXml, { name: 'WEB-INF/web.xml' });
      const filter = generateTomcatFilter();
      archive.append(filter, { name: 'src/main/java/com/example/AIBlockFilter.java' });
      const instructions = generateInstructions('tomcat');
      archive.append(instructions, { name: 'INSTRUCTIONS_TOMCAT.md' });
    } else if (serverType === 'caddy') {
      const caddyfile = generateCaddyfile();
      archive.append(caddyfile, { name: 'Caddyfile-ai-shield.conf' });
      const instructions = generateInstructions('caddy');
      archive.append(instructions, { name: 'INSTRUCTIONS_CADDY.md' });
    } else if (serverType === 'iis') {
      const webConfig = generateIISWebConfig();
      archive.append(webConfig, { name: 'web.config' });
      const instructions = generateInstructions('iis');
      archive.append(instructions, { name: 'INSTRUCTIONS_IIS.md' });
    } else if (serverType === 'lighttpd') {
      const lighttpdConf = generateLighttpdConf();
      archive.append(lighttpdConf, { name: 'lighttpd-ai-shield.conf' });
      const instructions = generateInstructions('lighttpd');
      archive.append(instructions, { name: 'INSTRUCTIONS_LIGHTTPD.md' });
    }

    // Ajouter legal.txt si demandé
    if (includeLegal) {
      const legalTxt = generateLegalTxt(domain);
      archive.append(legalTxt, { name: 'legal.txt' });
    }

    // Générer le contenu du README selon le type de serveur
    const serverFiles = {
      apache: '- `.htaccess`: Configuration Apache pour bloquer les bots IA',
      nginx: '- `nginx-ai-shield.conf`: Configuration Nginx à intégrer',
      nodejs: '- `headers.js`: Middleware Express.js pour la protection',
      nextjs: '- `next.config.js`: Configuration Next.js pour les headers',
      tomcat: '- `WEB-INF/web.xml`: Configuration Tomcat\n- `src/com/example/AIBlockFilter.java`: Filter Java',
      caddy: '- `Caddyfile-ai-shield.conf`: Configuration Caddy à intégrer',
      iis: '- `web.config`: Configuration IIS pour bloquer les bots',
      lighttpd: '- `lighttpd-ai-shield.conf`: Configuration Lighttpd à intégrer'
    };

    // Ajouter un fichier README
    const readme = `# AI-Shield Generator - Pack de Protection

Ce pack contient tous les fichiers nécessaires pour protéger votre site web contre 
les bots d'intelligence artificielle et les scrapers.

## 📦 Fichiers inclus:

- **robots.txt**: Bloque tous les bots IA dans les moteurs de recherche
${serverFiles[serverType] || ''}
${includeLegal ? '- **legal.txt**: Clause légale de protection du contenu' : ''}
- **INSTRUCTIONS_${serverType.toUpperCase()}.md**: Guide d'installation détaillé

## 🚀 Installation rapide:

1. **Décompressez ce fichier ZIP**
2. **Placez robots.txt à la racine** de votre site web
3. **Suivez les instructions détaillées** dans le fichier \`INSTRUCTIONS_${serverType.toUpperCase()}.md\`
${includeLegal ? '4. **Consultez legal.txt** pour la clause légale' : ''}

## ✅ Vérification:

Testez que la protection fonctionne :
\`\`\`bash
curl -A "GPTBot" https://votre-domaine.com
# Devrait retourner : 403 Forbidden
\`\`\`

## 📚 Support:

Pour toute question, consultez le fichier d'instructions ou contactez le support.

---
Généré le: ${new Date().toLocaleString('fr-FR')}
Type de serveur: ${serverType.toUpperCase()}
`;

    archive.append(readme, { name: 'README.md' });

    // Finaliser l'archive
    archive.finalize();
  });
}

// Fonction pour générer les instructions détaillées selon le type de serveur
function generateInstructions(serverType) {
  const instructions = {
    apache: `# Instructions d'installation - Apache

## 📋 Prérequis
- Serveur Apache avec mod_rewrite et mod_headers activés
- Accès à votre fichier .htaccess ou configuration Apache

## 🚀 Installation

### Méthode 1 : Via .htaccess (Recommandé)

1. **Téléchargez et décompressez le pack**
   - Le fichier .htaccess est inclus dans ce pack

2. **Copiez le fichier .htaccess**
   - Copiez le fichier \`.htaccess\` à la **racine** de votre site web
   - Par exemple : \`/var/www/html/.htaccess\` ou \`/public_html/.htaccess\`

3. **Vérifiez les permissions**
   \`\`\`bash
   chmod 644 .htaccess
   \`\`\`

4. **Testez la configuration**
   - Visitez votre site dans un navigateur
   - Vérifiez que tout fonctionne normalement

### Méthode 2 : Dans la configuration Apache principale

Si vous n'utilisez pas .htaccess, ajoutez ces règles dans votre configuration Apache :

\`\`\`apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    DocumentRoot /var/www/html
    
    # Ajoutez ici le contenu du fichier .htaccess
    # (Voir le fichier .htaccess inclus)
</VirtualHost>
\`\`\`

Puis rechargez Apache :
\`\`\`bash
sudo systemctl reload apache2
# ou
sudo service apache2 reload
\`\`\`

## ✅ Vérification

Testez que la protection fonctionne :
\`\`\`bash
curl -A "GPTBot" https://votre-domaine.com
# Devrait retourner : 403 Forbidden
\`\`\`

## 🔧 Dépannage

- **Erreur 500 Internal Server Error** : Vérifiez que mod_rewrite est activé
  \`\`\`bash
  sudo a2enmod rewrite
  sudo systemctl restart apache2
  \`\`\`

- **Les headers ne s'appliquent pas** : Vérifiez que mod_headers est activé
  \`\`\`bash
  sudo a2enmod headers
  sudo systemctl restart apache2
  \`\`\`

## 📚 Ressources

- Documentation Apache : https://httpd.apache.org/docs/
- Support : Consultez les logs Apache en cas de problème
  \`\`\`bash
  tail -f /var/log/apache2/error.log
  \`\`\`
`,

    nginx: `# Instructions d'installation - Nginx

## 📋 Prérequis
- Serveur Nginx installé et configuré
- Accès root/sudo pour modifier la configuration

## 🚀 Installation

### Étape 1 : Localiser votre configuration Nginx

Trouvez votre fichier de configuration Nginx (généralement dans \`/etc/nginx/\`) :

\`\`\`bash
# Ubuntu/Debian
/etc/nginx/sites-available/votre-site

# Ou configuration globale
/etc/nginx/nginx.conf
\`\`\`

### Étape 2 : Ajouter la configuration

1. **Ouvrez votre fichier de configuration**
   \`\`\`bash
   sudo nano /etc/nginx/sites-available/votre-site
   \`\`\`

2. **Ajoutez le contenu du fichier \`nginx-ai-shield.conf\` dans le bloc \`server {}\`**

   \`\`\`nginx
   server {
       listen 80;
       server_name votre-domaine.com;
       
       # ⬇️ Ajoutez ici le contenu de nginx-ai-shield.conf
       
       location / {
           root /var/www/html;
           index index.html;
       }
   }
   \`\`\`

### Étape 3 : Tester et recharger

1. **Testez la configuration**
   \`\`\`bash
   sudo nginx -t
   \`\`\`

2. **Si le test est OK, rechargez Nginx**
   \`\`\`bash
   sudo nginx -s reload
   # ou
   sudo systemctl reload nginx
   \`\`\`

## ✅ Vérification

Testez que la protection fonctionne :
\`\`\`bash
curl -A "GPTBot" https://votre-domaine.com
# Devrait retourner : 403 Forbidden
\`\`\`

## 🔧 Dépannage

- **Erreur de syntaxe** : Vérifiez que toutes les directives sont correctement fermées
- **403 pour tout le monde** : Vérifiez que les règles ne bloquent pas tous les User-Agents
- **Logs Nginx** :
  \`\`\`bash
  tail -f /var/log/nginx/error.log
  \`\`\`

## 📚 Ressources

- Documentation Nginx : https://nginx.org/en/docs/
`,

    nodejs: `# Instructions d'installation - Node.js / Express.js

## 📋 Prérequis
- Application Node.js avec Express.js
- Accès au fichier principal de votre application (app.js, server.js, etc.)

## 🚀 Installation

### Étape 1 : Installer le middleware

1. **Copiez le contenu du fichier \`headers.js\`**

2. **Dans votre fichier principal (app.js, server.js, etc.), ajoutez :**

   \`\`\`javascript
   const express = require('express');
   const app = express();
   
   // ⬇️ Ajoutez ce middleware AVANT vos routes
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
   
   // Vos routes ici...
   app.get('/', (req, res) => {
     res.send('Hello World!');
   });
   
   app.listen(3000);
   \`\`\`

### Étape 2 : Redémarrer votre application

\`\`\`bash
# Si vous utilisez PM2
pm2 restart votre-app

# Ou simplement
node server.js
\`\`\`

## ✅ Vérification

Testez que la protection fonctionne :
\`\`\`bash
curl -A "GPTBot" http://localhost:3000
# Devrait retourner : {"error":"Accès refusé"}
\`\`\`

## 🔧 Dépannage

- **Middleware non appliqué** : Vérifiez que le middleware est ajouté **avant** vos routes
- **Tous les accès sont bloqués** : Vérifiez la logique de détection des bots

## 📚 Ressources

- Documentation Express.js : https://expressjs.com/
`,

    nextjs: `# Instructions d'installation - Next.js

## 📋 Prérequis
- Application Next.js
- Accès au fichier \`next.config.js\`

## 🚀 Installation

### Méthode 1 : Via next.config.js (Recommandé)

1. **Ouvrez votre fichier \`next.config.js\`**

2. **Ajoutez ou modifiez la configuration :**

   \`\`\`javascript
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
     
     // Vos autres configurations...
   };
   \`\`\`

### Méthode 2 : Via middleware.js (Next.js 13+)

1. **Créez ou modifiez \`middleware.js\` à la racine de votre projet**

   \`\`\`javascript
   import { NextResponse } from 'next/server';
   
   export function middleware(request) {
     const response = NextResponse.next();
     
     // Headers de protection
     response.headers.set('X-Robots-Tag', 'noai, noimageai, noindex, nofollow');
     response.headers.set('Permissions-Policy', 'interest-cohort=()');
     
     // Bloquer les bots IA
     const aiBots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
     const userAgent = request.headers.get('user-agent') || '';
     
     if (aiBots.some(bot => userAgent.includes(bot))) {
       return new Response('Access Denied', { status: 403 });
     }
     
     return response;
   }
   
   export const config = {
     matcher: '/:path*',
   };
   \`\`\`

### Étape 3 : Redémarrer

\`\`\`bash
npm run dev
# ou en production
npm run build
npm start
\`\`\`

## ✅ Vérification

Testez que la protection fonctionne en production.

## 📚 Ressources

- Documentation Next.js : https://nextjs.org/docs/
`,

    tomcat: `# Instructions d'installation - Apache Tomcat

## 📋 Prérequis
- Apache Tomcat installé
- Application Java web (WAR)
- Environnement de développement Java

## 🚀 Installation

### Étape 1 : Intégrer le Filter dans votre projet

1. **Copiez le fichier \`AIBlockFilter.java\`**
   - Placez-le dans votre projet : \`src/main/java/com/example/AIBlockFilter.java\`

2. **Ajoutez la dépendance Servlet API dans votre \`pom.xml\` (Maven) :**

   \`\`\`xml
   <dependency>
       <groupId>javax.servlet</groupId>
       <artifactId>javax.servlet-api</artifactId>
       <version>4.0.1</version>
       <scope>provided</scope>
   </dependency>
   \`\`\`

### Étape 2 : Configurer web.xml

1. **Copiez le contenu du fichier \`WEB-INF/web.xml\`**

2. **Ajoutez-le dans votre \`src/main/webapp/WEB-INF/web.xml\`** :

   \`\`\`xml
   <?xml version="1.0" encoding="UTF-8"?>
   <web-app>
       <!-- Vos autres configurations -->
       
       <!-- ⬇️ Ajoutez ici la configuration du Filter -->
   </web-app>
   \`\`\`

### Étape 3 : Compiler et déployer

1. **Compilez votre application**
   \`\`\`bash
   mvn clean package
   \`\`\`

2. **Déployez le WAR dans Tomcat**
   \`\`\`bash
   cp target/votre-app.war $CATALINA_HOME/webapps/
   \`\`\`

3. **Redémarrez Tomcat**
   \`\`\`bash
   $CATALINA_HOME/bin/shutdown.sh
   $CATALINA_HOME/bin/startup.sh
   \`\`\`

## ✅ Vérification

Testez que la protection fonctionne.

## 📚 Ressources

- Documentation Tomcat : https://tomcat.apache.org/
`,

    caddy: `# Instructions d'installation - Caddy

## 📋 Prérequis
- Caddy installé
- Accès à votre Caddyfile

## 🚀 Installation

### Étape 1 : Ajouter la configuration

1. **Ouvrez votre Caddyfile**
   \`\`\`bash
   nano /etc/caddy/Caddyfile
   # ou
   nano Caddyfile
   \`\`\`

2. **Ajoutez le contenu du fichier \`Caddyfile-ai-shield.conf\` dans votre bloc site :**

   \`\`\`
   votre-domaine.com {
       root * /var/www/html
       
       # ⬇️ Ajoutez ici le contenu de Caddyfile-ai-shield.conf
       
       file_server
   }
   \`\`\`

### Étape 2 : Tester et recharger

1. **Testez la configuration**
   \`\`\`bash
   caddy validate --config /etc/caddy/Caddyfile
   \`\`\`

2. **Rechargez Caddy**
   \`\`\`bash
   sudo systemctl reload caddy
   # ou
   caddy reload --config /etc/caddy/Caddyfile
   \`\`\`

## ✅ Vérification

Testez que la protection fonctionne.

## 📚 Ressources

- Documentation Caddy : https://caddyserver.com/docs/
`,

    iis: `# Instructions d'installation - IIS (Internet Information Services)

## 📋 Prérequis
- IIS 7.0 ou supérieur
- URL Rewrite Module installé (pour la réécriture d'URL)
- Accès administrateur au serveur

## 🚀 Installation

### Étape 1 : Installer URL Rewrite Module (si nécessaire)

1. **Téléchargez et installez URL Rewrite Module**
   - https://www.iis.net/downloads/microsoft/url-rewrite

### Étape 2 : Déployer web.config

1. **Copiez le fichier \`web.config\`**
   - Placez-le à la **racine** de votre site web
   - Par exemple : \`C:\\inetpub\\wwwroot\\web.config\`

2. **Si vous avez déjà un web.config, fusionnez les configurations**

### Étape 3 : Vérifier la configuration

1. **Ouvrez IIS Manager**

2. **Sélectionnez votre site**

3. **Vérifiez que les modules sont actifs :**
   - URL Rewrite
   - HTTP Response Headers

### Étape 4 : Redémarrer IIS (si nécessaire)

\`\`\`powershell
# Dans PowerShell (Administrateur)
iisreset
\`\`\`

## ✅ Vérification

Testez que la protection fonctionne.

## 🔧 Dépannage

- **Erreur 500.19** : Vérifiez que URL Rewrite Module est installé
- **Les headers ne s'appliquent pas** : Vérifiez dans HTTP Response Headers

## 📚 Ressources

- Documentation IIS : https://docs.microsoft.com/iis/
`,

    lighttpd: `# Instructions d'installation - Lighttpd

## 📋 Prérequis
- Lighttpd installé
- Accès root/sudo pour modifier la configuration

## 🚀 Installation

### Étape 1 : Ajouter la configuration

1. **Ouvrez votre fichier de configuration Lighttpd**
   \`\`\`bash
   sudo nano /etc/lighttpd/lighttpd.conf
   # ou pour un site spécifique
   sudo nano /etc/lighttpd/conf-available/10-votre-site.conf
   \`\`\`

2. **Ajoutez le contenu du fichier \`lighttpd-ai-shield.conf\`** :

   \`\`\`
   # ⬇️ Ajoutez ici le contenu de lighttpd-ai-shield.conf
   \`\`\`

### Étape 2 : Activer la configuration (si site spécifique)

\`\`\`bash
sudo lighttpd-enable-mod votre-site
\`\`\`

### Étape 3 : Tester et recharger

1. **Testez la configuration**
   \`\`\`bash
   sudo lighttpd -t -f /etc/lighttpd/lighttpd.conf
   \`\`\`

2. **Rechargez Lighttpd**
   \`\`\`bash
   sudo systemctl reload lighttpd
   # ou
   sudo /etc/init.d/lighttpd reload
   \`\`\`

## ✅ Vérification

Testez que la protection fonctionne.

## 📚 Ressources

- Documentation Lighttpd : https://www.lighttpd.net/documentation/
`
  };

  return instructions[serverType] || '# Instructions non disponibles pour ce type de serveur';
}

