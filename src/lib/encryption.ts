import LZString from "lz-string";

const ENCRYPTION_KEY = "identity-info-secure-key-2025";

/**
 * Encrypts a string using XOR and returns a Base64 encoded string.
 * This is meant to make the source code unreadable for humans.
 */
export const encrypt = (text: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const key = encoder.encode(ENCRYPTION_KEY);
  const encrypted = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length];
  }

  let binary = "";
  const len = encrypted.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(encrypted[i]);
  }
  return btoa(binary);
};

/**
 * Decrypts a Base64 encoded XOR encrypted string.
 */
export const decrypt = (base64: string): string => {
  try {
    const binary = atob(base64);
    const encrypted = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      encrypted[i] = binary.charCodeAt(i);
    }

    const encoder = new TextEncoder();
    const key = encoder.encode(ENCRYPTION_KEY);
    const decrypted = new Uint8Array(encrypted.length);

    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ key[i % key.length];
    }

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
};

/**
 * Multi-layer encryption that attempts to reduce URL length by recursively
 * compressing and encrypting if the length exceeds 100 characters.
 * Prefixes with a 3-digit level indicator (001, 002, ...).
 */
export const multiLayerCompressAndEncrypt = (text: string): string => {
  if (!text) return "";

  let level = 1;
  let data = compressAndEncryptForUrl(text);
  let current = "001" + data;

  while (current.length > 100 && level < 999) {
    const nextData = compressAndEncryptForUrl(current);
    const nextLevel = level + 1;
    const nextPrefix = nextLevel.toString().padStart(3, '0');
    const nextCurrent = nextPrefix + nextData;

    if (nextCurrent.length < current.length) {
      current = nextCurrent;
      level = nextLevel;
    } else {
      break;
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
  while (true) {
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
    // Safety check: decrypted content of level > 1 MUST have a prefix
    if (!currentHash.match(/^\d{3}/)) {
      console.error("Multi-layer decryption failed: expected prefix not found in level", level);
      return "";
    }
  }
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
    currentHash = decodeURIComponent(hash.split('?')[1]);
  }

  const prefixMatch = currentHash.match(/^\d{3}/);
  if (!prefixMatch) {
    const decrypted = decryptAndDecompressFromUrl(currentHash);
    if (decrypted) {
      steps.push({ level: 0, data: currentHash, decrypted });
    }
    return steps;
  }

  while (true) {
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
 * Uses lz-string for compression to keep URLs short.
 */
export const compressAndEncryptForUrl = (text: string): string => {
  if (!text) return "";
  // First compress
  const compressed = LZString.compressToEncodedURIComponent(text);
  // Then obfuscate with XOR
  return encrypt(compressed);
};

/**
 * Decrypts and decompresses text from URL.
 */
export const decryptAndDecompressFromUrl = (hash: string): string => {
  if (!hash) return "";
  try {
    // First reverse XOR/Base64
    const decrypted = decrypt(hash);
    if (!decrypted) return "";
    // Then decompress
    return LZString.decompressFromEncodedURIComponent(decrypted) || "";
  } catch (error) {
    console.error("Failed to decrypt and decompress", error);
    return "";
  }
};
