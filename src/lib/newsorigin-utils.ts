import { useEffect, useState } from "react";

export function useDarkMode(options: { initialMode?: boolean | null } = { initialMode: null }) {
  const [darkMode, setDarkMode] = useState<boolean | null | undefined>(options.initialMode);

  useEffect(() => {
    const onColorSchemeChange = ({ matches }: MediaQueryListEvent) => setDarkMode(matches);
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    matchMedia.addEventListener("change", onColorSchemeChange);
    setDarkMode(matchMedia.matches); // set initial state

    return () => matchMedia.removeEventListener("change", onColorSchemeChange);
  }, []);

  return darkMode;
}

// We will use a more robust way to get the API URL
export const getApiUrl = (path: string) => {
  // If running on local dev or Vercel, use relative path
  // In a real scenario, you might want to hardcode the Vercel URL here if deploying to GitHub Pages
  // for the API part to work.
  const isGitHubPages = window.location.hostname.includes("github.io") || window.location.hostname.includes("abdullah.ami.bd");

  if (isGitHubPages) {
      // Replace with your actual Vercel deployment URL where the /api resides
      return `https://every-origin-ecru.vercel.app${path}`;
  }

  return path;
};
