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
