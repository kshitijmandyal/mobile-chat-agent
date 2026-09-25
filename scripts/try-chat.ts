/**
 * Runs chat turns through the real service, catalog and guardrails, with Claude
 * swapped for fakes. No Next server, no API key, no network.
 *
 *   npm run try
 */
import { CsvPhoneCatalog } from '@/server/adapters/csvPhoneCatalog';
import { CATALOG_FILE } from '@/server/constants/catalog';
import type { RawCriteria } from '@/server/domain/searchCriteria';
import type { DraftReply, ExtractedIntent, IntentExtractor, Logger, ReplyRequest, ReplyWriter } from '@/server/interfaces';
import { logger } from '@/server/logging';
import { ChatService } from '@/server/services/chatService';

const BASE: RawCriteria = {
  mode: 'recommend',
  maxPriceInr: null,
  minPriceInr: null,
  includeBrands: [],
  excludeBrands: [],
  os: null,
  deviceType: 'phone',
  launchYear: null,
  sortBy: 'newest',
  compareModels: [],
};

/** Returns whatever intent the scenario scripted, the way Claude would have. */
class ScriptedExtractor implements IntentExtractor {
  constructor(private readonly intent: ExtractedIntent) {}
  async extract(): Promise<ExtractedIntent> {
    return this.intent;
  }
}

/** Writes a reply naming the shown phones, or a scripted bad one to exercise the verifier. */
class ScriptedWriter implements ReplyWriter {
  constructor(private readonly override?: (request: ReplyRequest) => DraftReply) {}
  async write(request: ReplyRequest): Promise<DraftReply> {
    if (this.override) return this.override(request);
    const [first] = request.phones;
    return { text: `The ${first?.name} stands out on paper.`, citedPhoneIds: first ? [first.id] : [] };
  }
}

const quiet: Logger = { info: () => {}, warn: (e, f) => logger.warn(e, f), error: (e, f) => logger.error(e, f) };
const catalog = new CsvPhoneCatalog(CATALOG_FILE, logger);

const scenarios: Array<{ label: string; intent: ExtractedIntent; writer?: ScriptedWriter }> = [
  { label: 'budget under 1,00,000, camera first', intent: { onTopic: true, criteria: { ...BASE, maxPriceInr: 100000, sortBy: 'camera' } } },
  { label: 'best cameras other than iPhone', intent: { onTopic: true, criteria: { ...BASE, excludeBrands: ['iphone'], sortBy: 'camera' } } },
  { label: 'lightest phones', intent: { onTopic: true, criteria: { ...BASE, sortBy: 'lightest' } } },
  { label: 'Google phones (unknown to old code)', intent: { onTopic: true, criteria: { ...BASE, includeBrands: ['Google'] } } },
  { label: 'latest iPhones', intent: { onTopic: true, criteria: { ...BASE, includeBrands: ['Apple'] } } },
  { label: 'tablets under 50k', intent: { onTopic: true, criteria: { ...BASE, deviceType: 'tablet', maxPriceInr: 50000 } } },
  {
    label: 'compare iPhone 16 vs Galaxy S24 vs Nokia 9999',
    intent: { onTopic: true, criteria: { ...BASE, mode: 'compare', compareModels: ['Apple iPhone 16', 'Samsung Galaxy S24', 'Nokia 9999'] } },
  },
  { label: 'budget of ₹3 is clamped away', intent: { onTopic: true, criteria: { ...BASE, maxPriceInr: 3, includeBrands: ['Nonexistent'] } } },
  { label: 'nothing matches', intent: { onTopic: true, criteria: { ...BASE, maxPriceInr: 2000 } } },
  { label: 'off topic', intent: { onTopic: false } },
  {
    label: 'verifier: cites a phone that was not shown',
    intent: { onTopic: true, criteria: { ...BASE, includeBrands: ['Samsung'] } },
    writer: new ScriptedWriter(() => ({ text: 'Try the Galaxy S24.', citedPhoneIds: ['made-up-id'] })),
  },
  {
    label: 'verifier: names an unshown phone in prose',
    intent: { onTopic: true, criteria: { ...BASE, includeBrands: ['Google'] } },
    writer: new ScriptedWriter((r) => ({ text: `The ${r.phones[0]?.name} beats the iPhone 15 Pro Max.`, citedPhoneIds: [] })),
  },
  {
    label: 'verifier: strips markdown and links',
    intent: { onTopic: true, criteria: { ...BASE, includeBrands: ['OnePlus'] } },
    writer: new ScriptedWriter((r) => ({ text: `**${r.phones[0]?.name}** is great, see https://example.com`, citedPhoneIds: [] })),
  },
];

async function main(): Promise<void> {
  for (const scenario of scenarios) {
    const service = new ChatService({
      catalog,
      extractor: new ScriptedExtractor(scenario.intent),
      writer: scenario.writer ?? new ScriptedWriter(),
      logger: quiet,
    });
    const answer = await service.answer('scripted');
    console.log(`\n# ${scenario.label}  [${answer.mode}]`);
    console.log(`  reply: ${answer.reply}`);
    for (const phone of answer.phones) {
      const price = phone.priceMinInr === phone.priceMaxInr ? `${phone.priceMinInr}` : `${phone.priceMinInr}-${phone.priceMaxInr}`;
      const tags = answer.highlights.get(phone.id)?.join(', ') ?? '';
      console.log(
        `  - ${phone.name} (${phone.launchYear}, ${phone.os}, ₹${price}, ${phone.primaryCameraMp}MP, ${phone.batteryMah}mAh, ${phone.weightGrams}g, variants ${phone.variants.length}) ${tags}`,
      );
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
