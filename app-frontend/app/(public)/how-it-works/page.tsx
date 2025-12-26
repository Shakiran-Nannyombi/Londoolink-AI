"use client"

import { ScrollReveal } from '@/components/public/ScrollReveal'
import { Search, Brain, Database, FileText } from 'lucide-react'

export default function HowItWorksPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-24 space-y-24">
            <ScrollReveal className="text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">System Architecture</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Understanding the data pipelines and logic flows powering Londoolink AI.
                </p>
            </ScrollReveal>

            <div className="space-y-24 relative">
                {/* Connecting Line */}
                <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary/50 to-primary/5 hidden md:block" />

                <ScrollReveal delay={0.1} direction="left">
                    <Step
                        number="01"
                        title="Data Ingestion"
                        description="The system connects to your disparate data sources—calendars, emails, documents, and code repositories—securely ingesting signals into a unified vector space."
                        icon={Search}
                    />
                </ScrollReveal>

                <ScrollReveal delay={0.2} direction="left">
                    <Step
                        number="02"
                        title="LangGraph Orchestration"
                        description="Specialized agents (Research, Coding, Scheduling) analyze the ingested data. A master orchestrator delegates tasks based on complexity and context."
                        icon={Brain}
                    />
                </ScrollReveal>

                <ScrollReveal delay={0.3} direction="left">
                    <Step
                        number="03"
                        title="RAG Contextual Memory"
                        description="Retrieval-Augmented Generation ensures the AI acts with full historical context. Every decision allows for citation back to the source of truth."
                        icon={Database}
                    />
                </ScrollReveal>

                <ScrollReveal delay={0.4} direction="left">
                    <Step
                        number="04"
                        title="Daily Briefing Generation"
                        description="Synthesizing thousands of data points into a concise, actionable executive summary. Chaos is converted into structured clarity."
                        icon={FileText}
                    />
                </ScrollReveal>
            </div>
        </div>
    )
}

function Step({ number, title, description, icon: Icon }: { number: string, title: string, description: string, icon: any }) {
    return (
        <div className="relative pl-0 md:pl-24 group">
            {/* Node Marker */}
            <div className="hidden md:flex absolute left-6 top-0 w-4 h-4 -ml-2 rounded-full bg-background border-2 border-primary items-center justify-center z-10 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />

            <div className="grid md:grid-cols-[1fr,2fr] gap-8 items-start p-8 rounded-3xl bg-card/50 border border-border group-hover:border-primary/50 transition-colors backdrop-blur-sm">
                <div className="space-y-4">
                    <div className="text-5xl font-mono font-bold text-foreground/10 group-hover:text-primary/20 transition-colors">{number}</div>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4">{title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    )
}
