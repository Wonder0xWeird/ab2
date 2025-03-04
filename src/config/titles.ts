// src/config/titles.ts
export interface TitleConfig {
  letter: string;
  title: string;
  tagline: string;
  color?: string;
}

export interface TitleConfigMap {
  [subdomain: string]: TitleConfig;
}

const titleConfig: TitleConfigMap = {
  // Default title for the main domain
  default: {
    letter: "A",
    title: "ABSTRACTU",
    tagline: "Abstraction to abstraction, Ab2 is.",
    color: "#cc9c42" // Gold
  },
  // Title for muse subdomain
  muse: {
    letter: "M",
    title: "MUSE",
    tagline: "Hmmm...",
    color: "#cc9c42" // Gold
  },
  // Title for future observer subdomain
  observer: {
    letter: "O",
    title: "OBSERVER",
    tagline: "Watching the watchers watch.",
    color: "#e0e0e0" // Light gray
  },
  // Add more subdomains as needed
};

export default titleConfig; 