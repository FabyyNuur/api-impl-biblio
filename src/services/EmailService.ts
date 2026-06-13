import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  FRONTEND_URL,
  isSmtpConfigured,
  MAIL_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from "../config/mail";

export interface WelcomeEmailParams {
  to: string;
  prenom: string;
  nom: string;
  temporaryPassword: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (!isSmtpConfigured()) {
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    }

    return this.transporter;
  }

  async sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean> {
    if (process.env.NODE_ENV === "test") {
      return true;
    }

    if (params.to.endsWith("@test.com")) {
      console.warn(
        `[EmailService] Adresse de test ignorée, aucun email envoyé : ${params.to}`,
      );
      return false;
    }

    const loginUrl = `${FRONTEND_URL}/login`;
    const subject = "Bienvenue à Nuur Library — vos identifiants de connexion";
    const text = [
      `Bonjour ${params.prenom} ${params.nom},`,
      "",
      "Un compte a été créé pour vous sur Nuur Library Management.",
      "",
      `Email : ${params.to}`,
      `Mot de passe temporaire : ${params.temporaryPassword}`,
      "",
      `Connectez-vous ici : ${loginUrl}`,
      "Vous devrez changer ce mot de passe lors de votre première connexion.",
      "",
      "Cordialement,",
      "L'équipe de la bibliothèque",
    ].join("\n");

    const html = `
      <p>Bonjour <strong>${params.prenom} ${params.nom}</strong>,</p>
      <p>Un compte a été créé pour vous sur <strong>Nuur Library Management</strong>.</p>
      <ul>
        <li><strong>Email :</strong> ${params.to}</li>
        <li><strong>Mot de passe temporaire :</strong> ${params.temporaryPassword}</li>
      </ul>
      <p><a href="${loginUrl}">Se connecter</a></p>
      <p>Vous devrez changer ce mot de passe lors de votre première connexion.</p>
      <p>Cordialement,<br/>L'équipe de la bibliothèque</p>
    `;

    const transporter = this.getTransporter();

    if (!transporter) {
      console.warn("[EmailService] SMTP non configuré — aucun email envoyé :");
      console.warn(`  Destinataire : ${params.to}`);
      console.warn("  Configurez SMTP_HOST, SMTP_USER et SMTP_PASS dans .env");
      return false;
    }

    try {
      await transporter.sendMail({
        from: MAIL_FROM,
        to: params.to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Email de bienvenue envoyé à ${params.to}`);
      return true;
    } catch (error) {
      console.error("[EmailService] Échec envoi email de bienvenue:", error);
      return false;
    }
  }
}
