import { describe, it, expect } from 'vitest';
import { toBanglaDigit, formatBanglaDate } from '../renderer';

describe('Bangla Date Formatting', () => {
  it('should convert English digits to Bangla digits', () => {
    expect(toBanglaDigit('0123456789')).toBe('০১২৩৪৫৬৭৮৯');
    expect(toBanglaDigit(2026)).toBe('২০২৬');
    expect(toBanglaDigit(31)).toBe('৩১');
  });

  it('should format date string in Bangla style (e.g. ৩১ ডিসেম্বর ২০২৬)', () => {
    const testDate = new Date(2026, 11, 31); // 31 December 2026
    expect(formatBanglaDate(testDate)).toBe('৩১ ডিসেম্বর ২০২৬');
  });

  it('should format date with single digit day correctly', () => {
    const testDate = new Date(2026, 0, 5); // 5 January 2026
    expect(formatBanglaDate(testDate)).toBe('৫ জানুয়ারি ২০২৬');
  });

  it('should handle string date inputs correctly', () => {
    const formatted = formatBanglaDate('2026-12-31T00:00:00Z');
    expect(formatted).toContain('২০২৬');
    expect(formatted).toContain('ডিসেম্বর');
  });

  it('should handle invalid date string gracefully by returning original string', () => {
    const formatted = formatBanglaDate('invalid-date');
    expect(formatted).toBe('invalid-date');
  });
});
