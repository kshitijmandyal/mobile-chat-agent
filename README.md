# Mobile Chat Assistant

Tell it what you want from a phone, in your own words, and get options from a
catalog of 670 phones and tablets across 18 brands, with a short explanation from
Claude of why they fit.

"Best camera under 30k", "lightest phones", "compare Galaxy S24 and iPhone 16",
"long battery life, not Samsung" all work.

**Live:** https://smartphone-chat-agent.vercel.app

---

## Running it

You need Node 22+ and an [Anthropic API key](https://console.anthropic.com/settings/keys).

```bash
cp .env.example .env.local     # then put your key in it
npm install
npm run dev
```

Open http://localhost:3000.

To see a chat turn run with no server and no key, against fakes for Claude:

```bash
npm run try
```

---

## How it fits together

```
src/
├── app/            Next.js routes. /api/chat parses the body and calls the service.
├── server/
│   ├── domain/     Phone, SearchCriteria, search. Plain TypeScript, no dependencies.
│   ├── services/   One chat turn, start to finish. Depends only on interfaces.
│   ├── guardrails/ What goes into a prompt, and what's allowed out of one.
│   ├── adapters/   Claude, and the CSV catalog.
│   ├── mappers/    CSV rows to phones, phones to the API contract.
│   └── container   The one place adapters are wired to interfaces.
├── client/         api/ owns every URL, store/ is Redux Toolkit, hooks/ and
│                   containers/ hold logic, components/ only render.
└── shared/         The API contract, the only code both sides import.
```

Dependencies point inwards, and that's enforced rather than documented:
`npm run lint:deps` fails if `domain/` or `services/` import an SDK, a framework
or the filesystem, or if the client imports server code.

---

## A chat turn

1. **Extract.** Claude reads the message and fills a fixed schema: budget, brands
   to include or exclude, sort order, year, phones to compare. This is constrained
   decoding, so nothing parses prose.
2. **Clamp.** Code checks every field against the catalog. A brand that doesn't
   exist is dropped; so is a budget of ₹3.
3. **Search.** Plain, deterministic code picks the phones. Every card on screen
   comes from here, never from the model.
4. **Explain.** Claude writes two to four sentences about those phones, and lists
   the ones it mentioned.
5. **Verify.** Code checks the reply only mentions phones that were shown, whether
   by id or by name in the prose. If it names anything else, the reply is replaced
   with a plain summary of the results.

The shopper's message reaches both prompts escaped, inside tags the prompt says
to treat as data. That helps, but it isn't what the app relies on: steps 2 and 5
are code, and no model output can argue with them.

---

## Some decisions worth knowing

**No keyword blocklist.** The old version refused anything containing "worst",
"hate" or "token", so "which has the worst battery?" was treated as an attack.
Off-topic messages are now judged by the extractor, and injection is handled by
the steps above.

**One card per phone, not per storage size.** The dataset has a row per storage
variant. Rows are grouped by brand, model and launch year, and the variants
become the price range and memory options.

**Tablets are separate.** The dataset mixes in 65 tablets. They only show
up when a tablet is asked for.

**The data is launch data.** Prices are Indian launch prices from the dataset, and
the reply says so. There's no OS column, so OS comes from the brand.

---

## Deploying

It's one Next.js app, so it's one Vercel project. Set `ANTHROPIC_API_KEY` in the
project's environment variables. The catalog CSV ships with the function.

---

Data: the "Mobiles Dataset (2025)" from Kaggle.
