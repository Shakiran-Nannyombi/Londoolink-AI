# Backboard Integration Testing Guide

## Overview
The Backboard integration is now live and can be tested through the existing API endpoints. The integration provides three main features:
1. **Cloud-based RAG** - Document storage and semantic search
2. **Agent Memory** - Persistent user preferences
3. **Thread-based Conversations** - Follow-up questions on briefings

## Prerequisites

1. **Backend is running** with Backboard enabled:
   ```bash
   cd backend
   # Make sure .env has:
   # USE_BACKBOARD=true
   # BACKBOARD_API_KEY=....
   # BACKBOARD_BASE_URL=https://api.backboard.io
   
   # Start the backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend is running**:
   ```bash
   cd app-frontend
   npm run dev
   ```

3. **You're logged in** to the application

## Testing Features

### 1. Test Cloud-based RAG (Document Storage)

The RAG system now automatically uses Backboard when `USE_BACKBOARD=true`.

**Test by ingesting documents:**

```bash
# Test email ingestion (stores in Backboard)
curl -X POST http://localhost:8000/api/v1/ingest/email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email to verify Backboard storage",
    "timestamp": "2024-01-15T10:00:00Z"
  }'

# Test semantic search (queries Backboard)
curl -X POST http://localhost:8000/api/v1/agent/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test email"
  }'
```

**In the Frontend:**
1. Go to the Dashboard
2. Use any integration (Email, Calendar, WhatsApp, etc.)
3. Ingest some data
4. The data is now stored in Backboard instead of ChromaDB
5. Try searching for the data - it will query Backboard

### 2. Test Agent Memory (User Preferences)

The Priority Agent now queries user memory when creating briefings.

**Add user preferences via Python script:**

```python
# backend/test_backboard_memory.py
from app.services.backboard.backboard_service import BackboardService
from app.core.config import settings

# Initialize Backboard
backboard = BackboardService(
    api_key=settings.BACKBOARD_API_KEY,
    base_url=settings.BACKBOARD_BASE_URL
)

# Get or create assistant for user
user_id = 1  # Replace with your user ID
assistant_id = backboard.get_or_create_assistant(user_id)

# Add user preferences
backboard.add_memory(
    assistant_id=assistant_id,
    content="I prefer morning meetings before 10 AM"
)

backboard.add_memory(
    assistant_id=assistant_id,
    content="I prioritize urgent emails from clients over internal emails"
)

backboard.add_memory(
    assistant_id=assistant_id,
    content="I like to see social media mentions summarized by sentiment"
)

print(f"✅ Added preferences for user {user_id}")

# Query preferences
memories = backboard.query_memory(assistant_id, "user preferences")
print(f"\n📝 User preferences:")
for memory in memories:
    print(f"  - {memory['content']}")
```

**Run the script:**
```bash
cd backend
python test_backboard_memory.py
```

**Test in Frontend:**
1. Go to Dashboard
2. Click "Get Daily Briefing"
3. The briefing will now include your preferences in the prioritization
4. Look for mentions of your preferences in the briefing output

### 3. Test Thread-based Conversations (Follow-up Questions)

When you get a daily briefing, a thread is created automatically.

**Get a briefing (creates a thread):**

```bash
curl -X GET http://localhost:8000/api/v1/agent/briefing/daily \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The response will include a `thread_id`:
```json
{
  "briefing": {
    "analysis": "Your daily briefing...",
    "thread_id": "thread_abc123",
    "status": "completed"
  }
}
```

**Ask follow-up questions via Python:**

```python
# backend/test_backboard_followup.py
from app.services.agents.priority_agent import PriorityAgent

# Initialize Priority Agent
agent = PriorityAgent(tools=[])

# Use the thread_id from the briefing response
thread_id = "thread_abc123"  # Replace with actual thread_id

# Ask follow-up questions
response = agent.answer_followup(
    thread_id=thread_id,
    question="Can you tell me more about the urgent emails?"
)

print(f"Response: {response}")
```

## Frontend Integration (Next Steps)

To fully integrate Backboard features in the frontend, you'll need to:

### 1. Add Memory Management UI

