"use client";
// src/app/admin/projects/[id]/messages/page.tsx
// Admin sends messages to client — mirrors client Messages UI.

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { formatRelativeDate } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isFromClient: boolean;
  createdAt: string;
  readAt: string | null;
  senderName: string;
}

interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
}

function Bubble({ msg }: { msg: Message }) {
  const isAdmin = !msg.isFromClient;
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-[75%] flex flex-col ${isAdmin ? "items-end" : "items-start"} gap-1`}
      >
        {!isAdmin && (
          <span className="text-[10px] font-semibold text-charcoal-400 px-1">
            {msg.senderName}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isAdmin
              ? "bg-violet-600 text-white rounded-br-md"
              : "bg-charcoal-100 text-charcoal-900 rounded-bl-md"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-charcoal-300 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatRelativeDate(msg.createdAt)}
          {isAdmin && msg.readAt && " · Read by client"}
        </span>
      </div>
    </div>
  );
}

export default function AdminProjectMessagesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetch_ = useCallback(async () => {
    const res = await fetch(`/api/admin/projects/${projectId}/messages`);
    const data = await res.json();
    setProject(data.project);
    setMessages(data.messages);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetch_();
    pollRef.current = setInterval(fetch_, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetch_]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    if (!input.trim() || sending) return;
    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      content: input.trim(),
      isFromClient: false,
      createdAt: new Date().toISOString(),
      readAt: null,
      senderName: "GRUTH Team",
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    try {
      await fetch(`/api/admin/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimistic.content }),
      });
      await fetch_();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="pb-12 max-w-3xl">
      <div className="mb-6">
        <div className="text-xs text-charcoal-400 mb-1">
          <a href="/admin" className="hover:text-orange-600">
            Admin
          </a>
          {" / "}
          <a href="/admin/projects" className="hover:text-orange-600">
            Projects
          </a>
          {" / "}
          <a
            href={`/admin/projects/${projectId}`}
            className="hover:text-orange-600"
          >
            {project?.name}
          </a>
          {" / "}Messages
        </div>
        <h1 className="font-display text-xl font-bold text-charcoal-950">
          {project?.name}
        </h1>
        <p className="text-charcoal-500 text-sm mt-0.5">
          {project?.clientName} · {project?.clientEmail}
        </p>
      </div>

      <div
        className="card overflow-hidden flex flex-col"
        style={{ height: "70vh" }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-16 text-charcoal-400 text-sm">
              No messages yet. Send the first message to the client.
            </div>
          )}
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-charcoal-100 flex gap-3 items-end bg-charcoal-50/50">
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
            placeholder="Send message to client…"
            className="flex-1 resize-none bg-white border border-charcoal-200 rounded-xl px-4 py-2.5 text-sm placeholder-charcoal-300 outline-none focus:ring-2 focus:ring-violet-400/40 max-h-32"
            style={{ minHeight: "42px" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-10 h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors"
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
    </div>
  );
}
