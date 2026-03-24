import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NotificationSettings {
    email: boolean
    push: boolean
    inApp: boolean
    dailyBriefing: boolean
    urgentOnly: boolean
}

interface SettingsState {
    theme: 'light' | 'dark'
    language: string
    timezone: string
    notifications: NotificationSettings
    updateTheme: (theme: 'light' | 'dark') => void
    updateLanguage: (language: string) => void
    updateTimezone: (timezone: string) => void
    updateNotifications: (notifications: Partial<NotificationSettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            notifications: {
                email: true,
                push: true,
                inApp: true,
                dailyBriefing: true,
                urgentOnly: false
            },

            updateTheme: (theme) => {
                set({ theme })
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', theme === 'dark')
                    localStorage.setItem('londoolink_theme', theme)
                }
            },

            updateLanguage: (language) => set({ language }),

            updateTimezone: (timezone) => set({ timezone }),

            updateNotifications: (notifications) =>
                set((state) => ({
                    notifications: { ...state.notifications, ...notifications }
                }))
        }),
        {
            name: 'londoolink-settings'
        }
    )
)
