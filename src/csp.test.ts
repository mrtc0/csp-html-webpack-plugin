import { Csp, DirectiveSet } from "./csp";
import {
  TemplateHtmlWithSourcedScript,
  TemplateHtmlWithInlineScript,
} from "../test/utils";

describe("Generate CSP directive set", () => {
  test("sourced script", () => {
    const csp = new Csp(TemplateHtmlWithSourcedScript);
    csp.refactorScriptTagsForHashSourceCSP();
    const hashes = csp.getHashAllInlineScripts();
    const strictCsp = csp.generateDirectiveSet(hashes);

    expect(strictCsp).toBe(
      "base-uri 'self';object-src 'none';script-src 'strict-dynamic' 'sha256-mYdombCl/LUAKynRv79a3hlmGp7o1Dsd1wEeYRQb0NA=';"
    );
  });

  test("inline script", () => {
    const csp = new Csp(TemplateHtmlWithInlineScript);
    csp.refactorScriptTagsForHashSourceCSP();
    const hashes = csp.getHashAllInlineScripts();
    const strictCsp = csp.generateDirectiveSet(hashes);

    expect(strictCsp).toBe(
      "base-uri 'self';object-src 'none';script-src 'strict-dynamic' 'sha256-S4W5IfMGp/y53v/Xg551TrOjlh3QicY3LqXAnb8sfrc=' 'sha256-mYdombCl/LUAKynRv79a3hlmGp7o1Dsd1wEeYRQb0NA=';"
    );
  });

  test("with options", () => {
    const directiveSet: DirectiveSet = {
      "base-uri": [`'self'`],
      "object-src": [`'none'`],
      "style-src": [`'self'`, `'unsafe-inline'`],
    };
    const csp = new Csp(TemplateHtmlWithInlineScript, directiveSet);
    csp.refactorScriptTagsForHashSourceCSP();
    const hashes = csp.getHashAllInlineScripts();
    const strictCsp = csp.generateDirectiveSet(hashes);

    expect(strictCsp).toBe(
      "base-uri 'self';object-src 'none';style-src 'self' 'unsafe-inline';script-src 'strict-dynamic' 'sha256-S4W5IfMGp/y53v/Xg551TrOjlh3QicY3LqXAnb8sfrc=' 'sha256-mYdombCl/LUAKynRv79a3hlmGp7o1Dsd1wEeYRQb0NA=';"
    );
  });
});

describe("Generate HTML", () => {
  const directiveSet: DirectiveSet = {
    "base-uri": [`'self'`],
    "object-src": [`'none'`],
    "style-src": [`'self'`, `'unsafe-inline'`],
  };

  const csp = new Csp(TemplateHtmlWithInlineScript, directiveSet);
  csp.refactorScriptTagsForHashSourceCSP();
  const hashes = csp.getHashAllInlineScripts();
  const cspDirectiveSet = csp.generateDirectiveSet(hashes);
  csp.addCspMetaTag(cspDirectiveSet);

  const resultHtml = csp.getDocument().documentElement.outerHTML;

  test("sourced scripts that are loaded dynamically are defined in inline script", () => {
    expect(resultHtml).toContain("var scripts = ['analytics.js','app.js'];");
  });

  test("sourced scripts that should be loaded dynamically have been removed", () => {
    expect(resultHtml).not.toContain(`<script src="analytics.js"></script>`);
    expect(resultHtml).not.toContain(`<script src="app.js"></script>`);
  });

  test("Content-Security-Policy meta tag is added to the head", () => {
    expect(resultHtml).toContain(
      `<head><meta http-equiv="Content-Security-Policy" content="${cspDirectiveSet}">`
    );
  });
});
