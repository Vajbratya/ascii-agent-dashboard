import { useState, useEffect, useRef } from "react";

// Server URL - change for production
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

interface AgentState {
  status: string;
  message: string;
  tokens: number;
  cost: number;
  lastUpdate: number;
}

interface Message {
  id: string;
  agent: string;
  type: string;
  content: string;
  timestamp: string;
}

interface Stats {
  tokens: number;
  cost: number;
  messages: number;
}

function App() {
  const [agents, setAgents] = useState<Record<string, AgentState>>({
    planner: {
      status: "idle",
      message: "Waiting...",
      tokens: 0,
      cost: 0,
      lastUpdate: 0,
    },
    implementer: {
      status: "idle",
      message: "Waiting...",
      tokens: 0,
      cost: 0,
      lastUpdate: 0,
    },
    reviewer: {
      status: "idle",
      message: "Waiting...",
      tokens: 0,
      cost: 0,
      lastUpdate: 0,
    },
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({
    tokens: 0,
    cost: 0,
    messages: 0,
  });
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to SSE
  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/api/events`);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.agents) setAgents(data.agents);
        if (data.stats) setStats(data.stats);
        if (data.messages) setMessages(data.messages);
        setLastUpdate(new Date());
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      // Reconnect after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    return () => eventSource.close();
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "text-green-400";
      case "thinking":
        return "text-cyan-400";
      case "error":
        return "text-red-400";
      case "waiting":
        return "text-yellow-400";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working":
        return "◉";
      case "thinking":
        return "◐";
      case "error":
        return "✖";
      case "waiting":
        return "◔";
      default:
        return "○";
    }
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n.toString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono p-4">
      {/* Header */}
      <header className="border border-cyan-800 bg-[#0d1117] p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-cyan-400 text-2xl font-bold tracking-wider">
              ╔══ AGENT DASHBOARD ══╗
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Real-time AI Agent Status Monitor
            </p>
          </div>
          <div className="text-right">
            <div
              className={`flex items-center gap-2 ${connected ? "text-green-400" : "text-red-400"}`}
            >
              <span className={connected ? "animate-pulse" : ""}>
                {connected ? "◉" : "○"}
              </span>
              <span>{connected ? "CONNECTED" : "DISCONNECTED"}</span>
            </div>
            {lastUpdate && (
              <div className="text-gray-600 text-xs mt-1">
                Last: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border border-gray-700 bg-[#0d1117] p-3 mb-4 flex justify-between items-center">
        <div className="flex gap-8">
          <div>
            <span className="text-gray-500 text-xs">TOKENS</span>
            <div className="text-cyan-400 text-xl font-bold">
              {formatNumber(stats.tokens)}
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">COST</span>
            <div className="text-green-400 text-xl font-bold">
              ${stats.cost.toFixed(4)}
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">MESSAGES</span>
            <div className="text-yellow-400 text-xl font-bold">
              {stats.messages}
            </div>
          </div>
        </div>
        <div className="text-gray-600 text-xs">API: {API_URL}</div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent Cards */}
        {Object.entries(agents).map(([name, agent]) => (
          <div
            key={name}
            className={`border p-4 bg-[#0d1117] ${
              agent.status === "working"
                ? "border-green-600"
                : agent.status === "thinking"
                  ? "border-cyan-600"
                  : agent.status === "error"
                    ? "border-red-600"
                    : "border-gray-700"
            }`}
          >
            {/* Agent Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold uppercase tracking-wider">
                {name}
              </h2>
              <span className={`text-2xl ${getStatusColor(agent.status)}`}>
                {getStatusIcon(agent.status)}
              </span>
            </div>

            {/* ASCII Avatar */}
            <pre
              className={`text-xs leading-tight mb-3 ${getStatusColor(agent.status)}`}
            >
              {name === "planner"
                ? `
 ╭──────╮
 │ ◉  ◉ │
 │  ──  │
 │ ╰──╯ │
 ╰──────╯
`
                : name === "implementer"
                  ? `
 ┌─────┐
 │[◉ ◉]│
 │ ─── │
 │ ▀▀▀ │
 └─┬─┬─┘
`
                  : `
  ╔═══╗
  ║◯ ◯║
  ║ ▬ ║
  ╠═══╣
  ╚═══╝
`}
            </pre>

            {/* Status */}
            <div
              className={`text-sm font-bold uppercase mb-2 ${getStatusColor(agent.status)}`}
            >
              {agent.status}
            </div>

            {/* Message */}
            <div className="text-gray-400 text-sm mb-3 h-12 overflow-hidden">
              {agent.message}
            </div>

            {/* Agent Stats */}
            <div className="flex justify-between text-xs text-gray-500 border-t border-gray-800 pt-2">
              <span>Tokens: {formatNumber(agent.tokens)}</span>
              <span>${agent.cost.toFixed(4)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Pipeline */}
      <div className="border border-gray-700 bg-[#0d1117] p-4 mt-4">
        <h3 className="text-gray-500 text-xs mb-3 uppercase tracking-wider">
          Agent Pipeline
        </h3>
        <div className="flex items-center justify-center gap-2 text-lg">
          <span className={getStatusColor(agents.planner?.status)}>
            [{getStatusIcon(agents.planner?.status)} PLANNER]
          </span>
          <span className="text-gray-600">───▶</span>
          <span className={getStatusColor(agents.implementer?.status)}>
            [{getStatusIcon(agents.implementer?.status)} IMPLEMENTER]
          </span>
          <span className="text-gray-600">───▶</span>
          <span className={getStatusColor(agents.reviewer?.status)}>
            [{getStatusIcon(agents.reviewer?.status)} REVIEWER]
          </span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="border border-gray-700 bg-[#0d1117] p-4 mt-4">
        <h3 className="text-gray-500 text-xs mb-3 uppercase tracking-wider">
          Message Stream
        </h3>
        <div className="h-64 overflow-y-auto font-mono text-sm space-y-1">
          {messages.length === 0 ? (
            <div className="text-gray-600">Waiting for agent activity...</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-2">
                <span className="text-gray-600 w-20 flex-shrink-0">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`w-24 flex-shrink-0 uppercase ${
                    msg.agent === "planner"
                      ? "text-purple-400"
                      : msg.agent === "implementer"
                        ? "text-blue-400"
                        : "text-orange-400"
                  }`}
                >
                  [{msg.agent}]
                </span>
                <span className="text-gray-300">{msg.content}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-4 text-center text-gray-600 text-xs border-t border-gray-800 pt-4">
        <pre className="text-cyan-900">
          ════════════════════════════════════════════════════════════════════
        </pre>
        ASCII AGENT DASHBOARD • Real-time Agent Monitoring
        <br />
        POST to {API_URL}/api/agent-update to update status
        <pre className="text-cyan-900">
          ════════════════════════════════════════════════════════════════════
        </pre>
      </footer>
    </div>
  );
}

export default App;
