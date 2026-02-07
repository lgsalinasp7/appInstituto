import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Cpu, GraduationCap, Server, ShieldCheck, LineChart } from "lucide-react";

const services = [
    {
        title: "Desarrollo de Software",
        description: "Aplicaciones web y móviles de alto impacto, diseñadas para escalar y enamorar a tus usuarios.",
        icon: Laptop,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    {
        title: "Inteligencia Artificial",
        description: "Integración de modelos LLM, automatización inteligente y análisis predictivo para tu negocio.",
        icon: Cpu,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    {
        title: "Academia Tech",
        description: "Formación especializada en desarrollo full-stack e ingeniería de prompts para equipos corporativos.",
        icon: GraduationCap,
        color: "text-green-400",
        bg: "bg-green-500/10",
    },
    {
        title: "Infraestructura Cloud",
        description: "Arquitecturas serverless y microservicios robustos en AWS, Azure y Google Cloud.",
        icon: Server,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
    },
    {
        title: "Ciberseguridad",
        description: "Auditorías y protección avanzada para asegurar la integridad de tus datos críticos.",
        icon: ShieldCheck,
        color: "text-red-400",
        bg: "bg-red-500/10",
    },
    {
        title: "Consultoría Digital",
        description: "Estrategia tecnológica para transformar procesos y aumentar la rentabilidad.",
        icon: LineChart,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
    },
];

export function Services() {
    return (
        <section id="services" className="py-24 bg-slate-900 text-white relative">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Servicios</span>
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Combinamos excelencia técnica con visión de negocio para entregar resultados extraordinarios.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <Card
                            key={index}
                            className="bg-white/5 border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader>
                                <div className={`w-14 h-14 rounded-2xl ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <service.icon className={`w-7 h-7 ${service.color}`} />
                                </div>
                                <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-400 text-base">
                                    {service.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
