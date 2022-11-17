const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    "pwabuilder-components": path.resolve(__dirname, "src", "components/index.ts"),
  },
  output: {
    path: path.join(__dirname, "components-dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "*.css",
          to: "shoelace/",
          context: "node_modules/@shoelace-style/shoelace/dist/themes/"
        },
      ],
    }),
  ],
};
