"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Calendar, MapPin, Globe, Camera, Edit2, Save, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { apiClient } from '@/lib/api'

export default function ProfilePage() {
    const router = useRouter()
    const { user, isAuthenticated, updateUser } = useAuthStore()
    const { theme, timezone, language } = useSettingsStore()

    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
    })

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        try {
            const response = await apiClient.uploadProfilePicture(file)
            updateUser({ profile_picture_url: response.url })
            alert('Profile picture updated!')
        } catch (error) {
            console.error('Failed to upload picture:', error)
            alert('Failed to update profile picture.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, router])

    const handleSave = async () => {
        setIsLoading(true)
        try {
            // Call API to update profile
            const response = await apiClient.updateProfile(formData)

            // Update local state
            updateUser(formData)
            setIsEditing(false)

            // Show success notification
            alert('Profile updated successfully!')
        } catch (error) {
            console.error('Failed to update profile:', error)
            alert('Failed to update profile. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || '',
            email: user?.email || '',
            phone_number: user?.phone_number || '',
        })
        setIsEditing(false)
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information</p>
                </div>

                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="flex-1 sm:flex-none">
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Picture */}
                <div className="lg:col-span-1">
                    <Card className="p-6">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4 group">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-linear-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white relative">
                                    {user?.profile_picture_url ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}${user.profile_picture_url}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>
                                            {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}

                                    {/* Overlay for hover effect */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                />

                                <button
                                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-10"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>

                            <h2 className="text-xl font-bold text-foreground mb-1">
                                {user?.full_name || 'User'}
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>

                            <div className="w-full space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined December 2025</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{timezone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                    <span>{language.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Card */}
                    <Card className="p-6 mt-6">
                        <h3 className="font-semibold mb-4 text-foreground">Activity Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                                <span className="font-semibold text-foreground">24</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Days</span>
                                <span className="font-semibold text-foreground">7</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Productivity</span>
                                <span className="font-semibold text-success">94%</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Profile Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Personal Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <p className="text-muted-foreground">{user?.full_name || 'Not set'}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        type="email"
                                        placeholder="Enter your email"
                                    />
                                ) : (
                                    <p className="text-muted-foreground">{user?.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        type="tel"
                                        placeholder="Enter your phone number"
                                    />
                                ) : (
                                    <p className="text-muted-foreground">{user?.phone_number || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Connected Services */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Connected Services</h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Email</p>
                                        <p className="text-xs text-muted-foreground">Not connected</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Connect</Button>
                            </div>


                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 dark:bg-blue-500/10 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-purple-500 dark:text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">SMS</p>
                                        <p className="text-xs text-muted-foreground">Not connected</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Connect</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="p-6 border-destructive/50">
                        <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                                </div>
                                <Button variant="destructive" size="sm">Delete</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
