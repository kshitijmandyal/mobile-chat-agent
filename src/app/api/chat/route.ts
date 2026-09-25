import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { getChatService } from '@/server/container';
import { InvalidRequestError } from '@/server/domain/errors';
import { errorResponse } from '@/server/http/errorResponse';
import { toChatResponseDto } from '@/server/mappers/phoneDtoMapper';
import type { ChatResponseDto } from '@/shared/contract';

export const runtime = 'nodejs';

// Length is checked after normalisation in the service, so this only rules out
// bodies that are obviously wrong before any work is done.
const ChatRequestSchema = z.object({ message: z.string().max(5_000) });

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => {
      throw new InvalidRequestError('Request body must be JSON.');
    });
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) throw new InvalidRequestError('Request body must be { "message": string }.');

    const answer = await getChatService().answer(parsed.data.message);
    return NextResponse.json<ChatResponseDto>(toChatResponseDto(answer));
  } catch (error) {
    return errorResponse(error);
  }
}
