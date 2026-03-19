"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

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
    <div className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] sm:max-w-[72%] flex flex-col ${isClient ? "items-end" : "items-start"} gap-1`}
      >
        {!isClient && (
          <span className="text-[10px] font-semibold text-charcoal-400 px-1">
            {msg.senderName}
          </span>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isClient
              ? "bg-orange-500 text-white rounded-br-sm"
              : "bg-charcoal-100 text-charcoal-900 rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-charcoal-300 px-1">
          {formatRelativeDate(msg.createdAt)}
          {isClient && msg.readAt && (
            <span className="text-orange-300 ml-1">· Read</span>
          )}
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
      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all ${
        active
          ? "bg-orange-50 border border-orange-200"
          : "border border-transparent hover:bg-charcoal-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3
          className={`text-sm font-semibold truncate leading-tight ${
            active ? "text-orange-700" : "text-charcoal-900"
          }`}
        >
          {thread.projectName}
        </h3>
        {thread.unreadCount > 0 && (
          <span className="text-[10px] font-bold bg-orange-500 text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center flex-shrink-0">
            {thread.unreadCount}
          </span>
        )}
      </div>
      <p className="text-xs text-charcoal-400 truncate leading-tight">
        {thread.lastMessage}
      </p>
      <p className="text-[10px] text-charcoal-300 mt-1">
        {formatRelativeDate(thread.lastMessageAt)}
      </p>
    </button>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function ThreadSkeleton() {
  return (
    <div className="px-4 py-3.5 space-y-2 animate-pulse">
      <div className="h-3.5 bg-charcoal-100 rounded w-3/4" />
      <div className="h-3 bg-charcoal-100 rounded w-1/2" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // ── Fetch threads ───────────────────────────────────────────────────────────
  const fetchThreads = useCallback(async () => {
    // Don't poll when tab is hidden
    if (document.hidden) return;
    try {
      const res = await fetch("/api/messages/threads");
      if (!res.ok) return;
      const data: Thread[] = await res.json();
      setThreads(data);
      setActiveThread((prev) =>
        prev
          ? (data.find((t) => t.projectId === prev.projectId) ?? prev)
          : (data[0] ?? null),
      );
    } catch {
      /* network error — silently retry */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
    pollRef.current = setInterval(fetchThreads, 8000);
    return () => clearInterval(pollRef.current);
  }, [fetchThreads]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  };

  // ── Send ────────────────────────────────────────────────────────────────────
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

    setActiveThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev,
    );
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "42px";

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeThread.projectId,
          content: optimistic.content,
        }),
      });
      if (!res.ok) throw new Error("Send failed");
      await fetchThreads();
    } catch {
      // Revert optimistic message
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

  // ── Open thread (mobile) ────────────────────────────────────────────────────
  function openThread(thread: Thread) {
    setActiveThread(thread);
    setMobileView("chat");
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pb-12">
        <div className="mb-6">
          <div className="h-7 bg-charcoal-100 rounded-lg w-36 mb-2 animate-pulse" />
          <div className="h-4 bg-charcoal-100 rounded w-56 animate-pulse" />
        </div>
        <div className="bg-white border border-charcoal-100 rounded-2xl overflow-hidden">
          <div
            className="flex"
            style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}
          >
            <div className="w-64 border-r border-charcoal-100 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <ThreadSkeleton key={i} />
              ))}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-charcoal-400 text-sm">Loading messages…</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (threads.length === 0) {
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
        <div className="bg-white border border-charcoal-100 rounded-2xl p-14 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-charcoal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-charcoal-300"
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
          <p className="text-charcoal-500 text-sm mb-6 leading-relaxed">
            Once you submit a verification request and it's assigned to an
            inspector, your thread will appear here.
          </p>
          <Link
            href="/request-verification"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Request a Verification
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        {/* Mobile back button when in chat view */}
        {mobileView === "chat" && (
          <button
            onClick={() => setMobileView("list")}
            className="sm:hidden p-2 -ml-1 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-charcoal-950 tracking-tight">
            {mobileView === "chat" && activeThread
              ? activeThread.projectName
              : "Messages"}
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm mt-0.5">
            {mobileView === "chat" && activeThread
              ? activeThread.projectType
              : "Direct line to your GRUTH inspection team"}
          </p>
        </div>
        {/* Link to project — visible in mobile chat header */}
        {mobileView === "chat" && activeThread && (
          <Link
            href={`/dashboard/projects/${activeThread.projectId}`}
            className="sm:hidden ml-auto text-xs font-semibold text-orange-600 hover:text-orange-700 flex-shrink-0"
          >
            View project →
          </Link>
        )}
      </div>

      {/* Chat container */}
      <div
        className="bg-white border border-charcoal-100 rounded-2xl overflow-hidden"
        style={{ height: "calc(100vh - 200px)", minHeight: "520px" }}
      >
        <div className="flex h-full">
          {/* ── Thread list ─────────────────────────────────────────────── */}
          <div
            className={`
            flex-shrink-0 border-r border-charcoal-100 flex flex-col
            w-full sm:w-64 xl:w-72
            ${mobileView === "chat" ? "hidden sm:flex" : "flex"}
          `}
          >
            <div className="px-4 py-3 border-b border-charcoal-100 flex-shrink-0">
              <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest">
                {threads.length} thread{threads.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {threads.map((thread) => (
                <ThreadItem
                  key={thread.projectId}
                  thread={thread}
                  active={activeThread?.projectId === thread.projectId}
                  onClick={() => openThread(thread)}
                />
              ))}
            </div>
          </div>

          {/* ── Chat pane ───────────────────────────────────────────────── */}
          {activeThread ? (
            <div
              className={`
              flex-1 flex flex-col min-w-0
              ${mobileView === "list" ? "hidden sm:flex" : "flex"}
            `}
            >
              {/* Chat header — desktop only (mobile uses page header) */}
              <div className="hidden sm:flex px-5 py-3.5 border-b border-charcoal-100 items-center justify-between gap-3 flex-shrink-0">
                <div className="min-w-0">
                  <h2 className="font-semibold text-charcoal-950 text-sm truncate">
                    {activeThread.projectName}
                  </h2>
                  <p className="text-xs text-charcoal-400 mt-0.5">
                    {activeThread.projectType}
                  </p>
                </div>
                <Link
                  href={`/dashboard/projects/${activeThread.projectId}`}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex-shrink-0 whitespace-nowrap"
                >
                  View project →
                </Link>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
                {activeThread.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-3">
                    <div className="w-10 h-10 bg-charcoal-50 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-charcoal-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                    </div>
                    <p className="text-charcoal-400 text-sm">
                      No messages yet. Send one to get started.
                    </p>
                  </div>
                ) : (
                  activeThread.messages.map((msg) => (
                    <Bubble key={msg.id} msg={msg} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div className="px-3 sm:px-4 py-3 border-t border-charcoal-100 flex gap-2.5 items-end flex-shrink-0">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type a message…"
                  className="flex-1 resize-none bg-charcoal-50 border border-charcoal-200 rounded-xl px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300 transition-all"
                  style={{ minHeight: "42px", maxHeight: "128px" }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || sending}
                  className="flex-shrink-0 w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                  aria-label="Send message"
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
            <div className="flex-1 hidden sm:flex items-center justify-center text-charcoal-300 text-sm">
              Select a thread to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
