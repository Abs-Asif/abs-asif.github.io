import { describe, it, expect } from "vitest";

// Re-implement the replacements exactly as in replaceSallallahu to test regex correctness
function runReplacements(content: string): string {
  let next = content;

  // 1. Replace "সাল্লালাহু আলাইহি ওয়াসাল্লাম" / "সাল্লালাহু আলাইহি ওয়া সাল্লাম" with ﷾.
  next = next.replace(/সাল্লাল?লাহু আলাইহি ওয়া\s?সাল্লামের/g, "﷾ এর");
  next = next.replace(/সাল্লাল?লাহু আলাইহি ওয়া\s?সাল্লামকে/g, "﷾ কে");
  next = next.replace(/সাল্লাল?লাহু আলাইহি ওয়া\s?সাল্লাম/g, "﷾");

  // Also replace the old ﷺ characters just in case they were there from old versions:
  next = next.replace(/ﷺ এর/g, "﷾ এর");
  next = next.replace(/ﷺ কে/g, "﷾ কে");
  next = next.replace(/ﷺ/g, "﷾");

  // 2. Newly add "(সা.)" to "﷾", "(সা.)-কে" to "﷾ কে", "(সা.)-এর" to "﷾ এর", "(সাঃ)" to "﷾", "(সাঃ)-কে" to "﷾ কে", "(সাঃ)-এর" to "﷾ এর"
  next = next.replace(/\(সা\.\)-এর/g, "﷾ এর");
  next = next.replace(/\(সাঃ\)-এর/g, "﷾ এর");
  next = next.replace(/\(সা:\)-এর/g, "﷾ এর");
  next = next.replace(/\(সা\.\)-কে/g, "﷾ কে");
  next = next.replace(/\(সাঃ\)-কে/g, "﷾ কে");
  next = next.replace(/\(সা:\)-কে/g, "﷾ কে");
  next = next.replace(/\(সা\.\)/g, "﷾");
  next = next.replace(/\(সাঃ\)/g, "﷾");
  next = next.replace(/\(সা:\)/g, "﷾");

  // 3. Add "রহ." to "﵀", "(রহ.)" to "﵀", "(রহ.)-কে" to "﵀ কে", "(রহ.)-এর" to "﵀ এর"
  next = next.replace(/\(রহ\.\)-এর/g, "﵀ এর");
  next = next.replace(/\(রহ\.\)-কে/g, "﵀ কে");
  next = next.replace(/\(রহ\.\)/g, "﵀");
  next = next.replace(/(?<![\u0980-\u09ff])রহ\.(?![\u0980-\u09ff])/g, "﵀");

  return next;
}

describe("Book Sallallahu & Rah. Replacements", () => {
  it("should replace 'সাল্লালাহু আলাইহি ওয়াসাল্লাম' and its inflections to ﷾", () => {
    expect(runReplacements("সাল্লালাহু আলাইহি ওয়াসাল্লাম")).toBe("﷾");
    expect(runReplacements("সাল্লালাহু আলাইহি ওয়াসাল্লামের")).toBe("﷾ এর");
    expect(runReplacements("সাল্লালাহু আলাইহি ওয়াসাল্লামকে")).toBe("﷾ কে");

    expect(runReplacements("সাল্লাললাহু আলাইহি ওয়া সাল্লাম")).toBe("﷾");
    expect(runReplacements("সাল্লাললাহু আলাইহি ওয়া সাল্লামের")).toBe("﷾ এর");
    expect(runReplacements("সাল্লাললাহু আলাইহি ওয়া সাল্লামকে")).toBe("﷾ কে");
  });

  it("should replace (সা.) and (সাঃ) and their inflections to ﷾", () => {
    expect(runReplacements("মোহাম্মদ (সা.)")).toBe("মোহাম্মদ ﷾");
    expect(runReplacements("রাসূল (সা.)-এর বাণী")).toBe("রাসূল ﷾ এর বাণী");
    expect(runReplacements("রাসূল (সা.)-কে বল")).toBe("রাসূল ﷾ কে বল");

    expect(runReplacements("মোহাম্মদ (সাঃ)")).toBe("মোহাম্মদ ﷾");
    expect(runReplacements("রাসূল (সাঃ)-এর বাণী")).toBe("রাসূল ﷾ এর বাণী");
    expect(runReplacements("রাসূল (সাঃ)-কে বল")).toBe("রাসূল ﷾ কে বল");
  });

  it("should replace রহ. and (রহ.) and their inflections to ﵀", () => {
    expect(runReplacements("ইমাম বুখারী (রহ.)")).toBe("ইমাম বুখারী ﵀");
    expect(runReplacements("ইমাম বুখারী (রহ.)-এর")).toBe("ইমাম বুখারী ﵀ এর");
    expect(runReplacements("ইমাম বুখারী (রহ.)-কে")).toBe("ইমাম বুখারী ﵀ কে");

    expect(runReplacements("ইমাম বুখারী রহ.")).toBe("ইমাম বুখারী ﵀");
    // Ensure it doesn't match inside a name like রহমান
    expect(runReplacements("আব্দুর রহমান")).toBe("আব্দুর রহমান");
  });
});
