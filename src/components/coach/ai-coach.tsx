"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Send,
  User,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface AiCoachProps {
  hasData: boolean;
  userName: string | null | undefined;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STARTER_QUESTIONS = [
  "What's the best strategy for my debts?",
  "How can I pay off debt faster?",
  "Explain the snowball vs avalanche method",
  "What's my debt-to-income ratio telling me?",
];

// ── Typing Indicator ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
        <Bot className="size-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
          <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
          <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-slate-200 dark:bg-slate-700"
            : "bg-emerald-500"
        }`}
      >
        {isUser ? (
          <User className="size-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <Bot className="size-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
          isUser
            ? "rounded-br-sm bg-emerald-500 text-white shadow-sm"
            : "rounded-bl-sm bg-white text-slate-800 shadow-sm border border-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
        }`}
      >
        {/* Render newlines as line breaks */}
        {message.content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Starter Chip ───────────────────────────────────────────────────────────────

function StarterChip({
  text,
  onClick,
}: {
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(text)}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
    >
      {text}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AiCoach({ hasData, userName }: AiCoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setError(null);
      setInput("");

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Placeholder for streaming assistant message
      const assistantId = crypto.randomUUID();

      // Create a mutable ref so we can accumulate text outside state
      let accumulated = "";

      try {
        // Abort any in-flight request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const resp = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, conversationId }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          throw new Error(`Server error ${resp.status}`);
        }

        const reader = resp.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();

        // Add empty assistant message to show streaming
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "", createdAt: new Date() },
        ]);

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();

            if (raw === "[DONE]") {
              break;
            }

            try {
              const parsed = JSON.parse(raw) as { text?: string; conversationId?: string };

              if (parsed.conversationId) {
                setConversationId(parsed.conversationId);
              }

              if (parsed.text) {
                accumulated += parsed.text;
                const snapshot = accumulated;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: snapshot } : m
                  )
                );
              }
            } catch {
              // Ignore JSON parse errors for malformed chunks
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        setError("Something went wrong. Please try again.");
        // Remove the empty assistant placeholder on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsTyping(false);
        inputRef.current?.focus();
      }
    },
    [isTyping, conversationId]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  const showStarters = messages.length === 0 && hasData;
  const firstName = userName?.split(" ")[0] ?? null;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50" style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}>

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 shadow-sm">
          <Bot className="size-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">DebtFree AI Coach</h2>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500">Online · powered by Claude</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        {/* No data gate */}
        {!hasData && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <Sparkles className="size-7 text-emerald-500" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              Let's personalize your plan
            </h3>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Add your debts and income first to get personalized advice tailored to your exact financial situation.
            </p>
            <div className="mt-4 flex flex-col items-center gap-2">
              <a
                href="/debts"
                className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Add Debts
              </a>
              <a
                href="/income"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Add Income & Expenses
              </a>
            </div>
          </div>
        )}

        {/* Welcome + starters */}
        {hasData && messages.length === 0 && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-sm">
              <Bot className="size-6 text-white" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              Hi{firstName ? `, ${firstName}` : ""}! I'm your AI debt coach.
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-slate-500">
              Ask me anything about your debts. I have access to your full financial picture.
            </p>
          </div>
        )}

        {/* Starter question chips */}
        {showStarters && (
          <div className="flex flex-wrap justify-center gap-2 pb-2">
            {STARTER_QUESTIONS.map((q) => (
              <StarterChip key={q} text={q} onClick={(t) => void sendMessage(t)} />
            ))}
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && messages[messages.length - 1]?.role === "user" && (
          <TypingIndicator />
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {hasData && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          {messages.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {STARTER_QUESTIONS.slice(0, 2).map((q) => (
                <button
                  key={q}
                  onClick={() => void sendMessage(q)}
                  disabled={isTyping}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 transition-all hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                placeholder="Ask your debt coach anything..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <Button
              variant="primary"
              size="icon"
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="size-10 shrink-0 rounded-xl"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            AI advice is for informational purposes only. Consult a financial advisor for major decisions.
          </p>
        </div>
      )}
    </div>
  );
}
