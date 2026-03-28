"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNotificationStore } from '@/store/notificationStore'
import { GlassCard } from '@/components/shared/GlassCard'
import { formatDistanceToNow } from 'date-fns'
import { apiClient } from '@/lib/api'

export default function NotificationsPage() {
    const { notifications, removeNotification, clearNotifications } = useNotificationStore()
    const [vaultStatus, setVaultStatus] = useState<'loading' | 'ok' | 'degraded'>('loading')

    useEffect(() => {
        apiClient.getVaultHealth().then((res) => {
            const status = res?.status ?? res?.data?.status ?? 'ok'
            setVaultStatus(status === 'ok' ? 'ok' : 'degraded')
        }).catch(() => setVaultStatus('degraded'))
    }, [])

    return (
        <div className="space-y-6">
            {/* Vault Health Card */}
            <Card className="p-4 flex items-center gap-4">
                {vaultStatus === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : vaultStatus === 'ok' ? (
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                ) : (
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                )}
                <div>
                    <p className="text-sm font-medium text-foreground">Token Vault</p>
                    <p className={`text-xs ${vaultStatus === 'ok' ? 'text-green-600 dark:text-green-400' : vaultStatus === 'degraded' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {vaultStatus === 'loading' ? 'Checking vault health…' : vaultStatus === 'ok' ? 'Operational' : 'Degraded — check integrations'}
                    </p>
                </div>
            </Card>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                    <p className="text-muted-foreground">Stay updated with your latest alerts</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            useNotificationStore.getState().addNotification("This is a test success notification!", "success")
                        }}
                        className="text-success hover:bg-success/10 border-success/20"
                    >
                        Test Success
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            useNotificationStore.getState().addNotification("This is a test warning notification.", "warning")
                        }}
                        className="text-warning hover:bg-warning/10 border-warning/20"
                    >
                        Test Warning
                    </Button>
                    {notifications.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearNotifications} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">No new notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {notifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                            >
                                <GlassCard className="p-4 flex items-start gap-4 hover:shadow-md transition-all">
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'success' ? 'bg-success/10 text-success' :
                                        notif.type === 'warning' ? 'bg-destructive/10 text-destructive' :
                                            'bg-primary/10 text-primary'
                                        }`}>
                                        {notif.type === 'success' && <CheckCircle className="w-4 h-4" />}
                                        {notif.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                                        {notif.type === 'info' && <Info className="w-4 h-4" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-foreground font-medium">{notif.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Just now
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => removeNotification(notif.id)}
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
