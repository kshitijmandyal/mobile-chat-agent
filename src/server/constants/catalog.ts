/** The catalog file, inside data/ at the project root. */
export const CATALOG_FILE = 'phones.csv';

/** Column headers in data/phones.csv. */
export const CSV_COLUMNS = {
  brand: 'Company Name',
  model: 'Model Name',
  weight: 'Mobile Weight',
  ram: 'RAM',
  frontCamera: 'Front Camera',
  backCamera: 'Back Camera',
  processor: 'Processor',
  battery: 'Battery Capacity',
  screen: 'Screen Size',
  priceIndia: 'Launched Price (India)',
  year: 'Launched Year',
} as const;

/** Spellings of one brand that the dataset or a shopper might use, keyed lowercase. */
export const BRAND_ALIASES: Readonly<Record<string, string>> = {
  poco: 'POCO',
  iqoo: 'iQOO',
  oneplus: 'OnePlus',
  'one plus': 'OnePlus',
  iphone: 'Apple',
  ipad: 'Apple',
  pixel: 'Google',
  galaxy: 'Samsung',
  moto: 'Motorola',
};

/** Model names that mark a tablet. Screen size can't: foldables open to 7.6". */
export const TABLET_NAME_PATTERN = /\b(ipad|tab|pad)\b/i;
