import { describe, it, expect, vi } from 'vitest';
import { parseMarkdownHighlights, normalizeWord, TRANSFORMER_MODELS } from '../transformer';

describe('Transformer Helper Functions', () => {
  it('should normalize words by removing punctuation and converting to lowercase', () => {
    expect(normalizeWord('ঢাকা,')).toBe('ঢাকা');
    expect(normalizeWord('"যানজট"')).toBe('যানজট');
    expect(normalizeWord('Headline!')).toBe('headline');
  });

  it('should correctly parse markdown ** highlights into word indices', () => {
    const title = 'ঢাকা শহরের যানজট নিরসনে নতুন ফ্লাইওভার উদ্বোধন করলেন প্রধানমন্ত্রী';
    const modelOutput = 'ঢাকা শহরের **যানজট নিরসনে** নতুন **ফ্লাইওভার** উদ্বোধন করলেন প্রধানমন্ত্রী';

    const indices = parseMarkdownHighlights(title, modelOutput);
    // 'যানজট' is index 2, 'নিরসনে' is index 3, 'ফ্লাইওভার' is index 5
    expect(indices).toEqual([2, 3, 5]);
  });

  it('should handle output with no markdown asterisks gracefully', () => {
    const title = 'ঢাকা শহরের যানজট নিরসনে নতুন ফ্লাইওভার';
    const modelOutput = 'ঢাকা শহরের যানজট নিরসনে নতুন ফ্লাইওভার';

    const indices = parseMarkdownHighlights(title, modelOutput);
    expect(indices).toEqual([]);
  });

  it('should handle empty or whitespace titles and outputs', () => {
    expect(parseMarkdownHighlights('', 'some output')).toEqual([]);
    expect(parseMarkdownHighlights('some title', '')).toEqual([]);
  });

  it('should contain valid medium range model definitions', () => {
    expect(TRANSFORMER_MODELS.length).toBeGreaterThan(0);
    const laMini = TRANSFORMER_MODELS.find(m => m.id === 'Xenova/LaMini-Flan-T5-248M');
    expect(laMini).toBeDefined();
    expect(laMini?.task).toBe('text2text-generation');
  });
});
