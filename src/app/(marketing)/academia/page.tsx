import { Metadata } from "next";
import { AcademiaContent } from "@/components/marketing/v2/AcademiaContent";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { academiaFAQs } from "@/lib/faq-data";

export const metadata: Metadata = {
    title: "Academia de Inteligencia Artificial en Montería",
    description: "Únete a la mejor academia de IA y SaaS en Colombia. Formación de élite en agentes de IA, Next.js y arquitectura moderna para desarrolladores y fundadores.",
    keywords: ["Academia IA Montería", "Curso inteligencia artificial Colombia", "Aprender SaaS", "Desarrollo de software Montería", "KaledSoft Academia"],
    alternates: {
        canonical: 'https://kaledsoft.tech/academia'
    }
};

export default function AcademiaPage() {
    return (
        <>
            <BreadcrumbSchema items={[
                { name: 'Inicio', url: 'https://kaledsoft.tech' },
                { name: 'Academia', url: 'https://kaledsoft.tech/academia' }
            ]} />
            <FAQSchema items={academiaFAQs} />
            <AcademiaContent />
        </>
    );
}
