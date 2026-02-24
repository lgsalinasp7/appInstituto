import { Metadata } from "next";
import { VisionContent } from "@/components/marketing/v2/VisionContent";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Nuestra Visión | Soberanía Tecnológica en Latinoamérica",
    description: "Descubre el propósito de KaledSoft: Descentrar el talento tech de élite y liderar la revolución de la IA desde Montería, Colombia, para el mundo.",
    keywords: ["Visión tecnológica Colombia", "Descentralización del talento", "Soberanía tecnológica Latam", "KaledSoft Propósito"],
    alternates: {
        canonical: 'https://kaledsoft.tech/vision'
    }
};

export default function VisionPage() {
    return (
        <>
            <BreadcrumbSchema items={[
                { name: 'Inicio', url: 'https://kaledsoft.tech' },
                { name: 'Visión', url: 'https://kaledsoft.tech/vision' }
            ]} />
            <VisionContent />
        </>
    );
}
