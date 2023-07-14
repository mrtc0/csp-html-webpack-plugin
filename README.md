# CSP HTML Webpack Plugin

## About

`@mrtc0/csp-html-webpack-plugin` is a webpack plugin that helps to automatically add CSP(Level 3) to `meta` tags in projects like Single Page Application.  
This project is inspired by [strict-csp-html-webpack-plugin](https://github.com/google/strict-csp/tree/main/strict-csp-html-webpack-plugin) and allows for more flexible CSP directives.

## Installation

with npm:

```shell
npm i --save-dev @mrtc0/csp-html-webpack-plugin
```

## Basic Usage

In your webpack config file:

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CspHtmlWebpackPlugin } = require("@mrtc0/csp-html-webpack-plugin");

module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin(),
    new CspHtmlWebpackPlugin(HtmlWebpackPlugin, {
      "base-uri": [`'self'`],
      "object-src": [`'none'`],
      "style-src": [`'self'`, `'unsafe-inline'`],
      // script-src will auto generate
    }),
  ],
};
```

Will generate the following HTML:

```html
<html>
  <head>
    <meta
      http-equiv="Content-Security-Policy"
      content="base-uri 'self'; object-src 'none'; style-src 'self' 'unsafe-inline'; script-src 'strict-dynamic' 'sha256-...';"
    />
  </head>
  <body>
    <script>
      var scripts = ["/static/js/index.js"];
      scripts.forEach(function (scriptUrl) {
        var s = document.createElement("script");
        s.src = scriptUrl;
        s.async = false; // preserve execution order.
        document.body.appendChild(s);
      });
    </script>
  </body>
</html>
```

### How does this plugin work?

This plugin is referencing the [strict-csp](https://github.com/google/strict-csp/tree/main/strict-csp) library as a source of inspiration.

> 1. It replaces sourced scripts with an inline script that dynamically loads all sourced scripts. It calculates the hash of this script.
> 2. It calculates the hash of other inline scripts.
> 3. It creates a strict hash-based CSP, that includes the hashes calculated in (1) and (2).

## Configuration

By default, `@mrtc0/csp-html-webpack-plugin` applies Strict-CSP as follows:

```
base-uri 'self'; object-src 'none'; script-src 'strict-dynamic' 'sha256-...';
```

By specifying directives, you can modify the default directives. The `script-src` directive is automatically generated.

```js
module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin(),
    new CspHtmlWebpackPlugin(HtmlWebpackPlugin, {
      "base-uri": [`'self'`],
      "object-src": [`'none'`],
      // Add style-src directive
      "style-src": [`'self'`, `'unsafe-inline'`],
      // script-src will auto generate
    }),
  ],
};
```

## Todo's

- [ ] `unsafe-inline` and `unsafe-eval` configurable as an option
