"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, User, AlertCircle, TrendingDown, Lightbulb, Trophy, ChevronRight } from "lucide-react";
import type { CoachInsight, CoachResponse } from "@/lib/financial/coach-engine";

interface AiCoachProps {
  hasData: boolean;
  userName?: string | null;
}

const STARTER_QUESTIONS = [
  "What's the best strategy for my debts?",
  "How can I pay off debt faster?",
  "Explain snowball vs avalanche",
  "What does my DTI ratio mean?",
  "How much does extra $100/mo save?",
  "Where should I put a lump sum bonus?",
];

const INSIGHT_ICONS = {
  critical: <AlertCircle size={16} className="text-red-500 shrink-0" />,
  warning: <AlertCircle size={16} className="text-yellow-500 shrink-0" />,
  tip: <Lightbulb size={16} className="text-blue-500 shrink-0" />,
  win: <Trophy size={16} className="text-emerald-500 shrink-0" />,
};

const INSIGHT_COLORS = {
  critical: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
  warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30",
  tip: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
  win: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
};

interface Turn {
  question: string;
  response: CoachResponse;
}

export function AiCoach({ hasData }: AiCoachProps) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      if (!res.ok) throw new Error("Failed to get coaching");
      const data = await res.json();
      setTurns((prev) => [...prev, { question, response: data.coaching }]);
    } catch {
      setError("Could not load coaching. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <Bot size={40} className="mx-auto mb-4 text-emerald-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Add your debts first
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Your coach needs real data to give personalized advice — not generic tips.
          Add at least one debt and your income to get started.
        </p>
      </div>
    );
  }

  const latestResponse = turns.length > 0 ? turns[turns.length - 1].response : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main coaching panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Starter prompts */}
        {turns.length === 0 && !loading && (
          <div>
            <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              Ask your coach anything:
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation turns */}
        <div className="space-y-6">
          {turns.map((turn, i) => (
            <div key={i} className="space-y-4">
              {/* User question */}
              <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-md">
                  <div className="rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-2.5 text-sm text-white">
                    {turn.question}
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                    <User size={14} />
                  </div>
                </div>
              </div>

              {/* Coach response */}
              <CoachCard response={turn.response} />
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Bot size={16} className="text-emerald-600" />
              </div>
              <div className="flex gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce [animation-delay:0.1s]">•</span>
                <span className="animate-bounce [animation-delay:0.2s]">•</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <div ref={bottomRef} />

        {/* Input */}
        <div className="sticky bottom-4">
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about your debt strategy..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              size="icon"
              className="shrink-0"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Side panel: latest insights */}
      {latestResponse && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {latestResponse.topRecommendation}
              </p>
            </CardContent>
          </Card>

          {latestResponse.motivationalNote && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-start gap-2">
                <TrendingDown size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  {latestResponse.motivationalNote}
                </p>
              </div>
            </div>
          )}

          {turns.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Ask another question
              </p>
              <div className="space-y-1">
                {STARTER_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ChevronRight size={14} className="shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CoachCard({ response }: { response: CoachResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <Bot size={16} className="text-emerald-600" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex-1">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {response.summary}
          </p>
        </div>
      </div>

      {response.insights.length > 0 && (
        <div className="ml-11 space-y-2">
          {response.insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}

      {response.payoffPlan && response.payoffPlan.includes("**") && (
        <div className="ml-11">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Your Payoff Plan
            </p>
            <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {response.payoffPlan.replace(/\*\*/g, "")}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: CoachInsight }) {
  return (
    <div className={`rounded-xl border p-3 ${INSIGHT_COLORS[insight.type]}`}>
      <div className="flex items-start gap-2">
        {INSIGHT_ICONS[insight.type]}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{insight.title}</p>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{insight.detail}</p>
          {insight.action && (
            <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              → {insight.action}
            </p>
          )}
          {insight.impact && (
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              Impact: {insight.impact}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
