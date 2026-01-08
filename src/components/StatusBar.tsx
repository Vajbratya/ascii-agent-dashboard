import type { Agent, Stats } from "../types";
import { StatusIndicator } from "./AsciiArt";
import { formatNumber, formatCost } from "../utils/ascii-helpers";

interface StatusBarProps {
  agents?: Agent[];
  stats?: Stats;
  title?: string;
  showLiveIndicator?: boolean;
  className?: string;
}

export function StatusBar({
  agents = [],
  stats,
  title = "AGENT STATUS",
  showLiveIndicator = true,
  className = "",
}: StatusBarProps) {
  return (
    <div
      className={`
        bg-[#0a0a0a] border border-gray-700 font-mono
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#111]">
        <span className="text-cyan-400 text-sm font-bold tracking-wider">
          {title}
        </span>
        {showLiveIndicator && (
          <span className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400">LIVE</span>
          </span>
        )}
      </div>

      {/* Agent Status Row */}
      {agents.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800 overflow-x-auto">
          {agents.map((agent, index) => (
            <div key={agent.id} className="flex items-center">
              <AgentStatusBadge agent={agent} />
              {index < agents.length - 1 && (
                <span className="text-gray-600 ml-4">───▶</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div className="flex items-center justify-around px-4 py-2 text-xs">
          <StatItem label="Messages" value={stats.messages.toString()} />
          <span className="text-gray-700">│</span>
          <StatItem label="Tokens" value={formatNumber(stats.tokens)} />
          <span className="text-gray-700">│</span>
          <StatItem label="Cost" value={formatCost(stats.cost)} />
        </div>
      )}
    </div>
  );
}

interface AgentStatusBadgeProps {
  agent: Agent;
}

function AgentStatusBadge({ agent }: AgentStatusBadgeProps) {
  return (
    <div className="flex flex-col items-center min-w-[80px] px-3 py-2 bg-[#111] border border-gray-800">
      <span className="text-gray-400 text-xs font-bold tracking-wider mb-1">
        {agent.name.toUpperCase()}
      </span>
      <StatusIndicator status={agent.status} showLabel />
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}

// Compact horizontal status bar
interface CompactStatusBarProps {
  stats?: Stats;
  status?: "connected" | "disconnected" | "loading";
  className?: string;
}

export function CompactStatusBar({
  stats,
  status = "connected",
  className = "",
}: CompactStatusBarProps) {
  const statusConfig = {
    connected: { color: "text-green-400", icon: "●", label: "CONNECTED" },
    disconnected: { color: "text-red-400", icon: "○", label: "DISCONNECTED" },
    loading: { color: "text-yellow-400", icon: "◐", label: "LOADING" },
  };

  const currentStatus = statusConfig[status];

  return (
    <div
      className={`
        flex items-center justify-between px-4 py-1
        bg-[#111] border-t border-gray-800
        font-mono text-xs
        ${className}
      `}
    >
      {/* Left: Status */}
      <span className={`flex items-center gap-2 ${currentStatus.color}`}>
        <span>{currentStatus.icon}</span>
        <span>{currentStatus.label}</span>
      </span>

      {/* Right: Stats */}
      {stats && (
        <div className="flex items-center gap-4 text-gray-500">
          <span>
            MSG: <span className="text-gray-300">{stats.messages}</span>
          </span>
          <span>
            TOK:{" "}
            <span className="text-gray-300">{formatNumber(stats.tokens)}</span>
          </span>
          <span>
            $: <span className="text-gray-300">{stats.cost.toFixed(2)}</span>
          </span>
        </div>
      )}
    </div>
  );
}

// Full dashboard-style status board
interface StatusDashboardProps {
  agents: Agent[];
  stats: Stats;
  title?: string;
  className?: string;
}

export function StatusDashboard({
  agents,
  stats,
  title = "AGENT STATUS BOARD",
  className = "",
}: StatusDashboardProps) {
  return (
    <div
      className={`
        bg-[#0a0a0a] border border-gray-700 font-mono
        ${className}
      `}
    >
      {/* Top Border with Title */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#111]">
        <span className="text-cyan-400 font-bold tracking-wider">{title}</span>
        <span className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">[</span>
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400">LIVE</span>
          <span className="text-gray-500">]</span>
        </span>
      </div>

      {/* Agent Flow Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {agents.map((agent, index) => (
            <div key={agent.id} className="flex items-center">
              <div className="flex flex-col items-center p-3 bg-[#111] border border-gray-700 min-w-[100px]">
                <span className="text-cyan-400 text-xs font-bold mb-2">
                  {agent.name.toUpperCase()}
                </span>
                <StatusIndicator status={agent.status} showLabel />
              </div>
              {index < agents.length - 1 && (
                <span className="text-cyan-600 mx-2">───▶</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-around px-4 py-3 text-sm">
        <div className="text-center">
          <span className="text-gray-500">Messages: </span>
          <span className="text-white font-bold">{stats.messages}</span>
        </div>
        <span className="text-gray-700">│</span>
        <div className="text-center">
          <span className="text-gray-500">Tokens: </span>
          <span className="text-white font-bold">
            {formatNumber(stats.tokens)}
          </span>
        </div>
        <span className="text-gray-700">│</span>
        <div className="text-center">
          <span className="text-gray-500">Cost: </span>
          <span className="text-white font-bold">{formatCost(stats.cost)}</span>
        </div>
      </div>
    </div>
  );
}
