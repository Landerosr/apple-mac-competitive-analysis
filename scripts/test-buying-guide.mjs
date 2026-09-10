// Run with Node 22.13+ and --experimental-strip-types.
import assert from 'node:assert/strict';
import { decide, models } from '../lib/buying-guide.ts';
const base = { model: 'pro', budget: 2000, need: 'limited', workload: 'development', compatibility: 'yes', quote: '1600' };
assert.equal(decide(base).kind, 'buy');
assert.equal(decide({ ...base, quote: '' }).kind, 'check');
assert.equal(decide({ ...base, need: 'working' }).kind, 'wait');
assert.equal(decide({ ...base, budget: 1000 }).kind, 'wait');
assert.equal(decide({ ...base, compatibility: 'no' }).kind, 'check');
assert.equal(decide({ ...base, quote: '-1' }).price, null);
assert.equal(decide({ ...base, budget: NaN }).price, null);
assert.equal(decide({ ...base, model: 'air', workload: 'heavy' }).kind, 'check');
assert.equal(decide({ ...base, workload: 'everyday' }).kind, 'check');
assert.equal(decide({ ...base, quote: '1699' }).discount, 0);
assert(models.every(m => m.source.startsWith('https://www.apple.com/') && m.price > 0));
console.log('11 buying-guide checks passed');
