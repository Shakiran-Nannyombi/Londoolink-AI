"use client"

import { ScrollReveal } from '@/components/public/ScrollReveal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Cpu, Activity, Database, Lock, Zap, Globe, Bell, Calendar, Mail, MessageSquare, ChevronRight, Star } from 'lucide-react'
import { HeroGeometric } from '@/components/public/HeroGeometric'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function HomePage() {
    return (
        <div className="flex flex-col gap-0 pb-24 overflow-x-hidden">

            {/* Hero */}
            <HeroGeometric
                badge="Powered by Auth0 Token Vault · LangGraph · Gemini"
                title1="Your AI agents work."
                title2="You stay in control."
                description="Londoolink is a multi-agent AI system that reads your emails, calendar, and Notion — then acts on your behalf. Securely. Privately. Intelligently."
            />

            {/* Live Demo Strip */}
            <section className="bg-primary/5 border-y border-primary/10 py-4 overflow-hidden">
                <div className="flex gap-8 animate-marquee whitespace-nowrap">
                    {[
                        "📧 Email Agent analyzing 3 urgent messages...",
                        "📅 Calendar Agent: Meeting at 3pm needs prep",
                        "🔒 Auth0 Token Vault securing your credentials",
                        "⚡ Priority Agent: 2 tasks need immediate action",
                        "📝 Notion Agent syncing workspace pages...",
                        "🚨 SMS Alert sent for urgent deadline",
                    ].map((item, i) => (
                        <span key={i} className="text-sm text-muted-foreground px-4">{item}</span>
                    ))}
                    {[
                        "📧 Email Agent analyzing 3 urgent messages...",
                        "📅 Calendar Agent: Meeting at 3pm needs prep",
                        "🔒 Auth0 Token Vault securing your credentials",
                        "⚡ Priority Agent: 2 tasks need immediate action",
                        "📝 Notion Agent syncing workspace pages...",
                        "🚨 SMS Alert sent for urgent deadline",
                    ].map((item, i) => (
                        <span key={i + 10} className="text-sm text-muted-foreground px-4">{item}</span>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="px-6 py-24 max-w-7xl mx-auto w-full">
                <ScrollReveal className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">How Londoolink Works</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Three steps from signup to your first AI-powered briefing.
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    {[
                        {
                            step: "01",
                            icon: Shield,
                            title: "Sign in with Auth0",
                            description: "Secure authentication via Google or email. Auth0 Token Vault stores your OAuth credentials — your agents never touch raw tokens.",
                            color: "text-blue-500",
                            bg: "bg-blue-500/10",
                        },
                        {
                            step: "02",
                            icon: Globe,
                            title: "Connect Your Services",
                            description: "Link Google (Gmail + Calendar) and Notion. One click — Auth0 handles the OAuth flow and securely vaults your access tokens.",
                            color: "text-purple-500",
                            bg: "bg-purple-500/10",
                        },
                        {
                            step: "03",
                            icon: Zap,
                            title: "Get Your Daily Briefing",
                            description: "Your AI agents analyze your inbox, calendar, and Notion pages. Urgent tasks trigger SMS alerts. You stay focused.",
                            color: "text-primary",
                            bg: "bg-primary/10",
                        },
                    ].map((item, i) => (
                        <ScrollReveal key={i} delay={i * 0.15}>
                            <div className="relative p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all group">
                                <span className="absolute top-6 right-6 text-5xl font-black text-muted/10 group-hover:text-muted/20 transition-colors">{item.step}</span>
                                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-6`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Agent Showcase */}
            <section className="px-6 py-24 bg-card/30 border-y border-border/50">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Meet Your AI Agents</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            A team of specialized agents coordinated by LangGraph, each an expert in their domain.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: "📧", name: "Email Agent", desc: "Reads and prioritizes your Gmail. Surfaces urgent messages and drafts responses.", color: "from-red-500/10 to-red-500/5" },
                            { icon: "📅", name: "Calendar Agent", desc: "Tracks your schedule, flags conflicts, and prepares you for upcoming meetings.", color: "from-blue-500/10 to-blue-500/5" },
                            { icon: "📝", name: "Notion Agent", desc: "Reads your Notion workspace to surface relevant pages and action items.", color: "from-purple-500/10 to-purple-500/5" },
                            { icon: "⚡", name: "Priority Agent", desc: "Synthesizes all agent outputs into a ranked daily briefing with SMS alerts for urgent tasks.", color: "from-yellow-500/10 to-yellow-500/5" },
                        ].map((agent, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className={`p-6 rounded-2xl bg-gradient-to-br ${agent.color} border border-border hover:border-primary/30 transition-all h-full`}>
                                    <div className="text-4xl mb-4">{agent.icon}</div>
                                    <h3 className="font-bold text-lg mb-2">{agent.name}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{agent.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="px-6 py-24 max-w-7xl mx-auto w-full">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <ScrollReveal direction="left" className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
                            <Lock className="w-4 h-4" />
                            Auth0 Token Vault
                        </div>
                        <h2 className="text-4xl font-bold">Your credentials never leave Auth0</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            When your agents need to access Gmail or Notion, they request tokens from Auth0 Token Vault — not from your database. Your raw OAuth tokens are never stored in Londoolink.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "OAuth tokens stored in Auth0 Token Vault",
                                "Agents operate with scoped, revocable permissions",
                                "MFA enforced via Auth0 Universal Login",
                                "Full audit log of every agent action",
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </ScrollReveal>

                    <ScrollReveal direction="right">
                        <div className="p-8 rounded-3xl bg-card border border-border space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                <Shield className="w-5 h-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">Token Vault Active</p>
                                    <p className="text-xs text-muted-foreground">Google & Notion tokens secured</p>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <Mail className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Email Agent</p>
                                    <p className="text-xs text-muted-foreground">Reading with gmail.readonly scope only</p>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                <Database className="w-5 h-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium">Notion Agent</p>
                                    <p className="text-xs text-muted-foreground">read_content scope — no write access</p>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                <Bell className="w-5 h-5 text-yellow-500" />
                                <div>
                                    <p className="text-sm font-medium">SMS Alert Sent</p>
                                    <p className="text-xs text-muted-foreground">Urgent: Client demo at 3pm today</p>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 -skew-y-3 z-0" />
                <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                    <h2 className="text-5xl font-bold">Ready to reclaim your focus?</h2>
                    <p className="text-xl text-muted-foreground pb-4">
                        Join the waitlist or try the demo — no credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="h-14 px-12 text-lg rounded-full shadow-2xl hover:scale-105 transition-transform">
                                Get Started Free
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>
                        </Link>
                        <Link href="/login?demo=true">
                            <Button size="lg" variant="outline" className="h-14 px-12 text-lg rounded-full hover:scale-105 transition-transform">
                                <Star className="w-5 h-5 mr-2" />
                                Try Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
