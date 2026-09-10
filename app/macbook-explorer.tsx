'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const viewer = 'https://inside-macbook.vercel.app/';
const source = 'https://github.com/Pulkit7070/inside-macbook';

export default function MacBookExplorer() {
  const [open, setOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  return <section id="macbook-explorer" aria-labelledby="explorer-title" className="border-b border-neutral-200 py-12 sm:py-16">
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="max-w-2xl">
        <p className="text-sm text-blue-700">Inside the hardware · Interactive 3D</p>
        <h2 id="explorer-title" className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Take a closer look.</h2>
        <p className="mt-4 text-base leading-7 text-neutral-600">Rotate a 14-inch MacBook Pro, separate its assemblies, and bring them back together. Select components to explore what they do.</p>
      </div>
      <div className="rounded-full border border-neutral-200 px-4 py-2 text-sm">14-inch MacBook Pro · M5 Pro · 2026</div>
    </div>
    <div className="mt-7 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-6">
      {open ? <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-neutral-600">Drag to rotate · Scroll to zoom · Use the viewer’s slider to pull apart / reassemble</p>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setRevision(r => r + 1)}>Reset viewer</Button><Button variant="outline" onClick={() => setOpen(false)}>Close viewer</Button></div>
        </div>
        <iframe key={revision} title="Inside a MacBook: educational M5 Pro teardown by Pulkit Saraf" src={viewer} className="block h-[720px] w-full rounded-xl border border-neutral-200 bg-white lg:h-[780px]" allow="fullscreen" allowFullScreen sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" />
      </> : <div className="flex min-h-48 flex-wrap items-center justify-between gap-6 p-3 sm:p-5">
        <div><h3 className="text-xl font-medium">Explore 20 simplified assemblies</h3><p className="mt-2 max-w-xl text-base leading-7 text-neutral-600">A hands-on view of the enclosure, cooling system, battery and logic board. Loads on demand to keep the dashboard light.</p></div>
        <Button className="h-auto rounded-full px-6 py-3 text-base" onClick={() => setOpen(true)}>Explore the MacBook</Button>
      </div>}
      <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm">
        <a href={viewer} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline underline-offset-4">Open full-screen viewer ↗</a>
        <a href={source} target="_blank" rel="noopener noreferrer" className="text-neutral-600 underline underline-offset-4">Created by Pulkit Saraf · MIT license ↗</a>
      </div>
    </div>
    <p className="mt-5 text-sm leading-6 text-neutral-600"><strong className="font-medium text-neutral-900">Educational illustration, not an exact service model.</strong> Geometry, component placement and separation are simplified. This is not a repair guide and does not imply memory or storage can be upgraded. It represents the M5 Pro study only—not the Air or base M5 selected above. It does not affect buying recommendations.</p>
    <p className="mt-2 text-sm leading-6 text-neutral-500">The viewer is embedded from its creator’s website, not authored by this portfolio. Opening it contacts that site and requires WebGL. If it cannot load here, try the full-screen link. Product facts and prices remain separately sourced in the buying guide.</p>
  </section>;
}
