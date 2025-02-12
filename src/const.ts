import { randomUUID, RandomUUIDOptions, UUID } from 'crypto';

export function generateRandomUUID(options?: RandomUUIDOptions): UUID {
  return randomUUID(options);
}
