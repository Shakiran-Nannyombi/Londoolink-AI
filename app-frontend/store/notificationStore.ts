import { create } from 'zustand'

export interface Notification {
    id: string
    message: string
    type: 'success' | 'info' | 'warning'
}

interface NotificationState {
    notifications: Notification[]
    addNotification: (message: string, type: 'success' | 'info' | 'warning') => void
    removeNotification: (id: string) => void
    clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (message, type) => {
        const id = Date.now().toString()
        set((state) => ({
            notifications: [...state.notifications, { id, message, type }]
        }))

        // Auto-remove after 3 seconds
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            }))
        }, 3000)
    },
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
    })),
    clearNotifications: () => set({ notifications: [] })
}))
