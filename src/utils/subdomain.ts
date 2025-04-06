import titleConfig, { TitleConfig } from '../config/titles';

/**
 * Parses a hostname to extract the subdomain, handling localhost cases.
 * @param hostname The full hostname (e.g., 'w.localhost:3000' or 'muse.ab2.observer')
 * @returns The subdomain part of the URL or null if on main domain
 */
export function parseSubdomain(hostname: string): string | null {
  // Remove port number if present (e.g., localhost:3000 -> localhost)
  const domain = hostname.includes(':') ? hostname.split(':')[0] : hostname;
  const hostParts = domain.split('.');

  // Handle localhost development case: e.g., w.localhost -> ['w', 'localhost'] (length 2)
  if (domain.includes('localhost')) {
    if (hostParts.length === 2 && hostParts[0] !== 'localhost') {
      return hostParts[0];
    }
    return null; // localhost itself or invalid format
  }

  // Handle production/standard domain case: e.g., w.ab2.observer -> ['w', 'ab2', 'observer'] (length 3)
  if (hostParts.length < 3) {
    return null; // Not enough parts for a subdomain on a non-localhost domain
  }

  // Assume the first part is the subdomain
  return hostParts[0];
}

/**
 * Gets the title configuration based on a subdomain
 * @param subdomain The subdomain to get configuration for
 * @returns Title configuration object
 */
export function getTitleConfigForSubdomain(subdomain: string | null): TitleConfig {
  // Default to the main config if no subdomain or subdomain not found in config
  if (!subdomain || !titleConfig[subdomain]) {
    return titleConfig.default;
  }

  // Return the title config for the subdomain
  return titleConfig[subdomain];
} 