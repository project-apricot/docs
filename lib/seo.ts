export const SITE_URL = 'https://projectapricot.dev';
export const SITE_NAME = 'Apricot Framework';

export function absolute(path: string): string {
  return new URL(path, SITE_URL).toString();
}
