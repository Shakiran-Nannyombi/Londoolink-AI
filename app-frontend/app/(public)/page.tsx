"use client"

import { ScrollReveal } from '@/components/public/ScrollReveal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Cpu, Activity, Database, Lock, Zap, Globe } from 'lucide-react'
import { HeroGeometric } from '@/components/public/HeroGeometric'

export default function HomePage() {
    return (
        <div className="flex flex-col gap-0 pb-24 overflow-x-hidden">

            {/* Geometric Hero Section */}
            <HeroGeometric
                badge="System Online v1.0"
                title1="Order emerging from"
                title2="Chaos"
                description="The central nervous system for your digital life. Londoolink AI is stateful infrastructure that tracks, prioritizes, and executes—so you don't have to."
            />

            {/* Core Philosophy */}
            <section className="px-6 py-32 bg-card/30 border-y border-border/50 backdrop-blur-sm relative -mt-20 z-10">
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
                                <img
                                    src="/images/data-ingestion.png"
                                    alt="Data Ingestion Pipeline"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
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
                                <img
                                    src="/images/agentic-workflow.png"
                                    alt="Active Agentic Workflow"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
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
