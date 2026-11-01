'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  FileCheck,
  ExternalLink,
  Bot,
  User,
  Scale,
  DollarSign,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { StockQuote } from '@/lib/types';

interface CopilotDrawerProps {
  quote: StockQuote;
  onSelectTicker?: (ticker: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Array<{ source: string; quote: string; type: string }>;
  timestamp: string;
}

export function CopilotDrawer({ quote, onSelectTicker }: CopilotDrawerProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `### 🤖 FINN Primary Intelligence Agent\n\nI am grounded **strictly in primary company filings** (Annual Reports, Concall Transcripts, and Exchange Results). No broker opinions or secondary commentary.\n\nActive Security: **${quote.name} (${quote.symbol})**\n\nHow can I assist your diligence? Select a high-conviction query below or ask directly:`,
      citations: [
        {
          source: `${quote.symbol} Latest Regulatory Disclosures`,
          quote: 'Primary investor disclosures and transcripts',
          type: 'NSE Primary Filing',
        },
      ],
      timestamp: 'Just now',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    {
      label: 'Audit Guidance vs Reality',
      icon: Scale,
      prompt: `Audit the last 4 quarters of management guidance vs actual delivered numbers for ${quote.symbol}.`,
    },
    {
      label: 'Check Cash Quality & Red Flags',
      icon: ShieldAlert,
      prompt: `Is there any cash conversion red flag in ${quote.symbol}? Does operating profit convert to real cash?`,
    },
    {
      label: 'Summarize Q2 Margins & ROCE',
      icon: DollarSign,
      prompt: `What are the headline margins, ROCE, and 3-year trajectory for ${quote.symbol}?`,
    },
    {
      label: 'Bull vs. Bear Thesis',
      icon: HelpCircle,
      prompt: `Give me a tight, high-conviction Bull vs Bear case for ${quote.symbol} grounded in primary facts.`,
    },
  ];

  async function handleSend(queryText?: string) {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend, ticker: quote.ticker }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: Message = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.response,
          citations: data.citations,
          timestamp: 'Just now',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get answer');
      }
    } catch (err) {
      console.error('Copilot query error:', err);
      const errorMsg: Message = {
        id: `asst-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Apologies, I encountered an issue analyzing the primary filing. Please try again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Top Copilot Header Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 border border-emerald-800/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-white text-sm font-bold tracking-tight">FINN Copilot</h2>
            <p className="text-[11px] text-neutral-400">
              Grounded exclusively in <span className="text-emerald-400 font-medium">Primary Sources</span>
            </p>
          </div>
        </div>

        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 font-semibold">
          {quote.symbol}
        </span>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono text-neutral-400 uppercase px-1">
          Recommended High-Conviction Prompts:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPrompts.map((qp, i) => {
            const Icon = qp.icon;
            return (
              <button
                key={i}
                onClick={() => handleSend(qp.prompt)}
                disabled={isLoading}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-750 text-left transition-all disabled:opacity-50"
              >
                <div className="p-1 rounded-md bg-neutral-950 text-emerald-400 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-neutral-300 font-medium line-clamp-1">
                  {qp.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-3 pt-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-neutral-850 border-neutral-750 text-white ml-8 sm:ml-12'
                : 'bg-neutral-925/90 border-neutral-850 text-neutral-200 mr-4 sm:mr-8'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono mb-1.5">
              {msg.sender === 'user' ? (
                <>
                  <User className="w-3 h-3 text-neutral-400" />
                  <span>You</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">FINN Agent</span>
                </>
              )}
              <span className="text-neutral-600">•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Markdown-style formatted body */}
            <div className="whitespace-pre-wrap space-y-2">{msg.text}</div>

            {/* Citations Pill Bar */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-neutral-850 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-emerald-400/90 font-semibold flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  Primary Citations
                </span>
                <div className="space-y-1">
                  {msg.citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-neutral-950/80 border border-neutral-850 text-[11px] text-neutral-400 font-mono flex items-start justify-between gap-2"
                    >
                      <span className="line-clamp-1">
                        [{c.type}] {c.source}: &ldquo;{c.quote}&rdquo;
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-3.5 rounded-xl bg-neutral-925/90 border border-neutral-850 text-xs text-neutral-400 font-mono flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <span>Grounding query in annual reports and transcripts...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 sticky bottom-16 bg-neutral-950/90 backdrop-blur-md pb-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask FINN about ${quote.symbol} (e.g., Working capital cycle)...`}
          disabled={isLoading}
          className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 disabled:opacity-40 transition-colors font-bold"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
