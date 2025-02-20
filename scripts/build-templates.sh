#!/bin/sh

cd libcrails-cms/crails/cms

export CRAILS_AUTOGEN_DIR=autogen

crails templates build \
  -r html \
  -i views \
  -t Crails::HtmlTemplate \
  -z crails/html_template.hpp \
  -n CrailsCmsHtmlRenderer \
  -p \.html$ \
  -v

crails templates build \
  -r rss \
  -i views \
  -t Crails::RssTemplate \
  -z crails/rss_template.hpp \
  -n CrailsCmsRssRenderer \
  -p \.rss$ \
  -v

crails templates build \
  -r json \
  -i views \
  -t Crails::JsonTemplate \
  -z crails/json_template.hpp \
  -n CrailsCmsJsonRenderer \
  -p \.json$ \
  -m raw \
  -s stream \
  -v
