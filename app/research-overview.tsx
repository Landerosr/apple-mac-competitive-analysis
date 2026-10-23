export default function ResearchOverview() {
  return <section id="research" aria-labelledby="research-title" className="border-b border-neutral-200 py-12 sm:py-16">
    <p className="text-sm font-medium text-blue-700">Original research · 2021–2023</p>
    <h1 id="research-title" className="mt-4 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">MacBook Pro through the Apple Silicon transition.</h1>
    <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">I compared MacBook Pro products with competing laptops available during 2021–2023, considering performance improvements, competitive positioning and potential financial and equity-performance implications.</p>
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-neutral-50 p-6">
        <h2 className="text-xl font-medium">Product thesis</h2>
        <p className="mt-3 leading-7 text-neutral-600">Better performance and power efficiency could support demand and investor expectations. Apple announced the transition in 2020, followed by M1 Pro / Max MacBook Pros in 2021 and M2 Pro / Max models in January 2023. Manufacturer performance claims are not independent benchmark results.</p>
      </div>
      <div className="rounded-2xl bg-neutral-50 p-6">
        <h2 className="text-xl font-medium">Financial context</h2>
        <p className="mt-3 leading-7 text-neutral-600">Mac net sales were $35.190B in FY2021, $40.177B in FY2022 and $29.357B in FY2023. These category totals do not isolate MacBook Pro or the impact of Apple Silicon. Product improvements did not coincide with uninterrupted sales growth.</p>
      </div>
    </div>
    <p className="mt-6 max-w-4xl text-sm leading-6 text-neutral-600"><strong>Evidence limits:</strong> The original competitor configurations, benchmark observations and stock-return dataset are not included here. The equity relationship is a thesis, not a measured correlation or proof that Apple Silicon caused stock gains. This research does not claim a DCF, comparable-company valuation or revenue forecast.</p>
    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-700 underline underline-offset-4">
      <a href="https://github.com/Landerosr/apple-mac-competitive-analysis/blob/main/RESEARCH-2021-2023.md">Research scope and limitations</a>
      <a href="https://www.apple.com/newsroom/2020/06/apple-announces-mac-transition-to-apple-silicon/">2020 transition</a>
      <a href="https://www.apple.com/newsroom/2021/10/apple-unveils-game-changing-macbook-pro/">2021 MacBook Pro</a>
      <a href="https://www.apple.com/newsroom/2023/01/apple-unveils-macbook-pro-featuring-m2-pro-and-m2-max/">2023 MacBook Pro</a>
      <a href="https://www.sec.gov/Archives/edgar/data/320193/000032019323000106/aapl-20230930.htm">Apple FY2023 Form 10-K</a>
    </div>
    <p className="mt-8 border-t border-neutral-200 pt-5 text-sm leading-6 text-neutral-500">Below: later 2025–2026 portfolio extensions. The buying guide, third-party teardown, market dashboard and forecasting model are separate from the original 2021–2023 research.</p>
  </section>;
}
