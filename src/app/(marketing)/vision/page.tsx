import { Metadata } from "next";
import { VisionContent } from "@/components/marketing/v2/VisionContent";

export const metadata: Metadata = {
    title: "Nuestra Visión | Soberanía Tecnológica en Latinoamérica",
    description: "Descubre el propósito de KaledSoft: Descentrar el talento tech de élite y liderar la revolución de la IA desde Montería, Colombia, para el mundo.",
    keywords: ["Visión tecnológica Colombia", "Descentralización del talento", "Soberanía tecnológica Latam", "KaledSoft Propósito"],
};

export default function VisionPage() {
    return <VisionContent />;
}
