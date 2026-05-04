import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Search, Globe } from 'lucide-react';
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

// ── Status lookup (unchanged) ────────────────────────────────────────────────
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
  return apps.find((a) => {
    return (
      normalize(a.firstName) === normalize(q.firstName) &&
      normalize(a.lastName) === normalize(q.lastName) &&
      normalize(a.dob) === normalize(q.dob)
    );
  });
}

// ── Vulavula: detect language ────────────────────────────────────────────────
async function detectLanguage(text: string): Promise<SupportedLang> {
  try {
    const vulavulaKey = (process.env.VULAVULA_API_KEY as string) || "";
    

    const res = await fetch('https://vulavula-services.lelapa.ai/api/v1/classify/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CLIENT-TOKEN': vulavulaKey,
      },
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
    const vulavulaKey = (process.env.VULAVULA_API_KEY as string) || "";
    

    const res = await fetch('https://vulavula-services.lelapa.ai/api/v1/translate/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CLIENT-TOKEN': vulavulaKey,
      },
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
  const apiKey = (process.env.GEMINI_API_KEY as string) || "";
  if (!apiKey) { console.error('GEMINI_API_KEY is missing'); return "I'm sorry, I'm not configured correctly. Please contact the school directly."; }

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
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

    if (!res.ok) throw new Error('Gemini error');
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm not sure about that. Please contact the school directly at +27 76 707 3212.";
  } catch {
    return "I'm having trouble connecting right now. Please contact the school at +27 76 707 3212 or office@mounthargreavesss.co.za.";
  }
}

// ── Main ChatbotWidget ───────────────────────────────────────────────────────
export function ChatbotWidget(props: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(props.defaultOpen));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLang>('eng');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'bot',
      createdAt: Date.now(),
      text: 'Hi! I am the Mt Hargreaves Help Desk. I can answer questions about admissions, boarding, documents, and more. I also understand isiXhosa, isiZulu and Sesotho!',
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

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

  async function send() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { id: uid(), role: 'user', text, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Check if it's a status query first (no AI needed)
      const statusQ = parseStatusQuery(text);
      if (statusQ) {
        const app = findApplication(apps, statusQ);
        const replyText = app
          ? `I found the application for ${app.firstName} ${app.lastName} (Student number: ${app.studentNumber}). Status: ${app.status}.${app.submittedDate ? ` Submitted: ${formatDate(app.submittedDate)}.` : ''}`
          : 'I could not find a matching application on this device. Please double-check the student number or the learner name and date of birth.';
        setMessages((prev) => [...prev, { id: uid(), role: 'bot', text: replyText, createdAt: Date.now() }]);
        setIsTyping(false);
        return;
      }

      // 2. Detect language via Vulavula
      const detectedLang = await detectLanguage(text);
      setCurrentLang(detectedLang);

      // 3. Translate to English if needed
      const englishText = detectedLang !== 'eng'
        ? await translateText(text, detectedLang, 'eng')
        : text;

      // 4. Ask Gemini in English
      const englishReply = await askGemini(englishText);

      // 5. Translate reply back to user's language if needed
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

  return (
    <div className="fixed z-50 right-4 bottom-4">
      {open ? (
        <div
          className="w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          role="dialog"
          aria-label="School help desk chatbot"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-school-green text-white">
            <div>
              <div className="font-bold text-sm">Mt Hargreaves Help Desk</div>
              {currentLang !== 'eng' && (
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <Globe size={10} /> Responding in {LANG_LABELS[currentLang]}
                </div>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10"
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          {/* Language selector */}
          <div className="flex gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            {(Object.entries(LANG_LABELS) as [SupportedLang, string][]).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setCurrentLang(code)}
                className={`text-xs px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                  currentLang === code
                    ? 'bg-school-green text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-school-green'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto px-3 py-3 space-y-3 bg-gray-50">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl px-3 py-2 bg-school-green text-white text-sm shadow'
                    : 'max-w-[85%] rounded-2xl px-3 py-2 bg-white text-gray-800 text-sm border border-gray-200 shadow-sm'
                }>
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
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/20"
                placeholder="Ask anything about Mt Hargreaves..."
                aria-label="Chat input"
                disabled={isTyping}
              />
              <button
                onClick={send}
                disabled={isTyping}
                className="btn-primary px-3 py-2 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-2">
              <Search size={11} />
              Powered by Gemini AI + Vulavula · Supports isiXhosa, isiZulu & Sesotho
            </div>
          </div>
        </div>
      ) : null}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn-primary rounded-full w-14 h-14 shadow-xl inline-flex items-center justify-center"
          aria-label="Open chatbot"
        >
          <MessageCircle />
        </button>
      ) : null}
    </div>
  );
}
