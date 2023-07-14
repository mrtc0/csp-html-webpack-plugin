import * as crypto from "crypto";
import { JSDOM } from "jsdom";

export type DirectiveSet = {
  [key: string]: Array<string>;
};

const strictCspDirectiveSet = {
  "base-uri": [`'self'`],
  "object-src": [`'none'`],
  "script-src": [`'strict-dynamic'`],
};

export class Csp {
  private document: Document;
  private directiveSet: DirectiveSet;

  constructor(html: string, directiveSet?: DirectiveSet) {
    this.document = new JSDOM(html).window.document;
    this.directiveSet = strictCspDirectiveSet;

    if (directiveSet) {
      this.directiveSet = directiveSet;
    }
  }

  getDocument(): Document {
    return this.document;
  }

  /**
   * Refactor all script tags to a single loader script.
   */
  refactorScriptTagsForHashSourceCSP(): void {
    const scriptTags = this.document.getElementsByTagName("script");
    const srcScripts = Array.from(scriptTags).filter((script) =>
      script.hasAttribute("src")
    );

    // remove all sourced scripts
    srcScripts.forEach((script) => {
      script.remove();
    });

    const loaderInlineScript = Csp.generateLoaderScript(srcScripts);
    const newInlineScript = this.document.createElement("script");
    newInlineScript.textContent = loaderInlineScript;
    this.document.body.appendChild(newInlineScript);
  }

  /**
   * Get the hash of all inline scripts.
   * @returns The list of hashes of inline scripts.
   */
  getHashAllInlineScripts(): string[] {
    const hashes: Array<string> = [];
    const scriptTags = this.document.getElementsByTagName("script");
    const inlineScripts = Array.from(scriptTags).filter(
      (script) => !script.hasAttribute("src")
    );

    inlineScripts.forEach((script) => {
      const hash = Csp.hashInlineScript(script.textContent || "");
      hashes.push(hash);
    });

    return hashes;
  }

  addCspMetaTag(csp: string): void {
    const meta = this.document.createElement("meta");
    meta.setAttribute("http-equiv", "Content-Security-Policy");
    meta.setAttribute("content", csp);

    this.document.getElementsByTagName("head")[0].prepend(meta);
  }

  /**
   * Generate a CSP directive set.
   *
   * @param hashes - The list of hashes of inline scripts.
   * @returns The CSP directive set.
   */
  generateDirectiveSet(hashes: string[]): string {
    const scriptSrcCsp = {
      "script-src": [`'strict-dynamic'`, ...hashes],
    };

    let cspTemplate = { ...this.directiveSet, ...scriptSrcCsp };

    return Object.entries(cspTemplate)
      .map(([directive, values]) => {
        return `${directive} ${values.join(" ")};`;
      })
      .join("");
  }

  /**
   * Generate loader inline scripts to dynamically load external scripts.
   * For example:
   *    <script src="https://example.com/analytics.js"></script>
   *    <script src="/app.js"></script>
   * will be refactored to:
   *    <script>
   *        var scripts = ['https://example.com/analytics.js', '/app.js'];
   *        scripts.forEach(function(scriptUrl) {
   *            var s = document.createElement('script');
   *            s.src = scriptUrl;
   *            s.async = false;
   *            document.body.appendChild(s);
   *        });
   *    </script>
   *
   * @param scripts - The list of sourced scripts.
   * @returns The loader script that will load all sourced scripts.
   */
  static generateLoaderScript(scripts: HTMLScriptElement[]): string {
    if (scripts.length === 0) {
      return "";
    }

    const srcListFormatted = scripts.map((s) => `'${s.src}'`).join();
    return `var scripts = [${srcListFormatted}];
    scripts.forEach(function(scriptUrl) {
      var s = document.createElement('script');
      s.src = scriptUrl;
      s.async = false;
      document.body.appendChild(s);
    });\n`;
  }

  /**
   * @param scriptText - The text of the inline script.
   * @returns The hash of the inline script.
   */
  static hashInlineScript(scriptText: string): string {
    const hash = crypto
      .createHash("sha256")
      .update(scriptText)
      .digest("base64");

    return `'sha256-${hash}'`;
  }
}
