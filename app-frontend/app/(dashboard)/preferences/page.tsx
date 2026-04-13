'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Preference {
    memory_id?: string;
    content: string;
    metadata?: any;
    created_at?: string;
    updated_at?: string;
}

export default function PreferencesPage() {
    const [preference, setPreference] = useState('');
    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const { toast } = useToast();

    // Fetch preferences on mount
    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            setFetching(true);
            const token = localStorage.getItem('londoolink_token');

            if (!token) {
                toast({
                    title: 'Not authenticated',
                    description: 'Please login first',
                    variant: 'destructive',
                });
                return;
            }

            const response = await fetch('http://localhost:8000/api/v1/memory/preferences', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                // API returns {memories: [...], total_count: N, ...}
                setPreferences(data.memories || []);
            } else if (response.status === 401) {
                toast({
                    title: 'Session expired',
                    description: 'Please login again',
                    variant: 'destructive',
                });
            } else if (response.status === 503) {
                toast({
                    title: 'Backboard not enabled',
                    description: 'The memory service is not available',
                    variant: 'destructive',
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Error fetching preferences',
                    description: error.detail || 'Failed to load preferences',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
            toast({
                title: 'Network error',
                description: 'Failed to connect to the server',
                variant: 'destructive',
            });
        } finally {
            setFetching(false);
        }
    };

    const addPreference = async () => {
        if (!preference.trim()) {
            toast({
                title: 'Empty preference',
                description: 'Please enter a preference',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('londoolink_token');

            if (!token) {
                toast({
                    title: 'Not authenticated',
                    description: 'Please login first',
                    variant: 'destructive',
                });
                return;
            }

            const response = await fetch('http://localhost:8000/api/v1/memory/preferences', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: preference }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Preference added successfully',
                });
                setPreference('');
                // Refresh preferences
                await fetchPreferences();
            } else if (response.status === 401) {
                toast({
                    title: 'Session expired',
                    description: 'Please login again',
                    variant: 'destructive',
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.detail || 'Failed to add preference',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error adding preference:', error);
            toast({
                title: 'Network error',
                description: 'Failed to connect to the server',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const addDemoPreferences = async () => {
        const demoPrefs = [
            'I prefer morning meetings before 10 AM',
            'I prioritize urgent emails from clients over internal emails',
            'I like to see social media mentions summarized by sentiment',
            'I want to focus on high-priority tasks first',
        ];

        try {
            setLoading(true);
            const token = localStorage.getItem('londoolink_token');

            if (!token) {
                toast({
                    title: 'Not authenticated',
                    description: 'Please login first',
                    variant: 'destructive',
                });
                return;
            }

            let successCount = 0;
            for (const pref of demoPrefs) {
                const response = await fetch('http://localhost:8000/api/v1/memory/preferences', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: pref }),
                });

                if (response.ok) {
                    successCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: 'Demo preferences added',
                    description: `Successfully added ${successCount} demo preferences`,
                });
                await fetchPreferences();
            }
        } catch (error) {
            console.error('Error adding demo preferences:', error);
            toast({
                title: 'Error',
                description: 'Failed to add demo preferences',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Preferences</h1>
                <p className="text-muted-foreground">
                    Add your preferences to help the AI agent personalize your daily briefings
                </p>
            </div>

            {/* Add Preference Card */}
            <Card className="p-6 mb-6 bg-card">
                <h2 className="text-xl font-semibold mb-4">Add New Preference</h2>
                <div className="space-y-4">
                    <Textarea
                        value={preference}
                        onChange={(e) => setPreference(e.target.value)}
                        placeholder="e.g., I prefer morning meetings before 10 AM"
                        className="min-h-[100px]"
                        disabled={loading}
                    />
                    <Button
                        onClick={addPreference}
                        disabled={loading || !preference.trim()}
                        className="w-full sm:w-auto"
                    >
                        {loading ? 'Adding...' : 'Add Preference'}
                    </Button>
                </div>

                {/* Example Preferences */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Example preferences:</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={addDemoPreferences}
                            disabled={loading}
                            className="text-xs"
                        >
                            {loading ? 'Adding...' : 'Try Demo Preferences'}
                        </Button>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• I prefer morning meetings before 10 AM</li>
                        <li>• I prioritize urgent emails from clients over internal emails</li>
                        <li>• I like to see social media mentions summarized by sentiment</li>
                        <li>• I want to focus on high-priority tasks first</li>
                    </ul>
                </div>
            </Card>

            {/* Preferences List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Preferences</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPreferences}
                        disabled={fetching}
                    >
                        {fetching ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>

                {fetching ? (
                    <Card className="p-6">
                        <p className="text-center text-muted-foreground">Loading preferences...</p>
                    </Card>
                ) : preferences.length === 0 ? (
                    <Card className="p-6">
                        <p className="text-center text-muted-foreground">
                            No preferences yet. Add your first preference above!
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {preferences.map((pref, idx) => (
                            <Card key={pref.memory_id || idx} className="p-4 bg-card hover:bg-accent/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <p className="flex-1">{pref.content}</p>
                                    {pref.created_at && (
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(pref.created_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Card */}
            <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 <strong>Tip:</strong> Your preferences will be used by the AI agent when generating your daily briefings.
                    The more specific you are, the better the agent can prioritize information for you.
                </p>
            </Card>
        </div>
    );
}
