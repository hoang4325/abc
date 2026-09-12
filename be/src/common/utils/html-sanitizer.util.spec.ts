import { describe, it, expect } from "vitest";
import { sanitizeArticleContent } from "./html-sanitizer.util.js";

describe("html-sanitizer.util", () => {
  it("should preserve allowed HTML tags and safe attributes", () => {
    const raw = `<p>This is <strong>bold</strong> and <em>italic</em> with <a href="https://sharedeal.vn" target="_blank">link</a>.</p><h1>Heading</h1><img src="https://sharedeal.vn/img.png" alt="sample" />`;
    const sanitized = sanitizeArticleContent(raw);

    expect(sanitized).toContain("<strong>bold</strong>");
    expect(sanitized).toContain("<em>italic</em>");
    expect(sanitized).toContain('href="https://sharedeal.vn"');
    expect(sanitized).toContain("<h1>Heading</h1>");
    expect(sanitized).toContain('src="https://sharedeal.vn/img.png"');
  });

  it("should strip malicious script tags and event handlers", () => {
    const raw = `<p>Normal</p><script>alert('xss')</script><img src="x" onerror="alert(1)" /><a href="javascript:alert(1)">click</a>`;
    const sanitized = sanitizeArticleContent(raw);

    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("alert('xss')");
    expect(sanitized).not.toContain("onerror");
    expect(sanitized).not.toContain("javascript:");
  });
});
