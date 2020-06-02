var config = require("./build/config.js"),
  gulp = require("gulp");
  gulpSequence = require("gulp-sequence"), //按顺序执行任务， 跟series() 类似
  gutil = require("gulp-util"),
  del = require("del"),
  uglify = require("gulp-uglify"),
  imagemin = require("gulp-imagemin"),
  express = require("express"),
  webpack = require("webpack"),
  webpackDevMiddleware = require("webpack-dev-middleware"),  //服务器： 代码变化后，自动编译    https://webpack.docschina.org/guides/development/#%E4%BD%BF%E7%94%A8-webpack-dev-middleware
  webpackHotMiddleware = require("webpack-hot-middleware"),
  history = require("connect-history-api-fallback"),
  proxyMiddleware = require("http-proxy-middleware"),
  opn = require("opn");

gulp.task('dev', function () {
  var webpackDevConfig = require("./build/webpack.dev.js");  //读取 webpack dev 配置

  webpackDevConfig.entry = ["webpack-hot-middleware/client?quiet=true"].concat([
    webpackDevConfig.entry
  ]);  //入口重新计算？ 为啥要这样？

  var devCompiler = webpack(webpackDevConfig);    //传入一个 webpack 配置对象，当同时传入回调函数时就会执行 webpack compiler ； 如果你不向 webpack 执行函数传入回调函数，就会得到一个 webpack Compiler 实例。你可以通过它手动触发 webpack 执行器，或者是让它执行构建并监听变更
  var devMiddleware = webpackDevMiddleware(devCompiler, {   //webpack-dev-middleware 是一个封装器(wrapper)，它可以把 webpack 处理过的文件发送到一个 server。
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
