import { useRef, useEffect } from "react";
import { useTerminal } from "../hooks/useTerminal";
import { BlinkingCursor, Spinner } from "./AsciiArt";
import { formatTimestamp } from "../utils/ascii-helpers";

interface TerminalProps {
  onCommand?: (command: string) => Promise<string | void> | string | void;
  welcomeMessage?: string;
  prompt?: string;
  className?: string;
  maxHistory?: number;
  showTimestamps?: boolean;
}

export function Terminal({
  onCommand,
  welcomeMessage = `
┌─────────────────────────────────────────────────────┐
│  ASCII AGENT TERMINAL v1.0.0                        │
│  Type 'help' for available commands                 │
└─────────────────────────────────────────────────────┘
`.trim(),
  prompt = "> ",
  className = "",
  maxHistory = 100,
  showTimestamps = false,
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    history,
    currentInput,
    setCurrentInput,
    isProcessing,
    executeCommand,
    navigateHistory,
    inputRef,
  } = useTerminal({
    maxHistory,
    onCommand,
    welcomeMessage,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateHistory("up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateHistory("down");
    }
  };

  // Focus input when clicking anywhere in terminal
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`
        flex flex-col
        bg-[#0a0a0a] border border-gray-700
        font-mono text-sm
        overflow-y-auto
        cursor-text
        ${className}
      `}
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-gray-700 sticky top-0">
        <span className="text-cyan-400 text-xs font-bold tracking-wider">
          TERMINAL
        </span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
      </div>

      {/* History */}
      <div className="flex-1 p-4 space-y-2">
        {history.map((entry, index) => (
          <div key={index} className="space-y-1">
            {/* Command input line (if it exists) */}
            {entry.input && (
              <div className="flex items-start gap-2">
                {showTimestamps && (
                  <span className="text-gray-600 text-xs">
                    [{formatTimestamp(entry.timestamp)}]
                  </span>
                )}
                <span className="text-green-400">{prompt}</span>
                <span className="text-gray-300">{entry.input}</span>
              </div>
            )}
            {/* Command output */}
            {entry.output && (
              <div
                className={`pl-4 whitespace-pre-wrap ${
                  entry.isError ? "text-red-400" : "text-gray-400"
                }`}
              >
                {entry.output}
              </div>
            )}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center gap-2">
          <span className="text-green-400">{prompt}</span>
          {isProcessing ? (
            <div className="flex items-center gap-2 text-yellow-400">
              <Spinner />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex-1 flex items-center">
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-gray-300 outline-none caret-transparent"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
              <BlinkingCursor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Minimal terminal component for quick commands
interface MiniTerminalProps {
  onCommand?: (command: string) => void;
  placeholder?: string;
  className?: string;
}

export function MiniTerminal({
  onCommand,
  placeholder = "Enter command...",
  className = "",
}: MiniTerminalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = e.currentTarget.value.trim();
      if (value && onCommand) {
        onCommand(value);
        e.currentTarget.value = "";
      }
    }
  };

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2
        bg-[#0a0a0a] border border-gray-700
        font-mono text-sm
        ${className}
      `}
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-green-400">&gt;</span>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-gray-300 placeholder-gray-600 outline-none"
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
