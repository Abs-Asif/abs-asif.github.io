
import { describe, it, expect } from 'vitest';

// Simulating the rendering logic from NewsHighlighter.tsx
function renderHighlightedText(highlightedText: string | undefined) {
  if (!highlightedText) return [];
  return highlightedText.split(/(\*.*?\*)/g).map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return { text: part, highlighted: true };
    }
    return { text: part, highlighted: false };
  });
}

describe('NewsHighlighter Rendering Logic', () => {
  it('should correctly identify highlighted segments in English', () => {
    const input = "This is a *test* of the *highlight* system.";
    const result = renderHighlightedText(input);
    expect(result).toEqual([
      { text: "This is a ", highlighted: false },
      { text: "*test*", highlighted: true },
      { text: " of the ", highlighted: false },
      { text: "*highlight*", highlighted: true },
      { text: " system.", highlighted: false },
    ]);
  });

  it('should handle Bangla text with conjuncts correctly', () => {
    // "বাংলাদেশ একটি সুন্দর দেশ" (Bangladesh is a beautiful country)
    // "বাংলাদেশ" has conjunct 'ন্দ' (n+d)
    const input = "*বাংলাদেশ* একটি *সুন্দর* দেশ";
    const result = renderHighlightedText(input);
    expect(result).toEqual([
      { text: "", highlighted: false },
      { text: "*বাংলাদেশ*", highlighted: true },
      { text: " একটি ", highlighted: false },
      { text: "*সুন্দর*", highlighted: true },
      { text: " দেশ", highlighted: false },
    ]);
  });

  it('should not swallow characters between markers', () => {
    const input = "*word1**word2*";
    const result = renderHighlightedText(input);
    expect(result).toEqual([
      { text: "", highlighted: false },
      { text: "*word1*", highlighted: true },
      { text: "", highlighted: false },
      { text: "*word2*", highlighted: true },
      { text: "", highlighted: false },
    ]);
  });

  it('should handle text without highlights', () => {
    const input = "Just some regular text";
    const result = renderHighlightedText(input);
    expect(result).toEqual([
      { text: "Just some regular text", highlighted: false },
    ]);
  });
});
