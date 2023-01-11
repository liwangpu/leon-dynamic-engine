import * as shortid from 'shortid';

(shortid as any).characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$');

export function GenerateShortId(): string {
  return `_${(shortid as any).generate()}`.replace(/-/g, '_').replace(/\$/g, '_');
}