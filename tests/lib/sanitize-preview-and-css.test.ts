import { describe, expect, it } from "vitest";
import {
  sanitizeEmailPreviewHtml,
  sanitizeEmailPreviewSubject,
} from "@/lib/sanitize-email-preview-html";
import { sanitizeTenantCustomCss } from "@/lib/sanitize-tenant-custom-css";

describe("sanitizeEmailPreviewHtml", () => {
  it("elimina script y mantiene marcado seguro", () => {
    const dirty =
      '<p>Hola</p><script>alert(1)</script><strong>OK</strong><img src=x onerror=alert(1)>';
    const clean = sanitizeEmailPreviewHtml(dirty);
    expect(clean).not.toMatch(/script/i);
    expect(clean).not.toMatch(/onerror/i);
    expect(clean).toMatch(/Hola/);
    expect(clean).toMatch(/OK/);
  });

  it("permite tablas y enlaces típicos de email", () => {
    const html =
      '<table><tr><td><a href="https://example.com" target="_blank">Click</a></td></tr></table>';
    const clean = sanitizeEmailPreviewHtml(html);
    expect(clean).toMatch(/example\.com/);
    expect(clean).toMatch(/Click/);
  });
});

describe("sanitizeEmailPreviewSubject", () => {
  it("permite mark con estilo y elimina script", () => {
    const dirty =
      'Hola <mark style="background:#fde047;color:#1e293b">Juan</mark><script>x</script>';
    const clean = sanitizeEmailPreviewSubject(dirty);
    expect(clean).toMatch(/mark/);
    expect(clean).toMatch(/Juan/);
    expect(clean).not.toMatch(/script/i);
  });
});

describe("sanitizeTenantCustomCss", () => {
  it("vacía entrada nula o en blanco", () => {
    expect(sanitizeTenantCustomCss(null)).toBe("");
    expect(sanitizeTenantCustomCss(undefined)).toBe("");
    expect(sanitizeTenantCustomCss("   ")).toBe("");
  });

  it("elimina @import, url() y cierres de style", () => {
    const css = `
      .x { color: red; background: url(https://evil.test/a.png); }
      @import url("https://evil.test/b.css");
      body { }
    `;
    const clean = sanitizeTenantCustomCss(css);
    expect(clean).not.toMatch(/@import/i);
    expect(clean).not.toMatch(/url\s*\(/i);
    expect(clean).toMatch(/color:\s*red/);
  });

  it("elimina expression y javascript:", () => {
    const css = `a { width: expression(alert(1)); } b { x: javascript:void(0); }`;
    const clean = sanitizeTenantCustomCss(css);
    expect(clean).not.toMatch(/expression/i);
    expect(clean).not.toMatch(/javascript:/i);
  });
});
