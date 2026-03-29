"use client"

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Settings,
    Bell,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
    Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useNotificationStore } from '@/store/notificationStore'

export function MobileNav() {
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const { user, logout } = useAuthStore()
    const { theme, updateTheme } = useSettingsStore()
    const { notifications } = useNotificationStore()
    const notificationsCount = notifications.length

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Shield, label: 'Security', path: '/security' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ]

    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        updateTheme(newTheme)
    }

    const handleLogout = () => {
        logout()
        router.push('/login')
        setIsOpen(false)
    }

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className="lg:hidden sticky top-0 z-[60] w-full bg-background/95 backdrop-blur-md border-b border-border px-4 h-16 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                <Logo className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">Londoolink AI</span>
            </div>

            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[70]"
                            onClick={toggleMenu}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-0 bg-background bg-white dark:bg-zinc-950 z-[80] flex flex-col p-6 overflow-y-auto md:max-w-none"
                        >
                            <div className="max-w-sm mx-auto w-full flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-3">
                                        <Logo className="w-10 h-10 object-contain" />
                                        <span className="font-bold text-xl">Londoolink</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={toggleMenu} className="rounded-full">
                                        <X className="w-8 h-8" />
                                    </Button>
                                </div>

                                <nav className="space-y-4">
                                    {navItems.map((item) => (
                                        <Button
                                            key={item.path}
                                            variant={pathname === item.path ? "secondary" : "ghost"}
                                            className="w-full justify-start h-14 text-lg rounded-xl px-4"
                                            onClick={() => {
                                                router.push(item.path)
                                                setIsOpen(false)
                                            }}
                                        >
                                            <item.icon className="w-6 h-6 mr-4" />
                                            {item.label}
                                        </Button>
                                    ))}

                                    <Button
                                        variant={pathname === '/notifications' ? "secondary" : "ghost"}
                                        className="w-full justify-start h-14 text-lg rounded-xl px-4 relative"
                                        onClick={() => {
                                            router.push('/notifications')
                                            setIsOpen(false)
                                        }}
                                    >
                                        <div className="relative mr-4">
                                            <Bell className="w-6 h-6" />
                                            {notificationsCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
                                            )}
                                        </div>
                                        Notifications
                                    </Button>
                                </nav>

                                <div className="mt-auto space-y-6 pt-6 border-t border-border">
                                    {user && (
                                        <div className="flex items-center gap-4 px-2">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold shrink-0">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-base font-semibold truncate">{user.full_name || 'User'}</p>
                                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="h-12 rounded-xl" onClick={handleThemeToggle}>
                                            {theme === 'dark' ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
                                            Theme
                                        </Button>
                                        <Button variant="ghost" className="h-12 rounded-xl text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                                            <LogOut className="w-5 h-5 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
