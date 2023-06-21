#!/bin/sh

export SASS=node_modules/.bin/sass
export STYLE_ROOT=webpackage/stylesheets
export OUTPUT=webpackage/build

mkdir -p "$OUTPUT"

npm install

scripts/prepare-content-tools.sh

$SASS -s compressed $STYLE_ROOT/vendor/pure.scss > $OUTPUT/pure.css
$SASS -s compressed $STYLE_ROOT/admin.scss > $OUTPUT/admin.css
$SASS -s compressed $STYLE_ROOT/content_tools.scss > $OUTPUT/content_tools.css
$SASS -s compressed $STYLE_ROOT/proudcms.scss > $OUTPUT/proudcms.css

webpack --progress

crails-builtin-assets \
  --inputs      "$OUTPUT" \
  --output      "libcrails-cms/crails/cms/lib/assets" \
  --classname   "CrailsCmsAssets" \
  --compression "gzip" \
  --uri-root    "/cms/assets/"
