"use client"

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-24 space-y-20">
            {/* Vision Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight">Our Vision</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Calm intelligence in a noisy world. We believe AI shouldn't just talk to you; it should think with you, for you, and ahead of you.
                    </p>
                </motion.div>
                <motion.div
                    className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <img src="/images/vision-vision.png" alt="Vision of Okulondoola" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </motion.div>
            </div>

            {/* Meaning Section */}
            <motion.section
                className="bg-card/30 p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <Quote className="absolute top-8 left-8 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
                <div className="relative z-10 grid md:grid-cols-5 gap-12 items-center">
                    <div className="md:col-span-3 space-y-6">
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
                    <div className="md:col-span-2 relative aspect-video md:aspect-square rounded-2xl overflow-hidden border border-white/5">
                        <img src="/images/cns-interface.png" alt="Digital CNS Interface" className="object-cover w-full h-full" />
                    </div>
                </div>
            </motion.section>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6 p-8 rounded-3xl bg-primary/5 border border-primary/10">
                    <h3 className="text-2xl font-bold">Infrastructure over Noise</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Most AI tools today add to the noise. They generate more text, more notifications, more distractions.
                        Londoolink is engineered to reduce noise. It operates silently in the background, surfacing only what requires your executive function.
                    </p>
                </div>
                <div className="space-y-6 p-8 rounded-3xl bg-secondary/5 border border-secondary/10">
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
