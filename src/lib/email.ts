/**
 * Email Service using Resend
 * Handles all email sending functionality
 */

import { Resend } from "resend";

// Lazy initialization of Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY no está configurada. Por favor configura la variable de entorno.");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// Email configuration
const APP_NAME = process.env.RESEND_FROM_NAME || "Instituto";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL
  ? `${APP_NAME} <${process.env.RESEND_FROM_EMAIL}>`
  : (process.env.EMAIL_FROM || `${APP_NAME} <notificaciones@tu-dominio.com>`);

interface SendInvitationEmailParams {
  to: string;
  token: string;
  roleName: string;
  inviterName: string;
  tenantSlug?: string;
}

interface SendPasswordResetEmailParams {
  to: string;
  token: string;
  userName?: string;
  tenantSlug?: string;
}

interface SendReceiptEmailParams {
  to: string;
  studentName: string;
  receiptNumber: string;
  amount: number;
  paymentType: string;
  programName: string;
}

/**
 * Send invitation email to new user
 */
export async function sendInvitationEmail({
  to,
  token,
  roleName,
  inviterName,
  tenantSlug,
}: SendInvitationEmailParams) {
  const resend = getResendClient();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = tenantSlug
    ? isDev
      ? `http://${tenantSlug}.localhost:3000`
      : `https://${tenantSlug}.${rootDomain}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/auth/invitation/${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Invitación a ${APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitación a ${APP_NAME}</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Sistema de Gestión Académica</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Has sido invitado</h2>

            <p><strong>${inviterName}</strong> te ha invitado a unirte a la plataforma ${APP_NAME} con el rol de <strong>${roleName}</strong>.</p>

            <p>Para aceptar la invitación y crear tu cuenta, haz clic en el siguiente botón:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Aceptar Invitación
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
            <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
              ${inviteUrl}
            </p>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              Este enlace expirará en 7 días. Si no solicitaste esta invitación, puedes ignorar este correo.
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Error sending invitation email:", error);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }

  return data;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  to,
  token,
  userName,
  tenantSlug,
}: SendPasswordResetEmailParams) {
  const resend = getResendClient();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = tenantSlug
    ? isDev
      ? `http://${tenantSlug}.localhost:3000`
      : `https://${tenantSlug}.${rootDomain}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Restablecer contraseña - ${APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Restablecer Contraseña</h2>

            <p>Hola${userName ? ` ${userName}` : ""},</p>

            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para continuar:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>

            <p style="color: #999; font-size: 12px;">
              Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  return data;
}

/**
 * Send receipt email to student
 */
export async function sendReceiptEmail({
  to,
  studentName,
  receiptNumber,
  amount,
  paymentType,
  programName,
}: SendReceiptEmailParams) {
  const resend = getResendClient();
  const formattedAmount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Recibo de Pago ${receiptNumber} - ${APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Recibo de Pago</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Pago Confirmado</h2>

            <p>Estimado/a <strong>${studentName}</strong>,</p>

            <p>Su pago ha sido registrado exitosamente. A continuación los detalles:</p>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Recibo No:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${receiptNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Programa:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${programName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Concepto:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${paymentType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Monto:</strong></td>
                  <td style="padding: 10px 0; text-align: right; font-size: 18px; color: #28a745;"><strong>${formattedAmount}</strong></td>
                </tr>
              </table>
            </div>

            <p style="color: #666;">Gracias por su pago. Si tiene alguna consulta, no dude en contactarnos.</p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Error sending receipt email:", error);
    throw new Error(`Failed to send receipt email: ${error.message}`);
  }

  return data;
}

/**
 * Send email with custom HTML template
 */
export async function sendTemplateEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ id: string }> {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    console.error("Error sending template email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data!;
}

// Export the getter function instead of the client directly
export { getResendClient };
