import i18n from "../../i18n.js";
import iconHtml from "../icons.js";
import Style from "../../style.js";
import randomString from "../random_string.js";

export function setActionInnerHTML(element, name) {
  const icon = iconHtml(name);
  const label = i18n.t(`admin.page-editor.action.${name}`);

  if (icon) {
    element.innerHTML = icon;
    element.dataset.tooltipPosition = "top";
    element.dataset.tooltip = label;
  } else {
    console.log("(i) missing icon", name);
    element.innerText = label;
  }
}

export class Action {
  constructor(name, callback) {
    this.name = name;
    this.root = document.createElement("li");
    Style.apply("menuItem", this.root);
    this.label = document.createElement("a");
    Style.apply("menuLink", this.label);
    this.label.addEventListener("click", this.onClicked.bind(this));
    this.root.appendChild(this.label);
    this.callback = callback;
    setActionInnerHTML(this.label, name);
  }

  onClicked(event) {
    event.preventDefault();
    if (this.callback)
      this.callback();
    return false;
  }

  withText(text) {
    this.label.textContent = this.label.dataset.tooltip = text;
    return this;
  }
}

export class MetaAction extends Action {
  constructor(name) {
    super(name);
    Style.apply("menuItemWithChildren", this.root);
    this.children = document.createElement("ul");
    this.children.id = `dropdown-${randomString()}`;
    Style.apply("menuChildren", this.children);
    this.label.classList.add("dropdown-trigger");
    this.label.dataset.target = this.children.id;
    this.root.appendChild(this.children);
    this.actions = [];
  }

  addAction(action) {
    this.children.appendChild(action.root);
    this.actions.push(action);
  }

  clear() {
    this.children.innerHTML = "";
    this.actions = [];
  }
}

export class ControlMenu {
  constructor() {
    this.root = document.createElement("nav");
    this.root.classList.add("cms-page-editor-controls");
    this.title = document.createElement("span");
    this.title.textContent = i18n.t(`admin.page-editor.components.${name}`);
    this.ul = document.createElement("ul");
    this.root.appendChild(this.title);
    this.root.appendChild(this.ul);
    this.actions = [];
    Style.apply("horizontalMenuWrapper", this.root);
    Style.apply("menuHeading", this.title);
    Style.apply("menu", this.ul);
    (new ResizeObserver(this.onResized.bind(this))).observe(this.root);
  }

  get name() { return this.title.textContent; }
  set name(value) { this.title.textContent = i18n.t(`admin.page-editor.components.${value}`); }

  addAction(action) {
    this.ul.appendChild(action.root);
    this.actions.push(action);
  }

  prependAction(action) {
    this.ul.insertBefore(action.root, this.ul.children[0]);
    this.actions.unshift(action);
  }

  removeAction(name) {
    const newActions = [];

    for (let i = 0 ; i < this.actions.length ; ++i) {
      if (this.actions[i].name == name) {
        this.ul.removeChild(this.actions[i].root);
      } else {
        newActions.push(this.actions[i]);
      }
    }
    this.actions = newActions;
  }

  clear() {
    this.ul.innerHTML = "";
    this.actions = [];
  }

  get buttonsWidth() {
    let buttonsWidth = 0;
    for (let button of this.ul.children)
      buttonsWidth += button.offsetWidth;
    return buttonsWidth;
  }

  onResized() {
    const action = this.root.offsetWidth >= (2 * this.buttonsWidth) ? "remove" : "add";

    if (this.title)
      this.title.classList[action]("hidden");
  }
}
