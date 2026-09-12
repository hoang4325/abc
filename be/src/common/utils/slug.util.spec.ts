import { describe, it, expect } from "vitest";
import {
  generateSlug,
  resolveUniqueSlug,
  normalizeTags,
} from "./slug.util.js";

describe("slug.util", () => {
  it("should convert Vietnamese text with accents to clean slug", () => {
    const input = "Review kem chống nắng Anessa chính hãng 100%";
    const slug = generateSlug(input);
    expect(slug).toBe("review-kem-chong-nang-anessa-chinh-hang-100");
  });

  it("should handle empty or whitespace-only strings gracefully", () => {
    expect(generateSlug("   ")).toBe("untitled");
    expect(generateSlug("???")).toBe("untitled");
  });

  it("should resolve unique slug with counter increments", async () => {
    const takenSlugs = new Set([
      "review-kem-chong-nang-anessa",
      "review-kem-chong-nang-anessa-2",
    ]);

    const result = await resolveUniqueSlug(
      "Review kem chống nắng Anessa",
      async (slug) => takenSlugs.has(slug)
    );

    expect(result).toBe("review-kem-chong-nang-anessa-3");
  });

  it("should normalize tags by trimming, removing hashes, and deduplicating", () => {
    const input = ["#Review", "review", " Review ", "Kem Chống Nắng", ""];
    const normalized = normalizeTags(input);

    expect(normalized).toEqual([
      { name: "Review", slug: "review" },
      { name: "Kem Chống Nắng", slug: "kem-chong-nang" },
    ]);
  });
});
