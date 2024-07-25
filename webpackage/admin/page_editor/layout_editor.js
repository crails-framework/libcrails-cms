import i18n from "../../i18n.js";
import NestedComponentEditor from "./nested_component_editor.js";
import ComponentAnchors from "./component_anchors.js";
import {ControlMenu} from "./nested_component_editor.js";
import {Action} from "./controls.js";
import Sticky from "sticky-js";

const sticky_controls_class = "proudcms-sticky-controls";

function onRootComponentMutation() {
  if (window.mainFormWatcher) {
    window.mainFormWatcher.isDirty = true;
  }
}

class LayoutMenu extends ControlMenu {
  constructor(componentEditor) {
    super(componentEditor);
    this.root.classList.add(sticky_controls_class);
    this.name = "layout";
  }

  initializeActions() {
    super.initializeActions();
    ["up", "down", "remove", "settings"].forEach(name => {
      this.removeAction(name);
    });
    this.addAction(new Action("edit", () => {
      this.componentEditor.contentEditor.start();
    }));
    this.addAction(new Action("stop", () => {
      this.componentEditor.contentEditor.stop(true);
      this.componentEditor.disableEditMode();
    }));
  }
}

export default class extends NestedComponentEditor {
  constructor(iframe, componentTypes) {
    super(null, iframe.contentDocument.body, componentTypes);
    window.pageEditor = this;
    this.iframe = iframe;
    this.document.body.addEventListener("click", this.setEditorActive.bind(this, true));
    this.actions = new LayoutMenu(this);
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

  setEditorActive(value) {
    const className = "cms-page-editor-active";
    const classList = document.body.classList;
    const method = value ? 'add' : 'remove';

    if (value && classList.contains(className))
      return ;
    classList[method](className);
    if (value) {
      this.updatePageEditorLayout("horizontal");
      this.contentEditor.start();
    } else {
      this.anchors.disable();
      this.contentEditor.stop(true);
      this.disableEditMode();
    }
  }

  startComponentAdder() {
    this.anchors.enable();
  }

  closeComponentAdder() {
    this.anchors.disable();
  }

  enableStickyness() {
    this.sticky = new Sticky("." + sticky_controls_class);
  }

  save(element) {
    if (this.editMode)
      this.contentEditor.stop(true);
    element.value = this.root.innerHTML;
  }

  updateEditableComponents() {
    this.contentEditor.syncRegions(this.collectEditableElements());
    this.enableStickyness();
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
