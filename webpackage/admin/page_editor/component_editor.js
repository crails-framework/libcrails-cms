import DefaultControlMenu from "./component_controls.js";
import make_id from "../random_string.js";

function imageFromStyle(cssContent) {
  return cssContent.substr(4, cssContent.length - 5);
}

function rgbaValue(value) {
  const base = value.toString(16);
  return base.length == 1 ? '0' + base : base;
}

function rgb(r, g, b) {
  const v = rgbaValue;
  return '#' + v(r) + v(g) + v(b);
}

function rgba(r, g, b, a) {
  return rgb(r, g, b) + rgbaValue(a);
}

export default class {
  constructor(parent, element = null) {
    this.parent = parent;
    this.properties = {};
    this.actions = new DefaultControlMenu(this);
    this.root = element || document.createElement("div");
    if (!this.id || !this.id.length)
      this.root.dataset.id = make_id();
  }

  get id() {
    return this.root.dataset.id;
  }

  get layout() {
    let current = this;
    while (current.parent) current = current.parent;
    return current;
  }
  
  get contentEditor() {
    return ContentTools.EditorApp.get();
  }

  get componentType() {
    return this.root.dataset.component;
  }

  get previousComponent() {
    return this.root.previousElementSibling
         ? this.root.previousElementSibling.$component : null;
  }

  get nextComponent() {
    return this.root.nextElementSibling
         ? this.root.nextElementSibling.$component : null;
  }

  set componentType(value) {
    this.root.dataset.component = value;
    this.actions.name = value;
  }

  create() {
    this.bindElements();
  }

  load(html) {
    this.root.innerHTML = html;
    this.bindElements();
  }

  initializeProperties() {
    this.actions.initializeActions();
  }

  enableEditMode() {
    this.toggleControls(true);
  }

  disableEditMode() {
    this.toggleControls(false);
  }

  toggleControls(visible) {
    try {
      if (visible)
        this.root.insertBefore(this.actions.root, this.root.children[0]);
      else
        this.root.removeChild(this.actions.root);
    } catch {}
  }

  bindElements() {
    this.initializeProperties();
  }

  collectEditableElements() {
    return this.root.querySelectorAll("[data-editable]");
  }

  updateProperty(name, value) {
    const property = this.properties[name];

    if (property !== undefined) {
      if (property.attribute !== undefined)
        property.target[property.attribute] = value;
      else if (property.style !== undefined) {
        if (property.style == "backgroundImage")
          value = `url(${value})`;
        property.target.style[property.style] = value;
      }
    }
    else
      console.warn("property", name, "does not exist for component", this);
  }

  propertyValue(name) {
    const property = this.properties[name];

    if (property !== undefined) {
      if (property.attribute !== undefined)
        return property.target[property.attribute];
      else if (property.style == "backgroundImage")
        return imageFromStyle(property.target.style[property.style]);
      else if (property.style !== undefined) {
        const value = property.target.style[property.style];
        if (value.match(/^rgba?\(/) !== null)
          return eval(value);
        return value;
      }
    }
    return null;
  }
}
