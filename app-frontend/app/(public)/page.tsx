"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Shield, Cpu, Activity, Database, Lock, Zap, Globe } from 'lucide-react'
import { SplineScene } from '@/components/public/SplineScene'
import { ScrollReveal } from '@/components/public/ScrollReveal'

export default function HomePage() {
    return (
        <div className="flex flex-col gap-0 pb-24 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden">

                {/* Spline Background Layer */}
                <div className="absolute inset-0 z-0 opacity-60">
                    {/* Placeholder Spline Scene - User to replace URL */}
                    <SplineScene scene="https://prod.spline.design/e15CffR2urGoKM81/scene.splinecode" />
                </div>

                {/* Content Layer */}
                <div className="relative z-10 max-w-5xl mx-auto space-y-8 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-md"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        System Online v1.0
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Order emerging from <br className="hidden md:block" />
                        <span className="text-primary glow-text">chaos</span>.
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        The central nervous system for your digital life.
                        <span className="text-foreground font-semibold"> Londoolink AI </span>
                        is stateful infrastructure that tracks, prioritizes, and executes—so you don't have to.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <Link href="/login">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                                Initialize System <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/how-it-works">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full backdrop-blur-md border-primary/20 hover:bg-primary/10">
                                View Architecture
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Core Philosophy */}
            <section className="px-6 py-32 bg-card/30 border-y border-border/50 backdrop-blur-sm relative">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Intelligence, Not Just Text</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We moved beyond simple chatbots. Londoolink is built on a foundation of secure, persistent memory and agentic capabilities.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ScrollReveal delay={0.1}>
                            <FeatureCard
                                icon={Cpu}
                                title="Orchestration Core"
                                description="A master agent routing tasks to specialized sub-agents. It understands context, dependencies, and priority."
                            />
                        </ScrollReveal>
                        <ScrollReveal delay={0.2}>
                            <FeatureCard
                                icon={Shield}
                                title="Zero-Trust Security"
                                description="Your data is encrypted at rest and in transit. Our architecture ensures distinct isolation between memory cores."
                            />
                        </ScrollReveal>
                        <ScrollReveal delay={0.3}>
                            <FeatureCard
                                icon={Activity}
                                title="Stateful Continuity"
                                description="Londoolink remembers. Unlike stateless sessions, it maintains long-term context of your projects and goals."
                            />
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Capabilities Grid */}
            <section className="px-6 py-32">
                <div className="max-w-7xl mx-auto space-y-20">
                    <ScrollReveal direction="left">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-4xl font-bold">Data Ingestion Pipeline</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Connect disjointed streams of information. Emails, calendars, code repositories, and documents are ingested into a unified vector store, ready for retrieval.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg"><Database className="w-5 h-5 text-primary" /></div>
                                        <span>Unified Vector Database</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg"><Lock className="w-5 h-5 text-primary" /></div>
                                        <span>Private Data Vaults</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex-1 h-[400px] w-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border border-border/50 flex items-center justify-center relative overflow-hidden group">
                                {/* Visual representation placeholder */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <div className="relative z-10 grid grid-cols-2 gap-4 animate-pulse">
                                    <div className="w-24 h-32 bg-background rounded-xl border border-border shadow-lg rotate-[-6deg]"></div>
                                    <div className="w-24 h-32 bg-background rounded-xl border border-border shadow-lg rotate-[6deg] translate-y-8"></div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal direction="right">
                        <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-4xl font-bold">Active Agentic Workflow</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Passive tools wait for you. Londoolink proactively monitors your digital environment, preparing briefings, scheduling tasks, and alerting you to critical anomalies.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg"><Zap className="w-5 h-5 text-primary" /></div>
                                        <span>Proactive Briefings</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg"><Globe className="w-5 h-5 text-primary" /></div>
                                        <span>Cross-Platform Execution</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex-1 h-[400px] w-full bg-gradient-to-bl from-accent/5 to-primary/5 rounded-3xl border border-border/50 flex items-center justify-center relative overflow-hidden">
                                {/* Visual representation placeholder */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <div className="w-64 h-64 border border-primary/20 rounded-full flex items-center justify-center relative">
                                    <div className="absolute inset-0 border border-primary/10 rounded-full animate-ping"></div>
                                    <div className="w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 -skew-y-3 z-0"></div>
                <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                    <h2 className="text-5xl font-bold">Stop Managing. Start Creating.</h2>
                    <p className="text-xl text-muted-foreground pb-8">
                        Reclaim the 30% of your day lost to context switching and digital housekeeping.
                    </p>
                    <Link href="/login">
                        <Button size="lg" className="h-14 px-12 text-lg rounded-full shadow-2xl hover:scale-105 transition-transform">
                            Access Command Center
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="group p-8 rounded-3xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    )
}
