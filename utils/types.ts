export type Phone = {
  id?: string | number;
  brand: string;
  model: string;
  price?: number; // in INR if available
  display?: string; // e.g., 6.7" AMOLED 120Hz
  primaryCamera?: number; // MP
  battery?: number; // mAh
  features: string[];
  os?: string;
  chipset?: string;
  ram?: string;
  storage?: string;
  weight?: string;
  releaseDate?: string;
  releaseYear?: number;
  dimensions?: string;
  charging?: string; // e.g., 80W fast, wireless
  ipRating?: string;
  network?: string; // 5G bands info
};

export type GetMobilesOptions = {
  forceRefresh?: boolean;
  limitPerBrand?: number;
  maxBrands?: number;
};
