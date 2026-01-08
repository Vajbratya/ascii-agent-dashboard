import { useEffect, useRef, useState } from "react";
import type { Message, MessageType } from "../types";
import { BlinkingCursor } from "./AsciiArt";
import { formatTimestamp } from "../utils/ascii-helpers";

interface MessageStreamProps {
  messages: Message[];
  typewriterSpeed?: number;
  showTimestamps?: boolean;
  className?: string;
  autoScroll?: boolean;
}

const MESSAGE_STYLES: Record<
  MessageType,
  { prefix: string; color: string; bgColor: string }
> = {
  user: {
    prefix: "USER",
    color: "text-blue-400",
    bgColor: "bg-blue-950/30",
  },
  agent: {
    prefix: "AGENT",
    color: "text-green-400",
    bgColor: "bg-green-950/30",
  },
  system: {
    prefix: "SYS",
    color: "text-yellow-400",
    bgColor: "bg-yellow-950/30",
  },
  tool: {
    prefix: "TOOL",
    color: "text-purple-400",
    bgColor: "bg-purple-950/30",
  },
  error: {
    prefix: "ERR",
    color: "text-red-400",
    bgColor: "bg-red-950/30",
  },
};

export function MessageStream({
  messages,
  typewriterSpeed = 30,
  showTimestamps = true,
  className = "",
  autoScroll = true,
}: MessageStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // Start typing animation for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setTypingMessageId(lastMessage.id);
    }
  }, [messages.length, messages]);

  return (
    <div
      ref={containerRef}
      className={`
        flex flex-col gap-2 overflow-y-auto
        font-mono text-sm
        bg-[#0a0a0a] p-4
        ${className}
      `}
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isTyping={message.id === typingMessageId}
          typewriterSpeed={typewriterSpeed}
          showTimestamp={showTimestamps}
          onTypingComplete={() => {
            if (message.id === typingMessageId) {
              setTypingMessageId(null);
            }
          }}
        />
      ))}
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  isTyping: boolean;
  typewriterSpeed: number;
  showTimestamp: boolean;
  onTypingComplete: () => void;
}

function MessageItem({
  message,
  isTyping,
  typewriterSpeed,
  showTimestamp,
  onTypingComplete,
}: MessageItemProps) {
  const style = MESSAGE_STYLES[message.type];
  const [displayedContent, setDisplayedContent] = useState(
    isTyping ? "" : message.content,
  );
  const [showCursor, setShowCursor] = useState(isTyping);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedContent(message.content);
      setShowCursor(false);
      return;
    }

    let currentIndex = 0;
    setDisplayedContent("");
    setShowCursor(true);

    const timer = setInterval(() => {
      if (currentIndex < message.content.length) {
        setDisplayedContent((prev) => prev + message.content[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(timer);
        setShowCursor(false);
        onTypingComplete();
      }
    }, typewriterSpeed);

    return () => clearInterval(timer);
  }, [isTyping, message.content, typewriterSpeed, onTypingComplete]);

  return (
    <div
      className={`${style.bgColor} border-l-2 border-current p-2 ${style.color}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold text-xs tracking-wider">
          [{style.prefix}]
        </span>
        {message.agentName && (
          <span className="text-xs text-gray-400">{message.agentName}</span>
        )}
        {showTimestamp && (
          <span className="text-xs text-gray-600 ml-auto">
            {formatTimestamp(message.timestamp)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="text-gray-300 whitespace-pre-wrap">
        {displayedContent}
        {showCursor && <BlinkingCursor />}
      </div>
    </div>
  );
}

// Compact message list without typewriter effect
interface MessageListProps {
  messages: Message[];
  maxMessages?: number;
  className?: string;
}

export function MessageList({
  messages,
  maxMessages = 50,
  className = "",
}: MessageListProps) {
  const displayMessages = messages.slice(-maxMessages);

  return (
    <div className={`flex flex-col gap-1 font-mono text-xs ${className}`}>
      {displayMessages.map((message) => {
        const style = MESSAGE_STYLES[message.type];
        return (
          <div key={message.id} className="flex items-start gap-2">
            <span className={`${style.color} font-bold shrink-0`}>
              [{style.prefix}]
            </span>
            <span className="text-gray-400 shrink-0">
              {formatTimestamp(message.timestamp)}
            </span>
            <span className="text-gray-300 truncate">{message.content}</span>
          </div>
        );
      })}
    </div>
  );
}
