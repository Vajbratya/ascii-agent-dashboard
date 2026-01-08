import { useState, useRef, useEffect, useMemo } from "react";
import type { LogEntry, LogLevel } from "../types";
import { formatTimestamp } from "../utils/ascii-helpers";

interface LogViewerProps {
  logs: LogEntry[];
  filter?: LogLevel[];
  maxLogs?: number;
  className?: string;
  autoScroll?: boolean;
  showSource?: boolean;
  searchable?: boolean;
}

const LOG_LEVEL_CONFIG: Record<
  LogLevel,
  { color: string; bgColor: string; icon: string }
> = {
  DEBUG: {
    color: "text-gray-400",
    bgColor: "bg-gray-900/50",
    icon: "○",
  },
  INFO: {
    color: "text-blue-400",
    bgColor: "bg-blue-900/20",
    icon: "●",
  },
  WARN: {
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20",
    icon: "⚠",
  },
  ERROR: {
    color: "text-red-400",
    bgColor: "bg-red-900/20",
    icon: "✖",
  },
};

export function LogViewer({
  logs,
  filter,
  maxLogs = 500,
  className = "",
  autoScroll = true,
  showSource = true,
  searchable = true,
}: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<LogLevel[]>(
    filter || ["DEBUG", "INFO", "WARN", "ERROR"],
  );

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => activeFilters.includes(log.level))
      .filter(
        (log) =>
          !searchQuery ||
          log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.source?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(-maxLogs);
  }, [logs, activeFilters, searchQuery, maxLogs]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const toggleFilter = (level: LogLevel) => {
    setActiveFilters((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  };

  return (
    <div
      className={`
        flex flex-col
        bg-[#0a0a0a] border border-gray-700
        font-mono text-xs
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-gray-700">
        <span className="text-cyan-400 text-sm font-bold tracking-wider">
          LOG VIEWER
        </span>
        <span className="text-gray-500">
          {filteredLogs.length}/{logs.length}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 flex-wrap">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {(Object.keys(LOG_LEVEL_CONFIG) as LogLevel[]).map((level) => {
            const config = LOG_LEVEL_CONFIG[level];
            const isActive = activeFilters.includes(level);
            return (
              <button
                key={level}
                onClick={() => toggleFilter(level)}
                className={`
                  px-2 py-0.5 text-xs
                  border transition-colors
                  ${
                    isActive
                      ? `${config.color} border-current`
                      : "text-gray-600 border-gray-700"
                  }
                `}
              >
                {config.icon} {level}
              </button>
            );
          })}
        </div>

        {/* Search */}
        {searchable && (
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full px-2 py-1 bg-[#111] border border-gray-700 text-gray-300 placeholder-gray-600 outline-none focus:border-cyan-500"
            />
          </div>
        )}
      </div>

      {/* Log Entries */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-0.5"
      >
        {filteredLogs.map((log) => (
          <LogEntryRow key={log.id} log={log} showSource={showSource} />
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            No logs to display
          </div>
        )}
      </div>
    </div>
  );
}

interface LogEntryRowProps {
  log: LogEntry;
  showSource: boolean;
}

function LogEntryRow({ log, showSource }: LogEntryRowProps) {
  const config = LOG_LEVEL_CONFIG[log.level];

  return (
    <div
      className={`
        flex items-start gap-2 px-2 py-1
        ${config.bgColor}
        hover:bg-gray-800/50 transition-colors
      `}
    >
      {/* Timestamp */}
      <span className="text-gray-600 shrink-0">
        [{formatTimestamp(log.timestamp)}]
      </span>

      {/* Level */}
      <span className={`${config.color} font-bold shrink-0 w-14`}>
        {config.icon} {log.level}
      </span>

      {/* Source */}
      {showSource && log.source && (
        <span className="text-purple-400 shrink-0">[{log.source}]</span>
      )}

      {/* Message */}
      <span className="text-gray-300 break-all">{log.message}</span>
    </div>
  );
}

// Compact log display
interface CompactLogProps {
  logs: LogEntry[];
  maxLines?: number;
  className?: string;
}

export function CompactLog({
  logs,
  maxLines = 5,
  className = "",
}: CompactLogProps) {
  const recentLogs = logs.slice(-maxLines);

  return (
    <div className={`font-mono text-xs space-y-0.5 ${className}`}>
      {recentLogs.map((log) => {
        const config = LOG_LEVEL_CONFIG[log.level];
        return (
          <div key={log.id} className="flex items-center gap-2 truncate">
            <span className={`${config.color} shrink-0`}>{config.icon}</span>
            <span className="text-gray-500 shrink-0">
              {formatTimestamp(log.timestamp)}
            </span>
            <span className="text-gray-400 truncate">{log.message}</span>
          </div>
        );
      })}
    </div>
  );
}
