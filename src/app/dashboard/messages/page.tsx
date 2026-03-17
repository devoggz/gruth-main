"use client";
// src/app/dashboard/messages/page.tsx
// Real-time via polling (upgradeable to SSE / WebSocket later).
// Messages grouped by project thread.

import { useState, useEffect, useRef, useCallback } from "react";
import { formatRelativeDate } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isFromClient: boolean;
  createdAt: string;
  readAt: string | null;
  senderName: string;
}

interface Thread {
  projectId: string;
  projectName: string;
  projectType: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isClient = msg.isFromClient;
  return (
    <div className={`flex ${isClient ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-[75%] flex flex-col ${isClient ? "items-end" : "items-start"} gap-1`}
      >
        {!isClient && (
          <span className="text-[10px] font-semibold text-charcoal-400 px-1">
            {msg.senderName}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all ${
            isClient
              ? "bg-orange-500 text-white rounded-br-md"
              : "bg-charcoal-100 text-charcoal-900 rounded-bl-md"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-charcoal-300 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatRelativeDate(msg.createdAt)}
          {isClient && msg.readAt && " · Read"}
        </span>
      </div>
    </div>
  );
}

// ─── Thread list item ─────────────────────────────────────────────────────────
function ThreadItem({
  thread,
  active,
  onClick,
}: {
  thread: Thread;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all hover:bg-charcoal-50 ${
        active
          ? "bg-orange-50 border border-orange-200"
          : "border border-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3
          className={`text-sm font-semibold truncate ${active ? "text-orange-700" : "text-charcoal-900"}`}
        >
          {thread.projectName}
        </h3>
        {thread.unreadCount > 0 && (
          <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
            {thread.unreadCount}
          </span>
        )}
      </div>
      <p className="text-xs text-charcoal-400 truncate">{thread.lastMessage}</p>
      <p className="text-[10px] text-charcoal-300 mt-1">
        {formatRelativeDate(thread.lastMessageAt)}
      </p>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/threads");
      if (!res.ok) return;
      const data: Thread[] = await res.json();
      setThreads(data);
      // Keep active thread fresh
      setActiveThread((prev) =>
        prev
          ? (data.find((t) => t.projectId === prev.projectId) ?? prev)
          : (data[0] ?? null),
      );
    } catch {
      // network error — silently retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
    // Poll every 5 seconds
    pollRef.current = setInterval(fetchThreads, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchThreads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  async function send() {
    if (!input.trim() || !activeThread || sending) return;
    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      content: input.trim(),
      isFromClient: true,
      createdAt: new Date().toISOString(),
      readAt: null,
      senderName: "You",
    };
    // Optimistic update
    setActiveThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev,
    );
    setInput("");
    try {
      await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeThread.projectId,
          content: optimistic.content,
        }),
      });
      await fetchThreads();
    } catch {
      // revert optimistic on failure
      setActiveThread((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((m) => m.id !== optimistic.id),
            }
          : prev,
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-charcoal-400 text-sm">Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal-950 tracking-tight">
          Messages
        </h1>
        <p className="text-charcoal-500 text-sm mt-1">
          Direct line to your GRUTH inspection team
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="card p-16 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-charcoal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-charcoal-900 mb-2">
            No messages yet
          </h3>
          <p className="text-charcoal-500 text-sm">
            Once you submit a verification request, your assigned inspector will
            reach out here.
          </p>
        </div>
      ) : (
        <div
          className="card overflow-hidden"
          style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}
        >
          <div className="flex h-full">
            {/* Thread list */}
            <div className="w-64 xl:w-72 flex-shrink-0 border-r border-charcoal-100 overflow-y-auto">
              <div className="p-3 border-b border-charcoal-100">
                <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest px-1">
                  {threads.length} thread{threads.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="p-2 space-y-1">
                {threads.map((thread) => (
                  <ThreadItem
                    key={thread.projectId}
                    thread={thread}
                    active={activeThread?.projectId === thread.projectId}
                    onClick={() => setActiveThread(thread)}
                  />
                ))}
              </div>
            </div>

            {/* Chat pane */}
            {activeThread ? (
              <div className="flex-1 flex flex-col min-w-0">
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-charcoal-100 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-charcoal-950 text-sm">
                      {activeThread.projectName}
                    </h2>
                    <p className="text-xs text-charcoal-400 mt-0.5">
                      {activeThread.projectType}
                    </p>
                  </div>
                  <a
                    href={`/dashboard/projects/${activeThread.projectId}`}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex-shrink-0"
                  >
                    View project →
                  </a>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {activeThread.messages.length === 0 && (
                    <div className="text-center py-12 text-charcoal-400 text-sm">
                      No messages yet in this thread. Send a message to your
                      inspector.
                    </div>
                  )}
                  {activeThread.messages.map((msg) => (
                    <Bubble key={msg.id} msg={msg} />
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-charcoal-100 flex gap-3 items-end">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Type a message…"
                    className="flex-1 resize-none bg-charcoal-50 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 placeholder-charcoal-300 outline-none focus:ring-2 focus:ring-orange-400/40 transition-all max-h-32"
                    style={{ minHeight: "42px" }}
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || sending}
                    className="flex-shrink-0 w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-4 h-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-charcoal-300 text-sm">
                Select a thread to view messages
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
