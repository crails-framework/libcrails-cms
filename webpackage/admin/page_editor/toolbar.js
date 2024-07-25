import i18n from "../../i18n.js";
import {Action, MetaAction, ControlMenu} from "./controls.js";
import PropertyEditor from "./property_editor.js";
import GridComponentEditor from "./grid_component_editor.js";

function displaySizeAction() {
  const group = new MetaAction("display-size");
  for (let key in GridComponentEditor.sizes) {
    const action = new Action(`display-sizes.${key}`, function() {
      const sizeId = GridComponentEditor.sizes[key];

      window.pageEditor.iframe.style.maxWidth = GridComponentEditor.model.widthFromSize(sizeId);
      GridComponentEditor.model.currentSize = sizeId;
    });

    group.addAction(action);
  }
  return group;
}

function swapEditorLayoutAction(pageEditor) {
  const action = new Action("editor-layout", function() {
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
  menu.addAction(displaySizeAction());
  menu.addAction(swapEditorLayoutAction(pageEditor));
  menu.addAction(new Action("exit", () => {
    pageEditor.setEditorActive(false);
  }));
  return menu;
}

function getComponentAncestry(component) {
  const crumbs = [];

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
    this.controlsWrapper = document.createElement("div");
    this.controlsWrapper.classList.add("toolbar-controls");
    this.root.classList.add("cms-page-editor-toolbar");
    this.menu = createMainMenu(pageEditor);
    this.root.appendChild(this.menu.root);
    this.root.appendChild(this.crumbs);
    this.root.appendChild(this.controlsWrapper);

    Style.apply("horizontalMenuWrapper", this.crumbs);
  }

  setActiveComponent(component) {
    if (this.currentComponent == component)
      return ;
    if (this.currentComponent)
      delete this.currentComponent.root.dataset.cmsActive;
    component.root.dataset.cmsActive = 1;
    this.currentComponent = component;
    this.propertyEditor = new PropertyEditor(component);
    this.crumbs.innerHTML = "";
    this.crumbs.appendChild(makeComponentCrumbs(this, component));
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
