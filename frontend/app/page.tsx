'use client';

import { FormEvent, useState } from 'react';

type RiskLevel = 'high' | 'suspicious' | 'low';
type Assessment = { riskScore: number; level: RiskLevel; foundWords: string[] };

const riskColors: Record<RiskLevel, string> = { high: '#ff3468', suspicious: '#f5a623', low: '#00e08f' };
const riskLabels: Record<RiskLevel, string> = { high: 'HIGH RISK', suspicious: 'MODERATE RISK', low: 'LOW RISK' };
const gaugeLength = 298.45;

function Gauge({ assessment }: { assessment: Assessment | null }) {
  const riskScore = assessment?.riskScore ?? 0;
  const color = assessment ? riskColors[assessment.level] : '#00e08f';
  const pointerRotation = riskScore * 1.8 - 90;
  const progressOffset = gaugeLength - (gaugeLength * riskScore) / 100;

  return (
    <div className="flex min-w-0 flex-col items-center" style={{ '--gauge-color': color } as React.CSSProperties}>
      <div className="relative h-[126px] w-[220px]">
        <svg viewBox="0 0 240 140" className="h-full w-full overflow-visible" aria-hidden="true">
          <path className="gauge-track" d="M 25 120 A 95 95 0 0 1 215 120" />
          <path className="gauge-progress" d="M 25 120 A 95 95 0 0 1 215 120" style={{ strokeDashoffset: progressOffset }} />
        </svg>
        <span className="gauge-pointer" style={{ transform: `rotate(${pointerRotation}deg)` }} />
      </div>
      <span className="mt-2 font-sans text-[10px] font-bold tracking-[.13em] text-[#8b8d9b]">RISK SCORE</span>
    </div>
  );
}

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  async function analyzeMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAnalyzing(true);
    setError('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to analyze this message.');
      setAssessment(result);
    } catch (requestError) {
      setAssessment(null);
      setError(requestError instanceof Error ? requestError.message : 'Unable to analyze this message.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const score = assessment?.riskScore ?? '--';
  const riskClass = assessment ? riskLabels[assessment.level] : 'AWAITING SCAN';

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="flex min-h-[72px] items-center justify-between border-b border-[#e7e8ec] px-5 sm:px-[5vw]">
        <a href="/" className="flex items-center gap-2 text-[19px] font-bold tracking-[-.03em]" aria-label="ScamShield AI home"><span className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-ink text-[21px]">⊗</span><span>ScamShield <em className="not-italic text-pink">AI</em></span></a>
        <nav className="main-nav flex gap-9 font-sans text-[13px] font-semibold text-[#4e515c]" aria-label="Main navigation"><a href="#detector">Detector</a><a href="#how-it-works">How It Works</a><a href="#threat-db">Threat Database</a><a href="#api">API</a></nav>
        <span className="flex items-center gap-2 rounded-full border border-[#e7e8ec] px-3 py-2 font-sans text-[10px] font-bold tracking-[.08em] text-[#4e515c]"><span className="h-[7px] w-[7px] rounded-full bg-[#00c774]" />SYSTEMS ACTIVE</span>
      </header>

      <main>
        <section className="mx-auto max-w-[920px] px-5 py-24 text-center sm:py-36"><p className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-pink">Message intelligence / 01</p><h1 className="text-[clamp(42px,6vw,76px)] font-bold leading-[.99] tracking-[-.055em]">Detect <span className="text-pink">scams</span> instantly with<br />AI-powered analysis</h1><p className="mx-auto mt-7 max-w-[650px] font-sans text-lg leading-[1.55] text-muted">Paste suspicious SMS, emails, or links to instantly evaluate scam threats, extract risk vectors, and protect your digital footprint.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><a href="#detector" className="rounded-lg bg-ink px-5 py-3 font-sans text-[13px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#292b35]">Try it now <span>→</span></a><a href="#threat-db" className="rounded-lg border border-[#d6d8df] px-5 py-3 font-sans text-[13px] font-bold transition hover:-translate-y-0.5 hover:border-ink">View live counter</a></div></section>

        <section id="detector" className="bg-[#f7f8fa] px-5 pb-24 sm:px-[5vw]" aria-labelledby="detector-title"><div className="mx-auto grid max-w-[1160px] gap-[22px] lg:grid-cols-2">
          <form onSubmit={analyzeMessage} className="rounded-[15px] border border-green/40 bg-night p-6 shadow-[0_18px_48px_-25px_rgba(0,224,143,.65)] sm:p-7"><div className="flex items-center justify-between gap-3"><h2 id="detector-title" className="flex items-center gap-2 font-sans text-[15px] font-bold text-white"><span className="h-[7px] w-[7px] rounded-full bg-green" />Suspicious message input</h2><span className="font-sans text-[11px] text-[#7a7d8c]">{message.length.toLocaleString()} / 2,000</span></div><textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} placeholder="Paste an SMS, email, or link you're not sure about..." required className="mt-[18px] block min-h-[230px] w-full resize-y rounded-[11px] border border-green/40 bg-black p-4 font-sans text-sm leading-[1.65] text-[#e6e7ec] outline-none placeholder:text-[#696c7a] focus:border-green focus:ring-4 focus:ring-green/10" /><div className="mt-[17px] flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-4 font-sans text-[11px] text-[#8b8d9b]"><span>▤ AI scan mode enabled</span><span>◐ URL deep-check on</span></div><button type="submit" disabled={isAnalyzing} className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-3 font-sans text-[13px] font-bold text-[#04140d] transition hover:-translate-y-0.5 hover:bg-[#1fe89e] disabled:cursor-wait disabled:opacity-60">{isAnalyzing ? 'Analyzing...' : 'Analyze message'} <span>⇄</span></button></div></form>

          <aside className="rounded-[15px] border border-pink/40 bg-night p-6 text-white shadow-[0_18px_48px_-25px_rgba(255,52,104,.65)] sm:p-7" aria-live="polite"><div className="flex items-center justify-between"><h2 className="font-sans text-[15px] font-bold">Live assessment</h2></div><div className="my-[18px] flex flex-col items-center gap-2 text-center"><span className={`rounded-full px-3 py-2 font-sans text-[10px] font-bold tracking-[.07em] ${assessment?.level === 'high' ? 'border-[3px] border-double border-pink text-[13px] text-pink' : assessment?.level === 'suspicious' ? 'border border-amber text-amber' : assessment?.level === 'low' ? 'border border-green text-green' : 'border border-[#4c4f5b] text-[#9699a7]'}`}>{riskClass}</span><Gauge assessment={assessment} /><div className="flex items-baseline justify-center"><strong className="font-sans text-[43px] font-extrabold tracking-[-.07em]">{score}</strong><span className="ml-1 font-sans text-xs text-[#8b8d9b]">/100</span></div></div><div className="h-px bg-[#20222d]" /><div className="pt-5"><p className="mb-3 font-sans text-[10px] font-bold tracking-[.1em] text-[#8b8d9b]">FLAGGED THREAT VECTOR LABELS</p><ul className="flex flex-wrap gap-2">{assessment?.foundWords.length ? assessment.foundWords.map((word) => <li key={word} className="rounded-[5px] border border-pink/55 bg-pink/10 px-2 py-1.5 font-sans text-[11px] font-bold text-pink">+ {word}</li>) : <li className="font-sans text-sm text-[#5b5d68]">{error || 'No threat vectors flagged yet - run an analysis.'}</li>}</ul></div>{assessment?.riskScore && assessment.riskScore >= 60 && message.match(/https?:\/\//i) ? <div className="mt-5 flex gap-2.5 rounded-[10px] border border-pink/55 bg-[#1a0d14] p-3 font-sans text-xs leading-[1.5] text-[#e6e7ec]"><span className="text-pink">⚠</span><p><strong className="text-white">Critical warning: </strong>Do not follow this link. It contains a domain designed to look like a trusted financial portal.</p></div> : null}</aside>
        </div></section>

        <section id="how-it-works" className="bg-night px-5 py-24 text-white sm:px-[5vw]"><div className="mx-auto max-w-[1050px] text-center"><p className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-pink">A clearer signal</p><h2 className="text-[38px] font-bold italic tracking-[-.05em] text-pink">ScamShield AI</h2><p className="mt-3 font-sans text-lg text-[#c9cad3]">Fast, focused assessments for the messages that make you pause.</p><div className="mt-14 grid gap-4 text-left md:grid-cols-3">{[['⧉', '01', 'Paste message', 'Paste text messages, suspicious emails, or web links directly into the scanning interface.'], ['◈', '02', 'AI analysis', 'Our rule engine compares language patterns and known scam signals in seconds.'], ['▤', '03', 'Get results', 'See a clear risk score, flagged threat labels, and the next sensible action.']].map(([icon, step, title, body]) => <article key={step} className="relative min-h-[210px] rounded-xl border border-[#20222d] bg-black p-6"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green/10 text-xl text-green">{icon}</div><span className="absolute right-5 top-5 font-sans text-3xl font-bold text-[#272934]">{step}</span><h3 className="mt-7 font-sans text-base font-bold">{title}</h3><p className="mt-2 max-w-[260px] font-sans text-[13px] leading-[1.6] text-[#8b8d9b]">{body}</p></article>)}</div></div></section>
        <section id="threat-db" className="flex items-center justify-center gap-4 px-5 py-12 text-center"><span className="font-sans text-5xl font-extrabold tracking-[-.08em] text-pink">12</span><p className="font-sans text-[13px] text-muted">scam signal families monitored in every scan</p><span className="text-3xl">⊗</span></section>
      </main>

      <footer id="api" className="grid gap-8 border-t border-[#20222d] bg-black px-5 py-12 text-[#8b8d9b] sm:grid-cols-[1fr_auto] sm:px-[5vw]"><div><a href="/" className="flex items-center gap-2 font-sans font-bold text-white"><span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3a3c46]">⊗</span>ScamShield <em className="not-italic text-pink">AI</em></a><p className="mt-3 max-w-[300px] font-sans text-xs leading-[1.6]">Intercepting social engineering attacks, phishing triggers, and bad-actor domains.</p></div><div className="flex flex-col gap-1 font-sans text-xs"><a href="#detector">Scan tool</a><a href="#api">API core</a><a href="#how-it-works">Documentation</a></div><p className="border-t border-[#20222d] pt-5 font-sans text-[10px] sm:col-span-2">© 2026 ScamShield AI. Built to secure digital communications.</p></footer>
    </div>
  );
}
