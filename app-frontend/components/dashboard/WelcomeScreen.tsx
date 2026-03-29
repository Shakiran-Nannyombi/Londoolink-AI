"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, ChevronLeft, X } from "lucide-react"

const steps = [
    {
        icon: "🤖",
        title: "Welcome to Londoolink AI",
        description: "Your intelligent digital twin that acts on your behalf — managing emails, calendar, and more while keeping your credentials secure.",
    },
    {
        icon: "🔗",
        title: "Connect Your Services",
        description: "Go to Settings → Integrations to connect Google and Notion. Once connected, your AI agents can read your emails and calendar to generate smart briefings.",
    },
    {
        icon: "📋",
        title: "Your Daily Briefing",
        description: "Every day, Londoolink generates a prioritized briefing of your tasks, emails, and events. High priority items appear at the top.",
    },
    {
        icon: "💬",
        title: "Chat with AI Agents",
        description: "Use the chat panel on the right to talk directly with your Email, Calendar, or Priority agents. Ask them anything about your schedule or inbox.",
    },
    {
        icon: "🔒",
        title: "Secure by Design",
        description: "Your credentials are stored in Auth0 Token Vault — your AI agents never hold raw tokens. You stay in control of what they can access.",
    },
]

interface WelcomeScreenProps {
    onDismiss: () => void
}

export function WelcomeScreen({ onDismiss }: WelcomeScreenProps) {
    const [step, setStep] = useState(0)

    const isLast = step === steps.length - 1

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 relative">
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Progress dots */}
                    <div className="flex gap-1.5 mb-8 justify-center">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="text-center"
                        >
                            <div className="text-5xl mb-4">{steps[step].icon}</div>
                            <h2 className="text-xl font-bold text-foreground mb-3">{steps[step].title}</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">{steps[step].description}</p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-between mt-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep(s => s - 1)}
                            disabled={step === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>

                        {isLast ? (
                            <Button onClick={onDismiss} size="sm">
                                Get Started
                            </Button>
                        ) : (
                            <Button onClick={() => setStep(s => s + 1)} size="sm">
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    )
}
