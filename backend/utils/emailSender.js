import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDownloadEmail(email, sessionId, domain, serverType = null) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY non configuré, email non envoyé');
    return { success: false, error: 'Email service non configuré' };
  }

  const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/download/${sessionId}`;
  const backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
  const apiDownloadUrl = `${backendUrl}/api/payment/download/${sessionId}`;
  const date = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Mapping des types de serveurs
  const serverNames = {
    apache: 'Apache',
    nginx: 'Nginx',
    nodejs: 'Node.js / Express',
    nextjs: 'Next.js',
    tomcat: 'Apache Tomcat',
    caddy: 'Caddy',
    iis: 'IIS (Internet Information Services)',
    lighttpd: 'Lighttpd'
  };

  const serverName = serverType ? serverNames[serverType] || serverType : 'votre serveur';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'AI-Shield <noreply@yourdomain.com>',
      to: email,
      subject: '🎉 Confirmation d\'achat - Votre pack AI-Shield est prêt ! 🛡️',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              border-radius: 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
            }
            .content { 
              background: #ffffff; 
              padding: 40px 30px; 
            }
            .confirmation-box {
              background: #f0fdf4;
              border-left: 4px solid #22c55e;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .confirmation-box h2 {
              margin: 0 0 10px 0;
              color: #16a34a;
              font-size: 18px;
            }
            .confirmation-details {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .confirmation-details table {
              width: 100%;
              border-collapse: collapse;
            }
            .confirmation-details tr {
              border-bottom: 1px solid #e5e7eb;
            }
            .confirmation-details tr:last-child {
              border-bottom: none;
            }
            .confirmation-details td {
              padding: 12px 0;
              font-size: 14px;
            }
            .confirmation-details td:first-child {
              color: #6b7280;
              font-weight: 500;
              width: 40%;
            }
            .confirmation-details td:last-child {
              color: #111827;
              font-weight: 600;
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%);
              color: white; 
              padding: 16px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 25px 0;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .info-box {
              background: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
              font-size: 14px;
            }
            .warning-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
              font-size: 14px;
            }
            .footer { 
              background: #1f2937;
              color: #9ca3af;
              text-align: center; 
              padding: 30px;
              font-size: 12px;
            }
            .footer a {
              color: #60a5fa;
              text-decoration: none;
            }
            .divider {
              height: 1px;
              background: #e5e7eb;
              margin: 30px 0;
            }
            @media only screen and (max-width: 600px) {
              .content {
                padding: 25px 20px;
              }
              .header {
                padding: 30px 20px;
              }
              .header h1 {
                font-size: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ Confirmation d'achat</h1>
              <p>Votre pack AI-Shield est prêt !</p>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              
              <div class="confirmation-box">
                <h2>✅ Paiement confirmé</h2>
                <p style="margin: 0; color: #15803d;">Votre achat a été effectué avec succès. Votre pack de protection AI-Shield a été généré et est disponible au téléchargement.</p>
              </div>

              <div class="confirmation-details">
                <table>
                  <tr>
                    <td>Date d'achat</td>
                    <td>${date}</td>
                  </tr>
                  <tr>
                    <td>Montant payé</td>
                    <td>5,00 €</td>
                  </tr>
                  <tr>
                    <td>Type de serveur</td>
                    <td>${serverName}</td>
                  </tr>
                  ${domain ? `
                  <tr>
                    <td>Domaine</td>
                    <td>${domain}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td>ID de commande</td>
                    <td>${sessionId.substring(0, 8)}...</td>
                  </tr>
                </table>
              </div>

              <div class="divider"></div>

              <h3 style="margin-top: 0; color: #111827;">📦 Contenu de votre pack</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li><strong>robots.txt</strong> - Blocage des bots IA dans les moteurs de recherche</li>
                <li><strong>Fichiers de configuration serveur</strong> - Configuration spécifique pour ${serverName}</li>
                <li><strong>Instructions détaillées</strong> - Guide d'installation étape par étape</li>
                <li><strong>README.md</strong> - Documentation complète</li>
              </ul>

              <div class="button-container">
                <a href="${apiDownloadUrl}" class="button">📥 Télécharger mon pack (ZIP)</a>
              </div>

              <div class="info-box">
                <strong>💡 Astuce :</strong> Vous pouvez également télécharger via le site web : 
                <a href="${downloadUrl}" style="color: #2563eb; font-weight: 600;">${downloadUrl}</a>
              </div>

              <div class="warning-box">
                <strong>⏰ Important :</strong> Ce lien de téléchargement est valable pendant <strong>24 heures</strong> uniquement. 
                Pensez à sauvegarder votre pack après téléchargement.
              </div>

              <div class="divider"></div>

              <h3 style="margin-top: 0; color: #111827;">🚀 Prochaines étapes</h3>
              <ol style="color: #4b5563; line-height: 1.8;">
                <li>Téléchargez votre pack</li>
                <li>Décompressez l'archive ZIP</li>
                <li>Consultez le fichier <strong>INSTRUCTIONS_${serverType ? serverType.toUpperCase() : 'SERVER'}.md</strong> pour les instructions d'installation</li>
                <li>Suivez les étapes pour configurer la protection sur votre serveur</li>
                <li>Testez la protection en utilisant les commandes fournies dans les instructions</li>
              </ol>

              <p style="margin-top: 30px;">Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.</p>
              
              <p style="margin-top: 20px;">
                Bien cordialement,<br>
                <strong>L'équipe AI-Shield Generator</strong>
              </p>
            </div>
            <div class="footer">
              <p><strong>AI-Shield Generator</strong> - Protégez votre contenu contre les IA</p>
              <p style="margin-top: 10px;">
                © 2024 AI-Shield Generator - Tous droits réservés
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🎉 Confirmation d'achat - Votre pack AI-Shield est prêt !

Bonjour,

✅ PAIEMENT CONFIRMÉ
Votre achat a été effectué avec succès. Votre pack de protection AI-Shield a été généré et est disponible au téléchargement.

DÉTAILS DE LA COMMANDE:
- Date d'achat: ${date}
- Montant payé: 5,00 €
- Type de serveur: ${serverName}
${domain ? `- Domaine: ${domain}\n` : ''}- ID de commande: ${sessionId.substring(0, 8)}...

📦 CONTENU DE VOTRE PACK:
- robots.txt - Blocage des bots IA
- Fichiers de configuration serveur pour ${serverName}
- Instructions détaillées d'installation
- README.md avec documentation complète

📥 TÉLÉCHARGER VOTRE PACK:
Lien direct: ${apiDownloadUrl}
Site web: ${downloadUrl}

⏰ IMPORTANT: Ce lien est valable pendant 24 heures uniquement.

🚀 PROCHAINES ÉTAPES:
1. Téléchargez votre pack
2. Décompressez l'archive ZIP
3. Consultez les instructions d'installation
4. Suivez les étapes pour configurer la protection
5. Testez la protection

Si vous avez des questions, n'hésitez pas à nous contacter.

Bien cordialement,
L'équipe AI-Shield Generator

© 2024 AI-Shield Generator - Tous droits réservés
      `
    });

    if (error) {
      console.error('❌ Erreur envoi email:', error);
      return { success: false, error };
    }

    console.log(`✅ Email de confirmation et pack envoyé à ${email}`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
}

