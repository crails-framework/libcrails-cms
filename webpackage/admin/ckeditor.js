import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Link from '@ckeditor/ckeditor5-link/src/link';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Image from '@ckeditor/ckeditor5-image/src/image';
import {Table, TableToolbar, TableProperties, TableCellProperties, TableColumnResize, TableCaption, TableSelection, TableClipboard, TableUtils} from '@ckeditor/ckeditor5-table';
import {HtmlEmbed} from '@ckeditor/ckeditor5-html-embed';

import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting';
import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles';

import imageLeftIcon from './icons/image-align-left.svg';
import imageRightIcon from './icons/image-align-right.svg';

import CmsImageEmbed from "./ckeditor_embed.js";
import CmsAudioEmbed from "./ckeditor_audio.js";
import CmsOpenGraph from "./ckeditor_opengraph.js";
import CmsEmbedIcon from "./icons/library.svg";

import I18nCKEditorController from "./i18n_ckeditor.js";

const cmsEmbedToolbarGroup = {
  label: "Inclure...",
  icon: CmsEmbedIcon,
  items: [CmsImageEmbed.toolName, CmsAudioEmbed.toolName]
};

function makeCKEditorPluginList(customPlugins) {
  const plugins = [
    Essentials, Paragraph, Bold, Italic, Underline, Heading,
    Link, AutoLink, Alignment, MediaEmbed, BlockQuote,
    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, LinkImage,
    ImageResizeEditing, ImageResizeHandles,
    Table, TableToolbar, TableProperties, TableCellProperties, TableColumnResize, TableCaption, TableSelection, TableClipboard, TableUtils,
    HtmlEmbed,
    CmsImageEmbed, CmsAudioEmbed, CmsOpenGraph
  ];

  if (window.customCKEditorPlugins) {
    window.customCKEditorPlugins.forEach(plugin => {
      plugins.push(plugin);
    });
  }
  customPlugins.forEach(plugin => {
    if (plugins.indexOf(plugin) < 0)
      plugins.push(plugin);
  });
  return plugins;
}

function appendCustomPluginsToToolbar(customPlugins, toolbar) {
  if (window.customCKEditorPlugins) {
    window.customCKEditorPlugins.forEach(plugin => {
      toolbar.push(plugin.toolName);
    });
  }
  customPlugins.forEach(plugin => {
    if (toolbar.indexOf(plugin.toolName) < 0)
      toolbar.push(plugin.toolName);
  });
}

function makeCKEditorCompactToolbar(customPlugins) {
  const toolbar = [
    'heading',
    'bold', 'italic', 'underline',
    '|', 'alignment', 'insertTable',
    '|', 'link'
  ];

  appendCustomPluginsToToolbar(customPlugins, toolbar);
  return {
    items: toolbar,
    shouldNotGroupWhenFull: true
  };
}

function makeCKEditorToolbar(customPlugins) {
  if (window.customCKEditorToolBar)
    return window.customCKEditorToolBar();
  else {
    const toolbar = [
      'heading',
      'bold', 'italic', 'underline',
      '|', 'alignment', 'blockQuote', 'insertTable',
      '|', 'link',  'mediaEmbed', cmsEmbedToolbarGroup,
      CmsOpenGraph.toolName, '|', 'htmlEmbed'
    ];

    appendCustomPluginsToToolbar(customPlugins, toolbar);
    return {
      items: toolbar,
      shouldNotGroupWhenFull: true
    };
  }
}

function makeCustomToolbar(toolbar, customPlugins) {
  switch (toolbar) {
  case 'compact': return makeCKEditorCompactToolbar(customPlugins);
  case 'default': return makeCKEditorToolbar(customPlugins);
  }
  return toolbar;
}

export function adminCKEditor(elementOrName, options = {}) {
  const element = typeof elementOrName == "string"
    ? document.querySelector(`textarea[name='${elementOrName}']`)
    : elementOrName;
  const plugins = options.plugins || [];
  const toolbar = options.toolbar
    ? makeCustomToolbar(options.toolbar, plugins)
    : makeCKEditorToolbar(plugins);

  return ClassicEditor
    .create(element, {
      language: document.querySelector("html").lang,
      plugins: makeCKEditorPluginList(plugins),
      toolbar: toolbar,
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading2', title: "Header 1", view: 'h2', class: 'ck-heading_heading2' },
          { model: 'heading3', title: "Header 2", view: 'h3', class: 'ck-heading_heading3' },
          { model: 'heading4', title: "Header 3", view: 'h4', class: 'ck-heading_heading4' },
          { model: 'heading5', title: "Header 4", view: 'h5', class: 'ck-heading_heading5' }
	]
      },
      image: {
        styles: {
          options: [
            { name: 'left-side', title: 'Left side', icon: imageLeftIcon, className: 'image-style-left-side', modelElements: ['imageBlock'] },
            { name: 'right-side', title: 'Right side', icon: imageRightIcon, className: 'image-style-right-side', modelElements: ['imageBlock'] },
            { name: 'inline' },
	          { name: 'block' }
          ]
        },
        toolbar: [
          'imageStyle:block',
          'imageStyle:left-side',
          'imageStyle:right-side',
          'imageStyle:inline',
          '|',
          'toggleImageCaption',
          'imageTextAlternative',
          '|',
          'linkImage'
        ]
      },
      mediaEmbed: {
        previewsInData: true
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
        defaultHeadings: { columns: 1 }
      }
    })
    .then(editor => {
      console.log( 'Editor was initialized', editor );
      if (window.ckeditors === undefined)
        window.ckeditors = [];
      window.ckeditors.push(editor);
      editor.sourceElement.$ckeditor = editor;
      if (editor.sourceElement.$localeController)
        editor.i18nController = new I18nCKEditorController(editor);
      return editor;
    })
    .catch(error => {
      console.error( error.stack );
    });
}
