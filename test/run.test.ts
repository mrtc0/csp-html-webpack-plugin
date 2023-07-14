import webpack from "webpack";
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CspHtmlWebpackPlugin } = require("../");

const options: webpack.Configuration = {
  entry: __dirname + "/../examples/src/index.js",
  mode: "development",
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
  },
  plugins: [new HtmlWebpackPlugin(), new CspHtmlWebpackPlugin()],
};

test.skip("Compile", () => {
  webpack(
    options,
    function (err: Error | undefined, stats: webpack.Stats | undefined): void {
      if (err) {
        throw new Error(err.message);
      } else if (stats?.hasErrors()) {
        throw new Error(stats.toString());
      }

      const files = stats?.toJson().assets?.map((asset) => asset.name);
      expect(files?.indexOf("index.html")).toBe(1);
    }
  );
});
