import titleConfig, { TitleConfig } from '../config/titles';

/**
 * Parses a hostname to extract the subdomain
 * @param hostname The full hostname (e.g., 'muse.ab2.observer')
 * @returns The subdomain part of the URL or null if on main domain
 */
export function parseSubdomain(hostname: string): string | null {
  // Extract subdomain pattern
  // For example, from "muse.ab2.observer" we want to extract "muse"
  const hostParts = hostname.split('.');

  // No subdomain if we don't have enough parts (e.g., "ab2.observer")
  if (hostParts.length < 3) {
    return null;
  }

  // Return the first part as the subdomain
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