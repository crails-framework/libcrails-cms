import i18n from "../../i18n.js";
import {Action, MetaAction, ControlMenu} from "./controls.js";
import PropertyEditor from "./property_editor.js";
import GridComponentEditor from "./grid_component_editor.js";
import ComponentControls from "./component_controls.js";

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

  setActiveComponent(component) {
    let menu;

    if (this.currentComponent == component)
      return ;
    if (this.currentComponent) {
      if (this.currentComponent.root)
        delete this.currentComponent.root.dataset.cmsActive;
      if (this.currentComponent.customEditor)
        this.componentMenuWrapper.removeChild(this.currentComponent.customEditor);
      if (typeof crailscms_on_content_unload == "function") {
        crailscms_on_content_unload(this.crumbs);
        crailscms_on_content_unload(this.componentMenuWrapper);
      }
      this.crumbs.innerHTML = "";
      this.componentMenuWrapper.innerHTML = "";
    }
    if (component) {
      this.currentComponent = component;
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
    }
  }

  setControls(content) {
    if (typeof crailscms_on_content_unload == "function")
      crailscms_on_content_unload(this.controlsWrapper);
    this.controlsWrapper.innerHTML = "";
    this.controlsWrapper.appendChild(content);
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
