"use client"

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Shield, Check, Copy, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

interface TwoFASetupProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete: () => void
}

export function TwoFASetup({ open, onOpenChange, onComplete }: TwoFASetupProps) {
    const [step, setStep] = useState<'password' | 'qr' | 'verify'>('password')
    const [password, setPassword] = useState('')
    const [secret, setSecret] = useState('')
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [backupCodes, setBackupCodes] = useState<string[]>([])

    // Reset state when closed
    React.useEffect(() => {
        if (!open) {
            setStep('password')
            setPassword('')
            setSecret('')
            setQrCodeUrl('')
            setVerificationCode('')
            setBackupCodes([])
        }
    }, [open])

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await apiClient.enable2FA(password)
            if (res.secret && res.qr_code) {
                setSecret(res.secret)
                setQrCodeUrl(res.qr_code)
                setBackupCodes(res.backup_codes || [])
                setStep('qr')
            } else {
                toast.error("Failed to generate 2FA secret")
            }
        } catch (error: any) {
            toast.error(error.message || "Incorrect password")
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await apiClient.verify2FASetup(verificationCode)
            toast.success("2FA enabled successfully!")
            onComplete()
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Invalid verification code")
        } finally {
            setLoading(false)
        }
    }

    const copySecret = () => {
        navigator.clipboard.writeText(secret)
        toast.success("Secret key copied to clipboard")
    }

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'))
        toast.success("Backup codes copied to clipboard")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                        Enhance your account security by requiring a verification code during login.
                    </DialogDescription>
                </DialogHeader>

                {step === 'password' && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Confirm your password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your current password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={!password || loading}>
                                {loading ? "Verifying..." : "Continue"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {step === 'qr' && (
                    <div className="space-y-6 py-4">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-white rounded-xl shadow-sm border">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                ) : (
                                    <div className="w-48 h-48 bg-muted animate-pulse rounded" />
                                )}
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium">Scan this QR code</p>
                                <p className="text-xs text-muted-foreground">Using Google Authenticator or similar app</p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or enter code manually</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-2 bg-muted rounded text-center font-mono text-sm tracking-widest border">
                                {secret}
                            </code>
                            <Button size="icon" variant="outline" onClick={copySecret} title="Copy Secret">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep('password')}>Back</Button>
                            <Button onClick={() => setStep('verify')}>Next Step</Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'verify' && (
                    <form onSubmit={handleVerify} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-sm flex gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <div>
                                    <p className="font-bold">Save your backup codes!</p>
                                    <p className="mt-1 text-xs">If you lose access to your authenticator app, these codes are the only way to recover your account.</p>
                                    <div className="mt-2 p-2 bg-background/50 rounded border border-yellow-500/10 font-mono text-xs grid grid-cols-2 gap-1 cursor-pointer hover:bg-background/80 transition-colors" onClick={copyBackupCodes}>
                                        {backupCodes.slice(0, 4).map(code => <span key={code}>{code}</span>)}
                                        {backupCodes.length > 4 && <span>+ {backupCodes.length - 4} more...</span>}
                                    </div>
                                    <Button type="button" variant="link" size="sm" className="h-auto p-0 text-yellow-700 mt-2" onClick={copyBackupCodes}>
                                        <Copy className="h-3 w-3 mr-1" /> Copy all codes
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">Enter Verification Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="000 000"
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    Enter the 6-digit code from your authenticator app
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setStep('qr')}>Back</Button>
                            <Button type="submit" disabled={verificationCode.length !== 6 || loading} className="w-full sm:w-auto">
                                {loading ? "Verifying..." : "Verify & Enable"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
