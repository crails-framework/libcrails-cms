import i18n from "../../i18n.js";
import NestedComponentEditor from "./nested_component_editor.js";
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
  constructor(element, componentTypes) {
    super(null, element, componentTypes);
    this.actions = new LayoutMenu(this);
    this.mutationObserver = new MutationObserver(onRootComponentMutation);
    this.contentEditor
      .addEventListener("start", this.enableEditMode.bind(this));
    this.contentEditor
      .addEventListener("stop", this.disableEditMode.bind(this));
    this.bindElements();
    this.editMode = false;
    this.contentEditor.init([]);
    if (typeof crailscms_on_content_loaded == "function")
      crailscms_on_content_loaded(this.root);
  }

  enableStickyness() {
    this.sticky = new Sticky("." + sticky_controls_class);
  }

  save(element) {
    if (this.editMode)
      this.contentEditor.stop(true);
    super.toggleControls(false);
    element.value = this.root.innerHTML;
    super.toggleControls(true);
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

  toggleControls() {
    super.toggleControls(true);
  }

  clearContentEditor() {
    for (let element of document.querySelectorAll("[contenteditable]")) {
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
