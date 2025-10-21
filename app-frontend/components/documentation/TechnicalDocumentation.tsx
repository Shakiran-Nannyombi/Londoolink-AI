"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Code, 
  Database, 
  Shield, 
  Zap, 
  GitBranch,
  Server,
  Brain,
  Network,
  Lock,
  CheckCircle
} from "lucide-react"

export default function TechnicalDocumentation() {
  return (
    <div className="space-y-8">
      {/* System Architecture Overview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            System Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>
            Londoolink AI follows a modern microservices architecture with intelligent agent orchestration 
            at its core. The system processes data through a sophisticated pipeline designed for scalability and reliability.
          </p>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="font-semibold text-white mb-3">End-to-End Data Flow</h4>
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Server className="w-6 h-6 text-purple-400" />
                </div>
                <span>n8n Workflows</span>
              </div>
              <div className="text-slate-500">→</div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <span>FastAPI Backend</span>
              </div>
              <div className="text-slate-500">→</div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Brain className="w-6 h-6 text-green-400" />
                </div>
                <span>LangGraph Agents</span>
              </div>
              <div className="text-slate-500">→</div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Database className="w-6 h-6 text-yellow-400" />
                </div>
                <span>Dual Databases</span>
              </div>
              <div className="text-slate-500">→</div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Code className="w-6 h-6 text-red-400" />
                </div>
                <span>User Interface</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Intelligence Flow */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Backend Intelligence Flow (LangGraph System)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>
            The core intelligence of Londoolink AI is powered by a stateful LangGraph system that orchestrates 
            multiple specialized agents to process and prioritize information intelligently.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Server className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white">Email Agent</h4>
              </div>
              <p className="text-sm text-slate-400">
                Processes incoming emails, extracts key information, and determines priority levels 
                based on content analysis and sender importance.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Server className="w-4 h-4 text-green-400" />
                </div>
                <h4 className="font-semibold text-white">Calendar Agent</h4>
              </div>
              <p className="text-sm text-slate-400">
                Analyzes calendar events, identifies conflicts, and provides intelligent scheduling 
                recommendations with context-aware insights.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Server className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white">Priority Agent</h4>
              </div>
              <p className="text-sm text-slate-400">
                Synthesizes information from all agents to create prioritized daily briefings 
                with actionable insights and recommendations.
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h5 className="font-semibold text-blue-400 mb-2">Daily Briefing Workflow</h5>
            <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
              <li>Agents collect and process data from various sources</li>
              <li>Information is passed through the stateful graph for analysis</li>
              <li>Priority Agent synthesizes all inputs using advanced LLM reasoning</li>
              <li>Final briefing is generated with personalized recommendations</li>
              <li>Results are cached and delivered to the user interface</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* AI Components & Model Usage */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            AI Components & Model Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-white">Component</th>
                  <th className="text-left py-2 text-white">Role</th>
                  <th className="text-left py-2 text-white">Justification</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b border-slate-800">
                  <td className="py-3">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                      LangGraph
                    </Badge>
                  </td>
                  <td className="py-3">Agent orchestration and state management</td>
                  <td className="py-3">Provides stateful workflows for complex multi-agent interactions</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      ChromaDB
                    </Badge>
                  </td>
                  <td className="py-3">Vector database for RAG operations</td>
                  <td className="py-3">Optimized for similarity search and embedding storage</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Groq
                    </Badge>
                  </td>
                  <td className="py-3">Primary LLM for real-time processing</td>
                  <td className="py-3">Ultra-low latency inference for responsive user experience</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3">
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      OpenAI
                    </Badge>
                  </td>
                  <td className="py-3">Advanced reasoning and embeddings</td>
                  <td className="py-3">Superior performance for complex analysis tasks</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                      Ollama
                    </Badge>
                  </td>
                  <td className="py-3">Local model deployment option</td>
                  <td className="py-3">Privacy-focused alternative for sensitive data processing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints & Examples */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-green-400" />
            API Endpoints & Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-6">
          
          {/* Authentication Endpoints */}
          <div>
            <h4 className="font-semibold text-white mb-3">Authentication</h4>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500/20 text-green-400">POST</Badge>
                  <code className="text-blue-400">/auth/register</code>
                </div>
                <p className="text-sm text-slate-400 mb-3">Register a new user account</p>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Request:</p>
                  <pre className="bg-black/30 rounded p-2 text-xs overflow-x-auto">
{`curl -X POST "https://your-api.com/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "full_name": "John Doe"
  }'`}
                  </pre>
                  <p className="text-xs text-slate-500">Response:</p>
                  <pre className="bg-black/30 rounded p-2 text-xs overflow-x-auto">
{`{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-500/20 text-blue-400">POST</Badge>
                  <code className="text-blue-400">/auth/login</code>
                </div>
                <p className="text-sm text-slate-400 mb-3">Authenticate user and get access token</p>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Request:</p>
                  <pre className="bg-black/30 rounded p-2 text-xs overflow-x-auto">
{`curl -X POST "https://your-api.com/auth/login" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=user@example.com&password=secure_password"`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Briefing Endpoints */}
          <div>
            <h4 className="font-semibold text-white mb-3">Daily Briefing</h4>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-500/20 text-purple-400">GET</Badge>
                <code className="text-blue-400">/briefing/daily</code>
              </div>
              <p className="text-sm text-slate-400 mb-3">Get personalized daily briefing with AI-generated insights</p>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Request:</p>
                <pre className="bg-black/30 rounded p-2 text-xs overflow-x-auto">
{`curl -X GET "https://your-api.com/briefing/daily" \\
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."`}
                </pre>
                <p className="text-xs text-slate-500">Response:</p>
                <pre className="bg-black/30 rounded p-2 text-xs overflow-x-auto">
{`{
  "briefing": [
    {
      "id": "brief_001",
      "type": "email",
      "title": "Urgent: Project Deadline Approaching",
      "description": "Review and approve final deliverables for Q4 project",
      "priority": "high",
      "time": "2 hours ago",
      "metadata": {
        "sender": "project.manager@company.com",
        "subject": "Final Review Required",
        "deadline": "2024-01-15T17:00:00Z"
      }
    }
  ],
  "summary": "You have 3 high-priority items requiring immediate attention...",
  "generated_at": "2024-01-10T09:00:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* RAG Search Endpoint */}
          <div>
            <h4 className="font-semibold text-white mb-3">Knowledge Search</h4>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-500/20 text-yellow-400">POST</Badge>
                <code className="text-blue-400">/rag/search</code>
              </div>
              <p className="text-sm text-slate-400 mb-3">Search through your knowledge base using RAG</p>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Request:</p>
                <pre className="bg-black/30 rounded p-2 text-xs overflow-x-auto">
{`curl -X POST "https://your-api.com/rag/search" \\
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What are the key deliverables for Q4?",
    "limit": 5
  }'`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Storage & Security */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Data Storage & Security Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Dual-Database Architecture
              </h4>
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <h5 className="font-medium text-blue-400 mb-1">PostgreSQL</h5>
                  <p className="text-sm text-slate-400">
                    Handles relational data including user accounts, authentication tokens, 
                    and structured application data with ACID compliance.
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <h5 className="font-medium text-purple-400 mb-1">ChromaDB</h5>
                  <p className="text-sm text-slate-400">
                    Stores vector embeddings for semantic search, enabling intelligent 
                    content retrieval and RAG-based question answering.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security Measures
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-400 text-sm">Password Hashing</p>
                    <p className="text-xs text-slate-400">
                      User passwords are never stored. We use Argon2 to store secure, one-way hashes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-400 text-sm">Credential Encryption</p>
                    <p className="text-xs text-slate-400">
                      Third-party credentials are encrypted at rest using AES-256. 
                      Encryption keys are managed securely as environment variables.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-400 text-sm">JWT Authentication</p>
                    <p className="text-xs text-slate-400">
                      Stateless authentication with secure token expiration and refresh mechanisms.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-400 text-sm">Data Isolation</p>
                    <p className="text-xs text-slate-400">
                      User data is strictly isolated with row-level security policies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h5 className="font-semibold text-red-400 mb-2">Security Best Practices</h5>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
              <li>All API endpoints require authentication except public registration/login</li>
              <li>Environment variables are used for all sensitive configuration</li>
              <li>Database connections use SSL/TLS encryption in production</li>
              <li>Regular security audits and dependency updates</li>
              <li>Rate limiting implemented to prevent abuse</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
