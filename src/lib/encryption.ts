import LZString from "lz-string";

/**
 * Helper to perform XOR transform on Uint8Array given a string key.
 */
const xorTransformWithKey = (data: Uint8Array, keyString: string): Uint8Array => {
  const keyEncoder = new TextEncoder();
  const keyBytes = keyEncoder.encode(keyString);
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ keyBytes[i % keyBytes.length];
  }
  return result;
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

const toUrlSafe = (base64: string) => base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromUrlSafe = (urlSafe: string) => {
  let base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return base64;
};

/**
 * Multi-layer password-based encryption.
 * Encrypts plain text using the user's password through 5 distinct cascading layers:
 * 1. Data Compression via LZString
 * 2. Password XOR with character rotation and salt
 * 3. Base64 encoding + String reversal
 * 4. Secondary static key XOR transformation
 * 5. URL-safe Base64 wrapper
 */
export const encryptWithPassword = (text: string, password: string): string => {
  if (!text || !password) return "";

  try {
    // Layer 1: Compress original string
    const compressed = LZString.compressToBase64(text);

    // Layer 2: Password XOR transformation with dynamic salt key
    const saltKey = `${password}_SALT_SECURE_2025_${password.length}`;
    const encoder = new TextEncoder();
    const l1Bytes = encoder.encode(compressed);
    const l2Bytes = xorTransformWithKey(l1Bytes, saltKey);
    const l2B64 = btoa(uint8ArrayToBinaryString(l2Bytes));

    // Layer 3: String Reversal & Base64 encoding
    const reversedL2 = l2B64.split("").reverse().join("");
    const l3B64 = btoa(reversedL2);

    // Layer 4: Secondary Key XOR
    const staticKey = "PROTECTED_IDENTITY_PAYLOAD_KEY_9988";
    const l3Bytes = encoder.encode(l3B64);
    const l4Bytes = xorTransformWithKey(l3Bytes, staticKey);

    // Layer 5: URL-safe Base64 encoding
    return toUrlSafe(btoa(uint8ArrayToBinaryString(l4Bytes)));
  } catch (err) {
    console.error("Encryption error:", err);
    return "";
  }
};

/**
 * Multi-layer password-based decryption.
 * Decrypts a multi-layered cipher string using the supplied password.
 * Returns empty string if password is incorrect or decryption fails.
 */
export const decryptWithPassword = (cipherText: string, password: string): string => {
  if (!cipherText || !password) return "";

  try {
    // Layer 5 -> Layer 4: URL-safe Base64 decode
    const l4Binary = atob(fromUrlSafe(cipherText));
    const l4Bytes = binaryStringToUint8Array(l4Binary);

    // Layer 4 -> Layer 3: Secondary Key XOR decode
    const staticKey = "PROTECTED_IDENTITY_PAYLOAD_KEY_9988";
    const l3Bytes = xorTransformWithKey(l4Bytes, staticKey);
    const l3B64 = new TextDecoder().decode(l3Bytes);

    // Layer 3 -> Layer 2: Base64 decode & String un-reverse
    const reversedL2 = atob(l3B64);
    const l2B64 = reversedL2.split("").reverse().join("");

    // Layer 2 -> Layer 1: Password XOR decode
    const l2Binary = atob(l2B64);
    const l2Bytes = binaryStringToUint8Array(l2Binary);
    const saltKey = `${password}_SALT_SECURE_2025_${password.length}`;
    const l1Bytes = xorTransformWithKey(l2Bytes, saltKey);
    const compressed = new TextDecoder().decode(l1Bytes);

    // Layer 1: Decompress LZString
    const decompressed = LZString.decompressFromBase64(compressed);
    if (!decompressed) return "";

    return decompressed;
  } catch (err) {
    return "";
  }
};
