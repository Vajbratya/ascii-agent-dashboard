# Task: ASCII-Themed Agentic AI Messaging & Status Visualization System

## Overview

Create a beautiful retro ASCII/2D themed UI for visualizing agentic AI systems, messaging between agents, and status displays. Think terminal aesthetics meets modern web.

## Core Features

### 1. Agent Visualization Panel

- ASCII art representations of different AI agents
- Status indicators (idle, thinking, working, error)
- Agent "avatars" using ASCII art
- Connection lines between agents (ASCII pipes: ─│┌┐└┘├┤┬┴┼)

### 2. Message Stream Display

- Real-time message flow between agents
- Typewriter effect for messages
- Different colors/styles for:
  - User messages
  - Agent responses
  - System messages
  - Tool calls
  - Errors

### 3. Status Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  AGENT STATUS BOARD                          [LIVE]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │ PLANNER  │───▶│IMPLEMENTER│───▶│ REVIEWER │         │
│  │  ◉ IDLE  │    │ ◐ WORKING │    │  ○ WAIT  │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│                                                         │
│  Messages: 42  │  Tokens: 15.2k  │  Cost: $0.45       │
└─────────────────────────────────────────────────────────┘
```

### 4. Interactive Terminal

- Command input with autocomplete
- History navigation
- Syntax highlighting for code blocks
- Copy/paste support

### 5. Log Viewer

- Scrollable log with filters
- Log levels: DEBUG, INFO, WARN, ERROR
- Timestamp display
- Search functionality

## Technical Stack

- **React** + **TypeScript**
- **Tailwind CSS** for styling
- **Monospace fonts** (JetBrains Mono, Fira Code)
- **CSS animations** for effects
- No heavy dependencies - keep it lightweight

## Visual Style Guide

- Dark background (#0a0a0a or similar)
- Green text for success (#22c55e)
- Amber/yellow for warnings (#f59e0b)
- Red for errors (#ef4444)
- Cyan for highlights (#06b6d4)
- White/gray for normal text
- Box-drawing characters for borders
- Blinking cursor effect
- Scanline overlay (optional)
- CRT screen curve effect (optional)

## Components to Build

### AgentCard

```tsx
<AgentCard name="Planner" status="working" avatar={ASCII_ROBOT} messages={3} />
```

### MessageStream

```tsx
<MessageStream messages={messages} typewriterSpeed={30} />
```

### StatusBar

```tsx
<StatusBar
  agents={agents}
  stats={{ tokens: 15200, cost: 0.45, messages: 42 }}
/>
```

### Terminal

```tsx
<Terminal onCommand={handleCommand} history={commandHistory} />
```

### LogViewer

```tsx
<LogViewer logs={logs} filter={["INFO", "ERROR"]} />
```

## ASCII Art Assets Needed

- Robot/AI agent avatars (multiple styles)
- Status icons (spinner, checkmark, X, warning)
- Loading animations
- Decorative borders and dividers
- Logo/header art

## File Structure

```
src/
├── components/
│   ├── AgentCard.tsx
│   ├── MessageStream.tsx
│   ├── StatusBar.tsx
│   ├── Terminal.tsx
│   ├── LogViewer.tsx
│   └── AsciiArt.tsx
├── hooks/
│   ├── useTypewriter.ts
│   └── useTerminal.ts
├── styles/
│   └── ascii-theme.css
├── utils/
│   └── ascii-helpers.ts
├── App.tsx
└── main.tsx
```

## Success Criteria

- [x] All components render correctly
- [x] Typewriter effect works smoothly
- [x] Status updates animate properly
- [x] Terminal accepts input
- [x] Responsive layout
- [x] Beautiful ASCII aesthetic achieved
- [x] No console errors
- [x] npm run dev works

---

## Implementation Progress

### Completed (Iteration 1)

1. **Project Setup**
   - Created Vite React TypeScript project
   - Installed and configured Tailwind CSS with @tailwindcss/vite plugin
   - Set up JetBrains Mono font for monospace aesthetic
   - Created comprehensive CSS theme with ASCII styling, animations, and effects

2. **Types & Utilities**
   - Created TypeScript types for Agent, Message, LogEntry, Stats
   - Built ascii-helpers.ts with box drawing characters, status icons, avatars, and helper functions

3. **Hooks**
   - `useTypewriter.ts` - Typewriter effect hook with queue support
   - `useTerminal.ts` - Terminal state management with history navigation

4. **Components**
   - `AsciiArt.tsx` - ASCII art display, Spinner, BlinkingCursor, StatusIndicator, AsciiBox, TypewriterText
   - `AgentCard.tsx` - Agent card display with status, avatar, AgentGrid, AgentFlow
   - `MessageStream.tsx` - Real-time message display with typewriter effect
   - `StatusBar.tsx` - Status bar, CompactStatusBar, StatusDashboard
   - `Terminal.tsx` - Interactive terminal with command history
   - `LogViewer.tsx` - Log viewer with filtering and search

5. **Main App**
   - Full demo application showcasing all components
   - Agent simulation with status cycling
   - Terminal commands (help, status, start, clear, logs, stats)
   - Responsive grid layout

### How to Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173/ in your browser.

Type `start` in the terminal to begin the agent simulation demo.

## Inspiration

- Old-school terminal UIs
- htop/btop system monitors
- Midnight Commander
- Norton Commander
- DOS games aesthetics
- Matrix-style effects
