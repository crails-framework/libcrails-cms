#!/bin/sh

cp $STYLE_ROOT/content-tools-icons.woff \
  node_modules/ContentTools/build/images/icons.woff

CT_IMAGES=node_modules/ContentTools/build/images
PREFIX="content-tools-"

for file in `ls $CT_IMAGES` ; do
  cp "$CT_IMAGES/$file" "$OUTPUT/${PREFIX}${file}"
done

cp $STYLE_ROOT/content-tools-icons.woff \
  "$OUTPUT/${PREFIX}icons.woff"
