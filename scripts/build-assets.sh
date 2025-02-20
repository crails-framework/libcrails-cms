#!/bin/sh

export SASS=node_modules/.bin/sass
export STYLE_ROOT=webpackage/stylesheets
export OUTPUT=webpackage/build
export CRAILS_AUTOGEN_DIR=libcrails-cms/crails/cms/autogen

mkdir -p "$OUTPUT"

npm install

scripts/prepare-content-tools.sh

$SASS -s compressed $STYLE_ROOT/vendor/pure.scss > $OUTPUT/pure.css
$SASS -s compressed $STYLE_ROOT/admin.scss > $OUTPUT/admin.css
$SASS -s compressed $STYLE_ROOT/content_tools.scss > $OUTPUT/content_tools.css
$SASS -s compressed $STYLE_ROOT/proudcms.scss > $OUTPUT/proudcms.css

node_modules/.bin/webpack --progress

mkdir -p "$CRAILS_AUTOGEN_DIR"

crails-builtin-assets \
  --inputs      "$OUTPUT" \
  --output      "$CRAILS_AUTOGEN_DIR/assets" \
  --classname   "CrailsCmsAssets" \
  --compression "gzip" \
  --uri-root    "/cms/assets/"
