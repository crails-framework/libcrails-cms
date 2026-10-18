const path = require("path");
const { styles } = require('@ckeditor/ckeditor5-dev-utils');
const { rspack } = require('@rspack/core');

module.exports = {
  entry: "./webpackage/admin.js",
  output: {
    path: path.resolve(__dirname, "webpackage/build"),
    filename: "admin.js"
  },
  optimization: {
    minimize: true,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          mangle: false,
          compress: true
        }
      }),
      new rspack.LightningCssMinimizerRspackPlugin() 
    ]
  },
  module: {
    rules: [
      {
        test: /[/\\]icons[/\\][^/\\]+\.svg$/,
        type: 'asset/source' // Native asset source handling (replaces raw-loader)
      },
      {
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag',
              attributes: {
                'data-cke': true
              }
            }
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: styles.getPostCssConfig({
                themeImporter: {
                  themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                },
                minify: true
              })
            }
          }
        ]
      },
      {
        test: require.resolve('@migliori/universal-icon-picker/assets/js/universal-icon-picker.js'),
        use: [{
          loader: 'expose-loader',
          options: {
            exposes: {
              globalName: 'UniversalIconPicker',
              override: true,
            },
          },
        }],
      }
    ]
  }
};
