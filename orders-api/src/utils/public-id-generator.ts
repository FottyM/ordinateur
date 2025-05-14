import { customAlphabet } from 'nanoid';

export const CLEAN_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_';

const nanoid = customAlphabet(CLEAN_ALPHABET, 11);

export function generatePublicId(prefix: string = 'ord'): string {
  return `${prefix}_${nanoid()}`;
}
