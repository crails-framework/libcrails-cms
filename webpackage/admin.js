import {createUppy, createUppyUpdater} from "./admin/uppy.js";
import {adminCKEditor} from "./admin/ckeditor.js";
import previewPost from "./admin/preview.js";
import pageEditor from "./admin/page_editor.js";
import ProudCmsDialog from "./admin/dialog.js";
import imagePickerField from "./admin/image_picker_field.js";
import audioPickerField from "./admin/audio_picker_field.js";
import createSelectField from "./admin/selectField.js";
import "./admin/plugin_index.js";

window.createUppy = createUppy;
window.createUppyUpdater = createUppyUpdater;
window.proudcmsAdminCKEditor = adminCKEditor;
window.previewPost = previewPost;
window.createSelectField = createSelectField;

import LayoutEditor from "./admin/page_editor/layout_editor.js";
import ComponentEditor from "./admin/page_editor/component_editor.js";
import NestedComponentEditor from "./admin/page_editor/nested_component_editor.js";
import FooterComponentEditor from "./admin/page_editor/footer_component_editor.js";
import GridComponentEditor from "./admin/page_editor/grid_component_editor.js";
import SliderComponentEditor from "./admin/page_editor/slider_component_editor.js";
import BackgroundComponentEditor from "./admin/page_editor/background_component_editor.js";
import ImageComponentEditor from "./admin/page_editor/image_component_editor.js";
import InjectedComponentEditor from "./admin/page_editor/injected_component_editor.js";
import SocialComponentEditor from "./admin/page_editor/social_footer_component_editor.js";
import CreatePageEditor from "./admin/page_editor.js";
import DefaultControlMenu from "./admin/page_editor/component_controls.js";

import MenuEditor from "javascript-menu-editor";
window.MenuEditor = MenuEditor;

window.PageEditor = {
  "create": CreatePageEditor,
  "LayoutEditor": LayoutEditor,
  "ComponentEditor": ComponentEditor,
  "NestedComponentEditor": NestedComponentEditor,
  "FooterComponentEditor": FooterComponentEditor,
  "GridComponentEditor": GridComponentEditor,
  "SliderComponentEditor": SliderComponentEditor,
  "BackgroundComponentEditor": BackgroundComponentEditor,
  "ImageComponentEditor": ImageComponentEditor,
  "InjectedComponentEditor": InjectedComponentEditor,
  "SocialComponentEditor": SocialComponentEditor,
  "DefaultControlMenu": DefaultControlMenu
};

import ContentTools from "ContentTools";
import ImageContentTools from "./admin/page_editor/content_tools/image.js";
import FontContentTools from "./admin/page_editor/content_tools/font.js";

window.ContentTools = ContentTools;
window.initializeContentTools = function() {
  ContentTools.ToolShelf._tools.heading.tagName = 'h2';
  ContentTools.ToolShelf._tools.subheading.tagName = 'h3';
  new ImageContentTools();
  new FontContentTools();
};

window.ProudCmsDialog = ProudCmsDialog;

function initialize(event) {
  // initialize thumbnail pickers
  for (let formGroup of document.querySelectorAll(".thumbnail-form-group")) {
    imagePickerField(formGroup, "miniature_url");
  }
  // initialize audio pickers
  for (let formGroup of document.querySelectorAll(".audio-form-group")) {
    audioPickerField(formGroup);
  }
  // initialize tomSelect
  createSelectField("#tagPicker");
  createSelectField("#userGroupPicker");
}

document.addEventListener("DOMContentLoaded", initialize);
