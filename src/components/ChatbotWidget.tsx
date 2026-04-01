import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Search } from 'lucide-react';
import { getApplications, type Application } from '../admin/utils/storage';

type ChatRole = 'user' | 'bot';

type ChatMessage = {
	id: string;
	role: ChatRole;
	text: string;
	createdAt: number;
};

function uid() {
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(s: string) {
	return s.toLowerCase().trim();
}

function safeIncludes(haystack: string, needle: string) {
	return normalize(haystack).includes(normalize(needle));
}

function formatDate(iso: string | undefined) {
	if (!iso) return '';
	try {
		return new Date(iso).toLocaleDateString();
	} catch {
		return iso;
	}
}

type StatusQuery =
	| { kind: 'studentNumber'; studentNumber: string }
	| { kind: 'nameAndDob'; firstName: string; lastName: string; dob: string };

function parseStatusQuery(input: string): StatusQuery | null {
	const text = normalize(input);

	// Examples:
	// "status 2027-000123"
	// "check status for student number 2027-000123"
	// "application status 2027-000123"
	const snMatch = text.match(/(student number|student no|student|status)\s*[:#]?\s*([a-z0-9-]{6,})/i);
	if (snMatch?.[2]) {
		return { kind: 'studentNumber', studentNumber: snMatch[2].toUpperCase() };
	}

	// Examples:
	// "status John Doe 2012-03-01"
	// "check status for john doe dob 2012-03-01"
	// We keep this intentionally strict to avoid false matches.
	const dobMatch = text.match(/\b(19|20)\d{2}-\d{2}-\d{2}\b/);
	if (dobMatch) {
		const dob = dobMatch[0];
		const namePart = text.replace(dob, ' ').replace(/\b(dob|date of birth)\b/g, ' ');
		const tokens = namePart.split(/\s+/).filter(Boolean);

		// Find two consecutive tokens that look like a name after the keyword "status"
		const statusIdx = tokens.findIndex((t) => t === 'status');
		const startIdx = statusIdx >= 0 ? statusIdx + 1 : 0;

		const firstName = tokens[startIdx];
		const lastName = tokens[startIdx + 1];

		if (firstName && lastName) {
			return { kind: 'nameAndDob', firstName, lastName, dob };
		}
	}

	return null;
}

function findApplication(apps: Application[], q: StatusQuery) {
	if (q.kind === 'studentNumber') {
		// Your Application has studentNumber (see Admissions.tsx)
		return apps.find((a) => normalize(a.studentNumber) === normalize(q.studentNumber));
	}

	return apps.find((a) => {
		const firstOk = normalize(a.firstName) === normalize(q.firstName);
		const lastOk = normalize(a.lastName) === normalize(q.lastName);
		const dobOk = normalize(a.dob) === normalize(q.dob);
		return firstOk && lastOk && dobOk;
	});
}

type FaqItem = {
	q: string;
	a: string;
	keywords: string[];
};

const FAQ: FaqItem[] = [
	{
		q: 'How do I apply?',
		a:
			'Go to the Applications page and complete the General School Application form. Make sure you fill in all required learner and guardian details, then upload all required documents before submitting.',
		keywords: ['apply', 'application', 'admissions', 'submit', 'form'],
	},
	{
		q: 'Which documents are required?',
		a:
			'You will need the learner birth certificate or ID, latest report card, parent or guardian ID copy, and proof of residence. Other documents may be optional depending on your situation.',
		keywords: ['documents', 'required', 'upload', 'report card', 'proof of residence', 'id'],
	},
	{
		q: 'Do I need to apply for boarding separately?',
		a:
			'Yes. General admissions and boarding applications are separate. If the learner needs a hostel bed, submit the boarding form as well.',
		keywords: ['boarding', 'hostel', 'accommodation', 'bed'],
	},
	{
		q: 'What happens after I submit?',
		a:
			'After submitting, your application is recorded and marked as Pending. The school will review it and contact you if anything else is needed.',
		keywords: ['after', 'submit', 'pending', 'review', 'contact'],
	},
	{
		q: 'How can I check my application status?',
		a:
			'Type something like: “status 2027-000123” or “status Firstname Lastname 2012-03-01”. I will look it up in saved submissions on this device.',
		keywords: ['status', 'check', 'track', 'student number', 'reference'],
	},
];

function scoreFaq(input: string, item: FaqItem) {
	const t = normalize(input);
	let score = 0;

	for (const k of item.keywords) {
		if (t.includes(normalize(k))) score += 2;
	}

	// small boost if question text overlaps
	if (t.includes(normalize(item.q))) score += 3;

	return score;
}

function answerFaq(input: string) {
	const ranked = FAQ
		.map((item) => ({ item, score: scoreFaq(input, item) }))
		.sort((a, b) => b.score - a.score);

	if (!ranked[0] || ranked[0].score < 2) {
		return (
			'I can help with application steps, required documents, boarding info, or checking status. ' +
			'Try asking “Which documents are required?” or type “status 2027-000123”.'
		);
	}

	return ranked[0].item.a;
}

export function ChatbotWidget(props: { defaultOpen?: boolean }) {
	const [open, setOpen] = useState(Boolean(props.defaultOpen));
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>(() => {
		const initial: ChatMessage[] = [
			{
				id: uid(),
				role: 'bot',
				createdAt: Date.now(),
				text:
					'Hi. I can answer FAQs about applying, required documents, boarding, and I can check application status if you provide learner details.',
			},
			{
				id: uid(),
				role: 'bot',
				createdAt: Date.now(),
				text: 'To check status, type: “status 2027-000123” or “status Firstname Lastname 2012-03-01”.',
			},
		];

		return initial;
	});

	const panelRef = useRef<HTMLDivElement | null>(null);
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
		try {
			return getApplications();
		} catch {
			return [];
		}
	}, [open]); // refresh when opened

	function botReply(userText: string): string {
		const q = parseStatusQuery(userText);
		if (q) {
			const app = findApplication(apps, q);
			if (!app) {
				return (
					'I could not find a matching application on this device. ' +
					'Please double-check the student number or the learner name and date of birth.'
				);
			}

			const submitted = formatDate(app.submittedDate);
			return (
				`I found the application for ${app.firstName} ${app.lastName} (Student number: ${app.studentNumber}). ` +
				`Status: ${app.status}.` +
				(submitted ? ` Submitted: ${submitted}.` : '')
			);
		}

		// light procedure “intent”
		if (
			safeIncludes(userText, 'apply') ||
			safeIncludes(userText, 'application') ||
			safeIncludes(userText, 'documents') ||
			safeIncludes(userText, 'boarding') ||
			safeIncludes(userText, 'status')
		) {
			return answerFaq(userText);
		}

		return answerFaq(userText);
	}

	function send() {
		const text = input.trim();
		if (!text) return;

		const userMsg: ChatMessage = { id: uid(), role: 'user', text, createdAt: Date.now() };
		setMessages((prev) => [...prev, userMsg]);
		setInput('');

		// Simulate a short “thinking” delay
		window.setTimeout(() => {
			const replyText = botReply(text);
			const botMsg: ChatMessage = { id: uid(), role: 'bot', text: replyText, createdAt: Date.now() };
			setMessages((prev) => [...prev, botMsg]);
		}, 250);
	}

	return (
		<div className="fixed z-50 right-4 bottom-4">
			{open ? (
				<div
					ref={panelRef}
					className="w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
					role="dialog"
					aria-label="FAQ chatbot"
				>
					<div className="flex items-center justify-between px-4 py-3 bg-school-green text-white">
						<div className="font-bold">Help desk</div>
						<button
							onClick={() => setOpen(false)}
							className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
							aria-label="Close chatbot"
						>
							<X size={18} />
						</button>
					</div>

					<div className="flex-1 overflow-auto px-3 py-3 space-y-3 bg-gray-50">
						{messages.map((m) => (
							<div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
								<div
									className={
										m.role === 'user'
											? 'max-w-[85%] rounded-2xl px-3 py-2 bg-school-green text-white text-sm shadow'
											: 'max-w-[85%] rounded-2xl px-3 py-2 bg-white text-gray-800 text-sm border border-gray-200 shadow-sm'
									}
								>
									{m.text}
								</div>
							</div>
						))}
						<div ref={endRef} />
					</div>

					<div className="p-3 bg-white border-t border-gray-200">
						<div className="flex gap-2">
							<input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') send();
								}}
								className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/20"
								placeholder='Ask a question, or type: "status 2027-000123"'
								aria-label="Chat input"
							/>
							<button
								onClick={send}
								className="btn-primary px-3 py-2 inline-flex items-center justify-center gap-2"
								aria-label="Send message"
							>
								<Send size={16} />
							</button>
						</div>

						<div className="mt-2 text-[11px] text-gray-500 flex items-center gap-2">
							<Search size={12} />
							Status lookup checks saved submissions on this device.
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
