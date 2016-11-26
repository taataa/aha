
module.exports = {
  context: __dirname + "/client/src",
  entry: "./index.js",
  output: {
    path: __dirname + "/client",
    filename: "app.bundle.js"
  }
};
