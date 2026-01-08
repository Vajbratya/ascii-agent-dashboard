import type { AgentStatus } from "../types";
import { AsciiArt, StatusIndicator } from "./AsciiArt";
import { AVATARS } from "../utils/ascii-helpers";

interface AgentCardProps {
  name: string;
  status: AgentStatus;
  avatar?: keyof typeof AVATARS | string;
  messages?: number;
  description?: string;
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: "border-gray-700",
  thinking: "border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
  working: "border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]",
  error: "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
  waiting: "border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
};

const STATUS_TEXT_COLORS: Record<AgentStatus, string> = {
  idle: "text-gray-500",
  thinking: "text-yellow-400",
  working: "text-green-400",
  error: "text-red-400",
  waiting: "text-cyan-400",
};

export function AgentCard({
  name,
  status,
  avatar = "robot1",
  messages = 0,
  description,
  className = "",
  compact = false,
  onClick,
}: AgentCardProps) {
  const avatarArt =
    typeof avatar === "string" && avatar in AVATARS
      ? AVATARS[avatar as keyof typeof AVATARS]
      : avatar;

  const borderColor = STATUS_COLORS[status];
  const textColor = STATUS_TEXT_COLORS[status];

  if (compact) {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5
          bg-[#111] border ${borderColor}
          font-mono text-sm
          ${onClick ? "cursor-pointer hover:bg-[#1a1a1a]" : ""}
          transition-all duration-200
          ${className}
        `}
        onClick={onClick}
      >
        <StatusIndicator status={status} />
        <span className="text-gray-300">{name}</span>
        {messages > 0 && (
          <span className="text-gray-500 text-xs">[{messages}]</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        relative bg-[#0a0a0a] border ${borderColor}
        font-mono transition-all duration-200
        ${onClick ? "cursor-pointer hover:bg-[#111]" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <span className="text-cyan-400 text-sm font-bold tracking-wider">
          {name.toUpperCase()}
        </span>
        <span className={`flex items-center gap-1 text-xs ${textColor}`}>
          <StatusIndicator status={status} showLabel />
        </span>
      </div>

      {/* Avatar Section */}
      <div className="flex justify-center py-3 border-b border-gray-800">
        <AsciiArt
          art={avatarArt}
          className={`${textColor} text-[10px] leading-tight`}
        />
      </div>

      {/* Stats Section */}
      <div className="px-3 py-2 text-xs">
        {description && (
          <p className="text-gray-500 mb-2 truncate">{description}</p>
        )}
        <div className="flex items-center justify-between text-gray-400">
          <span>Messages:</span>
          <span className="text-gray-300">{messages}</span>
        </div>
      </div>

      {/* Status Bar at bottom */}
      <div
        className={`h-1 ${
          status === "working"
            ? "bg-green-500"
            : status === "thinking"
              ? "bg-yellow-500"
              : status === "error"
                ? "bg-red-500"
                : status === "waiting"
                  ? "bg-cyan-500"
                  : "bg-gray-700"
        }`}
      />
    </div>
  );
}

// Grid layout for multiple agents
interface AgentGridProps {
  agents: Array<{
    id: string;
    name: string;
    status: AgentStatus;
    avatar?: keyof typeof AVATARS | string;
    messages?: number;
    description?: string;
  }>;
  onAgentClick?: (agentId: string) => void;
  className?: string;
}

export function AgentGrid({
  agents,
  onAgentClick,
  className = "",
}: AgentGridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          name={agent.name}
          status={agent.status}
          avatar={agent.avatar}
          messages={agent.messages}
          description={agent.description}
          onClick={onAgentClick ? () => onAgentClick(agent.id) : undefined}
        />
      ))}
    </div>
  );
}

// Horizontal agent flow with connections
interface AgentFlowProps {
  agents: Array<{
    id: string;
    name: string;
    status: AgentStatus;
  }>;
  className?: string;
}

export function AgentFlow({ agents, className = "" }: AgentFlowProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto ${className}`}>
      {agents.map((agent, index) => (
        <div key={agent.id} className="flex items-center">
          <AgentCard name={agent.name} status={agent.status} compact />
          {index < agents.length - 1 && (
            <span className="text-gray-600 mx-2">───▶</span>
          )}
        </div>
      ))}
    </div>
  );
}
