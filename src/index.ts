import type { Compiler, Compilation } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { Csp, DirectiveSet } from "./csp";

const pluginName = "CspHtmlWebpackPlugin";

type HtmlWebpackPluginData = {
  html: string;
  outputName: string;
  plugin: HtmlWebpackPlugin;
};

type HtmlWebpackPluginCallback = (
  error: Error | null,
  { html, outputName, plugin }: HtmlWebpackPluginData
) => void;

export class CspHtmlWebpackPlugin {
  htmlWebpackPlugin: typeof HtmlWebpackPlugin;
  directiveSet: DirectiveSet | undefined;

  constructor(
    htmlWebpackPlugin: typeof HtmlWebpackPlugin,
    directiveSet?: DirectiveSet
  ) {
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.directiveSet = directiveSet;
  }

  applyCsp(
    compilation: Compilation,
    data: HtmlWebpackPluginData,
    cb: HtmlWebpackPluginCallback
  ): void {
    const csp = new Csp(data.html, this.directiveSet);
    csp.refactorScriptTagsForHashSourceCSP();
    const hashes = csp.getHashAllInlineScripts();
    const strictCsp = csp.generateDirectiveSet(hashes);
    csp.addCspMetaTag(strictCsp);

    data.html = csp.getDocument().documentElement.outerHTML;
    return cb(null, data);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(pluginName, (compilation: Compilation) => {
      this.htmlWebpackPlugin
        .getHooks(compilation)
        .beforeEmit.tapAsync(
          pluginName,
          (htmlWebPackPluginData, compileCallback) => {
            this.applyCsp(compilation, htmlWebPackPluginData, compileCallback);
          }
        );
    });
  }
}
