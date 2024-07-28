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

function onComponentClicked(event) {
  let element = event.target;

  window.mouseEvent = event;
  while (element && !element.dataset.component)
    element = element.parentElement;
  if (element == this.root && window.Cms.PageEditor.Toolbar)
    window.Cms.PageEditor.Toolbar.setActiveComponent(this);
}

export default class {
  constructor(parent, element = null) {
    this.parent = parent;
    this.properties = {};
    this.root = element || this.document.createElement("div");
    this.root.addEventListener("click", onComponentClicked.bind(this));
    if (!this.id || !this.id.length)
      this.root.dataset.id = make_id();
  }

  get id() {
    return this.root.dataset.id;
  }

  get document() {
    return this.parent && this.parent.document ? this.parent.document : document;
  }

  get window() {
    return this.parent ? this.parent.window : window;
  }

  get layout() {
    let current = this;
    while (current.parent) current = current.parent;
    return current;
  }
  
  get contentEditor() {
    return this.window.eval("Cms").ContentTools.EditorApp.get();
  }

  get componentType() {
    return this.root.dataset.component;
  }

  get componentName() {
    const types = this.parent?.componentTypes;

    for (let key in types) {
      if (types[key] == this.constructor)
        return key;
    }
    return this.constructor.name;
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
  }

  isAncestorOf(component) {
    while (component) {
      if (component.parent == this)
        return true;
      component = component.parent;
    }
    return false;
  }

  create() {
    this.bindElements();
  }

  load(html) {
    this.root.innerHTML = html;
    this.bindElements();
  }

  initializeProperties() {
  }

  enableEditMode() {
  }

  disableEditMode() {
  }

  componentAnchors() {
    return [];
  }

/*
  toggleControls(visible) {
    try {
      if (visible)
        this.root.insertBefore(this.actions.root, this.root.children[0]);
      else
        this.root.removeChild(this.actions.root);
    } catch {}
  }
*/
  bindElements() {
    this.initializeProperties();
  }

  collectEditableElements() {
    return this.root.querySelectorAll("[data-editable]");
  }

  updateProperty(name, value) {
    const property = this.properties[name];

    if (property !== undefined) {
      if (property.setter !== undefined)
        property.setter(value);
      else if (property.attribute !== undefined)
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
      if (property.getter !== undefined)
        return property.getter();
      else if (property.attribute !== undefined)
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
