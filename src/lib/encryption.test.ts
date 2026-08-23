import { describe, it, expect } from "vitest";
import { encryptWithPassword, decryptWithPassword } from "./encryption";

describe("AES-256-GCM + PBKDF2 Password Encryption", () => {
  const password = "@Abs21221150057";
  const sampleData = JSON.stringify({
    infoData: [
      { label: "Name", labelBn: "নাম", value: "Md. Abdullah Bari", valueBn: "মোঃ আব্দুল্লাহ বারী" }
    ],
    address: {
      en: ["Village: Panthapara"],
      bn: ["গ্রাম: পান্থাপাড়া"]
    }
  });

  it("successfully encrypts and decrypts with correct password", async () => {
    const cipher = await encryptWithPassword(sampleData, password);
    expect(cipher).not.toBe("");
    expect(cipher).not.toContain("Abdullah");

    const decrypted = await decryptWithPassword(cipher, password);
    expect(decrypted).toBe(sampleData);
    expect(JSON.parse(decrypted).infoData[0].value).toBe("Md. Abdullah Bari");
  });

  it("fails decryption when incorrect password is provided", async () => {
    const cipher = await encryptWithPassword(sampleData, password);
    const decrypted = await decryptWithPassword(cipher, "wrong_password_123");
    expect(decrypted).toBe("");
  });

  it("returns empty string for empty inputs", async () => {
    expect(await encryptWithPassword("", password)).toBe("");
    expect(await encryptWithPassword(sampleData, "")).toBe("");
    expect(await decryptWithPassword("", password)).toBe("");
    expect(await decryptWithPassword("invalid_cipher", password)).toBe("");
  });
});
