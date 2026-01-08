import { useState, useCallback } from "react";
import {
  AgentCard,
  AgentFlow,
  MessageStream,
  StatusDashboard,
  Terminal,
  LogViewer,
  AsciiBox,
  TypewriterText,
} from "./components";
import type { Agent, Message, LogEntry, Stats, AgentStatus } from "./types";
import { HEADER_COMPACT } from "./utils/ascii-helpers";

// Demo data
const INITIAL_AGENTS: Agent[] = [
  { id: "1", name: "Planner", status: "idle", messages: 0 },
  { id: "2", name: "Implementer", status: "idle", messages: 0 },
  { id: "3", name: "Reviewer", status: "idle", messages: 0 },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    type: "system",
    content: "System initialized. ASCII Agent UI ready.",
    timestamp: new Date(),
  },
];

const INITIAL_LOGS: LogEntry[] = [
  {
    id: "1",
    level: "INFO",
    message: "ASCII Agent UI initialized",
    timestamp: new Date(),
    source: "System",
  },
];

function App() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [stats, setStats] = useState<Stats>({
    tokens: 0,
    cost: 0,
    messages: 1,
  });

  // Simulate agent activity
  const simulateAgentCycle = useCallback(() => {
    const statusCycle: AgentStatus[] = [
      "thinking",
      "working",
      "waiting",
      "idle",
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step >= 12) {
        clearInterval(interval);
        return;
      }

      const agentIndex = step % 3;
      const statusIndex = Math.floor(step / 3) % statusCycle.length;

      setAgents((prev) =>
        prev.map((agent, i) =>
          i === agentIndex
            ? {
                ...agent,
                status: statusCycle[statusIndex],
                messages: agent.messages + 1,
              }
            : agent,
        ),
      );

      // Add a message
      const agentNames = ["Planner", "Implementer", "Reviewer"];
      const messageTypes = ["agent", "tool", "system"] as const;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          type: messageTypes[agentIndex],
          content: `${agentNames[agentIndex]} is ${statusCycle[statusIndex]}...`,
          timestamp: new Date(),
          agentName: agentNames[agentIndex],
        },
      ]);

      // Add a log
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          level: "INFO",
          message: `Agent ${agentNames[agentIndex]} status: ${statusCycle[statusIndex]}`,
          timestamp: new Date(),
          source: agentNames[agentIndex],
        },
      ]);

      // Update stats
      setStats((prev) => ({
        tokens: prev.tokens + Math.floor(Math.random() * 500) + 100,
        cost: prev.cost + Math.random() * 0.05,
        messages: prev.messages + 1,
      }));

      step++;
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Handle terminal commands
  const handleCommand = useCallback(
    (command: string): string => {
      const cmd = command.toLowerCase().trim();

      switch (cmd) {
        case "help":
          return `Available commands:
  help      - Show this help message
  status    - Show agent status
  start     - Start agent simulation
  clear     - Clear messages
  logs      - Show recent logs
  stats     - Show current stats`;

        case "status":
          return agents
            .map(
              (a) =>
                `  ${a.name}: ${a.status.toUpperCase()} (${a.messages} msgs)`,
            )
            .join("\n");

        case "start":
          simulateAgentCycle();
          return "Starting agent simulation...";

        case "clear":
          setMessages([]);
          return "Messages cleared.";

        case "logs":
          return logs
            .slice(-5)
            .map((l) => `  [${l.level}] ${l.message}`)
            .join("\n");

        case "stats":
          return `  Tokens: ${stats.tokens}
  Cost: $${stats.cost.toFixed(4)}
  Messages: ${stats.messages}`;

        default:
          // Add error log
          setLogs((prev) => [
            ...prev,
            {
              id: `log-${Date.now()}`,
              level: "ERROR",
              message: `Unknown command: ${command}`,
              timestamp: new Date(),
              source: "Terminal",
            },
          ]);
          return `Unknown command: ${command}. Type 'help' for available commands.`;
      }
    },
    [agents, logs, stats, simulateAgentCycle],
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-4">
      {/* Header */}
      <header className="mb-6">
        <pre className="text-cyan-400 text-xs leading-none whitespace-pre font-mono">
          {HEADER_COMPACT}
        </pre>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Status Dashboard + Agent Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Dashboard */}
          <StatusDashboard agents={agents} stats={stats} />

          {/* Agent Flow */}
          <AsciiBox title="AGENT PIPELINE" highlight>
            <AgentFlow agents={agents} />
          </AsciiBox>

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                name={agent.name}
                status={agent.status}
                avatar="robot1"
                messages={agent.messages}
              />
            ))}
          </div>

          {/* Message Stream */}
          <AsciiBox title="MESSAGE STREAM">
            <MessageStream
              messages={messages}
              className="h-64"
              typewriterSpeed={20}
            />
          </AsciiBox>
        </div>

        {/* Right Column: Terminal + Logs */}
        <div className="space-y-4">
          {/* Welcome Box */}
          <AsciiBox title="WELCOME" variant="rounded">
            <TypewriterText
              text="Welcome to ASCII Agent UI! Type 'start' in the terminal to begin simulation."
              speed={25}
              className="text-gray-400 text-sm"
            />
          </AsciiBox>

          {/* Terminal */}
          <Terminal
            onCommand={handleCommand}
            className="h-64"
            welcomeMessage={`┌──────────────────────────────────────┐
│  ASCII AGENT TERMINAL v1.0.0         │
│  Type 'help' for available commands  │
└──────────────────────────────────────┘`}
          />

          {/* Log Viewer */}
          <LogViewer logs={logs} className="h-64" />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-gray-600 text-xs font-mono">
        ─────────────────────────────────────────────────────────────────────
        <br />
        ASCII AGENT UI • Built with React + TypeScript + Tailwind CSS
        <br />
        ─────────────────────────────────────────────────────────────────────
      </footer>
    </div>
  );
}

export default App;
