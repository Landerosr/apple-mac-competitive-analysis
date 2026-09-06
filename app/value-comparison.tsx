'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const appleSource = 'https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/';
const configurations = [
  { name: 'MacBook Pro 14 · M5', memory: 16, storage: 1, price: '1699', chip: 'M5 · 10-core CPU / 10-core GPU', features: 'Liquid Retina XDR display · macOS · HDMI and SD card connectivity', source: appleSource, basis: 'March 2026 U.S. starting price', },
  { name: 'MacBook Pro 14 · M5 Pro', memory: 24, storage: 1, price: '2199', chip: 'M5 Pro · 15-core CPU / 16-core GPU', features: 'Liquid Retina XDR display · macOS · Thunderbolt 5', source: appleSource, basis: 'March 2026 U.S. starting price', },
  { name: 'HP ZBook Ultra G1a · BN2U8UA', memory: 32, storage: 1, price: '', chip: 'Ryzen AI Max PRO 390 · 12-core CPU', features: 'Windows 11 Pro · Radeon integrated graphics · workstation security', source: 'https://www.hp.com/us-en/shop/pdp/hp-zbook-ultra-14-inch-g1a-mobile-workstation-pc-wolf-pro-security-edition-bn2u8ua-aba', basis: 'Price unavailable in retrieved listing; enter a quote', },
];
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function ValueComparison() {
  const [prices, setPrices] = useState(configurations.map(c => c.price));
  const [metric, setMetric] = useState<'memory' | 'storage'>('memory');
  const basePrice = Number(prices[0]);
  const valid = (p: string) => Number.isFinite(Number(p)) && Number(p) > 0;
  const ratios = configurations.map((c, i) => valid(prices[i]) ? c[metric] * 1000 / Number(prices[i]) : null);
  const maxRatio = Math.max(1, ...ratios.map(r => r ?? 0));
  return <div className="mt-12 border-t border-neutral-200 pt-9" id="price-value">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl"><p className="text-sm text-neutral-500">Price & components</p><h3 className="mt-2 text-2xl font-medium tracking-tight">What does the extra money buy?</h3><p className="mt-3 text-base leading-7 text-neutral-600">Compare the included hardware at each configuration’s price. Change a price to test a current quote or discount.</p></div>
      <Button variant="outline" onClick={() => setPrices(configurations.map(c => c.price))}>Reset prices</Button>
    </div>
    <div className="mt-7 grid gap-6 lg:grid-cols-3">
      {configurations.map((c, i) => <article key={c.name} className="rounded-xl border border-neutral-200 p-5">
        <h4 className="font-medium text-neutral-950">{c.name}</h4><p className="mt-2 text-sm leading-6 text-neutral-500">{c.chip}</p>
        <label className="mt-5 block text-sm text-neutral-600">Configuration price · USD<input type="number" min="1" step="1" placeholder="Enter quoted price" value={prices[i]} onChange={e => setPrices(p => p.map((v, j) => i === j ? e.target.value : v))} className="mt-2 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-lg text-neutral-950 focus:outline-2 focus:outline-blue-600" aria-label={`${c.name} price in USD`} /></label>
        <p className="mt-2 text-sm leading-5 text-neutral-500">{prices[i] !== c.price ? 'Your scenario price · unsaved' : c.basis}</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4"><div><dt className="text-sm text-neutral-500">Memory included</dt><dd className="mt-1 font-medium">{c.memory} GB</dd></div><div><dt className="text-sm text-neutral-500">SSD included</dt><dd className="mt-1 font-medium">{c.storage} TB</dd></div></dl>
        <p className="mt-4 text-sm leading-6 text-neutral-600">{c.features}</p>
        <p className="mt-4 text-sm font-medium">{i === 0 ? 'Price reference' : valid(prices[i]) && valid(prices[0]) ? `${usd(Math.abs(Number(prices[i]) - basePrice))} ${Number(prices[i]) >= basePrice ? 'more' : 'less'} than M5 · ${((Number(prices[i]) / basePrice - 1) * 100).toFixed(1)}%` : 'Enter a valid price to compare'}</p>
        <a href={c.source} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-blue-700 underline underline-offset-4">Manufacturer source ↗</a>
      </article>)}
    </div>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><h4 className="font-medium">Included capacity per $1,000</h4><div className="flex gap-2" aria-label="Capacity metric"><Button variant={metric === 'memory' ? 'default' : 'outline'} aria-pressed={metric === 'memory'} onClick={() => setMetric('memory')}>Memory</Button><Button variant={metric === 'storage' ? 'default' : 'outline'} aria-pressed={metric === 'storage'} onClick={() => setMetric('storage')}>Storage</Button></div></div>
    <div className="mt-6 space-y-5" aria-live="polite">{configurations.map((c, i) => <div key={c.name}><div className="mb-2 flex justify-between gap-4 text-sm"><span>{c.name}</span><span className="tabular-nums">{ratios[i] === null ? 'Price needed' : `${ratios[i]!.toFixed(2)} ${metric === 'memory' ? 'GB' : 'TB'} / $1,000`}</span></div><div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className={i === 0 ? 'h-full bg-blue-600' : 'h-full bg-neutral-400'} style={{ width: `${(ratios[i] ?? 0) / maxRatio * 100}%` }} /></div></div>)}</div>
    <p className="mt-6 text-sm leading-6 text-neutral-500">Capacity per $1,000 = included GB or TB ÷ price × 1,000. This measures capacity value, not CPU/GPU speed or overall quality. Memory architecture, software compatibility, displays, warranty and workload performance also matter. No benchmark-based performance ranking is implied. Prices exclude tax; Apple defaults are dated reference prices, not live quotes. Sources checked September 6, 2026.</p>
  </div>;
}
