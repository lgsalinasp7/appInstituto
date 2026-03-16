/**
 * Email Service using Resend
 * Multi-tenant: mismo dominio Resend, nombre visible y branding distintos por tenant.
 */

import { Resend } from "resend";

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

// ---------------------------------------------------------------------------
// Tipos y configuración de branding por tenant
// ---------------------------------------------------------------------------

export interface TenantEmailBranding {
  /** Nombre visible en el subject y cuerpo del email */
  name: string;
  /** Color del header del email (hex) */
  primaryColor: string;
  /** Color del botón CTA (hex) */
  secondaryColor: string;
  /** Subtítulo debajo del nombre en el header */
  subtitle: string;
}

/**
 * Branding por defecto para cada tenant conocido.
 * Si el slug no está aquí se usará DEFAULT_EMAIL_BRANDING.
 * Exportado para que las API routes puedan pasarlo directamente sin DB hit.
 */
export const TENANT_EMAIL_DEFAULTS: Record<string, TenantEmailBranding> = {
  kaledacademy: {
    name: "Kaled Academy",
    primaryColor: "#1e3a5f",
    secondaryColor: "#3b82f6",
    subtitle: "Bootcamp de Ingeniería SaaS con IA",
  },
  edutec: {
    name: "Edutec",
    primaryColor: "#1e3a5f",
    secondaryColor: "#2563eb",
    subtitle: "Sistema de Gestión Académica",
  },
};

const DEFAULT_EMAIL_BRANDING: TenantEmailBranding = {
  name: process.env.RESEND_FROM_NAME || "KaledSoft",
  primaryColor: "#1e3a5f",
  secondaryColor: "#3b82f6",
  subtitle: "Plataforma Educativa",
};

/** Dirección de origen verificada en Resend (igual para todos los tenants) */
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "noreply@kaledsoft.tech";

/** Construye el campo `from` con nombre visible del tenant */
function buildFrom(branding: TenantEmailBranding): string {
  return `${branding.name} <${FROM_ADDRESS}>`;
}

/** Resuelve el branding efectivo: prioriza el pasado explícitamente,
 *  luego el mapa por slug, luego el default. */
function resolveBranding(
  tenantSlug?: string,
  branding?: TenantEmailBranding,
): TenantEmailBranding {
  return (
    branding ??
    (tenantSlug ? (TENANT_EMAIL_DEFAULTS[tenantSlug] ?? null) : null) ??
    DEFAULT_EMAIL_BRANDING
  );
}

// ---------------------------------------------------------------------------
// Interfaces de parámetros
// ---------------------------------------------------------------------------

interface SendInvitationEmailParams {
  to: string;
  token: string;
  /** Rol técnico (ej. ADMINISTRADOR, USUARIO). Se usa como fallback si no hay roleDisplayLabel. */
  roleName: string;
  /** Etiqueta amigable para el email (ej. "Estudiante", "Administrador"). Prioridad sobre roleName. */
  roleDisplayLabel?: string;
  inviterName: string;
  tenantSlug?: string;
  branding?: TenantEmailBranding;
}

interface SendTrialInvitationEmailParams {
  to: string;
  token: string;
  trialCohortName: string;
  trialNextCohortDate: Date;
  tenantSlug?: string;
  branding?: TenantEmailBranding;
}

interface SendPasswordResetEmailParams {
  to: string;
  token: string;
  userName?: string;
  tenantSlug?: string;
  branding?: TenantEmailBranding;
}

interface SendReceiptEmailParams {
  to: string;
  studentName: string;
  receiptNumber: string;
  amount: number;
  paymentType: string;
  programName: string;
  tenantSlug?: string;
  branding?: TenantEmailBranding;
}

// ---------------------------------------------------------------------------
// Funciones de envío
// ---------------------------------------------------------------------------

/**
 * Envía el email de invitación a un nuevo usuario.
 * El branding (nombre, colores, subtítulo) se adapta al tenant.
 */
