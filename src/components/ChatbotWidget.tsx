import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MessageCircle, X, Send, Globe, ChevronDown } from 'lucide-react';
import { getApplications, type Application } from '../admin/utils/storage';

// ── Types ──────────────────────────────────────────────────────────────────
type ChatRole = 'user' | 'bot';
type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  detectedLang?: string;
};

type SupportedLang = 'eng' | 'zul' | 'xho' | 'sot';

const LANG_LABELS: Record<SupportedLang, string> = {
  eng: 'English',
  zul: 'isiZulu',
  xho: 'isiXhosa',
  sot: 'Sesotho',
};

const VULAVULA_LANG_MAP: Record<SupportedLang, string> = {
  eng: 'eng_Latn',
  zul: 'zul_Latn',
  xho: 'xho_Latn',
  sot: 'sot_Latn',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function formatDate(iso: string | undefined) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}

// ── Status lookup ────────────────────────────────────────────────────────────
type StatusQuery =
  | { kind: 'studentNumber'; studentNumber: string }
  | { kind: 'nameAndDob'; firstName: string; lastName: string; dob: string };

function parseStatusQuery(input: string): StatusQuery | null {
  const text = normalize(input);
  const snMatch = text.match(/(student number|student no|student|status)\s*[:#]?\s*([a-z0-9-]{6,})/i);
  if (snMatch?.[2]) return { kind: 'studentNumber', studentNumber: snMatch[2].toUpperCase() };
  const dobMatch = text.match(/\b(19|20)\d{2}-\d{2}-\d{2}\b/);
  if (dobMatch) {
    const dob = dobMatch[0];
    const namePart = text.replace(dob, ' ').replace(/\b(dob|date of birth)\b/g, ' ');
    const tokens = namePart.split(/\s+/).filter(Boolean);
    const statusIdx = tokens.findIndex((t) => t === 'status');
    const startIdx = statusIdx >= 0 ? statusIdx + 1 : 0;
    const firstName = tokens[startIdx];
    const lastName = tokens[startIdx + 1];
    if (firstName && lastName) return { kind: 'nameAndDob', firstName, lastName, dob };
  }
  return null;
}

function findApplication(apps: Application[], q: StatusQuery) {
  if (q.kind === 'studentNumber') {
    return apps.find((a) => normalize(a.studentNumber) === normalize(q.studentNumber));
  }
  return apps.find((a) =>
    normalize(a.firstName) === normalize(q.firstName) &&
    normalize(a.lastName) === normalize(q.lastName) &&
    normalize(a.dob) === normalize(q.dob)
  );
}

// ── Vulavula: detect language ────────────────────────────────────────────────
async function detectLanguage(text: string): Promise<SupportedLang> {
  try {
    const vulavulaKey = (process.env.VULAVULA_API_KEY as string) || '';
    if (!vulavulaKey) return 'eng';

    const res = await fetch('https://vulavula-services.lelapa.ai/api/v1/classify/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CLIENT-TOKEN': vulavulaKey },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return 'eng';
    const data = await res.json();
    const detected = data?.predicted_label?.toLowerCase() ?? 'eng';
    if (detected.includes('zul')) return 'zul';
    if (detected.includes('xho')) return 'xho';
    if (detected.includes('sot')) return 'sot';
    return 'eng';
  } catch {
    return 'eng';
  }
}

// ── Vulavula: translate text ────────────────────────────────────────────────
async function translateText(
  text: string,
  sourceLang: SupportedLang,
  targetLang: SupportedLang
): Promise<string> {
  if (sourceLang === targetLang) return text;
  try {
    const vulavulaKey = (process.env.VULAVULA_API_KEY as string) || '';
    if (!vulavulaKey) return text;

    const res = await fetch('https://vulavula-services.lelapa.ai/api/v1/translate/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CLIENT-TOKEN': vulavulaKey },
      body: JSON.stringify({
        input_text: text,
        source_lang: VULAVULA_LANG_MAP[sourceLang],
        target_lang: VULAVULA_LANG_MAP[targetLang],
      }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data?.translation ?? text;
  } catch {
    return text;
  }
}

// ── Gemini: get AI answer ────────────────────────────────────────────────────
async function askGemini(userMessage: string): Promise<string> {
  const apiKey = (process.env.GEMINI_API_KEY as string) || '';
  if (!apiKey) {
    return "I'm sorry, I'm not configured correctly. Please contact the school directly.";
  }

  const systemPrompt = `You are a helpful school assistant for Mt Hargreaves Senior Secondary School in Matatiele, Eastern Cape, South Africa.

You help parents, learners and guardians with:
- Admissions and application process
- Required documents for applications
- Boarding and hostel applications
- School fees and payment information
- School hours and term dates
- Contact information
- General school information

School details:
- Name: Mt Hargreaves Senior Secondary School
- Location: Sigoga Location, Mgubo A/A, Matatiele, 4730 Eastern Cape
- Phone: +27 76 707 3212
- Email: office@mounthargreavesss.co.za
- Motto: "We Can"
- Principal: Ms B Ngozwana
- Deputy Principal: Mr M Leanya
- School hours: Monday-Thursday 07:30-15:30, Friday 07:30-13:30

Keep answers friendly, helpful and concise. If you don't know something specific, direct them to contact the school directly.`;

  try {
    // Use the stable Gemini 1.5 Flash endpoint
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }], role: 'user' }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API error:', res.status, errText);
      throw new Error(`Gemini error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } catch (err) {
    console.error('Gemini request failed:', err);
    return "I'm having trouble connecting right now. Please contact the school at +27 76 707 3212 or office@mounthargreavesss.co.za.";
  }
}

// ── Suggested quick questions ────────────────────────────────────────────────
const QUICK_QUESTIONS = [
  'How do I apply for admission?',
  'What documents do I need?',
  'Is boarding available?',
  'What are the school hours?',
];

// ── Main ChatbotWidget ───────────────────────────────────────────────────────
export function ChatbotWidget(props: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(props.defaultOpen));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLang>('eng');
  const [showLangs, setShowLangs] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'bot',
      createdAt: Date.now(),
      text: 'Hi! I am the Mt Hargreaves Help Desk. I can answer questions about admissions, boarding, documents, and more. I also understand isiXhosa, isiZulu and Sesotho!',
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Escape key to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const apps = useMemo(() => {
    try { return getApplications(); } catch { return []; }
  }, [open]);

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { id: uid(), role: 'user', text, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Check application status queries first
      const statusQ = parseStatusQuery(text);
      if (statusQ) {
        const app = findApplication(apps, statusQ);
        const replyText = app
          ? `I found the application for ${app.firstName} ${app.lastName} (Student number: ${app.studentNumber}). Status: ${app.status}.${app.submittedDate ? ` Submitted: ${formatDate(app.submittedDate)}.` : ''}`
          : 'I could not find a matching application. Please double-check the student number or the learner name and date of birth.';
        setMessages((prev) => [...prev, { id: uid(), role: 'bot', text: replyText, createdAt: Date.now() }]);
        setIsTyping(false);
        return;
      }

      // 2. Detect language
      const detectedLang = await detectLanguage(text);
      setCurrentLang(detectedLang);

      // 3. Translate to English if needed
      const englishText = detectedLang !== 'eng'
        ? await translateText(text, detectedLang, 'eng')
        : text;

      // 4. Ask Gemini in English
      const englishReply = await askGemini(englishText);

      // 5. Translate reply back if needed
      const finalReply = detectedLang !== 'eng'
        ? await translateText(englishReply, 'eng', detectedLang)
        : englishReply;

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'bot',
          text: finalReply,
          createdAt: Date.now(),
          detectedLang: detectedLang !== 'eng' ? LANG_LABELS[detectedLang] : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'bot',
          text: 'Something went wrong. Please contact the school at +27 76 707 3212.',
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  const showQuickQuestions = messages.length <= 1;

  return (
    <>
      {/* ── Chat window ── */}
      {open && (
        <div
          className="fixed z-50 bottom-20 right-4 sm:bottom-6 sm:right-6
            w-[calc(100vw-2rem)] max-w-[380px]
            h-[min(70vh,520px)]
            bg-white rounded-2xl shadow-2xl border border-gray-200
            flex flex-col overflow-hidden
            animate-in"
          style={{
            animation: 'slideUp 0.2s ease-out',
          }}
          role="dialog"
          aria-label="School help desk chatbot"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-school-green text-white shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle size={16} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm leading-tight">Mt Hargreaves Help Desk</div>
                <div className="text-[11px] text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                  Online · Powered by Gemini AI
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Language selector button */}
              <div className="relative">
                <button
                  onClick={() => setShowLangs(!showLangs)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium"
                  title="Change language"
                >
                  <Globe size={12} />
                  <span>{LANG_LABELS[currentLang].split(' ')[0]}</span>
                  <ChevronDown size={10} className={`transition-transform ${showLangs ? 'rotate-180' : ''}`} />
                </button>

                {showLangs && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10 min-w-[120px]">
                    {(Object.entries(LANG_LABELS) as [SupportedLang, string][]).map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => { setCurrentLang(code); setShowLangs(false); }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                          currentLang === code
                            ? 'bg-school-green text-white font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chatbot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 scroll-smooth">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-school-green flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-0.5">
                    MH
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-school-green text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                  {m.detectedLang && (
                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Globe size={9} /> Detected: {m.detectedLang}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-school-green flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-0.5">
                  MH
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Quick question chips */}
            {showQuickQuestions && !isTyping && (
              <div className="pt-1">
                <p className="text-[11px] text-gray-400 font-medium mb-2 text-center">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-school-green/30 text-school-green hover:bg-school-green hover:text-white transition-colors font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/20 focus:border-school-green transition-all bg-gray-50 placeholder:text-gray-400"
                placeholder="Ask about admissions, boarding…"
                aria-label="Chat input"
                disabled={isTyping}
              />
              <button
                onClick={() => send()}
                disabled={isTyping || !input.trim()}
                className="bg-school-green hover:bg-school-green/90 text-white px-3 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Supports English · isiXhosa · isiZulu · Sesotho
            </p>
          </div>
        </div>
      )}

      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6
          w-14 h-14 rounded-full shadow-xl
          bg-school-green hover:bg-school-green/90
          text-white flex items-center justify-center
          transition-all hover:scale-105 active:scale-95"
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        <div className="relative">
          {open ? <X size={22} /> : <MessageCircle size={22} />}
          {!open && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>
      </button>

      {/* ── Animation keyframes ── */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </>
  );
}
