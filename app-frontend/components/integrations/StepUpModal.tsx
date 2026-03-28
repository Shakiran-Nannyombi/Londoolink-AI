'use client'

import * as React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'

interface StepUpModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    challengeId: string
    requiresTotp: boolean
    onSuccess: (stepUpToken: string) => void
}

export function StepUpModal({
    open,
    onOpenChange,
    challengeId,
    requiresTotp,
    onSuccess,
}: StepUpModalProps) {
    const [credential, setCredential] = React.useState('')
    const [error, setError] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(false)

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (!open) {
            setCredential('')
            setError(null)
            setLoading(false)
        }
    }, [open])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!credential || (requiresTotp && credential.length !== 6)) return

        setError(null)
        setLoading(true)

        try {
            const apiBase =
                process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
            const token =
                typeof window !== 'undefined'
                    ? localStorage.getItem('londoolink_token')
                    : null

            const res = await fetch(`${apiBase}/api/v1/step-up/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ challenge_id: challengeId, credential }),
            })

            if (res.status === 401) {
                setError('Invalid credential. Please try again.')
                return
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setError(data.detail || 'Verification failed. Please try again.')
                return
            }

            const data = await res.json()
            onSuccess(data.step_up_token)
            onOpenChange(false)
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Verify your identity</DialogTitle>
                    <DialogDescription>
                        {requiresTotp
                            ? 'Enter your 6-digit authenticator code to continue.'
                            : 'Enter your password to continue.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {requiresTotp ? (
                        <div className="flex flex-col items-center gap-2">
                            <Label htmlFor="totp-input">Authenticator code</Label>
                            <InputOTP
                                id="totp-input"
                                maxLength={6}
                                value={credential}
                                onChange={setCredential}
                                autoFocus
                            >
                                <InputOTPGroup>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <InputOTPSlot key={i} index={i} />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password-input">Password</Label>
                            <Input
                                id="password-input"
                                type="password"
                                value={credential}
                                onChange={(e) => setCredential(e.target.value)}
                                placeholder="Enter your password"
                                autoFocus
                                autoComplete="current-password"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-destructive text-sm" role="alert">
                            {error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                loading ||
                                !credential ||
                                (requiresTotp && credential.length !== 6)
                            }
                        >
                            {loading ? 'Verifying…' : 'Verify'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
