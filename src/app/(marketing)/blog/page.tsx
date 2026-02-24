"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/lib/blog-data";
import { ArrowRight, Calendar, User, Tag } from "lucide-react";

export default function BlogPage() {
    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-6">

                {/* Header */}
                <header className="max-w-3xl mb-20 space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-white leading-tight font-display"
                    >
                        Blog de <br />
                        <span className="text-cyan-500">Ingeniería & IA</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 font-medium leading-relaxed"
                    >
                        Perspectivas técnicas sobre el futuro del software, agentes inteligentes y la revolución tecnológica desde el Caribe colombiano.
                    </motion.p>
                </header>

                {/* Blog Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post, i) => (
                        <motion.article
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative flex flex-col bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all"
                        >
                            <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-cyan-600/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
                                        {post.category}
                                    </span>
                                </div>
                            </Link>

                            <div className="p-8 flex-1 flex flex-col space-y-4">
                                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5 line-clamp-1">
                                        <Calendar className="w-3 h-3" />
                                        {post.date}
                                    </span>
                                    <span className="flex items-center gap-1.5 line-clamp-1">
                                        <User className="w-3 h-3" />
                                        {post.author}
                                    </span>
                                </div>

                                <Link href={`/blog/${post.slug}`} className="block group">
                                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-500 transition-colors leading-tight">
                                        {post.title}
                                    </h3>
                                </Link>

                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                    {post.description}
                                </p>

                                <div className="pt-4 mt-auto">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-cyan-500 transition-colors group/link"
                                    >
                                        Leer más
                                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Newsletter / CTA */}
                <section className="mt-40 p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-cyan-900/20 to-slate-900/50 border border-white/5 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-3xl md:text-5xl font-black text-white font-display">No te pierdas nada.</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">Suscríbete para recibir análisis técnicos exclusivos y actualizaciones sobre el ecosistema de IA.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 flex-1"
                            />
                            <button className="px-8 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all">
                                Suscribirse
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
