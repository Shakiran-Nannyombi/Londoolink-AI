"use client"

import { Logo } from '@/components/shared/Logo'

export function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-border bg-background/50">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-auto object-contain" />
                        <span className="text-lg font-bold">Londoolink AI</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        The central nervous system for your digital life.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold mb-4">Product</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#" className="hover:text-foreground">Features</a></li>
                        <li><a href="#" className="hover:text-foreground">Security</a></li>
                        <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-4">Company</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="/about" className="hover:text-foreground">About</a></li>
                        <li><a href="#" className="hover:text-foreground">Careers</a></li>
                        <li><a href="#" className="hover:text-foreground">Contact</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-4">Connect</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#" className="hover:text-foreground">Twitter</a></li>
                        <li><a href="#" className="hover:text-foreground">GitHub</a></li>
                        <li><a href="#" className="hover:text-foreground">LinkedIn</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Londoolink AI. All rights reserved.
            </div>
        </footer>
    )
}
