import { NavBar } from "./NavBar";
import { Hero } from "./Hero";
import { Services } from "./Services";
import { Features } from "./Features";
import { Pricing } from "./Pricing";
import { Footer } from "./Footer";
import Link from "next/link";
import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Maria Fernanda Lopez",
        role: "Directora Academica",
        institution: "Instituto EDUTEC",
        text: "KaledSoft transformo la forma en que gestionamos nuestra institucion. Ahora tenemos control total de pagos y estudiantes en tiempo real.",
    },
    {
        name: "Carlos Andres Rivera",
        role: "Administrador",
        institution: "Academia Tecnica del Sur",
        text: "La plataforma es increiblemente intuitiva. Nuestro equipo la adopto en menos de una semana y la productividad aumento un 40%.",
    },
    {
        name: "Laura Patricia Gomez",
        role: "Coordinadora de Admisiones",
        institution: "Centro de Formacion Integral",
        text: "El seguimiento de prospectos y la automatizacion de comunicaciones nos ayudo a duplicar nuestras matriculas en un semestre.",
    },
];

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-slate-950 font-sans selection:bg-cyan-500/30">
            <NavBar />
            <Hero />
            <Services />
            <Features />

            {/* Testimonials Section */}
            <section className="py-24 bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Lo que dicen nuestros clientes
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Instituciones educativas que ya confiaron en KaledSoft para transformar su gestion.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all"
                            >
                                <Quote className="w-8 h-8 text-cyan-500/30 mb-4" />
                                <p className="text-gray-300 mb-6 leading-relaxed">
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <div className="border-t border-slate-700 pt-4">
                                    <p className="font-semibold text-white">{t.name}</p>
                                    <p className="text-sm text-cyan-400">{t.role}</p>
                                    <p className="text-sm text-gray-500">{t.institution}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Pricing />

            {/* CTA Section */}
            <section id="contact" className="py-20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Listo para transformar tu institucion?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Comienza tu prueba gratuita de 14 dias hoy. No requiere tarjeta de credito.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link 
                            href="mailto:ventas@kaledsoft.tech?subject=Solicitud%20de%20Demo&body=Hola,%20me%20gustaria%20agendar%20una%20demo%20de%20la%20plataforma."
                            className="bg-white text-cyan-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl shadow-xl transition-all hover:scale-105"
                        >
                            Solicitar Demo
                        </Link>
                        <Link 
                            href="https://wa.me/573001234567?text=Hola%2C%20me%20interesa%20conocer%20mas%20sobre%20KaledSoft"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-cyan-900 font-bold py-4 px-8 rounded-xl transition-all"
                        >
                            Escribir por WhatsApp
                        </Link>
                        <Link 
                            href="mailto:ventas@kaledsoft.tech?subject=Consulta%20sobre%20Planes"
                            className="bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white font-bold py-4 px-8 rounded-xl transition-all"
                        >
                            Hablar con Ventas
                        </Link>
                    </div>
                    <p className="text-sm text-gray-400 mt-6">
                        O escribenos directamente a{" "}
                        <a href="mailto:ventas@kaledsoft.tech" className="text-cyan-400 hover:text-cyan-300 underline">
                            ventas@kaledsoft.tech
                        </a>
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
