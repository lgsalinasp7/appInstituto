import { Metadata } from "next";
import { DesarrolloContent } from "@/components/marketing/v2/DesarrolloContent";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { desarrolloFAQs } from "@/lib/faq-data";

export const metadata: Metadata = {
    title: "Desarrollo de Software y Soluciones de IA en Montería",
    description: "SaaS Factory y Laboratorio de IA en Colombia. Construimos aplicaciones escalables de alto impacto, agentes autónomos y automatización empresarial.",
    keywords: ["Desarrollo de software Montería", "Empresa de IA Colombia", "SaaS Factory Latam", "Automatización de procesos IA", "KaledSoft Desarrollo"],
    alternates: {
        canonical: 'https://kaledsoft.tech/desarrollo'
    }
};

export default function DesarrolloPage() {
    return (
        <>
            <BreadcrumbSchema items={[
                { name: 'Inicio', url: 'https://kaledsoft.tech' },
                { name: 'Desarrollo', url: 'https://kaledsoft.tech/desarrollo' }
            ]} />
            <FAQSchema items={desarrolloFAQs} />
            <DesarrolloContent />
        </>
    );
}
