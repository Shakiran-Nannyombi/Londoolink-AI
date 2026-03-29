"use client"

import { useEffect, useState, useCallback } from 'react'
import { Globe, FileText, Loader2, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { ServiceIntegrationCard } from './ServiceIntegrationCard'
import { AuditLogPanel } from './AuditLogPanel'

interface IntegrationStatus {
    service_type: string
    is_connected: boolean
    service_provider: string | null
    connected_at: string | null
    last_synced: string | null
    vault_backed: boolean | null
    granted_scopes: string | null  // JSON string of string[]
    last_token_used: string | null
    auth0_sub: string | null
}

function parseGrantedScopes(raw: string | null | undefined): string[] {
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const SERVICE_CONFIG: Record<string, {
    name: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
}> = {
    google: {
        name: 'Google',
        description: 'Connect Gmail and Google Calendar for smart email and scheduling',
        icon: Globe,
        color: 'blue',
    },
    notion: {
        name: 'Notion',
        description: 'Connect Notion to read and write pages with AI assistance',
        icon: FileText,
        color: 'purple',
    },
}

export function PermissionDashboard() {
    const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refreshStatus = useCallback(async () => {
        try {
            const response = await apiClient.getIntegrationsStatus()
            const list: IntegrationStatus[] = Array.isArray(response)
                ? response
                : (response.data ?? [])

            const map: Record<string, IntegrationStatus> = {}
            for (const item of list) {
                map[item.service_type] = item
            }
            setStatuses(map)
            setError(null)
        } catch (err: any) {
            setError(err.message || 'Failed to load integration status')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshStatus()
    }, [refreshStatus])

    const handleConnect = useCallback(async (service: string) => {
        try {
            const response = await apiClient.post<{ auth_url: string }>(
                `/integrations/${service}/connect`,
                {}
            )
            const authUrl = (response as any).auth_url ?? (response as any).data?.auth_url
            if (authUrl) {
                window.location.href = authUrl
            } else {
                console.error('No auth_url in response:', response)
                setError('Failed to get authorization URL. Please try again.')
            }
        } catch (err: any) {
            console.error('Connect failed:', err)
            setError(err.message || `Failed to connect ${service}`)
        }
    }, [])

    const handleRevoke = useCallback(async (service: string) => {
        await apiClient.post(`/integrations/${service}/disconnect`, {})
        await refreshStatus()
    }, [refreshStatus])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading integrations...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 py-6 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['google', 'notion'] as const).map((service) => {
                    const config = SERVICE_CONFIG[service]
                    const status = statuses[service]
                    const isConnected = status?.is_connected ?? false

                    return (
                        <ServiceIntegrationCard
                            key={service}
                            name={config.name}
                            description={config.description}
                            icon={config.icon}
                            color={config.color}
                            isConnected={isConnected}
                            onConnect={() => handleConnect(service)}
                            onDisconnect={() => handleRevoke(service)}
                            vaultBacked={status?.vault_backed ?? false}
                            grantedScopes={parseGrantedScopes(status?.granted_scopes)}
                            lastTokenUsed={status?.last_token_used ?? null}
                        />
                    )
                })}
            </div>

            <AuditLogPanel />
        </div>
    )
}