export async function sendInvitationEmail({
  to,
  token,
  roleName,
  roleDisplayLabel,
  inviterName,
  tenantSlug,
  branding,
}: SendInvitationEmailParams) {
  const roleLabel = roleDisplayLabel ?? roleName;
  const resend = getResendClient();
  const b = resolveBranding(tenantSlug, branding);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = tenantSlug
    ? isDev
      ? `http://${tenantSlug}.localhost:3000`
      : `https://${tenantSlug}.${rootDomain}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/auth/invitation/${token}`;

  const { data, error } = await resend.emails.send({
    from: buildFrom(b),
    to,
    subject: `Invitación a ${b.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitación a ${b.name}</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${b.primaryColor} 0%, ${b.secondaryColor} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${b.name}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${b.subtitle}</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Has sido invitado</h2>

            <p>Te han invitado a unirte a la plataforma ${b.name} con el rol de <strong>${roleLabel}</strong>.</p>

            <p>Para aceptar la invitación y crear tu cuenta, haz clic en el siguiente botón:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: linear-gradient(135deg, ${b.primaryColor} 0%, ${b.secondaryColor} 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
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

const WHATSAPP_CTA = "https://wa.me/573337226157";

/**
 * Envía el email de invitación a versión prueba (2 días, primera lección).
 */
export async function sendTrialInvitationEmail({
  to,
  token,
  trialCohortName,
  trialNextCohortDate,
  tenantSlug,
  branding,
}: SendTrialInvitationEmailParams) {
  const resend = getResendClient();
  const b = resolveBranding(tenantSlug, branding);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = tenantSlug
    ? isDev
      ? `http://${tenantSlug}.localhost:3000`
      : `https://${tenantSlug}.${rootDomain}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/auth/invitation/${token}`;

  const formattedDate = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(new Date(trialNextCohortDate));

  const whatsappMsg = encodeURIComponent(
    `Hola, quiero consultar sobre el acceso completo a Kaled Academy (cohorte ${trialCohortName})`
  );
  const whatsappUrl = `${WHATSAPP_CTA}?text=${whatsappMsg}`;

  const { data, error } = await resend.emails.send({
    from: buildFrom(b),
    to,
    subject: `Acceso de prueba a ${b.name} - 2 días gratis`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Acceso de prueba - ${b.name}</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${b.primaryColor} 0%, ${b.secondaryColor} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${b.name}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${b.subtitle}</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Acceso de prueba por 2 días</h2>

            <p>Te han invitado a probar el acceso a la primera lección del Módulo 1 durante 2 días.</p>

            <p><strong>Cohorte de prueba:</strong> ${trialCohortName}</p>
            <p><strong>Próximo cohorte completo:</strong> ${formattedDate}</p>

            <p>Para activar tu acceso de prueba, haz clic en el siguiente botón:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: linear-gradient(135deg, ${b.primaryColor} 0%, ${b.secondaryColor} 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Activar acceso de prueba
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
            <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
              ${inviteUrl}
            </p>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <p>¿Quieres comprar el acceso completo? Contáctanos por WhatsApp:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${whatsappUrl}" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Contáctanos para comprar
              </a>
            </div>

            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              Este enlace expirará en 2 días. Si no solicitaste esta invitación, puedes ignorar este correo.
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Error sending trial invitation email:", error);
    throw new Error(`Failed to send trial invitation email: ${error.message}`);
  }

  return data;
}

/**
 * Envía el email de restablecimiento de contraseña.
 * El branding se adapta al tenant igual que en el email de invitación.
 */
export async function sendPasswordResetEmail({
  to,
  token,
  userName,
  tenantSlug,
  branding,
}: SendPasswordResetEmailParams) {
  const resend = getResendClient();
  const b = resolveBranding(tenantSlug, branding);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = tenantSlug
    ? isDev
      ? `http://${tenantSlug}.localhost:3000`
      : `https://${tenantSlug}.${rootDomain}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

  const { data, error } = await resend.emails.send({
    from: buildFrom(b),
    to,
    subject: `Restablecer contraseña - ${b.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer contraseña - ${b.name}</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${b.primaryColor} 0%, ${b.secondaryColor} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${b.name}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${b.subtitle}</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Restablecer Contraseña</h2>

            <p>Hola${userName ? ` ${userName}` : ""},</p>

            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${b.name}. Haz clic en el botón de abajo para continuar:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, ${b.primaryColor} 0%, ${b.secondaryColor} 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
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
 * Envía el recibo de pago al estudiante.
 */
export async function sendReceiptEmail({
  to,
  studentName,
  receiptNumber,
  amount,
  paymentType,
  programName,
  tenantSlug,
  branding,
}: SendReceiptEmailParams) {
  const resend = getResendClient();
  const b = resolveBranding(tenantSlug, branding);

  const formattedAmount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

  const { data, error } = await resend.emails.send({
    from: buildFrom(b),
    to,
    subject: `Recibo de Pago ${receiptNumber} - ${b.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${b.primaryColor} 0%, ${b.secondaryColor} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${b.name}</h1>
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
 * Envía un email con plantilla HTML personalizada.
 */
export async function sendTemplateEmail(params: {
  to: string;
  subject: string;
  html: string;
  tenantSlug?: string;
  branding?: TenantEmailBranding;
}): Promise<{ id: string }> {
  const resend = getResendClient();
  const b = resolveBranding(params.tenantSlug, params.branding);

  const { data, error } = await resend.emails.send({
    from: buildFrom(b),
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

export { getResendClient };
