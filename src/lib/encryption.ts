import LZString from "lz-string";

const bufferToBase64 = (buf: ArrayBuffer | Uint8Array): string => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBuffer = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Industry-standard AES-256-GCM encryption coupled with PBKDF2 key derivation.
 * Derives a 256-bit AES key using PBKDF2 (100,000 iterations, SHA-256, random 16-byte salt),
 * then encrypts compressed payload using AES-256-GCM with a random 12-byte IV.
 */
export const encryptWithPassword = async (text: string, password: string): Promise<string> => {
  if (!text || !password) return "";

  try {
    const compressed = LZString.compressToBase64(text);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(password, salt);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(compressed)
    );

    return JSON.stringify({
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      data: bufferToBase64(encryptedBuffer),
    });
  } catch (err) {
    console.error("Encryption error:", err);
    return "";
  }
};

/**
 * Decrypts an AES-256-GCM encrypted payload derived via PBKDF2 using the supplied password.
 * Returns empty string if password is incorrect or decryption/authentication fails.
 */
export const decryptWithPassword = async (cipherText: string, password: string): Promise<string> => {
  if (!cipherText || !password) return "";

  try {
    const { salt: saltB64, iv: ivB64, data: dataB64 } = JSON.parse(cipherText);
    if (!saltB64 || !ivB64 || !dataB64) return "";

    const salt = base64ToBuffer(saltB64);
    const iv = base64ToBuffer(ivB64);
    const data = base64ToBuffer(dataB64);

    const key = await deriveKey(password, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    const compressed = new TextDecoder().decode(decryptedBuffer);
    const decompressed = LZString.decompressFromBase64(compressed);
    return decompressed || "";
  } catch (err) {
    return "";
  }
};
