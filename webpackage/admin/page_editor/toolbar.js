import i18n from "../../i18n.js";
import {Action, MetaAction, ControlMenu} from "./controls.js";
import PropertyEditor from "./property_editor.js";
import GridComponentEditor from "./grid_component_editor.js";
import ComponentControls from "./component_controls.js";

function displaySizeAction(pageEditor) {
  const group = new MetaAction("device");
  const gridModel = GridComponentEditor.model;
  const style = pageEditor.iframe.style;

  group.withText(i18n.t("admin.page-editor.action.display-size"));
  group.addAction(new Action("display-sizes.natural", function() {
    style.width = "100%";
    gridModel.currentSize = undefined;
  }););
  for (let key in GridComponentEditor.sizes) {
    const action = new Action(`display-sizes.${key}`, function() {
      const sizeId = GridComponentEditor.sizes[key];

      style.width = gridModel.widthFromSize(sizeId) + "px";
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

function createMainMenu(pageEditor) {
  const menu = new ControlMenu();
  menu.name = "layout";
  menu.addAction(new Action("add", () => {
    pageEditor.startComponentAdder();
  }));
  menu.addAction(displaySizeAction(pageEditor));
  menu.addAction(swapEditorLayoutAction(pageEditor));
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

function makeComponentCrumbs(toolbar, component) {
  const ul = document.createElement("ul");

  Style.apply("menu", ul);
  getComponentAncestry(component).forEach(component => {
    const li = document.createElement("li");
    const link = document.createElement("a");

    Style.apply("menuItem", li);
    Style.apply("menuLink", link);
    li.appendChild(link);
    ul.appendChild(li);
    link.innerText = component.constructor.name;
    link.addEventListener("click", function() {
      toolbar.setActiveComponent(component);
    });
  });
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
      delete this.currentComponent.root.dataset.cmsActive;
      if (typeof crailscms_on_content_unload == "function") {
        crailscms_on_content_unload(this.crumbs);
        crailscms_on_content_unload(this.componentMenuWrapper);
      }
      this.crumbs.innerHTML = "";
      this.componentMenuWrapper.innerHTML = "";
    }
    if (component) {
      component.root.dataset.cmsActive = 1;
      this.currentComponent = component;
      this.propertyEditor = new PropertyEditor(component);
      this.crumbs.appendChild(makeComponentCrumbs(this, component));
      menu = new ComponentControls(component);
      this.componentMenuWrapper.appendChild(menu.root);
      menu.name = component.constructor.name;
      menu.initializeActions();
    }
  }

  setControls(element) {
    this.controlsWrapper.innerHTML = "";
    this.controlsWrapper.appendChild(element);
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
