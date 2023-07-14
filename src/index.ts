import type { Compiler, Compilation } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { Csp, DirectiveSet } from "./csp";
import webpack from "webpack";

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
      // https://github.com/google/strict-csp/issues/48
      compilation.hooks.processAssets.intercept({
        register: (tap) => {
          if (tap.name === "HtmlWebpackPlugin") {
            tap.stage = webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT;
          }
          return tap;
        },
      });

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
