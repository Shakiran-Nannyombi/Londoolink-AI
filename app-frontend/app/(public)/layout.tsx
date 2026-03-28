import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { ChatbotWidget } from '@/components/chat/ChatbotWidget'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
            <Navbar />
            <main className="flex-1 relative pt-20">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                    {children}
                </div>
            </main>
            <Footer />
            <ChatbotWidget />
        </div>
    )
}
