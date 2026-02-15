import { AlertTriangle, Clock } from "lucide-react";

interface SubscriptionWarningBannerProps {
    daysRemaining: number;
}

export function SubscriptionWarningBanner({ daysRemaining }: SubscriptionWarningBannerProps) {
    if (daysRemaining > 7) return null;

    const isExpired = daysRemaining <= 0;

    return (
        <div className={`w-full p-2 text-center text-sm font-medium flex items-center justify-center gap-2 ${isExpired
                ? "bg-red-500 text-white"
                : "bg-amber-400 text-amber-950"
            }`}>
            {isExpired ? (
                <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Tu suscripción ha vencido. Por favor contacta a soporte para renovar.</span>
                </>
            ) : (
                <>
                    <Clock className="w-4 h-4" />
                    <span>Tu suscripción vence en {daysRemaining} días. Contacta a soporte para evitar interrupciones.</span>
                </>
            )}
        </div>
    );
}
