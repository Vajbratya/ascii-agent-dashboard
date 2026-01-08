import { useState, useCallback, useRef, useEffect } from "react";
import type { TerminalCommand } from "../types";

interface UseTerminalOptions {
  maxHistory?: number;
  onCommand?: (command: string) => Promise<string | void> | string | void;
  welcomeMessage?: string;
}

interface UseTerminalReturn {
  history: TerminalCommand[];
  currentInput: string;
  setCurrentInput: (input: string) => void;
  historyIndex: number;
  isProcessing: boolean;
  executeCommand: (command?: string) => Promise<void>;
  navigateHistory: (direction: "up" | "down") => void;
  clearHistory: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useTerminal(
  options: UseTerminalOptions = {},
): UseTerminalReturn {
  const { maxHistory = 100, onCommand, welcomeMessage } = options;

  const [history, setHistory] = useState<TerminalCommand[]>(() => {
    if (welcomeMessage) {
      return [
        {
          input: "",
          output: welcomeMessage,
          timestamp: new Date(),
        },
      ];
    }
    return [];
  });

  const [currentInput, setCurrentInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const commandHistory = useRef<string[]>([]);

  const executeCommand = useCallback(
    async (command?: string) => {
      const cmd = command ?? currentInput;
      if (!cmd.trim()) return;

      setIsProcessing(true);
      const timestamp = new Date();

      // Add to command history for navigation
      commandHistory.current = [
        cmd,
        ...commandHistory.current.slice(0, maxHistory - 1),
      ];
      setHistoryIndex(-1);

      let output: string | undefined;
      let isError = false;

      try {
        const result = await onCommand?.(cmd);
        output = result ?? undefined;
      } catch (error) {
        output = error instanceof Error ? error.message : "An error occurred";
        isError = true;
      }

      const newEntry: TerminalCommand = {
        input: cmd,
        output,
        timestamp,
        isError,
      };

      setHistory((prev) => {
        const updated = [...prev, newEntry];
        // Trim history if too long
        if (updated.length > maxHistory) {
          return updated.slice(-maxHistory);
        }
        return updated;
      });

      setCurrentInput("");
      setIsProcessing(false);
    },
    [currentInput, maxHistory, onCommand],
  );

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      const commands = commandHistory.current;
      if (commands.length === 0) return;

      if (direction === "up") {
        const newIndex = Math.min(historyIndex + 1, commands.length - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commands[newIndex] || "");
      } else {
        const newIndex = Math.max(historyIndex - 1, -1);
        setHistoryIndex(newIndex);
        setCurrentInput(newIndex >= 0 ? commands[newIndex] : "");
      }
    },
    [historyIndex],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    commandHistory.current = [];
    setHistoryIndex(-1);
  }, []);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return {
    history,
    currentInput,
    setCurrentInput,
    historyIndex,
    isProcessing,
    executeCommand,
    navigateHistory,
    clearHistory,
    inputRef,
  };
}

// Simpler hook for just the spinner animation
export function useSpinner(interval: number = 100): string {
  const [frame, setFrame] = useState(0);
  const frames = ["◐", "◓", "◑", "◒"];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, frames.length]);

  return frames[frame];
}
