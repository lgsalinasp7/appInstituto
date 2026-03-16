import { Metadata } from "next";
import { AcademiaContent } from "@/components/marketing/v2/AcademiaContent";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { academiaFAQs } from "@/lib/faq-data";

export const metadata: Metadata = {
    title: "Academia de Inteligencia Artificial en Colombia",
    description: "Únete a la mejor academia de IA y SaaS en Colombia. Formación de élite en agentes de IA, Next.js y arquitectura moderna para desarrolladores y fundadores.",
    keywords: ["Academia IA Colombia", "Curso inteligencia artificial Colombia", "Aprender SaaS", "Desarrollo de software Colombia", "Kaledacademy"],
    alternates: {
        canonical: 'https://kaledsoft.tech/formacion'
    }
};

export default function FormacionPage() {
    return (
        <>
            <BreadcrumbSchema items={[
                { name: 'Inicio', url: 'https://kaledsoft.tech' },
                { name: 'Formación', url: 'https://kaledsoft.tech/formacion' }
            ]} />
            <FAQSchema items={academiaFAQs} />
            <AcademiaContent />
        </>
    );
}
