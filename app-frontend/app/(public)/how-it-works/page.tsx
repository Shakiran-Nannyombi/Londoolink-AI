"use client"

import { ScrollReveal } from '@/components/public/ScrollReveal'
import { TutorialDemo } from '@/components/public/TutorialDemo'
import { Search, Brain, Database, FileText, Shield, Zap, Bell, Lock } from 'lucide-react'

export default function HowItWorksPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-24 space-y-24">
            <ScrollReveal className="text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">System Architecture</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Understanding the data pipelines and logic flows powering Londoolink AI.
                </p>
            </ScrollReveal>

            {/* Tutorial Demo */}
            <ScrollReveal delay={0.1} className="w-full aspect-video rounded-3xl overflow-hidden border border-border/50 shadow-2xl relative group bg-card/50 backdrop-blur-sm flex items-center justify-center p-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                <TutorialDemo />
            </ScrollReveal>

            <div className="space-y-24 relative">
                <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary/50 to-primary/5 hidden md:block" />

                <ScrollReveal delay={0.2} direction="left">
                    <Step
                        number="01"
                        title="Auth0 Universal Login"
                        description="All authentication flows through Auth0 — Google OAuth, email/password, and MFA. Your credentials are never stored in Londoolink's database. Auth0 Token Vault holds your OAuth tokens securely."
                        icon={Shield}
                    />
                </ScrollReveal>

                <ScrollReveal delay={0.3} direction="left">
                    <Step
                        number="02"
                        title="Service Connection via Token Vault"
                        description="When you connect Google or Notion, Auth0 handles the OAuth flow and stores your access tokens in Token Vault. Your agents request tokens on demand — scoped, audited, and revocable."
                        icon={Lock}
                    />
                </ScrollReveal>

                <ScrollReveal delay={0.4} direction="left">
                    <Step
                        number="03"
                        title="LangGraph Multi-Agent Orchestration"
                        description="Specialized agents — Email, Calendar, Notion, and Priority — run in parallel via LangGraph. A coordinator routes tasks to the right agent based on context and data availability."
                        icon={Brain}
                    />
                </ScrollReveal>

                <ScrollReveal delay={0.5} direction="left">
                    <Step
                        number="04"
                        title="Backboard.io Persistent Memory & RAG"
                        description="Powered by Backboard.io, our agents have long-term memory and cloud-based RAG. The AI remembers your preferences across sessions, stores documents with semantic search, and maintains conversation threads for follow-up questions."
                        icon={Database}
                    />
                </ScrollReveal>

                <ScrollReveal delay={0.6} direction="left">
                    <Step
                        number="05"
                        title="Daily Briefing + SMS Alerts"
                        description="The Priority Agent synthesizes all agent outputs into a ranked daily briefing. Urgent tasks trigger SMS alerts via Africa's Talking so you never miss a critical deadline."
                        icon={Bell}
                    />
                </ScrollReveal>

                <ScrollReveal delay={0.7} direction="left">
                    <Step
                        number="06"
                        title="Audit Log & Access Control"
                        description="Every agent action is logged in a tamper-evident audit trail. You can review what your agents accessed, when, and why — full transparency at all times."
                        icon={FileText}
                    />
                </ScrollReveal>
            </div>
        </div>
    )
}

function Step({ number, title, description, icon: Icon }: {
    number: string
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
}) {
    return (
        <div className="relative pl-0 md:pl-24 group">
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
                    <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
                </div>
            </div>
        </div>
    )
}
