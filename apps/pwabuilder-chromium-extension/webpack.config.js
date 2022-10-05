const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    background: path.resolve(__dirname, "src", "background.ts"),
    devtools: path.resolve(__dirname, "src", "devtools.ts"),
    index: path.resolve(__dirname, "src", "index.ts"),
    partnerCenter: path.resolve(__dirname, "src", "partnerCenter.ts"),
  },
  output: {
    path: path.join(__dirname, "dist"),
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
        { from: ".", to: ".", context: "public" },
        {
          from: "*.css",
          to: "shoelace/",
          context: "node_modules/@shoelace-style/shoelace/dist/themes/"
        },
      ],
    }),
  ],
};
