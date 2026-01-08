import { useState, useEffect, useCallback, useRef } from "react";

interface UseTypewriterOptions {
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  displayedText: string;
  isTyping: boolean;
  isComplete: boolean;
  reset: () => void;
  skip: () => void;
}

export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {},
): UseTypewriterReturn {
  const { speed = 30, delay = 0, onComplete } = options;

  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
    setIsTyping(false);

    if (text.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsTyping(true);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, delay]);

  // Typing effect
  useEffect(() => {
    if (!isTyping || isComplete) return;

    if (currentIndex < text.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      setIsTyping(false);
      setIsComplete(true);
      onCompleteRef.current?.();
    }
  }, [isTyping, currentIndex, text, speed, isComplete]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
    setIsTyping(false);

    if (text.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsTyping(true);
      }, delay);
    }
  }, [text, delay]);

  const skip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText(text);
    setCurrentIndex(text.length);
    setIsTyping(false);
    setIsComplete(true);
    onCompleteRef.current?.();
  }, [text]);

  return {
    displayedText,
    isTyping,
    isComplete,
    reset,
    skip,
  };
}

// Hook for typing multiple messages in sequence
interface TypewriterQueueItem {
  id: string;
  text: string;
}

interface UseTypewriterQueueReturn {
  currentText: string;
  currentId: string | null;
  isTyping: boolean;
  completedIds: string[];
  addToQueue: (item: TypewriterQueueItem) => void;
  clearQueue: () => void;
}

export function useTypewriterQueue(
  speed: number = 30,
): UseTypewriterQueueReturn {
  const [queue, setQueue] = useState<TypewriterQueueItem[]>([]);
  const [currentItem, setCurrentItem] = useState<TypewriterQueueItem | null>(
    null,
  );
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const { displayedText, isComplete } = useTypewriter(currentItem?.text || "", {
    speed,
    onComplete: () => {
      if (currentItem) {
        setCompletedIds((prev) => [...prev, currentItem.id]);
      }
    },
  });

  // Process queue
  useEffect(() => {
    if (isComplete && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentItem(next);
      setQueue(rest);
    } else if (!currentItem && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentItem(next);
      setQueue(rest);
    }
  }, [isComplete, queue, currentItem]);

  const addToQueue = useCallback((item: TypewriterQueueItem) => {
    setQueue((prev) => [...prev, item]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentItem(null);
    setCompletedIds([]);
  }, []);

  return {
    currentText: displayedText,
    currentId: currentItem?.id || null,
    isTyping: !isComplete && currentItem !== null,
    completedIds,
    addToQueue,
    clearQueue,
  };
}
