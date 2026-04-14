"use client"

import { motion } from 'framer-motion'
import { Quote, Shield, Cpu, Zap, Globe, Lock, Bell, Database } from 'lucide-react'
import { ScrollReveal } from '@/components/public/ScrollReveal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-24 space-y-24">

            {/* Vision */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                        Built for the Auth0 AI Agents Hackathon 2025
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Your AI acts. You stay in control.</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Londoolink is a multi-agent AI system that manages your digital life — emails, calendar, Notion — while keeping your credentials locked in Auth0 Token Vault and your preferences remembered by Backboard.io's persistent memory.
                    </p>
                    <Link href="/login?demo=true">
                        <Button size="lg" className="rounded-full">Try the Demo</Button>
                    </Link>
                </motion.div>
                <motion.div
                    className="relative aspect-square rounded-3xl overflow-hidden border border-border shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <img src="/images/vision-vision.png" alt="Vision of Londoolink" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </motion.div>
            </div>

            {/* Name meaning */}
            <motion.section
                className="bg-card/30 p-8 md:p-12 rounded-3xl border border-border relative overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <Quote className="absolute top-8 left-8 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
                <div className="relative z-10 space-y-6 max-w-3xl">
                    <h2 className="text-3xl font-bold">The Meaning of "Londoolink"</h2>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                        "To track, to follow, to care." — derived from Luganda (Okulondoola)
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        We are not building another chatbot. We are building a system that follows your digital footprint — tracking what matters so you don't have to. Your AI agents act on your behalf, but you always stay in control of what they can access.
                    </p>
                </div>
                <div className="mt-8 rounded-2xl overflow-hidden border border-border/50">
                    <img src="/images/cns-interface.png" alt="Digital CNS Interface" className="w-full object-cover" />
                </div>
            </motion.section>

            {/* Tech Stack */}
            <section className="space-y-12">
                <ScrollReveal className="text-center space-y-4">
                    <h2 className="text-3xl font-bold">Built With</h2>
                    <p className="text-muted-foreground">The technology stack powering Londoolink</p>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: Shield, title: "Auth0 Token Vault", desc: "OAuth tokens for Google and Notion are stored in Auth0 Token Vault — never in our database. Agents request tokens on demand with scoped permissions.", color: "text-green-500", bg: "bg-green-500/10" },
                        { icon: Database, title: "Backboard.io Memory", desc: "Persistent AI memory powered by Backboard.io. The system remembers your preferences across sessions, maintains conversation threads, and provides cloud-based RAG for semantic search.", color: "text-cyan-500", bg: "bg-cyan-500/10" },
                        { icon: Cpu, title: "LangGraph Multi-Agent", desc: "Email, Calendar, Notion, and Priority agents are orchestrated by LangGraph. Each agent is specialized and runs in parallel for fast briefings.", color: "text-blue-500", bg: "bg-blue-500/10" },
                        { icon: Zap, title: "Google Gemini", desc: "Gemini powers all AI analysis — email summarization, calendar insights, Notion page analysis, and priority recommendations.", color: "text-yellow-500", bg: "bg-yellow-500/10" },
                        { icon: Globe, title: "FastAPI + Next.js", desc: "Python FastAPI backend with async LangGraph workflows. Next.js 14 frontend with App Router, Zustand state management, and Framer Motion.", color: "text-purple-500", bg: "bg-purple-500/10" },
                        { icon: Lock, title: "Auth0 Universal Login", desc: "All authentication flows through Auth0 — Google OAuth, email/password, and MFA. No custom auth code, no password storage.", color: "text-primary", bg: "bg-primary/10" },
                        { icon: Bell, title: "Africa's Talking SMS", desc: "When the Priority Agent detects urgent tasks, it sends SMS alerts via Africa's Talking so you never miss a critical deadline.", color: "text-orange-500", bg: "bg-orange-500/10" },
                    ].map((item, i) => (
                        <ScrollReveal key={i} delay={i * 0.1}>
                            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all h-full space-y-4">
                                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <h3 className="font-bold">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Values */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 p-8 rounded-3xl bg-primary/5 border border-primary/10">
                    <h3 className="text-2xl font-bold">Infrastructure over Noise</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Most AI tools add to the noise. Londoolink operates silently in the background, surfacing only what requires your attention. No unnecessary notifications. No hallucinated summaries.
                    </p>
                </div>
                <div className="space-y-4 p-8 rounded-3xl bg-secondary/5 border border-secondary/10">
                    <h3 className="text-2xl font-bold">Secure by Default</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Every agent action is logged. Every token is vaulted. Every permission is scoped. We treat your personal data with the same rigor as critical infrastructure — because it is.
                    </p>
                </div>
            </div>
        </div>
    )
}
