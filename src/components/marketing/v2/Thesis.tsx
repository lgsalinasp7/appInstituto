"use client";

import { motion } from "framer-motion";

export function ThesisV2() {
    return (
        <section className="py-32 relative">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto space-y-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                            El software cambió.<br />
                            <span className="text-cyan-500">La educación también debe cambiar.</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white">La IA ya no es opcional.</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                Los desarrolladores sin IA están quedando atrás. No se trata de reemplazar personas, sino de amplificar su capacidad técnica y creativa.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white">Diseñar, no solo programar.</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                El futuro no es solo escribir líneas de código. Es diseñar arquitecturas compuestas por agentes inteligentes que ejecutan y resuelven.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
