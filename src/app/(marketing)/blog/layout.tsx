import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog de Ingeniería & IA | KaledSoft",
    description: "Perspectivas técnicas sobre el futuro del software, agentes inteligentes y la revolución tecnológica desde Montería, Colombia.",
    keywords: ["Blog IA Colombia", "Desarrollo software blog", "Ingeniería de software", "Agentes inteligentes", "KaledSoft Blog"],
    alternates: {
        canonical: 'https://kaledsoft.tech/blog'
    }
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
