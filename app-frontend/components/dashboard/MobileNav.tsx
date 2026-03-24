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
        <div className="lg:hidden sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <img src={theme === 'dark' ? '/logoDark.png' : '/logoLondo.png'} alt="Logo" className="w-8 h-8 object-contain" />
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
                            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
                            onClick={toggleMenu}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-xs bg-background border-l border-border z-50 flex flex-col p-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <img src={theme === 'dark' ? '/logoDark.png' : '/logoLondo.png'} alt="Logo" className="w-8 h-8 object-contain" />
                                    <span className="font-bold">Londoolink</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={toggleMenu}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <nav className="flex-1 space-y-2">
                                {navItems.map((item) => (
                                    <Button
                                        key={item.path}
                                        variant={pathname === item.path ? "secondary" : "ghost"}
                                        className="w-full justify-start h-12"
                                        onClick={() => {
                                            router.push(item.path)
                                            setIsOpen(false)
                                        }}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.label}
                                    </Button>
                                ))}

                                <Button
                                    variant={pathname === '/notifications' ? "secondary" : "ghost"}
                                    className="w-full justify-start h-12 relative"
                                    onClick={() => {
                                        router.push('/notifications')
                                        setIsOpen(false)
                                    }}
                                >
                                    <div className="relative mr-3">
                                        <Bell className="w-5 h-5" />
                                        {notificationsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                                        )}
                                    </div>
                                    Notifications
                                </Button>
                            </nav>

                            <div className="mt-auto space-y-4 pt-4 border-t border-border">
                                {user && (
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold shrink-0">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-medium truncate">{user.full_name || 'User'}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="w-full" onClick={handleThemeToggle}>
                                        {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                                        Theme
                                    </Button>
                                    <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
