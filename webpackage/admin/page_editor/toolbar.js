import i18n from "../../i18n.js";
import Style from "../../style.js";
import {Action, MetaAction, ControlMenu} from "./controls.js";
import PropertyEditor from "./property_editor.js";
import StructurePreview from "./structure_preview.js";
import GridComponentEditor from "./grid_component_editor.js";
import ComponentControls from "./component_controls.js";
import openSyncDialog from "./sync/dialog.js";

function displaySizeAction(pageEditor) {
  const group = new MetaAction("device");
  const gridModel = GridComponentEditor.model;
  const styles = [pageEditor.iframe.style, pageEditor.anchors.container.style];

  group.withText(i18n.t("admin.page-editor.action.display-size"));
  group.addAction(new Action("display-sizes.natural", function() {
    styles.forEach(style => style.width = "100%");
    gridModel.currentSize = undefined;
  }));
  for (let key in GridComponentEditor.sizes) {
    const action = new Action(`display-sizes.${key}`, function() {
      const sizeId = GridComponentEditor.sizes[key];

      styles.forEach(style => {
        style.width = gridModel.widthFromSize(sizeId) + "px";
      });
      gridModel.currentSize = sizeId;
    });

    group.addAction(action);
  }
  return group;
}

function swapEditorLayoutAction(pageEditor) {
  const action = new Action("layout", function() {
    pageEditor.updatePageEditorLayout(
      pageEditor.pageEditorLayout == "horizontal"
      ? "vertical" : "horizontal"
    );
  });
  return action;
}

function layoutSettingsMenu(pageEditor) {
  const action = new Action("settings", function() {
    pageEditor.toolbar.setActiveComponent(pageEditor.settingsComponent);
  });
  return action;
}

function createMainMenu(pageEditor) {
  const menu = new ControlMenu();
  menu.name = "layout";
  menu.addAction(new Action("add", () => {
    pageEditor.startComponentAdder();
  }));
  menu.addAction(displaySizeAction(pageEditor));
  menu.addAction(swapEditorLayoutAction(pageEditor));
  if (pageEditor.settingsComponent)
    menu.addAction(layoutSettingsMenu(pageEditor));
  if (pageEditor.canSyncLanguages) {
    menu.addAction(new Action("translate", () => {
      openSyncDialog(pageEditor);
    }));
  }
  menu.addAction(new Action("exit", () => {
    pageEditor.setEditorActive(false);
  }));
  return menu;
}

function getComponentAncestry(component) {
  const crumbs = [];

  component = component.parent;
  while (component) {
    crumbs.push(component);
    component = component.parent;
  }
  crumbs.pop();
  return crumbs.reverse();
}

function componentTitle(component) {
  const typename = component.root.dataset.component;

  return i18n.t(`admin.page-editor.components.${typename}`);
}

function makeComponentCrumbs(toolbar, component) {
  const ul = document.createElement("ul");
  const selfLi = document.createElement("li");

  Style.apply("menu", ul);
  Style.apply("menuItem", selfLi);
  selfLi.innerText = componentTitle(component);
  getComponentAncestry(component).forEach(component => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    const typename = component.root.dataset.component;

    Style.apply("menuItem", li);
    Style.apply("menuLink", link);
    li.appendChild(link);
    ul.appendChild(li);
    link.innerText = componentTitle(component);
    link.addEventListener("click", function() {
      toolbar.setActiveComponent(component);
    });
  });
  ul.appendChild(selfLi);
  return ul;
}

class Toolbar {
  constructor(pageEditor) {
    this.pageEditor = pageEditor;
    this.root = document.createElement("div");
    this.crumbs = document.createElement("nav");
    this.componentMenuWrapper = document.createElement("div");
    this.componentMenuWrapper.classList.add("component-menu");
    this.controlsWrapper = document.createElement("div");
    this.controlsWrapper.classList.add("toolbar-controls");
    this.root.classList.add("cms-page-editor-toolbar");
    this.menu = createMainMenu(pageEditor);
    this.root.appendChild(this.menu.root);
    this.root.appendChild(this.crumbs);
    this.root.appendChild(this.componentMenuWrapper);
    this.root.appendChild(this.controlsWrapper);

    Style.apply("horizontalMenuWrapper", this.crumbs);
  }

  get previewVisible() {
    return this.structurePreview && this.controlsWrapper.contains(this.structurePreview.root);
  }

  setActiveComponent(component, force = false) {
    const previousComponent = this.currentComponent;
    let menu;

    if (previousComponent == component && !force)
      return ;
    if (previousComponent) {
      if (this.propertyEditor) {
        if (previousComponent.root?.isConnected)
          this.propertyEditor.apply();
        this.propertyEditor.dispose();
        this.propertyEditor = null;
      }
      if (previousComponent.root)
        delete previousComponent.root.dataset.cmsActive;
      if (previousComponent.customEditor)
        previousComponent.customEditor.remove();
      if (previousComponent.customEditor)
        this.componentMenuWrapper.removeChild(previousComponent.customEditor);
      if (typeof crailscms_on_content_unload == "function") {
        crailscms_on_content_unload(this.crumbs);
        crailscms_on_content_unload(this.componentMenuWrapper);
      }
      this.crumbs.innerHTML = "";
      this.componentMenuWrapper.innerHTML = "";
    }
    this.currentComponent = component;
    if (component) {
      this.propertyEditor = new PropertyEditor(component);
      this.setControls(this.propertyEditor.content);
      this.propertyEditor.scheduleAutoUpdate();
      if (typeof crailscms_on_content_loaded == "function")
        crailscms_on_content_loaded(this.propertyEditor.content);
      if (component.root) {
        component.root.dataset.cmsActive = 1;
        this.crumbs.appendChild(makeComponentCrumbs(this, component));
        menu = new ComponentControls(component);
        this.componentMenuWrapper.appendChild(menu.root);
      }
      if (component.customEditor)
        this.componentMenuWrapper.appendChild(component.customEditor);
      if (menu)
        menu.initializeActions();
    } else if (!this.previewVisible) {
      this.setControls(document.createElement("div"));
    }
  }

  reloadActiveComponent() {
    this.setActiveComponent(this.currentComponent, true);
  }

  setControls(content) {
    if (typeof crailscms_on_content_unload == "function")
      crailscms_on_content_unload(this.controlsWrapper);
    this.controlsWrapper.innerHTML = "";
    this.controlsWrapper.appendChild(content);
  }

  showStructurePreview(mode, target) {
    if (!this.structurePreview) {
      this.structurePreview = new StructurePreview(this.pageEditor.anchors);
    } else {
      this.structurePreview.update();
    }
    this.setControls(this.structurePreview.root);
  }

  hideStructurePreview() {
    if (this.previewVisible) {
      if (this.currentComponent && this.propertyEditor) {
        this.setControls(this.propertyEditor.content);
        this.propertyEditor.scheduleAutoUpdate();
      } else {
        this.setControls(document.createElement("div"));
      }
    }
  }

  updateStructurePreview() {
    if (this.structurePreview) {
      this.structurePreview.update();
    }
  }
}

export default function createToolbar(pageEditor) {
  const toolbar = new Toolbar(pageEditor);

  window.Cms.PageEditor.Toolbar = toolbar;
  document.body.appendChild(toolbar.root);
  if (typeof crailscms_on_content_loaded == "function")
    crailscms_on_content_loaded(toolbar.root);
  return toolbar;
}
