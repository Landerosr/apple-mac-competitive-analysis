// Observed product facts and published prices, not generated sample data.
export const reviewed = '2026-09-10';
export const proSource = 'https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/';
export const airSource = 'https://www.apple.com/newsroom/2026/03/apple-introduces-the-new-macbook-air-with-m5/';
export const models = [
  { id: 'air', name: 'MacBook Air 13″', chip: 'M5', memory: 16, storage: 512, price: 1099, priceDate: '2026-03-03', release: '2026-03-11', releaseLabel: 'M5 Air available', source: airSource, shop: 'https://www.apple.com/shop/buy-mac/macbook-air', features: '13.6-inch Liquid Retina display · fanless · two Thunderbolt 4 ports', tradeoff: 'Lower published entry price and a fanless design. Check your actual workload before choosing a base configuration.' },
  { id: 'pro', name: 'MacBook Pro 14″', chip: 'M5', memory: 16, storage: 1024, price: 1699, priceDate: '2026-03-03', release: '2026-03-03', releaseLabel: '1TB starting configuration announced', source: proSource, shop: 'https://www.apple.com/shop/buy-mac/macbook-pro', features: 'Liquid Retina XDR display · HDMI · SDXC · 1TB starting SSD', tradeoff: 'The published $600 premium over Air includes twice the base storage and a different display/port package—not proof of proportionally faster performance.' },
  { id: 'pro-plus', name: 'MacBook Pro 14″', chip: 'M5 Pro', memory: 24, storage: 1024, price: 2199, priceDate: '2026-03-03', release: '2026-03-11', releaseLabel: 'M5 Pro models available', source: proSource, shop: 'https://www.apple.com/shop/buy-mac/macbook-pro', features: '15-core CPU / 16-core GPU · Thunderbolt 5 · Liquid Retina XDR', tradeoff: 'More included memory and a higher-tier chip. Validate sustained workloads and software support before paying the premium.' },
];
export type DecisionInput = { model: string; budget: number; need: string; workload: string; compatibility: string; quote: string };
export function decide(input: DecisionInput) {
  const model = models.find(m => m.id === input.model) ?? models[1];
  const hasQuote = input.quote.trim() !== '';
  const quote = Number(input.quote);
  if (!Number.isFinite(input.budget) || input.budget <= 0 || (hasQuote && (!Number.isFinite(quote) || quote <= 0))) return { title: 'Check your numbers', reason: 'Enter a positive budget and, if supplied, a positive quoted price.', kind: 'check', price: null, discount: null };
  const price = hasQuote ? quote : model.price;
  const discount = hasQuote ? (model.price - price) / model.price * 100 : null;
  const result = (title: string, reason: string, kind: string) => ({ title, reason, kind, price, discount });
  if (input.compatibility !== 'yes') return result('Check software before buying', 'Confirm that your required applications, plug-ins, games and GPU workflows run on this Mac. A hardware upgrade does not fix software incompatibility.', 'check');
  if (price > input.budget) return result('Wait or choose a lower-cost option', 'This configuration exceeds your budget at the selected price basis. Compare a lower-cost model or a verified refurbished offer; no future price cut is assumed.', 'wait');
  if (input.need === 'working') return result('Keep your current laptop for now', 'You said it still meets your needs. There is no demonstrated need to spend on a replacement today. Revisit when your workload, reliability or requirements change.', 'wait');
  if (input.workload === 'heavy' && input.model === 'air') return result('Compare a Pro configuration first', 'For sustained rendering or large local workloads, test the actual application and memory requirement. The base Air is not automatically the right fit just because it costs less.', 'check');
  if (input.workload === 'everyday' && input.model !== 'air') return result('Compare the lower-cost Air first', 'For everyday tasks, justify the extra spend through specific display, storage or connectivity needs. The published Air starting price is lower; this is not a like-for-like benchmark.', 'check');
  if (!hasQuote) return result('Buying may make sense—verify today’s price', 'Your stated need and budget support replacing your laptop, but this guide only has a dated published price. Confirm the exact configuration, current price and availability before buying.', 'check');
  return result('Buy now is reasonable for your needs', 'Your current laptop is limiting you, your software is compatible, and your quoted price fits your budget. This is a needs-based judgment—not a claim that this is the lowest price or that a refresh is not coming.', 'buy');
}
