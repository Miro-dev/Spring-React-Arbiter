var path = require("path");

module.exports = {
  entry: "./src/main/js/arbiter-frontend/src/App.js",
  devtool: "sourcemaps",
  cache: true,
  mode: "development",
  output: {
    path: __dirname,
    filename: "./src/main/resources/static/built/bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: path.join(__dirname, "."),
        exclude: /(node_modules)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
    ],
  },
};
