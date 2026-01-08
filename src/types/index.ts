// Agent Types
export type AgentStatus = "idle" | "thinking" | "working" | "error" | "waiting";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  avatar?: string;
  messages: number;
  description?: string;
}

// Message Types
export type MessageType = "user" | "agent" | "system" | "tool" | "error";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  metadata?: Record<string, unknown>;
}

// Log Types
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  source?: string;
  metadata?: Record<string, unknown>;
}

// Stats Types
export interface Stats {
  tokens: number;
  cost: number;
  messages: number;
}

// Terminal Types
export interface TerminalCommand {
  input: string;
  output?: string;
  timestamp: Date;
  isError?: boolean;
}

// Connection Types for Agent Graph
export interface AgentConnection {
  from: string;
  to: string;
  label?: string;
}
