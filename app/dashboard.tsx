'use client';
/* oxlint-disable typescript/no-deprecated */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, ExternalLink, Info, RefreshCcw } from 'lucide-react';

import analysis from '@/lib/analysis.json';
import ValueComparison from './value-comparison';
import BuyingGuide from './buying-guide';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type WeightMap = Record<string, number>;

const appleBlue = '#0875e1';
const vendorColors: Record<string, string> = {
  Lenovo: '#22252a',
  HP: '#565b63',
  Dell: '#858b94',
  Apple: appleBlue,
  ASUS: '#b2b7be',
  Acer: '#d2d5d9',
};

const defaultWeights = Object.fromEntries(
  analysis.strengthComponents.map((component) => [component.key, component.weight]),
) as WeightMap;

const money = (value: number) => `$${value.toFixed(2)}B`;
const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.min(maximum, Math.max(minimum, value));
const readSliderValue = (value: number | readonly number[]) =>
  typeof value === 'number' ? value : (value[0] ?? 0);

function SectionIntro({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-9 grid gap-4 md:grid-cols-[120px_1fr] md:gap-8">
      <p className="pt-1 text-sm font-medium text-neutral-400">{number}</p>
      <div className="max-w-2xl">
        <h2 className="text-3xl font-medium tracking-[-0.045em] text-neutral-950 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-neutral-600">{description}</p>
      </div>
    </div>
  );
}

