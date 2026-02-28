/**
 * Página de Gracias - Confirmación de registro
 */

import { ThankYouCard } from '@/components/landing/ThankYouCard';

export default function GraciasPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '573046532363';

  return (
    <ThankYouCard
      title="¡Registro Exitoso!"
      message="Tu cupo ha sido reservado. Revisa tu email para más detalles."
      nextSteps={[
        'Revisa tu bandeja de entrada (y spam) para confirmar el registro',
        'Te contactaremos por WhatsApp con el enlace de la masterclass',
        'Prepárate para una sesión increíble que transformará tu perspectiva',
      ]}
      whatsappNumber={whatsappNumber}
      funnel="lp_dynamic"
    />
  );
}
