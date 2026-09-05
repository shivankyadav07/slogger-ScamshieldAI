"use client";

import { useState } from "react";

/* ---------------------------------------------------------
   Gauge helpers — draws a speedometer-style arc in pure SVG
--------------------------------------------------------- */
const GAUGE_START = -130;
const GAUGE_END = 130;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

/* ---------------------------------------------------------
   Lightweight rule-based scorer so the demo works with no
   backend. Swap this out for a real API call when ready.
--------------------------------------------------------- */
const RISK_RULES: { pattern: RegExp; weight: number; label: string }[] = [
  { pattern: /urgent|immediately|act now|expire|frozen|suspend/i, weight: 22, label: "urgency" },
  { pattern: /verify|confirm|update your (details|account|banking)/i, weight: 18, label: "credential-harvest" },
  { pattern: /https?:\/\/[^\s]+/i, weight: 15, label: "embedded-link" },
  { pattern: /bank|debit|credit card|wire[- ]transfer|routing number/i, weight: 20, label: "financial-lure" },
  { pattern: /login|log in|sign in/i, weight: 10, label: "credential-harvest" },
  { pattern: /password|pin|ssn|social security/i, weight: 20, label: "sensitive-data-request" },
  { pattern: /prize|winner|lottery|gift card/i, weight: 18, label: "prize-lure" },
  { pattern: /permanent(ly)? (suspend|lock|close)/i, weight: 14, label: "threat-language" },
];

function analyzeMessage(text: string) {
  const found = new Map<string, number>();
  let score = 0;

  for (const rule of RISK_RULES) {
    if (rule.pattern.test(text)) {
      score += rule.weight;
      found.set(rule.label, (found.get(rule.label) ?? 0) + rule.weight);
    }
  }

  // Domain look-alike heuristic: a link whose host contains a brand-ish
  // word plus "secure"/"login"/"verify" reads as a spoofed portal.
  const urlMatch = text.match(/https?:\/\/([^\s/]+)/i);
  let spoofedDomain = false;
  if (urlMatch) {
    const host = urlMatch[1].toLowerCase();
    if (/(secure|login|verify|update|alert)/.test(host) && /-/.test(host)) {
      spoofedDomain = true;
      score += 12;
      found.set("spoofed-domain", 12);
    }
  }

  score = Math.max(4, Math.min(99, score));

  const tags = Array.from(found.keys());
  const level = score >= 70 ? "HIGH RISK" : score >= 35 ? "MODERATE RISK" : "LOW RISK";

  return { score, tags, level, spoofedDomain, hasLink: Boolean(urlMatch) };
}

type Assessment = ReturnType<typeof analyzeMessage> | null;

const SAMPLE_MESSAGE =
  "ALERT: Your debit card has been frozen due to suspicious activity. Please verify your banking details immediately by logging into: http://bank-login-secure.org/update-alert/ or face permanent suspension. Urgent action required.";

