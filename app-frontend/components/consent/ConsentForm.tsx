"use client"

import React, { useState } from 'react'
import { Shield, Mail, MessageSquare, Phone, Info, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface ConsentOption {
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    description: string
    required: boolean
}

const consentOptions: ConsentOption[] = [
    {
        id: 'data_processing',
        name: 'dataProcessing',
        icon: Shield,
        label: 'Data Processing',
        description: 'I consent to Londoolink AI processing my data to provide intelligent insights and recommendations.',
        required: true
    },
    {
        id: 'email',
        name: 'emailAccess',
        icon: Mail,
        label: 'Email Access',
        description: 'Allow Londoolink to analyze my emails for priority detection and smart summaries.',
        required: false
    },
    {
        id: 'whatsapp',
        name: 'whatsappAccess',
        icon: MessageSquare,
        label: 'WhatsApp Access',
        description: 'Connect WhatsApp to track important conversations and never miss critical messages.',
        required: false
    },
    {
        id: 'sms',
        name: 'smsAccess',
        icon: Phone,
        label: 'SMS/Messaging',
        description: 'Enable SMS analysis for comprehensive communication tracking.',
        required: false
    }
]

interface ConsentFormProps {
    onSubmit: (consents: Record<string, boolean>) => void
    isLoading?: boolean
}

export function ConsentForm({ onSubmit, isLoading = false }: ConsentFormProps) {
    const [consents, setConsents] = useState<Record<string, boolean>>({
        dataProcessing: false,
        emailAccess: false,
        whatsappAccess: false,
        smsAccess: false
    })

    const handleToggle = (name: string) => {
        setConsents(prev => ({ ...prev, [name]: !prev[name] }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Check if required consents are given
        if (!consents.dataProcessing) {
            alert('Data processing consent is required to use Londoolink AI')
            return
        }

        onSubmit(consents)
    }

    const canSubmit = consents.dataProcessing && !isLoading

    return (
        <Card className="p-6 bg-card border-border">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Privacy & Consent</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                    Choose which services you'd like to connect. You can change these settings anytime.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {consentOptions.map((option, index) => {
                    const Icon = option.icon
                    const isChecked = consents[option.name as keyof typeof consents]

                    return (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <label
                                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${isChecked
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 bg-background'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggle(option.name)}
                                    className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                                    disabled={isLoading}
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className="w-5 h-5 text-primary" />
                                        <span className="font-semibold text-foreground">{option.label}</span>
                                        {option.required && (
                                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                </div>

                                {isChecked && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="mt-1"
                                    >
                                        <CheckCircle className="w-5 h-5 text-primary" />
                                    </motion.div>
                                )}
                            </label>
                        </motion.div>
                    )
                })}

                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mt-6">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground">
                        <p className="font-medium mb-1">Your privacy matters</p>
                        <p className="text-muted-foreground">
                            All your data is encrypted and stored securely. You can revoke any consent at any time from your settings.
                        </p>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={!canSubmit}
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Processing...
                        </>
                    ) : (
                        'Continue'
                    )}
                </Button>
            </form>
        </Card>
    )
}
