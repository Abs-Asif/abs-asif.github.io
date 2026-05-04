
import { describe, it, expect } from 'vitest';
import {
  multiLayerCompressAndEncrypt,
  multiLayerDecryptAndDecompress,
  compressAndEncryptForUrl,
  getMultiLayerDecryptionSteps
} from '../lib/encryption';

describe('Multi-layer Encryption', () => {
  it('should add 001 prefix for level 1 encryption', () => {
    const text = "Hello World";
    const encrypted = multiLayerCompressAndEncrypt(text);
    expect(encrypted.startsWith("001")).toBe(true);

    const decrypted = multiLayerDecryptAndDecompress(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should handle multi-layer encryption for long texts', () => {
    const longText = "This is a very repetitive long text. ".repeat(1000);
    const encrypted = multiLayerCompressAndEncrypt(longText);

    expect(encrypted.match(/^\d{3}/)).toBeTruthy();

    const levelStr = encrypted.substring(0, 3);
    console.log(`Encrypted long text to level: ${levelStr}, length: ${encrypted.length}`);

    const decrypted = multiLayerDecryptAndDecompress(encrypted);
    expect(decrypted).toBe(longText);
  });

  it('should fallback to single layer decryption for legacy URLs', () => {
    const text = "Legacy Text";
    const actualLegacy = compressAndEncryptForUrl(text);

    const decrypted = multiLayerDecryptAndDecompress(actualLegacy);
    expect(decrypted).toBe(text);
  });

  it('should correctly decrypt a manually simulated level 002', () => {
    const text = "Double Encrypted";
    const level1Data = multiLayerCompressAndEncrypt(text); // Starts with 001

    const level2Data = "002" + compressAndEncryptForUrl(level1Data);

    const decrypted = multiLayerDecryptAndDecompress(level2Data);
    expect(decrypted).toBe(text);
  });

  it('should return decryption steps for inspection', () => {
    const text = "Inspect Me";
    const encrypted = multiLayerCompressAndEncrypt(text);
    const steps = getMultiLayerDecryptionSteps(encrypted);

    expect(steps.length).toBeGreaterThanOrEqual(1);
    expect(steps[steps.length - 1].decrypted).toBe(text);
    expect(steps[0].level).toBeGreaterThanOrEqual(1);
  });

  it('should handle full URL in getMultiLayerDecryptionSteps', () => {
    const text = "URL Test";
    const encrypted = multiLayerCompressAndEncrypt(text);
    const fullUrl = `https://abdullah.ami.bd/letter?${encodeURIComponent(encrypted)}`;

    const steps = getMultiLayerDecryptionSteps(fullUrl);
    expect(steps.length).toBeGreaterThanOrEqual(1);
    expect(steps[steps.length - 1].decrypted).toBe(text);
  });
});
