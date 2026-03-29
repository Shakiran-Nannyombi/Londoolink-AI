"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Lock,
    Key,
    Smartphone,
    Globe,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    ExternalLink,
    RefreshCw,
    Video
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TwoFASetup } from "@/components/security/TwoFASetup"
import { toast } from "sonner"

const AUTH0_DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
const AUTH0_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID

function openAuth0MFA() {
    // Redirect to Auth0 to manage MFA settings
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: AUTH0_CLIENT_ID!,
        redirect_uri: `${window.location.origin}/auth/callback`,
        scope: 'openid profile email',
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE!,
        prompt: 'login',
        acr_values: 'http://schemas.openid.net/pape/policies/2007/06/multi-factor',
    })
    window.location.href = `https://${AUTH0_DOMAIN}/authorize?${params}`
}

export default function SecurityPage() {
    const [securityScore, setSecurityScore] = useState(78)
    const [isScanning, setIsScanning] = useState(false)
    const [videoUrl, setVideoUrl] = useState("")
    const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null)
    const [analyzingVideo, setAnalyzingVideo] = useState(false)

    const runSecurityScan = () => {
        setIsScanning(true)
        // Simulate scan
        setTimeout(() => {
            setIsScanning(false)
            setSecurityScore(Math.min(100, securityScore + 5))
        }, 2000)
    }

    const handleAnalyzeVideo = () => {
        if (!videoUrl) return;
        setAnalyzingVideo(true);
        // Simulate analysis
        setTimeout(() => {
            setAnalyzingVideo(false);
            setVideoAnalysis(`
### Video Contextual Briefing (Gemini 3.0 Pro)

**Summary:**
The video shows a user navigating the Londoolink AI dashboard, specifically struggling to locate the API key settings. They click on 'Profile' multiple times before finally finding 'Integrations'.

**Workflow Analysis:**
- **Intent:** Configure external integrations.
- **Friction Point:** The 'Integrations' menu is not immediately intuitive in the current sidebar layout.
- **Efficiency:** Low. Time to task completion was 45 seconds.

**Recommendations:**
1. **UX Improvement:** Move 'API Keys' to a top-level sidebar item or add a 'Quick Actions' search bar.
2. **Immediate Action:** I can guide you directly to the correct page effectively immediately. 
            `);
        }, 3000);
    }

    const handleTwoFAComplete = () => {
        setIsTwoFAOpen(false)
        setSecurityScore(Math.min(100, securityScore + 15))
        toast.success("Security score updated!")
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Command Center</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor your digital footprint and manage account security.
                    </p>
                </div>
                <Button
                    onClick={runSecurityScan}
                    disabled={isScanning}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
                >
                    {isScanning ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Shield className="mr-2 h-4 w-4" />
                            Run Security Audit
                        </>
                    )}
                </Button>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 overflow-hidden border-border/50 bg-linear-to-br from-card to-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle>Security Posture Score</CardTitle>
                        <CardDescription>Real-time analysis of your account safety</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6 mt-2">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-muted/20"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 - (251.2 * securityScore) / 100}
                                        className={`transition-all duration-1000 ease-out ${securityScore > 80 ? 'text-green-500' :
                                            securityScore > 50 ? 'text-yellow-500' : 'text-red-500'
                                            }`}
                                    />
                                </svg>
                                <span className="absolute text-2xl font-bold">{securityScore}</span>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex justify-between text-sm">
                                    <span>Identity Protection</span>
                                    <span className="text-green-500 font-medium">Secure</span>
                                </div>
                                <Progress value={100} className="h-2 bg-muted/20" />

                                <div className="flex justify-between text-sm mt-2">
                                    <span>Device Authorization</span>
                                    <span className="text-yellow-500 font-medium">Review Needed</span>
                                </div>
                                <Progress value={65} className="h-2 bg-muted/20 text-yellow-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Security Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <Smartphone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                                <p className="text-xs text-muted-foreground mt-1">Optional: Add an extra layer of security to your account.</p>
                                <Button
                                    variant="link"
                                    className="text-primary h-auto p-0 text-xs mt-2"
                                    onClick={openAuth0MFA}
                                >
                                    Enable 2FA (Optional) &rarr;
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabbed Interface */}
            <Tabs defaultValue="video" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="video">Video Intelligence</TabsTrigger>
                    <TabsTrigger value="access">Access Control</TabsTrigger>
                </TabsList>

                <TabsContent value="video" className="mt-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 uppercase tracking-wider text-[10px]">Gemini 3.0 Pro</Badge>
                                <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/5 uppercase tracking-wider text-[10px]">Spatial-Temporal</Badge>
                            </div>
                            <CardTitle className="flex items-center gap-2">
                                <Video className="h-5 w-5 text-primary" />
                                Contextual Video Briefing
                            </CardTitle>
                            <CardDescription>
                                Upload visual context (screen recording, environment scan) for a spatial-temporal analysis of your workflow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="Paste video URL..."
                                    className="flex-1 bg-background/50 border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                />
                                <Button onClick={handleAnalyzeVideo} disabled={analyzingVideo || !videoUrl} className="w-full sm:w-auto">
                                    {analyzingVideo ? "Analyzing..." : "Analyze"}
                                </Button>
                            </div>

                            {analyzingVideo && (
                                <div className="space-y-3 py-8">
                                    <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                        <span>Processing spatial-temporal data...</span>
                                    </div>
                                    <Progress value={45} className="w-1/2 mx-auto h-1" />
                                </div>
                            )}

                            {videoAnalysis && !analyzingVideo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-xl bg-linear-to-br from-primary/5 to-primary/0 border border-primary/10 prose prose-invert max-w-none prose-sm"
                                >
                                    <div dangerouslySetInnerHTML={{ __html: videoAnalysis.replace(/\n/g, '<br/>') }} />
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="access" className="mt-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                            <CardDescription>Manage devices logged into your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Chrome on MacOS</p>
                                            <p className="text-xs text-muted-foreground">Kyoto, Japan • Active now</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Current</Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 opacity-60">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-muted text-muted-foreground">
                                            <Smartphone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Safari on iPhone 15</p>
                                            <p className="text-xs text-muted-foreground">Kyoto, Japan • 2 hours ago</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-destructive h-8 hover:bg-destructive/10">Revoke</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
