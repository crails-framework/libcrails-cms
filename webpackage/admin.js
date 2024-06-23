import {createUppy, createUppyUpdater} from "./admin/uppy.js";
import {adminCKEditor} from "./admin/ckeditor.js";
import {adminCKEditorButton} from "./admin/ckeditor_dialog.js";
import {CKEditorExports} from "./admin/ckeditor_exports.js";
import TomSelect from "tom-select/dist/js/tom-select.base.js";
import previewPost from "./admin/preview.js";
import pageEditor from "./admin/page_editor.js";
import ProudCmsDialog from "./admin/dialog.js";
import ProudCmsPicker from "./admin/file_picker.js";
import imagePickerField from "./admin/image_picker_field.js";
import audioPickerField from "./admin/audio_picker_field.js";
import createSelectField from "./admin/selectField.js";
import DirtyForm from "./admin/dirty_form.js";
import SortableRelationshipTable from "./admin/sortable_relationship.js";
import "./admin/plugin_index.js";

window.createUppy = createUppy;
window.createUppyUpdater = createUppyUpdater;
window.proudcmsAdminCKEditor = adminCKEditor;
window.CKEditorExports = CKEditorExports;
window.previewPost = previewPost;
window.createSelectField = createSelectField;

import Style from "./style.js";
window.Style = Style;
import i18n from "./i18n.js";
window.i18n = i18n;

import LayoutEditor from "./admin/page_editor/layout_editor.js";
import ComponentEditor from "./admin/page_editor/component_editor.js";
import NestedComponentEditor from "./admin/page_editor/nested_component_editor.js";
import FooterComponentEditor from "./admin/page_editor/footer_component_editor.js";
import GridComponentEditor from "./admin/page_editor/grid_component_editor.js";
import SliderComponentEditor from "./admin/page_editor/slider_component_editor.js";
import BackgroundComponentEditor from "./admin/page_editor/background_component_editor.js";
import ImageComponentEditor from "./admin/page_editor/image_component_editor.js";
import ListComponentEditor from "./admin/page_editor/list_component_editor.js";
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
  "ListComponentEditor": ListComponentEditor,
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
window.ProudCmsPicker = ProudCmsPicker;

window.Cms = {
  ContentTools: ContentTools,
  CKEditor:     CKEditorExports,
  Dialog:       ProudCmsDialog,
  PickerDialog: ProudCmsPicker,
  PageEditor:   PageEditor,
  MenuEditor:   MenuEditor,
  TomSelect:    TomSelect,
  DirtyForm:    DirtyForm,
  Style:        Style,
  i18n:         i18n,
  initializers: {
    ContentTools:   initializeContentTools,
    CKEditor:       adminCKEditor,
    CKEditorButton: adminCKEditorButton,
    Uppy:           createUppy,
    UppyUpdater:    createUppyUpdater
  }
};

function initialize(event) {
  const mainForm = document.getElementById("main-form");

  if (mainForm) {
    window.mainFormWatcher = new DirtyForm(mainForm);
  }
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
  SortableRelationshipTable.loadFromElements("table.sortable-relationship");
}

document.addEventListener("DOMContentLoaded", initialize);
