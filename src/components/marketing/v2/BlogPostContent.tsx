"use client";

import { motion } from "framer-motion";
import { BlogPost } from "@/lib/blog-data";
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BlogPostContentProps {
    post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
    return (
        <article className="pt-32 pb-40">
            <div className="container mx-auto px-6 max-w-4xl">

                {/* Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-cyan-500 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al Blog
                    </Link>
                </motion.div>

                {/* Hero Header */}
                <header className="space-y-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-bold uppercase tracking-widest"
                    >
                        <span className="px-4 py-1.5 bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 rounded-full backdrop-blur-sm">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                        </span>
                        <span className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {post.author}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight font-display"
                    >
                        {post.title}
                    </motion.h1>
                </header>

                {/* Main Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/5 mb-20 group"
                >
                    <Image
                        src={post.image}
                        alt={`${post.title} - Análisis técnico de KaledSoft sobre ${post.category}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/20" />
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-invert prose-cyan max-w-none 
                        prose-headings:font-display prose-headings:font-black prose-headings:text-white
                        prose-p:text-slate-400 prose-p:text-lg prose-p:leading-relaxed
                        prose-strong:text-white prose-strong:font-bold
                        prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-500/5 prose-blockquote:p-6 prose-blockquote:rounded-2xl prose-blockquote:italic
                        prose-li:text-slate-400
                        prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8
                        prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6
                    "
                >
                    {/* Basic Markdown Rendering Simulation */}
                    <div dangerouslySetInnerHTML={{
                        __html: post.content
                            .replace(/^# (.*$)/gim, '<h1 class="hidden">$1</h1>')
                            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                            .replace(/^\*\* (.*$)/gim, '<strong>$1</strong>')
                            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
                            .replace(/^\- (.*$)/gim, '<li>$1</li>')
                            .split('\n\n').map(p => {
                                if (p.trim().startsWith('<h') || p.trim().startsWith('<li') || p.trim().startsWith('<block')) return p;
                                return `<p>${p.trim()}</p>`;
                            }).join('')
                    }} />
                </motion.div>

                {/* Share / Social */}
                <div className="mt-24 pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-white font-bold">{post.author}</div>
                            <div className="text-slate-500 text-sm">Escrito por la ingeniería detrás de KaledSoft</div>
                        </div>
                    </div>
                    <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold">
                        <Share2 className="w-4 h-4" />
                        Compartir Artículo
                    </button>
                </div>

            </div>
        </article>
    );
}
