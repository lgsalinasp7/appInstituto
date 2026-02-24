import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Aplicar a la Academia de IA | KaledSoft",
    description: "Postula a la próxima cohorte de la Academia KaledSoft. Formación intensiva en desarrollo de SaaS con agentes de IA. Cupos limitados.",
    keywords: ["Aplicar academia IA", "Inscripción curso IA", "Bootcamp desarrollo Colombia", "KaledSoft Admisiones"],
    alternates: {
        canonical: 'https://kaledsoft.tech/aplicar'
    }
};

export default function AplicarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
