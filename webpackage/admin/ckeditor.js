import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Link from '@ckeditor/ckeditor5-link/src/link';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Image from '@ckeditor/ckeditor5-image/src/image';
import {Table, TableToolbar, TableProperties, TableCellProperties, TableColumnResize, TableCaption, TableSelection, TableClipboard, TableUtils} from '@ckeditor/ckeditor5-table';

import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting';
import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles';

import imageLeftIcon from './icons/image-align-left.svg';
import imageRightIcon from './icons/image-align-right.svg';

import ProudCmsEmbed from "./ckeditor_embed.js";
import ProudCmsOpenGraph from "./ckeditor_opengraph.js";

function makeCKEditorPluginList(customPlugins) {
  const plugins = [
    Essentials, Paragraph, Bold, Italic, Heading, 
    Link, AutoLink, Alignment, MediaEmbed, BlockQuote,
    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, LinkImage,
    ImageResizeEditing, ImageResizeHandles,
    Table, TableToolbar, TableProperties, TableCellProperties, TableColumnResize, TableCaption, TableSelection, TableClipboard, TableUtils,
    ProudCmsEmbed, ProudCmsOpenGraph
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

function makeCKEditorToolbar(customPlugins) {
  if (window.customCKEditorToolBar)
    return window.customCKEditorToolBar();
  else {
    const toolbar = [
      'heading', 'bold', 'italic', 'link', 'alignment', 'blockQuote', 'mediaEmbed',
      ProudCmsEmbed.toolName,
      'insertTable',
      ProudCmsOpenGraph.toolName
    ];

    if (window.customCKEditorPlugins) {
      window.customCKEditorPlugins.forEach(plugin => {
        toolbar.push(plugin.toolName);
      });
    }
    customPlugins.forEach(plugin => {
      if (toolbar.indexOf(plugin.toolName) < 0)
        toolbar.push(plugin.toolName);
    });
    return toolbar;
  }
}

export function adminCKEditor(name, options = {}) {
  const element = document.querySelector("textarea[name='" + name + "']");
  const editor = ClassicEditor
    .create(element, {
      plugins: makeCKEditorPluginList(options.plugins || []),
      toolbar: options.toolbar ? options.toolbar : makeCKEditorToolbar(options.plugins || []),
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
            { name: 'right-side', title: 'Right side', icon: imageRightIcon, className: 'image-style-side', modelElements: ['imageBlock'] },
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
    })
    .catch(error => {
      console.error( error.stack );
    });
}
