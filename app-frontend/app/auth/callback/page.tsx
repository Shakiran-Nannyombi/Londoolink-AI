"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuthStore()

    useEffect(() => {
        const code = searchParams.get("code")
        const error = searchParams.get("error")

        if (error || !code) {
            router.replace("/login?error=auth_failed")
            return
        }

        async function exchange() {
            try {
                // Exchange Auth0 code for our backend JWT
                const res = await fetch(`${API_BASE}/api/v1/auth/google/callback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code,
                        redirect_uri: `${window.location.origin}/auth/callback`,
                    }),
                })

                if (!res.ok) throw new Error("Token exchange failed")

                const data = await res.json()

                if (data.access_token) {
                    localStorage.setItem("londoolink_token", data.access_token)
                    // Fetch profile
                    const profileRes = await fetch(`${API_BASE}/api/v1/auth/me`, {
                        headers: { Authorization: `Bearer ${data.access_token}` },
                    })
                    const profile = profileRes.ok ? await profileRes.json() : { email: data.email || "" }
                    login(data.access_token, profile)
                    router.replace("/dashboard")
                } else {
                    router.replace("/login?error=no_token")
                }
            } catch {
                router.replace("/login?error=auth_failed")
            }
        }

        exchange()
    }, [searchParams, router, login])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm">Signing you in...</p>
            </div>
        </div>
    )
}