export default function ScamDetector() {
  const [message, setMessage] = useState(SAMPLE_MESSAGE);
  const [assessment, setAssessment] = useState<Assessment>(() => analyzeMessage(SAMPLE_MESSAGE));
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!message.trim()) return;
    setIsAnalyzing(true);
    // Small artificial delay so the "scanning" state reads as real analysis.
    setTimeout(() => {
      setAssessment(analyzeMessage(message));
      setIsAnalyzing(false);
    }, 700);
  };

  const score = assessment?.score ?? 0;
  const sweep = GAUGE_START + (score / 100) * (GAUGE_END - GAUGE_START);
  const trackPath = describeArc(110, 110, 88, GAUGE_START, GAUGE_END);
  const valuePath = describeArc(110, 110, 88, GAUGE_START, sweep);

  const riskColor =
    assessment?.level === "HIGH RISK"
      ? "#ff3468"
      : assessment?.level === "MODERATE RISK"
      ? "#f5a623"
      : "#00e08f";

  return (
    <div className="min-h-screen bg-white text-[#0c0d12]">
      {/* ---------------- Nav ---------------- */}
      <header className="border-b border-[#eceef2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0c0d12]">
              <span className="text-lg leading-none">⊗</span>
            </span>
            <span className="text-lg font-bold tracking-tight">ScamShield AI</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#3a3c46] md:flex">
            <a href="#detector" className="text-[#0c0d12]">Detector</a>
            <a href="#how-it-works" className="hover:text-[#0c0d12]">How It Works</a>
            <a href="#threat-db" className="hover:text-[#0c0d12]">Threat Database</a>
            <a href="#api" className="hover:text-[#0c0d12]">API</a>
          </nav>

          <div className="flex items-center gap-2 rounded-full border border-[#eceef2] px-3 py-1.5 text-xs font-semibold text-[#3a3c46]">
            <span className="h-2 w-2 rounded-full bg-[#00c774]" />
            SYSTEMS ACTIVE
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
        <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          Detect <span className="text-[#ee4b4b]">Scam</span>s Instantly with
          <br />
          AI-Powered Analysis
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#5b5d68]">
          Paste suspicious SMS, emails, or links to instantly evaluate scam threats, extract risk
          vectors, and protect your digital footprint.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="#detector"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0c0d12] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#242631]"
          >
            Try It Now <span aria-hidden>→</span>
          </a>
          <a
            href="#threat-db"
            className="inline-flex items-center gap-2 rounded-lg border border-[#d9dbe1] px-6 py-3 text-sm font-semibold text-[#0c0d12] transition hover:border-[#0c0d12]"
          >
            View Live Counter
          </a>
        </div>
      </section>

      {/* ---------------- Detector ---------------- */}
      <section id="detector" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input panel */}
          <div className="rounded-2xl border border-[#00e08f]/40 bg-[#0a0b12] p-6 shadow-[0_0_40px_-15px_rgba(0,224,143,0.35)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <span className="h-2 w-2 rounded-full bg-[#00e08f]" />
                <h2 className="font-semibold">Suspicious Message Input</h2>
              </div>
              <span className="text-xs text-[#7a7d8c]">Max 5,000 characters</span>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 5000))}
              rows={8}
              placeholder="Paste an SMS, email, or link you're not sure about..."
              className="mt-4 w-full resize-none rounded-xl border border-[#00e08f]/50 bg-[#05060b] p-4 text-sm leading-relaxed text-[#e6e7ec] outline-none placeholder:text-[#5b5d68] focus:border-[#00e08f]"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs text-[#8b8d9b]">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden>▤</span> AI Scan Mode Enabled
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden>◐</span> URL Deep-Check ON
                </span>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !message.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00e08f] px-5 py-2.5 text-sm font-semibold text-[#04140d] transition hover:bg-[#1fe89e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span aria-hidden>⇄</span>
                {isAnalyzing ? "Analyzing..." : "Analyze Message"}
              </button>
            </div>
          </div>

          {/* Result panel */}
          <div className="relative rounded-2xl border border-[#ff3468]/40 bg-[#0a0b12] p-6 shadow-[0_0_40px_-15px_rgba(255,52,104,0.35)]">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Live Assessment</h2>
              {assessment && (
                <span
                  className="rounded-full border px-3 py-1 text-xs font-bold tracking-wide"
                  style={{ borderColor: riskColor, color: riskColor }}
                >
                  {assessment.level}
                </span>
              )}
            </div>

            {/* Gauge */}
            <div className="mt-2 flex flex-col items-center">
              <svg width="220" height="150" viewBox="0 0 220 130">
                <path
                  d={trackPath}
                  fill="none"
                  stroke="#1c1e29"
                  strokeWidth={16}
                  strokeLinecap="round"
                />
                <path
                  d={valuePath}
                  fill="none"
                  stroke={riskColor}
                  strokeWidth={16}
                  strokeLinecap="round"
                  style={{ transition: "d 0.6s ease, stroke 0.4s ease" }}
                />
                <text
                  x="110"
                  y="98"
                  textAnchor="middle"
                  className="fill-white"
                  style={{ fontSize: "42px", fontWeight: 800 }}
                >
                  {assessment ? score : "--"}
                </text>
              </svg>
              <span className="-mt-2 text-xs font-semibold tracking-wide text-[#8b8d9b]">
                STRIKE RATE
              </span>
            </div>

            <div className="my-5 h-px w-full bg-[#1c1e29]" />

            <div>
              <p className="text-xs font-semibold tracking-wide text-[#8b8d9b]">
                FLAGGED THREAT VECTOR LABELS
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {assessment && assessment.tags.length > 0 ? (
                  assessment.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#00e08f] px-2.5 py-1 text-xs font-bold text-[#04140d]"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#5b5d68]">
                    No threat vectors flagged yet — run an analysis.
                  </span>
                )}
              </div>
            </div>

            {assessment && assessment.hasLink && assessment.score >= 60 && (
              <div className="mt-5 flex gap-3 rounded-xl border border-[#ff3468]/50 bg-[#1a0d14] p-4">
                <span className="text-[#ff3468]" aria-hidden>⚠</span>
                <p className="text-sm text-[#e6e7ec]">
                  <span className="font-bold text-white">Critical warning: </span>
                  Do not follow this link. It contains a domain designed to look like a trusted
                  financial portal.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how-it-works" className="bg-[#0a0b12] py-24 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-bold italic text-[#ee4b4b] sm:text-4xl">ScamShield AI</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#c9cad3]">
            Comprehensive, split-second assessments powered by high-speed neural models.
          </p>

          <div className="mt-14 grid gap-6 text-left sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Paste message",
                body: "Paste text messages, fraudulent emails, or web links directly into the scanning interface.",
                icon: "⧉",
              },
              {
                step: "02",
                title: "AI analysis",
                body: "Our language models compare syntax, link structure, and known malicious threat databases.",
                icon: "◈",
              },
              {
                step: "03",
                title: "Get results",
                body: "Instantly see a clear risk score, flagged threat tags, and what to do next.",
                icon: "▤",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[#1c1e29] bg-[#05060b] p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e08f]/10 text-[#00e08f]">
                    {item.icon}
                  </span>
                  <span className="text-2xl font-bold text-[#22242f]">{item.step}</span>
                </div>
                <h3 className="mt-5 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8b8d9b]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="bg-[#05060b] py-14 text-[#8b8d9b]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3a3c46]">⊗</span>
              <span className="font-semibold">
                ScamShield <span className="text-[#ff3468]">AI</span>
              </span>
            </div>
            <p className="mt-3 text-sm">
              Instantly intercepting social engineering attacks, phishing triggers, and bad-actor
              domains.
            </p>
          </div>

          <div className="flex gap-16 text-sm">
            <div className="flex flex-col gap-2">
              <a href="#detector" className="hover:text-white">Scan Tool</a>
              <a href="#api" className="hover:text-white">API Core</a>
              <a href="#" className="hover:text-white">Documentation</a>
            </div>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Use</a>
              <a href="#" className="hover:text-white">CCPA</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-[#1c1e29] px-6 pt-6 text-xs">
          © {new Date().getFullYear()} ScamShield AI, Inc. Built to secure digital communications.
        </div>
      </footer>
    </div>
  );
}
