"use client"

import React, { useState } from 'react'
import { Mail, MessageSquare, Phone, Check, Loader2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface ServiceCardProps {
    name: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    isConnected: boolean
    onConnect: () => Promise<void>
    onDisconnect: () => Promise<void>
    grantedScopes?: string[]
    vaultBacked?: boolean
    lastTokenUsed?: string | null
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
}

export function ServiceIntegrationCard({
    name,
    description,
    icon: Icon,
    color,
    isConnected,
    onConnect,
    onDisconnect,
    grantedScopes,
    vaultBacked,
    lastTokenUsed,
}: ServiceCardProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAction = async () => {
        setIsLoading(true)
        setError(null)

        try {
            if (isConnected) {
                await onDisconnect()
            } else {
                await onConnect()
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update connection')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={`p-6 border-2 transition-all ${isConnected
                ? `border-${color}-500/50 bg-${color}-500/5`
                : 'border-border hover:border-primary/50'
                }`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 text-${color}-500`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                {name}
                                {isConnected && (
                                    <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                                        <Check className="w-3 h-3" />
                                        Connected
                                    </span>
                                )}
                                {vaultBacked && (
                                    <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                                        Vault
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                            {isConnected && grantedScopes && grantedScopes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {grantedScopes.map((scope) => (
                                        <span
                                            key={scope}
                                            className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md"
                                        >
                                            {scope}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <Button
                    onClick={handleAction}
                    disabled={isLoading}
                    variant={isConnected ? "outline" : "default"}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isConnected ? 'Disconnecting...' : 'Connecting...'}
                        </>
                    ) : (
                        isConnected ? 'Disconnect' : 'Connect'
                    )}
                </Button>

                {isConnected && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                            {lastTokenUsed
                                ? `Last used: ${formatRelativeTime(lastTokenUsed)}`
                                : 'Last synced: Just now'}
                        </p>
                    </div>
                )}
            </Card>
        </motion.div>
    )
}

// Pre-configured service cards
export const EmailIntegrationCard = (props: Omit<ServiceCardProps, 'name' | 'description' | 'icon' | 'color'>) => (
    <ServiceIntegrationCard
        name="Email"
        description="Connect Gmail or Outlook for smart email analysis"
        icon={Mail}
        color="red"
        {...props}
    />
)

export const WhatsAppIntegrationCard = (props: Omit<ServiceCardProps, 'name' | 'description' | 'icon' | 'color'>) => (
    <ServiceIntegrationCard
        name="WhatsApp"
        description="Track important conversations and messages"
        icon={MessageSquare}
        color="green"
        {...props}
    />
)

export const SMSIntegrationCard = (props: Omit<ServiceCardProps, 'name' | 'description' | 'icon' | 'color'>) => (
    <ServiceIntegrationCard
        name="SMS/Messaging"
        description="Enable SMS analysis for comprehensive tracking"
        icon={Phone}
        color="blue"
        {...props}
    />
)
