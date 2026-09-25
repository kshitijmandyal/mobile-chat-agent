import type { ChatResponseDto, PhoneDto } from '@/shared/contract';
import type { Phone } from '../domain/phone';
import type { ChatAnswer } from '../services/chatService';

export function toPhoneDto(phone: Phone, highlights: readonly string[] = []): PhoneDto {
  return {
    id: phone.id,
    name: phone.name,
    brand: phone.brand,
    os: phone.os,
    launchYear: phone.launchYear,
    priceMinInr: phone.priceMinInr,
    priceMaxInr: phone.priceMaxInr,
    storageOptions: uniqueValues(phone.variants.map((v) => v.storage)),
    ramOptions: uniqueValues(phone.variants.map((v) => v.ram)),
    processor: phone.processor,
    backCamera: phone.backCamera,
    frontCameraMp: phone.frontCameraMp,
    batteryMah: phone.batteryMah,
    screenInches: phone.screenInches,
    weightGrams: phone.weightGrams,
    highlights: [...highlights],
  };
}

export function toChatResponseDto(answer: ChatAnswer): ChatResponseDto {
  return {
    reply: answer.reply,
    mode: answer.mode,
    phones: answer.phones.map((phone) => toPhoneDto(phone, answer.highlights.get(phone.id))),
  };
}

/** Storage sorts by size, so "64GB, 128GB, 1TB" and not "128GB, 1TB, 64GB". */
function uniqueValues(values: ReadonlyArray<string | null>): string[] {
  const present = [...new Set(values.filter((v): v is string => v !== null))];
  return present.sort((a, b) => toGigabytes(a) - toGigabytes(b));
}

function toGigabytes(value: string): number {
  const match = value.match(/(\d+(?:\.\d+)?)\s*(GB|TB)/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const amount = Number.parseFloat(match[1]!);
  return match[2]!.toUpperCase() === 'TB' ? amount * 1024 : amount;
}
