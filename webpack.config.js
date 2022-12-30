const path = require("path");
const {styles} = require('@ckeditor/ckeditor5-dev-utils');

module.exports = {
  entry: "./webpackage/admin.js",
  output: {
    path: path.resolve(__dirname, "webpackage/build"),
    filename: "admin.js"
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /[/\\]icons[/\\][^/\\]+\.svg$/,
        use: [ 'raw-loader' ]
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
              minify: true})
            }
          }
        ]
      }
    ]
  }
};
