'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Code2, BrainCircuit, Rocket } from "lucide-react";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-24 lg:pt-20 overflow-hidden bg-slate-950">
            {/* Background Gradients */}
            <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[128px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[128px] mix-blend-screen" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

            <div className="container relative mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        Innovación en cada línea de código
                    </div>

                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                        Transformamos Ideas en <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                            Realidad Digital
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        Somos una fábrica de software de élite y una academia de Inteligencia Artificial.
                        Construimos el futuro tecnológico de tu empresa con soluciones escalables y diseño premium.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Button
                            size="lg"
                            className="bg-cyan-600 hover:bg-cyan-500 text-white text-lg h-14 px-8 rounded-xl shadow-[0_0_30px_rgba(8,145,178,0.4)] transition-all hover:scale-105"
                        >
                            Iniciar Proyecto <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 text-lg h-14 px-8 rounded-xl backdrop-blur-sm font-semibold transition-all"
                        >
                            Explorar Academia
                        </Button>
                    </div>

                    <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-gray-500">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-cyan-500" />
                            <span>Desarrollo a Medida</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-purple-500" />
                            <span>Soluciones IA</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-orange-500" />
                            <span>Escalabilidad</span>
                        </div>
                    </div>
                </div>

                {/* Visual Element / 3D Abstract Representation */}
                <div className="relative h-[600px] w-full hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {/* Abstract Code visualization */}
                        <div className="relative w-96 h-96 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-700">
                            <div className="flex gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="space-y-3 font-mono text-sm">
                                <div className="text-purple-400">const <span className="text-yellow-300">future</span> = await <span className="text-blue-400">KaledSoft</span>.build();</div>
                                <div className="text-gray-500">// Implementando IA avanzada...</div>
                                <div className="h-2 w-3/4 bg-white/10 rounded animate-pulse" />
                                <div className="h-2 w-1/2 bg-white/10 rounded animate-pulse delay-75" />
                                <div className="h-2 w-2/3 bg-white/10 rounded animate-pulse delay-150" />
                                <div className="mt-8 p-4 bg-cyan-950/30 rounded border border-cyan-500/20">
                                    <div className="text-cyan-400">Success! Project deployed.</div>
                                    <div className="text-xs text-cyan-600 mt-1">Performance: 100%</div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -right-12 -top-12 bg-black/80 p-4 rounded-xl border border-white/10 shadow-xl backdrop-blur-md animate-bounce delay-700">
                                <BrainCircuit className="w-8 h-8 text-purple-400" />
                            </div>
                            <div className="absolute -left-8 -bottom-8 bg-black/80 p-4 rounded-xl border border-white/10 shadow-xl backdrop-blur-md animate-bounce delay-1000">
                                <Rocket className="w-8 h-8 text-orange-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
