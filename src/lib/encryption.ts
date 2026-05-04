import LZString from "lz-string";

const ENCRYPTION_KEY = "identity-info-secure-key-2025";

const toUrlSafe = (base64: string) => base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromUrlSafe = (urlSafe: string) => {
  let base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return base64;
};

const uint8ArrayToBinaryString = (arr: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return binary;
};

const binaryStringToUint8Array = (bin: string): Uint8Array => {
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
};

const xorTransform = (data: Uint8Array): Uint8Array => {
  const key = new TextEncoder().encode(ENCRYPTION_KEY);
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return result;
};

/**
 * Encrypts a string using XOR and returns a URL-safe Base64 encoded string.
 * This is meant to make the source code unreadable for humans.
 */
export const encrypt = (text: string): string => {
  if (!text) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const encrypted = xorTransform(data);
  return toUrlSafe(btoa(uint8ArrayToBinaryString(encrypted)));
};

/**
 * Decrypts a URL-safe or standard Base64 encoded XOR encrypted string.
 */
export const decrypt = (base64: string): string => {
  if (!base64) return "";
  try {
    const binary = atob(fromUrlSafe(base64));
    const encrypted = binaryStringToUint8Array(binary);
    const decrypted = xorTransform(encrypted);
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
};

/**
 * Multi-layer encryption that attempts to reduce URL length by recursively
 * compressing and encrypting. Moves to level 2 if level 1 exceeds 100 characters.
 * Prefixes with a 3-digit level indicator (001, 002, ...).
 */
export const multiLayerCompressAndEncrypt = (text: string): string => {
  if (!text) return "";

  let level = 1;
  let data = compressAndEncryptForUrl(text);
  let current = "001" + data;

  if (current.length > 100) {
    // Try to move to higher levels if it helps or if we need to move to at least level 2
    for (let nextLevel = 2; nextLevel <= 5; nextLevel++) {
      const nextData = compressAndEncryptForUrl(current);
      const nextCurrent = nextLevel.toString().padStart(3, '0') + nextData;

      // Move to level 2 anyway if level 1 was > 100,
      // otherwise only move if it's shorter.
      if (nextLevel === 2 || nextCurrent.length < current.length) {
        current = nextCurrent;
        level = nextLevel;
        if (current.length <= 100) break;
      } else {
        break;
      }
    }
  }

  return current;
};

/**
 * Multi-layer decryption that recursively decrypts based on the 3-digit prefix.
 */
export const multiLayerDecryptAndDecompress = (hash: string): string => {
  if (!hash) return "";

  // Check if it has the 3-digit prefix
  const prefixMatch = hash.match(/^\d{3}/);
  if (!prefixMatch) {
    // Fallback for legacy URLs without prefix
    return decryptAndDecompressFromUrl(hash);
  }

  let currentHash = hash;
  // Safety limit to prevent infinite loops
  for (let i = 0; i < 10; i++) {
    const levelStr = currentHash.substring(0, 3);
    const level = parseInt(levelStr);
    const data = currentHash.substring(3);

    if (isNaN(level)) {
       return decryptAndDecompressFromUrl(currentHash);
    }

    const decrypted = decryptAndDecompressFromUrl(data);
    if (!decrypted) return "";

    if (level === 1) {
      return decrypted;
    }

    currentHash = decrypted;
    // If the decrypted content of level > 1 doesn't have a prefix, it might be raw data
    if (!currentHash.match(/^\d{3}/)) {
      return currentHash;
    }
  }

  return "";
};

/**
 * Returns the steps of decryption for inspection.
 */
export const getMultiLayerDecryptionSteps = (hash: string): { level: number; data: string; decrypted: string }[] => {
  const steps: { level: number; data: string; decrypted: string }[] = [];
  if (!hash) return steps;

  // Normalize hash: if it's a full URL, extract the query part
  let currentHash = hash;
  if (hash.includes('?')) {
    const parts = hash.split('?');
    currentHash = decodeURIComponent(parts[parts.length - 1]);
  }

  const prefixMatch = currentHash.match(/^\d{3}/);
  if (!prefixMatch) {
    const decrypted = decryptAndDecompressFromUrl(currentHash);
    if (decrypted) {
      steps.push({ level: 0, data: currentHash, decrypted });
    }
    return steps;
  }

  for (let i = 0; i < 10; i++) {
    const levelStr = currentHash.substring(0, 3);
    const level = parseInt(levelStr);
    const data = currentHash.substring(3);

    if (isNaN(level)) break;

    const decrypted = decryptAndDecompressFromUrl(data);
    if (!decrypted) break;

    steps.push({ level, data, decrypted });

    if (level === 1) break;

    currentHash = decrypted;
    if (!currentHash.match(/^\d{3}/)) break;
  }

  return steps;
};

/**
 * Compresses and encrypts text for URL usage.
 */
export const compressAndEncryptForUrl = (text: string): string => {
  if (!text) return "";
  const compressed = LZString.compressToUint8Array(text);
  const encrypted = xorTransform(compressed);
  return toUrlSafe(btoa(uint8ArrayToBinaryString(encrypted)));
};

/**
 * Decrypts and decompresses text from URL.
 * Supports both new (Uint8Array) and old (EncodedURIComponent) formats.
 */
export const decryptAndDecompressFromUrl = (hash: string): string => {
  if (!hash) return "";
  try {
    const binary = atob(fromUrlSafe(hash));
    const encrypted = binaryStringToUint8Array(binary);
    const decryptedBytes = xorTransform(encrypted);

    // Try decompressing as Uint8Array (new format)
    try {
      const decompressed = LZString.decompressFromUint8Array(decryptedBytes);
      if (decompressed !== null && decompressed !== "") return decompressed;
    } catch (e) {
      // ignore and try next
    }

    // Fallback: try decompressing as EncodedURIComponent (old format)
    try {
      const decryptedString = uint8ArrayToBinaryString(decryptedBytes);
      const decompressedOld = LZString.decompressFromEncodedURIComponent(decryptedString);
      if (decompressedOld !== null && decompressedOld !== "") return decompressedOld;
    } catch (e) {
      // ignore
    }

    return "";
  } catch (error) {
    return "";
  }
};