function ModelControl({
  label,
  value,
  minimum,
  maximum,
  step,
  minLabel,
  maxLabel,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-neutral-800">{label}</span>
        <span className="font-mono text-[13px] text-neutral-500">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={minimum}
        max={maximum}
        step={step}
        onValueChange={(next) => onChange(readSliderValue(next))}
        aria-label={label}
      />
      <div className="mt-3 flex justify-between text-xs text-neutral-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [weights, setWeights] = useState<WeightMap>(defaultWeights);
  const [shareChange, setShareChange] = useState(0.1);
  const [macGrowth, setMacGrowth] = useState(analysis.signals.macRevenueGrowth);
  const [productScore, setProductScore] = useState(100);

  const adjustedComponents = useMemo(
    () =>
      analysis.strengthComponents.map((component) => {
        if (component.key === 'share') {
          return { ...component, score: Math.round(clamp(50 + shareChange * 20)) };
        }
        if (component.key === 'financial') {
          return { ...component, score: Math.round(clamp(50 + macGrowth * 1.5)) };
        }
        if (component.key === 'product') return { ...component, score: productScore };
        return component;
      }),
    [shareChange, macGrowth, productScore],
  );

  const strengthScore = useMemo(() => {
    const totalWeight = adjustedComponents.reduce(
      (sum, component) => sum + (weights[component.key] ?? 0),
      0,
    );
    if (!totalWeight) return 0;
    return Math.round(
      adjustedComponents.reduce(
        (sum, component) => sum + component.score * (weights[component.key] ?? 0),
        0,
      ) / totalWeight,
    );
  }, [adjustedComponents, weights]);

  const verdict =
    Object.values(weights).every((weight) => weight === 0)
      ? 'Choose at least one signal weight'
      : strengthScore >= 70
      ? 'Strong premium challenger'
      : strengthScore >= 58
        ? 'Competitive, but scale-constrained'
        : 'Momentum needs support';

  const modelStateRef = useRef({
    weights,
    shareChange,
    macGrowth,
    productScore,
    strengthScore,
    verdict,
  });

  useEffect(() => {
    modelStateRef.current = {
      weights,
      shareChange,
      macGrowth,
      productScore,
      strengthScore,
      verdict,
    };
  }, [weights, shareChange, macGrowth, productScore, strengthScore, verdict]);

  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: {
              name: string;
              title: string;
              description: string;
              inputSchema: object;
              annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
              execute: (input: unknown) => object | Promise<object>;
            },
            options?: { signal?: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const afterPaint = () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );

    const registrations = [
      context.registerTool(
        {
          name: 'read_strength_model',
          title: 'Read strength model',
          description:
            'Read the current Apple competitive-strength assumptions, weights, score, and verdict without changing them.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute: () => ({ ...modelStateRef.current }),
        },
        { signal: lifecycle.signal },
      ),
      context.registerTool(
        {
          name: 'configure_strength_model',
          title: 'Configure strength model',
          description:
            'Stage new scenario assumptions or signal weights and update the visible Apple competitive-strength score.',
          inputSchema: {
            type: 'object',
            properties: {
              shareChange: { type: 'number', minimum: -1.5, maximum: 2 },
              macGrowth: { type: 'number', minimum: -20, maximum: 40 },
              productScore: { type: 'number', minimum: 50, maximum: 100 },
              weights: {
                type: 'object',
                properties: {
                  scale: { type: 'number', minimum: 0, maximum: 50 },
                  shipments: { type: 'number', minimum: 0, maximum: 50 },
                  share: { type: 'number', minimum: 0, maximum: 50 },
                  financial: { type: 'number', minimum: 0, maximum: 50 },
                  product: { type: 'number', minimum: 0, maximum: 50 },
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (!input || typeof input !== 'object' || Array.isArray(input)) {
              throw new Error('Input must be an object.');
            }
            const next = input as {
              shareChange?: number;
              macGrowth?: number;
              productScore?: number;
              weights?: Partial<WeightMap>;
            };
            if (next.shareChange !== undefined) {
              setShareChange(clamp(next.shareChange, -1.5, 2));
            }
            if (next.macGrowth !== undefined) setMacGrowth(clamp(next.macGrowth, -20, 40));
            if (next.productScore !== undefined) {
              setProductScore(clamp(next.productScore, 50, 100));
            }
            if (next.weights) {
              const allowed = ['scale', 'shipments', 'share', 'financial', 'product'];
              const cleanWeights = Object.fromEntries(
                Object.entries(next.weights)
                  .filter(([key, value]) => allowed.includes(key) && typeof value === 'number')
                  .map(([key, value]) => [key, clamp(value as number, 0, 50)]),
              );
              setWeights((current) => ({ ...current, ...cleanWeights }));
            }
            await afterPaint();
            return { status: 'updated', ...modelStateRef.current };
          },
        },
        { signal: lifecycle.signal },
      ),
      context.registerTool(
        {
          name: 'reset_strength_model',
          title: 'Reset strength model',
          description:
            'Reset all scenario assumptions and signal weights to the published base case.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute() {
            setWeights(defaultWeights);
            setShareChange(0.1);
            setMacGrowth(analysis.signals.macRevenueGrowth);
            setProductScore(100);
            await afterPaint();
            return { status: 'reset', ...modelStateRef.current };
          },
        },
        { signal: lifecycle.signal },
      ),
    ];

    registrations.forEach((registration) => {
      void Promise.resolve(registration).catch(() => undefined);
    });
    return () => lifecycle.abort();
  }, []);

  const historicalRevenue = analysis.revenueHistory.slice(-11);
  const forecastChartData = [
    ...historicalRevenue.map((row, index) => ({
      period: row.period.replace('FY', ''),
      actual: row.revenue_usd_bn,
      forecast: index === historicalRevenue.length - 1 ? row.revenue_usd_bn : null,
    })),
    {
      period: analysis.forecast.period.replace('FY', ''),
      actual: null,
      forecast: analysis.forecast.point,
    },
  ];

  const resetModel = () => {
    setWeights(defaultWeights);
    setShareChange(0.1);
    setMacGrowth(analysis.signals.macRevenueGrowth);
    setProductScore(100);
  };

  const metricRows = [
    {
      label: 'Worldwide position',
      value: `#${analysis.signals.marketRank}`,
      detail: '2025 PC shipments',
    },
    {
      label: 'Market share',
      value: `${analysis.signals.marketShare}%`,
      detail: 'Worldwide, 2025',
    },
    {
      label: 'Shipment growth',
      value: `+${analysis.signals.shipmentGrowth}%`,
      detail: `vs. +${analysis.signals.marketGrowth}% market`,
    },
    {
      label: 'Mac revenue',
      value: money(analysis.signals.macRevenueLatest),
      detail: `FY26 Q3 · +${analysis.signals.macRevenueGrowth}% YoY`,
    },
  ];

  return (
    <main
      className="min-h-screen bg-white text-neutral-950"
      data-strength-score={strengthScore}
      data-strength-verdict={verdict}
    >
      <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Return to overview">
            <span className="text-sm font-semibold tracking-[-0.02em]">RL</span>
            <span className="h-4 w-px bg-neutral-300" />
            <span className="text-sm text-neutral-500">Apple Mac analysis</span>
          </a>
          <nav className="flex items-center gap-5 text-sm text-neutral-500" aria-label="Page links">
            <a href="#buying-guide" className="text-blue-700">Buy or wait</a>
            <a href="#model" className="hidden transition hover:text-neutral-950 sm:block">
              Model
            </a>
            <a href="#evidence" className="inline-flex items-center gap-1 transition hover:text-neutral-950">
              Sources <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-[1180px] px-5 pb-16 sm:px-8">
        <BuyingGuide />
        <section className="grid gap-12 border-b border-neutral-200 py-16 sm:py-20 lg:grid-cols-[1fr_260px] lg:items-end lg:py-24">
          <div>
            <div className="mb-8 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
              <span>Competitive outlook</span>
              <span className="h-px w-8 bg-neutral-300" />
              <span>{analysis.asOf}</span>
            </div>
            <h2 className="max-w-4xl text-5xl font-medium leading-[0.98] tracking-[-0.065em] text-neutral-950 sm:text-6xl lg:text-[72px]">
              Strong in premium.
              <br />
              Fourth in scale.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
              Apple combines above-market shipment growth and accelerating Mac revenue with a
              premium product position. Its constraint is worldwide PC volume.
            </p>
          </div>

          <div className="border-l-2 border-blue-600 pl-6 lg:mb-1">
            <p className="text-sm font-medium text-neutral-500">Competitive strength</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-7xl font-medium tracking-[-0.075em] text-neutral-950">
                {strengthScore}
              </span>
              <span className="text-sm text-neutral-400">/ 100</span>
            </div>
            <p className="mt-2 text-base font-medium text-neutral-900">{verdict}</p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              An illustrative weighted score, not an external rating or probability.
            </p>
          </div>
        </section>

        <section className="grid border-b border-neutral-200 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key metrics">
          {metricRows.map((metric, index) => (
            <div
              key={metric.label}
              className={`py-8 sm:px-6 lg:py-10 ${
                index > 0 ? 'border-t border-neutral-200 sm:border-t-0 sm:border-l' : ''
              } ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''} ${index % 2 === 1 ? 'sm:pr-0' : 'sm:pl-0 lg:px-6'} ${index === 3 ? 'lg:pr-0' : ''}`}
            >
              <p className="text-sm text-neutral-500">{metric.label}</p>
              <p className="mt-3 text-4xl font-medium tracking-[-0.055em]">{metric.value}</p>
              <p className="mt-2 text-sm text-neutral-500">{metric.detail}</p>
            </div>
          ))}
        </section>

        <section className="py-20 sm:py-28" id="analysis">
          <SectionIntro
            number="01 / Evidence"
            title="One conclusion. Three views."
            description="Market scale, financial momentum, and product positioning are separated so the strongest signal cannot hide the weakest one."
          />

          <Tabs defaultValue="market" className="w-full">
            <TabsList className="mb-10 h-auto w-full justify-start gap-7 rounded-none border-b border-neutral-200 bg-transparent p-0">
              {['market', 'financial', 'product'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent px-0 pb-4 pt-0 text-base capitalize text-neutral-400 shadow-none data-[state=active]:border-neutral-950 data-[state=active]:bg-transparent data-[state=active]:text-neutral-950 data-[state=active]:shadow-none"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="market" className="mt-0">
              <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
                <div>
                  <div className="mb-8">
                    <p className="text-sm text-neutral-500">2025 worldwide PC share</p>
                    <h3 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
                      Apple trails the three volume leaders.
                    </h3>
                  </div>
                  <div className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 720, height: 360 }}>
                      <BarChart
                        data={analysis.market}
                        layout="vertical"
                        margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid horizontal={false} stroke="#eeeeee" />
                        <XAxis
                          type="number"
                          domain={[0, 30]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#999999', fontSize: 12 }}
                          unit="%"
                        />
                        <YAxis
                          type="category"
                          dataKey="vendor"
                          axisLine={false}
                          tickLine={false}
                          width={64}
                          tick={{ fill: '#3f3f46', fontSize: 13 }}
                        />
                        <Tooltip
                          cursor={{ fill: '#f7f7f7' }}
                          contentStyle={{
                            borderRadius: 10,
                            borderColor: '#e5e5e5',
                            boxShadow: '0 8px 24px rgba(0,0,0,.06)',
                          }}
                          formatter={(value) => [
                            `${Number(Array.isArray(value) ? value[0] : value)}%`,
                            'Market share',
                          ]}
                        />
                        <Bar dataKey="share_2025_pct" radius={[0, 4, 4, 0]} maxBarSize={28}>
                          {analysis.market.map((entry) => (
                            <Cell key={entry.vendor} fill={vendorColors[entry.vendor]} />
                          ))}
                          <LabelList
                            dataKey="share_2025_pct"
                            position="right"
                            formatter={(value: unknown) => `${String(value)}%`}
                            fill="#555555"
                            fontSize={12}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border-t border-neutral-950 pt-5 lg:mt-[78px]">
                  <p className="text-sm font-medium text-neutral-950">Analyst read</p>
                  <p className="mt-5 text-xl leading-8 tracking-[-0.025em] text-neutral-800">
                    Apple is a premium challenger, not a volume leader.
                  </p>
                  <p className="mt-5 text-base leading-7 text-neutral-600">
                    Its 10.3% unit growth exceeded the market&apos;s 9.1%, but 9.2% share leaves a
                    meaningful scale gap versus Lenovo, HP, and Dell.
                  </p>
                  <dl className="mt-8 space-y-4 border-t border-neutral-200 pt-5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Apple share change</dt>
                      <dd className="font-mono text-neutral-900">+0.1 pts</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Gap to #3 Dell</dt>
                      <dd className="font-mono text-neutral-900">6.1 pts</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Growth premium</dt>
                      <dd className="font-mono text-neutral-900">+1.2 pts</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-14 overflow-x-auto border-t border-neutral-200 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neutral-200 hover:bg-transparent">
                      <TableHead className="pl-0 text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Vendor</TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Share</TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Growth</TableHead>
                      <TableHead className="pr-0 text-right text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Share change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.market.map((row) => (
                      <TableRow key={row.vendor} className="border-neutral-200 hover:bg-neutral-50/60">
                        <TableCell className="pl-0 py-4 font-medium">
                          <span className="flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: vendorColors[row.vendor] }} />
                            {row.vendor}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right font-mono text-[13px]">{row.share_2025_pct}%</TableCell>
                        <TableCell className="py-4 text-right font-mono text-[13px]">{row.growth_2025_pct}%</TableCell>
                        <TableCell className="py-4 pr-0 text-right font-mono text-[13px]">
                          {row.share_change_pp > 0 ? '+' : ''}{row.share_change_pp} pts
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-0">
              <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
                <div>
                  <div className="mb-8">
                    <p className="text-sm text-neutral-500">Quarterly Mac net sales</p>
                    <h3 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
                      Revenue accelerated in FY26 Q3.
                    </h3>
                  </div>
                  <div className="h-[390px] w-full">
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 720, height: 390 }}>
                      <LineChart data={forecastChartData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#eeeeee" />
                        <XAxis
                          dataKey="period"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#8a8a8a', fontSize: 12 }}
                        />
                        <YAxis
                          domain={[5, 12]}
                          axisLine={false}
                          tickLine={false}
                          width={52}
                          tick={{ fill: '#8a8a8a', fontSize: 12 }}
                          tickFormatter={(value) => `$${value}B`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            borderColor: '#e5e5e5',
                            boxShadow: '0 8px 24px rgba(0,0,0,.06)',
                          }}
                          formatter={(value, name) => [
                            value == null ? '—' : money(Number(value)),
                            name === 'actual' ? 'Actual' : 'Forecast',
                          ]}
                        />
                        <ReferenceLine x="26 Q3" stroke="#c9c9c9" strokeDasharray="4 4" />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke={appleBlue}
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="forecast"
                          stroke="#676767"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 4, fill: '#676767' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border-t border-neutral-950 pt-5 lg:mt-[78px]">
                  <p className="text-sm font-medium">FY26 Q4 forecast</p>
                  <p className="mt-4 text-5xl font-medium tracking-[-0.06em]">
                    {money(analysis.forecast.point)}
                  </p>
                  <p className="mt-3 text-sm text-neutral-500">
                    80% range {money(analysis.forecast.lower80)}–{money(analysis.forecast.upper80)}
                  </p>
                  <div className="mt-8 border-t border-neutral-200 pt-5">
                    <p className="text-sm font-medium">Model selection</p>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      {analysis.forecast.model} produced the lowest walk-forward RMSE.
                    </p>
                    <div className="mt-5 space-y-3">
                      {analysis.forecast.models.map((model) => (
                        <div key={model.model} className="flex justify-between gap-4 text-sm">
                          <span className="text-neutral-600">{model.model}</span>
                          <span className="font-mono text-[13px] text-neutral-500">{model.rmse}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-8 border-l-2 border-neutral-300 pl-4 text-sm leading-6 text-neutral-500">
                    Apple reports Mac category revenue, not standalone MacBook Pro sales. The
                    forecast is a model estimate, not company guidance.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="product" className="mt-0">
              <ValueComparison />
              <div className="mb-8 max-w-3xl">
                <p className="text-sm text-neutral-500">Premium professional notebooks</p>
                <h3 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
                  MacBook Pro competes on the complete package.
                </h3>
                <p className="mt-3 text-base leading-7 text-neutral-600">
                  Its advantage combines performance, display, battery life, and ecosystem—not
                  dominance in every individual specification.
                </p>
              </div>
              <div className="overflow-x-auto border-t border-neutral-200 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neutral-200 hover:bg-transparent">
                      <TableHead className="min-w-64 pl-0 text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Product</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Position</TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Max family memory</TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Display</TableHead>
                      <TableHead className="min-w-80 pr-0 text-xs font-medium uppercase tracking-[0.1em] text-neutral-400">Strategic read</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.products.map((product) => (
                      <TableRow key={product.vendor} className="border-neutral-200 hover:bg-neutral-50/60">
                        <TableCell className="pl-0 py-5">
                          <p className="font-medium text-neutral-900">{product.vendor}</p>
                          <p className="mt-1 text-sm text-neutral-500">{product.model}</p>
                        </TableCell>
                        <TableCell className="py-5 text-sm text-neutral-600">{product.segment}</TableCell>
                        <TableCell className="py-5 text-right font-mono text-[13px]">
                          {product.max_memory_gb ? `${product.max_memory_gb} GB` : '—'}
                        </TableCell>
                        <TableCell className="py-5 text-right font-mono text-[13px]">
                          {product.display_peak_nits ? `${product.display_peak_nits} nits` : '—'}
                        </TableCell>
                        <TableCell className="py-5 pr-0 text-sm leading-6 text-neutral-600">
                          {product.positioning_note}{' '}
                          <a
                            href={product.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-blue-700 hover:text-blue-900"
                            aria-label={`${product.vendor} product source`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex max-w-3xl gap-3 text-sm leading-6 text-neutral-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Missing values remain blank rather than mixing incomparable configurations.
                  Battery hours and watt-hours are not treated as equivalent.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="border-t border-neutral-200 py-20 sm:py-28" id="model">
          <SectionIntro
            number="02 / Scenario"
            title="Test the conclusion."
            description="Change the assumptions or decide how much each signal should matter. The strength score updates immediately."
          />

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/60">
            <div className="grid border-b border-neutral-200 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-neutral-200 p-7 sm:p-9 lg:border-b-0 lg:border-r">
                <p className="text-sm text-neutral-500">Current score</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-7xl font-medium tracking-[-0.075em]">{strengthScore}</span>
                  <span className="text-sm text-neutral-400">/ 100</span>
                </div>
                <p className="mt-3 text-lg font-medium">{verdict}</p>
                <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-600">
                  Premium positioning and recent Mac revenue momentum lift the result. Greater
                  emphasis on unit scale lowers it.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetModel}
                  className="mt-8 -ml-3 rounded-full text-neutral-500 hover:text-neutral-950"
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> Reset base case
                </Button>
              </div>

              <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-2">
                <div className="space-y-6">
                  <p className="text-sm font-medium text-neutral-950">Operating assumptions</p>
                  <ModelControl
                    label="Annual share change"
                    value={shareChange}
                    minimum={-1.5}
                    maximum={2}
                    step={0.1}
                    minLabel="-1.5 pts"
                    maxLabel="+2.0 pts"
                    onChange={setShareChange}
                  />
                  <ModelControl
                    label="Mac revenue growth"
                    value={macGrowth}
                    minimum={-20}
                    maximum={40}
                    step={1}
                    minLabel="-20%"
                    maxLabel="+40%"
                    onChange={setMacGrowth}
                  />
                  <ModelControl
                    label="Premium feature score"
                    value={productScore}
                    minimum={50}
                    maximum={100}
                    step={1}
                    minLabel="50"
                    maxLabel="100"
                    onChange={setProductScore}
                  />
                </div>

                <div className="space-y-6">
                  <p className="text-sm font-medium text-neutral-950">Signal weights</p>
                  <p className="text-xs leading-5 text-neutral-500">Relative weights are normalized to their total. Set at least one above zero.</p>
                  {adjustedComponents.map((component) => (
                    <ModelControl
                      key={component.key}
                      label={component.label}
                      value={weights[component.key]}
                      minimum={0}
                      maximum={50}
                      step={5}
                      minLabel="0%"
                      maxLabel="50%"
                      onChange={(value) =>
                        setWeights((current) => ({ ...current, [component.key]: value }))
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-neutral-200 sm:grid-cols-5">
              {adjustedComponents.map((component) => (
                <div key={component.key} className="bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-neutral-500">{component.label}</span>
                    <span className="font-mono text-xs text-neutral-700">{component.score}</span>
                  </div>
                  <div className="mt-4 h-1 bg-neutral-100">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${component.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 py-20 sm:py-28" id="evidence">
          <SectionIntro
            number="03 / Sources"
            title="Built to be checked."
            description="Public data, explicit assumptions, validation metrics, and visible limitations make every conclusion traceable."
          />

          <div className="grid gap-14 md:grid-cols-2 md:gap-20">
            <div>
              <p className="border-b border-neutral-950 pb-4 text-sm font-medium">Source register</p>
              <div>
                {analysis.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-4 border-b border-neutral-200 py-5"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-blue-700">
                        {source.label}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-neutral-500">{source.use}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-blue-700" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="border-b border-neutral-950 pb-4 text-sm font-medium">Methods used</p>
              <ul className="divide-y divide-neutral-200">
                {[
                  'SQL ranking and feature engineering',
                  'Python, pandas, and NumPy analysis',
                  'Walk-forward forecast validation',
                  'Scenario and sensitivity analysis',
                  'Executive data storytelling',
                ].map((item, index) => (
                  <li key={item} className="flex gap-5 py-5 text-sm text-neutral-700">
                    <span className="font-mono text-xs text-neutral-400">0{index + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-l-2 border-neutral-300 pl-4 text-sm leading-6 text-neutral-500">
                Vendor shipments are third-party estimates. Apple reports Mac category revenue,
                not MacBook Pro revenue or units.
                {' '}The product score uses selected feature thresholds, not independent benchmarks.
              </p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-neutral-200 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Independent portfolio analysis by Rodolfo Landeros</p>
          <p>Public information · Not investment advice</p>
        </footer>
      </div>
    </main>
  );
}
