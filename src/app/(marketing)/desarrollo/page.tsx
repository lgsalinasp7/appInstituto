import { Metadata } from "next";
import { DesarrolloContent } from "@/components/marketing/v2/DesarrolloContent";

export const metadata: Metadata = {
    title: "Desarrollo de Software y Soluciones de IA en Montería",
    description: "SaaS Factory y Laboratorio de IA en Colombia. Construimos aplicaciones escalables de alto impacto, agentes autónomos y automatización empresarial.",
    keywords: ["Desarrollo de software Montería", "Empresa de IA Colombia", "SaaS Factory Latam", "Automatización de procesos IA", "KaledSoft Desarrollo"],
};

export default function DesarrolloPage() {
    return <DesarrolloContent />;
}
