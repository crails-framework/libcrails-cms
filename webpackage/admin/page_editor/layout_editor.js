import i18n from "../../i18n.js";
import NestedComponentEditor from "./nested_component_editor.js";
import ComponentAnchors from "./component_anchors.js";
import {ControlMenu} from "./nested_component_editor.js";
import {Action} from "./controls.js";
import actions from "./actions.js";
import Sticky from "sticky-js";

function onRootComponentMutation() {
  if (window.mainFormWatcher) {
    window.mainFormWatcher.isDirty = true;
  }
}

function onEscapePressed(pageEditor) {
  if (pageEditor.anchors.enabled)
    pageEditor.anchors.disable();
  else
    pageEditor.setEditorActive(false);
}

function keyManager(pageEditor, event) {
  if (pageEditor.isActive()) {
    if (event.altKey) {
      switch (event.keyCode) {
        case 65: // A
          event.preventDefault();
          pageEditor.startComponentAdder();
          return ;
        case 77: // M
          pageEditor.anchors.target = pageEditor.toolbar.currentComponent;
          pageEditor.anchors.enable('insert');
          event.preventDefault();
      }
    } else {
      switch (event.keyCode) {
      case 27: // Escape
        event.preventDefault();
        onEscapePressed(pageEditor);
        return ;
      }
    }
  }
}

import {ContentToolsWatcher} from "./content_tools/history.js";

export default class extends NestedComponentEditor {
  constructor(iframe, componentTypes) {
    super(null, iframe.contentDocument.body, componentTypes);
    window.pageEditor = this;
    this.history = actions;
    this.ctWatcher = new ContentToolsWatcher(this);
    this.iframe = iframe;
    this.document.body.addEventListener("click", this.setEditorActive.bind(this, true));
    [document, this.document].forEach(el => el.addEventListener("keyup", keyManager.bind(this, this)));
    this.mutationObserver = new MutationObserver(onRootComponentMutation);
    this.anchors = new ComponentAnchors(this);
    this.contentEditor
      .addEventListener("start", this.enableEditMode.bind(this));
    this.contentEditor
      .addEventListener("stop", this.disableEditMode.bind(this));
    this.bindElements();
    this.editMode = false;
    this.contentEditor.init([]);
  }

  get document() {
    return this.iframe.contentDocument;
  }

  get window() {
    return this.iframe.contentWindow;
  }

  updatePageEditorLayout(value) {
    const classList = document.body.classList;
    classList.remove(`cms-page-editor-${this.pageEditorLayout}`);
    classList.add(`cms-page-editor-${value}`);
    this.pageEditorLayout = value;
  }

  isActive() {
    return document.body.classList.contains("cms-page-editor-active");
  }

  setEditorActive(value) {
    const className = "cms-page-editor-active";
    const classList = document.body.classList;
    const method = value ? 'add' : 'remove';

    if (value && classList.contains(className))
      return ;
    classList[method](className);
    if (value) {
      this.updatePageEditorLayout("vertical");
      this.contentEditor.start();
      this.ctWatcher.watch();
    } else {
      this.toolbar.setActiveComponent(null);
      this.anchors.disable();
      this.contentEditor.stop(true);
    }
  }

  restartContentEditor() {
    this.contentEditor.stop(true);
    this.contentEditor.start();
  }

  startComponentAdder() {
    this.anchors.enable();
  }

  closeComponentAdder() {
    this.anchors.disable();
  }

  save(element) {
    if (this.editMode)
      this.contentEditor.stop(true);
    element.value = this.root.innerHTML;
  }

  updateEditableComponents() {
    this.contentEditor.syncRegions(this.collectEditableElements());
  }

  enableEditMode() {
    this.editMode = true;
    super.enableEditMode();
    this.mutationObserver.observe(this.root, {
      childList: true, subtree: true, attributes: true, characterData: true
    });
  }

  disableEditMode() {
    this.mutationObserver.disconnect();
    this.editMode = false;
    super.disableEditMode();
    this.clearContentEditor();
  }

  clearContentEditor() {
    for (let element of this.document.querySelectorAll("[contenteditable]")) {
      element.removeAttribute("contentEditable");
      ['ce-element', 'ce-element--type-text', 'ce-element--focused'].forEach(klass => {
        element.classList.remove(klass);
      });
    }
  }

  get hasFooter() {
    for (let component of this.components) {
      if (component.isFooter) return true;
    }
    return false;
  }

  addComponent(type) {
    const hadFooter = this.hasFooter;

    return super.addComponent(type).then(component => {
      if (component.isFooter && hadFooter) {
        alert(i18n.t("admin.page-editor.only-one-footer-allowed"));
        this.removeComponent(component);
      }
    });
  }
}
