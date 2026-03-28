"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface AuditLogEntry {
    id: number
    auth0_sub: string
    agent_name: string
    event_type: string
    service_type: string
    scope_used: string | null
    action_type: string | null
    outcome: string
    created_at: string
}

function formatTimestamp(isoString: string): string {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString()
}

function OutcomeIcon({ outcome }: { outcome: string }) {
    if (outcome === 'success') return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
    if (outcome === 'denied' || outcome === 'failure') return <XCircle className="w-4 h-4 text-red-500 shrink-0" />
    return <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
}

export function AuditLogPanel() {
    const [entries, setEntries] = useState<AuditLogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAuditLog() {
            try {
                const response = await apiClient.get<AuditLogEntry[]>('/audit?limit=20')
                const data: AuditLogEntry[] = Array.isArray(response)
                    ? response
                    : (response.data ?? [])
                setEntries(data.slice(0, 20))
            } catch (err: any) {
                setError(err.message || 'Failed to load audit log')
            } finally {
                setLoading(false)
            }
        }

        fetchAuditLog()
    }, [])

    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Loading audit log...</span>
                </div>
            )}

            {!loading && error && (
                <div className="flex items-center gap-2 py-4 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && entries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                    No activity recorded yet.
                </p>
            )}

            {!loading && !error && entries.length > 0 && (
                <ul className="space-y-3">
                    {entries.map((entry, index) => (
                        <motion.li
                            key={entry.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                        >
                            <OutcomeIcon outcome={entry.outcome} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {entry.agent_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {formatTimestamp(entry.created_at)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {entry.event_type.replace(/_/g, ' ')}
                                    {' · '}
                                    {entry.service_type}
                                    {entry.action_type ? ` · ${entry.action_type.replace(/_/g, ' ')}` : ''}
                                </p>
                                <span
                                    className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${entry.outcome === 'success'
                                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                            : entry.outcome === 'denied' || entry.outcome === 'failure'
                                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                        }`}
                                >
                                    {entry.outcome}
                                </span>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            )}
        </div>
    )
}
