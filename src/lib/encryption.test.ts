import { describe, it, expect } from "vitest";
import { encryptWithPassword, decryptWithPassword } from "./encryption";

describe("Multi-level Password Encryption", () => {
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

  it("successfully encrypts and decrypts with correct password", () => {
    const cipher = encryptWithPassword(sampleData, password);
    expect(cipher).not.toBe("");
    expect(cipher).not.toContain("Abdullah");

    const decrypted = decryptWithPassword(cipher, password);
    expect(decrypted).toBe(sampleData);
    expect(JSON.parse(decrypted).infoData[0].value).toBe("Md. Abdullah Bari");
  });

  it("fails decryption when incorrect password is provided", () => {
    const cipher = encryptWithPassword(sampleData, password);
    const decrypted = decryptWithPassword(cipher, "wrong_password_123");
    expect(decrypted).toBe("");
  });

  it("returns empty string for empty inputs", () => {
    expect(encryptWithPassword("", password)).toBe("");
    expect(encryptWithPassword(sampleData, "")).toBe("");
    expect(decryptWithPassword("", password)).toBe("");
    expect(decryptWithPassword("invalid_cipher", password)).toBe("");
  });
});
