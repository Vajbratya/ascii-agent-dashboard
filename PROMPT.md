# Task: Deploy Real-Time Agent Visualization Dashboard

## CRITICAL REQUIREMENTS

### 1. Real-Time WebSocket Server

Create a backend that:

- Accepts WebSocket connections from agents (ralph, codex, claude)
- Broadcasts status updates to all connected dashboard clients
- Stores recent activity in memory for new connections

### 2. Agent Integration

The agents will POST updates to the server:

```json
{
  "agent": "planner|implementer|reviewer",
  "status": "idle|thinking|working|error|done",
  "message": "What the agent is doing",
  "timestamp": "ISO timestamp",
  "tokens": 1234,
  "cost": 0.05
}
```

### 3. Dashboard Features

- Real-time agent status cards (animated)
- Live message stream with typewriter effect
- Token/cost counters updating live
- Task progress visualization
- Connection status indicator
- Mobile responsive

### 4. Deploy to Vercel

- Configure for serverless WebSocket (or use Vercel KV for pub/sub)
- Or use alternative: Railway, Render, or Fly.io for WebSocket support
- Public URL that anyone can access

## Tech Stack

- **Frontend**: React + Vite + Tailwind (already built)
- **Backend**: Node.js with WebSocket (ws) or Socket.io
- **Deploy**: Vercel/Railway/Render
- **Real-time**: WebSocket or Server-Sent Events (SSE)

## File Structure

```
/
├── src/                    # React frontend (existing)
├── server/
│   ├── index.ts           # Express + WebSocket server
│   ├── types.ts           # Shared types
│   └── store.ts           # In-memory state
├── vercel.json            # Deployment config
└── package.json           # Updated with server deps
```

## API Endpoints

### POST /api/agent-update

Agents call this to report status:

```bash
curl -X POST https://your-app.vercel.app/api/agent-update \
  -H "Content-Type: application/json" \
  -d '{"agent":"planner","status":"working","message":"Analyzing task..."}'
```

### GET /api/events (SSE)

Dashboard connects here for real-time updates

### GET /api/status

Returns current state of all agents

## Success Criteria

- [ ] Dashboard shows real agent activity
- [ ] Updates appear within 1 second
- [ ] Deployed to public URL
- [ ] Works on mobile
- [ ] Agents can easily POST updates

## Helper Script for Agents

Create a bash function agents can use:

```bash
report_status() {
  curl -s -X POST "$DASHBOARD_URL/api/agent-update" \
    -H "Content-Type: application/json" \
    -d "{\"agent\":\"$1\",\"status\":\"$2\",\"message\":\"$3\"}"
}
```
