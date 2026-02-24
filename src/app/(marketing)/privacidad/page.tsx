"use client";

import { motion } from "framer-motion";

export default function PrivacidadPage() {
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
                            Política de <span className="text-cyan-500">Privacidad</span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Última actualización: 24 de febrero de 2026
                        </p>
                    </header>

                    <div className="space-y-8 text-slate-300 leading-relaxed text-lg">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">1. Marco Legal (Ley 1581 de 2012)</h2>
                            <p>
                                KaledSoft Technologies, en cumplimiento de lo dispuesto por la Constitución Política de Colombia y la Ley 1581 de 2012 (Habeas Data), manifiesta su compromiso con la protección y el tratamiento adecuado de los datos personales de sus usuarios, estudiantes, clientes y proveedores.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">2. Responsable del Tratamiento</h2>
                            <p>
                                El responsable del tratamiento de sus datos personales es **KaledSoft Technologies**, con domicilio en la ciudad de Montería, Córdoba, Colombia. Para cualquier consulta o requerimiento relacionado con sus datos, puede contactarnos a: <span className="text-cyan-400">legal@kaledsoft.tech</span>.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">3. Finalidad de la Recolección de Datos</h2>
                            <p>Los datos recolectados a través de nuestro sitio web y plataforma SaaS serán utilizados para:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Gestión del proceso de admisión y formación en la Academia.</li>
                                <li>Prestación de servicios de desarrollo de software y soporte técnico.</li>
                                <li>Envío de comunicaciones comerciales, actualizaciones de productos y noticias del ecosistema tecnológico (previa autorización).</li>
                                <li>Mejora de la experiencia de usuario mediante análisis estadísticos anónimos.</li>
                                <li>Cumplimiento de obligaciones legales y contables.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">4. Derechos de los Titulares</h2>
                            <p>De acuerdo con la ley colombiana, usted tiene derecho a:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Conocer, actualizar y rectificar sus datos personales frente a KaledSoft.</li>
                                <li>Solicitar prueba de la autorización otorgada para el tratamiento de su información.</li>
                                <li>Ser informado por KaledSoft respecto del uso que le ha dado a sus datos.</li>
                                <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
                                <li>Revocar la autorización y/o solicitar la supresión del dato en cualquier momento.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">5. Transferencia y Seguridad</h2>
                            <p>
                                KaledSoft no vende ni alquila sus datos personales a terceros. Implementamos medidas de seguridad técnicas y administrativas robustas, incluyendo encriptación de datos y protocolos de acceso restringido, para evitar la pérdida, robo o alteración de su información.
                            </p>
                        </section>

                        <section className="space-y-4 p-8 rounded-3xl bg-slate-900 border border-white/5">
                            <p className="text-slate-400 italic">
                                Al continuar utilizando nuestra plataforma y enviar sus datos a través de nuestros formularios, usted acepta de manera libre, expresa e informada el tratamiento de sus datos personales bajo los términos aquí establecidos.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