Create a new page: `app-frontend/app/(dashboard)/preferences/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function PreferencesPage() {
  const [preference, setPreference] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);

  const addPreference = async () => {
    // Call backend API to add memory
    const response = await fetch('/api/v1/memory/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ content: preference })
    });
    
    if (response.ok) {
      setPreferences([...preferences, preference]);
      setPreference('');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Preferences</h1>
      
      <Card className="p-4 mb-4">
        <Input
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          placeholder="Add a preference (e.g., I prefer morning meetings)"
        />
        <Button onClick={addPreference} className="mt-2">
          Add Preference
        </Button>
      </Card>

      <div className="space-y-2">
        {preferences.map((pref, idx) => (
          <Card key={idx} className="p-3">
            {pref}
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 2. Add Follow-up Question UI

Modify the briefing component to support follow-up questions:

```typescript
// In your briefing component
const [threadId, setThreadId] = useState<string | null>(null);
const [followupQuestion, setFollowupQuestion] = useState('');
const [followupResponse, setFollowupResponse] = useState('');

const askFollowup = async () => {
  const response = await fetch('/api/v1/agent/followup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      thread_id: threadId,
      question: followupQuestion
    })
  });
  
  const data = await response.json();
  setFollowupResponse(data.response);
};
```

### 3. Create Backend API Endpoints

You'll need to create these endpoints (they're in the spec but not implemented yet):

**backend/app/api/endpoints/memory.py:**
```python
from fastapi import APIRouter, Depends
from app.models.user import User
from app.security.jwt import get_current_user
from app.services.backboard.backboard_service import BackboardService
from app.core.config import settings

router = APIRouter()

@router.post("/preferences")
async def add_preference(
    content: str,
    current_user: User = Depends(get_current_user)
):
    backboard = BackboardService(
        api_key=settings.BACKBOARD_API_KEY,
        base_url=settings.BACKBOARD_BASE_URL
    )
    assistant_id = backboard.get_or_create_assistant(current_user.id)
    backboard.add_memory(assistant_id, content)
    return {"status": "success"}

@router.get("/preferences")
async def get_preferences(
    current_user: User = Depends(get_current_user)
):
    backboard = BackboardService(
        api_key=settings.BACKBOARD_API_KEY,
        base_url=settings.BACKBOARD_BASE_URL
    )
    assistant_id = backboard.get_or_create_assistant(current_user.id)
    memories = backboard.get_all_memories(assistant_id)
    return {"preferences": memories}
```

**backend/app/api/endpoints/threads.py:**
```python
from fastapi import APIRouter, Depends
from app.models.user import User
from app.security.jwt import get_current_user
from app.services.agents.priority_agent import PriorityAgent

router = APIRouter()

@router.post("/followup")
async def ask_followup(
    thread_id: str,
    question: str,
    current_user: User = Depends(get_current_user)
):
    agent = PriorityAgent(tools=[])
    response = agent.answer_followup(thread_id, question)
    return {"response": response}
```

## Quick Test Checklist

- [ ] Backend starts with `USE_BACKBOARD=true`
- [ ] Ingest a test email/calendar event
- [ ] Verify data is stored (check backend logs for "Backboard" mentions)
- [ ] Search for the ingested data
- [ ] Add user preferences via Python script
- [ ] Get a daily briefing (should include preferences)
- [ ] Note the `thread_id` from briefing response
- [ ] Ask a follow-up question using the thread_id
- [ ] Verify the response uses context from the briefing

## Troubleshooting

**Issue: "Backboard service is not initialized"**
- Check that `USE_BACKBOARD=true` in `.env`
- Check that `BACKBOARD_API_KEY` is set correctly
- Check backend logs for Backboard initialization errors

**Issue: "Failed to query user memory"**
- Check that the API key is valid
- Check network connectivity to Backboard API
- The system will gracefully degrade and work without memory

**Issue: No thread_id in briefing response**
- Check backend logs for thread creation errors
- The system will work without threads, just no follow-up support

## Monitoring

Check backend logs for Backboard activity:
```bash
# In backend directory
tail -f backend_log.txt | grep -i backboard
```

You should see logs like:
- "RAG Pipeline initialized with Backboard backend"
- "Priority Agent initialized with Backboard support"
- "Retrieved X user preferences for user Y"
- "Created thread for briefing: thread_id=..."
