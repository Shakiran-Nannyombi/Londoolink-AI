import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: number
    email: string
    full_name?: string
    phone_number?: string
    profile_picture_url?: string
    timezone: string
    language_preference: string
    auth0_sub?: string
}

interface AuthState {
    token: string | null
    user: User | null
    isAuthenticated: boolean
    login: (token: string, user: User) => void
    logout: () => void
    updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            login: (token: string, user: User) => {
                set({ token, user, isAuthenticated: true })
                if (typeof window !== 'undefined') {
                    localStorage.setItem('londoolink_token', token)
                    localStorage.setItem('londoolink_email', user.email)
                }
            },

            logout: () => {
                set({ token: null, user: null, isAuthenticated: false })
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('londoolink_token')
                    localStorage.removeItem('londoolink_email')
                }
            },

            updateUser: (userData: Partial<User>) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null
                }))
            }
        }),
        {
            name: 'londoolink-auth',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)
