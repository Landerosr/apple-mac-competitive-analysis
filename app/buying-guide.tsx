'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { models, reviewed, decide } from '@/lib/buying-guide';

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const field = 'mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base text-neutral-950 focus:outline-2 focus:outline-blue-600';
export default function BuyingGuide() {
  const [modelId, setModel] = useState('pro');
  const [budget, setBudget] = useState('2000');
  const [need, setNeed] = useState('working');
  const [workload, setWorkload] = useState('development');
  const [compatibility, setCompatibility] = useState('unknown');
  const [quote, setQuote] = useState('');
  const model = models.find(m => m.id === modelId)!;
  const decision = decide({ model: modelId, budget: Number(budget), need, workload, compatibility, quote });
  return <section id="buying-guide" className="border-b border-neutral-200 py-10 sm:py-14">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm text-blue-700">Mac buying guide · U.S.</p><h2 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Buy now. Or keep what works.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">A decision based on your needs and sourced product facts—not release rumors or a made-up value score.</p></div>
      <a href="#analysis" className="text-sm text-neutral-600 underline underline-offset-4">Explore the market research ↓</a>
    </div>
    <div className="grid gap-7 lg:grid-cols-[1fr_1fr]">
      <div className="grid content-start gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">Mac to consider<select className={field} value={modelId} onChange={e => { setModel(e.target.value); setQuote(''); }}>{models.map(m => <option value={m.id} key={m.id}>{m.name} · {m.chip}</option>)}</select></label>
        <label className="text-sm font-medium">Budget before tax · USD<input className={field} type="number" min="1" value={budget} onChange={e => setBudget(e.target.value)} /></label>
        <label className="text-sm font-medium">Your current laptop<select className={field} value={need} onChange={e => setNeed(e.target.value)}><option value="working">Still meets my needs</option><option value="limited">Slows down my work</option><option value="urgent">Unusable / need a replacement</option></select></label>
        <label className="text-sm font-medium">Main use<select className={field} value={workload} onChange={e => setWorkload(e.target.value)}><option value="everyday">School, browsing & office work</option><option value="development">Coding, data & creative work</option><option value="heavy">Sustained rendering / large local models</option></select></label>
        <label className="text-sm font-medium sm:col-span-2">Do your essential apps support this Mac?<select className={field} value={compatibility} onChange={e => setCompatibility(e.target.value)}><option value="unknown">I still need to check</option><option value="yes">Yes, I have checked</option><option value="no">No / I need Windows-only software</option></select></label>
        <details className="sm:col-span-2 text-sm text-neutral-600"><summary className="cursor-pointer py-2">Have an actual price quote? Optional</summary><label className="mt-2 block">Exact configuration, new condition · USD<input className={field} type="number" min="1" placeholder="Enter the price you found" value={quote} onChange={e => setQuote(e.target.value)} /></label><p className="mt-2 leading-6">Your input is not independently verified. Match memory and storage; exclude tax, trade-in credits and gift cards. Cleared when the selected model changes.</p></details>
      </div>
      <div className="rounded-2xl bg-neutral-950 p-7 text-white sm:p-9" aria-live="polite">
        <p className="text-sm text-blue-300">Your decision · {decision.kind === 'buy' ? 'Buy' : decision.kind === 'wait' ? 'Wait' : 'Check first'}</p>
        <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">{decision.title}</h2>
        <p className="mt-5 text-base leading-7 text-neutral-300">{decision.reason}</p>
        <div className="mt-7 grid grid-cols-2 gap-5 border-t border-neutral-700 pt-6"><div><p className="text-sm text-neutral-400">Published starting price</p><p className="mt-2 text-3xl">{usd(model.price)}</p><p className="mt-2 text-sm text-neutral-400">March 3, 2026 · not live</p></div><div><p className="text-sm text-neutral-400">Included configuration</p><p className="mt-2 text-xl">{model.memory}GB / {model.storage === 1024 ? '1TB' : '512GB'}</p><p className="mt-2 text-sm text-neutral-400">Unified memory / SSD</p></div></div>
        {decision.discount !== null && <p className="mt-5 text-sm text-blue-200">Your quote is {Math.abs(decision.discount).toFixed(1)}% {decision.discount >= 0 ? 'below' : 'above'} the published reference price. This is not a historical-low comparison.</p>}
        <a className="mt-7 inline-block rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950" href={model.shop} target="_blank" rel="noreferrer">Check current Apple price ↗</a>
      </div>
    </div>
    <p className="mt-6 text-sm leading-6 text-neutral-500">Sources reviewed {reviewed}. Real manufacturer specifications and published March 2026 prices. No live retailer feed, synthetic observations, predicted discounts or predicted launch dates. Recommendation rules are our judgment, not an Apple recommendation.</p>
    <div className="mt-10 grid gap-5 md:grid-cols-3">{models.map(m => <article key={m.id} className={`rounded-xl border p-5 ${m.id === modelId ? 'border-blue-500 bg-blue-50/40' : 'border-neutral-200'}`}><h3 className="text-lg font-medium">{m.name} · {m.chip}</h3><p className="mt-2 text-2xl tracking-tight">{usd(m.price)}<span className="ml-2 text-sm text-neutral-500">published starting price</span></p><p className="mt-3 text-sm leading-6 text-neutral-600">{m.features}</p><p className="mt-4 text-sm leading-6">{m.tradeoff}</p><p className="mt-4 text-sm text-neutral-500">{m.releaseLabel}: {m.release}</p><div className="mt-4 flex flex-wrap items-center gap-4"><Button variant="outline" aria-pressed={modelId === m.id} onClick={() => { setModel(m.id); setQuote(''); }}>Consider this Mac</Button><a className="text-sm text-blue-700 underline underline-offset-4" href={m.source} target="_blank" rel="noreferrer">Apple source ↗</a></div></article>)}</div>
    <details className="mt-8 border-t border-neutral-200 pt-5 text-sm leading-7 text-neutral-600"><summary className="cursor-pointer font-medium text-neutral-950">What would make waiting worthwhile?</summary><p className="mt-3">A laptop that still does its job, an over-budget quote, or an unresolved software requirement are concrete reasons to wait. Product age alone is not a release forecast. We do not have a verified future release date or a price-history dataset, so we cannot claim a new Mac or a better deal is imminent.</p><p className="mt-3">Rules run in order: validate inputs → check software → check budget → assess replacement need → check workload fit → verify the quote. These rules do not estimate performance, resale value or the probability of a price drop. Published model prices are not matched configurations. The market-strength score and revenue forecasts below do not determine the buying recommendation.</p></details>
  </section>;
}
