'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  X,
  FileText,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StockQuote } from '@/lib/types';
import { sound } from '@/lib/sound';

interface CopilotDrawerProps {
  quote: StockQuote;
  onSelectTicker?: (ticker: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Array<{ source: string; quote: string; type: string }>;
  engineUsed?: string;
  timestamp: string;
}

function FormattedMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  function flushList() {
    if (!currentList) return;
    if (currentList.type === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-1.5 space-y-1 pl-1">
          {currentList.items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-neutral-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span>{renderInline(it)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-1.5 space-y-1 pl-1">
          {currentList.items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-neutral-200">
              <span className="font-mono text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">
                {i + 1}.
              </span>
              <span>{renderInline(it)}</span>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  }

  function renderInline(str: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`${match.index}-b`} className="font-semibold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={`${match.index}-c`} className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-emerald-300">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={`${match.index}-i`} className="italic text-neutral-300">
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = match.index + token.length;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }
    return parts;
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();

    // Check horizontal rule (*** or --- or ___ or ***)
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${idx}`} className="my-2 border-neutral-800" />);
      continue;
    }

    // Check headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${idx}`} className="text-xs sm:text-sm font-bold text-white mt-2 mb-0.5 flex items-center gap-1.5">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${idx}`} className="text-sm font-bold text-white mt-2.5 mb-1">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${idx}`} className="text-base font-bold text-white mt-3 mb-1">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Check unordered list item (* or -)
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Check ordered list item (1. 2.)
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // Blank line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="text-xs text-neutral-300 leading-relaxed my-0.5">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

// Module-level in-memory cache to persist conversations across tab switches
const COPILOT_MESSAGES_CACHE: Record<string, Message[]> = {};

function createWelcomeMessage(quote: StockQuote): Message {
  return {
    id: 'welcome',
    sender: 'assistant',
    text: `### 🤖 FINN Primary Intelligence Copilot\n\nI am grounded **strictly in primary company filings** (Annual Reports, Concall Transcripts, and Audited Results). No broker notes or secondary gossip.\n\nActive Security: **${quote.name} (${quote.symbol})**\n\nHow can I assist your diligence? Select a command below or ask directly:`,
    citations: [
      {
        source: `${quote.symbol} Latest Regulatory Disclosures`,
        quote: 'Primary exchange filings, concalls & audited P&L statements',
        type: 'NSE Primary Filing',
      },
    ],
    engineUsed: 'finn_primary_engine',
    timestamp: 'Just now',
  };
}

export function CopilotDrawer({ quote, onSelectTicker }: CopilotDrawerProps) {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('finn_copilot_api_key');
      if (stored) {
        setApiKey(stored);
        setTempApiKey(stored);
      }
    }
  }, []);

  // Initialize messages from in-memory cache or sessionStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    if (COPILOT_MESSAGES_CACHE[quote.symbol] && COPILOT_MESSAGES_CACHE[quote.symbol].length > 0) {
      return COPILOT_MESSAGES_CACHE[quote.symbol];
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`finn_copilot_chat_${quote.symbol}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            COPILOT_MESSAGES_CACHE[quote.symbol] = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    const initialWelcome = [createWelcomeMessage(quote)];
    COPILOT_MESSAGES_CACHE[quote.symbol] = initialWelcome;
    return initialWelcome;
  });

  // Keep cache and sessionStorage in sync with any message changes
  useEffect(() => {
    if (messages.length > 0) {
      COPILOT_MESSAGES_CACHE[quote.symbol] = messages;
      try {
        sessionStorage.setItem(`finn_copilot_chat_${quote.symbol}`, JSON.stringify(messages));
      } catch {}
    }
  }, [messages, quote.symbol]);

  // Synchronize when the active ticker changes
  useEffect(() => {
    if (COPILOT_MESSAGES_CACHE[quote.symbol] && COPILOT_MESSAGES_CACHE[quote.symbol].length > 0) {
      setMessages(COPILOT_MESSAGES_CACHE[quote.symbol]);
    } else {
      if (typeof window !== 'undefined') {
        try {
          const stored = sessionStorage.getItem(`finn_copilot_chat_${quote.symbol}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              COPILOT_MESSAGES_CACHE[quote.symbol] = parsed;
              setMessages(parsed);
              return;
            }
          }
        } catch {}
      }
      const initialWelcome = [createWelcomeMessage(quote)];
      COPILOT_MESSAGES_CACHE[quote.symbol] = initialWelcome;
      setMessages(initialWelcome);
    }
  }, [quote.symbol]);

  function handleClearChat() {
    sound.playClick();
    const freshWelcome = [createWelcomeMessage(quote)];
    COPILOT_MESSAGES_CACHE[quote.symbol] = freshWelcome;
    try {
      sessionStorage.removeItem(`finn_copilot_chat_${quote.symbol}`);
    } catch {}
    setMessages(freshWelcome);
  }

  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice Recognition (Speech to Text)
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Audio Playback (Text to Speech)
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Citation Inspector Modal
  const [inspectedCitation, setInspectedCitation] = useState<{
    source: string;
    quote: string;
    type: string;
  } | null>(null);

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

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
          sound.playClick();
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  function toggleVoiceRecording() {
    sound.playClick();
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech error:', err);
      }
    }
  }

  function toggleSpeech(msgId: string, text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    sound.playClick();

    // Strip markdown formatting for speech
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/\[.*?\]/g, '')
      .slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  }

  async function handleSend(queryText?: string) {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    sound.playClick();

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
        body: JSON.stringify({ question: textToSend, ticker: quote.ticker, apiKey: apiKey || undefined }),
      });

      const data = await res.json();
      if (data.success) {
        sound.playChime();

        // Trigger confetti for high management reliability audit
        if (data.response.includes('92/100') || data.response.includes('94/100') || data.response.includes('DELIVERED')) {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#34d399', '#6ee7b7'],
          });
          sound.playSuccess();
        }

        const assistantMsg: Message = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.response,
          citations: data.citations,
          engineUsed: data.engineUsed,
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

  function handleCopy(id: string, text: string) {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleExportMemo() {
    sound.playClick();
    const memoContent = [
      `# FINN INSTITUTIONAL INVESTMENT MEMO`,
      `**Target Security:** ${quote.name} (${quote.symbol})`,
      `**Price:** ₹${quote.price} | **Market Cap:** ₹${quote.marketCapCr} Cr | **Sector:** ${quote.sector}`,
      `**Date Generated:** ${new Date().toLocaleString()}`,
      `\n---\n`,
      ...messages.map((m) => `### [${m.sender.toUpperCase()}]\n${m.text}\n`),
    ].join('\n');

    const blob = new Blob([memoContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FINN_MEMO_${quote.symbol}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Top Copilot Header Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 border border-emerald-800/30 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-white text-sm font-bold tracking-tight">FINN Copilot 2.0</h2>
            <p className="text-[11px] text-neutral-400">
              Grounded in <span className="text-emerald-400 font-medium">Primary Annual Reports & Concalls</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* LLM Engine Config Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsKeyModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono transition-colors"
            title="Configure Generative AI (Gemini / OpenAI)"
          >
            {apiKey ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LLM Active
              </span>
            ) : (
              <span className="text-neutral-400 hover:text-neutral-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Primary Engine
              </span>
            )}
          </button>

          {/* Export Memo */}
          <button
            onClick={handleExportMemo}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-mono transition-colors"
            title="Download Investment Memo"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Memo</span>
          </button>

          {/* Reset / Clear Conversation */}
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-rose-400 text-xs font-mono transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 font-semibold">
            {quote.symbol}
          </span>
        </div>
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
            className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
              msg.sender === 'user'
                ? 'bg-neutral-850 border-neutral-750 text-white ml-8 sm:ml-12'
                : 'bg-neutral-925/90 border-neutral-850 text-neutral-200 mr-4 sm:mr-8 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                {msg.sender === 'user' ? (
                  <>
                    <User className="w-3 h-3 text-neutral-400" />
                    <span>You</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">FINN Agent</span>
                    {msg.engineUsed && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
                        {msg.engineUsed === 'gemini'
                          ? '✨ Gemini 1.5'
                          : msg.engineUsed === 'openai'
                          ? '✨ GPT-4o'
                          : 'Primary Grounded Engine'}
                      </span>
                    )}
                  </>
                )}
                <span className="text-neutral-600">•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Action buttons on assistant messages */}
              {msg.sender === 'assistant' && (
                <div className="flex items-center gap-1.5">
                  {/* Voice playback */}
                  <button
                    onClick={() => toggleSpeech(msg.id, msg.text)}
                    className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                    title={speakingMsgId === msg.id ? 'Stop Speaking' : 'Read Out Loud'}
                  >
                    {speakingMsgId === msg.id ? (
                      <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Copy message */}
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Markdown-style formatted body */}
            <div className="space-y-1">
              <FormattedMarkdown text={msg.text} />
            </div>

            {/* Citations Pill Bar */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-neutral-850 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-emerald-400/90 font-semibold flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  Primary Citations (Click to Inspect)
                </span>
                <div className="space-y-1">
                  {msg.citations.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playClick();
                        setInspectedCitation(c);
                      }}
                      className="w-full p-2 rounded-lg bg-neutral-950/90 hover:bg-neutral-900 border border-neutral-850 hover:border-emerald-500/30 text-[11px] text-neutral-300 font-mono text-left transition-all flex items-start justify-between gap-2"
                    >
                      <span className="line-clamp-1">
                        <strong className="text-emerald-400">[{c.type}]</strong> {c.source}: &ldquo;{c.quote}&rdquo;
                      </span>
                      <ExternalLink className="w-3 h-3 text-neutral-500 shrink-0 mt-0.5" />
                    </button>
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

      {/* Input Bar with Voice & Send */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 sticky bottom-16 bg-neutral-950/90 backdrop-blur-md pb-2"
      >
        <button
          type="button"
          onClick={toggleVoiceRecording}
          className={`p-2.5 rounded-xl border transition-all ${
            isRecording
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title={isRecording ? 'Listening... Tap to stop' : 'Voice Input (Speak your query)'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isRecording
              ? 'Listening... speak now'
              : `Ask FINN about ${quote.symbol} (or try /audit, /cash)...`
          }
          disabled={isLoading}
          className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors font-sans"
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

      {/* Primary Citation Inspector Modal */}
      {inspectedCitation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-white text-sm font-bold">Primary Document Verification</h3>
              </div>
              <button
                onClick={() => setInspectedCitation(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Source Document:</span>
                <span className="text-sm font-bold text-white font-mono">{inspectedCitation.source}</span>
                <span className="inline-block ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {inspectedCitation.type}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Verbatim Primary Excerpt:</span>
                <p className="text-xs text-neutral-200 leading-relaxed italic bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20 text-emerald-100 font-mono">
                  &ldquo;{inspectedCitation.quote}&rdquo;
                </p>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                FINN strictly enforces grounding in verified disclosures filed with the National Stock Exchange of India and BSE. Secondary broker commentary and speculative news articles are barred.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectedCitation(null)}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 hover:text-white text-xs font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional Generative AI API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-750 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-white text-sm font-bold">Generative LLM Engine Key</h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              FINN runs out-of-the-box on its <strong className="text-emerald-400">Zero-Cost Primary Reasoning Engine</strong> ($0.00 spend).
              Optionally, enter a free Google Gemini API key or OpenAI key below for full conversational synthesis with primary grounding.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 uppercase">API Key (Gemini or OpenAI):</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIza... or sk-..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-750 text-white text-xs font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-[10px] text-neutral-500 block">
                Saved locally in your browser. Never transmitted to third-party tracking servers.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setApiKey('');
                  setTempApiKey('');
                  localStorage.removeItem('finn_copilot_api_key');
                  setIsKeyModalOpen(false);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono transition-colors"
              >
                Clear Key (Use Zero-Cost)
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sound.playSuccess();
                    setApiKey(tempApiKey.trim());
                    if (tempApiKey.trim()) {
                      localStorage.setItem('finn_copilot_api_key', tempApiKey.trim());
                    } else {
                      localStorage.removeItem('finn_copilot_api_key');
                    }
                    setIsKeyModalOpen(false);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs font-mono transition-colors"
                >
                  Save Engine Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
