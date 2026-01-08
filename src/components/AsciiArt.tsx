import { useEffect, useState } from "react";
import { SPINNER_FRAMES } from "../utils/ascii-helpers";

interface AsciiArtProps {
  art: string;
  className?: string;
  color?: string;
}

export function AsciiArt({ art, className = "", color }: AsciiArtProps) {
  const style = color ? { color } : undefined;

  return (
    <pre
      className={`font-mono text-xs leading-none whitespace-pre ${className}`}
      style={style}
    >
      {art}
    </pre>
  );
}

interface SpinnerProps {
  className?: string;
  speed?: number;
}

export function Spinner({ className = "", speed = 100 }: SpinnerProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, speed);

    return () => clearInterval(timer);
  }, [speed]);

  return (
    <span className={`inline-block text-cyan-400 ${className}`}>
      {SPINNER_FRAMES[frame]}
    </span>
  );
}

interface BlinkingCursorProps {
  className?: string;
  char?: string;
}

export function BlinkingCursor({
  className = "",
  char = "█",
}: BlinkingCursorProps) {
  return (
    <span className={`cursor-blink text-green-400 ${className}`}>{char}</span>
  );
}

interface StatusIndicatorProps {
  status: "idle" | "thinking" | "working" | "error" | "waiting" | "success";
  className?: string;
  showLabel?: boolean;
}

interface StatusConfigItem {
  icon: string;
  color: string;
  label: string;
  animate?: boolean;
  pulse?: boolean;
}

const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  idle: { icon: "○", color: "text-gray-500", label: "IDLE" },
  thinking: {
    icon: "◐",
    color: "text-yellow-400",
    label: "THINKING",
    animate: true,
  },
  working: {
    icon: "◉",
    color: "text-green-400",
    label: "WORKING",
    pulse: true,
  },
  error: { icon: "✖", color: "text-red-500", label: "ERROR" },
  waiting: { icon: "◔", color: "text-cyan-400", label: "WAITING" },
  success: { icon: "✔", color: "text-green-400", label: "SUCCESS" },
};

export function StatusIndicator({
  status,
  className = "",
  showLabel = false,
}: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (config.animate) {
      const timer = setInterval(() => {
        setFrame((prev) => (prev + 1) % SPINNER_FRAMES.length);
      }, 150);
      return () => clearInterval(timer);
    }
  }, [config.animate]);

  const icon = config.animate ? SPINNER_FRAMES[frame] : config.icon;
  const pulseClass = config.pulse ? "status-pulse" : "";

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`${config.color} ${pulseClass}`}>{icon}</span>
      {showLabel && (
        <span className={`text-xs ${config.color}`}>{config.label}</span>
      )}
    </span>
  );
}

interface AsciiBoxProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: "single" | "double" | "rounded";
  highlight?: boolean;
}

const BOX_CHARS = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  rounded: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
};

export function AsciiBox({
  children,
  title,
  className = "",
  variant = "single",
  highlight = false,
}: AsciiBoxProps) {
  const chars = BOX_CHARS[variant];
  const highlightClass = highlight
    ? "border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
    : "border-gray-700";

  return (
    <div
      className={`relative bg-[#111] border ${highlightClass} ${className}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {title && (
        <div className="absolute -top-3 left-4 px-2 bg-[#111] text-cyan-400 text-sm">
          {chars.h} {title} {chars.h}
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

export function TypewriterText({
  text,
  speed = 30,
  className = "",
  onComplete,
  showCursor = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && <BlinkingCursor />}
    </span>
  );
}
