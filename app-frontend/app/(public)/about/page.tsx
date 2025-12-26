"use client"

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-24 space-y-20">
            <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Our Vision</h1>
                <p className="text-xl text-muted-foreground">
                    Calm intelligence in a noisy world.
                </p>
            </div>

            <motion.section
                className="bg-card/50 p-12 rounded-3xl border border-white/10 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Quote className="absolute top-8 left-8 w-12 h-12 text-primary/10" />
                <div className="relative z-10 space-y-6 text-center">
                    <h2 className="text-3xl font-bold">The Meaning of "Okulondoola"</h2>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                        "To track, to follow, to care."
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        Derived from Luganda, our name reflects our core philosophy.
                        We are not building another chatbot to talk at you.
                        We are building a system that follows your digital footprint to care for your attention,
                        tracking what matters so you don't have to.
                    </p>
                </div>
            </motion.section>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Infrastructure over Noise</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Most AI tools today add to the noise. They generate more text, more notifications, more distractions.
                        Londoolink is engineered to reduce noise. It operates silently in the background, surfacing only what requires your executive function.
                    </p>
                </div>
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Dependable by Design</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        We build for technical founders, engineers, and creators who value precision.
                        Our system is stateful, context-aware, and secure by default. We treat your personal data with the same rigor as critical infrastructure.
                    </p>
                </div>
            </div>
        </div>
    )
}
