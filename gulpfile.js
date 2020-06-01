var config = require("./build/config.js"),
  gulp = require("gulp");
gulpSequence = require("gulp-sequence"),
  gutil = require("gulp-util"),
  del = require("del"),
  uglify = require("gulp-uglify"),
  imagemin = require("gulp-imagemin"),
  express = require("express"),
  webpack = require("webpack"),
  webpackDevMiddleware = require("webpack-dev-middleware"),
  webpackHotMiddleware = require("webpack-hot-middleware"),
  history = require("connect-history-api-fallback"),
  proxyMiddleware = require("http-proxy-middleware"),
  opn = require("opn");

gulp.task('dev', function () {
  var webpackDevConfig = require("./build/webpack.dev.js");

  webpackDevConfig.entry = ["webpack-hot-middleware/client?quiet=true"].concat([
    webpackDevConfig.entry
  ]);

  var devCompiler = webpack(webpackDevConfig);
  var devMiddleware = webpackDevMiddleware(devCompiler, {
    publicPath: webpackDevConfig.output.publicPath,
    stats: {
      chunks: false,
      colors: true,
      timings: true,
      source: true,
      cachedAssets: false
    },
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: true
    }
  });
  var hotMiddleware = webpackHotMiddleware(devCompiler, {
    log: false
  });

  var server = express();
  server.use(history());
  if (config.target)
    server.use(
      proxyMiddleware("/api", {
        target: config.target,
        changeOrigoin: true,
        pathRewrite: { "^/api": "/" }
      })
    );
  server.use(devMiddleware);
  server.use(hotMiddleware);
  server.listen(3008, function (err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
    opn("http://localhost:3008");
  });
})
