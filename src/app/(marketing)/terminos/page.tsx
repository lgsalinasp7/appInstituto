"use client";

import { motion } from "framer-motion";

export default function TerminosPage() {
    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <header className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black text-white font-display">
                            Términos y <span className="text-purple-500">Condiciones</span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Acuerdo legal de prestación de servicios y uso de plataforma.
                        </p>
                    </header>

                    <div className="space-y-8 text-slate-300 leading-relaxed text-lg">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">1. Aceptación del Acuerdo</h2>
                            <p>
                                Al acceder y utilizar el sitio web kaledsoft.tech y sus servicios relacionados (la "Plataforma"), usted acepta estar vinculado por estos términos y condiciones, así como por nuestra Política de Privacidad. Si no está de acuerdo con alguna parte de estos términos, no deberá utilizar nuestros servicios.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">2. Naturaleza de los Servicios</h2>
                            <p>
                                KaledSoft Technologies ofrece servicios de:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400">
                                <li>**Academia**: Formación técnica intensiva en desarrollo de software e inteligencia artificial.</li>
                                <li>**Software Factory**: Desarrollo y consultoría de productos digitales y soluciones SaaS.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">3. Propiedad Intelectual</h2>
                            <p>
                                Todo el contenido, código fuente, logotipos, materiales didácticos, metodologías y diseños presentados en la Plataforma son propiedad exclusiva de KaledSoft Technologies o se utilizan bajo licencia. Queda estrictamente prohibida la reproducción, distribución o modificación sin autorización previa y por escrito.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">4. Uso de la Plataforma SaaS</h2>
                            <p>
                                KaledSoft otorga una licencia limitada, no exclusiva y revocable para el acceso personal al software proporcionado como servicio. El usuario se compromete a no realizar ingeniería inversa, no intentar acceder a zonas no autorizadas y no utilizar el servicio para fines ilícitos o de competencia desleal.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">5. Derecho de Retracto (Ley 1480 de 2011)</h2>
                            <p>
                                De acuerdo con el Estatuto del Consumidor en Colombia (Ley 1480 de 2011, Art. 47), el usuario tiene derecho a retractarse de la compra de servicios de educación o suscripciones SaaS dentro de los cinco (5) días hábiles siguientes a la contratación, siempre que el servicio no haya comenzado a ejecutarse.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">6. Limitación de Responsabilidad</h2>
                            <p>
                                KaledSoft se esfuerza por mantener la Plataforma disponible el 99.9% del tiempo, pero no garantiza que el servicio sea ininterrumpido. No seremos responsables por daños indirectos, pérdida de datos o lucros cesantes derivados del mal uso de la plataforma por parte del usuario o fallas en servicios de terceros (proveedores de nube, IA, etc.).
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">7. Ley Aplicable y Jurisdicción</h2>
                            <p>
                                Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia será resuelta ante los tribunales competentes de la ciudad de Montería, Córdoba.
                            </p>
                        </section>

                        <section className="pt-8 border-t border-white/5">
                            <p className="text-sm text-slate-500">
                                KaledSoft se reserva el derecho de modificar estos términos en cualquier momento. Los cambios sustanciales serán comunicados a través de la plataforma o vía correo electrónico.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
