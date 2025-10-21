"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Code, 
  Database, 
  Shield, 
  Zap, 
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  GitBranch,
  Server,
  Globe
} from "lucide-react"
import Link from "next/link"
import TechnicalDocumentation from "@/components/documentation/TechnicalDocumentation"

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState("deployment")

  const renderDeploymentContent = () => (
    <div className="space-y-8">
      {/* Part 1: Deployment */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Part 1: Deployed Project (Live URL)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>Deploy your project to make it live and accessible on the internet.</p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Backend Deployment (Railway/Render)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Create Dockerfile in backend directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Push code to public GitHub repository</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Create new project on Railway/Render</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Add environment variables securely</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Configure start command</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Frontend Deployment (Vercel/Netlify)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Push code to GitHub repository</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Create project on Vercel/Netlify</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Add VITE_API_BASE_URL environment variable</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Configure CORS in backend</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-400 mb-2">Critical: CORS Configuration</h5>
            <p className="text-sm text-slate-300 mb-2">
              Add this to your backend/app/main.py:
            </p>
            <pre className="bg-black/30 rounded p-2 text-xs overflow-x-auto">
{`from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "https://your-frontend-url.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Part 2: GitHub Repository */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            Part 2: Public GitHub Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>Ensure your repository is clean, professional, and portfolio-ready.</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>README.md is perfected with live URL</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>No secrets committed (.env in .gitignore)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>.env.example is accurate and complete</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Code is formatted and clean</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Repository is set to Public</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRepositoryContent = () => (
    <div className="space-y-8">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            Repository Structure & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>Follow these guidelines to maintain a professional repository structure.</p>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="font-semibold text-white mb-3">Recommended Directory Structure</h4>
            <pre className="text-sm text-slate-300">
{`londoolink-ai/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   └── services/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── .env.example
├── README.md
├── .gitignore
└── docs/
    └── TECHNICAL_DOCUMENTATION.md`}
            </pre>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white">Essential Files Checklist</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>README.md</strong> - Project overview, setup instructions, live demo link</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>.gitignore</strong> - Excludes .env files, node_modules, __pycache__</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>.env.example</strong> - Template for environment variables</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Dockerfile</strong> - Container configuration for deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>requirements.txt</strong> - Python dependencies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>package.json</strong> - Node.js dependencies and scripts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Londoolink AI Documentation
              </h1>
              <p className="text-slate-300">
                Comprehensive technical documentation and deployment guide
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-4 h-4 mr-1" />
            Ready for Deployment
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-8 bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeTab === "deployment" ? "default" : "ghost"} 
                className={`justify-start ${activeTab === "deployment" ? "bg-primary text-primary-foreground" : "text-slate-300 hover:bg-white/10"}`}
                onClick={() => setActiveTab("deployment")}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Deployment Guide
              </Button>
              <Button 
                variant={activeTab === "technical" ? "default" : "ghost"} 
                className={`justify-start ${activeTab === "technical" ? "bg-primary text-primary-foreground" : "text-slate-300 hover:bg-white/10"}`}
                onClick={() => setActiveTab("technical")}
              >
                <Code className="w-4 h-4 mr-2" />
                Technical Documentation
              </Button>
              <Button 
                variant={activeTab === "repository" ? "default" : "ghost"} 
                className={`justify-start ${activeTab === "repository" ? "bg-primary text-primary-foreground" : "text-slate-300 hover:bg-white/10"}`}
                onClick={() => setActiveTab("repository")}
              >
                <Server className="w-4 h-4 mr-2" />
                Repository Setup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Documentation */}
          <div className="lg:col-span-2">
            {activeTab === "deployment" && renderDeploymentContent()}
            {activeTab === "technical" && <TechnicalDocumentation />}
            {activeTab === "repository" && renderRepositoryContent()}
          </div>

          {/* Right Column - Quick Reference */}
          <div className="space-y-6">
            
            {/* Tech Stack */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white text-sm mb-2">Frontend</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">Next.js</Badge>
                    <Badge variant="secondary" className="text-xs">React</Badge>
                    <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                    <Badge variant="secondary" className="text-xs">Tailwind CSS</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white text-sm mb-2">Backend</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">FastAPI</Badge>
                    <Badge variant="secondary" className="text-xs">Python</Badge>
                    <Badge variant="secondary" className="text-xs">LangGraph</Badge>
                    <Badge variant="secondary" className="text-xs">PostgreSQL</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white text-sm mb-2">AI & ML</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">OpenAI</Badge>
                    <Badge variant="secondary" className="text-xs">Groq</Badge>
                    <Badge variant="secondary" className="text-xs">ChromaDB</Badge>
                    <Badge variant="secondary" className="text-xs">Ollama</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>AI-powered daily briefings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Multi-agent LangGraph system</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>RAG-based knowledge search</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Secure credential management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Real-time data processing</span>
                </div>
              </CardContent>
            </Card>

            {/* External Links */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-purple-400" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-white/10" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GitHub Repository
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-white/10" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Demo
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-white/10" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  API Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
