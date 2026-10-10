#!/bin/sh

export SASS=node_modules/.bin/sass
export STYLE_ROOT=webpackage/stylesheets
export OUTPUT=webpackage/build
export CRAILS_AUTOGEN_DIR=libcrails-cms/crails/cms/autogen
export TURBO_SOURCE=node_modules/@hotwired/turbo/dist/turbo.es2017-umd.js

mkdir -p "$OUTPUT"

npm install

if [ ! -f "$TURBO_SOURCE" ] ; then
  echo "build-assets.sh: $TURBO_SOURCE not found (npm install @hotwired/turbo)" >&2
  exit 1
fi

scripts/prepare-content-tools.sh

$SASS -s compressed $STYLE_ROOT/vendor/pure.scss > $OUTPUT/pure.css
$SASS -s compressed $STYLE_ROOT/admin.scss > $OUTPUT/admin.css
$SASS -s compressed $STYLE_ROOT/content_tools.scss > $OUTPUT/content_tools.css
$SASS -s compressed $STYLE_ROOT/proudcms.scss > $OUTPUT/proudcms.css

node_modules/.bin/webpack --progress

if [ -x node_modules/.bin/terser ] ; then
  node_modules/.bin/terser "$TURBO_SOURCE" --compress --mangle -o "$OUTPUT/turbo.js" || exit 1
else
  cp "$TURBO_SOURCE" "$OUTPUT/turbo.js"
fi

mkdir -p "$CRAILS_AUTOGEN_DIR"

crails-builtin-assets \
  --inputs      "$OUTPUT" \
  --output      "$CRAILS_AUTOGEN_DIR/assets" \
  --classname   "CrailsCmsAssets" \
  --compression "gzip" \
  --uri-root    "/cms/assets/"
